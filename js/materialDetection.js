/**
 * Material Detection Module
 * Identifies and categorizes materials in interior design images
 */

class MaterialDetection {
    constructor() {
        this.materials = {
            wood: {
                keywords: ['wood', 'timber', 'oak', 'pine', 'mahogany', 'teak', 'walnut'],
                colors: [[139, 69, 19], [160, 82, 45], [205, 133, 63], [222, 184, 135]],
                textures: ['grain', 'plank', 'board'],
                confidence: 0
            },
            fabric: {
                keywords: ['fabric', 'textile', 'cotton', 'linen', 'velvet', 'silk', 'upholstery'],
                colors: [[128, 128, 128], [255, 255, 255], [0, 0, 0]],
                textures: ['soft', 'woven', 'fuzzy'],
                confidence: 0
            },
            metal: {
                keywords: ['metal', 'steel', 'aluminum', 'brass', 'iron', 'chrome', 'copper'],
                colors: [[192, 192, 192], [255, 215, 0], [184, 115, 51], [128, 128, 128]],
                textures: ['smooth', 'brushed', 'polished'],
                confidence: 0
            },
            glass: {
                keywords: ['glass', 'window', 'mirror', 'transparent', 'crystal'],
                colors: [[173, 216, 230], [255, 255, 255], [0, 191, 255]],
                textures: ['transparent', 'reflective', 'smooth'],
                confidence: 0
            },
            stone: {
                keywords: ['stone', 'marble', 'granite', 'concrete', 'tile', 'ceramic'],
                colors: [[128, 128, 128], [255, 255, 255], [169, 169, 169], [105, 105, 105]],
                textures: ['rough', 'smooth', 'veined', 'speckled'],
                confidence: 0
            },
            leather: {
                keywords: ['leather', 'hide', 'suede'],
                colors: [[139, 69, 19], [160, 82, 45], [0, 0, 0], [255, 255, 255]],
                textures: ['smooth', 'textured', 'aged'],
                confidence: 0
            }
        };
        this.detectionThreshold = 0.6;
    }

    /**
     * Analyze image for material presence
     * @param {ImageData} imageData - Canvas image data
     * @param {Object} options - Detection options
     * @returns {Object} Detected materials with confidence scores
     */
    async detectMaterials(imageData, options = {}) {
        const { width, height, data } = imageData;
        const results = {};
        
        try {
            // Reset confidence scores
            Object.keys(this.materials).forEach(material => {
                this.materials[material].confidence = 0;
            });

            // Analyze color distribution
            const colorAnalysis = this.analyzeColors(data, width, height);
            
            // Analyze texture patterns
            const textureAnalysis = this.analyzeTextures(data, width, height);
            
            // Combine analyses for material detection
            for (const [materialName, material] of Object.entries(this.materials)) {
                let confidence = 0;
                
                // Color matching score
                const colorScore = this.calculateColorMatch(colorAnalysis, material.colors);
                confidence += colorScore * 0.4;
                
                // Texture pattern score
                const textureScore = this.calculateTextureMatch(textureAnalysis, material.textures);
                confidence += textureScore * 0.3;
                
                // Edge pattern score (useful for wood grain, fabric weave, etc.)
                const edgeScore = this.calculateEdgePatterns(data, width, height, materialName);
                confidence += edgeScore * 0.3;
                
                // Normalize confidence
                confidence = Math.min(confidence, 1.0);
                material.confidence = confidence;
                
                // Only include materials above threshold
                if (confidence >= this.detectionThreshold) {
                    results[materialName] = {
                        confidence: Math.round(confidence * 100),
                        regions: this.findMaterialRegions(data, width, height, materialName),
                        properties: {
                            dominantColors: this.getDominantColors(colorAnalysis, material.colors),
                            textureType: this.getTextureType(textureAnalysis, material.textures),
                            coverage: this.calculateCoverage(data, width, height, materialName)
                        }
                    };
                }
            }
            
            return {
                success: true,
                materials: results,
                summary: this.generateSummary(results),
                processingTime: Date.now()
            };
            
        } catch (error) {
            console.error('Material detection failed:', error);
            return {
                success: false,
                error: error.message,
                materials: {}
            };
        }
    }

    /**
     * Analyze color distribution in image
     */
    analyzeColors(data, width, height) {
        const colorBuckets = new Map();
        const sampleStep = 4; // Sample every 4th pixel for performance
        
        for (let i = 0; i < data.length; i += sampleStep * 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Group similar colors
            const colorKey = `${Math.floor(r/20)*20},${Math.floor(g/20)*20},${Math.floor(b/20)*20}`;
            colorBuckets.set(colorKey, (colorBuckets.get(colorKey) || 0) + 1);
        }
        
        return Array.from(colorBuckets.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([color, count]) => {
                const [r, g, b] = color.split(',').map(Number);
                return { r, g, b, count };
            });
    }

    /**
     * Analyze texture patterns
     */
    analyzeTextures(data, width, height) {
        const textures = {
            smooth: 0,
            rough: 0,
            patterned: 0,
            directional: 0
        };
        
        // Sample patches for texture analysis
        const patchSize = 32;
        const step = patchSize / 2;
        
        for (let y = 0; y < height - patchSize; y += step) {
            for (let x = 0; x < width - patchSize; x += step) {
                const patch = this.extractPatch(data, width, x, y, patchSize);
                const textureScore = this.analyzePatchTexture(patch);
                
                textures.smooth += textureScore.smooth;
                textures.rough += textureScore.rough;
                textures.patterned += textureScore.patterned;
                textures.directional += textureScore.directional;
            }
        }
        
        // Normalize scores
        const total = Object.values(textures).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
            Object.keys(textures).forEach(key => {
                textures[key] = textures[key] / total;
            });
        }
        
        return textures;
    }

    /**
     * Extract a patch from image data
     */
    extractPatch(data, width, x, y, size) {
        const patch = [];
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                const idx = ((y + py) * width + (x + px)) * 4;
                patch.push(data[idx]); // Just red channel for simplicity
            }
        }
        return patch;
    }

    /**
     * Analyze texture characteristics of a patch
     */
    analyzePatchTexture(patch) {
        const size = Math.sqrt(patch.length);
        let variance = 0;
        let horizontalEdges = 0;
        let verticalEdges = 0;
        let patterns = 0;
        
        // Calculate variance (smoothness indicator)
        const mean = patch.reduce((sum, val) => sum + val, 0) / patch.length;
        variance = patch.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / patch.length;
        
        // Detect directional patterns
        for (let y = 0; y < size - 1; y++) {
            for (let x = 0; x < size - 1; x++) {
                const idx = y * size + x;
                const current = patch[idx];
                const right = patch[idx + 1];
                const down = patch[idx + size];
                
                horizontalEdges += Math.abs(current - right);
                verticalEdges += Math.abs(current - down);
            }
        }
        
        // Simple pattern detection (repeating elements)
        patterns = this.detectRepeatingPatterns(patch, size);
        
        return {
            smooth: Math.max(0, 1 - variance / 10000),
            rough: Math.min(1, variance / 5000),
            patterned: patterns,
            directional: Math.abs(horizontalEdges - verticalEdges) / Math.max(horizontalEdges, verticalEdges, 1)
        };
    }

    /**
     * Simple pattern detection
     */
    detectRepeatingPatterns(patch, size) {
        // Look for repeating horizontal or vertical patterns
        let repeatScore = 0;
        const quarterSize = Math.floor(size / 4);
        
        // Check horizontal repetition
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < quarterSize; x++) {
                const val1 = patch[y * size + x];
                const val2 = patch[y * size + x + quarterSize];
                const val3 = patch[y * size + x + quarterSize * 2];
                
                // If values are similar, it suggests a pattern
                if (Math.abs(val1 - val2) < 20 && Math.abs(val2 - val3) < 20) {
                    repeatScore++;
                }
            }
        }
        
        return Math.min(1, repeatScore / (size * quarterSize));
    }

    /**
     * Calculate color match score for a material
     */
    calculateColorMatch(colorAnalysis, materialColors) {
        let maxMatch = 0;
        
        for (const detectedColor of colorAnalysis.slice(0, 5)) {
            for (const materialColor of materialColors) {
                const distance = Math.sqrt(
                    Math.pow(detectedColor.r - materialColor[0], 2) +
                    Math.pow(detectedColor.g - materialColor[1], 2) +
                    Math.pow(detectedColor.b - materialColor[2], 2)
                );
                
                // Convert distance to similarity score
                const similarity = Math.max(0, 1 - distance / 441.67); // Max distance is sqrt(255^2 * 3)
                maxMatch = Math.max(maxMatch, similarity);
            }
        }
        
        return maxMatch;
    }

    /**
     * Calculate texture match score
     */
    calculateTextureMatch(textureAnalysis, materialTextures) {
        const textureMapping = {
            'grain': 'directional',
            'soft': 'smooth',
            'sharp': 'rough',
            'clean': 'smooth',
            'textured': 'rough',
            'smooth': 'smooth',
            'rough': 'rough',
            'patterned': 'patterned'
        };
        
        let totalScore = 0;
        let count = 0;
        
        for (const texture of materialTextures) {
            const mappedTexture = textureMapping[texture];
            if (mappedTexture && textureAnalysis[mappedTexture] !== undefined) {
                totalScore += textureAnalysis[mappedTexture];
                count++;
            }
        }
        
        return count > 0 ? totalScore / count : 0;
    }

    /**
     * Calculate edge patterns specific to materials
     */
    calculateEdgePatterns(data, width, height, materialName) {
        // Simplified edge pattern analysis
        // In a full implementation, this would use more sophisticated computer vision
        
        const patterns = {
            wood: 0.3,    // Wood grain creates directional patterns
            fabric: 0.2,  // Fabric has softer, less defined edges
            metal: 0.7,   // Metal has sharp, well-defined edges
            glass: 0.8,   // Glass has very sharp edges and reflections
            stone: 0.4,   // Stone has irregular but defined edges
            leather: 0.3  // Leather has soft but visible texture
        };
        
        return patterns[materialName] || 0.2;
    }

    /**
     * Find regions where material is likely present
     */
    findMaterialRegions(data, width, height, materialName) {
        // Simplified region detection - returns sample regions
        // In production, would use segmentation algorithms
        
        return [
            { x: 0.1, y: 0.1, width: 0.3, height: 0.3, confidence: 0.8 },
            { x: 0.6, y: 0.4, width: 0.2, height: 0.4, confidence: 0.7 }
        ];
    }

    /**
     * Get dominant colors for a material
     */
    getDominantColors(colorAnalysis, materialColors) {
        return colorAnalysis.slice(0, 3).map(color => ({
            r: color.r,
            g: color.g,
            b: color.b,
            percentage: Math.round((color.count / colorAnalysis[0].count) * 100)
        }));
    }

    /**
     * Determine texture type
     */
    getTextureType(textureAnalysis, materialTextures) {
        const maxTexture = Object.entries(textureAnalysis)
            .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: '', value: 0 });
        
        return maxTexture.key;
    }

    /**
     * Calculate material coverage percentage
     */
    calculateCoverage(data, width, height, materialName) {
        // Simplified coverage calculation
        return Math.floor(Math.random() * 30) + 10; // 10-40% range for demo
    }

    /**
     * Generate summary of detected materials
     */
    generateSummary(results) {
        const detected = Object.keys(results);
        const primary = detected.reduce((max, material) => 
            results[material].confidence > (results[max]?.confidence || 0) ? material : max, '');
        
        return {
            totalMaterials: detected.length,
            primaryMaterial: primary,
            averageConfidence: detected.length > 0 ? 
                Math.round(detected.reduce((sum, mat) => sum + results[mat].confidence, 0) / detected.length) : 0,
            detectedMaterials: detected
        };
    }

    /**
     * Set detection threshold
     */
    setThreshold(threshold) {
        this.detectionThreshold = Math.max(0, Math.min(1, threshold / 100));
    }

    /**
     * Get material styling recommendations
     */
    getMaterialStyleRecommendations(detectedMaterials) {
        const recommendations = {};
        
        for (const [material, data] of Object.entries(detectedMaterials)) {
            recommendations[material] = {
                lineStyle: this.materials[material]?.textures[0] || 'normal',
                emphasis: data.confidence > 80 ? 'high' : 'medium',
                preservation: true,
                colorHints: data.properties.dominantColors
            };
        }
        
        return recommendations;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialDetection;
} else {
    window.MaterialDetection = MaterialDetection;
}