"use client";

import { useActionState, useState } from "react";
import { updateReminderRule } from "@/lib/actions/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Rule = {
  body: string;
  daysBefore: number;
  isActive: boolean;
} | null;

type FormState = { error?: string; success?: string };

async function action(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const result = await updateReminderRule(formData);
    return result ?? {};
  } catch {
    return { error: "Възникна грешка при запазването." };
  }
}

const DEFAULT_BODY =
  "Здравейте, {name}! Напомняме Ви, че техническият преглед на автомобил с рег. номер {plate} изтича на {date} — свържете се с нас за запазване на час.";

export function ReminderRuleForm({ rule }: { rule: Rule }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [body, setBody] = useState(rule?.body ?? DEFAULT_BODY);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="body">Текст на напомнянето</Label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={918}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <p className="mt-1 text-xs text-slate-400">
          Налични плейсхолдъри: {"{name}"}, {"{plate}"}, {"{date}"} — {body.length}/918 символа
        </p>
      </div>

      <div>
        <Label htmlFor="daysBefore">Дни преди датата на преглед</Label>
        <Input
          id="daysBefore"
          name="daysBefore"
          type="number"
          min={1}
          max={90}
          required
          defaultValue={rule?.daysBefore ?? 14}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={rule?.isActive ?? true}
        />
        Автоматичните напомняния са активни
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Запазване..." : "Запази"}
      </Button>
    </form>
  );
}
