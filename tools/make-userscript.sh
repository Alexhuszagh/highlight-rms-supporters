#!/usr/bin/env bash

set -e

DESTINATION=dist/userscript
mkdir -p                            $DESTINATION
rm -rf                              $DESTINATION/*
./tools/copy-shared.sh              $DESTINATION
./tools/copy-userscript.sh          $DESTINATION
