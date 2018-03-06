# create-clubhouse-story

A simple web hook to create Clubhouse stories. It was originally created because the [Zapier integration][clubhouse-zapier] that they provide doesn't give a way to set the _owner_ of a story easily (for example, based on an email address).

This web hook can be paired-up with the [Zapier Email Parser][zapier-email-parser] so that you can easily email stories to clubhouse, using the sender email as the "owner", the email subject as the story "name", and the body of the email as the story "description".

## Dependencies

This service is designed to run on [Google Cloud Functions][gcf].

## Local Usage

```bash
export CLUBHOUSE_API_TOKEN=#<your Clubhouse API token>
export CLUBHOUSE_DEFAULT_PROJECT_NAME=#<your Clubhouse default project name>
yarn global add @google-cloud/functions-emulator
yarn install
functions kill
functions start
functions deploy stories --trigger-http
curl # ... hit the URL
```

## POST Body

The expected information in the POST body is:

```
{
  projectName: 'optional project name (defaults to environment var above)'
  name: 'the story name',
  description: 'the story description',
  requestedByEmail: 'email address of a valid Clubhouse member',
  ownerEmail: 'email address of a valid Clubhouse member',
}
```

## Notes

Because Google Cloud Functions [don't yet support environment variables][gcf-noenv], when running in the production environment, you'll need to setup a [runtime config][gcrc] called `production`, with the following variables:

```
clubhouse-api-token
clubhouse-default-project-name
```

<!-- links -->

[clubhouse]: https://clubhouse.io
[clubhouse-zapier]: https://help.clubhouse.io/hc/en-us/articles/206093065-Setting-Up-Zapier-Integrations
[zapier-email-parser]: https://parser.zapier.com/
[gcf]: https://cloud.google.com/functions/
[gcf-em]: https://github.com/GoogleCloudPlatform/cloud-functions-emulator/
[gcf-noenv]: https://issuetracker.google.com/issues/35907643
[gcrc]: https://cloud.google.com/sdk/gcloud/reference/beta/runtime-config
