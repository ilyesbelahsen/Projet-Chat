// chat Services

resource "aws_ecs_task_definition" "chat_backend_task_definition" {
  family = "chat-backend-service"
  container_definitions = jsonencode([
    {
      name      = "chat-backend-container"
      image = "${aws_ecr_repository.chat-backend-repo.repository_url}:latest"
      cpu       = 10
      memory    = 128
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group = "/aws/ecs/${var.cluster_name}/chat-backend"
          awslogs-region = "us-east-1"
          awslogs-stream-prefix = "container-log"
        }
      }
      environment = [
        { name = "DB_HOST", value = aws_db_instance.chat_db.address },
        { name = "DB_PORT", value = tostring(aws_db_instance.chat_db.port) },
        { name = "DB_USER", value = "admin" },
        { name = "DB_PASSWORD", value = "Password123!" },
        { name = "DB_NAME", value = "chatdb" }
      ]
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 0
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "chat-backend" {
  name            = "chat-backend-service"
  cluster         = aws_ecs_cluster.chat.id
  task_definition = aws_ecs_task_definition.chat_backend_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_alb_target_group.chat-backend-target-group.arn
    container_name   = "chat-backend-container"
    container_port   = 5000
  }

}

// Declare load balancer resources
resource "aws_alb" "chat-backend-endpoint" {
  name               = "chat-backend-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [aws_security_group.main_security_group.id]

  subnets = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]

}

resource "aws_lb_listener" "chat-backend-http" {
  load_balancer_arn = aws_alb.chat-backend-endpoint.arn

  port     = "80"
  protocol = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.chat-backend-target-group.arn
    type             = "forward"
  }

}

resource "aws_alb_target_group" "chat-backend-target-group" {
  vpc_id = aws_vpc.main.id

  name     = "chat-backend-target-group"
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