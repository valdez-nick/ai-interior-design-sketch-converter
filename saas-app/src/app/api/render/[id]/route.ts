import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get render record
    const { data: render, error } = await supabase
      .from('renders')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    
    if (error || !render) {
      return NextResponse.json({ error: 'Render not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: render.id,
      status: render.status,
      outputUrl: render.output_image_url,
      error: render.error_message,
      processingTime: render.processing_time_ms,
      createdAt: render.created_at,
      updatedAt: render.updated_at
    })
    
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}