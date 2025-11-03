#!/bin/bash

# Cloudinary Setup Script
# This script helps you configure Cloudinary credentials

echo ""
echo "=========================================="
echo "  Cloudinary Configuration Setup"
echo "=========================================="
echo ""

ENV_FILE="backend/.env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ backend/.env file not found!"
    echo ""
    echo "Creating from template..."
    cp env.template "$ENV_FILE"
    echo "✅ Created backend/.env from template"
    echo ""
fi

echo "📋 You need to update Cloudinary credentials in backend/.env"
echo ""
echo "Current values in backend/.env:"
echo "-------------------------------------------"
grep "CLOUDINARY_" "$ENV_FILE"
echo "-------------------------------------------"
echo ""

echo "🔑 Get your credentials from: https://cloudinary.com/console"
echo ""
echo "Then, choose an option:"
echo ""
echo "Option 1 - Edit manually:"
echo "  nano backend/.env"
echo ""
echo "Option 2 - Use sed commands (replace with your actual values):"
echo "  sed -i '' 's/CLOUDINARY_CLOUD_NAME=.*/CLOUDINARY_CLOUD_NAME=your_cloud_name/' backend/.env"
echo "  sed -i '' 's/CLOUDINARY_API_KEY=.*/CLOUDINARY_API_KEY=your_api_key/' backend/.env"
echo "  sed -i '' 's/CLOUDINARY_API_SECRET=.*/CLOUDINARY_API_SECRET=your_api_secret/' backend/.env"
echo ""
echo "Option 3 - Interactive (this script):"
read -p "Would you like to enter credentials now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter your Cloudinary credentials:"
    echo "(You can find these at: https://cloudinary.com/console)"
    echo ""
    
    read -p "Cloud Name: " CLOUD_NAME
    read -p "API Key: " API_KEY
    read -sp "API Secret: " API_SECRET
    echo ""
    
    if [ -z "$CLOUD_NAME" ] || [ -z "$API_KEY" ] || [ -z "$API_SECRET" ]; then
        echo ""
        echo "❌ Error: All fields are required!"
        exit 1
    fi
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/CLOUDINARY_CLOUD_NAME=.*/CLOUDINARY_CLOUD_NAME=$CLOUD_NAME/" "$ENV_FILE"
        sed -i '' "s/CLOUDINARY_API_KEY=.*/CLOUDINARY_API_KEY=$API_KEY/" "$ENV_FILE"
        sed -i '' "s/CLOUDINARY_API_SECRET=.*/CLOUDINARY_API_SECRET=$API_SECRET/" "$ENV_FILE"
    else
        # Linux
        sed -i "s/CLOUDINARY_CLOUD_NAME=.*/CLOUDINARY_CLOUD_NAME=$CLOUD_NAME/" "$ENV_FILE"
        sed -i "s/CLOUDINARY_API_KEY=.*/CLOUDINARY_API_KEY=$API_KEY/" "$ENV_FILE"
        sed -i "s/CLOUDINARY_API_SECRET=.*/CLOUDINARY_API_SECRET=$API_SECRET/" "$ENV_FILE"
    fi
    
    echo ""
    echo "✅ Credentials updated in backend/.env"
    echo ""
    
    # Restart backend
    read -p "Restart backend container now? (Y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo ""
        echo "Restarting backend..."
        docker-compose restart backend
        echo ""
        echo "✅ Backend restarted"
        echo ""
        
        # Wait a bit for backend to start
        echo "Waiting for backend to start..."
        sleep 5
        
        # Run test
        read -p "Test configuration now? (Y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo ""
            docker-compose exec backend python test_cloudinary.py
        fi
    fi
else
    echo ""
    echo "📝 Manual setup instructions:"
    echo ""
    echo "1. Edit the file:"
    echo "   nano backend/.env"
    echo ""
    echo "2. Update these lines:"
    echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
    echo "   CLOUDINARY_API_KEY=your_api_key"
    echo "   CLOUDINARY_API_SECRET=your_api_secret"
    echo ""
    echo "3. Restart backend:"
    echo "   docker-compose restart backend"
    echo ""
    echo "4. Test configuration:"
    echo "   docker-compose exec backend python test_cloudinary.py"
    echo ""
fi

echo ""
echo "=========================================="
echo "For more details, see: CLOUDINARY_SETUP.md"
echo "=========================================="
echo ""

