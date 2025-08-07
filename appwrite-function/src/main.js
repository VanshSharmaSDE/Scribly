const nodemailer = require('nodemailer');

module.exports = async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const requestBody = JSON.parse(req.body || '{}');
    const { action = 'email' } = requestBody;
    
    // Handle different actions
    if (action === 'email') {
      return await handleEmailSending(requestBody, res, log, error);
    } else if (action === 'updatePassword') {
      return await handlePasswordUpdate(requestBody, res, log, error);
    } else {
      error(`Unknown action: ${action}`);
      return res.json({ 
        success: false, 
        error: `Unknown action: ${action}` 
      });
    }
  } catch (err) {
    error(`Function execution failed: ${err.message}`);
    return res.json({ 
      success: false, 
      error: err.message 
    });
  }
};

async function handleEmailSending({ to, subject, html, name, type = 'verification' }, res, log, error) {
  try {
    // Validate required fields
    if (!to || !subject || !html) {
      error('Missing required fields');
      return res.json({ 
        success: false, 
        error: 'Missing required fields: to, subject, html' 
      });
    }

    log(`Sending ${type} email to: ${to}`);

    // Validate environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      error('Missing SMTP configuration in environment variables');
      return res.json({
        success: false,
        error: 'SMTP configuration not found. Please set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD environment variables.'
      });
    }

    // Create Nodemailer transporter with your custom SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports like 587
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      // Additional options for better reliability
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      log('SMTP connection verified successfully');
    } catch (verifyError) {
      error(`SMTP verification failed: ${verifyError.message}`);
      return res.json({
        success: false,
        error: `SMTP configuration error: ${verifyError.message}`
      });
    }

    // Prepare email options
    const mailOptions = {
      from: `"Scribly" <${process.env.SUBMIT_EMAIL || 'report@scribly.tech'}>`,
      to: to,
      subject: subject,
      html: html,
      text: html.replace(/<[^>]*>/g, ''),
      headers: {
        'X-Mailer': 'Scribly Email Service',
        'X-Application': 'Scribly',
        'X-Email-Type': type
      }
    };

    // Send email
    log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    
    log(`Email sent successfully! Message ID: ${info.messageId}`);
    
    if (info.response) {
      log(`SMTP Response: ${info.response}`);
    }

    transporter.close();

    return res.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully',
      timestamp: new Date().toISOString(),
      recipient: to,
      type: type
    });

  } catch (err) {
    error(`Error sending email: ${err.message}`);
    error(`Stack trace: ${err.stack}`);
    
    return res.json({ 
      success: false, 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function handlePasswordUpdate({ userId, newPassword }, res, log, error) {
  try {
    log(`=== PASSWORD UPDATE FUNCTION START ===`);
    log(`Request data: userId=${userId}, passwordLength=${newPassword?.length}`);
    
    // Validate required fields
    if (!userId || !newPassword) {
      error('Missing required fields for password update');
      return res.json({ 
        success: false, 
        error: 'Missing required fields: userId, newPassword' 
      });
    }

    log(`Updating auth password for user: ${userId}`);
    log(`Environment check: APPWRITE_ENDPOINT=${!!process.env.APPWRITE_ENDPOINT}, APPWRITE_PROJECT_ID=${!!process.env.APPWRITE_PROJECT_ID}, APPWRITE_API_KEY=${!!process.env.APPWRITE_API_KEY}`);

    // Import Appwrite SDK for server-side operations
    const { Client, Users } = require('node-appwrite');
    
    // Initialize Appwrite client with API key (server-side)
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY); // This requires API key with Users scope

    const users = new Users(client);
    
    log(`Appwrite client initialized, calling users.updatePassword...`);

    // Update user authentication password (not database field!)
    const result = await users.updatePassword(userId, newPassword);
    
    log(`✅ Auth password updated successfully for user: ${userId}`);
    log(`Update result: ${JSON.stringify(result)}`);

    return res.json({ 
      success: true, 
      message: 'Auth password updated successfully',
      timestamp: new Date().toISOString(),
      userId: userId
    });

  } catch (err) {
    error(`❌ Error updating auth password: ${err.message}`);
    error(`❌ Error code: ${err.code}`);
    error(`❌ Error type: ${err.type}`);
    error(`❌ Stack trace: ${err.stack}`);
    
    return res.json({ 
      success: false, 
      error: `Failed to update auth password: ${err.message}`,
      errorCode: err.code,
      errorType: err.type,
      timestamp: new Date().toISOString()
    });
  }
}
