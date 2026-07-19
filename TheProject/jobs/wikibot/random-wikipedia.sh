#!/bin/sh
set -eu

RANDOM_URL_ENDPOINT="${RANDOM_URL_ENDPOINT:-https://en.wikipedia.org/wiki/Special:Random}"
: "${BACKEND_URL:?BACKEND_URL must be set}"

location_header="$(
  curl -fsS -D - -o /dev/null "$RANDOM_URL_ENDPOINT" \
    | tr -d '\r' \
    | awk 'tolower($1) == "location:" { print $2; exit }'
)"

if [ -z "$location_header" ]; then
  echo "Failed to resolve redirect location from $RANDOM_URL_ENDPOINT" >&2
  exit 1
fi

message="Read $location_header"

curl -fsS \
  -X POST \
  -H "Content-Type: application/json" \
  --data "$(printf '{"text":"%s"}' "$message")" \
  "$BACKEND_URL/api/todos" \
  > /dev/null

echo "$message"
