'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  const [hoveredImage, setHoveredImage] = useState<'before' | 'after' | null>(null)

  return (
    <section className="pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Transform Your
              <span className="block text-watercolor-500">Interior Designs</span>
              Into Watercolor Art
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Professional watercolor renderings from your SketchUp, Rhino, or CAD drawings 
              in seconds. Powered by AI trained specifically for interior designers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-watercolor-500 text-white rounded-lg hover:bg-watercolor-600 transition text-center font-medium"
              >
                Start Free Trial
              </Link>
              <Link
                href="/examples"
                className="px-8 py-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition text-center font-medium"
              >
                View Examples
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>3 free renders</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
              <div 
                className={`absolute inset-0 transition-opacity duration-300 ${
                  hoveredImage === 'after' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                {/* Placeholder for before image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">3D Render</span>
                </div>
              </div>
              <div 
                className={`absolute inset-0 transition-opacity duration-300 ${
                  hoveredImage === 'before' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="absolute inset-0 bg-watercolor-100 animate-pulse" />
                {/* Placeholder for after image */}
                <div className="absolute inset-0 flex items-center justify-center bg-watercolor-50">
                  <span className="text-watercolor-400">Watercolor Result</span>
                </div>
              </div>
              
              {/* Hover zones */}
              <div className="absolute inset-0 grid grid-cols-2">
                <button
                  className="relative group"
                  onMouseEnter={() => setHoveredImage('before')}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    Before
                  </div>
                </button>
                <button
                  className="relative group"
                  onMouseEnter={() => setHoveredImage('after')}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    After
                  </div>
                </button>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-watercolor-200 rounded-full blur-2xl opacity-60" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-watercolor-300 rounded-full blur-2xl opacity-40" />
          </div>
        </div>
      </div>
    </section>
  )
}