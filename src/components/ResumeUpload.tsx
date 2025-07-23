'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

interface ResumeUploadProps {
  onUploadSuccess: (resume: Record<string, unknown>) => void
  onClose: () => void
}

export function ResumeUpload({ onUploadSuccess, onClose }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a PDF or DOCX file.'
    }
    
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'File size too large. Maximum size is 5MB.'
    }
    
    return null
  }

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobDescription', jobDescription)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      onUploadSuccess(result.resume)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] w-full max-w-md">
        <div className="px-6 py-4 border-b-2 border-black">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black flex items-center">
              <Upload size={24} className="mr-2" />
              Upload Resume
            </h2>
            <button
              onClick={onClose}
              className="text-black hover:text-orange-500 transition-colors"
              disabled={isUploading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              Resume File (PDF or DOCX)
            </label>
            
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-black hover:border-orange-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-black font-medium">
                  Drag and drop your resume here, or{' '}
                  <span className="text-orange-500 underline cursor-pointer">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  PDF or DOCX files only, max 5MB
                </p>
              </div>
            ) : (
              <div className="border-2 border-black rounded-lg p-4 bg-white shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText size={20} className="text-orange-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-black">
              Job Description (Optional)
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get better tailored feedback..."
              className="w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              rows={4}
              disabled={isUploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!file || isUploading}
              className="flex-1 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500 disabled:transform-none disabled:shadow-[4px_4px_0px_0px_#000]"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                  Upload Resume
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="bg-gray-300 text-black font-bold py-3 px-4 rounded-lg border-2 border-black hover:bg-gray-400 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
