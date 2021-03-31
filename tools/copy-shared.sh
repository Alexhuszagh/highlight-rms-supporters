#!/usr/bin/env bash

DESTINATION=$1

cp -R icons    $DESTINATION/icons
cp ext/*       $DESTINATION/
cp src/*       $DESTINATION/
