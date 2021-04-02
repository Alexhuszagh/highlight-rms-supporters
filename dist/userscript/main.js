// ==UserScript==
// @name               Highlight RMS Supporters
// @namespace          https://github.com/alexhuszagh/highlight-rms-supporters
// @version            0.1
// @description        Highlights any users who signed RMS's support letter.
// @author             Alex Huszagh
// @match              https://github.com/*
// @match              https://*.github.io/*
// @match              https://gitlab.com/*
// @match              https://*.gitlab.io/*
// @run-at             document-start
// @require            https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_registerMenuCommand
// @grant              GM.getValue
// @grant              GM.setValue
// @grant              GM.registerMenuCommand
// ==/UserScript==
(function () {
    'use strict';

    /**
     * Normalize the GM api.
     */

    // Detect if using GreaseMonkey or TamperMonkey
    const HAS_GM = typeof GM !== 'undefined';

    // Define our API.
    const GM_API = {
        config: GM_config
    };

    // Add our keys to the GM API.
    if (HAS_GM) {
        GM_API.getValue = GM.getValue;
        GM_API.registerMenuCommand = GM.registerMenuCommand;
        GM_API.setValue = GM.setValue;
    } else {
        GM_API.getValue = GM_getValue;
        GM_API.registerMenuCommand = GM_registerMenuCommand;
        GM_API.setValue = GM_setValue;
    }

    /**
     * Access Tampermonkey extension storage.
     */

    /**
     * Set value in storage.
     */
    const set = async obj => {
        for (let key in obj) {
            await GM_API.setValue(key, obj[key]);
        }
    };

    /**
     * Get value(s) in storage.
     */
    const get = async key => {
        if (typeof key === 'string') {
            return {
                [key]: await GM_API.getValue(key)
            };
        } else {
            const obj = {};
            for (const k of key) {
                obj[k] = await GM_API.getValue(k);
            }
            return obj;
        }
    };

    var storage = {
        set,
        get
    };

    /**
     * Color utilities.
     */

    /**
     * Validate a color field.
     */
    const validate$1 = color => {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    };

    var color = {
        validate: validate$1
    };

    /**
     * Enumerated use options and defaults.
     */

    var settings = {
        refresh: {
            'default': '86400000',
            labels: {
                '10 minutes': '600000',
                '1 hour': '3600000',
                '1 day': '86400000',
                'Never': '9007199254740991'
            },
            values: {
                '600000': '10 minutes',
                '3600000': '1 hour',
                '86400000': '1 day',
                '9007199254740991': 'Never'
            }
        },
        backgroundColor: {
            'default': 'orange'
        },
        timeout: {
            min: 1,
            max: 2000,
            'default': 500
        },
        url: {
            'default': 'https://rms-support-letter.github.io/'
        }
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
            return parseInt(settings.refresh['default']);
        }

        /**
         * Get the background color.
         */
        async function getBackgroundColor() {
            let value = await storage.get('backgroundColor');
            if (typeof value.backgroundColor !== 'undefined') {
                return value.backgroundColor;
            }
            return settings.backgroundColor['default'];
        }

        /**
         * Get the timeout to wait before highlighting.
         */
        async function getTimeout() {
            let value = await storage.get('timeout');
            if (typeof value.timeout !== 'undefined') {
                return value.timeout;
            }
            return settings.timeout['default'];
        }

        /**
         * Get the URL to fetch the signers from.
         */
        async function getUrl() {
            let value = await storage.get('url');
            if (typeof value.url !== 'undefined') {
                return value.url;
            }
            return settings.url['default'];
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
            getUrl,
            getUsernames,
            setUsernames
        };
    };

    /**
     * URL utilities.
     */

    /**
     * Validate a URL field.
     */
    const validate = url => {
        try {
            let _ = new URL(url);
            return true;
        } catch(error) {
            return false;
        }
    };

    var url = {
        validate
    };

    /**
     * Configure user options for the RMS supporters highlighter.
     */

    const store$1 = createStore(storage);

    // Store the refresh value from the GM_Config label.
    const storeRefresh = async () => {
        let label = GM_API.config.get('refreshLabel');
        await storage.set({
            'refresh': settings.refresh.labels[label]
        });
    };

    // Store the timeout delay from the GM_Config label.
    const storeTimeout = async () => {
        await storage.set({
            'timeout': GM_API.config.get('timeoutLabel')
        });
    };

    // Store the RMS support letter URL from the GM_Config label.
    const storeUrl = async () => {
        await storage.set({
            'url': GM_API.config.get('urlLabel')
        });
    };

    // Store the highlight color from the GM_Config label.
    const storeColor = async () => {
        await storage.set({
            'backgroundColor': GM_API.config.get('colorLabel')
        });
    };

    // Initialize all settings.
    GM_API.config.init({
        id: 'HighlightRMSSupporters',
        title: 'Highlight RMS Supporter Settings',
        fields: {
            refreshLabel: {
                label: 'Refresh Time:',
                type: 'select',
                default: settings.refresh.values[settings.refresh['default']],
                options: Object.keys(settings.refresh.labels)
            },
            timeoutLabel: {
                label: 'Display Delay',
                type: 'int',
                min: settings.timeout.min,
                max: settings.timeout.max,
                default: settings.timeout['default']
            },
            urlLabel: {
                label: 'RMS Support Letter URL',
                type: 'text',
                default: settings.url['default'],
                // Unlikely to be longer than 100, in practice.
                size: 50
            },
            colorLabel: {
                label: 'Highlight Color',
                type: 'text',
                default: settings.backgroundColor['default']
            }
        },
        events: {
            save: async () => {
                // Even if the int validator fails, other values are stored.
                await storeRefresh();
                await storeTimeout();

                // Validate and optionally store URL.
                if (url.validate(GM_API.config.get('urlLabel'))) {
                    await storeUrl();
                } else {
                    alert('"RMS Support Letter URL" requires a valid URL.');
                }

                // Validate and optionally store the color.
                if (color.validate(GM_API.config.get('colorLabel'))) {
                    await storeColor();
                } else {
                    alert('"Highlight Color" requires a valid CSS color.');
                }
            },

            open: async () => {
                // Reset the displayed URL on open if the URL differs.
                // This way, we can reset our displayed field.
                let displayedUrl = GM_API.config.get('urlLabel');
                let storedUrl = await store$1.getUrl();
                if (displayedUrl !== storedUrl) {
                    GM_API.config.set('urlLabel', storedUrl);
                }

                // Reset the displayed color on open if the color differs.
                // This way, we can reset our displayed field.
                let displayedColor = GM_API.config.get('colorLabel');
                let storedColor = await store$1.getBackgroundColor();
                if (displayedColor !== storedColor) {
                    GM_API.config.set('colorLabel', storedColor);
                }
            }
        }
    });

    // Register the config as a menu command.
    GM_API.registerMenuCommand('Settings', () => {
        GM_API.config.open();
    });

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

    /**
     * Fetch HTML from the supporters URL.
     */
    const getSupportersHtml = url =>
        fetch(url)
            .then(response => response.text());

    /**
     * Fetch signers and generate the username mappings.
     */
    var fetchUsernames = async url => {
        let signers = await getSupportersHtml(url)
            .then(text => toHtml(text))
            .then(html => extractSignerList(html));

        // Create stylesheets from the signer lists.
        let github = new Set(signers.github.map(x => x.toLowerCase()));
        let gitlab = new Set(signers.gitlab.map(x => x.toLowerCase()));

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
        } else if (url.pathname.endsWith('issues')) {
            // Have a Github issue.
            const issues = parseIssues(url.searchParams.get('q') || '');
            if (typeof issues['author'] !== 'undefined') {
                username = issues['author'];
            }
        }

        return username;
    };

    /**
     * Highlight anchor tags with hrefs.
     */
    const highlightLinks = (dom, usernames, domain, color) => {
        let links = dom.getElementsByTagName('a');
        let absolute = `https://${domain}`;
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
    };

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
    };

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
    };

    /**
     * Detect website to provide correct list of usernames.
     */
    var highlight = (dom, usernames, color) => {
        const domain = window.location.hostname;
        if (GITHUB_DOMAIN_RE.test(domain)) {
            highlightLinks(dom, usernames.github, domain, color);
            highlightGithubProfile(dom, usernames.github, color);
        } else if (GITLAB_DOMAIN_RE.test(domain)) {
            highlightLinks(dom, usernames.gitlab, domain, color);
            highlightGitlabProfile(dom, usernames.gitlab, color);
        }
    };

    /**
     *  Fetch signer list from the RMS support letter.
     */

    // Current URL at pageload.
    document.location.href;
    // Usernames loaded from the store.
    var USERNAMES;
    // Background color loaded from the store.
    var BACKGROUND_COLOR;
    // URL to fetch the signer list from.
    var URL$1;

    // HELPERS

    /**
     * Check if we can highlight (if usernames has been loaded).
     */
    const checkHighlight = async dom => {
        // Wait for a short period, then highlight the usernames.
        if (typeof USERNAMES !== 'undefined') {
            highlight(dom, USERNAMES, BACKGROUND_COLOR);
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
            USERNAMES = await fetchUsernames(URL$1);
            let { github, gitlab } = USERNAMES;
            await store.setUsernames(currentDate, github, gitlab);
        } else {
            USERNAMES = await store.getUsernames();
        }
    };

    // EVENTS

    /**
     * Track added nodes to the DOM and re-highlight the changes.
     */
    window.onload = () => {
        const body = document.querySelector('body');
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                for (const node of mutation.addedNodes) {
                    // We have an added node we can traverse.
                    if (typeof node.getElementsByClassName !== 'undefined') {
                        checkHighlight(node);
                    }
                }
            });
        });

        observer.observe(body, { childList: true, subtree: true });
    };

    // ENTRY POINT

    /**
     * Shared entry point based on a generic store.
     */
    var main = async store => {
        BACKGROUND_COLOR = await store.getBackgroundColor();
        await store.getTimeout();
        URL$1 = await store.getUrl();
        await loadUsernames(store);

        checkHighlight(document);
    };

    /**
     * Script to add the CSS styles to github usernames.
     */

    const store = createStore(storage);
    main(store);

}());
