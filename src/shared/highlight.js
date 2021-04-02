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
 * Parse github issues, which have the format:
 *    /repo/issues?q=is:issue+is:open+author:user
 *
 *    This might overwrite values for is, but we just want
 *    the author, which is always a single value.
 */
const parseIssues = str => {
    const obj = {};
    if (str.length === 0) {
        return obj;
    }

    const queries = str.split(' ');
    for (const query of queries) {
        let [key, value] = query.split(':');
        obj[key] = value;
    }
    return obj;
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
    } else if (url.pathname.endsWith('issues')) {
        // Have a Github issue.
        const issues = parseIssues(url.searchParams.get('q') || '');
        if (typeof issues['author'] !== 'undefined') {
            username = issues['author'];
        }
    }

    return username;
}

/**
 * Highlight anchor tags with hrefs.
 */
const highlightLinks = (dom, usernames, domain, color) => {
    let links = dom.getElementsByTagName('a');
    let absolute = `https://${domain}`
    for (const link of links) {
        // URL can be relative or absolute or invalid.
        try {
            // Parse the URL, get the username from the url.
            let url = new URL(link.href, absolute);
            let username = extractUsername(url);

            // Check if the username exists in the set, and highlight it if it is.
            if (usernames.has(username.toLowerCase())) {
                // Stylize the parent if we have Github contributors
                // icons.This is because the link is on the icon,
                // which means the color is entirely ignored.
                let parent = link.parentElement;
                if (parent.className === 'mb-2 mr-2') {
                    stylize(parent, color);
                } else {
                    // Not a github contributors icon, stylize the link.
                    stylize(link, color);
                }
            }
        } catch(error) {
            // Ignore.
        }
    }
}

/**
 * Highlight user ID on the Github profile.
 */
const highlightGithubProfile = (dom, usernames, color) => {
    try {
        let elements = dom.getElementsByClassName('vcard-username');
        if (elements.length === 1) {
            // On a Github profile, check the username(s).
            const element = elements[0];
            if (usernames.has(element.innerText.toLowerCase())) {
                stylize(element, color);
            }
        }
    } catch(error) {
        // The UI changed: log it to the console.
        console.error(error);
    }
}

/**
 * Highlight user ID on the Gitlab profile.
 */
const highlightGitlabProfile = (dom, usernames, color) => {
    try {
        let elements = dom.getElementsByClassName('user-info');
        if (elements.length === 1) {
            // On a Gitlab profile, check the username(s).
            const element = elements[0].getElementsByClassName('middle-dot-divider')[0];
            let match = element.innerText.match(/^@([A-Za-z0-9-]*)\s*$/);
            if (match !== null && usernames.has(match[1].toLowerCase())) {
                stylize(element, color);
            }
        }
    } catch(error) {
        // The UI changed: log it to the console.
        console.error(error);
    }
}

/**
 * Detect website to provide correct list of usernames.
 */
export default (dom, usernames, color) => {
    const domain = window.location.hostname;
    if (GITHUB_DOMAIN_RE.test(domain)) {
        highlightLinks(dom, usernames.github, domain, color);
        highlightGithubProfile(dom, usernames.github, color);
    } else if (GITLAB_DOMAIN_RE.test(domain)) {
        highlightLinks(dom, usernames.gitlab, domain, color);
        highlightGitlabProfile(dom, usernames.gitlab, color);
    }
}
