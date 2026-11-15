'use strict';
// utils.js — small pure functions shared by BOTH the plain-JavaScript files and the jQuery files.
// Nothing here touches the page (no document, no $): they only take values and return values.

function formatMoney(amount) {
  return new Intl.NumberFormat('en-KZ').format(amount) + ' ₸';
}

function findService(id) {
  return SERVICES.find(function (service) { return service.id === id; });
}

function findBranch(id) {
  return BRANCHES.find(function (branch) { return branch.id === id; });
}

// Total price of cart rows [{id, quantity}] — a calculated value, never typed by hand.
function calcTotal(rows) {
  let sum = 0;
  for (const row of rows) {
    const service = findService(row.id);
    if (service) sum += service.price * row.quantity;
  }
  return sum;
}

function countSessions(rows) {
  return rows.reduce(function (sum, row) { return sum + row.quantity; }, 0);
}

function calcMinutes(rows) {
  let minutes = 0;
  for (const row of rows) {
    const service = findService(row.id);
    if (service) minutes += service.minutes * row.quantity;
  }
  return minutes;
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return rest + ' min';
  return hours + ' h' + (rest ? ' ' + rest + ' min' : '');
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

// Kazakhstan numbers: +7 or 8, then ten digits. Spaces, brackets and dashes are ignored.
function isPhone(value) {
  return /^(?:\+7|8)\d{10}$/.test(value.replace(/[\s()-]/g, ''));
}

function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

function makeReference() {
  return 'REQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
}

function storageRead(key, fallback) {
  try {
    const value = JSON.parse(sessionStorage.getItem('shindal-' + key));
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function storageSave(key, value) {
  try {
    sessionStorage.setItem('shindal-' + key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

// Day of week (0 = Sunday) and minutes since midnight in Kazakhstan time, so the status is the same for every visitor.
function almatyClock(now) {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Almaty', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).formatToParts(now);
  const get = function (type) { return parts.find(function (part) { return part.type === type; }).value; };
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {day: days.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute'))};
}

function clockText(total) {
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

// Only offer sessions that fit entirely inside one working period.
const TIME_SLOTS = SESSION_PERIODS.flatMap(function (period) {
  const slots = [];
  for (let start = period.start; start + SESSION_MINUTES <= period.end; start += 60) {
    const id = clockText(start);
    slots.push({id: id, period: period.id, start: start, label: id + '–' + clockText(start + SESSION_MINUTES)});
  }
  return slots;
});

function findTimeSlot(id) {
  return TIME_SLOTS.find(function (slot) { return slot.id === id; });
}

function bookingTimeLabel(id) {
  const slot = findTimeSlot(id);
  if (slot) return slot.label;
  // Earlier requests stored only a period. Their exact start time is unknown.
  const period = SESSION_PERIODS.find(function (item) { return item.id === id; });
  return period ? period.name + ' (exact time unspecified)' : id;
}

// Opening status for a given Date. Returns {state, text}; state is one of
// 'open', 'closed-hours', 'appointment', 'closed-day'.
function getOpenStatus(now) {
  const clock = almatyClock(now);
  const day = clock.day;
  const minutes = clock.minutes;
  if (day === HOURS.closedDay) return {state: 'closed-day', text: 'Closed today (Sunday). We open on Monday at ' + clockText(HOURS.open) + '.'};
  if (day === HOURS.byAppointmentDay) return {state: 'appointment', text: 'Saturday: by appointment only. Call your branch to arrange a visit.'};
  const period = SESSION_PERIODS.find(function (item) { return minutes >= item.start && minutes < item.end; });
  if (period) return {state: 'open', text: 'Open now until ' + clockText(period.end) + '.'};
  if (minutes >= HOURS.lunchStart && minutes < HOURS.lunchEnd) return {state: 'closed-hours', text: 'Lunch break. We reopen at ' + clockText(HOURS.lunchEnd) + '.'};
  const when = minutes < HOURS.open ? 'today' : (day === 5 ? 'on Monday' : 'tomorrow');
  return {state: 'closed-hours', text: 'Closed now. We open ' + when + ' at ' + clockText(HOURS.open) + '.'};
}

// Date helpers for the booking form (Asia/Almaty, as the branches work in Kazakhstan time).
function todayISO() {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
}

// Add whole days to an ISO date (YYYY-MM-DD) and return a new ISO date.
function addDays(isoDate, days) {
  const moment = new Date(isoDate + 'T12:00:00+05:00');
  moment.setUTCDate(moment.getUTCDate() + days);
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit'}).format(moment);
}

function dayOfWeek(isoDate) {
  return new Date(isoDate + 'T12:00:00+05:00').getUTCDay();
}

// A small non-cryptographic hash (cyrb53). The demo account stores this instead of the typed password.
// It is NOT real security — a real site would hash on a server — but the password itself is never saved.
function hashText(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return String(4294967296 * (2097151 & h2) + (h1 >>> 0));
}
