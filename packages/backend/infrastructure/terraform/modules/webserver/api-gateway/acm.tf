module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 3.0"

  domain_name = var.api_domain_name

  create_route53_records = false

  wait_for_validation = true

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}
