/**
 * Types for "El Mundo De Snoopy"
 */

export type Direction = 'down' | 'up' | 'left' | 'right';

export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'night';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy';

export interface WeatherState {
  type: WeatherType;
  puddleIntensity: number; // 0 to 1
  windAngle: number;
  transitionProgress: number; // for smooth crossfades
}

export interface Position {
  x: number;
  y: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PlayerActivity = 'standing' | 'walking' | 'running' | 'sitting' | 'writing';

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  activity: PlayerActivity;
  isMoving: boolean;
  isRunning: boolean;
  frame: number;
  animationTimer: number;
  sittingOnId?: string;
}

export type NPCId =
  | 'snoopy'
  | 'woodstock'
  | 'charlie_brown'
  | 'lucy'
  | 'linus'
  | 'sally'
  | 'schroeder'
  | 'peppermint_patty'
  | 'marcie';

export interface NPCState {
  id: NPCId;
  name: string;
  tagline: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  isMoving: boolean;
  frame: number;
  animationTimer: number;
  currentMapId: string;
  activity: string; // e.g., 'resting_on_roof', 'playing_piano', 'thinking', 'holding_blanket'
  dialogueGreeting: string;
  autonomousTimer: number;
  targetPos?: Position;
}

export type InteractableType =
  | 'door'
  | 'chair'
  | 'bed'
  | 'desk'
  | 'piano'
  | 'thinking_wall'
  | 'doghouse_entry'
  | 'psychiatry_booth'
  | 'kite_tree'
  | 'pumpkin_patch'
  | 'baseball_mound'
  | 'water_fountain'
  | 'chalkboard'
  | 'bookshelf'
  | 'record_player'
  | 'decor'
  | 'dock'
  | 'hay_bale'
  | 'tea_kettle'
  | 'vanity_mirror'
  | 'typewriter'
  | 'billiards'
  | 'trophy_case';

export interface InteractableObject {
  id: string;
  name: string;
  type: InteractableType;
  x: number;
  y: number;
  width: number;
  height: number;
  // Direction to sit or interact if applicable
  facingDirection?: Direction;
  sitOffsetX?: number;
  sitOffsetY?: number;
  // Target map if it's a door
  targetMapId?: string;
  targetSpawnPos?: Position;
  description: string;
  promptA?: string;
  promptB?: string;
}

export interface MapObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'wall' | 'furniture' | 'tree' | 'water' | 'fence';
}

export interface GameMap {
  id: string;
  name: string;
  isInterior: boolean;
  width: number;
  height: number;
  tileSize: number;
  obstacles: MapObstacle[];
  interactables: InteractableObject[];
  spawnPoint: Position;
  ambientSound: 'nature' | 'interior' | 'breeze' | 'music_box';
}

export type NotebookCategory = 'Poema' | 'Historia' | 'Carta' | 'Diario' | 'Pensamiento' | 'Música' | 'Novela';

export interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  category: NotebookCategory;
  createdAt: number;
  updatedAt: number;
  reactions: Record<NPCId, string>;
}

export interface ConversationMessage {
  id: string;
  sender: 'player' | 'npc';
  speakerName: string;
  text: string;
  timestamp: number;
}

export interface CharacterMemory {
  npcId: NPCId;
  totalConversations: number;
  recentTopics: string[];
  lastInteractionTime: number;
  writingsRead: {
    entryId: string;
    title: string;
    reactionSummary: string;
    timestamp: number;
  }[];
  memorableQuotes: string[];
}
