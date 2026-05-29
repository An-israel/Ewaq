export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY env var is not set");
    return res.status(500).json({ error: "RESEND_API_KEY not configured" });
  }

  const { name, email, avg, label } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email in request body" });
  }

  const payload = {
    from: "EWAQ Assessment <onboarding@resend.dev>",
    to: ["ppobichukwu@gmail.com"],
    subject: `New Assessment — ${name} (${label})`,
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
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Resend rejected:", JSON.stringify(data));
    return res.status(500).json({ error: data?.message || data?.name || "Resend error", detail: data });
  }

  return res.status(200).json({ ok: true, id: data.id });
}
