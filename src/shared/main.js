/**
 *  Fetch signer list from the RMS support letter.
 */

import fetchAndGenerateStyleSheets from './fetch.js';
import requiresRefresh from './refresh.js';
import style from './style.js';

/**
 * Shared entry point based on a generic store.
 */
export default async store => {
    let currentDate = new Date();
    let previousDate = await store.getUpdated();
    let refreshTime = await store.getRefresh();
    let refresh = requiresRefresh(currentDate, previousDate, refreshTime);
    var stylesheets;
    if (refresh) {
        stylesheets = await fetchAndGenerateStyleSheets();
        let { github, gitlab } = stylesheets;
        await store.setStyleSheets(currentDate, github, gitlab);
    } else {
        stylesheets = await store.getStyleSheets();
    }

    // Apply the CSS styles for the current page.
    style.apply(stylesheets);
}
