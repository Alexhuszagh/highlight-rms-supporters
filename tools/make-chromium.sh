#!/usr/bin/env bash

set -e

DESTINATION=dist/chromium
mkdir -p                            $DESTINATION
rm -rf                              $DESTINATION/*
./tools/copy-shared.sh              $DESTINATION
./tools/copy-extension.sh           $DESTINATION
cp platform/chromium/manifest.json  $DESTINATION/
