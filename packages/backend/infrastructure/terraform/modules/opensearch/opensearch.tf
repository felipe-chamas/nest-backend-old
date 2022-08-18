locals {
  aws_options = {
    opensearch_ebs_iops      = 3000
    opensearch_ebs_size      = 10
    opensearch_instance_type = "t3.medium.search"
  }
}

resource "aws_opensearch_domain" "opensearch" {
  domain_name    = "${var.namespace}-${terraform.workspace}"
  engine_version = "OpenSearch_1.3"

  node_to_node_encryption {
    enabled = true
  }

  encrypt_at_rest {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-0-2019-07"
  }

  advanced_security_options {
    enabled = true
    master_user_options {
      master_user_arn = aws_iam_role.authenticated.arn
    }
  }

  access_policies = <<CONFIG
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
              "AWS": "*"
            },
            "Action": "es:*",
            "Resource": "arn:aws:es:${var.region}:${data.aws_caller_identity.current.account_id}:domain/${var.namespace}/*"
        }
    ]
}
  CONFIG

  cluster_config {
    dedicated_master_count   = 0
    dedicated_master_enabled = false
    instance_count           = var.opensearch_instance_count
    instance_type            = local.aws_options.opensearch_instance_type
    zone_awareness_enabled   = false
  }

  cognito_options {
    enabled          = true
    user_pool_id     = aws_cognito_user_pool.opensearch.id
    identity_pool_id = aws_cognito_identity_pool.opensearch.id
    role_arn         = aws_iam_role.opensearch.arn
  }

  ebs_options {
    ebs_enabled = true
    iops        = local.aws_options.opensearch_ebs_iops
    volume_size = local.aws_options.opensearch_ebs_size
    volume_type = "gp3"
  }

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}

resource "aws_iam_role" "opensearch" {
  name               = "${var.namespace}-${terraform.workspace}-opensearch"
  assume_role_policy = data.aws_iam_policy_document.iam_assume_role_opensearch.json
}

resource "aws_iam_role_policy" "iam_role_policy_opensearch" {
  name   = "${var.namespace}-${terraform.workspace}-opensearch"
  role   = aws_iam_role.opensearch.id
  policy = data.aws_iam_policy_document.opensearch.json
}

data "aws_iam_policy_document" "opensearch" {
  statement {
    actions = [
      "ec2:DescribeVpcs",
      "cognito-idp:DescribeUserPool",
      "cognito-idp:CreateUserPoolClient",
      "cognito-idp:DeleteUserPoolClient",
      "cognito-idp:UpdateUserPoolClient",
      "cognito-idp:DescribeUserPoolClient",
      "cognito-idp:AdminInitiateAuth",
      "cognito-idp:AdminUserGlobalSignOut",
      "cognito-idp:ListUserPoolClients",
      "cognito-identity:DescribeIdentityPool",
      "cognito-identity:UpdateIdentityPool",
      "cognito-identity:GetIdentityPoolRoles"
    ]
    effect    = "Allow"
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "iam_assume_role_opensearch" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["opensearchservice.amazonaws.com"]
    }
  }
}
