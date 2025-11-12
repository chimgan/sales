#!/bin/bash
# Test script to verify Netlify build will succeed

echo "🔍 Verifying Netlify deployment compatibility..."
echo ""

# Check if required files exist
echo "✓ Checking required files..."
files=("package.json" "netlify.toml" "index.html" "vite.config.ts" "tsconfig.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing!"
        exit 1
    fi
done
echo ""

# Check package.json has build script
echo "✓ Checking build scripts..."
if grep -q '"build"' package.json; then
    echo "  ✅ Build script found"
else
    echo "  ❌ Build script missing!"
    exit 1
fi
echo ""

# Check netlify.toml configuration
echo "✓ Checking Netlify configuration..."
if grep -q 'publish = "dist"' netlify.toml; then
    echo "  ✅ Publish directory configured"
else
    echo "  ❌ Publish directory not configured!"
    exit 1
fi

if grep -q 'command = "npm run build"' netlify.toml; then
    echo "  ✅ Build command configured"
else
    echo "  ❌ Build command not configured!"
    exit 1
fi
echo ""

# Check for environment variable usage
echo "✓ Checking environment variables..."
env_vars=("VITE_FIREBASE_API_KEY" "VITE_CLOUDINARY_CLOUD_NAME" "VITE_ADMIN_EMAIL")
for var in "${env_vars[@]}"; do
    if grep -rq "$var" src/; then
        echo "  ✅ $var is used in source code"
    fi
done
echo ""

# Check .gitignore
echo "✓ Checking .gitignore..."
ignored=("node_modules" "dist" ".env")
for item in "${ignored[@]}"; do
    if grep -q "^$item$" .gitignore || grep -q "^$item\$" .gitignore; then
        echo "  ✅ $item is ignored"
    else
        echo "  ⚠️  $item should be in .gitignore"
    fi
done
echo ""

echo "✅ Netlify deployment compatibility check passed!"
echo ""
echo "📋 Next steps:"
echo "  1. Commit your code: git add . && git commit -m 'Ready for deployment'"
echo "  2. Push to repository: git push origin main"
echo "  3. Connect repository to Netlify"
echo "  4. Add environment variables in Netlify dashboard"
echo "  5. Deploy!"
echo ""
echo "📖 See NETLIFY_DEPLOY.md for detailed instructions"
