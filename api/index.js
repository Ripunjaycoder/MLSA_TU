const express = require('express');
const { Pool } = require('pg');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  database: process.env.SUPABASE_DATABASE,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  port: process.env.SUPABASE_PORT,
  ssl: true
  connectionTimeoutMillis: 10000,
});

app.post('/api/submit-form', async (req, res) => {
  const { name, email } = req.body;
  try {
    const query = 'INSERT INTO members (name, email) VALUES ($1, $2) RETURNING *';
    const values = [name, email];
    const dbResult = await pool.query(query, values);
    console.log("Database insert successful:", dbResult.rows[0]);

    const msg = {
      to: email,
      from: 'Ripunjay.Deka@studentambassadors.com',
      replyTo: 'mlsatuchapter@gmail.com',
      subject: 'Thank you for registering!',
      text: `Hello ${name}, thank you for registering with MLSA TU Chapter!`,
    };

    await sgMail.send(msg);
    console.log("Email sent successfully to:", email);

    res.json({ success: true, message: 'Form submitted and email sent successfully!' });
    
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ success: false, message: 'Error submitting form or sending email' });
  }
});

module.exports = app;
