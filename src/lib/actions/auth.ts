"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";

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

  await prisma.user.create({
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

  // No subscription/limit is created here — the admin assigns an SMS
  // limit for the client afterwards from the admin panel.
  redirect("/login?registered=1");
}
