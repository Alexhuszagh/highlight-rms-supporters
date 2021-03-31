/**
 * Access local browser extension storage.
 */

/**
 * Set value in storage.
 */
const set = async obj => {
    browser.storage.local.set(obj);
}

/**
 * Get value(s) in storage.
 */
const get = async key => {
    return await browser.storage.local.get(key);
}

export default {
    set,
    get
};
