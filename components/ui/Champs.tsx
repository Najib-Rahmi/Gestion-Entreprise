"use client";

import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Composants de formulaire réutilisables avec libellé et message d'erreur.
 * Styles cohérents clair/sombre dans toute l'application.
 */

const stylesChamp =
  "w-full rounded-xl border border-[var(--couleur-bordure)] bg-[var(--couleur-carte)] px-3 py-2 text-sm text-[var(--couleur-texte)] placeholder-[var(--couleur-texte-secondaire)] backdrop-blur-sm transition-colors focus:border-[var(--couleur-primaire)] focus:outline-none focus:ring-2 focus:ring-[var(--couleur-primaire)]/20";

const stylesLibelle = "block text-sm font-medium text-[var(--couleur-texte)]";

interface ChampTexteProps extends InputHTMLAttributes<HTMLInputElement> {
  libelle: string;
  erreur?: string;
}

export const ChampTexte = forwardRef<HTMLInputElement, ChampTexteProps>(
  ({ libelle, erreur, className, ...props }, ref) => (
    <div className="space-y-1">
      <label className={stylesLibelle}>
        {libelle}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        ref={ref}
        className={cn(stylesChamp, className)}
        {...props}
      />
      {erreur && <p className="text-xs text-red-500">{erreur}</p>}
    </div>
  ),
);
ChampTexte.displayName = "ChampTexte";

interface ChampNombreProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  libelle: string;
  erreur?: string;
}

export const ChampNombre = forwardRef<HTMLInputElement, ChampNombreProps>(
  ({ libelle, erreur, className, ...props }, ref) => (
    <div className="space-y-1">
      <label className={stylesLibelle}>
        {libelle}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        ref={ref}
        type="number"
        className={cn(stylesChamp, className)}
        {...props}
      />
      {erreur && <p className="text-xs text-red-500">{erreur}</p>}
    </div>
  ),
);
ChampNombre.displayName = "ChampNombre";

interface ChampSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  libelle: string;
  erreur?: string;
  options: { valeur: string; libelle: string }[];
  placeholder?: string;
}

export const ChampSelect = forwardRef<HTMLSelectElement, ChampSelectProps>(
  ({ libelle, erreur, options, placeholder, className, ...props }, ref) => (
    <div className="space-y-1">
      <label className={stylesLibelle}>
        {libelle}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        ref={ref}
        className={cn(stylesChamp, className)}
        {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.valeur}
            value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
      {erreur && <p className="text-xs text-red-500">{erreur}</p>}
    </div>
  ),
);
ChampSelect.displayName = "ChampSelect";

interface ChampZoneTexteProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  libelle: string;
  erreur?: string;
  lignes?: number;
}

export const ChampZoneTexte = forwardRef<
  HTMLTextAreaElement,
  ChampZoneTexteProps
>(({ libelle, erreur, className, ...props }, ref) => (
  <div className="space-y-1">
    <label className={stylesLibelle}>{libelle}</label>
    <textarea
      ref={ref}
      rows={3}
      className={cn(stylesChamp, className)}
      {...props}
    />
    {erreur && <p className="text-xs text-red-500">{erreur}</p>}
  </div>
));
ChampZoneTexte.displayName = "ChampZoneTexte";
