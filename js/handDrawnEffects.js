/**
 * Hand-Drawn Effects Module
 * Creates authentic hand-drawn appearance for architectural drawings
 * Enhanced with AI integration and interior design specific features
 */

class HandDrawnEffects {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // AI Integration
        this.aiProcessor = options.aiProcessor || (typeof AIProcessor !== 'undefined' ? new AIProcessor() : null);
        this.useAI = options.useAI !== false && this.aiProcessor !== null;
        
        // Interior design specific settings
        this.interiorMode = options.interiorMode !== false;
        this.materialAwareness = options.materialAwareness !== false;
        this.furniturePreservation = options.furniturePreservation !== false;
        
        // Style presets configuration
        this.stylePresets = {
            'designer-presentation': {
                baseStyle: 'pen',
                lineVariation: 30,
                lineThickness: 1.5,
                materialEnhancement: true,
                furnitureDetail: 'high',
                perspectiveAwareness: true,
                annotations: true
            },
            'concept-exploration': {
                baseStyle: 'pencil',
                lineVariation: 80,
                lineThickness: 2,
                materialEnhancement: false,
                furnitureDetail: 'medium',
                perspectiveAwareness: false,
                sketchy: true
            },
            'technical-documentation': {
                baseStyle: 'technical',
                lineVariation: 10,
                lineThickness: 1,
                materialEnhancement: true,
                furnitureDetail: 'high',
                perspectiveAwareness: true,
                annotations: true,
                precise: true
            },
            'artistic-mood': {
                baseStyle: 'charcoal',
                lineVariation: 120,
                lineThickness: 3,
                materialEnhancement: true,
                furnitureDetail: 'low',
                perspectiveAwareness: false,
                expressive: true
            }
        };
        
        // Material-specific line styles
        this.materialStyles = {
            wood: {
                strokeStyle: '#8B4513',
                pattern: 'grain',
                roughness: 0.7,
                opacity: 0.8
            },
            fabric: {
                strokeStyle: '#696969',
                pattern: 'soft',
                roughness: 0.9,
                opacity: 0.6
            },
            metal: {
                strokeStyle: '#2F2F2F',
                pattern: 'sharp',
                roughness: 0.2,
                opacity: 0.9
            },
            glass: {
                strokeStyle: '#4682B4',
                pattern: 'clean',
                roughness: 0.1,
                opacity: 0.4
            },
            stone: {
                strokeStyle: '#708090',
                pattern: 'textured',
                roughness: 1.2,
                opacity: 0.8
            }
        };
        
        // Batch processing state
        this.batchState = {
            isProcessing: false,
            totalImages: 0,
            processedImages: 0,
            consistencyMap: new Map(),
            styleSignature: null
        };
    }

    /**
     * Apply hand-drawn effect to edge-detected image (Enhanced version)
     * Supports AI integration and interior design specific features
     */
    async applyHandDrawnEffect(edgeData, settings = {}) {
        const {
            style = 'pencil',
            lineVariation = 50,
            lineThickness = 2,
            texture = true,
            // New interior design options
            stylePreset = null,
            materialData = null,
            furnitureRegions = null,
            useAI = this.useAI,
            batchConsistency = false
        } = settings;
        
        // If AI is available and style preset is provided, try AI processing first
        if (useAI && this.aiProcessor && stylePreset) {
            try {
                const aiResult = await this.processWithAI(edgeData, stylePreset, settings);
                if (aiResult.success) {
                    return aiResult.imageData;
                }
            } catch (error) {
                console.warn('AI processing failed, falling back to traditional method:', error);
            }
        }
        
        // Traditional processing with enhancements
        return this.applyTraditionalEffect(edgeData, settings);
    }
    
    /**
     * Traditional hand-drawn effect processing (Enhanced)
     */
    applyTraditionalEffect(edgeData, settings = {}) {
        const {
            style = 'pencil',
            stylePreset = null,
            lineVariation = 50,
            lineThickness = 2,
            texture = true,
            materialData = null,
            furnitureRegions = null,
            batchConsistency = false
        } = settings;
        
        // Use style preset if provided
        const effectiveSettings = stylePreset && this.stylePresets[stylePreset] ? 
            { ...this.stylePresets[stylePreset], ...settings } : settings;
        
        const {
            baseStyle = style,
            materialEnhancement = false,
            furnitureDetail = 'medium',
            perspectiveAwareness = false
        } = effectiveSettings;
        
        // Clear canvas with appropriate background
        this.clearCanvasWithBackground(effectiveSettings);
        
        // Convert edge data to strokes with interior design enhancements
        const strokes = this.extractEnhancedStrokes(edgeData, effectiveSettings);
        
        // Apply material-aware enhancements if enabled
        if (materialEnhancement && materialData) {
            this.enhanceStrokesWithMaterials(strokes, materialData);
        }
        
        // Preserve furniture details if specified
        if (furnitureRegions && furnitureDetail !== 'low') {
            this.preserveFurnitureDetails(strokes, furnitureRegions, furnitureDetail);
        }
        
        // Apply perspective-aware adjustments
        if (perspectiveAwareness) {
            this.adjustStrokesPerspective(strokes);
        }
        
        // Apply style-specific rendering
        this.drawStyleSpecificStrokes(baseStyle, strokes, effectiveSettings);
        
        // Add style-specific post-processing
        this.applyPostProcessing(effectiveSettings);
        
        // Add paper texture if requested
        if (texture || effectiveSettings.texture !== false) {
            this.addPaperTexture(effectiveSettings);
        }
        
        // Store batch consistency data if needed
        if (batchConsistency) {
            this.storeBatchConsistencyData(effectiveSettings);
        }
        
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    
    /**
     * Legacy method for backward compatibility
     */
    applyEffect(edgeData, style, settings = {}) {
        return this.applyTraditionalEffect(edgeData, { ...settings, style });
    }
    
    /**
     * Extract enhanced strokes with interior design context
     */
    extractEnhancedStrokes(edgeData, settings = {}) {
        // First extract basic strokes
        const basicStrokes = this.extractStrokes(edgeData);
        
        // If interior mode is enabled, enhance with context classification
        if (this.interiorMode) {
            return this.classifyStrokesByContext(basicStrokes, settings);
        }
        
        return basicStrokes;
    }
    
    /**
     * Extract continuous strokes from edge data
     */
    extractStrokes(edgeData) {
        const data = edgeData.data;
        const visited = new Set();
        const strokes = [];
        
        // Find all edge pixels
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = (y * this.width + x) * 4;
                const key = `${x},${y}`;
                
                // If black pixel and not visited
                if (data[idx] === 0 && !visited.has(key)) {
                    const stroke = this.traceStroke(x, y, data, visited);
                    if (stroke.length > 2) { // Minimum stroke length
                        strokes.push(stroke);
                    }
                }
            }
        }
        
        return strokes;
    }

    /**
     * Trace a continuous stroke from a starting point
     */
    traceStroke(startX, startY, data, visited) {
        const stroke = [{x: startX, y: startY}];
        const queue = [{x: startX, y: startY}];
        visited.add(`${startX},${startY}`);
        
        const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];
        
        while (queue.length > 0) {
            const current = queue.shift();
            let found = false;
            
            // Check all neighbors
            for (const [dx, dy] of directions) {
                const x = current.x + dx;
                const y = current.y + dy;
                const key = `${x},${y}`;
                
                if (x >= 0 && x < this.width && y >= 0 && y < this.height && !visited.has(key)) {
                    const idx = (y * this.width + x) * 4;
                    
                    if (data[idx] === 0) {
                        visited.add(key);
                        stroke.push({x, y});
                        queue.push({x, y});
                        found = true;
                        break; // Follow one direction at a time for smoother strokes
                    }
                }
            }
            
            if (!found && queue.length === 0) {
                break;
            }
        }
        
        return stroke;
    }

    /**
     * Draw pencil-style strokes
     */
    drawPencilStrokes(strokes, variation, thickness) {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            // Multiple passes for pencil texture
            for (let pass = 0; pass < 2; pass++) {
                this.ctx.beginPath();
                this.ctx.globalAlpha = 0.4 + Math.random() * 0.3;
                this.ctx.strokeStyle = `rgba(60, 60, 60, ${0.6 + Math.random() * 0.2})`;
                this.ctx.lineWidth = thickness + Math.random() * 0.5;
                
                // Draw stroke with slight variations
                stroke.forEach((point, i) => {
                    const wobble = variation / 100;
                    const x = point.x + (Math.random() - 0.5) * wobble;
                    const y = point.y + (Math.random() - 0.5) * wobble;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        // Add slight curve for more natural look
                        const prevPoint = stroke[i - 1];
                        const cpx = (prevPoint.x + x) / 2 + (Math.random() - 0.5) * wobble;
                        const cpy = (prevPoint.y + y) / 2 + (Math.random() - 0.5) * wobble;
                        this.ctx.quadraticCurveTo(cpx, cpy, x, y);
                    }
                });
                
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw pen-style strokes
     */
    drawPenStrokes(strokes, variation, thickness) {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#1a1a1a';
            this.ctx.lineWidth = thickness;
            
            // Draw stroke with slight variations
            stroke.forEach((point, i) => {
                const wobble = variation / 200; // Less wobble for pen
                const x = point.x + (Math.random() - 0.5) * wobble;
                const y = point.y + (Math.random() - 0.5) * wobble;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    // Variable line width for pen pressure simulation
                    const speed = Math.sqrt(
                        Math.pow(point.x - stroke[i-1].x, 2) + 
                        Math.pow(point.y - stroke[i-1].y, 2)
                    );
                    this.ctx.lineWidth = thickness * (0.8 + 0.4 * Math.min(1, speed / 5));
                    this.ctx.lineTo(x, y);
                }
            });
            
            this.ctx.stroke();
        });
    }

    /**
     * Draw charcoal-style strokes
     */
    drawCharcoalStrokes(strokes, variation, thickness) {
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            // Multiple rough passes
            for (let pass = 0; pass < 3; pass++) {
                this.ctx.beginPath();
                this.ctx.globalAlpha = 0.2 + Math.random() * 0.2;
                this.ctx.strokeStyle = '#2a2a2a';
                this.ctx.lineWidth = thickness * (1.5 + Math.random());
                this.ctx.lineCap = 'square';
                
                stroke.forEach((point, i) => {
                    const wobble = variation / 50;
                    const x = point.x + (Math.random() - 0.5) * wobble * 2;
                    const y = point.y + (Math.random() - 0.5) * wobble * 2;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                });
                
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw technical pen-style strokes (minimal variation)
     */
    drawTechnicalStrokes(strokes, variation, thickness) {
        this.ctx.lineCap = 'square';
        this.ctx.lineJoin = 'miter';
        
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = thickness;
            
            // Very minimal variation for technical drawings
            stroke.forEach((point, i) => {
                const wobble = variation / 500;
                const x = point.x + (Math.random() - 0.5) * wobble;
                const y = point.y + (Math.random() - 0.5) * wobble;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });
            
            this.ctx.stroke();
        });
    }

    /**
     * Add subtle paper texture
     */
    addPaperTexture(settings = {}) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        
        // Determine noise intensity based on style
        const { stylePreset } = settings;
        let noiseIntensity = 10;
        if (stylePreset === 'technical-documentation') {
            noiseIntensity = 3; // Minimal noise for technical
        } else if (stylePreset === 'artistic-mood') {
            noiseIntensity = 15; // More texture for artistic
        }
        
        // Add subtle noise for paper texture
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseIntensity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        
        if (stylePreset) {
            this.addStyleSpecificOverlay(stylePreset);
        } else {
            const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
        );
        gradient.addColorStop(0, 'rgba(255, 251, 240, 0)');
        gradient.addColorStop(1, 'rgba(240, 220, 190, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        }    }

    /**
     * Add cross-hatching effect for shaded areas
     */
    addCrossHatching(x, y, width, height, density = 0.5) {
        const spacing = 4 / density;
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        
        // First direction
        for (let i = 0; i < width + height; i += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i, y);
            this.ctx.lineTo(x + i - height, y + height);
            this.ctx.stroke();
        }
        
        // Second direction (if high density)
        if (density > 0.7) {
            for (let i = 0; i < width + height; i += spacing * 1.5) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + i);
                this.ctx.lineTo(x + width, y + i - width);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    // ===== NEW INTERIOR DESIGN SPECIFIC METHODS =====
    
    /**
     * Process image with AI integration
     */
    async processWithAI(edgeData, stylePreset, settings) {
        if (!this.aiProcessor) {
            throw new Error('AI Processor not available');
        }
        
        // Convert edge data to format suitable for AI processing
        const imageData = this.edgeDataToImageData(edgeData);
        
        // Add interior design specific options
        const aiOptions = {
            ...settings,
            width: this.width,
            height: this.height,
            preserveFurniture: this.furniturePreservation,
            materialAwareness: this.materialAwareness
        };
        
        return await this.aiProcessor.processImage(imageData, stylePreset, aiOptions);
    }
    
    /**
     * Clear canvas with style-appropriate background
     */
    clearCanvasWithBackground(settings) {
        const { baseStyle = 'pencil', stylePreset = null } = settings;
        
        let backgroundColor = '#faf8f5'; // Default off-white
        
        // Style-specific backgrounds
        if (stylePreset === 'technical-documentation') {
            backgroundColor = '#ffffff'; // Pure white for technical
        } else if (stylePreset === 'artistic-mood') {
            backgroundColor = '#f5f5dc'; // Beige for artistic
        } else if (baseStyle === 'charcoal') {
            backgroundColor = '#f8f8f8'; // Light gray for charcoal
        }
        
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Classify strokes by interior design context
     */
    classifyStrokesByContext(strokes, settings) {
        return strokes.map(stroke => {
            const classification = this.analyzeStrokeContext(stroke);
            return {
                ...stroke,
                context: classification.context,
                material: classification.material,
                importance: classification.importance
            };
        });
    }
    
    /**
     * Analyze stroke context for interior design elements
     */
    analyzeStrokeContext(stroke) {
        // Simple heuristic-based classification
        // In a real implementation, this could use machine learning
        
        const length = this.calculateStrokeLength(stroke);
        const straightness = this.calculateStrokeStraightness(stroke);
        const position = this.getStrokePosition(stroke);
        
        let context = 'general';
        let material = 'unknown';
        let importance = 0.5;
        
        // Classify based on position and characteristics
        if (position.y < this.height * 0.3) {
            context = 'ceiling';
            if (straightness > 0.8) material = 'structure';
        } else if (position.y > this.height * 0.8) {
            context = 'floor';
            material = 'flooring';
        } else {
            context = 'furniture';
            importance = 0.8; // Furniture is important
            
            // Guess material based on stroke characteristics
            if (straightness > 0.9) {
                material = 'metal';
            } else if (length > 100 && straightness > 0.7) {
                material = 'wood';
            } else {
                material = 'fabric';
            }
        }
        
        return { context, material, importance };
    }
    
    /**
     * Enhance strokes with material-specific styling
     */
    enhanceStrokesWithMaterials(strokes, materialData) {
        strokes.forEach(stroke => {
            if (stroke.material && this.materialStyles[stroke.material]) {
                const materialStyle = this.materialStyles[stroke.material];
                stroke.enhanced = {
                    strokeStyle: materialStyle.strokeStyle,
                    pattern: materialStyle.pattern,
                    roughness: materialStyle.roughness,
                    opacity: materialStyle.opacity
                };
            }
        });
    }
    
    /**
     * Preserve furniture details based on importance
     */
    preserveFurnitureDetails(strokes, furnitureRegions, detailLevel) {
        const detailMultiplier = {
            'low': 0.5,
            'medium': 1.0,
            'high': 1.5
        }[detailLevel] || 1.0;
        
        strokes.forEach(stroke => {
            if (this.strokeIntersectsFurniture(stroke, furnitureRegions)) {
                stroke.furnitureDetail = {
                    enhanced: true,
                    detailLevel: detailLevel,
                    multiplier: detailMultiplier
                };
            }
        });
    }
    
    /**
     * Adjust strokes based on perspective
     */
    adjustStrokesPerspective(strokes) {
        strokes.forEach(stroke => {
            const position = this.getStrokePosition(stroke);
            const perspectiveWeight = this.calculatePerspectiveWeight(position);
            
            stroke.perspectiveAdjustment = {
                weight: perspectiveWeight,
                thickness: perspectiveWeight,
                opacity: Math.max(0.3, perspectiveWeight)
            };
        });
    }
    
    /**
     * Draw strokes with style-specific enhancements
     */
    drawStyleSpecificStrokes(style, strokes, settings) {
        const { lineVariation = 50, lineThickness = 2 } = settings;
        
        switch (style) {
            case 'pencil':
                this.drawEnhancedPencilStrokes(strokes, lineVariation, lineThickness, settings);
                break;
            case 'pen':
                this.drawEnhancedPenStrokes(strokes, lineVariation, lineThickness, settings);
                break;
            case 'charcoal':
                this.drawEnhancedCharcoalStrokes(strokes, lineVariation, lineThickness, settings);
                break;
            case 'technical':
                this.drawEnhancedTechnicalStrokes(strokes, lineVariation, lineThickness, settings);
                break;
            default:
                this.drawEnhancedPencilStrokes(strokes, lineVariation, lineThickness, settings);
        }
    }
    
    /**
     * Enhanced pencil stroke drawing with material awareness
     */
    drawEnhancedPencilStrokes(strokes, variation, thickness, settings) {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            // Determine stroke properties
            const materialStyle = stroke.enhanced || {};
            const furnitureDetail = stroke.furnitureDetail || {};
            const perspectiveAdjust = stroke.perspectiveAdjustment || { weight: 1, thickness: 1, opacity: 1 };
            
            const effectiveThickness = thickness * perspectiveAdjust.thickness * (furnitureDetail.multiplier || 1);
            const effectiveOpacity = (materialStyle.opacity || 0.7) * perspectiveAdjust.opacity;
            const effectiveRoughness = (materialStyle.roughness || 1) * variation;
            
            // Multiple passes for pencil texture
            const passes = furnitureDetail.enhanced ? 3 : 2;
            for (let pass = 0; pass < passes; pass++) {
                this.ctx.beginPath();
                this.ctx.globalAlpha = effectiveOpacity * (0.4 + Math.random() * 0.3);
                this.ctx.strokeStyle = materialStyle.strokeStyle || `rgba(60, 60, 60, ${0.6 + Math.random() * 0.2})`;
                this.ctx.lineWidth = effectiveThickness + Math.random() * 0.5;
                
                this.drawStrokeWithVariation(stroke, effectiveRoughness / 100);
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Enhanced pen stroke drawing with material awareness
     */
    drawEnhancedPenStrokes(strokes, variation, thickness, settings) {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            const materialStyle = stroke.enhanced || {};
            const perspectiveAdjust = stroke.perspectiveAdjustment || { weight: 1, thickness: 1, opacity: 1 };
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = materialStyle.strokeStyle || '#1a1a1a';
            this.ctx.globalAlpha = (materialStyle.opacity || 1) * perspectiveAdjust.opacity;
            
            const wobble = (materialStyle.roughness || 1) * variation / 200;
            this.drawStrokeWithVariation(stroke, wobble);
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Enhanced charcoal stroke drawing with material awareness
     */
    drawEnhancedCharcoalStrokes(strokes, variation, thickness, settings) {
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            const materialStyle = stroke.enhanced || {};
            const roughnessMultiplier = materialStyle.roughness || 1;
            
            // Multiple rough passes
            for (let pass = 0; pass < 3; pass++) {
                this.ctx.beginPath();
                this.ctx.globalAlpha = (materialStyle.opacity || 0.3) * (0.2 + Math.random() * 0.2);
                this.ctx.strokeStyle = materialStyle.strokeStyle || '#2a2a2a';
                this.ctx.lineWidth = thickness * (1.5 + Math.random()) * roughnessMultiplier;
                this.ctx.lineCap = 'square';
                
                const wobble = variation * roughnessMultiplier / 50;
                this.drawStrokeWithVariation(stroke, wobble);
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Enhanced technical stroke drawing with precision
     */
    drawEnhancedTechnicalStrokes(strokes, variation, thickness, settings) {
        this.ctx.lineCap = 'square';
        this.ctx.lineJoin = 'miter';
        
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            const materialStyle = stroke.enhanced || {};
            const furnitureDetail = stroke.furnitureDetail || {};
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = materialStyle.strokeStyle || '#000000';
            this.ctx.lineWidth = thickness * (furnitureDetail.multiplier || 1);
            this.ctx.globalAlpha = materialStyle.opacity || 1;
            
            // Minimal variation for technical precision
            const wobble = variation / 500;
            this.drawStrokeWithVariation(stroke, wobble);
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Apply post-processing effects based on style
     */
    applyPostProcessing(settings) {
        const { stylePreset, expressive = false, precise = false, annotations = false } = settings;
        
        if (expressive) {
            this.addExpressiveEffects();
        }
        
        if (precise) {
            this.addPrecisionEffects();
        }
        
        if (annotations) {
            this.addAnnotationGuides();
        }
        
        // Style-specific post-processing
        if (stylePreset === 'artistic-mood') {
            this.addArtisticEffects();
        }
    }
    
    /**
     * Enhanced paper texture with style awareness
     */
    addPaperTexture(settings = {}) {
        const { stylePreset } = settings;
        
        // Base paper texture
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        
        // Determine noise intensity based on style
        // Add subtle noise for paper texture
        let noiseIntensity = 10;
        if (stylePreset === 'technical-documentation') {
            noiseIntensity = 3; // Minimal noise for technical
        } else if (stylePreset === 'artistic-mood') {
            noiseIntensity = 15; // More texture for artistic
        }
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseIntensity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        
        // Style-specific gradient overlays
        this.addStyleSpecificOverlay(stylePreset);
    }
    
    // ===== BATCH PROCESSING METHODS =====
    
    /**
     * Process multiple images with consistent styling
     */
    async processBatch(imageDataArray, stylePreset, options = {}) {
        this.batchState.isProcessing = true;
        this.batchState.totalImages = imageDataArray.length;
        this.batchState.processedImages = 0;
        this.batchState.consistencyMap.clear();
        
        // Generate style signature for consistency
        this.batchState.styleSignature = this.generateStyleSignature(stylePreset, options);
        
        const results = [];
        
        for (let i = 0; i < imageDataArray.length; i++) {
            const batchOptions = {
                ...options,
                batchConsistency: true,
                batchIndex: i,
                batchTotal: imageDataArray.length
            };
            
            try {
                const result = await this.applyHandDrawnEffect(imageDataArray[i], {
                    stylePreset,
                    ...batchOptions
                });
                
                results.push({
                    success: true,
                    imageData: result,
                    index: i
                });
                
                this.batchState.processedImages++;
                
                // Report progress
                if (options.onProgress) {
                    options.onProgress({
                        completed: this.batchState.processedImages,
                        total: this.batchState.totalImages,
                        percentage: (this.batchState.processedImages / this.batchState.totalImages) * 100
                    });
                }
                
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    index: i
                });
            }
        }
        
        this.batchState.isProcessing = false;
        return results;
    }
    
    /**
     * Store consistency data for batch processing
     */
    storeBatchConsistencyData(settings) {
        const key = `${settings.stylePreset || 'default'}_${settings.baseStyle || 'pencil'}`;
        
        if (!this.batchState.consistencyMap.has(key)) {
            this.batchState.consistencyMap.set(key, {
                lineVariations: [],
                thicknesses: [],
                opacities: [],
                colors: []
            });
        }
        
        // Store current parameters for consistency
        const data = this.batchState.consistencyMap.get(key);
        data.lineVariations.push(settings.lineVariation || 50);
        data.thicknesses.push(settings.lineThickness || 2);
        // Add more consistency tracking as needed
    }
    
    /**
     * Generate style signature for batch consistency
     */
    generateStyleSignature(stylePreset, options) {
        return {
            preset: stylePreset,
            timestamp: Date.now(),
            seed: options.seed || Math.random(),
            parameters: {
                lineVariation: options.lineVariation,
                lineThickness: options.lineThickness,
                materialAwareness: this.materialAwareness,
                furniturePreservation: this.furniturePreservation
            }
        };
    }
    
    // ===== UTILITY METHODS =====
    
    /**
     * Convert edge data to ImageData format
     */
    edgeDataToImageData(edgeData) {
        if (edgeData instanceof ImageData) {
            return edgeData;
        }
        
        // Create ImageData from edge data
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(edgeData, 0, 0);
        
        return canvas;
    }
    
    /**
     * Calculate stroke length
     */
    calculateStrokeLength(stroke) {
        let length = 0;
        for (let i = 1; i < stroke.length; i++) {
            const dx = stroke[i].x - stroke[i-1].x;
            const dy = stroke[i].y - stroke[i-1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }
    
    /**
     * Calculate stroke straightness (0 = curved, 1 = straight)
     */
    calculateStrokeStraightness(stroke) {
        if (stroke.length < 3) return 1;
        
        const totalLength = this.calculateStrokeLength(stroke);
        const directLength = Math.sqrt(
            Math.pow(stroke[stroke.length-1].x - stroke[0].x, 2) +
            Math.pow(stroke[stroke.length-1].y - stroke[0].y, 2)
        );
        
        return directLength / totalLength;
    }
    
    /**
     * Get stroke center position
     */
    getStrokePosition(stroke) {
        const sumX = stroke.reduce((sum, point) => sum + point.x, 0);
        const sumY = stroke.reduce((sum, point) => sum + point.y, 0);
        
        return {
            x: sumX / stroke.length,
            y: sumY / stroke.length
        };
    }
    
    /**
     * Check if stroke intersects with furniture regions
     */
    strokeIntersectsFurniture(stroke, furnitureRegions) {
        if (!furnitureRegions || furnitureRegions.length === 0) return false;
        
        const strokeBounds = this.getStrokeBounds(stroke);
        
        return furnitureRegions.some(region => 
            this.boundsIntersect(strokeBounds, region)
        );
    }
    
    /**
     * Calculate perspective weight based on position
     */
    calculatePerspectiveWeight(position) {
        // Simple perspective model - closer to bottom = closer to viewer
        const verticalWeight = position.y / this.height;
        const distanceFromCenter = Math.abs((position.x / this.width) - 0.5) * 2;
        
        return Math.max(0.3, 1 - (distanceFromCenter * 0.3) + (verticalWeight * 0.2));
    }
    
    /**
     * Draw stroke with variation
     */
    drawStrokeWithVariation(stroke, wobble) {
        stroke.forEach((point, i) => {
            const x = point.x + (Math.random() - 0.5) * wobble;
            const y = point.y + (Math.random() - 0.5) * wobble;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                // Add slight curve for more natural look
                const prevPoint = stroke[i - 1];
                const cpx = (prevPoint.x + x) / 2 + (Math.random() - 0.5) * wobble;
                const cpy = (prevPoint.y + y) / 2 + (Math.random() - 0.5) * wobble;
                this.ctx.quadraticCurveTo(cpx, cpy, x, y);
            }
        });
    }
    
    /**
     * Get stroke bounding box
     */
    getStrokeBounds(stroke) {
        const xs = stroke.map(p => p.x);
        const ys = stroke.map(p => p.y);
        
        return {
            left: Math.min(...xs),
            right: Math.max(...xs),
            top: Math.min(...ys),
            bottom: Math.max(...ys)
        };
    }
    
    /**
     * Check if two bounding boxes intersect
     */
    boundsIntersect(bounds1, bounds2) {
        return !(bounds1.right < bounds2.left || 
                bounds1.left > bounds2.right || 
                bounds1.bottom < bounds2.top || 
                bounds1.top > bounds2.bottom);
    }
    
    /**
     * Add expressive effects for artistic styles
     */
    addExpressiveEffects() {
        // Add subtle distortion for expressive feel
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        // Implementation would add subtle warping effects
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Add precision effects for technical styles
     */
    addPrecisionEffects() {
        // Could add grid lines, measurement marks, etc.
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 0.5;
        
        // Add subtle grid
        const gridSpacing = 50;
        for (let x = 0; x < this.width; x += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Add annotation guides
     */
    addAnnotationGuides() {
        // Could add dimension lines, callouts, etc.
        // Implementation depends on specific requirements
    }
    
    /**
     * Add artistic effects for mood styles
     */
    addArtisticEffects() {
        // Add subtle vignetting
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Add style-specific overlay effects
     */
    addStyleSpecificOverlay(stylePreset) {
        if (stylePreset === 'designer-presentation') {
            // Clean, professional overlay
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
            gradient.addColorStop(1, 'rgba(240, 240, 240, 0.02)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (stylePreset === 'artistic-mood') {
            // Aged paper effect
            const gradient = this.ctx.createRadialGradient(
                this.width / 2, this.height / 2, 0,
                this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
            );
            gradient.addColorStop(0, 'rgba(255, 251, 240, 0)');
            gradient.addColorStop(1, 'rgba(240, 220, 190, 0.15)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    /**
     * Get available style presets
     */
    getAvailableStylePresets() {
        return Object.keys(this.stylePresets).map(key => ({
            id: key,
            name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: this.stylePresets[key].baseStyle,
            settings: this.stylePresets[key]
        }));
    }
    
    /**
     * Get processing status
     */
    getStatus() {
        return {
            aiAvailable: !!this.aiProcessor,
            interiorMode: this.interiorMode,
            materialAwareness: this.materialAwareness,
            furniturePreservation: this.furniturePreservation,
            batchProcessing: this.batchState.isProcessing,
            batchProgress: this.batchState.isProcessing ? {
                completed: this.batchState.processedImages,
                total: this.batchState.totalImages,
                percentage: (this.batchState.processedImages / this.batchState.totalImages) * 100
            } : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HandDrawnEffects;
} else {
    window.HandDrawnEffects = HandDrawnEffects;
}