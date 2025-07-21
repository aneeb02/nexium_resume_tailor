'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import { ResumeUpload } from './ResumeUpload'
import { User, Mail, FileText, Edit2, Save, X, Calendar, LogOut, Upload, Download } from 'lucide-react'

interface Profile {
  id: string
  name: string
  avatar_url: string
}

interface Resume {
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
}

export function Dashboard() {
  const { user, signOut, updateProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [newName, setNewName] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
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
                          <div className="ml-4">
                            <a
                              href={resume.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-200 text-black font-bold py-2 px-3 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-gray-300 transition-all transform active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_#000]"
                            >
                              <Download size={14} className="transform group-hover:translate-y-0.5 transition-transform" />
                            </a>
                          </div>
                        </div>
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
