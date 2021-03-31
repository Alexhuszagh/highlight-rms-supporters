/**
 * Configure user options for the RMS supporters highlighter.
 */

import storage from './storage.js';
import createStore from '../shared/store.js';

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
