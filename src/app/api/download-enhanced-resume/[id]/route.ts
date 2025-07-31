import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const resumeId = resolvedParams.id

    // Get resume details from database
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('original_file_name, enhanced_resume_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    if (!resume.enhanced_resume_text) {
      return NextResponse.json(
        { error: 'Enhanced resume not available' },
        { status: 404 }
      )
    }

    // Generate filename based on original filename
    const originalName = resume.original_file_name.replace(/\.[^/.]+$/, '') // Remove extension
    const enhancedFilename = `${originalName}_enhanced.txt`

    // Return the text file
    return new NextResponse(resume.enhanced_resume_text, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${enhancedFilename}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
