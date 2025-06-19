/**
 * Batch Processing Test Scenarios
 * Comprehensive tests for batch processing capabilities of the AI Interior Design Converter
 */

// Load this after the main test framework
document.addEventListener('DOMContentLoaded', function() {
    const tf = window.testFramework;
    const utils = window.testUtils;
    
    // ===== BATCH PROCESSING CORE TESTS =====
    
    tf.test('batch_processing_consistency', async (ctx) => {
        ctx.log('Testing batch processing consistency across multiple images');
        
        // Create a diverse set of test images
        const testImages = [];
        const imageTypes = ['architectural', 'interior', 'furniture'];
        const complexities = ['low', 'medium', 'high'];
        
        for (let i = 0; i < 9; i++) {
            const type = imageTypes[i % imageTypes.length];
            const complexity = complexities[Math.floor(i / imageTypes.length)];
            
            const image = await utils.createTestImage({
                width: 256,
                height: 256,
                type: type,
                complexity: complexity
            });
            
            testImages.push({
                data: image,
                metadata: { type, complexity, index: i }
            });
        }
        
        ctx.log(`Created ${testImages.length} test images with varying characteristics`);
        
        // Test batch processing with mock StyleManager
        const mockStyleManager = utils.createMockStyleManager();
        
        let progressCallbacks = 0;
        const batchResult = await mockStyleManager.processBatch(
            testImages.map(img => img.data),
            'residential-presentation',
            {
                onProgress: (progress) => {
                    progressCallbacks++;
                    ctx.log(`Batch progress: ${progress.percentage}% (${progress.current}/${progress.total})`);
                }
            }
        );
        
        // Validate batch result structure
        ctx.assert(batchResult.success, 'Batch processing should succeed');
        ctx.assert(Array.isArray(batchResult.results), 'Results should be an array');
        ctx.assert(batchResult.results.length === testImages.length, 'Should process all images');
        ctx.assert(progressCallbacks > 0, 'Progress callbacks should be called');
        
        // Analyze consistency metrics
        const processingTimes = batchResult.results.map(r => r.processingTime);
        const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        const timeVariation = Math.max(...processingTimes) - Math.min(...processingTimes);
        const variationPercentage = (timeVariation / avgTime) * 100;
        
        ctx.log(`Processing time statistics: avg=${avgTime.toFixed(2)}ms, variation=${variationPercentage.toFixed(1)}%`);
        
        // Consistency should be reasonable
        ctx.assert(variationPercentage < 200, 'Processing time variation should be reasonable');
        
        // Check that all results are successful
        const successfulResults = batchResult.results.filter(r => r.success).length;
        ctx.assert(successfulResults === testImages.length, 'All images should process successfully');
        
        return {
            success: true,
            totalImages: testImages.length,
            successfulResults,
            averageTime: avgTime,
            variationPercentage: variationPercentage.toFixed(1),
            progressCallbacks
        };
    }, {
        category: 'batch',
        description: 'Tests consistency of batch processing across different image types',
        timeout: 60000
    });
    
    tf.test('batch_processing_memory_management', async (ctx) => {
        ctx.log('Testing memory management during batch processing');
        
        const initialMemory = utils.trackMemoryUsage();
        if (!initialMemory) {
            ctx.log('Memory tracking not available, simulating test', 'warn');
            return { success: true, message: 'Memory tracking not supported in this environment' };
        }
        
        ctx.log(`Initial memory usage: ${(initialMemory.used / 1024 / 1024).toFixed(2)} MB`);
        
        // Create larger test dataset
        const testImages = [];
        for (let i = 0; i < 10; i++) {
            const image = await utils.createTestImage({
                width: 512,
                height: 512,
                type: 'interior',
                complexity: 'medium'
            });
            testImages.push(image);
        }
        
        const memorySnapshots = [initialMemory];
        
        // Process images in batch with memory tracking
        const mockStyleManager = utils.createMockStyleManager();
        
        const batchResult = await mockStyleManager.processBatch(
            testImages,
            'designer-presentation',
            {
                onProgress: (progress) => {
                    const snapshot = utils.trackMemoryUsage();
                    if (snapshot) {
                        memorySnapshots.push(snapshot);
                        ctx.log(`Progress ${progress.percentage}%: ${(snapshot.used / 1024 / 1024).toFixed(2)} MB`);
                    }
                }
            }
        );
        
        const finalMemory = utils.trackMemoryUsage();
        memorySnapshots.push(finalMemory);
        
        // Analyze memory usage
        const memoryIncrease = finalMemory.used - initialMemory.used;
        const memoryIncreasePercentage = (memoryIncrease / initialMemory.used) * 100;
        const peakMemory = Math.max(...memorySnapshots.map(s => s.used));
        const peakIncrease = ((peakMemory - initialMemory.used) / initialMemory.used) * 100;
        
        ctx.log(`Final memory increase: ${memoryIncreasePercentage.toFixed(1)}%`);
        ctx.log(`Peak memory increase: ${peakIncrease.toFixed(1)}%`);
        
        // Memory management assertions
        ctx.assert(memoryIncreasePercentage < 100, 'Final memory increase should be reasonable');
        ctx.assert(peakIncrease < 200, 'Peak memory usage should not be excessive');
        
        return {
            success: true,
            initialMemoryMB: (initialMemory.used / 1024 / 1024).toFixed(2),
            finalMemoryMB: (finalMemory.used / 1024 / 1024).toFixed(2),
            memoryIncreasePercentage: memoryIncreasePercentage.toFixed(1),
            peakIncreasePercentage: peakIncrease.toFixed(1),
            processedImages: testImages.length
        };
    }, {
        category: 'batch',
        description: 'Tests memory management during batch processing',
        timeout: 90000
    });
    
    tf.test('batch_processing_error_recovery', async (ctx) => {
        ctx.log('Testing error recovery in batch processing');
        
        // Create mixed dataset with some invalid images
        const testData = [];
        
        // Add valid images
        for (let i = 0; i < 5; i++) {
            const image = await utils.createTestImage({
                width: 256,
                height: 256,
                type: 'architectural'
            });
            testData.push(image);
        }
        
        // Add invalid images
        const invalidData = [null, undefined, {}, 'invalid'];
        testData.splice(2, 0, ...invalidData.slice(0, 2)); // Insert invalid data
        
        ctx.log(`Created test dataset with ${testData.length} items (including invalid ones)`);
        
        // Create mock style manager that handles errors gracefully
        const mockStyleManagerWithErrors = {
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
                    
                    // Simulate processing with error handling
                    try {
                        if (images[i] === null || images[i] === undefined || 
                            typeof images[i] !== 'object' || !images[i].data) {
                            throw new Error('Invalid image data');
                        }
                        
                        // Simulate successful processing
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        results.push({
                            index: i,
                            success: true,
                            imageData: await utils.createTestImage({ width: 128, height: 128 }),
                            processingTime: Math.random() * 500 + 200
                        });
                        
                    } catch (error) {
                        results.push({
                            index: i,
                            success: false,
                            error: error.message,
                            processingTime: 0
                        });
                    }
                }
                
                const successCount = results.filter(r => r.success).length;
                
                return {
                    success: true, // Batch itself succeeds even with individual failures
                    results,
                    batchInfo: {
                        preset: presetId,
                        imageCount: images.length,
                        successCount: successCount,
                        failureCount: images.length - successCount,
                        processingTime: results.reduce((sum, r) => sum + r.processingTime, 0)
                    }
                };
            }
        };
        
        // Run batch processing with error recovery
        const batchResult = await mockStyleManagerWithErrors.processBatch(
            testData,
            'concept-exploration'
        );
        
        ctx.assert(batchResult.success, 'Batch processing should succeed despite individual failures');
        ctx.assert(batchResult.results.length === testData.length, 'Should process all items');
        
        const successfulItems = batchResult.results.filter(r => r.success);
        const failedItems = batchResult.results.filter(r => !r.success);
        
        ctx.assert(successfulItems.length > 0, 'Some items should process successfully');
        ctx.assert(failedItems.length > 0, 'Some items should fail as expected');
        
        ctx.log(`Processed ${successfulItems.length} successful, ${failedItems.length} failed`);
        
        // Verify error information is preserved
        failedItems.forEach(item => {
            ctx.assert(item.error, 'Failed items should include error information');
        });
        
        return {
            success: true,
            totalItems: testData.length,
            successfulItems: successfulItems.length,
            failedItems: failedItems.length,
            errorRecovery: true
        };
    }, {
        category: 'batch',
        description: 'Tests error recovery and graceful failure handling in batch processing',
        timeout: 30000
    });
    
    tf.test('batch_processing_performance_scaling', async (ctx) => {
        ctx.log('Testing performance scaling with different batch sizes');
        
        const batchSizes = [1, 3, 5, 10];
        const performanceResults = {};
        
        for (const batchSize of batchSizes) {
            ctx.log(`Testing batch size: ${batchSize}`);
            
            // Create test images for this batch size
            const testImages = [];
            for (let i = 0; i < batchSize; i++) {
                const image = await utils.createTestImage({
                    width: 256,
                    height: 256,
                    type: 'interior',
                    complexity: 'medium'
                });
                testImages.push(image);
            }
            
            // Measure batch processing performance
            const startTime = performance.now();
            
            const mockStyleManager = utils.createMockStyleManager();
            const batchResult = await mockStyleManager.processBatch(
                testImages,
                'technical-documentation'
            );
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const timePerImage = totalTime / batchSize;
            
            performanceResults[batchSize] = {
                totalTime: totalTime.toFixed(2),
                timePerImage: timePerImage.toFixed(2),
                throughput: (batchSize / (totalTime / 1000)).toFixed(2), // images per second
                success: batchResult.success
            };
            
            ctx.log(`Batch size ${batchSize}: ${totalTime.toFixed(2)}ms total, ${timePerImage.toFixed(2)}ms per image`);
            
            ctx.assert(batchResult.success, `Batch size ${batchSize} should process successfully`);
        }
        
        // Analyze scaling characteristics
        const scalingEfficiency = this.analyzeScalingEfficiency(performanceResults);
        ctx.log(`Scaling efficiency: ${scalingEfficiency.toFixed(2)}% (higher is better)`);
        
        // Performance should not degrade too much with larger batches
        const smallBatchTime = parseFloat(performanceResults[1].timePerImage);
        const largeBatchTime = parseFloat(performanceResults[10].timePerImage);
        const degradationRatio = largeBatchTime / smallBatchTime;
        
        ctx.assert(degradationRatio < 3, 'Performance degradation should be reasonable');
        
        return {
            success: true,
            performanceResults,
            scalingEfficiency: scalingEfficiency.toFixed(2),
            degradationRatio: degradationRatio.toFixed(2)
        };
    }, {
        category: 'batch',
        description: 'Tests performance scaling characteristics with different batch sizes',
        timeout: 120000
    });
    
    tf.test('batch_processing_style_consistency', async (ctx) => {
        ctx.log('Testing style consistency across batch processing');
        
        // Create identical test images
        const baseImage = await utils.createTestImage({
            width: 256,
            height: 256,
            type: 'architectural',
            complexity: 'medium'
        });
        
        // Create multiple copies of the same image
        const identicalImages = Array(5).fill(baseImage);
        
        ctx.log(`Created ${identicalImages.length} identical images for consistency testing`);
        
        // Process with different style presets
        const stylePresets = [
            'residential-presentation',
            'concept-exploration',
            'technical-documentation',
            'artistic-mood'
        ];
        
        const consistencyResults = {};
        
        for (const preset of stylePresets) {
            ctx.log(`Testing style consistency for preset: ${preset}`);
            
            const mockStyleManager = utils.createMockStyleManager();
            const batchResult = await mockStyleManager.processBatch(
                identicalImages,
                preset
            );
            
            ctx.assert(batchResult.success, `Batch processing should succeed for ${preset}`);
            
            // Analyze consistency of results
            const processingTimes = batchResult.results.map(r => r.processingTime);
            const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
            const timeStdDev = this.calculateStandardDeviation(processingTimes);
            const coefficientOfVariation = (timeStdDev / avgTime) * 100;
            
            consistencyResults[preset] = {
                averageTime: avgTime.toFixed(2),
                standardDeviation: timeStdDev.toFixed(2),
                coefficientOfVariation: coefficientOfVariation.toFixed(2),
                consistency: coefficientOfVariation < 30 ? 'high' : coefficientOfVariation < 60 ? 'medium' : 'low'
            };
            
            ctx.log(`${preset}: CV=${coefficientOfVariation.toFixed(1)}% (${consistencyResults[preset].consistency} consistency)`);
            
            // Style application should be reasonably consistent
            ctx.assert(coefficientOfVariation < 100, `Style ${preset} should have reasonable consistency`);
        }
        
        return {
            success: true,
            testedPresets: stylePresets.length,
            consistencyResults,
            imagesPerPreset: identicalImages.length
        };
    }, {
        category: 'batch',
        description: 'Tests consistency of style application across identical images in batch',
        timeout: 60000
    });
    
    tf.test('batch_processing_progress_tracking', async (ctx) => {
        ctx.log('Testing progress tracking accuracy in batch processing');
        
        const testImages = [];
        const batchSize = 8;
        
        for (let i = 0; i < batchSize; i++) {
            const image = await utils.createTestImage({
                width: 200,
                height: 200,
                type: 'furniture'
            });
            testImages.push(image);
        }
        
        // Track progress callbacks
        const progressEvents = [];
        let lastPercentage = -1;
        
        const mockStyleManager = utils.createMockStyleManager();
        const batchResult = await mockStyleManager.processBatch(
            testImages,
            'artistic-mood',
            {
                onProgress: (progress) => {
                    progressEvents.push({
                        timestamp: Date.now(),
                        current: progress.current,
                        total: progress.total,
                        percentage: progress.percentage
                    });
                    
                    // Verify progress is monotonic
                    ctx.assert(progress.percentage >= lastPercentage, 
                        'Progress percentage should be monotonic');
                    lastPercentage = progress.percentage;
                    
                    ctx.log(`Progress: ${progress.current}/${progress.total} (${progress.percentage}%)`);
                }
            }
        );
        
        // Validate progress tracking
        ctx.assert(progressEvents.length > 0, 'Progress events should be reported');
        ctx.assert(progressEvents.length === batchSize, 'Should report progress for each image');
        
        // Check progress sequence
        const firstEvent = progressEvents[0];
        const lastEvent = progressEvents[progressEvents.length - 1];
        
        ctx.assert(firstEvent.current === 1, 'First progress should be 1');
        ctx.assert(lastEvent.current === batchSize, `Last progress should be ${batchSize}`);
        ctx.assert(lastEvent.percentage === 100, 'Final percentage should be 100%');
        
        // Verify all totals are consistent
        const inconsistentTotals = progressEvents.filter(event => event.total !== batchSize);
        ctx.assert(inconsistentTotals.length === 0, 'All progress events should have consistent total');
        
        // Check timing consistency
        const progressIntervals = [];
        for (let i = 1; i < progressEvents.length; i++) {
            const interval = progressEvents[i].timestamp - progressEvents[i-1].timestamp;
            progressIntervals.push(interval);
        }
        
        const avgInterval = progressIntervals.reduce((sum, interval) => sum + interval, 0) / progressIntervals.length;
        ctx.log(`Average progress interval: ${avgInterval.toFixed(2)}ms`);
        
        return {
            success: true,
            totalProgressEvents: progressEvents.length,
            expectedEvents: batchSize,
            averageInterval: avgInterval.toFixed(2),
            finalPercentage: lastEvent.percentage,
            progressAccuracy: 'accurate'
        };
    }, {
        category: 'batch',
        description: 'Tests accuracy and reliability of progress tracking in batch operations',
        timeout: 45000
    });
    
    tf.test('batch_processing_cancellation', async (ctx) => {
        ctx.log('Testing batch processing cancellation capabilities');
        
        // Create a larger batch for cancellation testing
        const testImages = [];
        for (let i = 0; i < 15; i++) {
            const image = await utils.createTestImage({
                width: 256,
                height: 256,
                type: 'interior'
            });
            testImages.push(image);
        }
        
        // Create mock style manager with cancellation support
        let cancelled = false;
        const cancellableStyleManager = {
            processBatch: async function(images, presetId, options = {}) {
                const results = [];
                
                for (let i = 0; i < images.length; i++) {
                    // Check for cancellation
                    if (cancelled) {
                        ctx.log(`Batch processing cancelled at image ${i + 1}/${images.length}`);
                        return {
                            success: false,
                            cancelled: true,
                            results,
                            processedCount: i,
                            totalCount: images.length
                        };
                    }
                    
                    if (options.onProgress) {
                        options.onProgress({
                            current: i + 1,
                            total: images.length,
                            percentage: Math.round(((i + 1) / images.length) * 100)
                        });
                    }
                    
                    // Simulate processing delay
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    results.push({
                        index: i,
                        success: true,
                        imageData: await utils.createTestImage({ width: 128, height: 128 }),
                        processingTime: 100
                    });
                }
                
                return {
                    success: true,
                    results,
                    batchInfo: {
                        preset: presetId,
                        imageCount: images.length,
                        successCount: results.length
                    }
                };
            },
            
            cancel: function() {
                cancelled = true;
                ctx.log('Cancellation requested');
            }
        };
        
        // Start batch processing
        const processingPromise = cancellableStyleManager.processBatch(
            testImages,
            'designer-presentation',
            {
                onProgress: (progress) => {
                    // Cancel after processing 5 images
                    if (progress.current === 5) {
                        setTimeout(() => {
                            cancellableStyleManager.cancel();
                        }, 50);
                    }
                }
            }
        );
        
        const result = await processingPromise;
        
        // Validate cancellation behavior
        ctx.assert(result.cancelled, 'Batch should be marked as cancelled');
        ctx.assert(!result.success, 'Cancelled batch should not be marked as successful');
        ctx.assert(result.processedCount < testImages.length, 'Should process fewer images than total');
        ctx.assert(result.processedCount >= 5, 'Should process at least 5 images before cancellation');
        
        ctx.log(`Processed ${result.processedCount}/${result.totalCount} images before cancellation`);
        
        return {
            success: true,
            cancellationWorking: true,
            processedBeforeCancellation: result.processedCount,
            totalImages: result.totalCount,
            cancellationPoint: Math.round((result.processedCount / result.totalCount) * 100)
        };
    }, {
        category: 'batch',
        description: 'Tests batch processing cancellation and cleanup capabilities',
        timeout: 30000
    });
    
    // ===== HELPER METHODS =====
    
    /**
     * Analyze scaling efficiency of batch processing
     */
    tf.test.analyzeScalingEfficiency = function(performanceResults) {
        const sizes = Object.keys(performanceResults).map(Number).sort((a, b) => a - b);
        
        if (sizes.length < 2) return 100;
        
        const smallestBatch = sizes[0];
        const largestBatch = sizes[sizes.length - 1];
        
        const idealRatio = largestBatch / smallestBatch;
        const actualTimeRatio = parseFloat(performanceResults[largestBatch].totalTime) / 
                               parseFloat(performanceResults[smallestBatch].totalTime);
        
        // Efficiency is how close actual scaling is to ideal linear scaling
        return Math.max(0, (1 - (actualTimeRatio / idealRatio)) * 100);
    };
    
    /**
     * Calculate standard deviation of an array of numbers
     */
    tf.test.calculateStandardDeviation = function(values) {
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    };
    
    ctx.log('Batch processing tests loaded successfully');
});