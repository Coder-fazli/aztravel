'use server'

import { Resend } from 'resend'

export async function sendEnquiry(formData: FormData) {
  const name      = (formData.get('name')      as string).trim()
  const email     = (formData.get('email')     as string).trim().toLowerCase()
  const phone     = (formData.get('phone')     as string | null)?.trim() ?? ''
  const message   = (formData.get('message')   as string).trim()
  const tourTitle = (formData.get('tourTitle') as string | null)?.trim() ?? ''

  if (!name || !email || !message) throw new Error('Missing required fields')

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from:    'Azerbaijan Travel <enquiries@azerbaijantravel.com>',
    to:      'info@azerbaijantravel.com',
    replyTo: email,
    subject: `New enquiry${tourTitle ? `: ${tourTitle}` : ''}`,
    html: `
<table style="font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#222;max-width:520px">
  <tr><td style="padding:0 0 8px"><strong>Name:</strong> ${name}</td></tr>
  <tr><td style="padding:0 0 8px"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></td></tr>
  ${phone ? `<tr><td style="padding:0 0 8px"><strong>Phone:</strong> ${phone}</td></tr>` : ''}
  ${tourTitle ? `<tr><td style="padding:0 0 8px"><strong>Tour:</strong> ${tourTitle}</td></tr>` : ''}
  <tr><td style="padding:16px 0 0;border-top:1px solid #eee"><strong>Message:</strong><br/><br/>${message.replace(/\n/g, '<br/>')}</td></tr>
</table>`,
  })

  return { ok: true }
}
