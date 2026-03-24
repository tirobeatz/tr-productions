function emailWrapper(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">
        <span style="color: #8B5CF6;">TR</span> Productions
      </h1>
    </div>
    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(5, 5, 5, 1) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      ${content}
    </div>
    <div style="text-align: center; color: #6B7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">Questions? Reply to this email or contact us.</p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} TR Productions. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

function generateBeatEmailHTML({ beatTitle, licenseName, orderId, downloadUrl, expiresIn, amount, currency }) {
  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Thank You for Your Purchase!</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Your beat is ready for download</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Beat</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${beatTitle}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">License</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${licenseName}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Order ID</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-family: monospace;">${orderId}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Total</td>
          <td style="color: #ffffff; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${amount}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${downloadUrl}" style="display: inline-block; background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-weight: 600; font-size: 16px;">
        Download Your Files
      </a>
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 12px;">Link expires in ${expiresIn}</p>
    </div>
    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
        📄 <strong>Your license agreement is attached to this email.</strong> Please keep it for your records.
      </p>
    </div>
  `)
}

function generateDepositEmailHTML({ serviceName, customerName, depositAmount, remainingAmount, totalPrice, serviceType, booking, uploadUrl }) {
  const details = serviceType === 'mix'
    ? `<tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Track</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${booking.track_name}</td></tr>
       <tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Rush Delivery</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right;">${booking.rush_delivery ? 'Yes' : 'No'}</td></tr>`
    : `<tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Date</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${booking.date}</td></tr>
       <tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Hours</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right;">${booking.hours?.length || 0}h</td></tr>`

  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">${serviceType === 'mix' ? '🎚️' : '🎙️'}</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Booking Confirmed!</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Hey ${customerName}, your deposit has been received</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Service</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
        </tr>
        ${details}
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Deposit Paid</td>
          <td style="color: #10B981; font-size: 16px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${depositAmount}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Remaining Balance</td>
          <td style="color: #ffffff; font-size: 16px; padding: 8px 0; text-align: right; font-weight: bold;">&euro;${remainingAmount}</td>
        </tr>
      </table>
    </div>
    ${uploadUrl ? `
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${uploadUrl}" style="display: inline-block; background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-weight: 600; font-size: 16px;">
        Upload Your Files
      </a>
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 12px;">
        ${serviceType === 'mix' ? 'Upload your vocal stems, instrumentals, and reference tracks' : 'Upload reference tracks or beats for your session'}
      </p>
    </div>
    ` : ''}
    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
        <strong>What&apos;s next?</strong> ${serviceType === 'mix' ? 'Upload your files using the button above and we\'ll start working on your track!' : 'See you at the studio! The remaining balance is due on your session day.'}
      </p>
    </div>
  `)
}

function generateFinalPaymentEmailHTML({ serviceName, customerName, totalPrice }) {
  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Payment Complete!</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Hey ${customerName}, your ${serviceName.toLowerCase()} is fully paid</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Service</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Total Paid</td>
          <td style="color: #10B981; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${totalPrice}</td>
        </tr>
      </table>
    </div>
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #6EE7B7; font-size: 13px; margin: 0; line-height: 1.6;">
        Thank you for your business! If you have any questions, just reply to this email.
      </p>
    </div>
  `)
}

function generateInvoiceEmailHTML({ serviceName, customerName, remainingAmount, paymentUrl }) {
  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Final Invoice</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Hey ${customerName}, your remaining balance is ready</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Service</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Amount Due</td>
          <td style="color: #ffffff; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${remainingAmount}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${paymentUrl}" style="display: inline-block; background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-weight: 600; font-size: 16px;">
        Pay Now
      </a>
    </div>
    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
        Click the button above to complete your payment securely via Stripe.
      </p>
    </div>
  `)
}

export {
  emailWrapper,
  generateBeatEmailHTML,
  generateDepositEmailHTML,
  generateFinalPaymentEmailHTML,
  generateInvoiceEmailHTML
}
