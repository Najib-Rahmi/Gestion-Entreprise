import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Layout commun aux pages protégées (dashboard, factures, employés, clients).
 * Affiche la navbar en haut, le contenu au centre et le footer en bas.
 */
export default function LayoutTableauDeBord({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}