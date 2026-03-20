import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/driving-school.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      tenant_id INTEGER,
      phone TEXT,
      avatar TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo TEXT,
      primary_color TEXT DEFAULT '#2563eb',
      secondary_color TEXT DEFAULT '#1e40af',
      description TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      address TEXT,
      city TEXT,
      postcode TEXT,
      tagline TEXT,
      about TEXT,
      founded_year INTEGER,
      pass_rate REAL,
      total_passes INTEGER DEFAULT 0,
      transmission_types TEXT DEFAULT 'manual,automatic',
      active INTEGER DEFAULT 1,
      plan TEXT DEFAULT 'basic',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS instructors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      bio TEXT,
      qualifications TEXT,
      experience_years INTEGER DEFAULT 0,
      pass_rate REAL,
      total_passes INTEGER DEFAULT 0,
      transmission_types TEXT DEFAULT 'manual',
      car_make TEXT,
      car_model TEXT,
      car_year INTEGER,
      hourly_rate REAL,
      badge_number TEXT,
      adi_grade TEXT,
      languages TEXT DEFAULT 'English',
      specialities TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      postcode_prefix TEXT,
      region TEXT,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS instructor_areas (
      instructor_id INTEGER NOT NULL,
      area_id INTEGER NOT NULL,
      PRIMARY KEY (instructor_id, area_id),
      FOREIGN KEY (instructor_id) REFERENCES instructors(id),
      FOREIGN KEY (area_id) REFERENCES areas(id)
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      lesson_count INTEGER,
      duration_hours REAL,
      price REAL NOT NULL,
      discount_percent REAL DEFAULT 0,
      package_type TEXT DEFAULT 'standard',
      transmission TEXT DEFAULT 'manual',
      intensive INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      student_id INTEGER,
      instructor_id INTEGER,
      package_id INTEGER,
      booking_type TEXT DEFAULT 'enquiry',
      status TEXT DEFAULT 'pending',
      name TEXT,
      email TEXT,
      phone TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      transmission TEXT DEFAULT 'manual',
      pickup_postcode TEXT,
      notes TEXT,
      lesson_date TEXT,
      lesson_time TEXT,
      duration_minutes INTEGER DEFAULT 60,
      price REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (instructor_id) REFERENCES instructors(id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      instructor_id INTEGER,
      student_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT,
      content TEXT NOT NULL,
      passed INTEGER DEFAULT 0,
      test_center TEXT,
      verified INTEGER DEFAULT 0,
      approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (instructor_id) REFERENCES instructors(id)
    );

    CREATE TABLE IF NOT EXISTS theory_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT,
      question TEXT,
      options TEXT,
      correct_answer TEXT,
      explanation TEXT,
      difficulty TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      instructor_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      lesson_date TEXT,
      topic TEXT,
      score INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (instructor_id) REFERENCES instructors(id),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );
  `);
}

export default db;
