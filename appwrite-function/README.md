# Scribly Email Function

This is the custom email sending function for Scribly that uses Nodemailer to send emails through your custom SMTP server.

## Deployment Instructions

### 1. Create ZIP file
1. Select all files in this folder (package.json, src/)
2. Right-click and "Send to" → "Compressed (zipped) folder"
3. Name it `scribly-email-function.zip`

### 2. Upload to Appwrite
1. Go to https://nyc.cloud.appwrite.io/console
2. Navigate to your project
3. Go to Functions → Your function (ID: 6893679e001291004e55)
4. Click "Deployments" tab
5. Click "Create Deployment"
6. Select "Manual" as source
7. Upload the ZIP file
8. Set entrypoint to: `src/main.js`
9. Click "Create"

### 3. Set Environment Variables
In your function settings, add these environment variables:

- `SMTP_HOST` = Your SMTP host (e.g., smtp.mailtrap.io)
- `SMTP_PORT` = Your SMTP port (usually 587 or 2525)
- `SMTP_USERNAME` = Your SMTP username
- `SMTP_PASSWORD` = Your SMTP password
- `SUBMIT_EMAIL` = Your sender email (e.g., report@scribly.tech)
- `ALLOWED_ORIGINS` = Allowed origins for CORS (optional)

### 4. Test the Function
1. Go to the "Execute" tab in your function
2. Test with this JSON:
```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<h1>Test</h1><p>This is a test email.</p>",
  "name": "Test User",
  "type": "test"
}
```

### 5. Check Logs
- Monitor the "Logs" tab to see if emails are being sent successfully
- Look for success messages and any errors

## Function Details

- **Runtime**: Node.js 18+
- **Dependencies**: nodemailer, node-appwrite
- **Entry Point**: src/main.js
- **Timeout**: 30 seconds (default)

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| SMTP_HOST | SMTP server hostname | smtp.mailtrap.io |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_USERNAME | SMTP username | your-username |
| SMTP_PASSWORD | SMTP password | your-password |
| SUBMIT_EMAIL | Sender email address | report@scribly.tech |
| ALLOWED_ORIGINS | CORS allowed origins | * |

## Email Features

- ✅ Custom sender: "Scribly" <report@scribly.tech>
- ✅ HTML email support
- ✅ Text fallback for HTML emails
- ✅ Connection pooling for better performance
- ✅ SMTP verification before sending
- ✅ Detailed error logging
- ✅ Email type tracking (verification, password_reset, etc.)

## Troubleshooting

1. **"SMTP configuration not found"** → Check that SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD are set
2. **"SMTP verification failed"** → Check SMTP credentials and host/port
3. **"Missing required fields"** → Ensure to, subject, html are provided
4. **Function timeout** → Check SMTP server response time

## Testing Your Deployment

After deployment, test by:
1. Creating a new account in Scribly
2. Checking console logs for "Custom verification email sent successfully"
3. Verifying emails come from your SUBMIT_EMAIL address
