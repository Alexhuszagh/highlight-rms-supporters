/**
 *  Get and set application-specific values using generic storage primitives.
 */

import { REFRESH } from './settings.js';

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
}
