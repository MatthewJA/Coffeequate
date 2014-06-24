#!/usr/bin/env bash
coffee -c .
node ./src/lib/r.js -o ./src/build.js
node ./src/lib/r.js -o ./src/build-min.js
