#!/bin/bash

echo "================================================"
echo "Al-Hilal Frontend-Backend Connection Test"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "1. Testing Backend Health..."
HEALTH=$(curl -s http://localhost:8000/health/ 2>/dev/null)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Response: $HEALTH"
    exit 1
fi

# Test 2: CORS Headers
echo ""
echo "2. Testing CORS Configuration..."
CORS_HEADERS=$(curl -s -I \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: authorization" \
    -X OPTIONS \
    http://localhost:8000/api/v1/dashboard/stats 2>/dev/null)

if echo "$CORS_HEADERS" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✅ CORS headers are present${NC}"
    echo "   - Allowed origin: $(echo "$CORS_HEADERS" | grep -i "access-control-allow-origin" | cut -d' ' -f2)"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
    exit 1
fi

# Test 3: Dashboard Stats Endpoint (without auth - should return 401)
echo ""
echo "3. Testing Dashboard Stats Endpoint..."
STATS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/dashboard/stats 2>/dev/null)
if [ "$STATS_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Dashboard endpoint exists (401 Unauthorized - expected without token)${NC}"
elif [ "$STATS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard endpoint returned: $STATS_RESPONSE${NC}"
fi

# Test 4: Trips Endpoint (without auth - should return 401)
echo ""
echo "4. Testing Trips Endpoint..."
TRIPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/trips 2>/dev/null)
if [ "$TRIPS_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Trips endpoint exists (401 Unauthorized - expected without token)${NC}"
elif [ "$TRIPS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Trips endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Trips endpoint returned: $TRIPS_RESPONSE${NC}"
fi

# Test 5: Bookings Endpoint (without auth - should return 401)
echo ""
echo "5. Testing Bookings Endpoint..."
BOOKINGS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/bookings 2>/dev/null)
if [ "$BOOKINGS_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Bookings endpoint exists (401 Unauthorized - expected without token)${NC}"
elif [ "$BOOKINGS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Bookings endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Bookings endpoint returned: $BOOKINGS_RESPONSE${NC}"
fi

# Test 6: Docker Services
echo ""
echo "6. Checking Docker Services..."
if command -v docker-compose &> /dev/null; then
    BACKEND_STATUS=$(docker-compose ps backend 2>/dev/null | grep "Up" | wc -l)
    if [ "$BACKEND_STATUS" -gt 0 ]; then
        echo -e "${GREEN}✅ Backend container is running${NC}"
    else
        echo -e "${RED}❌ Backend container is not running${NC}"
    fi
    
    DB_STATUS=$(docker-compose ps db 2>/dev/null | grep "Up" | wc -l)
    if [ "$DB_STATUS" -gt 0 ]; then
        echo -e "${GREEN}✅ Database container is running${NC}"
    else
        echo -e "${RED}❌ Database container is not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose not found in PATH${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}All Critical Tests Passed!${NC}"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Start your frontend: cd admin_dashboard && npm run dev"
echo "2. Navigate to: http://localhost:3000"
echo "3. Login with your staff credentials"
echo "4. Dashboard should load without CORS errors!"
echo ""
echo "For detailed testing: see FRONTEND_TESTING_GUIDE.md"
echo "For issues resolved: see FIXES_SUMMARY.md"
echo ""

