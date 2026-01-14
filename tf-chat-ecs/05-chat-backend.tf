# ------------------------
# Chat Service - ECS Task Definition and Service
# ------------------------

resource "aws_ecs_task_definition" "chat_service_task_definition" {
  family = "chat-service"

  container_definitions = jsonencode([
    {
      name      = "chat-service-container"
      image     = "${aws_ecr_repository.chat-service-repo.repository_url}:latest"
      cpu       = 32
      memory    = 64
      essential = true

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/aws/ecs/${var.cluster_name}/chat-service"
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "container-log"
        }
      }

      environment = [
        { name = "DB_HOST", value = aws_db_instance.chat_db.address },
        { name = "DB_PORT", value = tostring(aws_db_instance.chat_db.port) },
        { name = "DB_USER", value = var.db_username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DB_NAME", value = "chat_db" },
        { name = "DB_SYNC", value = "true" },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "INTERNAL_API_KEY", value = var.internal_api_key },
        # Use internal ALB DNS for auth-service (port 80 on ALB)
        { name = "AUTH_SERVICE_URL", value = "http://${aws_alb.auth_service_alb.dns_name}" }
      ]

      portMappings = [
        {
          containerPort = 5000
          hostPort      = 0
          protocol      = "tcp"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "chat_service" {
  name            = "chat-service"
  cluster         = aws_ecs_cluster.chat.id
  task_definition = aws_ecs_task_definition.chat_service_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_alb_target_group.chat_service_target_group.arn
    container_name   = "chat-service-container"
    container_port   = 5000
  }

  depends_on = [aws_lb_listener.chat_service_http]
}

# ALB Target Group for chat-service
resource "aws_alb_target_group" "chat_service_target_group" {
  vpc_id = aws_vpc.main.id

  name     = "chat-service-tg"
  port     = 5000
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

# ALB for chat-service (internal, used by Lambda and frontend)
resource "aws_alb" "chat_service_alb" {
  name               = "chat-service-alb"
  internal           = true
  load_balancer_type = "application"

  security_groups = [aws_security_group.main_security_group.id]
  subnets         = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
}

resource "aws_lb_listener" "chat_service_http" {
  load_balancer_arn = aws_alb.chat_service_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.chat_service_target_group.arn
    type             = "forward"
  }
}

# CloudWatch Log Group for chat-service
resource "aws_cloudwatch_log_group" "chat_service_logs" {
  name              = "/aws/ecs/${var.cluster_name}/chat-service"
  retention_in_days = 7
}