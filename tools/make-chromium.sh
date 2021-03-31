#!/usr/bin/env bash

set -e

DESTINATION=dist/chromium
rm -rf                              $DESTINATION/*
./tools/copy-shared.sh              $DESTINATION
cp platform/chromium/manifest.json  $DESTINATION/
