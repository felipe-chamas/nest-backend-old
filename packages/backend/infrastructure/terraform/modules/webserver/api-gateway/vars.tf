variable "namespace" {
  type = string
}

variable "nlb_arn" {
  type = string
}

variable "app_port" {
  type = number
}

variable "nlb_dns_name" {
  type = string
}

variable "api_domain_name" {
  type = string
}

variable "path_part" {
  type    = string
  default = "{proxy+}"
}

variable "integration_input_type" {
  type    = string
  default = "HTTP_PROXY"
}

variable "integration_http_method" {
  type    = string
  default = "ANY"
}
