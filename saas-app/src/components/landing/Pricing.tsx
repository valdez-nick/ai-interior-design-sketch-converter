'use client'

import Link from 'next/link'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our service',
      features: [
        '3 renders per month',
        '1024x1024 resolution',
        'Basic watercolor styles',
        'Watermark on exports',
        'Community support',
      ],
      cta: 'Start Free',
      href: '/signup',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$39',
      period: '/month',
      description: 'For active interior designers',
      features: [
        'Unlimited renders',
        'Up to 2K resolution',
        'All watercolor styles',
        'No watermark',
        'Project management',
        'Priority support',
        'Commercial use rights',
      ],
      cta: 'Start Free Trial',
      href: '/signup?plan=professional',
      highlighted: true,
    },
    {
      name: 'Studio',
      price: '$99',
      period: '/month',
      description: 'For design studios & teams',
      features: [
        'Everything in Professional',
        '4K & 8K exports',
        'Custom style training',
        'API access',
        'Batch processing',
        'Team collaboration',
        'Priority GPU allocation',
        'White-label exports',
      ],
      cta: 'Start Free Trial',
      href: '/signup?plan=studio',
      highlighted: false,
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.highlighted
                  ? 'ring-2 ring-watercolor-500 shadow-xl'
                  : 'shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-watercolor-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition ${
                  plan.highlighted
                    ? 'bg-watercolor-500 text-white hover:bg-watercolor-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need a custom plan for your enterprise?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-watercolor-500 hover:text-watercolor-600 font-medium"
          >
            Contact Sales
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}