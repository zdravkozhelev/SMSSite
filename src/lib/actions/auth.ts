"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAndSendVerificationToken } from "@/lib/verification";
import { sendPasswordResetEmail } from "@/lib/email";

const registerSchema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerClient(formData: FormData) {
  const parsed = registerSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Моля, попълнете всички полета правилно." };
  }

  const { companyName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Вече съществува акаунт с този имейл." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "CLIENT",
      client: {
        create: {
          companyName,
        },
      },
    },
  });

  await createAndSendVerificationToken(user.id, user.email);

  // No subscription/limit is created here — the admin assigns an SMS
  // limit for the client afterwards from the admin panel.
  redirect("/login?registered=1");
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    // Don't reveal whether the account exists or is already verified.
    return { success: "Ако имейлът съществува, изпратихме нов линк за потвърждение." };
  }

  await createAndSendVerificationToken(user.id, user.email);
  return { success: "Изпратихме нов линк за потвърждение на имейла ви." };
}

const PASSWORD_RESET_TTL_HOURS = 1;

export async function requestPasswordReset(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  const generic = {
    success: "Ако имейлът съществува, изпратихме линк за смяна на паролата.",
  };

  if (!email.success) return generic;

  const user = await prisma.user.findUnique({ where: { email: email.data } });
  if (!user) return generic;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return generic;
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат.",
    path: ["confirmPassword"],
  });

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Невалидни данни." };
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) {
    return { error: "Невалиден или вече използван линк." };
  }
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return { error: "Линкът е изтекъл. Заявете нов от страницата за вход." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } });

  redirect("/login?reset=1");
}
