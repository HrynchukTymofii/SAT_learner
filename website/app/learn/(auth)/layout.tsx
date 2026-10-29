import ToasterProvider from "@/components/toaster-provider";

// Login and register: no sidebar, open to everyone
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToasterProvider />
      {children}
    </>
  );
}
