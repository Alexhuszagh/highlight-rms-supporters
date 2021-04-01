/**
 * Highlight list of usernames.
 */

// Regex matching github domain names.
const GITHUB_DOMAIN_RE = /^(?:(?:github\.com)|(?:.*\.github\.io))$/

// Regex matching gitlab domain names.
const GITLAB_DOMAIN_RE = /^(?:(?:gitlab\.com)|(?:.*\.gitlab\.io))$/

// Background color for the styles.
const COLOR = 'Orange';

/**
 * Iterative traverse the DOM to highlight the usernames.
 */
const highlight => usernames => {
    // TODO(ahuszagh) Implement...
    // Should do href and maybe a few more...
}

/**
 * Detect website to provide correct list of usernames.
 */
export default usernames => {
    const domain = window.location.hostname;
    if (GITHUB_DOMAIN_RE.test(domain)) {
        highlight(usernames.github);
    } else if (GITLAB_DOMAIN_RE.test(domain)) {
        highlight(usernames.gitlab);
    }
}
