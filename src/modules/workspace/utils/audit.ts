const ACTION_VERBS: Record<string, string> = {
  INSERT: 'registró',
  UPDATE: 'editó',
  DELETE: 'eliminó',
};

const ENTITY_LABELS: Record<string, string> = {
  transaction: 'un movimiento',
  account: 'una cuenta',
  category: 'una categoría',
  budget: 'un presupuesto',
  goal: 'una meta',
};

/** Frase humana del historial (Cap. 4.18 / 6.15). */
export function buildAuditDescription(action: string, entity: string): string {
  const verb = ACTION_VERBS[action] ?? action.toLowerCase();
  const target = ENTITY_LABELS[entity] ?? entity;
  return `${verb} ${target}`;
}
