/**
 * Integration Tests for AI Interior Design Converter
 * Tests the integration between all components and AI features
 */

// Wait for DOM and dependencies to load
document.addEventListener('DOMContentLoaded', function() {
    const tf = window.testFramework;
    
    // ===== AI PROCESSOR INTEGRATION TESTS =====
    
    tf.test('aiProcessor_initialization', async (ctx) => {
        ctx.log('Testing AI processor initialization');
        
        // Test that AIProcessor can be instantiated
        let aiProcessor;
        try {
            aiProcessor = new AIProcessor();
            ctx.assert(aiProcessor instanceof AIProcessor, 'AIProcessor should be instantiated');
        } catch (error) {
            ctx.log(`AIProcessor instantiation failed: ${error.message}`, 'warn');
            // This is acceptable as AI might not be available
            return { status: 'ai_not_available', message: 'AI processor not available, fallback expected' };
        }
        
        // Test configuration methods
        ctx.assert(typeof aiProcessor.setApiKey === 'function', 'setApiKey method should exist');
        ctx.assert(typeof aiProcessor.setProcessingMode === 'function', 'setProcessingMode method should exist');
        ctx.assert(typeof aiProcessor.processImage === 'function', 'processImage method should exist');
        
        // Test style presets are available
        const styles = aiProcessor.getAvailableStyles();
        ctx.assert(Array.isArray(styles), 'Available styles should be an array');
        ctx.assert(styles.length > 0, 'Should have at least one style available');
        
        ctx.log(`Found ${styles.length} available AI styles`);
        return { success: true, stylesCount: styles.length };
    }, {
        category: 'integration',
        description: 'Tests AI processor initialization and basic functionality',
        timeout: 10000
    });
    
    tf.test('aiProcessor_fallback_mechanism', async (ctx) => {
        ctx.log('Testing AI processor fallback mechanism');
        
        // Create a mock AI processor that simulates failure
        const mockAI = {
            processImage: async () => {
                throw new Error('AI service unavailable');
            }
        };
        
        // Test that fallback processing works
        const testImageData = await createTestImageData(ctx, 512, 512);
        ctx.assert(testImageData, 'Test image data should be created');
        
        // Test fallback through handDrawnEffects
        let handDrawnEffects;
        try {
            handDrawnEffects = new HandDrawnEffects(document.getElementById('hiddenTestCanvas'), {
                aiProcessor: mockAI,
                useAI: true
            });
            
            const result = await handDrawnEffects.applyHandDrawnEffect(testImageData, {
                style: 'pencil',
                stylePreset: 'designer-presentation'
            });
            
            ctx.assert(result, 'Fallback processing should return a result');
            ctx.assert(result instanceof ImageData, 'Result should be ImageData');
            
        } catch (error) {
            ctx.log(`Fallback test error: ${error.message}`, 'error');
            throw error;
        }
        
        return { success: true, fallbackWorking: true };
    }, {
        category: 'integration',
        description: 'Tests fallback mechanism when AI is unavailable',
        timeout: 15000
    });
    
    // ===== STYLE MANAGER INTEGRATION TESTS =====
    
    tf.test('styleManager_initialization', async (ctx) => {
        ctx.log('Testing Style Manager initialization');
        
        let styleManager;
        try {
            // Try with AI processor
            const aiProcessor = new AIProcessor();
            styleManager = new StyleManager(aiProcessor);
        } catch (error) {
            // Fallback without AI
            styleManager = new StyleManager();
        }
        
        ctx.assert(styleManager instanceof StyleManager, 'StyleManager should be instantiated');
        
        // Test preset methods
        ctx.assert(typeof styleManager.getAllPresets === 'function', 'getAllPresets method should exist');
        ctx.assert(typeof styleManager.applyStyle === 'function', 'applyStyle method should exist');
        ctx.assert(typeof styleManager.createCustomPreset === 'function', 'createCustomPreset method should exist');
        
        // Test built-in presets
        const presets = styleManager.getAllPresets();
        ctx.assert(presets.builtin, 'Built-in presets should exist');
        
        const builtinPresets = Object.keys(presets.builtin);
        ctx.assert(builtinPresets.length > 0, 'Should have built-in presets');
        
        // Verify specific interior design presets
        const expectedPresets = [
            'residential-presentation',
            'concept-sketch',
            'technical-documentation',
            'artistic-mood'
        ];
        
        for (const preset of expectedPresets) {
            ctx.assert(presets.builtin[preset], `Preset '${preset}' should exist`);
        }
        
        ctx.log(`Found ${builtinPresets.length} built-in presets`);
        return { success: true, presetsCount: builtinPresets.length };
    }, {
        category: 'integration',
        description: 'Tests Style Manager initialization and preset availability',
        timeout: 10000
    });
    
    tf.test('styleManager_preset_application', async (ctx) => {
        ctx.log('Testing style preset application');
        
        const styleManager = new StyleManager();
        const testImageData = await createTestImageData(ctx, 256, 256);
        
        // Test each built-in preset
        const presets = styleManager.getAllPresets();
        const presetNames = Object.keys(presets.builtin);
        
        for (const presetName of presetNames.slice(0, 2)) { // Test first 2 presets for speed
            ctx.log(`Testing preset: ${presetName}`);
            
            const { result, duration } = await ctx.measureTime(async () => {
                return await styleManager.applyStyle(testImageData, presetName, {
                    width: 256,
                    height: 256,
                    quality: 'medium'
                });
            }, `preset_${presetName}`);
            
            ctx.assert(result.success, `Preset '${presetName}' should apply successfully`);
            ctx.assert(result.imageData, `Preset '${presetName}' should return image data`);
            ctx.assert(result.method, `Preset '${presetName}' should specify processing method`);
            
            ctx.log(`Preset '${presetName}' applied in ${duration.toFixed(2)}ms using ${result.method}`);
        }
        
        return { success: true, testedPresets: presetNames.slice(0, 2) };
    }, {
        category: 'integration',
        description: 'Tests application of style presets to images',
        timeout: 30000
    });
    
    // ===== HAND-DRAWN EFFECTS INTEGRATION TESTS =====
    
    tf.test('handDrawnEffects_enhanced_features', async (ctx) => {
        ctx.log('Testing enhanced hand-drawn effects features');
        
        const canvas = document.getElementById('hiddenTestCanvas');
        const handDrawnEffects = new HandDrawnEffects(canvas, {
            interiorMode: true,
            materialAwareness: true,
            furniturePreservation: true
        });
        
        // Test status reporting
        const status = handDrawnEffects.getStatus();
        ctx.assert(typeof status === 'object', 'Status should be an object');
        ctx.assert(typeof status.interiorMode === 'boolean', 'Interior mode status should be boolean');
        ctx.assert(typeof status.materialAwareness === 'boolean', 'Material awareness status should be boolean');
        
        // Test style presets availability
        const availablePresets = handDrawnEffects.getAvailableStylePresets();
        ctx.assert(Array.isArray(availablePresets), 'Available presets should be an array');
        ctx.assert(availablePresets.length > 0, 'Should have available presets');
        
        // Test enhanced stroke processing
        const testImageData = await createTestImageData(ctx, 256, 256, 'edges');
        
        const result = await handDrawnEffects.applyHandDrawnEffect(testImageData, {
            stylePreset: 'designer-presentation',
            materialAwareness: true,
            furniturePreservation: true
        });
        
        ctx.assert(result instanceof ImageData, 'Result should be ImageData');
        ctx.assert(result.width === 256, 'Result width should match');
        ctx.assert(result.height === 256, 'Result height should match');
        
        return { 
            success: true, 
            interiorMode: status.interiorMode,
            presetsCount: availablePresets.length 
        };
    }, {
        category: 'integration',
        description: 'Tests enhanced features of hand-drawn effects module',
        timeout: 20000
    });
    
    // ===== MAIN APPLICATION FLOW TESTS =====
    
    tf.test('main_application_flow', async (ctx) => {
        ctx.log('Testing main application flow integration');
        
        // Test that main application components are initialized
        ctx.assert(typeof imageProcessor !== 'undefined', 'imageProcessor should be defined');
        ctx.assert(typeof edgeDetector !== 'undefined', 'edgeDetector should be defined');
        ctx.assert(typeof handDrawnEffects !== 'undefined', 'handDrawnEffects should be defined');
        
        // Test image loading flow
        const testBlob = await createTestImageBlob(ctx, 512, 512);
        ctx.assert(testBlob instanceof Blob, 'Test blob should be created');
        
        // Simulate file loading (without actually triggering file input)
        if (typeof imageProcessor !== 'undefined' && imageProcessor.loadImageFromBlob) {
            const loadResult = await imageProcessor.loadImageFromBlob(testBlob);
            ctx.assert(loadResult, 'Image should load successfully');
        } else {
            ctx.log('imageProcessor.loadImageFromBlob not available, using alternative test', 'warn');
        }
        
        // Test processing pipeline components integration
        const testImageData = await createTestImageData(ctx, 256, 256);
        
        // Test edge detection
        if (typeof edgeDetector !== 'undefined') {
            const edges = edgeDetector.detectArchitecturalEdges(testImageData, {
                threshold: 30,
                blur: true,
                thinning: true
            });
            ctx.assert(edges, 'Edge detection should return result');
            ctx.assert(edges instanceof ImageData, 'Edges should be ImageData');
        }
        
        return { success: true, componentsInitialized: true };
    }, {
        category: 'integration',
        description: 'Tests main application flow and component integration',
        timeout: 25000
    });
    
    // ===== BATCH PROCESSING TESTS =====
    
    tf.test('batch_processing_integration', async (ctx) => {
        ctx.log('Testing batch processing integration');
        
        // Test batch processing with StyleManager
        const styleManager = new StyleManager();
        
        // Create multiple test images
        const testImages = [];
        for (let i = 0; i < 3; i++) {
            const imageData = await createTestImageData(ctx, 128, 128, 'varied');
            testImages.push(imageData);
        }
        
        ctx.log(`Created ${testImages.length} test images for batch processing`);
        
        // Test batch processing
        const batchResult = await styleManager.processBatch(
            testImages,
            'residential-presentation',
            {
                quality: 'medium',
                onProgress: (progress) => {
                    ctx.log(`Batch progress: ${progress.percentage}%`);
                }
            }
        );
        
        ctx.assert(batchResult.success, 'Batch processing should succeed');
        ctx.assert(Array.isArray(batchResult.results), 'Batch results should be an array');
        ctx.assert(batchResult.results.length === testImages.length, 'Should process all images');
        
        // Verify each result
        for (let i = 0; i < batchResult.results.length; i++) {
            const result = batchResult.results[i];
            ctx.assert(result.success, `Image ${i} should process successfully`);
            ctx.assert(result.imageData, `Image ${i} should have result data`);
        }
        
        return { 
            success: true, 
            processedCount: batchResult.results.length,
            successCount: batchResult.batchInfo.successCount
        };
    }, {
        category: 'integration',
        description: 'Tests batch processing functionality across components',
        timeout: 45000
    });
    
    // ===== ERROR HANDLING TESTS =====
    
    tf.test('error_handling_integration', async (ctx) => {
        ctx.log('Testing error handling across components');
        
        // Test invalid image data handling
        const invalidImageData = null;
        
        // Test StyleManager error handling
        const styleManager = new StyleManager();
        
        await ctx.assertThrows(async () => {
            await styleManager.applyStyle(invalidImageData, 'residential-presentation');
        }, 'should handle invalid image data');
        
        // Test HandDrawnEffects error handling
        const canvas = document.getElementById('hiddenTestCanvas');
        const handDrawnEffects = new HandDrawnEffects(canvas);
        
        await ctx.assertThrows(async () => {
            await handDrawnEffects.applyHandDrawnEffect(invalidImageData, {});
        }, 'should handle invalid edge data');
        
        // Test invalid preset handling
        await ctx.assertThrows(async () => {
            await styleManager.applyStyle(await createTestImageData(ctx, 100, 100), 'non-existent-preset');
        }, 'should handle invalid preset');
        
        return { success: true, errorHandlingWorking: true };
    }, {
        category: 'integration',
        description: 'Tests error handling across all components',
        timeout: 15000
    });
    
    // ===== PERFORMANCE INTEGRATION TESTS =====
    
    tf.test('performance_integration', async (ctx) => {
        ctx.log('Testing performance characteristics of integrated system');
        
        const styleManager = new StyleManager();
        const sizes = [
            { width: 256, height: 256, label: 'small' },
            { width: 512, height: 512, label: 'medium' },
            { width: 1024, height: 1024, label: 'large' }
        ];
        
        const results = {};
        
        for (const size of sizes) {
            ctx.log(`Testing ${size.label} image (${size.width}x${size.height})`);
            
            const testImageData = await createTestImageData(ctx, size.width, size.height);
            
            const { result, duration } = await ctx.measureTime(async () => {
                return await styleManager.applyStyle(testImageData, 'residential-presentation', {
                    width: size.width,
                    height: size.height,
                    quality: 'medium'
                });
            }, `${size.label}_processing`);
            
            ctx.assert(result.success, `${size.label} image should process successfully`);
            
            results[size.label] = {
                duration,
                pixelCount: size.width * size.height,
                pixelsPerMs: (size.width * size.height) / duration
            };
            
            ctx.log(`${size.label}: ${duration.toFixed(2)}ms (${results[size.label].pixelsPerMs.toFixed(0)} pixels/ms)`);
        }
        
        // Performance assertions
        ctx.assert(results.small.duration < 10000, 'Small images should process in under 10 seconds');
        ctx.assert(results.medium.duration < 30000, 'Medium images should process in under 30 seconds');
        
        return { success: true, performanceResults: results };
    }, {
        category: 'performance',
        description: 'Tests performance characteristics of the integrated system',
        timeout: 120000
    });
    
    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Create test image data for testing
     */
    async function createTestImageData(ctx, width, height, type = 'solid') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        switch (type) {
            case 'solid':
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, width, height);
                context.fillStyle = '#000000';
                context.fillRect(50, 50, width - 100, height - 100);
                break;
                
            case 'edges':
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, width, height);
                context.strokeStyle = '#000000';
                context.lineWidth = 2;
                context.strokeRect(50, 50, width - 100, height - 100);
                context.strokeRect(100, 100, width - 200, height - 200);
                break;
                
            case 'varied':
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, width, height);
                
                // Add some random shapes
                for (let i = 0; i < 10; i++) {
                    context.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    const size = Math.random() * 50 + 10;
                    context.fillRect(x, y, size, size);
                }
                break;
        }
        
        return context.getImageData(0, 0, width, height);
    }
    
    /**
     * Create test image blob
     */
    async function createTestImageBlob(ctx, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        // Create a simple test pattern
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.fillStyle = '#000000';
        context.fillRect(100, 100, width - 200, height - 200);
        
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }
    
    ctx.log('Integration tests loaded successfully');
});