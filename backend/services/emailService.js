import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send notification email
export const sendNotificationEmail = async ({
  to,
  subject,
  contractId,
  deviceCount,
  batteriesShipped,
  threshold,
  action
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email service not configured - skipping email notification');
    return;
  }

  const transporter = createTransporter();

  const percentage = ((batteriesShipped / threshold) * 100).toFixed(1);
  
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🔋 PBR Battery Monitoring Alert</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${action === 'BLOCKED' ? 
            `<div style="background: #fee; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 20px;">
              <h2 style="color: #dc3545; margin: 0 0 10px 0;">⚠️ SHIPMENT BLOCKED</h2>
              <p style="margin: 0; color: #721c24;">The battery shipment limit for contract <strong>${contractId}</strong> has been exceeded.</p>
            </div>` :
            `<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
              <h2 style="color: #856404; margin: 0 0 10px 0;">⚠️ THRESHOLD WARNING</h2>
              <p style="margin: 0; color: #856404;">Contract <strong>${contractId}</strong> has reached 80% of its battery shipment threshold.</p>
            </div>`
          }
          
          <h3 style="color: #333; margin-bottom: 20px;">Contract Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Contract ID</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${contractId}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Devices Under Contract</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${deviceCount}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Batteries Shipped</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${batteriesShipped}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Threshold Limit</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${threshold}</td>
            </tr>
            <tr style="background: ${action === 'BLOCKED' ? '#fee' : '#fff3cd'};">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Usage Percentage</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: ${action === 'BLOCKED' ? '#dc3545' : '#856404'};">${percentage}%</td>
            </tr>
          </table>
          
          ${action === 'BLOCKED' ? 
            `<div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #721c24;"><strong>Action Required:</strong> Further shipments are BLOCKED until manual review. Please contact the system administrator to unlock this contract if needed.</p>
            </div>` :
            `<div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #0c5460;"><strong>Action Recommended:</strong> Monitor this contract closely as it approaches the shipment limit. Consider reviewing the threshold or device count if necessary.</p>
            </div>`
          }
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">This is an automated notification from the PBR Battery Monitoring System</p>
        <p style="margin: 5px 0 0 0;">Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PBR Battery Monitor <noreply@pbrmonitoring.com>',
    to,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};