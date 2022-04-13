resource "aws_cloudwatch_log_group" "webserver" {
  name              = "${var.namespace}-${terraform.workspace}-webserver"
  retention_in_days = 1
}

resource "aws_ecs_task_definition" "webserver" {
  family        = "${var.namespace}-${terraform.workspace}-webserver"
  task_role_arn = aws_iam_role.ecs_role.arn

  container_definitions = <<EOF
[
  {
    "name": "${var.namespace}-${terraform.workspace}-webserver",
    "image": "${var.namespace}-${terraform.workspace}-webserver",
    "cpu": 0,
    "memory": 128,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "eu-west-1",
        "awslogs-group": "webserver",
        "awslogs-stream-prefix": "${var.namespace}-${terraform.workspace}"
      }
    },
    "portMappings": [
      {
        "hostPort": 80,
        "containerPort": 80,
        "protocol": "tcp"
      }
    ],
    "environment": [
      {
        "name": "EVENTS_QUEUE_URL",
        "value": "${var.events_queue_url}"
      },
      {
        "name": "NFT_STORAGE_S3_BUCKET",
        "value": "${var.nft_storage_s3_bucket}"
      },
      {
        "name": "NFT_STORAGE_URL",
        "value": "${var.nft_storage_url}"
      }
    ]
  }
]
EOF
}

resource "aws_ecs_service" "webserver" {
  name            = "${var.namespace}-${terraform.workspace}-webserver"
  cluster         = concat(aws_ecs_cluster.ecs.*.id, [""])[0]
  task_definition = aws_ecs_task_definition.webserver.arn

  desired_count = 1

  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}