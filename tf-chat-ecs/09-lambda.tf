# ------------------------
# Package Lambda
# NOTE: The lambda.zip file must be pre-built using:
#   cd lambda && npm install && npm run zip
# This creates dist/ folder with compiled TypeScript and packages it with node_modules
# ------------------------

# ------------------------
# Lambda Function for WebSocket
# ------------------------
resource "aws_lambda_function" "chat_ws" {
  function_name    = "chat-ws-lambda"
  filename         = "${path.module}/lambda/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda/lambda.zip")
  handler          = "dist/handler.handler"
  runtime          = "nodejs20.x"
  role             = var.lab_role

  vpc_config {
    subnet_ids         = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
    security_group_ids = [aws_security_group.main_security_group.id]
  }

  environment {
    variables = {
      # Chat service internal endpoint (via internal ALB)
      CHAT_SERVICE_INTERNAL = "http://${aws_alb.chat_service_alb.dns_name}"
      # Internal API key for service-to-service communication
      INTERNAL_API_KEY = var.internal_api_key
      # WebSocket API endpoint for sending messages back to clients
      WS_ENDPOINT = "${aws_apigatewayv2_api.chat_ws_api.api_endpoint}/${aws_apigatewayv2_stage.chat_ws_stage.name}"
      # JWT secret for token validation
      JWT_SECRET = var.jwt_secret
      # DynamoDB table for connection tracking
      DYNAMODB_TABLE = aws_dynamodb_table.ws_connections.name
      # AWS region
      AWS_REGION_CUSTOM = "us-east-1"
    }
  }

  timeout     = 30
  memory_size = 256
}



