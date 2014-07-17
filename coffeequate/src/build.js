/* For r.js*/

({
  "baseUrl": "./",
  "name": "vendor/almond",
  "paths": {
  	"requireLib": "vendor/require"
  },
  "include": [
    "coffeequate"
    // "requireLib"
   ],
  "exclude": [],
  "optimize": "none",
  "out": "../build/coffeequate.js",
  "insertRequire": [
    "coffeequate"
  ],
  "keepBuildDir": true,
  "wrap": {
    startFile: 'start.frag',
    endFile: 'end.frag'
  }
})