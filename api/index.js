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
  connectionTimeoutMillis: 10000, // 10 seconds// Necessary for SSL connections with Supabase
});

// Route to test the database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, message: 'Database connected successfully', timestamp: result.rows[0] });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Route to test email sending functionality
app.get('/api/email-test', async (req, res) => {
  const testEmail = "your-email@example.com"; // Use an email you control for testing
  const msg = {
    to: testEmail,
    from: 'Ripunjay.Deka@studentambassadors.com', // Verified sender email
    subject: 'Test Email from MLSA TU Chapter',
    text: `This is a test email from MLSA TU Chapter to confirm SendGrid configuration.`,
  };

  try {
    await sgMail.send(msg);
    console.log("Test email sent successfully to:", testEmail);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error("SendGrid email error:", error.response ? error.response.body : error);
    res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
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
      text: `Hello ${name}, thank you for registering with MLSA TU Chapter!`,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
