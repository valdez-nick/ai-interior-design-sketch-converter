/**
 * Main Application Module
 * Coordinates the image processing pipeline and UI interactions
 */

// Initialize global variables
let imageProcessor;
let edgeDetector;
let handDrawnEffects;
let aiProcessor;
let styleManager;
let currentImageData = null;
let isProcessing = false;

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

// Initialize modules
function init() {
    // Initialize AI processor if available
    try {
        aiProcessor = new AIProcessor();
        console.log('AI Processor initialized successfully');
    } catch (error) {
        console.warn('AI Processor not available:', error.message);
        aiProcessor = null;
    }
    
    // Initialize core modules
    imageProcessor = new ImageProcessor(originalCanvas, resultCanvas);
    edgeDetector = new EdgeDetection();
    handDrawnEffects = new HandDrawnEffects(resultCanvas, {
        aiProcessor: aiProcessor,
        useAI: true,
        interiorMode: true,
        materialAwareness: true,
        furniturePreservation: true
    });
    
    // Initialize style manager with AI integration
    try {
        styleManager = new StyleManager(aiProcessor, handDrawnEffects);
        console.log('Style Manager initialized with AI integration');
    } catch (error) {
        console.warn('Style Manager not available:', error.message);
        styleManager = null;
    }
    
    setupEventListeners();
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
    
    // Range input events
    edgeThreshold.addEventListener('input', updateRangeDisplay);
    lineVariation.addEventListener('input', updateRangeDisplay);
    lineThickness.addEventListener('input', updateRangeDisplay);
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
        await imageProcessor.loadImage(file);
        currentImageData = imageProcessor.getImageData();
        
        // Show workspace and hide upload area
        workspace.style.display = 'grid';
        uploadArea.style.display = 'none';
        
        // Enable process button
        processBtn.disabled = false;
        
        // Auto-process with default settings
        await processImage();
    } catch (error) {
        console.error('Error loading image:', error);
        alert('Failed to load image. Please try another file.');
    }
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
            // Convert to grayscale
            const grayscaleData = imageProcessor.toGrayscale(currentImageData);
            
            // Apply slight blur for noise reduction
            const blurredData = imageProcessor.gaussianBlur(grayscaleData, 1);
            
            // Detect edges
            const edges = edgeDetector.detectArchitecturalEdges(blurredData, {
                threshold: parseInt(edgeThreshold.value),
                blur: true,
                thinning: true
            });
            
            // Apply hand-drawn effect (now async)
            const result = await handDrawnEffects.applyHandDrawnEffect(edges, {
                style: stylePreset.value,
                lineVariation: parseInt(lineVariation.value),
                lineThickness: parseFloat(lineThickness.value),
                texture: true
            });
            
            // Display result
            imageProcessor.drawResult(result);
            
            // Enable download button
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image. Please try adjusting the settings.');
        } finally {
            isProcessing = false;
            processBtn.disabled = false;
            processingOverlay.style.display = 'none';
        }
    }, 100);
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

// Download result
function downloadResult() {
    if (!downloadBtn.disabled) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        imageProcessor.downloadResult(`hand-drawn-${timestamp}.png`);
    }
}

// Update range display value
function updateRangeDisplay(e) {
    const input = e.target;
    const display = input.nextElementSibling;
    if (display && display.classList.contains('value-display')) {
        display.textContent = input.value;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);