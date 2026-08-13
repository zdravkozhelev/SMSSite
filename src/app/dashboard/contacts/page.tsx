import { requireClient } from "@/lib/actions/client";
import { prisma } from "@/lib/db";
import { EditContactRow } from "./edit-contact-row";
import { SearchBox } from "./search-box";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const client = await requireClient();
  const { q } = await searchParams;
  const query = q?.trim();

  const contacts = await prisma.contact.findMany({
    where: {
      group: { clientId: client.id },
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { carPlate: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Списък с клиенти</h1>

      <div className="mt-6">
        <SearchBox />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {contacts.length === 0 ? (
          <p className="px-4 py-6 text-center text-slate-500">
            {query ? "Няма намерени клиенти." : "Все още нямате добавени клиенти."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Телефон</th>
                <th className="px-4 py-2 font-medium">Име</th>
                <th className="px-4 py-2 font-medium">Рег. номер</th>
                <th className="px-4 py-2 font-medium">Дата на преглед</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <EditContactRow key={c.id} contact={c} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
