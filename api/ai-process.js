/**
 * Vercel Serverless Function for AI Image Processing
 * Handles secure API key management and AI service routing
 */

const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.ALLOWED_ORIGINS?.split(',') || []
].flat().filter(Boolean);

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map();

export default async function handler(req, res) {
    // CORS headers
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Rate limiting
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!checkRateLimit(clientIP)) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded',
                retryAfter: 60
            });
        }

        // Validate request body
        const { imageData, provider, stylePreset, options = {} } = req.body;
        
        if (!imageData || !provider || !stylePreset) {
            return res.status(400).json({
                error: 'Missing required fields: imageData, provider, stylePreset'
            });
        }

        // Validate image data size
        const imageSizeBytes = Buffer.byteLength(imageData, 'base64');
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
        
        if (imageSizeBytes > maxSize) {
            return res.status(413).json({
                error: 'Image too large',
                maxSize: maxSize,
                actualSize: imageSizeBytes
            });
        }

        // Process based on provider
        let result;
        switch (provider) {
            case 'openai':
                result = await processWithOpenAI(imageData, stylePreset, options);
                break;
            case 'anthropic':
                result = await processWithAnthropic(imageData, stylePreset, options);
                break;
            case 'google':
                result = await processWithGoogle(imageData, stylePreset, options);
                break;
            case 'runpod':
                result = await processWithRunPod(imageData, stylePreset, options);
                break;
            default:
                return res.status(400).json({
                    error: 'Unsupported provider',
                    supportedProviders: ['openai', 'anthropic', 'google', 'runpod']
                });
        }

        // Return successful response
        res.status(200).json({
            success: true,
            result: result,
            provider: provider,
            processingTime: result.processingTime || 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI processing error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Processing failed'
        });
    }
}

/**
 * Rate limiting check
 */
function checkRateLimit(clientIP) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 20;
    
    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    const rateLimitInfo = rateLimitMap.get(clientIP);
    
    if (now > rateLimitInfo.resetTime) {
        // Reset window
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (rateLimitInfo.count >= maxRequests) {
        return false;
    }
    
    rateLimitInfo.count++;
    return true;
}

/**
 * Process with OpenAI (DALL-E or similar)
 */
async function processWithOpenAI(imageData, stylePreset, options) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const prompt = getStylePrompt(stylePreset, 'openai');
    const startTime = Date.now();

    try {
        // Note: This is a simplified example
        // In production, you'd use OpenAI's actual image processing APIs
        const response = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData,
                prompt: prompt,
                n: 1,
                size: options.size || '512x512',
                response_format: 'b64_json'
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
            imageData: data.data[0].b64_json,
            processingTime: Date.now() - startTime,
            model: 'dall-e-2',
            provider: 'openai'
        };
    } catch (error) {
        throw new Error(`OpenAI processing failed: ${error.message}`);
    }
}

/**
 * Process with Anthropic Claude (text analysis for style guidance)
 */
async function processWithAnthropic(imageData, stylePreset, options) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();

    try {
        // Use Claude for intelligent style analysis and guidance
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Analyze this interior design image and provide style recommendations for converting to a ${stylePreset} sketch. Include material suggestions, line weight recommendations, and emphasis areas.`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Return analysis that can guide traditional processing
        return {
            analysis: data.content[0].text,
            recommendations: parseStyleRecommendations(data.content[0].text),
            processingTime: Date.now() - startTime,
            model: 'claude-3-sonnet',
            provider: 'anthropic'
        };
    } catch (error) {
        throw new Error(`Anthropic processing failed: ${error.message}`);
    }
}

/**
 * Process with Google AI
 */
async function processWithGoogle(imageData, stylePreset, options) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new Error('Google AI API key not configured');
    }

    const startTime = Date.now();

    try {
        // Use Google's Vertex AI or similar service
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `Analyze this interior design image for ${stylePreset} style conversion. Provide technical recommendations for sketch conversion.`
                        },
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: imageData
                            }
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
            analysis: data.candidates[0].content.parts[0].text,
            recommendations: parseStyleRecommendations(data.candidates[0].content.parts[0].text),
            processingTime: Date.now() - startTime,
            model: 'gemini-pro-vision',
            provider: 'google'
        };
    } catch (error) {
        throw new Error(`Google AI processing failed: ${error.message}`);
    }
}

/**
 * Process with RunPod Serverless
 */
async function processWithRunPod(imageData, stylePreset, options) {
    const apiKey = process.env.RUNPOD_API_KEY;
    const endpoint = process.env.RUNPOD_ENDPOINT;
    
    if (!apiKey || !endpoint) {
        throw new Error('RunPod API key or endpoint not configured');
    }

    const startTime = Date.now();

    try {
        const payload = {
            input: {
                image: imageData,
                prompt: getStylePrompt(stylePreset, 'runpod'),
                negative_prompt: 'photo, realistic, 3d render, blurry, distorted',
                width: options.width || 512,
                height: options.height || 512,
                num_inference_steps: options.quality === 'high' ? 50 : 25,
                guidance_scale: 7.5,
                controlnet_conditioning_scale: 0.8,
                seed: options.seed || -1
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`RunPod API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === 'COMPLETED' && data.output && data.output.length > 0) {
            return {
                imageData: data.output[0],
                processingTime: Date.now() - startTime,
                model: 'stable-diffusion-controlnet',
                provider: 'runpod',
                executionTime: data.executionTime
            };
        } else {
            throw new Error('RunPod processing failed or returned no results');
        }
    } catch (error) {
        throw new Error(`RunPod processing failed: ${error.message}`);
    }
}

/**
 * Get style-specific prompts
 */
function getStylePrompt(stylePreset, provider) {
    const prompts = {
        'pencil': 'professional pencil sketch, clean lines, architectural drawing style, interior design illustration',
        'pen': 'technical pen drawing, precise lines, architectural documentation, interior design sketch',
        'charcoal': 'charcoal sketch, expressive lines, artistic interior drawing, design concept illustration',
        'technical': 'technical drawing, architectural line art, precise measurements, construction documentation',
        'modern': 'modern minimalist sketch, clean lines, contemporary interior design drawing',
        'scandinavian': 'scandinavian style sketch, light and airy, natural materials emphasis',
        'industrial': 'industrial style sketch, raw materials, exposed elements, urban design',
        'bohemian': 'bohemian style sketch, eclectic elements, rich textures, artistic interpretation',
        'traditional': 'traditional interior sketch, classic elements, ornate details, formal design',
        'contemporary': 'contemporary design sketch, current trends, sophisticated lines',
        'rustic': 'rustic style sketch, natural materials, warm atmosphere, country design',
        'artdeco': 'art deco style sketch, geometric patterns, luxury elements, vintage elegance'
    };

    return prompts[stylePreset] || prompts['pencil'];
}

/**
 * Parse style recommendations from AI response
 */
function parseStyleRecommendations(text) {
    // Simple parsing - in production, would use more sophisticated NLP
    const recommendations = {
        lineWeight: 'medium',
        emphasis: 'balanced',
        materials: [],
        techniques: []
    };

    if (text.toLowerCase().includes('thin') || text.toLowerCase().includes('fine')) {
        recommendations.lineWeight = 'thin';
    } else if (text.toLowerCase().includes('thick') || text.toLowerCase().includes('bold')) {
        recommendations.lineWeight = 'thick';
    }

    if (text.toLowerCase().includes('furniture')) {
        recommendations.emphasis = 'furniture';
    } else if (text.toLowerCase().includes('architecture')) {
        recommendations.emphasis = 'architecture';
    }

    // Extract materials mentioned
    const materialKeywords = ['wood', 'metal', 'glass', 'fabric', 'stone', 'concrete'];
    materialKeywords.forEach(material => {
        if (text.toLowerCase().includes(material)) {
            recommendations.materials.push(material);
        }
    });

    return recommendations;
}