# Infrastructure

These files setup the infrastructure for the backend application using Terraform.
Some additional resources are created as part of the state management for the [Terraform backend](https://www.terraform.io/language/settings/backends) (state management)

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
stream _
from MATIC_NFT_Transfer_Events
where @contract == MATIC.address("0xMY_NFT_ADDRESS")

process
  emit { @tokenId, @to, @from, @event, @block, @transaction }
end
```

### NFT Storage

The NFT Storage component [is composed of](https://github.com/cloudposse/terraform-aws-cloudfront-s3-cdn)

- S3 to store static files, such as NFT image
- Cloudfront to distribute files across multiple regions
- Certificate Manager SSL certificate to allow alias domain name (e.g. `example.com`) to be used instead of cloudfront endpoint (assumes manual CNAME update on domain registrar — update the TF module if using Route 53)

### Webserver

The webserver is a Docker container deployed on ECS

The configuration files are based on [this example](https://github.com/terraform-aws-modules/terraform-aws-ecs)

## Create the infrastructure

Parameters:

- `ACCOUNT_ALIAS` (See [why this is necessary](https://stackoverflow.com/questions/65838989/variables-may-not-be-used-here-during-terraform-init))
- `DOMAIN_NAME` used on the NFT storage component
- `STAGE` used to distinguish between environments

```
ACCOUNT_ALIAS=myaccount DOMAIN_NAME=nft.example.com STAGE=develop make apply
```
