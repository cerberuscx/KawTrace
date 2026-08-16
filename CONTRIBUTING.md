# Contributing to KawTrace

KawTrace is plain HTML, CSS, and JavaScript. Keep the browser application serverless, dependency-light, and read-only.

## Development checks

Run these checks before submitting a change:

```bash
npm test
npm run check
npm run build:single
npm run build:pages
```

## Project rules

- Never add private-key, recovery-phrase, transaction-signing, or broadcasting features.
- Never place node credentials in browser code.
- Browser RPC access must use a restricted proxy, not Ravencoin Core directly.
- Do not fabricate blockchain, fee, transaction, or mempool data.
- Preserve exact asset quantities and Ravencoin network validation.
- Keep third-party libraries and licence notices vendored and documented.
- Test changes against a controlled endpoint before relying on a public service.

## Submitting changes

Create a focused branch and pull request. Describe the affected explorer view, RPC methods used, manual verification performed, and any endpoint-specific limitations.
