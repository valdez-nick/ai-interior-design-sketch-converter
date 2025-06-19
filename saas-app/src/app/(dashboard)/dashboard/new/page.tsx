'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { qualityTiers } from '@/config/ai-models'

export default function NewRenderPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [style, setStyle] = useState('classic')
  const [tier, setTier] = useState<'free' | 'professional' | 'studio'>('free')
  const [roomType, setRoomType] = useState('living room')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [renderId, setRenderId] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !preview) return

    setLoading(true)
    setError(null)
    
    try {
      // For demo purposes, we'll use the preview URL
      // In production, you'd upload to cloud storage first
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: preview,
          tier,
          roomType,
          style,
          atmosphere: undefined,
          colorTone: undefined,
          projectId: null
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to start rendering')
      }
      
      setRenderId(data.renderId)
      setProcessingStatus('Processing your image...')
      
      // Start polling for status
      checkRenderStatus(data.renderId)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }
  
  const checkRenderStatus = async (id: string) => {
    let attempts = 0
    const maxAttempts = 60 // 1 minute timeout
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/render/${id}`)
        const data = await response.json()
        
        if (data.status === 'completed') {
          setProcessingStatus('Rendering complete!')
          // Redirect to view the result
          setTimeout(() => {
            router.push(`/dashboard/render/${id}`)
          }, 1000)
        } else if (data.status === 'failed') {
          setError(data.error || 'Rendering failed')
          setLoading(false)
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(pollStatus, 1000) // Poll every second
        } else {
          setError('Rendering timeout')
          setLoading(false)
        }
      } catch (err) {
        setError('Failed to check status')
        setLoading(false)
      }
    }
    
    pollStatus()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-watercolor-400 to-watercolor-600 rounded-full" />
                <span className="ml-2 text-xl font-semibold">Watercolor Interior</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Render</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Interior Image
                  </label>
                  <div className="mt-1">
                    <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      {preview ? (
                        <div className="space-y-1 text-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto h-64 w-auto rounded"
                          />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-watercolor-600 hover:text-watercolor-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-watercolor-500"
                            >
                              <span>Change image</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-watercolor-600 hover:text-watercolor-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-watercolor-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quality Tier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Tier
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(qualityTiers).map((tierOption) => (
                      <label
                        key={tierOption.id}
                        className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                          tier === tierOption.id
                            ? 'border-watercolor-500 ring-2 ring-watercolor-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tier"
                          value={tierOption.id}
                          checked={tier === tierOption.id}
                          onChange={(e) => setTier(e.target.value as typeof tier)}
                          className="sr-only"
                        />
                        <div className="flex flex-1 flex-col">
                          <span className="block text-sm font-medium text-gray-900">
                            {tierOption.name}
                          </span>
                          <span className="mt-1 text-sm text-gray-500">
                            {tierOption.description}
                          </span>
                          <div className="mt-2 text-xs text-gray-400">
                            <div>{tierOption.processingTime}</div>
                            <div>${tierOption.costPerRender.toFixed(2)} per render</div>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {tierOption.features.slice(0, 2).map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Room Type Selection */}
                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    id="roomType"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-watercolor-500 focus:ring-watercolor-500 sm:text-sm"
                  >
                    <option value="living room">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="office">Office</option>
                    <option value="dining room">Dining Room</option>
                  </select>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watercolor Style
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'classic', name: 'Classic Watercolor', description: 'Soft, flowing colors' },
                      { id: 'loose', name: 'Loose Sketch', description: 'Artistic interpretation' },
                      { id: 'architectural', name: 'Architectural', description: 'Precise with wash' },
                      { id: 'minimal', name: 'Minimalist', description: 'Simple and clean' },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                          style === option.id
                            ? 'border-watercolor-500 ring-2 ring-watercolor-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="style"
                          value={option.id}
                          checked={style === option.id}
                          onChange={(e) => setStyle(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex flex-1">
                          <div className="flex flex-col">
                            <span className="block text-sm font-medium text-gray-900">
                              {option.name}
                            </span>
                            <span className="mt-1 flex items-center text-sm text-gray-500">
                              {option.description}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Status */}
                {processingStatus && (
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">{processingStatus}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-watercolor-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-watercolor-600 hover:bg-watercolor-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-watercolor-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Create Render'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}