/**
 * Dialogue Modal for "El Mundo De Snoopy"
 * - Freeform AI conversation faithful to each Peanuts character's personality & memory
 * - Custom input with full Spanish keyboard
 * - Direct option to show any written note or poem
 * - Charming retro comic dialogue bubble aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import { NPCState, TimeOfDay, NotebookEntry, WeatherType } from '../types';
import { askNPC } from '../engine/gemini';
import { memoryManager } from '../engine/memory';
import { audio } from '../engine/audio';

interface DialogueModalProps {
  npc: NPCState;
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  timeOfDay: TimeOfDay;
  weather?: WeatherType;
  onOpenNotebook?: () => void;
}

interface Message {
  sender: 'npc' | 'ari';
  text: string;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  isOpen,
  onClose,
  locationName,
  timeOfDay,
  weather = 'sunny',
  onOpenNotebook,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWritingPicker, setShowWritingPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize dialogue with character's greeting
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          sender: 'npc',
          text: npc.dialogueGreeting,
        },
      ]);
      audio.playDialogBlip(520);
    }
  }, [isOpen, npc]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal.trim();
    if (!textToSend || isLoading) return;

    audio.playTypewriterKey();
    const newMessages: Message[] = [...messages, { sender: 'ari', text: textToSend }];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const history = newMessages.map((m) => ({
        sender: m.sender === 'ari' ? 'Ari' : npc.name,
        text: m.text,
      }));

      const res = await askNPC(
        npc.id,
        textToSend,
        history,
        locationName,
        timeOfDay,
        npc.activity,
        weather
      );

      audio.playDialogBlip(440);
      setMessages((prev) => [...prev, { sender: 'npc', text: res.reply }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'npc',
          text: '*(Sonríe calurosamente y asiente en silencio, disfrutando de la compañía de Ari)*',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWriting = async (entry: NotebookEntry) => {
    setShowWritingPicker(false);
    const shareText = `Quiero compartir contigo un escrito de mi cuaderno titulado "${entry.title}":\n\n"${entry.content}"`;
    await handleSendMessage(shareText);
  };

  // Avatar lookup
  const getAvatarEmoji = () => {
    switch (npc.id) {
      case 'snoopy':
        return '🐶';
      case 'woodstock':
        return '🐥';
      case 'charlie_brown':
        return '🧢';
      case 'lucy':
        return '👧';
      case 'linus':
        return '🧣';
      case 'sally':
        return '🎀';
      case 'schroeder':
        return '🎹';
      case 'peppermint_patty':
        return '⚾';
      case 'marcie':
        return '👓';
      default:
        return '⭐';
    }
  };

  const entries = memoryManager.getEntries();

  return (
    <div
      id="dialogue-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/70 p-2 sm:p-4 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="dialogue-container"
        className="relative flex h-[82vh] max-h-[620px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#fffdfa] shadow-2xl border-2 border-stone-800"
      >
        {/* Header with Character Profile Banner */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 bg-[#ffdd00] px-4 py-3 text-stone-950">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border-2 border-stone-900 text-2xl shadow-sm">
              {getAvatarEmoji()}
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                {npc.name}
              </h3>
              <p className="text-xs text-stone-800 font-medium">{npc.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-dialog-close"
              type="button"
              onClick={() => {
                audio.playButton(false);
                onClose();
              }}
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 active:scale-95 transition-all"
            >
              Cerrar [B]
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf7f0]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'ari' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  m.sender === 'ari'
                    ? 'bg-amber-600 text-white font-medium rounded-br-none'
                    : 'bg-white text-stone-900 border border-stone-300 font-normal rounded-bl-none'
                }`}
              >
                {m.sender === 'npc' && (
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                    {npc.name}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs text-stone-600 border border-stone-300 shadow-sm animate-pulse">
                <span>{getAvatarEmoji()}</span>
                <span>{npc.name} está pensando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Writing Picker Overlay if opened */}
        {showWritingPicker && (
          <div className="border-t border-amber-200 bg-amber-50 p-3 max-h-40 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900">
                Selecciona un escrito de tu cuaderno para enseñárselo:
              </span>
              <button
                onClick={() => setShowWritingPicker(false)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Cerrar
              </button>
            </div>
            {entries.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No tienes escritos guardados todavía.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {entries.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleShareWriting(e)}
                    className="flex items-center justify-between rounded-lg bg-white p-2 text-left text-xs border border-amber-300/70 hover:bg-amber-100 transition-colors"
                  >
                    <span className="font-semibold text-stone-900 truncate">{e.title}</span>
                    <span className="text-[10px] text-amber-800">{e.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-stone-300 bg-white p-2.5 sm:p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Share writing button */}
            <button
              type="button"
              onClick={() => setShowWritingPicker((prev) => !prev)}
              className="flex items-center justify-center rounded-xl bg-amber-100 p-2.5 text-stone-800 hover:bg-amber-200 transition-colors"
              title="Compartir escrito de tu cuaderno"
            >
              📖
            </button>

            {/* Input field */}
            <input
              id="input-dialogue-message"
              type="text"
              placeholder={`Escribe lo que quieras decirle a ${npc.name}...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-none"
            />

            {/* Send button */}
            <button
              id="btn-dialogue-send"
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 shadow hover:bg-amber-400 disabled:opacity-40 active:scale-95 transition-all"
            >
              Enviar [A]
            </button>
          </form>

          {/* Suggested conversational topics */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] font-semibold text-stone-500">Sugerencias:</span>
            {getTopicSuggestions(npc.id).map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(topic)}
                disabled={isLoading}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700 hover:bg-stone-200 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getTopicSuggestions(npcId: string): string[] {
  switch (npcId) {
    case 'snoopy':
      return ['¿En qué novela estás trabajando?', '¿Quieres una galleta?', '¡Hola Joe Cool!'];
    case 'woodstock':
      return ['¿Cómo está tu nido hoy?', '¡Buen vuelo!', '¿Qué te parece el día?'];
    case 'charlie_brown':
      return ['¿Cómo te va hoy, Charlie Brown?', '¿Vamos al montículo de béisbol?', 'El día es bonito'];
    case 'lucy':
      return ['Aquí tienes mis 5 centavos para consulta', '¿Cómo ves el mundo hoy?', '¿Schroeder sigue tocando?'];
    case 'linus':
      return ['Háblame de la Gran Calabaza', 'Tu mantita azul es muy suave', 'A veces pensar reconforta'];
    case 'sally':
      return ['¿Has visto a Linus?', '¿Qué tal las clases hoy?', 'Me gusta tu vestido'];
    case 'schroeder':
      return ['¿Qué sonata de Beethoven es esa?', 'La música suena maravillosa', '¡Tocas con mucha pasión!'];
    case 'peppermint_patty':
      return ['¿Cuándo es el próximo partido?', '¡Qué buen lanzamiento!', '¿Dormiste bien en clase?'];
    case 'marcie':
      return ['¿Qué libro estás leyendo?', 'Me gusta la tranquilidad del vecindario', 'Buenas tardes, Marcie'];
    default:
      return ['¡Hola! ¿Cómo estás?', 'Qué bonito día'];
  }
}
