# Release Acceptance

## v0.1.0-beta.1

Acceptance run completed on 2026-08-16 against the generated Pages package.

### Automated checks

- Seven core tests passed
- JavaScript syntax checks passed
- Portable single-file build completed
- Restricted GitHub Pages package completed
- Git diff whitespace validation passed

### Browser checks

- Mainnet connection and live block height
- Dashboard statistics, latest blocks, latest transactions, and mempool state
- Pending transaction display and transaction detail inputs and outputs
- Block-list navigation and pagination data
- Asset list, asset details, holder balance, and holder percentage
- Valid Ravencoin address lookup and balance summary
- Custom RPC connection success
- Invalid custom RPC failure message
- Mainnet to testnet switch with cache isolation and correct network title
- Testnet to mainnet restoration with correct network title
- 390 by 844 responsive layout without page-level horizontal overflow
- Wide dashboard tables contained by local horizontal scrolling
- No browser console errors during the acceptance run

### Endpoint checks

- Raven Rebels mainnet `getblockcount`
- Raven Rebels testnet `getblockcount`

### Deferred

- Screenshot documentation
- Automated browser CI
- Regtest acceptance, which requires a controlled regtest endpoint
- Destructive or sustained public-endpoint load testing
