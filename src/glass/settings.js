// Glass material settings, shared by the WebGL layer and the tuning panel.
// To make tuned settings permanent, use "Copy JSON" in the panel and paste the
// values over DEFAULTS below.

// No rim ("rail"): the glass is a flat slab. What's left is the face — how much of the
// scene shows through, blurred and tinted — plus a light sheen, and an optional clear,
// magnifying face whose edges bend and split the light (refraction, dispersion).
export const RANGES = {
  transmission: [0, 1, 0.01], screenBlur: [0, 60, 1], tintAmount: [0, 0.8, 0.01],
  reflection: [0, 1.5, 0.01], sheen: [0, 1, 0.01], lightAngle: [-180, 180, 1],
  clarity: [0, 1, 0.01], lens: [0, 1.5, 0.01], edgeWidth: [0, 80, 1], edgeWidthTB: [0, 40, 1], refraction: [0, 2.5, 0.01], dispersion: [0, 2, 0.01],
  shadowOpacity: [0, 1, 0.01], shadowSoftness: [0, 80, 1], shadowDistance: [0, 40, 1],
  inactive: [0.1, 1, 0.01],
  sc_lens: [0, 1.5, 0.01], sc_refraction: [0, 2.5, 0.01], sc_dispersion: [0, 2, 0.01],
};

export const PULSES = ['sweep', 'ball'];

// Default look = the "Crystal" preset (as tuned in the panel): a fully clear, strongly
// magnifying face with strong edge bend and colour split, little sheen.
export const DEFAULTS = Object.freeze({
  preset: 'crystal',
  glass_cards: true, glass_cos: true, // switch the glass off → solid white, as in the Figma design
  glass_lines: false, // lines as 20px glass rods instead of 1px strokes
  glass_timeline: true, // the timeline's bar
  glass_buttons: true, // hero buttons
  glass_showcase: true, // the carousel panels over the photo
  glass_newsletter: true, // the newsletter's email field (home page)
  pulse_style: 'sweep', // data-flow pulse: 'sweep' (white comet) or 'ball' (dot in the tag's colour)
  transmission: 1, screenBlur: 20, tint: '#ffffff', tintAmount: 0,
  reflection: 0.89, sheen: 0.19, lightAngle: -98, followPointer: true,
  clarity: 1, lens: 1.5, refraction: 2.5, dispersion: 2,
  edgeWidth: 40, edgeWidthTB: 10, // px: how wide the bending band round the edge is (at least), at the sides / top and bottom
  shadowOpacity: 0.16, shadowSoftness: 28, shadowDistance: 14,
  inactive: 0.6,
  // Carousel panels (the showcase after the hero): everything else comes from the values
  // above; these three replace magnify / edge bend / dispersion for them. No magnify by
  // default: a lens enlarges about the panel's centre, so the card under a moving panel
  // would slide sideways.
  sc_lens: 0, sc_refraction: 0.5, sc_dispersion: 0.35,
});

// The earlier frosted look; Frost and Smoke are variations on it.
const LIQUID = {
  screenBlur: 24, tintAmount: 0.3, sheen: 0.5, lightAngle: -98, clarity: 0, lens: 0, dispersion: 1.53,
  shadowOpacity: 0.6, shadowSoftness: 36, shadowDistance: 14, inactive: 0.6,
};
export const PRESETS = {
  liquid: { name: 'Liquid', values: LIQUID },
  crystal: { name: 'Crystal', values: {} }, // = DEFAULTS
  frost: { name: 'Frost', values: { ...LIQUID, screenBlur: 40, tint: '#f5ebd4', tintAmount: 0.2, sheen: 0.3 } },
  smoke: { name: 'Smoke', values: { ...LIQUID, tint: '#21303d', tintAmount: 0.5, sheen: 0.4 } },
  clear: { name: 'Clear', values: { // the previous default
    screenBlur: 24, tintAmount: 0.02, sheen: 0.61, lightAngle: 29, lens: 1.25, dispersion: 1.53,
    shadowOpacity: 0.14, shadowSoftness: 41, shadowDistance: 19, inactive: 0.56,
  } },
};

// Panel layout: [group title, [[key, label, kind?, uses?]], uses?]. kind: undefined = slider, 'color', 'bool',
// or a list of options. No per-element glass switches: the glass_* values above stay at their defaults. uses: the feature a control (or a whole group) is for; the panel only shows it on pages that
// have that feature (initGlassPanel's `uses`: the glass groups on the page, plus 'chart' on the story).
// Controls without one are the shared glass material, shown on every page.
export const GROUPS = [
  ['Flow', [['pulse_style', 'Pulse', PULSES]], 'chart'],
  ['Face', [['transmission', 'See-through'], ['screenBlur', 'Blur']]],
  ['Tint', [['tint', 'Colour', 'color'], ['tintAmount', 'Amount']]],
  ['Light', [['reflection', 'Reflection'], ['sheen', 'Sheen'], ['lightAngle', 'Light angle'], ['followPointer', 'Follow pointer', 'bool']]],
  ['Clear face', [['clarity', 'Amount'], ['lens', 'Magnify'], ['edgeWidth', 'Edge width, sides'], ['edgeWidthTB', 'Edge width, top & bottom'], ['refraction', 'Edge bend'], ['dispersion', 'Dispersion']]],
  ['Shadow', [['shadowOpacity', 'Strength'], ['shadowSoftness', 'Softness'], ['shadowDistance', 'Distance']]],
  ['Cards', [['inactive', 'Inactive opacity']], 'cards'],
  ['Carousel', [['sc_lens', 'Magnify'], ['sc_refraction', 'Edge bend'], ['sc_dispersion', 'Dispersion']], 'showcase'],
];

const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

export function normalize(input = {}) {
  const out = { ...DEFAULTS };
  for (const [k, [min, max]] of Object.entries(RANGES)) {
    if (typeof input[k] === 'number' && Number.isFinite(input[k])) out[k] = Math.min(max, Math.max(min, input[k]));
  }
  if (PULSES.includes(input.pulse_style)) out.pulse_style = input.pulse_style;
  for (const k of ['followPointer']) if (typeof input[k] === 'boolean') out[k] = input[k];
  if (isHex(input.tint)) out.tint = input.tint.toLowerCase();
  if (PRESETS[input.preset] || input.preset === 'custom') out.preset = input.preset;
  return out;
}

// The glass look: always the settings above (there's no tuning panel on this site, so nothing is read from the browser)
export const loadSaved = () => normalize();

/** The parts of the look that stay in CSS: outer shadow and inactive-card opacity. (Corner radii come from the design CSS.) */
export function applyCssVars(g, root = document.documentElement) {
  root.style.setProperty('--glass-drop', `0 ${g.shadowDistance}px ${g.shadowSoftness}px -10px rgb(0 0 0 / ${g.shadowOpacity})`);
  // Pressed-in look for hovered buttons: the shadow comes closer and tighter
  root.style.setProperty('--glass-drop-hover', `0 ${g.shadowDistance * 0.35}px ${g.shadowSoftness * 0.6}px -10px rgb(0 0 0 / ${g.shadowOpacity})`);
  root.style.setProperty('--card-inactive', String(g.inactive));
}
