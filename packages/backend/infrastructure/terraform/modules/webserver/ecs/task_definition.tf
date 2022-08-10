resource "random_string" "random" {
  length = 16
}

resource "aws_secretsmanager_secret" "secret_variables" {
  name = "backend-secret-variables"
}

resource "aws_secretsmanager_secret_version" "secret_variables_version" {
  secret_id     = aws_secretsmanager_secret.secret_variables.id
  secret_string = <<EOF
    {
      "mongodb_uri": "${var.mongodb_uri}",
      "discord_client_id": "${var.discord_client_id}",
      "discord_client_secret": "${var.discord_client_secret}",
      "discord_redirect_uri": "${var.discord_redirect_uri}",
      "steam_api_key": "${var.steam_api_key}",
      "steam_return_url": "${var.steam_return_url}",
      "steam_realm": "${var.steam_realm}",
      "frontend_url": "${var.frontend_url}",
      "docs_token": "${var.docs_token}",
      "quicknode_uri": "${var.quicknode_uri}",
      "venly_client_id": "${var.venly_client_id}",
      "venly_client_secret": "${var.venly_client_secret}",
      "venly_application_id": "${var.venly_application_id}",
      "secret_value": "${random_string.random.result}"
    }
  EOF
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
      secrets : [
        {
          name : "MONGODB_URI",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:mongodb_uri::"
        },
        {
          name : "DISCORD_CLIENT_ID",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:discord_client_id::"
        },
        {
          name : "DISCORD_CLIENT_SECRET",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:discord_client_secret::"
        },
        {
          name : "DISCORD_REDIRECT_URI",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:discord_redirect_uri::"
        },
        {
          name : "STEAM_API_KEY",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:steam_api_key::"
        },
        {
          name : "STEAM_RETURN_URL",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:steam_return_url::"
        },
        {
          name : "STEAM_REALM",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:steam_realm::"
        },
        {
          name : "FRONTEND_URL",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:frontend_url::"
        },
        {
          name : "DOCS_TOKEN",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:docs_token::"
        },
        {
          name : "QUICKNODE_URI",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:quicknode_uri::"
        },
        {
          name : "VENLY_CLIENT_ID",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:venly_client_id::"
        },
        {
          name : "VENLY_CLIENT_SECRET",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:venly_client_secret::"
        },
        {
          name : "VENLY_APPLICATION_ID",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:venly_application_id::"
        },
        {
          name : "SESSION_SECRET",
          valueFrom : "${aws_secretsmanager_secret.secret_variables.arn}:secret_value::"
        },
      ]
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
