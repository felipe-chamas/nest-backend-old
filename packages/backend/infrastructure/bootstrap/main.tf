provider "aws" {
  region = "us-east-1"
}

variable "account_alias" {
  type    = string
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.account_alias}-terraform-state-${terraform.workspace}"

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_s3_bucket_acl" "terraform_state_acl" {
  bucket = aws_s3_bucket.terraform_state.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "terraform_state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "terraform_state_lock" {
  name           = "${var.account_alias}-terraform-state-${terraform.workspace}"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
