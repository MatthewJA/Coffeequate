/* For r.js*/

({
  "baseUrl": "./",
  "name": "coffeequate",
  "paths": {
  	"requireLib": "lib/require"
  },
  "include": [
    "requireLib"
   ],
  "exclude": [],
  "optimize": "uglify2",
  "out": "../build/coffeequate.min.js",
  "insertRequire": [
    "coffeequate"
  ],
  "keepBuildDir": true
})