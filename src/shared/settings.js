/**
 * Enumerated use options and defaults.
 */

export default {
    refresh: {
        'default': '86400000',
        labels: {
            '10 minutes': '600000',
            '1 hour': '3600000',
            '1 day': '86400000',
            'Never': '9007199254740991'
        },
        values: {
            '600000': '10 minutes',
            '3600000': '1 hour',
            '86400000': '1 day',
            '9007199254740991': 'Never'
        }
    },
    backgroundColor: {
        'default': 'orange'
    },
    timeout: {
        'default': 500
    },
    url: {
        'default': 'https://rms-support-letter.github.io/'
    }
}
