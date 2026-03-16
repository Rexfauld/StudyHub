// seeds/kstuSeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/Subject');

const faculties = [
  {
    faculty: 'Business School',
    depts: [
      'Department of Procurement and Supply Chain Management',
      'Department of Marketing',
      'Department of Management Studies',
      'Department of Liberal Studies',
      'Department of Accountancy and Accounting Information Systems',
      'Department of Banking Technology and Finance'
    ]
  },
  {
    faculty: 'Faculty of Applied Sciences and Technology',
    depts: [
      'Department of Statistical Sciences',
      'Department Of Mathematical Sciences',
      'Department Of Information Science',
      'Department of Computer Science',
      'Department of Food Technology'
    ]
  },
  {
    faculty: 'Faculty of Built and Natural Environment',
    depts: [
      'Department of Interior Design and Materials Technology',
      'Department of Estate Management',
      'Department of Construction Technology and Quantity Surveying'
    ]
  },
  {
    faculty: 'Faculty of Creative Arts and Technology',
    depts: [
      'Department of Graphic Design',
      'Department of Fashion Design and Textiles'
    ]
  },
  {
    faculty: 'Faculty of Engineering and Technology',
    depts: [
      'Department Of Oil And Gas Engineering',
      'Department of Mechanical Engineering',
      'Department Of Energy And Environmental Engineering',
      'Department Of Electrical and Electronic Engineering',
      'Department of Civil Engineering',
      'Department of Chemical Engineering',
      'Department Of Automotive And Agricultural Mechanisation Engineering'
    ]
  },
  {
    faculty: 'Faculty of Entrepreneurship and Enterprise Development',
    depts: [
      'Department of Entrepreneurship and Finance',
      'Department of Agropreneurship'
    ]
  },
  {
    faculty: 'Faculty of Health Sciences',
    depts: [
      'Department of Pharmaceutical Sciences',
      'Department Of Laboratory Technology'
    ]
  },
  {
    faculty: 'Graduate School',
    depts: [
      'Graduate programmes (MBA, MSc, PGDip etc.) — see KsTU Graduate School'
    ]
  }
];

async function seed(){
  await mongoose.connect(process.env.MONGO_URI);
  await Subject.deleteMany({});
  for(const f of faculties){
    // create a parent subject for faculty
    const facultyDoc = await Subject.create({
      level: 'university',
      title: f.faculty,
      slug: `faculty-${f.faculty.toLowerCase().replace(/\s+/g,'-')}`,
      meta: { isFaculty: true }
    });
    for(const d of f.depts){
      await Subject.create({
        level:'university',
        title:d,
        slug: `${facultyDoc.slug}-${d.toLowerCase().replace(/\s+/g,'-')}`,
        meta: { faculty: f.faculty }
      });
    }
  }
  console.log('Seed done');
  process.exit(0);
}

seed().catch(e=>{console.error(e); process.exit(1);});