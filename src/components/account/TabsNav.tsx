"use client";

import { Link, usePathname } from "@/i18n/navigation";

export function TabsNav({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 mt-4 flex gap-1 overflow-x-auto border-b border-wall px-4 print:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-none items-center border-b-[3px] px-4 font-bold ${active ? "border-sea text-sea" : "border-transparent text-ink-soft"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
