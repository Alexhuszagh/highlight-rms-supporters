/**
 * Script to add the CSS styles to github usernames.
 */

import './options.js';
import storage from './storage.js';
import main from '../shared/main.js';
import createStore from '../shared/store.js';

const store = createStore(storage);
main(store);
