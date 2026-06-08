# Release & Branching Rules — Git Flow (4 tiers)

These rules define how code flows from a feature to production and how each
long-lived branch maps to an environment. They are **non-negotiable**: every
change reaches `main` through this path, never around it.

## Branch model

```
feat/*  ─PR─▶  develop  ─PR─▶  staging  ─PR─▶  main
              (integración)    (QA twin)     (producción)
```

| Branch | Purpose | Who writes to it | Lifetime |
|--------|---------|------------------|----------|
| `feat/*` | One focused change. Small and short-lived going forward. | You, freely | Deleted after merge |
| `develop` | Integration & testing. Features land here first. | Only via PR from `feat/*` | Permanent |
| `staging` | QA on a **prod-twin** environment. Validate before release. | Only via PR from `develop` | Permanent |
| `main` | Production. Always releasable. Tagged. | Only via PR from `staging` | Permanent |

- **Default base for new work is `develop`.** Branch `feat/<área>-<qué>` off it
  (e.g. `feat/settings-export`, `feat/progress-records`). Keep them small —
  one reviewable concern per branch.
- `legacy` and `ui-lookbook-triage` are **local-only reference branches** — not
  part of the flow, never pushed, never merged.

## Promotion = PR + tag

Every promotion between long-lived branches is a **Pull Request**, never a local
merge. The PR is the gate (CI must be green) and the public record
(build-in-public / portfolio).

1. `feat/* → develop` — open a PR. CI runs (lint · typecheck · test). Merge once
   green. You may self-merge immediately; this is the fast lane.
2. `develop → staging` — open a PR when a batch is ready for QA. Merge, build the
   `staging` EAS profile, validate on the prod-twin API.
3. `staging → main` — open a PR after QA passes. This is the deliberate gate:
   review the full diff before accepting.
4. **Tag the release on `main`:** after the merge, tag `vX.Y.Z` (SemVer). The tag
   marks the release and is the trigger point for a production build.

```bash
# After a staging → main PR is merged:
git checkout main && git pull
git tag -a v0.3.0 -m "v0.3.0 — <one-line summary>"
git push origin v0.3.0
```

Versioning is **SemVer**; the app version also lives in `app.json`
(`appVersionSource: local` in `eas.json`), so keep the tag and `app.json`
version in sync when cutting a release.

## Branch ↔ environment ↔ EAS profile

The EAS profiles in `eas.json` map 1:1 to the branches:

| Branch | EAS profile | Channel | API target |
|--------|-------------|---------|------------|
| `feat/*` + `develop` | `development` / `development-device` | `development` | `localhost:3000` · TODO: cloud `develop` API |
| `staging` | `staging` | `staging` | `https://api.rbart-dev.com` (prod-twin) |
| `main` | `production` | `production` | TODO: prod API (today → staging API) |

Build commands:

```bash
eas build --profile development --platform ios --local   # simulator (develop work)
eas build --profile staging     --platform ios --local   # QA twin (staging branch)
eas build --profile production  --platform ios           # store/TestFlight (main)
```

> **Known gaps (TODO):** (1) there is no cloud `develop` API yet — develop builds
> hit `localhost`; (2) the production backend is not provisioned (contracts only
> cover `develop` + `staging`), so `production` points at the staging API until
> it exists. Swap `EXPO_PUBLIC_API_URL` in the `production` profile when prod ships.

## CI

`.github/workflows/ci.yml` runs lint · typecheck · test on **PR and push to
`develop`, `staging`, `main`**. CI is the gate on every promotion PR. There is
**no CD** yet — EAS builds are triggered manually.

## Branch protection (apply once, on GitHub)

`main` and `staging` should reject direct pushes and require a green CI check.
Run these with the `gh` CLI (needs admin on the repo):

```bash
# main — strictest: PR + passing CI required, no direct pushes
gh api -X PUT repos/r-bart/verxion-native-client/branches/main/protection \
  -F required_status_checks.strict=true \
  -F 'required_status_checks.contexts[]=Lint · Typecheck · Test' \
  -F enforce_admins=false \
  -F required_pull_request_reviews.required_approving_review_count=0 \
  -F restrictions=

# staging — same gate (QA branch must also stay green)
gh api -X PUT repos/r-bart/verxion-native-client/branches/staging/protection \
  -F required_status_checks.strict=true \
  -F 'required_status_checks.contexts[]=Lint · Typecheck · Test' \
  -F enforce_admins=false \
  -F required_pull_request_reviews.required_approving_review_count=0 \
  -F restrictions=
```

> Solo-maintainer note: `required_approving_review_count=0` keeps the CI gate
> without blocking on a second reviewer you don't have. The discipline is the
> PR + green check, not an approval.
