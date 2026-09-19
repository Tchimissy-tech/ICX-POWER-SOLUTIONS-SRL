const mysql = require('mysql2/promise');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log(JSON.stringify({ databaseConfigured: false, message: 'DATABASE_URL is not configured in this shell' }));
    return;
  }
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await connection.execute(
      'SELECT id, email, role, accountStatus FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      ['icxps.sale@outlook.com']
    );
    console.log(JSON.stringify({
      databaseConfigured: true,
      adminIdentity: rows[0] || null,
      invariant: rows[0]
        ? rows[0].role === 'super_admin' && rows[0].accountStatus === 'approved'
        : false,
    }));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ databaseConfigured: true, error: error.message }));
  process.exitCode = 1;
});
