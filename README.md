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

## The site

Astro static site (`src/`) served by a zero-dependency Node server (`server.mjs`)
that also handles `POST /api/form` (quote, contact and dealer forms → email via
[Resend](https://resend.com)), real 404 responses and 301 redirects.

```bash
npm install
npm run dev      # Astro dev server
npm run build    # static build into dist/
npm start        # serve dist/ on $PORT (default 8080)
npm test         # server + form validation tests
```

- Copy and product data: `src/data/content.mjs` (lifted verbatim from the design reference) and `src/data/site.mjs`.
- Design tokens: `src/styles/broadsheet.css` (ported as-is); site styles in `src/styles/site.css`.
- Client behavior (menu, search, quote popup, forms, filter, compare, motion): `src/scripts/site.js`.
- Images, label PDFs and favicons come from the separate assets bundle; see `public/assets/README.md`.
- Set `RESEND_API_KEY` (and a verified `FORM_FROM`) on the Container App for form delivery; see `.env.example`.
- Old-URL redirects live in `REDIRECTS` in `server.mjs`.

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
