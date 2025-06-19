'use client'

import { useState } from 'react'

export default function Examples() {
  const [selectedStyle, setSelectedStyle] = useState('classic')

  const styles = [
    { id: 'classic', name: 'Classic Watercolor', description: 'Traditional watercolor with soft edges' },
    { id: 'loose', name: 'Loose Sketch', description: 'Free-flowing artistic interpretation' },
    { id: 'architectural', name: 'Architectural', description: 'Precise lines with watercolor wash' },
    { id: 'minimal', name: 'Minimalist', description: 'Simple washes with key details' },
  ]

  const examples = [
    { id: 1, style: 'Living Room', time: '12s' },
    { id: 2, style: 'Bedroom', time: '15s' },
    { id: 3, style: 'Kitchen', time: '18s' },
    { id: 4, style: 'Office', time: '14s' },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            See the Magic in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Transform any interior design into stunning watercolor art. 
            Choose your style and see instant results.
          </p>
        </div>

        {/* Style selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`px-6 py-3 rounded-lg transition ${
                selectedStyle === style.id
                  ? 'bg-watercolor-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{style.name}</div>
              <div className="text-sm opacity-75">{style.description}</div>
            </button>
          ))}
        </div>

        {/* Examples grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {examples.map((example) => (
            <div key={example.id} className="group relative">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                {/* Placeholder for example images */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{example.style}</div>
                    <div className="text-sm">Watercolor Style: {selectedStyle}</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                Rendered in {example.time}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <h3 className="font-semibold">{example.style} Design</h3>
                <button className="text-watercolor-500 hover:text-watercolor-600 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/examples"
            className="inline-flex items-center gap-2 text-watercolor-500 hover:text-watercolor-600 font-medium"
          >
            View Full Gallery
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}