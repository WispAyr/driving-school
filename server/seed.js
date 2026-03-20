import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import db, { initDB } from './db.js';

initDB();

const hash = (pw) => bcrypt.hashSync(pw, 10);

// Super admin
db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('admin@drivingschool.local-connect.uk', hash('admin123'), 'Super Admin', 'superadmin');

// Demo tenant: Ayr Driving School
const t1 = db.prepare(`INSERT OR IGNORE INTO tenants (name, slug, description, phone, email, city, postcode, tagline, about, pass_rate, total_passes, founded_year, primary_color, secondary_color, transmission_types) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run('Ayr Driving School', 'ayr-driving-school', 'Professional driving lessons in Ayrshire', '01292 123456', 'info@ayrdrivingschool.co.uk', 'Ayr', 'KA7', 'Your road to success starts here', 'Ayr Driving School has been helping learners pass their driving test since 2010. Our experienced, patient instructors provide structured lessons tailored to each student. We cover all of South Ayrshire with both manual and automatic lessons available.', 92.5, 1250, 2010, '#1e40af', '#3b82f6', 'manual,automatic');

const tenantId = t1.lastInsertRowid || db.prepare('SELECT id FROM tenants WHERE slug = ?').get('ayr-driving-school').id;

// Tenant admin
db.prepare('INSERT OR IGNORE INTO users (email, password, name, role, tenant_id) VALUES (?, ?, ?, ?, ?)').run('admin@ayrdrivingschool.co.uk', hash('admin123'), 'School Admin', 'admin', tenantId);

// Instructors
const instructors = [
  { email: 'james@ayrdrivingschool.co.uk', name: 'James McAllister', phone: '07700 100001', bio: 'Patient and experienced instructor with over 15 years teaching. Grade A ADI with an excellent first-time pass rate.', qualifications: 'ADI Grade A, Fleet Trainer', experience: 15, pass_rate: 94.2, passes: 420, transmission: 'manual', car_make: 'Ford', car_model: 'Fiesta', hourly: 38, badge: 'ADI/123456', grade: 'A', langs: 'English', specs: 'Nervous beginners,Motorway lessons,Refresher courses' },
  { email: 'sarah@ayrdrivingschool.co.uk', name: 'Sarah Campbell', phone: '07700 100002', bio: 'Friendly instructor specialising in automatic lessons. Great with nervous learners and those who need extra patience.', qualifications: 'ADI Grade A', experience: 8, pass_rate: 91.8, passes: 280, transmission: 'automatic', car_make: 'Toyota', car_model: 'Yaris', hourly: 36, badge: 'ADI/234567', grade: 'A', langs: 'English,French', specs: 'Automatic specialist,Nervous beginners,Female instructor' },
  { email: 'david@ayrdrivingschool.co.uk', name: 'David Thomson', phone: '07700 100003', bio: 'Experienced instructor covering Prestwick, Troon and surrounding areas. Intensive course specialist with flexible scheduling.', qualifications: 'ADI Grade B, ORDIT Trainer', experience: 12, pass_rate: 89.5, passes: 350, transmission: 'manual,automatic', car_make: 'Vauxhall', car_model: 'Corsa', hourly: 35, badge: 'ADI/345678', grade: 'B', langs: 'English', specs: 'Intensive courses,Pass Plus,Motorway lessons' },
];

for (const inst of instructors) {
  const ur = db.prepare('INSERT OR IGNORE INTO users (email, password, name, phone, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)').run(inst.email, hash('instructor123'), inst.name, inst.phone, 'instructor', tenantId);
  const uid = ur.lastInsertRowid || db.prepare('SELECT id FROM users WHERE email = ?').get(inst.email).id;
  db.prepare(`INSERT OR IGNORE INTO instructors (user_id, tenant_id, bio, qualifications, experience_years, pass_rate, total_passes, transmission_types, car_make, car_model, hourly_rate, badge_number, adi_grade, languages, specialities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uid, tenantId, inst.bio, inst.qualifications, inst.experience, inst.pass_rate, inst.passes, inst.transmission, inst.car_make, inst.car_model, inst.hourly, inst.badge, inst.grade, inst.langs, inst.specs);
}

// Areas
const areas = ['Ayr', 'Prestwick', 'Troon', 'Maybole', 'Girvan', 'Kilmarnock', 'Irvine', 'Cumnock'];
for (const a of areas) {
  db.prepare('INSERT OR IGNORE INTO areas (tenant_id, name, region) VALUES (?, ?, ?)').run(tenantId, a, 'South Ayrshire');
}

// Link instructors to areas
const allInstructors = db.prepare('SELECT id FROM instructors WHERE tenant_id = ?').all(tenantId);
const allAreas = db.prepare('SELECT id FROM areas WHERE tenant_id = ?').all(tenantId);
for (const inst of allInstructors) {
  const areaCount = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...allAreas].sort(() => Math.random() - 0.5).slice(0, areaCount);
  for (const a of shuffled) {
    db.prepare('INSERT OR IGNORE INTO instructor_areas (instructor_id, area_id) VALUES (?, ?)').run(inst.id, a.id);
  }
}

// Packages
const packages = [
  { name: 'Single Lesson', desc: 'Standard 1-hour driving lesson', count: 1, hours: 1, price: 38, type: 'standard', trans: 'manual', intensive: 0 },
  { name: '5 Lesson Block', desc: 'Save £15 with a block of 5 lessons', count: 5, hours: 5, price: 175, type: 'block', trans: 'manual', intensive: 0, discount: 8 },
  { name: '10 Lesson Block', desc: 'Save £40 with a block of 10 lessons', count: 10, hours: 10, price: 340, type: 'block', trans: 'manual', intensive: 0, discount: 11 },
  { name: '20 Lesson Block', desc: 'Best value — save £110 on 20 lessons', count: 20, hours: 20, price: 650, type: 'block', trans: 'manual', intensive: 0, discount: 14 },
  { name: 'Intensive Week', desc: '30 hours over 5 days — fast track to test ready', count: 30, hours: 30, price: 950, type: 'intensive', trans: 'manual', intensive: 1, discount: 17 },
  { name: 'Semi-Intensive', desc: '20 hours over 2 weeks — balanced approach', count: 20, hours: 20, price: 680, type: 'intensive', trans: 'manual', intensive: 1, discount: 11 },
  { name: 'Automatic Single', desc: 'Standard 1-hour automatic lesson', count: 1, hours: 1, price: 40, type: 'standard', trans: 'automatic', intensive: 0 },
  { name: 'Automatic 10 Block', desc: 'Save £30 on 10 automatic lessons', count: 10, hours: 10, price: 370, type: 'block', trans: 'automatic', intensive: 0, discount: 8 },
  { name: 'Pass Plus', desc: 'Post-test motorway and advanced driving', count: 6, hours: 6, price: 200, type: 'passplus', trans: 'manual', intensive: 0 },
];

for (const p of packages) {
  db.prepare('INSERT INTO packages (tenant_id, name, description, lesson_count, duration_hours, price, discount_percent, package_type, transmission, intensive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(tenantId, p.name, p.desc, p.count, p.hours, p.price, p.discount || 0, p.type, p.trans, p.intensive);
}

// Reviews
const reviews = [
  { name: 'Emma Wilson', rating: 5, title: 'Passed first time!', content: 'James was an amazing instructor. So patient and really helped build my confidence. Passed first time with only 2 minors!', passed: 1, center: 'Ayr Test Centre' },
  { name: 'Connor MacLeod', rating: 5, title: 'Brilliant automatic lessons', content: 'Sarah made learning to drive so easy. The automatic car was perfect for me and she explained everything clearly. Highly recommend!', passed: 1, center: 'Ayr Test Centre' },
  { name: 'Lisa Stewart', rating: 4, title: 'Great intensive course', content: 'Did the intensive week with David and passed at the end of it. It was hard work but worth it. Very professional throughout.', passed: 1, center: 'Ayr Test Centre' },
  { name: 'Ryan Burns', rating: 5, title: 'Excellent school', content: 'Cannot fault Ayr Driving School. Professional, friendly and they really care about getting you through your test. Best decision I made.', passed: 1, center: 'Ayr Test Centre' },
  { name: 'Sophie Anderson', rating: 5, title: 'Perfect for nervous learners', content: 'I was terrified of driving but Sarah was so calm and patient. She never made me feel rushed and built up my skills gradually. Now I love driving!', passed: 1, center: 'Ayr Test Centre' },
  { name: 'Mark Fraser', rating: 4, title: 'Good value lessons', content: 'The block booking prices are really competitive. James is a great instructor who knows all the test routes. Passed second time.', passed: 1, center: 'Ayr Test Centre' },
];

const instrIds = db.prepare('SELECT id FROM instructors WHERE tenant_id = ?').all(tenantId);
for (let i = 0; i < reviews.length; i++) {
  const r = reviews[i];
  db.prepare('INSERT INTO reviews (tenant_id, instructor_id, student_name, rating, title, content, passed, test_center, approved, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)')
    .run(tenantId, instrIds[i % instrIds.length].id, r.name, r.rating, r.title, r.content, r.passed ? 1 : 0, r.center);
}

// Theory resources
const theory = [
  { cat: 'Road Signs', title: 'Speed Limit Signs', content: 'Speed limit signs are circular with a red border. The number shows the maximum speed in mph.', q: 'What shape is a speed limit sign?', opts: ['Circular', 'Triangular', 'Rectangular', 'Diamond'], ans: 'Circular', exp: 'Speed limit signs are always circular with a red border.' },
  { cat: 'Road Signs', title: 'Warning Signs', content: 'Warning signs are triangular with a red border. They alert you to hazards ahead.', q: 'What does a triangular sign with a red border indicate?', opts: ['A warning', 'A speed limit', 'A direction', 'Parking'], ans: 'A warning', exp: 'Triangular signs with red borders are warning signs.' },
  { cat: 'Rules of the Road', title: 'Roundabout Rules', content: 'Give way to traffic from the right at a roundabout unless road markings indicate otherwise.', q: 'At a roundabout you should give way to traffic from...?', opts: ['The left', 'The right', 'Behind you', 'In front'], ans: 'The right', exp: 'UK roundabout rule: give way to traffic from the right.' },
  { cat: 'Safety', title: 'Stopping Distances', content: 'At 30mph, typical stopping distance is 23 metres (75 feet). This includes thinking distance and braking distance.', q: 'What is the typical stopping distance at 30mph?', opts: ['12 metres', '23 metres', '36 metres', '53 metres'], ans: '23 metres', exp: 'At 30mph: 9m thinking + 14m braking = 23m total.' },
  { cat: 'Safety', title: 'Tyres', content: 'The minimum legal tyre tread depth is 1.6mm across the central three-quarters of the tyre.', q: 'What is the minimum legal tyre tread depth?', opts: ['1.0mm', '1.6mm', '2.0mm', '3.0mm'], ans: '1.6mm', exp: 'The legal minimum tread depth in the UK is 1.6mm.' },
  { cat: 'Hazard Perception', title: 'Developing Hazards', content: 'A developing hazard is something that may cause you to change speed, direction or stop. Identify them early for best scores.', q: 'What is a developing hazard?', opts: ['A pothole', 'Something that may cause you to take action', 'A road sign', 'Another car'], ans: 'Something that may cause you to take action', exp: 'Developing hazards require you to change speed, direction, or stop.' },
];

for (const t of theory) {
  db.prepare('INSERT INTO theory_resources (tenant_id, title, category, content, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(null, t.title, t.cat, t.content, t.q, JSON.stringify(t.opts), t.ans, t.exp);
}

// Second demo tenant
const t2 = db.prepare(`INSERT OR IGNORE INTO tenants (name, slug, description, phone, email, city, postcode, tagline, about, pass_rate, total_passes, founded_year, primary_color, secondary_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run('Glasgow Drive Academy', 'glasgow-drive-academy', 'Premium driving lessons across Glasgow', '0141 234 5678', 'hello@glasgowdriveacademy.co.uk', 'Glasgow', 'G1', 'Drive with confidence', 'Glasgow Drive Academy offers premium driving tuition across the city. Our hand-picked instructors deliver structured, professional lessons to get you test-ready fast.', 90.0, 800, 2015, '#059669', '#047857');

console.log('✅ Database seeded successfully');
