import { redirect } from "next/navigation";
import { auth } from "@/lib/getAuth";
import { PlatformShell } from "@/components/platform/platform-shell";

// Every platform page needs an account
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user } = await auth();
  if (!user) redirect("/login");

  return (
    <PlatformShell user={{ name: user.name ?? null, image: user.image ?? null, isPro: !!user.isPro }}>
      {children}
    </PlatformShell>
  );
}
