output "webserver_api_url" {
  value = aws_api_gateway_domain_name.main.cloudfront_domain_name
}
