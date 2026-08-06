import { EntetePage } from "@/components/ui/Carte";
import FormulaireEmploye from "@/components/employe/FormulaireEmploye";

export default function PageNouvelleEmploye() {
  return (
    <div className="mx-auto max-w-2xl">
      <EntetePage
        titre="Nouvel employé"
        description="Ajoutez un employé et définissez son salaire journalier."
      />
      <FormulaireEmploye />
    </div>
  );
}
