/**
 * Test Framework for AI Interior Design Converter
 * Provides test utilities, assertions, and reporting functionality
 */

class TestFramework {
    constructor() {
        this.tests = new Map();
        this.results = new Map();
        this.currentTest = null;
        this.logger = new TestLogger();
        this.performance = new PerformanceTracker();
        this.isRunning = false;
        
        // Test statistics
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            totalTime: 0
        };
        
        // Event handlers
        this.onTestStart = null;
        this.onTestComplete = null;
        this.onAllTestsComplete = null;
    }

    /**
     * Register a test case
     */
    test(name, testFunction, options = {}) {
        const {
            timeout = 30000,
            skip = false,
            only = false,
            category = 'general',
            dependencies = [],
            description = ''
        } = options;

        this.tests.set(name, {
            name,
            testFunction,
            timeout,
            skip,
            only,
            category,
            dependencies,
            description,
            registered: new Date()
        });

        this.logger.log(`Test registered: ${name}`, 'info');
        return this;
    }

    /**
     * Run a single test
     */
    async runTest(testName) {
        const test = this.tests.get(testName);
        if (!test) {
            throw new Error(`Test '${testName}' not found`);
        }

        if (test.skip) {
            this.logger.log(`Test skipped: ${testName}`, 'warn');
            this.results.set(testName, {
                status: 'skipped',
                message: 'Test was skipped',
                startTime: new Date(),
                endTime: new Date(),
                duration: 0
            });
            this.stats.skipped++;
            return this.results.get(testName);
        }

        this.currentTest = testName;
        const startTime = new Date();
        this.logger.log(`Running test: ${testName}`, 'info');

        if (this.onTestStart) {
            this.onTestStart(testName, test);
        }

        try {
            // Check dependencies
            for (const dep of test.dependencies) {
                const depResult = this.results.get(dep);
                if (!depResult || depResult.status !== 'passed') {
                    throw new Error(`Dependency '${dep}' not satisfied`);
                }
            }

            // Create test context
            const context = new TestContext(testName, this.logger, this.performance);
            
            // Run test with timeout
            const result = await this.runWithTimeout(
                test.testFunction(context),
                test.timeout
            );

            const endTime = new Date();
            const duration = endTime - startTime;

            this.results.set(testName, {
                status: 'passed',
                result,
                startTime,
                endTime,
                duration,
                context: context.getState()
            });

            this.stats.passed++;
            this.stats.totalTime += duration;
            this.logger.log(`Test passed: ${testName} (${duration}ms)`, 'success');

        } catch (error) {
            const endTime = new Date();
            const duration = endTime - startTime;

            this.results.set(testName, {
                status: 'failed',
                error: error.message,
                stack: error.stack,
                startTime,
                endTime,
                duration
            });

            this.stats.failed++;
            this.stats.totalTime += duration;
            this.logger.log(`Test failed: ${testName} - ${error.message}`, 'error');
        }

        this.stats.total++;
        this.currentTest = null;

        const result = this.results.get(testName);
        if (this.onTestComplete) {
            this.onTestComplete(testName, result);
        }

        return result;
    }

    /**
     * Run all tests
     */
    async runAllTests(options = {}) {
        const {
            categories = [],
            pattern = null,
            parallel = false,
            stopOnError = false
        } = options;

        this.isRunning = true;
        this.stats = { total: 0, passed: 0, failed: 0, skipped: 0, totalTime: 0 };
        this.results.clear();

        this.logger.log('Starting test suite execution', 'info');
        const suiteStartTime = new Date();

        // Filter tests
        let testsToRun = Array.from(this.tests.keys());
        
        if (categories.length > 0) {
            testsToRun = testsToRun.filter(name => 
                categories.includes(this.tests.get(name).category)
            );
        }

        if (pattern) {
            const regex = new RegExp(pattern, 'i');
            testsToRun = testsToRun.filter(name => regex.test(name));
        }

        // Check for 'only' tests
        const onlyTests = testsToRun.filter(name => this.tests.get(name).only);
        if (onlyTests.length > 0) {
            testsToRun = onlyTests;
        }

        this.logger.log(`Running ${testsToRun.length} tests`, 'info');

        // Run tests
        if (parallel) {
            const promises = testsToRun.map(testName => this.runTest(testName));
            await Promise.allSettled(promises);
        } else {
            for (const testName of testsToRun) {
                await this.runTest(testName);
                
                if (stopOnError && this.results.get(testName).status === 'failed') {
                    this.logger.log('Stopping execution due to test failure', 'warn');
                    break;
                }
            }
        }

        const suiteEndTime = new Date();
        const suiteDuration = suiteEndTime - suiteStartTime;

        this.logger.log(`Test suite completed in ${suiteDuration}ms`, 'info');
        this.logger.log(`Results: ${this.stats.passed} passed, ${this.stats.failed} failed, ${this.stats.skipped} skipped`, 'info');

        this.isRunning = false;

        if (this.onAllTestsComplete) {
            this.onAllTestsComplete(this.getResults());
        }

        return this.getResults();
    }

    /**
     * Run function with timeout
     */
    async runWithTimeout(promise, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Test timed out after ${timeout}ms`));
            }, timeout);

            promise
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    /**
     * Get test results
     */
    getResults() {
        return {
            stats: { ...this.stats },
            results: Object.fromEntries(this.results),
            logs: this.logger.getLogs()
        };
    }

    /**
     * Generate test report
     */
    generateReport(format = 'html') {
        const results = this.getResults();
        
        switch (format) {
            case 'html':
                return this.generateHTMLReport(results);
            case 'json':
                return JSON.stringify(results, null, 2);
            case 'text':
                return this.generateTextReport(results);
            default:
                throw new Error(`Unsupported report format: ${format}`);
        }
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(results) {
        const { stats, results: testResults } = results;
        const successRate = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(1) : 0;
        
        let html = `
        <div class="test-report">
            <h2>Test Report</h2>
            <div class="report-summary">
                <div class="summary-item">
                    <span class="label">Total Tests:</span>
                    <span class="value">${stats.total}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Passed:</span>
                    <span class="value success">${stats.passed}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Failed:</span>
                    <span class="value error">${stats.failed}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Success Rate:</span>
                    <span class="value">${successRate}%</span>
                </div>
                <div class="summary-item">
                    <span class="label">Total Time:</span>
                    <span class="value">${stats.totalTime}ms</span>
                </div>
            </div>
            <div class="test-details">
        `;

        for (const [testName, result] of Object.entries(testResults)) {
            const statusClass = result.status === 'passed' ? 'success' : 
                              result.status === 'failed' ? 'error' : 'warning';
            
            html += `
                <div class="test-result ${statusClass}">
                    <h3>${testName}</h3>
                    <div class="result-status">Status: ${result.status}</div>
                    <div class="result-duration">Duration: ${result.duration}ms</div>
                    ${result.error ? `<div class="result-error">Error: ${result.error}</div>` : ''}
                </div>
            `;
        }

        html += `
            </div>
        </div>
        `;

        return html;
    }

    /**
     * Generate text report
     */
    generateTextReport(results) {
        const { stats, results: testResults } = results;
        let report = `
TEST REPORT
===========
Total Tests: ${stats.total}
Passed: ${stats.passed}
Failed: ${stats.failed}
Skipped: ${stats.skipped}
Total Time: ${stats.totalTime}ms

DETAILED RESULTS:
`;

        for (const [testName, result] of Object.entries(testResults)) {
            report += `
${testName}: ${result.status.toUpperCase()}
Duration: ${result.duration}ms
${result.error ? `Error: ${result.error}` : ''}
`;
        }

        return report;
    }

    /**
     * Clear all test results
     */
    clear() {
        this.results.clear();
        this.stats = { total: 0, passed: 0, failed: 0, skipped: 0, totalTime: 0 };
        this.logger.clear();
    }
}

/**
 * Test Context - provides utilities for individual tests
 */
class TestContext {
    constructor(testName, logger, performance) {
        this.testName = testName;
        this.logger = logger;
        this.performance = performance;
        this.assertions = 0;
        this.data = new Map();
    }

    /**
     * Assert that a condition is true
     */
    assert(condition, message = 'Assertion failed') {
        this.assertions++;
        if (!condition) {
            throw new Error(`${message} (assertion #${this.assertions})`);
        }
        return this;
    }

    /**
     * Assert equality
     */
    assertEqual(actual, expected, message = 'Values are not equal') {
        this.assertions++;
        if (actual !== expected) {
            throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
        }
        return this;
    }

    /**
     * Assert that a value is truthy
     */
    assertTruthy(value, message = 'Value is not truthy') {
        this.assertions++;
        if (!value) {
            throw new Error(`${message}. Value: ${value}`);
        }
        return this;
    }

    /**
     * Assert that a value is falsy
     */
    assertFalsy(value, message = 'Value is not falsy') {
        this.assertions++;
        if (value) {
            throw new Error(`${message}. Value: ${value}`);
        }
        return this;
    }

    /**
     * Assert that an async function throws
     */
    async assertThrows(asyncFn, expectedError = null, message = 'Function did not throw') {
        this.assertions++;
        try {
            await asyncFn();
            throw new Error(message);
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(`Expected error containing "${expectedError}", got: ${error.message}`);
            }
        }
        return this;
    }

    /**
     * Log a message within the test context
     */
    log(message, level = 'info') {
        this.logger.log(`[${this.testName}] ${message}`, level);
        return this;
    }

    /**
     * Store data for the test
     */
    setData(key, value) {
        this.data.set(key, value);
        return this;
    }

    /**
     * Retrieve stored data
     */
    getData(key) {
        return this.data.get(key);
    }

    /**
     * Measure execution time
     */
    async measureTime(fn, label = 'operation') {
        const startTime = performance.now();
        const result = await fn();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.log(`${label} took ${duration.toFixed(2)}ms`);
        this.setData(`${label}_duration`, duration);
        
        return { result, duration };
    }

    /**
     * Get test context state
     */
    getState() {
        return {
            assertions: this.assertions,
            data: Object.fromEntries(this.data)
        };
    }
}

/**
 * Test Logger - handles logging during test execution
 */
class TestLogger {
    constructor() {
        this.logs = [];
        this.logElement = null;
    }

    /**
     * Set the DOM element for log output
     */
    setLogElement(element) {
        this.logElement = element;
    }

    /**
     * Log a message
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message
        };

        this.logs.push(logEntry);

        // Output to console
        console[level] ? console[level](`[${timestamp}] ${message}`) : console.log(`[${timestamp}] ${message}`);

        // Output to DOM if element is set
        if (this.logElement) {
            const logDiv = document.createElement('div');
            logDiv.className = `log-entry log-${level}`;
            logDiv.textContent = `[${timestamp}] ${message}`;
            this.logElement.appendChild(logDiv);
            this.logElement.scrollTop = this.logElement.scrollHeight;
        }
    }

    /**
     * Get all logs
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Clear logs
     */
    clear() {
        this.logs = [];
        if (this.logElement) {
            this.logElement.innerHTML = '';
        }
    }
}

/**
 * Performance Tracker - tracks performance metrics during tests
 */
class PerformanceTracker {
    constructor() {
        this.metrics = new Map();
        this.markers = new Map();
    }

    /**
     * Start a performance measurement
     */
    mark(name) {
        this.markers.set(name, performance.now());
    }

    /**
     * End a performance measurement
     */
    measure(name, startMark = null) {
        const endTime = performance.now();
        const startTime = startMark ? this.markers.get(startMark) : this.markers.get(name);
        
        if (startTime === undefined) {
            throw new Error(`Start mark '${startMark || name}' not found`);
        }

        const duration = endTime - startTime;
        this.metrics.set(name, duration);
        
        return duration;
    }

    /**
     * Get all metrics
     */
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics.clear();
        this.markers.clear();
    }
}

// Global test framework instance
window.testFramework = new TestFramework();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestFramework, TestContext, TestLogger, PerformanceTracker };
} else {
    window.TestFramework = TestFramework;
    window.TestContext = TestContext;
    window.TestLogger = TestLogger;
    window.PerformanceTracker = PerformanceTracker;
}