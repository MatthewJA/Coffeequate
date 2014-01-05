REM CoffeeScript version 1.6.3

CALL coffee -c .
CALL coffee -b -c ./src/build.coffee

REM Node v0.10.21

CALL node ./src/lib/r.js -o ./src/build.js