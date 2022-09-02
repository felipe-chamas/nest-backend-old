# Deploy

Process to deploy env variable changes on the API

## 1. Add Environment Variables to Docker and Backend Config

[See here](https://github.com/falco-gg/blockchain/commit/c20aaa3a9708a4e8fbf1396a23f38276509556cb)

- `docker-compose.yml`
- `packages/backend/src/common/config/index.ts`

## 2. Open the file `~/.aws/credentials` and include these profiles

```
[theharvest-develop]
aws_access_key_id = ...
aws_secret_access_key = ...
```

Then export the current profile:

```
export AWS_PROFILE=theharvest-develop
```

Alternatively if you don't want to use profiles you can also use aws configure
and skip exporting the current profile.

## 3. Update upstream .env file

Backup your .env or rename it to something else, it will be overriden in
the next step!

Get the current file, this will override your .env!

```
yarn get:secrets
```

Edit the downloaded .env file by adding new variables.

Only change old variable values if they really need to be changed.

Variable values in the upstream .env do not necessarily have to match
your personal .env!

Once you're done editing the upstream .env, push it to secrets manager

```
yarn put:secrets
```

Finally, deploy on Github Actions.
