// ECR Repositories for microservices

resource "aws_ecr_repository" "chat-frontend-repo" {
  name                 = "chat-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository" "auth-service-repo" {
  name                 = "auth-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository" "chat-service-repo" {
  name                 = "chat-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = false
  }
}
