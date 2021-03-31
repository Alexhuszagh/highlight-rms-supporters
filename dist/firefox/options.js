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
