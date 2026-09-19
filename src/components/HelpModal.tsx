/**
 * Guide & Instructions Modal for "El Mundo De Snoopy"
 */

import React from 'react';
import { audio } from '../engine/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-3 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="help-modal-container"
        className="relative flex h-[85vh] max-h-[640px] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-[#fffdf7] shadow-2xl border-2 border-stone-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 bg-[#ffdd00] px-4 py-3 text-stone-950">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐶</span>
            <h3 className="font-extrabold text-base">Guía de "El Mundo de Snoopy"</h3>
          </div>
          <button
            onClick={() => {
              audio.playButton(false);
              onClose();
            }}
            className="rounded-lg bg-stone-900 px-3 py-1 text-xs font-bold text-white hover:bg-stone-800"
          >
            Cerrar [B]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm text-stone-800 leading-relaxed">
          <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200">
            <h4 className="font-bold text-amber-950 mb-1">🌿 Una experiencia cozy y de vida</h4>
            <p className="text-xs text-stone-700">
              No hay combate ni misiones impuestas. Estás aquí para vivir dentro del vecindario de Peanuts junto a Ari: pasear, reflexionar en el muro, tocar el piano con Schroeder, visitar el asombroso interior de la caseta de Snoopy y escribir en tu cuaderno.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 mb-2">🎮 Controles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-stone-100 p-2.5">
                <span className="font-bold text-amber-800">D-Pad / Flechas / WASD:</span>
                <p className="text-stone-600 mt-0.5">Mover a Ari en 4 direcciones (físicas reales sin atravesar paredes ni objetos).</p>
              </div>
              <div className="rounded-lg bg-stone-100 p-2.5">
                <span className="font-bold text-amber-800">🏃 Correr:</span>
                <p className="text-stone-600 mt-0.5">Mantén Shift en teclado o pulsa el botón 'Correr' en móvil.</p>
              </div>
              <div className="rounded-lg bg-amber-100/70 p-2.5">
                <span className="font-bold text-amber-950">Botón [A] (Espacio / Z):</span>
                <p className="text-stone-700 mt-0.5">Hablar con personajes, compartir tus escritos y seleccionar.</p>
              </div>
              <div className="rounded-lg bg-rose-100/70 p-2.5">
                <span className="font-bold text-rose-950">Botón [B] (X / E):</span>
                <p className="text-stone-700 mt-0.5">Interactuar con el entorno: entrar a casas, sentarse, tocar piano, subir al muro.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 mb-1.5">📖 Cuaderno Infinito de Ari</h4>
            <p className="text-xs text-stone-600">
              Pulsa el botón [Cuaderno] o pulsa la tecla 'N'. Puedes escribir libremente cualquier poema, pensamiento o carta. Cada uno de los 9 personajes de Peanuts lee y reacciona de manera única y fiel a su personalidad.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 mb-1.5">👥 Personajes Auténticos</h4>
            <ul className="text-xs space-y-1 text-stone-700 list-disc list-inside">
              <li><strong>Snoopy:</strong> Descansando en su tejado o en su lujosa mansión subterránea.</li>
              <li><strong>Woodstock:</strong> Volando cerca del nido y de Snoopy.</li>
              <li><strong>Charlie Brown:</strong> Reflexionando cerca de su porche o del campo.</li>
              <li><strong>Lucy van Pelt:</strong> En su caseta psiquiátrica de 5 centavos.</li>
              <li><strong>Linus van Pelt:</strong> Esperando en el huerto de la Gran Calabaza con su mantita.</li>
              <li><strong>Schroeder:</strong> Tocando obras inmortales de Beethoven en su piano.</li>
              <li><strong>Peppermint Patty y Marcie:</strong> En el campo de béisbol o en el aula escolar.</li>
              <li><strong>Sally Brown:</strong> Buscando a su querido Linus por el vecindario.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
