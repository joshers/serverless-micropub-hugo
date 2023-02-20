Provides a Vercel serverless function for micropub -> Hugo markdown
## Getting Started
You can fork this repo and adjust the following settings in `config.json`:
- ghUser --> your github username
- sites --> the site specific configuration
**NOTE: ** Your micropub endpoint will be available at `/api/[site]`. This means that if you take the configuration as is, the URL will be `/api/main`.

You also need to provide a personal access token as an environmental variable named `GITHUB_TOKEN`.

