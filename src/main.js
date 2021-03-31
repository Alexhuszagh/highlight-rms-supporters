/**
 *  Script to add the CSS styles to github usernames.
 */

// PARSE

// Regex matching github usernames. Limit to alnum to avoid any injection.
// Valid usernames are alphanumeric with internal, non-consecutive hyphens.
const GITHUB_USER_RE = /^https?\:\/\/github\.com\/([A-Za-z0-9-]*)\/?$/

// Regex matching gitlab usernames. Limit to alnum to avoid any injection.
// Valid usernames are alphanumeric with internal, non-consecutive hyphens.
const GITLAB_USER_RE = /^https?\:\/\/gitlab\.com\/([A-Za-z0-9-]*)\/?$/

// Regex matching github domain names.
const GITHUB_DOMAIN_RE = /^(?:(?:github\.com)|(?:.*\.github\.io))$/

// Regex matching gitlab domain names.
const GITLAB_DOMAIN_RE = /^(?:(?:gitlab\.com)|(?:.*\.gitlab\.io))$/

/**
 *  Parse HTML response to HTML DOM.
 */
const toHtml = text => {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
}

/**
 *  Extract the signers list from the HTML
 */
const extractSignerList = html => {
    const list = html.getElementsByTagName('ol')[0];
    const items = list.getElementsByTagName("li");
    const itemsLength = items.length;
    const signers = {
        github: [],
        gitlab: []
    };
    for (let i = 0; i < itemsLength; i++) {
        let item = items[i];
        let url = item.getElementsByTagName('a')[0].href;

        // Match github/gitlab.
        let github = url.match(GITHUB_USER_RE);
        let gitlab = url.match(GITLAB_USER_RE);

        // Add to signers.
        if (github !== null) {
            signers.github.push(github[1]);
        } else if (gitlab !== null) {
            signers.gitlab.push(gitlab[1]);
        }
    }

    return signers;
}

// FETCH
const URL = 'https://rms-support-letter.github.io/';

/**
 *  Fetch HTML from the supporters URL.
 */
const getSupportersHtml = () =>
    fetch(URL)
        .then(response => response.text())

// STORAGE

/**
 *  Set the list of signers and updated timestamp.
 */
const setSigners = async (date, signers) => {
    browser.storage.local.set({
        updated: date.toUTCString(),
        signers
    });
}

/**
 *  Get the updated timestamp.
 */
const getUpdated = async () => {
    let value = await browser.storage.local.get('updated');
    if (value.updated !== undefined) {
        return new Date(value.updated);
    }
    return undefined;
}

/**
 *  Get the refresh time.
 */
const getRefresh = async () => {
    let value = await browser.storage.local.get('refresh');
    if (value.refresh !== undefined) {
        return parseInt(value.refresh);
    }
    // Default to 1 day if not set.
    return 86400000;
}

/**
 *  Get the RMS supporters signers.
 */
const getSigners = async () => {
    let value = await browser.storage.local.get('signers');
    if (value.signers !== undefined) {
        return value.signers;
    }
    return undefined;
}

/**
 *  Check if we need to update the local storage.
 */
const isStorageValid = async currentDate => {
    let previousDate = await getUpdated();

    // No previous list of signers set.
    if (previousDate === undefined) {
        return false;
    }

    // Check if the period is greater than our update limit.
    let time = currentDate - previousDate;
    let refreshTime = await getRefresh();
    return time < refreshTime;
}

// CSS

/**
 *  Generate the CSS style from names.
 */
const generateCss = usernames => {
    const highlight = '{ background-color: Orange; }';
    const selector = usernames
        .map(item => `a[href$="/${item}" I]`)
        .join(', ');
    return `${selector}\n${highlight}`;
}

// MAIN

/**
 *  Entry point.
 */
const main = async () => {
    // Get the signers and update the signer list if required.
    let currentDate = new Date();
    let isValid = await isStorageValid(currentDate);
    if (isValid) {
        var signers = await getSigners();
    } else {
        // Fetch and parse our signers list.
        var signers = await getSupportersHtml()
            .then(text => toHtml(text))
            .then(html => extractSignerList(html));

        await setSigners(currentDate, signers);
    }

    // Apply the CSS styles for the current page.
    const style = document.createElement('style');
    const domain = window.location.hostname;
    if (GITHUB_DOMAIN_RE.test(domain)) {
        // Add github styles.
        style.innerHTML = generateCss(signers.github);
    } else if (GITLAB_DOMAIN_RE.test(domain)) {
        // Add gitlab styles.
        style.innerHTML = generateCss(signers.gitlab);
    }
    document.head.appendChild(style);
}

main();
