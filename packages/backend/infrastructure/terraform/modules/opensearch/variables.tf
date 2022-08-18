variable "namespace" {
  type = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "cloudwatch_log_group_name" {
  type = string
}

variable "opensearch_instance_count" {
  type    = number
  default = 1
}
