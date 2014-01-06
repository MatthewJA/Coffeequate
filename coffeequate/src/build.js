/* For r.js*/

({
  "baseUrl": "./",
  "name": "lib/almond",
  "paths": {
  	"requireLib": "lib/require"
  },
  "include": [
    "coffeequate",
    "requireLib"
   ],
  "exclude": [],
  "optimize": "none",
  "out": "../build/coffeequate.js",
  "insertRequire": [
    "coffeequate"
  ],
  startFile: 'start.frag',
  endFile: 'end.frag',
  "keepBuildDir": true,
  "wrap": true
})