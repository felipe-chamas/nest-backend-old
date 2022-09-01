resource "random_string" "random" {
  length = 16
}

resource "aws_secretsmanager_secret" "secret_variables" {
  name = "backend-secret-variables"
}

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
          name : "AWS_REGION",
          value : var.region
        },
        {
          name : "STAGE",
          value : terraform.workspace
        }
      ],
      secrets : [{
        name : "ENV_FILE",
        valueFrom : "arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:develop.env"
      }]
    },
    {
      name : "${var.namespace}-${terraform.workspace}-redis-container",
      image : "public.ecr.aws/ubuntu/redis:latest",
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
      ],
      environment : [
        {
          name : "ALLOW_EMPTY_PASSWORD",
          value : "yes"
        }
      ],
    }
  ])
}
