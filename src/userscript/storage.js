/**
 * Access Tampermonkey extension storage.
 */

import api from './api.js';

/**
 * Set value in storage.
 */
const set = async obj => {
    for (let key in obj) {
        await api.setValue(key, obj[key]);
    }
}

/**
 * Get value(s) in storage.
 */
const get = async key => {
    if (typeof key === 'string') {
        return {
            [key]: await api.getValue(key)
        };
    } else {
        const obj = {};
        for (const k of key) {
            obj[k] = await api.getValue(k);
        }
        return obj;
    }
}

export default {
    set,
    get
};
