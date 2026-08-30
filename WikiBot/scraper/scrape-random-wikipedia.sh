#!/usr/bin/env bash
set -euo pipefail

SOURCE_URL="https://en.wikipedia.org/wiki/Special:Random"
OUTPUT_FILE="/www/index.html"
MIN_WAIT_SECONDS=300
MAX_WAIT_SECONDS=900
USER_AGENT="WikiBot/1.0"

write_page() {
  local source_url="$1"
  local output_file="$2"
  local output_dir
  local tmp_file
  local final_url
  local escaped_url
  local base_tag

  output_dir="$(dirname "$output_file")"
  mkdir -p "$output_dir"

  tmp_file="$(mktemp "${output_file}.tmp.XXXXXX")"

  final_url="$(
    curl -fsSL \
      -A "$USER_AGENT" \
      -w "%{url_effective}" \
      -o "$tmp_file" \
      "$source_url"
  )"

  escaped_url="$(
    printf '%s' "$final_url" \
      | sed \
        -e 's/&/\&amp;/g' \
        -e 's/"/\&quot;/g' \
        -e "s/'/\&#39;/g" \
        -e 's/</\&lt;/g' \
        -e 's/>/\&gt;/g'
  )"
  base_tag="<base href=\"$escaped_url\">"

  if ! grep -qi '<base[[:space:]]' "$tmp_file"; then
    if grep -qi '<head[^>]*>' "$tmp_file"; then
      awk -v base="$base_tag" '
        !inserted && match(tolower($0), /<head[^>]*>/) {
          print substr($0, 1, RSTART + RLENGTH - 1) base substr($0, RSTART + RLENGTH)
          inserted = 1
          next
        }
        { print }
      ' "$tmp_file" > "${tmp_file}.with-base"
    else
      {
        printf '<head>%s</head>\n' "$base_tag"
        cat "$tmp_file"
      } > "${tmp_file}.with-base"
    fi

    mv "${tmp_file}.with-base" "$tmp_file"
  fi

  mv "$tmp_file" "$output_file"
  echo "Wrote $final_url to $output_file"
}

while true; do
  wait_range=$((MAX_WAIT_SECONDS - MIN_WAIT_SECONDS + 1))
  wait_seconds=$((MIN_WAIT_SECONDS + RANDOM % wait_range))

  echo "Waiting ${wait_seconds}s before fetching the next article"
  sleep "$wait_seconds"

  write_page "$SOURCE_URL" "$OUTPUT_FILE"
done
