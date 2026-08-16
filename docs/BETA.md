# KawTrace Beta Testing

KawTrace `v0.1.0-beta.2` is the current public Ravencoin beta. The hosted explorer is the primary beta target. The portable single-file release is the secondary target.

## Beta objectives

- Confirm that displayed blockchain data matches the selected Ravencoin network.
- Identify RPC methods or response shapes that vary between compatible proxies.
- Exercise block, transaction, address, asset, holder, and mempool views under normal use.
- Detect stale cache, endpoint-switching, pagination, responsive-layout, and recovery failures.
- Preserve the explorer's read-only security boundary.

## Reporting a defect

Use the [KawTrace bug report](https://github.com/cerberuscx/KawTrace/issues/new?template=bug_report.yml).

Include:

- KawTrace version and hosted or portable build
- Browser and operating system
- Selected endpoint preset or a sanitized custom proxy URL
- Affected view and exact reproduction steps
- Expected and observed behaviour
- Relevant public block height, transaction ID, address, or asset name
- Browser console errors with tokens, credentials, and personal information removed

Never include RPC credentials, access tokens, private keys, recovery phrases, private endpoint URLs, or unrelated personal blockchain activity.

Security vulnerabilities belong in [private vulnerability reporting](https://github.com/cerberuscx/KawTrace/security/advisories/new), not public issues.

## Defect priority

| Priority | Meaning |
|---|---|
| Critical | Private data exposure, credential handling, signing capability, or incorrect network isolation |
| High | Incorrect blockchain data, broken primary navigation, unusable hosted release, or persistent RPC failure |
| Medium | Broken pagination, stale display, endpoint-specific incompatibility, or major layout failure |
| Low | Cosmetic defect, wording problem, or minor usability issue without incorrect data |

## Accepted beta limitations

- Public endpoints are best-effort and may be rate-limited or unavailable.
- Mempool history is collected only while KawTrace is open in the same browser origin.
- Recent transaction discovery scans a limited recent block range and excludes coinbase transactions.
- Endpoint capabilities determine tag, qualifier, message, and restricted-asset coverage.
- Regtest requires a controlled compatible endpoint and is not part of the public beta pass.
- Sustained load testing must not be performed against public RPC services.

## Release baseline

The verified beta baseline is recorded in [Release Acceptance](./ACCEPTANCE.md). A reported defect should be reproducible against the current hosted deployment or the attached portable release before it is treated as a KawTrace regression.
