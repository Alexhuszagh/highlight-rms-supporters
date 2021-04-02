/**
 * Highlight list of usernames.
 */

// Regex matching github domain names.
const GITHUB_DOMAIN_RE = /^(?:(?:github\.com)|(?:.*\.github\.io))$/

// Regex matching gitlab domain names.
const GITLAB_DOMAIN_RE = /^(?:(?:gitlab\.com)|(?:.*\.gitlab\.io))$/

/**
 * Add style to the element.
 */
const stylize = (element, color) => {
    element.style.backgroundColor = color;
}

/**
 * Detect if a URL corresponds to a give author.
 *
 * In order to avoid spam, we only highlight if:
 *    1). The link only has the user (github.com/user).
 *    2). The link refers to a commit with the user
 *        (github.com/user/repo/commits&author=user).
 */
const extractUsername = url => {
    // Check if the username exists in the set, and highlight it if it is.
    var username;
    if (url.search.length === 0) {
        // No search terms, remove the leading slash, and trailing slash if applicable.
        username = url.pathname.slice(1);
        if (username.slice(-1) === '/') {
            username = username.slice(0, 1);
        }
    } else if (url.pathname.endsWith('commits')) {
        // Has commits, check the author field.
        username = url.searchParams.get('author');
    }

    return username;
}

/**
 * Highlight anchor tags with hrefs.
 */
const highlightLinks = (usernames, domain, color) => {
    let links = document.getElementsByTagName('a');
    let absolute = `https://${domain}`
    for (const link of links) {
        // URL can be relative or absolute or invalid.
        try {
            // Parse the URL, get the username from the url.
            let url = new URL(link.href, absolute);
            let username = extractUsername(url);

            // Check if the username exists in the set, and highlight it if it is.
            if (usernames.has(username)) {
                stylize(link, color);
            }
        } catch(error) {
            // Ignore.
        }
    }
}

/**
 * Highlight user ID on the Github profile.
 */
const highlightGithubProfile = (usernames, color) => {
    let elements = document.getElementsByClassName('vcard-username');
    if (elements.length === 1) {
        // On a Github profile, check the username(s).
        const element = elements[0];
        if (usernames.has(element.innerText)) {
            stylize(element, color);
        }
    }
}

/**
 * Highlight user ID on the Gitlab profile.
 */
const highlightGitlabProfile = (usernames, color) => {
    let elements = document.getElementsByClassName('user-info');
    if (elements.length === 1) {
        // On a Gitlab profile, check the username(s).
        const element = elements[0].getElementsByClassName('middle-dot-divider')[0];
        let match = element.innerText.match(/^@([A-Za-z0-9-]*)\s*$/);
        if (match !== null && usernames.has(match[1])) {
            stylize(element, color);
        }
    }
}

/**
 * Generalized highlight function.
 */
const highlight = (usernames, domain, isGithub, isGitlab, color) => {
    if (isGithub) {
        highlightLinks(usernames.github, domain, color);
        highlightGithubProfile(usernames.github, color);
    } else if (isGitlab) {
        highlightLinks(usernames.gitlab, domain, color);
        highlightGitlabProfile(usernames.gitlab, color);
    }
}

/**
 * Detect website to provide correct list of usernames.
 */
export default (usernames, color) => {
    const domain = window.location.hostname;
    const isGithub = GITHUB_DOMAIN_RE.test(domain);
    const isGitlab = GITLAB_DOMAIN_RE.test(domain);
    highlight(usernames, domain, isGithub, isGitlab, color);
}
