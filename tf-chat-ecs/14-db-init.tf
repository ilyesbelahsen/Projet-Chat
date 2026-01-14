# ------------------------
# Database Initialization Lambda
# Creates auth_db and chat_db on RDS
# ------------------------

# Lambda function to initialize databases
resource "aws_lambda_function" "db_init" {
  function_name    = "db-init-lambda"
  filename         = "${path.module}/db-init-lambda/db-init.zip"
  source_code_hash = filebase64sha256("${path.module}/db-init-lambda/db-init.zip")
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  role             = var.lab_role
  timeout          = 30

  vpc_config {
    subnet_ids         = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
    security_group_ids = [aws_security_group.main_security_group.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.chat_db.address
      DB_PORT     = tostring(aws_db_instance.chat_db.port)
      DB_USER     = var.db_username
      DB_PASSWORD = var.db_password
    }
  }

  depends_on = [aws_db_instance.chat_db]
}

# Invoke the Lambda once after RDS is ready
resource "aws_lambda_invocation" "db_init_invoke" {
  function_name = aws_lambda_function.db_init.function_name

  input = jsonencode({
    action = "init"
  })

  depends_on = [aws_lambda_function.db_init, aws_db_instance.chat_db]
}
