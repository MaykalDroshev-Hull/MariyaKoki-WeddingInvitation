import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RSVP_RECIPIENT = "mimpetranova@gmail.com";

type RsvpPayload = {
  name?: unknown;
  guests?: unknown;
  phone?: unknown;
  message?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let payload: RsvpPayload;
  try {
    payload = (await request.json()) as RsvpPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const name = asTrimmedString(payload.name);
  const guests = asTrimmedString(payload.guests);
  const phone = asTrimmedString(payload.phone);
  const message = asTrimmedString(payload.message);

  if (!name) {
    return NextResponse.json(
      { error: "Името е задължително." },
      { status: 400 },
    );
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("RSVP email: missing EMAIL_USER or EMAIL_PASS env vars.");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  const submittedAt = new Date().toLocaleString("bg-BG", {
    timeZone: "Europe/Sofia",
  });

  const dash = "—";
  const textBody = [
    "Здравейте,",
    "",
    "Нова RSVP заявка за сватбата на Мария и Калоян (26.06.2026):",
    "",
    `Име: ${name}`,
    `Брой гости: ${guests || dash}`,
    `Телефон: ${phone || dash}`,
    `Съобщение: ${message || dash}`,
    "",
    `Час на заявката: ${submittedAt}`,
  ].join("\n");

  const htmlBody = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #2b2b2b; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-weight: 400; font-size: 26px; margin: 0 0 8px;">Мария &amp; Калоян</h1>
      <p style="margin: 0 0 20px; color: #6b6b6b; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px;">RSVP &middot; 26.06.2026</p>
      <p style="margin: 0 0 16px;">Нова заявка за присъствие на сватбата:</p>
      <dl style="margin: 0 0 24px;">
        <dt style="font-weight: 600; margin-top: 12px;">Име</dt>
        <dd style="margin: 4px 0 0;">${escapeHtml(name)}</dd>
        <dt style="font-weight: 600; margin-top: 12px;">Брой гости</dt>
        <dd style="margin: 4px 0 0;">${escapeHtml(guests || dash)}</dd>
        <dt style="font-weight: 600; margin-top: 12px;">Телефон</dt>
        <dd style="margin: 4px 0 0;">${escapeHtml(phone || dash)}</dd>
        <dt style="font-weight: 600; margin-top: 12px;">Съобщение</dt>
        <dd style="margin: 4px 0 0; white-space: pre-wrap;">${escapeHtml(message || dash)}</dd>
      </dl>
      <p style="margin: 0; color: #6b6b6b; font-size: 13px;">Час на заявката: ${escapeHtml(submittedAt)}</p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"RSVP — Мария & Калоян" <${user}>`,
      to: RSVP_RECIPIENT,
      replyTo: user,
      subject: "Потвърждение за сватбата на Мария и Калоян — 26.06.2026",
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RSVP email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 },
    );
  }
}
