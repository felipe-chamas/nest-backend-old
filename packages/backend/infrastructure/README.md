# Infrastructure

These files setup the infrastructure for the backend application using Terraform.
Some additional resources are created as part of the state management for the backend

- S3 bucket to serve as terraform backend
- DynamoDB table to guarantee state locking and consistency checking

##### Bootstrap terraform backend

This should be run only once, as it creates the S3/DynamoDB backend necessary for future operations.

```
STAGE=develop make terraform-workspace
STAGE=develop make terraform-bootstrap
```

You will be required to input an `account_alias` variable. This is a descriptive name of your AWS account.

## Event listener

The event listener service is composed of

- SQS queue to hold events incoming from webhook notifications from the blockchain monitoring service
- API Gateway that serves as the webhook endpoint for the queue
- Parsiq trigger to send blockchain events to the API endpoint

### Setup

##### 1. Create the Parsiq trigger

Follow their documentation to create a trigger with the following ParsiQL code

```
stream _
from MATIC_NFT_Transfer_Events
where @contract == MATIC.address("0xMY_NFT_ADDRESS")

process
  emit { @tokenId, @to, @from, @event, @block, @transaction }
end
```

##### 2. Create event listener infrastructure

Pass the `account_alias` name as environment variable (See [why this is necessary](https://stackoverflow.com/questions/65838989/variables-may-not-be-used-here-during-terraform-init)). This should be the same as the variable inputed on the previous step.

```
ACCOUNT_ALIAS=myaccount STAGE=develop make apply
```

These scripts were based on [this project](https://gist.github.com/afloesch/dc7d8865eeb91100648330a46967be25)

## NFT Storage

The NFT Storage service is composed of

- S3 to store static files, such as NFT image
- Cloudfront to distribute files across multiple regions
- Certificate Manager SSL certificate to allow alias domain name (e.g. `example.com`) to be used instead of cloudfront endpoint (assumes manual CNAME update on domain registrar — update the TF module if using Route 53)

##### 1. Create NFT storage infrastructure

```
ACCOUNT_ALIAS=myaccount STAGE=develop DOMAIN_NAME=example.com make apply
```
