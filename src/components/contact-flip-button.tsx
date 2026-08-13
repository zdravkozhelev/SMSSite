"use client";

import { useState } from "react";

export function ContactFlipButton() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="mx-auto h-12 w-56 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#5DCAA5] text-base font-medium text-[#04342C] hover:bg-[#4FB894]"
          style={{ backfaceVisibility: "hidden" }}
        >
          Свържете се с нас
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#5DCAA5] text-base font-medium text-[#04342C]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          Тел: 0896515204
        </div>
      </div>
    </div>
  );
}
