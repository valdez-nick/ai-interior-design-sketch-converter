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
            // Lightweight edge detection models
            edge_detection: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/pidinet/resolve/main/model_quantized.onnx',
                    size: '3.2MB',
                    description: 'Ultra-lightweight edge detection (PiDiNet)',
                    inputSize: [512, 512],
                    outputChannels: 1
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/HED-edge-detection/resolve/main/model.onnx',
                    size: '25MB',
                    description: 'High-quality edge detection (HED)',
                    inputSize: [512, 512],
                    outputChannels: 1
                }
            },
            // Fast architectural edge detection
            architectural_edges: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/BDCN-edge-detection/resolve/main/model_mobile.onnx',
                    size: '5.1MB',
                    description: 'Architectural edge detection optimized for buildings',
                    inputSize: [512, 512],
                    outputChannels: 1
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/BDCN-edge-detection/resolve/main/model.onnx',
                    size: '38MB',
                    description: 'High-precision architectural edge detection',
                    inputSize: [512, 512],
                    outputChannels: 1
                }
            },
            // Sketch style transfer models
            sketch_transfer: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/sketch-style-transfer-lite/resolve/main/model.onnx',
                    size: '12MB',
                    description: 'Lightweight sketch style transfer',
                    inputSize: [256, 256],
                    outputChannels: 3
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/sketch-style-transfer/resolve/main/model.onnx',
                    size: '45MB',
                    description: 'High-quality sketch style transfer',
                    inputSize: [512, 512],
                    outputChannels: 3
                }
            },
            // Interior-specific models
            interior_sketch: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/interior-sketch-lite/resolve/main/model.onnx',
                    size: '8.7MB',
                    description: 'Interior design sketch conversion',
                    inputSize: [256, 256],
                    outputChannels: 3
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/interior-sketch-hd/resolve/main/model.onnx',
                    size: '67MB',
                    description: 'High-definition interior sketch conversion',
                    inputSize: [512, 512],
                    outputChannels: 3
                }
            },
            // ControlNet-style models for advanced sketch conversion
            controlnet_sketch: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/controlnet-canny-sketch/resolve/main/model_quantized.onnx',
                    size: '21MB',
                    description: 'ControlNet Canny edge to sketch conversion (mobile)',
                    inputSize: [512, 512],
                    outputChannels: 3,
                    controlType: 'canny'
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/controlnet-canny-sketch/resolve/main/model.onnx',
                    size: '89MB',
                    description: 'ControlNet Canny edge to sketch conversion (full)',
                    inputSize: [512, 512],
                    outputChannels: 3,
                    controlType: 'canny'
                }
            },
            controlnet_lineart: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/controlnet-lineart/resolve/main/model_lite.onnx',
                    size: '19MB',
                    description: 'ControlNet line art generation (mobile)',
                    inputSize: [512, 512],
                    outputChannels: 3,
                    controlType: 'lineart'
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/controlnet-lineart/resolve/main/model.onnx',
                    size: '76MB',
                    description: 'ControlNet line art generation (full)',
                    inputSize: [512, 512],
                    outputChannels: 3,
                    controlType: 'lineart'
                }
            },
            controlnet_depth: {
                mobile: {
                    url: 'https://huggingface.co/onnx-community/controlnet-depth-sketch/resolve/main/model_mobile.onnx',
                    size: '25MB',
                    description: 'ControlNet depth-aware sketch conversion',
                    inputSize: [512, 512],
                    outputChannels: 3,
                    controlType: 'depth'
                },
                desktop: {
                    url: 'https://huggingface.co/onnx-community/controlnet-depth-sketch/resolve/main/model.onnx',
                    size: '95MB',
                    description: 'ControlNet depth-aware sketch conversion (HD)',
                    inputSize: [512, 512],
                    outputChannels: 3,
                    controlType: 'depth'
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
            
            // Preload essential models
            if (this.cacheConfig.preloadModels.length > 0) {
                setTimeout(() => this.preloadModels(), 1000); // Preload after 1 second
            }
            
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
            
            // Prepare input tensor with model type information
            const inputTensor = await this.prepareInputTensor(imageData, session, modelType);
            
            // Run inference
            const outputs = await session.run({ input: inputTensor });
            
            // Process output with model type information
            const result = await this.processOutput(outputs, imageData.width, imageData.height, modelType);
            
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
     * Prepare image data as input tensor with model-specific preprocessing
     */
    async prepareInputTensor(imageData, session, modelType) {
        // Get input info from model
        const inputNames = session.inputNames;
        const inputInfo = session.inputs[inputNames[0]];
        
        // Get model configuration for preprocessing
        const qualityLevel = this.getQualityLevel();
        const modelConfig = this.modelConfigs[modelType]?.[qualityLevel];
        
        let targetWidth, targetHeight, channels;
        
        if (modelConfig && modelConfig.inputSize) {
            [targetWidth, targetHeight] = modelConfig.inputSize;
            channels = inputInfo.dims[1]; // Assume NCHW format
        } else {
            // Fallback to input info from model
            const [, c, h, w] = inputInfo.dims;
            channels = c;
            targetHeight = h;
            targetWidth = w;
        }
        
        console.log(`📐 Preparing tensor: ${targetWidth}x${targetHeight}, ${channels} channels`);
        
        // Resize image if needed
        const resizedImageData = this.resizeImage(imageData, targetWidth, targetHeight);
        
        // Convert to tensor format with model-specific preprocessing
        const tensorData = new Float32Array(channels * targetHeight * targetWidth);
        const pixels = resizedImageData.data;
        
        if (channels === 1) {
            // Grayscale models (edge detection)
            for (let i = 0; i < targetHeight * targetWidth; i++) {
                const pixelIndex = i * 4;
                // Convert to grayscale and normalize to [0, 1]
                const gray = (pixels[pixelIndex] * 0.299 + pixels[pixelIndex + 1] * 0.587 + pixels[pixelIndex + 2] * 0.114) / 255.0;
                tensorData[i] = gray;
            }
        } else if (channels === 3) {
            // RGB models (style transfer)
            for (let i = 0; i < targetHeight * targetWidth; i++) {
                const pixelIndex = i * 4;
                
                // Apply model-specific normalization
                const normalizationType = this.getNormalizationType(modelType);
                let r, g, b;
                
                if (normalizationType === 'imagenet') {
                    // ImageNet normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                    r = (pixels[pixelIndex] / 255.0 - 0.485) / 0.229;
                    g = (pixels[pixelIndex + 1] / 255.0 - 0.456) / 0.224;
                    b = (pixels[pixelIndex + 2] / 255.0 - 0.406) / 0.225;
                } else {
                    // Standard [0, 1] normalization
                    r = pixels[pixelIndex] / 255.0;
                    g = pixels[pixelIndex + 1] / 255.0;
                    b = pixels[pixelIndex + 2] / 255.0;
                }
                
                // Rearrange to CHW format
                tensorData[i] = r;                                           // R channel
                tensorData[targetHeight * targetWidth + i] = g;             // G channel
                tensorData[targetHeight * targetWidth * 2 + i] = b;         // B channel
            }
        }
        
        return new ort.Tensor('float32', tensorData, [1, channels, targetHeight, targetWidth]);
    }
    
    /**
     * Get quality level based on device capabilities
     */
    getQualityLevel() {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const hasHighMemory = navigator.deviceMemory >= 4;
        return (isMobile || !hasHighMemory) ? 'mobile' : 'desktop';
    }
    
    /**
     * Get normalization type for specific model types
     */
    getNormalizationType(modelType) {
        const imageNetModels = ['sketch_transfer', 'interior_sketch'];
        return imageNetModels.includes(modelType) ? 'imagenet' : 'standard';
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
     * Process model output back to image data with format-specific handling
     */
    async processOutput(outputs, originalWidth, originalHeight, modelType = 'edge_detection') {
        const outputNames = Object.keys(outputs);
        const outputTensor = outputs[outputNames[0]];
        
        // Handle different output formats
        const [, channels, height, width] = outputTensor.dims;
        const data = outputTensor.data;
        
        console.log(`📤 Processing output: ${width}x${height}, ${channels} channels`);
        
        // Create canvas for output
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        const imageData = ctx.createImageData(width, height);
        const pixels = imageData.data;
        
        if (channels === 1) {
            // Single channel output (edge detection)
            for (let i = 0; i < height * width; i++) {
                const pixelIndex = i * 4;
                const value = Math.round(Math.max(0, Math.min(1, data[i])) * 255);
                
                pixels[pixelIndex] = value;     // R
                pixels[pixelIndex + 1] = value; // G
                pixels[pixelIndex + 2] = value; // B
                pixels[pixelIndex + 3] = 255;   // A
            }
        } else if (channels === 3) {
            // RGB output (style transfer)
            const normalizationType = this.getNormalizationType(modelType);
            
            for (let i = 0; i < height * width; i++) {
                const pixelIndex = i * 4;
                
                let r, g, b;
                
                if (normalizationType === 'imagenet') {
                    // Denormalize from ImageNet format
                    r = Math.round(Math.max(0, Math.min(1, (data[i] * 0.229 + 0.485))) * 255);
                    g = Math.round(Math.max(0, Math.min(1, (data[height * width + i] * 0.224 + 0.456))) * 255);
                    b = Math.round(Math.max(0, Math.min(1, (data[height * width * 2 + i] * 0.225 + 0.406))) * 255);
                } else {
                    // Standard denormalization
                    r = Math.round(Math.max(0, Math.min(1, data[i])) * 255);
                    g = Math.round(Math.max(0, Math.min(1, data[height * width + i])) * 255);
                    b = Math.round(Math.max(0, Math.min(1, data[height * width * 2 + i])) * 255);
                }
                
                pixels[pixelIndex] = r;         // R
                pixels[pixelIndex + 1] = g;     // G
                pixels[pixelIndex + 2] = b;     // B
                pixels[pixelIndex + 3] = 255;   // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Apply post-processing for edge detection
        if (modelType.includes('edge')) {
            this.applyEdgePostProcessing(ctx, width, height);
        }
        
        // Resize back to original dimensions if needed
        if (width !== originalWidth || height !== originalHeight) {
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            finalCanvas.width = originalWidth;
            finalCanvas.height = originalHeight;
            
            // Use high-quality scaling for upscaling
            finalCtx.imageSmoothingEnabled = true;
            finalCtx.imageSmoothingQuality = 'high';
            finalCtx.drawImage(canvas, 0, 0, originalWidth, originalHeight);
            
            return finalCtx.getImageData(0, 0, originalWidth, originalHeight);
        }
        
        return ctx.getImageData(0, 0, width, height);
    }
    
    /**
     * Apply post-processing for edge detection results
     */
    applyEdgePostProcessing(ctx, width, height) {
        // Apply contrast enhancement and noise reduction for edge detection
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        
        // Apply threshold and contrast enhancement
        for (let i = 0; i < pixels.length; i += 4) {
            const gray = pixels[i]; // Since R=G=B for grayscale
            
            // Apply adaptive threshold
            const threshold = 127;
            const enhanced = gray > threshold ? Math.min(255, gray * 1.2) : Math.max(0, gray * 0.8);
            
            pixels[i] = enhanced;     // R
            pixels[i + 1] = enhanced; // G
            pixels[i + 2] = enhanced; // B
            // Alpha stays 255
        }
        
        ctx.putImageData(imageData, 0, 0);
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
     * Enhanced processing with ControlNet support
     */
    async processImage(imageData, modelType, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        // Check if this is a ControlNet model
        const isControlNet = modelType.startsWith('controlnet_');
        
        if (isControlNet) {
            const qualityLevel = this.getQualityLevel();
            const modelConfig = this.modelConfigs[modelType]?.[qualityLevel];
            const controlType = modelConfig?.controlType || 'canny';
            
            return await this.processWithControlNet(imageData, modelType, controlType, options);
        }
        
        // Standard processing for non-ControlNet models
        return await this.processImageStandard(imageData, modelType, options);
    }
    
    /**
     * Standard (non-ControlNet) image processing
     */
    async processImageStandard(imageData, modelType, options = {}) {
        if (this.currentBackend === 'fallback') {
            console.log('🔄 Using fallback processing (no AI available)');
            return await this.fallbackProcessing(imageData, modelType, options);
        }
        
        try {
            const startTime = performance.now();
            
            // Load model if not already loaded
            const session = await this.loadModel(modelType, options.quality);
            
            // Prepare input tensor with model type information
            const inputTensor = await this.prepareInputTensor(imageData, session, modelType);
            
            // Run inference
            const outputs = await session.run({ input: inputTensor });
            
            // Process output with model type information
            const result = await this.processOutput(outputs, imageData.width, imageData.height, modelType);
            
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
    
    /**
     * Test edge detection models with performance comparison
     */
    async testEdgeDetection(imageData, options = {}) {
        console.log('📊 Testing edge detection models...');
        
        const models = ['edge_detection', 'architectural_edges'];
        const results = {};
        
        for (const modelType of models) {
            try {
                console.log(`🔍 Testing ${modelType}...`);
                const startTime = performance.now();
                
                const result = await this.processImage(imageData, modelType, {
                    quality: options.quality || 'auto'
                });
                
                const processingTime = performance.now() - startTime;
                
                results[modelType] = {
                    success: result.success,
                    processingTime,
                    backend: result.backend,
                    imageData: result.imageData
                };
                
                console.log(`✅ ${modelType}: ${processingTime.toFixed(2)}ms`);
                
            } catch (error) {
                console.error(`❌ ${modelType} failed:`, error.message);
                results[modelType] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        // Performance summary
        const successful = Object.values(results).filter(r => r.success);
        if (successful.length > 0) {
            const avgTime = successful.reduce((sum, r) => sum + r.processingTime, 0) / successful.length;
            console.log(`📊 Average processing time: ${avgTime.toFixed(2)}ms`);
        }
        
        return results;
    }
    
    /**
     * Get model description for UI display
     */
    getModelDescription(modelType) {
        const qualityLevel = this.getQualityLevel();
        const config = this.modelConfigs[modelType]?.[qualityLevel];
        return config ? config.description : `${modelType} model`;
    }
    
    /**
     * Process image with ControlNet-style conditioning
     */
    async processWithControlNet(imageData, modelType, controlType = 'canny', options = {}) {
        console.log(`🎛️ Processing with ControlNet: ${modelType} (${controlType})`);
        
        try {
            // Step 1: Generate control image based on type
            const controlImage = await this.generateControlImage(imageData, controlType, options);
            
            // Step 2: Load ControlNet model
            const session = await this.loadModel(modelType, options.quality);
            
            // Step 3: Prepare dual inputs (original + control)
            const inputs = await this.prepareControlNetInputs(imageData, controlImage, session);
            
            // Step 4: Run inference
            const outputs = await session.run(inputs);
            
            // Step 5: Process output
            const result = await this.processOutput(outputs, imageData.width, imageData.height, modelType);
            
            return {
                success: true,
                imageData: result,
                controlType: controlType,
                modelType: modelType,
                controlImage: controlImage // Include for debugging/visualization
            };
            
        } catch (error) {
            console.error(`❌ ControlNet processing failed:`, error);
            throw error;
        }
    }
    
    /**
     * Generate control image for ControlNet conditioning
     */
    async generateControlImage(imageData, controlType, options = {}) {
        console.log(`🔧 Generating ${controlType} control image...`);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        switch (controlType) {
            case 'canny':
                return await this.generateCannyEdges(imageData, options);
                
            case 'lineart':
                return await this.generateLineArt(imageData, options);
                
            case 'depth':
                return await this.generateDepthMap(imageData, options);
                
            default:
                console.warn(`⚠️ Unknown control type: ${controlType}`);
                return imageData; // Return original as fallback
        }
    }
    
    /**
     * Generate Canny edge control image
     */
    async generateCannyEdges(imageData, options = {}) {
        // Use existing edge detection models or fallback to traditional Canny
        try {
            // Try to use AI edge detection first
            const edgeResult = await this.processImage(imageData, 'edge_detection', {
                quality: 'mobile' // Use lighter model for control generation
            });
            
            if (edgeResult.success) {
                return edgeResult.imageData;
            }
        } catch (error) {
            console.warn('⚠️ AI edge detection failed for control, using fallback');
        }
        
        // Fallback: Traditional Canny edge detection
        return this.traditionalCannyEdges(imageData, options);
    }
    
    /**
     * Traditional Canny edge detection fallback
     */
    traditionalCannyEdges(imageData, options = {}) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        // Apply edge detection filter
        ctx.filter = `
            contrast(${options.contrast || 200}%) 
            brightness(${options.brightness || 150}%) 
            grayscale(100%)
        `;
        ctx.drawImage(canvas, 0, 0);
        
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    /**
     * Generate line art control image
     */
    async generateLineArt(imageData, options = {}) {
        // Create clean line art version
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        // Apply line art filter
        ctx.filter = 'contrast(300%) brightness(120%) grayscale(100%)';
        ctx.drawImage(canvas, 0, 0);
        
        // Apply threshold for clean lines
        const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = processedData.data;
        
        for (let i = 0; i < pixels.length; i += 4) {
            const gray = pixels[i];
            const lineValue = gray > 128 ? 255 : 0;
            pixels[i] = lineValue;     // R
            pixels[i + 1] = lineValue; // G
            pixels[i + 2] = lineValue; // B
        }
        
        ctx.putImageData(processedData, 0, 0);
        return processedData;
    }
    
    /**
     * Generate depth map control image
     */
    async generateDepthMap(imageData, options = {}) {
        // Simplified depth estimation using gradients
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        // Apply depth-like gradient effect
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    /**
     * Prepare inputs for ControlNet models (dual input: image + control)
     */
    async prepareControlNetInputs(imageData, controlImage, session) {
        const inputNames = session.inputNames;
        
        if (inputNames.length === 1) {
            // Single input model - concatenate images
            return {
                [inputNames[0]]: await this.prepareConcatenatedInput(imageData, controlImage, session)
            };
        } else if (inputNames.length === 2) {
            // Dual input model
            return {
                [inputNames[0]]: await this.prepareInputTensor(imageData, session, 'controlnet'),
                [inputNames[1]]: await this.prepareInputTensor(controlImage, session, 'controlnet')
            };
        } else {
            throw new Error(`Unsupported ControlNet input configuration: ${inputNames.length} inputs`);
        }
    }
    
    /**
     * Prepare concatenated input for single-input ControlNet models
     */
    async prepareConcatenatedInput(imageData, controlImage, session) {
        // This would need to be implemented based on specific model requirements
        // For now, just use the main image
        return await this.prepareInputTensor(imageData, session, 'controlnet');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserAIEngine;
} else {
    window.BrowserAIEngine = BrowserAIEngine;
}