/**
 * AI Processing Module for Interior Design Sketch Conversion
 * Handles both cloud API and local processing options
 */

class AIProcessor {
    constructor() {
        // Use Vercel serverless functions for secure API handling
        this.apiEndpoint = '/api/ai-process';
        this.batchEndpoint = '/api/batch-process';
        this.healthEndpoint = '/api/health';
        this.apiKey = null; // Will be set by user (passed to serverless function)
        this.processingMode = 'cloud'; // 'cloud', 'local', 'hybrid'
        this.localEndpoint = 'http://localhost:7860'; // Local Ollama/ComfyUI endpoint
        
        // Interior design specific models and configurations
        this.models = {
            interiorSketch: {
                name: 'interior-sketch-v1',
                description: 'Optimized for interior design sketches',
                controlnets: ['canny', 'm-lsd', 'hed'],
                lora: 'interior-design-v2'
            },
            architecturalLines: {
                name: 'architectural-lines-v1',
                description: 'Clean architectural line drawings',
                controlnets: ['m-lsd', 'canny'],
                lora: 'architectural-v1'
            },
            conceptSketch: {
                name: 'concept-sketch-v1',
                description: 'Loose conceptual sketches for presentations',
                controlnets: ['hed', 'scribble'],
                lora: 'concept-art-v1'
            }
        };
        
        this.stylePresets = {
            // Interior Design Specific Presets
            'designer-presentation': {
                model: 'interiorSketch',
                prompt: 'professional interior design sketch, clean lines, furniture details, architectural perspective, design presentation style',
                negativePrompt: 'photo, realistic, 3d render, blurry, distorted',
                controlnetWeight: 0.8,
                denoisingStrength: 0.75,
                cfg: 7.5
            },
            'concept-exploration': {
                model: 'conceptSketch',
                prompt: 'loose interior design concept sketch, exploratory drawing, design ideation, hand-drawn style',
                negativePrompt: 'photo, realistic, finished drawing, technical',
                controlnetWeight: 0.6,
                denoisingStrength: 0.85,
                cfg: 6.0
            },
            'technical-documentation': {
                model: 'architecturalLines',
                prompt: 'technical interior drawing, precise lines, architectural documentation, measurement annotations',
                negativePrompt: 'artistic, loose, sketchy, decorative',
                controlnetWeight: 0.9,
                denoisingStrength: 0.6,
                cfg: 8.0
            },
            'artistic-mood': {
                model: 'interiorSketch',
                prompt: 'artistic interior sketch, expressive lines, mood illustration, design atmosphere, hand-drawn character',
                negativePrompt: 'technical, precise, mechanical, sterile',
                controlnetWeight: 0.7,
                denoisingStrength: 0.8,
                cfg: 6.5
            }
        };
        
        this.materialRecognition = {
            wood: { keywords: ['wood', 'timber', 'oak', 'pine', 'mahogany'], lineStyle: 'grain' },
            fabric: { keywords: ['fabric', 'textile', 'cotton', 'linen', 'velvet'], lineStyle: 'soft' },
            metal: { keywords: ['metal', 'steel', 'aluminum', 'brass', 'iron'], lineStyle: 'sharp' },
            glass: { keywords: ['glass', 'window', 'mirror', 'transparent'], lineStyle: 'clean' },
            stone: { keywords: ['stone', 'marble', 'granite', 'concrete'], lineStyle: 'textured' }
        };
    }

    /**
     * Set API configuration
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    setProcessingMode(mode) {
        if (['cloud', 'local', 'hybrid'].includes(mode)) {
            this.processingMode = mode;
        }
    }

    /**
     * Main processing function - routes to appropriate processor
     */
    async processImage(imageData, stylePreset, options = {}) {
        const startTime = Date.now();
        
        try {
            // Check availability and route accordingly
            const processingMethod = await this.determineProcessingMethod(options);
            
            let result;
            if (processingMethod === 'cloud') {
                result = await this.processWithCloudAPI(imageData, stylePreset, options);
            } else if (processingMethod === 'local') {
                result = await this.processWithLocalAPI(imageData, stylePreset, options);
            } else {
                // Fallback to traditional processing
                result = await this.fallbackProcessing(imageData, stylePreset, options);
            }
            
            const processingTime = Date.now() - startTime;
            
            return {
                success: true,
                imageData: result,
                processingTime,
                method: processingMethod,
                metadata: {
                    style: stylePreset,
                    timestamp: new Date().toISOString(),
                    options
                }
            };
            
        } catch (error) {
            console.error('AI processing failed:', error);
            
            // Fallback to traditional processing
            const fallbackResult = await this.fallbackProcessing(imageData, stylePreset, options);
            
            return {
                success: true,
                imageData: fallbackResult,
                processingTime: Date.now() - startTime,
                method: 'fallback',
                warning: 'AI processing unavailable, used traditional method',
                error: error.message
            };
        }
    }

    /**
     * Cloud API processing using Vercel serverless functions
     */
    async processWithCloudAPI(imageData, stylePreset, options) {
        const provider = options.provider || 'runpod';
        
        // Convert image to base64 if needed
        const base64Image = await this.imageToBase64(imageData);
        
        const payload = {
            imageData: base64Image,
            provider: provider,
            stylePreset: stylePreset,
            options: {
                quality: options.quality || 'standard',
                width: Math.min(options.width || 512, 1024),
                height: Math.min(options.height || 512, 1024),
                seed: options.seed || -1
            }
        };

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success && result.result) {
            return result.result.imageData || result.result;
        } else {
            throw new Error(result.error || 'AI processing failed or returned no results');
        }
    }

    /**
     * Local API processing using Ollama/ComfyUI
     */
    async processWithLocalAPI(imageData, stylePreset, options) {
        // Check if local endpoint is available
        try {
            const healthCheck = await fetch(`${this.localEndpoint}/health`, { 
                method: 'GET',
                timeout: 5000 
            });
            
            if (!healthCheck.ok) {
                throw new Error('Local AI service not available');
            }
        } catch (error) {
            throw new Error('Local AI service not reachable');
        }

        const preset = this.stylePresets[stylePreset];
        const base64Image = await this.imageToBase64(imageData);
        
        // ComfyUI workflow payload
        const workflow = this.generateComfyUIWorkflow(base64Image, preset, options);
        
        const response = await fetch(`${this.localEndpoint}/api/v1/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workflow)
        });

        if (!response.ok) {
            throw new Error(`Local API request failed: ${response.status}`);
        }

        const result = await response.json();
        return result.images[0]; // Base64 result
    }

    /**
     * Fallback to traditional canvas-based processing
     */
    async fallbackProcessing(imageData, stylePreset, options) {
        // Use existing handDrawnEffects.js methods as fallback
        const handDrawnEffects = new HandDrawnEffects();
        
        // Map AI presets to traditional effects
        const fallbackMapping = {
            'designer-presentation': 'pen',
            'concept-exploration': 'pencil',
            'technical-documentation': 'technical',
            'artistic-mood': 'charcoal'
        };
        
        const traditionalStyle = fallbackMapping[stylePreset] || 'pencil';
        
        // Apply traditional effects with enhanced parameters for interior design
        const enhancedOptions = {
            ...options,
            preserveFurniture: true,
            enhanceInteriorLines: true,
            materialAwareness: true
        };
        
        return await handDrawnEffects.applyEffect(imageData, traditionalStyle, enhancedOptions);
    }

    /**
     * Determine the best processing method based on availability and preferences
     */
    async determineProcessingMethod(options) {
        if (this.processingMode === 'cloud' && this.apiKey) {
            return 'cloud';
        }
        
        if (this.processingMode === 'local') {
            try {
                const healthCheck = await fetch(`${this.localEndpoint}/health`, { 
                    method: 'GET',
                    timeout: 3000 
                });
                if (healthCheck.ok) return 'local';
            } catch (error) {
                // Local not available, continue to next option
            }
        }
        
        if (this.processingMode === 'hybrid') {
            // Try cloud first for complex images, local for simple ones
            const imageComplexity = this.analyzeImageComplexity(options);
            
            if (imageComplexity > 0.7 && this.apiKey) {
                return 'cloud';
            } else {
                try {
                    const healthCheck = await fetch(`${this.localEndpoint}/health`, { 
                        method: 'GET',
                        timeout: 2000 
                    });
                    if (healthCheck.ok) return 'local';
                } catch (error) {
                    if (this.apiKey) return 'cloud';
                }
            }
        }
        
        return 'fallback';
    }

    /**
     * Analyze image complexity to determine processing method
     */
    analyzeImageComplexity(options) {
        let complexity = 0.5; // Base complexity
        
        // Factor in image size
        const pixelCount = (options.width || 512) * (options.height || 512);
        if (pixelCount > 500000) complexity += 0.2;
        
        // Factor in quality requirements
        if (options.quality === 'high') complexity += 0.3;
        
        // Factor in style complexity
        if (options.stylePreset === 'artistic-mood') complexity += 0.2;
        
        return Math.min(complexity, 1.0);
    }

    /**
     * Generate ComfyUI workflow for local processing
     */
    generateComfyUIWorkflow(imageData, preset, options) {
        return {
            prompt: {
                "1": {
                    "inputs": {
                        "image": imageData,
                        "upload": "image"
                    },
                    "class_type": "LoadImage"
                },
                "2": {
                    "inputs": {
                        "low_threshold": 100,
                        "high_threshold": 200,
                        "image": ["1", 0]
                    },
                    "class_type": "Canny"
                },
                "3": {
                    "inputs": {
                        "text": preset.prompt,
                        "clip": ["4", 1]
                    },
                    "class_type": "CLIPTextEncode"
                },
                "4": {
                    "inputs": {
                        "ckpt_name": `${preset.model}.safetensors`
                    },
                    "class_type": "CheckpointLoaderSimple"
                },
                "5": {
                    "inputs": {
                        "conditioning": ["3", 0],
                        "control_net": ["6", 0],
                        "image": ["2", 0],
                        "strength": preset.controlnetWeight
                    },
                    "class_type": "ControlNetApply"
                },
                "6": {
                    "inputs": {
                        "control_net_name": "control_canny.pth"
                    },
                    "class_type": "ControlNetLoader"
                },
                "7": {
                    "inputs": {
                        "seed": options.seed || Math.floor(Math.random() * 1000000),
                        "steps": options.quality === 'high' ? 50 : 25,
                        "cfg": preset.cfg,
                        "sampler_name": "euler",
                        "scheduler": "normal",
                        "positive": ["5", 0],
                        "negative": ["8", 0],
                        "model": ["4", 0],
                        "latent_image": ["9", 0]
                    },
                    "class_type": "KSampler"
                },
                "8": {
                    "inputs": {
                        "text": preset.negativePrompt,
                        "clip": ["4", 1]
                    },
                    "class_type": "CLIPTextEncode"
                },
                "9": {
                    "inputs": {
                        "width": options.width || 512,
                        "height": options.height || 512,
                        "batch_size": 1
                    },
                    "class_type": "EmptyLatentImage"
                },
                "10": {
                    "inputs": {
                        "samples": ["7", 0],
                        "vae": ["4", 2]
                    },
                    "class_type": "VAEDecode"
                }
            }
        };
    }

    /**
     * Convert image data to base64
     */
    async imageToBase64(imageData) {
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            return imageData.split(',')[1]; // Remove data:image/png;base64, prefix
        }
        
        if (imageData instanceof Canvas || imageData instanceof HTMLCanvasElement) {
            const dataUrl = imageData.toDataURL('image/png');
            return dataUrl.split(',')[1];
        }
        
        if (imageData instanceof ImageData) {
            const canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            return dataUrl.split(',')[1];
        }
        
        throw new Error('Unsupported image data format');
    }

    /**
     * Get available style presets
     */
    getAvailableStyles() {
        return Object.keys(this.stylePresets).map(key => ({
            id: key,
            name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: this.stylePresets[key].model,
            preview: `assets/previews/${key}.jpg` // Preview images to be added
        }));
    }

    /**
     * Get processing status and capabilities
     */
    async getStatus() {
        const status = {
            cloudAvailable: false,
            localAvailable: false,
            preferredMode: this.processingMode,
            models: this.models
        };

        // Check Vercel serverless functions availability
        try {
            const healthCheck = await fetch(this.healthEndpoint, { 
                method: 'GET'
            });
            if (healthCheck.ok) {
                const healthData = await healthCheck.json();
                status.cloudAvailable = healthData.features?.aiProcessing || false;
                status.vercelStatus = healthData;
            }
        } catch (error) {
            console.warn('Failed to check Vercel health:', error);
            status.cloudAvailable = false;
        }

        // Check local availability
        try {
            const healthCheck = await fetch(`${this.localEndpoint}/health`, { 
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            status.localAvailable = healthCheck.ok;
        } catch (error) {
            status.localAvailable = false;
        }

        return status;
    }

    /**
     * Interior design specific material detection
     */
    detectMaterials(imageData) {
        // This would use computer vision to detect materials in the image
        // For now, return mock data - in real implementation would use CV.js or similar
        return {
            wood: { confidence: 0.8, regions: [] },
            fabric: { confidence: 0.6, regions: [] },
            metal: { confidence: 0.4, regions: [] },
            glass: { confidence: 0.7, regions: [] }
        };
    }

    /**
     * Generate smart annotations for interior elements
     */
    generateAnnotations(imageData, materials) {
        const annotations = [];
        
        // Mock annotations - in real implementation would use object detection
        annotations.push({
            type: 'furniture',
            item: 'sofa',
            position: { x: 0.3, y: 0.6 },
            confidence: 0.9,
            material: 'fabric'
        });
        
        annotations.push({
            type: 'lighting',
            item: 'pendant_light',
            position: { x: 0.5, y: 0.2 },
            confidence: 0.8,
            material: 'metal'
        });
        
        return annotations;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIProcessor;
} else {
    window.AIProcessor = AIProcessor;
}