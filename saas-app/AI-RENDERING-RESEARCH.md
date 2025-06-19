# AI Watercolor Rendering Research & Technical Documentation

## Executive Summary

This document contains comprehensive research on implementing AI-powered watercolor rendering for interior design images, specifically targeting the transformation of 3D renders from SketchUp/Rhino into professional watercolor illustrations.

## Target Output Style

The goal is to achieve professional watercolor renderings with:
- Soft, flowing colors with wet-on-wet effects
- Preserved architectural accuracy
- Artistic brush strokes and color bleeding
- Hand-drawn quality with professional polish
- Muted, sophisticated color palette
- Visible paper texture

## Technical Approach

### Model Architecture

#### 1. Base Models
- **SDXL 1.0**: Best quality for architectural details, 1024x1024 native resolution
- **Stable Diffusion XL**: Superior for artistic styles and high-resolution outputs

#### 2. ControlNet Integration
Using `lucataco/sdxl-controlnet` on Replicate ($0.01/run):
- **Canny Edge Detection**: Preserves architectural lines with adjustable thresholds
- **MLSD (Mobile Line Segment Detection)**: Specifically for straight lines in interiors
- **Depth ControlNet**: Maintains spatial relationships and perspective

#### 3. LoRA Models (Low-Rank Adaptation)
Key models identified from Civitai:
- **Watercolor Style Architecture**: Specifically designed for architectural watercolor sketches
- **Architectural Sketch v1.0**: Contains watercolor effects with tags like "smref sketch, park effect, watercolor effect"
- **Watercolor Painting - Aquarelle (Flux LoRA)**: Newer Flux-based model with 0.65 weighting recommendation

### Processing Pipeline

```
Input (3D Render) → Preprocessing → Edge Detection → 
ControlNet Processing → Watercolor Style Transfer → 
Post-processing → Output
```

#### Detailed Steps:

1. **Image Preprocessing**
   - Resize to optimal dimensions (1024x1024 for base)
   - Color space normalization
   - Contrast adjustment for better edge detection

2. **Multi-Pass Generation**
   ```
   Pass 1: Structure Preservation
   - Model: lucataco/sdxl-controlnet
   - ControlNet: Canny (weight 0.7) + MLSD (weight 0.3)
   - Focus: Architectural accuracy
   
   Pass 2: Watercolor Style Application
   - Model: SDXL + Watercolor LoRA
   - ControlNet: Previous output (weight 0.3-0.4)
   - Focus: Artistic style
   
   Pass 3: Refinement (Studio tier only)
   - Upscaling and detail enhancement
   - Paper texture overlay
   - Color adjustment
   ```

### Prompt Engineering

#### Optimal Prompt Structure:
```
Positive Prompt:
"professional watercolor illustration of [room_type] interior,
architectural rendering in watercolor medium,
soft washes, visible brushstrokes, paper texture,
color bleeding at edges, wet on wet technique,
artistic interpretation, muted colors,
by renowned architectural illustrator,
gallery quality, ((watercolor painting))"

Negative Prompt:
"photo, photorealistic, 3d render, digital art, 
anime, cartoon, oversaturated, sharp edges,
hard lines, computer generated, cgi"
```

#### Room-Specific Variations:
- Living Room: "warm atmosphere, natural light"
- Bedroom: "soft, calming tones, cozy feeling"
- Kitchen: "bright, clean, functional elegance"
- Office: "professional, organized, sophisticated"

### Three-Tier Quality System

#### Tier 1: Free (Basic Quality)
- **Steps**: 20
- **Resolution**: 1024x1024
- **ControlNet Weight**: 0.5
- **Processing Time**: 10-15 seconds
- **Cost**: ~$0.01 per image
- **Features**: Single pass, basic watercolor effect

#### Tier 2: Professional (Balanced Quality)
- **Steps**: 30-40
- **Resolution**: 2048x2048
- **ControlNet Weight**: 0.4 (Canny) + 0.3 (MLSD)
- **Processing Time**: 20-30 seconds
- **Cost**: ~$0.03 per image
- **Features**: Multi-pass, refined edges, better color blending

#### Tier 3: Studio (Maximum Quality)
- **Steps**: 50+
- **Resolution**: 4096x4096
- **ControlNet Weight**: Fine-tuned per image
- **Processing Time**: 45-60 seconds
- **Cost**: ~$0.08 per image
- **Features**: 
  - Multiple refinement passes
  - Custom paper textures
  - Advanced color grading
  - Batch processing
  - API access

### Technical Parameters

#### SDXL Configuration:
```javascript
{
  guidance_scale: 7.5,        // 6-8 range for artistic freedom
  num_inference_steps: 30,    // Varies by tier
  strength: 0.8,              // 0.7-0.85 for style transfer
  scheduler: "K_EULER_A",     // Best for artistic styles
  seed: -1,                   // Random for variation
  clip_skip: 2                // Better for artistic styles
}
```

#### ControlNet Settings:
```javascript
{
  canny_threshold_1: 100,     // Lower threshold
  canny_threshold_2: 200,     // Upper threshold
  mlsd_threshold: 0.1,        // Line detection sensitivity
  control_strength: 0.4,      // Balance structure vs style
  starting_control_step: 0,   // When to apply control
  ending_control_step: 0.3    // When to stop control
}
```

### Cost Analysis

#### Replicate Pricing (2025):
- SDXL generation: ~$0.012 per image
- ControlNet processing: ~$0.01 per run
- Upscaling: ~$0.008 per image

#### Per-Render Costs:
- Free Tier: $0.01-0.015
- Professional: $0.03-0.04
- Studio: $0.08-0.10

#### Monthly Projections:
- 1,000 renders: $30-40
- 10,000 renders: $300-400
- Volume discounts available

### Alternative Approaches

#### 1. ComfyUI Workflow (For Future Optimization)
- Create custom workflow with precise control
- Deploy on RunPod for $0.02-0.03 per render
- Better for complex multi-step processes

#### 2. Local GPU Deployment
- Requires NVIDIA GPU with 8GB+ VRAM
- One-time model download (6-10GB)
- No per-render costs
- Suitable for desktop application

#### 3. Hybrid Approach
- Basic effects in browser (free tier)
- Server processing for paid tiers
- Reduces infrastructure costs

### Quality Benchmarks

#### Success Criteria:
1. **Architectural Accuracy**: Lines remain straight, proportions correct
2. **Watercolor Authenticity**: Visible brush strokes, color bleeding, paper texture
3. **Style Consistency**: Multiple renders maintain similar artistic quality
4. **Processing Speed**: Under 30 seconds for professional tier
5. **User Satisfaction**: Target 4.5+ rating

#### Test Cases:
- Modern minimalist living room (clean lines)
- Traditional bedroom (complex details)
- Industrial kitchen (mixed materials)
- Home office (furniture detail)

### Implementation Recommendations

1. **Start with Replicate**: Quick MVP, proven infrastructure
2. **Use SDXL + ControlNet**: Best quality/control balance
3. **Implement 3-tier system**: Clear value proposition
4. **Monitor costs closely**: Adjust parameters based on usage
5. **Collect user feedback**: Iterate on prompt templates

### Future Enhancements

1. **Custom LoRA Training**
   - Train on 50-100 professional watercolor interiors
   - Focus on specific style matching user's example
   - Deploy as custom model

2. **Style Variations**
   - Loose sketch watercolor
   - Architectural watercolor
   - Minimalist wash
   - Detailed illustration

3. **Advanced Features**
   - Batch processing
   - Style mixing
   - Color palette control
   - Progressive rendering

### References

- Stable Diffusion Art ControlNet Guide
- Civitai Watercolor LoRA Models
- Replicate SDXL Documentation
- ComfyUI Architectural Workflows
- RunPod Serverless GPU Pricing

---

*Last Updated: January 2025*
*Research compiled for Watercolor Interior SaaS MVP*