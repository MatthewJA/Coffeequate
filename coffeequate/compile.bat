REM CoffeeScript version 1.6.3

CALL coffee -c .

REM Node v0.10.21
REM r.js 2.1.9

CALL node .\src\vendor\r.js -o .\src\build.js
CALL node .\src\vendor\r.js -o .\src\build-min.js