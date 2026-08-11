import { describe, it, expect } from "vitest";
import {
  compterJoursTravailles,
  compterJoursPayes,
  totalAvances,
  calculerResumePaie,
  normaliserJour,
  cleJour,
} from "./paie";

describe("compterJoursTravailles", () => {
  it("retourne 0 pour un tableau vide", () => {
    expect(compterJoursTravailles([])).toBe(0);
  });

  it("compte tous les jours, payés ou non", () => {
    const jours = [
      { date: "2026-08-01", paye: true },
      { date: "2026-08-02", paye: false },
      { date: "2026-08-03", paye: true },
    ];
    expect(compterJoursTravailles(jours)).toBe(3);
  });
});

describe("compterJoursPayes", () => {
  it("ne compte que les jours payés", () => {
    const jours = [
      { date: "2026-08-01", paye: true },
      { date: "2026-08-02", paye: false },
      { date: "2026-08-03", paye: true },
    ];
    expect(compterJoursPayes(jours)).toBe(2);
  });

  it("retourne 0 si aucun jour payé", () => {
    expect(compterJoursPayes([{ date: "2026-08-01", paye: false }])).toBe(0);
  });
});

describe("totalAvances", () => {
  it("retourne 0 pour un tableau vide", () => {
    expect(totalAvances([])).toBe(0);
  });

  it("additionne les montants", () => {
    expect(totalAvances([{ montant: 100 }, { montant: 50.5 }])).toBe(150.5);
  });

  it("ignore les montants nuls ou indéfinis", () => {
    expect(
      totalAvances([
        { montant: 100 },
        { montant: 0 },
        { montant: undefined as unknown as number },
      ]),
    ).toBe(100);
  });
});

describe("calculerResumePaie", () => {
  it("calcule un résumé complet", () => {
    const jours = [
      { date: "2026-08-01", paye: true },
      { date: "2026-08-02", paye: true },
      { date: "2026-08-03", paye: false },
    ];
    const avances = [{ montant: 50 }];
    const resume = calculerResumePaie(jours, avances, 100);

    expect(resume.joursTravailles).toBe(3);
    expect(resume.joursPayes).toBe(2);
    expect(resume.totalGagne).toBe(300);
    expect(resume.totalPaye).toBe(200);
    expect(resume.totalAvances).toBe(50);
    // soldeDu = 300 - 200 - 50 = 50
    expect(resume.soldeDu).toBe(50);
  });

  it("solde nul quand tout est payé sans avance", () => {
    const jours = [
      { date: "2026-08-01", paye: true },
      { date: "2026-08-02", paye: true },
    ];
    const resume = calculerResumePaie(jours, [], 80);
    expect(resume.soldeDu).toBe(0);
  });

  it("solde négatif si les avances dépassent le dû", () => {
    const jours = [{ date: "2026-08-01", paye: true }];
    const resume = calculerResumePaie(jours, [{ montant: 200 }], 100);
    // 100 - 100 - 200 = -200
    expect(resume.soldeDu).toBe(-200);
  });

  it("solde égal au total gagné si rien n'est payé", () => {
    const jours = [
      { date: "2026-08-01", paye: false },
      { date: "2026-08-02", paye: false },
    ];
    const resume = calculerResumePaie(jours, [], 75);
    expect(resume.soldeDu).toBe(150);
  });

  it("gère le cas sans jours ni avances", () => {
    const resume = calculerResumePaie([], [], 100);
    expect(resume).toEqual({
      joursTravailles: 0,
      joursPayes: 0,
      totalGagne: 0,
      totalPaye: 0,
      totalAvances: 0,
      soldeDu: 0,
    });
  });
});

describe("normaliserJour", () => {
  it("met l'heure à minuit", () => {
    const d = normaliserJour("2026-08-10T15:30:00");
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it("conserve la date", () => {
    const d = normaliserJour("2026-08-10T15:30:00");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7); // août = 7
    expect(d.getDate()).toBe(10);
  });
});

describe("cleJour", () => {
  it("formate en AAAA-MM-JJ avec zéros de remplissage", () => {
    expect(cleJour("2026-01-05T12:00:00")).toBe("2026-01-05");
    expect(cleJour("2026-12-25T12:00:00")).toBe("2026-12-25");
  });

  it("deux moments du même jour ont la même clé", () => {
    expect(cleJour("2026-08-10T08:00:00")).toBe(cleJour("2026-08-10T23:59:59"));
  });
});
