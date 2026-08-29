#!/bin/sh
set -eu

# Generate .htpasswd from BASIC_AUTH_USER + BASIC_AUTH_PASS env vars.
# These are set as Fly secrets, never checked into git.

USER="${BASIC_AUTH_USER:-hive}"
PASS="${BASIC_AUTH_PASS:-}"

if [ -z "$PASS" ]; then
  echo "ERROR: BASIC_AUTH_PASS must be set as a Fly secret."
  exit 1
fi

htpasswd -bc /etc/nginx/.htpasswd "$USER" "$PASS"

# Optional: allow disabling basic auth in preview builds by unsetting.
if [ "${DISABLE_BASIC_AUTH:-0}" = "1" ]; then
  sed -i '/auth_basic/d' /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
