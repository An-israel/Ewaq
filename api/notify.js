export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, avg, label } = req.body;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "EWAQ Assessment <onboarding@resend.dev>",
      to: ["ppobichukwu@gmail.com"],
      subject: `New Assessment Submission — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f9f7;border-radius:12px;">
          <h2 style="font-size:20px;color:#1B4332;margin:0 0 20px;">New EWAQ Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;width:80px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;color:#111827;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Score</td><td style="padding:8px 0;font-size:18px;font-weight:700;color:#1B4332;">${avg} / 5.00 &nbsp;<span style="font-size:13px;font-weight:600;">${label}</span></td></tr>
          </table>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Resend error:", err);
    return res.status(500).json({ error: err });
  }

  return res.status(200).json({ ok: true });
}
