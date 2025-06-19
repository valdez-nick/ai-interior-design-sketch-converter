/**
 * Interior Design AI Module
 * Handles AI-powered interior design analysis and recommendations
 */

class InteriorDesignAI {
    constructor(aiProcessor) {
        this.aiProcessor = aiProcessor;
        this.roomTypes = {
            living_room: {
                keywords: ['sofa', 'couch', 'coffee table', 'tv', 'television', 'fireplace'],
                typical_furniture: ['sofa', 'chairs', 'coffee table', 'entertainment center', 'bookshelf'],
                lighting: ['ceiling light', 'table lamps', 'floor lamps', 'accent lighting'],
                style_preferences: ['modern', 'contemporary', 'traditional', 'scandinavian']
            },
            bedroom: {
                keywords: ['bed', 'mattress', 'nightstand', 'dresser', 'closet', 'wardrobe'],
                typical_furniture: ['bed', 'nightstands', 'dresser', 'chair', 'bench'],
                lighting: ['ceiling light', 'bedside lamps', 'accent lighting'],
                style_preferences: ['modern', 'traditional', 'bohemian', 'scandinavian']
            },
            kitchen: {
                keywords: ['stove', 'oven', 'refrigerator', 'sink', 'cabinet', 'counter', 'island'],
                typical_furniture: ['cabinets', 'island', 'bar stools', 'pantry'],
                lighting: ['pendant lights', 'under-cabinet lighting', 'recessed lighting'],
                style_preferences: ['modern', 'traditional', 'industrial', 'farmhouse']
            },
            bathroom: {
                keywords: ['toilet', 'sink', 'shower', 'bathtub', 'mirror', 'vanity'],
                typical_furniture: ['vanity', 'storage cabinet', 'mirror', 'towel rack'],
                lighting: ['vanity lighting', 'ceiling light', 'accent lighting'],
                style_preferences: ['modern', 'traditional', 'spa-like', 'industrial']
            },
            dining_room: {
                keywords: ['dining table', 'chairs', 'sideboard', 'buffet', 'chandelier'],
                typical_furniture: ['dining table', 'chairs', 'sideboard', 'china cabinet'],
                lighting: ['chandelier', 'pendant lights', 'sconces'],
                style_preferences: ['traditional', 'modern', 'rustic', 'formal']
            },
            office: {
                keywords: ['desk', 'chair', 'computer', 'bookshelf', 'filing cabinet'],
                typical_furniture: ['desk', 'office chair', 'bookshelf', 'storage'],
                lighting: ['desk lamp', 'overhead lighting', 'task lighting'],
                style_preferences: ['modern', 'industrial', 'traditional', 'minimalist']
            }
        };

        this.styleAnalysis = {
            modern: {
                characteristics: ['clean lines', 'minimal decoration', 'neutral colors', 'open space'],
                materials: ['glass', 'metal', 'concrete'],
                colors: ['white', 'black', 'gray', 'bold accent colors']
            },
            traditional: {
                characteristics: ['ornate details', 'rich fabrics', 'warm colors', 'symmetry'],
                materials: ['wood', 'fabric', 'leather'],
                colors: ['warm browns', 'deep blues', 'rich reds', 'gold accents']
            },
            scandinavian: {
                characteristics: ['light colors', 'natural materials', 'functional design', 'cozy atmosphere'],
                materials: ['light wood', 'natural fabrics', 'wool'],
                colors: ['white', 'light gray', 'natural wood tones', 'soft pastels']
            },
            industrial: {
                characteristics: ['exposed elements', 'raw materials', 'utilitarian design'],
                materials: ['metal', 'concrete', 'brick', 'leather'],
                colors: ['dark grays', 'blacks', 'rust colors', 'raw metal tones']
            },
            bohemian: {
                characteristics: ['eclectic mix', 'rich textures', 'vibrant colors', 'layered elements'],
                materials: ['textiles', 'wood', 'metal', 'natural fibers'],
                colors: ['jewel tones', 'earth colors', 'vibrant patterns']
            }
        };

        this.furnitureDatabase = {
            seating: ['sofa', 'chair', 'ottoman', 'bench', 'stool'],
            tables: ['coffee table', 'dining table', 'side table', 'console table', 'desk'],
            storage: ['bookshelf', 'cabinet', 'dresser', 'wardrobe', 'chest'],
            lighting: ['table lamp', 'floor lamp', 'pendant light', 'chandelier', 'sconce'],
            decorative: ['artwork', 'mirror', 'plant', 'vase', 'sculpture']
        };
    }

    /**
     * Analyze room type from image
     * @param {ImageData} imageData - Canvas image data
     * @param {Object} detectedMaterials - Materials detected by MaterialDetection
     * @returns {Object} Room analysis results
     */
    async analyzeRoomType(imageData, detectedMaterials = {}) {
        try {
            // Simulate AI analysis - in production, would use actual computer vision
            const analysis = await this.performRoomTypeAnalysis(imageData);
            
            // Enhance with material information
            const enhancedAnalysis = this.enhanceWithMaterials(analysis, detectedMaterials);
            
            return {
                success: true,
                roomType: enhancedAnalysis.primaryRoomType,
                confidence: enhancedAnalysis.confidence,
                alternativeTypes: enhancedAnalysis.alternatives,
                detectedElements: enhancedAnalysis.elements,
                styleAnalysis: await this.analyzeDesignStyle(imageData, enhancedAnalysis),
                recommendations: this.generateRecommendations(enhancedAnalysis),
                processingTime: Date.now()
            };
        } catch (error) {
            console.error('Room type analysis failed:', error);
            return {
                success: false,
                error: error.message,
                roomType: 'unknown'
            };
        }
    }

    /**
     * Perform room type analysis
     */
    async performRoomTypeAnalysis(imageData) {
        // Simulate AI analysis with mock data
        // In production, this would use actual computer vision models
        
        const { width, height, data } = imageData;
        
        // Analyze image characteristics
        const characteristics = this.analyzeImageCharacteristics(data, width, height);
        
        // Score each room type based on characteristics
        const scores = {};
        for (const [roomType, config] of Object.entries(this.roomTypes)) {
            scores[roomType] = this.scoreRoomType(characteristics, config);
        }
        
        // Sort by confidence
        const sortedScores = Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .map(([type, score]) => ({ type, confidence: Math.round(score * 100) }));
        
        return {
            primaryRoomType: sortedScores[0].type,
            confidence: sortedScores[0].confidence,
            alternatives: sortedScores.slice(1, 3),
            elements: this.detectRoomElements(characteristics),
            rawScores: scores
        };
    }

    /**
     * Analyze image characteristics for room detection
     */
    analyzeImageCharacteristics(data, width, height) {
        const characteristics = {
            furnitureCount: 0,
            horizontalLines: 0,
            verticalLines: 0,
            colorDistribution: {},
            textureVariation: 0,
            lightingSources: 0,
            openSpace: 0
        };
        
        // Simplified analysis - in production would use more sophisticated CV
        
        // Count potential furniture (darker rectangular regions)
        characteristics.furnitureCount = this.estimateFurnitureCount(data, width, height);
        
        // Analyze lines (architectural elements)
        const lines = this.analyzeLines(data, width, height);
        characteristics.horizontalLines = lines.horizontal;
        characteristics.verticalLines = lines.vertical;
        
        // Color analysis
        characteristics.colorDistribution = this.analyzeColorDistribution(data);
        
        // Texture variation
        characteristics.textureVariation = this.analyzeTextureVariation(data, width, height);
        
        // Lighting analysis
        characteristics.lightingSources = this.estimateLightingSources(data, width, height);
        
        // Open space estimation
        characteristics.openSpace = this.estimateOpenSpace(data, width, height);
        
        return characteristics;
    }

    /**
     * Estimate furniture count
     */
    estimateFurnitureCount(data, width, height) {
        // Simplified furniture detection based on rectangular regions
        let furnitureRegions = 0;
        const blockSize = 32;
        const threshold = 50;
        
        for (let y = 0; y < height - blockSize; y += blockSize) {
            for (let x = 0; x < width - blockSize; x += blockSize) {
                const blockVariance = this.calculateBlockVariance(data, width, x, y, blockSize);
                if (blockVariance > threshold && blockVariance < 200) {
                    // Moderate variance suggests furniture (not plain wall or busy pattern)
                    furnitureRegions++;
                }
            }
        }
        
        return Math.min(10, furnitureRegions); // Cap at reasonable number
    }

    /**
     * Calculate variance in a block
     */
    calculateBlockVariance(data, width, x, y, size) {
        const values = [];
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                const idx = ((y + py) * width + (x + px)) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                values.push(brightness);
            }
        }
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        
        return Math.sqrt(variance);
    }

    /**
     * Analyze line patterns
     */
    analyzeLines(data, width, height) {
        // Simplified line detection
        return {
            horizontal: Math.floor(Math.random() * 20) + 5,
            vertical: Math.floor(Math.random() * 15) + 5
        };
    }

    /**
     * Analyze color distribution
     */
    analyzeColorDistribution(data) {
        const colors = {
            warm: 0,
            cool: 0,
            neutral: 0,
            bright: 0
        };
        
        const sampleStep = 16; // Sample every 16th pixel
        
        for (let i = 0; i < data.length; i += sampleStep * 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Classify color temperature
            if (r > g && r > b) colors.warm++;
            else if (b > r && b > g) colors.cool++;
            else colors.neutral++;
            
            // Brightness check
            const brightness = (r + g + b) / 3;
            if (brightness > 200) colors.bright++;
        }
        
        return colors;
    }

    /**
     * Analyze texture variation
     */
    analyzeTextureVariation(data, width, height) {
        // Simplified texture analysis
        return Math.random() * 100;
    }

    /**
     * Estimate lighting sources
     */
    estimateLightingSources(data, width, height) {
        // Look for bright spots that might be lights
        let lightSources = 0;
        const threshold = 220;
        
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > threshold) {
                lightSources++;
            }
        }
        
        // Normalize by image size
        return Math.min(10, Math.floor(lightSources / (width * height / 10000)));
    }

    /**
     * Estimate open space
     */
    estimateOpenSpace(data, width, height) {
        // Measure consistency of color/texture (more consistent = more open space)
        let consistency = 0;
        const sampleSize = Math.min(1000, Math.floor(data.length / 16));
        
        for (let i = 0; i < sampleSize; i++) {
            const idx = i * 16;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Check neighboring pixels for consistency
            const nextIdx = idx + 4;
            if (nextIdx < data.length) {
                const nr = data[nextIdx];
                const ng = data[nextIdx + 1];
                const nb = data[nextIdx + 2];
                
                const diff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
                if (diff < 30) consistency++;
            }
        }
        
        return Math.round((consistency / sampleSize) * 100);
    }

    /**
     * Score room type based on characteristics
     */
    scoreRoomType(characteristics, roomConfig) {
        let score = 0;
        
        // Furniture count scoring
        if (roomConfig.typical_furniture) {
            const expectedFurniture = roomConfig.typical_furniture.length;
            const furnitureMatch = Math.min(1, characteristics.furnitureCount / expectedFurniture);
            score += furnitureMatch * 0.3;
        }
        
        // Add room-specific scoring logic
        switch (roomConfig) {
            case this.roomTypes.living_room:
                score += (characteristics.openSpace > 40) ? 0.2 : 0;
                score += (characteristics.furnitureCount > 3) ? 0.2 : 0;
                break;
            case this.roomTypes.kitchen:
                score += (characteristics.verticalLines > 10) ? 0.3 : 0; // Cabinets
                score += (characteristics.lightingSources > 2) ? 0.2 : 0;
                break;
            case this.roomTypes.bedroom:
                score += (characteristics.furnitureCount > 2 && characteristics.furnitureCount < 6) ? 0.3 : 0;
                break;
            case this.roomTypes.bathroom:
                score += (characteristics.lightingSources > 1) ? 0.2 : 0;
                score += (characteristics.furnitureCount < 4) ? 0.2 : 0;
                break;
        }
        
        // Base probability for room type
        score += 0.3;
        
        return Math.min(1, score + (Math.random() * 0.1)); // Add small random factor
    }

    /**
     * Detect room elements
     */
    detectRoomElements(characteristics) {
        // Mock element detection based on characteristics
        const elements = [];
        
        if (characteristics.furnitureCount > 2) {
            elements.push({ type: 'seating', confidence: 80, position: { x: 0.3, y: 0.6 } });
        }
        
        if (characteristics.furnitureCount > 1) {
            elements.push({ type: 'table', confidence: 70, position: { x: 0.5, y: 0.5 } });
        }
        
        if (characteristics.lightingSources > 1) {
            elements.push({ type: 'lighting', confidence: 85, position: { x: 0.5, y: 0.2 } });
        }
        
        return elements;
    }

    /**
     * Enhance analysis with material information
     */
    enhanceWithMaterials(analysis, detectedMaterials) {
        // Adjust confidence based on materials
        const materialContext = this.getMaterialContext(analysis.primaryRoomType, detectedMaterials);
        
        if (materialContext.matches > 0) {
            analysis.confidence = Math.min(100, analysis.confidence + materialContext.bonus);
        }
        
        analysis.materialSupport = materialContext;
        return analysis;
    }

    /**
     * Get material context for room type
     */
    getMaterialContext(roomType, detectedMaterials) {
        const expectedMaterials = {
            living_room: ['fabric', 'wood', 'glass'],
            bedroom: ['fabric', 'wood'],
            kitchen: ['metal', 'stone', 'glass'],
            bathroom: ['stone', 'glass', 'metal'],
            dining_room: ['wood', 'fabric', 'glass'],
            office: ['wood', 'metal', 'fabric']
        };
        
        const expected = expectedMaterials[roomType] || [];
        const detected = Object.keys(detectedMaterials);
        
        const matches = expected.filter(material => detected.includes(material)).length;
        const bonus = matches * 5; // 5% bonus per matching material
        
        return { matches, bonus, expected, detected };
    }

    /**
     * Analyze design style
     */
    async analyzeDesignStyle(imageData, roomAnalysis) {
        const styleScores = {};
        
        // Score each style based on detected characteristics
        for (const [styleName, styleConfig] of Object.entries(this.styleAnalysis)) {
            styleScores[styleName] = this.scoreDesignStyle(roomAnalysis, styleConfig);
        }
        
        // Sort by score
        const sortedStyles = Object.entries(styleScores)
            .sort(([,a], [,b]) => b - a)
            .map(([style, score]) => ({ style, confidence: Math.round(score * 100) }));
        
        return {
            primaryStyle: sortedStyles[0].style,
            confidence: sortedStyles[0].confidence,
            alternativeStyles: sortedStyles.slice(1, 3),
            styleElements: this.identifyStyleElements(sortedStyles[0].style)
        };
    }

    /**
     * Score design style
     */
    scoreDesignStyle(roomAnalysis, styleConfig) {
        let score = 0.2; // Base score
        
        // Add random variation for demo
        score += Math.random() * 0.6;
        
        // In production, would analyze actual visual elements
        // matching the style characteristics
        
        return Math.min(1, score);
    }

    /**
     * Identify style elements
     */
    identifyStyleElements(styleName) {
        const style = this.styleAnalysis[styleName];
        if (!style) return [];
        
        return style.characteristics.map(char => ({
            element: char,
            present: Math.random() > 0.3,
            confidence: Math.floor(Math.random() * 40) + 60
        }));
    }

    /**
     * Generate design recommendations
     */
    generateRecommendations(analysis) {
        const roomType = analysis.primaryRoomType;
        const roomConfig = this.roomTypes[roomType];
        
        if (!roomConfig) return [];
        
        const recommendations = [];
        
        // Furniture recommendations
        recommendations.push({
            category: 'furniture',
            title: 'Furniture Layout',
            suggestions: roomConfig.typical_furniture.slice(0, 3).map(furniture => ({
                item: furniture,
                priority: 'high',
                reason: `Essential for ${roomType.replace('_', ' ')} functionality`
            }))
        });
        
        // Lighting recommendations
        recommendations.push({
            category: 'lighting',
            title: 'Lighting Design',
            suggestions: roomConfig.lighting.slice(0, 2).map(light => ({
                item: light,
                priority: 'medium',
                reason: `Improves ${roomType.replace('_', ' ')} ambiance`
            }))
        });
        
        // Style recommendations
        recommendations.push({
            category: 'style',
            title: 'Style Enhancement',
            suggestions: roomConfig.style_preferences.slice(0, 2).map(style => ({
                item: style + ' style elements',
                priority: 'low',
                reason: `Complements ${roomType.replace('_', ' ')} design`
            }))
        });
        
        return recommendations;
    }

    /**
     * Generate furniture placement suggestions
     */
    generateFurniturePlacement(roomAnalysis, roomDimensions) {
        const placements = [];
        const roomType = roomAnalysis.primaryRoomType;
        
        // Mock placement suggestions based on room type
        switch (roomType) {
            case 'living_room':
                placements.push(
                    { furniture: 'sofa', position: { x: 0.3, y: 0.7 }, rotation: 0, size: 'large' },
                    { furniture: 'coffee_table', position: { x: 0.4, y: 0.5 }, rotation: 0, size: 'medium' },
                    { furniture: 'tv_stand', position: { x: 0.1, y: 0.3 }, rotation: 90, size: 'medium' }
                );
                break;
            case 'bedroom':
                placements.push(
                    { furniture: 'bed', position: { x: 0.5, y: 0.7 }, rotation: 0, size: 'large' },
                    { furniture: 'nightstand', position: { x: 0.7, y: 0.8 }, rotation: 0, size: 'small' },
                    { furniture: 'dresser', position: { x: 0.2, y: 0.2 }, rotation: 0, size: 'medium' }
                );
                break;
            default:
                placements.push(
                    { furniture: 'table', position: { x: 0.5, y: 0.5 }, rotation: 0, size: 'medium' }
                );
        }
        
        return placements;
    }

    /**
     * Analyze color harmony and suggest improvements
     */
    analyzeColorHarmony(imageData, detectedMaterials) {
        const colorAnalysis = {
            dominantColors: [],
            colorTemperature: 'neutral',
            harmony: 'good',
            suggestions: []
        };
        
        // Mock color analysis
        colorAnalysis.dominantColors = [
            { color: '#f0f0f0', percentage: 35, name: 'Light Gray' },
            { color: '#8b4513', percentage: 20, name: 'Saddle Brown' },
            { color: '#2f4f4f', percentage: 15, name: 'Dark Slate Gray' }
        ];
        
        colorAnalysis.suggestions = [
            'Consider adding warm accent colors to balance the cool tones',
            'The wood tones work well with the neutral palette',
            'Adding plants would introduce natural color variety'
        ];
        
        return colorAnalysis;
    }

    /**
     * Generate style-specific processing recommendations
     */
    getStyleProcessingRecommendations(styleAnalysis) {
        const style = styleAnalysis.primaryStyle;
        const recommendations = {};
        
        switch (style) {
            case 'modern':
                recommendations.lineStyle = 'clean';
                recommendations.emphasis = 'edges';
                recommendations.texture = 'minimal';
                recommendations.contrast = 'high';
                break;
            case 'traditional':
                recommendations.lineStyle = 'detailed';
                recommendations.emphasis = 'ornaments';
                recommendations.texture = 'rich';
                recommendations.contrast = 'medium';
                break;
            case 'scandinavian':
                recommendations.lineStyle = 'soft';
                recommendations.emphasis = 'natural';
                recommendations.texture = 'wood_grain';
                recommendations.contrast = 'low';
                break;
            case 'industrial':
                recommendations.lineStyle = 'rough';
                recommendations.emphasis = 'structure';
                recommendations.texture = 'raw';
                recommendations.contrast = 'high';
                break;
            default:
                recommendations.lineStyle = 'balanced';
                recommendations.emphasis = 'general';
                recommendations.texture = 'moderate';
                recommendations.contrast = 'medium';
        }
        
        return recommendations;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteriorDesignAI;
} else {
    window.InteriorDesignAI = InteriorDesignAI;
}