import fs from "fs";
import path from "path";
import { Navbar } from "@/components/navbar";

function renderLine(line: string, index: number) {
  const trimmed = line.trim();

  if (trimmed === "---") {
    return <hr key={index} className="my-6 border-slate-200" />;
  }
  if (trimmed.startsWith("### ")) {
    return (
      <h3 key={index} className="mt-6 text-lg font-semibold text-slate-900">
        {trimmed.slice(4)}
      </h3>
    );
  }
  if (trimmed.startsWith("## ")) {
    return (
      <h2 key={index} className="mt-8 text-xl font-semibold text-slate-900">
        {trimmed.slice(3)}
      </h2>
    );
  }
  if (trimmed.startsWith("# ")) {
    return (
      <h1 key={index} className="text-2xl font-bold text-slate-900">
        {trimmed.slice(2)}
      </h1>
    );
  }
  if (trimmed.startsWith("* ")) {
    return (
      <li key={index} className="ml-5 list-disc text-slate-600">
        {trimmed.slice(2)}
      </li>
    );
  }
  if (trimmed === "") {
    return null;
  }
  return (
    <p key={index} className="mt-2 text-slate-600">
      {trimmed}
    </p>
  );
}

export default function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), "Privacy Policy.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  return (
    <div className="flex flex-col">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-16">
        {lines.map(renderLine)}
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} TogetherSMS. Всички права запазени.
        </div>
      </footer>
    </div>
  );
}
