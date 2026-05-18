import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Doago <lukaberlec25@gmail.com>";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Doago</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px 16px 0 0;padding:28px 36px;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Doago</span>
              <span style="display:block;font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;font-weight:400;">Slovenska platforma za storitve</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#111111;padding:36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0d0d0d;border-radius:0 0 16px 16px;padding:20px 36px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#444444;">
                © 2025 Doago · Slovenska platforma za storitve
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#333333;">
                To je avtomatsko sporočilo — prosimo, ne odgovarjajte nanj.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function badge(text: string, color: string): string {
  return `<span style="display:inline-block;background-color:${color}1a;color:${color};border:1px solid ${color}33;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;">${text}</span>`;
}

function statBox(label: string, value: string): string {
  return `
  <td style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 18px;text-align:center;width:50%;">
    <div style="font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">${label}</div>
    <div style="font-size:18px;font-weight:700;color:#ffffff;">${value}</div>
  </td>`;
}

export async function sendTaskPublishedEmail(opts: {
  to: string;
  ime: string;
  naslov: string;
  kategorija: string;
  cena: number;
  nalogaId: string;
}): Promise<void> {
  const { to, ime, naslov, kategorija, cena, nalogaId } = opts;

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">Naloga objavljena! 🎉</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#666666;">Pozdravljeni, <strong style="color:#cccccc;">${ime}</strong></p>

    <div style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:16px;font-weight:600;color:#ffffff;">${naslov}</span>
        ${badge(kategorija, "#f97316")}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr>
          ${statBox("Cena", `${cena} €`)}
          <td style="width:16px;"></td>
          ${statBox("Status", "Odprta")}
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#888888;line-height:1.7;margin:0 0 28px;">
      Vaša naloga je zdaj vidna vsem registriranim izvajalcem na platformi. Ko jo kdo sprejme, boste takoj obveščeni.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td>
          <div style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;">
            <div style="font-size:12px;color:#555555;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">Naslednji koraki</div>
            <div style="display:flex;align-items:flex-start;margin-bottom:8px;">
              <span style="color:#f97316;font-weight:700;margin-right:10px;font-size:13px;">01</span>
              <span style="font-size:13px;color:#888888;">Izvajalec sprejme vašo nalogo</span>
            </div>
            <div style="display:flex;align-items:flex-start;margin-bottom:8px;">
              <span style="color:#f97316;font-weight:700;margin-right:10px;font-size:13px;">02</span>
              <span style="font-size:13px;color:#888888;">Prejete boste obvestilo po emailu</span>
            </div>
            <div style="display:flex;align-items:flex-start;">
              <span style="color:#f97316;font-weight:700;margin-right:10px;font-size:13px;">03</span>
              <span style="font-size:13px;color:#888888;">Nalogo označite kot opravljeno in ocenite izvajalca</span>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <a href="${process.env.NEXTAUTH_URL}/dashboard"
       style="display:block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.01em;">
      Oglej si svojo nalogo →
    </a>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Naloga "${naslov}" je bila objavljena`,
    html: layout(body),
  }).catch((err) => console.error("[email] taskPublished:", err));
}

export async function sendTaskAcceptedEmail(opts: {
  to: string;
  ime: string;
  naslov: string;
  kategorija: string;
  cena: number;
  izvajalecIme: string;
}): Promise<void> {
  const { to, ime, naslov, kategorija, cena, izvajalecIme } = opts;

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">Naloga sprejeta! 🤝</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#666666;">Pozdravljeni, <strong style="color:#cccccc;">${ime}</strong></p>

    <div style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="margin-bottom:10px;">
        <span style="font-size:16px;font-weight:600;color:#ffffff;">${naslov}</span>
      </div>
      <div style="margin-bottom:16px;">
        ${badge(kategorija, "#f97316")}
        ${badge("Sprejeta", "#3b82f6")}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${statBox("Cena", `${cena} €`)}
          <td style="width:16px;"></td>
          ${statBox("Izvajalec", izvajalecIme)}
        </tr>
      </table>
    </div>

    <div style="background-color:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#f97316;font-weight:600;">👷 Izvajalec: ${izvajalecIme}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#888888;">je prevzel vašo nalogo in bo začel z delom.</p>
    </div>

    <p style="font-size:14px;color:#888888;line-height:1.7;margin:0 0 28px;">
      Ko bo naloga opravljena, jo v aplikaciji označite kot zaključeno in ocenite izvajalca. Vaša povratna informacija pomaga skupnosti.
    </p>

    <a href="${process.env.NEXTAUTH_URL}/dashboard"
       style="display:block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;">
      Odpri dashboard →
    </a>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🤝 ${izvajalecIme} je sprejel vašo nalogo "${naslov}"`,
    html: layout(body),
  }).catch((err) => console.error("[email] taskAccepted:", err));
}

export async function sendTaskAppliedEmail(opts: {
  to: string;
  izvajalecIme: string;
  naslov: string;
}): Promise<void> {
  const { to, izvajalecIme, naslov } = opts;

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">Nova prijava na nalogo! 🙋</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#666666;">Izvajalec se je prijavil na vašo nalogo.</p>

    <div style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="margin-bottom:12px;">
        <span style="font-size:16px;font-weight:600;color:#ffffff;">${naslov}</span>
      </div>
      <div style="background-color:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#f97316;font-weight:600;">👷 ${izvajalecIme}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#888888;">želi sprejeti vašo nalogo.</p>
      </div>
    </div>

    <p style="font-size:14px;color:#888888;line-height:1.7;margin:0 0 28px;">
      Prijavite se v aplikacijo in si oglejte profil izvajalca. Prijavo lahko potrdite ali zavrnete.
    </p>

    <a href="${process.env.NEXTAUTH_URL}/naloge/moje"
       style="display:block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;">
      Potrdi ali zavrni prijavo →
    </a>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🙋 ${izvajalecIme} se je prijavil na vašo nalogo "${naslov}"`,
    html: layout(body),
  }).catch((err) => console.error("[email] taskApplied:", err));
}

export async function sendTaskConfirmedEmail(opts: {
  to: string;
  naslov: string;
  narocnikIme: string;
}): Promise<void> {
  const { to, naslov, narocnikIme } = opts;

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">Prijava potrjena! ✅</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#666666;">Naročnik je potrdil vašo prijavo.</p>

    <div style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="margin-bottom:12px;">
        <span style="font-size:16px;font-weight:600;color:#ffffff;">${naslov}</span>
      </div>
      <div style="background-color:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#22c55e;font-weight:600;">🎉 ${narocnikIme} je potrdil vašo prijavo</p>
        <p style="margin:6px 0 0;font-size:13px;color:#888888;">Stopite v kontakt in se dogovorite za začetek dela.</p>
      </div>
    </div>

    <p style="font-size:14px;color:#888888;line-height:1.7;margin:0 0 28px;">
      Nalogo boste našli med svojimi sprejetimi nalogami. Ko bo opravljena, vas bo naročnik ocenil.
    </p>

    <a href="${process.env.NEXTAUTH_URL}/naloge/moje"
       style="display:block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;">
      Odpri moje naloge →
    </a>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Prijava potrjena za nalogo "${naslov}"`,
    html: layout(body),
  }).catch((err) => console.error("[email] taskConfirmed:", err));
}

export async function sendTaskRejectedEmail(opts: {
  to: string;
  naslov: string;
}): Promise<void> {
  const { to, naslov } = opts;

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">Prijava ni bila potrjena</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#666666;">Naročnik tokrat ni izbral vaše prijave.</p>

    <div style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="margin-bottom:12px;">
        <span style="font-size:16px;font-weight:600;color:#ffffff;">${naslov}</span>
      </div>
      <div style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#a3a3a3;">Naloga je spet odprta za prijave. Poiščite druge priložnosti na platformi.</p>
      </div>
    </div>

    <p style="font-size:14px;color:#888888;line-height:1.7;margin:0 0 28px;">
      Ne obupajte — na platformi je vsak dan novih nalog. Poskusite z drugo nalogo.
    </p>

    <a href="${process.env.NEXTAUTH_URL}/naloge/vse"
       style="display:block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;">
      Poišči druge naloge →
    </a>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Prijava za nalogo "${naslov}" ni bila potrjena`,
    html: layout(body),
  }).catch((err) => console.error("[email] taskRejected:", err));
}
