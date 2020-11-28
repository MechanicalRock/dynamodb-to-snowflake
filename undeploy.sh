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

cdk destroy --all

rm -rf node_modules dist cdk.out

popd