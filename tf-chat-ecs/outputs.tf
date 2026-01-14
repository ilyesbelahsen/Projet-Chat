# =============================
# Public Endpoints
# =============================

output "frontend_url" {
  description = "Public URL for the frontend application"
  value       = "http://${aws_alb.frontend_alb.dns_name}"
}

output "api_gateway_url" {
  description = "API Gateway HTTP endpoint for backend API calls"
  value       = aws_apigatewayv2_api.chat_http_api.api_endpoint
}

output "ws_endpoint" {
  description = "WebSocket API endpoint for real-time communication"
  value       = "${aws_apigatewayv2_api.chat_ws_api.api_endpoint}/${aws_apigatewayv2_stage.chat_ws_stage.name}"
}

# =============================
# ECR Repositories
# =============================

output "chat_frontend_repo" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.chat-frontend-repo.repository_url
}

output "auth_service_repo" {
  description = "ECR repository URL for auth-service"
  value       = aws_ecr_repository.auth-service-repo.repository_url
}

output "chat_service_repo" {
  description = "ECR repository URL for chat-service"
  value       = aws_ecr_repository.chat-service-repo.repository_url
}

# =============================
# Database
# =============================

output "chat_db_endpoint" {
  description = "RDS MySQL database endpoint"
  value       = aws_db_instance.chat_db.address
}

output "chat_db_port" {
  description = "RDS MySQL database port"
  value       = aws_db_instance.chat_db.port
}

# =============================
# Internal Endpoints (for debugging)
# =============================

output "auth_service_internal_url" {
  description = "Internal ALB URL for auth-service"
  value       = "http://${aws_alb.auth_service_alb.dns_name}"
}

output "chat_service_internal_url" {
  description = "Internal ALB URL for chat-service"
  value       = "http://${aws_alb.chat_service_alb.dns_name}"
}

# Service Discovery disabled in AWS Lab - using internal ALB DNS names instead
