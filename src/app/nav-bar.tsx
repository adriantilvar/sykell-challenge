"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/",
    title: "Analysis",
  },
  {
    href: "/results",
    title: "Results",
  },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-16 items-center justify-end bg-zinc-100 px-3 shadow ring-zinc-950/10">
      <ul className="flex gap-2">
        {navigation.map((link) => (
          <li key={link.href}>
            <Button
              variant="ghost"
              className={cn("text-base hover:bg-zinc-200/50", {
                "bg-zinc-200/50": pathname === link.href,
              })}
              asChild
            >
              <Link href={link.href}>{link.title}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
