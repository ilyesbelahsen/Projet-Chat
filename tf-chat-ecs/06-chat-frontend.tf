# ------------------------
# Frontend Service - ECS Task Definition and Service
# ------------------------

resource "aws_ecs_task_definition" "chat_frontend_task_definition" {
  family = "chat-frontend-service"

  container_definitions = jsonencode([
    {
      name      = "chat-frontend-container"
      image     = "${aws_ecr_repository.chat-frontend-repo.repository_url}:latest"
      cpu       = 32
      memory    = 64
      essential = true

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/aws/ecs/${var.cluster_name}/chat-frontend"
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "container-log"
        }
      }

      environment = [
        # API Gateway HTTP API endpoint for backend calls
        { name = "API_BASE_URL", value = aws_apigatewayv2_api.chat_http_api.api_endpoint },
        { name = "BACKEND_ADDRESS", value = aws_apigatewayv2_api.chat_http_api.api_endpoint },
        # WebSocket API endpoint
        { name = "WS_ENDPOINT", value = "${aws_apigatewayv2_api.chat_ws_api.api_endpoint}/${aws_apigatewayv2_stage.chat_ws_stage.name}" }
      ]

      portMappings = [
        {
          containerPort = 80
          hostPort      = 0
          protocol      = "tcp"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "chat_frontend" {
  name            = "chat-frontend-service"
  cluster         = aws_ecs_cluster.chat.id
  task_definition = aws_ecs_task_definition.chat_frontend_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_alb_target_group.chat_frontend_target_group.arn
    container_name   = "chat-frontend-container"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.frontend_http]
}

# External ALB for frontend (public-facing)
resource "aws_alb" "frontend_alb" {
  name               = "chat-frontend-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [aws_security_group.main_security_group.id]
  subnets         = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]
}

resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_alb.frontend_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.chat_frontend_target_group.arn
    type             = "forward"
  }
}

resource "aws_alb_target_group" "chat_frontend_target_group" {
  vpc_id = aws_vpc.main.id

  name     = "chat-frontend-tg"
  port     = 80
  protocol = "HTTP"

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# CloudWatch Log Group for frontend
resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/aws/ecs/${var.cluster_name}/chat-frontend"
  retention_in_days = 7
}