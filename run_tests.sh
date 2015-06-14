#!/bin/sh
export NODE_PATH=$NODE_PATH:./src:./tests:../fgtk/vendor:../fgtk/src:../dispace-libs:/usr/local/lib/node_modules:./node_modules

if [ -z $1 ]; then
        SPECS=tests/specs
else
        SPECS=$1
fi

node_modules/jasmine-node/bin/jasmine-node --captureExceptions --verbose $SPECS
