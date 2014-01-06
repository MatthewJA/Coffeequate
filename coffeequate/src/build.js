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
  "optimize": "none",
  "out": "../build/coffeequate.js",
  "insertRequire": [
    "coffeequate"
  ],
  "keepBuildDir": true
})