  import { NextRequest, NextResponse } from 'next/server'
  import { createClient } from '@/utils/supabase/server'

  export async function POST(request: NextRequest) {
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

      const { resume_id } = await request.json()

      if (!resume_id) {
        return NextResponse.json(
          { error: 'Resume ID is required' },
          { status: 400 }
        )
      }

      // Get resume details from database
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resume_id)
        .eq('user_id', user.id)
        .single()

      if (resumeError || !resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      // Check if resume is already being analyzed or has been analyzed
      if (resume.status === 'analyzing' || resume.status === 'analyzed') {
        return NextResponse.json(
          { error: `Resume is already ${resume.status}` },
          { status: 400 }
        )
      }

      // Update status to analyzing
      const { error: updateError } = await supabase
        .from('resumes')
        .update({ status: 'analyzing' })
        .eq('id', resume_id)

      if (updateError) {
        console.error('Error updating resume status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update resume status' },
          { status: 500 }
        )
      }

      // Trigger n8n workflow
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/analyze-resume'
      
      const n8nPayload = {
        resume_id: resume.id,
        user_id: user.id,
        file_url: resume.file_url,
        job_description: resume.job_description || '',
        original_file_name: resume.original_file_name,
        file_type: resume.file_type
      }

      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload),
        })

        if (!n8nResponse.ok) {
          throw new Error(`n8n webhook failed: ${n8nResponse.status}`)
        }
        
        const analysisResult = await n8nResponse.json()

        // Save analysis to Supabase
        await supabase
      .from('resumes')
      .update({
        status: 'analyzed',
        analysis_result: analysisResult.analysis,  // save to jsonb column
        analyzed_at: new Date().toISOString(),     // optional: timestamp column
      })
      .eq('id', resume_id)

        return NextResponse.json({
          message: 'Analysis completed successfully',
          analysis: analysisResult.output,
          resume_id: resume_id
        })


      } catch (n8nError) {
        console.error('n8n webhook error:', n8nError)
        
        // Reset status back to uploaded if n8n fails
        await supabase
          .from('resumes')
          .update({ status: 'uploaded' })
          .eq('id', resume_id)

        return NextResponse.json(
          { error: 'Analysis service unavailable. Please try again later.' },
          { status: 503 }
        )
      }

    } catch (error) {
      console.error('Analysis error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
