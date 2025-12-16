#!/bin/bash

echo "🚀 Bagsy Deployment Status Check"
echo "=================================="
echo ""

# Check if render.yaml exists
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml configuration found"
else
    echo "❌ render.yaml not found"
fi

# Check if backend is built
if [ -d "server/dist" ]; then
    echo "✅ Backend build directory exists"
else
    echo "⚠️  Backend not built (run: cd server && npm run build)"
fi

# Check if frontend is built
if [ -d "frontend/.next" ]; then
    echo "✅ Frontend build directory exists"
else
    echo "⚠️  Frontend not built (run: cd frontend && npm run build)"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "------------------------"
echo ""

# Check if backend is deployed by testing common Render URLs
read -p "Enter your Render backend URL (or press Enter to skip): " BACKEND_URL

if [ ! -z "$BACKEND_URL" ]; then
    echo ""
    echo "Testing backend health endpoint..."

    if curl -s -f "$BACKEND_URL/health" > /dev/null; then
        echo "✅ Backend is live and responding!"

        # Get health status
        HEALTH=$(curl -s "$BACKEND_URL/health")
        echo "   Status: $HEALTH"
    else
        echo "❌ Backend is not responding at $BACKEND_URL"
        echo "   Make sure your backend is deployed to Render"
    fi

    echo ""
    echo "Next steps:"
    echo "1. Set NEXT_PUBLIC_API_URL=$BACKEND_URL in Vercel"
    echo "2. Redeploy frontend on Vercel"
    echo "3. Test chat at https://bagsy-agent-8rw2.vercel.app"
else
    echo ""
    echo "⏳ Backend deployment pending:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Create new Blueprint from your GitHub repo"
    echo "3. Set ANTHROPIC_API_KEY in environment variables"
    echo "4. Wait for deployment to complete"
    echo "5. Copy the backend URL and run this script again"
fi

echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
