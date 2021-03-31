#!/usr/bin/env bash

DESTINATION=$1

# Rollup our files, add the Tampermonkey headers, and remove the tmp file.
rollup src/userscript/main.js      --file $DESTINATION/tmp.js --format iife
cat src/userscript/userscript.js $DESTINATION/tmp.js > $DESTINATION/main.js
rm $DESTINATION/tmp.js
