// ============================================
// SEED FILE — Sample data for MongoDB Compass
// Run: npm run seed
// ============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Winner = require('./models/Winner');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    await Winner.deleteMany();
    console.log('🗑️  Cleared existing data');

    // ---- Create Users ----
    const admin1 = await User.create({
      name: 'Dr. Ramesh Kumar',
      email: 'admin@annauniv.edu',
      password: 'admin123',
      role: 'admin',
      college: 'Anna University',
    });

    const admin2 = await User.create({
      name: 'Prof. Suresh Babu',
      email: 'admin@psgtech.edu',
      password: 'admin123',
      role: 'admin',
      college: 'PSG Tech',
    });

    const student1 = await User.create({
      name: 'Priya Nair',
      email: 'priya@student.edu',
      password: 'student123',
      role: 'student',
      college: 'VIT Vellore',
      department: 'CSE',
      year: 3,
    });

    const student2 = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun@student.edu',
      password: 'student123',
      role: 'student',
      college: 'SRM Institute',
      department: 'ECE',
      year: 2,
    });

    const student3 = await User.create({
      name: 'Kavya Reddy',
      email: 'kavya@student.edu',
      password: 'student123',
      role: 'student',
      college: 'Anna University',
      department: 'IT',
      year: 4,
    });

    console.log('👤 Users created');

    // ---- Create Events ----
    const event1 = await Event.create({
      title: 'National Hackathon 2026',
      description: 'A 24-hour hackathon for students to build innovative solutions.',
      category: 'technical',
      college: 'Anna University',
      createdBy: admin1._id,
      date: new Date('2026-05-15'),
      registrationDeadline: new Date('2026-05-10'),
      venue: 'Main Auditorium, Anna University',
      maxParticipants: 200,
      registeredCount: 3,
      status: 'upcoming',
      prizes: { first: '₹50,000', second: '₹25,000', third: '₹10,000' },
      tags: ['coding', 'innovation', 'tech'],
    });

    const event2 = await Event.create({
      title: 'Cultural Fest — Kaleidoscope',
      description: 'Annual cultural festival with dance, music, and drama competitions.',
      category: 'cultural',
      college: 'PSG Tech',
      createdBy: admin2._id,
      date: new Date('2026-04-20'),
      registrationDeadline: new Date('2026-04-15'),
      venue: 'Open Air Theatre, PSG Tech',
      maxParticipants: 500,
      registeredCount: 2,
      status: 'upcoming',
      prizes: { first: '₹20,000', second: '₹10,000', third: '₹5,000' },
      tags: ['dance', 'music', 'drama'],
    });

    const event3 = await Event.create({
      title: 'Inter-College Quiz Bowl',
      description: 'Test your knowledge across science, tech, history, and current affairs.',
      category: 'academic',
      college: 'Anna University',
      createdBy: admin1._id,
      date: new Date('2026-03-10'),
      registrationDeadline: new Date('2026-03-05'),
      venue: 'Seminar Hall A',
      maxParticipants: 100,
      registeredCount: 2,
      status: 'completed',
      prizes: { first: '₹15,000', second: '₹8,000', third: '₹3,000' },
      tags: ['quiz', 'knowledge'],
    });

    console.log('📅 Events created');

    // ---- Create Registrations ----
    await Registration.create({ event: event1._id, student: student1._id, status: 'registered' });
    await Registration.create({ event: event1._id, student: student2._id, status: 'registered' });
    await Registration.create({ event: event1._id, student: student3._id, status: 'registered' });
    await Registration.create({ event: event2._id, student: student1._id, status: 'registered' });
    await Registration.create({ event: event2._id, student: student2._id, status: 'registered' });
    await Registration.create({ event: event3._id, student: student1._id, status: 'attended' });
    await Registration.create({ event: event3._id, student: student3._id, status: 'attended' });

    console.log('📝 Registrations created');

    // ---- Create Winners (for completed event) ----
    await Winner.create({ event: event3._id, student: student1._id, position: '1st', prize: '₹15,000', declaredBy: admin1._id });
    await Winner.create({ event: event3._id, student: student3._id, position: '2nd', prize: '₹8,000', declaredBy: admin1._id });

    console.log('🏆 Winners declared');

    console.log('\n✅ Seed complete! Login credentials:');
    console.log('   Admin  → admin@annauniv.edu  / admin123');
    console.log('   Admin  → admin@psgtech.edu   / admin123');
    console.log('   Student→ priya@student.edu   / student123');
    console.log('   Student→ arjun@student.edu   / student123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
