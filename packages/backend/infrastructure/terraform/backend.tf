terraform {

  backend "s3" {
  }

  required_providers {
    aws = "~> 3.0"
  }
}