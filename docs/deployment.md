# Deployment

The playground and the registry deploy together as one Next.js app on Vercel, at **https://liquidcn.snmandela.com**. The registry is served from `/r/`, for example `https://liquidcn.snmandela.com/r/liquid-tabs.json`.

## Vercel project

1. Import the GitHub repository in Vercel. The framework preset is detected as **Next.js**; keep the defaults.
2. The build command is `pnpm build` (`next build`). The registry JSON in `public/r/` is committed, so it deploys as static files. No environment variables are needed.
3. pnpm version: the repository pins `pnpm@12.6.0` in `packageManager`. If the build log shows a different pnpm, add the environment variable `ENABLE_EXPERIMENTAL_COREPACK=1` so Vercel uses the pinned version.
4. Node version: 22.x (Project Settings, General).

Preview deployments for pull requests work without extra setup; the playground computes install commands from whatever origin serves it.

## Custom domain

1. In the Vercel project, open Settings, Domains, and add `liquidcn.snmandela.com`.
2. At the DNS provider for `snmandela.com`, add the record Vercel shows. For a subdomain this is normally:

   | Type  | Name       | Value                  |
   | ----- | ---------- | ---------------------- |
   | CNAME | `liquidcn` | `cname.vercel-dns.com` |

3. Wait for Vercel to verify the domain and issue the certificate.

## After deploying

- Open `https://liquidcn.snmandela.com/r/registry.json` and one item JSON to confirm the registry is served.
- Install a component into a fresh shadcn project:

  ```sh
  npx shadcn@latest add https://liquidcn.snmandela.com/r/liquid-button.json
  ```

- The canonical URL, Open Graph image, and `registry.json` homepage use the domain from `src/site.ts` and `registry.json`. Update both if the domain changes.
