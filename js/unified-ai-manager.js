/**
 * Unified AI Manager - 2025 Implementation
 * Orchestrates multiple AI engines for optimal performance and fallback
 * Combines ONNX Runtime Web, Transformers.js, and traditional processing
 */

class UnifiedAIManager {
    constructor() {
        this.engines = new Map();
        this.isInitialized = false;
        this.capabilities = null;
        this.currentEngine = null;
        this.processingQueue = [];
        this.isProcessing = false;
        
        // Performance tracking
        this.stats = {
            totalProcessed: 0,
            successfulAI: 0,
            fallbackUsed: 0,
            averageTime: 0,
            engineUsage: new Map()
        };
        
        // User preferences
        this.preferences = {
            preferredEngine: 'auto', // 'auto', 'onnx', 'transformers', 'traditional'
            quality: 'auto', // 'mobile', 'desktop', 'auto'
            enableFallback: true,
            maxProcessingTime: 30000, // 30 seconds
            enableCaching: true
        };
        
        // Available processing styles
        this.availableStyles = {
            // Traditional styles (always available)
            'pencil': { engine: 'traditional', description: 'Classic pencil sketch' },
            'pen': { engine: 'traditional', description: 'Ink pen drawing' },
            'charcoal': { engine: 'traditional', description: 'Charcoal sketch' },
            'technical': { engine: 'traditional', description: 'Technical line drawing' },
            
            // AI-enhanced styles
            'ai_sketch': { engine: 'onnx', fallback: 'pencil', description: 'AI-enhanced pencil sketch' },
            'ai_artistic': { engine: 'transformers', fallback: 'charcoal', description: 'Artistic AI interpretation' },
            'ai_technical': { engine: 'onnx', fallback: 'technical', description: 'Precise AI technical drawing' },
            'ai_depth_aware': { engine: 'transformers', fallback: 'pencil', description: 'Depth-aware sketch conversion' },
            'ai_edge_enhanced': { engine: 'onnx', fallback: 'pen', description: 'Enhanced edge detection' },
            'ai_lightweight_edges': { engine: 'onnx', fallback: 'pen', description: 'Fast lightweight edge detection' },
            'ai_architectural_edges': { engine: 'onnx', fallback: 'technical', description: 'Building-optimized edge detection' },
            'ai_controlnet_sketch': { engine: 'onnx', fallback: 'pencil', description: 'ControlNet Canny to sketch conversion' },
            'ai_controlnet_lineart': { engine: 'onnx', fallback: 'pen', description: 'ControlNet line art generation' },
            'ai_controlnet_depth': { engine: 'onnx', fallback: 'charcoal', description: 'ControlNet depth-aware sketch' },
            
            // Interior design specific
            'interior_presentation': { engine: 'auto', fallback: 'pen', description: 'Professional interior presentation' },
            'furniture_focus': { engine: 'transformers', fallback: 'pencil', description: 'Furniture-focused rendering' },
            'architectural_lines': { engine: 'onnx', fallback: 'technical', description: 'Clean architectural lines' }
        };
        
        console.log('🧠 Unified AI Manager initialized');
    }

    /**
     * Initialize all available AI engines
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing AI engines...');
        
        try {
            // Initialize ONNX Runtime Web engine
            if (typeof BrowserAIEngine !== 'undefined') {
                const onnxEngine = new BrowserAIEngine();
                await onnxEngine.initialize();
                this.engines.set('onnx', onnxEngine);
                console.log('✅ ONNX Runtime Web engine ready');
            }
            
            // Initialize Transformers.js engine
            if (typeof TransformersAIEngine !== 'undefined') {
                const transformersEngine = new TransformersAIEngine();
                await transformersEngine.initialize();
                this.engines.set('transformers', transformersEngine);
                console.log('✅ Transformers.js engine ready');
            }
            
            // Traditional processing (always available)
            this.engines.set('traditional', {
                processImage: this.traditionalProcessing.bind(this),
                isInitialized: true,
                getCapabilities: () => ({ method: 'traditional', always_available: true })
            });
            
            // Determine capabilities and optimal engine
            await this.assessCapabilities();
            
            this.isInitialized = true;
            console.log('🎯 AI Manager initialization complete');
            this.logSystemStatus();
            
        } catch (error) {
            console.error('❌ AI Manager initialization failed:', error);
            // Ensure traditional processing is always available
            this.isInitialized = true;
            this.currentEngine = 'traditional';
        }
    }

    /**
     * Assess system capabilities and select optimal configuration
     */
    async assessCapabilities() {
        this.capabilities = {
            hasWebGPU: false,
            hasWebGL: false,
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            isMobile: /Mobi|Android/i.test(navigator.userAgent),
            engines: {}
        };
        
        // Collect capabilities from each engine
        for (const [name, engine] of this.engines) {
            if (engine.getCapabilities) {
                this.capabilities.engines[name] = engine.getCapabilities();
                
                // Check for WebGPU support
                if (engine.getCapabilities().currentBackend === 'webgpu' || 
                    engine.getCapabilities().supportsWebGPU) {
                    this.capabilities.hasWebGPU = true;
                }
                
                // Check for WebGL support
                if (engine.getCapabilities().supportedBackends?.includes('webgl')) {
                    this.capabilities.hasWebGL = true;
                }
            }
        }
        
        // Auto-select optimal engine
        this.currentEngine = this.selectOptimalEngine();
        
        console.log(`🎯 Optimal engine selected: ${this.currentEngine}`);
    }

    /**
     * Select the optimal engine based on capabilities and preferences
     */
    selectOptimalEngine() {
        if (this.preferences.preferredEngine !== 'auto') {
            const preferred = this.preferences.preferredEngine;
            if (this.engines.has(preferred)) {
                return preferred;
            }
        }
        
        // Auto-selection logic
        const { isMobile, hasWebGPU, deviceMemory } = this.capabilities;
        
        if (!isMobile && hasWebGPU && deviceMemory >= 4) {
            // High-end desktop: prefer ONNX with WebGPU
            if (this.engines.has('onnx')) return 'onnx';
        }
        
        if (hasWebGPU || this.capabilities.hasWebGL) {
            // Good GPU support: prefer Transformers.js
            if (this.engines.has('transformers')) return 'transformers';
        }
        
        if (this.engines.has('onnx')) {
            // Fallback to ONNX with CPU
            return 'onnx';
        }
        
        // Final fallback
        return 'traditional';
    }

    /**
     * Process image with automatic engine selection and fallback
     */
    async processImage(imageData, style = 'ai_sketch', options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const startTime = performance.now();
        const styleConfig = this.availableStyles[style];
        
        if (!styleConfig) {
            throw new Error(`Unknown style: ${style}`);
        }
        
        console.log(`🎨 Processing image with style: ${style}`);
        
        try {
            // Determine which engine to use
            let targetEngine = styleConfig.engine;
            if (targetEngine === 'auto') {
                targetEngine = this.currentEngine;
            }
            
            // Add to processing queue if needed
            const processingPromise = this.queueProcessing(imageData, style, targetEngine, options);
            
            const result = await processingPromise;
            
            // Update statistics
            this.updateStats(targetEngine, performance.now() - startTime, true);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Primary processing failed with ${styleConfig.engine}:`, error);
            
            // Attempt fallback if enabled
            if (this.preferences.enableFallback && styleConfig.fallback) {
                console.log(`🔄 Attempting fallback: ${styleConfig.fallback}`);
                
                try {
                    const fallbackResult = await this.processImage(imageData, styleConfig.fallback, options);
                    this.updateStats('fallback', performance.now() - startTime, true);
                    return {
                        ...fallbackResult,
                        usedFallback: true,
                        originalStyle: style
                    };
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                }
            }
            
            // Final fallback to traditional processing
            const traditionalResult = await this.traditionalProcessing(imageData, 'pencil', options);
            this.updateStats('traditional', performance.now() - startTime, false);
            
            return {
                ...traditionalResult,
                usedFallback: true,
                originalStyle: style,
                method: 'traditional'
            };
        }
    }

    /**
     * Queue processing to prevent overload
     */
    async queueProcessing(imageData, style, engine, options) {
        return new Promise((resolve, reject) => {
            const task = {
                imageData,
                style,
                engine,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            };
            
            this.processingQueue.push(task);
            this.processQueue();
        });
    }

    /**
     * Process the queue
     */
    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.processingQueue.length > 0) {
            const task = this.processingQueue.shift();
            
            try {
                const result = await this.executeProcessing(
                    task.imageData,
                    task.style,
                    task.engine,
                    task.options
                );
                task.resolve(result);
            } catch (error) {
                task.reject(error);
            }
        }
        
        this.isProcessing = false;
    }

    /**
     * Execute the actual processing
     */
    async executeProcessing(imageData, style, engineName, options) {
        const engine = this.engines.get(engineName);
        
        if (!engine) {
            throw new Error(`Engine not available: ${engineName}`);
        }
        
        const styleConfig = this.availableStyles[style];
        
        // Set timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Processing timeout')), this.preferences.maxProcessingTime);
        });
        
        // Process with timeout
        const processingPromise = this.callEngineMethod(engine, imageData, style, options);
        
        const result = await Promise.race([processingPromise, timeoutPromise]);
        
        return {
            ...result,
            style: style,
            engine: engineName,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Call the appropriate engine method
     */
    async callEngineMethod(engine, imageData, style, options) {
        if (engine.processImage) {
            // ONNX or custom engine
            const modelType = this.getModelTypeForStyle(style);
            return await engine.processImage(imageData, modelType, options);
        } else if (engine.convertToSketch) {
            // Transformers.js engine
            const convertStyle = this.getTransformersStyleForStyle(style);
            return await engine.convertToSketch(imageData, convertStyle, options);
        } else {
            // Traditional processing
            return await engine.processImage(imageData, style, options);
        }
    }

    /**
     * Map style to ONNX model type
     */
    getModelTypeForStyle(style) {
        const mapping = {
            'ai_sketch': 'sketch_transfer',
            'ai_technical': 'edge_detection',
            'ai_edge_enhanced': 'edge_detection',
            'ai_lightweight_edges': 'edge_detection',
            'ai_architectural_edges': 'architectural_edges',
            'ai_controlnet_sketch': 'controlnet_sketch',
            'ai_controlnet_lineart': 'controlnet_lineart',
            'ai_controlnet_depth': 'controlnet_depth',
            'interior_presentation': 'interior_sketch',
            'architectural_lines': 'architectural_edges',
            'furniture_focus': 'interior_sketch'
        };
        
        return mapping[style] || 'edge_detection';
    }

    /**
     * Map style to Transformers.js style
     */
    getTransformersStyleForStyle(style) {
        const mapping = {
            'ai_artistic': 'sketch_transfer',
            'ai_depth_aware': 'depth_aware',
            'furniture_focus': 'sketch_transfer',
            'interior_presentation': 'sketch_transfer'
        };
        
        return mapping[style] || 'sketch_transfer';
    }

    /**
     * Traditional processing fallback
     */
    async traditionalProcessing(imageData, style, options) {
        console.log(`🖊️ Using traditional processing: ${style}`);
        
        // Use existing HandDrawnEffects if available
        if (window.handDrawnEffects) {
            return await window.handDrawnEffects.applyEffect(imageData, style, options);
        }
        
        // Basic fallback implementation
        return this.basicImageProcessing(imageData, style, options);
    }

    /**
     * Basic image processing as final fallback
     */
    async basicImageProcessing(imageData, style, options) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        ctx.putImageData(imageData, 0, 0);
        
        // Apply basic filters based on style
        switch (style) {
            case 'pencil':
                ctx.filter = 'contrast(150%) brightness(110%) grayscale(100%)';
                break;
            case 'pen':
                ctx.filter = 'contrast(200%) brightness(90%) grayscale(100%)';
                break;
            case 'charcoal':
                ctx.filter = 'contrast(180%) brightness(80%) grayscale(100%)';
                break;
            default:
                ctx.filter = 'contrast(150%) brightness(100%) grayscale(100%)';
        }
        
        ctx.drawImage(canvas, 0, 0);
        
        return {
            success: true,
            imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
            method: 'basic_fallback',
            processingTime: 100
        };
    }

    /**
     * Update processing statistics
     */
    updateStats(engine, processingTime, success) {
        this.stats.totalProcessed++;
        
        if (success && engine !== 'traditional' && engine !== 'fallback') {
            this.stats.successfulAI++;
        } else {
            this.stats.fallbackUsed++;
        }
        
        // Update average time
        this.stats.averageTime = (this.stats.averageTime * (this.stats.totalProcessed - 1) + processingTime) / this.stats.totalProcessed;
        
        // Update engine usage
        const currentCount = this.stats.engineUsage.get(engine) || 0;
        this.stats.engineUsage.set(engine, currentCount + 1);
    }

    /**
     * Get available styles
     */
    getAvailableStyles() {
        return Object.keys(this.availableStyles).map(key => ({
            id: key,
            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: this.availableStyles[key].description,
            engine: this.availableStyles[key].engine,
            requiresAI: this.availableStyles[key].engine !== 'traditional'
        }));
    }

    /**
     * Get system status and capabilities
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            currentEngine: this.currentEngine,
            availableEngines: Array.from(this.engines.keys()),
            capabilities: this.capabilities,
            stats: this.stats,
            preferences: this.preferences
        };
    }

    /**
     * Update user preferences
     */
    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        
        // Re-evaluate optimal engine if preference changed
        if (newPreferences.preferredEngine) {
            this.currentEngine = this.selectOptimalEngine();
        }
        
        console.log('⚙️ Preferences updated:', newPreferences);
    }

    /**
     * Clear all caches
     */
    clearCaches() {
        for (const [name, engine] of this.engines) {
            if (engine.clearCache) {
                engine.clearCache();
            }
        }
        console.log('🗑️ All AI caches cleared');
    }

    /**
     * Run performance benchmark
     */
    async runBenchmark(imageData, iterations = 3) {
        console.log('🏃 Running unified AI benchmark...');
        
        const results = {};
        
        for (const [engineName, engine] of this.engines) {
            if (engineName === 'traditional') continue;
            
            try {
                console.log(`📊 Benchmarking ${engineName}...`);
                
                const times = [];
                for (let i = 0; i < iterations; i++) {
                    const startTime = performance.now();
                    await this.executeProcessing(imageData, 'ai_sketch', engineName, {});
                    times.push(performance.now() - startTime);
                }
                
                results[engineName] = {
                    avgTime: times.reduce((a, b) => a + b, 0) / times.length,
                    minTime: Math.min(...times),
                    maxTime: Math.max(...times),
                    times: times
                };
                
            } catch (error) {
                console.error(`❌ Benchmark failed for ${engineName}:`, error);
                results[engineName] = { error: error.message };
            }
        }
        
        console.log('📈 Benchmark results:', results);
        return results;
    }

    /**
     * Log system status
     */
    logSystemStatus() {
        const status = this.getSystemStatus();
        console.log('🔧 AI Manager Status:', {
            'Current Engine': status.currentEngine,
            'Available Engines': status.availableEngines.join(', '),
            'WebGPU': status.capabilities?.hasWebGPU ? '✅' : '❌',
            'WebGL': status.capabilities?.hasWebGL ? '✅' : '❌',
            'Device Memory': `${status.capabilities?.deviceMemory}GB`,
            'Mobile': status.capabilities?.isMobile ? '✅' : '❌'
        });
    }
    
    /**
     * Demonstrate edge detection capabilities with multiple models
     */
    async demoEdgeDetection(imageData) {
        console.log('🖼️ Starting edge detection demo...');
        
        const edgeStyles = [
            'ai_lightweight_edges',
            'ai_architectural_edges', 
            'ai_edge_enhanced'
        ];
        
        const results = {
            original: imageData,
            timestamp: new Date().toISOString(),
            models: {},
            performance: {
                fastest: null,
                slowest: null,
                average: 0
            }
        };
        
        const times = [];
        
        for (const style of edgeStyles) {
            try {
                console.log(`🔍 Testing ${style}...`);
                const startTime = performance.now();
                
                const result = await this.processImage(imageData, style, {
                    quality: 'auto',
                    timeout: 30000
                });
                
                const processingTime = performance.now() - startTime;
                times.push(processingTime);
                
                results.models[style] = {
                    success: result.success || false,
                    processingTime,
                    engine: result.engine || 'unknown',
                    usedFallback: result.usedFallback || false,
                    imageData: result.imageData || null
                };
                
                console.log(`✅ ${style}: ${processingTime.toFixed(2)}ms (${result.engine || 'fallback'})`);
                
            } catch (error) {
                console.error(`❌ ${style} failed:`, error.message);
                results.models[style] = {
                    success: false,
                    error: error.message,
                    processingTime: 0
                };
            }
        }
        
        // Calculate performance metrics
        const successfulTimes = times.filter(t => t > 0);
        if (successfulTimes.length > 0) {
            results.performance.average = successfulTimes.reduce((a, b) => a + b, 0) / successfulTimes.length;
            results.performance.fastest = Math.min(...successfulTimes);
            results.performance.slowest = Math.max(...successfulTimes);
        }
        
        console.log('🏁 Edge detection demo complete!');
        console.log(`📊 Performance: Avg ${results.performance.average.toFixed(2)}ms`);
        
        return results;
    }
    
    /**
     * Test all available edge detection models for performance
     */
    async benchmarkEdgeDetection(imageData, iterations = 3) {
        console.log(`🏃 Benchmarking edge detection (${iterations} iterations)...`);
        
        const onnxEngine = this.engines.get('onnx');
        if (!onnxEngine || !onnxEngine.testEdgeDetection) {
            console.warn('⚠️ ONNX engine not available for benchmarking');
            return null;
        }
        
        const benchmark = {
            iterations,
            timestamp: new Date().toISOString(),
            device: {
                userAgent: navigator.userAgent,
                memory: navigator.deviceMemory || 'unknown',
                cores: navigator.hardwareConcurrency || 'unknown'
            },
            results: {}
        };
        
        for (let i = 0; i < iterations; i++) {
            console.log(`🔄 Iteration ${i + 1}/${iterations}`);
            
            try {
                const iterationResult = await onnxEngine.testEdgeDetection(imageData, {
                    quality: 'auto'
                });
                
                // Aggregate results
                Object.keys(iterationResult).forEach(modelType => {
                    if (!benchmark.results[modelType]) {
                        benchmark.results[modelType] = {
                            times: [],
                            successes: 0,
                            errors: []
                        };
                    }
                    
                    const result = iterationResult[modelType];
                    if (result.success) {
                        benchmark.results[modelType].times.push(result.processingTime);
                        benchmark.results[modelType].successes++;
                    } else {
                        benchmark.results[modelType].errors.push(result.error);
                    }
                });
                
            } catch (error) {
                console.error(`❌ Iteration ${i + 1} failed:`, error.message);
            }
        }
        
        // Calculate statistics
        Object.keys(benchmark.results).forEach(modelType => {
            const data = benchmark.results[modelType];
            const times = data.times;
            
            if (times.length > 0) {
                data.statistics = {
                    average: times.reduce((a, b) => a + b, 0) / times.length,
                    min: Math.min(...times),
                    max: Math.max(...times),
                    median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
                    successRate: (data.successes / iterations) * 100
                };
            }
        });
        
        console.log('📊 Benchmark complete!');
        return benchmark;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedAIManager;
} else {
    window.UnifiedAIManager = UnifiedAIManager;
}