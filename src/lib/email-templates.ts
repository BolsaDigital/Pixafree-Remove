export const emailVerificationTemplate = (url: string, name: string, siteName: string) => {
  return {
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f7f7f7;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #eeeeee;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 1px solid #eeeeee;
            }
            .content {
              padding: 30px 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #000000;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #999999;
              font-size: 12px;
              border-top: 1px solid #eeeeee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${url}" class="button">Verify Email Address</a>
              </p>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all;">${url}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};

export const resetPasswordTemplate = (url: string, name: string, siteName: string) => {
  return {
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f7f7f7;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #eeeeee;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 1px solid #eeeeee;
            }
            .content {
              padding: 30px 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #000000;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #999999;
              font-size: 12px;
              border-top: 1px solid #eeeeee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                Password Reset
              </h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>
                We received a request to reset your password. If you didn't make this request, please ignore this email.
              </p>
              <p style="text-align: center;">
                <a href="${url}" class="button">Reset Password</a>
              </p>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all;">${url}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};
