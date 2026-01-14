const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  console.log('Connecting to MySQL at', config.host);
  console.log('Event action:', event.action);

  let connection;
  try {
    connection = await mysql.createConnection(config);

    // Create auth_db if not exists
    console.log('Creating auth_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS auth_db');

    // Create chat_db if not exists
    console.log('Creating chat_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS chat_db');

    console.log('Databases created successfully!');

    // Clean up duplicate usernames if requested
    if (event.action === 'cleanup-duplicates') {
      console.log('Cleaning up duplicate usernames...');
      await connection.query('USE auth_db');

      // Find and delete duplicate usernames, keeping only the oldest one
      const [duplicates] = await connection.query(`
        SELECT username, COUNT(*) as cnt
        FROM users
        GROUP BY username
        HAVING cnt > 1
      `);

      console.log('Found duplicate usernames:', duplicates);

      for (const dup of duplicates) {
        // Keep the oldest entry, delete the rest
        await connection.query(`
          DELETE u1 FROM users u1
          INNER JOIN users u2
          WHERE u1.username = u2.username
            AND u1.username = ?
            AND u1.created_at > u2.created_at
        `, [dup.username]);
        console.log(`Cleaned up duplicates for username: ${dup.username}`);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Duplicates cleaned up', duplicates: duplicates.map(d => d.username) })
      };
    }

    // Verify databases exist
    const [rows] = await connection.query('SHOW DATABASES');
    console.log('Available databases:', rows.map(r => r.Database));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Databases initialized successfully', databases: ['auth_db', 'chat_db'] })
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (connection) await connection.end();
  }
};
