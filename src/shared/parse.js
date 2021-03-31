/**
 * Parse and extract RMS supporter signers from HTML.
 */

// Regex matching github usernames. Limit to alnum to avoid any injection.
// Valid usernames are alphanumeric with internal, non-consecutive hyphens.
const GITHUB_USER_RE = /^https?\:\/\/github\.com\/([A-Za-z0-9-]*)\/?$/

// Regex matching gitlab usernames. Limit to alnum to avoid any injection.
// Valid usernames are alphanumeric with internal, non-consecutive hyphens.
const GITLAB_USER_RE = /^https?\:\/\/gitlab\.com\/([A-Za-z0-9-]*)\/?$/

/**
 * Parse HTML response to HTML DOM.
 */
export const toHtml = text => {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
}

/**
 * Extract the signers list from the HTML
 */
export const extractSignerList = html => {
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
