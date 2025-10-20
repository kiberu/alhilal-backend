#!/bin/bash

# Alhilal Project Setup Script
set -e

echo "🚀 Setting up Alhilal Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"

# Copy environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}📝 Creating .env file from example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
    
    # Generate SECRET_KEY
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    sed -i.bak "s/your-secret-key-here-change-in-production/$SECRET_KEY/" backend/.env && rm backend/.env.bak
    echo -e "${GREEN}✅ Generated SECRET_KEY${NC}"
    
    # Generate FIELD_ENCRYPTION_KEY
    if command -v python3 &> /dev/null; then
        ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
        sed -i.bak "s/generate-with-fernet-key/$ENCRYPTION_KEY/" backend/.env && rm backend/.env.bak
        echo -e "${GREEN}✅ Generated FIELD_ENCRYPTION_KEY${NC}"
    else
        echo -e "${YELLOW}⚠️  Please generate FIELD_ENCRYPTION_KEY manually${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Build and start containers
echo -e "${YELLOW}🐳 Building and starting Docker containers...${NC}"
docker-compose up -d --build

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}📊 Running database migrations...${NC}"
docker-compose exec -T backend python manage.py migrate

# Create superuser (optional)
echo -e "${YELLOW}👤 Would you like to create a superuser? (y/n)${NC}"
read -r CREATE_SUPERUSER
if [ "$CREATE_SUPERUSER" = "y" ] || [ "$CREATE_SUPERUSER" = "Y" ]; then
    docker-compose exec backend python manage.py createsuperuser
fi

echo ""
echo -e "${GREEN}✨ Setup completed successfully!${NC}"
echo ""
echo "📍 Access points:"
echo "   Admin:       http://localhost/admin/"
echo "   API Docs:    http://localhost/api/v1/docs/"
echo "   Health:      http://localhost/health/"
echo ""
echo "🛠️  Useful commands:"
echo "   make logs           - View logs"
echo "   make migrate        - Run migrations"
echo "   make shell          - Django shell"
echo "   make test           - Run tests"
echo "   make dev-down       - Stop containers"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to update backend/.env with your Cloudinary credentials!${NC}"

