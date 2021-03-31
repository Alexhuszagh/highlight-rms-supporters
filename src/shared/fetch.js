/**
 *  Fetch signer list from the RMS support letter.
 */

import { toHtml, extractSignerList } from './parse.js';
import style from './style.js';

const URL = 'https://rms-support-letter.github.io/';

/**
 * Fetch HTML from the supporters URL.
 */
const getSupportersHtml = () =>
    fetch(URL)
        .then(response => response.text());

/**
 * Fetch signers and generate the stylesheets.
 */
export default async () => {
    let signers = await getSupportersHtml()
        .then(text => toHtml(text))
        .then(html => extractSignerList(html));

    // Create stylesheets from the signer lists.
    let github = style.generate(signers.github);
    let gitlab = style.generate(signers.gitlab);

    return {
        github,
        gitlab
    };
}
