resource "aws_sqs_queue" "queue" {
  name                      = "${var.namespace}-${terraform.workspace}-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

