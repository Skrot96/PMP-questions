"use strict";

const fs   = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const DB_PATH = path.join(__dirname, "pmp-trainer.json");

// ── Persistence ───────────────────────────────────────────────────────────────

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { users: [], otp_tokens: [], sessions: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

function isExpired(isoString) {
  return new Date(isoString) <= new Date();
}

// Returns true if course_date + 12 months is still in the future
function isCourseValid(courseDateStr) {
  if (!courseDateStr) return false;
  const expiry = new Date(courseDateStr);
  expiry.setMonth(expiry.getMonth() + 12);
  return expiry > new Date();
}

// ── User validation ───────────────────────────────────────────────────────────

function isUserAllowed(email) {
  const { users } = readDB();
  const user = users.find((u) => u.email === email);
  if (!user)                       return { allowed: false, reason: "not_found" };
  if (!isCourseValid(user.course_date)) return { allowed: false, reason: "expired" };
  return { allowed: true, user };
}

// ── User CRUD (admin) ─────────────────────────────────────────────────────────

function getAllUsers() {
  return readDB().users.map((u) => ({
    ...u,
    access_valid: isCourseValid(u.course_date),
  }));
}

function getUserByEmail(email) {
  return readDB().users.find((u) => u.email === email) || null;
}

function getUserById(id) {
  return readDB().users.find((u) => u.id === id) || null;
}

function createUser(name, email, course_date) {
  const db = readDB();
  if (db.users.find((u) => u.email === email)) {
    return { error: "E-postadressen används redan." };
  }
  const user = { id: randomUUID(), name, email, course_date, created_at: now() };
  db.users.push(user);
  writeDB(db);
  return { user };
}

function updateUser(id, name, email, course_date) {
  const db   = readDB();
  const idx  = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return { error: "Användaren hittades inte." };

  // Check email uniqueness (excluding this user)
  const emailTaken = db.users.some((u) => u.email === email && u.id !== id);
  if (emailTaken) return { error: "E-postadressen används redan." };

  db.users[idx] = { ...db.users[idx], name, email, course_date };
  writeDB(db);
  return { user: db.users[idx] };
}

function deleteUser(id) {
  const db  = readDB();
  const len = db.users.length;
  db.users  = db.users.filter((u) => u.id !== id);
  if (db.users.length === len) return { error: "Användaren hittades inte." };
  // Also remove their tokens and sessions
  db.otp_tokens = db.otp_tokens.filter((o) => {
    const user = readDB().users.find((u) => u.id === o.user_id);
    return !!user;
  });
  db.sessions = db.sessions.filter((s) => s.user_id !== id);
  writeDB(db);
  return { ok: true };
}

// ── OTP ───────────────────────────────────────────────────────────────────────

function invalidateOTPs(userId) {
  const db = readDB();
  db.otp_tokens.forEach((otp) => {
    if (otp.user_id === userId) otp.used = true;
  });
  writeDB(db);
}

function createOTP(userId, code, expiresAt) {
  const db = readDB();
  db.otp_tokens.push({
    id: randomUUID(),
    user_id: userId,
    code,
    expires_at: expiresAt,
    used: false,
    created_at: now(),
  });
  writeDB(db);
}

function getValidOTP(userId, code) {
  const { otp_tokens } = readDB();
  return (
    otp_tokens
      .filter(
        (otp) =>
          otp.user_id === userId &&
          otp.code    === code   &&
          !otp.used              &&
          !isExpired(otp.expires_at)
      )
      .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))[0] || null
  );
}

function markOTPUsed(otpId) {
  const db  = readDB();
  const otp = db.otp_tokens.find((o) => o.id === otpId);
  if (otp) { otp.used = true; writeDB(db); }
}

// ── Sessions ──────────────────────────────────────────────────────────────────

function createSession(userId, token, expiresAt) {
  const db = readDB();
  db.sessions.push({
    id: randomUUID(),
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: now(),
  });
  writeDB(db);
}

function getValidSession(token) {
  const { sessions, users } = readDB();
  const session = sessions.find((s) => s.token === token && !isExpired(s.expires_at));
  if (!session) return null;
  const user = users.find((u) => u.id === session.user_id);
  return user ? { ...session, email: user.email, name: user.name } : null;
}

function deleteSession(token) {
  const db   = readDB();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeDB(db);
}

function cleanExpired() {
  const db     = readDB();
  const cutoff = new Date().toISOString();
  db.otp_tokens = db.otp_tokens.filter((o) => o.expires_at > cutoff);
  db.sessions   = db.sessions.filter((s) => s.expires_at > cutoff);
  writeDB(db);
}

module.exports = {
  isUserAllowed,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  invalidateOTPs,
  createOTP,
  getValidOTP,
  markOTPUsed,
  createSession,
  getValidSession,
  deleteSession,
  cleanExpired,
};
