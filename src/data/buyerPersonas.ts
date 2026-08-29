/**
 * Buyer personas for the Team/Org tier.
 *
 * MVP scope: TWO tracks — People-Leader and Business-Leader.
 * Each track seeds a different dashboard framing and different demo data.
 *
 * People-Leader: CHRO, VP People, HR Director, Chief of Staff — sees the
 * assessment through a talent-and-culture lens. Coverage, succession,
 * archetype health, adoption readiness by archetype.
 *
 * Business-Leader: CEO, COO, GM, Founder — sees the assessment through an
 * operations-and-execution lens. Capacity, missing archetypes as risk, the
 * strategic readout, expansion readiness.
 */

export type BuyerPersonaId = 'people-leader' | 'business-leader';

export interface BuyerPersona {
  id: BuyerPersonaId;
  label: string;
  roleExamples: string;
  tagline: string;
  dashboardFraming: {
    heroKicker: string;
    heroTitle: string;
    heroLede: string;
  };
  panelPriority: readonly PanelKey[];
}

export type PanelKey =
  | 'coverage-map'
  | 'missing-archetype-alerts'
  | 'team-composition'
  | 'individual-profiles'
  | 'executive-readout'
  | 'succession-view'
  | 'adoption-readiness'
  | 'capacity-balance';

export const BUYER_PERSONAS: readonly BuyerPersona[] = [
  {
    id: 'people-leader',
    label: 'People Leader',
    roleExamples: 'CHRO, VP People, HR Director, Chief of Staff',
    tagline: 'You are responsible for talent, culture, and how the org grows people.',
    dashboardFraming: {
      heroKicker: 'People Leader view',
      heroTitle: 'The archetype map of your team.',
      heroLede:
        'Coverage across the five organizational systems, adoption readiness by archetype, and where the succession gaps live.',
    },
    panelPriority: [
      'coverage-map',
      'succession-view',
      'adoption-readiness',
      'team-composition',
      'missing-archetype-alerts',
      'individual-profiles',
      'executive-readout',
    ],
  },
  {
    id: 'business-leader',
    label: 'Business Leader',
    roleExamples: 'CEO, COO, GM, Founder-Operator',
    tagline: 'You are responsible for direction, execution, and results.',
    dashboardFraming: {
      heroKicker: 'Business Leader view',
      heroTitle: 'The capacity read on your team.',
      heroLede:
        'Where the hive is strong, where it is exposed, and what the executive readout says about your ability to execute the next play.',
    },
    panelPriority: [
      'executive-readout',
      'capacity-balance',
      'missing-archetype-alerts',
      'coverage-map',
      'team-composition',
      'individual-profiles',
      'succession-view',
    ],
  },
];

export const BUYER_PERSONA_BY_ID: Readonly<Record<BuyerPersonaId, BuyerPersona>> =
  Object.freeze(
    Object.fromEntries(BUYER_PERSONAS.map((p) => [p.id, p])) as Record<
      BuyerPersonaId,
      BuyerPersona
    >,
  );

export function getBuyerPersona(id: BuyerPersonaId): BuyerPersona {
  const p = BUYER_PERSONA_BY_ID[id];
  if (!p) throw new Error(`Unknown buyer persona: ${id}`);
  return p;
}
