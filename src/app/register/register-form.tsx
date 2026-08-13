"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerClient } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type FormState = { error?: string };

async function action(_prevState: FormState, formData: FormData): Promise<FormState> {
  const result = await registerClient(formData);
  return result ?? {};
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="companyName">Име на фирма</Label>
        <Input id="companyName" name="companyName" required />
      </div>
      <div>
        <Label htmlFor="name">Вашето име</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Имейл</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Парола</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Регистрация..." : "Регистрация"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Вече имате акаунт?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Вход
        </Link>
      </p>
    </form>
  );
}
