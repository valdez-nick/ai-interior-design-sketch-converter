import { replicateClient } from './replicate-client'
import { 
  qualityTiers, 
  models, 
  generateWatercolorPrompt, 
  sdxlConfig,
  controlNetConfig,
  type QualityTier,
  type WatercolorPromptConfig 
} from '@/config/ai-models'
import sharp from 'sharp'

export interface ProcessingOptions {
  tier: 'free' | 'professional' | 'studio'
  roomType: string
  style: 'classic' | 'loose' | 'architectural' | 'minimal'
  atmosphere?: string
  colorTone?: string
  userId: string
  projectId?: string
}

export interface ProcessingResult {
  success: boolean
  outputUrl?: string
  processingTimeMs: number
  cost: number
  tier: string
  error?: string
  predictionId?: string
}

export class WatercolorProcessor {
  async processImage(
    imageUrl: string, 
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    const startTime = Date.now()
    const tier = qualityTiers[options.tier]
    
    try {
      // Step 1: Preprocess image to correct resolution
      const processedImageUrl = await this.preprocessImage(imageUrl, tier.resolution)
      
      // Step 2: Generate prompts
      const { prompt, negativePrompt } = generateWatercolorPrompt({
        roomType: options.roomType,
        style: options.style,
        atmosphere: options.atmosphere,
        colorTone: options.colorTone
      })
      
      // Step 3: Process based on tier
      let outputUrl: string
      let predictionId: string
      
      if (options.tier === 'free') {
        // Single pass for free tier
        const result = await this.runBasicWatercolor(processedImageUrl, prompt, negativePrompt, tier)
        outputUrl = result.outputUrl
        predictionId = result.predictionId
      } else if (options.tier === 'professional') {
        // Multi-pass with ControlNet for professional
        const result = await this.runProfessionalWatercolor(processedImageUrl, prompt, negativePrompt, tier)
        outputUrl = result.outputUrl
        predictionId = result.predictionId
      } else {
        // Full pipeline with refinement for studio
        const result = await this.runStudioWatercolor(processedImageUrl, prompt, negativePrompt, tier)
        outputUrl = result.outputUrl
        predictionId = result.predictionId
      }
      
      const processingTimeMs = Date.now() - startTime
      
      return {
        success: true,
        outputUrl,
        processingTimeMs,
        cost: tier.costPerRender,
        tier: tier.name,
        predictionId
      }
    } catch (error) {
      console.error('Watercolor processing error:', error)
      return {
        success: false,
        processingTimeMs: Date.now() - startTime,
        cost: 0,
        tier: tier.name,
        error: error instanceof Error ? error.message : 'Processing failed'
      }
    }
  }
  
  private async preprocessImage(imageUrl: string, targetSize: number): Promise<string> {
    // For now, just return the URL - in production, we'd resize with Sharp
    // and upload to cloud storage
    return imageUrl
  }
  
  private async runBasicWatercolor(
    imageUrl: string, 
    prompt: string, 
    negativePrompt: string,
    tier: QualityTier
  ): Promise<{ outputUrl: string; predictionId: string }> {
    // Basic SDXL generation without ControlNet
    const output = await replicateClient.run(models.sdxl, {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image: imageUrl,
        num_inference_steps: tier.steps,
        guidance_scale: sdxlConfig.guidance_scale,
        scheduler: sdxlConfig.scheduler,
        width: tier.resolution,
        height: tier.resolution,
        strength: 0.8,
        seed: -1
      }
    }) as string[]
    
    return {
      outputUrl: output[0],
      predictionId: 'basic-' + Date.now() // Placeholder
    }
  }
  
  private async runProfessionalWatercolor(
    imageUrl: string, 
    prompt: string, 
    negativePrompt: string,
    tier: QualityTier
  ): Promise<{ outputUrl: string; predictionId: string }> {
    // First pass: Edge detection with ControlNet
    const cannyOutput = await replicateClient.run(models.controlnet, {
      input: {
        image: imageUrl,
        prompt: 'architectural lines, clean edges, structural elements',
        negative_prompt: 'blurry, soft',
        num_inference_steps: 20,
        guidance_scale: 5,
        controlnet_conditioning_scale: tier.cannyWeight,
        control_type: 'canny',
        scheduler: 'K_EULER_ANCESTRAL',
        seed: -1
      }
    }) as string[]
    
    // Second pass: Apply watercolor style
    const watercolorOutput = await replicateClient.run(models.sdxl, {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image: cannyOutput[0],
        num_inference_steps: tier.steps,
        guidance_scale: sdxlConfig.guidance_scale,
        scheduler: sdxlConfig.scheduler,
        width: tier.resolution,
        height: tier.resolution,
        strength: 0.7,
        seed: -1
      }
    }) as string[]
    
    return {
      outputUrl: watercolorOutput[0],
      predictionId: 'pro-' + Date.now()
    }
  }
  
  private async runStudioWatercolor(
    imageUrl: string, 
    prompt: string, 
    negativePrompt: string,
    tier: QualityTier
  ): Promise<{ outputUrl: string; predictionId: string }> {
    // Pass 1: Canny edge detection
    const cannyOutput = await replicateClient.run(models.controlnet, {
      input: {
        image: imageUrl,
        prompt: 'architectural lines, precise edges, interior structure',
        negative_prompt: 'blurry, soft, fuzzy',
        num_inference_steps: 25,
        guidance_scale: 5,
        controlnet_conditioning_scale: tier.cannyWeight,
        control_type: 'canny',
        scheduler: 'K_EULER_ANCESTRAL',
        seed: -1
      }
    }) as string[]
    
    // Pass 2: MLSD line detection (if available)
    // For now, we'll skip this as it requires a separate model
    
    // Pass 3: Main watercolor generation with enhanced prompt
    const enhancedPrompt = `${prompt}, masterpiece, best quality, ultra-detailed, professional artwork`
    const watercolorOutput = await replicateClient.run(models.sdxl, {
      input: {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        image: cannyOutput[0],
        num_inference_steps: tier.steps,
        guidance_scale: sdxlConfig.guidance_scale,
        scheduler: sdxlConfig.scheduler,
        width: tier.resolution,
        height: tier.resolution,
        strength: 0.65,
        seed: -1
      }
    }) as string[]
    
    // Pass 4: Upscale for final output (optional)
    // We'll implement this when needed
    
    return {
      outputUrl: watercolorOutput[0],
      predictionId: 'studio-' + Date.now()
    }
  }
  
  // Get prediction status
  async getStatus(predictionId: string) {
    try {
      const prediction = await replicateClient.getPrediction(predictionId)
      return prediction
    } catch (error) {
      console.error('Error getting prediction status:', error)
      throw error
    }
  }
  
  // Cancel a running prediction
  async cancel(predictionId: string) {
    try {
      const prediction = await replicateClient.cancelPrediction(predictionId)
      return prediction
    } catch (error) {
      console.error('Error cancelling prediction:', error)
      throw error
    }
  }
}

// Export singleton instance
export const watercolorProcessor = new WatercolorProcessor()