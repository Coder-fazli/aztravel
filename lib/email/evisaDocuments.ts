import { sendEmail } from './brevo'
import { readFile } from 'fs/promises'
import path from 'path'

type DocumentsEmailData = {
  to:                string
  name:              string
  applicationNumber: string
  documents:         string[] // "/uploads/xxxx.ext" — public paths, same as passport-image answers
}

export async function sendApplicantDocuments(data: DocumentsEmailData) {
  const attachments = await Promise.all(
    data.documents.map(async (doc) => {
      const filename = doc.split('/').pop() || doc
      const content = await readFile(path.join(process.cwd(), 'public', doc))
      return { filename, content }
    }),
  )

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your e-Visa Documents</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">

        <tr>
          <td style="background:#ef6445;padding:32px 40px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">Your Documents Are Ready</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Azerbaijan Travel</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 8px;color:#222;font-size:15px">Hi <strong>${data.name}</strong>,</p>
            <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:22px">
              Documents for your e-Visa application are attached to this email. Please keep a copy for your travel.
            </p>

            <div style="background:#fef3f0;border:1.5px solid #ef6445;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center">
              <p style="margin:0;font-size:11px;color:#ef6445;font-weight:700;letter-spacing:1px;text-transform:uppercase">Application Number</p>
              <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ef6445;letter-spacing:2px">${data.applicationNumber}</p>
            </div>

            <p style="margin:0 0 4px;color:#222;font-size:13px;font-weight:700">Attached (${attachments.length})</p>
            <ul style="margin:6px 0 28px;padding-left:20px;color:#444;font-size:13px;line-height:22px">
              ${attachments.map(a => `<li>${a.filename}</li>`).join('')}
            </ul>

            <p style="margin:0;color:#888;font-size:12px;line-height:20px">
              Questions? Reply to this email or contact us at <a href="mailto:info@azerbaijantravel.com" style="color:#ef6445">info@azerbaijantravel.com</a>
            </p>
          </td>
        </tr>

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

  return sendEmail({
    from:    'Azerbaijan Travel <info@azerbaijantravel.com>',
    to:      data.to,
    toName:  data.name,
    subject: `Your e-Visa documents — ${data.applicationNumber}`,
    html,
    attachments,
  })
}
