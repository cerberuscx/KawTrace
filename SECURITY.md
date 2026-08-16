# Security Policy

## Scope

KawTrace is a read-only blockchain explorer. It must never request, receive, store, sign with, or transmit private keys or recovery phrases.

Only connect KawTrace to a restricted RPC proxy. Never expose Ravencoin Core RPC credentials or an unrestricted node endpoint to a browser or the public internet.

## Reporting a vulnerability

Do not publish exploitable security details in a public issue. If GitHub private vulnerability reporting is available under the repository Security tab, use it. Otherwise, open a minimal issue stating that private maintainer contact is required, without including the vulnerability details.

Include the affected version, reproduction steps, security impact, browser and endpoint details, and any proposed mitigation. Remove private keys, credentials, tokens, personal information, and unrelated blockchain addresses from reports.

## Supported versions

Security fixes are applied to the latest published beta or stable release. Older builds may not receive patches.
