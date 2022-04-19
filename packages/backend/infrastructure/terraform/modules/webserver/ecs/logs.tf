resource "aws_cloudwatch_log_group" "log-group" {
  name              = "${var.namespace}-${terraform.workspace}-log-group"
  retention_in_days = 1
}