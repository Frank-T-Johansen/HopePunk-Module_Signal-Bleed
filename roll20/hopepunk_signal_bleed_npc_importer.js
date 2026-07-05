// Hope//Punk Signal Bleed NPC Importer
// Draft Roll20 Mod/API script.

var HopepunkSignalBleedNPCs = HopepunkSignalBleedNPCs || (function () {
  'use strict';

  var NPCS = [
  {
    "name": "Dr. Sera Valez",
    "role": "Clinic director / community organizer",
    "faction": "Mercy Twelve Clinic",
    "attitude": "Warm, direct, exhausted, negotiation-focused",
    "wants": [
      "Keep patients alive",
      "Verify the signal",
      "Expose the corp if possible",
      "Prevent the clinic becoming a battlefield"
    ],
    "offers": [
      "Medical care",
      "Information",
      "Local trust",
      "Neutral ground",
      "Access to the relay"
    ],
    "secrets": [
      "Knows Mara covertly supports local schools and food programs"
    ],
    "gm_notes": "If the PCs interact with her, she pushes negotiation, evacuation, and containment. She is not naive and will not hand civilians to corporate recovery."
  },
  {
    "name": "Mara “Mother Red” Vey",
    "role": "Leader of the Redline Choir",
    "faction": "Redline Choir",
    "attitude": "Charismatic, controlled, dangerous, politically rational",
    "wants": [
      "Neighborhood control over the relay",
      "Proof against the corp",
      "Protection for her people",
      "Respect"
    ],
    "offers": [
      "Safe routes",
      "Lookouts",
      "Crowd cover",
      "Fighters during breach",
      "Stolen corp access codes"
    ],
    "secrets": [
      "Covertly funds school meals, medicine, teacher stipends, and generator fuel"
    ],
    "gm_notes": "Prefers diplomacy if respected. Furious if her hidden good works are exposed to weaken her tough front."
  },
  {
    "name": "Nox “Bluewire” Kade",
    "role": "Unstable gang enforcer / cyber-strain casualty",
    "faction": "Redline Choir",
    "attitude": "Volatile, frightened, overstimulated, in pain",
    "wants": [
      "Respect",
      "Pain relief",
      "Proof he is still useful",
      "To stop feeling afraid",
      "To hurt the corp before they hurt him"
    ],
    "offers": [
      "Combat capability",
      "A clue blurted during distress",
      "A way to show whether PCs use empathy or humiliation"
    ],
    "secrets": [
      "His implants are being aggravated by the signal",
      "Everyone in the gang knows he is unstable"
    ],
    "gm_notes": "Bluewire is not the gang. If he dies, the gang does not automatically attack. PCs should be able to read his distress at very low difficulty."
  },
  {
    "name": "Commander Ilan Rusk",
    "role": "Corporate recovery commander",
    "faction": "Corporate Recovery Team",
    "attitude": "Professional, hostile, rational, containment-minded",
    "wants": [
      "Recover the relay",
      "Suppress evidence",
      "Prevent visible contamination",
      "Avoid corporate blame"
    ],
    "offers": [
      "Safe passage",
      "Money",
      "Medical supplies",
      "Minor warrant erasure",
      "Temporary ceasefire"
    ],
    "secrets": [
      "Knows the relay is not merely stolen data, but does not fully understand the alien risk"
    ],
    "gm_notes": "Can be delayed, bluffed, exposed, blackmailed, or convinced the alien breach is the higher priority."
  },
  {
    "name": "Keet",
    "role": "School volunteer / witness",
    "faction": "Mercy Twelve Clinic",
    "attitude": "Fast-talking, scared, observant",
    "wants": [
      "Keep younger kids safe",
      "Stop adults lying",
      "Protect the clinic"
    ],
    "offers": [
      "Witness details",
      "Hidden route",
      "Clue about Mara school support"
    ],
    "secrets": [
      "Saw the courier arrive and noticed the relay pulse before anyone touched it"
    ],
    "gm_notes": "Good NPC for pulling sympathetic PCs toward the school annex and civilian stakes."
  },
  {
    "name": "Sister Luma",
    "role": "Clinic volunteer / spiritual counselor",
    "faction": "Mercy Twelve Clinic",
    "attitude": "Calm, perceptive, emotionally direct",
    "wants": [
      "Reduce panic",
      "Protect traumatized patients",
      "Have people treat suffering as real"
    ],
    "offers": [
      "Emotional reads",
      "Civilian trust",
      "Help calming a crowd",
      "Spiritual framing of the breach"
    ],
    "secrets": [
      "She has seen similar distress patterns before in patients exposed to forbidden tech"
    ],
    "gm_notes": "Useful for encouraging players to investigate psychology, fear, grief, and pain."
  },
  {
    "name": "Tamsin Quill",
    "role": "Damaged courier",
    "faction": "Independent / Mercy Twelve contact",
    "attitude": "Dying, feverish, determined",
    "wants": [
      "The relay delivered",
      "The truth exposed",
      "No one else treated as cargo"
    ],
    "offers": [
      "Partial passphrase",
      "Route clue",
      "Final warning"
    ],
    "secrets": [
      "Was not supposed to survive the route; may have been guided by the signal"
    ],
    "gm_notes": "Can be alive, unconscious, or recently dead depending on pacing."
  },
  {
    "name": "Mote Swarm",
    "role": "First alien pressure",
    "faction": "Alien Incursion",
    "attitude": "Non-negotiable, reactive, signal-hungry",
    "wants": [
      "Signal",
      "Heat",
      "Motion",
      "Access through the breach"
    ],
    "offers": [],
    "secrets": [
      "The swarm is a symptom, not the main alien intelligence"
    ],
    "gm_notes": "Use to force cooperation, evacuation, and first ascension. Do not make this a social faction in the starter job."
  }
];

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function list(items) { if (!items || !items.length) return '<p>—</p>'; return '<ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function bioFor(npc) { return ['<h3>' + esc(npc.name) + '</h3>','<p><strong>Role:</strong> ' + esc(npc.role) + '</p>','<p><strong>Faction:</strong> ' + esc(npc.faction) + '</p>','<p><strong>Attitude:</strong> ' + esc(npc.attitude) + '</p>','<h4>Wants</h4>',list(npc.wants),'<h4>Offers</h4>',list(npc.offers)].join(''); }
  function gmnotesFor(npc) { return ['<h3>GM Notes</h3>','<h4>Secrets</h4>',list(npc.secrets),'<h4>Use in Play</h4>','<p>' + esc(npc.gm_notes) + '</p>'].join(''); }
  function findCharacterByName(name) { var matches = findObjs({ _type: 'character', name: name }); return matches && matches.length ? matches[0] : null; }
  function createOrUpdate(npc, overwrite) { var existing = findCharacterByName(npc.name); if (existing && !overwrite) return { status: 'exists', name: npc.name }; var c = existing || createObj('character', { name: npc.name }); c.set('name', npc.name); c.set('bio', bioFor(npc)); c.set('gmnotes', gmnotesFor(npc)); c.set('inplayerjournals', ''); c.set('controlledby', ''); return { status: existing ? 'updated' : 'created', name: npc.name }; }
  function showHelp() { sendChat('Signal Bleed', '/w gm <strong>Signal Bleed NPC Importer</strong><br><code>!hopepunk-signal-bleed-npcs --dry-run</code><br><code>!hopepunk-signal-bleed-npcs --import</code><br><code>!hopepunk-signal-bleed-npcs --overwrite</code>'); }
  function handle(msg) {
    if (msg.type !== 'api') return;
    if (msg.content.indexOf('!hopepunk-signal-bleed-npcs') !== 0) return;
    if (msg.content.indexOf('--help') !== -1) { showHelp(); return; }
    var dryRun = msg.content.indexOf('--dry-run') !== -1;
    var doImport = msg.content.indexOf('--import') !== -1;
    var overwrite = msg.content.indexOf('--overwrite') !== -1;
    if (!dryRun && !doImport && !overwrite) { showHelp(); return; }
    if (dryRun) { sendChat('Signal Bleed', '/w gm Dry run: would process ' + NPCS.length + ' NPCs: ' + NPCS.map(function (n) { return esc(n.name); }).join(', ')); return; }
    var results = NPCS.map(function (npc) { return createOrUpdate(npc, overwrite); });
    sendChat('Signal Bleed', '/w gm NPC import complete:<br>' + results.map(function (r) { return esc(r.name) + ' [' + esc(r.status) + ']'; }).join('<br>'));
  }
  on('chat:message', handle);
  return { handle: handle };
}());
