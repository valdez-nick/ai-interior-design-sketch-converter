/**
 * Vercel Serverless Function for Batch Processing
 * Handles multiple image processing with queue management
 */

export default async function handler(req, res) {
    // CORS headers
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
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
        const { images, provider, stylePreset, options = {} } = req.body;
        
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({
                error: 'Missing or invalid images array'
            });
        }

        const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE) || 10;
        if (images.length > maxBatchSize) {
            return res.status(400).json({
                error: 'Batch size too large',
                maxBatchSize: maxBatchSize,
                requestedSize: images.length
            });
        }

        if (!provider || !stylePreset) {
            return res.status(400).json({
                error: 'Missing required fields: provider, stylePreset'
            });
        }

        const startTime = Date.now();
        const results = [];
        const errors = [];

        // Process images sequentially to avoid overwhelming the APIs
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            try {
                // Validate individual image
                if (!image.data || !image.filename) {
                    throw new Error(`Invalid image at index ${i}: missing data or filename`);
                }

                // Check image size
                const imageSizeBytes = Buffer.byteLength(image.data, 'base64');
                const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
                
                if (imageSizeBytes > maxSize) {
                    throw new Error(`Image ${image.filename} too large: ${imageSizeBytes} bytes`);
                }

                // Process the image using the same logic as ai-process.js
                let processResult;
                switch (provider) {
                    case 'openai':
                        processResult = await processWithOpenAI(image.data, stylePreset, options);
                        break;
                    case 'anthropic':
                        processResult = await processWithAnthropic(image.data, stylePreset, options);
                        break;
                    case 'google':
                        processResult = await processWithGoogle(image.data, stylePreset, options);
                        break;
                    case 'runpod':
                        processResult = await processWithRunPod(image.data, stylePreset, options);
                        break;
                    default:
                        throw new Error(`Unsupported provider: ${provider}`);
                }

                results.push({
                    index: i,
                    filename: image.filename,
                    success: true,
                    result: processResult,
                    processingTime: processResult.processingTime || 0
                });

                // Add delay between requests to be respectful to APIs
                if (i < images.length - 1) {
                    await sleep(1000); // 1 second delay
                }

            } catch (error) {
                console.error(`Error processing image ${i}:`, error);
                
                errors.push({
                    index: i,
                    filename: image.filename || `image_${i}`,
                    error: error.message
                });

                results.push({
                    index: i,
                    filename: image.filename || `image_${i}`,
                    success: false,
                    error: error.message
                });
            }
        }

        const totalTime = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const errorCount = errors.length;

        res.status(200).json({
            success: true,
            batchId: `batch_${Date.now()}`,
            summary: {
                total: images.length,
                successful: successCount,
                failed: errorCount,
                processingTime: totalTime
            },
            results: results,
            errors: errors.length > 0 ? errors : undefined,
            provider: provider,
            stylePreset: stylePreset,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Batch processing error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Batch processing failed',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}

/**
 * Sleep utility function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process with OpenAI - copied from ai-process.js
 */
async function processWithOpenAI(imageData, stylePreset, options) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const prompt = getStylePrompt(stylePreset, 'openai');
    const startTime = Date.now();

    try {
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
 * Process with Anthropic - copied from ai-process.js
 */
async function processWithAnthropic(imageData, stylePreset, options) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();

    try {
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
                    content: `Analyze this interior design image and provide style recommendations for converting to a ${stylePreset} sketch.`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
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
 * Process with Google - copied from ai-process.js
 */
async function processWithGoogle(imageData, stylePreset, options) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new Error('Google AI API key not configured');
    }

    const startTime = Date.now();

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `Analyze this interior design image for ${stylePreset} style conversion.`
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
 * Process with RunPod - copied from ai-process.js
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
 * Get style-specific prompts - copied from ai-process.js
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
 * Parse style recommendations - copied from ai-process.js
 */
function parseStyleRecommendations(text) {
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

    const materialKeywords = ['wood', 'metal', 'glass', 'fabric', 'stone', 'concrete'];
    materialKeywords.forEach(material => {
        if (text.toLowerCase().includes(material)) {
            recommendations.materials.push(material);
        }
    });

    return recommendations;
}