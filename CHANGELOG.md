# Changelog

All notable KawTrace changes are recorded here.

## [0.1.0-beta.2] - 2026-08-16

Accuracy and transaction-semantics beta.

### Added

- Coinbase payout, destination, maturity, fee, and reward-component details on block pages
- Recent-chain reorganization detection and cache invalidation
- Explicit node-local mempool disclosure
- Per-output asset movement details

### Changed

- Renamed output totals to `Total RVN Outputs` and documented change and burn outputs
- Removed speculative asset reissue classification
- Replaced ambiguous vanished-mempool state with `No Longer Visible`
- Kept confirmation and coinbase maturity counts current when detail data is cached
- Calculated transaction fees in Ravencoin atomic units

[0.1.0-beta.2]: https://github.com/cerberuscx/KawTrace/releases/tag/v0.1.0-beta.2

## [0.1.0-beta.1] - 2026-08-16

First public Ravencoin mainnet beta.

### Added

- Live network, block, transaction, address, asset, and mempool views
- Ravencoin mainnet, testnet, same-origin, and custom RPC proxy settings
- Locally retained real mempool history
- Pending-to-confirmed transaction tracking
- Complete address-history and paginated asset-holder loading
- Restricted-asset verifier and global-freeze details when supported
- GitHub Pages deployment and portable single-file build

### Security

- Read-only explorer RPC policy
- No private-key, recovery-phrase, signing, or broadcast functionality
- Ravencoin Base58Check address validation
- Restricted public RPC concurrency

[0.1.0-beta.1]: https://github.com/cerberuscx/KawTrace/releases/tag/v0.1.0-beta.1
