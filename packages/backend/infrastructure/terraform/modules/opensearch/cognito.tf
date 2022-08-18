resource "aws_cognito_user_pool" "opensearch" {
  name                     = "${var.namespace}-${terraform.workspace}-user_pool"
  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = false
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }

  alias_attributes = ["email"]
}

resource "aws_cognito_user_pool_domain" "opensearch" {
  domain       = "${var.namespace}-${terraform.workspace}-login"
  user_pool_id = aws_cognito_user_pool.opensearch.id
}

resource "aws_cognito_identity_pool" "opensearch" {
  identity_pool_name               = "${var.namespace}-${terraform.workspace}-identity_pool"
  allow_unauthenticated_identities = false

  lifecycle {
    ignore_changes = [cognito_identity_providers]
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.opensearch.id

  roles = {
    "authenticated" = aws_iam_role.authenticated.arn
  }
}

resource "aws_iam_role" "authenticated" {
  name = "${var.namespace}-${terraform.workspace}-cognito_authenticated"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.opensearch.id}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "authenticated" {
  name = "${var.namespace}-${terraform.workspace}-authenticated_policy"
  role = aws_iam_role.authenticated.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "mobileanalytics:PutEvents",
        "cognito-sync:*",
        "cognito-identity:*",
        "es:*"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
EOF
}
