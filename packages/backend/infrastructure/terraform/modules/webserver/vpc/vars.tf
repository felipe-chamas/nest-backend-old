variable "number_of_private_subnets" {
  type    = number
  default = 2
}

variable "vpc_cidr_block" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr_block" {
  type    = string
  default = "10.0.2.0/24"
}

variable "private_subnet_cidr_blocks" {
  type    = list(string)
  default = ["10.0.0.0/24", "10.0.4.0/24"]
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "app_port" {
  type = number
}

variable "namespace" {
  type = string
}
