#!/bin/bash

GIT_SHA=$(git rev-parse HEAD)

# Output the git commit hash to a json file in the src/ directory
# so that it can be imported and used in the UI.
printf "{ \"version\": \"$GIT_SHA\" }" > src/version.output.json