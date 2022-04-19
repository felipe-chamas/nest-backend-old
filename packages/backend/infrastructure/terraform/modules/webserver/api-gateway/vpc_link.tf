resource "aws_api_gateway_vpc_link" "this" {
  name        = "${var.namespace}-${terraform.workspace}-vpc-link"
  target_arns = [var.nlb_arn]
}