/**
 *  Get and set application-specific values using generic storage primitives.
 */

import settings from './settings.js';

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
}
