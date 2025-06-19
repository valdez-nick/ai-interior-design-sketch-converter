# Vercel Deployment Guide

This guide covers how to deploy the AI-Enhanced Interior Design Sketch Converter to Vercel with full functionality.

## Prerequisites

- GitHub account
- Vercel account (free tier works for development)
- API keys for AI services (optional but recommended)

## Quick Deployment

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-interior-design-sketch-converter)

Or manually:

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables** (optional for AI features):
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   RUNPOD_API_KEY=your_runpod_api_key
   RUNPOD_ENDPOINT=https://api.runpod.ai/v2/your-endpoint-id/runsync
   MAX_FILE_SIZE=10485760
   MAX_BATCH_SIZE=10
   RATE_LIMIT_PER_MINUTE=20
   ALLOWED_ORIGINS=https://your-domain.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

## Environment Variables

### Required for AI Features

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for DALL-E processing | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | `sk-ant-...` |
| `GOOGLE_AI_API_KEY` | Google AI/Gemini API key | `AIza...` |
| `RUNPOD_API_KEY` | RunPod Serverless API key | `xxx-xxx-xxx` |
| `RUNPOD_ENDPOINT` | RunPod endpoint URL | `https://api.runpod.ai/v2/...` |

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) |
| `MAX_BATCH_SIZE` | Maximum batch processing size | `10` |
| `RATE_LIMIT_PER_MINUTE` | API rate limit per client | `20` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | Auto-detected |
| `NODE_ENV` | Environment mode | `production` |

## Setting Environment Variables

### In Vercel Dashboard

1. Go to your project dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable with its value
5. Select environment (Production, Preview, Development)
6. Click "Save"

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_AI_API_KEY

# Deploy with environment variables
vercel --prod
```

## API Endpoints

The deployment includes these serverless API endpoints:

### `/api/health`
- **Method:** GET
- **Description:** Health check and system status
- **Response:** Service availability and configuration

```bash
curl https://your-app.vercel.app/api/health
```

### `/api/ai-process`
- **Method:** POST
- **Description:** Process single image with AI
- **Body:**
  ```json
  {
    "imageData": "base64_encoded_image",
    "provider": "openai|anthropic|google|runpod",
    "stylePreset": "pencil|pen|charcoal|modern|etc",
    "options": {
      "quality": "standard|high",
      "width": 512,
      "height": 512
    }
  }
  ```

### `/api/batch-process`
- **Method:** POST
- **Description:** Process multiple images in batch
- **Body:**
  ```json
  {
    "images": [
      {"data": "base64_image", "filename": "image1.jpg"},
      {"data": "base64_image", "filename": "image2.jpg"}
    ],
    "provider": "openai|anthropic|google|runpod",
    "stylePreset": "pencil|pen|charcoal|modern|etc",
    "options": {}
  }
  ```

## Features Available

### ✅ Fully Functional
- Static file serving
- Client-side image processing
- Traditional sketch effects
- Material detection (algorithm-based)
- Preset management
- Batch processing (client-side)
- File downloads
- Responsive design

### ✅ AI-Enhanced (with API keys)
- Cloud AI processing via serverless functions
- Multiple AI provider support
- Secure API key handling
- Rate limiting
- Error handling and fallbacks

### ✅ Performance Optimized
- CDN delivery via Vercel Edge Network
- Cached static assets
- Serverless function optimization
- Progressive loading

## Testing the Deployment

### 1. Basic Functionality Test
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "features": {
    "aiProcessing": true/false,
    "batchProcessing": true,
    "materialDetection": true
  }
}
```

### 2. Upload and Process Test
1. Visit your deployed app
2. Upload an interior design image
3. Select a style preset
4. Click "Process Image"
5. Verify the sketch conversion works

### 3. AI Processing Test (if configured)
1. Set processing mode to "Cloud AI"
2. Select an AI provider
3. Process an image
4. Verify AI enhancement works

## Troubleshooting

### Common Issues

**1. Environment Variables Not Working**
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names for typos

**2. API Rate Limits**
```bash
# Response when rate limited:
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```
- Wait for rate limit reset
- Increase `RATE_LIMIT_PER_MINUTE` if needed

**3. Large File Uploads**
```bash
# Response for oversized files:
{
  "error": "Image too large",
  "maxSize": 10485760,
  "actualSize": 15728640
}
```
- Reduce image size before upload
- Increase `MAX_FILE_SIZE` if needed

**4. CORS Issues**
- Set `ALLOWED_ORIGINS` environment variable
- Include your domain in the allowed origins

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed error messages in API responses.

## Performance Optimization

### 1. Image Optimization
- Use WebP format when possible
- Compress images before upload
- Implement client-side resizing

### 2. Caching
- Static assets are automatically cached by Vercel
- API responses include appropriate cache headers
- Browser caching for processed results

### 3. Serverless Function Optimization
- Functions are pre-warmed for better performance
- Timeout set to 30 seconds for complex processing
- Memory allocation optimized for image processing

## Monitoring and Analytics

### Built-in Monitoring
- Vercel provides automatic monitoring
- Function execution logs
- Performance metrics
- Error tracking

### Custom Analytics
Add analytics by setting:
```bash
ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn
```

## Scaling Considerations

### Free Tier Limits
- 100GB bandwidth per month
- 1000 serverless function invocations per month
- 100GB-hour of function execution time

### Pro Tier Benefits
- Unlimited bandwidth
- Higher function limits
- Better performance
- Team collaboration features

## Security Features

### Implemented Security
- CORS protection
- Rate limiting
- Input validation
- Secure environment variable handling
- No client-side API key exposure

### Additional Security (Recommended)
- Enable Vercel's Web Application Firewall
- Set up custom domain with SSL
- Implement user authentication if needed
- Monitor API usage patterns

## Custom Domain Setup

1. **Purchase a domain** (optional)
2. **Add domain in Vercel:**
   - Go to project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Update environment variables:**
   ```bash
   ALLOWED_ORIGINS=https://your-custom-domain.com
   ```

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/serverless-functions/introduction)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

## Next Steps

After successful deployment:

1. **Test all features** thoroughly
2. **Configure AI providers** you want to use
3. **Set up monitoring** and analytics
4. **Optimize performance** based on usage
5. **Consider upgrading** to Pro tier for production use

Your AI-Enhanced Interior Design Sketch Converter is now live and ready to transform architectural drawings into beautiful hand-drawn sketches!