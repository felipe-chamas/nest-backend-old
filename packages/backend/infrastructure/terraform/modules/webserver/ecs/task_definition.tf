resource "aws_ecs_task_definition" "main" {
  family                   = "${var.namespace}-${terraform.workspace}-ecs-task-definition"
  task_role_arn            = aws_iam_role.main_ecs_tasks.arn
  execution_role_arn       = aws_iam_role.main_ecs_tasks.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.total_cpu
  memory                   = var.total_memory
  container_definitions = jsonencode([
    {
      name : "${var.namespace}-${terraform.workspace}-ecs-container",
      image : var.app_image,
      cpu : var.fargate_cpu,
      memory : var.fargate_memory,
      networkMode : "awsvpc",
      logConfiguration : {
        logDriver : "awslogs",
        options : {
          awslogs-region : var.region,
          awslogs-group : "${var.namespace}-${terraform.workspace}-log-group"
          awslogs-stream-prefix : "logs"
        }
      },
      portMappings : [
        {
          protocol : "tcp",
          containerPort : var.app_port,
          hostPort : var.app_port
        }
      ],
      environment : [
        {
          name : "EVENTS_QUEUE_URL",
          value : var.events_queue_url
        },
        {
          name : "NFT_STORAGE_S3_BUCKET",
          value : var.nft_storage_s3_bucket
        },
        {
          name : "NFT_STORAGE_URL",
          value : var.nft_storage_url
        }
      ]
    },
    {
      name : "${var.namespace}-${terraform.workspace}-redis-container",
      image : "${var.namespace}-${terraform.workspace}-redis-ecr",
      cpu : var.redis_cpu,
      memory : var.redis_memory,
      networkMode : "awsvpc",
      logConfiguration : {
        logDriver : "awslogs",
        options : {
          awslogs-region : var.region,
          awslogs-group : "${var.namespace}-${terraform.workspace}-log-group"
          awslogs-stream-prefix : "logs-redis"
        }
      },
      portMappings : [
        {
          protocol : "tcp",
          containerPort : var.redis_port,
          hostPort : var.redis_port
        }
      ]
    }
  ])
}
