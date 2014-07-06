#!/usr/bin/env bash

cp coffeequate/build/coffeequate.min.js /tmp
git checkout gh-pages
cp /tmp/coffeequate.min.js .
