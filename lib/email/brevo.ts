// Single place all outbound mail goes through. Resend's sending domain
// (azerbaijantravel.com) was never DNS-verified (no SPF/DKIM/MX), so mail was
// landing in spam or bouncing outright -- moved to Brevo, which the domain is
// being verified with instead.

type Attachment = { filename: string; content: Buffer }

type SendEmailData = {
  to:          string
  toName?:     string
  from:        string // "Display Name <email@domain.com>"
  subject:     string
  html:        string
  replyTo?:    string
  attachments?: Attachment[]
}

function parseFrom(from: string) {
  const match = from.match(/^(.*)<(.+)>$/)
  if (match) return { name: match[1].trim(), email: match[2].trim() }
  return { email: from.trim() }
}

export async function sendEmail(data: SendEmailData) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept:         'application/json',
      'content-type': 'application/json',
      'api-key':      process.env.BREVO_API_KEY ?? '',
    },
    body: JSON.stringify({
      sender:  parseFrom(data.from),
      to:      [{ email: data.to, name: data.toName }],
      subject: data.subject,
      htmlContent: data.html,
      ...(data.replyTo ? { replyTo: { email: data.replyTo } } : {}),
      ...(data.attachments?.length
        ? { attachment: data.attachments.map(a => ({ name: a.filename, content: a.content.toString('base64') })) }
        : {}),
    }),
  })

  if (!res.ok) {
    throw new Error(`Brevo send failed (${res.status}): ${await res.text()}`)
  }

  return res.json()
}
