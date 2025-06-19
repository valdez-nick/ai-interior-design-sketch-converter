import Image from 'next/image'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Examples from '@/components/landing/Examples'
import Pricing from '@/components/landing/Pricing'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-watercolor-400 to-watercolor-600 rounded-full" />
            <span className="font-semibold text-xl">Watercolor Interior</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/examples" className="text-gray-600 hover:text-gray-900">
              Examples
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-watercolor-500 text-white rounded-lg hover:bg-watercolor-600 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-watercolor-500 text-white rounded-lg hover:bg-watercolor-600 transition"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Hero />
      <Features />
      <Examples />
      <Pricing />
      
      <footer className="bg-gray-50 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/examples">Examples</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/api">API</Link></li>
                <li><Link href="/support">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-600">
            <p>&copy; 2025 Watercolor Interior. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}