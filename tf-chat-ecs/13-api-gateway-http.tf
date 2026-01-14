# ------------------------
# API Gateway HTTP API for path-based routing
# Routes to auth-service and chat-service
# ------------------------

resource "aws_apigatewayv2_api" "chat_http_api" {
  name          = "chat-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "chat_http_stage" {
  api_id      = aws_apigatewayv2_api.chat_http_api.id
  name        = "$default"
  auto_deploy = true
}

# VPC Link for private ALB integration
resource "aws_apigatewayv2_vpc_link" "chat_vpc_link" {
  name               = "chat-vpc-link"
  security_group_ids = [aws_security_group.main_security_group.id]
  subnet_ids         = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
}

# Integration for auth-service
resource "aws_apigatewayv2_integration" "auth_service_integration" {
  api_id             = aws_apigatewayv2_api.chat_http_api.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = aws_lb_listener.auth_service_http.arn
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.chat_vpc_link.id
}

# Integration for chat-service
resource "aws_apigatewayv2_integration" "chat_service_integration" {
  api_id             = aws_apigatewayv2_api.chat_http_api.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = aws_lb_listener.chat_service_http.arn
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.chat_vpc_link.id
}

# Routes for auth-service (/auth/*, /users/*)
resource "aws_apigatewayv2_route" "auth_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /auth/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.auth_service_integration.id}"
}

resource "aws_apigatewayv2_route" "users_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /users/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.auth_service_integration.id}"
}

resource "aws_apigatewayv2_route" "users_root_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /users"
  target    = "integrations/${aws_apigatewayv2_integration.auth_service_integration.id}"
}

resource "aws_apigatewayv2_route" "users_by_username_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "GET /users/by-username/{username}"
  target    = "integrations/${aws_apigatewayv2_integration.auth_service_integration.id}"
}

# Routes for chat-service (/rooms/*, /messages/*, /room-members/*)
resource "aws_apigatewayv2_route" "rooms_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /rooms/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.chat_service_integration.id}"
}

resource "aws_apigatewayv2_route" "rooms_root_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /rooms"
  target    = "integrations/${aws_apigatewayv2_integration.chat_service_integration.id}"
}

resource "aws_apigatewayv2_route" "messages_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /messages/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.chat_service_integration.id}"
}

resource "aws_apigatewayv2_route" "room_members_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "ANY /room-members/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.chat_service_integration.id}"
}

# Health check routes
resource "aws_apigatewayv2_route" "auth_health_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "GET /auth/health"
  target    = "integrations/${aws_apigatewayv2_integration.auth_service_integration.id}"
}

resource "aws_apigatewayv2_route" "chat_health_route" {
  api_id    = aws_apigatewayv2_api.chat_http_api.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.chat_service_integration.id}"
}
