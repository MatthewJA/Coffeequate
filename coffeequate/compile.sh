#!/usr/bin/env bash
coffee -c .
node ./src/vendor/r.js -o ./build/build.js
node ./src/vendor/r.js -o ./build/build-min.min.js
