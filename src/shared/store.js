/**
 *  Get and set application-specific values using generic storage primitives.
 */

import { REFRESH } from './settings.js';

/**
 * Create the store from an abstract storage.
 */
export default storage => {
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
}
