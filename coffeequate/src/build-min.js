/* For r.js*/

({
  "baseUrl": "./",
  "name": "lib/almond",
  "paths": {
  	"requireLib": "lib/require"
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
  startFile: 'start.frag',
  endFile: 'end.frag',
  "keepBuildDir": true,
  "wrap": true
})