import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type BookingEmailData = {
  to:          string
  guestName:   string
  bookingRef:  string
  tourTitle:   string
  date:        string   // formatted date string
  timeSlot:    string
  adults:      number
  children:    number
  totalPrice:  number
  currency:    string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const childrenLine = data.children > 0
    ? `<tr><td style="padding:4px 0;color:#666">Children</td><td style="padding:4px 0;text-align:right">${data.children}</td></tr>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmation</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">

        <!-- header -->
        <tr>
          <td style="background:#ef6445;padding:32px 40px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">Booking Confirmed!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Azerbaijan Travel</p>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 8px;color:#222;font-size:15px">Hi <strong>${data.guestName}</strong>,</p>
            <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:22px">
              Your booking has been received and is confirmed. Here's a summary:
            </p>

            <!-- ref badge -->
            <div style="background:#fef3f0;border:1.5px solid #ef6445;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center">
              <p style="margin:0;font-size:11px;color:#ef6445;font-weight:700;letter-spacing:1px;text-transform:uppercase">Booking Reference</p>
              <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ef6445;letter-spacing:2px">${data.bookingRef}</p>
            </div>

            <!-- details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;margin-bottom:28px">
              <tr style="background:#fafafa">
                <td style="padding:14px 20px;font-size:13px;font-weight:700;color:#222;border-bottom:1px solid #eee" colspan="2">
                  Tour Details
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:13px;color:#444;border-bottom:1px solid #eee">Tour</td>
                <td style="padding:12px 20px;font-size:13px;color:#222;font-weight:600;border-bottom:1px solid #eee;text-align:right">${data.tourTitle}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:13px;color:#444;border-bottom:1px solid #eee">Date</td>
                <td style="padding:12px 20px;font-size:13px;color:#222;font-weight:600;border-bottom:1px solid #eee;text-align:right">${data.date}</td>
              </tr>
              ${data.timeSlot ? `<tr>
                <td style="padding:12px 20px;font-size:13px;color:#444;border-bottom:1px solid #eee">Time</td>
                <td style="padding:12px 20px;font-size:13px;color:#222;font-weight:600;border-bottom:1px solid #eee;text-align:right">${data.timeSlot}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 20px;font-size:13px;color:#444;border-bottom:1px solid #eee">Adults</td>
                <td style="padding:12px 20px;font-size:13px;color:#222;font-weight:600;border-bottom:1px solid #eee;text-align:right">${data.adults}</td>
              </tr>
              ${data.children > 0 ? `<tr>
                <td style="padding:12px 20px;font-size:13px;color:#444;border-bottom:1px solid #eee">Children</td>
                <td style="padding:12px 20px;font-size:13px;color:#222;font-weight:600;border-bottom:1px solid #eee;text-align:right">${data.children}</td>
              </tr>` : ''}
              <tr style="background:#fafafa">
                <td style="padding:14px 20px;font-size:14px;font-weight:700;color:#222">Total Paid</td>
                <td style="padding:14px 20px;font-size:18px;font-weight:700;color:#ef6445;text-align:right">${data.totalPrice} ${data.currency}</td>
              </tr>
            </table>

            <p style="margin:0;color:#888;font-size:12px;line-height:20px">
              Questions? Reply to this email or contact us at <a href="mailto:info@azerbaijantravel.com" style="color:#ef6445">info@azerbaijantravel.com</a>
            </p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee">
            <p style="margin:0;font-size:11px;color:#aaa">© 2026 Azerbaijan Travel · All rights reserved</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from:    'Azerbaijan Travel <bookings@azerbaijantravel.com>',
    to:      data.to,
    subject: `Booking Confirmed — ${data.bookingRef} · ${data.tourTitle}`,
    html,
  })
}
