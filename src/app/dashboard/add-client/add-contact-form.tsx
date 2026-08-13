"use client";

import { useActionState, useState } from "react";
import { addContact } from "@/lib/actions/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type FormState = { error?: string; success?: string };

const DEFAULT_WELCOME_MESSAGE =
  "Здравейте, {name}! Благодарим Ви, че сте наш клиент.";

async function action(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const result = await addContact(formData);
    return result ?? { success: "Контактът е добавен." };
  } catch {
    return { error: "Грешка при добавяне на контакт." };
  }
}

export function AddContactForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [sendWelcome, setSendWelcome] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="phone">Телефон</Label>
        <Input id="phone" name="phone" placeholder="+359..." required />
      </div>
      <div>
        <Label htmlFor="name">Име (по избор)</Label>
        <Input id="name" name="name" />
      </div>
      <div>
        <Label htmlFor="carPlate">Рег. номер (по избор)</Label>
        <Input id="carPlate" name="carPlate" placeholder="напр. CA1234XX" />
      </div>
      <div>
        <Label htmlFor="inspectionDate">Дата на технически преглед (по избор)</Label>
        <Input id="inspectionDate" name="inspectionDate" type="date" />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="sendWelcome"
          checked={sendWelcome}
          onChange={(e) => setSendWelcome(e.target.checked)}
        />
        Изпрати съобщение веднага след добавяне
      </label>

      {sendWelcome && (
        <div>
          <Label htmlFor="welcomeMessage">Текст на съобщението</Label>
          <textarea
            id="welcomeMessage"
            name="welcomeMessage"
            rows={3}
            maxLength={918}
            defaultValue={DEFAULT_WELCOME_MESSAGE}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <p className="mt-1 text-xs text-slate-400">
            Налични плейсхолдъри: {"{name}"}, {"{plate}"}, {"{date}"}
          </p>
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}

      <Button type="submit" disabled={pending}>
        Добави клиент
      </Button>
    </form>
  );
}
