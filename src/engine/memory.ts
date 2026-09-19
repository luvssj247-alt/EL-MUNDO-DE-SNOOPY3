/**
 * Memory and Notebook Persistence for "El Mundo De Snoopy"
 * - Characters remember important discussions, texts read, and shared moments
 * - Infinite notebook supporting full Spanish keyboard (ñ, tildes, punctuation, formatting)
 */

import { CharacterMemory, NotebookEntry, NPCId } from '../types';

const MEMORY_STORAGE_KEY = 'snoopy_character_memories';
const NOTEBOOK_STORAGE_KEY = 'snoopy_notebook_entries';

// Initial memories for the Peanuts crew
const DEFAULT_MEMORIES: Record<NPCId, CharacterMemory> = {
  snoopy: {
    npcId: 'snoopy',
    totalConversations: 0,
    recentTopics: ['novelas policíacas', 'galletas', 'el Barón Rojo'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      '¡Era una noche oscura y tormentosa!',
      'Bleah! ¡No hay nada como una siesta en el tejado!',
    ],
  },
  woodstock: {
    npcId: 'woodstock',
    totalConversations: 0,
    recentTopics: ['el nido', 'vuelo en zigzag'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: ["|||'''! *¡Pip-pip!*"],
  },
  charlie_brown: {
    npcId: 'charlie_brown',
    totalConversations: 0,
    recentTopics: ['el árbol de cometas', 'el equipo de béisbol', 'la amistad'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      '¡Cielos santos!',
      'A veces uno solo necesita a alguien que se siente a su lado en silencio.',
    ],
  },
  lucy: {
    npcId: 'lucy',
    totalConversations: 0,
    recentTopics: ['consejos de 5 centavos', 'Schroeder', 'seguridad en uno mismo'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      '¡The Doctor is IN!',
      'Si tienes una opinión, dila en voz alta y cobra por ella.',
    ],
  },
  linus: {
    npcId: 'linus',
    totalConversations: 0,
    recentTopics: ['la Gran Calabaza', 'mi mantita azul', 'sabiduría antigua'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      'No hay carga más pesada que un gran potencial.',
      'Tener fe en la Gran Calabaza requiere paciencia sincera.',
    ],
  },
  sally: {
    npcId: 'sally',
    totalConversations: 0,
    recentTopics: ['Linus mi dulce amorcito', 'las vacaciones', 'la escuela'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      '¿A quién le importa?',
      '¡Linus es mi dulce amorcito, aunque lo niegue!',
    ],
  },
  schroeder: {
    npcId: 'schroeder',
    totalConversations: 0,
    recentTopics: ['Beethoven', 'la novena sinfonía', 'la belleza del piano'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      'Beethoven no componía para pasar el rato, componía para la eternidad.',
    ],
  },
  peppermint_patty: {
    npcId: 'peppermint_patty',
    totalConversations: 0,
    recentTopics: ['el partido de béisbol', 'Chuck', 'las siestas en clase'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      '¡No te rindas, Ari! ¡El próximo turno al bate es el nuestro!',
    ],
  },
  marcie: {
    npcId: 'marcie',
    totalConversations: 0,
    recentTopics: ['lecturas tranquilas', 'el señor Patty', 'la poesía'],
    lastInteractionTime: Date.now(),
    writingsRead: [],
    memorableQuotes: [
      'Las mejores historias son las que se escriben con el corazón en paz.',
    ],
  },
};

// Initial starter writings in Ari's notebook
const DEFAULT_NOTEBOOK: NotebookEntry[] = [
  {
    id: 'entry_1',
    title: 'Tarde bajo el cielo de otoño',
    category: 'Poema',
    content:
      'Las hojas doradas caen suavemente sobre el camino de adoquines.\nEl viento acaricia las ramas del árbol devorador de cometas,\ny a lo lejos, el piano de Schroeder desgrana una melodía de calma.\n\nEn este rincón del mundo no hay prisa alguna,\nsolo amigos que caminan a su propio ritmo.',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
    reactions: {
      snoopy:
        '*(Snoopy coloca sus gafas de sol Joe Cool y asiente solemnemente. En su libreta anota: "Notable apertura poética...")*',
      charlie_brown:
        'Me ha llegado al corazón, Ari. Transmite exactamente lo que siento al sentarme en el porche.',
      linus:
        'Hermosa alegoría sobre la serenidad, Ari. Recuerda que la paz empieza cuando dejamos de luchar contra el viento.',
      schroeder:
        'Noto un compás andante de tres por cuatro en tus versos. Beethoven habría aprobado ese compás de otoño.',
      lucy:
        'Bastante bien para no haber pagado mis cinco centavos de consulta previa. Le doy un notable alto.',
      sally:
        '¡Suena muy dulce! Casi tanto como mi amorcito Linus...',
      peppermint_patty:
        '¡Vaya, Ari! ¡Escribes con la misma fuerza con la que yo bateo un cuadrangular!',
      marcie:
        'Una métrica impecable y llena de sensibilidad, Ari. Ha sido un honor leerlo.',
      woodstock:
        "|||'''! *¡Chirp chirp!* (Woodstock vuela en círculos maravillado y posa una plumita sobre la hoja).",
    },
  },
  {
    id: 'entry_2',
    title: 'Carta a un soñador de tejado',
    category: 'Carta',
    content:
      'Querido Snoopy,\n\nDicen que una caseta de perro es solo madera pintada de rojo,\npero tú me has enseñado que adentro cabe una mansión entera,\nun cuadro de Van Gogh, una mesa de billar y miles de aventuras.\n\nGracias por recordarme que la imaginación no tiene techos.',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
    reactions: {
      snoopy:
        '*(Snoopy se seca una lágrima invisible con la punta de su oreja, hace una reverencia digna de la corte real y te ofrece un pedacito de galleta con chispas de chocolate)*',
      woodstock:
        "|||'''! (Woodstock asiente con lágrimas de emoción y aletea hacia el tejado de la caseta).",
      charlie_brown:
        '¡Es tan cierto, Ari! Snoopy tiene un mundo propio... ¡a veces me pregunto cómo cabe tanto en esa caseta!',
      lucy: '',
      linus: '',
      sally: '',
      schroeder: '',
      peppermint_patty: '',
      marcie: '',
    },
  },
];

class MemoryManager {
  private memories: Record<NPCId, CharacterMemory> = DEFAULT_MEMORIES;
  private entries: NotebookEntry[] = DEFAULT_NOTEBOOK;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedMem = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (savedMem) {
        this.memories = { ...DEFAULT_MEMORIES, ...JSON.parse(savedMem) };
      }
      const savedNotes = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
      if (savedNotes) {
        this.entries = JSON.parse(savedNotes);
      }
    } catch (e) {
      console.warn('Could not load memories from localStorage', e);
    }
  }

  public save() {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memories));
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  // Character Memory Methods
  public getMemory(npcId: NPCId): CharacterMemory {
    return this.memories[npcId] || DEFAULT_MEMORIES[npcId];
  }

  public recordConversation(npcId: NPCId, topicSnippet: string) {
    const mem = this.getMemory(npcId);
    mem.totalConversations += 1;
    mem.lastInteractionTime = Date.now();
    if (topicSnippet && !mem.recentTopics.includes(topicSnippet)) {
      mem.recentTopics = [topicSnippet, ...mem.recentTopics].slice(0, 6);
    }
    this.memories[npcId] = mem;
    this.save();
  }

  public recordWritingRead(
    npcId: NPCId,
    entryId: string,
    title: string,
    reactionSummary: string
  ) {
    const mem = this.getMemory(npcId);
    mem.writingsRead = [
      {
        entryId,
        title,
        reactionSummary,
        timestamp: Date.now(),
      },
      ...mem.writingsRead.filter((w) => w.entryId !== entryId),
    ].slice(0, 10);
    this.memories[npcId] = mem;
    this.save();
  }

  // Notebook Methods
  public getEntries(): NotebookEntry[] {
    return this.entries;
  }

  public getEntry(id: string): NotebookEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }

  public saveEntry(entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt' | 'reactions'> & { id?: string }): NotebookEntry {
    const now = Date.now();
    let saved: NotebookEntry;

    if (entry.id) {
      const existing = this.getEntry(entry.id);
      saved = {
        ...(existing || {
          reactions: {
            snoopy: '',
            woodstock: '',
            charlie_brown: '',
            lucy: '',
            linus: '',
            sally: '',
            schroeder: '',
            peppermint_patty: '',
            marcie: '',
          },
        }),
        title: entry.title,
        category: entry.category,
        content: entry.content,
        updatedAt: now,
        id: entry.id,
        createdAt: existing?.createdAt || now,
      };
      this.entries = this.entries.map((e) => (e.id === entry.id ? saved : e));
    } else {
      saved = {
        id: `entry_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: entry.title || 'Escrito sin título',
        category: entry.category,
        content: entry.content,
        createdAt: now,
        updatedAt: now,
        reactions: {
          snoopy: '',
          woodstock: '',
          charlie_brown: '',
          lucy: '',
          linus: '',
          sally: '',
          schroeder: '',
          peppermint_patty: '',
          marcie: '',
        },
      };
      this.entries = [saved, ...this.entries];
    }

    this.save();
    return saved;
  }

  public saveReaction(entryId: string, npcId: NPCId, reactionText: string) {
    const entry = this.getEntry(entryId);
    if (!entry) return;

    entry.reactions[npcId] = reactionText;
    this.entries = this.entries.map((e) => (e.id === entryId ? entry : e));
    this.recordWritingRead(npcId, entryId, entry.title, reactionText);
    this.save();
  }

  public deleteEntry(id: string) {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.save();
  }
}

export const memoryManager = new MemoryManager();
