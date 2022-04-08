variable "account_alias" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "namespace" {
  type    = string
  default = "nft-storage"
}

variable "region" {
  type    = string
  default = "us-east-1"
}