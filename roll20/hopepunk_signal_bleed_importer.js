// Hope//Punk Signal Bleed Importer
// Roll20 Mod/API script.
//
// Commands:
//   !hopepunk-signal-bleed --help
//   !hopepunk-signal-bleed --dry-run
//   !hopepunk-signal-bleed --import
//   !hopepunk-signal-bleed --overwrite
//   !hopepunk-signal-bleed --npcs
//   !hopepunk-signal-bleed --handouts
//
// Notes:
// - Imports draft NPCs as GM-only character entries with Bio and GM Notes.
// - Imports scenario Markdown files as GM-only Roll20 handouts.
// - Does not upload images/maps.
// - Designed for games using the public Hope//Punk character sheet.
// - Keep only one copy of this script active in the Roll20 game.

var HopepunkSignalBleed = HopepunkSignalBleed || (function () {
  'use strict';

  var COMMAND = '!hopepunk-signal-bleed';

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
  },
  {
    "name": "Florence “NightCrash” Vale",
    "role": "Level 5 Samurai / combat medic / evacuation specialist",
    "faction": "Samurai / Emergency medical sponsors",
    "attitude": "Sponsor-bright, exhausted, sincere, frighteningly competent",
    "wants": [
      "Save civilians",
      "Stabilize wounded",
      "Contain alien breaches",
      "Avoid fighting human factions",
      "Welcome newly awakened Samurai if the PCs ascend"
    ],
    "offers": [
      "Emergency evacuation",
      "Trauma care",
      "One tactical opening during an alien breach",
      "Non-lethal restraint against humans",
      "Mentor cameo after the crisis"
    ],
    "secrets": [
      "She is already being redirected to a larger emergency elsewhere",
      "Her cheerful public persona hides severe fatigue",
      "She will not solve the PCs' final decision for them"
    ],
    "gm_notes": "Use NightCrash only as an emergency safety valve or post-victory recognition cameo. She arrives briefly, saves wounded or creates one opening, then rushes to a bigger emergency. She is adverse to fighting humans and focuses on evacuation, medicine, and fighting aliens."
  },
  {
    "name": "The Siren Saint",
    "role": "NightCrash's rapid-response vehicle",
    "faction": "Samurai / Emergency medical sponsors",
    "attitude": "Vehicle asset, not a social NPC",
    "wants": [
      "Arrive fast",
      "Extract critical patients",
      "Keep NightCrash mobile"
    ],
    "offers": [
      "Hyperfast arrival",
      "Detachable powered trauma sled",
      "Micro-ambulance pod",
      "Emergency override hacks",
      "One critical-patient extraction"
    ],
    "secrets": [
      "The hoverbike itself does not carry the patient; the detachable trauma pod does"
    ],
    "gm_notes": "Use as explanation for how NightCrash arrives quickly without pretending a critically injured person fits on a normal hoverbike."
  },
  {
    "name": "Gurney Angels",
    "role": "Two humanoid stretcher drones",
    "faction": "Samurai / Human medical sponsors",
    "attitude": "Soothing, sponsor-approved, slightly creepy",
    "wants": [
      "Evacuate patients",
      "Protect the stretcher",
      "Follow NightCrash's triage commands"
    ],
    "offers": [
      "Carry one critical patient",
      "Carry two small civilians in an emergency",
      "Deploy trauma straps and medfoam",
      "Navigate smoke and crowds",
      "Shield patients from debris"
    ],
    "secrets": [
      "They are sponsored human tech, not alien drones"
    ],
    "gm_notes": "The Gurney Angels are evacuation tools, not combat monsters. They can briefly block or shove through danger while carrying a patient, but their main job is extraction."
  }
];

  var HANDOUTS = [
  {
    "name": "Signal Bleed - GM Overview",
    "source_file": "handouts/00_GM_Overview.md",
    "notes": "<h1>GM Overview: Signal Bleed</h1>\n<h2>Pitch</h2>\n<p>A community clinic has received a damaged mesh relay/data-core from a dying courier. The device allegedly contains evidence of corporate medical crimes in the district. The clinic wants to verify the data before broadcasting it. The local gang wants the neighborhood to have a say before anyone hands it to outsiders. A corporate recovery team wants the device back.</p>\n<p>The PCs are gathered for what sounds like a simple community protection job:</p>\n<blockquote>Keep the peace for one evening. Protect the clinic. Do not let the device leave until it has been verified. Avoid bloodshed if possible.</blockquote>\n<p>Then the signal starts bleeding through.</p>\n<h2>Tone</h2>\n<p>Signal Bleed should start human-scale and grounded: overworked clinic staff, hungry schoolkids, scared patients, territorial gang underlings, professional corporate pressure, and ordinary people trying to survive.</p>\n<p>The alien element should feel like an escalation into Hope//Punk proper. The PCs were already trying to help before the world became impossible.</p>\n<h2>Core design rule</h2>\n<p>No human faction is a mandatory enemy. No human faction is guaranteed to become an ally. Every human faction has at least one diplomatic solution. Every diplomatic solution has a cost. The aliens guarantee the final pressure.</p>\n<h2>Human factions</h2>\n<h3>Mercy Twelve Clinic</h3>\n<p>The clinic protects people through care, triage, shelter, and information.</p>\n<p>Leader: <strong>Dr. Sera Valez</strong></p>\n<p>Default behavior: helpful, exhausted, protective, negotiation-focused.</p>\n<h3>The Redline Choir</h3>\n<p>The local gang protects people through territory, fear, smuggling, favors, and retaliatory violence.</p>\n<p>Leader: <strong>Mara “Mother Red” Vey</strong></p>\n<p>Default behavior: suspicious, territorial, but rational if respected.</p>\n<h3>Corporate Recovery Team</h3>\n<p>The corporate recovery team wants the relay recovered and the evidence suppressed.</p>\n<p>Leader: <strong>Commander Ilan Rusk</strong></p>\n<p>Default behavior: hostile but rational. They prefer containment, leverage, and plausible deniability over open massacre.</p>\n<h2>The non-negotiable threat</h2>\n<p>The signal device contains or carries alien contamination. It is not just evidence. It is a beacon, wound, receiver, egg, or lure.</p>\n<p>The first alien event should happen after players have had time to care about the clinic and understand the factions.</p>"
  },
  {
    "name": "Signal Bleed - Player Start Here",
    "source_file": "handouts/01_Player_Start_Here.md",
    "notes": "<h1>Player Start Here: Signal Bleed</h1>\n<p>You can find the Hope//Punk rules and information at:</p>\n<p>https://ravensdagger.itch.io/hopepunk</p>\n<p>Hope//Punk is copyright RavensDagger. This is just a fan creation.</p>\n<h2>Choosing a pregen</h2>\n<p>Pick a pregen by choosing a Background, then ask the GM to move that character from the <strong>Pregens</strong> folder to the <strong>Characters</strong> folder and assign it to you.</p>\n<p>The character names are written as:</p>\n<pre>Character Name (Background)</pre>\n<p>The part in parentheses is only there to make pregens easier to pick.</p>\n<h2>Customizing before play</h2>\n<p>You may customize the pregen before play:</p>\n<h3>1. Rename the character</h3>\n<p>The name and handle are only suggestions. You may remove the “(Background)” part from the character name after choosing the pregen.</p>\n<p>You may also change the portrait/token if you want.</p>\n<h3>2. Move starting skill points</h3>\n<p>Each pregen has two extra starting skill points already spent. These are shown as skills with 2 points.</p>\n<p>You may move one or both of those extra points:</p>\n<ul>\n<li>remove 1 point from a skill that has 2 points</li>\n<li>add that point to any other skill that currently has 0 or 1 point</li>\n</ul>\n<p>Do not reduce a Background skill below 1 if it was part of the pregen’s starting Background package, unless the GM allows a larger rebuild.</p>\n<h3>3. Move proficiencies</h3>\n<p>Each pregen has two proficiencies.</p>\n<p>You may move either proficiency to any skill that has at least 1 point after your skill changes.</p>\n<p>This means you may first move a skill point into a 0-point skill, making it 1, and then move a proficiency to that newly chosen skill.</p>\n<h3>4. Spend money</h3>\n<p>You may spend remaining money to buy additional gear. See the rulebook for what is available.</p>\n<h3>5. Keep the Background</h3>\n<p>The Background, Background Ability, and starting gear are part of the pregen’s chosen Background package.</p>\n<p>Ask the GM before changing those.</p>\n<h2>Starting situation</h2>\n<p>You are at <strong>Mercy Twelve</strong>, a community clinic in a neglected district.</p>\n<p>You were hired, asked, pressured, or personally drawn into a simple protection job:</p>\n<blockquote>Keep the peace for one evening. Protect the clinic. Do not let a damaged relay/data-core leave until it has been checked. Avoid bloodshed if possible.</blockquote>\n<p>It should have been simple.</p>"
  },
  {
    "name": "Signal Bleed - Player Hooks",
    "source_file": "handouts/02_Player_Hooks.md",
    "notes": "<h1>Player Hooks: Why Are You at Mercy Twelve?</h1>\n<p>Choose one, roll one, or make your own with the GM.</p>\n<h2>General hooks</h2>\n<p>1. <strong>Hired Guard</strong> — You were paid to help protect the clinic during a tense data handoff. 2. <strong>Owed Favor</strong> — The clinic patched you up once and never asked who shot you. Now Dr. Valez is calling in the favor. 3. <strong>Local Connection</strong> — Someone you care about lives nearby, works at the clinic, attends the school, or depends on the clinic’s medicine. 4. <strong>Courier Contact</strong> — You knew the courier who brought in the device, or you were supposed to meet them. 5. <strong>Gang Contact</strong> — Mara’s people asked you to attend as an outside witness, specialist, or neutral party. 6. <strong>Corp Trouble</strong> — The corporation involved has hurt you before. You want proof. 7. <strong>Paid Specialist</strong> — You were brought in for a specific skill: hacking, driving, medicine, security, repairs, negotiation, or investigation. 8. <strong>Wrong Place, Right Time</strong> — You came to the clinic for help, shelter, medicine, repairs, or information, and got pulled into the crisis.</p>\n<h2>Background-specific ideas</h2>\n<p><strong>Bounty Hunter:</strong> You were hired to watch for the missing courier or identify who is tracking the clinic.</p>\n<p><strong>Cat Burglar:</strong> You were asked to quietly check whether someone has already planted a tracker or listening device inside the clinic.</p>\n<p><strong>Corporate Security:</strong> Dr. Valez wants someone who understands corporate recovery protocols.</p>\n<p><strong>Cyber-Junkie:</strong> The damaged relay is screaming across the mesh in ways only you can feel.</p>\n<p><strong>Desert Courier:</strong> You knew the courier route. The person who delivered the device should not have reached the clinic alive.</p>\n<p><strong>Ex-Military:</strong> You were hired to assess the clinic’s defenses and evacuate civilians if violence starts.</p>\n<p><strong>Gambler on the Run:</strong> You owe the clinic, Mara, or the courier. This was supposed to be a quick paid favor.</p>\n<p><strong>Grease Monkey:</strong> The clinic’s generator, ambulance, cargo lift, or relay hardware is failing.</p>\n<p><strong>Gutter Rat Orphan:</strong> You know the back routes, roof gaps, underways, and which kids saw the courier arrive.</p>\n<p><strong>Mesh Hacker:</strong> You were hired to verify, decrypt, or isolate the signal.</p>\n<p><strong>Pilot:</strong> The clinic may need an emergency extraction, rooftop pickup, or drone/vehicle support.</p>\n<p><strong>Piss-Poor Artist:</strong> You are connected to the local school, mural project, protest network, or underground broadcast scene.</p>\n<p><strong>Religious Fanatic:</strong> You believe the clinic, the suffering patients, or the signal has spiritual significance.</p>\n<p><strong>Rogue Surgeon:</strong> Dr. Valez needs medical help with a patient exposed to the device.</p>\n<p><strong>Samurai Otaku:</strong> You came because rumors say the signal contains real Samurai telemetry.</p>\n<p><strong>Scavenger:</strong> You recognize the relay hardware as something salvaged from a forbidden zone.</p>\n<p><strong>Student Dropout:</strong> You know the schoolkids, the community tutors, or the student mesh network that first noticed the signal.</p>\n<p><strong>Test Subject:</strong> The signal causes symptoms that feel horribly familiar.</p>\n<p><strong>Underground Fighter:</strong> You were hired as visible muscle, or a local kid from the clinic follows your fights.</p>\n<p><strong>Washed Up Rocker:</strong> The clinic wants your public voice, old contacts, or ability to calm a crowd.</p>"
  },
  {
    "name": "Signal Bleed - Mercy Twelve Clinic",
    "source_file": "handouts/03_Mercy_Twelve_Clinic.md",
    "notes": "<h1>Mercy Twelve Clinic</h1>\n<h2>Player-facing summary</h2>\n<p>Mercy Twelve is a community clinic, shelter, night-school annex, and last-resort triage station built into an old municipal health building.</p>\n<p>The lobby smells of antiseptic, cheap noodles, rain-wet concrete, and overheated batteries. Every wall has been patched more than once. Half the lights flicker. The other half are covered with children’s drawings, hand-written instructions, missing-person notes, and old protest posters.</p>\n<p>Mercy Twelve is not safe because the law protects it.</p>\n<p>Mercy Twelve is safe because the neighborhood has agreed that some doors should stay open.</p>\n<h2>Key areas</h2>\n<h3>Waiting Room</h3>\n<p>Crowded with patients, volunteers, gang lookouts pretending not to be lookouts, and at least one child trying to do homework on the floor.</p>\n<h3>Triage Hall</h3>\n<p>Staff move fast here. Outsiders standing in the wrong place will be redirected firmly but politely.</p>\n<h3>Treatment Wing</h3>\n<p>Locked after the courier arrived. Contains the contaminated relay/data-core and at least one patient exposed to it.</p>\n<h3>School Annex</h3>\n<p>Used for night classes, food distribution, tutoring, and shelter overflow.</p>\n<h3>Roof Access</h3>\n<p>Possible drone landing, signal access, escape route, or final transmitter location.</p>\n<h3>Generator Room</h3>\n<p>The clinic’s generator and power storage are old, overloaded, and sensitive to signal pulses.</p>\n<h2>Clinic leader</h2>\n<p><strong>Dr. Sera Valez</strong> runs Mercy Twelve.</p>\n<p>She is warm, direct, exhausted, and hard to intimidate. She does not want a fight. She also will not hand frightened people over to the corp just because someone with a badge and a contract says “compliance.”</p>"
  },
  {
    "name": "Signal Bleed - Redline Choir",
    "source_file": "handouts/04_Redline_Choir.md",
    "notes": "<h1>The Redline Choir</h1>\n<h2>Public face</h2>\n<p>The Redline Choir is the local gang. They control corners, roofs, underpass routes, informal markets, and protection rackets. They smuggle medicine, run debt enforcement, move stolen gear, and make examples of people who prey on the block.</p>\n<p>They are not gentle.</p>\n<p>They are also not simple.</p>\n<h2>Private reality</h2>\n<p>The Redline Choir quietly funds school meals, buys medicine, pays teachers, keeps generators running, and makes certain predators disappear before the law notices.</p>\n<p>This is not public knowledge.</p>\n<p>Mara “Mother Red” Vey works hard to preserve the Choir’s tough front. She does not want outsiders saying the gang has gone soft. In her mind, fear is one of the few tools the neighborhood still has.</p>\n<h2>Discovering the secret</h2>\n<p>Players may discover Mara’s hidden support through investigation or good social play:</p>\n<ul>\n<li>a clinic underling accidentally says “Mara paid for that” and then stops talking</li>\n<li>schoolchildren know her as “Auntie Red,” but adults avoid saying it</li>\n<li>a hidden ledger lists food, medicine, teacher stipends, and funeral costs</li>\n<li>a gang courier delivers crates marked as contraband, but they contain insulin, antibiotics, and meal packs</li>\n<li>Dr. Valez knows, but will not reveal it unless the PCs earn trust</li>\n<li>Bluewire bitterly blurts out something like: “She feeds everyone but still looks at me like I’m broken.”</li>\n</ul>\n<h2>Leader: Mara “Mother Red” Vey</h2>\n<p>Mara is charismatic, controlled, and visibly tired of burying kids.</p>\n<p>She does not want a war with the clinic, the corp, or the PCs. She wants leverage and a guarantee that the neighborhood is not cut out of decisions about the relay.</p>\n<p>Her position:</p>\n<blockquote>The clinic saves lives one at a time. We keep the whole block from being eaten. Do not confuse our methods with lack of morals.</blockquote>"
  },
  {
    "name": "Signal Bleed - NPCs GM",
    "source_file": "handouts/05_NPCs_GM.md",
    "notes": "<h1>NPCs: GM Notes</h1>\n<h2>Dr. Sera Valez</h2>\n<p>Clinic director, community organizer, moral center. Charismatic through warmth and presence rather than threat.</p>\n<p><strong>Wants:</strong> keep patients alive, verify the signal, expose the corp if possible, prevent the clinic from becoming a battlefield.</p>\n<p><strong>Offers:</strong> medical care, information, local trust, neutral ground, access to the relay.</p>\n<p><strong>Secret:</strong> knows Mara covertly funds food and school support.</p>\n<h2>Mara “Mother Red” Vey</h2>\n<p>Leader of the Redline Choir. Charismatic, controlled, dangerous, and rational.</p>\n<p><strong>Wants:</strong> neighborhood control over the relay, proof against the corp, protection for her people, respect.</p>\n<p><strong>Offers:</strong> local routes, lookouts, fighters, stolen codes, street legitimacy.</p>\n<p><strong>Secret:</strong> covertly funds school meals, medicine, teacher stipends, and generator fuel.</p>\n<h2>Nox “Bluewire” Kade</h2>\n<p>Unstable Redline Choir enforcer. On opioids, overclocked combat ware, and too much cyber strain.</p>\n<p><strong>Wants:</strong> respect, pain relief, proof he is still useful, to stop feeling afraid, to hurt the corp before the corp hurts them.</p>\n<p><strong>Triggers:</strong> mockery, public disarmament, corp uniforms/drones, people touching his cyberware, signal pulses, withdrawal symptoms, sudden movement.</p>\n<p><strong>Important:</strong> Bluewire is not the gang. If he dies, the gang does not automatically attack.</p>\n<h2>Commander Ilan Rusk</h2>\n<p>Corporate recovery commander. Calm, professional, and legally protected.</p>\n<p><strong>Wants:</strong> recover the relay, suppress evidence, prevent visible contamination, avoid corporate blame.</p>\n<p><strong>Offers:</strong> safe passage, money, medical supplies, minor warrant erasure, temporary ceasefire.</p>\n<h2>Keet</h2>\n<p>School volunteer / witness. Young, quick-talking, frightened, and observant.</p>\n<p><strong>Offers:</strong> witness details, hidden route, clue about Mara’s school support.</p>\n<h2>Sister Luma</h2>\n<p>Clinic volunteer and spiritual counselor. Calm, perceptive, and emotionally direct.</p>\n<p><strong>Offers:</strong> emotional reads, patient trust, help calming civilians, spiritual interpretation of the breach.</p>\n<h2>Tamsin Quill</h2>\n<p>Damaged courier. Alive, barely conscious, or recently dead depending on pacing.</p>\n<p><strong>Offers:</strong> final warning, route clue, partial passphrase, contamination symptoms.</p>\n<h2>Mote Swarm</h2>\n<p>First alien pressure. Not a negotiable NPC.</p>\n<p>Use to force cooperation, evacuation, and first ascension.</p>"
  },
  {
    "name": "Signal Bleed - Bluewire Deescalation",
    "source_file": "handouts/06_Bluewire_Deescalation.md",
    "notes": "<h1>Bluewire: Distress, Cyber Strain, and De-escalation</h1>\n<h2>GM principle</h2>\n<p>Bluewire is obviously unwell.</p>\n<p>The point is not to trick the players. The point is to reward them for paying attention to health, psychology, pain, and fear before violence starts.</p>\n<h2>What the PCs can see</h2>\n<p>Bluewire is shaking, sweating, scanning exits, clenching and unclenching his cybernetic hand, and reacting half a second too late to words but instantly to sudden movement.</p>\n<p>He stands too close to doors. Nobody stands behind him. Other gang members give him space without saying why.</p>\n<p>He is trying to look dangerous because he feels terrified.</p>\n<h2>Suggested difficulties</h2>\n<p>Use the system’s normal check structure. The exact skill depends on the character’s approach.</p>\n<p><strong>Difficulty 8:</strong> Notice he is unstable, frightened, overstimulated, and in pain.</p>\n<p><strong>Difficulty 10:</strong> Identify likely opioid dependence, withdrawal symptoms, cyber-strain overload, and emotional dysregulation.</p>\n<p><strong>Difficulty 12:</strong> Realize the damaged signal/device is aggravating his implants.</p>\n<p><strong>Difficulty 14:</strong> Work out a safe de-escalation plan: reduce stimulation, give him space, speak directly but calmly, offer a face-saving exit, involve someone he trusts, or get medical sedation ready.</p>\n<p><strong>Difficulty 16:</strong> Predict his next trigger before it happens.</p>\n<h2>Helpful approaches</h2>\n<ul>\n<li>use his name</li>\n<li>lower your voice</li>\n<li>give him physical space</li>\n<li>offer a concrete choice</li>\n<li>acknowledge pain without pity</li>\n<li>let him save face</li>\n<li>move bystanders away</li>\n<li>reduce noise/light/stimulation</li>\n<li>ask what he needs right now</li>\n<li>give him a useful task that does not put civilians at risk</li>\n</ul>\n<h2>Impact</h2>\n<p>If a PC sincerely treats Bluewire as a person instead of a threat, reduce the next social/medical check involving him by 2.</p>\n<p>If a PC publicly gives him a face-saving way to stand down, reduce the difficulty by 4.</p>\n<p>If a PC mocks him, corners him, calls him a junkie, or tries to humiliate him, increase the difficulty by 4 and advance escalation.</p>"
  },
  {
    "name": "Signal Bleed - Scene Outline",
    "source_file": "handouts/07_Scene_Outline.md",
    "notes": "<h1>Signal Bleed: Scene Outline</h1>\n<h2>Scene 1: Arrival at Mercy Twelve</h2>\n<p>The PCs arrive at the clinic for a simple protection job.</p>\n<p>Visible tensions:</p>\n<ul>\n<li>patients in the waiting room</li>\n<li>gang underlings near the rear exit</li>\n<li>clinic volunteers trying to keep order</li>\n<li>Bluewire pacing too close to the treatment wing</li>\n<li>the lights flicker every time the relay pulses</li>\n</ul>\n<h2>Scene 2: Keep the Peace</h2>\n<p>A disagreement breaks out over who controls access to the relay.</p>\n<p>Options:</p>\n<ul>\n<li>talk down underlings</li>\n<li>investigate Bluewire’s condition</li>\n<li>discover clinic/gang history</li>\n<li>inspect security</li>\n<li>detect corp surveillance</li>\n<li>examine relay symptoms</li>\n</ul>\n<h2>Scene 3: Faction Negotiation</h2>\n<p>The PCs can interact with Dr. Valez, Mara, gang underlings, clinic staff, school volunteers, and corporate intermediaries.</p>\n<p>Possible discoveries:</p>\n<ul>\n<li>Mara secretly supports the school and food programs</li>\n<li>the relay contains more than evidence</li>\n<li>the courier’s route should have been impossible</li>\n<li>someone has already tagged the clinic for recovery</li>\n<li>Bluewire’s implants are reacting to the signal</li>\n</ul>\n<h2>Scene 4: Corporate Pressure</h2>\n<p>Commander Rusk or his team makes contact through a drone warning, legal threat, extraction demand, offer of payment, staged power outage, or recovery squad outside.</p>\n<h2>Scene 5: Signal Breach</h2>\n<p>The relay pulses. Lights bloom white-blue. Implants ache. Patients seize or speak in static. AR overlays show impossible geometry. Something hears the signal and answers.</p>\n<p>Earlier choices matter.</p>\n<h2>Scene 6: First Ascension</h2>\n<p>The PCs are exposed to the breach and trigger their first Samurai potential.</p>\n<p>Focus on protecting civilians, impossible pressure, personal choice, and hope under threat.</p>\n<h2>Scene 7: Finale</h2>\n<p>Possible finale locations:</p>\n<ul>\n<li>treatment wing</li>\n<li>generator room</li>\n<li>roof transmitter</li>\n<li>street outside clinic</li>\n<li>school annex</li>\n</ul>\n<p>Final choices:</p>\n<ul>\n<li>broadcast evidence now, risking unstable signal effects</li>\n<li>delay and stabilize it, giving the corp time</li>\n<li>destroy the relay to save the clinic</li>\n<li>give/shared custody to clinic, gang, or corp</li>\n<li>turn the signal into bait for the alien threat</li>\n</ul>\n<h2>Optional: NightCrash Intervention</h2>\n<p>If the PCs are being overwhelmed by the alien breach, Florence “NightCrash” Vale may arrive as an emergency safety valve.</p>\n<p>She should not solve the scenario. She creates one opening:</p>\n<ul>\n<li>evacuates endangered civilians</li>\n<li>stabilizes a dying PC or NPC</li>\n<li>blocks one alien push</li>\n<li>identifies the breach point</li>\n<li>gives the PCs one clear tactical instruction</li>\n</ul>\n<p>Then she receives a higher-priority emergency call and must leave.</p>\n<p>If the PCs solve the crisis themselves, use NightCrash after the finale instead. She arrives too late to save the day, realizes the PCs handled it, thanks them, recognizes them as newly awakened Samurai, and welcomes them into the wider Samurai world.</p>"
  },
  {
    "name": "Signal Bleed - NightCrash Samurai Failsafe",
    "source_file": "handouts/08_NightCrash_Samurai_Failsafe.md",
    "notes": "<h1>NightCrash: Samurai Failsafe and Mentor Cameo</h1>\n<h2>GM purpose</h2>\n<p>Florence “NightCrash” Vale is not here to win the scenario for the players.</p>\n<p>She exists for two possible uses:</p>\n<p>1. <strong>Emergency arrival</strong> If the PCs are overwhelmed by the first alien breach, NightCrash arrives, saves wounded civilians or a fallen PC, creates one tactical opening, then leaves for a larger emergency elsewhere.</p>\n<p>2. <strong>Recognition arrival</strong> If the PCs solve the crisis themselves, NightCrash arrives after the danger has passed. She thanks them, identifies them as newly awakened Samurai, offers medical aid, and gives them their first connection to the wider Samurai world.</p>\n<p>NightCrash should never take the final decision away from the PCs.</p>\n<h2>Identity</h2>\n<p><strong>Name:</strong> Florence Vale <strong>Samurai Handle:</strong> NightCrash <strong>Level:</strong> 5 <strong>Active Samurai:</strong> about six months <strong>Role:</strong> combat medic, evacuation specialist, hospital patron <strong>Power budget:</strong> roughly Tier 1 catalogue-equivalent, around 500–1000 SP spent <strong>Public brand:</strong> absurd sponsor-friendly emergency nurse icon <strong>Private self:</strong> exhausted, sincere, frighteningly competent</p>\n<h2>Visual concept</h2>\n<p>NightCrash wears a white, pink, and chrome combat-medic outfit that looks halfway between trauma surgeon, racing leathers, magical-girl emergency responder, and theatrical nurse costume.</p>\n<p>Her outfit is ridiculous enough to attract sponsors and functional enough that people stop laughing when she cuts through an alien swarm to carry three patients out of a burning ward.</p>\n<p>Avoid using real-world protected medical symbols directly. Use fictional sponsor marks instead, such as:</p>\n<ul>\n<li>Mercy Star</li>\n<li>White Siren</li>\n<li>SaintPulse</li>\n<li>Pink Crossline</li>\n</ul>\n<h2>Sponsors</h2>\n<p>NightCrash is backed by hospitals, medtech companies, charity streams, trauma-foam manufacturers, and emergency-response brands.</p>\n<p>Possible sponsor names:</p>\n<ul>\n<li>SaintPulse Emergency Systems</li>\n<li>MercyCart Medical Logistics</li>\n<li>PanaceaLite Trauma Foam</li>\n<li>Aegis Ambulance Union</li>\n<li>HaloPatch Wound Sealant</li>\n<li>KidneyCandy Electrolytes</li>\n</ul>\n<p>Her sponsors are silly and exploitative. NightCrash is not.</p>\n<h2>Vehicle: The Siren Saint</h2>\n<p>A hoverbike alone is not enough to transport a critically injured person.</p>\n<p>Use this instead:</p>\n<p><strong>The Siren Saint</strong> is a hyperfast rapid-response hoverbike with a detachable powered trauma sled / micro-ambulance pod.</p>\n<p>In fast-response mode, it is a sleek armored hoverbike.</p>\n<p>In evacuation mode, it deploys or tows a compact stabilized medical pod large enough for one critical patient. The pod has shock suspension, trauma foam, oxygen support, restraint webbing, and a hard-shell canopy.</p>\n<p>The Siren Saint is built for impossible arrival:</p>\n<ul>\n<li>splitting traffic</li>\n<li>climbing ramps and stairwells</li>\n<li>launching from med-evac rails</li>\n<li>crossing rooftops</li>\n<li>forcing doors with emergency override hacks</li>\n<li>dragging the trauma pod through smoke, debris, and panicked crowds</li>\n</ul>\n<p>It can extract one critical patient or two cramped small civilians if the situation is desperate.</p>\n<h2>Drones: The Gurney Angels</h2>\n<p>NightCrash has two humanoid evacuation drones.</p>\n<p>They are sponsored human technology, not alien tech.</p>\n<p><strong>Public name:</strong> the Gurney Angels <strong>Technical labels:</strong> Mercy Unit 12-A and Mercy Unit 12-B</p>\n<p>The Gurney Angels have nurse-like silhouettes, white/pink trauma plating, soft synthetic voices, and a collapsible smart-stretcher carried between them.</p>\n<p>They are not combat monsters. Their purpose is evacuation.</p>\n<p>They can:</p>\n<ul>\n<li>carry one critical patient or two small civilians</li>\n<li>deploy trauma straps and medfoam</li>\n<li>shield a patient from debris</li>\n<li>navigate smoke and crowds automatically</li>\n<li>follow NightCrash’s triage commands</li>\n<li>block a hallway briefly while evacuating someone</li>\n<li>say cheerful scripted things at inappropriate moments</li>\n</ul>\n<p>Example line:</p>\n<blockquote>Please remain calm. Your panic has been noted and is valid.</blockquote>\n<h2>Human combat policy</h2>\n<p>NightCrash is adverse to fighting human factions.</p>\n<p>Her rule:</p>\n<blockquote>Humans are patients until they prove otherwise. Aliens are the emergency.</blockquote>\n<p>Against humans she uses non-lethal force unless there is no other way to stop immediate murder.</p>\n<h3>Non-lethal tools</h3>\n<p><strong>Bedside Manner</strong> A wrist-mounted non-lethal system that fires restraint foam, sedative microdarts, sonic disorientation pulses, and bright sponsor-colored warning flares.</p>\n<p><strong>Mercy Lance</strong> A collapsible injector-staff / shock-syringe polearm. Against humans it delivers sedatives, muscle-lock pulses, or trauma foam bursts. Against aliens, she switches it to cutting plasma, corrosive sterilant, or other lethal modes.</p>\n<h2>Alien combat policy</h2>\n<p>Against aliens, NightCrash uses maximum sterilizing violence.</p>\n<p>She will not hesitate if the threat is non-human, actively breaching, and endangering civilians.</p>\n<h2>How she treats factions</h2>\n<h3>Mercy Twelve Clinic</h3>\n<p>Warm, respectful, protective.</p>\n<p>Possible line:</p>\n<blockquote>Doctor Valez. I’m sorry I’m late.</blockquote>\n<h3>The Redline Choir</h3>\n<p>She does not approve of their violence, but she recognizes that they are part of the local survival system.</p>\n<p>Possible line:</p>\n<blockquote>Choir people: if you can carry, carry. If you can’t carry, clear the hall. If you start a fight in my triage path, I foam you to the ceiling.</blockquote>\n<h3>Corporate Recovery Team</h3>\n<p>Cold and procedural.</p>\n<p>Possible line:</p>\n<blockquote>Corporate personnel are invited to stop creating casualties.</blockquote>\n<p>If corporate troops are wounded, she still stabilizes them if possible.</p>\n<h3>Bluewire</h3>\n<p>She immediately reads him as overloaded, not evil.</p>\n<p>Possible line:</p>\n<blockquote>Oh, sweetheart. Who let you run that much ware on that much pain?</blockquote>\n<p>She may sedate him, but she will not humiliate him.</p>\n<h2>Emergency arrival</h2>\n<p>Use only if the PCs are about to be overwhelmed in a way that would make the first session collapse rather than become dramatic.</p>\n<p>NightCrash creates one opening:</p>\n<ul>\n<li>evacuate a cluster of civilians</li>\n<li>stabilize a dying NPC</li>\n<li>block one alien push</li>\n<li>extract a fallen PC</li>\n<li>give the PCs tactical advice</li>\n<li>pin the breach for one round while the PCs act</li>\n</ul>\n<p>Then she receives an emergency priority override and must leave.</p>\n<p>Possible larger emergency:</p>\n<ul>\n<li>a maternity shelter three districts over has gone into breach</li>\n<li>a school convoy is trapped in a tunnel</li>\n<li>a hospital tower just lost containment</li>\n<li>a Samurai team failed to answer a distress ping</li>\n<li>a refugee triage hub is being overrun</li>\n</ul>\n<p>She can help here, briefly. She cannot stay.</p>\n<h2>Recognition arrival</h2>\n<p>If the PCs solve the crisis themselves, NightCrash arrives after the danger has passed.</p>\n<p>Read or paraphrase:</p>\n<blockquote>The siren arrives too late to save the day.</blockquote>\n<p>&gt;</p>\n<blockquote>A white-pink rapid-response bike drops onto the broken street outside Mercy Twelve, dragging a compact trauma pod behind it. Two nurse-shaped drones unfold a stretcher that is no longer needed.</blockquote>\n<p>&gt;</p>\n<blockquote>NightCrash steps through the smoke, looks at the living patients, the ruined breach site, and the newly awakened Samurai.</blockquote>\n<p>&gt;</p>\n<blockquote>For once, the sponsor-smile drops.</blockquote>\n<p>&gt;</p>\n<blockquote>“You handled this yourselves?”</blockquote>\n<p>Then she may:</p>\n<ul>\n<li>thank them if Mercy Twelve was saved</li>\n<li>help stabilize survivors</li>\n<li>recognize signs of new Samurai ascension</li>\n<li>explain that their lives are about to change</li>\n<li>warn them that sponsors, corps, aliens, and other Samurai will notice</li>\n<li>suggest Samurai handles if the players want ideas</li>\n</ul>\n<h2>Handle suggestions</h2>\n<p>If the PCs have not picked Samurai names yet, NightCrash can offer suggestions based on what they did.</p>\n<p>Possible line:</p>\n<blockquote>You’re going to need handles. The system will give you numbers if you don’t give it names, and trust me, nobody wants to be Samurai Candidate Local-Event-Seven-B.</blockquote>\n<p>Suggestions:</p>\n<ul>\n<li>held the door: Lockjaw, DoorSaint, Lastline</li>\n<li>saved civilians: Hearth, Lifeline, Carrylight</li>\n<li>hacked the signal: Ghostwire, Signal Saint, Null Choir</li>\n<li>protected Bluewire: Softkill, Mercybreak, Kind Knife</li>\n<li>fought aliens directly: Breachburn, Motegrinder, Brightscar</li>\n<li>negotiated peace: Redthread, Truce, Bridgeburn</li>\n</ul>\n<p>The suggestions are optional and a little silly. Players should be free to reject them.</p>"
  },
  {
    "name": "Signal Bleed - Maps GM Overview",
    "source_file": "handouts/09_Maps_GM_Overview.md",
    "notes": "<h1>Megacomplex Maps: GM Overview</h1>\n<h2>Core idea</h2>\n<p>The Mercy Twelve scenario area is not a standalone hospital building in an open city.</p>\n<p>It is a vertical district inside a vast megacomplex: a city under ceilings, with interior streets, stacked floors, service shafts, clinic rooms, school rooms, shops, maintenance sectors, and emergency landing access.</p>\n<p>Think of it as:</p>\n<pre>roof / landing access\nquarantine and incident floor\nclinic and emergency floor\ncommunity support / shelter floor\nutility and service floor\ndummy floors: shopping, housing, transit, storage, offices</pre>\n<p>The maps do not need to be literally adjacent in the image files. In play, they represent different floors/sectors in the same vertical stack.</p>\n<h2>Movement between maps</h2>\n<p>The maps include two main vertical travel methods:</p>\n<h3>Elevator core</h3>\n<p>The large dark double-door or teal-lit shaft-like structure is the main elevator core.</p>\n<p>Use it for:</p>\n<ul>\n<li>gurneys</li>\n<li>stretchers</li>\n<li>cargo</li>\n<li>civilians</li>\n<li>wheelchair access</li>\n<li>NightCrash’s Gurney Angels</li>\n<li>fast movement between public/medical floors</li>\n</ul>\n<p>If the power is unstable, the elevator can become a scene objective.</p>\n<p>Possible complications:</p>\n<ul>\n<li>elevator locks down during corporate recovery protocol</li>\n<li>Bluewire or a gang underling holds it open</li>\n<li>corp drones override the lift route</li>\n<li>alien signal interference sends it to the wrong floor</li>\n<li>staff need it for patients, but PCs need it for tactical movement</li>\n</ul>\n<h3>Emergency stair / ladderwell</h3>\n<p>The narrow stair-looking structures are emergency vertical access.</p>\n<p>They may look steep or ladder-like on the map. In-world, treat them as compact megacomplex stairwells: steep industrial stairs, ladder-stairs, maintenance stairs, or switchback emergency stairs depending on what fits the scene.</p>\n<p>Use them for:</p>\n<ul>\n<li>risky movement under pressure</li>\n<li>stealth movement</li>\n<li>bypassing a locked elevator</li>\n<li>chasing someone between floors</li>\n<li>moving one or two people at a time</li>\n</ul>\n<p>Do not use them for easy patient evacuation unless the players have special equipment, enough time, or help from drones.</p>\n<p>If a player says, “that looks more like a ladder,” that is fine. It can be a steep maintenance stair/ladderwell. Mechanically, the important point is:</p>\n<ul>\n<li>elevator = safe and accessible but controllable/lockable</li>\n<li>stairs/ladderwell = always available but slower, riskier, and bad for stretchers</li>\n</ul>\n<h2>Dummy floors</h2>\n<p>Between the active maps, assume there are “dummy floors” where no major encounter is planned.</p>\n<p>Examples:</p>\n<ul>\n<li>shopping concourse</li>\n<li>food court</li>\n<li>cheap housing stack</li>\n<li>storage mezzanine</li>\n<li>school annex overflow</li>\n<li>transit platform</li>\n<li>maintenance crawl level</li>\n<li>closed office floor</li>\n<li>indoor garden balcony</li>\n</ul>\n<p>Use dummy floors for short transitions, rumors, shopping, brief NPC interactions, or pressure from crowds.</p>\n<h2>Suggested stack</h2>\n<p>This is the suggested order:</p>\n<pre>Floor D: Quarantine / Incident Floor + Roof Landing Corner\nFloor A: Mercy Twelve Clinic / Emergency Intake\nFloor B: Community Support / Shelter / School Annex\nFloor C: Service / Utility / Maintenance Floor</pre>\n<p>Optional dummy floors:</p>\n<pre>Between D and A: staff offices, diagnostics, closed research suites\nBetween A and B: public pharmacy, cafeteria, small shops\nBetween B and C: storage, laundry, staff dorms, low-rent housing\nBelow C: transit tunnels, waste processing, old sealed sectors</pre>\n<h2>Reveal style</h2>\n<p>These maps are designed for room-by-room reveal.</p>\n<p>Recommended Roll20 approach:</p>\n<ul>\n<li>Use Dynamic Lighting if available.</li>\n<li>Put doors on the Dynamic Lighting layer.</li>\n<li>Keep interior streets visible if they are public/common areas.</li>\n<li>Reveal rooms only when doors are opened or windows/feeds are accessed.</li>\n<li>Let players use cameras, clinic staff, gang guides, or maintenance maps to reveal parts of the map in advance.</li>\n</ul>\n<p>The surrounding indoor streets are useful because they allow:</p>\n<ul>\n<li>civilians to pass by</li>\n<li>gang lookouts to loiter without entering the clinic</li>\n<li>corp surveillance to appear at a distance</li>\n<li>PCs to move between sectors</li>\n<li>public consequences to matter</li>\n<li>NightCrash or emergency services to arrive from elsewhere</li>\n</ul>"
  },
  {
    "name": "Signal Bleed - Map Floor A Clinic and Indoor Street",
    "source_file": "handouts/10_Map_Floor_A_Clinic_and_Indoor_Street.md",
    "notes": "<h1>Map: Floor A — Mercy Twelve Clinic and Indoor Street</h1>\n<h2>Function</h2>\n<p>This is the primary starting map for Signal Bleed.</p>\n<p>It represents Mercy Twelve Clinic’s public and emergency-access level inside the megacomplex. It is surrounded by broad indoor streets and pedestrian lanes, because the clinic is part of a dense vertical city rather than a standalone building.</p>\n<h2>What the map shows</h2>\n<p>Key areas:</p>\n<ul>\n<li>indoor megacomplex streets around the clinic</li>\n<li>public front entrance</li>\n<li>reception / waiting area</li>\n<li>triage station</li>\n<li>emergency ambulance/service bay</li>\n<li>surgery / trauma rooms</li>\n<li>long-term treatment / recovery rooms</li>\n<li>pharmacy and supply rooms</li>\n<li>pediatric or community corner</li>\n<li>staff office or break area</li>\n<li>elevator core</li>\n<li>emergency stair / ladderwell</li>\n</ul>\n<h2>Important circulation logic</h2>\n<p>The clinic has two different patient flows.</p>\n<h3>Public flow</h3>\n<p>Civilians enter from the indoor street through the public front entrance.</p>\n<p>They reach:</p>\n<pre>street → reception/waiting → triage → treatment/recovery</pre>\n<p>Reception controls normal visitor intake, but it should not block medical movement through the building.</p>\n<h3>Emergency flow</h3>\n<p>Ambulance or stretcher cases come through the non-public emergency bay.</p>\n<p>They reach:</p>\n<pre>emergency bay → triage/surgery/trauma → recovery rooms</pre>\n<p>This lets critical patients bypass the public waiting room.</p>\n<h3>Recovery flow</h3>\n<p>From surgery/trauma, patients can be moved through internal corridors into long-term treatment and resting rooms.</p>\n<p>The corridor structure matters. Staff should be able to move a patient from the back emergency intake to an operation/trauma room, and then onward to recovery, without dragging them through reception.</p>\n<h2>Scenario use</h2>\n<p>Good scenes here:</p>\n<ul>\n<li>opening arrival</li>\n<li>gang underlings arguing with clinic staff</li>\n<li>Bluewire pacing near a restricted corridor</li>\n<li>Dr. Valez trying to keep everyone calm</li>\n<li>first signal pulse</li>\n<li>evacuation route planning</li>\n<li>corporate recovery team making demands from the public street</li>\n<li>civilians passing by and reacting to faction tension</li>\n</ul>\n<h2>Faction positioning</h2>\n<h3>Clinic staff</h3>\n<p>Use reception, triage, recovery rooms, and supply rooms.</p>\n<p>Clinic underlings should be cooperative but stressed.</p>\n<h3>Redline Choir</h3>\n<p>Use the public street, side corridors, and maybe the area near the back entrance.</p>\n<p>The gang should feel protective and possessive, but not automatically hostile.</p>\n<h3>Corporate Recovery</h3>\n<p>Keep them outside or at the edge at first:</p>\n<ul>\n<li>across the indoor street</li>\n<li>near a service door</li>\n<li>watching from a kiosk</li>\n<li>using drones/cameras</li>\n<li>threatening to enter through emergency access</li>\n</ul>\n<h2>Elevator and stair notes</h2>\n<p>The elevator is the practical route for patients, stretchers, and NightCrash’s Gurney Angels.</p>\n<p>The stair/ladderwell is emergency access: good for PCs, bad for stretchers.</p>\n<p>If the stairs look too ladder-like on the image, describe them as a steep maintenance stairwell built into the megacomplex core.</p>"
  },
  {
    "name": "Signal Bleed - Map Floor B Community Support",
    "source_file": "handouts/11_Map_Floor_B_Community_Support.md",
    "notes": "<h1>Map: Floor B — Community Support, Shelter, and School Annex</h1>\n<h2>Function</h2>\n<p>This floor shows the civilian support infrastructure tied to Mercy Twelve.</p>\n<p>It is not just “extra rooms.” It explains why people care about the clinic and why the Redline Choir and Dr. Valez both see the place as politically important.</p>\n<h2>What the map shows</h2>\n<p>Key areas:</p>\n<ul>\n<li>indoor streets around the support center</li>\n<li>public entrance</li>\n<li>community commons</li>\n<li>pantry / aid distribution point</li>\n<li>cafeteria or communal kitchen</li>\n<li>classroom / workshop room</li>\n<li>children’s corner or daycare room</li>\n<li>counselor / caseworker offices</li>\n<li>dormitory / shelter sleeping area</li>\n<li>secure back/service corridor</li>\n<li>elevator core</li>\n<li>emergency stair / ladderwell</li>\n</ul>\n<h2>Scenario use</h2>\n<p>Good scenes here:</p>\n<ul>\n<li>players discover Mara secretly funds meals and school support</li>\n<li>children recognize a PC or NightCrash brand</li>\n<li>Keet gives information about the courier</li>\n<li>civilians hide during the breach</li>\n<li>gang members guard a food delivery</li>\n<li>clinic staff ask PCs to help move patients or kids</li>\n<li>social consequences become visible</li>\n</ul>\n<h2>Mara’s hidden support</h2>\n<p>This is the best map for discovering that Mara “Mother Red” Vey is not just running a gang.</p>\n<p>Possible clues:</p>\n<ul>\n<li>food crates that came through Redline Choir channels</li>\n<li>school supplies paid for through anonymous street accounts</li>\n<li>teachers who go quiet when Mara is mentioned</li>\n<li>children who call her “Auntie Red”</li>\n<li>a ledger showing meal packs, medicine, generator fuel, and teacher stipends</li>\n</ul>\n<p>This should not be public knowledge. If the PCs discover it respectfully, Mara becomes easier to negotiate with. If they expose it to mock her or weaken her image, she becomes angry.</p>\n<h2>Civilian stakes</h2>\n<p>Use this floor to make the mission about more than the relay.</p>\n<p>If the PCs fail, these are the people who suffer:</p>\n<ul>\n<li>patients</li>\n<li>schoolkids</li>\n<li>volunteers</li>\n<li>hungry families</li>\n<li>night-shift workers</li>\n<li>people with nowhere else to sleep</li>\n</ul>\n<h2>Elevator and stair notes</h2>\n<p>The elevator can move food carts, stretchers, and evacuation groups.</p>\n<p>The stair/ladderwell can move small groups but should be slower and more dangerous under panic conditions.</p>"
  },
  {
    "name": "Signal Bleed - Map Floor C Service Utility",
    "source_file": "handouts/12_Map_Floor_C_Service_Utility.md",
    "notes": "<h1>Map: Floor C — Service, Utility, and Maintenance Floor</h1>\n<h2>Function</h2>\n<p>This floor is the megacomplex’s practical underside.</p>\n<p>It contains the systems that keep Mercy Twelve and the surrounding district alive: power, air, water, cargo, repair, storage, and maintenance access.</p>\n<p>It is more industrial than the clinic and shelter maps, but still part of the Hope//Punk environment. The people here keep the lights on.</p>\n<h2>What the map shows</h2>\n<p>Key areas:</p>\n<ul>\n<li>logistics/service street</li>\n<li>central loading or distribution zone</li>\n<li>generator or power room</li>\n<li>battery banks</li>\n<li>HVAC / air handling</li>\n<li>water treatment or recycling</li>\n<li>storage rooms</li>\n<li>repair workshop</li>\n<li>monitoring/security office</li>\n<li>elevator core</li>\n<li>emergency stair / ladderwell</li>\n<li>suspicious side room or hidden service space</li>\n</ul>\n<h2>Scenario use</h2>\n<p>Good scenes here:</p>\n<ul>\n<li>power failure caused by signal pulses</li>\n<li>Grease Monkey or Scavenger gets useful spotlight</li>\n<li>corp team tries to cut the clinic’s systems</li>\n<li>gang uses maintenance routes to bypass public areas</li>\n<li>players discover a hidden route between maps</li>\n<li>alien contamination starts in the infrastructure</li>\n<li>Bluewire’s implants react near power or signal conduits</li>\n</ul>\n<h2>Tactical role</h2>\n<p>This floor is good for:</p>\n<ul>\n<li>stealth routes</li>\n<li>chases</li>\n<li>sabotage</li>\n<li>repairs</li>\n<li>ambushes</li>\n<li>alternate access</li>\n<li>restoring power</li>\n<li>isolating the relay</li>\n<li>moving unseen between public areas</li>\n</ul>\n<h2>Social role</h2>\n<p>Do not make this floor empty. Maintenance workers, delivery crews, unofficial vendors, Redline Choir lookouts, and tired clinic staff may all use it.</p>\n<p>It is a good place for non-faction passersby who are just trying to work.</p>\n<h2>Elevator and stair notes</h2>\n<p>The elevator is likely a cargo-capable lift here.</p>\n<p>The stair/ladderwell is probably a steep maintenance access route. It can bypass shutdowns, but moving wounded people through it should require time, equipment, or checks.</p>"
  },
  {
    "name": "Signal Bleed - Map Floor D Quarantine Incident",
    "source_file": "handouts/13_Map_Floor_D_Quarantine_Incident.md",
    "notes": "<h1>Map: Floor D — Quarantine, Incident Floor, and Landing Corner</h1>\n<h2>Function</h2>\n<p>This is the likely alien breach / finale map.</p>\n<p>It combines a medical-research or quarantine annex with indoor megacomplex access and a small landing corner where flying vehicles can arrive.</p>\n<h2>What the map shows</h2>\n<p>Key areas:</p>\n<ul>\n<li>quarantine / containment section</li>\n<li>diagnostics or lab section</li>\n<li>control room</li>\n<li>patient or holding rooms</li>\n<li>wide central hall</li>\n<li>side corridors and bypass routes</li>\n<li>back/service entry</li>\n<li>elevator core</li>\n<li>emergency stair / ladderwell</li>\n<li>small roof or open-air-feeling landing corner</li>\n<li>marked landing spot for a flying vehicle or emergency craft</li>\n</ul>\n<h2>Why there is a landing corner</h2>\n<p>Most of the megacomplex is indoors, but large complexes still need emergency access.</p>\n<p>The landing corner is a small exposed or semi-exposed rooftop/skywell pad: enough for a flying vehicle or rapid-response craft to touch down, not a whole outdoor map.</p>\n<p>Use it for:</p>\n<ul>\n<li>NightCrash’s arrival</li>\n<li>medevac extraction</li>\n<li>corporate drone access</li>\n<li>emergency supply drop</li>\n<li>final escape under pressure</li>\n</ul>\n<h2>NightCrash use</h2>\n<p>If the PCs are overwhelmed, NightCrash can arrive here.</p>\n<p>She should not solve the scenario. She creates one opening:</p>\n<ul>\n<li>evacuates endangered civilians</li>\n<li>stabilizes a dying PC or NPC</li>\n<li>blocks one alien push</li>\n<li>identifies the breach point</li>\n<li>gives the PCs one clear tactical instruction</li>\n</ul>\n<p>Then she gets a larger emergency call and must leave.</p>\n<p>If the PCs solve the crisis themselves, she may arrive after the danger has passed and welcome them as newly awakened Samurai.</p>\n<h2>Alien breach options</h2>\n<p>Possible breach locations:</p>\n<ul>\n<li>containment chamber</li>\n<li>diagnostics room</li>\n<li>central hall</li>\n<li>patient holding room</li>\n<li>elevator shaft</li>\n<li>landing corner</li>\n<li>service corridor</li>\n</ul>\n<p>The best breach point depends on the player choices.</p>\n<p>If they isolated the relay well, the breach starts contained.</p>\n<p>If they delayed too long, the breach starts in the central hall.</p>\n<p>If they used the elevator carelessly, the breach can travel between floors.</p>\n<h2>Human faction behavior</h2>\n<p>NightCrash avoids fighting humans except non-lethally.</p>\n<p>Human factions should still be negotiable or at least redirectable even during the breach.</p>\n<p>Examples:</p>\n<ul>\n<li>corp personnel may help contain the breach if convinced it is worse than the data leak</li>\n<li>Redline Choir may help evacuate civilians if respected earlier</li>\n<li>clinic staff may guide PCs through locked areas if trusted</li>\n<li>frightened civilians may block corridors unless calmed</li>\n</ul>\n<h2>Elevator and stair notes</h2>\n<p>The elevator is useful but dangerous here. It may carry contamination or panic between floors.</p>\n<p>The stair/ladderwell is a fallback route. It may look narrow or steep because this is a megacomplex emergency access shaft, not a comfortable public staircase.</p>"
  }
];

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function list(items) {
    if (!items || !items.length) return '<p>—</p>';
    return '<ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }

  function bioForNpc(npc) {
    return [
      '<h3>' + esc(npc.name) + '</h3>',
      '<p><strong>Role:</strong> ' + esc(npc.role) + '</p>',
      '<p><strong>Faction:</strong> ' + esc(npc.faction) + '</p>',
      '<p><strong>Attitude:</strong> ' + esc(npc.attitude) + '</p>',
      '<h4>Wants</h4>',
      list(npc.wants),
      '<h4>Offers</h4>',
      list(npc.offers)
    ].join('');
  }

  function gmnotesForNpc(npc) {
    return [
      '<h3>GM Notes</h3>',
      '<h4>Secrets</h4>',
      list(npc.secrets),
      '<h4>Use in Play</h4>',
      '<p>' + esc(npc.gm_notes) + '</p>'
    ].join('');
  }

  function findByName(type, name) {
    var matches = findObjs({ _type: type, name: name });
    return matches && matches.length ? matches[0] : null;
  }

  function createOrUpdateNpc(npc, overwrite) {
    var existing = findByName('character', npc.name);
    if (existing && !overwrite) {
      return { status: 'exists', name: npc.name };
    }
    var character = existing || createObj('character', { name: npc.name });
    character.set('name', npc.name);
    character.set('bio', bioForNpc(npc));
    character.set('gmnotes', gmnotesForNpc(npc));
    character.set('inplayerjournals', '');
    character.set('controlledby', '');
    return { status: existing ? 'updated' : 'created', name: npc.name };
  }

  function createOrUpdateHandout(handout, overwrite) {
    var existing = findByName('handout', handout.name);
    if (existing && !overwrite) {
      return { status: 'exists', name: handout.name };
    }
    var obj = existing || createObj('handout', { name: handout.name });
    obj.set('name', handout.name);
    obj.set('notes', handout.notes);
    obj.set('inplayerjournals', '');
    return { status: existing ? 'updated' : 'created', name: handout.name };
  }

  function resultSummary(results) {
    return results.map(function (r) {
      return esc(r.name) + ' [' + esc(r.status) + ']';
    }).join('<br>');
  }

  function showHelp() {
    sendChat('Signal Bleed', '/w gm <strong>Hope//Punk Signal Bleed Importer</strong><br>' +
      '<code>' + COMMAND + ' --dry-run</code><br>' +
      '<code>' + COMMAND + ' --import</code> imports NPCs and handouts that do not already exist<br>' +
      '<code>' + COMMAND + ' --overwrite</code> updates/replaces NPC and handout content<br>' +
      '<code>' + COMMAND + ' --import --npcs</code> imports NPCs only<br>' +
      '<code>' + COMMAND + ' --import --handouts</code> imports handouts only<br><br>' +
      'NPCs and handouts are created GM-only by default. Review handouts before sharing player-facing ones.');
  }

  function handle(msg) {
    if (msg.type !== 'api') return;
    if (msg.content.indexOf(COMMAND) !== 0) return;

    if (msg.content.indexOf('--help') !== -1) {
      showHelp();
      return;
    }

    var dryRun = msg.content.indexOf('--dry-run') !== -1;
    var doImport = msg.content.indexOf('--import') !== -1;
    var overwrite = msg.content.indexOf('--overwrite') !== -1;
    var onlyNpcs = msg.content.indexOf('--npcs') !== -1;
    var onlyHandouts = msg.content.indexOf('--handouts') !== -1;

    if (!dryRun && !doImport && !overwrite) {
      showHelp();
      return;
    }

    var includeNpcs = onlyNpcs || (!onlyNpcs && !onlyHandouts);
    var includeHandouts = onlyHandouts || (!onlyNpcs && !onlyHandouts);

    if (dryRun) {
      var msgParts = [];
      if (includeNpcs) {
        msgParts.push('<strong>NPCs:</strong> ' + NPCS.length + '<br>' +
          NPCS.map(function (n) { return esc(n.name); }).join('<br>'));
      }
      if (includeHandouts) {
        msgParts.push('<strong>Handouts:</strong> ' + HANDOUTS.length + '<br>' +
          HANDOUTS.map(function (h) { return esc(h.name); }).join('<br>'));
      }
      sendChat('Signal Bleed', '/w gm <strong>Dry run</strong><br>' + msgParts.join('<br><br>'));
      return;
    }

    var summaries = [];
    if (includeNpcs) {
      summaries.push('<strong>NPCs</strong><br>' + resultSummary(NPCS.map(function (npc) {
        return createOrUpdateNpc(npc, overwrite);
      })));
    }
    if (includeHandouts) {
      summaries.push('<strong>Handouts</strong><br>' + resultSummary(HANDOUTS.map(function (handout) {
        return createOrUpdateHandout(handout, overwrite);
      })));
    }
    sendChat('Signal Bleed', '/w gm Import complete:<br><br>' + summaries.join('<br><br>'));
  }

  on('chat:message', handle);

  return {
    handle: handle
  };
}());
