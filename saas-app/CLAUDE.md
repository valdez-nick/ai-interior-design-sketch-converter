# Claude Development Notes - Watercolor Interior SaaS

## Project Overview
Transforming a static AI interior design sketch converter into a full-featured SaaS application with watercolor rendering capabilities.

## Current State (January 2025)

### ✅ Completed
1. **Next.js 14 Foundation**
   - TypeScript configuration
   - Tailwind CSS with custom watercolor theme
   - App Router structure
   - Responsive design system

2. **Authentication System**
   - Supabase Auth integration
   - Login/Signup pages with email auth
   - Google OAuth prepared (needs Supabase config)
   - Protected route structure
   - Auth callback handling

3. **Database Architecture**
   - PostgreSQL schema designed and documented
   - Tables: profiles, projects, renders
   - Row Level Security policies
   - Automatic user profile creation
   - Updated_at triggers

4. **Landing Page Components**
   - Hero section with hover preview effect
   - Features grid highlighting key benefits
   - Interactive examples gallery
   - Pricing tiers (Free, Professional $39, Studio $99)
   - Responsive navigation with auth state

5. **Project Structure**
   - Clean separation of concerns
   - Type-safe database types
   - Reusable component architecture
   - Environment variable setup

### 🚧 In Progress
1. **Stripe Payment Integration**
   - Webhook routes prepared
   - Subscription management logic needed
   - Customer portal integration pending

2. **AI Rendering Pipeline**
   - Replicate integration structure ready
   - Watercolor LoRA configuration needed
   - Image upload/processing flow

3. **User Dashboard**
   - Project management UI
   - Render history display
   - Usage tracking

### 📋 TODO List
- [ ] Complete Stripe subscription flow
- [ ] Implement Replicate AI watercolor rendering
- [ ] Build dashboard with project management
- [ ] Add render queue system
- [ ] Create API for batch processing
- [ ] Implement high-resolution exports
- [ ] Add usage analytics
- [ ] Build admin panel
- [ ] Create API documentation
- [ ] Add rate limiting

## Key Technical Decisions

### Architecture Choices
1. **Next.js 14 App Router**: Modern, performant, great DX
2. **Supabase**: Integrated auth + database + storage
3. **Replicate**: Quick MVP for AI, can migrate to RunPod later
4. **Stripe**: Industry standard for SaaS payments
5. **Vercel**: Seamless deployment with Next.js

### Design Patterns
1. **Server Components**: Default for better performance
2. **Client Components**: Only for interactivity
3. **API Routes**: For AI processing and webhooks
4. **RLS**: Row-level security for data isolation
5. **Type Safety**: Full TypeScript coverage

## Environment Setup Required

### Supabase Setup
1. Create new project at supabase.com
2. Run SQL from `supabase/schema.sql`
3. Enable Google OAuth in Authentication settings
4. Copy URL and anon key to `.env.local`

### Stripe Setup
1. Create account and enable test mode
2. Create products:
   - Professional: $39/month
   - Studio: $99/month
3. Set up webhook endpoint
4. Copy keys to `.env.local`

### Replicate Setup
1. Create account at replicate.com
2. Copy API token to `.env.local`

## Development Workflow

### Running Locally
```bash
cd saas-app
npm install
npm run dev
```

### Database Changes
1. Update `supabase/schema.sql`
2. Run migrations in Supabase dashboard
3. Update `src/types/database.types.ts`

### Adding New Features
1. Create feature branch
2. Update components in `src/components/`
3. Add API routes if needed
4. Update types
5. Test locally
6. Deploy to preview

## Deployment Notes

### Vercel Deployment
1. Connect GitHub repo
2. Set environment variables
3. Deploy from main branch
4. Update webhook URLs post-deployment

### Production Checklist
- [ ] All environment variables set
- [ ] Stripe webhook verified
- [ ] Supabase RLS policies tested
- [ ] Rate limiting configured
- [ ] Error tracking enabled
- [ ] Analytics configured

## AI Model Configuration

### Watercolor Rendering Pipeline
```typescript
// Planned configuration
const watercolorConfig = {
  model: "stability-ai/sdxl",
  lora: "custom-watercolor-interior-v1",
  controlnet: "canny",
  steps: 30,
  cfg_scale: 7.5,
  strength: 0.8
}
```

### Style Presets
1. Classic Watercolor - Soft, flowing colors
2. Loose Sketch - Free artistic interpretation
3. Architectural - Precise with watercolor wash
4. Minimalist - Simple washes, key details

## Important Files

### Core Application
- `/src/app/page.tsx` - Landing page
- `/src/app/layout.tsx` - Root layout with providers
- `/src/components/providers/SupabaseProvider.tsx` - Auth context

### Authentication
- `/src/app/(auth)/login/page.tsx` - Login flow
- `/src/app/(auth)/signup/page.tsx` - Registration
- `/src/app/auth/callback/route.ts` - OAuth callback

### Database
- `/supabase/schema.sql` - Complete schema
- `/src/types/database.types.ts` - TypeScript types

### Configuration
- `/.env.local.example` - Environment template
- `/next.config.js` - Next.js configuration
- `/tailwind.config.ts` - Design system

## Testing Strategy

### Manual Testing Checklist
- [ ] Signup flow with email
- [ ] Login/logout functionality
- [ ] Protected route access
- [ ] Responsive design on mobile
- [ ] Payment flow (when ready)
- [ ] Render processing (when ready)

### Future Automated Tests
- Auth flow integration tests
- API endpoint tests
- Component unit tests
- E2E user journeys

## Performance Optimization

### Current Optimizations
- Server Components by default
- Image optimization with Next.js
- Tailwind CSS purging
- Component code splitting

### Planned Optimizations
- CDN for rendered images
- Redis caching for API
- Queue system for renders
- WebP image delivery

## Security Considerations

### Implemented
- Row Level Security on all tables
- Environment variables for secrets
- HTTPS only in production
- Input validation on forms

### Planned
- Rate limiting on API routes
- Stripe webhook verification
- Image upload validation
- CORS configuration
- API key management

## Monitoring & Analytics

### Planned Setup
- Vercel Analytics - Performance
- PostHog - User behavior
- Sentry - Error tracking
- Stripe - Revenue metrics
- Custom - AI usage tracking

## Notes for Next Session

### Immediate Priorities
1. Install dependencies and run the app
2. Set up Supabase project with schema
3. Configure Stripe products
4. Test authentication flow
5. Begin Replicate integration

### Questions to Resolve
1. Specific watercolor LoRA models to use?
2. Image size limits for free/paid tiers?
3. Render queue priorities?
4. API rate limits per tier?
5. White-label pricing model?

## Remember for Future Sessions
- Always run the app locally first to test changes
- Check Supabase RLS policies when adding features
- Update TypeScript types when schema changes
- Test on mobile for responsive issues
- Document API changes in README

---

Last updated: January 2025
Session: SaaS Transformation Foundation