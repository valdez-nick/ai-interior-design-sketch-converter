/**
 * Vercel Serverless Function for Health Check
 * Provides system status and API availability
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        
        // Check environment variables
        const environmentStatus = {
            nodeEnv: process.env.NODE_ENV || 'unknown',
            vercelEnv: process.env.VERCEL_ENV || 'unknown',
            region: process.env.VERCEL_REGION || 'unknown'
        };

        // Check API key availability (without exposing values)
        const apiStatus = {
            openai: !!process.env.OPENAI_API_KEY,
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            google: !!process.env.GOOGLE_AI_API_KEY,
            runpod: !!process.env.RUNPOD_API_KEY
        };

        // Check system resources
        const systemStatus = {
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version
        };

        // Calculate response time
        const responseTime = Date.now() - startTime;

        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            responseTime: responseTime,
            environment: environmentStatus,
            apis: apiStatus,
            system: systemStatus,
            features: {
                aiProcessing: Object.values(apiStatus).some(available => available),
                batchProcessing: true,
                materialDetection: true,
                presetManagement: true
            },
            version: '1.0.0'
        };

        res.status(200).json(healthData);

    } catch (error) {
        console.error('Health check error:', error);
        
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
        });
    }
}