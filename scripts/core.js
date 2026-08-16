(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.KawTraceCore = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const MAINNET_VERSIONS = new Set([60, 122]);
    const TESTNET_VERSIONS = new Set([111, 196]);

    function decodeBase58(value) {
        if (typeof value !== 'string' || !value.length) return null;
        let number = 0n;
        for (const character of value) {
            const index = BASE58_ALPHABET.indexOf(character);
            if (index < 0) return null;
            number = number * 58n + BigInt(index);
        }
        const bytes = [];
        while (number > 0n) {
            bytes.push(Number(number & 255n));
            number >>= 8n;
        }
        bytes.reverse();
        for (let index = 0; index < value.length && value[index] === '1'; index++) bytes.unshift(0);
        return new Uint8Array(bytes);
    }

    async function sha256(bytes) {
        if (globalThis.crypto && globalThis.crypto.subtle) {
            return new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes));
        }
        if (typeof require === 'function') {
            const crypto = require('node:crypto');
            return new Uint8Array(crypto.createHash('sha256').update(bytes).digest());
        }
        throw new Error('SHA-256 is unavailable');
    }

    async function validateRavencoinAddress(address, network = 'any') {
        const decoded = decodeBase58(address);
        if (!decoded || decoded.length !== 25) return false;

        const payload = decoded.slice(0, 21);
        const checksum = decoded.slice(21);
        const firstHash = await sha256(payload);
        const secondHash = await sha256(firstHash);
        if (!checksum.every((byte, index) => byte === secondHash[index])) return false;

        if (network === 'main') return MAINNET_VERSIONS.has(payload[0]);
        if (network === 'test' || network === 'regtest') return TESTNET_VERSIONS.has(payload[0]);
        return MAINNET_VERSIONS.has(payload[0]) || TESTNET_VERSIONS.has(payload[0]);
    }

    function normalizeAssetRecord(name, value, details) {
        const base = value && typeof value === 'object' ? value : { amount: value };
        const full = details && typeof details === 'object' ? details : {};
        return {
            name,
            amount: full.amount ?? base.amount ?? 0,
            units: full.units ?? base.units ?? 0,
            reissuable: Boolean(full.reissuable ?? base.reissuable),
            has_ipfs: Boolean(full.has_ipfs ?? base.has_ipfs),
            ipfs_hash: full.ipfs_hash ?? base.ipfs_hash ?? ''
        };
    }

    // Ravencoin asset RPC methods return display-unit decimal amounts. The
    // `units` field controls precision only; it is not a satoshi-style scale.
    function formatAssetAmount(amount, units = 0) {
        const value = Number(amount);
        if (!Number.isFinite(value)) return 'Unknown';
        const precision = Math.max(0, Math.min(8, Number(units) || 0));
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: precision
        });
    }

    function isCoinbaseTransaction(tx) {
        return Boolean(tx && Array.isArray(tx.vin) && tx.vin.some(input => input && input.coinbase));
    }

    function transactionOutputTotal(tx) {
        if (!tx || !Array.isArray(tx.vout)) return 0;
        return tx.vout.reduce((total, output) => total + (Number(output.value) || 0), 0);
    }

    function classifyAssetOperation(asset) {
        const type = String(asset?.type ?? asset?.asset_type ?? asset?.operation ?? '').toLowerCase();
        const explicitTypes = new Map([
            ['new', 'New issuance'],
            ['new_asset', 'New issuance'],
            ['issue', 'New issuance'],
            ['reissue', 'Reissue'],
            ['reissue_asset', 'Reissue'],
            ['transfer', 'Transfer'],
            ['transfer_asset', 'Transfer'],
            ['restricted_transfer', 'Restricted transfer'],
            ['transfer_restricted_asset', 'Restricted transfer'],
            ['qualifier', 'Qualifier operation'],
            ['tag', 'Tag operation']
        ]);
        return explicitTypes.get(type) || 'Asset output';
    }

    function isChainReorganization(previous, current, canonicalPreviousHash = null) {
        if (!previous?.hash || !Number.isInteger(previous.height) || !current?.bestblockhash || !Number.isInteger(current.blocks)) return false;
        if (current.blocks < previous.height) return true;
        if (current.blocks === previous.height) return current.bestblockhash !== previous.hash;
        return typeof canonicalPreviousHash === 'string' && canonicalPreviousHash !== previous.hash;
    }

    function paginateNewestTxids(txids, page = 1, perPage = 10) {
        const newestFirst = [...new Set(Array.isArray(txids) ? txids : [])].reverse();
        const safePage = Math.max(1, Number(page) || 1);
        const start = (safePage - 1) * perPage;
        return {
            pageTxids: newestFirst.slice(start, start + perPage),
            hasMore: start + perPage < newestFirst.length,
            total: newestFirst.length,
            allTxids: newestFirst
        };
    }

    function formatPercentage(value) {
        const percentage = Number(value);
        if (!Number.isFinite(percentage) || percentage <= 0) return '0.00%';
        if (percentage < 0.01) return '<0.01%';
        return `${percentage.toFixed(2)}%`;
    }

    return {
        decodeBase58,
        validateRavencoinAddress,
        normalizeAssetRecord,
        formatAssetAmount,
        isCoinbaseTransaction,
        transactionOutputTotal,
        classifyAssetOperation,
        isChainReorganization,
        paginateNewestTxids,
        formatPercentage
    };
}));
