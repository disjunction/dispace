#!/bin/sh
export NODE_PATH=$NODE_PATH:./src:../fgtk/vendor:../fgtk/src:../dispace-libs:/usr/local/lib/node_modules

if [ -z $1 ]; then
        SPECS=tests/specs
else
        SPECS=$1
fi

jasmine-node --captureExceptions --verbose $SPECS
