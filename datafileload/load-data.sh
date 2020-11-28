#!/bin/bash

DIRBASE=$(dirname ${0})

pushd $DIRBASE

cp $DIRBASE/../.env ./

docker-compose run --rm ddbimport

popd
