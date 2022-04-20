resource "aws_ecs_cluster" "main" {
  name = "${var.namespace}-${terraform.workspace}-cluster"

  tags = {
    Name = "${var.namespace}-${terraform.workspace}-cluster"
  }
}