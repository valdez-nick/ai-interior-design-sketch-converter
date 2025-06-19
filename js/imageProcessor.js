/**
 * Image Processor Module
 * Handles image loading, canvas operations, and coordinate transformations
 */

class ImageProcessor {
    constructor(originalCanvas, resultCanvas) {
        this.originalCanvas = originalCanvas;
        this.resultCanvas = resultCanvas;
        this.originalCtx = originalCanvas.getContext('2d');
        this.resultCtx = resultCanvas.getContext('2d');
        this.imageData = null;
        this.originalImage = null;
    }

    /**
     * Load and display image on canvas
     */
    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    this.originalImage = img;
                    this.setupCanvas(img);
                    this.drawOriginal();
                    resolve(img);
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Setup canvas dimensions based on image
     */
    setupCanvas(img) {
        // Set maximum dimensions to prevent performance issues
        const maxWidth = 1200;
        const maxHeight = 800;
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if necessary
        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
                width = maxWidth;
                height = maxWidth / aspectRatio;
            } else {
                height = maxHeight;
                width = maxHeight * aspectRatio;
            }
        }
        
        // Set canvas dimensions
        this.originalCanvas.width = width;
        this.originalCanvas.height = height;
        this.resultCanvas.width = width;
        this.resultCanvas.height = height;
        
        // Store dimensions
        this.width = width;
        this.height = height;
    }

    /**
     * Draw original image on canvas
     */
    drawOriginal() {
        this.originalCtx.drawImage(this.originalImage, 0, 0, this.width, this.height);
        this.imageData = this.originalCtx.getImageData(0, 0, this.width, this.height);
    }

    /**
     * Get image data for processing
     */
    getImageData() {
        return this.imageData;
    }

    /**
     * Convert image to grayscale
     */
    toGrayscale(imageData) {
        const data = imageData.data;
        const grayscaleData = new ImageData(this.width, this.height);
        const grayData = grayscaleData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Use luminance formula for better grayscale conversion
            const gray = Math.round(
                0.299 * data[i] +     // Red
                0.587 * data[i + 1] + // Green
                0.114 * data[i + 2]   // Blue
            );
            
            grayData[i] = gray;
            grayData[i + 1] = gray;
            grayData[i + 2] = gray;
            grayData[i + 3] = data[i + 3]; // Alpha
        }
        
        return grayscaleData;
    }

    /**
     * Clear result canvas
     */
    clearResult() {
        this.resultCtx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Draw processed image data to result canvas
     */
    drawResult(imageData) {
        this.resultCtx.putImageData(imageData, 0, 0);
    }

    /**
     * Get pixel value at specific coordinates
     */
    getPixel(imageData, x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
        
        const index = (y * this.width + x) * 4;
        const data = imageData.data;
        
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
    }

    /**
     * Set pixel value at specific coordinates
     */
    setPixel(imageData, x, y, color) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        
        const index = (y * this.width + x) * 4;
        const data = imageData.data;
        
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = color.a !== undefined ? color.a : 255;
    }

    /**
     * Apply Gaussian blur for noise reduction
     */
    gaussianBlur(imageData, radius = 1) {
        const kernel = this.createGaussianKernel(radius);
        return this.convolve(imageData, kernel);
    }

    /**
     * Create Gaussian kernel for blur
     */
    createGaussianKernel(radius) {
        const size = radius * 2 + 1;
        const kernel = [];
        const sigma = radius / 3;
        let sum = 0;
        
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                kernel.push(value);
                sum += value;
            }
        }
        
        // Normalize kernel
        return kernel.map(value => value / sum);
    }

    /**
     * Generic convolution operation
     */
    convolve(imageData, kernel) {
        const kernelSize = Math.sqrt(kernel.length);
        const radius = Math.floor(kernelSize / 2);
        const result = new ImageData(this.width, this.height);
        const src = imageData.data;
        const dst = result.data;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let r = 0, g = 0, b = 0;
                let kernelIndex = 0;
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const px = Math.min(Math.max(x + kx, 0), this.width - 1);
                        const py = Math.min(Math.max(y + ky, 0), this.height - 1);
                        const idx = (py * this.width + px) * 4;
                        
                        r += src[idx] * kernel[kernelIndex];
                        g += src[idx + 1] * kernel[kernelIndex];
                        b += src[idx + 2] * kernel[kernelIndex];
                        kernelIndex++;
                    }
                }
                
                const dstIdx = (y * this.width + x) * 4;
                dst[dstIdx] = Math.round(r);
                dst[dstIdx + 1] = Math.round(g);
                dst[dstIdx + 2] = Math.round(b);
                dst[dstIdx + 3] = src[dstIdx + 3];
            }
        }
        
        return result;
    }

    /**
     * Download result canvas as image
     */
    downloadResult(filename = 'hand-drawn-result.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.resultCanvas.toDataURL();
        link.click();
    }
}