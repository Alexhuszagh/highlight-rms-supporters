/**
 * Configure user options for the RMS supporters highlighter.
 */

import api from './api.js';
import storage from './storage.js';
import color from '../shared/color.js';
import settings from '../shared/settings.js';
import createStore from '../shared/store.js';
import url from '../shared/url.js';

const store = createStore(storage);

// Store the refresh value from the GM_Config label.
const storeRefresh = async () => {
    let label = api.config.get('refreshLabel');
    await storage.set({
        'refresh': settings.refresh.labels[label]
    });
}

// Store the timeout delay from the GM_Config label.
const storeTimeout = async () => {
    await storage.set({
        'timeout': api.config.get('timeoutLabel')
    });
}

// Store the RMS support letter URL from the GM_Config label.
const storeUrl = async () => {
    await storage.set({
        'url': api.config.get('urlLabel')
    });
}

// Store the highlight color from the GM_Config label.
const storeColor = async () => {
    await storage.set({
        'backgroundColor': api.config.get('colorLabel')
    });
}

// Initialize all settings.
api.config.init({
    id: 'HighlightRMSSupporters',
    title: 'Highlight RMS Supporter Settings',
    fields: {
        refreshLabel: {
            label: 'Refresh Time:',
            type: 'select',
            default: settings.refresh.values[settings.refresh['default']],
            options: Object.keys(settings.refresh.labels)
        },
        timeoutLabel: {
            label: 'Display Delay',
            type: 'int',
            min: 1,
            max: 2000,
            default: settings.timeout['default']
        },
        urlLabel: {
            label: 'RMS Support Letter URL',
            type: 'text',
            default: settings.url['default'],
            // Unlikely to be longer than 100, in practice.
            size: 100
        },
        colorLabel: {
            label: 'Highlight Color',
            type: 'text',
            default: settings.backgroundColor['default']
        }
    },
    events: {
        save: async () => {
            // Even if the int validator fails, other values are stored.
            await storeRefresh();
            await storeTimeout();

            // Validate and optionally store URL.
            if (url.validate(api.config.get('urlLabel'))) {
                await storeUrl();
            } else {
                alert('"RMS Support Letter URL" requires a valid URL.');
            }

            // Validate and optionally store the color.
            if (color.validate(api.config.get('colorLabel'))) {
                await storeColor();
            } else {
                alert('"Highlight Color" requires a valid CSS color.');
            }
        },

        open: async () => {
            // Reset the displayed URL on open if the URL differs.
            // This way, we can reset our displayed field.
            let displayedUrl = api.config.get('urlLabel');
            let storedUrl = await store.getUrl();
            if (displayedUrl !== storedUrl) {
                api.config.set('urlLabel', storedUrl);
            }

            // Reset the displayed color on open if the color differs.
            // This way, we can reset our displayed field.
            let displayedColor = api.config.get('colorLabel');
            let storedColor = await store.getBackgroundColor();
            if (displayedColor !== storedColor) {
                api.config.set('colorLabel', storedColor);
            }
        }
    }
});

// Register the config as a menu command.
const commandId = api.registerMenuCommand('Settings', () => {
    api.config.open();
});
