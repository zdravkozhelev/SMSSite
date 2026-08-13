"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-2 text-sm font-medium text-slate-500 hover:text-red-600"
    >
      Изход
    </button>
  );
}
