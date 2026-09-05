import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ContactFlipButton } from "@/components/contact-flip-button";

const useCases = [
  { title: "Автосервизи", icon: "🔧" },
  { title: "Салони за красота", icon: "💇" },
  { title: "Медицински кабинети", icon: "🩺" },
  { title: "Фитнеси и SPA", icon: "💪" },
];

const steps = [
  {
    number: "1",
    title: "Въвеждате данните",
    desc: "Име, телефон и дата на преглед — за секунди.",
  },
  {
    number: "2",
    title: "Забравяте за него",
    desc: "Системата следи датите и изпраща напомняне вместо вас.",
  },
  {
    number: "3",
    title: "Клиентът се връща",
    desc: "С малка отстъпка в напомнянето — вместо да отиде при конкурент.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <Navbar />

      <section className="bg-[#0B1B2B] px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium text-[#7FA8C9]">
            За пунктове за годишен технически преглед
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Забравихте да напомните на клиент за изтичащ технически преглед?
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#B7C9D9]">
            SMS напомняния 2–3 седмици предварително, изпратени напълно
            автоматично по регистрационен номер и дата.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button className="bg-[#5DCAA5] px-6 py-3 text-base text-[#04342C] hover:bg-[#4FB894]">
                Започнете сега
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1B2B] px-6 pb-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
          <div className="overflow-hidden rounded-2xl shadow-lg sm:w-1/2">
            <Image
              src="/images/before-reminder.png"
              alt="Собственик на пункт се опитва да си спомни кога изтича прегледът на клиент"
              width={800}
              height={533}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-2xl shadow-lg sm:w-1/2">
            <Image
              src="/images/after-reminder.png"
              alt="Клиент получава автоматично SMS напомняне за изтичащ технически преглед"
              width={800}
              height={533}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="use-cases" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-medium text-slate-400">
            Подходящо и за
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {useCases.map((u) => (
              <div
                key={u.title}
                className="rounded-xl bg-slate-50 px-4 py-5 text-center"
              >
                <div className="text-2xl">{u.icon}</div>
                <p className="mt-2 text-sm text-slate-600">{u.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Толкова е лесно, колкото звучи
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-600">
            Въвеждате данните на клиента веднъж — системата поема всичко
            останало.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="rounded-xl bg-white p-5 text-center shadow-sm">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#085041]">
                  {s.number}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-xl bg-[#E1F5EE] px-5 py-4">
            <span className="text-2xl">🏷️</span>
            <p className="text-sm leading-relaxed text-[#04342C]">
              <span className="font-semibold">Пример:</span> &quot;Здравей,
              Иван! Прегледът на CA1234XX изтича на 15.03. Запази час до края
              на месеца с 10% отстъпка.&quot;
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0B1B2B] px-6 py-20 text-center">
        {/* Placeholder gradient background — swap for a real photo of your ГТП point via background-image */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B1B2B] via-[#132A3D] to-[#0B1B2B]" />
        <div className="relative">
          <h2 className="text-2xl font-semibold text-white">
            Ако всичко това е за вас:
          </h2>
          <div className="mt-6">
            <ContactFlipButton />
          </div>
          <div className="mt-4">
            <Link
              href="/privacy"
              className="text-sm text-[#B7C9D9] underline hover:text-white"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} TogetherSMS. Всички права запазени.
        </div>
      </footer>
    </div>
  );
}
