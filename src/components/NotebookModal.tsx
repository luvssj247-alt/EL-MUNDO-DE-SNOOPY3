/**
 * Infinite Notebook Modal for "El Mundo De Snoopy"
 * - Full free writing with device/virtual keyboard
 * - Multiple entries (poems, letters, stories, thoughts)
 * - Individual character reactions to each piece of writing
 * - Ability to show to any Peanuts character in the neighborhood
 * - Vintage lined paper aesthetic and typewriter sound feedback
 */

import React, { useState } from 'react';
import { NotebookEntry, NotebookCategory, NPCId } from '../types';
import { memoryManager } from '../engine/memory';
import { askNPCToExamineWriting } from '../engine/gemini';
import { audio } from '../engine/audio';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  nearbyNPCId?: NPCId;
}

const CATEGORIES: NotebookCategory[] = [
  'Poema',
  'Pensamiento',
  'Carta',
  'Historia',
  'Diario',
  'Música',
  'Novela',
];

const CHARACTERS: { id: NPCId; name: string; avatar: string }[] = [
  { id: 'snoopy', name: 'Snoopy', avatar: '🐶' },
  { id: 'woodstock', name: 'Woodstock', avatar: '🐥' },
  { id: 'charlie_brown', name: 'Charlie Brown', avatar: '🧢' },
  { id: 'lucy', name: 'Lucy van Pelt', avatar: '👧' },
  { id: 'linus', name: 'Linus van Pelt', avatar: '🧣' },
  { id: 'sally', name: 'Sally Brown', avatar: '🎀' },
  { id: 'schroeder', name: 'Schroeder', avatar: '🎹' },
  { id: 'peppermint_patty', name: 'Peppermint Patty', avatar: '🧢' },
  { id: 'marcie', name: 'Marcie', avatar: '👓' },
];

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  nearbyNPCId,
}) => {
  const [entries, setEntries] = useState<NotebookEntry[]>(() => memoryManager.getEntries());
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(() => {
    const list = memoryManager.getEntries();
    return list.length > 0 ? list[0].id : null;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<NotebookCategory>('Pensamiento');
  const [editContent, setEditContent] = useState('');
  const [examiningNpc, setExaminingNpc] = useState<NPCId | null>(null);

  if (!isOpen) return null;

  const currentEntry = entries.find((e) => e.id === selectedEntryId);

  const handleStartNew = () => {
    audio.playPageFlip();
    setSelectedEntryId(null);
    setEditTitle('');
    setEditCategory('Pensamiento');
    setEditContent('');
    setIsEditing(true);
  };

  const handleStartEdit = () => {
    if (!currentEntry) return;
    audio.playPageFlip();
    setEditTitle(currentEntry.title);
    setEditCategory(currentEntry.category);
    setEditContent(currentEntry.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editContent.trim()) return;
    audio.playTypewriterDing();

    const saved = memoryManager.saveEntry({
      id: selectedEntryId || undefined,
      title: editTitle.trim() || 'Escrito de Ari',
      category: editCategory,
      content: editContent,
    });

    const updatedList = memoryManager.getEntries();
    setEntries(updatedList);
    setSelectedEntryId(saved.id);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    audio.playPageFlip();
    memoryManager.deleteEntry(id);
    const updated = memoryManager.getEntries();
    setEntries(updated);
    setSelectedEntryId(updated.length > 0 ? updated[0].id : null);
    setIsEditing(false);
  };

  const handleShowToNPC = async (npcId: NPCId) => {
    if (!currentEntry || examiningNpc) return;
    audio.playPageFlip();
    setExaminingNpc(npcId);

    try {
      const reaction = await askNPCToExamineWriting(
        npcId,
        currentEntry.title,
        currentEntry.category,
        currentEntry.content
      );
      memoryManager.saveReaction(currentEntry.id, npcId, reaction);
      setEntries(memoryManager.getEntries());
      audio.playDoorChime();
    } catch (e) {
      console.error(e);
    } finally {
      setExaminingNpc(null);
    }
  };

  return (
    <div
      id="notebook-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-2 sm:p-4 backdrop-blur-sm animate-fade-in"
    >
      {/* Vintage Notebook Book Cover Frame */}
      <div
        id="notebook-container"
        className="relative flex h-[92vh] max-h-[760px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-amber-900/90 p-3 shadow-2xl border-4 border-amber-950/80"
      >
        {/* Leather notebook header banner */}
        <div className="flex items-center justify-between border-b border-amber-700/60 pb-2 px-2 text-amber-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📓</span>
            <div>
              <h2 className="font-bold text-lg font-mono tracking-wider">
                Cuaderno de Pensamientos de Ari
              </h2>
              <p className="text-xs text-amber-200/80">
                Escritura libre, historias y reflexiones compartidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                id="btn-notebook-new"
                onClick={handleStartNew}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-500 active:scale-95 transition-all"
              >
                <span>✏️</span>
                <span>Nueva Página</span>
              </button>
            )}
            <button
              id="btn-notebook-close"
              onClick={() => {
                audio.playButton(false);
                onClose();
              }}
              className="rounded-lg bg-stone-800/80 px-3 py-1.5 text-xs font-bold text-stone-300 hover:bg-stone-700 active:scale-95 transition-all"
            >
              Cerrar (X)
            </button>
          </div>
        </div>

        {/* Notebook Body (Split view on larger screens, tabs on mobile) */}
        <div className="flex flex-1 overflow-hidden mt-2 gap-3">
          {/* Index of Writings Sidebar */}
          <div className="hidden sm:flex w-56 flex-col rounded-xl bg-amber-950/60 p-2 border border-amber-800/40 overflow-y-auto">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-amber-300/80">
              Páginas ({entries.length})
            </div>
            <div className="flex flex-col gap-1.5">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    audio.playPageFlip();
                    setSelectedEntryId(entry.id);
                    setIsEditing(false);
                  }}
                  className={`text-left rounded-lg p-2 transition-all ${
                    selectedEntryId === entry.id && !isEditing
                      ? 'bg-amber-100 text-stone-900 shadow-md font-bold'
                      : 'bg-amber-900/40 text-amber-100/90 hover:bg-amber-800/60'
                  }`}
                >
                  <div className="text-xs truncate">{entry.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                    <span className="font-semibold text-amber-600">{entry.category}</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lined Notebook Paper View / Editor */}
          <div className="flex-1 flex flex-col rounded-xl bg-[#fdfbf7] shadow-inner border border-amber-900/30 overflow-hidden relative">
            {/* Spiral binder / Notebook Punch Holes on far left */}
            <div className="absolute left-3.5 top-0 bottom-0 flex flex-col justify-around py-12 pointer-events-none z-10">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-950/30 shadow-inner border border-amber-900/40" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-950/30 shadow-inner border border-amber-900/40" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-950/30 shadow-inner border border-amber-900/40" />
            </div>

            {/* School notebook classic red margin line - strictly separated from text */}
            <div className="absolute left-11 sm:left-14 top-0 bottom-0 w-[1.5px] bg-rose-400/55 pointer-events-none z-10" />

            {isEditing ? (
              /* Writing Editor */
              <div className="flex-1 flex flex-col pl-14 sm:pl-20 pr-5 sm:pr-8 py-5 overflow-y-auto overflow-x-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3 mb-3">
                  <input
                    id="input-entry-title"
                    type="text"
                    placeholder="Título del escrito..."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 min-w-[200px] bg-transparent font-bold text-xl text-stone-800 focus:outline-none placeholder-stone-400 break-words"
                    maxLength={60}
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditCategory(cat)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          editCategory === cat
                            ? 'bg-amber-700 text-white shadow-sm'
                            : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Infinite Writing Sheet with strict margins and wrapping */}
                <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                  <textarea
                    id="textarea-entry-content"
                    placeholder="Escribe libremente lo que siente Ari hoy en el vecindario... (poemas, cartas, reflexiones, anécdotas o capítulos de tu novela. Admite tildes, ñ y signos)"
                    value={editContent}
                    onChange={(e) => {
                      audio.playTypewriterKey();
                      setEditContent(e.target.value);
                    }}
                    className="flex-1 w-full resize-none bg-transparent font-sans text-stone-800 text-base leading-8 focus:outline-none placeholder-stone-400 break-words whitespace-pre-wrap [overflow-wrap:anywhere] pr-2"
                    style={{
                      lineHeight: '32px',
                      backgroundImage: 'linear-gradient(transparent 31px, #ebe5db 32px)',
                      backgroundSize: '100% 32px',
                      wordBreak: 'break-word',
                    }}
                    spellCheck="true"
                    lang="es"
                  />
                </div>

                {/* Editor Action Buttons & Character stats */}
                <div className="flex items-center justify-between border-t border-amber-200/80 pt-3 mt-3">
                  <span className="text-[11px] text-stone-400 font-mono">
                    {editContent.length} caracteres · {editContent.trim() ? editContent.trim().split(/\s+/).length : 0} palabras
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playPageFlip();
                        setIsEditing(false);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      id="btn-save-entry"
                      type="button"
                      onClick={handleSave}
                      disabled={!editContent.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-600 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      <span>Guardar en Cuaderno</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : currentEntry ? (
              /* Reading / Showing Entry Mode */
              <div className="flex-1 flex flex-col pl-14 sm:pl-20 pr-5 sm:pr-8 py-5 overflow-y-auto overflow-x-hidden">
                <div className="flex items-start justify-between border-b border-amber-200/80 pb-3 mb-4">
                  <div className="pr-2 max-w-[80%]">
                    <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      {currentEntry.category}
                    </span>
                    <h3 className="font-bold text-2xl text-stone-900 mt-1 break-words">
                      {currentEntry.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {new Date(currentEntry.createdAt).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleStartEdit}
                      className="rounded-lg bg-stone-200 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-300 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(currentEntry.id)}
                      className="rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200 transition-colors"
                      title="Eliminar escrito"
                    >
                      Borrar
                    </button>
                  </div>
                </div>

                {/* Lined paper text output with strict margins and auto line wrapping */}
                <div
                  className="whitespace-pre-wrap font-sans text-stone-800 text-base leading-8 break-words [overflow-wrap:anywhere] max-w-full pr-2"
                  style={{
                    lineHeight: '32px',
                    backgroundImage: 'linear-gradient(transparent 31px, #ebe5db 32px)',
                    backgroundSize: '100% 32px',
                    wordBreak: 'break-word',
                  }}
                  lang="es"
                >
                  {currentEntry.content}
                </div>

                {/* Character Reactions Section */}
                <div className="mt-8 border-t-2 border-dashed border-amber-300 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                      Reacciones de los Personajes ({Object.values(currentEntry.reactions).filter(Boolean).length})
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Toca un personaje para que lea este escrito
                    </span>
                  </div>

                  {/* Character Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {CHARACTERS.map((char) => {
                      const hasRead = !!currentEntry.reactions[char.id];
                      const isNearby = nearbyNPCId === char.id;

                      return (
                        <button
                          key={char.id}
                          onClick={() => handleShowToNPC(char.id)}
                          disabled={examiningNpc !== null}
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                            isNearby
                              ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                              : hasRead
                              ? 'bg-amber-100 text-stone-800 border border-amber-300'
                              : 'bg-stone-200/70 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          <span>{char.avatar}</span>
                          <span>{char.name}</span>
                          {isNearby && <span className="text-[9px] font-extrabold">(Aquí cerca)</span>}
                          {hasRead && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {examiningNpc && (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-100/90 p-3 text-stone-800 text-xs animate-pulse mb-3">
                      <span>📖</span>
                      <span>
                        {CHARACTERS.find((c) => c.id === examiningNpc)?.name} está leyendo tu escrito con atención...
                      </span>
                    </div>
                  )}

                  {/* Reactions Feed */}
                  <div className="flex flex-col gap-2">
                    {CHARACTERS.map((char) => {
                      const reaction = currentEntry.reactions[char.id];
                      if (!reaction) return null;

                      return (
                        <div
                          key={char.id}
                          className="rounded-xl bg-amber-50/90 p-3 border border-amber-200/80 shadow-sm"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950 mb-1">
                            <span>{char.avatar}</span>
                            <span>{char.name}</span>
                          </div>
                          <p className="text-xs text-stone-800 italic leading-relaxed">
                            "{reaction}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <span className="text-4xl mb-2">📜</span>
                <p className="font-bold text-stone-700 text-sm">Tu cuaderno está abierto</p>
                <p className="text-xs text-stone-500 max-w-xs mt-1">
                  Pulsa en "Nueva Página" para redactar tu primer poema, carta o reflexión.
                </p>
                <button
                  onClick={handleStartNew}
                  className="mt-4 rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-600 transition-all"
                >
                  Escribir ahora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
