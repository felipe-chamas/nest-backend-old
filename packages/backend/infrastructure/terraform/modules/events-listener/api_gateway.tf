resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.namespace}-${terraform.workspace}-api"
  description = "POST records to SQS queue"

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

resource "aws_api_gateway_method" "api" {
  rest_api_id      = aws_api_gateway_rest_api.api.id
  resource_id      = aws_api_gateway_rest_api.api.root_resource_id
  api_key_required = false
  http_method      = "POST"
  authorization    = "NONE"
}
