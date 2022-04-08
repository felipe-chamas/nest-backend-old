variable "account_alias" {
  type = string
}

variable "namespace" {
  type    = string
  default = "events-listener"
}

variable "region" {
  type    = string
  default = "us-east-1"
}