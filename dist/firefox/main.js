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
     * Generate CSS styles from a list of usernames.
     */

    // Regex matching github domain names.
    const GITHUB_DOMAIN_RE = /^(?:(?:github\.com)|(?:.*\.github\.io))$/;

    // Regex matching gitlab domain names.
    const GITLAB_DOMAIN_RE = /^(?:(?:gitlab\.com)|(?:.*\.gitlab\.io))$/;

    /**
     * Generate the CSS style from names.
     */
    const generate = usernames => {
        const highlight = '{ background-color: Orange; }';
        const selector = usernames
            .map(item => `a[href$="/${item}" I]`)
            .join(', ');
        return `${selector}\n${highlight}`;
    };

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
    };

    var style = {
      generate,
      apply
    };

    /**
     *  Fetch signer list from the RMS support letter.
     */

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
    var fetchAndGenerateStyleSheets = async () => {
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
     *  Fetch signer list from the RMS support letter.
     */

    /**
     * Shared entry point based on a generic store.
     */
    var main = async store => {
        let currentDate = new Date();
        let previousDate = await store.getUpdated();
        let refreshTime = await store.getRefresh();
        let refresh = requiresRefresh(currentDate, previousDate, refreshTime);
        var stylesheets;
        if (refresh) {
            stylesheets = await fetchAndGenerateStyleSheets();
            let { github, gitlab } = stylesheets;
            await store.setStyleSheets(currentDate, github, gitlab);
        } else {
            stylesheets = await store.getStyleSheets();
        }

        // Apply the CSS styles for the current page.
        style.apply(stylesheets);
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
         * Get the stylesheets to highlight RMS supporter signers.
         */
        async function getStyleSheets() {
            let value = await storage.get(['github', 'gitlab']);
            return {
                github: value.github,
                gitlab: value.gitlab
            };
        }

        /**
         * Set the list of stylesheets and updated timestamp.
         */
        async function setStyleSheets(date, github, gitlab) {
            storage.set({
                updated: date.toUTCString(),
                github,
                gitlab
            });
        }

        return {
            getUpdated,
            getRefresh,
            getStyleSheets,
            setStyleSheets
        };
    };

    /**
     * Script to add the CSS styles to github usernames.
     */

    const store = createStore(storage);
    main(store);

}());
