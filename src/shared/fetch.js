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

    // Create a set of usernames from the signer lists.
    let github = new Set(signers.github.map(x => x.toLowerCase()));
    let gitlab = new Set(signers.gitlab.map(x => x.toLowerCase()));

    return {
        github,
        gitlab
    };
}
