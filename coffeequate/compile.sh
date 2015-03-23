#!/usr/bin/env bash
coffee -c .
node ./src/vendor/r.js -o ./build/coffeequate.js
node ./src/vendor/r.js -o ./build/coffeequate.min.js
