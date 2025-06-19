/**
 * Browser AI Engine - 2025 Implementation
 * Modern browser-based AI inference using ONNX Runtime Web with WebGPU acceleration
 * Implements progressive enhancement: WebGPU → WebGL → WebAssembly → Fallback
 */

class BrowserAIEngine {
    constructor() {
        this.isInitialized = false;
        this.supportedBackends = [];
        this.currentBackend = null;
        this.modelCache = new Map();
        this.sessionCache = new Map();
        
        // Performance tracking
        this.metrics = {
            modelLoadTimes: new Map(),
            inferenceTimes: new Map(),
            totalProcessed: 0
        };
        
        // Model configurations for different quality settings
        this.modelConfigs = {
            edge_detection: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/HED-edge-detection/resolve/main/model_quantized.onnx',
                    size: '8MB',
                    description: 'Lightweight edge detection for mobile devices'
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/HED-edge-detection/resolve/main/model.onnx',
                    size: '25MB',
                    description: 'High-quality edge detection for desktop'
                }
            },
            sketch_transfer: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/sketch-to-image-controlnet/resolve/main/model_quantized.onnx',
                    size: '45MB',
                    description: 'Optimized sketch style transfer'
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/sketch-to-image-controlnet/resolve/main/model.onnx',
                    size: '120MB',
                    description: 'Full-quality sketch style transfer'
                }
            }
        };
        
        console.log('🤖 Browser AI Engine initialized (2025 version)');
    }

    /**
     * Initialize the AI engine with device capability detection
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🔍 Detecting device capabilities...');
        
        try {
            // Import ONNX Runtime Web (dynamically loaded)
            if (typeof ort === 'undefined') {
                await this.loadONNXRuntime();
            }
            
            // Detect supported backends
            await this.detectSupportedBackends();
            
            // Select optimal backend
            this.currentBackend = this.selectOptimalBackend();
            
            // Configure ONNX Runtime
            await this.configureONNXRuntime();
            
            this.isInitialized = true;
            
            console.log(`✅ AI Engine initialized with ${this.currentBackend} backend`);
            this.logCapabilities();
            
        } catch (error) {
            console.error('❌ Failed to initialize AI Engine:', error);
            this.currentBackend = 'fallback';
            this.isInitialized = true; // Still allow fallback operation
        }
    }

    /**
     * Dynamically load ONNX Runtime Web
     */
    async loadONNXRuntime() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/ort.min.js';
            script.onload = () => {
                console.log('📦 ONNX Runtime Web loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.warn('⚠️ Failed to load ONNX Runtime Web');
                reject(new Error('Failed to load ONNX Runtime Web'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Detect supported AI backends
     */
    async detectSupportedBackends() {
        const backends = [];
        
        // Check WebGPU support (2025 standard)
        try {
            if ('gpu' in navigator) {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    backends.push('webgpu');
                    console.log('✅ WebGPU supported');
                }
            }
        } catch (error) {
            console.log('❌ WebGPU not supported:', error.message);
        }
        
        // Check WebGL support
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (gl) {
                backends.push('webgl');
                console.log('✅ WebGL supported');
            }
        } catch (error) {
            console.log('❌ WebGL not supported:', error.message);
        }
        
        // WebAssembly is universally supported in modern browsers
        backends.push('wasm');
        console.log('✅ WebAssembly supported');
        
        this.supportedBackends = backends;
    }

    /**
     * Select the optimal backend based on device capabilities
     */
    selectOptimalBackend() {
        // Device detection for optimal backend selection
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const hasHighMemory = navigator.deviceMemory >= 4; // GB
        
        if (this.supportedBackends.includes('webgpu') && !isMobile && hasHighMemory) {
            return 'webgpu';
        } else if (this.supportedBackends.includes('webgl')) {
            return 'webgl';
        } else if (this.supportedBackends.includes('wasm')) {
            return 'wasm';
        } else {
            return 'fallback';
        }
    }

    /**
     * Configure ONNX Runtime with optimal settings
     */
    async configureONNXRuntime() {
        if (typeof ort === 'undefined') {
            throw new Error('ONNX Runtime not available');
        }
        
        // Configure execution providers based on selected backend
        const executionProviders = [];
        
        switch (this.currentBackend) {
            case 'webgpu':
                executionProviders.push({
                    name: 'webgpu',
                    deviceType: 'gpu',
                    preferredLayout: 'NHWC'
                });
                break;
                
            case 'webgl':
                executionProviders.push({
                    name: 'webgl',
                    deviceType: 'gpu'
                });
                break;
                
            case 'wasm':
                executionProviders.push({
                    name: 'wasm',
                    deviceType: 'cpu'
                });
                break;
        }
        
        // Set global configuration
        ort.env.executionProviders = executionProviders;
        ort.env.logLevel = 'warning'; // Reduce console noise
        
        // Enable WebAssembly SIMD and multi-threading if available
        if (this.currentBackend === 'wasm') {
            ort.env.wasm.simd = true;
            ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
        }
        
        console.log('⚙️ ONNX Runtime configured with:', executionProviders);
    }

    /**
     * Load an AI model with caching
     */
    async loadModel(modelType, qualityLevel = 'auto') {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        // Auto-detect quality level based on device capabilities
        if (qualityLevel === 'auto') {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            const hasHighMemory = navigator.deviceMemory >= 4;
            qualityLevel = (isMobile || !hasHighMemory) ? 'mobile' : 'desktop';
        }
        
        const modelKey = `${modelType}_${qualityLevel}`;
        
        // Check cache first
        if (this.sessionCache.has(modelKey)) {
            console.log(`📋 Using cached model: ${modelKey}`);
            return this.sessionCache.get(modelKey);
        }
        
        const modelConfig = this.modelConfigs[modelType]?.[qualityLevel];
        if (!modelConfig) {
            throw new Error(`Model not available: ${modelType} (${qualityLevel})`);
        }
        
        console.log(`📥 Loading model: ${modelKey} (${modelConfig.size})`);
        const startTime = performance.now();
        
        try {
            // Download model with progress tracking
            const modelBuffer = await this.downloadWithProgress(modelConfig.url, (progress) => {
                this.onModelLoadProgress?.(modelKey, progress);
            });
            
            // Create inference session
            const session = await ort.InferenceSession.create(modelBuffer);
            
            // Cache the session
            this.sessionCache.set(modelKey, session);
            
            const loadTime = performance.now() - startTime;
            this.metrics.modelLoadTimes.set(modelKey, loadTime);
            
            console.log(`✅ Model loaded: ${modelKey} (${loadTime.toFixed(2)}ms)`);
            
            return session;
            
        } catch (error) {
            console.error(`❌ Failed to load model ${modelKey}:`, error);
            throw error;
        }
    }

    /**
     * Download model with progress tracking
     */
    async downloadWithProgress(url, onProgress) {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to download model: ${response.status}`);
        }
        
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;
        
        const reader = response.body.getReader();
        const chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            if (onProgress && total) {
                onProgress((loaded / total) * 100);
            }
        }
        
        // Combine chunks into single buffer
        const buffer = new Uint8Array(loaded);
        let offset = 0;
        
        for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
        }
        
        return buffer;
    }

    /**
     * Run inference on an image
     */
    async processImage(imageData, modelType, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (this.currentBackend === 'fallback') {
            console.log('🔄 Using fallback processing (no AI available)');
            return await this.fallbackProcessing(imageData, modelType, options);
        }
        
        try {
            const startTime = performance.now();
            
            // Load model if not already loaded
            const session = await this.loadModel(modelType, options.quality);
            
            // Prepare input tensor
            const inputTensor = await this.prepareInputTensor(imageData, session);
            
            // Run inference
            const outputs = await session.run({ input: inputTensor });
            
            // Process output
            const result = await this.processOutput(outputs, imageData.width, imageData.height);
            
            const inferenceTime = performance.now() - startTime;
            this.metrics.inferenceTimes.set(modelType, inferenceTime);
            this.metrics.totalProcessed++;
            
            console.log(`⚡ Inference completed: ${modelType} (${inferenceTime.toFixed(2)}ms)`);
            
            return {
                success: true,
                imageData: result,
                processingTime: inferenceTime,
                backend: this.currentBackend,
                modelType: modelType
            };
            
        } catch (error) {
            console.error(`❌ AI inference failed for ${modelType}:`, error);
            
            // Fallback to traditional processing
            console.log('🔄 Falling back to traditional processing');
            return await this.fallbackProcessing(imageData, modelType, options);
        }
    }

    /**
     * Prepare image data as input tensor
     */
    async prepareInputTensor(imageData, session) {
        // Get input info from model
        const inputNames = session.inputNames;
        const inputInfo = session.inputs[inputNames[0]];
        
        // Typically models expect NCHW format (batch, channels, height, width)
        const [, channels, height, width] = inputInfo.dims;
        
        // Resize image if needed
        const resizedImageData = this.resizeImage(imageData, width, height);
        
        // Convert to tensor format
        const tensorData = new Float32Array(channels * height * width);
        const pixels = resizedImageData.data;
        
        // Convert RGBA to RGB and normalize to [0, 1] or [-1, 1]
        for (let i = 0; i < height * width; i++) {
            const pixelIndex = i * 4;
            
            // Normalize to [0, 1] and rearrange to CHW format
            tensorData[i] = pixels[pixelIndex] / 255.0;           // R
            tensorData[height * width + i] = pixels[pixelIndex + 1] / 255.0;     // G
            tensorData[height * width * 2 + i] = pixels[pixelIndex + 2] / 255.0; // B
        }
        
        return new ort.Tensor('float32', tensorData, [1, channels, height, width]);
    }

    /**
     * Resize image data to target dimensions
     */
    resizeImage(imageData, targetWidth, targetHeight) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create source canvas
        const sourceCanvas = document.createElement('canvas');
        const sourceCtx = sourceCanvas.getContext('2d');
        sourceCanvas.width = imageData.width;
        sourceCanvas.height = imageData.height;
        sourceCtx.putImageData(imageData, 0, 0);
        
        // Resize to target dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
        
        return ctx.getImageData(0, 0, targetWidth, targetHeight);
    }

    /**
     * Process model output back to image data
     */
    async processOutput(outputs, originalWidth, originalHeight) {
        const outputNames = Object.keys(outputs);
        const outputTensor = outputs[outputNames[0]];
        
        // Typically output is in CHW format
        const [, channels, height, width] = outputTensor.dims;
        const data = outputTensor.data;
        
        // Create canvas for output
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        const imageData = ctx.createImageData(width, height);
        const pixels = imageData.data;
        
        // Convert from CHW to RGBA
        for (let i = 0; i < height * width; i++) {
            const pixelIndex = i * 4;
            
            // Denormalize from [0, 1] to [0, 255]
            pixels[pixelIndex] = Math.round(data[i] * 255);                    // R
            pixels[pixelIndex + 1] = Math.round(data[height * width + i] * 255);       // G
            pixels[pixelIndex + 2] = Math.round(data[height * width * 2 + i] * 255);   // B
            pixels[pixelIndex + 3] = 255;                                      // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Resize back to original dimensions if needed
        if (width !== originalWidth || height !== originalHeight) {
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            finalCanvas.width = originalWidth;
            finalCanvas.height = originalHeight;
            finalCtx.drawImage(canvas, 0, 0, originalWidth, originalHeight);
            return finalCtx.getImageData(0, 0, originalWidth, originalHeight);
        }
        
        return imageData;
    }

    /**
     * Fallback processing when AI is not available
     */
    async fallbackProcessing(imageData, modelType, options) {
        console.log(`🔄 Using fallback processing for ${modelType}`);
        
        // Use existing traditional methods
        if (window.handDrawnEffects) {
            return await window.handDrawnEffects.applyEffect(imageData, 'pencil', options);
        }
        
        // Basic edge detection fallback
        return this.basicEdgeDetection(imageData);
    }

    /**
     * Basic edge detection using canvas operations
     */
    basicEdgeDetection(imageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        ctx.putImageData(imageData, 0, 0);
        
        // Apply simple edge detection filter
        ctx.filter = 'contrast(150%) brightness(150%) grayscale(100%)';
        ctx.drawImage(canvas, 0, 0);
        
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Get device capabilities and performance metrics
     */
    getCapabilities() {
        return {
            supportedBackends: this.supportedBackends,
            currentBackend: this.currentBackend,
            isInitialized: this.isInitialized,
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            metrics: this.metrics
        };
    }

    /**
     * Log system capabilities
     */
    logCapabilities() {
        const caps = this.getCapabilities();
        console.log('🔧 AI Engine Capabilities:', {
            'Backend': caps.currentBackend,
            'Supported': caps.supportedBackends.join(', '),
            'Memory': `${caps.deviceMemory}GB`,
            'CPU Cores': caps.hardwareConcurrency,
            'Models Loaded': this.sessionCache.size
        });
    }

    /**
     * Clear model cache to free memory
     */
    clearCache() {
        this.sessionCache.clear();
        this.modelCache.clear();
        console.log('🗑️ AI model cache cleared');
    }

    /**
     * Set progress callback for model loading
     */
    setProgressCallback(callback) {
        this.onModelLoadProgress = callback;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserAIEngine;
} else {
    window.BrowserAIEngine = BrowserAIEngine;
}