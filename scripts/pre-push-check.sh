#!/bin/bash

echo "🔍 Running pre-push checks..."

# 1. TypeScript check
echo "📝 Checking TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found! Please fix before pushing."
    exit 1
fi

# 2. Build test
echo "🏗️  Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix before pushing."
    exit 1
fi

echo "✅ All checks passed! Ready to push."