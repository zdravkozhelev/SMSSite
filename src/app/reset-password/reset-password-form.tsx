"use client";

import { useActionState, useState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type FormState = { error?: string };

async function action(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await resetPassword(formData);
  return result ?? {};
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="password">Нова парола</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Повторете паролата</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {mismatch && <p className="text-sm text-red-600">Паролите не съвпадат.</p>}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending || mismatch} className="w-full">
        {pending ? "Запазване..." : "Смени паролата"}
      </Button>
    </form>
  );
}
