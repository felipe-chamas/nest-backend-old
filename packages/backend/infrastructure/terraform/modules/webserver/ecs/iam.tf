resource "aws_iam_role" "main_ecs_tasks" {
  name               = "${var.namespace}-${terraform.workspace}-ecs-main-ecs-tasks-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "main_ecs_tasks" {
  name = "${var.namespace}-${terraform.workspace}-ecs-main-ecs-tasks-role-policy"
  role = aws_iam_role.main_ecs_tasks.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": ["*"]
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetResourcePolicy",
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecretVersionIds",
                "secretsmanager:ListSecrets"
            ],
            "Resource": ["*"]
        },
        {
            "Effect": "Allow",
            "Action": [
              "s3:DeleteObject",
              "s3:GetObject",
              "s3:PutObject",
              "s3:PutObjectAcl"
            ],
            "Resource": [
              "arn:aws:s3:::${var.nft_storage_s3_bucket}/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
              "sqs:GetQueueAttributes",
              "sqs:ReceiveMessage",
              "sqs:DeleteMessage",
              "sqs:DeleteMessageBatch"
            ],
            "Resource": [
               "${var.events_queue_arn}"
            ]
        },
        {
            "Effect": "Allow",
            "Resource": [
              "*"
            ],
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogStreams",
                "logs:PutSubscriptionFilter",
                "logs:PutLogEvents"
            ]
        }
    ]

}
EOF
}

data "aws_iam_policy_document" "ecs_service_scaling" {
  statement {
    effect = "Allow"

    actions = [
      "application-autoscaling:*",
      "ecs:DescribeServices",
      "ecs:UpdateService",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
      "cloudwatch:DescribeAlarmHistory",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:DescribeAlarmsForMetric",
      "cloudwatch:GetMetricStatistics",
      "cloudwatch:ListMetrics",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DisableAlarmActions",
      "cloudwatch:EnableAlarmActions",
      "iam:CreateServiceLinkedRole",
      "sns:CreateTopic",
      "sns:Subscribe",
      "sns:Get*",
      "sns:List*"
    ]

    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "ecs_service_scaling" {
  name        = "${var.namespace}-${terraform.workspace}-ecs-service-scaling"
  path        = "/"
  description = "Allow ECS service scaling"

  policy = data.aws_iam_policy_document.ecs_service_scaling.json
}

resource "aws_iam_role_policy_attachment" "ecs_service_scaling" {
  role       = aws_iam_role.main_ecs_tasks.name
  policy_arn = aws_iam_policy.ecs_service_scaling.arn
}

data "aws_iam_policy_document" "codedeploy_assume_role" {
  version = "2012-10-17"
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = [
        "codedeploy.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "codedeploy_role" {
  name               = "${var.namespace}-${terraform.workspace}-codedeploy-for-ecs"
  assume_role_policy = data.aws_iam_policy_document.codedeploy_assume_role.json
}

resource "aws_iam_role_policy_attachment" "codedeploy_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS"
  role       = aws_iam_role.codedeploy_role.name
}
