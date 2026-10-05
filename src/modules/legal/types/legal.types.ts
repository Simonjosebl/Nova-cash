/** Sección de un documento legal: párrafos y, opcionalmente, una lista de puntos. */
export interface ILegalSection {
  title: string;
  paragraphs: ReadonlyArray<string>;
  bullets?: ReadonlyArray<string>;
}

export interface ILegalDocument {
  title: string;
  intro: string;
  sections: ReadonlyArray<ILegalSection>;
}
