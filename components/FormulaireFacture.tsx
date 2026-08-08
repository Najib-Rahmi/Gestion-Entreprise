"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FormulaireFactureHeader,
  FormulaireFactureLignes,
  FormulaireFactureTotaux,
  FormulaireFactureActions,
  type FactureFormulaire,
  type LigneFormulaire,
} from "@/components/facture";
import { formaterMontant, dateVersInput } from "@/lib/utils";

interface Client {
  _id: string;
  nom: string;
  adresse: string;
  tva: string;
}

const TVA_DEFAUT = 19;
const TIMBRE_DEFAUT = 1;

export default function FormulaireFacture({
  factureInitiale,
}: {
  factureInitiale?: FactureFormulaire;
}) {
  const routeur = useRouter();
  const estModification = Boolean(factureInitiale?._id);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsChargement, setClientsChargement] = useState(true);

  const [clientId, setClientId] = useState(factureInitiale?.client || "");
  const [projet, setProjet] = useState(factureInitiale?.projet || "");
  const [date, setDate] = useState(
    factureInitiale?.date || dateVersInput(new Date()),
  );
  const [lignes, setLignes] = useState<LigneFormulaire[]>(
    factureInitiale?.lignes?.length ? factureInitiale.lignes : [{ designation: "", unite: "m²", quantite: 1, prixUnitaire: 0 }],
  );
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [timbre, setTimbre] = useState(factureInitiale?.timbre ?? TIMBRE_DEFAUT);

  useEffect(() => {
    async function chargerClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch {
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setClientsChargement(false);
      }
    }
    chargerClients();
  }, []);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();

    if (!clientId) {
      toast.error("Le client est requis");
      return;
    }
    if (!projet.trim()) {
      toast.error("Le projet est requis");
      return;
    }
    if (!date) {
      toast.error("La date est requise");
      return;
    }
    if (lignes.some((l) => !l.designation.trim())) {
      toast.error("Chaque ligne doit avoir une désignation");
      return;
    }

    setEnvoiEnCours(true);
    try {
      const donnees = {
        client: clientId,
        projet,
        date,
        timbre,
        lignes: lignes.map((l) => ({
          designation: l.designation,
          unite: l.unite,
          quantite: Number(l.quantite),
          prixUnitaire: Number(l.prixUnitaire),
          tva: TVA_DEFAUT,
        })),
      };

      const url = estModification
        ? `/api/factures/${factureInitiale!._id}`
        : "/api/factures";
      const res = await fetch(url, {
        method: estModification ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });

      if (!res.ok) {
        const erreur = await res.json();
        throw new Error(erreur.message || "Erreur serveur");
      }

      toast.success(
        estModification ? "Facture mise à jour" : "Facture créée avec succès",
      );
      routeur.push("/factures");
      routeur.refresh();
    } catch (erreur) {
      toast.error(
        erreur instanceof Error
          ? erreur.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="space-y-6">
      <FormulaireFactureHeader
        clients={clients}
        clientsChargement={clientsChargement}
        clientId={clientId}
        setClientId={setClientId}
        projet={projet}
        setProjet={setProjet}
        date={date}
        setDate={setDate}
      />

      <FormulaireFactureLignes lignes={lignes} setLignes={setLignes} />

      <FormulaireFactureTotaux
        lignes={lignes}
        timbre={timbre}
        setTimbre={setTimbre}
      />

      <FormulaireFactureActions
        envoiEnCours={envoiEnCours}
        estModification={estModification}
        onCancel={() => routeur.push("/factures")}
        onSubmit={soumettre}
      />
    </div>
  );
}