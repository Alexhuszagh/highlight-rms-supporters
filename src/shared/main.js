/**
 *  Fetch signer list from the RMS support letter.
 */

import fetchUsernames from './fetch.js';
import requiresRefresh from './refresh.js';
import highlight from './highlight.js';

/**
 * Shared entry point based on a generic store.
 */
export default async store => {
    let currentDate = new Date();
    let previousDate = await store.getUpdated();
    let refreshTime = await store.getRefresh();
    let refresh = requiresRefresh(currentDate, previousDate, refreshTime);
    var usernames;
    if (refresh) {
        usernames = await fetchUsernames();
        let { github, gitlab } = usernames;
        await store.setUsernames(currentDate, github, gitlab);
    } else {
        usernames = await store.getUsernames();
    }

    // Apply the CSS styles for relevant links.
    highlight(usernames);
}
