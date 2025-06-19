/**
 * Simple Upload Handler - Standalone upload functionality
 * This runs independently of other modules to ensure upload always works
 */

(function() {
    'use strict';
    
    console.log('Simple upload handler loading...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimpleUpload);
    } else {
        initSimpleUpload();
    }
    
    function initSimpleUpload() {
        console.log('Initializing simple upload...');
        
        // Get DOM elements
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const workspace = document.getElementById('workspace');
        const originalCanvas = document.getElementById('originalCanvas');
        const resultCanvas = document.getElementById('resultCanvas');
        
        // Check if elements exist
        if (!uploadArea || !fileInput) {
            console.error('Upload elements not found!');
            return;
        }
        
        console.log('Upload elements found, setting up listeners...');
        
        // Remove any existing listeners
        uploadArea.onclick = null;
        fileInput.onchange = null;
        uploadArea.ondragover = null;
        uploadArea.ondrop = null;
        uploadArea.ondragleave = null;
        
        // Set up click handler
        uploadArea.addEventListener('click', function() {
            console.log('Upload area clicked');
            fileInput.click();
        });
        
        // Set up file input change handler
        fileInput.addEventListener('change', function(e) {
            console.log('File input changed');
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                console.log('Valid image file selected:', file.name);
                handleFileUpload(file);
            } else {
                console.warn('Invalid file type');
                alert('Please select an image file (PNG, JPG, etc.)');
            }
        });
        
        // Set up drag and drop handlers
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
            console.log('Drag over');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            console.log('Drag leave');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            console.log('File dropped');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                console.log('Valid image file dropped:', files[0].name);
                handleFileUpload(files[0]);
            } else {
                console.warn('Invalid file type dropped');
                alert('Please drop an image file (PNG, JPG, etc.)');
            }
        });
        
        console.log('Simple upload handlers set up successfully');
        
        // Handle file upload
        function handleFileUpload(file) {
            console.log('Processing file upload:', file.name);
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    console.log('Image loaded:', img.width, 'x', img.height);
                    
                    // Show workspace
                    if (workspace) {
                        workspace.style.display = 'grid';
                    }
                    if (uploadArea.parentElement) {
                        uploadArea.parentElement.style.display = 'none';
                    }
                    
                    // Set up canvases if they exist
                    if (originalCanvas && resultCanvas) {
                        // Set canvas dimensions
                        const maxSize = 800; // Limit size for performance
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > maxSize || height > maxSize) {
                            const ratio = Math.min(maxSize / width, maxSize / height);
                            width *= ratio;
                            height *= ratio;
                        }
                        
                        originalCanvas.width = width;
                        originalCanvas.height = height;
                        resultCanvas.width = width;
                        resultCanvas.height = height;
                        
                        // Draw original image
                        const originalCtx = originalCanvas.getContext('2d');
                        originalCtx.drawImage(img, 0, 0, width, height);
                        
                        // Copy to result canvas
                        const resultCtx = resultCanvas.getContext('2d');
                        resultCtx.drawImage(img, 0, 0, width, height);
                        
                        console.log('Image displayed on canvases');
                        
                        // Enable any process buttons
                        const processBtn = document.getElementById('processBtn');
                        if (processBtn) {
                            processBtn.disabled = false;
                        }
                        
                        // Show success message
                        showMessage('Image loaded successfully! Use the controls to apply hand-drawn effects.', 'success');
                    } else {
                        console.warn('Canvases not found');
                        showMessage('Image loaded but display canvases not found.', 'warning');
                    }
                };
                
                img.onerror = function() {
                    console.error('Failed to load image');
                    showMessage('Failed to load image. Please try another file.', 'error');
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                console.error('Failed to read file');
                showMessage('Failed to read file. Please try another file.', 'error');
            };
            
            reader.readAsDataURL(file);
        }
        
        // Show message to user
        function showMessage(message, type = 'info') {
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Create or update message element
            let messageEl = document.getElementById('upload-message');
            if (!messageEl) {
                messageEl = document.createElement('div');
                messageEl.id = 'upload-message';
                messageEl.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                    z-index: 10000;
                    max-width: 300px;
                `;
                document.body.appendChild(messageEl);
            }
            
            // Set color based on type
            const colors = {
                success: '#28a745',
                error: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8'
            };
            
            messageEl.style.backgroundColor = colors[type] || colors.info;
            messageEl.textContent = message;
            messageEl.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (messageEl && messageEl.parentNode) {
                    messageEl.style.display = 'none';
                }
            }, 5000);
        }
    }
    
    console.log('Simple upload handler script loaded');
})();