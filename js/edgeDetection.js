/**
 * Edge Detection Module
 * Implements Sobel and Canny edge detection algorithms for architectural drawings
 */

class EdgeDetection {
    constructor() {
        // Sobel operators
        this.sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        this.sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
    }

    /**
     * Apply Sobel edge detection
     */
    detectEdges(imageData, threshold = 30) {
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const edges = new ImageData(width, height);
        const dst = edges.data;
        
        // Initialize output as white
        for (let i = 0; i < dst.length; i += 4) {
            dst[i] = 255;
            dst[i + 1] = 255;
            dst[i + 2] = 255;
            dst[i + 3] = 255;
        }
        
        // Apply Sobel operator
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const gx = this.sobelConvolution(src, x, y, width, this.sobelX);
                const gy = this.sobelConvolution(src, x, y, width, this.sobelY);
                
                // Calculate gradient magnitude
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                
                if (magnitude > threshold) {
                    const idx = (y * width + x) * 4;
                    // Draw black edge
                    dst[idx] = 0;
                    dst[idx + 1] = 0;
                    dst[idx + 2] = 0;
                    dst[idx + 3] = 255;
                }
            }
        }
        
        return edges;
    }

    /**
     * Sobel convolution at a specific pixel
     */
    sobelConvolution(data, x, y, width, kernel) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const px = x + kx;
                const py = y + ky;
                const idx = (py * width + px) * 4;
                
                // Use grayscale value (assuming already converted)
                const pixel = data[idx];
                sum += pixel * kernel[ky + 1][kx + 1];
            }
        }
        
        return sum;
    }

    /**
     * Enhanced edge detection for architectural drawings
     * Combines multiple techniques for better line detection
     */
    detectArchitecturalEdges(imageData, settings = {}) {
        const {
            threshold = 30,
            blur = true,
            thinning = true
        } = settings;
        
        // Get edges using Sobel
        let edges = this.detectEdges(imageData, threshold);
        
        // Apply morphological thinning if requested
        if (thinning) {
            edges = this.morphologicalThinning(edges);
        }
        
        return edges;
    }

    /**
     * Morphological thinning to create single-pixel wide lines
     */
    morphologicalThinning(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const src = new Uint8ClampedArray(imageData.data);
        const dst = imageData.data;
        
        let changed = true;
        let iterations = 0;
        const maxIterations = 20;
        
        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;
            
            // First sub-iteration
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = (y * width + x) * 4;
                    
                    if (src[idx] === 0 && this.canRemovePixel(src, x, y, width, 0)) {
                        dst[idx] = 255;
                        dst[idx + 1] = 255;
                        dst[idx + 2] = 255;
                        changed = true;
                    }
                }
            }
            
            // Copy result back to source
            src.set(dst);
            
            // Second sub-iteration
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = (y * width + x) * 4;
                    
                    if (src[idx] === 0 && this.canRemovePixel(src, x, y, width, 1)) {
                        dst[idx] = 255;
                        dst[idx + 1] = 255;
                        dst[idx + 2] = 255;
                        changed = true;
                    }
                }
            }
            
            // Copy result back to source
            src.set(dst);
        }
        
        return imageData;
    }

    /**
     * Check if a pixel can be removed during thinning
     */
    canRemovePixel(data, x, y, width, iteration) {
        // Get 8-connected neighbors
        const neighbors = this.getNeighbors(data, x, y, width);
        
        // Count transitions from white to black
        let transitions = 0;
        for (let i = 0; i < 8; i++) {
            const current = neighbors[i];
            const next = neighbors[(i + 1) % 8];
            if (current === 255 && next === 0) {
                transitions++;
            }
        }
        
        // Count black neighbors
        const blackCount = neighbors.filter(n => n === 0).length;
        
        // Zhang-Suen conditions
        if (blackCount < 2 || blackCount > 6) return false;
        if (transitions !== 1) return false;
        
        // Sub-iteration specific conditions
        if (iteration === 0) {
            // P2 * P4 * P6 = 0
            if (neighbors[0] === 0 && neighbors[2] === 0 && neighbors[4] === 0) return false;
            // P4 * P6 * P8 = 0
            if (neighbors[2] === 0 && neighbors[4] === 0 && neighbors[6] === 0) return false;
        } else {
            // P2 * P4 * P8 = 0
            if (neighbors[0] === 0 && neighbors[2] === 0 && neighbors[6] === 0) return false;
            // P2 * P6 * P8 = 0
            if (neighbors[0] === 0 && neighbors[4] === 0 && neighbors[6] === 0) return false;
        }
        
        return true;
    }

    /**
     * Get 8-connected neighbors of a pixel
     */
    getNeighbors(data, x, y, width) {
        const neighbors = [];
        const positions = [
            [-1, -1], [0, -1], [1, -1],
            [1, 0], [1, 1], [0, 1],
            [-1, 1], [-1, 0]
        ];
        
        for (const [dx, dy] of positions) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(data[idx]);
        }
        
        return neighbors;
    }

    /**
     * Non-maximum suppression for edge thinning
     */
    nonMaximumSuppression(magnitudes, directions, width, height) {
        const suppressed = new Float32Array(width * height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const angle = directions[idx];
                const mag = magnitudes[idx];
                
                // Determine neighbors based on gradient direction
                let n1, n2;
                
                if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 || angle < -157.5)) {
                    // Horizontal edge
                    n1 = magnitudes[idx - 1];
                    n2 = magnitudes[idx + 1];
                } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
                    // Diagonal /
                    n1 = magnitudes[(y - 1) * width + x + 1];
                    n2 = magnitudes[(y + 1) * width + x - 1];
                } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
                    // Vertical edge
                    n1 = magnitudes[(y - 1) * width + x];
                    n2 = magnitudes[(y + 1) * width + x];
                } else {
                    // Diagonal \
                    n1 = magnitudes[(y - 1) * width + x - 1];
                    n2 = magnitudes[(y + 1) * width + x + 1];
                }
                
                // Keep only if local maximum
                if (mag >= n1 && mag >= n2) {
                    suppressed[idx] = mag;
                }
            }
        }
        
        return suppressed;
    }
}