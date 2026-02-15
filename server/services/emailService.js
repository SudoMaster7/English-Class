import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection configuration
try {
  transporter.verify(function (error, success) {
    if (error) {
      console.warn('⚠️ Email service not available (Development mode):');
      console.warn(`   ${error.message}`);
      console.warn('   Emails will be simulated in console.');
    } else {
      console.log('✅ Email service is ready to take our messages');
    }
  });
} catch (error) {
  console.warn('⚠️ Email service initialization failed:', error.message);
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 Welcome to English Learning Platform!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.profile.name}! 👋</h2>
          <p>We're excited to have you join our community of English learners!</p>
          
          <h3>🚀 Get Started:</h3>
          <ul>
            <li>📝 Take the placement test to find your level</li>
            <li>🎯 Complete your daily lesson to start your streak</li>
            <li>🎮 Play games to earn XP and coins</li>
            <li>🏆 Unlock achievements as you progress</li>
          </ul>
          
          <p>Your starting bonus: <strong>50 coins</strong> for verifying your email! 🎉</p>
          
          <a href="${process.env.FRONTEND_URL}/lessons" class="button">Start Learning →</a>
          
          <p>Have questions? Reply to this email - we're here to help!</p>
          
          <p>Happy learning! 📚<br>The English Learning Team</p>
        </div>
        <div class="footer">
          <p>© 2026 English Learning Platform by SUDO. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendemail({
    to: user.email,
    subject: 'Welcome to English Learning Platform! 🚀',
    html
  });
};

/**
 * Send streak reminder email
 */
export const sendStreakReminderEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
      <h1>🔥 Don't lose your ${user.profile.streak}-day streak!</h1>
      <p>Hi ${user.profile.name},</p>
      <p>You haven't practiced today. Complete a lesson to keep your streak alive!</p>
      <a href="${process.env.FRONTEND_URL}/lessons" style="display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Practice Now →
      </a>
      <p>See you soon! 👋</p>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `🔥 Your ${user.profile.streak}-day streak is about to end!`,
    html
  });
};

/**
 * Send achievement unlocked email
 */
export const sendAchievementEmail = async (user, achievement) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
      <h1>🏆 Achievement Unlocked!</h1>
      <div style="font-size: 80px; margin: 20px 0;">${achievement.icon}</div>
      <h2>${achievement.name}</h2>
      <p>${achievement.description}</p>
      <p>Keep up the great work, ${user.profile.name}! 🎉</p>
      <a href="${process.env.FRONTEND_URL}/profile" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        View Profile →
      </a>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `🏆 Achievement Unlocked: ${achievement.name}!`,
    html
  });
};
