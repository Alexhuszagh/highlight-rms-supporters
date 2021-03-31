/**
 * Generate CSS styles from a list of usernames.
 */

// Regex matching github domain names.
const GITHUB_DOMAIN_RE = /^(?:(?:github\.com)|(?:.*\.github\.io))$/

// Regex matching gitlab domain names.
const GITLAB_DOMAIN_RE = /^(?:(?:gitlab\.com)|(?:.*\.gitlab\.io))$/

/**
 * Generate the CSS style from names.
 */
const generate = usernames => {
    const highlight = '{ background-color: Orange; }';
    const selector = usernames
        .map(item => `a[href$="/${item}" I]`)
        .join(', ');
    return `${selector}\n${highlight}`;
}

/**
 * Apply a stylesheet to the current URL.
 */
const apply = stylesheets => {
    const style = document.createElement('style');
    const domain = window.location.hostname;
    if (GITHUB_DOMAIN_RE.test(domain)) {
        style.innerHTML = stylesheets.github;
    } else if (GITLAB_DOMAIN_RE.test(domain)) {
        style.innerHTML = stylesheets.gitlab;
    }
    document.head.appendChild(style);
}

export default {
  generate,
  apply
};
