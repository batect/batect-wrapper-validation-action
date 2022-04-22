#! /usr/bin/env bash

set -euo pipefail

VERSION=$1

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Argument to $0 must be version in x.y.z format." >/dev/stderr
  exit 1
fi

RELEASE_TAG="release/v$VERSION"
WORKAROUND_TAG="v$VERSION" # This tag can be removed once https://github.com/JasonEtco/build-and-tag-action/pull/21 is merged

git tag -s "$RELEASE_TAG" -m "v$VERSION"
git tag -s "$WORKAROUND_TAG" -m "v$VERSION"

git push origin "$RELEASE_TAG" "$WORKAROUND_TAG"
