"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAndSendVerificationToken } from "@/lib/verification";

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
