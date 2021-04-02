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

    const store = createStore(storage);

    /**
     * Load settings on page load.
     */
    document.addEventListener('DOMContentLoaded', async function() {
        const refresh = document.getElementById("refresh");
        const url = document.getElementById("url");
        const backgroundColor = document.getElementById("backgroundColor");

        // Add options to the refresh element.
        for (let [label, value] of Object.entries(settings.refresh.labels)) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.innerText = label;
            refresh.appendChild(opt);
        }

        // Set the initial, default values.
        refresh.value = (await store.getRefresh()).toString();
        url.value = await store.getUrl();

        // Color selectors can only be hexadecimal, so convert our default
        // to hex if applicable.
        var color = await store.getBackgroundColor();
        if (color === 'orange') {
            color = '#FFA500';
        }
        backgroundColor.value = color;


    });

    /**
     * Save refresh settings on selection change event.
     */
    document.getElementById("refresh").addEventListener("input", async function(event) {
        await storage.set({
            'refresh': event.target.value
        });

        event.preventDefault();
    });

    /**
     * Mark if the URL is valid on input events.
     */
    document.getElementById("url").addEventListener("input", async function(event) {
        const element = document.getElementById("url");
        if (url.validate(event.target.value)) {
            element.setCustomValidity('');
        } else {
            element.setCustomValidity('Invalid URL provided.');
        }
        element.reportValidity();
        event.preventDefault();
    });

    /**
     * Save URL settings when values are committed by the user.
     */
    document.getElementById("url").addEventListener("change", async function(event) {
        if (url.validate(event.target.value)) {
            await storage.set({
                'url': event.target.value
            });
        }
        event.preventDefault();
    });

    /**
     * Save URL settings when values are committed by the user.
     */
    document.getElementById("backgroundColor").addEventListener("input", async function(event) {
        await storage.set({
            'backgroundColor': event.target.value
        });
        event.preventDefault();
    });

}());
