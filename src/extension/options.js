/**
 * Configure user options for the RMS supporters highlighter.
 */

import storage from './storage.js';
import createStore from '../shared/store.js';
import settings from '../shared/settings.js';
import url from '../shared/url.js';

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
