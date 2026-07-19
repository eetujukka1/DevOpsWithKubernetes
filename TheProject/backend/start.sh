#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  : "${PGHOST:?PGHOST must be set when DATABASE_URL is not provided}"
  : "${PGPORT:=5432}"
  : "${PGDATABASE:?PGDATABASE must be set when DATABASE_URL is not provided}"
  : "${PGUSER:?PGUSER must be set when DATABASE_URL is not provided}"
  : "${PGPASSWORD:?PGPASSWORD must be set when DATABASE_URL is not provided}"

  export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?schema=public"
fi

npx prisma db push
exec node index.js
