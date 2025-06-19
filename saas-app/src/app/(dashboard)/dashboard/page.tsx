import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get recent renders
  const { data: renders } = await supabase
    .from('renders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action="/api/auth/logout" method="POST">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
              </h1>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 capitalize">
                    {profile?.subscription_tier || 'free'}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Credits Remaining</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {profile?.subscription_tier === 'free' 
                      ? `${profile?.credits_remaining || 0}/3` 
                      : 'Unlimited'}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Total Renders</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {renders?.length || 0}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Render Button */}
        <div className="px-4 py-4">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-watercolor-600 hover:bg-watercolor-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-watercolor-500"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Render
          </Link>
        </div>

        {/* Recent Renders */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Renders</h2>
          {renders && renders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renders.map((render) => (
                <div key={render.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200">
                    {render.output_image_url ? (
                      <img
                        src={render.output_image_url}
                        alt="Render"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {render.status === 'processing' ? 'Processing...' : 'No preview'}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{render.style}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(render.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No renders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first watercolor render.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-watercolor-600 hover:bg-watercolor-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-watercolor-500"
                >
                  Create Render
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}