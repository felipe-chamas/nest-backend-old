output "cluster_id" {
  value = concat(aws_ecs_cluster.ecs.*.id, [""])[0]
}
