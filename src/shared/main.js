/**
 *  Fetch signer list from the RMS support letter.
 */

import fetchUsernames from './fetch.js';
import requiresRefresh from './refresh.js';
import highlight from './highlight.js';

// Current URL at pageload.
var CURRENT_URL = document.location.href;
// Usernames loaded from the store.
var USERNAMES;
// Background color loaded from the store.
var BACKGROUND_COLOR;
// Timeout before applying the styles.
var TIMEOUT;
// URL to fetch the signer list from.
var URL;

// HELPERS

/**
 * Check if we can highlight (if usernames has been loaded).
 */
const checkHighlight = async dom => {
    // Wait for a short period, then highlight the usernames.
    if (typeof USERNAMES !== 'undefined') {
        highlight(dom, USERNAMES, BACKGROUND_COLOR);
    }
}

/**
 * Load the usernames from store or file.
 */
const loadUsernames = async store => {
    let currentDate = new Date();
    let previousDate = await store.getUpdated();
    let refreshTime = await store.getRefresh();
    let refresh = requiresRefresh(currentDate, previousDate, refreshTime);
    if (refresh) {
        USERNAMES = await fetchUsernames(URL);
        let { github, gitlab } = USERNAMES;
        await store.setUsernames(currentDate, github, gitlab);
    } else {
        USERNAMES = await store.getUsernames();
    }
}

// EVENTS

/**
 * Track added nodes to the DOM and re-highlight the changes.
 */
window.onload = () => {
    const body = document.querySelector('body');
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            for (const node of mutation.addedNodes) {
                // We have an added node we can traverse.
                if (typeof node.getElementsByClassName !== 'undefined') {
                    checkHighlight(node);
                }
            }
        });
    });

    observer.observe(body, { childList: true, subtree: true });
};

// ENTRY POINT

/**
 * Shared entry point based on a generic store.
 */
export default async store => {
    BACKGROUND_COLOR = await store.getBackgroundColor();
    TIMEOUT = await store.getTimeout();
    URL = await store.getUrl();
    await loadUsernames(store);

    checkHighlight(document);
}
