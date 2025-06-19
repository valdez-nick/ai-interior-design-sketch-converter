# Watercolor Interior SaaS - AI-Powered Architectural Rendering

Transform interior designs into beautiful watercolor renderings using AI. Built with Next.js 14, Supabase, Stripe, and Replicate.

## 🚀 Features

- **AI-Powered Rendering**: Convert 3D renders to watercolor art in seconds
- **Multiple Styles**: Classic watercolor, loose sketch, architectural, minimalist
- **Subscription Management**: Free tier + paid plans with Stripe
- **Project Management**: Organize renders by project
- **High Resolution**: Export up to 8K for professional use
- **User Authentication**: Secure auth with Supabase
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI Processing**: Replicate API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Replicate account
- Vercel account (for deployment)

## 🔧 Setup

### 1. Clone and Install

```bash
git clone [your-repo]
cd saas-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema SQL in `supabase/schema.sql`
3. Enable Google OAuth provider in Authentication settings
4. Copy your project URL and anon key

### 3. Set up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Create products and prices:
   - Professional: $39/month
   - Studio: $99/month
3. Set up webhook endpoint pointing to `/api/webhooks/stripe`
4. Copy your keys and price IDs

### 4. Set up Replicate

1. Create account at [replicate.com](https://replicate.com)
2. Copy your API token

### 5. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all the required values in `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── landing/          # Landing page components
│   ├── dashboard/        # Dashboard components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── stripe/           # Stripe configuration
│   └── replicate/        # AI processing
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── utils/                 # Helper functions
```

## 🔑 Key Files

- `src/app/api/render/route.ts` - AI rendering endpoint
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `src/lib/replicate/watercolor.ts` - Watercolor rendering logic
- `src/components/dashboard/RenderForm.tsx` - Main rendering interface

## 🎨 Customizing Styles

The watercolor rendering uses custom-trained LoRA models. To add new styles:

1. Train a LoRA model on watercolor interior images
2. Upload to Replicate
3. Add to `WATERCOLOR_STYLES` in `src/lib/replicate/config.ts`

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Post-Deployment

1. Update Stripe webhook URL
2. Update Supabase redirect URLs
3. Test payment flow

## 📊 Database Schema

### profiles
- User profile data
- Subscription status
- Credits remaining

### projects
- User projects for organization
- Name and description

### renders
- Individual render records
- Input/output URLs
- Processing status
- Settings used

## 🔒 Security

- Row Level Security (RLS) on all tables
- API routes protected with auth checks
- Stripe webhook signature verification
- Input validation on all forms

## 🧪 Testing

```bash
# Run tests
npm test

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📈 Monitoring

- Vercel Analytics for performance
- Stripe Dashboard for payments
- Supabase Dashboard for database
- Replicate Dashboard for AI usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- Documentation: `/docs`
- Email: support@watercolorinterior.com
- Discord: [Join our community](#)

---

Built with ❤️ for interior designers