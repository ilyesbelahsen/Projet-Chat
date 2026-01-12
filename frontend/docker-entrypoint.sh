#!/bin/sh

echo "Injecting runtime environment variables..."

cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__ = {
  BACKEND_ADDRESS: "${BACKEND_ADDRESS}",
  WS_ENDPOINT: "${WS_ENDPOINT}"
};
EOF

exec "$@"
