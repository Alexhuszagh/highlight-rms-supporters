#!/usr/bin/env bash

DESTINATION=$1

cp ext/*                            $DESTINATION/
cp src/extension/background.html    $DESTINATION/
cp src/extension/options.css        $DESTINATION/
cp src/extension/options.html       $DESTINATION/

rollup src/extension/main.js      --file $DESTINATION/main.js --format iife
rollup src/extension/options.js   --file $DESTINATION/options.js --format iife
