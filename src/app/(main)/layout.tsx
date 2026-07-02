import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

// This layout wraps all public-facing pages (homepage, fleet, about, contact).
// Auth pages at /auth/* use their own separate layout and do NOT get the header/footer.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
