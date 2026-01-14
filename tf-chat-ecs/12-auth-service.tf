# ------------------------
# Auth Service - ECS Task Definition and Service
# ------------------------

resource "aws_ecs_task_definition" "auth_service_task_definition" {
  family = "auth-service"

  container_definitions = jsonencode([
    {
      name      = "auth-service-container"
      image     = "${aws_ecr_repository.auth-service-repo.repository_url}:latest"
      cpu       = 32
      memory    = 64
      essential = true

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/aws/ecs/${var.cluster_name}/auth-service"
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "container-log"
        }
      }

      environment = [
        { name = "DB_HOST", value = aws_db_instance.chat_db.address },
        { name = "DB_PORT", value = tostring(aws_db_instance.chat_db.port) },
        { name = "DB_USER", value = var.db_username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DB_NAME", value = "auth_db" },
        { name = "DB_SYNC", value = "true" },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "JWT_EXPIRES_IN", value = "15m" },
        { name = "INTERNAL_API_KEY", value = var.internal_api_key },
        { name = "DEV_MODE", value = "true" },
        { name = "FRONTEND_URL", value = "http://${aws_alb.frontend_alb.dns_name}" }
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

resource "aws_ecs_service" "auth_service" {
  name            = "auth-service"
  cluster         = aws_ecs_cluster.chat.id
  task_definition = aws_ecs_task_definition.auth_service_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_alb_target_group.auth_service_target_group.arn
    container_name   = "auth-service-container"
    container_port   = 5000
  }

  depends_on = [aws_lb_listener.auth_service_http]
}

# ALB Target Group for auth-service
resource "aws_alb_target_group" "auth_service_target_group" {
  vpc_id = aws_vpc.main.id

  name     = "auth-service-tg"
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

# ALB for auth-service (internal)
resource "aws_alb" "auth_service_alb" {
  name               = "auth-service-alb"
  internal           = true
  load_balancer_type = "application"

  security_groups = [aws_security_group.main_security_group.id]
  subnets         = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
}

resource "aws_lb_listener" "auth_service_http" {
  load_balancer_arn = aws_alb.auth_service_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.auth_service_target_group.arn
    type             = "forward"
  }
}

# CloudWatch Log Group for auth-service
resource "aws_cloudwatch_log_group" "auth_service_logs" {
  name              = "/aws/ecs/${var.cluster_name}/auth-service"
  retention_in_days = 7
}
