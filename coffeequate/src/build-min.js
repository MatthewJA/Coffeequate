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
  "keepBuildDir": true,
  "wrap": {
    startFile: 'start.frag',
    endFile: 'end.frag'
  }
})