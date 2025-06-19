import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function RenderPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get render details
  const { data: render } = await supabase
    .from('renders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!render) {
    notFound()
  }

  const settings = render.settings as any

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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Render Result</h1>
              
              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    render.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : render.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {render.status}
                  </span>
                </div>
                {render.processing_time_ms && (
                  <p className="mt-1 text-sm text-gray-500">
                    Processing time: {(render.processing_time_ms / 1000).toFixed(1)} seconds
                  </p>
                )}
              </div>

              {/* Settings */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Quality Tier:</span>
                  <p className="text-sm text-gray-900 capitalize">{settings?.tier || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Room Type:</span>
                  <p className="text-sm text-gray-900 capitalize">{settings?.roomType || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Style:</span>
                  <p className="text-sm text-gray-900 capitalize">{render.style || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(render.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Images */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Original</h3>
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    {render.input_image_url ? (
                      <img
                        src={render.input_image_url}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Watercolor Result</h3>
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    {render.output_image_url ? (
                      <img
                        src={render.output_image_url}
                        alt="Watercolor Result"
                        className="w-full h-full object-cover"
                      />
                    ) : render.status === 'processing' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Processing...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {render.error_message || 'No result'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {render.output_image_url && (
                <div className="mt-6 flex gap-4">
                  <a
                    href={render.output_image_url}
                    download={`watercolor-${render.id}.png`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-watercolor-600 hover:bg-watercolor-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-watercolor-500"
                  >
                    Download Result
                  </a>
                  <Link
                    href="/dashboard/new"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-watercolor-500"
                  >
                    Create Another
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}