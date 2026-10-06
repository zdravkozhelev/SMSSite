"use client";

import { useActionState, useRef, useState } from "react";
import { sendBulkMessage } from "@/lib/actions/client";
import { Button } from "@/components/ui/button";
import { calculateSmsSegments } from "@/lib/sms/segments";
import { SmsSegmentModal } from "@/components/sms-segment-modal";
import { EditContactRow } from "./edit-contact-row";

type Contact = {
  id: string;
  phone: string;
  name: string | null;
  carPlate: string | null;
  inspectionDate: Date | null;
};

type FormState = { error?: string; success?: string };

export function ContactsTable({
  contacts,
  canSendBulkMessages,
}: {
  contacts: Contact[];
  canSendBulkMessages: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [body, setBody] = useState("");
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

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === contacts.length ? new Set() : new Set(contacts.map((c) => c.id))
    );
  }

  async function action(_prev: FormState, formData: FormData): Promise<FormState> {
    const result = await sendBulkMessage(Array.from(selected), formData);
    if (result?.success) {
      setSelected(new Set());
      setBody("");
      lastWarnedSegments.current = 1;
    }
    return result ?? {};
  }
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-slate-500">
          <tr>
            {canSendBulkMessages && (
              <th className="px-4 py-2 font-medium">
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === contacts.length}
                  onChange={toggleAll}
                />
              </th>
            )}
            <th className="px-4 py-2 font-medium">Телефон</th>
            <th className="px-4 py-2 font-medium">Име</th>
            <th className="px-4 py-2 font-medium">Рег. номер</th>
            <th className="px-4 py-2 font-medium">Дата на преглед</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <EditContactRow
              key={c.id}
              contact={c}
              selectable={canSendBulkMessages}
              selected={selected.has(c.id)}
              onToggleSelect={() => toggle(c.id)}
            />
          ))}
        </tbody>
      </table>

      {canSendBulkMessages && (
        <div className="border-t border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Групово съобщение</h2>
          <p className="mt-1 text-xs text-slate-500">
            Избрани: {selected.size} от {contacts.length} контакта. Налични
            плейсхолдъри: {"{name}"}, {"{plate}"}, {"{date}"}.
          </p>
          <form action={formAction} className="mt-3 space-y-3">
            <textarea
              name="body"
              required
              maxLength={918}
              rows={4}
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Здравейте, {name}! ..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <p className="text-xs text-slate-400">
              {body.length}/918 символа
              {segments > 1 && (
                <span className="text-amber-600"> — ще се изпрати като {segments} SMS</span>
              )}
            </p>
            {segmentWarning !== null && (
              <SmsSegmentModal
                segments={segmentWarning}
                onClose={() => setSegmentWarning(null)}
              />
            )}
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
            <Button type="submit" disabled={pending || selected.size === 0}>
              {pending ? "Изпращане..." : `Изпрати до ${selected.size} контакта`}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
