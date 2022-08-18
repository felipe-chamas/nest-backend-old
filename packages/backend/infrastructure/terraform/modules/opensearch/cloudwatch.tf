resource "aws_cloudwatch_log_subscription_filter" "filter" {
  name            = "${var.namespace}-${terraform.workspace}-app_filter"
  log_group_name  = var.cloudwatch_log_group_name
  filter_pattern  = ""
  destination_arn = aws_lambda_function.lambda_logs.arn
}

data "aws_cloudwatch_log_group" "log_group" {
  name = var.cloudwatch_log_group_name
}
