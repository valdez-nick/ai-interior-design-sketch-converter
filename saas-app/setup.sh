#!/bin/bash

# Watercolor Interior SaaS - Quick Setup Script

echo "🎨 Watercolor Interior SaaS Setup"
echo "================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local - Please fill in your API keys!"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/images/examples
mkdir -p public/images/styles

echo ""
echo "✨ Setup complete! Next steps:"
echo "1. Fill in your API keys in .env.local:"
echo "   - Supabase URL and keys"
echo "   - Stripe keys and price IDs"
echo "   - Replicate API token"
echo ""
echo "2. Set up Supabase:"
echo "   - Create a new project at supabase.com"
echo "   - Run the SQL from supabase/schema.sql"
echo "   - Enable Google OAuth (optional)"
echo ""
echo "3. Set up Stripe:"
echo "   - Create products for each tier"
echo "   - Copy price IDs to .env.local"
echo ""
echo "4. Run the development server:"
echo "   npm run dev"
echo ""
echo "📌 Note: The app will run on port 3001 (http://localhost:3001)"
echo ""
echo "🚀 Happy building!"