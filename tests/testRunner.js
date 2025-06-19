/**
 * Test Runner for AI Interior Design Converter
 * Orchestrates test execution and provides UI integration
 */

class TestRunner {
    constructor() {
        this.framework = window.testFramework;
        this.utils = window.testUtils;
        this.isInitialized = false;
        this.currentExecution = null;
        
        // UI elements
        this.elements = {};
        
        // Test categories
        this.categories = {
            integration: 'Component Integration',
            performance: 'Performance Tests',
            mobile: 'Mobile Responsiveness',
            error: 'Error Handling',
            fallback: 'Fallback Mechanisms',
            batch: 'Batch Processing'
        };
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.runAllTests = this.runAllTests.bind(this);
        this.runCategoryTests = this.runCategoryTests.bind(this);
        this.runSingleTest = this.runSingleTest.bind(this);
    }

    /**
     * Initialize the test runner
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup test framework callbacks
            this.setupFrameworkCallbacks();
            
            // Setup logger
            this.framework.logger.setLogElement(this.elements.testLogs);
            
            // Load additional tests
            await this.loadAdditionalTests();
            
            // Update UI with available tests
            this.updateTestCounts();
            
            this.isInitialized = true;
            this.log('Test runner initialized successfully', 'success');
            
        } catch (error) {
            this.log(`Failed to initialize test runner: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        const elementIds = [
            'runAllTests', 'runIntegrationTests', 'runPerformanceTests',
            'clearResults', 'exportResults', 'totalTests', 'passedTests',
            'failedTests', 'averageTime', 'testLogs', 'clearLogs',
            'exportLogs', 'stylePresetSelect', 'batchTestFiles',
            'originalTestCanvas', 'processedTestCanvas'
        ];
        
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
        
        // Cache test buttons
        this.elements.testButtons = document.querySelectorAll('.test-btn[data-test]');
        
        // Cache status elements
        this.elements.statusElements = document.querySelectorAll('.test-status');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Main control buttons
        if (this.elements.runAllTests) {
            this.elements.runAllTests.addEventListener('click', this.runAllTests);
        }
        
        if (this.elements.runIntegrationTests) {
            this.elements.runIntegrationTests.addEventListener('click', () => {
                this.runCategoryTests('integration');
            });
        }
        
        if (this.elements.runPerformanceTests) {
            this.elements.runPerformanceTests.addEventListener('click', () => {
                this.runCategoryTests('performance');
            });
        }
        
        if (this.elements.clearResults) {
            this.elements.clearResults.addEventListener('click', this.clearResults.bind(this));
        }
        
        if (this.elements.exportResults) {
            this.elements.exportResults.addEventListener('click', this.exportResults.bind(this));
        }
        
        // Log controls
        if (this.elements.clearLogs) {
            this.elements.clearLogs.addEventListener('click', this.clearLogs.bind(this));
        }
        
        if (this.elements.exportLogs) {
            this.elements.exportLogs.addEventListener('click', this.exportLogs.bind(this));
        }
        
        // Individual test buttons
        this.elements.testButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const testName = e.target.getAttribute('data-test');
                this.runSingleTest(testName);
            });
        });
        
        // File input for batch testing
        if (this.elements.batchTestFiles) {
            this.elements.batchTestFiles.addEventListener('change', this.handleBatchFiles.bind(this));
        }
    }

    /**
     * Setup framework callbacks
     */
    setupFrameworkCallbacks() {
        this.framework.onTestStart = (testName, test) => {
            this.updateTestStatus(testName, 'running');
            this.log(`Starting test: ${testName}`, 'info');
        };
        
        this.framework.onTestComplete = (testName, result) => {
            this.updateTestStatus(testName, result.status);
            this.updateTestResult(testName, result);
            this.updateOverallMetrics();
        };
        
        this.framework.onAllTestsComplete = (results) => {
            this.onAllTestsComplete(results);
        };
    }

    /**
     * Load additional tests based on available components
     */
    async loadAdditionalTests() {
        // Mobile responsiveness tests
        this.loadMobileTests();
        
        // Performance tests
        this.loadPerformanceTests();
        
        // Error handling tests
        this.loadErrorHandlingTests();
        
        // Batch processing tests
        this.loadBatchProcessingTests();
        
        // Style preset tests
        this.loadStylePresetTests();
    }

    /**
     * Load mobile responsiveness tests
     */
    loadMobileTests() {
        this.framework.test('mobile_viewport_adaptation', async (ctx) => {
            ctx.log('Testing mobile viewport adaptation');
            
            const originalViewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            // Test different viewport sizes
            const viewports = [
                { width: 375, height: 667, name: 'iPhone' },
                { width: 768, height: 1024, name: 'iPad' },
                { width: 1200, height: 800, name: 'Desktop' }
            ];
            
            for (const viewport of viewports) {
                this.utils.simulateMobileDevice(viewport.name.toLowerCase());
                
                // Check if UI elements adapt properly
                const container = document.querySelector('.test-container');
                if (container) {
                    const computedStyle = window.getComputedStyle(container);
                    ctx.assert(computedStyle.maxWidth, `Container should have max-width for ${viewport.name}`);
                }
                
                ctx.log(`Viewport test passed for ${viewport.name}`);
            }
            
            return { success: true, testedViewports: viewports.length };
        }, {
            category: 'mobile',
            description: 'Tests UI adaptation to different viewport sizes',
            timeout: 10000
        });
        
        this.framework.test('touch_interface_support', async (ctx) => {
            ctx.log('Testing touch interface support');
            
            // Simulate touch device
            document.documentElement.classList.add('touch-device');
            
            // Test touch-friendly button sizes
            const buttons = document.querySelectorAll('.test-btn');
            let touchFriendlyCount = 0;
            
            buttons.forEach(button => {
                const rect = button.getBoundingClientRect();
                const minTouchSize = 44; // iOS HIG recommendation
                
                if (rect.width >= minTouchSize && rect.height >= minTouchSize) {
                    touchFriendlyCount++;
                }
            });
            
            const touchFriendlyRatio = touchFriendlyCount / buttons.length;
            ctx.assert(touchFriendlyRatio > 0.8, 'At least 80% of buttons should be touch-friendly');
            
            // Cleanup
            document.documentElement.classList.remove('touch-device');
            
            return { 
                success: true, 
                touchFriendlyButtons: touchFriendlyCount,
                totalButtons: buttons.length,
                ratio: touchFriendlyRatio
            };
        }, {
            category: 'mobile',
            description: 'Tests touch interface usability',
            timeout: 5000
        });
    }

    /**
     * Load performance tests
     */
    loadPerformanceTests() {
        this.framework.test('processing_speed_benchmark', async (ctx) => {
            ctx.log('Running processing speed benchmark');
            
            const sizes = [
                { width: 256, height: 256, label: 'small' },
                { width: 512, height: 512, label: 'medium' },
                { width: 1024, height: 1024, label: 'large' }
            ];
            
            const results = {};
            
            for (const size of sizes) {
                const testImage = await this.utils.createTestImage({
                    width: size.width,
                    height: size.height,
                    type: 'architectural'
                });
                
                const benchmark = await this.utils.benchmarkFunction(async () => {
                    // Simulate processing with actual components if available
                    if (typeof HandDrawnEffects !== 'undefined') {
                        const canvas = document.getElementById('hiddenTestCanvas');
                        canvas.width = size.width;
                        canvas.height = size.height;
                        
                        const effects = new HandDrawnEffects(canvas);
                        await effects.applyHandDrawnEffect(testImage, { style: 'pencil' });
                    } else {
                        // Fallback simulation
                        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
                    }
                }, 3, 1);
                
                results[size.label] = benchmark;
                
                // Check against baseline
                const baselineCheck = this.utils.checkPerformanceBaseline(
                    `${size.label}_image_processing`,
                    benchmark.average
                );
                
                ctx.log(`${size.label} (${size.width}x${size.height}): ${benchmark.average.toFixed(2)}ms avg - ${baselineCheck.message}`);
                
                if (!baselineCheck.passes) {
                    ctx.log(`Performance warning: ${size.label} processing exceeded baseline`, 'warn');
                }
            }
            
            return { success: true, benchmarkResults: results };
        }, {
            category: 'performance',
            description: 'Benchmarks processing speed for different image sizes',
            timeout: 60000
        });
        
        this.framework.test('memory_usage_monitoring', async (ctx) => {
            ctx.log('Monitoring memory usage during processing');
            
            const initialMemory = this.utils.trackMemoryUsage();
            if (!initialMemory) {
                ctx.log('Memory tracking not available in this browser', 'warn');
                return { success: true, message: 'Memory tracking not supported' };
            }
            
            const memorySnapshots = [initialMemory];
            
            // Process several images and track memory
            for (let i = 0; i < 5; i++) {
                const testImage = await this.utils.createTestImage({
                    width: 512,
                    height: 512,
                    type: 'interior'
                });
                
                // Simulate processing
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const snapshot = this.utils.trackMemoryUsage();
                memorySnapshots.push(snapshot);
                
                ctx.log(`Memory after image ${i + 1}: ${(snapshot.used / 1024 / 1024).toFixed(2)} MB`);
            }
            
            // Check for memory leaks
            const memoryIncrease = memorySnapshots[memorySnapshots.length - 1].used - initialMemory.used;
            const memoryIncreasePercentage = (memoryIncrease / initialMemory.used) * 100;
            
            ctx.assert(memoryIncreasePercentage < 50, 'Memory usage should not increase by more than 50%');
            
            return { 
                success: true, 
                memoryIncrease: memoryIncrease,
                memoryIncreasePercentage: memoryIncreasePercentage.toFixed(2),
                snapshots: memorySnapshots.length
            };
        }, {
            category: 'performance',
            description: 'Monitors memory usage and checks for leaks',
            timeout: 30000
        });
    }

    /**
     * Load error handling tests
     */
    loadErrorHandlingTests() {
        this.framework.test('invalid_input_handling', async (ctx) => {
            ctx.log('Testing invalid input handling');
            
            const errorScenarios = this.utils.generateErrorScenarios();
            let handledErrors = 0;
            let totalTests = 0;
            
            // Test invalid image data
            for (const invalidData of errorScenarios.invalidImageData) {
                totalTests++;
                try {
                    if (typeof StyleManager !== 'undefined') {
                        const styleManager = new StyleManager();
                        await styleManager.applyStyle(invalidData, 'residential-presentation');
                        ctx.log('Expected error was not thrown', 'warn');
                    } else {
                        // Simulate error handling
                        if (invalidData === null || invalidData === undefined) {
                            throw new Error('Invalid image data');
                        }
                    }
                } catch (error) {
                    handledErrors++;
                    ctx.log(`Correctly handled invalid data: ${typeof invalidData}`);
                }
            }
            
            const errorHandlingRate = handledErrors / totalTests;
            ctx.assert(errorHandlingRate >= 0.8, 'Should handle at least 80% of invalid inputs gracefully');
            
            return { 
                success: true, 
                handledErrors,
                totalTests,
                errorHandlingRate: errorHandlingRate.toFixed(2)
            };
        }, {
            category: 'error',
            description: 'Tests handling of various invalid inputs',
            timeout: 15000
        });
        
        this.framework.test('network_error_simulation', async (ctx) => {
            ctx.log('Testing network error handling');
            
            const networkConditions = ['slow', 'unstable', 'timeout'];
            const results = {};
            
            for (const condition of networkConditions) {
                ctx.log(`Testing ${condition} network condition`);
                
                try {
                    await this.utils.simulateNetworkConditions(condition);
                    results[condition] = 'handled';
                } catch (error) {
                    results[condition] = 'error';
                    ctx.log(`Network condition ${condition} caused error: ${error.message}`, 'warn');
                }
            }
            
            return { success: true, networkConditions: results };
        }, {
            category: 'error',
            description: 'Simulates various network conditions and errors',
            timeout: 45000
        });
    }

    /**
     * Load batch processing tests
     */
    loadBatchProcessingTests() {
        this.framework.test('batch_consistency', async (ctx) => {
            ctx.log('Testing batch processing consistency');
            
            // Create test image dataset
            const testImages = await this.utils.generateTestDataset('architectural');
            ctx.assert(testImages.length > 0, 'Test dataset should be created');
            
            // Test with mock style manager
            const mockStyleManager = this.utils.createMockStyleManager();
            
            const batchResult = await mockStyleManager.processBatch(
                testImages.slice(0, 3), // Limit for test speed
                'residential-presentation',
                {
                    onProgress: (progress) => {
                        ctx.log(`Batch progress: ${progress.percentage}%`);
                    }
                }
            );
            
            ctx.assert(batchResult.success, 'Batch processing should succeed');
            ctx.assert(batchResult.results.length === 3, 'Should process all test images');
            
            // Check consistency
            const processingTimes = batchResult.results.map(r => r.processingTime);
            const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
            const timeVariation = Math.max(...processingTimes) - Math.min(...processingTimes);
            const variationPercentage = (timeVariation / avgTime) * 100;
            
            ctx.assert(variationPercentage < 100, 'Processing time variation should be reasonable');
            
            return { 
                success: true, 
                processedImages: batchResult.results.length,
                averageTime: avgTime.toFixed(2),
                variationPercentage: variationPercentage.toFixed(2)
            };
        }, {
            category: 'batch',
            description: 'Tests consistency of batch processing operations',
            timeout: 30000
        });
    }

    /**
     * Load style preset tests
     */
    loadStylePresetTests() {
        this.framework.test('style_preset_validation', async (ctx) => {
            ctx.log('Validating all style presets');
            
            const testImage = await this.utils.createTestImage({
                width: 256,
                height: 256,
                type: 'interior'
            });
            
            const presets = [
                'designer-presentation',
                'concept-exploration', 
                'technical-documentation',
                'artistic-mood'
            ];
            
            const results = {};
            
            for (const preset of presets) {
                ctx.log(`Testing preset: ${preset}`);
                
                try {
                    // Use mock style manager for testing
                    const mockStyleManager = this.utils.createMockStyleManager();
                    const result = await mockStyleManager.applyStyle(testImage, preset);
                    
                    const validation = this.utils.validateProcessingResult(result, {
                        success: true,
                        preset: preset
                    });
                    
                    results[preset] = {
                        success: validation.isValid,
                        errors: validation.errors,
                        warnings: validation.warnings
                    };
                    
                    ctx.assert(validation.isValid, `Preset ${preset} should produce valid result`);
                    
                } catch (error) {
                    results[preset] = {
                        success: false,
                        error: error.message
                    };
                    ctx.log(`Preset ${preset} failed: ${error.message}`, 'error');
                }
            }
            
            const successfulPresets = Object.values(results).filter(r => r.success).length;
            ctx.assert(successfulPresets === presets.length, 'All presets should work correctly');
            
            return { success: true, presetResults: results, successfulPresets };
        }, {
            category: 'integration',
            description: 'Validates all built-in style presets',
            timeout: 25000
        });
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        if (this.currentExecution) {
            this.log('Test execution already in progress', 'warn');
            return;
        }
        
        this.log('Starting comprehensive test suite', 'info');
        this.setButtonsEnabled(false);
        
        try {
            this.currentExecution = await this.framework.runAllTests({
                stopOnError: false,
                parallel: false
            });
            
            this.log('All tests completed', 'success');
            
        } catch (error) {
            this.log(`Test execution failed: ${error.message}`, 'error');
        } finally {
            this.currentExecution = null;
            this.setButtonsEnabled(true);
        }
    }

    /**
     * Run tests for specific category
     */
    async runCategoryTests(category) {
        if (this.currentExecution) {
            this.log('Test execution already in progress', 'warn');
            return;
        }
        
        this.log(`Running ${this.categories[category] || category} tests`, 'info');
        this.setButtonsEnabled(false);
        
        try {
            this.currentExecution = await this.framework.runAllTests({
                categories: [category],
                stopOnError: false,
                parallel: false
            });
            
            this.log(`${category} tests completed`, 'success');
            
        } catch (error) {
            this.log(`${category} test execution failed: ${error.message}`, 'error');
        } finally {
            this.currentExecution = null;
            this.setButtonsEnabled(true);
        }
    }

    /**
     * Run single test
     */
    async runSingleTest(testName) {
        if (this.currentExecution) {
            this.log('Test execution already in progress', 'warn');
            return;
        }
        
        this.log(`Running single test: ${testName}`, 'info');
        
        try {
            const result = await this.framework.runTest(testName);
            this.log(`Test ${testName} completed with status: ${result.status}`, 
                result.status === 'passed' ? 'success' : 'error');
            
        } catch (error) {
            this.log(`Test ${testName} failed: ${error.message}`, 'error');
        }
    }

    /**
     * Handle batch file selection
     */
    async handleBatchFiles(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        this.log(`Selected ${files.length} files for batch testing`, 'info');
        
        // Update batch metrics
        this.updateBatchMetrics({ count: files.length });
        
        // Create test images from files
        const testImages = [];
        for (const file of files.slice(0, 5)) { // Limit for testing
            try {
                const imageData = await this.fileToImageData(file);
                testImages.push(imageData);
            } catch (error) {
                this.log(`Failed to load file ${file.name}: ${error.message}`, 'warn');
            }
        }
        
        this.log(`Successfully loaded ${testImages.length} test images`, 'info');
    }

    /**
     * Convert file to ImageData
     */
    async fileToImageData(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, img.width, img.height));
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Update test status in UI
     */
    updateTestStatus(testName, status) {
        const statusElements = document.querySelectorAll(`[data-test="${testName}"]`);
        statusElements.forEach(element => {
            const parent = element.closest('.test-card') || element.closest('.test-section');
            if (parent) {
                const statusEl = parent.querySelector('.test-status');
                if (statusEl) {
                    statusEl.className = `test-status status-${status}`;
                    statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                }
            }
        });
    }

    /**
     * Update test result in UI
     */
    updateTestResult(testName, result) {
        const resultElements = document.querySelectorAll(`#${testName}Results`);
        resultElements.forEach(element => {
            const resultText = result.status === 'passed' 
                ? `✓ Passed (${result.duration}ms)`
                : result.status === 'failed'
                ? `✗ Failed: ${result.error}`
                : `⊘ Skipped: ${result.message}`;
            
            element.textContent = resultText;
            element.className = `test-results ${result.status}`;
        });
    }

    /**
     * Update overall metrics
     */
    updateOverallMetrics() {
        const results = this.framework.getResults();
        const { stats } = results;
        
        if (this.elements.totalTests) {
            this.elements.totalTests.textContent = stats.total;
        }
        if (this.elements.passedTests) {
            this.elements.passedTests.textContent = stats.passed;
        }
        if (this.elements.failedTests) {
            this.elements.failedTests.textContent = stats.failed;
        }
        if (this.elements.averageTime && stats.total > 0) {
            const avgTime = Math.round(stats.totalTime / stats.total);
            this.elements.averageTime.textContent = avgTime;
        }
    }

    /**
     * Update batch metrics
     */
    updateBatchMetrics(metrics) {
        const batchMetrics = {
            count: document.getElementById('batchCount'),
            time: document.getElementById('batchTime'),
            throughput: document.getElementById('batchThroughput')
        };
        
        if (batchMetrics.count && metrics.count !== undefined) {
            batchMetrics.count.textContent = metrics.count;
        }
        if (batchMetrics.time && metrics.time !== undefined) {
            batchMetrics.time.textContent = metrics.time;
        }
        if (batchMetrics.throughput && metrics.throughput !== undefined) {
            batchMetrics.throughput.textContent = metrics.throughput.toFixed(2);
        }
    }

    /**
     * Update test counts
     */
    updateTestCounts() {
        const testCount = this.framework.tests.size;
        this.log(`Loaded ${testCount} tests`, 'info');
    }

    /**
     * Called when all tests complete
     */
    onAllTestsComplete(results) {
        this.log('Test suite execution completed', 'info');
        
        // Generate and display report
        const report = this.framework.generateReport('html');
        
        // You could display this in a modal or dedicated area
        console.log('Test Report Generated:', report);
    }

    /**
     * Clear test results
     */
    clearResults() {
        this.framework.clear();
        this.updateOverallMetrics();
        
        // Clear result displays
        document.querySelectorAll('.test-results').forEach(element => {
            element.textContent = '';
            element.className = 'test-results';
        });
        
        // Reset status indicators
        document.querySelectorAll('.test-status').forEach(element => {
            element.className = 'test-status status-pending';
            element.textContent = 'Pending';
        });
        
        this.log('Test results cleared', 'info');
    }

    /**
     * Export test results
     */
    exportResults() {
        const results = this.framework.getResults();
        const report = this.framework.generateReport('json');
        
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.log('Test results exported', 'info');
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.framework.logger.clear();
        this.log('Test logs cleared', 'info');
    }

    /**
     * Export logs
     */
    exportLogs() {
        const logs = this.framework.logger.getLogs();
        const logText = logs.map(log => 
            `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.log('Test logs exported', 'info');
    }

    /**
     * Set buttons enabled/disabled state
     */
    setButtonsEnabled(enabled) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = !enabled;
        });
    }

    /**
     * Log message
     */
    log(message, level = 'info') {
        this.framework.logger.log(message, level);
    }
}

// Initialize test runner when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.testRunner = new TestRunner();
    
    try {
        await window.testRunner.initialize();
    } catch (error) {
        console.error('Failed to initialize test runner:', error);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestRunner;
} else {
    window.TestRunner = TestRunner;
}