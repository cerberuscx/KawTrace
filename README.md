# KawTrace

Serverless, all-in-one block and asset explorer for Ravencoin.

## Status

Ravencoin mainnet beta. Dashboard, blocks, non-coinbase transaction discovery, complete address-history pagination, assets, holder pagination, restricted-asset metadata, settings, routing, local hosting, and the single-file package have been exercised manually against the Ting mainnet proxy. Automated tests cover Base58Check validation and pure data-normalization, transaction, asset-amount, and pagination helpers.

## Lineage and attribution

KawTrace is based on Hans's [evr-connor-explorer](https://github.com/EvrmoreOrg/evr-connor-explorer), which was forked from JohnConnorNPC's [EVR-TRACKY-BOI](https://github.com/JohnConnorNPC/EVR-TRACKY-BOI).

The original copyright and MIT license are preserved in [LICENSE](./LICENSE).

The full-colour Ravencoin mark in `img/logo.png` comes from the official [RavenProject branding kit](https://github.com/RavenProject/Raven-Branding-Kit).

## Architecture

The application is plain HTML, CSS, and JavaScript. It requires no application server. Browser requests are sent to a compatible RPC proxy. Browser libraries are vendored locally and recorded in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

It can be served from:

- a local static web server;
- a conventional web host;
- GitHub Pages;
- IPFS after bundling;
- the same host as an RPC proxy under an `/explorer` path.

Direct `file://` use is available through the generated single-file build, subject to browser and Flatpak filesystem policies.

## Local preview

Run:

```bash
./start-local.sh
```

Then open `http://127.0.0.1:8080/`. Override the port with `KAWTRACE_PORT=8081 ./start-local.sh`.

The checked-in default is the Raven Rebels public mainnet service:

```text
https://rvn-rpc-mainnet.ting.finance/rpc
```

This endpoint is public, whitelisted, cached, queued, and operated on a best-effort basis. Do not assume availability, privacy, or unrestricted RPC access. For self-hosted deployment, use a restricted proxy and change the endpoint in Explorer Settings. When KawTrace is served beside a compatible proxy, its published `/settings` response can select same-origin `/rpc` automatically.

Never expose Ravencoin Core RPC directly to a browser or the public internet. Place a restricted proxy between the explorer and the node. Allow only required read-only methods, enforce request limits, and keep RPC credentials on the server.

## Development

```bash
npm test
npm run check
npm run build:single
```

The single-file build is written to `dist/index.html`. `dist/` is intentionally ignored because it is generated output.

## Completed conversion

- [x] Rename the application to KawTrace.
- [x] Convert visible EVR units and Evrmore network labels to RVN and Ravencoin.
- [x] Replace prefix matching with Base58Check and Ravencoin network-version validation.
- [x] Configure the public Raven Rebels mainnet RPC proxy as the initial default.
- [x] Retain automatic same-origin `/rpc` support when served beside a compatible proxy.
- [x] Add Ting mainnet, Ting testnet, same-origin, and custom endpoint presets with a connection test.
- [x] Remove fabricated dashboard history and fees.
- [x] Correct verbose `listassets` column mapping and asset units.
- [x] Preserve decimal asset balances without applying a second unit scale.
- [x] Replace coinbase-only transaction samples with a backward-scanned user-transaction feed.
- [x] Paginate complete address-index histories instead of estimating block ranges.
- [x] Paginate asset holders without silently stopping at 1,000 records.
- [x] Silently poll dashboard datasets every 30 seconds with incremental DOM and chart updates.
- [x] Persist 24 hours of real browser-collected mempool samples for the activity chart.
- [x] Preserve pending transactions through the mempool-to-confirmed cache handoff.
- [x] Limit public RPC concurrency to four requests.
- [x] Display restricted-asset verifier and global-freeze state when supported by the proxy.
- [x] Remove transaction creation, signing, and broadcasting from the public explorer API.
- [x] Vendor Chart.js, Moment.js, and Font Awesome with their licences.
- [x] Add automated core tests and a documented manual mainnet browser acceptance pass.
- [x] Add local-server, single-file, and GitHub Pages packaging.
- [x] Replace the inherited Evrmore mark with the official full-colour Ravencoin mark.
- [x] Document deployment hardening, proxy policy, and privacy implications.

## Known limitations

- The default public endpoint is a best-effort external dependency and supports only whitelisted RPC methods.
- Mainnet has a manual live acceptance pass. Testnet and regtest still require separate end-to-end acceptance runs.
- Tag, qualifier, message, and restricted-asset coverage is limited to methods exposed by the selected proxy.
- Mempool history is not available from the RPC interface. KawTrace records real snapshots locally while it is open, retains up to 24 hours in IndexedDB, and leaves collection gaps intact.
- The recent transaction feed excludes coinbase transactions and scans at most 100 recent blocks.
- Large address histories are loaded explicitly because processing them can be slow and request-intensive.
- IPFS previews use the public `ipfs.io` gateway and therefore disclose requested content identifiers to that service.
- This application is an explorer, not a wallet. It must never request or handle private keys.
