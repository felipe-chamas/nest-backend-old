resource "aws_ecr_repository" "ecr" {
  name                 = "${var.namespace}-${terraform.workspace}-ecr"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

resource "aws_ecr_repository" "ecr-redis" {
  name                 = "${var.namespace}-${terraform.workspace}-redis-ecr"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

resource "aws_ecr_repository_policy" "ecr" {
  repository = aws_ecr_repository.ecr.name
  policy     = <<EOF
  {
    "Version": "2008-10-17",
    "Statement": [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetLifecyclePolicy",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
      }
    ]
  }
  EOF
}

resource "aws_ecr_repository_policy" "ecr-redis" {
  repository = aws_ecr_repository.ecr-redis.name
  policy     = <<EOF
  {
    "Version": "2008-10-17",
    "Statement": [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetLifecyclePolicy",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
      }
    ]
  }
  EOF
}
