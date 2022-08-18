terraform {

  backend "s3" {
  }

  required_providers {
    aws = "4.26.0"
  }
}
