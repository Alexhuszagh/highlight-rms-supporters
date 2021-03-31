/**
 * Normalize the GM api.
 */

// Detect if using GreaseMonkey or TamperMonkey
const HAS_GM = typeof GM !== 'undefined';

// Define our API.
const GM_API = {
    config: GM_config
};

// Add our keys to the GM API.
if (HAS_GM) {
    GM_API.getValue = GM.getValue;
    GM_API.registerMenuCommand = GM.registerMenuCommand;
    GM_API.setValue = GM.setValue;
} else {
    GM_API.getValue = GM_getValue;
    GM_API.registerMenuCommand = GM_registerMenuCommand;
    GM_API.setValue = GM_setValue;
}

export default GM_API;
