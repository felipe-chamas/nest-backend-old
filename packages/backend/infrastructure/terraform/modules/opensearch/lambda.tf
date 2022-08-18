resource "aws_lambda_function" "lambda_logs" {
  function_name    = local.lambda_name
  role             = aws_iam_role.lambda_logs.arn
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  filename         = "${path.module}/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda.zip")
  timeout          = 300
  description      = format("%s - provisioning", var.namespace)

  environment {
    variables = {
      myProject_elasticsearch_endpoint = local.opensearch_endpoint
    }
  }

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "InvokePermissionsForCloudWatchLog"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_logs.function_name
  principal     = "logs.amazonaws.com"
  source_arn    = format("%s:*", data.aws_cloudwatch_log_group.log_group.arn)
}

resource "aws_iam_role" "lambda_logs" {
  name               = local.lambda_name
  assume_role_policy = data.aws_iam_policy_document.iam_assume_role_lambda.json
}

resource "aws_iam_role_policy" "iam_role_policy_lambda" {
  name   = local.lambda_name
  role   = aws_iam_role.lambda_logs.id
  policy = data.aws_iam_policy_document.lambda_logs.json
}

data "aws_iam_policy_document" "lambda_logs" {
  statement {
    actions = [
      "es:*"
    ]
    effect    = "Allow"
    resources = ["*"]
  }

  statement {
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
      "ec2:AssignPrivateIpAddresses",
      "ec2:UnassignPrivateIpAddresses"
    ]
    effect    = "Allow"
    resources = ["*"]
  }

  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]
    effect    = "Allow"
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "iam_assume_role_lambda" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
