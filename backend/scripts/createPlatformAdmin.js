// Internal utility: create or update a platform_admin user
// Usage:
//   node scripts/createPlatformAdmin.js --name="Platform Admin" --email="admin@example.com" --password="StrongPass@123"

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const getArg = (key) => {
  const arg = process.argv.find((a) => a.startsWith(`--${key}=`));
  return arg ? arg.split('=').slice(1).join('=').trim() : '';
};

const main = async () => {
  const name = getArg('name');
  const email = getArg('email').toLowerCase();
  const password = getArg('password');

  if (!name || !email || !password) {
    console.error('Missing required arguments.');
    console.error('Example: node scripts/createPlatformAdmin.js --name="Platform Admin" --email="admin@example.com" --password="StrongPass@123"');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters long.');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing.length > 0) {
      await connection.execute(
        `UPDATE users
         SET name = ?, password = ?, role = 'platform_admin', company_id = NULL, is_verified = TRUE
         WHERE id = ?`,
        [name, hashedPassword, existing[0].id]
      );
      console.log(`Updated existing user (id=${existing[0].id}) as platform_admin.`);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password, role, company_id, is_verified)
         VALUES (?, ?, ?, 'platform_admin', NULL, TRUE)`,
        [name, email, hashedPassword]
      );
      console.log(`Created platform_admin user with id=${result.insertId}.`);
    }

    console.log('Done. You can now login via /auth/login with this user.');
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error('Failed to create platform admin:', error.message);
  process.exit(1);
});
