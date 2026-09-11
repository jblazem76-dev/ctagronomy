# ctagronomy-app

Application repository for **ctagronomy-app**, deployed to Azure Container Apps.

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which:

1. Builds the container image in Azure Container Registry (`az acr build`).
2. Deploys it to the Container App (`az containerapp update`).
3. Sets the app to single-revision mode.
4. Verifies the new revision provisioned and the app is responding.

### Target infrastructure

| Setting            | Value                                                              |
| ------------------ | ----------------------------------------------------------------- |
| Container App      | `ctagronomy-app`                                                  |
| Resource group     | `nilproof-rg`                                                     |
| Environment        | `nilproof-env`                                                    |
| Registry           | `nilproofacr.azurecr.io` (shared — image namespaced `ctagronomy-app`) |
| Subscription       | `623cc75e-e058-423e-bd9e-7bd1e1270930` (East US)                 |
| App URL            | https://ctagronomy-app.niceground-2d9186e9.eastus.azurecontainerapps.io |

### Required secret

Add a repository secret named **`AZURE_CREDENTIALS`** containing the JSON from:

```bash
az ad sp create-for-rbac \
  --name "gha-ctagronomy-deploy" \
  --role contributor \
  --scopes /subscriptions/623cc75e-e058-423e-bd9e-7bd1e1270930/resourceGroups/nilproof-rg \
  --sdk-auth
```

The service principal also needs **AcrPush** on the shared registry so
`az acr build` can push:

```bash
az role assignment create \
  --assignee <appId-from-above> \
  --role AcrPush \
  --scope $(az acr show -n nilproofacr --query id -o tsv)
```

## Container contract

Azure Container Apps injects the listening port via **`$PORT`** (commonly
`8080`). The app must bind to `process.env.PORT` on host `0.0.0.0`. See the
comments in the [`Dockerfile`](Dockerfile) for stack-specific guidance.

> **Note:** This repo was scaffolded before application source existed. The
> `Dockerfile` is a general-purpose Node.js build (the common pairing with
> Supabase) — review the lines marked `ADAPT` once the real app is committed,
> or swap it for a Python image if that's the stack.

## Backend

- Supabase project: https://cakvhsbzgzzoksdvgjqa.supabase.co
