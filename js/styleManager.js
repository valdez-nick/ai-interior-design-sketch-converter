/**
 * Style Management Module for Interior Design Applications
 * Handles style presets, color palettes, AI integration, and material-aware styling
 * Integrates with AIProcessor for enhanced style processing capabilities
 */

class StyleManager {
    constructor(aiProcessor = null, handDrawnEffects = null) {
        this.aiProcessor = aiProcessor;
        this.handDrawnEffects = handDrawnEffects;
        
        // Storage keys for localStorage persistence
        this.storageKeys = {
            customPresets: 'interiorDesign_customPresets',
            userPalettes: 'interiorDesign_userPalettes',
            styleHistory: 'interiorDesign_styleHistory',
            batchSettings: 'interiorDesign_batchSettings'
        };
        
        // Interior design specific color palettes
        this.colorPalettes = {
            warm: {
                name: 'Warm & Cozy',
                description: 'Warm tones for inviting spaces',
                colors: {
                    primary: '#8B4513',      // Saddle Brown
                    secondary: '#CD853F',    // Peru
                    accent: '#D2691E',       // Chocolate
                    neutral: '#F5DEB3',      // Wheat
                    highlight: '#FFE4B5',    // Moccasin
                    shadow: '#696969'        // Dim Gray
                },
                materials: {
                    wood: '#8B4513',
                    fabric: '#CD853F',
                    metal: '#B8860B',
                    stone: '#A0522D'
                }
            },
            cool: {
                name: 'Cool & Modern',
                description: 'Cool tones for contemporary spaces',
                colors: {
                    primary: '#2F4F4F',      // Dark Slate Gray
                    secondary: '#708090',    // Slate Gray
                    accent: '#4682B4',       // Steel Blue
                    neutral: '#E6E6FA',      // Lavender
                    highlight: '#F0F8FF',    // Alice Blue
                    shadow: '#2F2F2F'        // Dark Gray
                },
                materials: {
                    wood: '#696969',
                    fabric: '#4682B4',
                    metal: '#708090',
                    stone: '#2F4F4F'
                }
            },
            neutral: {
                name: 'Neutral Balance',
                description: 'Balanced neutrals for versatile designs',
                colors: {
                    primary: '#5D5D5D',      // Charcoal
                    secondary: '#8F8F8F',    // Gray
                    accent: '#A9A9A9',       // Dark Gray
                    neutral: '#F5F5F5',      // White Smoke
                    highlight: '#FFFFFF',    // White
                    shadow: '#404040'        // Dark Gray
                },
                materials: {
                    wood: '#8B7355',
                    fabric: '#A9A9A9',
                    metal: '#808080',
                    stone: '#696969'
                }
            },
            dramatic: {
                name: 'Dramatic Contrast',
                description: 'High contrast for bold statements',
                colors: {
                    primary: '#000000',      // Black
                    secondary: '#2F2F2F',    // Very Dark Gray
                    accent: '#8B0000',       // Dark Red
                    neutral: '#DCDCDC',      // Gainsboro
                    highlight: '#FFFFFF',    // White
                    shadow: '#1C1C1C'        // Near Black
                },
                materials: {
                    wood: '#2F2F2F',
                    fabric: '#8B0000',
                    metal: '#000000',
                    stone: '#404040'
                }
            }
        };
        
        // Built-in style presets with interior design focus
        this.builtInPresets = {
            'residential-presentation': {
                name: 'Residential Presentation',
                description: 'Professional presentation style for residential projects',
                category: 'presentation',
                aiStyle: 'designer-presentation',
                fallbackStyle: 'pen',
                palette: 'neutral',
                lineWeight: 1.5,
                materialAwareness: true,
                settings: {
                    edgeThreshold: 25,
                    lineVariation: 30,
                    contrast: 0.8,
                    texture: true,
                    preserveDetails: true
                },
                aiParameters: {
                    controlnetWeight: 0.8,
                    denoisingStrength: 0.7,
                    cfg: 7.5
                }
            },
            'concept-sketch': {
                name: 'Concept Sketch',
                description: 'Loose conceptual sketches for design exploration',
                category: 'concept',
                aiStyle: 'concept-exploration',
                fallbackStyle: 'pencil',
                palette: 'warm',
                lineWeight: 2.0,
                materialAwareness: false,
                settings: {
                    edgeThreshold: 35,
                    lineVariation: 60,
                    contrast: 0.6,
                    texture: true,
                    preserveDetails: false
                },
                aiParameters: {
                    controlnetWeight: 0.6,
                    denoisingStrength: 0.85,
                    cfg: 6.0
                }
            },
            'technical-documentation': {
                name: 'Technical Documentation',
                description: 'Precise technical drawings for documentation',
                category: 'technical',
                aiStyle: 'technical-documentation',
                fallbackStyle: 'technical',
                palette: 'neutral',
                lineWeight: 1.0,
                materialAwareness: true,
                settings: {
                    edgeThreshold: 20,
                    lineVariation: 10,
                    contrast: 1.0,
                    texture: false,
                    preserveDetails: true
                },
                aiParameters: {
                    controlnetWeight: 0.9,
                    denoisingStrength: 0.6,
                    cfg: 8.0
                }
            },
            'artistic-mood': {
                name: 'Artistic Mood',
                description: 'Expressive artistic style for mood illustrations',
                category: 'artistic',
                aiStyle: 'artistic-mood',
                fallbackStyle: 'charcoal',
                palette: 'dramatic',
                lineWeight: 2.5,
                materialAwareness: true,
                settings: {
                    edgeThreshold: 40,
                    lineVariation: 80,
                    contrast: 0.7,
                    texture: true,
                    preserveDetails: false
                },
                aiParameters: {
                    controlnetWeight: 0.7,
                    denoisingStrength: 0.8,
                    cfg: 6.5
                }
            },
            'minimal-lines': {
                name: 'Minimal Lines',
                description: 'Clean minimal line art for modern aesthetics',
                category: 'minimal',
                aiStyle: 'architectural-lines',
                fallbackStyle: 'pen',
                palette: 'cool',
                lineWeight: 1.2,
                materialAwareness: false,
                settings: {
                    edgeThreshold: 15,
                    lineVariation: 5,
                    contrast: 0.9,
                    texture: false,
                    preserveDetails: true
                },
                aiParameters: {
                    controlnetWeight: 0.85,
                    denoisingStrength: 0.65,
                    cfg: 7.0
                }
            }
        };
        
        // Initialize custom presets and user data
        this.customPresets = this.loadCustomPresets();
        this.userPalettes = this.loadUserPalettes();
        this.styleHistory = this.loadStyleHistory();
        this.batchSettings = this.loadBatchSettings();
        
        // Current batch processing state
        this.currentBatch = {
            images: [],
            settings: null,
            results: [],
            isProcessing: false
        };
    }

    /**
     * Get all available style presets (built-in + custom)
     */
    getAllPresets() {
        return {
            builtin: this.builtInPresets,
            custom: this.customPresets
        };
    }

    /**
     * Get preset by ID
     */
    getPreset(presetId) {
        return this.builtInPresets[presetId] || this.customPresets[presetId] || null;
    }

    /**
     * Get available color palettes
     */
    getColorPalettes() {
        return {
            builtin: this.colorPalettes,
            custom: this.userPalettes
        };
    }

    /**
     * Get color palette by name
     */
    getColorPalette(paletteName) {
        return this.colorPalettes[paletteName] || this.userPalettes[paletteName] || null;
    }

    /**
     * Apply style to image with AI integration and fallback
     */
    async applyStyle(imageData, presetId, options = {}) {
        const preset = this.getPreset(presetId);
        if (!preset) {
            throw new Error(`Style preset '${presetId}' not found`);
        }

        const startTime = Date.now();
        let result;
        let method = 'fallback';

        try {
            // Attempt AI processing if AIProcessor is available
            if (this.aiProcessor && preset.aiStyle) {
                const aiOptions = {
                    ...preset.aiParameters,
                    ...options,
                    width: options.width || 512,
                    height: options.height || 512,
                    quality: options.quality || 'medium'
                };

                const aiResult = await this.aiProcessor.processImage(
                    imageData,
                    preset.aiStyle,
                    aiOptions
                );

                if (aiResult.success) {
                    result = aiResult.imageData;
                    method = aiResult.method;
                } else {
                    throw new Error('AI processing failed');
                }
            } else {
                throw new Error('AI processing not available');
            }
        } catch (error) {
            console.warn('AI processing failed, using fallback:', error.message);
            
            // Fallback to traditional processing
            if (this.handDrawnEffects) {
                const fallbackSettings = {
                    style: preset.fallbackStyle,
                    lineVariation: preset.settings.lineVariation,
                    lineThickness: preset.lineWeight,
                    texture: preset.settings.texture,
                    ...options
                };

                result = await this.handDrawnEffects.applyHandDrawnEffect(
                    imageData,
                    fallbackSettings
                );
                method = 'fallback';
            } else {
                throw new Error('No processing method available');
            }
        }

        // Apply color palette if specified
        if (preset.palette && options.applyPalette !== false) {
            result = this.applyColorPalette(result, preset.palette, preset.materialAwareness);
        }

        // Record style application in history
        this.recordStyleApplication(presetId, method, Date.now() - startTime);

        return {
            success: true,
            imageData: result,
            method,
            preset: presetId,
            processingTime: Date.now() - startTime,
            metadata: {
                style: preset.name,
                palette: preset.palette,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Apply color palette to processed image
     */
    applyColorPalette(imageData, paletteName, materialAware = false) {
        const palette = this.getColorPalette(paletteName);
        if (!palette) {
            console.warn(`Color palette '${paletteName}' not found`);
            return imageData;
        }

        // Create a new canvas for color processing
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        
        // Put original image data
        ctx.putImageData(imageData, 0, 0);
        
        // Apply color overlay based on palette
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = imageData.width;
        overlayCanvas.height = imageData.height;
        const overlayCtx = overlayCanvas.getContext('2d');
        
        // Create gradient overlay using palette colors
        const gradient = overlayCtx.createLinearGradient(0, 0, imageData.width, imageData.height);
        gradient.addColorStop(0, palette.colors.highlight + '20'); // 20% opacity
        gradient.addColorStop(0.5, palette.colors.neutral + '10');
        gradient.addColorStop(1, palette.colors.shadow + '15');
        
        overlayCtx.fillStyle = gradient;
        overlayCtx.fillRect(0, 0, imageData.width, imageData.height);
        
        // Blend overlay with original using multiply mode
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.3;
        ctx.drawImage(overlayCanvas, 0, 0);
        
        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        return ctx.getImageData(0, 0, imageData.width, imageData.height);
    }

    /**
     * Create custom style preset
     */
    createCustomPreset(presetData) {
        const requiredFields = ['name', 'category', 'fallbackStyle'];
        for (const field of requiredFields) {
            if (!presetData[field]) {
                throw new Error(`Required field '${field}' is missing`);
            }
        }

        const presetId = this.generatePresetId(presetData.name);
        
        const customPreset = {
            id: presetId,
            name: presetData.name,
            description: presetData.description || '',
            category: presetData.category,
            aiStyle: presetData.aiStyle || null,
            fallbackStyle: presetData.fallbackStyle,
            palette: presetData.palette || 'neutral',
            lineWeight: presetData.lineWeight || 1.5,
            materialAwareness: presetData.materialAwareness || false,
            settings: {
                edgeThreshold: presetData.edgeThreshold || 30,
                lineVariation: presetData.lineVariation || 50,
                contrast: presetData.contrast || 0.8,
                texture: presetData.texture !== false,
                preserveDetails: presetData.preserveDetails !== false,
                ...presetData.customSettings
            },
            aiParameters: {
                controlnetWeight: presetData.controlnetWeight || 0.8,
                denoisingStrength: presetData.denoisingStrength || 0.75,
                cfg: presetData.cfg || 7.5,
                ...presetData.aiParameters
            },
            isCustom: true,
            createdAt: new Date().toISOString()
        };

        this.customPresets[presetId] = customPreset;
        this.saveCustomPresets();
        
        return presetId;
    }

    /**
     * Update existing custom preset
     */
    updateCustomPreset(presetId, updates) {
        if (!this.customPresets[presetId]) {
            throw new Error(`Custom preset '${presetId}' not found`);
        }

        this.customPresets[presetId] = {
            ...this.customPresets[presetId],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveCustomPresets();
        return true;
    }

    /**
     * Delete custom preset
     */
    deleteCustomPreset(presetId) {
        if (this.customPresets[presetId]) {
            delete this.customPresets[presetId];
            this.saveCustomPresets();
            return true;
        }
        return false;
    }

    /**
     * Create custom color palette
     */
    createCustomPalette(paletteData) {
        const requiredFields = ['name', 'colors'];
        for (const field of requiredFields) {
            if (!paletteData[field]) {
                throw new Error(`Required field '${field}' is missing`);
            }
        }

        const paletteId = this.generatePaletteId(paletteData.name);
        
        const customPalette = {
            id: paletteId,
            name: paletteData.name,
            description: paletteData.description || '',
            colors: paletteData.colors,
            materials: paletteData.materials || {},
            isCustom: true,
            createdAt: new Date().toISOString()
        };

        this.userPalettes[paletteId] = customPalette;
        this.saveUserPalettes();
        
        return paletteId;
    }

    /**
     * Batch process multiple images with consistent styling
     */
    async processBatch(images, presetId, options = {}) {
        if (!Array.isArray(images) || images.length === 0) {
            throw new Error('No images provided for batch processing');
        }

        const preset = this.getPreset(presetId);
        if (!preset) {
            throw new Error(`Style preset '${presetId}' not found`);
        }

        this.currentBatch = {
            images: images.slice(),
            settings: { presetId, options },
            results: [],
            isProcessing: true,
            startTime: Date.now()
        };

        const results = [];
        const batchOptions = {
            ...options,
            batchMode: true,
            batchIndex: 0,
            batchTotal: images.length
        };

        // Process each image with consistent settings
        for (let i = 0; i < images.length; i++) {
            try {
                batchOptions.batchIndex = i;
                
                // Apply slight variations to avoid identical results
                const imageOptions = {
                    ...batchOptions,
                    seed: options.seed ? options.seed + i : Math.floor(Math.random() * 1000000),
                    variationFactor: Math.min(0.1, i * 0.02) // Slight variation increase
                };

                const result = await this.applyStyle(images[i], presetId, imageOptions);
                results.push({
                    index: i,
                    ...result
                });

                // Update progress callback if provided
                if (options.onProgress) {
                    options.onProgress({
                        current: i + 1,
                        total: images.length,
                        percentage: Math.round(((i + 1) / images.length) * 100)
                    });
                }

            } catch (error) {
                console.error(`Error processing image ${i}:`, error);
                results.push({
                    index: i,
                    success: false,
                    error: error.message
                });
            }
        }

        this.currentBatch.results = results;
        this.currentBatch.isProcessing = false;
        this.currentBatch.endTime = Date.now();

        // Save batch settings for future use
        this.saveBatchSettings({
            preset: presetId,
            options,
            timestamp: new Date().toISOString(),
            imageCount: images.length,
            successCount: results.filter(r => r.success).length
        });

        return {
            success: true,
            results,
            batchInfo: {
                preset: preset.name,
                imageCount: images.length,
                successCount: results.filter(r => r.success).length,
                processingTime: this.currentBatch.endTime - this.currentBatch.startTime
            }
        };
    }

    /**
     * Export style configuration as JSON
     */
    exportStyleConfiguration(includeCustom = true, includeHistory = false) {
        const config = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            builtInPresets: this.builtInPresets,
            colorPalettes: this.colorPalettes
        };

        if (includeCustom) {
            config.customPresets = this.customPresets;
            config.userPalettes = this.userPalettes;
        }

        if (includeHistory) {
            config.styleHistory = this.styleHistory;
            config.batchSettings = this.batchSettings;
        }

        return JSON.stringify(config, null, 2);
    }

    /**
     * Import style configuration from JSON
     */
    importStyleConfiguration(jsonString, options = {}) {
        try {
            const config = JSON.parse(jsonString);
            
            if (!config.version) {
                throw new Error('Invalid configuration format');
            }

            const imported = {
                presets: 0,
                palettes: 0,
                skipped: 0
            };

            // Import custom presets
            if (config.customPresets && options.importPresets !== false) {
                for (const [id, preset] of Object.entries(config.customPresets)) {
                    if (options.overwrite || !this.customPresets[id]) {
                        this.customPresets[id] = {
                            ...preset,
                            importedAt: new Date().toISOString()
                        };
                        imported.presets++;
                    } else {
                        imported.skipped++;
                    }
                }
                this.saveCustomPresets();
            }

            // Import custom palettes
            if (config.userPalettes && options.importPalettes !== false) {
                for (const [id, palette] of Object.entries(config.userPalettes)) {
                    if (options.overwrite || !this.userPalettes[id]) {
                        this.userPalettes[id] = {
                            ...palette,
                            importedAt: new Date().toISOString()
                        };
                        imported.palettes++;
                    } else {
                        imported.skipped++;
                    }
                }
                this.saveUserPalettes();
            }

            return {
                success: true,
                imported
            };

        } catch (error) {
            throw new Error(`Failed to import configuration: ${error.message}`);
        }
    }

    /**
     * Generate unique preset ID from name
     */
    generatePresetId(name) {
        const baseId = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        let id = baseId;
        let counter = 1;
        
        while (this.customPresets[id] || this.builtInPresets[id]) {
            id = `${baseId}-${counter}`;
            counter++;
        }
        
        return id;
    }

    /**
     * Generate unique palette ID from name
     */
    generatePaletteId(name) {
        const baseId = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        let id = baseId;
        let counter = 1;
        
        while (this.userPalettes[id] || this.colorPalettes[id]) {
            id = `${baseId}-${counter}`;
            counter++;
        }
        
        return id;
    }

    /**
     * Record style application in history
     */
    recordStyleApplication(presetId, method, processingTime) {
        const record = {
            preset: presetId,
            method,
            processingTime,
            timestamp: new Date().toISOString()
        };

        this.styleHistory.push(record);
        
        // Keep only last 100 records
        if (this.styleHistory.length > 100) {
            this.styleHistory = this.styleHistory.slice(-100);
        }
        
        this.saveStyleHistory();
    }

    /**
     * Get style usage statistics
     */
    getStyleStatistics() {
        const stats = {
            totalApplications: this.styleHistory.length,
            presetUsage: {},
            methodDistribution: {},
            averageProcessingTime: 0,
            recentActivity: []
        };

        if (this.styleHistory.length === 0) {
            return stats;
        }

        let totalTime = 0;
        
        this.styleHistory.forEach(record => {
            // Preset usage
            stats.presetUsage[record.preset] = (stats.presetUsage[record.preset] || 0) + 1;
            
            // Method distribution
            stats.methodDistribution[record.method] = (stats.methodDistribution[record.method] || 0) + 1;
            
            // Processing time
            totalTime += record.processingTime;
        });

        stats.averageProcessingTime = Math.round(totalTime / this.styleHistory.length);
        stats.recentActivity = this.styleHistory.slice(-10).reverse();

        return stats;
    }

    // Local Storage Methods
    loadCustomPresets() {
        try {
            const stored = localStorage.getItem(this.storageKeys.customPresets);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading custom presets:', error);
            return {};
        }
    }

    saveCustomPresets() {
        try {
            localStorage.setItem(this.storageKeys.customPresets, JSON.stringify(this.customPresets));
        } catch (error) {
            console.error('Error saving custom presets:', error);
        }
    }

    loadUserPalettes() {
        try {
            const stored = localStorage.getItem(this.storageKeys.userPalettes);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading user palettes:', error);
            return {};
        }
    }

    saveUserPalettes() {
        try {
            localStorage.setItem(this.storageKeys.userPalettes, JSON.stringify(this.userPalettes));
        } catch (error) {
            console.error('Error saving user palettes:', error);
        }
    }

    loadStyleHistory() {
        try {
            const stored = localStorage.getItem(this.storageKeys.styleHistory);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading style history:', error);
            return [];
        }
    }

    saveStyleHistory() {
        try {
            localStorage.setItem(this.storageKeys.styleHistory, JSON.stringify(this.styleHistory));
        } catch (error) {
            console.error('Error saving style history:', error);
        }
    }

    loadBatchSettings() {
        try {
            const stored = localStorage.getItem(this.storageKeys.batchSettings);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading batch settings:', error);
            return [];
        }
    }

    saveBatchSettings(settings) {
        try {
            this.batchSettings.push(settings);
            
            // Keep only last 20 batch records
            if (this.batchSettings.length > 20) {
                this.batchSettings = this.batchSettings.slice(-20);
            }
            
            localStorage.setItem(this.storageKeys.batchSettings, JSON.stringify(this.batchSettings));
        } catch (error) {
            console.error('Error saving batch settings:', error);
        }
    }

    /**
     * Clear all stored data
     */
    clearStoredData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        
        this.customPresets = {};
        this.userPalettes = {};
        this.styleHistory = [];
        this.batchSettings = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StyleManager;
} else {
    window.StyleManager = StyleManager;
}