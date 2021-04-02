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
// Default timeout.
var TIMEOUT;

// HELPERS

/**
 * Asynchronous timeout function.
 */
const timeout = milliseconds =>
    new Promise(resolve => setTimeout(resolve, milliseconds));

/**
 * Highlight after timeout.
 */
const timeoutHighlight = async () => {
    // Wait for a short period, then highlight the usernames.
    if (typeof USERNAMES !== 'undefined') {
        await timeout(TIMEOUT);
        highlight(USERNAMES, BACKGROUND_COLOR);
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
        USERNAMES = await fetchUsernames();
        let { github, gitlab } = USERNAMES;
        await store.setUsernames(currentDate, github, gitlab);
    } else {
        USERNAMES = await store.getUsernames();
    }
}

// EVENTS

/**
 * Track URL changes and re-highlight on changes.
 */
window.onload = () => {
    const body = document.querySelector('body');
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (CURRENT_URL !== document.location.href) {
                // Track URL changes and re-highlight.
                CURRENT_URL = document.location.href;
                timeoutHighlight();
            }
        });
    });

    observer.observe(body, { childList: true, subtree: true });
};

/**
 * Highlight when the document's ready state is complete.
 */
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        timeoutHighlight();
    }
}

// ENTRY POINT

/**
 * Shared entry point based on a generic store.
 */
export default async store => {
    TIMEOUT = await store.getTimeout();
    BACKGROUND_COLOR = await store.getBackgroundColor();
    await loadUsernames(store);

    if (document.readyState == 'complete') {
        timeoutHighlight();
    }
}
