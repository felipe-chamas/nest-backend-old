locals {
  opensearch_endpoint = aws_opensearch_domain.opensearch.endpoint
  lambda_name         = "LogsToElasticsearch_${var.namespace}-${terraform.workspace}"
}

data "aws_caller_identity" "current" {}
