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
         * Get the URL to fetch the signers from.
         */
        async function getUrl() {
            let value = await storage.get('url');
            if (typeof value.url !== 'undefined') {
                return value.url;
            }
            // Default to the original Github URL if not set.
            return 'https://rms-support-letter.github.io/';
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
     * Configure user options for the RMS supporters highlighter.
     */

    const store = createStore(storage);

    /**
     * Load settings on page load.
     */
    document.addEventListener('DOMContentLoaded', function() {
        store.getRefresh()
            .then(refreshTime => {
                document.getElementById("refresh").value = refreshTime.toString();
            });
    });

    /**
     * Save settings on selection change event.
     */
    document.getElementById("refresh").addEventListener("input", function(event) {
        storage.set({
            'refresh': event.target.value
        });
        event.preventDefault();
    });

}());
