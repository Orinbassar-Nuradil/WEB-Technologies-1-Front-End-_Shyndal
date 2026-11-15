'use strict';
// data.js — the real data of the Shindal center. Only data lives here: no DOM code.
// Every page that shows services, branches or opening hours builds its markup from these arrays and objects.

const SESSION_MINUTES = 40;

// Services: price in tenge, minutes per session, category, and the specialists who lead the service.
const SERVICES = [
  {id: 'speech', name: 'Speech therapy', description: 'Correction of speech sounds, vocabulary and phrase building through play and repetition.', price: 7000, minutes: SESSION_MINUTES, image: 'images/Speech%20therapy.png', category: 'Development', role: 'Speech therapist', specialists: ['Yerlan Zhaksybekov', 'Aigerim Nurlankyzy', 'Dana Serikova']},
  {id: 'defectology', name: 'Special education (defectology)', description: 'Individual correction and development program for children with developmental needs.', price: 7000, minutes: SESSION_MINUTES, image: 'images/Special%20education%20%28defectology%29.png', category: 'Development', role: 'Special education teacher', specialists: ['Yerlan Zhaksybekov', 'Timur Akhmetov', 'Gulnara Ospanova']},
  {id: 'psychology', name: 'Psychology', description: 'Support for emotional and behavioral development, plus advice for parents.', price: 7000, minutes: SESSION_MINUTES, image: 'images/Psychology.png', category: 'Development', role: 'Psychologist', specialists: ['Dana Serikova', 'Askhat Dyussenov', 'Madina Kairatkyzy']},
  {id: 'afe', name: 'Adaptive physical education (AFE)', description: "Movement, coordination and posture development adapted to the child's abilities.", price: 6000, minutes: SESSION_MINUTES, image: 'images/Adaptive%20physical%20education%20%28AFE%29.png', category: 'Development', role: 'AFE specialist', specialists: ['Nurbol Satybaldy', 'Zhanna Tolegenova', 'Bekzat Assanov']},
  {id: 'aba', name: 'ABA therapy', description: 'Therapy based on the analysis of behavior: building skills and reducing difficult behavior.', price: 7000, minutes: SESSION_MINUTES, image: 'images/ABA%20therapy.png', category: 'Development', role: 'ABA therapist', specialists: ['Timur Akhmetov', 'Ainur Zhumabekova']},
  {id: 'sensory', name: 'Sensory integration', description: 'Structured play that helps the child process sensory information from the body.', price: 7000, minutes: SESSION_MINUTES, image: 'images/Sensory%20integration.jpeg', category: 'Development', role: 'Sensory integration specialist', specialists: ['Ainur Zhumabekova', 'Damir Nurlanov', 'Saya Bekova']},
  {id: 'neuropsychology', name: 'Neuropsychology', description: 'Assessment of how brain function affects attention, learning and behavior.', price: 7000, minutes: SESSION_MINUTES, image: 'images/Neuropsychology.png', category: 'Development', role: 'Neuropsychologist', specialists: ['Askhat Dyussenov', 'Rinat Abenov', 'Kamila Yerzhanova']},
  {id: 'neurology', name: 'Neurology consultations', description: 'Consultation with a neurologist and recommendations for further work.', price: 10000, minutes: SESSION_MINUTES, image: 'images/Neurology%20consultations.png', category: 'Consultation', role: 'Neurologist', specialists: ['Rinat Abenov', 'Kamila Yerzhanova']}
];

// Branches: the same three addresses and phones as on the About, Help and Home pages.
const BRANCHES = [
  {id: 'astana', name: 'Astana', address: '27/1 Ilyas Omarov Street, Astana', phone: '+7 747 826 39 15'},
  {id: 'kosshy', name: 'Kosshy', address: '21 Turar Ryskulov Street, Kosshy', phone: '+7 778 658 45 50'},
  {id: 'taraz', name: 'Taraz', address: 'Myngbulak microdistrict, 3, Taraz', phone: '+7 707 482 16 98'}
];

// Opening hours (24-hour clock, minutes are written as hour * 60 + minute).
// Weekday sessions run from 08:00 to 13:00 and from 14:00 to 19:00.
// Saturday by appointment; Sunday closed.
const HOURS = {
  workdays: [1, 2, 3, 4, 5],
  open: 8 * 60,
  lunchStart: 13 * 60,
  lunchEnd: 14 * 60,
  close: 19 * 60,
  byAppointmentDay: 6,
  closedDay: 0
};

// The two parts of the working day offered in the booking form (start and end are minutes since midnight).
const SESSION_PERIODS = [
  {id: 'morning', name: 'Morning', start: HOURS.open, end: HOURS.lunchStart},
  {id: 'afternoon', name: 'Afternoon', start: HOURS.lunchEnd, end: HOURS.close}
];

// Monthly subscription: 2 sessions every week for 4 weeks = 8 sessions.
const SESSIONS_PER_WEEK = 2;
const WEEKS_IN_MONTH = 4;
const MONTHLY_SESSIONS = SESSIONS_PER_WEEK * WEEKS_IN_MONTH;

const MAX_SESSIONS = 20; // used by the price estimator on the Services page
const DEMO_NOTE = 'Front-end demonstration only: nothing is sent to a server. Call the branch to confirm a real appointment.';
