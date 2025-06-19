/**
 * Test Utilities for AI Interior Design Converter
 * Provides mock data, utilities, and helper functions for testing
 */

class TestUtils {
    constructor() {
        this.mockImages = new Map();
        this.mockResponses = new Map();
        this.performanceBaselines = new Map();
        this.initializeMockData();
    }

    /**
     * Initialize mock data for testing
     */
    initializeMockData() {
        // Mock AI responses
        this.mockResponses.set('ai_success', {
            success: true,
            imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            processingTime: 1500,
            method: 'cloud',
            metadata: {
                style: 'designer-presentation',
                timestamp: new Date().toISOString()
            }
        });

        this.mockResponses.set('ai_failure', {
            success: false,
            error: 'AI service unavailable',
            processingTime: 500,
            method: 'fallback'
        });

        // Performance baselines (in milliseconds)
        this.performanceBaselines.set('small_image_processing', 5000);
        this.performanceBaselines.set('medium_image_processing', 15000);
        this.performanceBaselines.set('large_image_processing', 45000);
        this.performanceBaselines.set('batch_processing_per_image', 8000);
    }

    /**
     * Create a test image with specified characteristics
     */
    async createTestImage(options = {}) {
        const {
            width = 512,
            height = 512,
            type = 'architectural',
            complexity = 'medium',
            format = 'imageData'
        } = options;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Clear with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        switch (type) {
            case 'architectural':
                this.drawArchitecturalElements(ctx, width, height, complexity);
                break;
            case 'interior':
                this.drawInteriorElements(ctx, width, height, complexity);
                break;
            case 'furniture':
                this.drawFurnitureElements(ctx, width, height, complexity);
                break;
            case 'edges':
                this.drawEdgePattern(ctx, width, height, complexity);
                break;
            case 'empty':
                // Just white background
                break;
            default:
                this.drawGenericPattern(ctx, width, height, complexity);
        }

        switch (format) {
            case 'imageData':
                return ctx.getImageData(0, 0, width, height);
            case 'canvas':
                return canvas;
            case 'blob':
                return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            case 'dataUrl':
                return canvas.toDataURL('image/png');
            default:
                return ctx.getImageData(0, 0, width, height);
        }
    }

    /**
     * Draw architectural elements
     */
    drawArchitecturalElements(ctx, width, height, complexity) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Basic room outline
        ctx.strokeRect(50, 50, width - 100, height - 100);

        // Add walls and divisions based on complexity
        if (complexity === 'medium' || complexity === 'high') {
            // Interior walls
            ctx.beginPath();
            ctx.moveTo(width * 0.4, 50);
            ctx.lineTo(width * 0.4, height - 50);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(50, height * 0.6);
            ctx.lineTo(width - 50, height * 0.6);
            ctx.stroke();
        }

        if (complexity === 'high') {
            // Additional architectural details
            ctx.strokeRect(width * 0.1, height * 0.1, width * 0.2, height * 0.3); // Window
            ctx.strokeRect(width * 0.7, height * 0.4, width * 0.15, height * 0.4); // Door
            
            // Add some dimension lines
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(50, 30);
            ctx.lineTo(width - 50, 30);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    /**
     * Draw interior elements
     */
    drawInteriorElements(ctx, width, height, complexity) {
        this.drawArchitecturalElements(ctx, width, height, 'medium');

        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1.5;

        // Furniture outlines
        const furniture = [
            { x: width * 0.2, y: height * 0.3, w: width * 0.15, h: height * 0.2, type: 'sofa' },
            { x: width * 0.6, y: height * 0.2, w: width * 0.1, h: width * 0.1, type: 'table' },
            { x: width * 0.5, y: height * 0.7, w: width * 0.2, h: height * 0.15, type: 'bed' }
        ];

        furniture.forEach(item => {
            ctx.strokeRect(item.x, item.y, item.w, item.h);
            
            if (complexity === 'high') {
                // Add details based on furniture type
                switch (item.type) {
                    case 'sofa':
                        // Sofa cushions
                        ctx.strokeRect(item.x + 5, item.y + 5, item.w - 10, item.h - 10);
                        break;
                    case 'table':
                        // Table legs
                        const legSize = 3;
                        ctx.fillRect(item.x + legSize, item.y + legSize, legSize, legSize);
                        ctx.fillRect(item.x + item.w - legSize * 2, item.y + legSize, legSize, legSize);
                        ctx.fillRect(item.x + legSize, item.y + item.h - legSize * 2, legSize, legSize);
                        ctx.fillRect(item.x + item.w - legSize * 2, item.y + item.h - legSize * 2, legSize, legSize);
                        break;
                    case 'bed':
                        // Bed frame details
                        ctx.strokeRect(item.x + 2, item.y + 2, item.w - 4, item.h - 4);
                        break;
                }
            }
        });
    }

    /**
     * Draw furniture elements
     */
    drawFurnitureElements(ctx, width, height, complexity) {
        const pieces = [
            { x: 50, y: 50, w: 100, h: 60, material: 'wood' },
            { x: 200, y: 100, w: 80, h: 80, material: 'fabric' },
            { x: 350, y: 150, w: 120, h: 40, material: 'metal' },
            { x: 100, y: 250, w: 200, h: 100, material: 'glass' }
        ];

        pieces.forEach(piece => {
            // Set style based on material
            switch (piece.material) {
                case 'wood':
                    ctx.strokeStyle = '#8B4513';
                    ctx.lineWidth = 2;
                    break;
                case 'fabric':
                    ctx.strokeStyle = '#696969';
                    ctx.lineWidth = 1.5;
                    break;
                case 'metal':
                    ctx.strokeStyle = '#2F2F2F';
                    ctx.lineWidth = 1;
                    break;
                case 'glass':
                    ctx.strokeStyle = '#4682B4';
                    ctx.lineWidth = 0.5;
                    break;
            }

            ctx.strokeRect(piece.x, piece.y, piece.w, piece.h);

            if (complexity === 'high') {
                // Add material-specific textures
                this.addMaterialTexture(ctx, piece);
            }
        });
    }

    /**
     * Add material texture patterns
     */
    addMaterialTexture(ctx, piece) {
        ctx.save();
        
        switch (piece.material) {
            case 'wood':
                // Wood grain lines
                ctx.strokeStyle = '#A0522D';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < 5; i++) {
                    const y = piece.y + (piece.h / 6) * (i + 1);
                    ctx.beginPath();
                    ctx.moveTo(piece.x + 5, y);
                    ctx.lineTo(piece.x + piece.w - 5, y);
                    ctx.stroke();
                }
                break;
                
            case 'fabric':
                // Fabric weave pattern
                ctx.strokeStyle = '#A9A9A9';
                ctx.lineWidth = 0.3;
                const spacing = 5;
                for (let x = piece.x; x < piece.x + piece.w; x += spacing) {
                    for (let y = piece.y; y < piece.y + piece.h; y += spacing) {
                        ctx.strokeRect(x, y, spacing/2, spacing/2);
                    }
                }
                break;
                
            case 'metal':
                // Metal reflection lines
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(piece.x, piece.y);
                ctx.lineTo(piece.x + piece.w, piece.y + piece.h);
                ctx.stroke();
                break;
                
            case 'glass':
                // Glass reflection highlights
                ctx.strokeStyle = '#E0E0E0';
                ctx.lineWidth = 1;
                ctx.strokeRect(piece.x + 2, piece.y + 2, piece.w/3, piece.h/3);
                break;
        }
        
        ctx.restore();
    }

    /**
     * Draw edge pattern for edge detection testing
     */
    drawEdgePattern(ctx, width, height, complexity) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // Create various edge types
        const shapes = [
            { type: 'rect', x: 50, y: 50, w: 100, h: 80 },
            { type: 'circle', x: 200, y: 100, r: 40 },
            { type: 'line', x1: 300, y1: 50, x2: 400, y2: 150 },
            { type: 'curve', x: 100, y: 200, w: 200, h: 100 }
        ];

        shapes.forEach(shape => {
            ctx.beginPath();
            switch (shape.type) {
                case 'rect':
                    ctx.rect(shape.x, shape.y, shape.w, shape.h);
                    break;
                case 'circle':
                    ctx.arc(shape.x, shape.y, shape.r, 0, 2 * Math.PI);
                    break;
                case 'line':
                    ctx.moveTo(shape.x1, shape.y1);
                    ctx.lineTo(shape.x2, shape.y2);
                    break;
                case 'curve':
                    ctx.moveTo(shape.x, shape.y);
                    ctx.quadraticCurveTo(shape.x + shape.w/2, shape.y - 50, shape.x + shape.w, shape.y);
                    break;
            }
            ctx.stroke();
        });

        if (complexity === 'high') {
            // Add noise and variations
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * width,
                    Math.random() * height,
                    Math.random() * 5 + 1,
                    0, 2 * Math.PI
                );
                ctx.stroke();
            }
        }
    }

    /**
     * Draw generic test pattern
     */
    drawGenericPattern(ctx, width, height, complexity) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Simple grid pattern
        const spacing = complexity === 'low' ? 50 : complexity === 'medium' ? 30 : 20;
        
        for (let x = 0; x <= width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    /**
     * Create mock AI processor for testing
     */
    createMockAIProcessor(behavior = 'success') {
        const self = this;
        
        return {
            processImage: async function(imageData, stylePreset, options = {}) {
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
                
                switch (behavior) {
                    case 'success':
                        return self.mockResponses.get('ai_success');
                    case 'failure':
                        throw new Error('AI service unavailable');
                    case 'timeout':
                        await new Promise(resolve => setTimeout(resolve, 35000)); // Longer than typical timeout
                        return self.mockResponses.get('ai_success');
                    case 'intermittent':
                        if (Math.random() < 0.3) {
                            throw new Error('Intermittent AI failure');
                        }
                        return self.mockResponses.get('ai_success');
                    default:
                        return self.mockResponses.get('ai_success');
                }
            },
            
            getAvailableStyles: function() {
                return [
                    { id: 'designer-presentation', name: 'Designer Presentation' },
                    { id: 'concept-exploration', name: 'Concept Exploration' },
                    { id: 'technical-documentation', name: 'Technical Documentation' },
                    { id: 'artistic-mood', name: 'Artistic Mood' }
                ];
            },
            
            setApiKey: function(key) {
                this.apiKey = key;
            },
            
            setProcessingMode: function(mode) {
                this.processingMode = mode;
            },
            
            getStatus: async function() {
                return {
                    cloudAvailable: behavior !== 'failure',
                    localAvailable: false,
                    preferredMode: 'cloud'
                };
            }
        };
    }

    /**
     * Create mock style manager for testing
     */
    createMockStyleManager() {
        const self = this;
        
        return {
            getAllPresets: function() {
                return {
                    builtin: {
                        'residential-presentation': {
                            name: 'Residential Presentation',
                            category: 'presentation'
                        },
                        'concept-sketch': {
                            name: 'Concept Sketch',
                            category: 'concept'
                        }
                    },
                    custom: {}
                };
            },
            
            applyStyle: async function(imageData, presetId, options = {}) {
                // Simulate processing
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
                
                return {
                    success: true,
                    imageData: await self.createTestImage({ width: 256, height: 256, type: 'edges' }),
                    method: 'fallback',
                    preset: presetId,
                    processingTime: Math.random() * 2000 + 500
                };
            },
            
            processBatch: async function(images, presetId, options = {}) {
                const results = [];
                
                for (let i = 0; i < images.length; i++) {
                    if (options.onProgress) {
                        options.onProgress({
                            current: i + 1,
                            total: images.length,
                            percentage: Math.round(((i + 1) / images.length) * 100)
                        });
                    }
                    
                    // Simulate processing each image
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    results.push({
                        index: i,
                        success: true,
                        imageData: await self.createTestImage({ width: 128, height: 128 }),
                        processingTime: Math.random() * 1000 + 300
                    });
                }
                
                return {
                    success: true,
                    results,
                    batchInfo: {
                        preset: presetId,
                        imageCount: images.length,
                        successCount: results.length,
                        processingTime: results.reduce((sum, r) => sum + r.processingTime, 0)
                    }
                };
            }
        };
    }

    /**
     * Generate test dataset for various scenarios
     */
    async generateTestDataset(scenario = 'mixed') {
        const dataset = [];
        
        switch (scenario) {
            case 'architectural':
                for (let i = 0; i < 5; i++) {
                    dataset.push(await this.createTestImage({
                        width: 512,
                        height: 512,
                        type: 'architectural',
                        complexity: ['low', 'medium', 'high'][i % 3]
                    }));
                }
                break;
                
            case 'interior':
                for (let i = 0; i < 5; i++) {
                    dataset.push(await this.createTestImage({
                        width: 512,
                        height: 512,
                        type: 'interior',
                        complexity: 'medium'
                    }));
                }
                break;
                
            case 'mixed':
                const types = ['architectural', 'interior', 'furniture', 'edges'];
                for (let i = 0; i < 8; i++) {
                    dataset.push(await this.createTestImage({
                        width: 256 + (i % 3) * 128,
                        height: 256 + (i % 3) * 128,
                        type: types[i % types.length],
                        complexity: ['low', 'medium', 'high'][i % 3]
                    }));
                }
                break;
                
            case 'performance':
                const sizes = [
                    { w: 256, h: 256 },
                    { w: 512, h: 512 },
                    { w: 1024, h: 1024 },
                    { w: 2048, h: 2048 }
                ];
                
                for (const size of sizes) {
                    dataset.push(await this.createTestImage({
                        width: size.w,
                        height: size.h,
                        type: 'architectural',
                        complexity: 'medium'
                    }));
                }
                break;
        }
        
        return dataset;
    }

    /**
     * Validate processing result
     */
    validateProcessingResult(result, expectedProperties = {}) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check basic structure
        if (!result) {
            validation.isValid = false;
            validation.errors.push('Result is null or undefined');
            return validation;
        }

        // Check required properties
        const requiredProps = ['success', 'imageData', 'method', 'processingTime'];
        for (const prop of requiredProps) {
            if (!(prop in result)) {
                validation.isValid = false;
                validation.errors.push(`Missing required property: ${prop}`);
            }
        }

        // Validate image data
        if (result.imageData) {
            if (!(result.imageData instanceof ImageData) && 
                typeof result.imageData !== 'string' && 
                !(result.imageData instanceof HTMLCanvasElement)) {
                validation.warnings.push('Image data format might be invalid');
            }
        }

        // Check processing time
        if (typeof result.processingTime === 'number' && result.processingTime < 0) {
            validation.warnings.push('Processing time is negative');
        }

        // Check against expected properties
        for (const [key, expectedValue] of Object.entries(expectedProperties)) {
            if (result[key] !== expectedValue) {
                validation.warnings.push(`Expected ${key} to be ${expectedValue}, got ${result[key]}`);
            }
        }

        return validation;
    }

    /**
     * Performance benchmark helper
     */
    async benchmarkFunction(fn, iterations = 1, warmup = 0) {
        const results = [];
        
        // Warmup runs
        for (let i = 0; i < warmup; i++) {
            await fn();
        }
        
        // Actual benchmark runs
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            await fn();
            const endTime = performance.now();
            results.push(endTime - startTime);
        }
        
        return {
            iterations,
            times: results,
            average: results.reduce((sum, time) => sum + time, 0) / results.length,
            min: Math.min(...results),
            max: Math.max(...results),
            median: this.calculateMedian(results)
        };
    }

    /**
     * Calculate median of array
     */
    calculateMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }

    /**
     * Check if performance meets baseline
     */
    checkPerformanceBaseline(operation, actualTime) {
        const baseline = this.performanceBaselines.get(operation);
        if (!baseline) {
            return { 
                passes: true, 
                message: 'No baseline defined for this operation',
                baseline: null,
                actual: actualTime
            };
        }
        
        const passes = actualTime <= baseline;
        const ratio = actualTime / baseline;
        
        return {
            passes,
            message: passes 
                ? `Performance within baseline (${ratio.toFixed(2)}x)`
                : `Performance exceeds baseline (${ratio.toFixed(2)}x)`,
            baseline,
            actual: actualTime,
            ratio
        };
    }

    /**
     * Generate error scenarios for testing
     */
    generateErrorScenarios() {
        return {
            invalidImageData: [
                null,
                undefined,
                {},
                'invalid',
                new ArrayBuffer(0)
            ],
            
            invalidPresets: [
                'non-existent-preset',
                '',
                null,
                undefined,
                123
            ],
            
            invalidOptions: [
                { width: -100, height: 200 },
                { width: 'invalid', height: 'invalid' },
                { quality: 'invalid' },
                { timeout: -1000 }
            ],
            
            networkErrors: [
                'Connection timeout',
                'Service unavailable',
                'Rate limit exceeded',
                'Invalid API key',
                'Quota exceeded'
            ]
        };
    }

    /**
     * Simulate network conditions
     */
    async simulateNetworkConditions(condition = 'normal') {
        const delays = {
            fast: 50,
            normal: 200,
            slow: 1000,
            unstable: () => Math.random() * 2000 + 100,
            timeout: 35000
        };
        
        const delay = typeof delays[condition] === 'function' 
            ? delays[condition]() 
            : delays[condition] || delays.normal;
            
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Memory usage tracking helper
     */
    trackMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
        }
        return null;
    }

    /**
     * Mobile device simulation
     */
    simulateMobileDevice(deviceType = 'mobile') {
        const viewports = {
            mobile: { width: 375, height: 667 },
            tablet: { width: 768, height: 1024 },
            desktop: { width: 1200, height: 800 }
        };
        
        const viewport = viewports[deviceType] || viewports.mobile;
        
        // Set viewport meta tag
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        viewportMeta.content = `width=${viewport.width}, initial-scale=1.0`;
        
        // Simulate touch events if mobile
        if (deviceType === 'mobile') {
            // Add touch event simulation
            const addTouchSupport = () => {
                document.documentElement.classList.add('touch-device');
            };
            
            addTouchSupport();
        }
        
        return viewport;
    }
}

// Create global instance
window.testUtils = new TestUtils();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestUtils;
} else {
    window.TestUtils = TestUtils;
}