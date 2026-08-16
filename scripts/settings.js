// settings.js - Settings Manager for KawTrace

// Default settings (used as fallback)
const DEFAULT_SETTINGS = {
    // RPC Configuration
    rpcPreset: "ting-mainnet",
    rpcUrl: "https://rvn-rpc-mainnet.ting.finance/rpc",
    maxConcurrentRequests: 4,
    
    // Cache Durations (in milliseconds)
    cacheDurations: {
        addressData: 60000,       // 1 minute
        blockCount: 15000,        // 15 seconds
        mempool: 15000,           // 15 seconds
        utxo: 60000,              // 1 minute
        txHistory: 60000,         // 1 minute
        assetData: 86400000,      // 24 hours
        indefinite: 31536000000   // ~1 year (for immutable data)
    },
    
    // UI Settings
    uiSettings: {
        theme: 'dark', // Changed to dark as default
        showAdvancedOptions: false,
    }
};

// Settings storage key
const SETTINGS_STORAGE_KEY = 'kawtrace_settings_v2';
const LEGACY_SETTINGS_STORAGE_KEY = 'kawtrace_settings_v1';
const RPC_PRESETS = {
    'ting-mainnet': 'https://rvn-rpc-mainnet.ting.finance/rpc',
    'ting-testnet': 'https://rvn-rpc-testnet.ting.finance/rpc',
    'same-origin': '/rpc',
    'custom': ''
};

// Initialize or get settings from storage
async function initSettings() {
    try {
        // Try to load settings from IndexedDB
        const storedSettings = await window.utilities.loadFromIndexedDB('misc', SETTINGS_STORAGE_KEY)
            || await loadLegacySettings();
        
        if (storedSettings && storedSettings.data) {
            // Found stored settings - merge with defaults to ensure all properties exist
            const migrated = mergeDeep(DEFAULT_SETTINGS, storedSettings.data);
            // Unsafe inherited defaults are not carried into the new version.
            if (migrated.maxConcurrentRequests === 50) migrated.maxConcurrentRequests = 4;
            await saveSettings(migrated);
            return migrated;
        }
    } catch (error) {
        console.warn('Failed to load settings from IndexedDB:', error);
    }
    
    // No stored settings found, use defaults and store them
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
}

function loadLegacySettings() {
    return new Promise((resolve) => {
        const request = indexedDB.open('BlockExplorerDB');
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('misc')) {
                db.close();
                resolve(null);
                return;
            }
            const transaction = db.transaction('misc', 'readonly');
            const getRequest = transaction.objectStore('misc').get(LEGACY_SETTINGS_STORAGE_KEY);
            getRequest.onsuccess = () => {
                db.close();
                resolve(getRequest.result || null);
            };
            getRequest.onerror = () => {
                db.close();
                resolve(null);
            };
        };
    });
}

// Save settings to storage
async function saveSettings(settings) {
    try {
        await window.utilities.saveToIndexedDB('misc', {
            id: SETTINGS_STORAGE_KEY,
            data: settings,
            timestamp: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Failed to save settings:', error);
        return false;
    }
}

// Update a single setting
async function updateSetting(path, value) {
    const settings = await getSettings();
    const pathParts = Array.isArray(path) ? path : path.split('.');
    let current = settings;
    
    // Navigate to the parent object of the property to update
    for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
    }
    
    // Update the value
    current[pathParts[pathParts.length - 1]] = value;
    
    // Save and return updated settings
    await saveSettings(settings);
    return settings;
}

// Get current settings
async function getSettings() {
    // Initialize settings if needed
    window.settings = window.settings || await initSettings();
    return window.settings;
}

// Reset settings to defaults
async function resetSettings() {
    await saveSettings(DEFAULT_SETTINGS);
    window.settings = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
}

// Deep merge utility for combining objects
function mergeDeep(target, source) {
    if (!source) return target;
    
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    
    return output;
}

// Utility to check if a value is an object
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/** When served beside a compatible Ravencoin RPC proxy, use same-origin /rpc. */
async function resolveProxyRpcUrl() {
    try {
        const pub = await fetch("/settings").then((r) => r.json());
        if (!pub.endpoint) {
            return "/rpc";
        }
        const configured = new URL(pub.endpoint, window.location.origin);
        if (configured.origin === window.location.origin) {
            return configured.pathname + configured.search;
        }
    } catch (e) {
        /* explorer not served by proxy */
    }
    return null;
}

// Initialize the settings UI
function initSettingsUI() {
    // Create the settings button in the header
    addSettingsButton();
    
    // Apply current settings to the app
    applySettings();
}

// Add settings button to the header
function addSettingsButton() {
    // Find the network status container in the header
    const networkStatus = document.querySelector('.network-status');
    
    if (networkStatus) {
        // Create settings button
        const settingsButton = document.createElement('span');
        settingsButton.id = 'settings-button';
        settingsButton.className = 'settings-icon';
        settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
        settingsButton.title = 'Settings';
        
        // Add click event to show settings popover
        settingsButton.addEventListener('click', toggleSettingsPopover);
        
        // Insert before the first child
        networkStatus.insertBefore(settingsButton, networkStatus.firstChild);
        
        // Create the popover container (hidden initially)
        if (!document.getElementById('settings-popover')) {
            const popover = document.createElement('div');
            popover.id = 'settings-popover';
            popover.className = 'settings-popover hidden';
            
            // Append to body for better positioning
            document.body.appendChild(popover);
            
            // Close popover when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('#settings-button') && 
                    !e.target.closest('#settings-popover')) {
                    hideSettingsPopover();
                }
            });
        }
    }
}

// Toggle settings popover
function toggleSettingsPopover(e) {
    e.stopPropagation();
    
    const popover = document.getElementById('settings-popover');
    if (popover.classList.contains('hidden')) {
        showSettingsPopover();
    } else {
        hideSettingsPopover();
    }
}

// Show settings popover
async function showSettingsPopover() {
    const popover = document.getElementById('settings-popover');
    const button = document.getElementById('settings-button');
    
    if (popover && button) {
        // Position popover below button
        const buttonRect = button.getBoundingClientRect();
        
        popover.style.top = `${buttonRect.bottom + 10}px`;
        popover.style.right = `${window.innerWidth - buttonRect.right}px`;
        
        // Load settings and generate form
        const settings = await getSettings();
        popover.innerHTML = generateSettingsForm(settings);
        
        // Add event listeners to form elements
        addSettingsFormListeners(popover);
        
        // Show popover
        popover.classList.remove('hidden');
        
        // Highlight button
        button.classList.add('active');
    }
}

// Hide settings popover
function hideSettingsPopover() {
    const popover = document.getElementById('settings-popover');
    const button = document.getElementById('settings-button');
    
    if (popover) {
        popover.classList.add('hidden');
    }
    
    if (button) {
        button.classList.remove('active');
    }
}

// Generate settings form HTML
function generateSettingsForm(settings) {
    return `
        <div class="settings-header">
            <h3>Explorer Settings</h3>
            <button class="settings-close" title="Close">&times;</button>
        </div>
        <div class="settings-content">
            <div class="settings-section">
                <h4>RPC Configuration</h4>
                <div class="setting-group">
                    <label for="rpc-preset">Endpoint preset:</label>
                    <select id="rpc-preset">
                        <option value="ting-mainnet" ${settings.rpcPreset === 'ting-mainnet' ? 'selected' : ''}>Ting Mainnet (public)</option>
                        <option value="ting-testnet" ${settings.rpcPreset === 'ting-testnet' ? 'selected' : ''}>Ting Testnet (public)</option>
                        <option value="same-origin" ${settings.rpcPreset === 'same-origin' ? 'selected' : ''}>Same-origin /rpc</option>
                        <option value="custom" ${settings.rpcPreset === 'custom' ? 'selected' : ''}>Custom proxy</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label for="rpc-url">RPC URL:</label>
                    <input type="text" id="rpc-url" value="${settings.rpcUrl}">
                </div>
                <p class="settings-warning">Public endpoints can observe queries and may be rate-limited or unavailable. Never enter node credentials or expose Ravencoin Core RPC directly.</p>
                <button type="button" id="settings-test-rpc">Test Connection</button>
                <div id="settings-test-result" role="status" aria-live="polite"></div>
                <div class="setting-group">
                    <label for="max-concurrent">Max Concurrent Requests:</label>
                    <input type="number" id="max-concurrent" value="${settings.maxConcurrentRequests}" min="1" max="100">
                </div>
            </div>
            
            <div class="settings-section">
                <h4>Cache Duration</h4>
                <div class="setting-group">
                    <label for="cache-address">Address Data (ms):</label>
                    <input type="number" id="cache-address" value="${settings.cacheDurations.addressData}" min="0">
                </div>
                <div class="setting-group">
                    <label for="cache-block">Block Count (ms):</label>
                    <input type="number" id="cache-block" value="${settings.cacheDurations.blockCount}" min="0">
                </div>
                <div class="setting-group">
                    <label for="cache-mempool">Mempool (ms):</label>
                    <input type="number" id="cache-mempool" value="${settings.cacheDurations.mempool}" min="0">
                </div>
                <div class="setting-group">
                    <label for="cache-utxo">UTXO (ms):</label>
                    <input type="number" id="cache-utxo" value="${settings.cacheDurations.utxo}" min="0">
                </div>
                <div class="setting-group">
                    <label for="cache-txhistory">TX History (ms):</label>
                    <input type="number" id="cache-txhistory" value="${settings.cacheDurations.txHistory}" min="0">
                </div>
                <div class="setting-group">
                    <label for="cache-asset">Asset Data (ms):</label>
                    <input type="number" id="cache-asset" value="${settings.cacheDurations.assetData}" min="0">
                </div>
            </div>
            
            <div class="settings-section">
                <h4>Display Settings</h4>
                <div class="setting-group">
                    <label for="theme-select">Theme:</label>
                    <select id="theme-select">
                        <option value="light" ${settings.uiSettings.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${settings.uiSettings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="settings-footer">
            <button id="settings-reset" class="settings-reset">Reset to Defaults</button>
            <button id="settings-save" class="settings-save">Save Changes</button>
            <button id="settings-clear-cache" class="settings-clear-cache">Clear Cache</button>
        </div>
    `;
}

// Add event listeners to the settings form
function addSettingsFormListeners(popover) {
    const presetSelect = popover.querySelector('#rpc-preset');
    const rpcInput = popover.querySelector('#rpc-url');
    if (presetSelect && rpcInput) {
        presetSelect.addEventListener('change', () => {
            const presetUrl = RPC_PRESETS[presetSelect.value];
            if (presetUrl) rpcInput.value = presetUrl;
            rpcInput.readOnly = presetSelect.value !== 'custom';
        });
        rpcInput.readOnly = presetSelect.value !== 'custom';
    }

    const testButton = popover.querySelector('#settings-test-rpc');
    if (testButton) {
        testButton.addEventListener('click', async () => {
            const result = popover.querySelector('#settings-test-result');
            result.textContent = 'Testing...';
            try {
                const chain = await testRpcEndpoint(rpcInput.value.trim());
                result.textContent = `Connected to ${chain.chain || 'unknown chain'} at block ${Number(chain.blocks).toLocaleString()}.`;
            } catch (error) {
                result.textContent = `Connection failed: ${error.message}`;
            }
        });
    }

    // Close button
    const closeBtn = popover.querySelector('.settings-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideSettingsPopover);
    }
    
    // Save button
    const saveBtn = popover.querySelector('#settings-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            await saveSettingsFromForm();
            hideSettingsPopover();
            // Show success notification
            window.ui.showNotification('Settings Saved', 'Your settings have been saved successfully.', 'success');
            // Apply the new settings
            const rpcChanged = await applySettings();
            if (rpcChanged) window.location.reload();
        });
    }
    
    // Reset button
    const resetBtn = popover.querySelector('#settings-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                await resetSettings();
                hideSettingsPopover();
                window.ui.showNotification('Settings Reset', 'Settings have been reset to defaults.', 'info');
                // Apply the default settings
                applySettings();
                // Reload page to ensure all defaults are applied
                setTimeout(() => window.location.reload(), 1000);
            }
        });
    }
    
    // Clear cache button
    const clearCacheBtn = popover.querySelector('#settings-clear-cache');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all cached data?')) {
                const success = await window.utilities.clearAllCaches();
                hideSettingsPopover();
                
                if (success) {
                    window.ui.showNotification('Cache Cleared', 'All cached data has been cleared.', 'success');
                    // Reload after a short delay
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    window.ui.showNotification('Error', 'Failed to clear cache.', 'error');
                }
            }
        });
    }
}

// Save settings from form inputs
async function saveSettingsFromForm() {
    const settings = await getSettings();
    
    // RPC Configuration
    settings.rpcPreset = document.getElementById('rpc-preset').value;
    settings.rpcUrl = document.getElementById('rpc-url').value.trim();
    settings.maxConcurrentRequests = parseInt(document.getElementById('max-concurrent').value);
    
    // Cache Durations
    settings.cacheDurations.addressData = parseInt(document.getElementById('cache-address').value);
    settings.cacheDurations.blockCount = parseInt(document.getElementById('cache-block').value);
    settings.cacheDurations.mempool = parseInt(document.getElementById('cache-mempool').value);
    settings.cacheDurations.utxo = parseInt(document.getElementById('cache-utxo').value);
    settings.cacheDurations.txHistory = parseInt(document.getElementById('cache-txhistory').value);
    settings.cacheDurations.assetData = parseInt(document.getElementById('cache-asset').value);
    
    // UI Settings
    settings.uiSettings.theme = document.getElementById('theme-select').value;
    
    // Save to storage
    await saveSettings(settings);
    
    // Update global settings
    window.settings = settings;
    
    return settings;
}

async function testRpcEndpoint(url) {
    if (!url) throw new Error('RPC URL is required');
    const parsed = new URL(url, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS endpoints are supported');
    const response = await fetch(parsed.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '1.0', id: 'kawtrace-test', method: 'getblockchaininfo', params: [] })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.message || 'RPC error');
    return payload.result;
}

// Apply settings to the application
async function applySettings() {
    const settings = await getSettings();
    let rpcChanged = false;
    
    // Apply RPC URL to utility functions
    if (window.utilities && typeof window.utilities.setRpcUrl === 'function') {
        rpcChanged = await window.utilities.setRpcUrl(settings.rpcUrl);
        // Changing networks clears endpoint-specific cached blockchain data,
        // including the settings record. Restore the selection after clearing.
        if (rpcChanged) await saveSettings(settings);
    }
    
    // Apply max concurrent requests
    if (window.utilities && typeof window.utilities.setMaxConcurrentRequests === 'function') {
        window.utilities.setMaxConcurrentRequests(settings.maxConcurrentRequests);
    }
    
    // Apply cache durations
    if (window.utilities && typeof window.utilities.setCacheDurations === 'function') {
        window.utilities.setCacheDurations(settings.cacheDurations);
    }
    
    // Apply theme
    applyTheme(settings.uiSettings.theme);
    
    console.log("Settings applied:", settings);
    return rpcChanged;
}

// Apply theme
function applyTheme(theme) {
    // Add or update theme class on body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    
    // For dark theme, also add a marker for CSS variables
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for utilities to be available
    if (!window.utilities || !window.utilities.loadFromIndexedDB) {
        console.error('Utilities module not available - settings cannot be initialized');
        return;
    }
    
    // Initialize settings
    window.settings = await initSettings();

    const proxyRpc = await resolveProxyRpcUrl();
    if (proxyRpc) {
        window.settings.rpcUrl = proxyRpc;
        await saveSettings(window.settings);
    }
    
    // Initialize UI
    initSettingsUI();
    
    console.log('Settings module initialized');
});

// Export settings functions
window.settingsManager = {
    getSettings,
    updateSetting,
    resetSettings,
    applySettings,
    toggleSettingsPopover
};
