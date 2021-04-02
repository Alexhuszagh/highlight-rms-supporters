/**
 *  Fetch signer list from the RMS support letter.
 */

import { toHtml, extractSignerList } from './parse.js';

/**
 * Fetch HTML from the supporters URL.
 */
const getSupportersHtml = url =>
    fetch(url)
        .then(response => response.text());

/**
 * Fetch signers and generate the username mappings.
 */
export default async url => {
    let signers = await getSupportersHtml(url)
        .then(text => toHtml(text))
        .then(html => extractSignerList(html));

    // Create stylesheets from the signer lists.
    let github = new Set(signers.github);
    let gitlab = new Set(signers.gitlab);

    return {
        github,
        gitlab
    };
}
