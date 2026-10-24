'use strict';
window.ShindalData = [
  {
    id: 'speech',
    name: 'Speech therapy',
    description:
      'Correction of speech sounds, vocabulary and phrase building through play and repetition.',
    price: 7000,
    minutes: 40,
    image: 'images/Speech%20therapy.png',
    category: 'Development',
    specialists: ['Yerlan Zhaksybekov', 'Aigerim Nurlankyzy', 'Dana Serikova'],
  },
  {
    id: 'defectology',
    name: 'Special education (defectology)',
    description:
      'Individual correction and development program for children with developmental needs.',
    price: 7000,
    minutes: 40,
    image: 'images/Special%20education%20%28defectology%29.png',
    category: 'Development',
    specialists: ['Yerlan Zhaksybekov', 'Timur Akhmetov', 'Gulnara Ospanova'],
  },
  {
    id: 'psychology',
    name: 'Psychology',
    description:
      'Support for emotional and behavioral development, plus advice for parents.',
    price: 7000,
    minutes: 40,
    image: 'images/Psychology.png',
    category: 'Development',
    specialists: ['Dana Serikova', 'Askhat Dyussenov', 'Madina Kairatkyzy'],
  },
  {
    id: 'afe',
    name: 'Adaptive physical education (AFE)',
    description:
      "Movement, coordination and posture development adapted to the child's abilities.",
    price: 6000,
    minutes: 40,
    image: 'images/Adaptive%20physical%20education%20%28AFE%29.png',
    category: 'Development',
    specialists: ['Nurbol Satybaldy', 'Zhanna Tolegenova', 'Bekzat Assanov'],
  },
  {
    id: 'aba',
    name: 'ABA therapy',
    description:
      'Therapy based on the analysis of behavior: building skills and reducing difficult behavior.',
    price: 7000,
    minutes: 40,
    image: 'images/ABA%20therapy.png',
    category: 'Development',
    specialists: ['Timur Akhmetov', 'Ainur Zhumabekova'],
  },
  {
    id: 'sensory',
    name: 'Sensory integration',
    description:
      'Structured play that helps the child process sensory information from the body.',
    price: 7000,
    minutes: 40,
    image: 'images/Sensory%20integration.jpeg',
    category: 'Development',
    specialists: ['Ainur Zhumabekova', 'Damir Nurlanov', 'Saya Bekova'],
  },
  {
    id: 'neuropsychology',
    name: 'Neuropsychology',
    description:
      'Assessment of how brain function affects attention, learning and behavior.',
    price: 7000,
    minutes: 40,
    image: 'images/Neuropsychology.png',
    category: 'Development',
    specialists: ['Askhat Dyussenov', 'Rinat Abenov', 'Kamila Yerzhanova'],
  },
  {
    id: 'neurology',
    name: 'Neurology consultations',
    description:
      'Consultation with a neurologist and recommendations for further work.',
    price: 10000,
    minutes: 40,
    image: 'images/Neurology%20consultations.png',
    category: 'Consultation',
    specialists: ['Rinat Abenov', 'Kamila Yerzhanova'],
  },
];

// Fictional demonstration staff and scheduling rules, shared by booking and tests.
window.ShindalBooking = (() => {
  const names = {
    astana: [
      'Aruzhan Saparova',
      'Daniyar Beketov',
      'Amina Zholdasova',
      'Nursultan Omarov',
      'Aisulu Temirkhanova',
      'Miras Alimov',
      'Zarina Esenova',
      'Adil Kenzhebayev',
    ],
    kosshy: [
      'Alina Rakhimova',
      'Sanzhar Suleimenov',
      'Dinara Kassenova',
      'Olzhas Tursynov',
      'Zhanar Baibekova',
      'Ruslan Mukanov',
      'Assel Karibayeva',
      'Yernar Dosov',
    ],
    taraz: [
      'Malika Nurpeisova',
      'Dias Seitzhanov',
      'Gaukhar Abilova',
      'Arman Sadykov',
      'Meruert Toktarova',
      'Azamat Iskakov',
      'Saltanat Zhumagaliyeva',
      'Bauyrzhan Niyetov',
    ],
  };
  const roster = (branch, service) => {
    const index = window.ShindalData.findIndex((item) => item.id === service);
    return names[branch] && index >= 0 ? [names[branch][index]] : [];
  };
  const day = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();
  const hours = (period) =>
    period === 'morning'
      ? [8, 9, 10, 11, 12]
      : period === 'afternoon'
        ? [14, 15, 16, 17, 18]
        : [];
  const iso = (date) => date.toISOString().slice(0, 10);
  // Calendar month, exclusive end; Jan 31 ends Feb 28 (or Feb 29).
  const monthEnd = (start) => {
    const d = new Date(`${start}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) return '';
    const original = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const last = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
    ).getUTCDate();
    d.setUTCDate(Math.min(original, last));
    return iso(d);
  };
  return { roster, day, hours, monthEnd };
})();

window.ShindalWeekly = (() => {
  const B = window.ShindalBooking;
  const valid = (date) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(new Date(`${date}T12:00:00Z`).getTime()) &&
    new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
  const weeks = (start) => {
    if (!valid(start)) return [];
    const end = B.monthEnd(start),
      result = [];
    let bucket = [];
    for (
      let d = new Date(`${start}T12:00:00Z`);
      d.toISOString().slice(0, 10) < end;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const day = d.getUTCDay();
      if (day === 1 && bucket.length) {
        result.push(bucket);
        bucket = [];
      }
      if (day !== 0) bucket.push(d.toISOString().slice(0, 10));
    }
    if (bucket.length) result.push(bucket);
    return result.slice(0, 4);
  };
  const periods = (date) =>
    valid(date) && B.day(date) !== 0
      ? B.day(date) === 6
        ? ['morning']
        : ['morning', 'afternoon']
      : [];
  const slots = (date, period) =>
    periods(date).includes(period)
      ? B.hours(period).map((hour) => `${String(hour).padStart(2, '0')}:00`)
      : [];
  const build = ({ branch, start, mode, lessons }, now = new Date()) => {
    const errors = {},
      appointments = [];
    const groups = mode === 'monthly' ? weeks(start) : [[start]];
    if (!['single', 'monthly'].includes(mode))
      errors['plan-mode'] = 'Choose a booking plan.';
    if (!valid(start) || B.day(start) === 0)
      errors['visit-date'] = 'Choose a valid start date. Sunday is closed.';
    const expected = mode === 'monthly' ? 4 : 1;
    if (!expected || lessons.length !== expected)
      errors['visit-date'] =
        'Choose a start date to create the lesson schedule.';
    const seen = new Set();
    lessons.forEach((lesson, index) => {
      const key = lesson.key || `lesson-${index}`,
        allowed = groups[mode === 'monthly' ? index : 0] || [];
      if (!allowed.includes(lesson.date))
        errors[`${key}-date`] = 'Choose a day from this week.';
      if (!periods(lesson.date).includes(lesson.period))
        errors[`${key}-period`] = 'Choose a period. Saturday: morning only.';
      if (!slots(lesson.date, lesson.period).includes(lesson.slot))
        errors[`${key}-slot`] = 'Choose a 40-minute lesson time.';
      else if (new Date(`${lesson.date}T${lesson.slot}:00+05:00`) <= now)
        errors[`${key}-slot`] = 'Choose a future lesson time.';
      const item = window.ShindalData.find(
        (item) => item.id === lesson.service,
      );
      if (!item) errors[`${key}-service`] = 'Choose a service.';
      if (!B.roster(branch, lesson.service).includes(lesson.specialist))
        errors[`${key}-specialist`] =
          'Choose the specialist for this branch and service.';
      const unique = `${lesson.date}/${lesson.slot}`;
      if (seen.has(unique))
        errors[`${key}-slot`] =
          'This child already has a lesson at this time. Choose a different time.';
      seen.add(unique);
      if (item)
        appointments.push({
          date: lesson.date,
          slot: lesson.slot,
          time: `${lesson.slot}–${lesson.slot.slice(0, 2)}:40`,
          period: lesson.period,
          branch,
          service: item.name,
          serviceId: item.id,
          specialist: lesson.specialist,
          quantity: 1,
          total: item.price,
          week: mode === 'monthly' ? index + 1 : 1,
        });
    });
    return {
      errors,
      appointments,
      total: appointments.reduce((sum, row) => sum + row.total, 0),
      weeks: groups.length,
      end: B.monthEnd(start),
    };
  };
  return { valid, weeks, periods, slots, build };
})();

window.ShindalBranches = [
  {
    id: 'astana',
    name: 'Astana',
    address: '27/1 Ilyas Omarov Street, Astana',
    phone: '+7 747 826 39 15',
    number: '+77478263915',
  },
  {
    id: 'kosshy',
    name: 'Kosshy',
    address: '21 Turar Ryskulov Street, Kosshy',
    phone: '+7 778 658 45 50',
    number: '+77786584550',
  },
  {
    id: 'taraz',
    name: 'Taraz',
    address: 'Myngbulak microdistrict, 3, Taraz',
    phone: '+7 707 482 16 98',
    number: '+77074821698',
  },
];

// Persisted fictional biographies for the classroom mock-up.
window.ShindalStaffProfiles = [
  {
    id: 'astana-speech',
    branch: 'astana',
    serviceId: 'speech',
    age: 38,
    experienceYears: 8,
    education: 'Samgau Institute of Education (fictional)',
    certificate:
      'Speech and Language Development — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
  {
    id: 'astana-defectology',
    branch: 'astana',
    serviceId: 'defectology',
    age: 39,
    experienceYears: 3,
    education: 'Bilim Child Development Institute (fictional)',
    certificate:
      'Inclusive Learning and Special Education — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'astana-psychology',
    branch: 'astana',
    serviceId: 'psychology',
    age: 29,
    experienceYears: 3,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Child Psychology and Family Support — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'astana-afe',
    branch: 'astana',
    serviceId: 'afe',
    age: 39,
    experienceYears: 8,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Adaptive Movement and Coordination — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'astana-aba',
    branch: 'astana',
    serviceId: 'aba',
    age: 27,
    experienceYears: 4,
    education: 'Bilim Child Development Institute (fictional)',
    certificate: 'Behavior Support Foundations — sample completion certificate',
    description:
      'Uses structured activities and play to support individual goals.',
    fictional: true,
  },
  {
    id: 'astana-sensory',
    branch: 'astana',
    serviceId: 'sensory',
    age: 26,
    experienceYears: 2,
    education: 'Orken Pedagogical University (fictional)',
    certificate: 'Sensory Processing and Play — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'astana-neuropsychology',
    branch: 'astana',
    serviceId: 'neuropsychology',
    age: 38,
    experienceYears: 9,
    education: 'Samgau Institute of Education (fictional)',
    certificate:
      'Attention and Learning Support — sample completion certificate',
    description:
      'Combines individual practice with practical guidance for families.',
    fictional: true,
  },
  {
    id: 'astana-neurology',
    branch: 'astana',
    serviceId: 'neurology',
    age: 26,
    experienceYears: 2,
    education: 'Damu Human Sciences University (fictional)',
    certificate:
      'Child Neurological Assessment — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
  {
    id: 'kosshy-speech',
    branch: 'kosshy',
    serviceId: 'speech',
    age: 37,
    experienceYears: 10,
    education: 'Bilim Child Development Institute (fictional)',
    certificate:
      'Speech and Language Development — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'kosshy-defectology',
    branch: 'kosshy',
    serviceId: 'defectology',
    age: 35,
    experienceYears: 5,
    education: 'Samgau Institute of Education (fictional)',
    certificate:
      'Inclusive Learning and Special Education — sample completion certificate',
    description:
      'Combines individual practice with practical guidance for families.',
    fictional: true,
  },
  {
    id: 'kosshy-psychology',
    branch: 'kosshy',
    serviceId: 'psychology',
    age: 39,
    experienceYears: 12,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Child Psychology and Family Support — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'kosshy-afe',
    branch: 'kosshy',
    serviceId: 'afe',
    age: 34,
    experienceYears: 5,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Adaptive Movement and Coordination — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'kosshy-aba',
    branch: 'kosshy',
    serviceId: 'aba',
    age: 30,
    experienceYears: 7,
    education: 'Damu Human Sciences University (fictional)',
    certificate: 'Behavior Support Foundations — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'kosshy-sensory',
    branch: 'kosshy',
    serviceId: 'sensory',
    age: 37,
    experienceYears: 7,
    education: 'Damu Human Sciences University (fictional)',
    certificate: 'Sensory Processing and Play — sample completion certificate',
    description:
      'Combines individual practice with practical guidance for families.',
    fictional: true,
  },
  {
    id: 'kosshy-neuropsychology',
    branch: 'kosshy',
    serviceId: 'neuropsychology',
    age: 26,
    experienceYears: 2,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Attention and Learning Support — sample completion certificate',
    description:
      'Uses structured activities and play to support individual goals.',
    fictional: true,
  },
  {
    id: 'kosshy-neurology',
    branch: 'kosshy',
    serviceId: 'neurology',
    age: 29,
    experienceYears: 5,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Child Neurological Assessment — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'taraz-speech',
    branch: 'taraz',
    serviceId: 'speech',
    age: 36,
    experienceYears: 8,
    education: 'Samgau Institute of Education (fictional)',
    certificate:
      'Speech and Language Development — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
  {
    id: 'taraz-defectology',
    branch: 'taraz',
    serviceId: 'defectology',
    age: 33,
    experienceYears: 8,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Inclusive Learning and Special Education — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
  {
    id: 'taraz-psychology',
    branch: 'taraz',
    serviceId: 'psychology',
    age: 25,
    experienceYears: 2,
    education: 'Bilim Child Development Institute (fictional)',
    certificate:
      'Child Psychology and Family Support — sample completion certificate',
    description:
      'Combines individual practice with practical guidance for families.',
    fictional: true,
  },
  {
    id: 'taraz-afe',
    branch: 'taraz',
    serviceId: 'afe',
    age: 36,
    experienceYears: 6,
    education: 'Bilim Child Development Institute (fictional)',
    certificate:
      'Adaptive Movement and Coordination — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
  {
    id: 'taraz-aba',
    branch: 'taraz',
    serviceId: 'aba',
    age: 25,
    experienceYears: 2,
    education: 'Bilim Child Development Institute (fictional)',
    certificate: 'Behavior Support Foundations — sample completion certificate',
    description: 'Builds step-by-step activities around each child’s pace.',
    fictional: true,
  },
  {
    id: 'taraz-sensory',
    branch: 'taraz',
    serviceId: 'sensory',
    age: 32,
    experienceYears: 9,
    education: 'Samgau Institute of Education (fictional)',
    certificate: 'Sensory Processing and Play — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
  {
    id: 'taraz-neuropsychology',
    branch: 'taraz',
    serviceId: 'neuropsychology',
    age: 31,
    experienceYears: 4,
    education: 'Samgau Institute of Education (fictional)',
    certificate:
      'Attention and Learning Support — sample completion certificate',
    description:
      'Uses structured activities and play to support individual goals.',
    fictional: true,
  },
  {
    id: 'taraz-neurology',
    branch: 'taraz',
    serviceId: 'neurology',
    age: 32,
    experienceYears: 5,
    education: 'Orken Pedagogical University (fictional)',
    certificate:
      'Child Neurological Assessment — sample completion certificate',
    description:
      'Explains session goals clearly and works closely with parents.',
    fictional: true,
  },
];
