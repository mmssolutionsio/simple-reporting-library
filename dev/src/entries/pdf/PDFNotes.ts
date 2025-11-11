export interface PDFNotesConfig {
  noteClass: string; // kann mehrere Selektoren per Komma enthalten
}

export default class PDFNotes {
  private notesArticles: NodeListOf<HTMLElement>;
  private selectors: string[];
  private excludedClasses = ['srl-grid', 'srl-linkable'];

  constructor(config: PDFNotesConfig) {
    const { noteClass } = config;

    if (!noteClass) {
      console.warn("PDFNotes: 'noteClass' ist erforderlich.");
      return;
    }

    // Selektoren sauber splitten
    this.selectors = noteClass.split(',').map(s => s.trim()).filter(Boolean);

    // Gesamtliste nur wenn du sie sonst brauchst
    this.notesArticles = document.querySelectorAll(noteClass);

    if (this.notesArticles.length === 0) {
      console.warn(`PDFNotes: Keine Elemente gefunden mit Selektor '${noteClass}'.`);
      return;
    }

    this.markLastNotePerSelector();
    this.setFirstAndLastNoteClass();
  }

  private setFirstAndLastNoteClass(): void {
    this.notesArticles.forEach(container => {
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const firstChild = children[0];
      const lastChild = children[children.length - 1];

      const getRelevantClass = (el: HTMLElement): string | null => {
        const classes = Array.from(el.classList);
        const relevant = classes.find(cls => !this.excludedClasses.includes(cls));
        return relevant || null;
      };

      const firstClass = getRelevantClass(firstChild);
      const lastClass = getRelevantClass(lastChild);

      if (firstClass) container.classList.add(`${firstClass}-first`);
      if (lastClass && lastClass !== firstClass) container.classList.add(`${lastClass}-last`);
    });
  }

  // Neu: letzte Note je Selektor markieren
  private markLastNotePerSelector(): void {
    if (!this.selectors || this.selectors.length === 0) return;

    this.selectors.forEach(sel => {
      const nodes = document.querySelectorAll<HTMLElement>(sel);
      if (nodes.length === 0) return;

      const last = nodes[nodes.length - 1];
      last.classList.add('last-note');

      // Falls du unterschiedliche Klassen pro Typ willst, entkommentieren:
      // const typeKey = sel.replace(/^[.#]/, '').replace(/[^a-zA-Z0-9_]/g, '_');
      // last.classList.add(`last-note-${typeKey}`);
    });
  }
}