"use client";

import { Button } from "@/components/ui/button";

export function SmsSegmentModal({
  segments,
  onClose,
}: {
  segments: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">Дълго съобщение</h2>
        <p className="mt-2 text-sm text-slate-600">
          Текстът надхвърли лимита за 1 SMS и ще бъде изпратен като{" "}
          <strong>{segments} отделни SMS-а</strong> на получател — таксува се{" "}
          {segments}× по-скъпо от обикновено съобщение.
        </p>
        <Button onClick={onClose} className="mt-4 w-full">
          Разбрах
        </Button>
      </div>
    </div>
  );
}
