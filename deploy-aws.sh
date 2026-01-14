#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   AWS Deployment Script for Chat App  ${NC}"
echo -e "${GREEN}========================================${NC}"

# Get AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${YELLOW}AWS Region: ${AWS_REGION}${NC}"

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

# Step 1: Login to ECR
echo -e "\n${GREEN}[1/7] Logging into ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 2: Get ECR repository URLs from Terraform outputs
echo -e "\n${GREEN}[2/7] Getting ECR repository URLs...${NC}"
cd tf-chat-ecs

AUTH_REPO=$(terraform output -raw auth_service_repo 2>/dev/null || echo "")
CHAT_REPO=$(terraform output -raw chat_service_repo 2>/dev/null || echo "")
FRONTEND_REPO=$(terraform output -raw chat_frontend_repo 2>/dev/null || echo "")

if [ -z "$AUTH_REPO" ] || [ -z "$CHAT_REPO" ] || [ -z "$FRONTEND_REPO" ]; then
    echo -e "${RED}ERROR: ECR repositories not found. Run 'terraform apply' first.${NC}"
    exit 1
fi

echo -e "  Auth Service ECR: ${AUTH_REPO}"
echo -e "  Chat Service ECR: ${CHAT_REPO}"
echo -e "  Frontend ECR: ${FRONTEND_REPO}"

# Get API Gateway and WebSocket URLs for frontend
API_GATEWAY_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "")
WS_ENDPOINT=$(terraform output -raw ws_endpoint 2>/dev/null || echo "")

cd ${PROJECT_ROOT}

# Step 3: Build and push auth-service
echo -e "\n${GREEN}[3/7] Building and pushing auth-service...${NC}"
cd auth-service
docker build --platform linux/amd64 -t auth-service .
docker tag auth-service:latest ${AUTH_REPO}:latest
docker push ${AUTH_REPO}:latest
echo -e "${GREEN}  auth-service pushed successfully${NC}"
cd ${PROJECT_ROOT}

# Step 4: Build and push chat-service
echo -e "\n${GREEN}[4/7] Building and pushing chat-service...${NC}"
cd chat-service
docker build --platform linux/amd64 -t chat-service .
docker tag chat-service:latest ${CHAT_REPO}:latest
docker push ${CHAT_REPO}:latest
echo -e "${GREEN}  chat-service pushed successfully${NC}"
cd ${PROJECT_ROOT}

# Step 5: Build and push frontend
echo -e "\n${GREEN}[5/7] Building and pushing frontend...${NC}"
cd frontend
docker build --platform linux/amd64 -t chat-frontend .
docker tag chat-frontend:latest ${FRONTEND_REPO}:latest
docker push ${FRONTEND_REPO}:latest
echo -e "${GREEN}  frontend pushed successfully${NC}"
cd ${PROJECT_ROOT}

# Step 6: Force ECS services to update
echo -e "\n${GREEN}[6/7] Forcing ECS services to update with new images...${NC}"
aws ecs update-service --cluster chat-cluster --service auth-service --force-new-deployment --region ${AWS_REGION} > /dev/null 2>&1 || true
echo -e "  auth-service: deployment triggered"
aws ecs update-service --cluster chat-cluster --service chat-service --force-new-deployment --region ${AWS_REGION} > /dev/null 2>&1 || true
echo -e "  chat-service: deployment triggered"
aws ecs update-service --cluster chat-cluster --service chat-frontend-service --force-new-deployment --region ${AWS_REGION} > /dev/null 2>&1 || true
echo -e "  frontend-service: deployment triggered"

# Step 7: Wait for services to be healthy
echo -e "\n${GREEN}[7/7] Waiting for services to become healthy (this may take 2-5 minutes)...${NC}"

check_service_health() {
    local service_name=$1
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        RUNNING_COUNT=$(aws ecs describe-services --cluster chat-cluster --services $service_name --region ${AWS_REGION} --query 'services[0].runningCount' --output text 2>/dev/null || echo "0")
        DESIRED_COUNT=$(aws ecs describe-services --cluster chat-cluster --services $service_name --region ${AWS_REGION} --query 'services[0].desiredCount' --output text 2>/dev/null || echo "1")

        if [ "$RUNNING_COUNT" == "$DESIRED_COUNT" ] && [ "$RUNNING_COUNT" != "0" ]; then
            echo -e "  ${GREEN}$service_name: HEALTHY (${RUNNING_COUNT}/${DESIRED_COUNT})${NC}"
            return 0
        fi

        echo -e "  ${YELLOW}$service_name: waiting... (${RUNNING_COUNT}/${DESIRED_COUNT}) - attempt $attempt/$max_attempts${NC}"
        sleep 10
        ((attempt++))
    done

    echo -e "  ${RED}$service_name: TIMEOUT - service not healthy${NC}"
    return 1
}

echo ""
check_service_health "auth-service"
AUTH_OK=$?

check_service_health "chat-service"
CHAT_OK=$?

check_service_health "chat-frontend-service"
FRONTEND_OK=$?

# Get outputs
cd tf-chat-ecs
FRONTEND_URL=$(terraform output -raw frontend_url 2>/dev/null || echo "")
API_GATEWAY_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "")
WS_ENDPOINT=$(terraform output -raw ws_endpoint 2>/dev/null || echo "")

# Final status
echo -e "\n${GREEN}========================================${NC}"
if [ $AUTH_OK -eq 0 ] && [ $CHAT_OK -eq 0 ] && [ $FRONTEND_OK -eq 0 ]; then
    echo -e "${GREEN}   DEPLOYMENT SUCCESSFUL!              ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Application URLs:${NC}"
    echo -e "  Frontend:    ${FRONTEND_URL}"
    echo -e "  API Gateway: ${API_GATEWAY_URL}"
    echo -e "  WebSocket:   ${WS_ENDPOINT}"
    echo ""
    echo -e "${YELLOW}Test the endpoints:${NC}"
    echo -e "  curl ${API_GATEWAY_URL}/health"
    echo -e "  curl ${API_GATEWAY_URL}/auth/health"
else
    echo -e "${RED}   DEPLOYMENT INCOMPLETE                ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Some services are not healthy yet. Check ECS logs:${NC}"
    echo -e "  aws logs tail /aws/ecs/chat-cluster/auth-service --follow"
    echo -e "  aws logs tail /aws/ecs/chat-cluster/chat-service --follow"
    echo -e "  aws logs tail /aws/ecs/chat-cluster/chat-frontend --follow"
    echo ""
    echo -e "${YELLOW}Or check ECS console for more details.${NC}"
fi
