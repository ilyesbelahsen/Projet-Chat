// chat Services

resource "aws_ecs_task_definition" "chat_frontend_task_definition" {
  family = "chat-frontend-service"
  container_definitions = jsonencode([
    {
      name      = "chat-frontend-container"
      image     = "${aws_ecr_repository.chat-frontend-repo.repository_url}:latest"
      cpu       = 10
      memory    = 128
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group = "/aws/ecs/${var.cluster_name}/chat-frontend"
          awslogs-region = "us-east-1"
          awslogs-stream-prefix = "container-log"
        }
      }
      environment = [
        {
          name  = "BACKEND_ADDRESS"
          value = aws_alb.chat-backend-endpoint.dns_name
        },
      ]
      portMappings = [
        {
          containerPort = 80
          hostPort      = 0 
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "chat-frontend" {
  name            = "chat-frontend-service"
  cluster         = aws_ecs_cluster.chat.id
  task_definition = aws_ecs_task_definition.chat_frontend_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_alb_target_group.chat-frontend-target-group.arn
    container_name   = "chat-frontend-container"
    container_port   = 80
  }

}

// Declare load balancer resources

resource "aws_alb" "external-endpoint" {
  name               = "chat-ext-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [aws_security_group.main_security_group.id]

  subnets = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]

}

resource "aws_lb_listener" "external-endpoint-http" {
  load_balancer_arn = aws_alb.external-endpoint.arn

  port     = "80"
  protocol = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.chat-frontend-target-group.arn
    type             = "forward"
  }

}

resource "aws_alb_target_group" "chat-frontend-target-group" {
  vpc_id = aws_vpc.main.id

  name     = "chat-frontend-target-group"
  port     = 80
  protocol = "HTTP"

}