#!/bin/bash
set -e

echo ">>> Initialisation MySQL : création auth_db + chat_db et des users"

mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS \`${AUTH_DB_NAME}\`;
  CREATE DATABASE IF NOT EXISTS \`${CHAT_DB_NAME}\`;

  CREATE USER IF NOT EXISTS '${AUTH_DB_USER}'@'%' IDENTIFIED BY '${AUTH_DB_PASSWORD}';
  CREATE USER IF NOT EXISTS '${CHAT_DB_USER}'@'%' IDENTIFIED BY '${CHAT_DB_PASSWORD}';

  GRANT ALL PRIVILEGES ON \`${AUTH_DB_NAME}\`.* TO '${AUTH_DB_USER}'@'%';
  GRANT ALL PRIVILEGES ON \`${CHAT_DB_NAME}\`.* TO '${CHAT_DB_USER}'@'%';

  FLUSH PRIVILEGES;
EOSQL

echo ">>> Initialisation MySQL terminée."
