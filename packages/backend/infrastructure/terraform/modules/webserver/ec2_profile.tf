data "aws_partition" "current" {}

resource "aws_iam_role" "ec2_profile" {
  name = "${var.namespace}-${terraform.workspace}-ecs-iam-role"
  path = "/ecs/"

  tags = {
    Environment = terraform.workspace
    Name        = var.namespace
  }

  assume_role_policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": ["ec2.amazonaws.com"]
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.namespace}-${terraform.workspace}-ecs-instance-profile"
  role = aws_iam_role.ec2_profile.name

  tags = {
    Environment = terraform.workspace
    Name        = var.namespace
  }
}

resource "aws_iam_role_policy_attachment" "ecs_ec2_role" {
  role       = aws_iam_role.ec2_profile.id
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecs_ec2_cloudwatch_role" {
  role       = aws_iam_role.ec2_profile.id
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/CloudWatchLogsFullAccess"
}