import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { watercolorProcessor } from '@/lib/ai/watercolor-processor'
import type { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user profile to check subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, credits_remaining')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    // Parse request body
    const body = await request.json()
    const { imageUrl, tier, roomType, style, atmosphere, colorTone, projectId } = body
    
    // Validate tier access
    if (tier !== 'free' && profile.subscription_tier === 'free') {
      return NextResponse.json({ 
        error: 'Upgrade required', 
        message: 'Please upgrade your subscription to access this quality tier' 
      }, { status: 403 })
    }
    
    // Check credits for free tier
    if (profile.subscription_tier === 'free' && profile.credits_remaining <= 0) {
      return NextResponse.json({ 
        error: 'No credits remaining', 
        message: 'You have used all your free credits this month' 
      }, { status: 403 })
    }
    
    // Create render record
    const { data: render, error: renderError } = await supabase
      .from('renders')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        input_image_url: imageUrl,
        style: style,
        settings: {
          tier,
          roomType,
          atmosphere,
          colorTone
        },
        status: 'processing'
      })
      .select()
      .single()
    
    if (renderError || !render) {
      console.error('Error creating render record:', renderError)
      return NextResponse.json({ error: 'Failed to create render record' }, { status: 500 })
    }
    
    // Process image asynchronously
    processInBackground(render.id, imageUrl, {
      tier,
      roomType,
      style,
      atmosphere,
      colorTone,
      userId: user.id,
      projectId
    }, supabase, profile.subscription_tier)
    
    return NextResponse.json({
      success: true,
      renderId: render.id,
      message: 'Processing started',
      estimatedTime: getEstimatedTime(tier)
    })
    
  } catch (error) {
    console.error('Render API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Background processing function
async function processInBackground(
  renderId: string,
  imageUrl: string,
  options: any,
  supabase: any,
  subscriptionTier: string
) {
  try {
    // Process the image
    const result = await watercolorProcessor.processImage(imageUrl, options)
    
    // Update render record
    await supabase
      .from('renders')
      .update({
        output_image_url: result.outputUrl,
        status: result.success ? 'completed' : 'failed',
        error_message: result.error,
        processing_time_ms: result.processingTimeMs,
        updated_at: new Date().toISOString()
      })
      .eq('id', renderId)
    
    // Deduct credit for free tier
    if (subscriptionTier === 'free' && result.success) {
      await supabase.rpc('decrement_credits', { user_id: options.userId })
    }
    
  } catch (error) {
    console.error('Background processing error:', error)
    
    // Update render as failed
    await supabase
      .from('renders')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Processing failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', renderId)
  }
}

function getEstimatedTime(tier: string): string {
  const times = {
    free: '10-15 seconds',
    professional: '20-30 seconds',
    studio: '45-60 seconds'
  }
  return times[tier as keyof typeof times] || '30 seconds'
}