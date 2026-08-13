"use client";

import { useState } from "react";
import { editContact, deleteContact } from "@/lib/actions/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Contact = {
  id: string;
  phone: string;
  name: string | null;
  carPlate: string | null;
  inspectionDate: Date | null;
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EditContactRow({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="border-b border-slate-50 last:border-0">
        <td className="px-4 py-3 text-slate-900">{contact.phone}</td>
        <td className="px-4 py-3 text-slate-600">{contact.name ?? "—"}</td>
        <td className="px-4 py-3 text-slate-600">{contact.carPlate ?? "—"}</td>
        <td className="px-4 py-3 text-slate-600">
          {contact.inspectionDate
            ? contact.inspectionDate.toLocaleDateString("bg-BG")
            : "—"}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-2 py-1 text-xs"
              onClick={() => setOpen(true)}
            >
              Редактирай
            </Button>
            <form action={deleteContact.bind(null, contact.id)}>
              <Button type="submit" variant="outline" className="px-2 py-1 text-xs">
                Изтрий
              </Button>
            </form>
          </div>
        </td>
      </tr>

      {open && (
        <EditContactModal contact={contact} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function EditContactModal({
  contact,
  onClose,
}: {
  contact: Contact;
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
        <h2 className="text-lg font-semibold text-slate-900">Редактирай контакт</h2>

        <form
          action={async (formData) => {
            await editContact(contact.id, formData);
            onClose();
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <Label htmlFor="edit-phone">Телефон</Label>
            <Input
              id="edit-phone"
              name="phone"
              defaultValue={contact.phone}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-name">Име</Label>
            <Input id="edit-name" name="name" defaultValue={contact.name ?? ""} />
          </div>
          <div>
            <Label htmlFor="edit-carPlate">Рег. номер</Label>
            <Input
              id="edit-carPlate"
              name="carPlate"
              defaultValue={contact.carPlate ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="edit-inspectionDate">Дата на технически преглед</Label>
            <Input
              id="edit-inspectionDate"
              name="inspectionDate"
              type="date"
              defaultValue={toDateInputValue(contact.inspectionDate)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отказ
            </Button>
            <Button type="submit">Редактирай</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
