
# ------------------------
# API Gateway WebSocket
# ------------------------
resource "aws_apigatewayv2_api" "chat_ws_api" {
  name                       = "chat-ws-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_stage" "chat_ws_stage" {
  api_id      = aws_apigatewayv2_api.chat_ws_api.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "chat_ws_lambda" {
  api_id                 = aws_apigatewayv2_api.chat_ws_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.chat_ws.arn
  integration_method     = "POST"
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_route" "connect_route" {
  api_id    = aws_apigatewayv2_api.chat_ws_api.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.chat_ws_lambda.id}"
}

resource "aws_apigatewayv2_route" "disconnect_route" {
  api_id    = aws_apigatewayv2_api.chat_ws_api.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.chat_ws_lambda.id}"
}

resource "aws_apigatewayv2_route" "sendmessage_route" {
  api_id    = aws_apigatewayv2_api.chat_ws_api.id
  route_key = "sendMessage"
  target    = "integrations/${aws_apigatewayv2_integration.chat_ws_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chat_ws.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat_ws_api.execution_arn}/*/*"
}