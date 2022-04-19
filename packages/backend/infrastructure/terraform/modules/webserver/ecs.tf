resource "aws_ecs_cluster" "ecs" {
  count = var.create_ecs ? 1 : 0

  name = "${var.namespace}-${terraform.workspace}-ecs"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

resource "aws_ecs_cluster_capacity_providers" "ecs" {
  count = var.create_ecs ? 1 : 0

  cluster_name = aws_ecs_cluster.ecs[0].name

  capacity_providers = ["FARGATE", "FARGATE_SPOT", aws_ecs_capacity_provider.capacity_provider.name]

  dynamic "default_capacity_provider_strategy" {
    for_each = [{
      capacity_provider = aws_ecs_capacity_provider.capacity_provider.name # "FARGATE_SPOT"
      weight            = "1"
    }]
    iterator = strategy

    content {
      capacity_provider = strategy.value["capacity_provider"]
      weight            = lookup(strategy.value, "weight", null)
      base              = lookup(strategy.value, "base", null)
    }
  }
}

resource "aws_ecs_capacity_provider" "capacity_provider" {
  name = "${var.namespace}-${terraform.workspace}-ecs-cp"

  auto_scaling_group_provider {
    auto_scaling_group_arn = module.asg.autoscaling_group_arn
  }

  tags = {
    name        = var.namespace
    environment = terraform.workspace
  }
}

module "asg" {
  source  = "terraform-aws-modules/autoscaling/aws"
  version = "~> 4.0"

  name = "${var.namespace}-${terraform.workspace}-ecs"

  # Launch configuration
  lc_name   = "${var.namespace}-${terraform.workspace}-ecs"
  use_lc    = true
  create_lc = true

  image_id                  = data.aws_ami.amazon_linux_ecs.id
  instance_type             = var.instance_type
  security_groups           = [module.vpc.default_security_group_id]
  iam_instance_profile_name = aws_iam_instance_profile.ec2_profile.id
  user_data = templatefile("${path.module}/templates/user-data.sh", {
    cluster_name = "${var.namespace}-${terraform.workspace}-ecs"
  })

  # Auto scaling group
  vpc_zone_identifier       = module.vpc.private_subnets
  health_check_type         = "EC2"
  min_size                  = 1
  max_size                  = 2
  desired_capacity          = 1
  wait_for_capacity_timeout = 0

  tags = [
    {
      key                 = "Environment"
      value               = terraform.workspace
      propagate_at_launch = true
    },
  ]
}