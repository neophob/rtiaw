#!/bin/bash

BABILI=./node_modules/.bin/babel-minify
REGPACK=./node_modules/.bin/regpack
TERSER=./node_modules/.bin/terser

OUT=./dist

BABELMINIFY_OPT="--builtIns false --mangle.topLevel true --typeConstructors false --numericLiterals true --simplifyComparisons true"
TERSER_OPT="-c toplevel=true,passes=1,ecma=6 -m --warn --toplevel"

REGPACK_OPT0="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName c --crushGainFactor 2 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPT1="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName c --crushGainFactor 5 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPT2="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName c --crushGainFactor 3 --crushLengthFactor 2 --crushCopiesFactor 1"
REGPACK_OPT3="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 4 --crushLengthFactor 4 --crushCopiesFactor 1"
REGPACK_OPT4="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 4 --crushLengthFactor 0 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPT5="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName c --crushGainFactor 4 --crushLengthFactor 1 --crushCopiesFactor 0"
REGPACK_OPT6="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 5 --crushLengthFactor 1 --crushCopiesFactor 0"
REGPACK_OPT7="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 5 --crushLengthFactor 4 --crushCopiesFactor 3"
REGPACK_OPT8="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 5 --crushLengthFactor 0 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPT9="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 4 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPTA="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 5 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPTB="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 16 --crushLengthFactor 8 --crushCopiesFactor 0 --crushTiebreakerFactor 0"
REGPACK_OPTC="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 3 --crushLengthFactor 2 --crushCopiesFactor 1 --crushTiebreakerFactor 0"
REGPACK_OPTD="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 64 --crushLengthFactor 8 --crushCopiesFactor 0"
REGPACK_OPTE="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 1 --crushLengthFactor 0 --crushCopiesFactor 0"
REGPACK_OPTF="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName 'c' --crushGainFactor 2 --crushLengthFactor 1 --crushCopiesFactor 3  --crushTiebreakerFactor 0"
REGPACK_OPTX="- --useES6 true --reassignVars true --hash2DContext true --contextVariableName c --crushGainFactor 2 --crushLengthFactor 1 --c"

mkdir -p $OUT

BAB_PACK() {
  OPT=$1
  $REGPACK $OUT/in $OPT > $OUT/js1k-babili-regpacked-$2.js 2>/dev/null
  printf %s "$(cat $OUT/js1k-babili-regpacked-$2.js)" > $OUT/js1k-babili-regpacked-$2-no-newlines.js
  rm $OUT/js1k-babili-regpacked-$2.js
}

REGPACK_PACK() {
  OPT=$1
  $REGPACK js1k.js $OPT > $OUT/js1k-regpacked-1.js
}

echo "[MINIME] START"
rm -f $OUT/*

#$BABILI 101-js1k/index.js $BABELMINIFY_OPT > $OUT/in.tmp
$TERSER 101-js1k/index.js $TERSER_OPT > $OUT/in-terser.tmp


# remove trailing ;
#sed 's/.$//' $OUT/in.tmp | tee $OUT/in
sed 's/.$//' $OUT/in-terser.tmp | tee $OUT/in-terser
#BAB_PACK "$REGPACK_OPT1" 1
#BAB_PACK "$REGPACK_OPT2" 2
#BAB_PACK "$REGPACK_OPT3" 3
#BAB_PACK "$REGPACK_OPT4" 4
#BAB_PACK "$REGPACK_OPT5" 5
#BAB_PACK "$REGPACK_OPT6" 6
#BAB_PACK "$REGPACK_OPT7" 7
#BAB_PACK "$REGPACK_OPT8" 8
#BAB_PACK "$REGPACK_OPT9" 9
#BAB_PACK "$REGPACK_OPTA" A
#BAB_PACK "$REGPACK_OPTB" B
#BAB_PACK "$REGPACK_OPTC" C
#BAB_PACK "$REGPACK_OPTD" D
#BAB_PACK "$REGPACK_OPTE" E
#BAB_PACK "$REGPACK_OPTF" F
#BAB_PACK "$REGPACK_OPTX" X

  $REGPACK $OUT/in-terser $REGPACK_OPTX > $OUT/js1k-terser-regpacked-X.js 2>/dev/null
  printf %s "$(cat $OUT/js1k-terser-regpacked-X.js)" > $OUT/js1k-terser-regpacked-X-no-newlines.js
  rm $OUT/js1k-terser-regpacked-X.js


echo "[MINIME] WAIT"

ls -alS $OUT/* | sort -k 5 -n
