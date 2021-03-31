/**
 * Configure user options for the RMS supporters highlighter.
 */

import api from './api.js';
import storage from './storage.js';
import { REFRESH } from '../shared/settings.js';

// Store the refresh value from the GM_Config label.
const setRefresh = () => {
    let label = api.config.get('refreshLabel');
    storage.set({
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
            default: REFRESH.values[REFRESH['default']],
            options: Object.keys(REFRESH.labels)
        }
    },
    events: {
        save: () => {
            setRefresh();
        }
    }
});

// Register the config as a menu command.
const commandId = api.registerMenuCommand('Settings', () => {
    api.config.open();
});
