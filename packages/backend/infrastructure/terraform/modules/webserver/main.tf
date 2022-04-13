data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  name = "${var.namespace}-${terraform.workspace}-vpc"

  cidr = "10.1.0.0/16"

  azs             = [data.aws_availability_zones.available.names[0], data.aws_availability_zones.available.names[1]]
  private_subnets = ["10.1.1.0/24", "10.1.2.0/24"]
  public_subnets  = ["10.1.11.0/24", "10.1.12.0/24"]

  enable_nat_gateway = false # false is just faster

  tags = {
    Environment = terraform.workspace
    Name        = var.namespace
  }
}

#For now we only use the AWS ECS optimized ami <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html>
data "aws_ami" "amazon_linux_ecs" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn-ami-*-amazon-ecs-optimized"]
  }

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }
}
