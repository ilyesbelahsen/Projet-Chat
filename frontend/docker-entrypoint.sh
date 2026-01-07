#!/bin/sh

echo "Injecting runtime environment variables..."

cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__ = {
  BACKEND_URL: "${BACKEND_URL}"
};
EOF

exec "$@"
