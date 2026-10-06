"use client";

import { useActionState, useRef, useState } from "react";
import { updateReminderRule } from "@/lib/actions/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { calculateSmsSegments } from "@/lib/sms/segments";
import { SmsSegmentModal } from "@/components/sms-segment-modal";

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
  "Zdraveite, {name}! Napomnqme vi, che tehnicheskiqt pregled na avtomobil s reg. nomer {plate} izticha na {date} - svurjete se s nas za zapazvane na chas.";

export function ReminderRuleForm({ rule }: { rule: Rule }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [body, setBody] = useState(rule?.body ?? DEFAULT_BODY);
  const [segmentWarning, setSegmentWarning] = useState<number | null>(null);
  const lastWarnedSegments = useRef(1);

  const { segments } = calculateSmsSegments(body);

  function handleBodyChange(value: string) {
    setBody(value);
    const { segments: newSegments } = calculateSmsSegments(value);
    if (newSegments > 1 && newSegments !== lastWarnedSegments.current) {
      setSegmentWarning(newSegments);
      lastWarnedSegments.current = newSegments;
    } else if (newSegments <= 1) {
      lastWarnedSegments.current = 1;
    }
  }

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
          onChange={(e) => handleBodyChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <p className="mt-1 text-xs text-slate-400">
          Налични плейсхолдъри: {"{name}"}, {"{plate}"}, {"{date}"} — {body.length}/918 символа
          {segments > 1 && (
            <span className="text-amber-600"> — ще се изпрати като {segments} SMS</span>
          )}
        </p>
      </div>

      {segmentWarning !== null && (
        <SmsSegmentModal
          segments={segmentWarning}
          onClose={() => setSegmentWarning(null)}
        />
      )}

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
