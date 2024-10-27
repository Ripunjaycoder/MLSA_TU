
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client for Supabase
const sgMail = require('@sendgrid/mail'); // SendGrid for email
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Set up the database connection pool
const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  database: process.env.SUPABASE_DATABASE,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  port: process.env.SUPABASE_PORT,
  ssl: { rejectUnauthorized: false }, 
  connectionTimeoutMillis: 10000,
});

// Main form submission route
app.post('/api/submit-form', async (req, res) => {
  const { name, email } = req.body;

  // Insert into the database
  try {
    const query = 'INSERT INTO members (name, email) VALUES ($1, $2) RETURNING *';
    const values = [name, email];
    const dbResult = await pool.query(query, values);
    console.log("Database insert successful:", dbResult.rows[0]);

    // Send confirmation email
    const msg = {
      to: email,
      from: 'Ripunjay.Deka@studentambassadors.com', // Verified sender email
      replyTo: 'mlsatuchapter@gmail.com',
      subject: 'Thank you for registering!',
      text: Hello ${name}, thank you for registering with MLSA TU Chapter!,
    };

    await sgMail.send(msg);
    console.log("Email sent successfully to:", email);

    // Respond with success if both database and email operations succeed
    res.json({ success: true, message: 'Form submitted and email sent successfully!' });
    
  } catch (error) {
    console.error("Error details:", error); // Log the entire error
    res.status(500).json({ success: false, message: 'Error submitting form or sending email' });
  }
});

module.exports = app; // This is needed for Vercel to handle serverless functions         
