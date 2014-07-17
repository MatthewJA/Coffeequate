#!/usr/bin/env bash
coffee -c .
node ./src/vendor/r.js -o ./src/build.js
node ./src/vendor/r.js -o ./src/build-min.js
