/**
 * Batch Processing Module
 * Handles batch processing of multiple images with queue management
 */

class BatchProcessor {
    constructor(imageProcessor, aiProcessor) {
        this.imageProcessor = imageProcessor;
        this.aiProcessor = aiProcessor;
        this.queue = [];
        this.currentIndex = 0;
        this.isProcessing = false;
        this.isPaused = false;
        this.results = [];
        this.maxConcurrent = 1; // Process one at a time to avoid memory issues
        this.maxFileSize = 10 * 1024 * 1024; // 10MB per file
        this.maxBatchSize = 20;
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for batch processing controls
     */
    setupEventListeners() {
        // Batch file input
        const batchFilesInput = document.getElementById('batchFiles');
        if (batchFilesInput) {
            batchFilesInput.addEventListener('change', (e) => this.handleBatchFiles(e));
        }

        // Control buttons
        const startBtn = document.getElementById('startBatchBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startBatch());
        }

        const pauseBtn = document.getElementById('pauseBatchBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseBatch());
        }

        const stopBtn = document.getElementById('stopBatchBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopBatch());
        }

        // Download batch button
        const downloadBatchBtn = document.getElementById('downloadBatchBtn');
        if (downloadBatchBtn) {
            downloadBatchBtn.addEventListener('click', () => this.downloadBatch());
        }
    }

    /**
     * Handle batch file selection
     */
    async handleBatchFiles(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        if (files.length > this.maxBatchSize) {
            alert(`Maximum batch size is ${this.maxBatchSize} files. Only the first ${this.maxBatchSize} files will be processed.`);
            files.splice(this.maxBatchSize);
        }

        // Validate files
        const validFiles = [];
        const errors = [];

        for (const file of files) {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        }

        if (errors.length > 0) {
            alert(`Some files were skipped:\n${errors.join('\n')}`);
        }

        if (validFiles.length === 0) {
            alert('No valid image files were selected.');
            return;
        }

        // Create batch queue
        await this.createBatchQueue(validFiles);
        this.updateBatchDisplay();
        this.enableBatchControls();
    }

    /**
     * Validate individual file
     */
    validateFile(file) {
        // Check file type
        if (!this.supportedFormats.includes(file.type)) {
            return {
                valid: false,
                error: `Unsupported format. Supported: ${this.supportedFormats.join(', ')}`
            };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File too large. Maximum size: ${Math.round(this.maxFileSize / 1024 / 1024)}MB`
            };
        }

        return { valid: true };
    }

    /**
     * Create batch processing queue
     */
    async createBatchQueue(files) {
        this.queue = [];
        this.currentIndex = 0;
        this.results = [];

        const applyToAll = document.getElementById('applyToAll')?.checked || false;
        const currentSettings = applyToAll ? this.getCurrentSettings() : null;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const queueItem = {
                id: `batch_${Date.now()}_${i}`,
                file: file,
                name: file.name,
                size: file.size,
                status: 'pending', // pending, processing, completed, error, skipped
                progress: 0,
                result: null,
                error: null,
                startTime: null,
                endTime: null,
                settings: currentSettings ? { ...currentSettings } : null,
                thumbnail: null
            };

            // Generate thumbnail
            try {
                queueItem.thumbnail = await this.generateThumbnail(file);
            } catch (error) {
                console.warn('Failed to generate thumbnail for', file.name, error);
            }

            this.queue.push(queueItem);
        }

        console.log(`Created batch queue with ${this.queue.length} items`);
    }

    /**
     * Get current processing settings
     */
    getCurrentSettings() {
        const settings = {};
        
        // Get form controls
        const controls = [
            'stylePreset', 'edgeThreshold', 'lineVariation', 'lineThickness',
            'processingMode', 'aiProvider', 'enableMaterialDetection',
            'enableFurnitureDetection', 'enableRoomAnalysis'
        ];

        controls.forEach(controlId => {
            const element = document.getElementById(controlId);
            if (element) {
                if (element.type === 'checkbox') {
                    settings[controlId] = element.checked;
                } else if (element.type === 'range') {
                    settings[controlId] = parseInt(element.value);
                } else if (element.type === 'number') {
                    settings[controlId] = parseFloat(element.value);
                } else {
                    settings[controlId] = element.value;
                }
            }
        });

        return settings;
    }

    /**
     * Generate thumbnail for file
     */
    async generateThumbnail(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                const maxSize = 150;
                let { width, height } = img;
                
                // Calculate dimensions
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Start batch processing
     */
    async startBatch() {
        if (this.queue.length === 0) {
            alert('No files in batch queue');
            return;
        }

        this.isProcessing = true;
        this.isPaused = false;
        this.updateBatchControls();
        
        console.log('Starting batch processing...');

        try {
            await this.processBatch();
        } catch (error) {
            console.error('Batch processing failed:', error);
            alert('Batch processing failed: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.updateBatchControls();
        }
    }

    /**
     * Process the batch queue
     */
    async processBatch() {
        const startTime = Date.now();
        
        for (let i = this.currentIndex; i < this.queue.length; i++) {
            if (!this.isProcessing) break; // Stopped
            
            while (this.isPaused) {
                await this.sleep(100);
                if (!this.isProcessing) break; // Stopped while paused
            }
            
            this.currentIndex = i;
            const item = this.queue[i];
            
            if (item.status === 'completed' || item.status === 'skipped') {
                continue; // Skip already processed items
            }

            await this.processQueueItem(item);
            this.updateBatchDisplay();
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        this.completeBatch(totalTime);
    }

    /**
     * Process individual queue item
     */
    async processQueueItem(item) {
        item.status = 'processing';
        item.startTime = Date.now();
        item.progress = 0;
        
        this.updateItemDisplay(item);

        try {
            // Load image
            const imageData = await this.loadImageData(item.file);
            item.progress = 20;
            this.updateItemDisplay(item);

            // Apply settings if specified
            if (item.settings) {
                this.applySettings(item.settings);
            }

            // Process image
            const result = await this.processImage(imageData, item);
            item.progress = 90;
            this.updateItemDisplay(item);

            // Store result
            item.result = result;
            item.status = 'completed';
            item.progress = 100;
            item.endTime = Date.now();

            this.results.push({
                id: item.id,
                name: item.name,
                result: result,
                processingTime: item.endTime - item.startTime
            });

        } catch (error) {
            console.error(`Failed to process ${item.name}:`, error);
            item.status = 'error';
            item.error = error.message;
            item.endTime = Date.now();
        }

        this.updateItemDisplay(item);
        await this.sleep(100); // Brief pause between items
    }

    /**
     * Load image data from file
     */
    async loadImageData(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve(imageData);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Process image with current pipeline
     */
    async processImage(imageData, item) {
        // Update progress callback
        const progressCallback = (progress) => {
            item.progress = 20 + (progress * 0.7); // 20-90% range
            this.updateItemDisplay(item);
        };

        // Apply image processing pipeline
        if (this.aiProcessor && this.aiProcessor.isAvailable()) {
            // Use AI processing
            return await this.aiProcessor.processImage(imageData, {
                progressCallback: progressCallback
            });
        } else {
            // Use traditional processing
            return await this.processTraditional(imageData, progressCallback);
        }
    }

    /**
     * Traditional processing fallback
     */
    async processTraditional(imageData, progressCallback) {
        // Simulate processing steps
        progressCallback(25);
        await this.sleep(200);
        
        progressCallback(50);
        await this.sleep(300);
        
        progressCallback(75);
        await this.sleep(200);
        
        progressCallback(100);
        
        // Return processed image data (simplified)
        return imageData;
    }

    /**
     * Apply settings to UI
     */
    applySettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    /**
     * Pause batch processing
     */
    pauseBatch() {
        this.isPaused = !this.isPaused;
        this.updateBatchControls();
        console.log(this.isPaused ? 'Batch paused' : 'Batch resumed');
    }

    /**
     * Stop batch processing
     */
    stopBatch() {
        if (confirm('Are you sure you want to stop batch processing?')) {
            this.isProcessing = false;
            this.isPaused = false;
            this.updateBatchControls();
            console.log('Batch processing stopped');
        }
    }

    /**
     * Complete batch processing
     */
    completeBatch(totalTime) {
        const completed = this.queue.filter(item => item.status === 'completed').length;
        const errors = this.queue.filter(item => item.status === 'error').length;
        
        console.log(`Batch processing completed: ${completed} succeeded, ${errors} failed, ${Math.round(totalTime/1000)}s total`);
        
        // Enable download if there are results
        if (this.results.length > 0) {
            const downloadBtn = document.getElementById('downloadBatchBtn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }
        }

        // Show completion notification
        alert(`Batch processing completed!\n\nProcessed: ${completed}\nErrors: ${errors}\nTotal time: ${Math.round(totalTime/1000)} seconds`);
    }

    /**
     * Download batch results
     */
    async downloadBatch() {
        if (this.results.length === 0) {
            alert('No results to download');
            return;
        }

        try {
            // Use JSZip if available for creating zip file
            if (typeof JSZip !== 'undefined') {
                await this.downloadAsZip();
            } else {
                // Fallback: download individual files
                await this.downloadIndividual();
            }
        } catch (error) {
            console.error('Failed to download batch:', error);
            alert('Failed to download batch: ' + error.message);
        }
    }

    /**
     * Download results as ZIP file
     */
    async downloadAsZip() {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        // Add each result to zip
        for (const result of this.results) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Convert result to canvas if needed
            if (result.result instanceof ImageData) {
                canvas.width = result.result.width;
                canvas.height = result.result.height;
                ctx.putImageData(result.result, 0, 0);
            }
            
            // Get blob data
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const filename = `${result.name.replace(/\.[^/.]+$/, '')}_processed.png`;
            
            zip.file(filename, blob);
        }

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_results_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        console.log('Batch downloaded as ZIP');
    }

    /**
     * Download individual files
     */
    async downloadIndividual() {
        for (const result of this.results) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (result.result instanceof ImageData) {
                canvas.width = result.result.width;
                canvas.height = result.result.height;
                ctx.putImageData(result.result, 0, 0);
            }
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${result.name.replace(/\.[^/.]+$/, '')}_processed.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            // Brief delay between downloads
            await this.sleep(500);
        }
        
        console.log('Batch downloaded as individual files');
    }

    /**
     * Update batch display
     */
    updateBatchDisplay() {
        const batchList = document.getElementById('batchList');
        if (!batchList) return;

        batchList.innerHTML = '';
        
        if (this.queue.length === 0) {
            batchList.innerHTML = '<p>No files in batch queue</p>';
            return;
        }

        this.queue.forEach((item, index) => {
            const itemElement = this.createBatchItemElement(item, index);
            batchList.appendChild(itemElement);
        });

        this.updateBatchProgress();
    }

    /**
     * Create batch item element
     */
    createBatchItemElement(item, index) {
        const div = document.createElement('div');
        div.className = `batch-item ${item.status}`;
        div.id = `batch-item-${item.id}`;
        
        const statusIcon = this.getStatusIcon(item.status);
        const progressBar = item.status === 'processing' ? 
            `<div class="progress-bar"><div class="progress-fill" style="width: ${item.progress}%"></div></div>` : '';
        
        div.innerHTML = `
            <div class="batch-item-content">
                ${item.thumbnail ? `<img src="${item.thumbnail}" alt="Thumbnail" class="batch-thumbnail">` : ''}
                <div class="batch-info">
                    <div class="batch-name">${item.name}</div>
                    <div class="batch-size">${this.formatFileSize(item.size)}</div>
                    ${item.error ? `<div class="batch-error">${item.error}</div>` : ''}
                </div>
                <div class="batch-status">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${item.status}</span>
                    ${progressBar}
                </div>
                <div class="batch-actions">
                    ${item.status === 'pending' ? `<button onclick="batchProcessor.skipItem('${item.id}')">Skip</button>` : ''}
                    ${item.status === 'error' ? `<button onclick="batchProcessor.retryItem('${item.id}')">Retry</button>` : ''}
                    ${item.status === 'completed' && item.result ? `<button onclick="batchProcessor.previewResult('${item.id}')">Preview</button>` : ''}
                </div>
            </div>
        `;
        
        return div;
    }

    /**
     * Get status icon
     */
    getStatusIcon(status) {
        const icons = {
            'pending': '⏳',
            'processing': '⚙️',
            'completed': '✅',
            'error': '❌',
            'skipped': '⏭️'
        };
        return icons[status] || '❓';
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Update batch progress
     */
    updateBatchProgress() {
        const progressContainer = document.getElementById('batchProgress');
        const progressFill = document.getElementById('batchProgressFill');
        const progressText = document.getElementById('batchProgressText');
        
        if (!progressContainer || !progressFill || !progressText) return;

        const total = this.queue.length;
        const completed = this.queue.filter(item => 
            item.status === 'completed' || item.status === 'error' || item.status === 'skipped'
        ).length;
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed} of ${total} files processed`;
        
        if (this.isProcessing) {
            progressContainer.style.display = 'block';
        }
    }

    /**
     * Update individual item display
     */
    updateItemDisplay(item) {
        const itemElement = document.getElementById(`batch-item-${item.id}`);
        if (!itemElement) return;

        const statusIcon = itemElement.querySelector('.status-icon');
        const statusText = itemElement.querySelector('.status-text');
        const progressBar = itemElement.querySelector('.progress-fill');
        
        if (statusIcon) statusIcon.textContent = this.getStatusIcon(item.status);
        if (statusText) statusText.textContent = item.status;
        if (progressBar) progressBar.style.width = `${item.progress}%`;
        
        itemElement.className = `batch-item ${item.status}`;
    }

    /**
     * Update batch controls
     */
    updateBatchControls() {
        const startBtn = document.getElementById('startBatchBtn');
        const pauseBtn = document.getElementById('pauseBatchBtn');
        const stopBtn = document.getElementById('stopBatchBtn');
        
        if (startBtn) {
            startBtn.disabled = this.isProcessing || this.queue.length === 0;
        }
        
        if (pauseBtn) {
            pauseBtn.disabled = !this.isProcessing;
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.isProcessing;
        }
    }

    /**
     * Enable batch controls
     */
    enableBatchControls() {
        const startBtn = document.getElementById('startBatchBtn');
        if (startBtn) {
            startBtn.disabled = false;
        }
    }

    /**
     * Skip item
     */
    skipItem(itemId) {
        const item = this.queue.find(item => item.id === itemId);
        if (item && item.status === 'pending') {
            item.status = 'skipped';
            this.updateItemDisplay(item);
            this.updateBatchProgress();
        }
    }

    /**
     * Retry item
     */
    async retryItem(itemId) {
        const item = this.queue.find(item => item.id === itemId);
        if (item && item.status === 'error') {
            item.status = 'pending';
            item.error = null;
            item.progress = 0;
            this.updateItemDisplay(item);
            
            // Process the item
            await this.processQueueItem(item);
        }
    }

    /**
     * Preview result
     */
    previewResult(itemId) {
        const item = this.queue.find(item => item.id === itemId);
        if (item && item.result) {
            // Create preview modal or window
            this.showPreviewModal(item);
        }
    }

    /**
     * Show preview modal
     */
    showPreviewModal(item) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Preview: ${item.name}</h3>
                    <button class="close-btn" onclick="this.closest('.preview-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <canvas id="previewCanvas"></canvas>
                </div>
                <div class="modal-footer">
                    <button onclick="batchProcessor.downloadSingle('${item.id}')">Download</button>
                    <button onclick="this.closest('.preview-modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Display result on canvas
        const canvas = modal.querySelector('#previewCanvas');
        const ctx = canvas.getContext('2d');
        
        if (item.result instanceof ImageData) {
            canvas.width = item.result.width;
            canvas.height = item.result.height;
            ctx.putImageData(item.result, 0, 0);
        }
        
        // Close modal on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Download single result
     */
    async downloadSingle(itemId) {
        const item = this.queue.find(item => item.id === itemId);
        if (!item || !item.result) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (item.result instanceof ImageData) {
            canvas.width = item.result.width;
            canvas.height = item.result.height;
            ctx.putImageData(item.result, 0, 0);
        }
        
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name.replace(/\.[^/.]+$/, '')}_processed.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Clear batch queue
     */
    clearBatch() {
        if (this.isProcessing) {
            alert('Cannot clear batch while processing');
            return;
        }

        if (confirm('Clear all items from batch queue?')) {
            this.queue = [];
            this.currentIndex = 0;
            this.results = [];
            this.updateBatchDisplay();
            this.updateBatchControls();
            
            // Reset file input
            const batchFiles = document.getElementById('batchFiles');
            if (batchFiles) {
                batchFiles.value = '';
            }
        }
    }

    /**
     * Get batch statistics
     */
    getBatchStats() {
        const stats = {
            total: this.queue.length,
            pending: 0,
            processing: 0,
            completed: 0,
            error: 0,
            skipped: 0,
            totalSize: 0,
            averageTime: 0
        };

        let totalTime = 0;
        let completedCount = 0;

        this.queue.forEach(item => {
            stats[item.status]++;
            stats.totalSize += item.size;
            
            if (item.status === 'completed' && item.startTime && item.endTime) {
                totalTime += (item.endTime - item.startTime);
                completedCount++;
            }
        });

        if (completedCount > 0) {
            stats.averageTime = Math.round(totalTime / completedCount);
        }

        return stats;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize batch processor when other modules are ready
let batchProcessor;
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after other modules
    setTimeout(() => {
        if (typeof ImageProcessor !== 'undefined' && typeof AIProcessor !== 'undefined') {
            batchProcessor = new BatchProcessor(imageProcessor, aiProcessor);
            console.log('Batch Processor initialized');
        }
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BatchProcessor;
} else {
    window.BatchProcessor = BatchProcessor;
}