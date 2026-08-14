import { Resend } from "resend";

export function isEmailConfigured() {
  return !!process.env.RESEND_API_KEY;
}

const resend = isEmailConfigured() ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "TogetherSMS <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  if (!resend) {
    console.log(`[email disabled] Verification link for ${to}: ${verifyUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Потвърдете имейл адреса си — TogetherSMS",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Добре дошли в TogetherSMS</h2>
        <p>Моля, потвърдете имейл адреса си, за да активирате акаунта си.</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
            Потвърди имейла
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">Линкът е валиден 24 часа. Ако не сте се регистрирали в TogetherSMS, игнорирайте това съобщение.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log(`[email disabled] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Смяна на парола — TogetherSMS",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Заявка за нова парола</h2>
        <p>Получихме заявка за смяна на паролата на акаунта ви в TogetherSMS.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
            Задай нова парола
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">Линкът е валиден 1 час. Ако не сте заявявали смяна на парола, игнорирайте това съобщение.</p>
      </div>
    `,
  });
}
