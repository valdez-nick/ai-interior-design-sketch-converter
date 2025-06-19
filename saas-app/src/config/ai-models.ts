export interface QualityTier {
  id: 'free' | 'professional' | 'studio'
  name: string
  description: string
  steps: number
  resolution: number
  cannyWeight: number
  mlsdWeight?: number
  processingTime: string
  costPerRender: number
  features: string[]
}

export const qualityTiers: Record<string, QualityTier> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic watercolor effect',
    steps: 20,
    resolution: 1024,
    cannyWeight: 0.5,
    processingTime: '10-15 seconds',
    costPerRender: 0.01,
    features: ['Single pass', 'Basic watercolor effect', '1024x1024 resolution']
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Balanced quality for most projects',
    steps: 35,
    resolution: 2048,
    cannyWeight: 0.4,
    mlsdWeight: 0.3,
    processingTime: '20-30 seconds',
    costPerRender: 0.03,
    features: ['Multi-pass rendering', 'Refined edges', 'Better color blending', '2048x2048 resolution']
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    description: 'Maximum quality for professional presentations',
    steps: 50,
    resolution: 4096,
    cannyWeight: 0.35,
    mlsdWeight: 0.25,
    processingTime: '45-60 seconds',
    costPerRender: 0.08,
    features: ['Multiple refinement passes', 'Custom paper textures', 'Advanced color grading', '4096x4096 resolution', 'Priority processing']
  }
}

export const models = {
  // Main SDXL model for high-quality generation
  sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  
  // ControlNet for edge detection
  controlnet: 'lucataco/controlnet-sdxl:5c10a45d-ec33-42da-b95f-4380ebb96ef8',
  
  // Image preprocessing
  cannyEdge: 'salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746',
  
  // Upscaling for Studio tier
  upscaler: 'nightmareai/real-esrgan:42fed1c4974146d4e2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b'
}

export interface WatercolorPromptConfig {
  roomType: string
  style: 'classic' | 'loose' | 'architectural' | 'minimal'
  atmosphere?: string
  colorTone?: string
}

export function generateWatercolorPrompt(config: WatercolorPromptConfig): {
  prompt: string
  negativePrompt: string
} {
  const basePrompt = `professional watercolor illustration of ${config.roomType} interior, architectural rendering in watercolor medium, soft washes, visible brushstrokes, paper texture, color bleeding at edges, wet on wet technique, artistic interpretation`
  
  const styleModifiers = {
    classic: 'traditional watercolor painting, gallery quality, by renowned architectural illustrator',
    loose: 'loose sketch style, expressive brushwork, spontaneous color flow, artistic freedom',
    architectural: 'precise architectural watercolor, clean lines with soft washes, professional presentation',
    minimal: 'minimalist watercolor, subtle washes, restrained palette, elegant simplicity'
  }
  
  const atmosphereModifier = config.atmosphere ? `, ${config.atmosphere}` : ''
  const colorModifier = config.colorTone ? `, ${config.colorTone} color palette` : ', muted sophisticated colors'
  
  const prompt = `${basePrompt}, ${styleModifiers[config.style]}${atmosphereModifier}${colorModifier}, ((watercolor painting))`
  
  const negativePrompt = 'photo, photorealistic, 3d render, digital art, anime, cartoon, oversaturated, sharp edges, hard lines, computer generated, cgi, artificial, plastic, glossy'
  
  return { prompt, negativePrompt }
}

export const sdxlConfig = {
  guidance_scale: 7.5,
  scheduler: 'K_EULER_ANCESTRAL',
  clip_skip: 2,
  safety_checker: false,
  watermark: false
}

export const controlNetConfig = {
  canny: {
    low_threshold: 100,
    high_threshold: 200
  },
  mlsd: {
    score_threshold: 0.1,
    distance_threshold: 5
  }
}