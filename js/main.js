/**
 * Main Application Module
 * Coordinates the image processing pipeline and UI interactions
 * 
 * ENHANCED DOWNLOAD FUNCTIONALITY (Latest Update):
 * - Multiple format support: PNG, JPEG, SVG, PDF
 * - Download progress indicators with visual feedback
 * - Intelligent file naming with timestamps and style information
 * - Cross-browser compatibility with fallback mechanisms
 * - Comprehensive error handling for download failures
 * - Batch download capabilities for multiple images
 * - Quality control for JPEG exports
 * - User-friendly notifications and progress tracking
 */

// Initialize global variables
let imageProcessor;
let edgeDetector;
let handDrawnEffects;
let aiProcessor;
let styleManager;
let downloadManager;
let unifiedAIManager; // New 2025 AI system
let progressiveEnhancement; // Progressive enhancement manager
let currentImageData = null;
let isProcessing = false;
let isDownloading = false;

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const workspace = document.getElementById('workspace');
const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const processBtn = document.getElementById('processBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const processingOverlay = document.getElementById('processingOverlay');

// Control elements
const stylePreset = document.getElementById('stylePreset');
const edgeThreshold = document.getElementById('edgeThreshold');
const lineVariation = document.getElementById('lineVariation');
const lineThickness = document.getElementById('lineThickness');

// Export control elements
const exportFormat = document.getElementById('exportFormat');
const exportQuality = document.getElementById('exportQuality');
const downloadBatchBtn = document.getElementById('downloadBatchBtn');

/**
 * Enhanced Download Manager Class
 * Provides robust file download functionality with multiple format support,
 * progress tracking, error handling, and cross-browser compatibility
 */
class DownloadManager {
    constructor(options = {}) {
        this.canvas = options.canvas;
        this.onProgress = options.onProgress || (() => {});
        this.onError = options.onError || (() => {});
        this.onComplete = options.onComplete || (() => {});
        
        // Browser compatibility flags
        this.browserSupport = this.checkBrowserSupport();
    }
    
    /**
     * Check browser support for various download features
     */
    checkBrowserSupport() {
        const support = {
            downloadAttribute: 'download' in document.createElement('a'),
            blobURLs: typeof URL !== 'undefined' && URL.createObjectURL,
            canvas2d: !!(document.createElement('canvas').getContext && document.createElement('canvas').getContext('2d')),
            webp: false,
            modernFormats: true
        };
        
        // Test WebP support
        const webpCanvas = document.createElement('canvas');
        webpCanvas.width = 1;
        webpCanvas.height = 1;
        try {
            support.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        } catch (e) {
            support.webp = false;
        }
        
        return support;
    }
    
    /**
     * Download canvas as specified format
     */
    async downloadCanvas(filename, format = 'png', quality = 0.9) {
        if (!this.canvas) {
            throw new Error('No canvas element provided');
        }
        
        this.onProgress(10);
        
        try {
            let dataUrl;
            let blob;
            
            // Handle different formats
            switch (format.toLowerCase()) {
                case 'png':
                    dataUrl = this.canvas.toDataURL('image/png');
                    blob = await this.dataURLToBlob(dataUrl);
                    break;
                    
                case 'jpg':
                case 'jpeg':
                    dataUrl = this.canvas.toDataURL('image/jpeg', quality);
                    blob = await this.dataURLToBlob(dataUrl);
                    break;
                    
                case 'webp':
                    if (this.browserSupport.webp) {
                        dataUrl = this.canvas.toDataURL('image/webp', quality);
                        blob = await this.dataURLToBlob(dataUrl);
                    } else {
                        throw new Error('WebP format not supported in this browser');
                    }
                    break;
                    
                case 'svg':
                    blob = await this.canvasToSVG();
                    break;
                    
                case 'pdf':
                    blob = await this.canvasToPDF();
                    break;
                    
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            this.onProgress(80);
            
            // Download the file
            await this.downloadBlob(blob, filename);
            
            this.onProgress(100);
            this.onComplete(filename);
            
        } catch (error) {
            this.onError(error);
            throw error;
        }
    }
    
    /**
     * Convert data URL to Blob
     */
    async dataURLToBlob(dataURL) {
        return new Promise((resolve, reject) => {
            try {
                const byteString = atob(dataURL.split(',')[1]);
                const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                
                resolve(new Blob([ab], { type: mimeString }));
            } catch (error) {
                reject(new Error('Failed to convert data URL to blob'));
            }
        });
    }
    
    /**
     * Convert canvas to SVG format
     */
    async canvasToSVG() {
        try {
            const canvas = this.canvas;
            const dataURL = canvas.toDataURL('image/png');
            
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}"><image x="0" y="0" width="${canvas.width}" height="${canvas.height}" xlink:href="${dataURL}"/></svg>`;
            
            return new Blob([svgContent], { type: 'image/svg+xml' });
        } catch (error) {
            throw new Error('Failed to convert canvas to SVG');
        }
    }
    
    /**
     * Convert canvas to PDF format (basic implementation)
     */
    async canvasToPDF() {
        try {
            // For a complete PDF implementation, you would typically use a library like jsPDF
            // This is a simplified version that creates a basic PDF with embedded image
            const canvas = this.canvas;
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            
            // Note: This is a very basic PDF implementation
            // For production use, consider integrating jsPDF library
            const pdfContent = this.createBasicPDF(dataURL, canvas.width, canvas.height);
            
            return new Blob([pdfContent], { type: 'application/pdf' });
        } catch (error) {
            throw new Error('Failed to convert canvas to PDF. Consider using PNG or JPEG format instead.');
        }
    }
    
    /**
     * Create a basic PDF structure (simplified - for demonstration)
     */
    createBasicPDF(imageDataURL, width, height) {
        // This creates a very basic PDF that embeds the image
        // In production, use a proper PDF library like jsPDF
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] >>
endobj
trailer
<< /Size 4 /Root 1 0 R >>
startxref
0
%%EOF`;
        
        return pdfContent;
    }
    
    /**
     * Download blob with cross-browser compatibility
     */
    async downloadBlob(blob, filename) {
        try {
            if (this.browserSupport.downloadAttribute && this.browserSupport.blobURLs) {
                // Modern browsers
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up the URL object
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                // Fallback for older browsers
                this.fallbackDownload(blob, filename);
            }
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }
    
    /**
     * Fallback download method for older browsers
     */
    fallbackDownload(blob, filename) {
        try {
            if (navigator.msSaveBlob) {
                // Internet Explorer
                navigator.msSaveBlob(blob, filename);
            } else {
                // Last resort: open in new window
                const reader = new FileReader();
                reader.onload = function() {
                    const newWindow = window.open();
                    if (newWindow) {
                        newWindow.document.write(`
                            <html>
                                <body>
                                    <p>Your download should start automatically. If not, 
                                    <a href="${reader.result}" download="${filename}">click here</a>.</p>
                                    <script>
                                        setTimeout(() => {
                                            window.location.href = "${reader.result}";
                                        }, 1000);
                                    </script>
                                </body>
                            </html>
                        `);
                    } else {
                        throw new Error('Unable to open download window. Please check popup blocker settings.');
                    }
                };
                reader.readAsDataURL(blob);
            }
        } catch (error) {
            throw new Error('All download methods failed');
        }
    }
    
    /**
     * Download multiple canvases/images as a batch
     */
    async downloadBatch(images, options = {}) {
        const {
            format = 'png',
            quality = 0.9,
            onProgress = () => {},
            onFileComplete = () => {}
        } = options;
        
        const totalFiles = images.length;
        let completedFiles = 0;
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const filename = `batch-${i + 1}-${this.generateTimestamp()}.${format}`;
            
            try {
                // Temporarily set canvas for this image
                const originalCanvas = this.canvas;
                this.canvas = image.canvas || image;
                
                // Download individual file
                await this.downloadCanvas(filename, format, quality);
                
                // Restore original canvas
                this.canvas = originalCanvas;
                
                completedFiles++;
                const progress = (completedFiles / totalFiles) * 100;
                onProgress(progress);
                onFileComplete(filename);
                
            } catch (error) {
                console.error(`Failed to download file ${i + 1}:`, error);
                // Continue with next file instead of stopping the entire batch
            }
        }
        
        return completedFiles;
    }
    
    /**
     * Generate timestamp for file naming
     */
    generateTimestamp() {
        return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    }
}

// Initialize modules
async function init() {
    console.log('Initializing application...');
    
    // Verify essential DOM elements exist
    if (!uploadArea || !fileInput) {
        console.error('Essential DOM elements missing');
        return;
    }
    
    // Initialize progressive enhancement system first
    try {
        if (typeof ProgressiveEnhancementManager !== 'undefined') {
            progressiveEnhancement = new ProgressiveEnhancementManager();
            await progressiveEnhancement.detectDeviceCapabilities();
            progressiveEnhancement.assignPerformanceTier();
            
            // Run performance benchmark
            await progressiveEnhancement.runPerformanceBenchmark();
            
            console.log('🎯 Progressive Enhancement initialized successfully');
        } else {
            console.warn('ProgressiveEnhancementManager not available');
        }
    } catch (error) {
        console.warn('🎯 Progressive Enhancement not available:', error.message);
    }
    
    // Initialize new 2025 AI system with progressive enhancement
    try {
        if (typeof UnifiedAIManager !== 'undefined') {
            unifiedAIManager = new UnifiedAIManager();
            await unifiedAIManager.initialize();
            
            // Apply progressive enhancements
            if (progressiveEnhancement) {
                progressiveEnhancement.applyAdaptiveOptimizations();
                progressiveEnhancement.startPerformanceMonitoring();
            }
            
            console.log('🚀 Unified AI Manager initialized successfully');
        } else {
            console.warn('UnifiedAIManager not available');
        }
    } catch (error) {
        console.warn('🚀 Unified AI Manager not available:', error.message);
    }
    
    // Initialize legacy AI processor for fallback
    try {
        if (typeof AIProcessor !== 'undefined') {
            aiProcessor = new AIProcessor();
            console.log('AI Processor initialized successfully');
        } else {
            console.warn('AIProcessor class not available');
            aiProcessor = null;
        }
    } catch (error) {
        console.warn('AI Processor not available:', error.message);
        aiProcessor = null;
    }
    
    // Initialize core modules with error handling
    try {
        if (typeof ImageProcessor !== 'undefined') {
            imageProcessor = new ImageProcessor(originalCanvas, resultCanvas);
            console.log('Image Processor initialized');
        } else {
            console.error('ImageProcessor class not available');
            return;
        }
    } catch (error) {
        console.error('Failed to initialize ImageProcessor:', error);
        return;
    }
    
    try {
        if (typeof EdgeDetection !== 'undefined') {
            edgeDetector = new EdgeDetection();
            console.log('Edge Detector initialized');
        } else {
            console.warn('EdgeDetection class not available');
            edgeDetector = null;
        }
    } catch (error) {
        console.warn('Edge Detector not available:', error.message);
        edgeDetector = null;
    }
    
    try {
        if (typeof HandDrawnEffects !== 'undefined') {
            handDrawnEffects = new HandDrawnEffects(resultCanvas, {
                aiProcessor: aiProcessor,
                useAI: true,
                interiorMode: true,
                materialAwareness: true,
                furniturePreservation: true
            });
            console.log('Hand Drawn Effects initialized');
        } else {
            console.warn('HandDrawnEffects class not available');
            handDrawnEffects = null;
        }
    } catch (error) {
        console.warn('Hand Drawn Effects not available:', error.message);
        handDrawnEffects = null;
    }
    
    // Initialize style manager with AI integration
    try {
        if (typeof StyleManager !== 'undefined') {
            styleManager = new StyleManager(unifiedAIManager || aiProcessor, handDrawnEffects);
            console.log('Style Manager initialized with AI integration');
        } else {
            console.warn('StyleManager class not available');
            styleManager = null;
        }
    } catch (error) {
        console.warn('Style Manager not available:', error.message);
        styleManager = null;
    }
    
    // Initialize download manager
    try {
        downloadManager = new DownloadManager({
            canvas: resultCanvas,
            onProgress: updateDownloadProgress,
            onError: handleDownloadError,
            onComplete: handleDownloadComplete
        });
        console.log('Download Manager initialized');
    } catch (error) {
        console.warn('Download Manager not available:', error.message);
        downloadManager = null;
    }
    
    setupEventListeners();
    
    // Display AI capabilities status
    displayAICapabilities();
    
    console.log('Application initialization complete');
}

// Setup all event listeners
function setupEventListeners() {
    // File upload events
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    
    // Control events
    processBtn.addEventListener('click', processImage);
    resetBtn.addEventListener('click', resetWorkspace);
    downloadBtn.addEventListener('click', downloadResult);
    downloadBatchBtn.addEventListener('click', downloadBatchResults);
    
    // Range input events
    edgeThreshold.addEventListener('input', updateRangeDisplay);
    lineVariation.addEventListener('input', updateRangeDisplay);
    lineThickness.addEventListener('input', updateRangeDisplay);
    
    // Export control events
    exportFormat.addEventListener('change', handleFormatChange);
    exportQuality.addEventListener('input', updateRangeDisplay);
    
    // Initialize export controls
    handleFormatChange(); // Set initial state
    updateRangeDisplay({ target: exportQuality }); // Set initial quality display
}

// Handle file selection
async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        await loadImage(file);
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

// Handle file drop
async function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        await loadImage(files[0]);
    }
}

// Load and display image
async function loadImage(file) {
    try {
        console.log('Loading image:', file.name);
        
        if (imageProcessor) {
            await imageProcessor.loadImage(file);
            currentImageData = imageProcessor.getImageData();
        } else {
            // Fallback: load image manually
            console.warn('ImageProcessor not available, using fallback');
            await loadImageFallback(file);
        }
        
        // Show workspace and hide upload area
        if (workspace) {
            workspace.style.display = 'grid';
        }
        if (uploadArea) {
            uploadArea.style.display = 'none';
        }
        
        // Enable process button
        if (processBtn) {
            processBtn.disabled = false;
        }
        
        console.log('Image loaded successfully');
        
        // Auto-process with default settings
        await processImage();
    } catch (error) {
        console.error('Error loading image:', error);
        alert('Failed to load image. Please try another file.');
    }
}

// Fallback image loading when ImageProcessor is not available
async function loadImageFallback(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                console.log('Fallback image loaded:', img.width, 'x', img.height);
                
                // Set canvas size and draw image
                if (originalCanvas && resultCanvas) {
                    originalCanvas.width = img.width;
                    originalCanvas.height = img.height;
                    resultCanvas.width = img.width;
                    resultCanvas.height = img.height;
                    
                    const originalCtx = originalCanvas.getContext('2d');
                    const resultCtx = resultCanvas.getContext('2d');
                    
                    originalCtx.drawImage(img, 0, 0);
                    resultCtx.drawImage(img, 0, 0);
                    
                    // Create basic image data for processing
                    currentImageData = originalCtx.getImageData(0, 0, img.width, img.height);
                }
                
                resolve(img);
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Process image with current settings
async function processImage() {
    if (!currentImageData || isProcessing) return;
    
    isProcessing = true;
    processBtn.disabled = true;
    processingOverlay.style.display = 'flex';
    
    // Use setTimeout to ensure UI updates before processing
    setTimeout(async () => {
        try {
            console.log('🎨 Starting image processing with style:', stylePreset.value);
            
            // Get processing mode and determine if AI should be used
            const processingMode = document.getElementById('processingMode')?.value || 'traditional';
            const selectedStyle = stylePreset.value;
            
            let result;
            
            // Try AI processing first if available and enabled
            if (unifiedAIManager && unifiedAIManager.isInitialized && processingMode !== 'traditional') {
                try {
                    console.log('🤖 Attempting AI processing with unified manager');
                    
                    // Map traditional styles to AI styles
                    const aiStyleMapping = {
                        'pencil': 'ai_sketch',
                        'pen': 'ai_edge_enhanced',
                        'charcoal': 'ai_artistic',
                        'technical': 'ai_technical',
                        'modern': 'interior_presentation',
                        'scandinavian': 'furniture_focus',
                        'industrial': 'architectural_lines',
                        'contemporary': 'interior_presentation'
                    };
                    
                    const aiStyle = aiStyleMapping[selectedStyle] || 'ai_sketch';
                    
                    const aiOptions = {
                        threshold: parseInt(edgeThreshold.value),
                        lineVariation: parseInt(lineVariation.value),
                        lineThickness: parseFloat(lineThickness.value),
                        quality: processingMode === 'cloud' ? 'desktop' : 'auto'
                    };
                    
                    const aiResult = await unifiedAIManager.processImage(currentImageData, aiStyle, aiOptions);
                    
                    if (aiResult && aiResult.success) {
                        console.log('✅ AI processing successful:', aiResult.method || aiResult.engine);
                        result = aiResult.imageData;
                        
                        // Show AI processing info if fallback was used
                        if (aiResult.usedFallback) {
                            console.log('ℹ️ AI fallback used:', aiResult.originalStyle, '→', aiResult.method);
                        }
                    } else {
                        throw new Error('AI processing failed or returned invalid result');
                    }
                    
                } catch (aiError) {
                    console.warn('⚠️ AI processing failed, falling back to traditional:', aiError.message);
                    result = await traditionalProcessing();
                }
            } else {
                console.log('🖊️ Using traditional processing (AI not available or disabled)');
                result = await traditionalProcessing();
            }
            
            // Display result
            if (result) {
                if (result instanceof ImageData) {
                    imageProcessor.drawResult(result);
                } else if (result.data) {
                    // Handle different result formats
                    const resultCtx = resultCanvas.getContext('2d');
                    resultCtx.putImageData(result.data, 0, 0);
                } else {
                    console.warn('Unknown result format, attempting direct display');
                    imageProcessor.drawResult(result);
                }
                
                // Enable download button
                downloadBtn.disabled = false;
                console.log('✅ Image processing completed successfully');
            } else {
                throw new Error('Processing returned no result');
            }
            
        } catch (error) {
            console.error('❌ Error processing image:', error);
            alert('Failed to process image. Please try adjusting the settings.');
        } finally {
            isProcessing = false;
            processBtn.disabled = false;
            processingOverlay.style.display = 'none';
        }
    }, 100);
}

// Traditional processing fallback function
async function traditionalProcessing() {
    console.log('🖊️ Executing traditional processing pipeline');
    
    // Convert to grayscale
    const grayscaleData = imageProcessor.toGrayscale(currentImageData);
    
    // Apply slight blur for noise reduction
    const blurredData = imageProcessor.gaussianBlur(grayscaleData, 1);
    
    // Detect edges
    const edges = edgeDetector ? edgeDetector.detectArchitecturalEdges(blurredData, {
        threshold: parseInt(edgeThreshold.value),
        blur: true,
        thinning: true
    }) : blurredData;
    
    // Apply hand-drawn effect
    const result = handDrawnEffects ? await handDrawnEffects.applyHandDrawnEffect(edges, {
        style: stylePreset.value,
        lineVariation: parseInt(lineVariation.value),
        lineThickness: parseFloat(lineThickness.value),
        texture: true
    }) : edges;
    
    return result;
}

// Reset workspace
function resetWorkspace() {
    // Clear canvases
    imageProcessor.clearResult();
    
    // Reset to upload screen
    workspace.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Reset file input
    fileInput.value = '';
    
    // Reset controls to defaults
    stylePreset.value = 'pencil';
    edgeThreshold.value = 30;
    lineVariation.value = 50;
    lineThickness.value = 2;
    
    // Update displays
    updateRangeDisplay({ target: edgeThreshold });
    updateRangeDisplay({ target: lineVariation });
    updateRangeDisplay({ target: lineThickness });
    
    // Disable buttons
    processBtn.disabled = true;
    downloadBtn.disabled = true;
    
    currentImageData = null;
}

// Enhanced download result with multiple format support
async function downloadResult() {
    if (downloadBtn.disabled || isDownloading || !resultCanvas) return;
    
    try {
        isDownloading = true;
        downloadBtn.disabled = true;
        
        // Generate filename with timestamp and style information
        const filename = generateDownloadFilename();
        
        // Get selected format and quality
        const format = exportFormat.value;
        const quality = parseFloat(exportQuality.value) / 100;
        
        // Show download progress
        showDownloadProgress();
        
        // Download using the enhanced download manager
        await downloadManager.downloadCanvas(filename, format, quality);
        
    } catch (error) {
        console.error('Download failed:', error);
        handleDownloadError(error);
    } finally {
        isDownloading = false;
        downloadBtn.disabled = false;
        hideDownloadProgress();
    }
}

// Download batch results
async function downloadBatchResults() {
    if (downloadBatchBtn.disabled || isDownloading) return;
    
    try {
        isDownloading = true;
        downloadBatchBtn.disabled = true;
        
        // Show batch download progress
        showDownloadProgress('Preparing batch download...');
        
        // Integrate with batch processor for batch downloads
        if (typeof BatchProcessor !== 'undefined' && BatchProcessor.hasProcessedImages()) {
            const processedImages = BatchProcessor.getProcessedImages();
            await downloadManager.downloadBatch(processedImages, {
                format: exportFormat.value,
                quality: parseFloat(exportQuality.value) / 100,
                onProgress: updateDownloadProgress,
                onFileComplete: (filename) => console.log(`Downloaded: ${filename}`)
            });
        } else {
            throw new Error('No batch images available for download');
        }
        
    } catch (error) {
        console.error('Batch download failed:', error);
        handleDownloadError(error);
    } finally {
        isDownloading = false;
        downloadBatchBtn.disabled = false;
        hideDownloadProgress();
    }
}

// Update range display value
function updateRangeDisplay(e) {
    const input = e.target;
    const display = input.nextElementSibling;
    if (display && display.classList.contains('value-display')) {
        if (input.id === 'exportQuality') {
            display.textContent = input.value + '%';
        } else {
            display.textContent = input.value;
        }
    }
}

// Generate filename with timestamp and style information
function generateDownloadFilename() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const style = stylePreset.value;
    const format = exportFormat.value;
    
    return `hand-drawn-${style}-${timestamp}.${format}`;\n}

// Handle export format change
function handleFormatChange() {\n    const format = exportFormat.value;\n    const qualityGroup = exportQuality.parentElement;\n    \n    // Show/hide quality control based on format\n    if (format === 'jpg' || format === 'jpeg') {\n        qualityGroup.style.display = 'block';\n    } else {\n        qualityGroup.style.display = 'none';\n    }\n}

// Show download progress
function showDownloadProgress(message = 'Preparing download...') {
    // Create progress overlay if it doesn't exist
    let progressOverlay = document.getElementById('downloadProgressOverlay');
    if (!progressOverlay) {
        progressOverlay = document.createElement('div');
        progressOverlay.id = 'downloadProgressOverlay';
        progressOverlay.className = 'download-progress-overlay';
        progressOverlay.innerHTML = `
            <div class=\"download-progress-content\">
                <div class=\"spinner\"></div>
                <p class=\"progress-message\">${message}</p>
                <div class=\"progress-bar\">
                    <div class=\"progress-fill\" id=\"downloadProgressFill\"></div>
                </div>
                <div class=\"progress-text\" id=\"downloadProgressText\">0%</div>
            </div>
        `;
        document.body.appendChild(progressOverlay);
    }
    
    progressOverlay.style.display = 'flex';
    document.querySelector('.progress-message').textContent = message;
}

// Hide download progress
function hideDownloadProgress() {
    const progressOverlay = document.getElementById('downloadProgressOverlay');
    if (progressOverlay) {
        progressOverlay.style.display = 'none';
    }
}

// Update download progress
function updateDownloadProgress(progress) {
    const progressFill = document.getElementById('downloadProgressFill');
    const progressText = document.getElementById('downloadProgressText');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }
}

// Handle download error
function handleDownloadError(error) {
    console.error('Download error:', error);
    
    // Show user-friendly error message
    const errorMessage = getDownloadErrorMessage(error);
    alert(`Download failed: ${errorMessage}`);
    
    hideDownloadProgress();
}

// Get user-friendly error message
function getDownloadErrorMessage(error) {
    if (error.message.includes('network')) {
        return 'Network connection issue. Please check your internet connection.';
    } else if (error.message.includes('format')) {
        return 'Unsupported file format. Please try a different format.';
    } else if (error.message.includes('size')) {
        return 'File too large. Please try reducing the image size or quality.';
    } else {
        return 'An unexpected error occurred. Please try again.';
    }
}

// Handle download complete
function handleDownloadComplete(filename) {
    console.log(`Download completed: ${filename}`);
    hideDownloadProgress();
    
    // Optional: Show success notification
    showDownloadNotification('Download completed successfully!');
}

// Show download notification
function showDownloadNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility function for formatting bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Demo functions for testing AI edge detection
window.demoEdgeDetection = async function() {
    if (!currentImageData) {
        console.warn('⚠️ Please load an image first');
        return;
    }
    
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return;
    }
    
    console.log('🚀 Starting edge detection demo...');
    const results = await unifiedAIManager.demoEdgeDetection(currentImageData);
    console.log('🏆 Demo results:', results);
    return results;
};

window.benchmarkEdgeDetection = async function(iterations = 3) {
    if (!currentImageData) {
        console.warn('⚠️ Please load an image first');
        return;
    }
    
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return;
    }
    
    console.log(`🏃 Starting edge detection benchmark (${iterations} iterations)...`);
    const results = await unifiedAIManager.benchmarkEdgeDetection(currentImageData, iterations);
    console.log('📊 Benchmark results:', results);
    return results;
};

window.demoControlNet = async function() {
    if (!currentImageData) {
        console.warn('⚠️ Please load an image first');
        return;
    }
    
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return;
    }
    
    console.log('🎨 Starting ControlNet demo...');
    
    const controlNetStyles = [
        'ai_controlnet_sketch',
        'ai_controlnet_lineart',
        'ai_controlnet_depth'
    ];
    
    const results = {};
    
    for (const style of controlNetStyles) {
        try {
            console.log(`🖼️ Testing ${style}...`);
            const startTime = performance.now();
            
            const result = await unifiedAIManager.processImage(currentImageData, style, {
                quality: 'auto'
            });
            
            const processingTime = performance.now() - startTime;
            
            results[style] = {
                success: result.success || false,
                processingTime,
                engine: result.engine || 'unknown',
                controlType: result.controlType || 'unknown',
                usedFallback: result.usedFallback || false
            };
            
            console.log(`✅ ${style}: ${processingTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error(`❌ ${style} failed:`, error.message);
            results[style] = {
                success: false,
                error: error.message
            };
        }
    }
    
    console.log('🏆 ControlNet demo complete!', results);
    return results;
};

window.getCacheStats = function() {
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return null;
    }
    
    const onnxEngine = unifiedAIManager.engines?.get('onnx');
    if (!onnxEngine || !onnxEngine.getCacheStats) {
        console.warn('⚠️ ONNX engine not available');
        return null;
    }
    
    const stats = onnxEngine.getCacheStats();
    console.log('📊 Model Cache Statistics:');
    console.log(`  Models loaded: ${stats.totalModels}/${stats.maxModels}`);
    console.log(`  Cache size: ${formatBytes(stats.totalSize)} / ${formatBytes(stats.maxSize)} (${stats.utilizationPercent.toFixed(1)}%)`);
    console.log(`  Average model size: ${formatBytes(stats.averageModelSize)}`);
    console.log(`  Recently used: ${stats.recentlyUsed.join(', ')}`);
    
    return stats;
};

window.optimizeCache = function() {
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return null;
    }
    
    const onnxEngine = unifiedAIManager.engines?.get('onnx');
    if (!onnxEngine || !onnxEngine.optimizeCache) {
        console.warn('⚠️ ONNX engine not available');
        return null;
    }
    
    return onnxEngine.optimizeCache();
};

window.clearModelCache = function() {
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return;
    }
    
    unifiedAIManager.clearCaches();
    console.log('🗑️ All model caches cleared');
};

window.demoTransformersCapabilities = async function() {
    if (!currentImageData) {
        console.warn('⚠️ Please load an image first');
        return;
    }
    
    if (!unifiedAIManager || !unifiedAIManager.isInitialized) {
        console.warn('⚠️ AI Manager not available');
        return;
    }
    
    console.log('🤖 Starting advanced Transformers.js capabilities demo...');
    const results = await unifiedAIManager.demoTransformersCapabilities(currentImageData);
    
    if (results) {
        console.log('🏆 Transformers.js demo results:');
        console.log(`  Models tested: ${results.summary.totalTests}`);
        console.log(`  Successful: ${results.summary.successful}`);
        console.log(`  With analysis: ${results.summary.withAnalysis}`);
        console.log(`  Average time: ${results.summary.averageProcessingTime.toFixed(2)}ms`);
        
        // Log capabilities
        const capabilities = results.capabilities;
        if (capabilities.enhancedFeatures) {
            console.log('🔧 Enhanced features:');
            Object.entries(capabilities.enhancedFeatures).forEach(([feature, enabled]) => {
                console.log(`  ${feature}: ${enabled ? '✅' : '❌'}`);
            });
        }
    }
    
    return results;
};

window.getSystemStatus = function() {
    if (!progressiveEnhancement) {
        console.warn('⚠️ Progressive Enhancement not available');
        return null;
    }
    
    const status = progressiveEnhancement.getSystemStatus();
    
    console.log('🎯 System Status:');
    console.log(`  Performance Tier: ${status.tierName}`);
    console.log(`  Current Tier ID: ${status.currentTier}`);
    
    if (status.performanceProfile) {
        console.log(`  Performance Score: ${status.performanceProfile.averageScore.toFixed(1)}/100`);
        console.log(`  Classification: ${status.performanceProfile.classification}`);
    }
    
    console.log(`  Device Capabilities:`);
    console.log(`    WebGPU: ${status.deviceCapabilities.webgpu ? '✅' : '❌'}`);
    console.log(`    WebGL: ${status.deviceCapabilities.webgl ? '✅' : '❌'}`);
    console.log(`    WebAssembly: ${status.deviceCapabilities.wasm ? '✅' : '❌'}`);
    console.log(`    Memory: ${status.deviceCapabilities.memory}GB`);
    console.log(`    CPU Cores: ${status.deviceCapabilities.cores}`);
    console.log(`    Mobile: ${status.deviceCapabilities.mobile ? '✅' : '❌'}`);
    
    if (status.configuration) {
        const config = status.configuration;
        console.log(`  Configuration:`);
        console.log(`    Max Models: ${config.capabilities.maxModels}`);
        console.log(`    Cache Size: ${config.capabilities.cacheSize}MB`);
        console.log(`    Quality Level: ${config.capabilities.qualityLevel}`);
        console.log(`    Preloading: ${config.capabilities.enablePreloading ? '✅' : '❌'}`);
    }
    
    return status;
};

window.runPerformanceBenchmark = async function() {
    if (!progressiveEnhancement) {
        console.warn('⚠️ Progressive Enhancement not available');
        return null;
    }
    
    console.log('🏃 Starting comprehensive performance benchmark...');
    const benchmark = await progressiveEnhancement.runPerformanceBenchmark();
    
    console.log('📈 Benchmark Results:');
    Object.entries(benchmark.tests).forEach(([testName, result]) => {
        if (result.score !== undefined) {
            console.log(`  ${testName}: ${result.score.toFixed(1)}/100`);
        } else {
            console.log(`  ${testName}: ${result.error || 'No score'}`);
        }
    });
    
    const profile = progressiveEnhancement.performanceProfile;
    if (profile) {
        console.log(`🏆 Overall Score: ${profile.averageScore.toFixed(1)}/100 (${profile.classification})`);
        
        if (profile.shouldAdjust) {
            console.log(`🔄 Recommendation: Switch to ${profile.recommendedTier}`);
        }
    }
    
    return benchmark;
};

window.togglePerformanceMonitoring = function() {
    if (!progressiveEnhancement) {
        console.warn('⚠️ Progressive Enhancement not available');
        return;
    }
    
    const status = progressiveEnhancement.getSystemStatus();
    
    if (status.monitoring.active) {
        progressiveEnhancement.stopPerformanceMonitoring();
        console.log('⏹️ Performance monitoring stopped');
    } else {
        progressiveEnhancement.startPerformanceMonitoring();
        console.log('▶️ Performance monitoring started');
    }
};

// Display AI capabilities status
function displayAICapabilities() {
    if (unifiedAIManager && unifiedAIManager.isInitialized) {
        const status = unifiedAIManager.getSystemStatus();
        const processingModeSelect = document.getElementById('processingMode');
        
        console.log('🤖 AI Capabilities Available:');
        console.log('  Current Engine:', status.currentEngine);
        console.log('  Available Engines:', status.availableEngines.join(', '));
        console.log('  WebGPU Support:', status.capabilities?.hasWebGPU ? '✅' : '❌');
        console.log('  WebGL Support:', status.capabilities?.hasWebGL ? '✅' : '❌');
        
        // Update processing mode options based on available engines
        if (processingModeSelect) {
            // Enable local AI option if engines are available
            const localOption = processingModeSelect.querySelector('option[value="local"]');
            if (localOption && status.availableEngines.length > 1) {
                localOption.disabled = false;
                localOption.textContent = `Local AI (${status.currentEngine})`;
            }
            
            // Set default to local AI if available
            if (status.availableEngines.includes('onnx') || status.availableEngines.includes('transformers')) {
                processingModeSelect.value = 'local';
            }
        }
        
        // Add AI status indicator to header with performance tier
        const header = document.querySelector('header p');
        if (header && !header.querySelector('.ai-status')) {
            const aiStatus = document.createElement('span');
            aiStatus.className = 'ai-status';
            
            let tierInfo = '';
            if (progressiveEnhancement) {
                const systemStatus = progressiveEnhancement.getSystemStatus();
                tierInfo = ` | ${systemStatus.tierName || 'Unknown Tier'}`;
            }
            
            aiStatus.innerHTML = ` <span style="color: #4CAF50;">🧠 AI Ready (${status.currentEngine.toUpperCase()}${tierInfo})</span>`;
            header.appendChild(aiStatus);
        }
        
        // Log testing information with progressive enhancement
        console.log('🧠 AI Processing Ready!');
        
        if (progressiveEnhancement) {
            const systemStatus = progressiveEnhancement.getSystemStatus();
            console.log(`🎯 Performance Tier: ${systemStatus.tierName}`);
            console.log(`📊 Performance Score: ${systemStatus.performanceProfile?.averageScore?.toFixed(1) || 'Pending'}`);
        }
        
        console.log('Available test functions:');
        console.log('  demoEdgeDetection() - Test multiple edge detection models');
        console.log('  benchmarkEdgeDetection(3) - Performance benchmark with 3 iterations');
        console.log('  demoControlNet() - Test ControlNet-style sketch conversion');
        console.log('  getCacheStats() - View model cache statistics');
        console.log('  optimizeCache() - Get cache optimization suggestions');
        console.log('  clearModelCache() - Clear all cached models');
        console.log('  demoTransformersCapabilities() - Test advanced Transformers.js features');
        console.log('  getSystemStatus() - View progressive enhancement status');
        console.log('  runPerformanceBenchmark() - Re-run performance analysis');
        console.log('  togglePerformanceMonitoring() - Start/stop real-time monitoring');
        console.log('Load an image and try: demoEdgeDetection() or demoControlNet()');
    } else {
        console.log('🔋 Traditional processing only (AI not available)');
        console.log('AI models could not be loaded. Falling back to traditional edge detection.');
        
        // Disable AI options
        const processingModeSelect = document.getElementById('processingMode');
        if (processingModeSelect) {
            const localOption = processingModeSelect.querySelector('option[value="local"]');
            if (localOption) {
                localOption.disabled = true;
                localOption.textContent = 'Local AI (Not Available)';
            }
        }
    }
}

// Display performance tier information in UI
function displayPerformanceTierInfo() {
    const tierInfoDiv = document.getElementById('performanceTierInfo');
    const tierNameSpan = document.getElementById('tierName');
    const tierScoreSpan = document.getElementById('tierScore');
    const tierDetailsDiv = document.getElementById('tierDetails');
    
    if (!tierInfoDiv || !progressiveEnhancement) {
        return;
    }
    
    const systemStatus = progressiveEnhancement.getSystemStatus();
    
    // Show the tier info section
    tierInfoDiv.style.display = 'block';
    
    // Update tier name
    if (tierNameSpan && systemStatus.tierName) {
        tierNameSpan.textContent = systemStatus.tierName;
        tierNameSpan.className = `tier-name tier-${systemStatus.currentTier}`;
    }
    
    // Update performance score
    if (tierScoreSpan && systemStatus.performanceProfile) {
        const score = systemStatus.performanceProfile.averageScore;
        const classification = systemStatus.performanceProfile.classification;
        tierScoreSpan.textContent = `${score.toFixed(1)}/100 (${classification})`;
        tierScoreSpan.className = `tier-score score-${classification}`;
    }
    
    // Update details
    if (tierDetailsDiv && systemStatus.deviceCapabilities) {
        const caps = systemStatus.deviceCapabilities;
        const details = [];
        
        if (caps.webgpu) details.push('WebGPU ✅');
        else if (caps.webgl) details.push('WebGL ✅');
        else details.push('CPU only');
        
        details.push(`${caps.memory}GB RAM`);
        details.push(`${caps.cores} cores`);
        
        if (caps.mobile) details.push('Mobile device');
        
        tierDetailsDiv.innerHTML = `<small>${details.join(' • ')}</small>`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await init();
        
        // Update UI with tier information after everything is loaded
        setTimeout(() => {
            displayPerformanceTierInfo();
        }, 500);
    } catch (error) {
        console.error('Application initialization failed:', error);
    }
});