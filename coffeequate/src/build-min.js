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
  "optimize": "uglify2",
  "out": "../build/coffeequate.min.js",
  "insertRequire": [
    "coffeequate"
  ],
  "keepBuildDir": true,
  "wrap": {
    startFile: 'start.frag',
    endFile: 'end.frag'
  }
})