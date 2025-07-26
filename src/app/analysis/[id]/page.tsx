'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Brain, Download, Sparkles, AlertTriangle, Award, TrendingUp, TrendingDown, FileText } from 'lucide-react'

interface AnalysisOutput {
  candidate_strengths: string[]
  candidate_weaknesses: string[]
  risk_factor: string
  reward_factor: {
    level: string
    scenario: string
    fit_duration: string
  }
  overall_fit_rating: number
  justification: string
}

interface AnalysisResult {
  output: AnalysisOutput
}

interface Resume {
  id: number
  user_id: string
  original_file_name: string
  file_url: string
  job_description?: string
  status: string
  created_at: string
  analysis_result?: {
    candidate_strengths: string[]
    candidate_weaknesses: string[]
    risk_factor: string
    reward_factor: {
    level: string
    scenario: string
    fit_duration: string
    }
  overall_fit_rating: number
  justification: string
  }
  analyzed_at?: string
  enhanced_resume_text?: string
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchResume() {
      if (!user) {
        router.push('/auth')
        return
      }

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resolvedParams.id)
          .eq('user_id', user.id)
          .single()

        if (error) {
          setError('Resume not found')
          return
        }

        if (!data.analysis_result) {
          setError('No analysis available for this resume')
          return
        }

        setResume(data)
      } catch (err) {
        setError('Failed to load resume analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
  }, [user, resolvedParams.id, supabase, router])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'High': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRewardColor = (reward: string) => {
    switch (reward) {
      case 'High': return 'bg-green-100 text-green-800 border-green-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-200 text-green-800 border-green-400'
    if (score >= 6) return 'bg-yellow-200 text-yellow-800 border-yellow-400'
    return 'bg-red-200 text-red-800 border-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000]">
          <div className="text-2xl font-bold text-black text-center">Loading analysis...</div>
        </div>
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">Error</div>
          <div className="text-black mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-black hover:bg-orange-600 transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Extract analysis data from the first item in the array
  const analysisData = resume.analysis_result || {
    candidate_strengths: [],
    candidate_weaknesses: [],
    risk_factor: 'Medium',
    reward_factor: { level: 'Medium', scenario: 'No scenario available', fit_duration: 'Unknown' },
    overall_fit_rating: 0,
    justification: 'No detailed analysis available'
  }
  
  // Ensure analysis has default values for safety
  const safeAnalysis = {
    overall_fit_rating: analysisData.overall_fit_rating || 0,
    risk_factor: analysisData.risk_factor || 'Medium',
    reward_factor: analysisData.reward_factor || { level: 'Medium', scenario: 'No scenario available', fit_duration: 'Unknown' },
    candidate_strengths: analysisData.candidate_strengths?.length ? analysisData.candidate_strengths : ['No strengths identified'],
    candidate_weaknesses: analysisData.candidate_weaknesses?.length ? analysisData.candidate_weaknesses : ['No areas for improvement identified'],
    justification: analysisData.justification || 'No detailed analysis available'
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] p-4">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-200 text-black font-bold py-2 px-3 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-gray-300 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
              >
                <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-black flex items-center">
                  <Brain size={32} className="mr-3 text-orange-500" />
                  Resume Analysis
                </h1>
                <p className="text-sm text-black mt-1">{resume.original_file_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Enhanced Resume Download */}
              {resume.enhanced_resume_text && (
                <a
                  href={`/api/download-enhanced-resume/${resume.id}`}
                  className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-purple-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
                  title="Download Enhanced Resume"
                >
                  <Sparkles size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                  Enhanced
                </a>
              )}
              
              {/* Original Resume Download */}
              <a
                href={resume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 text-black font-bold py-2 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-gray-300 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
                title="Download Original Resume"
              >
                <Download size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                Original
              </a>
              
              <div className="text-right ml-4">
                <div className="text-sm text-gray-600">Analyzed on</div>
                <div className="text-black font-medium">
                  {new Date(resume.analyzed_at!).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Overall Score */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]">
            <div className="text-center">
              <div className="text-lg font-bold text-black mb-2">Overall Fit Score</div>
              <div className={`inline-block px-6 py-3 rounded-full border-2 border-black font-bold text-2xl ${getScoreColor(safeAnalysis.overall_fit_rating)}`}>
                {safeAnalysis.overall_fit_rating}/10
              </div>
            </div>
          </div>

          {/* Risk Factor */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]">
            <div className="text-center">
              <div className="text-lg font-bold text-black mb-2 flex items-center justify-center">
                <AlertTriangle size={20} className="mr-2" />
                Risk Factor
              </div>
              <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold text-lg ${getRiskColor(safeAnalysis.risk_factor)}`}>
                {safeAnalysis.risk_factor}
              </div>
            </div>
          </div>

          {/* Reward Factor */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]">
            <div className="text-center">
              <div className="text-lg font-bold text-black mb-2 flex items-center justify-center">
                <Award size={20} className="mr-2" />
                Reward Potential
              </div>
              <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold text-lg ${getRewardColor(safeAnalysis.reward_factor.level)}`}>
                {safeAnalysis.reward_factor.level}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {safeAnalysis.reward_factor.fit_duration}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
            <div className="px-6 py-4 border-b-2 border-black bg-green-50">
              <h3 className="text-xl font-bold text-black flex items-center">
                <TrendingUp size={24} className="mr-2 text-green-600" />
                Candidate Strengths
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {safeAnalysis.candidate_strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 font-bold text-lg mr-3 mt-0.5">✓</span>
                    <span className="text-black">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
            <div className="px-6 py-4 border-b-2 border-black bg-red-50">
              <h3 className="text-xl font-bold text-black flex items-center">
                <TrendingDown size={24} className="mr-2 text-red-600" />
                Areas for Improvement
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {safeAnalysis.candidate_weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 font-bold text-lg mr-3 mt-0.5">•</span>
                    <span className="text-black">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reward Scenario */}
        <div className="mt-6 bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
          <div className="px-6 py-4 border-b-2 border-black bg-blue-50">
            <h3 className="text-xl font-bold text-black">Best-Case Scenario</h3>
          </div>
          <div className="p-6">
            <p className="text-black leading-relaxed">{safeAnalysis.reward_factor.scenario}</p>
          </div>
        </div>

        {/* Detailed Justification */}
        <div className="mt-6 bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
          <div className="px-6 py-4 border-b-2 border-black bg-orange-50">
            <h3 className="text-xl font-bold text-black">Detailed Analysis</h3>
          </div>
          <div className="p-6">
            <p className="text-black leading-relaxed whitespace-pre-line">{safeAnalysis.justification}</p>
          </div>
        </div>

        {/* Job Description (if available) */}
        {resume.job_description && (
          <div className="mt-6 bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
            <div className="px-6 py-4 border-b-2 border-black bg-gray-50">
              <h3 className="text-xl font-bold text-black flex items-center">
                <FileText size={24} className="mr-2" />
                Job Description Used
              </h3>
            </div>
            <div className="p-6">
              <p className="text-black text-sm leading-relaxed whitespace-pre-line">{resume.job_description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <div className="inline-block px-4 py-1 border-2 border-black rounded-full bg-white font-semibold text-sm shadow-[2px_2px_0px_0px_#000]">
          2025
        </div>
      </div>
    </div>
  )
}
