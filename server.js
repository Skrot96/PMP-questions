"use strict";

require("dotenv").config();

const express    = require("express");
const crypto     = require("crypto");
const fs         = require("fs");
const path       = require("path");
const nodemailer = require("nodemailer");
const db         = require("./db");

const app  = express();
const PORT = parseInt(process.env.PORT || "3005", 10);

const OTP_EXPIRY_MINUTES  = parseInt(process.env.OTP_EXPIRY_MINUTES  || "10", 10);
const SESSION_EXPIRY_DAYS = parseInt(process.env.SESSION_EXPIRY_DAYS || "7",  10);
const ADMIN_TOKEN         = process.env.ADMIN_TOKEN || "";

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Email ─────────────────────────────────────────────────────────────────────

const DEV_MODE = !process.env.SMTP_HOST;

const transporter = DEV_MODE
  ? null
  : nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateOTP() {
  return String(crypto.randomInt(100000, 999999));
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function isoFromNow(minutes = 0, days = 0) {
  return new Date(Date.now() + (minutes * 60 + days * 86400) * 1000).toISOString();
}

async function sendOTPEmail(to, name, code) {
  if (DEV_MODE) {
    console.log(`\n[DEV] OTP för ${to}: ${code}  (giltigt ${OTP_EXPIRY_MINUTES} min)\n`);
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from, to,
    subject: "Din inloggningskod – PMP Trainer 2026",
    text: `Hej ${name},\n\nDin inloggningskod är: ${code}\n\nKoden är giltig i ${OTP_EXPIRY_MINUTES} minuter.\n\nOm du inte begärde en kod kan du ignorera detta mejl.`,
    html: `
      <div style="font-family:Inter,'Segoe UI',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#f9f9f7">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:32px">
          <p style="margin:0 0 4px;font-size:0.875rem;color:#71717a;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">PMP Trainer 2026</p>
          <h1 style="margin:0 0 24px;font-size:1.5rem;color:#18181b;font-weight:700">Din inloggningskod</h1>
          <p style="margin:0 0 20px;color:#3f3f46">Hej ${name},</p>
          <div style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#18181b;padding:24px;background:#f4f4f5;border-radius:6px;text-align:center;margin-bottom:20px">
            ${code}
          </div>
          <p style="margin:0;color:#71717a;font-size:0.875rem">
            Koden är giltig i <strong>${OTP_EXPIRY_MINUTES} minuter</strong>.
            Om du inte begärde en kod kan du ignorera detta mejl.
          </p>
        </div>
      </div>
    `,
  });
}

// ── Admin middleware ──────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ error: "ADMIN_TOKEN är inte konfigurerat i .env." });
  }
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Obehörig." });
  }
  next();
}

// ── Page routes ──────────────────────────────────────────────────────────────

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post("/api/auth/request-otp", async (req, res) => {
  const raw = req.body?.email;
  if (!raw || typeof raw !== "string") {
    return res.status(400).json({ error: "E-postadress saknas." });
  }
  const email = raw.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ogiltig e-postadress." });
  }

  const check = db.isUserAllowed(email);
  if (!check.allowed) {
    const msg = check.reason === "expired"
      ? "Din åtkomst har löpt ut. Kontakta kursadministratören."
      : "E-postadressen är inte registrerad.";
    return res.status(401).json({ error: msg });
  }

  const { user } = check;
  db.invalidateOTPs(user.id);

  const code      = generateOTP();
  const expiresAt = isoFromNow(OTP_EXPIRY_MINUTES);
  db.createOTP(user.id, code, expiresAt);

  try {
    await sendOTPEmail(email, user.name || "deltagare", code);
  } catch (err) {
    console.error("E-postfel:", err.message);
    return res.status(500).json({ error: "Kunde inte skicka e-post. Försök igen." });
  }

  res.json({ ok: true });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const email = (req.body?.email || "").toLowerCase().trim();
  const code  = (req.body?.code  || "").trim();
  if (!email || !code) return res.status(400).json({ error: "E-post och kod krävs." });

  const user = db.getUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Ogiltig eller utgången kod." });

  const otp = db.getValidOTP(user.id, code);
  if (!otp)  return res.status(401).json({ error: "Ogiltig eller utgången kod." });

  db.markOTPUsed(otp.id);

  const token     = generateToken();
  const expiresAt = isoFromNow(0, SESSION_EXPIRY_DAYS);
  db.createSession(user.id, token, expiresAt);

  res.json({ ok: true, token, email: user.email, name: user.name, expiresAt });
});

app.get("/api/auth/me", (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return res.status(401).json({ error: "Ingen token." });

  const session = db.getValidSession(token);
  if (!session)  return res.status(401).json({ error: "Sessionen har gått ut." });

  res.json({ email: session.email, name: session.name, expiresAt: session.expires_at });
});

app.post("/api/auth/logout", (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (token) db.deleteSession(token);
  res.json({ ok: true });
});

// ── Admin routes ──────────────────────────────────────────────────────────────

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  res.json(db.getAllUsers());
});

app.post("/api/admin/users", requireAdmin, (req, res) => {
  const { name, email, course_date } = req.body || {};
  if (!name || !email || !course_date) {
    return res.status(400).json({ error: "Namn, e-post och kursdatum krävs." });
  }
  const result = db.createUser(
    name.trim(),
    email.toLowerCase().trim(),
    course_date.trim()
  );
  if (result.error) return res.status(409).json({ error: result.error });
  res.status(201).json(result.user);
});

app.put("/api/admin/users/:id", requireAdmin, (req, res) => {
  const { name, email, course_date } = req.body || {};
  if (!name || !email || !course_date) {
    return res.status(400).json({ error: "Namn, e-post och kursdatum krävs." });
  }
  const result = db.updateUser(
    req.params.id,
    name.trim(),
    email.toLowerCase().trim(),
    course_date.trim()
  );
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result.user);
});

app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  const result = db.deleteUser(req.params.id);
  if (result.error) return res.status(404).json({ error: result.error });
  res.json({ ok: true });
});

// ── Admin question routes ─────────────────────────────────────────────────────

const QUESTIONS_FILE = path.join(__dirname, "questions.json");

function readQuestionsFile() {
  try {
    return JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeQuestionsFile(qs) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(qs, null, 2), "utf8");
}

app.get("/api/admin/questions", requireAdmin, (_req, res) => {
  res.json(readQuestionsFile());
});

app.post("/api/admin/questions", requireAdmin, (req, res) => {
  const q = req.body;
  if (!q || !q.id || !q.question) {
    return res.status(400).json({ error: "Fälten id och question krävs." });
  }
  const qs = readQuestionsFile();
  if (qs.some(x => x.id === q.id)) {
    return res.status(409).json({ error: `ID "${q.id}" används redan.` });
  }
  qs.push(q);
  writeQuestionsFile(qs);
  res.status(201).json(q);
});

app.put("/api/admin/questions/:id", requireAdmin, (req, res) => {
  const qs = readQuestionsFile();
  const idx = qs.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Fråga hittades inte." });
  qs[idx] = { ...qs[idx], ...req.body, id: req.params.id };
  writeQuestionsFile(qs);
  res.json(qs[idx]);
});

app.delete("/api/admin/questions/:id", requireAdmin, (req, res) => {
  const qs = readQuestionsFile();
  const idx = qs.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Fråga hittades inte." });
  qs.splice(idx, 1);
  writeQuestionsFile(qs);
  res.json({ ok: true });
});

// ── Admin token verification ──────────────────────────────────────────────────

app.post("/api/admin/verify-token", (req, res) => {
  const token = (req.body?.token || "").trim();
  if (!ADMIN_TOKEN) return res.status(503).json({ error: "ADMIN_TOKEN ej konfigurerat." });
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "Fel lösenord." });
  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`PMP Trainer körs på http://localhost:${PORT}`);
  if (DEV_MODE) console.log("[DEV] SMTP ej konfigurerad – OTP-koder visas i konsolen.");
  if (!ADMIN_TOKEN) console.warn("[VARNING] ADMIN_TOKEN är inte satt i .env");
});
