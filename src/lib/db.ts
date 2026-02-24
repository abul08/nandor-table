import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'timetable.db');
const db = new Database(dbPath, { verbose: console.log });
console.log('Database initialized at:', dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS timetables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL, -- KINAN, MANAN, JINAN
    type TEXT NOT NULL, -- morning, afternoon
    row_index INTEGER NOT NULL,
    time_range TEXT NOT NULL,
    sun TEXT,
    mon TEXT,
    tue TEXT,
    wed TEXT,
    thu TEXT
  );

  CREATE TABLE IF NOT EXISTS uniform_days (
    category TEXT NOT NULL,
    day TEXT NOT NULL,
    is_uniform INTEGER DEFAULT 0,
    PRIMARY KEY (category, day)
  );

  CREATE TABLE IF NOT EXISTS holidays (
    category TEXT NOT NULL,
    day TEXT NOT NULL,
    is_holiday INTEGER DEFAULT 0,
    PRIMARY KEY (category, day)
  );
`);

// Seed initial data if tables are empty
const count = db.prepare('SELECT COUNT(*) as count FROM timetables').get() as { count: number };
if (count.count === 0) {
  const insertTimetable = db.prepare(`
    INSERT INTO timetables (category, type, row_index, time_range, sun, mon, tue, wed, thu)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const categories = ['KINAN', 'MANAN', 'JINAN'];
  const subjects = ["H&PE", "H&PE", "H&PE", "H&PE", "H&PE"];
  const days = ['sun', 'mon', 'tue', 'wed', 'thu'];

  categories.forEach(cat => {
    // Morning
    insertTimetable.run(cat, 'morning', 0, '7:15 - 8:00', ...subjects);
    insertTimetable.run(cat, 'morning', 1, '8:00 - 8:45', "MATH", ...subjects.slice(1));
    insertTimetable.run(cat, 'morning', 2, '8:45 - 9:30', "ISL", ...subjects.slice(1));

    // Afternoon
    insertTimetable.run(cat, 'afternoon', 0, '9:45 - 10:30', "QR", ...subjects.slice(1));
    insertTimetable.run(cat, 'afternoon', 1, '10:30 - 11:15', "ES", ...subjects.slice(1));
    insertTimetable.run(cat, 'afternoon', 2, '11:15 - 12:00', "CA", ...subjects.slice(1));

    // Uniform
    days.forEach(day => {
      db.prepare('INSERT INTO uniform_days (category, day, is_uniform) VALUES (?, ?, ?)')
        .run(cat, day, day === 'sun' ? 1 : 0);
    });

    // Initial Holiday Status
    days.forEach(day => {
      db.prepare('INSERT INTO holidays (category, day, is_holiday) VALUES (?, ?, 0)').run(cat, day);
    });
  });
}

export default db;
