/**
 * World and Maps Engine for "El Mundo De Snoopy"
 * - Compact, detailed, living neighborhood
 * - Coherent, distinct, habitable interiors for ALL major buildings:
 *   1. Casa de Ari (bedroom, living room, kitchen, bathroom, writing nook, storage, customizable decor)
 *   2. Casa de Charlie Brown y Sally (living room, kitchen with Snoopy's bowl, Charlie's baseball room, Sally's room, yard exit)
 *   3. Casa de Lucy y Linus (living room, kitchen, hallways, Linus's blanket & book room, Lucy's vanity & psychiatry room)
 *   4. Casa de Peppermint Patty (sporty, informal living room, kitchen, sports gear, casual bedroom)
 *   5. Casa de Marcie (tidy, quiet, extensive bookshelves, tea kettle, reading desk, peaceful bedroom)
 *   6. Caseta de Snoopy (legendary vast underground mansion: fireplace hall, billiard room, art gallery, vintage typewriter study)
 *   7. Escuela Primaria (lockers, hallways, classrooms with chalkboard, teacher desk, student desks)
 *   8. Granero de Daisy Hill (hay bales, toolshed, Snoopy puppyhood memorial and birthplace)
 *   9. Overworld locations: Thinking Wall, Lucy's Booth, Schroeder's Piano Gazebo, Kite-Eating Tree, Pumpkin Patch, Baseball Field, Daisy Hill Pond
 */

import { GameMap, MapObstacle, InteractableObject } from '../types';

export const MAPS: Record<string, GameMap> = {
  // =========================================================================
  // 1. OVERWORLD: The Peanuts Neighborhood (1800 x 1400)
  // =========================================================================
  overworld: {
    id: 'overworld',
    name: 'Vecindario de Peanuts',
    isInterior: false,
    width: 1800,
    height: 1400,
    tileSize: 32,
    ambientSound: 'nature',
    spawnPoint: { x: 304, y: 360 }, // Porch of Ari's house
    obstacles: [
      // 1. Ari's House Exterior (x: 180..420, y: 140..310)
      { x: 180, y: 140, width: 240, height: 160, type: 'wall' },
      { x: 150, y: 160, width: 30, height: 140, type: 'fence' },
      { x: 420, y: 160, width: 50, height: 20, type: 'fence' },

      // 2. Charlie Brown & Sally's House (x: 530..790, y: 140..310)
      { x: 530, y: 140, width: 260, height: 160, type: 'wall' },
      { x: 500, y: 200, width: 30, height: 100, type: 'fence' },

      // 3. Snoopy's Doghouse Yard (x: 870..950, y: 210..290)
      { x: 875, y: 215, width: 70, height: 65, type: 'furniture' },

      // 4. Elementary Schoolhouse (x: 1100..1420, y: 140..320)
      { x: 1100, y: 140, width: 320, height: 180, type: 'wall' },

      // 5. Lucy & Linus's House (x: 180..420, y: 440..600)
      { x: 180, y: 440, width: 240, height: 150, type: 'wall' },
      { x: 150, y: 470, width: 30, height: 110, type: 'fence' },

      // 6. Thinking Wall (Muro de pensar de ladrillo, x: 520..740, y: 485..520)
      { x: 520, y: 485, width: 220, height: 35, type: 'wall' },

      // 7. Lucy's Psychiatry Booth (x: 790..870, y: 500..560)
      { x: 790, y: 500, width: 80, height: 60, type: 'furniture' },

      // 8. Schroeder's Gazebo & Piano (x: 960..1060, y: 500..580)
      { x: 975, y: 515, width: 65, height: 50, type: 'furniture' },

      // 9. Peppermint Patty's House (x: 1160..1380, y: 440..600)
      { x: 1160, y: 440, width: 220, height: 150, type: 'wall' },

      // 10. Marcie's House (x: 1460..1680, y: 440..600)
      { x: 1460, y: 440, width: 220, height: 150, type: 'wall' },

      // 11. Kite-Eating Tree (x: 320..420, y: 690..790) - SOLID TRUNK
      { x: 345, y: 730, width: 50, height: 55, type: 'tree' },

      // 12. Pumpkin Patch Fences (x: 160..420, y: 880..1120)
      { x: 160, y: 880, width: 110, height: 16, type: 'fence' },
      { x: 310, y: 880, width: 110, height: 16, type: 'fence' }, // Opening gap between 270 and 310
      { x: 160, y: 880, width: 16, height: 240, type: 'fence' },
      { x: 404, y: 880, width: 16, height: 240, type: 'fence' },
      { x: 160, y: 1104, width: 260, height: 16, type: 'fence' },

      // 13. Baseball Field Bleachers & Backstop (x: 520..960, y: 800..1160)
      { x: 530, y: 800, width: 140, height: 40, type: 'furniture' }, // Bleachers
      { x: 800, y: 800, width: 140, height: 40, type: 'furniture' }, // Dugout bench
      { x: 670, y: 760, width: 80, height: 20, type: 'fence' }, // Backstop netting

      // 14. Daisy Hill Meadow & Pond (x: 1080..1300, y: 880..1080) - Solid Water
      { x: 1100, y: 900, width: 180, height: 150, type: 'water' },

      // 15. Daisy Hill Puppy Barn / Shed (x: 1380..1660, y: 860..1040)
      { x: 1380, y: 860, width: 260, height: 170, type: 'wall' },
      { x: 1340, y: 920, width: 40, height: 100, type: 'fence' },

      // 16. Natural Decorative Trees
      { x: 90, y: 120, width: 50, height: 60, type: 'tree' },
      { x: 450, y: 110, width: 50, height: 60, type: 'tree' },
      { x: 1010, y: 180, width: 50, height: 60, type: 'tree' },
      { x: 1540, y: 140, width: 50, height: 60, type: 'tree' },
      { x: 80, y: 640, width: 50, height: 60, type: 'tree' },
      { x: 1710, y: 680, width: 50, height: 60, type: 'tree' },
      { x: 1020, y: 980, width: 50, height: 60, type: 'tree' },
      { x: 1700, y: 980, width: 50, height: 60, type: 'tree' },
    ],
    interactables: [
      // 1. Door into Ari's House
      {
        id: 'door_ari_house',
        name: 'Casa de Ari',
        type: 'door',
        x: 288,
        y: 290,
        width: 32,
        height: 20,
        targetMapId: 'interior_ari',
        targetSpawnPos: { x: 340, y: 460 },
        description: 'Tu cálido hogar: salón, dormitorio, cocina, baño y rincón de escritura.',
        promptB: 'Entrar a casa',
      },
      // 2. Door into Charlie Brown & Sally's House
      {
        id: 'door_charlie_house',
        name: 'Casa de Charlie Brown y Sally',
        type: 'door',
        x: 644,
        y: 290,
        width: 32,
        height: 20,
        targetMapId: 'interior_charlie',
        targetSpawnPos: { x: 360, y: 460 },
        description: 'El salón familiar, cocina con el plato de Snoopy y los dormitorios.',
        promptB: 'Entrar a casa de Charlie',
      },
      // 3. Snoopy's Doghouse entrance (Huge underground interior!)
      {
        id: 'doghouse_snoopy_door',
        name: 'Caseta de Snoopy',
        type: 'doghouse_entry',
        x: 895,
        y: 265,
        width: 30,
        height: 25,
        targetMapId: 'interior_snoopy',
        targetSpawnPos: { x: 370, y: 480 },
        description: '¡Por fuera es pequeña, pero por dentro es una mansión subterránea legendaria!',
        promptB: 'Entrar a la caseta secreta',
      },
      // 4. Elementary Schoolhouse Door
      {
        id: 'door_school',
        name: 'Escuela Primaria',
        type: 'door',
        x: 1244,
        y: 305,
        width: 36,
        height: 20,
        targetMapId: 'interior_school',
        targetSpawnPos: { x: 360, y: 460 },
        description: 'Aula escolar, pupitres de madera, pizarra verde y taquillas.',
        promptB: 'Entrar a clase',
      },
      // 5. Door into Lucy & Linus's House
      {
        id: 'door_lucy_linus_house',
        name: 'Casa de Lucy y Linus',
        type: 'door',
        x: 288,
        y: 575,
        width: 32,
        height: 20,
        targetMapId: 'interior_lucy_linus',
        targetSpawnPos: { x: 360, y: 460 },
        description: 'Hogar de los hermanos van Pelt: salón con piano, dormitorio de Linus y de Lucy.',
        promptB: 'Entrar a casa de Lucy y Linus',
      },
      // 6. Thinking Wall (Muro de Pensar)
      {
        id: 'the_thinking_wall',
        name: 'Muro de Pensar',
        type: 'thinking_wall',
        x: 520,
        y: 475,
        width: 220,
        height: 45,
        description: 'El icónico muro de ladrillos de Charles Schulz. Siéntate a contemplar el cielo, escribir o invitar a un amigo a charlar.',
        promptB: 'Subir al muro a pensar',
      },
      // 7. Lucy's Psychiatry Booth
      {
        id: 'psychiatry_booth_spot',
        name: 'Puesto de Consulta (5¢)',
        type: 'psychiatry_booth',
        x: 790,
        y: 530,
        width: 80,
        height: 35,
        description: "Puesto de ayuda de Lucy: 'The Doctor is IN'. Tarifa: 5 centavos.",
        promptB: 'Consultar a Lucy (5¢)',
      },
      // 8. Schroeder's Toy Piano
      {
        id: 'schroeder_piano_spot',
        name: 'Piano de Juguete de Schroeder',
        type: 'piano',
        x: 975,
        y: 530,
        width: 65,
        height: 35,
        description: 'El mítico piano rojo de Schroeder consagrado a Ludwig van Beethoven.',
        promptB: 'Tocar melodía clásica',
      },
      // 9. Door into Peppermint Patty's House
      {
        id: 'door_patty_house',
        name: 'Casa de Peppermint Patty',
        type: 'door',
        x: 1254,
        y: 575,
        width: 32,
        height: 20,
        targetMapId: 'interior_peppermint_patty',
        targetSpawnPos: { x: 320, y: 420 },
        description: 'Vivienda informal y deportiva con trofeos de béisbol y guantes.',
        promptB: 'Entrar a casa de Patty',
      },
      // 10. Door into Marcie's House
      {
        id: 'door_marcie_house',
        name: 'Casa de Marcie',
        type: 'door',
        x: 1554,
        y: 575,
        width: 32,
        height: 20,
        targetMapId: 'interior_marcie',
        targetSpawnPos: { x: 320, y: 420 },
        description: 'Hogar tranquilo, ordenado y repleto de libros y té caliente.',
        promptB: 'Entrar a casa de Marcie',
      },
      // 11. Kite-Eating Tree
      {
        id: 'kite_tree_spot',
        name: 'Árbol Devorador de Cometas',
        type: 'kite_tree',
        x: 330,
        y: 740,
        width: 80,
        height: 40,
        description: 'Un roble enorme que jamás devuelve una cometa. Varias ondean atrapadas.',
        promptB: 'Examinar cometas atrapadas',
      },
      // 12. Pumpkin Patch Spot & Vigil Bench
      {
        id: 'pumpkin_patch_spot',
        name: 'Huerto de la Gran Calabaza',
        type: 'pumpkin_patch',
        x: 260,
        y: 950,
        width: 80,
        height: 50,
        description: 'El huerto de calabazas más sincero del mundo entero. Linus aguarda aquí.',
        promptB: 'Esperar sinceramente',
      },
      {
        id: 'pumpkin_patch_bench',
        name: 'Banco del Huerto',
        type: 'chair',
        x: 340,
        y: 910,
        width: 48,
        height: 24,
        facingDirection: 'down',
        description: 'Banco de madera rústica frente a las calabazas doradas.',
        promptB: 'Sentarse a vigilar',
      },
      // 13. Baseball Mound & Dugouts
      {
        id: 'baseball_mound_spot',
        name: 'Montículo de Béisbol',
        type: 'baseball_mound',
        x: 690,
        y: 910,
        width: 40,
        height: 40,
        description: 'El montículo de lanzar de Charlie Brown. ¡Nunca pierde la fe!',
        promptB: 'Practicar lanzamiento',
      },
      {
        id: 'baseball_dugout_bench',
        name: 'Banquillo del Equipo',
        type: 'chair',
        x: 550,
        y: 810,
        width: 80,
        height: 24,
        facingDirection: 'down',
        description: 'Banquillo de madera donde el equipo charla entre entradas.',
        promptB: 'Sentarse en el banquillo',
      },
      // 14. Daisy Hill Pond Dock & Bench
      {
        id: 'daisy_hill_dock',
        name: 'Muelle del Estanque',
        type: 'dock',
        x: 1190,
        y: 890,
        width: 50,
        height: 30,
        facingDirection: 'down',
        description: 'Un muelle de madera sobre el agua tranquila con nenúfares en flor.',
        promptB: 'Sentarse en el muelle',
      },
      // 15. Daisy Hill Barn Entrance
      {
        id: 'door_daisy_barn',
        name: 'Granero de Daisy Hill',
        type: 'door',
        x: 1494,
        y: 1010,
        width: 36,
        height: 24,
        targetMapId: 'interior_daisy_hill_barn',
        targetSpawnPos: { x: 310, y: 400 },
        description: 'Antiguo granero de Daisy Hill Puppy Farm, el lugar donde nació Snoopy.',
        promptB: 'Entrar al granero',
      },
    ],
  },

  // =========================================================================
  // 2. INTERIOR: Casa de Ari (680 x 520)
  // Walkable floor plan: Living Room, Bedroom, Kitchen, Bathroom, Writing Nook
  // =========================================================================
  interior_ari: {
    id: 'interior_ari',
    name: 'Casa de Ari',
    isInterior: true,
    width: 680,
    height: 520,
    tileSize: 32,
    ambientSound: 'interior',
    spawnPoint: { x: 340, y: 460 },
    obstacles: [
      // Outer perimeter walls
      { x: 30, y: 30, width: 620, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 610, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 30, y: 470, width: 270, height: 40, type: 'wall' },
      { x: 380, y: 470, width: 270, height: 40, type: 'wall' },

      // Interior dividing partition walls
      { x: 310, y: 70, width: 14, height: 180, type: 'wall' }, // Separates left (bedroom/bath) and right (living/kitchen)
      { x: 30, y: 250, width: 180, height: 14, type: 'wall' }, // Separates bedroom and bathroom

      // Bedroom furniture (Top Left)
      { x: 80, y: 80, width: 90, height: 100, type: 'furniture' }, // Bed
      { x: 190, y: 80, width: 45, height: 45, type: 'furniture' }, // Nightstand
      { x: 245, y: 80, width: 55, height: 75, type: 'furniture' }, // Wardrobe

      // Bathroom fixtures (Mid Left)
      { x: 80, y: 280, width: 60, height: 80, type: 'furniture' }, // Clawfoot tub
      { x: 170, y: 280, width: 50, height: 45, type: 'furniture' }, // Vanity sink & mirror

      // Writing Nook & Library (Bottom Left)
      { x: 80, y: 400, width: 100, height: 50, type: 'furniture' }, // Oak writing desk
      { x: 210, y: 390, width: 75, height: 60, type: 'furniture' }, // Bookshelf

      // Kitchen & Dining (Top Right)
      { x: 360, y: 80, width: 130, height: 50, type: 'furniture' }, // Kitchen counter & stove
      { x: 520, y: 80, width: 80, height: 50, type: 'furniture' }, // Refrigerator & pantry
      { x: 420, y: 170, width: 80, height: 55, type: 'furniture' }, // Dining table

      // Living Room (Bottom Right)
      { x: 440, y: 300, width: 120, height: 55, type: 'furniture' }, // Plush living sofa
      { x: 460, y: 375, width: 80, height: 35, type: 'furniture' }, // Coffee table
    ],
    interactables: [
      // Exit Door
      {
        id: 'door_ari_exit',
        name: 'Puerta Principal',
        type: 'door',
        x: 320,
        y: 485,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 304, y: 340 },
        description: 'Salir al porche y al vecindario.',
        promptB: 'Salir al vecindario',
      },
      // Bed (Sleep & Advance Time)
      {
        id: 'ari_bed',
        name: 'Cama con Colcha Acolchada',
        type: 'bed',
        x: 80,
        y: 80,
        width: 90,
        height: 100,
        facingDirection: 'down',
        description: 'Tu cama abrigada y suave. Descansar hace avanzar las horas del día.',
        promptB: 'Descansar (Avanzar tiempo)',
      },
      // Writing Desk (Opens Infinite Notebook)
      {
        id: 'ari_desk',
        name: 'Escritorio de Roble',
        type: 'desk',
        x: 95,
        y: 410,
        width: 70,
        height: 35,
        facingDirection: 'up',
        sitOffsetX: 35,
        sitOffsetY: 35,
        description: 'Tu escritorio favorito con flexo de luz cálida, pluma y el cuaderno de pensamientos.',
        promptB: 'Sentarse a escribir',
      },
      // Bookshelf
      {
        id: 'ari_bookshelf',
        name: 'Estantería de Historias',
        type: 'bookshelf',
        x: 210,
        y: 400,
        width: 75,
        height: 45,
        description: 'Lleno de poesías, novelas de misterio y apuntes sobre el vecindario.',
        promptB: 'Hojear libros',
      },
      // Living Room Sofa
      {
        id: 'ari_sofa',
        name: 'Sofá Cómodo del Salón',
        type: 'chair',
        x: 455,
        y: 305,
        width: 90,
        height: 45,
        facingDirection: 'down',
        sitOffsetX: 45,
        sitOffsetY: 15,
        description: 'Un sofá amplio y mullido para relajarse.',
        promptB: 'Sentarse en el sofá',
      },
      // Dining Table Chair
      {
        id: 'ari_dining_chair',
        name: 'Mesa de Comedor',
        type: 'chair',
        x: 435,
        y: 180,
        width: 50,
        height: 40,
        facingDirection: 'down',
        sitOffsetX: 25,
        sitOffsetY: 12,
        description: 'Mesa de madera donde desayunar y merendar con calma.',
        promptB: 'Sentarse a la mesa',
      },
      // Tea Kettle on Kitchen Counter
      {
        id: 'ari_tea_kettle',
        name: 'Tetera de Manzanilla',
        type: 'tea_kettle',
        x: 390,
        y: 90,
        width: 40,
        height: 30,
        description: 'Una tetera de porcelana que desprende aroma a manzanilla y miel.',
        promptB: 'Preparar té caliente',
      },
      // Vanity Mirror in Bathroom
      {
        id: 'ari_bathroom_mirror',
        name: 'Espejo del Baño',
        type: 'vanity_mirror',
        x: 175,
        y: 290,
        width: 40,
        height: 30,
        description: 'Un espejo con marco biselado. Ari se mira con una sonrisa serena.',
        promptB: 'Mirarse al espejo',
      },
      // Decor customization
      {
        id: 'ari_living_rug',
        name: 'Alfombra Bohemia',
        type: 'decor',
        x: 460,
        y: 380,
        width: 80,
        height: 30,
        description: 'Una alfombra decorativa con patrones cálidos. Puedes reordenar detalles de la casa.',
        promptB: 'Ajustar decoración',
      },
    ],
  },

  // =========================================================================
  // 3. INTERIOR: Casa de Charlie Brown y Sally (720 x 520)
  // Walkable floor plan: Living Room, Kitchen, Charlie's Room, Sally's Room, Yard Door
  // =========================================================================
  interior_charlie: {
    id: 'interior_charlie',
    name: 'Casa de Charlie Brown y Sally',
    isInterior: true,
    width: 720,
    height: 520,
    tileSize: 32,
    ambientSound: 'interior',
    spawnPoint: { x: 360, y: 460 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 660, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 650, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 30, y: 470, width: 290, height: 40, type: 'wall' },
      { x: 400, y: 470, width: 290, height: 40, type: 'wall' },

      // Partition walls
      { x: 350, y: 70, width: 14, height: 180, type: 'wall' }, // Separates Charlie's bedroom & Sally's bedroom
      { x: 30, y: 250, width: 620, height: 14, type: 'wall' }, // Separates bedrooms (top) and living/kitchen (bottom)

      // Charlie Brown's Bedroom (Top Left: x: 70..340, y: 70..240)
      { x: 80, y: 80, width: 85, height: 95, type: 'furniture' }, // Charlie's bed with yellow zig-zag
      { x: 190, y: 80, width: 60, height: 45, type: 'furniture' }, // Baseball display desk
      { x: 275, y: 80, width: 50, height: 50, type: 'furniture' }, // Cap & glove rack

      // Sally's Bedroom (Top Right: x: 370..640, y: 70..240)
      { x: 535, y: 80, width: 85, height: 95, type: 'furniture' }, // Sally's bed with pink bow
      { x: 390, y: 80, width: 60, height: 45, type: 'furniture' }, // Desk with school books & love notes
      { x: 470, y: 80, width: 45, height: 50, type: 'furniture' }, // Vanity table

      // Family Living Room (Bottom Left: x: 70..350, y: 270..460)
      { x: 120, y: 310, width: 120, height: 55, type: 'furniture' }, // Iconic yellow sofa
      { x: 140, y: 400, width: 75, height: 40, type: 'furniture' }, // Television console
      { x: 270, y: 310, width: 45, height: 45, type: 'furniture' }, // Rotary phone stand

      // Family Kitchen (Bottom Right: x: 370..640, y: 270..460)
      { x: 420, y: 280, width: 130, height: 45, type: 'furniture' }, // Kitchen counter
      { x: 575, y: 280, width: 60, height: 55, type: 'furniture' }, // Refrigerator
      { x: 450, y: 370, width: 85, height: 55, type: 'furniture' }, // Kitchen table
      { x: 590, y: 410, width: 40, height: 40, type: 'furniture' }, // Snoopy's food bowl spot
    ],
    interactables: [
      // Exit Door to front yard
      {
        id: 'door_charlie_exit',
        name: 'Puerta Principal',
        type: 'door',
        x: 340,
        y: 485,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 644, y: 330 },
        description: 'Salir al porche de Charlie Brown.',
        promptB: 'Salir al vecindario',
      },
      // Classic Family Sofa
      {
        id: 'charlie_sofa',
        name: 'Sofá Amarillo del Salón',
        type: 'chair',
        x: 135,
        y: 315,
        width: 90,
        height: 45,
        facingDirection: 'down',
        sitOffsetX: 45,
        sitOffsetY: 15,
        description: 'El clásico sofá donde Charlie Brown reflexiona sobre el día.',
        promptB: 'Sentarse en el sofá',
      },
      // Charlie Brown's Bed
      {
        id: 'charlie_bed',
        name: 'Cama de Charlie Brown',
        type: 'bed',
        x: 80,
        y: 80,
        width: 85,
        height: 95,
        facingDirection: 'down',
        description: 'Su cama con la colcha amarilla de zig-zag negro. Descansar hace avanzar el tiempo.',
        promptB: 'Descansar en la cama',
      },
      // Sally's Bed
      {
        id: 'sally_bed',
        name: 'Cama de Sally',
        type: 'bed',
        x: 535,
        y: 80,
        width: 85,
        height: 95,
        facingDirection: 'down',
        description: 'La alegre cama de Sally con cojines de lazo rosa.',
        promptB: 'Descansar en la cama',
      },
      // Sally's Desk
      {
        id: 'sally_desk',
        name: 'Escritorio de Sally',
        type: 'desk',
        x: 395,
        y: 90,
        width: 50,
        height: 35,
        facingDirection: 'up',
        description: 'Cuadernos de tareas escolares a medio hacer y cartas dirigidas a Linus ("Mi dulce amorcito").',
        promptB: 'Revisar cartas',
      },
      // Snoopy's Red Bowl
      {
        id: 'charlie_snoopy_bowl',
        name: 'Plato Rojo de Snoopy',
        type: 'desk',
        x: 590,
        y: 415,
        width: 40,
        height: 30,
        description: 'El famoso plato rojo que Snoopy espera que Charlie Brown llene puntualmente.',
        promptB: 'Examinar plato de Snoopy',
      },
      // Rotary Telephone
      {
        id: 'charlie_rotary_phone',
        name: 'Teléfono de Disco',
        type: 'desk',
        x: 270,
        y: 320,
        width: 40,
        height: 30,
        description: 'El teléfono donde suena la voz de Peppermint Patty llamando a "Chuck".',
        promptB: 'Escuchar auricular',
      },
      // Baseball Glove on Charlie's Shelf
      {
        id: 'charlie_baseball_glove',
        name: 'Guante de Béisbol de Charlie Brown',
        type: 'bookshelf',
        x: 195,
        y: 90,
        width: 50,
        height: 35,
        description: 'Un guante de cuero curtido y una pelota con las costuras rojas gastadas.',
        promptB: 'Admirar guante',
      },
    ],
  },

  // =========================================================================
  // 4. INTERIOR: Casa de Lucy y Linus (720 x 520)
  // Living room with piano, kitchen, hallway, Linus's room, Lucy's room
  // =========================================================================
  interior_lucy_linus: {
    id: 'interior_lucy_linus',
    name: 'Casa de Lucy y Linus',
    isInterior: true,
    width: 720,
    height: 520,
    tileSize: 32,
    ambientSound: 'interior',
    spawnPoint: { x: 360, y: 460 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 660, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 650, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 30, y: 470, width: 290, height: 40, type: 'wall' },
      { x: 400, y: 470, width: 290, height: 40, type: 'wall' },

      // Partition walls
      { x: 350, y: 70, width: 14, height: 180, type: 'wall' }, // Separates Linus's & Lucy's rooms
      { x: 30, y: 250, width: 620, height: 14, type: 'wall' }, // Separates bedrooms and living/kitchen

      // Linus's Bedroom (Top Left: x: 70..340, y: 70..240)
      { x: 80, y: 80, width: 85, height: 95, type: 'furniture' }, // Linus's bed with folded blue blanket
      { x: 190, y: 80, width: 80, height: 50, type: 'furniture' }, // Philosophy bookcase
      { x: 285, y: 80, width: 50, height: 50, type: 'furniture' }, // Linus's writing desk

      // Lucy's Bedroom (Top Right: x: 370..640, y: 70..240)
      { x: 535, y: 80, width: 85, height: 95, type: 'furniture' }, // Lucy's bed
      { x: 450, y: 80, width: 65, height: 45, type: 'furniture' }, // Lucy's vanity mirror & speeches
      { x: 385, y: 80, width: 45, height: 50, type: 'furniture' }, // Wardrobe with blue dresses

      // Family Living Room (Bottom Left: x: 70..350, y: 270..460)
      { x: 85, y: 290, width: 75, height: 45, type: 'furniture' }, // Upright piano
      { x: 190, y: 310, width: 110, height: 55, type: 'furniture' }, // Velvet sofa
      { x: 205, y: 395, width: 70, height: 35, type: 'furniture' }, // Coffee table

      // Kitchen & Dining (Bottom Right: x: 370..640, y: 270..460)
      { x: 410, y: 280, width: 130, height: 45, type: 'furniture' }, // Kitchen counter
      { x: 570, y: 280, width: 65, height: 55, type: 'furniture' }, // Refrigerator
      { x: 460, y: 370, width: 85, height: 55, type: 'furniture' }, // Family table
    ],
    interactables: [
      // Exit Door
      {
        id: 'door_lucy_linus_exit',
        name: 'Puerta Principal',
        type: 'door',
        x: 340,
        y: 485,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 288, y: 610 },
        description: 'Salir al jardín de Lucy y Linus.',
        promptB: 'Salir al vecindario',
      },
      // Linus's Bed with his beloved blanket
      {
        id: 'linus_bed_spot',
        name: 'Cama de Linus con Mantita Azul',
        type: 'bed',
        x: 80,
        y: 80,
        width: 85,
        height: 95,
        facingDirection: 'down',
        description: 'Cama de Linus con su querida mantita de seguridad azul doblada sobre la colcha.',
        promptB: 'Descansar con serenidad',
      },
      // Linus's Philosophy Bookshelf
      {
        id: 'linus_bookshelf',
        name: 'Biblioteca Filosófica de Linus',
        type: 'bookshelf',
        x: 195,
        y: 90,
        width: 70,
        height: 35,
        description: 'Tratados sobre la condición humana, San Pablo, teología y la Gran Calabaza.',
        promptB: 'Leer pasaje filosófico',
      },
      // Lucy's Vanity Mirror
      {
        id: 'lucy_vanity_mirror',
        name: 'Tocador de Lucy',
        type: 'vanity_mirror',
        x: 455,
        y: 90,
        width: 55,
        height: 35,
        description: 'El espejo donde Lucy ensaya sus discursos sobre cómo mandar en el vecindario.',
        promptB: 'Mirar el tocador',
      },
      // Lucy's Bed
      {
        id: 'lucy_bed',
        name: 'Cama de Lucy',
        type: 'bed',
        x: 535,
        y: 80,
        width: 85,
        height: 95,
        facingDirection: 'down',
        description: 'La cama de Lucy con su almohada pulcra y sábanas azul marino.',
        promptB: 'Descansar en la cama',
      },
      // Living Room Upright Piano
      {
        id: 'lucy_living_piano',
        name: 'Piano Vertical de la Sala',
        type: 'piano',
        x: 90,
        y: 300,
        width: 65,
        height: 35,
        description: 'Un piano clásico vertical donde practicar escalas musicales.',
        promptB: 'Tocar notas en el piano',
      },
      // Living Room Sofa
      {
        id: 'lucy_living_sofa',
        name: 'Sofá de Terciopelo',
        type: 'chair',
        x: 200,
        y: 315,
        width: 90,
        height: 45,
        facingDirection: 'down',
        sitOffsetX: 45,
        sitOffsetY: 15,
        description: 'Un sofá elegante donde sentarse a charlar tranquilamente.',
        promptB: 'Sentarse en el sofá',
      },
    ],
  },

  // =========================================================================
  // 5. INTERIOR: Casa de Peppermint Patty (640 x 480)
  // Informal, athletic, living room, kitchen, bedroom
  // =========================================================================
  interior_peppermint_patty: {
    id: 'interior_peppermint_patty',
    name: 'Casa de Peppermint Patty',
    isInterior: true,
    width: 640,
    height: 480,
    tileSize: 32,
    ambientSound: 'interior',
    spawnPoint: { x: 320, y: 420 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 580, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 420, type: 'wall' },
      { x: 570, y: 30, width: 40, height: 420, type: 'wall' },
      { x: 30, y: 430, width: 250, height: 40, type: 'wall' },
      { x: 360, y: 430, width: 250, height: 40, type: 'wall' },

      // Partition wall separating bedroom (left) from living & kitchen (right)
      { x: 260, y: 70, width: 14, height: 260, type: 'wall' },

      // Patty's Bedroom (Left: x: 70..250, y: 70..420)
      { x: 80, y: 80, width: 85, height: 95, type: 'furniture' }, // Athletic bed
      { x: 180, y: 80, width: 55, height: 45, type: 'furniture' }, // Baseball cap rack
      { x: 85, y: 220, width: 95, height: 50, type: 'furniture' }, // Study desk with homework
      { x: 85, y: 340, width: 60, height: 45, type: 'furniture' }, // Sports gear box

      // Casual Living Room (Top Right: x: 280..560, y: 70..250)
      { x: 320, y: 90, width: 130, height: 55, type: 'furniture' }, // Comfy slouchy sofa
      { x: 485, y: 80, width: 65, height: 60, type: 'furniture' }, // Championship trophy case
      { x: 340, y: 175, width: 80, height: 35, type: 'furniture' }, // Low coffee table

      // Kitchen & Snack Bar (Bottom Right: x: 280..560, y: 270..420)
      { x: 320, y: 280, width: 120, height: 45, type: 'furniture' }, // Counter with sports bottles
      { x: 480, y: 280, width: 70, height: 55, type: 'furniture' }, // Fridge with team schedule
      { x: 360, y: 355, width: 80, height: 45, type: 'furniture' }, // High kitchen table
    ],
    interactables: [
      // Exit Door
      {
        id: 'door_patty_exit',
        name: 'Puerta Principal',
        type: 'door',
        x: 300,
        y: 445,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 1254, y: 610 },
        description: 'Salir a la calle de Peppermint Patty.',
        promptB: 'Salir al vecindario',
      },
      // Patty's Athletic Bed
      {
        id: 'patty_bed',
        name: 'Cama Deportiva de Patty',
        type: 'bed',
        x: 80,
        y: 80,
        width: 85,
        height: 95,
        facingDirection: 'down',
        description: 'Una cama desordenada pero comodísima donde reponer fuerzas tras el partido.',
        promptB: 'Descansar como una campeona',
      },
      // Patty's Study Desk (Where she falls asleep doing homework)
      {
        id: 'patty_study_desk',
        name: 'Escritorio de Tareas Escolares',
        type: 'desk',
        x: 90,
        y: 230,
        width: 80,
        height: 35,
        facingDirection: 'up',
        description: 'Hojas de exámenes con calificaciones variadas y libros escolares abiertos.',
        promptB: 'Revisar deberes escolares',
      },
      // Trophy Case
      {
        id: 'patty_trophy_case',
        name: 'Vitrina de Trofeos de Béisbol',
        type: 'bookshelf',
        x: 490,
        y: 90,
        width: 55,
        height: 45,
        description: 'Copas de béisbol, pelotas firmadas y fotos del equipo celebrando victorias.',
        promptB: 'Admirar trofeos',
      },
      // Living Room Sofa
      {
        id: 'patty_sofa',
        name: 'Sofá de Descanso de Patty',
        type: 'chair',
        x: 335,
        y: 95,
        width: 100,
        height: 45,
        facingDirection: 'down',
        sitOffsetX: 50,
        sitOffsetY: 15,
        description: 'Un sofá amplio perfecto para tumbarse a ver partidos.',
        promptB: 'Sentarse en el sofá',
      },
    ],
  },

  // =========================================================================
  // 6. INTERIOR: Casa de Marcie (640 x 480)
  // Tidy, quiet, loaded bookshelves, reading desk, bedroom, tea kettle
  // =========================================================================
  interior_marcie: {
    id: 'interior_marcie',
    name: 'Casa de Marcie',
    isInterior: true,
    width: 640,
    height: 480,
    tileSize: 32,
    ambientSound: 'interior',
    spawnPoint: { x: 320, y: 420 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 580, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 420, type: 'wall' },
      { x: 570, y: 30, width: 40, height: 420, type: 'wall' },
      { x: 30, y: 430, width: 250, height: 40, type: 'wall' },
      { x: 360, y: 430, width: 250, height: 40, type: 'wall' },

      // Partition wall separating study & bedroom (left) from living & kitchen (right)
      { x: 280, y: 70, width: 14, height: 260, type: 'wall' },

      // Study & Library (Top Left: x: 70..270, y: 70..250)
      { x: 80, y: 80, width: 180, height: 45, type: 'furniture' }, // Tall library bookshelves
      { x: 100, y: 165, width: 85, height: 45, type: 'furniture' }, // Marcie's reading desk
      { x: 210, y: 165, width: 45, height: 45, type: 'furniture' }, // Reading armchair

      // Marcie's Serene Bedroom (Bottom Left: x: 70..270, y: 270..420)
      { x: 80, y: 310, width: 85, height: 95, type: 'furniture' }, // Impeccably made bed
      { x: 180, y: 310, width: 50, height: 45, type: 'furniture' }, // Nightstand with reading lamp

      // Tidy Living Room (Top Right: x: 300..560, y: 70..250)
      { x: 340, y: 90, width: 110, height: 50, type: 'furniture' }, // Reading couch
      { x: 355, y: 170, width: 75, height: 35, type: 'furniture' }, // Coffee table with books
      { x: 480, y: 80, width: 70, height: 55, type: 'furniture' }, // Corner bookcase

      // Kitchenette (Bottom Right: x: 300..560, y: 270..420)
      { x: 330, y: 280, width: 120, height: 45, type: 'furniture' }, // Kitchenette counter with teapot
      { x: 480, y: 280, width: 70, height: 50, type: 'furniture' }, // Neat pantry
      { x: 370, y: 355, width: 75, height: 45, type: 'furniture' }, // Round tea table
    ],
    interactables: [
      // Exit Door
      {
        id: 'door_marcie_exit',
        name: 'Puerta Principal',
        type: 'door',
        x: 300,
        y: 445,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 1554, y: 610 },
        description: 'Salir al porche tranquilo de Marcie.',
        promptB: 'Salir al vecindario',
      },
      // Library Bookshelves
      {
        id: 'marcie_library',
        name: 'Biblioteca Clasificada de Marcie',
        type: 'bookshelf',
        x: 100,
        y: 90,
        width: 140,
        height: 35,
        description: 'Estanterías meticulosamente ordenadas por orden alfabético y temático.',
        promptB: 'Consultar enciclopedia',
      },
      // Marcie's Reading Desk
      {
        id: 'marcie_desk',
        name: 'Escritorio de Lectura de Marcie',
        type: 'desk',
        x: 105,
        y: 175,
        width: 70,
        height: 35,
        facingDirection: 'up',
        description: 'Un escritorio ordenado con pluma estilográfica, lupa y un par de gafas redondas de repuesto.',
        promptB: 'Sentarse a estudiar',
      },
      // Marcie's Tea Kettle
      {
        id: 'marcie_tea_kettle',
        name: 'Tetera de Porcelana',
        type: 'tea_kettle',
        x: 350,
        y: 290,
        width: 40,
        height: 30,
        description: 'Una elegante tetera con té de hierbas templado listo para servir.',
        promptB: 'Servir una taza de té',
      },
      // Marcie's Bed
      {
        id: 'marcie_bed',
        name: 'Cama Seria e Impecable',
        type: 'bed',
        x: 80,
        y: 310,
        width: 85,
        height: 95,
        facingDirection: 'down',
        description: 'Cama con sábanas blancas estiradas a la perfección y una novela clásica en el velador.',
        promptB: 'Descansar en silencio',
      },
      // Living Room Couch
      {
        id: 'marcie_couch',
        name: 'Sofá de Lectura',
        type: 'chair',
        x: 350,
        y: 95,
        width: 90,
        height: 45,
        facingDirection: 'down',
        sitOffsetX: 45,
        sitOffsetY: 15,
        description: 'Sofá tapizado en tela suave donde disfrutar de un buen libro.',
        promptB: 'Sentarse a leer',
      },
    ],
  },

  // =========================================================================
  // 7. INTERIOR: Caseta de Snoopy (740 x 540)
  // Legendary vast underground mansion: fireplace, billiards, art gallery, typewriter study
  // =========================================================================
  interior_snoopy: {
    id: 'interior_snoopy',
    name: 'Interior de la Caseta de Snoopy',
    isInterior: true,
    width: 740,
    height: 540,
    tileSize: 32,
    ambientSound: 'music_box',
    spawnPoint: { x: 370, y: 480 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 680, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 480, type: 'wall' },
      { x: 670, y: 30, width: 40, height: 480, type: 'wall' },
      { x: 30, y: 490, width: 300, height: 40, type: 'wall' },
      { x: 410, y: 490, width: 300, height: 40, type: 'wall' },

      // Huge Stone Fireplace (Top Center: x: 280..460, y: 70..140)
      { x: 280, y: 70, width: 180, height: 70, type: 'furniture' },

      // Championship Billiard Table (Top Left: x: 80..230, y: 160..260)
      { x: 80, y: 160, width: 150, height: 95, type: 'furniture' },

      // Vinyl Record Player Console (Bottom Left: x: 80..170, y: 350..410)
      { x: 80, y: 350, width: 90, height: 55, type: 'furniture' },

      // Art Gallery Wall (Top Right: x: 500..650, y: 70..130)
      { x: 500, y: 70, width: 150, height: 50, type: 'furniture' },

      // Snoopy's Typewriter Desk (Mid Right: x: 500..630, y: 220..290)
      { x: 500, y: 220, width: 130, height: 65, type: 'furniture' },

      // Leather Armchairs around Fireplace
      { x: 220, y: 270, width: 60, height: 60, type: 'furniture' },
      { x: 460, y: 270, width: 60, height: 60, type: 'furniture' },
    ],
    interactables: [
      // Exit Stairs to Doghouse Roof/Yard
      {
        id: 'door_snoopy_exit',
        name: 'Escalera al Jardín',
        type: 'door',
        x: 350,
        y: 505,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 895, y: 310 },
        description: 'Subir por la trampilla al tejado rojo de la caseta de Snoopy.',
        promptB: 'Subir al exterior',
      },
      // Snoopy's Red Typewriter
      {
        id: 'snoopy_typewriter',
        name: 'Máquina de Escribir Roja de Snoopy',
        type: 'desk',
        x: 520,
        y: 235,
        width: 80,
        height: 45,
        facingDirection: 'up',
        sitOffsetX: 40,
        sitOffsetY: 40,
        description: "Hoja insertada en el rodillo: '¡Era una noche oscura y tormentosa! De repente se oyó un disparo...'",
        promptB: 'Escribir con Snoopy',
      },
      // Cozy Fireplace
      {
        id: 'snoopy_fireplace',
        name: 'Chimenea de Piedra Crepitante',
        type: 'chair',
        x: 330,
        y: 150,
        width: 80,
        height: 35,
        facingDirection: 'up',
        sitOffsetX: 40,
        sitOffsetY: 35,
        description: 'Leños de roble ardiendo con calidez sin igual bajo una repisa de caoba.',
        promptB: 'Calentarse junto al fuego',
      },
      // Billiard Table
      {
        id: 'snoopy_billiards',
        name: 'Mesa de Billar de Snoopy',
        type: 'desk',
        x: 95,
        y: 255,
        width: 120,
        height: 25,
        description: 'Tapete verde torneo con bolas pulidas, taco de arce y tiza azul.',
        promptB: 'Alinear bola 8',
      },
      // Vinyl Record Player
      {
        id: 'snoopy_record_player',
        name: 'Tocadiscos de Vinilo',
        type: 'record_player',
        x: 90,
        y: 360,
        width: 70,
        height: 35,
        description: 'Girando un disco de jazz suave de Guaraldi que llena la mansión de tranquilidad.',
        promptB: 'Cambiar vinilo de jazz',
      },
      // Van Gogh Painting
      {
        id: 'snoopy_vangogh_painting',
        name: 'Óleo Original de Van Gogh',
        type: 'bookshelf',
        x: 520,
        y: 80,
        width: 60,
        height: 35,
        description: '¡Sí, es un cuadro auténtico colgado con orgullo en la pared subterránea de la caseta!',
        promptB: 'Admirar obra de arte',
      },
    ],
  },

  // =========================================================================
  // 8. INTERIOR: Escuela Primaria (720 x 520)
  // Lockers, hallways, classroom, student desks, blackboard, teacher desk
  // =========================================================================
  interior_school: {
    id: 'interior_school',
    name: 'Escuela Primaria',
    isInterior: true,
    width: 720,
    height: 520,
    tileSize: 32,
    ambientSound: 'interior',
    spawnPoint: { x: 360, y: 460 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 660, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 650, y: 30, width: 40, height: 460, type: 'wall' },
      { x: 30, y: 470, width: 290, height: 40, type: 'wall' },
      { x: 400, y: 470, width: 290, height: 40, type: 'wall' },

      // Hallway partition with lockers on left (x: 180, y: 70..400)
      { x: 180, y: 70, width: 14, height: 160, type: 'wall' },
      { x: 180, y: 290, width: 14, height: 180, type: 'wall' }, // Door gap between 230 and 290

      // Lockers in hallway
      { x: 80, y: 80, width: 80, height: 140, type: 'furniture' },
      { x: 80, y: 260, width: 80, height: 140, type: 'furniture' },

      // Teacher Desk in classroom (x: 340..480, y: 100..150)
      { x: 340, y: 100, width: 140, height: 50, type: 'furniture' },

      // Student Desks Row 1
      { x: 240, y: 200, width: 75, height: 45, type: 'furniture' },
      { x: 370, y: 200, width: 75, height: 45, type: 'furniture' },
      { x: 500, y: 200, width: 75, height: 45, type: 'furniture' },

      // Student Desks Row 2
      { x: 240, y: 290, width: 75, height: 45, type: 'furniture' },
      { x: 370, y: 290, width: 75, height: 45, type: 'furniture' },
      { x: 500, y: 290, width: 75, height: 45, type: 'furniture' },

      // Classroom Bookcase & Globe
      { x: 580, y: 80, width: 60, height: 90, type: 'furniture' },
    ],
    interactables: [
      // Exit Door
      {
        id: 'door_school_exit',
        name: 'Puerta Principal de la Escuela',
        type: 'door',
        x: 340,
        y: 485,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 1244, y: 340 },
        description: 'Salir al patio escolar.',
        promptB: 'Salir al recreo',
      },
      // Student Desk (Where Ari or Patty can sit)
      {
        id: 'desk_student_front',
        name: 'Pupitre de Madera Antiguo',
        type: 'chair',
        x: 245,
        y: 215,
        width: 65,
        height: 35,
        facingDirection: 'up',
        sitOffsetX: 32,
        sitOffsetY: 12,
        description: 'Pupitre con ranura para lápices donde Peppermint Patty apoya la cabeza a sestear.',
        promptB: 'Sentarse en el pupitre',
      },
      // Classroom Blackboard
      {
        id: 'school_blackboard',
        name: 'Pizarra Verde de Tiza',
        type: 'chalkboard',
        x: 310,
        y: 65,
        width: 200,
        height: 25,
        description: 'Pizarra grande con tizas blancas y operaciones de suma.',
        promptB: 'Leer pizarra',
      },
      // Teacher Desk ("Wah wah wah!")
      {
        id: 'school_teacher_desk',
        name: 'Mesa del Profesor',
        type: 'desk',
        x: 360,
        y: 110,
        width: 100,
        height: 35,
        description: 'Mesa de caoba con una manzana roja reluciente y el legendario megáfono ("¡Wah wah wah!").',
        promptB: 'Examinar mesa del maestro',
      },
      // School Lockers
      {
        id: 'school_lockers',
        name: 'Taquillas Escolares',
        type: 'bookshelf',
        x: 90,
        y: 120,
        width: 60,
        height: 60,
        description: 'Taquillas metálicas azules con pegatinas del equipo de béisbol.',
        promptB: 'Abrir taquilla',
      },
    ],
  },

  // =========================================================================
  // 9. INTERIOR: Granero de Daisy Hill (620 x 460)
  // Hay bales, toolshed, Snoopy puppyhood memorial & birthplace
  // =========================================================================
  interior_daisy_hill_barn: {
    id: 'interior_daisy_hill_barn',
    name: 'Granero de Daisy Hill',
    isInterior: true,
    width: 620,
    height: 460,
    tileSize: 32,
    ambientSound: 'nature',
    spawnPoint: { x: 310, y: 400 },
    obstacles: [
      // Outer walls
      { x: 30, y: 30, width: 560, height: 40, type: 'wall' },
      { x: 30, y: 30, width: 40, height: 400, type: 'wall' },
      { x: 550, y: 30, width: 40, height: 400, type: 'wall' },
      { x: 30, y: 410, width: 240, height: 40, type: 'wall' },
      { x: 350, y: 410, width: 240, height: 40, type: 'wall' },

      // Hay stacks (Top Left: x: 80..200, y: 80..160)
      { x: 80, y: 80, width: 120, height: 80, type: 'furniture' },

      // Farm tool racks (Bottom Left: x: 80..140, y: 260..350)
      { x: 80, y: 260, width: 60, height: 90, type: 'furniture' },

      // Puppyhood Memorial Table (Top Right: x: 420..530, y: 80..140)
      { x: 420, y: 80, width: 110, height: 60, type: 'furniture' },

      // Wooden Mangers & Hay Bales (Mid Right: x: 440..530, y: 220..320)
      { x: 440, y: 220, width: 90, height: 95, type: 'furniture' },
    ],
    interactables: [
      // Exit Barn Door
      {
        id: 'door_daisy_barn_exit',
        name: 'Portón del Granero',
        type: 'door',
        x: 290,
        y: 425,
        width: 40,
        height: 25,
        targetMapId: 'overworld',
        targetSpawnPos: { x: 1494, y: 1040 },
        description: 'Salir a los pastos y al estanque de Daisy Hill.',
        promptB: 'Salir al exterior',
      },
      // Golden Hay Bales
      {
        id: 'daisy_hay_bale',
        name: 'Fardos de Heno Aromático',
        type: 'chair',
        x: 90,
        y: 95,
        width: 100,
        height: 55,
        facingDirection: 'down',
        sitOffsetX: 50,
        sitOffsetY: 20,
        description: 'Heno dorado mullido que huele a campo y verano. Ideal para recostarse.',
        promptB: 'Descansar en el heno',
      },
      // Puppyhood Memorial Album
      {
        id: 'daisy_puppy_album',
        name: 'Álbum de la Cuna de Snoopy',
        type: 'bookshelf',
        x: 430,
        y: 90,
        width: 90,
        height: 40,
        description: 'Álbum conmemorativo: "Aquí nació Snoopy junto a sus hermanos Spike, Belle, Marbles, Olaf, Andy... en Daisy Hill Puppy Farm".',
        promptB: 'Abrir álbum conmemorativo',
      },
      // Puppy Basket with Wool Blankets
      {
        id: 'daisy_puppy_basket',
        name: 'Cesto con Mantas de Lana',
        type: 'chair',
        x: 450,
        y: 235,
        width: 70,
        height: 50,
        facingDirection: 'down',
        description: 'Una cesta rústica forrada con mantitas de lana cálida.',
        promptB: 'Acariciar mantitas',
      },
    ],
  },
};
