# Infrastructure

These files setup the infrastructure for the backend application using Terraform.
Some additional resources are created as part of the state management for the [Terraform backend](https://www.terraform.io/language/settings/backends) (state management).

- S3 bucket to serve as Terraform backend
- DynamoDB table to guarantee state locking and consistency checking

## Bootstrap terraform backend

This should be [run only once](https://stackoverflow.com/questions/47913041/initial-setup-of-terraform-backend-using-terraform), as it creates the S3/DynamoDB backend necessary for future operations.

```
STAGE=develop make terraform-workspace
STAGE=develop make terraform-bootstrap
```

You will be required to input an `account_alias` variable. This is a descriptive name of your AWS account.

## Components

### Event listener

The event listener component is composed of

- SQS queue to hold events incoming from webhook notifications from the blockchain monitoring service
- API Gateway that serves as the webhook endpoint for the queue
- Parsiq trigger to send blockchain events to the API endpoint

These scripts were based on [this project](https://gist.github.com/afloesch/dc7d8865eeb91100648330a46967be25)

##### Manual setup: Create the Parsiq trigger

Follow their documentation to create a trigger with the following ParsiQL code

```
stream NFTClaimMonitor
from BSC_NFTClaim_TokenClaimed_Events
where @contract == BSC.address("0xCONTRACT_ADDRESS")
process
  let tx = @transaction.hash
  let event = @event
  let contractAddress = "0xCONTRACT_ADDRESS"
  emit { tx, event, contractAddress }
end
```

### NFT Storage

The NFT Storage component [is composed of](https://github.com/cloudposse/terraform-aws-cloudfront-s3-cdn)

- S3 to store static files, such as NFT image
- Cloudfront to distribute files across multiple regions
- Certificate Manager SSL certificate to allow alias domain name (e.g. `example.com`) to be used instead of cloudfront endpoint (assumes manual CNAME update on domain registrar — update the TF module if using Route 53)

### Webserver

The webserver is a Docker container deployed on ECS

The configuration files are based on [this example](https://github.com/LukeMwila/aws-apigateway-vpc-ecs-fargate/) and [this article](https://dev.to/kieranjen/ecs-fargate-service-auto-scaling-with-terraform-2ld). About VPCs, read [this](https://github.com/terraform-aws-modules/terraform-aws-vpc/pull/248/files) and [this](https://dev.betterdoc.org/infrastructure/2020/02/04/setting-up-a-nat-gateway-on-aws-using-terraform.html)

- ECR to host docker images
- ECS to run docker containers
- VPC that shields Docker containers from the internet and allows access only to AWS services
- API Gateway to receive traffic from the internet

By default, the `us-east-1` region is used. If you need to change it, be sure to update the `Makefile` and default `vars.tf`

Since the webserver is inside a VPC, it needs to connect to Mongo Cloud through a Peer peer.

## Create the infrastructure

Setup a `.env` file with the following parameters:

- `ACCOUNT_ALIAS` (See [why this is necessary](https://stackoverflow.com/questions/65838989/variables-may-not-be-used-here-during-terraform-init))
- `NFT_STORAGE_DOMAIN_NAME` used on the NFT storage component
- `API_DOMAIN_NAME` used as endpoint of the REST API
- `STAGE` used to distinguish between environments

```
make build
make push
make apply
```

##### Manual setup: Create a Peering Connection on Mongo Cloud

Add `nat_gateway_ip` to Mongo Atlas IP Access List. See [here](https://levelup.gitconnected.com/part-2-deploy-and-secure-mongodb-on-atlas-4820d539a1dc#42ba)

##### Manual setup: Update DNS records for API Gateway
