/**
 * Vercel Serverless Health Check API Function
 * Reports system status, AI service availability, and basic metrics
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
    }

    const startTime = Date.now();

    try {
        // Basic system info
        const systemInfo = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            node_version: process.version,
            platform: process.platform,
            arch: process.arch
        };

        // Check AI provider availability
        const aiStatus = await checkAIServices();
        
        // Check external dependencies
        const dependencyStatus = await checkDependencies();

        // Calculate response time
        const responseTime = Date.now() - startTime;

        // Determine overall health status
        const overallStatus = determineOverallStatus(aiStatus, dependencyStatus);

        const healthReport = {
            status: overallStatus,
            timestamp: systemInfo.timestamp,
            responseTime: `${responseTime}ms`,
            version: '1.0.0',
            services: {
                ai_processing: aiStatus,
                dependencies: dependencyStatus
            },
            system: {
                uptime: `${Math.floor(systemInfo.uptime)}s`,
                memory: {
                    used: `${Math.round(systemInfo.memory.heapUsed / 1024 / 1024)}MB`,
                    total: `${Math.round(systemInfo.memory.heapTotal / 1024 / 1024)}MB`,
                    external: `${Math.round(systemInfo.memory.external / 1024 / 1024)}MB`
                },
                runtime: {
                    node: systemInfo.node_version,
                    platform: systemInfo.platform,
                    arch: systemInfo.arch
                }
            },
            features: {
                traditional_processing: 'available',
                ai_processing: aiStatus.configured ? 'available' : 'not_configured',
                batch_processing: 'available',
                material_detection: 'available',
                style_presets: 'available',
                export_formats: ['png', 'jpeg', 'svg', 'pdf']
            }
        };

        // Set appropriate status code
        const statusCode = overallStatus === 'healthy' ? 200 : 
                          overallStatus === 'degraded' ? 200 : 503;

        return res.status(statusCode).json(healthReport);

    } catch (error) {
        console.error('Health check error:', error);
        
        return res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
            message: error.message || 'An unexpected error occurred during health check',
            responseTime: `${Date.now() - startTime}ms`
        });
    }
}

/**
 * Check AI service availability and configuration
 */
async function checkAIServices() {
    const aiProvider = process.env.AI_PROVIDER || 'none';
    const apiKey = process.env.AI_API_KEY;
    const runpodEndpoint = process.env.RUNPOD_ENDPOINT_ID;

    const status = {
        configured: !!apiKey,
        provider: aiProvider,
        endpoint_configured: false,
        connectivity: 'unknown',
        last_check: new Date().toISOString()
    };

    if (!apiKey) {
        status.connectivity = 'not_configured';
        status.message = 'No API key configured';
        return status;
    }

    // Check specific provider configurations
    switch (aiProvider.toLowerCase()) {
        case 'runpod':
            status.endpoint_configured = !!runpodEndpoint;
            if (runpodEndpoint) {
                try {
                    // Quick connectivity test to RunPod
                    const testResponse = await fetch(`https://api.runpod.ai/v2/${runpodEndpoint}/status`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        },
                        timeout: 5000
                    });
                    
                    status.connectivity = testResponse.ok ? 'connected' : 'error';
                    if (!testResponse.ok) {
                        status.error = `HTTP ${testResponse.status}`;
                    }
                } catch (error) {
                    status.connectivity = 'error';
                    status.error = error.message;
                }
            } else {
                status.connectivity = 'not_configured';
                status.message = 'RunPod endpoint ID not configured';
            }
            break;

        case 'openai':
            status.endpoint_configured = true;
            try {
                // Quick test to OpenAI API
                const testResponse = await fetch('https://api.openai.com/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    timeout: 5000
                });
                
                status.connectivity = testResponse.ok ? 'connected' : 'error';
                if (!testResponse.ok) {
                    status.error = `HTTP ${testResponse.status}`;
                }
            } catch (error) {
                status.connectivity = 'error';
                status.error = error.message;
            }
            break;

        case 'anthropic':
            status.endpoint_configured = true;
            status.connectivity = 'assumed'; // Anthropic doesn't have a simple status endpoint
            break;

        case 'google':
            status.endpoint_configured = true;
            status.connectivity = 'assumed'; // Google AI doesn't have a simple status endpoint
            break;

        default:
            status.connectivity = 'unknown_provider';
            status.message = `Unknown AI provider: ${aiProvider}`;
    }

    return status;
}

/**
 * Check external dependencies and services
 */
async function checkDependencies() {
    const dependencies = {
        canvas_api: 'available', // Browser-based, always available
        file_api: 'available',   // Browser-based, always available
        local_storage: 'available', // Browser-based, always available
        external_services: []
    };

    // Check if we can make external requests (basic connectivity)
    try {
        const testResponse = await fetch('https://httpbin.org/status/200', {
            method: 'GET',
            timeout: 3000
        });
        
        dependencies.external_connectivity = testResponse.ok ? 'available' : 'limited';
    } catch (error) {
        dependencies.external_connectivity = 'limited';
        dependencies.connectivity_error = error.message;
    }

    return dependencies;
}

/**
 * Determine overall system health status
 */
function determineOverallStatus(aiStatus, dependencyStatus) {
    // If AI is configured but not working, system is degraded
    if (aiStatus.configured && aiStatus.connectivity === 'error') {
        return 'degraded';
    }

    // If external connectivity is limited but everything else works
    if (dependencyStatus.external_connectivity === 'limited') {
        return 'degraded';
    }

    // If core dependencies are not available
    if (dependencyStatus.canvas_api !== 'available' || 
        dependencyStatus.file_api !== 'available') {
        return 'unhealthy';
    }

    // Everything looks good
    return 'healthy';
}