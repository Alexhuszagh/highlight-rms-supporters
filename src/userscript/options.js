/**
 * Configure user options for the RMS supporters highlighter.
 */

import api from './api.js';
import storage from './storage.js';
import { REFRESH } from '../shared/settings.js';
import createStore from '../shared/store.js';

const store = createStore(storage);

// Load refresh value from underlying storage.
const loadRefresh = async () => {
    let refresh = await store.getRefresh();
    api.config.set('refreshLabel', REFRESH.values[refresh]);
}

// Store the refresh value from the GM_Config label.
const storeRefresh = async () => {
    let label = api.config.get('refreshLabel');
    await storage.set({
        'refresh': REFRESH.labels[label]
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
            save: false,
            default: REFRESH.values[REFRESH['default']],
            options: Object.keys(REFRESH.labels)
        },
        // TODO(ahuszagh) Need to add a setting here...
//        colorLabel: {
//            label: 'Refresh Time:',
//            type: 'select',
//            default: REFRESH.values[REFRESH['default']],
//            options: Object.keys(REFRESH.labels)
//        }
    },
    events: {
        init: async () => {
            await loadRefresh();
        },
        save: async () => {
            await storeRefresh();
        }
    }
});

// Register the config as a menu command.
const commandId = api.registerMenuCommand('Settings', () => {
    api.config.open();
});
