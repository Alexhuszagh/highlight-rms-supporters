#!/usr/bin/env bash

# Make the browser extensions.
./tools/make-chromium.sh
./tools/make-firefox.sh

# Make the userscripts.
./tools/make-userscript.sh
