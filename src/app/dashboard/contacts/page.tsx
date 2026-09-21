import { requireClient } from "@/lib/actions/client";
import { prisma } from "@/lib/db";
import { ContactsTable } from "./contacts-table";
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
          <ContactsTable contacts={contacts} canSendBulkMessages={client.canSendBulkMessages} />
        )}
      </div>
    </div>
  );
}
