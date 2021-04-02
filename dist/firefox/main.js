(function () {
    'use strict';

    /**
     * Access local browser extension storage.
     */

    /**
     * Set value in storage.
     */
    const set = async obj => {
        browser.storage.local.set(obj);
    };

    /**
     * Get value(s) in storage.
     */
    const get = async key => {
        return await browser.storage.local.get(key);
    };

    var storage = {
        set,
        get
    };

    /**
     * Parse and extract RMS supporter signers from HTML.
     */

    // Regex matching github usernames. Limit to alnum to avoid any injection.
    // Valid usernames are alphanumeric with internal, non-consecutive hyphens.
    const GITHUB_USER_RE = /^https?\:\/\/github\.com\/([A-Za-z0-9-]*)\/?$/;

    // Regex matching gitlab usernames. Limit to alnum to avoid any injection.
    // Valid usernames are alphanumeric with internal, non-consecutive hyphens.
    const GITLAB_USER_RE = /^https?\:\/\/gitlab\.com\/([A-Za-z0-9-]*)\/?$/;

    /**
     * Parse HTML response to HTML DOM.
     */
    const toHtml = text => {
        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/html');
    };

    /**
     * Extract the signers list from the HTML
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
    };

    /**
     *  Fetch signer list from the RMS support letter.
     */

    const URL$1 = 'https://rms-support-letter.github.io/';

    /**
     * Fetch HTML from the supporters URL.
     */
    const getSupportersHtml = () =>
        fetch(URL$1)
            .then(response => response.text());

    /**
     * Fetch signers and generate the username mappings.
     */
    var fetchUsernames = async () => {
        let signers = await getSupportersHtml()
            .then(text => toHtml(text))
            .then(html => extractSignerList(html));

        // Create stylesheets from the signer lists.
        let github = new Set(signers.github);
        let gitlab = new Set(signers.gitlab);

        return {
            github,
            gitlab
        };
    };

    /**
     *  Determine if we need to refresh user data.
     */

    /**
     * Determine if the stylesheets require a refresh.
     */
    var requiresRefresh = (currentDate, previousDate, refreshTime) => {
        // No previous `updated` time, no stylesheets set.
        if (typeof previousDate === 'undefined') {
            return true;
        }

        // Check if the period between dates is greater than our refresh time limit.
        let time = currentDate - previousDate;
        return time > refreshTime;
    };

    /**
     * Highlight list of usernames.
     */

    // Regex matching github domain names.
    const GITHUB_DOMAIN_RE = /^(?:(?:github\.com)|(?:.*\.github\.io))$/;

    // Regex matching gitlab domain names.
    const GITLAB_DOMAIN_RE = /^(?:(?:gitlab\.com)|(?:.*\.gitlab\.io))$/;

    /**
     * Add style to the element.
     */
    const stylize = (element, color) => {
        element.style.backgroundColor = color;
    };

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
    };

    /**
     * Highlight anchor tags with hrefs.
     */
    const highlightLinks = (usernames, domain, color) => {
        let links = document.getElementsByTagName('a');
        let absolute = `https://${domain}`;
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
    };

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
    };

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
    };

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
    };

    /**
     * Detect website to provide correct list of usernames.
     */
    var highlight$1 = (usernames, color) => {
        const domain = window.location.hostname;
        const isGithub = GITHUB_DOMAIN_RE.test(domain);
        const isGitlab = GITLAB_DOMAIN_RE.test(domain);
        highlight(usernames, domain, isGithub, isGitlab, color);
    };

    /**
     *  Fetch signer list from the RMS support letter.
     */

    // Current URL at pageload.
    var CURRENT_URL = document.location.href;
    // Usernames loaded from the store.
    var USERNAMES;
    // Background color loaded from the store.
    var BACKGROUND_COLOR;
    // Default timeout.
    var TIMEOUT;

    // HELPERS

    /**
     * Asynchronous timeout function.
     */
    const timeout = milliseconds =>
        new Promise(resolve => setTimeout(resolve, milliseconds));

    /**
     * Highlight after timeout.
     */
    const timeoutHighlight = async () => {
        // Wait for a short period, then highlight the usernames.
        if (typeof USERNAMES !== 'undefined') {
            await timeout(TIMEOUT);
            highlight$1(USERNAMES, BACKGROUND_COLOR);
        }
    };

    /**
     * Load the usernames from store or file.
     */
    const loadUsernames = async store => {
        let currentDate = new Date();
        let previousDate = await store.getUpdated();
        let refreshTime = await store.getRefresh();
        let refresh = requiresRefresh(currentDate, previousDate, refreshTime);
        if (refresh) {
            USERNAMES = await fetchUsernames();
            let { github, gitlab } = USERNAMES;
            await store.setUsernames(currentDate, github, gitlab);
        } else {
            USERNAMES = await store.getUsernames();
        }
    };

    // EVENTS

    /**
     * Track URL changes and re-highlight on changes.
     */
    window.onload = () => {
        const body = document.querySelector('body');
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (CURRENT_URL !== document.location.href) {
                    // Track URL changes and re-highlight.
                    CURRENT_URL = document.location.href;
                    timeoutHighlight();
                }
            });
        });

        observer.observe(body, { childList: true, subtree: true });
    };

    /**
     * Highlight when the document's ready state is complete.
     */
    document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
            timeoutHighlight();
        }
    };

    // ENTRY POINT

    /**
     * Shared entry point based on a generic store.
     */
    var main = async store => {
        TIMEOUT = await store.getTimeout();
        BACKGROUND_COLOR = await store.getBackgroundColor();
        await loadUsernames(store);

        if (document.readyState == 'complete') {
            timeoutHighlight();
        }
    };

    /**
     * Enumerated use options and defaults.
     */

    const REFRESH_LABELS = {
      '10 minutes': '600000',
      '1 hour': '3600000',
      '1 day': '86400000',
      'Never': '9007199254740991'
    };

    const REFRESH_VALUES = {
      '600000': '10 minutes',
      '3600000': '1 hour',
      '86400000': '1 day',
      '9007199254740991': 'Never'
    };

    const REFRESH = {
      'default': '86400000',
      labels: REFRESH_LABELS,
      values: REFRESH_VALUES
    };

    /**
     *  Get and set application-specific values using generic storage primitives.
     */

    /**
     *  Deserialize usernames from JSON.
     */
    const deserializeUsernames = json =>
        new Set(JSON.parse(json));

    /**
     *  Serialize usernames to JSON.
     */
    const serializeUsernames = usernames =>
        JSON.stringify(Array.from(usernames));

    /**
     * Create the store from an abstract storage.
     */
    var createStore = storage => {
        /**
         * Get the refresh time.
         */
        async function getRefresh() {
            let value = await storage.get('refresh');
            if (typeof value.refresh !== 'undefined') {
                return parseInt(value.refresh);
            }
            // Default to 1 day if not set.
            return parseInt(REFRESH['default']);
        }

        /**
         * Get the background color.
         */
        async function getBackgroundColor() {
            let value = await storage.get('backgroundColor');
            if (typeof value.backgroundColor !== 'undefined') {
                return value.backgroundColor;
            }
            // Default to 'orange' if not set.
            return 'orange';
        }

        /**
         * Get the timeout to wait before highlighting.
         */
        async function getTimeout() {
            let value = await storage.get('timeout');
            if (typeof value.timeout !== 'undefined') {
                return parseInt(value.timeout);
            }
            // Default to 500 milliseconds.
            return parseInt(500);
        }

        /**
         * Get the updated timestamp.
         */
        async function getUpdated() {
            let value = await storage.get('updated');
            if (typeof value.updated !== 'undefined') {
                return new Date(value.updated);
            }
            return undefined;
        }

        /**
         * Get the usernames to highlight RMS supporter signers.
         */
        async function getUsernames() {
            let value = await storage.get(['github', 'gitlab']);
            return {
                github: deserializeUsernames(value.github),
                gitlab: deserializeUsernames(value.gitlab)
            };
        }

        /**
         * Set the list of usernames and updated timestamp.
         */
        async function setUsernames(date, github, gitlab) {
            storage.set({
                updated: date.toUTCString(),
                github: serializeUsernames(github),
                gitlab: serializeUsernames(gitlab)
            });
        }

        return {
            getBackgroundColor,
            getRefresh,
            getTimeout,
            getUpdated,
            getUsernames,
            setUsernames
        };
    };

    /**
     * Script to add the CSS styles to github usernames.
     */

    const store = createStore(storage);
    main(store);

}());
