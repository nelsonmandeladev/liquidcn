# Security policy

## Supported versions

liquidcn is distributed as source through a shadcn registry. Fixes land on the `master` branch and are published by redeploying the registry, so only the latest version is supported. Reinstall a component with `npx shadcn@latest add` to pick up a fix.

## Reporting a vulnerability

Please do not open a public issue. Report it privately through [GitHub's private vulnerability reporting](https://github.com/nelsonmandeladev/liquidcn/security/advisories/new), with the affected component, steps to reproduce, and the impact you expect.

You should get a first response within a week. We will agree on a fix and a disclosure date with you, and credit you in the advisory unless you prefer otherwise.

## Scope

In scope: the component sources in `src/components/ui/` and `src/lib/liquid/`, the registry JSON served from `/r/`, and the website. Vulnerabilities in dependencies (Radix UI, Sonner, Next.js, and others) should be reported to those projects; tell us too if liquidcn's use of them makes the issue worse.
