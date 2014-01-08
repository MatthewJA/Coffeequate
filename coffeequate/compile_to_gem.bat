REM CoffeeScript version 1.6.3

CALL coffee -c .
CALL coffee -b -c .\src\build.coffee

REM Node v0.10.21
REM r.js 2.1.9

CALL node .\src\lib\r.js -o .\src\build.js
CALL node .\src\lib\r.js -o .\src\build-min.js

CALL cp ./build/coffeequate.js ../../Graphical-Equation-Manipulator/src/lib/Coffeequate/coffeequate.js
CALL cp ./build/coffeequate.min.js ../../Graphical-Equation-Manipulator/src/lib/Coffeequate/coffeequate.min.js