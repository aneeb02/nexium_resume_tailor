'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import { ResumeUpload } from './ResumeUpload'
import { User, Mail, FileText, Edit2, Save, X, Calendar, LogOut, Upload, Download, Brain, Loader2, Eye, Sparkles } from 'lucide-react'

interface Profile {
  id: string
  name: string
  avatar_url: string
}

export interface Resume {
  id: number
  user_id: string
  original_file_name: string
  enhanced_file_name?: string
  storage_path: string
  file_url: string
  file_size: number
  file_type: string
  job_description?: string
  status: string
  created_at: string
  analysis_result?: {
    overall_fit_rating: number
    candidate_strengths: string[]
    candidate_weaknesses: string[]
    risk_factor: string
    reward_factor?: {
      level: string
      scenario: string
      fit_duration: string
    }
    justification: string
  }
  analyzed_at?: string
  enhanced_resume_text?: string
}

export function Dashboard() {
  const router = useRouter()
  const { user, signOut, updateProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [newName, setNewName] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [analyzingResumeId, setAnalyzingResumeId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // If profile doesn't exist, create a default one
          if (profileError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (!createError && newProfile) {
              setProfile(newProfile)
              setNewName(newProfile.name || '')
            }
          }
        } else {
          setProfile(profileData)
          setNewName(profileData.name || '')
        }

        // Fetch user resumes
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (resumeError) {
          console.error('Error fetching resumes:', resumeError)
        } else {
          setResumes(resumeData || [])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await updateProfile(newName)
      if (error) {
        console.error('Error updating profile:', error)
      } else {
        setProfile(prev => prev ? { ...prev, name: newName } : null)
        setEditingProfile(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleUploadSuccess = (newResume: Resume) => {
    setResumes(prev => [newResume, ...prev])
    setShowUploadModal(false)
  }

  const handleAnalyze = async (resumeId: number) => {
    setAnalyzingResumeId(resumeId)
    
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume_id: resumeId }),
      })

      const result = await response.json()
      console.log(result.analysis)

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed')
      }

      // Update the resume in the local state with analysis result
      setResumes(prev => prev.map(resume => 
        resume.id === resumeId 
          ? { 
              ...resume, 
              status: 'analyzed',
              analysis_result: result.analysis,
              analyzed_at: new Date().toISOString()
            }
          : resume
      ))

    } catch (error) {
      console.error('Analysis error:', error)
      alert(error instanceof Error ? error.message : 'Analysis failed')
      
      // Reset status back to uploaded on error
      setResumes(prev => prev.map(resume => 
        resume.id === resumeId 
          ? { ...resume, status: 'uploaded' }
          : resume
      ))
    } finally {
      setAnalyzingResumeId(null)
    }
  }

if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000]">
          <div className="text-2xl font-bold text-black text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] p-4">
      <div className="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
<div className="h-12 w-12 rounded-full bg-orange-500 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <span className="text-white font-medium">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div>
<h1 className="text-3xl font-bold text-black">
                  Welcome, {profile?.name || 'User'}!
                </h1>
<p className="text-sm text-black">{user?.email}</p>
              </div>
            </div>
<button
              onClick={handleSignOut}
              className="bg-orange-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
            >
              <LogOut size={20} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Section */}
<div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
              <div className="px-4 py-5 sm:p-6">
<div className="inline-block px-4 py-2 border-2 border-black rounded-full bg-white font-bold text-lg mb-4 shadow-[4px_4px_0px_0px_#000]">
                  <User size={20} className="inline mr-2" />
                  Profile Information
                </div>
                {editingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
<label htmlFor="name" className="block text-sm font-medium text-black">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="mt-1 block w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="flex space-x-3">
<button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-black flex items-center justify-center group transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
                      >
                        <Save size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold px-4 py-2 rounded-lg border-2 border-black flex items-center justify-center group transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
                      >
                        <X size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
<dt className="text-sm font-medium text-black flex items-center"><User size={16} className="mr-2" />Name</dt>
                      <dd className="mt-1 text-sm text-black font-bold">{profile?.name || 'Not set'}</dd>
                    </div>
                    <div>
<dt className="text-sm font-medium text-black flex items-center"><Mail size={16} className="mr-2" />Email</dt>
                      <dd className="mt-1 text-sm text-black font-bold">{user?.email}</dd>
                    </div>
<button
                      onClick={() => setEditingProfile(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-black flex items-center justify-center group transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
                    >
                      <Edit2 size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resumes Section */}
<div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="inline-block px-4 py-2 border-2 border-black rounded-full bg-white font-bold text-lg shadow-[4px_4px_0px_0px_#000]">
                    <FileText size={20} className="inline mr-2" />
                    My Resumes ({resumes.length})
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
                  >
                    <Upload size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                    Upload Resume
                  </button>
                </div>
                {resumes.length === 0 ? (
<div className="text-center py-8">
                    <p className="text-black font-bold">No resumes yet.</p>
                    <p className="text-sm text-black mt-2 mb-4">
                      Upload your first resume to get started!
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000] mx-auto"
                    >
                      <Upload size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                      Upload Your First Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
<div key={resume.id} className="border-2 border-black rounded-lg p-4 bg-white shadow-[4px_4px_0px_0px_#000]">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-black flex items-center">
                              <FileText size={16} className="mr-2 text-orange-500" />
                              {resume.original_file_name}
                            </h4>
                            <div className="mt-1 space-y-1">
                              <p className="text-xs text-gray-600">
                                {(resume.file_size / 1024 / 1024).toFixed(2)} MB • {resume.file_type.includes('pdf') ? 'PDF' : 'DOCX'} • {resume.status}
                              </p>
                              {resume.job_description && (
                                <p className="text-xs text-gray-600">
                                  Job description: {resume.job_description.substring(0, 100)}{resume.job_description.length > 100 ? '...' : ''}
                                </p>
                              )}
                            </div>
                            {resume.enhanced_file_name && (
                              <p className="text-sm text-black font-medium mt-2">
                                Enhanced: {resume.enhanced_file_name}
                              </p>
                            )}
                            <p className="text-xs text-black mt-2 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            {/* View Analysis Button - Only show if analyzed */}
                            {resume.status === 'analyzed' && resume.analysis_result && (
                              <button
                                onClick={() => router.push(`/analysis/${resume.id}`)}
                                className="bg-green-500 text-white font-bold py-2 px-3 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-green-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_#000]"
                                title="View Analysis"
                              >
                                <Eye size={14} className="transform group-hover:translate-y-0.5 transition-transform" />
                              </button>
                            )}
                            
                            {/* Analyze Button - Only show if uploaded */}
                            {resume.status === 'uploaded' && (
                              <button
                                onClick={() => handleAnalyze(resume.id)}
                                disabled={analyzingResumeId === resume.id}
                                className="bg-blue-500 text-white font-bold py-2 px-3 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-blue-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Analyze Resume"
                              >
                                {analyzingResumeId === resume.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Brain size={14} className="transform group-hover:translate-y-0.5 transition-transform" />
                                )}
                              </button>
                            )}
                            
                            {/* Enhanced Resume Download Button - Only show if analyzed and enhanced resume exists */}
                            {resume.status === 'analyzed' && resume.enhanced_resume_text && (
                              <a
                                href={`/api/download-enhanced-resume/${resume.id}`}
                                className="bg-purple-500 text-white font-bold py-2 px-3 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-purple-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_#000]"
                                title="Download Enhanced Resume"
                              >
                                <Sparkles size={14} className="transform group-hover:translate-y-0.5 transition-transform" />
                              </a>
                            )}
                            
                            {/* Download Original Button */}
                            <a
                              href={resume.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-200 text-black font-bold py-2 px-3 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-gray-300 transition-all transform active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_#000]"
                              title="Download Original Resume"
                            >
                              <Download size={14} className="transform group-hover:translate-y-0.5 transition-transform" />
                            </a>
                          </div>
                        </div>
                        
                        {/* Analysis Results Preview */}
                        {resume.status === 'analyzed' && resume.analysis_result && (
                          <div className="mt-4 pt-4 border-t-2 border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {/* Score */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-black">Score:</span>
                                  <div className={`px-3 py-1 rounded-full border-2 border-black font-bold text-sm ${
                                    resume.analysis_result.overall_fit_rating >= 8 ? 'bg-green-200' :
                                    resume.analysis_result.overall_fit_rating >= 6 ? 'bg-yellow-200' :
                                    'bg-red-200'
                                  }`}>
                                    {resume.analysis_result.overall_fit_rating}/10
                                  </div>
                                </div>
                                
                                {/* Risk */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-black">Risk:</span>
                                  <div className={`px-2 py-1 rounded border-2 border-black text-xs font-bold ${
                                    resume.analysis_result.risk_factor === 'Low' ? 'bg-green-100' :
                                    resume.analysis_result.risk_factor === 'Medium' ? 'bg-yellow-100' :
                                    'bg-red-100'
                                  }`}>
                                    {resume.analysis_result.risk_factor}
                                  </div>
                                </div>
                              </div>
                              
                              {/* View Full Analysis Link */}
                              <button
                                onClick={() => router.push(`/analysis/${resume.id}`)}
                                className="text-orange-500 hover:text-orange-600 font-medium text-sm underline"
                              >
                                View Full Analysis →
                              </button>
                            </div>
                            
                            <div className="text-xs text-gray-500 flex items-center mt-2">
                              <Calendar size={12} className="mr-1" />
                              Analyzed on {new Date(resume.analyzed_at!).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center mt-4">
        <div className="inline-block px-4 py-1 border-2 border-black rounded-full bg-white font-semibold text-sm shadow-[2px_2px_0px_0px_#000]">
          2025
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ResumeUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  )
}
