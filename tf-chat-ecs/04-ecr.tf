// ECR Repo

resource "aws_ecr_repository" "chat-frontend-repo" {
  name = "chat-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete = true
  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository" "chat-backend-repo" {
  name = "chat-backend"
  image_tag_mutability = "MUTABLE"
  force_delete = true
  image_scanning_configuration {
    scan_on_push = false
  }
}
