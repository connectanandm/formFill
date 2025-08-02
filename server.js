// server.js
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// For __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email endpoint
app.post('/submit-form', async (req, res) => {
  const { name, email, message, creator } = req.body;

  if (!name || !email || !message || !creator) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await transporter.sendMail({
      from: `"FormFill Bot" <${process.env.SMTP_USER}>`,
      to: creator,
      subject: `New Form Submission from ${name}`,
      text: `You have received a new message:\n\nFrom: ${name} (${email})\n\nMessage:\n${message}`
    });

    await transporter.sendMail({
      from: `"${creator}" via FormFill <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Thanks for contacting ${creator}`,
      text: `Hi ${name},\n\nThank you for your message:\n"${message}"\n\nWe’ll be in touch soon.\n\n- ${creator}`
    });

    res.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Email sending failed' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ FormFill server running at http://localhost:${PORT}`);
});
