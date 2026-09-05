import { Navbar } from "@/components/navbar";
import { ContactFlipButton } from "@/components/contact-flip-button";

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <Navbar />

      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Цени</h1>
        <p className="mt-4 text-slate-600">
          Всеки бизнес е различен, затова цената и броят SMS съобщения се
          определят индивидуално според нуждите ви. Свържете се с нас и ще
          подготвим оферта, съобразена с вашия обем клиенти.
        </p>
        <div className="mt-8 flex justify-center">
          <ContactFlipButton />
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
