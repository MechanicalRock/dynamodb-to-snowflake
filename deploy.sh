#!/bin/bash
set -eo pipefail

RUNPATH=$(dirname ${0})

pushd $RUNPATH

if [ ! -e ".env" ]; then
    echo "No .env file exists"
    popd
    exit 1
fi

# read in properties with your settings
export `cat .env`

# install dependencies
npm ci

# run tests
npm run test

# transpile the typescript lambda to javascript
npm run build:lambda

cdk deploy --all

popd