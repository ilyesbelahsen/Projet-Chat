# ------------------------
# Package Lambda
# ------------------------
data "archive_file" "chat_ws" {
  type        = "zip"
  source_file = "${path.module}/lambda/lambda.zip"  # zip de la Lambda WebSocket
  output_path = "${path.module}/lambda/chat_ws.zip"
}

# ------------------------
# Lambda Function
# ------------------------
resource "aws_lambda_function" "chat_ws" {
  function_name    = "chat-ws-lambda"
  filename         = data.archive_file.chat_ws.output_path
  source_code_hash = filebase64sha256(data.archive_file.chat_ws.output_path)
  handler          = "dist/handler.handler"
  runtime          = "nodejs20.x"
  role             = var.lab_role   # rôle IAM unique déjà existant

  environment {
    variables = {                                                             # région fixe
      BACKEND_URL   = aws_alb.chat-backend-endpoint.dns_name                 # backend ECS
      SERVICE_TOKEN = "MonServiceToken123"                                    # token fixe
      WS_ENDPOINT   = "${aws_apigatewayv2_api.chat_ws_api.api_endpoint}/${aws_apigatewayv2_stage.chat_ws_stage.name}"
      JWT_SECRET    = "MonSecretJWT123"                                       # secret JWT
    }
  }

  timeout     = 10
  memory_size = 256
}



