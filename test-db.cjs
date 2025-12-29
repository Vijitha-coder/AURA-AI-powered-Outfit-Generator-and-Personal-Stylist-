const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.resolve(__dirname, 'wardrobe.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('DB open error:', err.message);
    process.exit(1);
  }
});

db.get('SELECT COUNT(*) AS cnt FROM wardrobe', (err, row) => {
  if (err) {
    console.error('Query error (table probably missing):', err.message);
    process.exit(1);
  }
  console.log('wardrobe row count =', row.cnt);
  db.close();
});
