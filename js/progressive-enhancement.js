/**
 * Progressive Enhancement System - 2025 Implementation
 * Ensures optimal AI performance across all devices with intelligent fallbacks
 * WebGPU → WebGL → WebAssembly → Traditional Processing
 */

class ProgressiveEnhancementManager {
    constructor() {
        this.currentTier = null;
        this.deviceCapabilities = null;
        this.performanceProfile = null;
        this.adaptiveSettings = null;
        
        // Performance tiers
        this.enhancementTiers = {
            'tier1_webgpu': {
                name: 'High-End (WebGPU)',
                description: 'Desktop with modern GPU and WebGPU support',
                requirements: {
                    webgpu: true,
                    memory: 8, // GB
                    cores: 8,
                    mobile: false
                },
                capabilities: {
                    maxModels: 5,
                    maxModelSize: 200, // MB
                    cacheSize: 1000, // MB
                    qualityLevel: 'desktop',
                    enablePreloading: true,
                    parallelProcessing: true
                }
            },
            'tier2_webgl': {
                name: 'Mid-Range (WebGL)',
                description: 'Desktop/laptop with WebGL support',
                requirements: {
                    webgl: true,
                    memory: 4, // GB
                    cores: 4,
                    mobile: false
                },
                capabilities: {
                    maxModels: 3,
                    maxModelSize: 100, // MB
                    cacheSize: 500, // MB
                    qualityLevel: 'desktop',
                    enablePreloading: true,
                    parallelProcessing: false
                }
            },
            'tier3_mobile_gpu': {
                name: 'Mobile (GPU)',
                description: 'Mobile device with GPU acceleration',
                requirements: {
                    webgl: true,
                    memory: 2, // GB
                    mobile: true
                },
                capabilities: {
                    maxModels: 2,
                    maxModelSize: 50, // MB
                    cacheSize: 250, // MB
                    qualityLevel: 'mobile',
                    enablePreloading: false,
                    parallelProcessing: false
                }
            },
            'tier4_wasm': {
                name: 'CPU (WebAssembly)',
                description: 'CPU-only processing with WASM',
                requirements: {
                    wasm: true,
                    memory: 1, // GB
                    cores: 2
                },
                capabilities: {
                    maxModels: 1,
                    maxModelSize: 25, // MB
                    cacheSize: 100, // MB
                    qualityLevel: 'mobile',
                    enablePreloading: false,
                    parallelProcessing: false
                }
            },
            'tier5_fallback': {
                name: 'Traditional Processing',
                description: 'JavaScript-only fallback processing',
                requirements: {},
                capabilities: {
                    maxModels: 0,
                    maxModelSize: 0,
                    cacheSize: 0,
                    qualityLevel: 'traditional',
                    enablePreloading: false,
                    parallelProcessing: false
                }
            }
        };
        
        // Adaptive settings based on performance
        this.adaptiveConfigs = {
            'tier1_webgpu': {
                aiProcessing: 'preferred',
                modelSelection: 'best',
                caching: 'aggressive',
                preloading: 'comprehensive',
                fallbackSpeed: 'slow'
            },
            'tier2_webgl': {
                aiProcessing: 'preferred',
                modelSelection: 'balanced',
                caching: 'moderate',
                preloading: 'essential',
                fallbackSpeed: 'medium'
            },
            'tier3_mobile_gpu': {
                aiProcessing: 'selective',
                modelSelection: 'efficient',
                caching: 'conservative',
                preloading: 'disabled',
                fallbackSpeed: 'fast'
            },
            'tier4_wasm': {
                aiProcessing: 'minimal',
                modelSelection: 'lightweight',
                caching: 'minimal',
                preloading: 'disabled',
                fallbackSpeed: 'immediate'
            },
            'tier5_fallback': {
                aiProcessing: 'disabled',
                modelSelection: 'none',
                caching: 'disabled',
                preloading: 'disabled',
                fallbackSpeed: 'immediate'
            }
        };
        
        console.log('🎯 Progressive Enhancement Manager initialized');
    }
    
    /**
     * Detect device capabilities and assign performance tier
     */
    async detectDeviceCapabilities() {
        console.log('🔍 Detecting device capabilities...');
        
        this.deviceCapabilities = {
            // Browser capabilities
            webgpu: await this.detectWebGPU(),
            webgl: this.detectWebGL(),
            wasm: this.detectWebAssembly(),
            
            // Hardware information
            memory: navigator.deviceMemory || this.estimateMemory(),
            cores: navigator.hardwareConcurrency || 4,
            mobile: /Mobi|Android/i.test(navigator.userAgent),
            
            // Performance indicators
            connection: this.getConnectionInfo(),
            battery: await this.getBatteryInfo(),
            
            // Additional context
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
        
        console.log('📊 Device capabilities detected:', this.deviceCapabilities);
        return this.deviceCapabilities;
    }
    
    /**
     * Detect WebGPU support
     */
    async detectWebGPU() {
        try {
            if ('gpu' in navigator) {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    const device = await adapter.requestDevice();
                    if (device) {
                        console.log('✅ WebGPU fully supported');
                        return true;
                    }
                }
            }
        } catch (error) {
            console.log('❌ WebGPU not available:', error.message);
        }
        
        return false;
    }
    
    /**
     * Detect WebGL support
     */
    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            const supported = !!gl;
            
            if (supported) {
                console.log('✅ WebGL supported');
                return true;
            }
        } catch (error) {
            console.log('❌ WebGL not available:', error.message);
        }
        
        return false;
    }
    
    /**
     * Detect WebAssembly support
     */
    detectWebAssembly() {
        try {
            const supported = typeof WebAssembly === 'object' && 
                             typeof WebAssembly.instantiate === 'function';
            
            if (supported) {
                console.log('✅ WebAssembly supported');
                return true;
            }
        } catch (error) {
            console.log('❌ WebAssembly not available:', error.message);
        }
        
        return false;
    }
    
    /**
     * Estimate memory if not available
     */
    estimateMemory() {
        const mobile = /Mobi|Android/i.test(navigator.userAgent);
        const estimate = mobile ? 2 : 4; // Conservative estimates
        console.log(`📱 Estimated memory: ${estimate}GB (${mobile ? 'mobile' : 'desktop'})`);
        return estimate;
    }
    
    /**
     * Get network connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return {
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                rtt: connection.rtt || 0,
                saveData: connection.saveData || false
            };
        }
        
        return { effectiveType: 'unknown', downlink: 0, rtt: 0, saveData: false };
    }
    
    /**
     * Get battery information
     */
    async getBatteryInfo() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                return {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }
        } catch (error) {
            console.log('🔋 Battery API not available');
        }
        
        return { level: 1, charging: true, chargingTime: Infinity, dischargingTime: Infinity };
    }
    
    /**
     * Assign performance tier based on capabilities
     */
    assignPerformanceTier() {
        console.log('🎯 Assigning performance tier...');
        
        for (const [tierId, tier] of Object.entries(this.enhancementTiers)) {
            if (this.meetsRequirements(tier.requirements)) {
                this.currentTier = tierId;
                this.adaptiveSettings = this.adaptiveConfigs[tierId];
                
                console.log(`🏆 Assigned tier: ${tier.name}`);
                console.log(`📝 Description: ${tier.description}`);
                
                return tierId;
            }
        }
        
        // Fallback to traditional processing
        this.currentTier = 'tier5_fallback';
        this.adaptiveSettings = this.adaptiveConfigs['tier5_fallback'];
        
        console.log('⚠️ Fallback to traditional processing');
        return 'tier5_fallback';
    }
    
    /**
     * Check if device meets tier requirements
     */
    meetsRequirements(requirements) {
        const caps = this.deviceCapabilities;
        
        // Check each requirement
        for (const [requirement, value] of Object.entries(requirements)) {
            switch (requirement) {
                case 'webgpu':
                    if (value && !caps.webgpu) return false;
                    break;
                case 'webgl':
                    if (value && !caps.webgl) return false;
                    break;
                case 'wasm':
                    if (value && !caps.wasm) return false;
                    break;
                case 'memory':
                    if (caps.memory < value) return false;
                    break;
                case 'cores':
                    if (caps.cores < value) return false;
                    break;
                case 'mobile':
                    if (value !== undefined && caps.mobile !== value) return false;
                    break;
            }
        }
        
        return true;
    }
    
    /**
     * Run performance benchmark to validate tier assignment
     */
    async runPerformanceBenchmark() {
        console.log('🏃 Running performance benchmark...');
        
        const benchmark = {
            timestamp: new Date().toISOString(),
            assignedTier: this.currentTier,
            tests: {}
        };
        
        // Test 1: Canvas rendering performance
        benchmark.tests.canvasRendering = await this.benchmarkCanvasRendering();
        
        // Test 2: Memory allocation test
        benchmark.tests.memoryAllocation = await this.benchmarkMemoryAllocation();
        
        // Test 3: Processing speed test
        benchmark.tests.processingSpeed = await this.benchmarkProcessingSpeed();
        
        // Test 4: WebGL performance (if available)
        if (this.deviceCapabilities.webgl) {
            benchmark.tests.webglPerformance = await this.benchmarkWebGL();
        }
        
        // Analyze results
        this.performanceProfile = this.analyzePerformance(benchmark);
        
        console.log('📊 Performance benchmark complete:', this.performanceProfile);
        return benchmark;
    }
    
    /**
     * Benchmark canvas rendering performance
     */
    async benchmarkCanvasRendering() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        const iterations = 100;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            ctx.fillStyle = `hsl(${i % 360}, 100%, 50%)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.filter = 'contrast(150%) brightness(110%)';
            ctx.drawImage(canvas, 0, 0);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return {
            iterations,
            duration,
            avgTimePerIteration: duration / iterations,
            score: Math.max(0, 100 - (duration / 10)) // Simple scoring
        };
    }
    
    /**
     * Benchmark memory allocation
     */
    async benchmarkMemoryAllocation() {
        const arrays = [];
        const startTime = performance.now();
        
        try {
            // Try to allocate arrays until we hit a limit or timeout
            for (let i = 0; i < 100; i++) {
                const array = new Float32Array(1024 * 1024); // 4MB each
                arrays.push(array);
                
                if (performance.now() - startTime > 1000) break; // 1 second timeout
            }
        } catch (error) {
            console.log('📊 Memory allocation limit reached');
        }
        
        const endTime = performance.now();
        const allocatedMB = arrays.length * 4;
        
        // Clean up
        arrays.length = 0;
        
        return {
            allocatedMB,
            duration: endTime - startTime,
            score: Math.min(100, allocatedMB / 10) // Score based on allocated memory
        };
    }
    
    /**
     * Benchmark general processing speed
     */
    async benchmarkProcessingSpeed() {
        const iterations = 10000;
        const data = new Array(1000).fill(0).map(() => Math.random());
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            // Simulate image processing operations
            const result = data.map(x => Math.sin(x * Math.PI) * Math.cos(x * Math.PI));
            const sum = result.reduce((a, b) => a + b, 0);
            const avg = sum / result.length;
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return {
            iterations,
            duration,
            operationsPerSecond: (iterations * 1000) / duration,
            score: Math.max(0, 100 - (duration / 100))
        };
    }
    
    /**
     * Benchmark WebGL performance
     */
    async benchmarkWebGL() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return { score: 0, error: 'WebGL not available' };
        }
        
        canvas.width = 512;
        canvas.height = 512;
        
        const startTime = performance.now();
        
        // Simple WebGL rendering test
        for (let i = 0; i < 100; i++) {
            gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.flush();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return {
            duration,
            score: Math.max(0, 100 - (duration / 5))
        };
    }
    
    /**
     * Analyze performance results
     */
    analyzePerformance(benchmark) {
        const scores = Object.values(benchmark.tests)
            .filter(test => test.score !== undefined)
            .map(test => test.score);
        
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        let recommendedTier = this.currentTier;
        
        // Adjust tier based on performance
        if (averageScore < 30 && this.currentTier !== 'tier5_fallback') {
            recommendedTier = this.downgradeTier(this.currentTier);
            console.log(`⬇️ Performance suggests downgrading to: ${recommendedTier}`);
        } else if (averageScore > 80 && this.canUpgradeTier(this.currentTier)) {
            const upgradedTier = this.upgradeTier(this.currentTier);
            console.log(`⬆️ Performance suggests upgrading to: ${upgradedTier}`);
        }
        
        return {
            averageScore,
            individualScores: scores,
            assignedTier: this.currentTier,
            recommendedTier,
            shouldAdjust: recommendedTier !== this.currentTier,
            classification: this.classifyPerformance(averageScore)
        };
    }
    
    /**
     * Classify performance level
     */
    classifyPerformance(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'acceptable';
        if (score >= 20) return 'poor';
        return 'very_poor';
    }
    
    /**
     * Downgrade performance tier
     */
    downgradeTier(currentTier) {
        const tiers = Object.keys(this.enhancementTiers);
        const currentIndex = tiers.indexOf(currentTier);
        return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTier;
    }
    
    /**
     * Upgrade performance tier
     */
    upgradeTier(currentTier) {
        const tiers = Object.keys(this.enhancementTiers);
        const currentIndex = tiers.indexOf(currentTier);
        return currentIndex > 0 ? tiers[currentIndex - 1] : currentTier;
    }
    
    /**
     * Check if tier can be upgraded
     */
    canUpgradeTier(currentTier) {
        const tiers = Object.keys(this.enhancementTiers);
        return tiers.indexOf(currentTier) > 0;
    }
    
    /**
     * Get current configuration based on tier
     */
    getCurrentConfiguration() {
        const tier = this.enhancementTiers[this.currentTier];
        
        return {
            tier: this.currentTier,
            tierName: tier.name,
            capabilities: tier.capabilities,
            adaptiveSettings: this.adaptiveSettings,
            deviceCapabilities: this.deviceCapabilities,
            performanceProfile: this.performanceProfile
        };
    }
    
    /**
     * Apply adaptive optimizations
     */
    applyAdaptiveOptimizations() {
        const config = this.getCurrentConfiguration();
        
        console.log('🔧 Applying adaptive optimizations...');
        console.log(`📊 Performance tier: ${config.tierName}`);
        
        // Configure cache settings
        if (window.unifiedAIManager) {
            const onnxEngine = window.unifiedAIManager.engines?.get('onnx');
            if (onnxEngine && onnxEngine.cacheConfig) {
                onnxEngine.cacheConfig.maxModels = config.capabilities.maxModels;
                onnxEngine.cacheConfig.maxCacheSize = config.capabilities.cacheSize * 1024 * 1024; // Convert MB to bytes
                onnxEngine.cacheConfig.enablePersistence = config.capabilities.enablePreloading;
                
                console.log(`🎯 Cache optimized: ${config.capabilities.maxModels} models, ${config.capabilities.cacheSize}MB`);
            }
        }
        
        // Set quality defaults
        if (window.unifiedAIManager && window.unifiedAIManager.preferences) {
            window.unifiedAIManager.preferences.quality = config.capabilities.qualityLevel;
            console.log(`🎨 Quality level set: ${config.capabilities.qualityLevel}`);
        }
        
        return config;
    }
    
    /**
     * Monitor performance and adapt in real-time
     */
    startPerformanceMonitoring() {
        console.log('📈 Starting real-time performance monitoring...');
        
        this.monitoringInterval = setInterval(() => {
            this.checkPerformanceHealth();
        }, 30000); // Check every 30 seconds
        
        // Monitor memory usage
        if ('memory' in performance) {
            this.memoryMonitoring = setInterval(() => {
                this.checkMemoryHealth();
            }, 10000); // Check every 10 seconds
        }
    }
    
    /**
     * Check system performance health
     */
    checkPerformanceHealth() {
        // Check if processing is taking too long
        if (window.unifiedAIManager && window.unifiedAIManager.stats) {
            const avgTime = window.unifiedAIManager.stats.averageTime;
            
            if (avgTime > 30000) { // More than 30 seconds
                console.log('⚠️ Performance degradation detected, considering tier downgrade');
                this.considerTierAdjustment('downgrade');
            } else if (avgTime < 5000 && this.canUpgradeTier(this.currentTier)) {
                console.log('⬆️ Good performance detected, considering tier upgrade');
                this.considerTierAdjustment('upgrade');
            }
        }
    }
    
    /**
     * Check memory health
     */
    checkMemoryHealth() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
            
            if (usagePercent > 90) {
                console.log('🚨 High memory usage detected, forcing cache cleanup');
                if (window.unifiedAIManager) {
                    window.unifiedAIManager.clearCaches();
                }
            } else if (usagePercent > 75) {
                console.log('⚠️ Memory usage elevated, reducing cache size');
                this.reduceCacheSize();
            }
        }
    }
    
    /**
     * Consider tier adjustment
     */
    considerTierAdjustment(direction) {
        const newTier = direction === 'upgrade' ? 
            this.upgradeTier(this.currentTier) : 
            this.downgradeTier(this.currentTier);
        
        if (newTier !== this.currentTier) {
            console.log(`🔄 Adjusting performance tier: ${this.currentTier} → ${newTier}`);
            this.currentTier = newTier;
            this.adaptiveSettings = this.adaptiveConfigs[newTier];
            this.applyAdaptiveOptimizations();
        }
    }
    
    /**
     * Reduce cache size to free memory
     */
    reduceCacheSize() {
        if (window.unifiedAIManager) {
            const onnxEngine = window.unifiedAIManager.engines?.get('onnx');
            if (onnxEngine && onnxEngine.cacheConfig) {
                onnxEngine.cacheConfig.maxCacheSize *= 0.7; // Reduce by 30%
                onnxEngine.cacheConfig.maxModels = Math.max(1, onnxEngine.cacheConfig.maxModels - 1);
                console.log('📉 Cache size reduced due to memory pressure');
            }
        }
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        if (this.memoryMonitoring) {
            clearInterval(this.memoryMonitoring);
        }
        console.log('⏹️ Performance monitoring stopped');
    }
    
    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        return {
            currentTier: this.currentTier,
            tierName: this.enhancementTiers[this.currentTier]?.name,
            deviceCapabilities: this.deviceCapabilities,
            performanceProfile: this.performanceProfile,
            adaptiveSettings: this.adaptiveSettings,
            configuration: this.getCurrentConfiguration(),
            monitoring: {
                active: !!this.monitoringInterval,
                memoryMonitoring: !!this.memoryMonitoring
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressiveEnhancementManager;
} else {
    window.ProgressiveEnhancementManager = ProgressiveEnhancementManager;
}