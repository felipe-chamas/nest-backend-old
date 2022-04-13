output "events_queue_url" {
  value = aws_sqs_queue.queue.id
}

output "events_queue_arn" {
  value = aws_sqs_queue.queue.arn
}

output "events_api_url" {
  value = aws_api_gateway_deployment.api.invoke_url
}