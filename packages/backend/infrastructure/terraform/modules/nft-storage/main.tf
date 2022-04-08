provider "aws" {
  region = "us-east-1"
}

module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 3.0"

  domain_name = var.domain_name

  create_route53_records = false

  wait_for_validation = true
}


module "cdn" {
  source  = "cloudposse/cloudfront-s3-cdn/aws"
  version = "0.82.4"

  namespace = var.account_alias
  stage     = terraform.workspace
  name      = var.namespace

  aliases = [var.domain_name]

  acm_certificate_arn = module.acm.acm_certificate_arn

  depends_on = [module.acm]
}