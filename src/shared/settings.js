/**
 * Enumerated use options and defaults.
 */

const REFRESH_LABELS = {
  '10 minutes': '600000',
  '1 hour': '3600000',
  '1 day': '86400000',
  'Never': '9007199254740991'
};

const REFRESH_VALUES = {
  '600000': '10 minutes',
  '3600000': '1 hour',
  '86400000': '1 day',
  '9007199254740991': 'Never'
};

export const REFRESH = {
  'default': '86400000',
  labels: REFRESH_LABELS,
  values: REFRESH_VALUES
};
