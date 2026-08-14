"use client";

import { useActionState, useState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type FormState = { success?: string };

async function action(_prev: FormState, formData: FormData): Promise<FormState> {
  return await requestPasswordReset(formData);
}

export function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [email, setEmail] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">Забравена парола</h2>
        <p className="mt-1 text-sm text-slate-600">
          Въведете имейла на акаунта си и ще ви изпратим линк за смяна на паролата.
        </p>

        {state.success ? (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.success}
          </p>
        ) : (
          <form action={formAction} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="reset-email">Имейл</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Изпращане..." : "Изпрати линк"}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          Затвори
        </button>
      </div>
    </div>
  );
}
