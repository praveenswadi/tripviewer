#!/bin/bash

# Credentials Setup Helper
# Makes it easy to configure Flickr API credentials

echo "📸 Photo Stories - Credentials Setup"
echo "===================================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists."
  read -p "Do you want to overwrite it? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Your existing .env file is unchanged."
    exit 0
  fi
fi

echo "Let's set up your credentials."
echo ""
echo "First, get your Flickr API credentials:"
echo "1. Go to: https://www.flickr.com/services/apps/create/"
echo "2. Click 'Request an API Key'"
echo "3. Choose 'Apply for a Non-Commercial Key'"
echo "4. Fill in the form (app name: 'Photo Stories')"
echo "5. You'll receive both an API Key and Secret"
echo ""

# Get Flickr API Key
read -p "Enter your Flickr API Key: " flickr_key
if [ -z "$flickr_key" ]; then
  echo "❌ API Key cannot be empty!"
  exit 1
fi

# Get Flickr API Secret
read -p "Enter your Flickr API Secret: " flickr_secret
if [ -z "$flickr_secret" ]; then
  echo "❌ API Secret cannot be empty!"
  exit 1
fi

# Get PIN (optional, default to 123456)
read -p "Enter your 6-digit PIN (default: 123456): " pin
if [ -z "$pin" ]; then
  pin="123456"
fi

# Validate PIN is 6 digits
if ! [[ $pin =~ ^[0-9]{6}$ ]]; then
  echo "⚠️  Warning: PIN should be 6 digits. Using anyway..."
fi

# Create .env file
cat > .env << EOF
# Photo Stories - Environment Variables
# Generated on $(date)

# Authentication PIN (change this for production!)
VITE_APP_PIN=$pin

# Deployment Platform
VITE_PLATFORM=vercel

# Flickr API Credentials
# Keep these secret! This file is gitignored.
FLICKR_API_KEY=$flickr_key
FLICKR_API_SECRET=$flickr_secret
EOF

echo ""
echo "✅ Credentials saved to .env file!"
echo ""
echo "Your setup:"
echo "  - API Key: ${flickr_key:0:10}...${flickr_key: -4}"
echo "  - API Secret: ${flickr_secret:0:10}...${flickr_secret: -4}"
echo "  - PIN: $pin"
echo ""
echo "Next steps:"
echo "1. Test your credentials:"
echo "   npm run import:flickr \"https://flickr.com/...\" test-trip"
echo ""
echo "2. Or start the dev server:"
echo "   npm run dev"
echo ""
echo "🔒 Security: Your .env file is gitignored and won't be committed to GitHub."
echo ""

