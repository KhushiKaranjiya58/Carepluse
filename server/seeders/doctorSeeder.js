/**
 * Doctor Seeder
 * Seeds 6 doctor profiles with different specializations if they don't exist
 */

const User = require('../models/User');

const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'General Physician',
];

const seedDoctors = [
  {
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@carepluse.com',
    password: 'doctor123',
    phone: '+1 555-0101',
    role: 'doctor',
    specialization: 'Cardiologist',
    experience: 15,
    qualification: 'MBBS, MD (Cardiology)',
    consultationFee: 200,
    profilePhoto: 'https://i.pravatar.cc/150?img=5',
    rating: 4.9,
    bio: 'Expert cardiologist specializing in heart disease prevention and treatment with over 15 years of experience.',
    isActive: true,
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@carepluse.com',
    password: 'doctor123',
    phone: '+1 555-0102',
    role: 'doctor',
    specialization: 'Dermatologist',
    experience: 12,
    qualification: 'MBBS, MD (Dermatology)',
    consultationFee: 150,
    profilePhoto: 'https://i.pravatar.cc/150?img=12',
    rating: 4.7,
    bio: 'Board-certified dermatologist focused on skin care, acne treatment, and cosmetic dermatology.',
    isActive: true,
  },
  {
    name: 'Dr. Emily Chen',
    email: 'emily.chen@carepluse.com',
    password: 'doctor123',
    phone: '+1 555-0103',
    role: 'doctor',
    specialization: 'Neurologist',
    experience: 18,
    qualification: 'MBBS, DM (Neurology)',
    consultationFee: 250,
    profilePhoto: 'https://i.pravatar.cc/150?img=9',
    rating: 4.8,
    bio: 'Neurologist with expertise in headaches, epilepsy, and neurodegenerative disorders.',
    isActive: true,
  },
  {
    name: 'Dr. Michael Brown',
    email: 'michael.brown@carepluse.com',
    password: 'doctor123',
    phone: '+1 555-0104',
    role: 'doctor',
    specialization: 'Orthopedic',
    experience: 20,
    qualification: 'MBBS, MS (Orthopedics)',
    consultationFee: 180,
    profilePhoto: 'https://i.pravatar.cc/150?img=15',
    rating: 4.6,
    bio: 'Orthopedic surgeon specializing in joint replacement, sports injuries, and fracture care.',
    isActive: true,
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@carepluse.com',
    password: 'doctor123',
    phone: '+1 555-0105',
    role: 'doctor',
    specialization: 'Pediatrician',
    experience: 10,
    qualification: 'MBBS, MD (Pediatrics)',
    consultationFee: 120,
    profilePhoto: 'https://i.pravatar.cc/150?img=20',
    rating: 4.9,
    bio: 'Caring pediatrician dedicated to child health, vaccinations, and developmental care.',
    isActive: true,
  },
  {
    name: 'Dr. Robert Taylor',
    email: 'robert.taylor@carepluse.com',
    password: 'doctor123',
    phone: '+1 555-0106',
    role: 'doctor',
    specialization: 'General Physician',
    experience: 14,
    qualification: 'MBBS, MD (General Medicine)',
    consultationFee: 100,
    profilePhoto: 'https://i.pravatar.cc/150?img=33',
    rating: 4.5,
    bio: 'General physician providing comprehensive primary care and preventive health services.',
    isActive: true,
  },
];

const seedDoctorProfiles = async () => {
  try {
    let seeded = 0;

    for (const doctor of seedDoctors) {
      const exists = await User.findOne({ email: doctor.email });
      if (!exists) {
        await User.create(doctor);
        seeded++;
      }
    }

    if (seeded > 0) {
      console.log(`Seeded ${seeded} doctor profile(s).`);
    }
  } catch (error) {
    console.error('Doctor seeder error:', error.message);
  }
};

module.exports = { seedDoctorProfiles, SPECIALIZATIONS };
