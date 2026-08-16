const test = require('node:test');
const assert = require('node:assert/strict');
const {
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
} = require('../scripts/core.js');

test('decodes Base58 without ambiguous characters', () => {
    assert.deepEqual(Array.from(decodeBase58('1')), [0]);
    assert.equal(decodeBase58('0'), null);
});

test('validates a known Ravencoin mainnet address with Base58Check', async () => {
    assert.equal(await validateRavencoinAddress('RXBurnXXXXXXXXXXXXXXXXXXXXXXWUo9FV', 'main'), true);
    assert.equal(await validateRavencoinAddress('RXBurnXXXXXXXXXXXXXXXXXXXXXXWUo9FW', 'main'), false);
    assert.equal(await validateRavencoinAddress('not-an-address'), false);
});

test('normalizes verbose and scalar listassets records', () => {
    assert.deepEqual(normalizeAssetRecord('SCALAR', 12), {
        name: 'SCALAR', amount: 12, units: 0, reissuable: false, has_ipfs: false, ipfs_hash: ''
    });
    assert.deepEqual(normalizeAssetRecord('FULL', { amount: 5, units: 2, reissuable: 1 }, { has_ipfs: 1, ipfs_hash: 'QmHash' }), {
        name: 'FULL', amount: 5, units: 2, reissuable: true, has_ipfs: true, ipfs_hash: 'QmHash'
    });
});

test('formats RPC asset balances without applying a second unit scale', () => {
    assert.equal(formatAssetAmount(0.00000001, 8), '0.00000001');
    assert.equal(formatAssetAmount(12.3456, 2), '12.35');
});

test('identifies coinbase transactions and totals RVN outputs', () => {
    assert.equal(isCoinbaseTransaction({ vin: [{ coinbase: 'abcd' }] }), true);
    assert.equal(isCoinbaseTransaction({ vin: [{ txid: 'abcd' }] }), false);
    assert.equal(transactionOutputTotal({ vout: [{ value: 1.25 }, { value: 2.5 }, { value: 0 }] }), 3.75);
});

test('classifies only explicit asset operations', () => {
    assert.equal(classifyAssetOperation({ type: 'transfer_asset', reissuable: true }), 'Transfer');
    assert.equal(classifyAssetOperation({ type: 'reissue_asset' }), 'Reissue');
    assert.equal(classifyAssetOperation({ reissuable: true }), 'Asset output');
});

test('detects recent chain reorganizations without treating normal growth as a reorg', () => {
    const previous = { height: 100, hash: 'old-tip' };
    assert.equal(isChainReorganization(previous, { blocks: 100, bestblockhash: 'old-tip' }), false);
    assert.equal(isChainReorganization(previous, { blocks: 100, bestblockhash: 'replacement' }), true);
    assert.equal(isChainReorganization(previous, { blocks: 101, bestblockhash: 'new-tip' }, 'old-tip'), false);
    assert.equal(isChainReorganization(previous, { blocks: 101, bestblockhash: 'new-tip' }, 'replacement'), true);
    assert.equal(isChainReorganization(previous, { blocks: 99, bestblockhash: 'lower-tip' }), true);
});

test('paginates complete address history newest first without duplicates', () => {
    assert.deepEqual(paginateNewestTxids(['a', 'b', 'b', 'c'], 1, 2), {
        pageTxids: ['c', 'b'], hasMore: true, total: 3, allTxids: ['c', 'b', 'a']
    });
    assert.deepEqual(paginateNewestTxids(['a', 'b', 'b', 'c'], 2, 2).pageTxids, ['a']);
});

test('formats small holder percentages without displaying them as zero', () => {
    assert.equal(formatPercentage(0), '0.00%');
    assert.equal(formatPercentage(0.00000086), '<0.01%');
    assert.equal(formatPercentage(12.345), '12.35%');
});
