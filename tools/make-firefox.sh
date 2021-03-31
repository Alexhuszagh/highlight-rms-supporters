#!/usr/bin/env bash

set -e

DESTINATION=dist/firefox
rm -rf                              $DESTINATION/*
./tools/copy-shared.sh              $DESTINATION
cp platform/firefox/manifest.json   $DESTINATION/
