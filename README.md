# KawTrace

KawTrace is a serverless, all-in-one block and asset explorer for the Ravencoin network.

Use the hosted explorer at **[cerberuscx.github.io/KawTrace](https://cerberuscx.github.io/KawTrace/)**.

KawTrace runs entirely in the browser. There is no account, application server, database, or installation process. It connects to a compatible Ravencoin RPC proxy and can also be configured to use another public or self-hosted endpoint.

## Features

- Live Ravencoin network statistics
- Recent blocks and transactions
- Real-time mempool activity with locally retained history
- Block, transaction, address, and asset search
- Address balances and transaction history
- Ravencoin asset details and holder information
- Restricted-asset verifier and freeze-state information when supported by the endpoint
- Configurable mainnet, testnet, same-origin, and custom RPC endpoints
- Responsive desktop and mobile interface
- No private keys, wallet seeds, transaction signing, or asset custody

## Use KawTrace

### Hosted version

Open **[KawTrace on GitHub Pages](https://cerberuscx.github.io/KawTrace/)** in a modern browser.

The hosted version updates automatically when a new release is deployed.

### Single-file version

The portable build packages KawTrace into one `index.html` file. Download **[KawTrace v0.1.0 beta 1](https://github.com/cerberuscx/KawTrace/releases/download/v0.1.0-beta.1/KawTrace-v0.1.0-beta.1.html)**, save it anywhere, and open it directly in a browser.

Browser security and Flatpak filesystem restrictions can prevent a local HTML file from loading or connecting correctly. In that case, use the hosted version.

## RPC endpoints

KawTrace initially connects to the Raven Rebels public Ravencoin mainnet service:

```text
https://rvn-rpc-mainnet.ting.finance/rpc
```

This is a public, whitelisted, cached, queued, best-effort service. Availability, privacy, and unrestricted RPC access are not guaranteed.

The endpoint can be changed from Explorer Settings. KawTrace supports:

- Raven Rebels mainnet
- Raven Rebels testnet
- A same-origin `/rpc` proxy
- A compatible custom RPC proxy

Never expose Ravencoin Core RPC directly to a browser or the public internet. A self-hosted deployment must place a restricted proxy in front of the node, allow only required read-only methods, enforce request limits, and keep RPC credentials on the server.

## Local browser data

KawTrace stores settings, cached explorer data, and up to 24 hours of real mempool samples in the browser. This information remains on the device and is separated by website origin.

Mempool history is collected only while KawTrace is open. Missing periods are left as gaps rather than replaced with fabricated data. Clearing browser site data removes the stored history and settings.

## Privacy

Requests are sent directly from the browser to the selected RPC proxy. The operator of that endpoint can observe the IP address and requested blockchain data.

IPFS previews use the public `ipfs.io` gateway. Opening a preview discloses the requested content identifier and connecting IP address to that service.

KawTrace is an explorer, not a wallet. It never requests or handles private keys or recovery phrases.

## Current limitations

- Public endpoints expose only approved RPC methods and may be rate-limited or unavailable.
- Tag, qualifier, message, and restricted-asset coverage depends on the selected endpoint.
- Recent transaction discovery scans a limited range of recent blocks and excludes coinbase transactions.
- Large address histories and asset-holder lists can take longer to load.
- Testnet and regtest have not received the same end-to-end acceptance coverage as mainnet.

## Project history

KawTrace is based on Hans's [evr-connor-explorer](https://github.com/EvrmoreOrg/evr-connor-explorer), originally forked from JohnConnorNPC's [EVR-TRACKY-BOI](https://github.com/JohnConnorNPC/EVR-TRACKY-BOI).

The original copyright and MIT licence are preserved in [LICENSE](./LICENSE). Third-party browser libraries and their licences are recorded in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

The full-colour Ravencoin mark comes from the official [RavenProject branding kit](https://github.com/RavenProject/Raven-Branding-Kit).

## Development

Development and source verification require Node.js:

```bash
npm test
npm run check
npm run build:single
npm run build:pages
```

The generated portable build is written to `dist/index.html`.
