#!/bin/sh

echo "Injecting runtime environment variables..."

# Use API_BASE_URL if set, otherwise fall back to BACKEND_ADDRESS
API_URL="${API_BASE_URL:-${BACKEND_ADDRESS}}"

cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__ = {
  API_BASE_URL: "${API_URL}",
  BACKEND_ADDRESS: "${API_URL}",
  WS_ENDPOINT: "${WS_ENDPOINT}"
};
EOF

# Check if running on AWS (API_BASE_URL contains 'amazonaws.com' or 'execute-api')
# If so, generate a simplified nginx config without proxy blocks (frontend calls API Gateway directly)
if echo "${API_URL}" | grep -qE "(amazonaws\.com|execute-api)"; then
  echo "AWS deployment detected - generating nginx config without proxy blocks..."
  cat <<'NGINX_EOF' > /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  # Health check endpoint
  location /health {
    return 200 'OK';
    add_header Content-Type text/plain;
  }

  # SPA fallback (React/Vue/etc)
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Ignore Chrome DevTools request
  location = /.well-known/appspecific/com.chrome.devtools.json {
    return 204;
  }
}
NGINX_EOF
  echo "Nginx config generated for AWS."
else
  echo "Local/Docker Compose deployment - using default nginx.conf with proxy blocks."
fi

exec "$@"
