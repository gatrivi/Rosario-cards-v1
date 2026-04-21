/**
 * SACRED SYMBOLS DATA - COMPLETE 20 MYSTERIES
 * 
 * Each symbol is a collection of SVG paths designed to be "drawn"
 * progressively (0.0 -> 1.0) using the SacredDrawing component.
 * 
 * Coordinates: 100x140 viewbox.
 */

export const SACRED_SYMBOLS = {
  // --- CORE PRAYERS ---
  'cross': [
    'M 50,20 L 50,110', // Vertical stem
    'M 30,45 L 70,45'  // Horizontal beam
  ],
  'praying_hands': [
    'M 50,105 q -20,-20 -20,-55 q 0,-30 20,-40', // Left hand
    'M 50,105 q 20,-20 20,-55 q 0,-30 -20,-40',  // Right hand
    'M 40,90 q 10,5 20,0'                        // Detail at base
  ],
  'scroll': [
    'M 30,25 q 20,-5 40,0 L 70,115 q -20,5 -40,0 Z', // Body
    'M 30,25 q -10,0 -10,10 v 5',                    // Top roll
    'M 70,115 q 10,0 10,-10 v -5'                    // Bottom roll
  ],
  'crown': [
    'M 25,75 L 20,50 L 40,65 L 50,40 L 60,65 L 80,50 L 75,75 Z', // Points
    'M 25,80 q 25,5 50,0'                                         // Base
  ],
  'flame': [
    'M 50,115 q -30,-40 -15,-80 q 15,-40 15,0', // Outer left
    'M 50,115 q 30,-40 15,-80 q -15,-40 -15,0', // Outer right
    'M 50,95 v -30'                             // Inner core
  ],

  // --- GOZOSOS (JOYFUL) ---
  'gozoso_1': [ // Annunciation: Lily & Gabriel
    'M 50,100 L 50,60',                 // Stem
    'M 35,45 q 15,-15 30,0',            // Petal top
    'M 50,60 q -20,-10 -20,10 q 0,20 20,0', // Left wing/petal
    'M 50,60 q 20,-10 20,10 q 0,20 -20,0'   // Right wing/petal
  ],
  'gozoso_2': [ // Visitation: Two profiles
    'M 35,40 q -10,10 0,60 q 10,20 15,0', // Profile left
    'M 65,40 q 10,10 0,60 q -10,20 -15,0', // Profile right
    'M 40,75 q 10,5 20,0'                  // Connection
  ],
  'gozoso_3': [ // Nativity: Star & Manger
    'M 50,10 q 0,20 0,0 M 40,20 l 20,0 M 50,10 l 0,20', // Star
    'M 30,80 h 40 v 20 h -40 Z',                        // Manger base
    'M 35,80 q 15,-15 30,0'                             // Hay/Baby
  ],
  'gozoso_4': [ // Presentation: Candle & Temple
    'M 30,110 v -20 q 20,-20 40,0 v 20', // Temple arch
    'M 50,100 v -40',                    // Candle
    'M 50,55 q 5,-10 0,-15 q -5,5 0,15'   // Flame
  ],
  'gozoso_5': [ // Finding in Temple: Open Book
    'M 50,100 V 50',                     // Spine
    'M 50,50 q 20,-10 30,10 v 40 q -10,-10 -30,0', // Page right
    'M 50,50 q -20,-10 -30,10 v 40 q 10,-10 30,0'  // Page left
  ],

  // --- DOLOROSOS (SORROWFUL) ---
  'doloroso_1': [ // Agony: Olive & Chalice
    'M 40,110 h 20 l -5,-40 h -10 Z',    // Chalice base
    'M 35,70 q 15,10 30,0',              // Chalice top
    'M 50,50 q -15,-20 0,-40 q 15,20 0,40' // Olive branch
  ],
  'doloroso_2': [ // Scourging: Pillar
    'M 40,110 V 30 h 20 v 80 Z',         // Pillar
    'M 35,50 q 30,5 30,10 M 35,70 q 30,5 30,10' // Ropes
  ],
  'doloroso_3': [ // Crowning: Thorns
    'M 50,70 m -30,0 a 30,15 0 1,0 60,0 a 30,15 0 1,0 -60,0', // Circlet
    'M 30,60 l -5,-10 M 70,60 l 5,-10 M 50,55 l 0,-10'         // Spikes
  ],
  'doloroso_4': [ // Carrying the Cross
    'M 30,110 L 70,30',                  // Main beam
    'M 20,40 L 60,60'                    // Cross beam
  ],
  'doloroso_5': [ // Crucifixion: Three Nails
    'M 30,50 L 50,90', 'M 70,50 L 50,90', // Hands to feet nail path
    'M 50,90 V 110',                      // Feet nail
    'M 25,48 h 10 M 65,48 h 10 M 47,110 h 6' // Nail heads
  ],

  // --- GLORIOSOS (GLORIOUS) ---
  'glorioso_1': [ // Resurrection: Banner
    'M 50,110 V 30',                     // Staff
    'M 50,35 q 20,0 20,15 q -20,15 -20,0', // Banner
    'M 50,80 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0' // Sun behind
  ],
  'glorioso_2': [ // Ascension: Cloud
    'M 30,90 q 10,-15 20,0 q 10,-15 20,0 q 10,-15 20,0 h -60', // Cloud
    'M 50,70 V 30 L 45,40 M 50,30 L 55,40'                      // Ray upward
  ],
  'glorioso_3': [ // Pentecost: Fire & Dove
    'M 50,110 q -10,-20 0,-40 q 10,20 0,40', // Flame
    'M 50,40 q -20,-10 -30,10 M 50,40 q 20,-10 30,10', // Wings
    'M 50,40 q 0,10 5,0'                               // Head
  ],
  'glorioso_4': [ // Assumption: Elevation
    'M 50,110 q -40,-20 0, -80 M 50,110 q 40,-20 0, -80', // Lift lines
    'M 50,30 q -10,0 -10,15 q 0,15 10,15 q 10,0 10,-15 q 0,-15 -10,-15' // Virgin
  ],
  'glorioso_5': [ // Coronation: 12 Stars
    'M 25,75 L 20,50 L 40,65 L 50,40 L 60,65 L 80,50 L 75,75 Z', // Crown
    'M 50,30 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0'     // Star ring
  ],

  // --- LUMINOSOS (LUMINOUS) ---
  'luminoso_1': [ // Baptism: Shell
    'M 30,40 q 20,-10 40,0 q 10,40 -20,60 q -30,-20 -20,-60', // Shell
    'M 50,100 v 20 M 45,105 v 10 M 55,105 v 10'                // Drops
  ],
  'luminoso_2': [ // Cana: Jar
    'M 40,40 h 20 l 10,60 q 0,20 -20,20 q -20,0 -20,-20 Z', // Jar
    'M 70,100 q 15,-5 20,-20'                                // Wine flow
  ],
  'luminoso_3': [ // Kingdom: Keys
    'M 40,40 h 20 v 60 M 35,100 h 30',   // Key staff
    'M 40,40 q 0,-15 10,-15 q 10,0 10,15', // Head
    'M 60,80 h 10 v 5 M 60,90 h 10 v 5'    // Teeth
  ],
  'luminoso_4': [ // Transfiguration: Ray
    'M 50,70 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0', // Face
    'M 50,30 v -15 M 50,110 v 15 M 20,70 h -15 M 80,70 h 15',  // Rays
    'M 30,40 L 20,30 M 70,40 L 80,30'
  ],
  'luminoso_5': [ // Eucharist: Bread & Chalice
    'M 40,110 h 20 l -5,-40 h -10 Z',    // Chalice
    'M 35,70 q 15,10 30,0', 
    'M 40,30 q 10,-10 20,0 q 10,10 -10,20 q -20,-10 -10,-20' // Bread/Host
  ]
};

// Maps prayer IDs to symbol keys (Base mapping, refined in views)
export const SYMBOL_MAP = {
  'SC': 'cross',
  'P':  'cross',
  'AC': 'praying_hands',
  'C':  'scroll',
  'G':  'crown',
  'F':  'flame',
  'LL': 'crown',
  'S':  'crown'
};
