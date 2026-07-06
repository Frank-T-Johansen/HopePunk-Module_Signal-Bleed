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
//   !hopepunk-signal-bleed --link-selected-portraits
//   !hopepunk-signal-bleed --link-selected-tokens
//   !hopepunk-signal-bleed --link-selected-assets
//
// Notes:
// - Imports NPCs as GM-only character entries.
// - Imports scenario Markdown files as GM-only Roll20 handouts.
// - Links selected, already-uploaded Roll20 graphics to matching character sheets.
// - Does not upload local images/maps.

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
      "Knows Mara covertly supports local schools and food programs",
      "Sera and Mara “Mother Red” Vey are estranged sisters",
      "Sera knows Mara funds food, medicine, and other community support, but hates the violence around it",
      "Sera does not want the family link used as leverage inside her clinic"
    ],
    "gm_notes": "If the PCs interact with her, she pushes negotiation, evacuation, and containment. She is not naive and will not hand civilians to corporate recovery. Sera is Mara Vey’s estranged sister. She represents legitimacy and medicine, while Mara represents informal power and survival. The relationship should complicate negotiations rather than become a simple secret to expose.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Mara “Mother Red” Vey",
    "role": "Redline Choir leader",
    "faction": "Redline Choir",
    "attitude": "Charismatic, controlled, dangerous, politically rational",
    "wants": [
      "Protect the neighborhood",
      "Get proof of what happened to missing locals",
      "Prevent the corporation from using the clinic as a cleanup site"
    ],
    "offers": [
      "Lookouts",
      "Evacuation routes",
      "Access to unofficial service paths",
      "Switch’s camera help"
    ],
    "secrets": [
      "Mara covertly funds food, medicine, and school support",
      "Mara knows Bex and Lala are missing and suspects this is not normal gang business",
      "Mara was born Mara Valez and is Sera Valez’s estranged sister",
      "Mara shortened/cut the family name to Vey after leaving the respectable world behind",
      "Mara’s aid network is partly a refusal to let Sera be the only one who gets to save people"
    ],
    "gm_notes": "Mara becomes more cooperative if PCs prove Redline people are being taken by something in the service infrastructure. Mara is Sera Valez’s estranged sister. If PCs respect that wound, it can open negotiation. If they use it to humiliate her, Redline reacts badly.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Nox “Bluewire” Kade",
    "role": "Volatile Redline enforcer and cyber-strain casualty",
    "faction": "Redline Choir",
    "attitude": "Agitated, frightened, pain-ridden, desperate to be useful",
    "wants": [
      "Be respected",
      "Protect Redline people from a threat he cannot explain"
    ],
    "offers": [
      "Instinctive warning about clicking in the walls",
      "Memory of missing people near service routes",
      "Knowledge of Redline paths"
    ],
    "secrets": [
      "Bluewire is not alien-controlled",
      "His distress is opioids, cyber-strain, trauma, and possibly illegal treatment side effects",
      "He heard or saw signs of Model 3 activity and was dismissed because he is unstable"
    ],
    "gm_notes": "Keep Bluewire human. He is an early warning system because nobody believes him when he says the walls have teeth.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Commander Ilan Rusk",
    "role": "Corporate Recovery commander",
    "faction": "Corporate Recovery",
    "attitude": "Professional, hostile, rational, and wrong about the current threat",
    "wants": [
      "Recover or destroy the Quill Relay",
      "Suppress witnesses and clinic records",
      "Prevent Redline Choir from broadcasting evidence"
    ],
    "offers": [
      "Temporary ceasefire",
      "Evacuation assets if forced",
      "Knowledge of the old nest site",
      "Corporate access codes"
    ],
    "secrets": [
      "Rusk knows the corporation created and destroyed the first nest",
      "Rusk does not initially know the second hidden nest exists",
      "His team’s mission includes witness control"
    ],
    "gm_notes": "Rusk can truthfully say the first nest was sterilized, while lying about experiments and cleanup orders. Once the second nest is proven, he must choose whether to cooperate or double down.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
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
    "gm_notes": "Good NPC for pulling sympathetic PCs toward the school annex and civilian stakes.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
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
    "gm_notes": "Useful for encouraging players to investigate psychology, fear, grief, and pain.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Tamsin Quill",
    "role": "Courier who stole the Quill Relay",
    "faction": "Independent / Mercy Twelve-adjacent",
    "attitude": "Wounded, terrified, determined",
    "wants": [
      "Keep the relay away from Corporate Recovery",
      "Warn that the corporation is cleaning witnesses, not rescuing people"
    ],
    "offers": [
      "Partial relay passphrase",
      "Route from the old research annex",
      "Fragmentary memory of Model 1s flying away during cleanup"
    ],
    "secrets": [
      "Tamsin saw evidence that the first nest cleanup failed",
      "The relay is evidence, not alien technology"
    ],
    "gm_notes": "Use Tamsin as the inciting body and warning. A clear line: “They weren’t fleeing. They were planting something.”",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
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
    "gm_notes": "Use to force cooperation, evacuation, and first ascension. Do not make this a social faction in the starter job.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
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
    "gm_notes": "Use NightCrash only as an emergency safety valve or post-victory recognition cameo. She arrives briefly, saves wounded or creates one opening, then rushes to a bigger emergency. She is adverse to fighting humans and focuses on evacuation, medicine, and fighting aliens.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
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
    "gm_notes": "Use as explanation for how NightCrash arrives quickly without pretending a critically injured person fits on a normal hoverbike.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
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
    "gm_notes": "The Gurney Angels are evacuation tools, not combat monsters. They can briefly block or shove through danger while carrying a patient, but their main job is extraction.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Juno “Switch” Hale",
    "role": "Redline camera sitter and unofficial surveillance operator",
    "faction": "Redline Choir",
    "attitude": "Sharp, defensive, overworked, more frightened than they admit",
    "wants": [
      "Protect Redline routes and people",
      "Find out what happened to Bex Aranda and Lala Mir"
    ],
    "offers": [
      "Side-corridor camera feeds",
      "Blind spot map",
      "Footage of Bex being dragged toward a service gap"
    ],
    "secrets": [
      "Switch has seen low, fast shapes on corrupted footage",
      "Switch suspects the missing people are not ordinary gang/corp casualties"
    ],
    "gm_notes": "Use Switch as a social alternative to hacking. Cooperation can reveal that people disappeared near routes connected to the hidden nest.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Rafa Mbeki",
    "role": "Clinic security monitor",
    "faction": "Mercy Twelve Clinic",
    "attitude": "Tired, protective, privacy-conscious",
    "wants": [
      "Protect patients",
      "Avoid turning clinic camera feeds into corporate evidence against patients"
    ],
    "offers": [
      "Clinic camera lookups",
      "Door logs",
      "Emergency intake records",
      "Patient movement discrepancies"
    ],
    "secrets": [
      "Rafa noticed camera gaps but feared reporting them would trigger a corporate raid"
    ],
    "gm_notes": "Use Rafa as the clinic-side control room NPC. He can establish a pattern but not solve the whole mystery without physical investigation.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Oskar Venn",
    "role": "Missing maintenance worker",
    "faction": "Megacomplex Maintenance",
    "attitude": "Absent; known by coworkers as careful and stubborn",
    "wants": [
      "Before vanishing: fix the HVAC fault"
    ],
    "offers": [
      "Tool cart clue",
      "Access badge record",
      "Radio log: “Something is breathing in here.”",
      "Drag marks toward service cavity"
    ],
    "secrets": [
      "Oskar was taken by a juvenile Model 3",
      "His remains may be partly incorporated near the hidden nest"
    ],
    "gm_notes": "Use Oskar as the cleanest technical missing-person clue.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Laleh “Lala” Mir",
    "role": "Missing food distribution volunteer",
    "faction": "Community Support / Redline-adjacent",
    "attitude": "Absent; remembered as warm, reliable, and brave",
    "wants": [
      "Before vanishing: deliver food through back corridors"
    ],
    "offers": [
      "Spilled meal crates",
      "Witnesses among children and volunteers",
      "Service hatch clue"
    ],
    "secrets": [
      "Lala was taken near B10",
      "Her disappearance grounds the Auntie Red reveal"
    ],
    "gm_notes": "Use Lala to link Mara’s covert support and the missing-person threat.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Bex Aranda",
    "role": "Missing Redline lookout",
    "faction": "Redline Choir",
    "attitude": "Absent; officially accused of desertion by angry underlings",
    "wants": [
      "Before vanishing: watch the service approach"
    ],
    "offers": [
      "Switch’s corrupted footage",
      "Drag marks up into a service gap",
      "A dropped Redline token or knife"
    ],
    "secrets": [
      "Bex was taken by a juvenile Model 3",
      "Mara suspects more than she admits"
    ],
    "gm_notes": "Use Bex as the Redline emotional hook.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Narin Pell",
    "role": "Missing undocumented shelter resident",
    "faction": "Community Support",
    "attitude": "Absent; frightened of official systems",
    "wants": [
      "Before vanishing: stay hidden and avoid authorities"
    ],
    "offers": [
      "Bag left under bunk",
      "Sister Luma’s testimony",
      "Organic smear near B12",
      "Possible rescue if PCs act quickly"
    ],
    "secrets": [
      "Narin may still be alive early in the session",
      "If PCs delay, Narin is incorporated into the nest"
    ],
    "gm_notes": "Use Narin as the possible rescue victim.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Halden Rook",
    "role": "Missing corporate cleanup technician",
    "faction": "Corporate Research / Cleanup",
    "attitude": "Dead or missing; cautious, technically competent, ignored",
    "wants": [
      "Before vanishing: warn that Model 1 flight was not random"
    ],
    "offers": [
      "Final note: “They’re not fleeing. They’re relocating.”",
      "Cleanup footage annotation",
      "Overruled nest-seeding warning"
    ],
    "secrets": [
      "Halden’s warning was buried",
      "Corporate Recovery may know the name but not volunteer it"
    ],
    "gm_notes": "Use Halden as the deep relay clue.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Juvenile Model 3",
    "role": "Dog-like Antithesis biomass hunter",
    "faction": "Antithesis",
    "attitude": "Predatory, cautious, nest-directed",
    "wants": [
      "Find biomass",
      "Disable or kill prey",
      "Drag prey back to the hidden nest"
    ],
    "offers": [
      "Tracks to the hidden nest",
      "Proof that a new nest exists",
      "A rescue opportunity if it is dragging a victim"
    ],
    "secrets": [
      "Only a few exist at first",
      "They are produced by the second hidden nest"
    ],
    "gm_notes": "Use sparingly before the reveal. Its jaws split into three parts.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Model 1 Seed Clump",
    "role": "Dead Model 1 mass that seeded the second nest",
    "faction": "Antithesis",
    "attitude": "Not an NPC; biological clue/hazard",
    "wants": [
      "Serve as seed biomass",
      "Grow into the second nest"
    ],
    "offers": [
      "Physical proof of Model 1 relocation",
      "Connection between old nest footage and new nest location"
    ],
    "secrets": [
      "The clump is made from escaped Model 1s that suicided together",
      "The corporation does not know this happened"
    ],
    "gm_notes": "This is a location/hazard more than a character.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Dr. Vela Myung",
    "role": "Clinic trauma doctor",
    "faction": "Mercy Twelve Clinic",
    "attitude": "Exhausted, sharp, quietly angry",
    "wants": [
      "Keep patients alive",
      "Understand what illegal treatments were used",
      "Avoid corporate seizure of patient records"
    ],
    "offers": [
      "Medical interpretation",
      "Exposure-trial recognition",
      "Triage leadership",
      "Model 3 wound analysis"
    ],
    "secrets": [
      "Accepted corporate-donated medicine without asking enough questions",
      "Fears some clinic patients were trial subjects"
    ],
    "gm_notes": "Use Dr. Myung when PCs need medical interpretation. She can identify trial-batch codes, false treatment protocols, and Model 3 bite trauma after evidence appears.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Vex Tan",
    "role": "Redline supply runner",
    "faction": "Redline Choir",
    "attitude": "Defensive, fast-talking, protective",
    "wants": [
      "Keep aid routes secret",
      "Find out what happened to Lala",
      "Avoid being accused of smuggling weapons"
    ],
    "offers": [
      "Aid-route knowledge",
      "Redline route access",
      "Confirmation that Lala delivered food",
      "Proof Mara ordered no shooting near clinic"
    ],
    "secrets": [
      "Smuggles minor side goods",
      "Knows Mara funds food and medicine"
    ],
    "gm_notes": "Vex ties the Redline aid network to the missing-person trail. Treat as a witness, not a combatant.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Rook “Mads” Madsen",
    "role": "Redline underling",
    "faction": "Redline Choir",
    "attitude": "Suspicious, blunt, insecure",
    "wants": [
      "Keep Redline from looking weak",
      "Find Bex",
      "Stop outsiders humiliating Bluewire"
    ],
    "offers": [
      "Street muscle",
      "Local route knowledge",
      "Corp observer identification",
      "Evacuation help if convinced"
    ],
    "secrets": [
      "Hates Bluewire and may provoke him",
      "Knows Bex would not desert easily"
    ],
    "gm_notes": "Use Mads as a named underling token. He can escalate social tension or become useful once Bex’s fate is proven.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Talla “Auntie’s Eyes” Vey",
    "role": "Redline aid coordinator",
    "faction": "Redline Choir / Community Support",
    "attitude": "Warm with locals, cold with outsiders",
    "wants": [
      "Protect Mara’s hidden support network",
      "Keep food routes open",
      "Protect children and volunteers"
    ],
    "offers": [
      "Food-route records",
      "Witness introductions",
      "Community trust",
      "Confirmation of Mara’s aid if trust is earned"
    ],
    "secrets": [
      "Not actually Mara’s family",
      "Uses the Vey name because Mara saved her"
    ],
    "gm_notes": "Talla guards the Auntie Red secret. She is a good social gatekeeper for the support-center floor.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Lt. Varya Senn",
    "role": "Corporate field lieutenant",
    "faction": "Corporate Recovery",
    "attitude": "Disciplined, aggressive, impatient",
    "wants": [
      "Seize the relay",
      "Secure witnesses",
      "Control the scene before public panic",
      "Make Rusk’s plan work"
    ],
    "offers": [
      "Tactical ceasefire",
      "Access to corp equipment",
      "Old cleanup-site knowledge if forced"
    ],
    "secrets": [
      "Briefed on witness control, not the second nest",
      "Believes ugly containment is necessary"
    ],
    "gm_notes": "Use Senn when the corp needs teeth. She is more likely than Rusk to escalate physically.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Orlan Pike",
    "role": "Corporate surveillance handler",
    "faction": "Corporate Recovery",
    "attitude": "Smug, careful, ambitious",
    "wants": [
      "Edit footage",
      "Suppress the relay trail",
      "Frame Redline if useful",
      "Advance his career"
    ],
    "offers": [
      "Camera metadata",
      "Knowledge of edited feeds",
      "Traceable link to Switch",
      "Proof of corporate tampering"
    ],
    "secrets": [
      "Pressured or paid Switch for feed access",
      "May be operating without explicit written authorization"
    ],
    "gm_notes": "Spy/handler. Pike is a greed/career spy inside local systems. Use as Bloke #3 until identified.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Mara Silex",
    "role": "Corporate field medic",
    "faction": "Corporate Recovery / possible Mercy Twelve informant",
    "attitude": "Controlled, guilty, medically competent",
    "wants": [
      "Keep people alive",
      "Avoid being exposed by Corporate Recovery",
      "Leak enough to save lives without being disappeared"
    ],
    "offers": [
      "Medical help",
      "Batch-code recognition",
      "Quiet warning",
      "Possible testimony"
    ],
    "secrets": [
      "Has leaked fragments to Mercy Twelve by conscience",
      "Knows corp medical orders are indefensible"
    ],
    "gm_notes": "Potential conscience-spy. She can become a bridge between corp assets and clinic survival.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Miri and Sol",
    "role": "Schoolchildren witnesses",
    "faction": "Community Support",
    "attitude": "Curious, scared, more observant than adults expect",
    "wants": [
      "Understand why adults are frightened",
      "Keep each other safe",
      "Find out why Lala vanished"
    ],
    "offers": [
      "Auntie Red clue",
      "Lala clue",
      "Dog-feet-in-the-wall rumor",
      "Keet connection"
    ],
    "secrets": [
      "Adults told them not to talk",
      "They know Mara is softer than her reputation"
    ],
    "gm_notes": "Use them to reveal Auntie Red and the missing-person trail through overheard conversation.",
    "import_as": "gm_only_character",
    "token_note": "Create map token manually; importer creates the GM-only character entry and notes."
  },
  {
    "name": "Model 1 Juvenile",
    "role": "Small flying Antithesis / nest-seeding clue",
    "faction": "Antithesis / Bestiary",
    "attitude": "Biological, alien, non-negotiable",
    "wants": [
      "Follow nest-directed behavior",
      "Threaten civilians through speed and swarm pressure",
      "Serve as evidence that the nest can reproduce"
    ],
    "offers": [
      "Evidence of Model 1 relocation",
      "Escalation pressure if the hidden nest matures",
      "Aerial threat for harder scenes"
    ],
    "secrets": [
      "In this module, Model 1s are the clue that the first nest’s destruction was incomplete",
      "Dead Model 1s seeded the second hidden nest"
    ],
    "gm_notes": "Use the canonical Model 1 token. For the starter version, Model 1s are mostly evidence, footage, seed-clump remains, or late pressure. Full mechanical import needs confirmed Hope//Punk sheet attribute names.",
    "token_note": "Use tokens/model 1 juvenile.png from the repository."
  },
  {
    "name": "Model 1 Adolescent",
    "role": "Optional stronger Model 1 escalation",
    "faction": "Antithesis / Bestiary",
    "attitude": "Biological, alien, escalating",
    "wants": [
      "Increase pressure if the nest matures",
      "Harass from the air",
      "Force urgent containment"
    ],
    "offers": [
      "Harder aerial threat",
      "Evidence that containment is failing",
      "Optional difficulty ramp"
    ],
    "secrets": [
      "Should usually appear only if the GM wants a harder scenario or delayed containment consequences"
    ],
    "gm_notes": "Optional escalation token. Do not use by default in a one-shot starter unless the table wants a much harder fight.",
    "token_note": "Use tokens/model 1 adolescent.png from the repository."
  },
  {
    "name": "Model 1 Adult",
    "role": "High-threat Model 1 escalation",
    "faction": "Antithesis / Bestiary",
    "attitude": "Biological, alien, severe",
    "wants": [
      "Represent a failed-containment escalation",
      "Create aerial crisis pressure",
      "Punish major delay or bad-ending outcomes"
    ],
    "offers": [
      "Late-campaign escalation",
      "Hard-mode variant",
      "Visible proof the nest matured beyond starter scale"
    ],
    "secrets": [
      "Not recommended for a normal starter-session fight"
    ],
    "gm_notes": "Use only for a much harder version, a later campaign revisit, or if the nest is allowed to grow unchecked.",
    "token_note": "Use tokens/model 1 adult.png from the repository."
  },
  {
    "name": "Model 3 Juvenile",
    "role": "Dog-like Antithesis biomass hunter",
    "faction": "Antithesis / Bestiary",
    "attitude": "Predatory, cautious, nest-directed",
    "wants": [
      "Find biomass",
      "Disable or kill prey",
      "Drag prey back to the hidden nest",
      "Avoid unnecessary fights with strong groups"
    ],
    "offers": [
      "Tracks to the hidden nest if followed",
      "Proof that a new nest exists",
      "A rescue opportunity if it is dragging a victim"
    ],
    "secrets": [
      "Only a few exist at first",
      "They are produced by the second hidden nest",
      "They are not random monsters; they are biomass collectors"
    ],
    "gm_notes": "Use sparingly before the reveal. Its jaws split into three parts. Its first full encounter should involve a victim being dragged away, teaching the PCs what the hidden nest is doing. Full mechanical import needs confirmed Hope//Punk sheet attribute names.",
    "token_note": "Use tokens/model 3 juvenile.png from the repository."
  },
  {
    "name": "Model 3 Adolescent",
    "role": "Optional boss-level Model 3 biomass hunter",
    "faction": "Antithesis / Bestiary",
    "attitude": "Predatory, stronger, nest-defending",
    "wants": [
      "Defend the hidden nest",
      "Drag biomass to the nest",
      "Force PCs to choose between fighting and rescue"
    ],
    "offers": [
      "Boss-fight pressure",
      "Harder climax for larger groups",
      "Clear sign that the nest is maturing"
    ],
    "secrets": [
      "Should be optional in a starter job",
      "Works best as one major defender rather than a random extra monster"
    ],
    "gm_notes": "Optional boss fight for 4+ PCs or tactically strong groups. It should defend the hidden nest or try to drag a named victim away while the PCs handle objectives.",
    "token_note": "Use tokens/model 3 adolescent.png from the repository."
  },
  {
    "name": "Model 3 Adult",
    "role": "High-threat Model 3 escalation",
    "faction": "Antithesis / Bestiary",
    "attitude": "Predatory, severe, campaign-scale",
    "wants": [
      "Represent major containment failure",
      "Overwhelm unprepared defenders",
      "Force evacuation or desperate containment"
    ],
    "offers": [
      "Hard-mode climax",
      "Later-campaign threat",
      "Bad-ending escalation"
    ],
    "secrets": [
      "Usually too much for a normal starter job unless used as an unfinished emergence or timer"
    ],
    "gm_notes": "Use very cautiously in starter play. Better as a threat that is not fully emerged yet: stop it before it finishes forming.",
    "token_note": "Use tokens/model 3 adult.png from the repository."
  }
];

  var HANDOUTS = [
  {
    "name": "Signal Bleed - GM Overview",
    "source_file": "handouts/00_GM_Overview.md",
    "notes": "<h1>GM Overview: Signal Bleed</h1>
<h2>Pitch</h2>
<p>A community clinic has received a damaged mesh relay/data-core from a dying courier. The device allegedly contains evidence of corporate medical crimes in the district. The clinic wants to verify the data before broadcasting it. The local gang wants the neighborhood to have a say before anyone hands it to outsiders. A corporate recovery team wants the device back.</p>
<p>The PCs are gathered for what sounds like a simple community protection job:</p>
<p>&gt; Keep the peace for one evening. Protect the clinic. Do not let the device leave until it has been verified. Avoid bloodshed if possible.</p>
<p>Then the signal starts bleeding through.</p>
<h2>Tone</h2>
<p>Signal Bleed should start human-scale and grounded: overworked clinic staff, hungry schoolkids, scared patients, territorial gang underlings, professional corporate pressure, and ordinary people trying to survive.</p>
<p>The alien element should feel like an escalation into Hope//Punk proper. The PCs were already trying to help before the world became impossible.</p>
<h2>Core design rule</h2>
<p>No human faction is a mandatory enemy. No human faction is guaranteed to become an ally. Every human faction has at least one diplomatic solution. Every diplomatic solution has a cost. The aliens guarantee the final pressure.</p>
<h2>Human factions</h2>
<h3>Mercy Twelve Clinic</h3>
<p>The clinic protects people through care, triage, shelter, and information.</p>
<p>Leader: <strong>Dr. Sera Valez</strong></p>
<p>Default behavior: helpful, exhausted, protective, negotiation-focused.</p>
<h3>The Redline Choir</h3>
<p>The local gang protects people through territory, fear, smuggling, favors, and retaliatory violence.</p>
<p>Leader: <strong>Mara “Mother Red” Vey</strong></p>
<p>Default behavior: suspicious, territorial, but rational if respected.</p>
<h3>Corporate Recovery Team</h3>
<p>The corporate recovery team wants the relay recovered and the evidence suppressed.</p>
<p>Leader: <strong>Commander Ilan Rusk</strong></p>
<p>Default behavior: hostile but rational. They prefer containment, leverage, and plausible deniability over open massacre.</p>
<h2>The non-negotiable threat</h2>
<p>The signal device contains or carries alien contamination. It is not just evidence. It is a beacon, wound, receiver, egg, or lure.</p>
<p>The first alien event should happen after players have had time to care about the clinic and understand the factions.</p>"
  },
  {
    "name": "Signal Bleed - Player Start Here",
    "source_file": "handouts/01_Player_Start_Here.md",
    "notes": "<h1>Player Start Here: Signal Bleed</h1>
<p>You can find the Hope//Punk rules and information at:</p>
<p>https://ravensdagger.itch.io/hopepunk</p>
<p>Hope//Punk is copyright RavensDagger. This is just a fan creation.</p>
<h2>Choosing a pregen</h2>
<p>Pick a pregen by choosing a Background, then ask the GM to move that character from the <strong>Pregens</strong> folder to the <strong>Characters</strong> folder and assign it to you.</p>
<p>The character names are written as:</p>
<pre>Character Name (Background)</pre>
<p>The part in parentheses is only there to make pregens easier to pick.</p>
<h2>Customizing before play</h2>
<p>You may customize the pregen before play:</p>
<h3>1. Rename the character</h3>
<p>The name and handle are only suggestions. You may remove the “(Background)” part from the character name after choosing the pregen.</p>
<p>You may also change the portrait/token if you want.</p>
<h3>2. Move starting skill points</h3>
<p>Each pregen has two extra starting skill points already spent. These are shown as skills with 2 points.</p>
<p>You may move one or both of those extra points:</p>
<ul>
<li>remove 1 point from a skill that has 2 points</li>
<li>add that point to any other skill that currently has 0 or 1 point</li>
</ul>
<p>Do not reduce a Background skill below 1 if it was part of the pregen’s starting Background package, unless the GM allows a larger rebuild.</p>
<h3>3. Move proficiencies</h3>
<p>Each pregen has two proficiencies.</p>
<p>You may move either proficiency to any skill that has at least 1 point after your skill changes.</p>
<p>This means you may first move a skill point into a 0-point skill, making it 1, and then move a proficiency to that newly chosen skill.</p>
<h3>4. Spend money</h3>
<p>You may spend remaining money to buy additional gear. See the rulebook for what is available.</p>
<h3>5. Keep the Background</h3>
<p>The Background, Background Ability, and starting gear are part of the pregen’s chosen Background package.</p>
<p>Ask the GM before changing those.</p>
<h2>Starting situation</h2>
<p>You are at <strong>Mercy Twelve</strong>, a community clinic in a neglected district.</p>
<p>You were hired, asked, pressured, or personally drawn into a simple protection job:</p>
<p>&gt; Keep the peace for one evening. Protect the clinic. Do not let a damaged relay/data-core leave until it has been checked. Avoid bloodshed if possible.</p>
<p>It should have been simple.</p>"
  },
  {
    "name": "Signal Bleed - Player Hooks",
    "source_file": "handouts/02_Player_Hooks.md",
    "notes": "<h1>Player Hooks: Why Are You at Mercy Twelve?</h1>
<p>Choose one, roll one, or make your own with the GM.</p>
<h2>General hooks</h2>
<ol>
<li><strong>Hired Guard</strong> — You were paid to help protect the clinic during a tense data handoff.</li>
<li><strong>Owed Favor</strong> — The clinic patched you up once and never asked who shot you. Now Dr. Valez is calling in the favor.</li>
<li><strong>Local Connection</strong> — Someone you care about lives nearby, works at the clinic, attends the school, or depends on the clinic’s medicine.</li>
<li><strong>Courier Contact</strong> — You knew the courier who brought in the device, or you were supposed to meet them.</li>
<li><strong>Gang Contact</strong> — Mara’s people asked you to attend as an outside witness, specialist, or neutral party.</li>
<li><strong>Corp Trouble</strong> — The corporation involved has hurt you before. You want proof.</li>
<li><strong>Paid Specialist</strong> — You were brought in for a specific skill: hacking, driving, medicine, security, repairs, negotiation, or investigation.</li>
<li><strong>Wrong Place, Right Time</strong> — You came to the clinic for help, shelter, medicine, repairs, or information, and got pulled into the crisis.</li>
</ol>
<h2>Background-specific ideas</h2>
<p><strong>Bounty Hunter:</strong> You were hired to watch for the missing courier or identify who is tracking the clinic.</p>
<p><strong>Cat Burglar:</strong> You were asked to quietly check whether someone has already planted a tracker or listening device inside the clinic.</p>
<p><strong>Corporate Security:</strong> Dr. Valez wants someone who understands corporate recovery protocols.</p>
<p><strong>Cyber-Junkie:</strong> The damaged relay is screaming across the mesh in ways only you can feel.</p>
<p><strong>Desert Courier:</strong> You knew the courier route. The person who delivered the device should not have reached the clinic alive.</p>
<p><strong>Ex-Military:</strong> You were hired to assess the clinic’s defenses and evacuate civilians if violence starts.</p>
<p><strong>Gambler on the Run:</strong> You owe the clinic, Mara, or the courier. This was supposed to be a quick paid favor.</p>
<p><strong>Grease Monkey:</strong> The clinic’s generator, ambulance, cargo lift, or relay hardware is failing.</p>
<p><strong>Gutter Rat Orphan:</strong> You know the back routes, roof gaps, underways, and which kids saw the courier arrive.</p>
<p><strong>Mesh Hacker:</strong> You were hired to verify, decrypt, or isolate the signal.</p>
<p><strong>Pilot:</strong> The clinic may need an emergency extraction, rooftop pickup, or drone/vehicle support.</p>
<p><strong>Piss-Poor Artist:</strong> You are connected to the local school, mural project, protest network, or underground broadcast scene.</p>
<p><strong>Religious Fanatic:</strong> You believe the clinic, the suffering patients, or the signal has spiritual significance.</p>
<p><strong>Rogue Surgeon:</strong> Dr. Valez needs medical help with a patient exposed to the device.</p>
<p><strong>Samurai Otaku:</strong> You came because rumors say the signal contains real Samurai telemetry.</p>
<p><strong>Scavenger:</strong> You recognize the relay hardware as something salvaged from a forbidden zone.</p>
<p><strong>Student Dropout:</strong> You know the schoolkids, the community tutors, or the student mesh network that first noticed the signal.</p>
<p><strong>Test Subject:</strong> The signal causes symptoms that feel horribly familiar.</p>
<p><strong>Underground Fighter:</strong> You were hired as visible muscle, or a local kid from the clinic follows your fights.</p>
<p><strong>Washed Up Rocker:</strong> The clinic wants your public voice, old contacts, or ability to calm a crowd.</p>"
  },
  {
    "name": "Signal Bleed - Mercy Twelve Clinic",
    "source_file": "handouts/03_Mercy_Twelve_Clinic.md",
    "notes": "<h1>Mercy Twelve Clinic</h1>
<h2>Player-facing summary</h2>
<p>Mercy Twelve is a community clinic, shelter, night-school annex, and last-resort triage station built into an old municipal health building.</p>
<p>The lobby smells of antiseptic, cheap noodles, rain-wet concrete, and overheated batteries. Every wall has been patched more than once. Half the lights flicker. The other half are covered with children’s drawings, hand-written instructions, missing-person notes, and old protest posters.</p>
<p>Mercy Twelve is not safe because the law protects it.</p>
<p>Mercy Twelve is safe because the neighborhood has agreed that some doors should stay open.</p>
<h2>Key areas</h2>
<h3>Waiting Room</h3>
<p>Crowded with patients, volunteers, gang lookouts pretending not to be lookouts, and at least one child trying to do homework on the floor.</p>
<h3>Triage Hall</h3>
<p>Staff move fast here. Outsiders standing in the wrong place will be redirected firmly but politely.</p>
<h3>Treatment Wing</h3>
<p>Locked after the courier arrived. Contains the contaminated relay/data-core and at least one patient exposed to it.</p>
<h3>School Annex</h3>
<p>Used for night classes, food distribution, tutoring, and shelter overflow.</p>
<h3>Roof Access</h3>
<p>Possible drone landing, signal access, escape route, or final transmitter location.</p>
<h3>Generator Room</h3>
<p>The clinic’s generator and power storage are old, overloaded, and sensitive to signal pulses.</p>
<h2>Clinic leader</h2>
<p><strong>Dr. Sera Valez</strong> runs Mercy Twelve.</p>
<p>She is warm, direct, exhausted, and hard to intimidate. She does not want a fight. She also will not hand frightened people over to the corp just because someone with a badge and a contract says “compliance.”</p>
<h2>Sera and Mara</h2>
<p>Dr. Sera Valez and Mara “Mother Red” Vey are estranged sisters.</p>
<p>Sera kept the Valez name and built Mercy Twelve into a place of public trust. Mara shortened/cut her name to Vey and became the dangerous unofficial power that keeps food, medicine, generator fuel, and protection moving when official systems fail.</p>
<p>Sera knows Mara’s aid network exists. She does not like the violence that comes with it. She also knows some patients would be dead without it.</p>
<p>Sera does not want outsiders using the relationship as leverage inside her clinic.</p>"
  },
  {
    "name": "Signal Bleed - Redline Choir",
    "source_file": "handouts/04_Redline_Choir.md",
    "notes": "<h1>The Redline Choir</h1>
<h2>Public face</h2>
<p>The Redline Choir is the local gang. They control corners, roofs, underpass routes, informal markets, and protection rackets. They smuggle medicine, run debt enforcement, move stolen gear, and make examples of people who prey on the block.</p>
<p>They are not gentle.</p>
<p>They are also not simple.</p>
<h2>Private reality</h2>
<p>The Redline Choir quietly funds school meals, buys medicine, pays teachers, keeps generators running, and makes certain predators disappear before the law notices.</p>
<p>This is not public knowledge.</p>
<p>Mara “Mother Red” Vey works hard to preserve the Choir’s tough front. She does not want outsiders saying the gang has gone soft. In her mind, fear is one of the few tools the neighborhood still has.</p>
<h2>Discovering the secret</h2>
<p>Players may discover Mara’s hidden support through investigation or good social play:</p>
<ul>
<li>a clinic underling accidentally says “Mara paid for that” and then stops talking</li>
<li>schoolchildren know her as “Auntie Red,” but adults avoid saying it</li>
<li>a hidden ledger lists food, medicine, teacher stipends, and funeral costs</li>
<li>a gang courier delivers crates marked as contraband, but they contain insulin, antibiotics, and meal packs</li>
<li>Dr. Valez knows, but will not reveal it unless the PCs earn trust</li>
<li>Bluewire bitterly blurts out something like: “She feeds everyone but still looks at me like I’m broken.”</li>
</ul>
<h2>Leader: Mara “Mother Red” Vey</h2>
<p>Mara is charismatic, controlled, and visibly tired of burying kids.</p>
<p>She does not want a war with the clinic, the corp, or the PCs. She wants leverage and a guarantee that the neighborhood is not cut out of decisions about the relay.</p>
<p>Her position:</p>
<p>&gt; The clinic saves lives one at a time. We keep the whole block from being eaten. Do not confuse our methods with lack of morals.</p>
<h2>Mara and Sera</h2>
<p>Mara “Mother Red” Vey and Dr. Sera Valez are estranged sisters.</p>
<p>Mara’s hidden soft-power network is not random charity. It is partly guilt, partly territorial politics, and partly a furious refusal to let Sera be the only one who gets to save people.</p>
<p>Redline underlings may not know all the family history, but senior locals know enough to avoid joking about it.</p>
<p>If PCs reveal the relationship respectfully, Mara may negotiate. If they use it to humiliate her, she treats it as an attack.</p>"
  },
  {
    "name": "Signal Bleed - NPCs GM",
    "source_file": "handouts/05_NPCs_GM.md",
    "notes": "<h1>NPCs: GM Notes</h1>
<h2>Dr. Sera Valez</h2>
<p>Clinic director, community organizer, moral center. Charismatic through warmth and presence rather than threat.</p>
<p><strong>Wants:</strong> keep patients alive, verify the signal, expose the corp if possible, prevent the clinic from becoming a battlefield.</p>
<p><strong>Offers:</strong> medical care, information, local trust, neutral ground, access to the relay.</p>
<p><strong>Secret:</strong> knows Mara covertly funds food and school support.</p>
<h2>Mara “Mother Red” Vey</h2>
<p>Leader of the Redline Choir. Charismatic, controlled, dangerous, and rational.</p>
<p><strong>Wants:</strong> neighborhood control over the relay, proof against the corp, protection for her people, respect.</p>
<p><strong>Offers:</strong> local routes, lookouts, fighters, stolen codes, street legitimacy.</p>
<p><strong>Secret:</strong> covertly funds school meals, medicine, teacher stipends, and generator fuel.</p>
<h2>Nox “Bluewire” Kade</h2>
<p>Unstable Redline Choir enforcer. On opioids, overclocked combat ware, and too much cyber strain.</p>
<p><strong>Wants:</strong> respect, pain relief, proof he is still useful, to stop feeling afraid, to hurt the corp before the corp hurts them.</p>
<p><strong>Triggers:</strong> mockery, public disarmament, corp uniforms/drones, people touching his cyberware, signal pulses, withdrawal symptoms, sudden movement.</p>
<p><strong>Important:</strong> Bluewire is not the gang. If he dies, the gang does not automatically attack.</p>
<h2>Commander Ilan Rusk</h2>
<p>Corporate recovery commander. Calm, professional, and legally protected.</p>
<p><strong>Wants:</strong> recover the relay, suppress evidence, prevent visible contamination, avoid corporate blame.</p>
<p><strong>Offers:</strong> safe passage, money, medical supplies, minor warrant erasure, temporary ceasefire.</p>
<h2>Keet</h2>
<p>School volunteer / witness. Young, quick-talking, frightened, and observant.</p>
<p><strong>Offers:</strong> witness details, hidden route, clue about Mara’s school support.</p>
<h2>Sister Luma</h2>
<p>Clinic volunteer and spiritual counselor. Calm, perceptive, and emotionally direct.</p>
<p><strong>Offers:</strong> emotional reads, patient trust, help calming civilians, spiritual interpretation of the breach.</p>
<h2>Tamsin Quill</h2>
<p>Damaged courier. Alive, barely conscious, or recently dead depending on pacing.</p>
<p><strong>Offers:</strong> final warning, route clue, partial passphrase, contamination symptoms.</p>
<h2>Mote Swarm</h2>
<p>First alien pressure. Not a negotiable NPC.</p>
<p>Use to force cooperation, evacuation, and first ascension.</p>
<h2>Family link: Sera Valez and Mara Vey</h2>
<p>Sera Valez and Mara “Mother Red” Vey are estranged sisters.</p>
<p>This makes their conflict personal:</p>
<ul>
<li>Sera represents medicine, legitimacy, and public trust.</li>
<li>Mara represents informal power, fear, smuggling, and neighborhood survival.</li>
<li>Both protect the same people.</li>
<li>Neither wants the relationship used as public leverage.</li>
</ul>
<p>Use this to complicate negotiations. The PCs can earn trust by respecting both sisters’ protective instincts without pretending their methods are equivalent.</p>"
  },
  {
    "name": "Signal Bleed - Bluewire Deescalation",
    "source_file": "handouts/06_Bluewire_Deescalation.md",
    "notes": "<h1>Bluewire: Distress, Cyber Strain, and De-escalation</h1>
<h2>GM principle</h2>
<p>Bluewire is obviously unwell.</p>
<p>The point is not to trick the players. The point is to reward them for paying attention to health, psychology, pain, and fear before violence starts.</p>
<h2>What the PCs can see</h2>
<p>Bluewire is shaking, sweating, scanning exits, clenching and unclenching his cybernetic hand, and reacting half a second too late to words but instantly to sudden movement.</p>
<p>He stands too close to doors. Nobody stands behind him. Other gang members give him space without saying why.</p>
<p>He is trying to look dangerous because he feels terrified.</p>
<h2>Suggested difficulties</h2>
<p>Use the system’s normal check structure. The exact skill depends on the character’s approach.</p>
<p><strong>Difficulty 8:</strong> Notice he is unstable, frightened, overstimulated, and in pain.</p>
<p><strong>Difficulty 10:</strong> Identify likely opioid dependence, withdrawal symptoms, cyber-strain overload, and emotional dysregulation.</p>
<p><strong>Difficulty 12:</strong> Realize the damaged signal/device is aggravating his implants.</p>
<p><strong>Difficulty 14:</strong> Work out a safe de-escalation plan: reduce stimulation, give him space, speak directly but calmly, offer a face-saving exit, involve someone he trusts, or get medical sedation ready.</p>
<p><strong>Difficulty 16:</strong> Predict his next trigger before it happens.</p>
<h2>Helpful approaches</h2>
<ul>
<li>use his name</li>
<li>lower your voice</li>
<li>give him physical space</li>
<li>offer a concrete choice</li>
<li>acknowledge pain without pity</li>
<li>let him save face</li>
<li>move bystanders away</li>
<li>reduce noise/light/stimulation</li>
<li>ask what he needs right now</li>
<li>give him a useful task that does not put civilians at risk</li>
</ul>
<h2>Impact</h2>
<p>If a PC sincerely treats Bluewire as a person instead of a threat, reduce the next social/medical check involving him by 2.</p>
<p>If a PC publicly gives him a face-saving way to stand down, reduce the difficulty by 4.</p>
<p>If a PC mocks him, corners him, calls him a junkie, or tries to humiliate him, increase the difficulty by 4 and advance escalation.</p>"
  },
  {
    "name": "Signal Bleed - Scene Outline",
    "source_file": "handouts/07_Scene_Outline.md",
    "notes": "<h1>Signal Bleed: Scene Outline</h1>
<h2>Scene 1: Arrival at Mercy Twelve</h2>
<p>The PCs arrive at the clinic for a simple protection job.</p>
<p>Visible tensions:</p>
<ul>
<li>patients in the waiting room</li>
<li>gang underlings near the rear exit</li>
<li>clinic volunteers trying to keep order</li>
<li>Bluewire pacing too close to the treatment wing</li>
<li>the lights flicker every time the relay pulses</li>
</ul>
<h2>Scene 2: Keep the Peace</h2>
<p>A disagreement breaks out over who controls access to the relay.</p>
<p>Options:</p>
<ul>
<li>talk down underlings</li>
<li>investigate Bluewire’s condition</li>
<li>discover clinic/gang history</li>
<li>inspect security</li>
<li>detect corp surveillance</li>
<li>examine relay symptoms</li>
</ul>
<h2>Scene 3: Faction Negotiation</h2>
<p>The PCs can interact with Dr. Valez, Mara, gang underlings, clinic staff, school volunteers, and corporate intermediaries.</p>
<p>Possible discoveries:</p>
<ul>
<li>Mara secretly supports the school and food programs</li>
<li>the relay contains more than evidence</li>
<li>the courier’s route should have been impossible</li>
<li>someone has already tagged the clinic for recovery</li>
<li>Bluewire’s implants are reacting to the signal</li>
</ul>
<h2>Scene 4: Corporate Pressure</h2>
<p>Commander Rusk or his team makes contact through a drone warning, legal threat, extraction demand, offer of payment, staged power outage, or recovery squad outside.</p>
<h2>Scene 5: Signal Breach</h2>
<p>The relay pulses. Lights bloom white-blue. Implants ache. Patients seize or speak in static. AR overlays show impossible geometry. Something hears the signal and answers.</p>
<p>Earlier choices matter.</p>
<h2>Scene 6: First Ascension</h2>
<p>The PCs are exposed to the breach and trigger their first Samurai potential.</p>
<p>Focus on protecting civilians, impossible pressure, personal choice, and hope under threat.</p>
<h2>Scene 7: Finale</h2>
<p>Possible finale locations:</p>
<ul>
<li>treatment wing</li>
<li>generator room</li>
<li>roof transmitter</li>
<li>street outside clinic</li>
<li>school annex</li>
</ul>
<p>Final choices:</p>
<ul>
<li>broadcast evidence now, risking unstable signal effects</li>
<li>delay and stabilize it, giving the corp time</li>
<li>destroy the relay to save the clinic</li>
<li>give/shared custody to clinic, gang, or corp</li>
<li>turn the signal into bait for the alien threat</li>
</ul>
<h2>Optional: NightCrash Intervention</h2>
<p>If the PCs are being overwhelmed by the alien breach, Florence “NightCrash” Vale may arrive as an emergency safety valve.</p>
<p>She should not solve the scenario. She creates one opening:</p>
<ul>
<li>evacuates endangered civilians</li>
<li>stabilizes a dying PC or NPC</li>
<li>blocks one alien push</li>
<li>identifies the breach point</li>
<li>gives the PCs one clear tactical instruction</li>
</ul>
<p>Then she receives a higher-priority emergency call and must leave.</p>
<p>If the PCs solve the crisis themselves, use NightCrash after the finale instead. She arrives too late to save the day, realizes the PCs handled it, thanks them, recognizes them as newly awakened Samurai, and welcomes them into the wider Samurai world.</p>"
  },
  {
    "name": "Signal Bleed - NightCrash Samurai Failsafe",
    "source_file": "handouts/08_NightCrash_Samurai_Failsafe.md",
    "notes": "<h1>NightCrash: Samurai Failsafe and Mentor Cameo</h1>
<h2>GM purpose</h2>
<p>Florence “NightCrash” Vale is not here to win the scenario for the players.</p>
<p>She exists for two possible uses:</p>
<ol>
<li><strong>Emergency arrival</strong></li>
<p>If the PCs are overwhelmed by the first alien breach, NightCrash arrives, saves wounded civilians or a fallen PC, creates one tactical opening, then leaves for a larger emergency elsewhere.</p>
</ol>
<ol>
<li><strong>Recognition arrival</strong></li>
<p>If the PCs solve the crisis themselves, NightCrash arrives after the danger has passed. She thanks them, identifies them as newly awakened Samurai, offers medical aid, and gives them their first connection to the wider Samurai world.</p>
</ol>
<p>NightCrash should never take the final decision away from the PCs.</p>
<h2>Identity</h2>
<p><strong>Name:</strong> Florence Vale <strong>Samurai Handle:</strong> NightCrash <strong>Level:</strong> 5 <strong>Active Samurai:</strong> about six months <strong>Role:</strong> combat medic, evacuation specialist, hospital patron <strong>Power budget:</strong> roughly Tier 1 catalogue-equivalent, around 500–1000 SP spent <strong>Public brand:</strong> absurd sponsor-friendly emergency nurse icon <strong>Private self:</strong> exhausted, sincere, frighteningly competent</p>
<h2>Visual concept</h2>
<p>NightCrash wears a white, pink, and chrome combat-medic outfit that looks halfway between trauma surgeon, racing leathers, magical-girl emergency responder, and theatrical nurse costume.</p>
<p>Her outfit is ridiculous enough to attract sponsors and functional enough that people stop laughing when she cuts through an alien swarm to carry three patients out of a burning ward.</p>
<p>Avoid using real-world protected medical symbols directly. Use fictional sponsor marks instead, such as:</p>
<ul>
<li>Mercy Star</li>
<li>White Siren</li>
<li>SaintPulse</li>
<li>Pink Crossline</li>
</ul>
<h2>Sponsors</h2>
<p>NightCrash is backed by hospitals, medtech companies, charity streams, trauma-foam manufacturers, and emergency-response brands.</p>
<p>Possible sponsor names:</p>
<ul>
<li>SaintPulse Emergency Systems</li>
<li>MercyCart Medical Logistics</li>
<li>PanaceaLite Trauma Foam</li>
<li>Aegis Ambulance Union</li>
<li>HaloPatch Wound Sealant</li>
<li>KidneyCandy Electrolytes</li>
</ul>
<p>Her sponsors are silly and exploitative. NightCrash is not.</p>
<h2>Vehicle: The Siren Saint</h2>
<p>A hoverbike alone is not enough to transport a critically injured person.</p>
<p>Use this instead:</p>
<p><strong>The Siren Saint</strong> is a hyperfast rapid-response hoverbike with a detachable powered trauma sled / micro-ambulance pod.</p>
<p>In fast-response mode, it is a sleek armored hoverbike.</p>
<p>In evacuation mode, it deploys or tows a compact stabilized medical pod large enough for one critical patient. The pod has shock suspension, trauma foam, oxygen support, restraint webbing, and a hard-shell canopy.</p>
<p>The Siren Saint is built for impossible arrival:</p>
<ul>
<li>splitting traffic</li>
<li>climbing ramps and stairwells</li>
<li>launching from med-evac rails</li>
<li>crossing rooftops</li>
<li>forcing doors with emergency override hacks</li>
<li>dragging the trauma pod through smoke, debris, and panicked crowds</li>
</ul>
<p>It can extract one critical patient or two cramped small civilians if the situation is desperate.</p>
<h2>Drones: The Gurney Angels</h2>
<p>NightCrash has two humanoid evacuation drones.</p>
<p>They are sponsored human technology, not alien tech.</p>
<p><strong>Public name:</strong> the Gurney Angels <strong>Technical labels:</strong> Mercy Unit 12-A and Mercy Unit 12-B</p>
<p>The Gurney Angels have nurse-like silhouettes, white/pink trauma plating, soft synthetic voices, and a collapsible smart-stretcher carried between them.</p>
<p>They are not combat monsters. Their purpose is evacuation.</p>
<p>They can:</p>
<ul>
<li>carry one critical patient or two small civilians</li>
<li>deploy trauma straps and medfoam</li>
<li>shield a patient from debris</li>
<li>navigate smoke and crowds automatically</li>
<li>follow NightCrash’s triage commands</li>
<li>block a hallway briefly while evacuating someone</li>
<li>say cheerful scripted things at inappropriate moments</li>
</ul>
<p>Example line:</p>
<p>&gt; Please remain calm. Your panic has been noted and is valid.</p>
<h2>Human combat policy</h2>
<p>NightCrash is adverse to fighting human factions.</p>
<p>Her rule:</p>
<p>&gt; Humans are patients until they prove otherwise. Aliens are the emergency.</p>
<p>Against humans she uses non-lethal force unless there is no other way to stop immediate murder.</p>
<h3>Non-lethal tools</h3>
<p><strong>Bedside Manner</strong> A wrist-mounted non-lethal system that fires restraint foam, sedative microdarts, sonic disorientation pulses, and bright sponsor-colored warning flares.</p>
<p><strong>Mercy Lance</strong> A collapsible injector-staff / shock-syringe polearm. Against humans it delivers sedatives, muscle-lock pulses, or trauma foam bursts. Against aliens, she switches it to cutting plasma, corrosive sterilant, or other lethal modes.</p>
<h2>Alien combat policy</h2>
<p>Against aliens, NightCrash uses maximum sterilizing violence.</p>
<p>She will not hesitate if the threat is non-human, actively breaching, and endangering civilians.</p>
<h2>How she treats factions</h2>
<h3>Mercy Twelve Clinic</h3>
<p>Warm, respectful, protective.</p>
<p>Possible line:</p>
<p>&gt; Doctor Valez. I’m sorry I’m late.</p>
<h3>The Redline Choir</h3>
<p>She does not approve of their violence, but she recognizes that they are part of the local survival system.</p>
<p>Possible line:</p>
<p>&gt; Choir people: if you can carry, carry. If you can’t carry, clear the hall. If you start a fight in my triage path, I foam you to the ceiling.</p>
<h3>Corporate Recovery Team</h3>
<p>Cold and procedural.</p>
<p>Possible line:</p>
<p>&gt; Corporate personnel are invited to stop creating casualties.</p>
<p>If corporate troops are wounded, she still stabilizes them if possible.</p>
<h3>Bluewire</h3>
<p>She immediately reads him as overloaded, not evil.</p>
<p>Possible line:</p>
<p>&gt; Oh, sweetheart. Who let you run that much ware on that much pain?</p>
<p>She may sedate him, but she will not humiliate him.</p>
<h2>Emergency arrival</h2>
<p>Use only if the PCs are about to be overwhelmed in a way that would make the first session collapse rather than become dramatic.</p>
<p>NightCrash creates one opening:</p>
<ul>
<li>evacuate a cluster of civilians</li>
<li>stabilize a dying NPC</li>
<li>block one alien push</li>
<li>extract a fallen PC</li>
<li>give the PCs tactical advice</li>
<li>pin the breach for one round while the PCs act</li>
</ul>
<p>Then she receives an emergency priority override and must leave.</p>
<p>Possible larger emergency:</p>
<ul>
<li>a maternity shelter three districts over has gone into breach</li>
<li>a school convoy is trapped in a tunnel</li>
<li>a hospital tower just lost containment</li>
<li>a Samurai team failed to answer a distress ping</li>
<li>a refugee triage hub is being overrun</li>
</ul>
<p>She can help here, briefly. She cannot stay.</p>
<h2>Recognition arrival</h2>
<p>If the PCs solve the crisis themselves, NightCrash arrives after the danger has passed.</p>
<p>Read or paraphrase:</p>
<p>&gt; The siren arrives too late to save the day. &gt; &gt; A white-pink rapid-response bike drops onto the broken street outside Mercy Twelve, dragging a compact trauma pod behind it. Two nurse-shaped drones unfold a stretcher that is no longer needed. &gt; &gt; NightCrash steps through the smoke, looks at the living patients, the ruined breach site, and the newly awakened Samurai. &gt; &gt; For once, the sponsor-smile drops. &gt; &gt; “You handled this yourselves?”</p>
<p>Then she may:</p>
<ul>
<li>thank them if Mercy Twelve was saved</li>
<li>help stabilize survivors</li>
<li>recognize signs of new Samurai ascension</li>
<li>explain that their lives are about to change</li>
<li>warn them that sponsors, corps, aliens, and other Samurai will notice</li>
<li>suggest Samurai handles if the players want ideas</li>
</ul>
<h2>Handle suggestions</h2>
<p>If the PCs have not picked Samurai names yet, NightCrash can offer suggestions based on what they did.</p>
<p>Possible line:</p>
<p>&gt; You’re going to need handles. The system will give you numbers if you don’t give it names, and trust me, nobody wants to be Samurai Candidate Local-Event-Seven-B.</p>
<p>Suggestions:</p>
<ul>
<li>held the door: Lockjaw, DoorSaint, Lastline</li>
<li>saved civilians: Hearth, Lifeline, Carrylight</li>
<li>hacked the signal: Ghostwire, Signal Saint, Null Choir</li>
<li>protected Bluewire: Softkill, Mercybreak, Kind Knife</li>
<li>fought aliens directly: Breachburn, Motegrinder, Brightscar</li>
<li>negotiated peace: Redthread, Truce, Bridgeburn</li>
</ul>
<p>The suggestions are optional and a little silly. Players should be free to reject them.</p>"
  },
  {
    "name": "Signal Bleed - Maps GM Overview",
    "source_file": "handouts/09_Maps_GM_Overview.md",
    "notes": "<h1>Megacomplex Maps: GM Overview</h1>
<h2>Core idea</h2>
<p>The Mercy Twelve scenario area is not a standalone hospital building in an open city.</p>
<p>It is a vertical district inside a vast megacomplex: a city under ceilings, with interior streets, stacked floors, service shafts, clinic rooms, school rooms, shops, maintenance sectors, and emergency landing access.</p>
<p>Think of it as:</p>
<pre>roof / landing access
quarantine and incident floor
clinic and emergency floor
community support / shelter floor
utility and service floor
dummy floors: shopping, housing, transit, storage, offices</pre>
<p>The maps do not need to be literally adjacent in the image files. In play, they represent different floors/sectors in the same vertical stack.</p>
<h2>Movement between maps</h2>
<p>The maps include two main vertical travel methods:</p>
<h3>Elevator core</h3>
<p>The large dark double-door or teal-lit shaft-like structure is the main elevator core.</p>
<p>Use it for:</p>
<ul>
<li>gurneys</li>
<li>stretchers</li>
<li>cargo</li>
<li>civilians</li>
<li>wheelchair access</li>
<li>NightCrash’s Gurney Angels</li>
<li>fast movement between public/medical floors</li>
</ul>
<p>If the power is unstable, the elevator can become a scene objective.</p>
<p>Possible complications:</p>
<ul>
<li>elevator locks down during corporate recovery protocol</li>
<li>Bluewire or a gang underling holds it open</li>
<li>corp drones override the lift route</li>
<li>alien signal interference sends it to the wrong floor</li>
<li>staff need it for patients, but PCs need it for tactical movement</li>
</ul>
<h3>Emergency stair / ladderwell</h3>
<p>The narrow stair-looking structures are emergency vertical access.</p>
<p>They may look steep or ladder-like on the map. In-world, treat them as compact megacomplex stairwells: steep industrial stairs, ladder-stairs, maintenance stairs, or switchback emergency stairs depending on what fits the scene.</p>
<p>Use them for:</p>
<ul>
<li>risky movement under pressure</li>
<li>stealth movement</li>
<li>bypassing a locked elevator</li>
<li>chasing someone between floors</li>
<li>moving one or two people at a time</li>
</ul>
<p>Do not use them for easy patient evacuation unless the players have special equipment, enough time, or help from drones.</p>
<p>If a player says, “that looks more like a ladder,” that is fine. It can be a steep maintenance stair/ladderwell. Mechanically, the important point is:</p>
<ul>
<li>elevator = safe and accessible but controllable/lockable</li>
<li>stairs/ladderwell = always available but slower, riskier, and bad for stretchers</li>
</ul>
<h2>Dummy floors</h2>
<p>Between the active maps, assume there are “dummy floors” where no major encounter is planned.</p>
<p>Examples:</p>
<ul>
<li>shopping concourse</li>
<li>food court</li>
<li>cheap housing stack</li>
<li>storage mezzanine</li>
<li>school annex overflow</li>
<li>transit platform</li>
<li>maintenance crawl level</li>
<li>closed office floor</li>
<li>indoor garden balcony</li>
</ul>
<p>Use dummy floors for short transitions, rumors, shopping, brief NPC interactions, or pressure from crowds.</p>
<h2>Suggested stack</h2>
<p>This is the suggested order:</p>
<pre>Floor D: Quarantine / Incident Floor + Roof Landing Corner
Floor A: Mercy Twelve Clinic / Emergency Intake
Floor B: Community Support / Shelter / School Annex
Floor C: Service / Utility / Maintenance Floor</pre>
<p>Optional dummy floors:</p>
<pre>Between D and A: staff offices, diagnostics, closed research suites
Between A and B: public pharmacy, cafeteria, small shops
Between B and C: storage, laundry, staff dorms, low-rent housing
Below C: transit tunnels, waste processing, old sealed sectors</pre>
<h2>Reveal style</h2>
<p>These maps are designed for room-by-room reveal.</p>
<p>Recommended Roll20 approach:</p>
<ul>
<li>Use Dynamic Lighting if available.</li>
<li>Put doors on the Dynamic Lighting layer.</li>
<li>Keep interior streets visible if they are public/common areas.</li>
<li>Reveal rooms only when doors are opened or windows/feeds are accessed.</li>
<li>Let players use cameras, clinic staff, gang guides, or maintenance maps to reveal parts of the map in advance.</li>
</ul>
<p>The surrounding indoor streets are useful because they allow:</p>
<ul>
<li>civilians to pass by</li>
<li>gang lookouts to loiter without entering the clinic</li>
<li>corp surveillance to appear at a distance</li>
<li>PCs to move between sectors</li>
<li>public consequences to matter</li>
<li>NightCrash or emergency services to arrive from elsewhere</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map Floor A Clinic and Indoor Street",
    "source_file": "handouts/10_Map_Floor_A_Clinic_and_Indoor_Street.md",
    "notes": "<h1>Map: Floor A — Mercy Twelve Clinic and Indoor Street</h1>
<h2>Function</h2>
<p>This is the primary starting map for Signal Bleed.</p>
<p>It represents Mercy Twelve Clinic’s public and emergency-access level inside the megacomplex. It is surrounded by broad indoor streets and pedestrian lanes, because the clinic is part of a dense vertical city rather than a standalone building.</p>
<h2>What the map shows</h2>
<p>Key areas:</p>
<ul>
<li>indoor megacomplex streets around the clinic</li>
<li>public front entrance</li>
<li>reception / waiting area</li>
<li>triage station</li>
<li>emergency ambulance/service bay</li>
<li>surgery / trauma rooms</li>
<li>long-term treatment / recovery rooms</li>
<li>pharmacy and supply rooms</li>
<li>pediatric or community corner</li>
<li>staff office or break area</li>
<li>elevator core</li>
<li>emergency stair / ladderwell</li>
</ul>
<h2>Important circulation logic</h2>
<p>The clinic has two different patient flows.</p>
<h3>Public flow</h3>
<p>Civilians enter from the indoor street through the public front entrance.</p>
<p>They reach:</p>
<pre>street → reception/waiting → triage → treatment/recovery</pre>
<p>Reception controls normal visitor intake, but it should not block medical movement through the building.</p>
<h3>Emergency flow</h3>
<p>Ambulance or stretcher cases come through the non-public emergency bay.</p>
<p>They reach:</p>
<pre>emergency bay → triage/surgery/trauma → recovery rooms</pre>
<p>This lets critical patients bypass the public waiting room.</p>
<h3>Recovery flow</h3>
<p>From surgery/trauma, patients can be moved through internal corridors into long-term treatment and resting rooms.</p>
<p>The corridor structure matters. Staff should be able to move a patient from the back emergency intake to an operation/trauma room, and then onward to recovery, without dragging them through reception.</p>
<h2>Scenario use</h2>
<p>Good scenes here:</p>
<ul>
<li>opening arrival</li>
<li>gang underlings arguing with clinic staff</li>
<li>Bluewire pacing near a restricted corridor</li>
<li>Dr. Valez trying to keep everyone calm</li>
<li>first signal pulse</li>
<li>evacuation route planning</li>
<li>corporate recovery team making demands from the public street</li>
<li>civilians passing by and reacting to faction tension</li>
</ul>
<h2>Faction positioning</h2>
<h3>Clinic staff</h3>
<p>Use reception, triage, recovery rooms, and supply rooms.</p>
<p>Clinic underlings should be cooperative but stressed.</p>
<h3>Redline Choir</h3>
<p>Use the public street, side corridors, and maybe the area near the back entrance.</p>
<p>The gang should feel protective and possessive, but not automatically hostile.</p>
<h3>Corporate Recovery</h3>
<p>Keep them outside or at the edge at first:</p>
<ul>
<li>across the indoor street</li>
<li>near a service door</li>
<li>watching from a kiosk</li>
<li>using drones/cameras</li>
<li>threatening to enter through emergency access</li>
</ul>
<h2>Elevator and stair notes</h2>
<p>The elevator is the practical route for patients, stretchers, and NightCrash’s Gurney Angels.</p>
<p>The stair/ladderwell is emergency access: good for PCs, bad for stretchers.</p>
<p>If the stairs look too ladder-like on the image, describe them as a steep maintenance stairwell built into the megacomplex core.</p>
<h2>What happens on this map</h2>
<p>This is the main opening floor. Use it for first impressions, faction tension, clinic stakes, Bluewire, first corporate pressure, and early missing-person clues.</p>
<h3>Main active NPCs</h3>
<ul>
<li>Dr. Sera Valez — A5 Triage or A10 Records.</li>
<li>Nurse Cho — A3 Reception or A5 Triage.</li>
<li>Pax Ruun — A6 Emergency Intake.</li>
<li>Rafa Mbeki — A10 Records / clinic camera alcove.</li>
<li>Bluewire — A14 pacing route near A6/A7/A13.</li>
<li>Redline Lookout Pair or Mads — A1/A13.</li>
<li>Miri &amp; Sol — A4 if not placed on Floor B.</li>
<li>Corporate observer or Corp Recovery Pair — A1 edge, delayed.</li>
</ul>
<h3>Main scene beats</h3>
<ol>
<li>PCs arrive and see the clinic under pressure.</li>
<li>Staff ask for peacekeeping and patient protection.</li>
<li>Redline lookouts challenge who controls the relay.</li>
<li>Bluewire is visibly unstable but also a useful witness.</li>
<li>Corporate Recovery appears as legal/security pressure.</li>
<li>Early missing-person clues point away from the clinic and toward service infrastructure.</li>
</ol>
<h3>Map-specific clues</h3>
<ul>
<li>A3: staff mention rising no-show patients.</li>
<li>A4: children mention Auntie Red and Lala’s disappearance.</li>
<li>A6: Pax knows patient transfers and intake records do not line up.</li>
<li>A10: Rafa can access clinic feeds and door logs.</li>
<li>A13: Bex clue, service-route clue, low-angle struggle evidence.</li>
<li>A14: Bluewire heard clicking in the walls and says the walls have teeth.</li>
</ul>
<h3>Camera ownership</h3>
<ul>
<li>Public concourse: municipal/ad-network.</li>
<li>Clinic interior: clinic-owned, privacy-limited.</li>
<li>Service corridor: contested clinic/Redline.</li>
<li>Staff records: clinic restricted.</li>
<li>No Antithesis electronics interference; footage issues are human tampering, bad infrastructure, or missing coverage.</li>
</ul>
<h3>What this floor should establish</h3>
<ul>
<li>The relay matters politically.</li>
<li>The clinic is worth protecting.</li>
<li>Redline Choir are not just villains.</li>
<li>Corporate Recovery is not here to save people.</li>
<li>Something is wrong beyond the human cover-up, but that should still be subtle.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map Floor B Community Support",
    "source_file": "handouts/11_Map_Floor_B_Community_Support.md",
    "notes": "<h1>Map: Floor B — Community Support, Shelter, and School Annex</h1>
<h2>Function</h2>
<p>This floor shows the civilian support infrastructure tied to Mercy Twelve.</p>
<p>It is not just “extra rooms.” It explains why people care about the clinic and why the Redline Choir and Dr. Valez both see the place as politically important.</p>
<h2>What the map shows</h2>
<p>Key areas:</p>
<ul>
<li>indoor streets around the support center</li>
<li>public entrance</li>
<li>community commons</li>
<li>pantry / aid distribution point</li>
<li>cafeteria or communal kitchen</li>
<li>classroom / workshop room</li>
<li>children’s corner or daycare room</li>
<li>counselor / caseworker offices</li>
<li>dormitory / shelter sleeping area</li>
<li>secure back/service corridor</li>
<li>elevator core</li>
<li>emergency stair / ladderwell</li>
</ul>
<h2>Scenario use</h2>
<p>Good scenes here:</p>
<ul>
<li>players discover Mara secretly funds meals and school support</li>
<li>children recognize a PC or NightCrash brand</li>
<li>Keet gives information about the courier</li>
<li>civilians hide during the breach</li>
<li>gang members guard a food delivery</li>
<li>clinic staff ask PCs to help move patients or kids</li>
<li>social consequences become visible</li>
</ul>
<h2>Mara’s hidden support</h2>
<p>This is the best map for discovering that Mara “Mother Red” Vey is not just running a gang.</p>
<p>Possible clues:</p>
<ul>
<li>food crates that came through Redline Choir channels</li>
<li>school supplies paid for through anonymous street accounts</li>
<li>teachers who go quiet when Mara is mentioned</li>
<li>children who call her “Auntie Red”</li>
<li>a ledger showing meal packs, medicine, generator fuel, and teacher stipends</li>
</ul>
<p>This should not be public knowledge. If the PCs discover it respectfully, Mara becomes easier to negotiate with. If they expose it to mock her or weaken her image, she becomes angry.</p>
<h2>Civilian stakes</h2>
<p>Use this floor to make the mission about more than the relay.</p>
<p>If the PCs fail, these are the people who suffer:</p>
<ul>
<li>patients</li>
<li>schoolkids</li>
<li>volunteers</li>
<li>hungry families</li>
<li>night-shift workers</li>
<li>people with nowhere else to sleep</li>
</ul>
<h2>Elevator and stair notes</h2>
<p>The elevator can move food carts, stretchers, and evacuation groups.</p>
<p>The stair/ladderwell can move small groups but should be slower and more dangerous under panic conditions.</p>
<h2>What happens on this map</h2>
<p>This floor makes the neighborhood worth saving. Use it for schoolchildren, food aid, Mara’s hidden support network, missing-person reports, and civilian evacuation pressure.</p>
<h3>Main active NPCs</h3>
<ul>
<li>Miri &amp; Sol — B7 Children’s Corner.</li>
<li>Keet — B6 Classroom or B7 Children’s Corner.</li>
<li>Sister Luma — B9 Counselor Offices or B3 Commons.</li>
<li>Talla “Auntie’s Eyes” Vey — B3/B4.</li>
<li>Vex Tan — B4 Pantry or B10 Corridor.</li>
<li>Lala Mir clue marker — B10.</li>
<li>Narin Pell clue marker — B8/B12.</li>
<li>Mara — delayed, B4 or B10 if PCs dig into Redline aid.</li>
</ul>
<h3>Main scene beats</h3>
<ol>
<li>PCs see that Redline money and routes keep people fed.</li>
<li>Children reveal “Auntie Red” without understanding the political danger.</li>
<li>Lala’s disappearance connects food aid to service routes.</li>
<li>Narin’s disappearance shows official systems miss vulnerable people.</li>
<li>Civilians complicate any simple fight with corp or Redline forces.</li>
</ol>
<h3>Map-specific clues</h3>
<ul>
<li>B4: food supplies have Redline-adjacent routing.</li>
<li>B7: children know Lala and Auntie Red.</li>
<li>B8: Narin’s bag is still under the bunk.</li>
<li>B10: spilled meal crates and a damaged service hatch.</li>
<li>B12: organic smear / muffled scream clue.</li>
</ul>
<h3>Camera ownership</h3>
<ul>
<li>Public areas: community/municipal/ad-network.</li>
<li>Pantry/service corridor: Redline-influenced.</li>
<li>Children and shelter areas: restricted for privacy.</li>
<li>Counselor offices: no ordinary camera coverage; only door logs.</li>
</ul>
<h3>What this floor should establish</h3>
<ul>
<li>Mara’s power has a protective side.</li>
<li>Missing people are locals the system can ignore.</li>
<li>The missing-person trail is not random.</li>
<li>The nest is feeding on people with quiet routes and weak official protection.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map Floor C Service Utility",
    "source_file": "handouts/12_Map_Floor_C_Service_Utility.md",
    "notes": "<h1>Map: Floor C — Service, Utility, and Maintenance Floor</h1>
<h2>Function</h2>
<p>This floor is the megacomplex’s practical underside.</p>
<p>It contains the systems that keep Mercy Twelve and the surrounding district alive: power, air, water, cargo, repair, storage, and maintenance access.</p>
<p>It is more industrial than the clinic and shelter maps, but still part of the Hope//Punk environment. The people here keep the lights on.</p>
<h2>What the map shows</h2>
<p>Key areas:</p>
<ul>
<li>logistics/service street</li>
<li>central loading or distribution zone</li>
<li>generator or power room</li>
<li>battery banks</li>
<li>HVAC / air handling</li>
<li>water treatment or recycling</li>
<li>storage rooms</li>
<li>repair workshop</li>
<li>monitoring/security office</li>
<li>elevator core</li>
<li>emergency stair / ladderwell</li>
<li>suspicious side room or hidden service space</li>
</ul>
<h2>Scenario use</h2>
<p>Good scenes here:</p>
<ul>
<li>power failure caused by signal pulses</li>
<li>Grease Monkey or Scavenger gets useful spotlight</li>
<li>corp team tries to cut the clinic’s systems</li>
<li>gang uses maintenance routes to bypass public areas</li>
<li>players discover a hidden route between maps</li>
<li>alien contamination starts in the infrastructure</li>
<li>Bluewire’s implants react near power or signal conduits</li>
</ul>
<h2>Tactical role</h2>
<p>This floor is good for:</p>
<ul>
<li>stealth routes</li>
<li>chases</li>
<li>sabotage</li>
<li>repairs</li>
<li>ambushes</li>
<li>alternate access</li>
<li>restoring power</li>
<li>isolating the relay</li>
<li>moving unseen between public areas</li>
</ul>
<h2>Social role</h2>
<p>Do not make this floor empty. Maintenance workers, delivery crews, unofficial vendors, Redline Choir lookouts, and tired clinic staff may all use it.</p>
<p>It is a good place for non-faction passersby who are just trying to work.</p>
<h2>Elevator and stair notes</h2>
<p>The elevator is likely a cargo-capable lift here.</p>
<p>The stair/ladderwell is probably a steep maintenance access route. It can bypass shutdowns, but moving wounded people through it should require time, equipment, or checks.</p>
<h2>What happens on this map</h2>
<p>This is the primary hidden-nest investigation floor. Use it for missing-person trails, Model 3 clues, utility routes, surveillance rooms, and the second nest reveal.</p>
<h3>Main active NPCs and tokens</h3>
<ul>
<li>Oskar Venn clue marker — C6 HVAC.</li>
<li>Bex Aranda clue marker — C1/C9.</li>
<li>Juvenile Model 3 — C6, C5, C11, or C12.</li>
<li>Second Hidden Nest — C12 Hidden Maintenance Cavity by default.</li>
<li>Model 1 Seed Clump — inside or near the hidden nest.</li>
<li>Switch — C9 Monitoring or remote from B10.</li>
<li>Maintenance worker(s) — C2/C7/C9.</li>
<li>Corporate Drone / Corp Recovery Pair — C1/C10 if corp pushes service access.</li>
</ul>
<h3>Main scene beats</h3>
<ol>
<li>PCs follow missing-person evidence into the service floor.</li>
<li>Maintenance clues show something physical is moving through vents.</li>
<li>Cameras reveal low fast movement, but do not solve everything.</li>
<li>First Model 3 contact should involve dragging a victim, not a fair fight.</li>
<li>The hidden nest is found near ducts, moisture, and service cavities.</li>
</ol>
<h3>Map-specific clues</h3>
<ul>
<li>C1: missing-person routes cluster around service access.</li>
<li>C5: organic film and fused small animals.</li>
<li>C6: Oskar’s tool cart, warm vent, drag marks, breathing radio log.</li>
<li>C7: improvised vent locks and repair tools.</li>
<li>C9: camera frame of Bex/Oskar being dragged.</li>
<li>C11: organic smear along stairs.</li>
<li>C12: hidden maintenance cavity, Model 1 seed clump, second nest.</li>
</ul>
<h3>Camera ownership</h3>
<ul>
<li>General utility feeds: maintenance/municipal.</li>
<li>Some old service cameras: Redline-accessible.</li>
<li>Freight and service routes: possibly corporate-compromised.</li>
<li>Monitoring Office: contested.</li>
<li>Footage problems are human tampering or poor coverage, not alien hacking.</li>
</ul>
<h3>What this floor should establish</h3>
<ul>
<li>The second nest is real.</li>
<li>The corp does not know the full current threat.</li>
<li>Juvenile Model 3s are gathering biomass.</li>
<li>Missing people are the growth mechanism.</li>
<li>The human factions must stop fighting or civilians will be harvested.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map Floor D Quarantine Incident",
    "source_file": "handouts/13_Map_Floor_D_Quarantine_Incident.md",
    "notes": "<h1>Map: Floor D — Quarantine, Incident Floor, and Landing Corner</h1>
<h2>Function</h2>
<p>This is the likely alien breach / finale map.</p>
<p>It combines a medical-research or quarantine annex with indoor megacomplex access and a small landing corner where flying vehicles can arrive.</p>
<h2>What the map shows</h2>
<p>Key areas:</p>
<ul>
<li>quarantine / containment section</li>
<li>diagnostics or lab section</li>
<li>control room</li>
<li>patient or holding rooms</li>
<li>wide central hall</li>
<li>side corridors and bypass routes</li>
<li>back/service entry</li>
<li>elevator core</li>
<li>emergency stair / ladderwell</li>
<li>small roof or open-air-feeling landing corner</li>
<li>marked landing spot for a flying vehicle or emergency craft</li>
</ul>
<h2>Why there is a landing corner</h2>
<p>Most of the megacomplex is indoors, but large complexes still need emergency access.</p>
<p>The landing corner is a small exposed or semi-exposed rooftop/skywell pad: enough for a flying vehicle or rapid-response craft to touch down, not a whole outdoor map.</p>
<p>Use it for:</p>
<ul>
<li>NightCrash’s arrival</li>
<li>medevac extraction</li>
<li>corporate drone access</li>
<li>emergency supply drop</li>
<li>final escape under pressure</li>
</ul>
<h2>NightCrash use</h2>
<p>If the PCs are overwhelmed, NightCrash can arrive here.</p>
<p>She should not solve the scenario. She creates one opening:</p>
<ul>
<li>evacuates endangered civilians</li>
<li>stabilizes a dying PC or NPC</li>
<li>blocks one alien push</li>
<li>identifies the breach point</li>
<li>gives the PCs one clear tactical instruction</li>
</ul>
<p>Then she gets a larger emergency call and must leave.</p>
<p>If the PCs solve the crisis themselves, she may arrive after the danger has passed and welcome them as newly awakened Samurai.</p>
<h2>Alien breach options</h2>
<p>Possible breach locations:</p>
<ul>
<li>containment chamber</li>
<li>diagnostics room</li>
<li>central hall</li>
<li>patient holding room</li>
<li>elevator shaft</li>
<li>landing corner</li>
<li>service corridor</li>
</ul>
<p>The best breach point depends on the player choices.</p>
<p>If they isolated the relay well, the breach starts contained.</p>
<p>If they delayed too long, the breach starts in the central hall.</p>
<p>If they used the elevator carelessly, the breach can travel between floors.</p>
<h2>Human faction behavior</h2>
<p>NightCrash avoids fighting humans except non-lethally.</p>
<p>Human factions should still be negotiable or at least redirectable even during the breach.</p>
<p>Examples:</p>
<ul>
<li>corp personnel may help contain the breach if convinced it is worse than the data leak</li>
<li>Redline Choir may help evacuate civilians if respected earlier</li>
<li>clinic staff may guide PCs through locked areas if trusted</li>
<li>frightened civilians may block corridors unless calmed</li>
</ul>
<h2>Elevator and stair notes</h2>
<p>The elevator is useful but dangerous here. It may carry contamination or panic between floors.</p>
<p>The stair/ladderwell is a fallback route. It may look narrow or steep because this is a megacomplex emergency access shaft, not a comfortable public staircase.</p>
<h2>What happens on this map</h2>
<p>This floor holds the old corporate crime scene: the first nest, cleanup records, exposure-trial data, and the clue that Model 1s relocated. It is not the default current nest location.</p>
<h3>Main active NPCs and tokens</h3>
<ul>
<li>Halden Rook evidence marker — D6 logs.</li>
<li>Old Nest Remains — D8.</li>
<li>Model 1 escape-vector marker — D9.</li>
<li>Commander Rusk or Lt. Senn — delayed, if corp confrontation moves here.</li>
<li>Corporate cleanup records — D5/D6.</li>
<li>NightCrash / Siren Saint — D1 if emergency rescue occurs.</li>
</ul>
<h3>Main scene beats</h3>
<ol>
<li>PCs learn the corporation created the first nest through illegal bio-research.</li>
<li>Records show researchers and staff were consumed as biomass.</li>
<li>Cleanup footage shows Model 1s escaping in formation.</li>
<li>Halden Rook flagged nest-seeding risk.</li>
<li>Corporate reports buried this as terminal erratic flight.</li>
</ol>
<h3>Map-specific clues</h3>
<ul>
<li>D3: professional sterilization damage.</li>
<li>D5: exposure-treatment records and patient trial data.</li>
<li>D6: cleanup footage, Halden warning, deleted risk tags.</li>
<li>D8: destroyed first nest and researcher biomass evidence.</li>
<li>D9: Model 1 escape route toward service levels.</li>
<li>D10: edited freight/elevator transport records.</li>
</ul>
<h3>Camera ownership</h3>
<ul>
<li>Restricted clinic/corporate hybrid.</li>
<li>Corporate edits are common.</li>
<li>Emergency systems may have lockdown logic.</li>
<li>Landing corner has emergency/sponsor feeds if NightCrash arrives.</li>
</ul>
<h3>What this floor should establish</h3>
<ul>
<li>The corp caused the original disaster.</li>
<li>The first nest was nearly destroyed.</li>
<li>The corp thought the cleanup succeeded.</li>
<li>Someone inside the corp warned about Model 1 relocation.</li>
<li>The current threat points back toward Map C.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map A Clinic Key",
    "source_file": "handouts/14_Map_A_Clinic_Key.md",
    "notes": "<h1>Map A — Mercy Twelve Clinic and Indoor Street Key</h1>
<p>Use this key for the primary clinic floor. The purpose of these prompts is not to hide mandatory clues behind single checks, but to encourage players to interact with the environment using many different skills.</p>
<p>For a starter session, give the basic clue freely if the players investigate the right thing. Rolls should improve detail, reveal leverage, reduce danger, or create an advantage.</p>
<h2>How to use these checks</h2>
<p>These are prompts, not a fixed menu. If a player describes a sensible approach, use the closest skill or Background logic.</p>
<p>Recommended clue handling:</p>
<ul>
<li><strong>No roll / basic interaction:</strong> give the obvious clue.</li>
<li><strong>Success:</strong> give useful detail, leverage, or a safer route.</li>
<li><strong>High success:</strong> give a shortcut, future advantage, or a way to reduce danger.</li>
<li><strong>Failure:</strong> do not stall the scenario; give the clue with less detail, extra time cost, noise, or complication.</li>
</ul>
<h2>A1. Indoor Street / Public Concourse</h2>
<p><strong>Read-aloud:</strong></p>
<p>A broad indoor street runs past Mercy Twelve: benches, planters, food kiosks, flickering ad-panels, and pedestrians who pretend not to stare at the clinic doors.</p>
<p><strong>GM notes:</strong></p>
<p>This is public space. Gang lookouts, clinic volunteers, corporate watchers, and ordinary megacomplex residents can all plausibly be here.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Streetwise / Local Knowledge:</strong> Identify who belongs here and who is pretending to belong.</li>
<li><strong>Awareness:</strong> Spot a corporate observer using a kiosk reflection instead of looking directly.</li>
<li><strong>Performance:</strong> Draw a crowd, calm a crowd, or make public escalation costly.</li>
<li><strong>Small Arms:</strong> Notice several bystanders are carrying cheap concealed pistols badly, more fear than intent.</li>
<li><strong>Bounty Hunter / Tracking:</strong> Pick out the same courier-route scuff marks leading toward the clinic entrance.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The clinic is watched from several directions.</li>
<li>Most locals want the clinic left alone.</li>
<li>Public violence here will have social consequences.</li>
</ul>
<h2>A2. Public Front Entrance</h2>
<p><strong>Read-aloud:</strong></p>
<p>Double glass doors open into the public clinic side. The doors are reinforced, but covered in old stickers, children’s drawings, and hand-written notices.</p>
<p><strong>GM notes:</strong></p>
<p>This is the normal civilian route. It is not designed for emergency gurney traffic.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Corporate Security:</strong> Recognize that the entrance is hard to storm cleanly but easy to intimidate.</li>
<li><strong>Grease Monkey / Repair:</strong> Spot that the door motors have been repaired with off-brand parts.</li>
<li><strong>Social / Empathy:</strong> Read the volunteer at the door as exhausted, not hostile.</li>
<li><strong>Mesh Hacker:</strong> Notice the door access log has a six-minute gap from earlier tonight.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The courier did not arrive through the public entrance.</li>
<li>Someone has been tampering with access logs.</li>
<li>The door can be locked down, but that may trap civilians.</li>
</ul>
<h2>A3. Reception and Waiting Area</h2>
<p><strong>Read-aloud:</strong></p>
<p>The waiting area is crowded, tense, and too bright. Patients sit beside gang lookouts, tired parents, and people who clearly came here because there was nowhere else to go.</p>
<p><strong>GM notes:</strong></p>
<p>This is the first social pressure cooker. Bluewire may pass through, but should not start here unless the GM wants immediate escalation.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Psychology / Empathy:</strong> Separate fear, pain, anger, and loyalty in the crowd.</li>
<li><strong>Performance:</strong> Distract the waiting room long enough for staff to move patients.</li>
<li><strong>Medicine:</strong> Identify which patients are urgent and which are frightened but stable.</li>
<li><strong>Blades / Melee Combat:</strong> Notice who is posturing for intimidation and who is actually ready to lunge.</li>
<li><strong>Religious / Community angle:</strong> Comfort someone who thinks the signal pulse was a bad omen.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The crowd can become an obstacle or an ally.</li>
<li>Positive, direct reassurance works better here than threats.</li>
<li>Several people know rumors about Mara’s hidden support, but will not volunteer them casually.</li>
</ul>
<h2>A4. Pediatric / Community Corner</h2>
<p><strong>Read-aloud:</strong></p>
<p>A bright corner of soft mats, worn toys, wall murals, cheap tablets, and half-finished homework. It is painfully out of place beside armed adults.</p>
<p><strong>GM notes:</strong></p>
<p>Use this to underline stakes. Keet or another young witness can be found here.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Student Dropout / Education:</strong> Notice the lesson material is current despite the neighborhood’s poverty.</li>
<li><strong>Piss-Poor Artist / Performance:</strong> Read the murals as community-made, with hidden initials from local kids.</li>
<li><strong>Investigation:</strong> Find signs that a child saw the courier arrive from an unexpected direction.</li>
<li><strong>Social / Empathy:</strong> Get a child to explain what adults refuse to say.</li>
<li><strong>Small Arms:</strong> Notice someone deliberately chose not to fire toward this corner earlier.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The community support is organized, not accidental.</li>
<li>Mara’s people may have supplied school materials.</li>
<li>Children saw more of the courier incident than adults realize.</li>
</ul>
<h2>A5. Triage Desk</h2>
<p><strong>Read-aloud:</strong></p>
<p>A curved desk forms the clinic’s nerve center: patient slates, scanner feeds, cheap coffee, half-empty medfoam canisters, and staff who have not slept enough.</p>
<p><strong>GM notes:</strong></p>
<p>Dr. Valez or a senior nurse can appear here. This is a good place for PCs to earn trust quickly.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Prioritize patients and win staff confidence.</li>
<li><strong>Cyberware / Mesh:</strong> Notice local devices pulse in sync with the relay.</li>
<li><strong>Corporate Security:</strong> Recognize the desk has no defense against a formal corporate seizure order.</li>
<li><strong>Persuasion:</strong> Convince staff to share restricted information.</li>
<li><strong>Grease Monkey:</strong> Notice power dips are coming from deeper infrastructure, not just bad wiring.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The relay is interfering with patient devices.</li>
<li>Staff are hiding details to prevent panic.</li>
<li>The clinic needs help more than it needs muscle.</li>
</ul>
<h2>A6. Emergency Intake Bay</h2>
<p><strong>Read-aloud:</strong></p>
<p>The non-public emergency bay smells of disinfectant, hot battery cells, and old panic. A vehicle bay connects directly to trauma access.</p>
<p><strong>GM notes:</strong></p>
<p>This is how patients should arrive by ambulance or stretcher. The courier did not use this route.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine / Surgery:</strong> Confirm the bay is prepared for trauma work, not routine intake.</li>
<li><strong>Small Arms:</strong> Identify low-caliber warning-shot damage near the outer shutter.</li>
<li><strong>Big Guns:</strong> Recognize the shutters are reinforced against breaching weapons.</li>
<li><strong>Mesh Hacker:</strong> Recover partial intake logs or notice deleted camera metadata.</li>
<li><strong>Grease Monkey:</strong> Spot that the parked emergency vehicle battery was drained recently.</li>
<li><strong>Streetwise:</strong> Know this entrance is watched by both clinic volunteers and Redline Choir lookouts.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The courier arrived from inside the megacomplex, not by ambulance.</li>
<li>The emergency bay cameras were looped.</li>
<li>The bay is the best route for evacuating critical patients.</li>
</ul>
<h2>A7. Trauma / Surgery Rooms</h2>
<p><strong>Read-aloud:</strong></p>
<p>Bright surgical light pools over clean tables, patched machines, bundled cables, and carefully rationed sterile supplies.</p>
<p><strong>GM notes:</strong></p>
<p>This is where the relay-exposed patient or courier may be treated. It should feel precious and vulnerable.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Surgery:</strong> Understand what treatment is possible and what resources are missing.</li>
<li><strong>Cyber-Junkie / Cyberware:</strong> Feel that the signal is irritating implants and medical devices.</li>
<li><strong>Investigation:</strong> Notice someone moved a critical device recently and cleaned poorly afterward.</li>
<li><strong>Blades:</strong> Read defensive cuts or close-quarters trauma on a patient.</li>
<li><strong>Rogue Surgeon:</strong> Identify illegal but effective emergency modifications in the equipment.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The relay is medically dangerous.</li>
<li>Someone tried to hide how bad the exposure symptoms are.</li>
<li>The clinic can stabilize people, but not fight a prolonged breach here.</li>
</ul>
<h2>A8. Pharmacy and Supply</h2>
<p><strong>Read-aloud:</strong></p>
<p>Locked shelves hold antibiotics, painkillers, medfoam, cheap nutrition packs, and labeled boxes whose labels do not match the contents.</p>
<p><strong>GM notes:</strong></p>
<p>This room can reveal Mara’s covert support and also tempt desperate characters.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Identify which supplies are lifesaving and which are merely valuable.</li>
<li><strong>Streetwise:</strong> Recognize Redline Choir smuggling marks on supposedly anonymous crates.</li>
<li><strong>Investigation:</strong> Find a hidden ledger of food, medicine, and school supply deliveries.</li>
<li><strong>Sleight / Cat Burglar angle:</strong> Open a cabinet without triggering staff alarms.</li>
<li><strong>Social:</strong> Convince a volunteer to admit who paid for recent stock.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Mara has been quietly funding medicine and food.</li>
<li>The clinic is one supply disruption away from collapse.</li>
<li>Exposing Mara’s good works publicly may damage her protective image.</li>
</ul>
<h2>A9. Recovery Wing</h2>
<p><strong>Read-aloud:</strong></p>
<p>Small resting rooms line a quieter corridor: beds, thin blankets, privacy curtains, small plants, and monitors running at minimum power.</p>
<p><strong>GM notes:</strong></p>
<p>This is where civilian vulnerability is most visible. Do not route all movement through reception; staff need internal corridors to bring patients here from trauma.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Notice which patients cannot be moved quickly.</li>
<li><strong>Empathy:</strong> Calm a patient enough to describe strange symptoms.</li>
<li><strong>Awareness:</strong> Spot that one recovery room has been watched from the corridor.</li>
<li><strong>Piloting / Logistics:</strong> Plan an evacuation path using elevators and wide corridors.</li>
<li><strong>Athletics:</strong> Move a patient safely under time pressure without a proper gurney.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Evacuation will be difficult if the elevator locks down.</li>
<li>Some patients are already reacting to the signal.</li>
<li>The recovery wing gives players a reason not to let fighting spill into the clinic.</li>
</ul>
<h2>A10. Staff Office / Records</h2>
<p><strong>Read-aloud:</strong></p>
<p>A cramped office of battered filing cabinets, cheap terminals, mugs, old protest posters, and a locked drawer everyone pretends not to notice.</p>
<p><strong>GM notes:</strong></p>
<p>Use this for deeper investigation, corp records, deleted logs, or proof of the clinic/gang relationship.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Mesh Hacker:</strong> Recover deleted access logs.</li>
<li><strong>Corporate Security:</strong> Recognize the format of a corporate seizure notice before it is officially served.</li>
<li><strong>Investigation:</strong> Find mismatched patient records connected to the relay.</li>
<li><strong>Persuasion:</strong> Convince staff to reveal what Dr. Valez is withholding.</li>
<li><strong>Forgery / Admin:</strong> Create a temporary record that buys time against corp recovery.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The corp has legal pretext prepared.</li>
<li>The relay case predates tonight.</li>
<li>The clinic is trying to verify the evidence, not hide it forever.</li>
</ul>
<h2>A11. Elevator Core</h2>
<p><strong>Read-aloud:</strong></p>
<p>A heavy elevator core hums behind teal-lit doors. It is large enough for beds, carts, and evac drones.</p>
<p><strong>GM notes:</strong></p>
<p>This is the safe vertical route. It is also hackable, lockable, and vulnerable to signal interference.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Diagnose power strain and prevent a stall.</li>
<li><strong>Mesh Hacker:</strong> Override floor access or detect a remote lockout.</li>
<li><strong>Corporate Security:</strong> Predict how recovery teams would seize elevator control.</li>
<li><strong>Piloting / Logistics:</strong> Coordinate patient movement under pressure.</li>
<li><strong>Big Guns:</strong> Recognize why this is a bad place to be trapped if enemies breach doors.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The elevator can connect all active maps.</li>
<li>If corrupted, it can spread danger between floors.</li>
<li>It is the best route for the Gurney Angels.</li>
</ul>
<h2>A12. Emergency Stair / Ladderwell</h2>
<p><strong>Read-aloud:</strong></p>
<p>A narrow vertical access shaft holds steep metal stairs, ladder-sections, and emergency lighting that flickers with every signal pulse.</p>
<p><strong>GM notes:</strong></p>
<p>If the map art looks ladder-like, describe this as a compact megacomplex stair/ladderwell. Good for PCs, bad for stretchers.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Parkour / Athletics:</strong> Move quickly without slipping or blocking others.</li>
<li><strong>Stealth:</strong> Use the shaft to bypass public areas.</li>
<li><strong>Grease Monkey:</strong> Notice old maintenance access panels along the shaft.</li>
<li><strong>Melee Combat:</strong> Understand how bad a fight here would be.</li>
<li><strong>Gutter Rat / Scavenger:</strong> Know which landings connect to unofficial routes.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This is a bypass if the elevator is locked.</li>
<li>Moving wounded civilians here is slow and risky.</li>
<li>A chase can move vertically through this shaft.</li>
</ul>
<h2>A13. Service Corridor</h2>
<p><strong>Read-aloud:</strong></p>
<p>A narrow back corridor links supply, staff, maintenance, and emergency access without crossing the waiting room.</p>
<p><strong>GM notes:</strong></p>
<p>This is important for logical hospital movement. It is also a quiet place for tense confrontations.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Awareness:</strong> Hear voices before opening the next door.</li>
<li><strong>Small Arms:</strong> Identify the best defensive angles without firing.</li>
<li><strong>Streetwise:</strong> Recognize Redline Choir movement patterns.</li>
<li><strong>Corporate Security:</strong> Spot where a recovery team would stack up before breach.</li>
<li><strong>Medicine:</strong> Plan a patient route from trauma to recovery.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Staff can move patients internally.</li>
<li>Gang and corp factions both want control of this corridor.</li>
<li>It can become the main evacuation route.</li>
</ul>
<h2>A14. Bluewire’s Pacing Route</h2>
<p><strong>Read-aloud:</strong></p>
<p>The floor near one corridor junction is scuffed by repeated boot turns. Someone has been pacing there hard enough to leave marks.</p>
<p><strong>GM notes:</strong></p>
<p>This is a mobile keyed location. Place it where Bluewire has been spiraling near the restricted or emergency area.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Psychology:</strong> Read agitation, fear, and overstimulation from the pacing pattern.</li>
<li><strong>Medicine:</strong> Connect sweating, tremor, and pain to withdrawal or opioid dependence.</li>
<li><strong>Cyberware:</strong> Notice his ware is running hot and reacting to signal pulses.</li>
<li><strong>Melee Combat:</strong> Predict that he is more likely to lunge than aim carefully.</li>
<li><strong>Positive social approach:</strong> Use his name and give him a face-saving task; this should matter more than clever diagnosis alone.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Bluewire is obvious to read; this is not a hidden mystery.</li>
<li>Difficulty should be low: 8 to notice serious distress, 10 to identify likely dependence/cyber-strain.</li>
<li>Encouragement and respect can have a huge stabilizing effect.</li>
</ul>
<h2>Updated biological-nest clues for Map A</h2>
<p>Use Map A mostly for human pressure and early missing-person signs.</p>
<h3>A3 Reception and Waiting Area</h3>
<ul>
<li>A worried patient asks why so many maintenance workers and volunteers have stopped showing up.</li>
<li>Medicine or Empathy can reveal that clinic staff are tracking no-show patients, but the pattern is being dismissed as poverty, fear, or gang trouble.</li>
<li>A frightened civilian mentions something scratching behind the vents but is embarrassed to say it.</li>
</ul>
<h3>A4 Pediatric / Community Corner</h3>
<p>Add <strong>Miri and Sol</strong> here if not using them on Map B.</p>
<p>Overheard conversation:</p>
<p>&gt; “Auntie Red paid for breakfast again.” &gt; &gt; “Don’t call her that where grown-ups hear.” &gt; &gt; “Why?” &gt; &gt; “Because she gets mad when people know she’s nice.”</p>
<p>Additional clue:</p>
<ul>
<li>One child says Lala Mir used to bring food through the back corridor, but has not come back.</li>
<li>If asked gently, the child adds: “There was a dog sound in the wall. Not a dog.”</li>
</ul>
<h3>A6 Emergency Intake Bay</h3>
<ul>
<li>A patient transfer record references an exposure-treatment patient moved under false paperwork.</li>
<li>Pax Ruun recognizes a supposedly discharged patient from the relay files.</li>
<li>Camera footage does not show Antithesis here yet; instead it shows missing records and suspicious transfers.</li>
</ul>
<h3>A13 Service Corridor</h3>
<ul>
<li>Bex Aranda’s dropped token, knife, or bloodless scrape mark may be found here.</li>
<li>Tracking / Bounty Hunter can identify drag direction toward service infrastructure.</li>
<li>Small Arms can identify that shots were fired low and panicked, not at human height.</li>
</ul>
<h3>A14 Bluewire’s Pacing Route</h3>
<ul>
<li>Bluewire says the walls have teeth.</li>
<li>He has heard wet clicking near service routes.</li>
<li>He is not alien-controlled. His distress is opioids, cyber-strain, trauma, and possibly illegal treatment side effects.</li>
<li>Treating him as a person may make him a useful witness rather than a fight.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map B Community Support Key",
    "source_file": "handouts/15_Map_B_Community_Support_Key.md",
    "notes": "<h1>Map B — Community Support, Shelter, and School Annex Key</h1>
<p>Use this floor to make the civilian stakes concrete. It is where the PCs can discover why the clinic matters and why Mara protects the neighborhood in ways that do not look like ordinary gang activity.</p>
<h2>How to use these checks</h2>
<p>These are prompts, not a fixed menu. If a player describes a sensible approach, use the closest skill or Background logic.</p>
<p>Recommended clue handling:</p>
<ul>
<li><strong>No roll / basic interaction:</strong> give the obvious clue.</li>
<li><strong>Success:</strong> give useful detail, leverage, or a safer route.</li>
<li><strong>High success:</strong> give a shortcut, future advantage, or a way to reduce danger.</li>
<li><strong>Failure:</strong> do not stall the scenario; give the clue with less detail, extra time cost, noise, or complication.</li>
</ul>
<h2>B1. Indoor Street / Neighborhood Walkway</h2>
<p><strong>Read-aloud:</strong></p>
<p>This indoor street is less clinical and more lived-in: food smells, tired families, cheap kiosks, planters, and people using the megacomplex like a neighborhood square.</p>
<p><strong>GM notes:</strong></p>
<p>This is a place for non-faction civilians, rumor gathering, and public consequences.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Streetwise:</strong> Identify who is Redline Choir, who is clinic-adjacent, and who is just surviving.</li>
<li><strong>Performance:</strong> Spread a calming message or draw attention away from frightened kids.</li>
<li><strong>Awareness:</strong> Spot a watcher using a storefront reflection.</li>
<li><strong>Gambler / Social read:</strong> Notice who is bluffing about being uninvolved.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The neighborhood is watching what the PCs do.</li>
<li>People here fear both the corp and uncontrolled gang violence.</li>
</ul>
<h2>B2. Public Entrance / Welcome Desk</h2>
<p><strong>Read-aloud:</strong></p>
<p>A desk patched from three different furniture sets guards the entrance. It is covered with sign-in slates, donated stickers, and a hand sanitizer dispenser that wheezes.</p>
<p><strong>GM notes:</strong></p>
<p>Staff here are easier to talk to than gang underlings. They know practical things.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Persuasion:</strong> Get a volunteer to tell the PCs who has been asking about the relay.</li>
<li><strong>Medicine:</strong> Notice staff are doing informal triage for more than illness: hunger, panic, shock.</li>
<li><strong>Investigation:</strong> Find a sign-in gap that matches the courier’s arrival time.</li>
<li><strong>Student Dropout:</strong> Recognize the school program is better organized than expected.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Keet may be found or referenced here.</li>
<li>The support center is partly funded through unofficial channels.</li>
</ul>
<h2>B3. Community Commons</h2>
<p><strong>Read-aloud:</strong></p>
<p>The open commons is a patchwork of tables, planters, old couches, public terminals, charging points, and murals bright enough to feel defiant.</p>
<p><strong>GM notes:</strong></p>
<p>This is a good social scene space. It can become an evacuation staging area.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Performance:</strong> Calm or organize a crowd.</li>
<li><strong>Leadership / Tactics:</strong> Set up evacuation lanes and crowd control.</li>
<li><strong>Empathy:</strong> Recognize who is scared of the gang and who trusts them.</li>
<li><strong>Piss-Poor Artist:</strong> Interpret mural tags showing who contributed supplies.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The community is not passive.</li>
<li>People may help if asked respectfully and given specific tasks.</li>
</ul>
<h2>B4. Pantry / Aid Distribution</h2>
<p><strong>Read-aloud:</strong></p>
<p>Shelves of ration packs, meal crates, electrolyte bottles, school snacks, and medicine-adjacent supplies are stacked behind a half-height counter.</p>
<p><strong>GM notes:</strong></p>
<p>One of the best places to discover Mara’s covert support.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Investigation:</strong> Find delivery tags routed through Redline Choir cutouts.</li>
<li><strong>Streetwise:</strong> Recognize smuggling marks used for food rather than weapons.</li>
<li><strong>Medicine:</strong> Identify supplies bought for chronic illness and malnutrition.</li>
<li><strong>Corporate Security:</strong> Notice the inventory has been anonymized to avoid seizure.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Mara funds food and medicine.</li>
<li>The aid program could be shut down if publicly exposed or seized.</li>
</ul>
<h2>B5. Communal Kitchen / Cafeteria</h2>
<p><strong>Read-aloud:</strong></p>
<p>A narrow kitchen opens into a simple eating area. The equipment is old but clean, and everything smells of rice, soup base, and recycled heat.</p>
<p><strong>GM notes:</strong></p>
<p>Good place for warm human interactions and overheard clues.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Cooking / Survival / Scavenger:</strong> Notice how efficiently scarce supplies are stretched.</li>
<li><strong>Social / Empathy:</strong> Get a kitchen volunteer to open up while helping.</li>
<li><strong>Grease Monkey:</strong> Keep the failing heater or food printer running.</li>
<li><strong>Small Arms:</strong> Notice a gang guard has unloaded their weapon before entering.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The gang respects this space more than they admit.</li>
<li>A volunteer saw Bluewire shaking earlier.</li>
</ul>
<h2>B6. Classroom / Workshop</h2>
<p><strong>Read-aloud:</strong></p>
<p>Rows of desks share space with toolkits, cheap tablets, broken drone parts, and a board covered in diagrams that mix homework with survival math.</p>
<p><strong>GM notes:</strong></p>
<p>This can spotlight Student Dropout, Grease Monkey, Mesh Hacker, Artist, or Rocker backgrounds.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Teaching / Student Dropout:</strong> Connect with students and get honest information.</li>
<li><strong>Grease Monkey:</strong> Recognize student-built sensor boxes tracking signal pulses.</li>
<li><strong>Mesh Hacker:</strong> Access a student mesh node that saw the courier pass.</li>
<li><strong>Performance:</strong> Turn fear into focus with a song, joke, or story.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Kids detected signal anomalies before adults did.</li>
<li>Keet may have saved a local copy of useful data.</li>
</ul>
<h2>B7. Children’s Corner / Daycare</h2>
<p><strong>Read-aloud:</strong></p>
<p>Foam mats, soft seats, battered toys, and bright murals try very hard to pretend the megacomplex is gentle.</p>
<p><strong>GM notes:</strong></p>
<p>Use this to humanize stakes, not to threaten children cheaply.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Empathy:</strong> Learn what a child saw without frightening them.</li>
<li><strong>Performance:</strong> Distract children during evacuation.</li>
<li><strong>Awareness:</strong> Spot that a toy drone is recording more than playtime.</li>
<li><strong>Religious / Comfort:</strong> Help a frightened family without preaching at them.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Children call Mara 'Auntie Red' if they trust the PCs.</li>
<li>They noticed Bluewire was 'sick-mad' before adults acted.</li>
</ul>
<h2>B8. Shelter Dorm</h2>
<p><strong>Read-aloud:</strong></p>
<p>Bunks and fold-out beds line the room. Bags are tucked beneath them with the careful order of people who cannot afford to lose anything.</p>
<p><strong>GM notes:</strong></p>
<p>Good for evacuation complications and moral weight.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Identify who cannot be moved quickly.</li>
<li><strong>Athletics:</strong> Carry supplies or help people move without panic.</li>
<li><strong>Streetwise:</strong> Spot which beds belong to people avoiding gang or corp attention.</li>
<li><strong>Investigation:</strong> Find a hidden witness who does not trust official questions.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Some residents saw corp scouts before tonight.</li>
<li>The shelter depends on unofficial protection.</li>
</ul>
<h2>B9. Counselor / Caseworker Offices</h2>
<p><strong>Read-aloud:</strong></p>
<p>Tiny offices hold privacy screens, old chairs, therapy toys, hardcopy forms, and emergency contact lists that are almost certainly illegal to keep.</p>
<p><strong>GM notes:</strong></p>
<p>This area supports psychology and social investigation.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Psychology:</strong> Understand Bluewire’s behavior from prior incident notes.</li>
<li><strong>Investigation:</strong> Find patterns in people harmed by the same corporation.</li>
<li><strong>Persuasion:</strong> Earn enough trust to see sensitive records.</li>
<li><strong>Corporate Security:</strong> Know which records would be targeted in a raid.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Bluewire has been treated here before.</li>
<li>Dr. Valez and Mara have both kept people alive through unofficial channels.</li>
</ul>
<h2>B10. Back Service Corridor</h2>
<p><strong>Read-aloud:</strong></p>
<p>A narrow corridor behind the public rooms carries carts, laundry, food crates, and people who do not want to be seen entering from the front.</p>
<p><strong>GM notes:</strong></p>
<p>Use for stealth, secret deliveries, and chase routes.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Stealth:</strong> Move unseen between support rooms.</li>
<li><strong>Bounty Hunter / Tracking:</strong> Follow courier or gang movement traces.</li>
<li><strong>Blades:</strong> Notice scrape marks from a concealed knife fight that did not become public.</li>
<li><strong>Scavenger:</strong> Find a useful shortcut through old service panels.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Redline Choir supply deliveries use this route.</li>
<li>It can become an evacuation bypass.</li>
</ul>
<h2>B11. Elevator Core</h2>
<p><strong>Read-aloud:</strong></p>
<p>The lift doors are scuffed by carts, beds, and crates. Someone has taped a child’s drawing above the call panel.</p>
<p><strong>GM notes:</strong></p>
<p>Accessible vertical travel. Also a panic bottleneck.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Logistics / Piloting:</strong> Plan evacuation timing.</li>
<li><strong>Mesh Hacker:</strong> Prevent hostile floor lockout.</li>
<li><strong>Grease Monkey:</strong> Keep the lift stable under overload.</li>
<li><strong>Performance:</strong> Manage the crowd waiting for the lift.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This is the only good route for shelter residents with mobility issues.</li>
<li>If the lift fails, the shelter becomes much harder to evacuate.</li>
</ul>
<h2>B12. Emergency Stair / Ladderwell</h2>
<p><strong>Read-aloud:</strong></p>
<p>The stairwell is narrow, steep, and practical rather than welcoming. Emergency strips glow along metal edges.</p>
<p><strong>GM notes:</strong></p>
<p>Good for PCs and small groups. Bad for panic evacuation.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Parkour / Athletics:</strong> Move quickly under pressure.</li>
<li><strong>Tactics:</strong> Use it as a choke point.</li>
<li><strong>Gutter Rat:</strong> Know which landing bypasses the monitored hallway.</li>
<li><strong>Melee Combat:</strong> Recognize how dangerous a fight here would be.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This route can save the PCs if elevators are locked.</li>
<li>It cannot replace the elevator for mass evacuation.</li>
</ul>
<h2>Updated missing-person clues for Map B</h2>
<p>Use Map B to make the missing people matter.</p>
<h3>B4 Pantry / Aid Distribution</h3>
<ul>
<li>Lala Mir used to distribute meal crates here.</li>
<li>Her absence is immediately noticed by volunteers and children.</li>
<li>Streetwise or Investigation reveals that her last route used the back service corridor.</li>
<li>The crates she carried were food, not weapons. This supports the Mara/Auntie Red reveal.</li>
</ul>
<h3>B7 Children’s Corner / Daycare</h3>
<p>Add <strong>Miri and Sol</strong> here.</p>
<p>They can reveal:</p>
<ul>
<li>“Auntie Red” funds breakfast.</li>
<li>Adults avoid saying that name because Mara dislikes looking soft.</li>
<li>Lala Mir disappeared after bringing food.</li>
<li>They heard “dog feet” or “the wall dog” near the service corridor.</li>
</ul>
<h3>B8 Shelter Dorm</h3>
<ul>
<li>Narin Pell’s bag is still under the bunk.</li>
<li>Sister Luma insists Narin would not have left it.</li>
<li>A search finds an organic smear or torn cloth near the route to B12.</li>
<li>This is a possible rescue timer: if PCs act quickly, Narin may still be alive near the hidden nest.</li>
</ul>
<h3>B10 Back Service Corridor</h3>
<ul>
<li>Lala’s spilled meal crate.</li>
<li>Torn food packets, not eaten normally.</li>
<li>A service hatch with acid-scored screws.</li>
<li>Redline marks showing this is an aid route, not just a gang route.</li>
<li>Tracking can follow drag signs toward Map C.</li>
</ul>
<h3>B12 Emergency Stair / Ladderwell</h3>
<ul>
<li>Organic smear near a landing.</li>
<li>A muffled scream was heard earlier but dismissed as a fight.</li>
<li>Athletics/Parkour can pursue; Medicine can identify the smear as biological, not ordinary blood.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Map C Service Utility Key",
    "source_file": "handouts/16_Map_C_Service_Utility_Key.md",
    "notes": "<h1>Map C — Service, Utility, and Maintenance Floor Key</h1>
<p>Use this floor for repairs, sabotage, stealth, alternate routes, and infrastructure consequences. It should not feel empty: maintenance workers, smugglers, delivery crews, and tired staff pass through here.</p>
<h2>How to use these checks</h2>
<p>These are prompts, not a fixed menu. If a player describes a sensible approach, use the closest skill or Background logic.</p>
<p>Recommended clue handling:</p>
<ul>
<li><strong>No roll / basic interaction:</strong> give the obvious clue.</li>
<li><strong>Success:</strong> give useful detail, leverage, or a safer route.</li>
<li><strong>High success:</strong> give a shortcut, future advantage, or a way to reduce danger.</li>
<li><strong>Failure:</strong> do not stall the scenario; give the clue with less detail, extra time cost, noise, or complication.</li>
</ul>
<h2>C1. Service Street / Logistics Lane</h2>
<p><strong>Read-aloud:</strong></p>
<p>A broad indoor logistics lane runs along the facility edge. Utility carts, delivery bays, and warning lights make it feel like a street for machines and workers.</p>
<p><strong>GM notes:</strong></p>
<p>This is the utility-floor equivalent of public space.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Streetwise:</strong> Identify which crews are legitimate and which are lookouts.</li>
<li><strong>Piloting / Driving:</strong> Use carts or vehicles to move fast.</li>
<li><strong>Awareness:</strong> Spot a corporate-tagged service drone.</li>
<li><strong>Performance:</strong> Blend in by acting like a worker who belongs.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Corp recovery can use service routes.</li>
<li>Redline Choir knows some routes staff do not.</li>
</ul>
<h2>C2. Central Loading Zone</h2>
<p><strong>Read-aloud:</strong></p>
<p>Pallets, crates, cargo lifters, and stained floor markings form the beating heart of the service level.</p>
<p><strong>GM notes:</strong></p>
<p>Good for chases, cover, forklift improvisation, and ambushes.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Get a cargo lifter moving.</li>
<li><strong>Big Guns:</strong> Identify which crates provide actual cover.</li>
<li><strong>Small Arms:</strong> Spot ideal firing lanes before someone uses them.</li>
<li><strong>Athletics:</strong> Climb or move cargo under pressure.</li>
<li><strong>Scavenger:</strong> Find a useful tool, battery, or sealed crate.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This zone can connect to every other floor by freight lift.</li>
<li>A fight here can damage vital supplies.</li>
</ul>
<h2>C3. Generator Room</h2>
<p><strong>Read-aloud:</strong></p>
<p>Heavy generator housings vibrate behind safety rails. The hum is steady until the relay pulse makes it stutter.</p>
<p><strong>GM notes:</strong></p>
<p>Power is a scenario lever. Let technical PCs shine.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey / Repair:</strong> Stabilize power or identify overload risk.</li>
<li><strong>Mesh Hacker:</strong> Notice remote commands trying to isolate clinic power.</li>
<li><strong>Big Guns:</strong> Understand that one bad shot could cascade into an outage.</li>
<li><strong>Cyberware:</strong> Feel implants prickle as the relay pulse rides the power grid.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The signal is coupling into clinic infrastructure.</li>
<li>The corp may try to force a selective blackout.</li>
</ul>
<h2>C4. Battery Bank</h2>
<p><strong>Read-aloud:</strong></p>
<p>Rows of battery cabinets glow cyan behind reinforced panels. Warning tape has been applied, removed, and reapplied.</p>
<p><strong>GM notes:</strong></p>
<p>A stable battery bank can keep medical systems alive during breach.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Reroute emergency power.</li>
<li><strong>Investigation:</strong> Notice one bank has been drained recently.</li>
<li><strong>Sabotage:</strong> Disable or fake a failure without causing an explosion.</li>
<li><strong>Corporate Security:</strong> Recognize a standardized remote lockout module.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The emergency bay vehicle was likely drained here or through this system.</li>
<li>A stable bank gives the clinic time.</li>
</ul>
<h2>C5. Water Recycling / Filtration</h2>
<p><strong>Read-aloud:</strong></p>
<p>Condensation beads on pipes and tanks. The air smells clean in the wrong way, like metal and rain filtered through plastic.</p>
<p><strong>GM notes:</strong></p>
<p>Good for alien contamination clues and environmental hazards.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Identify contamination risk if systems are breached.</li>
<li><strong>Awareness:</strong> Hear something moving inside a pipe wall.</li>
<li><strong>Scavenger:</strong> Find access through a maintenance crawlspace.</li>
<li><strong>Melee Combat:</strong> Know slippery floors make close fighting dangerous.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The breach could spread through utilities if not isolated.</li>
<li>This room offers bypass access at a cost.</li>
</ul>
<h2>C6. HVAC / Air Handling</h2>
<p><strong>Read-aloud:</strong></p>
<p>Huge fans churn behind grills. Airflow arrows glow on the floor, and each relay pulse makes the vents sing half a note too high.</p>
<p><strong>GM notes:</strong></p>
<p>Can become a countdown location if alien spores/signals/heat spread.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Reverse or isolate airflow.</li>
<li><strong>Mesh Hacker:</strong> Lock dampers or detect a hostile override.</li>
<li><strong>Parkour:</strong> Use duct access for risky movement.</li>
<li><strong>Cyber-Junkie:</strong> Feel the signal resonance through the vents.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Air systems can spread panic, smoke, or alien effects.</li>
<li>Controlling HVAC can protect civilians.</li>
</ul>
<h2>C7. Workshop / Repair Bay</h2>
<p><strong>Read-aloud:</strong></p>
<p>Tools hang beside half-repaired carts, cracked drones, replacement joints, scavenged panels, and one coffee mug that may be older than the clinic.</p>
<p><strong>GM notes:</strong></p>
<p>Give practical rewards here, not just clues.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Build an improvised barricade or med-cart repair.</li>
<li><strong>Scavenger:</strong> Find a useful spare part.</li>
<li><strong>Small Arms:</strong> Repair or identify a damaged non-lethal weapon.</li>
<li><strong>Cyberware:</strong> Patch a hot-running implant temporarily.</li>
<li><strong>Performance:</strong> Win over maintenance workers by helping rather than ordering.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The workers know unofficial routes.</li>
<li>Helping here earns practical allies.</li>
</ul>
<h2>C8. Storage Rooms</h2>
<p><strong>Read-aloud:</strong></p>
<p>Stacked bins, outdated labels, ration crates, bedding, cleaning chemicals, and obsolete machines fill the storage rooms.</p>
<p><strong>GM notes:</strong></p>
<p>Use storage for hidden supplies, smuggled aid, or danger.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Investigation:</strong> Find mislabeled Redline aid crates.</li>
<li><strong>Streetwise:</strong> Identify goods that came through gang routes.</li>
<li><strong>Medicine:</strong> Find useful medical supplies among the wrong labels.</li>
<li><strong>Stealth:</strong> Hide or move through without disturbing obvious stacks.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Some 'contraband' is actually food and medicine.</li>
<li>This can support the Mara reveal.</li>
</ul>
<h2>C9. Monitoring Office</h2>
<p><strong>Read-aloud:</strong></p>
<p>A cramped room of old screens, system maps, dead camera feeds, and one chair patched with tape.</p>
<p><strong>GM notes:</strong></p>
<p>This can reveal map information without requiring the GM to expose everything.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Mesh Hacker:</strong> Access cameras and partial floor maps.</li>
<li><strong>Corporate Security:</strong> Recognize which feeds have been looped professionally.</li>
<li><strong>Investigation:</strong> Match signal pulses to system failures.</li>
<li><strong>Awareness:</strong> Notice a live feed showing someone where they should not be.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The camera gaps are deliberate.</li>
<li>This can reveal one or two unrevealed map areas if earned.</li>
</ul>
<h2>C10. Elevator / Freight Lift Core</h2>
<p><strong>Read-aloud:</strong></p>
<p>This lift is bigger and uglier than the public elevator. It smells of oil, plastic wrap, and overheated brakes.</p>
<p><strong>GM notes:</strong></p>
<p>Cargo route. Great for moving equipment, bad if controlled by enemies.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Override freight priority.</li>
<li><strong>Piloting / Logistics:</strong> Use the lift to move many civilians or supplies.</li>
<li><strong>Big Guns:</strong> Predict how a breach team would use the large doors.</li>
<li><strong>Mesh Hacker:</strong> Prevent external rerouting.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This lift can move heavy gear between maps.</li>
<li>It is a likely corporate approach route.</li>
</ul>
<h2>C11. Emergency Stair / Ladderwell</h2>
<p><strong>Read-aloud:</strong></p>
<p>The maintenance stairwell is steep, metal, and unforgiving, with old warning paint and newer graffiti.</p>
<p><strong>GM notes:</strong></p>
<p>Back route for PCs, gang, or alien movement.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Athletics:</strong> Move fast without falling.</li>
<li><strong>Gutter Rat:</strong> Find the landing that skips a monitored door.</li>
<li><strong>Blades / Melee:</strong> Read bloodless scrape marks from intimidation rather than murder.</li>
<li><strong>Awareness:</strong> Hear movement from another floor.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This route can bypass elevator lockdown.</li>
<li>It is poor for wounded evacuation.</li>
</ul>
<h2>C12. Signal Interference Node</h2>
<p><strong>Read-aloud:</strong></p>
<p>A service junction hums with the wrong rhythm. Nearby indicator lights pulse in time with the relay.</p>
<p><strong>GM notes:</strong></p>
<p>This may be a hidden side room, conduit cluster, or maintenance box. It links the alien signal to infrastructure.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Mesh Hacker:</strong> Trace the signal bleed toward the incident floor.</li>
<li><strong>Cyberware:</strong> Feel implant discomfort worsen near the node.</li>
<li><strong>Grease Monkey:</strong> Physically isolate the conduit.</li>
<li><strong>Investigation:</strong> Connect this node to the deleted intake logs.</li>
<li><strong>Samurai Otaku:</strong> Recognize telemetry patterns that sound like real Samurai incidents.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The relay is not passive evidence.</li>
<li>The signal is spreading through infrastructure.</li>
<li>Fixing this can reduce breach severity later.</li>
</ul>
<h2>Updated hidden-nest clues for Map C</h2>
<p>Map C is now the primary hidden-nest investigation floor.</p>
<h3>C1 Service Street / Logistics Lane</h3>
<ul>
<li>Bex Aranda or Lala Mir may have passed through here before vanishing.</li>
<li>Corporate personnel may dismiss missing workers as local disorder.</li>
<li>Streetwise can identify the disappearances cluster around quiet service routes.</li>
<li>Small Arms can find evidence of panicked low-angle shots.</li>
</ul>
<h3>C5 Water Recycling / Filtration</h3>
<ul>
<li>Thin organic film in drains or filters.</li>
<li>Dead rats, insects, or birds fused into residue.</li>
<li>The room provides moisture and nutrients, making it a plausible secondary nest approach.</li>
<li>Medicine or Biology-style reasoning identifies the growth as Antithesis-related, not mold.</li>
<li>A juvenile Model 3 may retreat through this area if wounded.</li>
</ul>
<h3>C6 HVAC / Air Handling</h3>
<p>This is the strongest recommended hidden nest approach.</p>
<ul>
<li>Oskar Venn’s tool cart.</li>
<li>Radio log: “Something is breathing in here.”</li>
<li>Warm wet air from a cold vent.</li>
<li>Vent cover bent outward from the inside.</li>
<li>Three-pronged bite marks.</li>
<li>Drag marks into a maintenance cavity.</li>
<li>A juvenile Model 3 may attack here and try to drag an NPC away.</li>
</ul>
<h3>C9 Monitoring Office</h3>
<ul>
<li>One corrupted frame shows something low dragging Bex or Oskar.</li>
<li>Mesh Hacker retrieves camera footage, but this is human surveillance. The Antithesis is not hacking electronics.</li>
<li>Corporate edits may hide the original nest cleanup, but not because of alien interference.</li>
</ul>
<h3>C12 Signal Interference Node</h3>
<p>Rename in play to <strong>C12 Hidden Maintenance Cavity</strong>.</p>
<p>Replace signal language with:</p>
<ul>
<li>Dead Model 1 bodies dissolved into a clump.</li>
<li>Warm nest tissue spreading along ducts and insulation.</li>
<li>Badges/tools/clothing partly incorporated.</li>
<li>A partly alive victim if the PCs arrive quickly.</li>
<li>Juvenile Model 3s defending or feeding the nest.</li>
</ul>
<p>This is the most likely location of the second hidden nest.</p>"
  },
  {
    "name": "Signal Bleed - Map D Incident Key",
    "source_file": "handouts/17_Map_D_Incident_Key.md",
    "notes": "<h1>Map D — Quarantine, Incident Floor, and Landing Corner Key</h1>
<p>Use this as the likely breach and finale floor. It includes a landing corner for NightCrash or emergency craft, but most of the map remains part of the indoor megacomplex.</p>
<h2>How to use these checks</h2>
<p>These are prompts, not a fixed menu. If a player describes a sensible approach, use the closest skill or Background logic.</p>
<p>Recommended clue handling:</p>
<ul>
<li><strong>No roll / basic interaction:</strong> give the obvious clue.</li>
<li><strong>Success:</strong> give useful detail, leverage, or a safer route.</li>
<li><strong>High success:</strong> give a shortcut, future advantage, or a way to reduce danger.</li>
<li><strong>Failure:</strong> do not stall the scenario; give the clue with less detail, extra time cost, noise, or complication.</li>
</ul>
<h2>D1. Landing Corner / Skywell Pad</h2>
<p><strong>Read-aloud:</strong></p>
<p>A small landing pad opens to a vertical skywell between megacomplex towers. Warning lights pulse against the ceiling haze.</p>
<p><strong>GM notes:</strong></p>
<p>This is where NightCrash can arrive. It is a small exposed corner, not an outdoor map.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Piloting:</strong> Judge whether a fast emergency craft can land safely.</li>
<li><strong>Awareness:</strong> Spot incoming lights or drone movement before arrival.</li>
<li><strong>Corporate Security:</strong> Recognize emergency access protocols.</li>
<li><strong>Performance:</strong> Use a public arrival to change morale.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>NightCrash can arrive here if needed.</li>
<li>A flying vehicle cannot solve the whole facility problem.</li>
</ul>
<h2>D2. Skywell Access Door</h2>
<p><strong>Read-aloud:</strong></p>
<p>A reinforced door connects the landing corner to the facility interior. It is built to keep weather, smoke, and panic out.</p>
<p><strong>GM notes:</strong></p>
<p>A chokepoint for rescue or retreat.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Grease Monkey:</strong> Force the door safely.</li>
<li><strong>Mesh Hacker:</strong> Override emergency lockout.</li>
<li><strong>Big Guns:</strong> Know what would happen if someone breached it the loud way.</li>
<li><strong>Athletics:</strong> Hold or force it during pressure.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This door may trap or save people depending on timing.</li>
<li>NightCrash’s drones need it clear for evacuation.</li>
</ul>
<h2>D3. Central Incident Hall</h2>
<p><strong>Read-aloud:</strong></p>
<p>A wide hall links containment, diagnostics, patient holding, and vertical access. It feels too open when the lights start flickering.</p>
<p><strong>GM notes:</strong></p>
<p>This is the natural action scene space. It should change based on earlier diplomacy.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Tactics:</strong> Set defensive positions without blocking evacuation.</li>
<li><strong>Small Arms:</strong> Identify clean firing lanes and dangerous crossfire.</li>
<li><strong>Performance / Leadership:</strong> Direct panicked civilians or staff.</li>
<li><strong>Parkour:</strong> Use furniture and barriers to move around the fight.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This can become a kill zone or an evacuation corridor.</li>
<li>Earlier faction choices determine who helps hold it.</li>
</ul>
<h2>D4. Quarantine Cells</h2>
<p><strong>Read-aloud:</strong></p>
<p>Pink-lit quarantine rooms line the corridor. Each cell has observation glass, isolation seals, and equipment meant to keep fear contained.</p>
<p><strong>GM notes:</strong></p>
<p>Use for exposed patients, alien symptoms, or corporate containment cruelty.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Distinguish infection, signal exposure, and panic.</li>
<li><strong>Psychology:</strong> Calm an isolated patient enough to get useful information.</li>
<li><strong>Corporate Security:</strong> Recognize the layout as containment-first, care-second.</li>
<li><strong>Blades / Melee:</strong> Notice defensive gouges from someone trapped inside.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The quarantine system can protect or imprison.</li>
<li>A patient may know what triggered the breach.</li>
</ul>
<h2>D5. Diagnostics Lab</h2>
<p><strong>Read-aloud:</strong></p>
<p>Diagnostic beds, scanners, and monitors surround a central work area. Several screens show clean error states that feel too clean.</p>
<p><strong>GM notes:</strong></p>
<p>This is where technical/medical PCs can learn what the relay really is.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine / Surgery:</strong> Interpret physiological effects of signal exposure.</li>
<li><strong>Mesh Hacker:</strong> Recover corrupted diagnostic logs.</li>
<li><strong>Cyberware:</strong> Notice implants respond like antennae, not just damaged electronics.</li>
<li><strong>Investigation:</strong> Catch that the lab results were sanitized by an automated routine.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The relay is a lure or beacon, not just data storage.</li>
<li>Exposure can trigger Samurai potential.</li>
</ul>
<h2>D6. Control Room</h2>
<p><strong>Read-aloud:</strong></p>
<p>Curved consoles face camera feeds, isolation controls, air systems, and security doors. Half the indicators are teal. The others pulse wrong.</p>
<p><strong>GM notes:</strong></p>
<p>This is the room for map control, door choices, and hard moral tradeoffs.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Mesh Hacker:</strong> Control doors, cameras, or containment fields.</li>
<li><strong>Corporate Security:</strong> Predict recovery override procedures.</li>
<li><strong>Grease Monkey:</strong> Keep controls running when software fails.</li>
<li><strong>Tactics:</strong> Choose which doors to lock without trapping civilians.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The PCs can shape the battlefield from here.</li>
<li>Bad decisions may trap allies or spread the breach.</li>
</ul>
<h2>D7. Patient Holding Rooms</h2>
<p><strong>Read-aloud:</strong></p>
<p>Small rooms hold beds, monitors, and privacy curtains. They are not cells, but they are not comforting either.</p>
<p><strong>GM notes:</strong></p>
<p>Useful for civilian rescue, Bluewire treatment, or exposed NPCs.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Medicine:</strong> Stabilize a patient while alarms rise.</li>
<li><strong>Empathy:</strong> Get a terrified person to move now instead of freeze.</li>
<li><strong>Athletics:</strong> Carry someone to the elevator or landing route.</li>
<li><strong>Religious / Comfort:</strong> Help someone face impossible symptoms without despair.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The players should feel the cost of delays here.</li>
<li>Saving patients can matter more than killing enemies.</li>
</ul>
<h2>D8. Containment Chamber</h2>
<p><strong>Read-aloud:</strong></p>
<p>A sealed chamber holds the relay, or what the relay has become. Light bends wrong near the center.</p>
<p><strong>GM notes:</strong></p>
<p>Primary breach point candidate. Do not make the solution one obvious roll.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Mesh Hacker:</strong> Stabilize signal output temporarily.</li>
<li><strong>Grease Monkey:</strong> Physically isolate power or shielding.</li>
<li><strong>Samurai Otaku:</strong> Recognize patterns from rumored Samurai telemetry.</li>
<li><strong>Big Guns:</strong> Judge whether destroying the chamber will help or make everything worse.</li>
<li><strong>Psychology:</strong> Notice the signal reacts to fear, pain, or attention.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The relay is actively interacting with the environment.</li>
<li>Broadcast/destroy/delay choices should have consequences.</li>
</ul>
<h2>D9. Service Bypass</h2>
<p><strong>Read-aloud:</strong></p>
<p>A narrow corridor of pipes, access panels, and yellow service lights runs behind the main rooms.</p>
<p><strong>GM notes:</strong></p>
<p>Use for alternate entry, stealth, flanking, or alien movement.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Stealth:</strong> Move around the main hall unseen.</li>
<li><strong>Scavenger:</strong> Find useful tools or shortcuts.</li>
<li><strong>Gutter Rat:</strong> Know which panel leads to a maintenance crawl.</li>
<li><strong>Melee Combat:</strong> Understand the danger of close fighting in the narrow space.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>This route can save the party if the central hall is overrun.</li>
<li>It can also let something bypass them.</li>
</ul>
<h2>D10. Elevator Core</h2>
<p><strong>Read-aloud:</strong></p>
<p>The elevator doors shudder with each pulse. The floor indicator flickers between valid floors and symbols that are not floors.</p>
<p><strong>GM notes:</strong></p>
<p>Dangerous vertical connection. Great tension point.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Mesh Hacker:</strong> Stop the elevator carrying the breach to other floors.</li>
<li><strong>Grease Monkey:</strong> Force it open or hold it shut mechanically.</li>
<li><strong>Tactics:</strong> Decide whether to sacrifice mobility for containment.</li>
<li><strong>Awareness:</strong> Hear whether something is inside before opening it.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>The elevator is useful but risky.</li>
<li>Alien effects can spread through vertical infrastructure.</li>
</ul>
<h2>D11. Emergency Stair / Ladderwell</h2>
<p><strong>Read-aloud:</strong></p>
<p>The emergency shaft drops into red-lit gloom. Its metal steps are narrow, steep, and echo too long.</p>
<p><strong>GM notes:</strong></p>
<p>Last-resort route. Good for escape or horror pressure.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Athletics:</strong> Move fast under pressure.</li>
<li><strong>Parkour:</strong> Skip landings or bypass obstacles.</li>
<li><strong>Awareness:</strong> Detect movement from a lower floor.</li>
<li><strong>Small Arms:</strong> Know firing here risks ricochets and panic.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>Useful if elevators are compromised.</li>
<li>Bad for stretchers and mass evacuation.</li>
</ul>
<h2>D12. NightCrash Arrival Route</h2>
<p><strong>Read-aloud:</strong></p>
<p>From landing pad to hall, the route is just wide enough for two nurse-shaped drones carrying a smart-stretcher at a dead run.</p>
<p><strong>GM notes:</strong></p>
<p>This route matters only if NightCrash appears or if PCs prepare evacuation.</p>
<p><strong>Interaction prompts:</strong></p>
<ul>
<li><strong>Logistics / Piloting:</strong> Keep the route clear for medevac.</li>
<li><strong>Athletics:</strong> Move debris or bodies out of the way.</li>
<li><strong>Performance / Leadership:</strong> Make frightened people stop blocking the path.</li>
<li><strong>Small Arms:</strong> Cover the route without endangering patients.</li>
</ul>
<p><strong>Useful information:</strong></p>
<ul>
<li>NightCrash creates an opening, not a solution.</li>
<li>If the route is blocked, her help is delayed or reduced.</li>
</ul>
<h2>Updated old-nest and relay clues for Map D</h2>
<p>Map D should represent the old quarantine/incident layer, corporate records, and the first nest evidence. It is not necessarily where the current hidden nest is.</p>
<h3>D3 Central Incident Hall</h3>
<ul>
<li>Signs of old corporate sterilization: scorch, foam, sealed doors, chemical burns.</li>
<li>Big Guns or Corporate Security can identify a professional cleanup assault.</li>
<li>Medicine can identify that some stains are biological remains, not ordinary blood.</li>
</ul>
<h3>D5 Diagnostics Lab</h3>
<ul>
<li>Exposure-treatment records.</li>
<li>Patient trial data connected to Mercy Twelve.</li>
<li>False discharge or transfer paperwork.</li>
<li>Evidence that locals were used as deniable subjects.</li>
</ul>
<h3>D6 Control Room</h3>
<ul>
<li>Cleanup footage of the first nest.</li>
<li>Model 1s are seen flying away in formation.</li>
<li>Corporate annotation: “terminal erratic flight.”</li>
<li>Halden Rook’s annotation: “They’re not fleeing. They’re relocating.”</li>
<li>A deleted risk tag: “nest-seeding possibility.”</li>
<li>This is the best place for the deep clue that the second nest may exist.</li>
</ul>
<h3>D8 Containment Chamber</h3>
<ul>
<li>The visible first nest was here or adjacent.</li>
<li>It is nearly destroyed.</li>
<li>Researchers were consumed as biomass.</li>
<li>Corporate Recovery thinks this was the only nest.</li>
<li>The chamber can be horrific evidence, but should not be the main current threat unless the GM wants a second combat site.</li>
</ul>
<h3>D9 Service Bypass</h3>
<ul>
<li>This route may match the Model 1 escape vector.</li>
<li>Tracking / Investigation can connect it to lower service infrastructure.</li>
<li>It points toward Map C rather than ending the mystery on Map D.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Token and NPC Placement GM",
    "source_file": "handouts/18_Token_and_NPC_Placement_GM.md",
    "notes": "<h1>Token and NPC Placement: GM Draft</h1>
<h2>Can tokens be scripted onto maps automatically?</h2>
<p>Technically, a Roll20 Mod/API script can create tokens on pages, but it is not the right first step here.</p>
<p>To place tokens automatically, the script needs:</p>
<ul>
<li>exact Roll20 page IDs</li>
<li>exact token coordinates</li>
<li>token image URLs already uploaded/available in Roll20</li>
<li>map dimensions and scale</li>
<li>decisions about which tokens start hidden, visible, or on the GM layer</li>
</ul>
<p>The API cannot reliably upload local image files into your Roll20 Art Library.</p>
<p>For this draft, use the importer to create NPC character entries and handouts. Place map tokens manually after uploading art.</p>
<h2>Recommended placement workflow</h2>
<ol>
<li>Upload the map image.</li>
<li>Create a Roll20 page for the map.</li>
<li>Disable visible Roll20 grid for current AI playtest maps.</li>
<li>Add Dynamic Lighting walls/doors.</li>
<li>Upload or create NPC/token art.</li>
<li>Place starting NPCs manually.</li>
<li>Put hidden/conditional NPCs on the GM layer.</li>
<li>Use this handout and <code>data/signal_bleed_token_manifest.json</code> as the placement guide.</li>
</ol>
<h2>Token visibility convention</h2>
<pre>Visible:
Players can see the token at scene start.

Delayed:
Do not place until the NPC enters the scene, or keep on GM layer.

Hidden:
Place on GM layer or do not place until discovered.

Conditional:
Only appears if the relevant event happens.</pre>
<h2>Floor A — Mercy Twelve Clinic</h2>
<h3>Starting visible tokens</h3>
<ul>
<li><strong>Senior Nurse Imani Cho</strong> — A3 Reception and Waiting Area or A5 Triage Desk.</li>
<li><strong>Orderly Pax Ruun</strong> — A6 Emergency Intake Bay.</li>
<li><strong>Nox “Bluewire” Kade</strong> — A14 Bluewire’s Pacing Route, near A6/A7/A13.</li>
<li><strong>Redline Lookout Pair</strong> — A1 Indoor Street or A13 Service Corridor.</li>
<li><strong>Worried Parent</strong> — A3 Waiting Area.</li>
<li><strong>Clinic patients / civilians</strong> — A3 Waiting Area and A9 Recovery Wing as needed.</li>
</ul>
<h3>Delayed or GM-layer tokens</h3>
<ul>
<li><strong>Dr. Sera Valez</strong> — A5 Triage Desk or A10 Staff Office / Records.</li>
<li><strong>Mara “Mother Red” Vey</strong> — A1 Indoor Street or A13 Service Corridor; enter when negotiation escalates.</li>
<li><strong>Commander Ilan Rusk</strong> — start off-map or at A1 concourse edge.</li>
<li><strong>Corporate Drone</strong> — A1 public concourse, if corp pressure is visible.</li>
<li><strong>Clinic Security Monitor</strong> — A10 Staff Office / Records or security alcove.</li>
</ul>
<h2>Floor B — Community Support / Shelter</h2>
<h3>Starting visible tokens</h3>
<ul>
<li><strong>Keet</strong> — B6 Classroom or B7 Children’s Corner.</li>
<li><strong>Miri and Sol</strong> — B7 Children’s Corner or public street near B2.</li>
<li><strong>Food Line Volunteers</strong> — B4 Pantry / Aid Distribution.</li>
<li><strong>Redline Supply Runner</strong> — B4 Pantry or B10 Back Service Corridor.</li>
<li><strong>Sister Luma</strong> — B9 Counselor Offices or B3 Community Commons.</li>
</ul>
<h3>Delayed or GM-layer tokens</h3>
<ul>
<li><strong>Mara “Mother Red” Vey</strong> — B4 Pantry or B10 Back Service Corridor if the PCs discover her hidden support.</li>
<li><strong>Redline Camera Sitter</strong> — B10 Back Service Corridor or remote feed access.</li>
<li><strong>Corporate observer</strong> — B1 Indoor Street if corp pressure follows the PCs.</li>
</ul>
<h2>Floor C — Service / Utility</h2>
<h3>Starting visible tokens</h3>
<ul>
<li><strong>Maintenance worker(s)</strong> — C2 Loading Zone, C7 Workshop, or C9 Monitoring Office.</li>
<li><strong>Redline Lookout Pair</strong> — C1 Service Street or C12 Signal Interference Node if the gang controls the route.</li>
<li><strong>Corporate Drone</strong> — C1 Service Street or C10 Freight Lift if corp has compromised logistics.</li>
</ul>
<h3>Delayed or GM-layer tokens</h3>
<ul>
<li><strong>Redline Camera Sitter</strong> — C9 Monitoring Office.</li>
<li><strong>Corporate Feed Handler</strong> — C9 Monitoring Office, if you want a double-allegiance reveal.</li>
<li><strong>Mote Swarm traces</strong> — C12 Signal Interference Node, only as foreshadowing before the breach.</li>
</ul>
<h2>Floor D — Quarantine / Incident Floor</h2>
<h3>Starting visible tokens</h3>
<p>Usually none, unless the PCs are already responding to the incident.</p>
<p>Possible visible tokens if they arrive before the breach:</p>
<ul>
<li><strong>Signal-Touched Patient</strong> — D7 Patient Holding Rooms.</li>
<li><strong>Clinic technician</strong> — D5 Diagnostics Lab or D6 Control Room.</li>
<li><strong>Corporate Recovery Pair</strong> — D3 Central Hall or D6 Control Room if corp got there first.</li>
</ul>
<h3>Conditional tokens</h3>
<ul>
<li><strong>Mote Swarm</strong> — D8 Containment Chamber or D3 Central Incident Hall when breach begins.</li>
<li><strong>NightCrash</strong> — D1 Landing Corner if emergency intervention is needed, or post-finale elsewhere.</li>
<li><strong>The Siren Saint</strong> — D1 Landing Corner when NightCrash arrives.</li>
<li><strong>Gurney Angels</strong> — D12 NightCrash Arrival Route.</li>
</ul>
<h2>Schoolchildren overheard conversation</h2>
<p>Use <strong>Miri and Sol</strong> to reveal “Auntie Red” naturally.</p>
<p>Possible overheard lines:</p>
<p>&gt; “Auntie Red paid for breakfast again.” &gt; &gt; “Don’t call her that where grown-ups hear.” &gt; &gt; “Why?” &gt; &gt; “Because she gets mad when people know she’s nice.”</p>
<p>If the PCs interact kindly, the children can clarify:</p>
<ul>
<li>Mara sends food through people who pretend it came from somewhere else.</li>
<li>Adults act scared when children call her Auntie Red.</li>
<li>Bluewire used to bring crates and joke with them, but now he scares them.</li>
<li>Keet saw something important but is trying to act brave.</li>
</ul>
<h2>Control room NPCs</h2>
<h3>Clinic Security Monitor</h3>
<p>Use as a cooperation point, not just a hacking obstacle.</p>
<p>They can provide:</p>
<ul>
<li>camera lookups</li>
<li>door logs</li>
<li>patient movement records</li>
<li>elevator use records</li>
<li>emergency intake footage</li>
<li>partial recovery-wing access with privacy limits</li>
</ul>
<p>They cooperate if:</p>
<ul>
<li>Dr. Valez approves</li>
<li>PCs help patients</li>
<li>PCs avoid threatening staff</li>
<li>PCs explain a concrete safety reason</li>
</ul>
<h3>Redline Camera Sitter</h3>
<p>Unofficial, patched-together, and more capable than expected.</p>
<p>They can provide:</p>
<ul>
<li>side corridor feeds</li>
<li>street approach feeds</li>
<li>blind spot locations</li>
<li>gang lookout reports</li>
<li>hidden supply-route footage</li>
</ul>
<p>They cooperate if:</p>
<ul>
<li>Mara approves</li>
<li>PCs treat the Redline Choir as a community actor</li>
<li>PCs need footage to protect locals</li>
<li>PCs offer concrete reciprocity</li>
</ul>
<p>Possible additional allegiance:</p>
<p>The Redline Camera Sitter may also be selling selected feed access to corporate recovery, not out of ideology, but to pay for medicine, debt, or family protection. This should be discoverable and negotiable, not an automatic betrayal fight.</p>
<h2>Token art still needed</h2>
<p>Priority token art:</p>
<ol>
<li>NightCrash portrait/token</li>
<li>The Siren Saint vehicle token</li>
<li>Gurney Angels stretcher-drone token</li>
<li>Dr. Sera Valez</li>
<li>Mara “Mother Red” Vey</li>
<li>Bluewire</li>
<li>Commander Rusk</li>
<li>Mote Swarm</li>
<li>Redline Lookout / underling</li>
<li>Clinic staff / patient / civilian groups</li>
</ol>
<h2>Updated Antithesis token placement</h2>
<p>Use these additional tokens for the revised hidden-nest plot.</p>
<h3>Map B / Community Support</h3>
<ul>
<li><strong>Miri &amp; Sol</strong> — B7 Children’s Corner. They reveal “Auntie Red” and Lala’s disappearance.</li>
<li><strong>Lala Mir clue marker</strong> — B10 Back Service Corridor. Spilled meal crates and service hatch.</li>
<li><strong>Narin Pell clue marker</strong> — B8 Shelter Dorm or B12 Emergency Stair. Bag, smear, possible rescue timer.</li>
</ul>
<h3>Map C / Service Utility</h3>
<ul>
<li><strong>Oskar Venn clue marker</strong> — C6 HVAC / Air Handling. Tool cart, radio log, drag marks.</li>
<li><strong>Juvenile Model 3</strong> — C6 HVAC, C5 Water Recycling, C11 Stair, or C12 Hidden Maintenance Cavity.</li>
<li><strong>Second Hidden Nest</strong> — C12 Hidden Maintenance Cavity by default.</li>
<li><strong>Model 1 Seed Clump</strong> — inside the second hidden nest.</li>
<li><strong>Bex Aranda clue marker</strong> — C1 Service Street or C9 Monitoring Office footage.</li>
</ul>
<h3>Map D / Incident Floor</h3>
<ul>
<li><strong>Halden Rook evidence marker</strong> — D6 Control Room logs.</li>
<li><strong>Old Nest Remains</strong> — D8 Containment Chamber.</li>
<li><strong>Model 1 escape-vector marker</strong> — D9 Service Bypass.</li>
</ul>
<p>Do not place all Antithesis tokens at once. Start with missing-person clue markers, then a glimpse, then one Model 3 dragging a victim, then the hidden nest.</p>"
  },
  {
    "name": "Signal Bleed - Roll20 Grid and Reveal Notes",
    "source_file": "handouts/19_Roll20_Grid_and_Reveal_Notes.md",
    "notes": "<h1>Roll20 Map Setup: Grid, Scale, and Reveal</h1>
<h2>Current map status</h2>
<p>The current Signal Bleed maps are AI-generated concept/playtest maps. They include a visible grid baked into the image.</p>
<p>For now, the simplest Roll20 setup is:</p>
<pre>Turn Roll20 grid display off for these pages.
Use the baked-in map grid visually.
Use Dynamic Lighting / Fog of War for room-by-room reveal.</pre>
<p>This is good enough for playtesting.</p>
<h2>Why the grid should be off</h2>
<p>Roll20’s normal square grid assumes a clean pixel scale. These maps have artistically generated grids, not mathematically exact Roll20 grids. Trying to align Roll20’s grid perfectly may be fiddly.</p>
<p>For these playtest maps:</p>
<pre>Recommended:
- Disable visible Roll20 grid.
- Keep the map image as the visual grid.
- Move tokens freely or use approximate snapping if it feels close enough.</pre>
<h2>Future production map requirement</h2>
<p>For a cleaner future release, produce maps in one of these forms:</p>
<pre>Gridless map image + Roll20 grid enabled</pre>
<p>or:</p>
<pre>Exact-size gridded map image where 1 square = 70 × 70 pixels</pre>
<p>Useful Roll20 dimensions:</p>
<pre>30 × 30 squares = 2100 × 2100 px
35 × 35 squares = 2450 × 2450 px
40 × 40 squares = 2800 × 2800 px
50 × 50 squares = 3500 × 3500 px</pre>
<p>For polished tactical use, prefer gridless maps and let Roll20 draw the grid.</p>
<h2>Dynamic Lighting / reveal recommendation</h2>
<p>These maps are built for room-by-room reveal.</p>
<p>Suggested setup:</p>
<ol>
<li>Put the map image on the Map layer.</li>
<li>Disable the visible Roll20 grid.</li>
<li>Use Dynamic Lighting walls around rooms and corridors.</li>
<li>Put doors on Dynamic Lighting as door segments if available.</li>
<li>Keep public megacomplex streets visible if the PCs are there.</li>
<li>Reveal rooms as doors open, cameras are accessed, staff guide the PCs, or gang/corp contacts provide floor knowledge.</li>
</ol>
<h2>Public areas versus hidden areas</h2>
<p>Public areas can often start visible:</p>
<ul>
<li>indoor streets</li>
<li>clinic front entrance</li>
<li>obvious concourse spaces</li>
<li>public reception</li>
<li>elevator lobby</li>
</ul>
<p>Restricted areas should be hidden until accessed:</p>
<ul>
<li>emergency bay</li>
<li>surgery / trauma</li>
<li>pharmacy / supply</li>
<li>recovery rooms</li>
<li>staff records</li>
<li>control rooms</li>
<li>maintenance bypasses</li>
<li>quarantine rooms</li>
<li>landing corner, unless visible from a public camera feed</li>
</ul>
<h2>Numbered labels</h2>
<p>Do not permanently draw numbers onto the map yet.</p>
<p>Recommended playtest setup:</p>
<pre>Use small numbered text objects or marker tokens on the GM layer.</pre>
<p>This lets you move or rename them as the keyed locations evolve.</p>
<p>Later, once locations are final, create optional annotated map copies.</p>"
  },
  {
    "name": "Signal Bleed - Surveillance Cameras and Ad Injection",
    "source_file": "handouts/20_Surveillance_Cameras_and_Ad_Injection.md",
    "notes": "<h1>Surveillance, Cameras, and Ad-Injection Systems</h1>
<h2>Default assumption</h2>
<p>In this megacomplex, cameras are almost everywhere.</p>
<p>Do not ask “is there a camera here?” for every room. Assume there probably is.</p>
<p>Instead, track:</p>
<pre>- where cameras are missing
- who controls the camera feed
- how difficult the feed is to access
- whether the feed has been edited, looped, blocked, or monetized</pre>
<h2>Camera ownership categories</h2>
<p>Use these ownership labels in GM notes:</p>
<pre>Clinic-owned
Redline-controlled
Corporate-compromised
Megacomplex municipal
Ad-network / sponsor-owned
Dead / blind spot
Unknown / contested</pre>
<h2>Hacking difficulty guidance</h2>
<p>Use these as rough difficulty anchors:</p>
<pre>Difficulty 8:
Obvious public camera, badly secured, old system, or staff willingly helps.

Difficulty 10:
Normal clinic/internal camera access with cooperation or basic credentials.

Difficulty 12:
Restricted clinic/security camera, Redline camera, or municipal feed.

Difficulty 14:
Corporate-compromised camera, edited logs, or active countermeasures.

Difficulty 16:
Live corporate recovery overwatch, hardened control room, or hostile trace risk.

Difficulty 18+:
Alien-corrupted signal, Samurai-level sponsor feed, or active ICE with consequences.</pre>
<p>Failures should usually create complications, not dead ends:</p>
<ul>
<li>trace starts</li>
<li>feed freezes</li>
<li>false footage appears</li>
<li>ads inject into cyberware</li>
<li>a control-room NPC notices</li>
<li>the wrong faction learns someone is watching</li>
</ul>
<h2>Camera control by map</h2>
<h3>Floor A — Mercy Twelve Clinic</h3>
<p>Default: Clinic-owned.</p>
<p>Exceptions:</p>
<ul>
<li>public concourse cameras are mostly municipal/ad-network</li>
<li>Redline Choir has control or partial access around side corridors and some street approaches</li>
<li>emergency intake bay cameras were looped for six minutes</li>
<li>staff office / records has limited cameras for privacy</li>
<li>pediatric/community corner has cameras, but staff are protective about who can access them</li>
<li>recovery wing cameras are privacy-restricted and hard to access without Dr. Valez or staff cooperation</li>
</ul>
<h3>Floor B — Community Support / Shelter</h3>
<p>Default: mixed clinic/community control.</p>
<p>Exceptions:</p>
<ul>
<li>public street cameras are municipal/ad-network</li>
<li>food distribution and service corridor have Redline-controlled blind spots</li>
<li>classroom and daycare cameras are restricted; staff will resist casual access</li>
<li>counselor offices have no ordinary camera coverage, only door logs</li>
<li>shelter dorm cameras are limited and controversial</li>
</ul>
<h3>Floor C — Utility / Service</h3>
<p>Default: municipal/maintenance control.</p>
<p>Exceptions:</p>
<ul>
<li>Redline Choir has access to some older service cameras</li>
<li>corporate recovery may compromise freight lift and service street feeds</li>
<li>hidden maintenance bypasses often have dead cameras</li>
<li>signal interference node may corrupt footage</li>
</ul>
<h3>Floor D — Quarantine / Incident</h3>
<p>Default: restricted clinic/corporate hybrid control.</p>
<p>Exceptions:</p>
<ul>
<li>quarantine rooms have internal monitoring but may be locked behind emergency protocol</li>
<li>control room can see most of the floor</li>
<li>landing corner has municipal/emergency-response cameras</li>
<li>NightCrash may have a sponsor/emergency bodycam feed if she arrives</li>
<li>alien breach can corrupt camera feeds into impossible images</li>
</ul>
<h2>Ad-injection and cyber-eye harassment</h2>
<p>Megacomplex advertising is aggressive. Cheap cyberware often subsidizes itself through ad-based revenue.</p>
<p>Use this sparingly as color, pressure, and occasional complication.</p>
<h3>Where ad-injection is strongest</h3>
<ul>
<li>public concourse</li>
<li>elevator lobby</li>
<li>transit access</li>
<li>support center public commons</li>
<li>municipal camera zones</li>
<li>sponsor-owned clinic signage</li>
<li>landing corner emergency beacons</li>
</ul>
<h3>What happens</h3>
<p>Characters with cyber-eyes, cheap AR, sponsorware, or old background cyberware may experience:</p>
<ul>
<li>clinic ads overlaid on real patients</li>
<li>“helpful” arrows pointing to paid services</li>
<li>sponsor slogans appearing in peripheral vision</li>
<li>emotional manipulation overlays</li>
<li>fake emergency warnings</li>
<li>pop-up coupons for painkillers, trauma foam, or therapy apps</li>
<li>adware trying to tag what the PC looks at</li>
</ul>
<h3>Suggested checks</h3>
<ul>
<li><strong>Cyberware / Mesh Hacker:</strong> block or trace the ad injection.</li>
<li><strong>Awareness:</strong> realize a visual prompt is an overlay, not reality.</li>
<li><strong>Corporate Security:</strong> recognize sponsor-network surveillance behavior.</li>
<li><strong>Psychology:</strong> notice the ad is tuned to panic, grief, or pain.</li>
<li><strong>Performance:</strong> hijack the ad system for public messaging.</li>
<li><strong>Grease Monkey:</strong> physically disable a local ad beacon.</li>
</ul>
<h3>Difficulty</h3>
<pre>Difficulty 8:
Annoying public ad overlay.

Difficulty 10:
Targeted adware trying to profile the PC.

Difficulty 12:
Cyber-eye overlay interfering with perception.

Difficulty 14:
Hostile ad injection during crisis, possibly corporate-assisted.

Difficulty 16:
Alien signal or corporate ICE piggybacks through the ad layer.</pre>
<h2>Human control rooms</h2>
<p>Both the clinic and the Redline Choir have people watching feeds.</p>
<p>They should be NPC interaction points, not just hacking targets.</p>
<h3>Clinic control room</h3>
<p>The clinic control room is under-resourced but legitimate. Staff may cooperate if the PCs have earned trust.</p>
<p>They can provide:</p>
<ul>
<li>camera lookups</li>
<li>door logs</li>
<li>patient movement records</li>
<li>elevator use</li>
<li>emergency intake feed</li>
<li>partial recovery-wing access with privacy limits</li>
</ul>
<h3>Redline control room</h3>
<p>The Redline Choir control room is unofficial, patched together, and better than outsiders expect.</p>
<p>They can provide:</p>
<ul>
<li>street approach feeds</li>
<li>side corridor blind spots</li>
<li>gang lookout reports</li>
<li>who entered by unofficial routes</li>
<li>local witness names</li>
<li>hidden supply-route footage</li>
</ul>
<p>They will not cooperate if treated like criminals only.</p>
<h2>Suggested camera-related clue philosophy</h2>
<p>Camera access should help players ask better questions.</p>
<p>Do not let cameras replace play.</p>
<p>Good camera results:</p>
<ul>
<li>“The courier did not come through the emergency bay.”</li>
<li>“The camera froze six minutes before the relay arrived.”</li>
<li>“Bluewire was already shaking before the argument.”</li>
<li>“A Redline courier delivered medical crates, not weapons.”</li>
<li>“A corporate observer has been in the concourse for an hour.”</li>
<li>“One corridor has no camera because someone deliberately keeps it blind.”</li>
</ul>
<p>Bad camera results:</p>
<ul>
<li>“Here is the entire plot.”</li>
<li>“You solve every mystery without leaving the room.”</li>
</ul>
<h2>Updated canon note: electronics are human systems</h2>
<p>The Antithesis in this module do not hack electronics and do not create electronic signal bleed.</p>
<p>Camera glitches, ad injection, cyber-eye popups, and footage gaps are caused by human ad networks, cheap cyberware monetization, corporate tampering, Redline surveillance control, damaged cameras, panic, poor maintenance, and deliberate edits.</p>
<p>The Antithesis clue trail is biological: missing people, drag marks, organic residue, three-part bite wounds, vent movement, Model 3 biomass hunting, and the Model 1 seed clump.</p>"
  },
  {
    "name": "Signal Bleed - Updated Plot Canon GM",
    "source_file": "handouts/21_Updated_Plot_Canon_GM.md",
    "notes": "<h1>Signal Bleed: Updated Plot Canon</h1>
<h2>One-sentence premise</h2>
<p>Signal Bleed is about a stolen human data relay proving that a corporation’s illegal Antithesis bio-research created a nest, that their cleanup failed, and that a second hidden nest is now forming beneath the community they came to silence.</p>
<h2>Hard setting constraints</h2>
<pre>The relay is human technology.
The relay is evidence, not alien technology.
The relay does not summon Antithesis.
The Antithesis threat is biological, not electronic.
Cheap cyberware ad-injection is human exploitation, not alien interference.
Samurai AI communications are not hacked, intercepted, copied, or analyzed.</pre>
<h2>What happened before the PCs arrive</h2>
<p>The corporation gathered Antithesis biological matter from previous battle sites and stored it in a hidden megacomplex research annex. They thought they were studying inert or controllable samples.</p>
<p>They were wrong.</p>
<p>The stored biomass consumed researchers and lab staff, incorporated them as material, and formed a small nest. That first nest produced Model 1s, the small flying Antithesis.</p>
<p>Corporate containment forces attacked the visible nest and nearly exterminated it. The official internal conclusion was that the Antithesis event was contained.</p>
<p>But several Model 1s behaved unexpectedly. They did not attack, scatter, or die in place. They flew through ducts and hidden service routes to a nearby concealed location, then suicided in a clump. Their bodies seeded a second, smaller, hidden nest.</p>
<p>The corporation does not know this second nest exists.</p>
<h2>What the corporation thinks is happening now</h2>
<p>Corporate Recovery believes the old nest is dead or contained. Their current mission is not a rescue operation. They are at Mercy Twelve to clean up evidence and witnesses.</p>
<p>Their objectives:</p>
<pre>Recover or destroy the stolen relay.
Find the courier.
Suppress clinic records.
Prevent Redline Choir from broadcasting the evidence.
Identify witnesses.
Blame gang violence, panic, or rogue staff if needed.
Avoid public evacuation unless corporate liability can be controlled.</pre>
<p>Commander Rusk can honestly believe the original nest was destroyed while still lying about the experiments and witness cleanup.</p>
<h2>What is actually happening now</h2>
<p>The second hidden nest is already active.</p>
<p>It has produced a few juvenile Model 3s. These are dog-like Antithesis predators with jaws that split into three parts. They hunt isolated biomass, kill or disable it, then drag it back to the nest so the nest can grow more Antithesis.</p>
<p>The missing-person pattern is the first visible sign that the cleanup failed.</p>
<h2>The Quill Relay</h2>
<p>The relay is a human data-core stolen by Tamsin Quill.</p>
<p>It contains:</p>
<pre>patient lists
illegal trial records
staff orders
dosage records
researcher rosters
quarantine logs
camera footage
shipping manifests
Antithesis sample inventory
corporate cleanup orders
evidence that locals were used as deniable subjects
footage of Model 1s behaving strangely during cleanup
a buried warning that the Model 1 flight vector was not random</pre>
<p>The relay’s most important clue is initially easy to miss:</p>
<pre>Several Model 1s escaped the destroyed nest and flew somewhere else.</pre>
<p>The corporation dismissed this as terminal erratic behavior.</p>
<p>A dead or missing researcher flagged it as nest-seeding risk before being overruled.</p>
<h2>What “Signal Bleed” means</h2>
<p>Signal Bleed is not literal alien electronics corruption.</p>
<p>The title means:</p>
<pre>The truth is leaking.
The evidence is spreading.
The corporation cannot contain the story.</pre>
<p>In-world, characters may use “signal bleed” to describe the relay’s copied evidence appearing in clinic terminals, camera buffers, student slates, and Redline mesh caches. That is human data leakage and human hacking, not Antithesis influence.</p>
<h2>Main scenario arc</h2>
<ol>
<li><strong>The courier arrives:</strong> Tamsin Quill reaches Mercy Twelve with the relay and collapses.</li>
<li><strong>Human pressure:</strong> the PCs deal with clinic staff, Redline Choir, Bluewire, civilians, corporate observers, surveillance gaps, and the first missing-person clues.</li>
<li><strong>The old nest:</strong> the relay reveals that corporate Antithesis bio-research created a nest. Researchers died. Model 1s were produced. Corporate sterilization destroyed the visible nest.</li>
<li><strong>The wrong conclusion:</strong> footage shows Model 1s flying away in formation. Corporate reports call this “terminal erratic flight.”</li>
<li><strong>The missing people:</strong> the PCs connect missing maintenance workers, food volunteers, Redline lookouts, shelter residents, and drag marks to a second hidden nest.</li>
<li><strong>The hidden nest:</strong> the PCs discover juvenile Model 3s dragging biomass back to the nest.</li>
<li><strong>First Samurai ascension:</strong> the PCs protect civilians under impossible pressure.</li>
<li><strong>Aftermath:</strong> NightCrash arrives as emergency extraction, field recognition, or post-victory contact.</li>
</ol>
<h2>Core GM mystery question</h2>
<pre>Where did the escaped Model 1s go?</pre>
<p>The player-facing question starts as:</p>
<pre>Who gets the relay?</pre>
<p>Then becomes:</p>
<pre>What was the corporation hiding?</pre>
<p>Then becomes:</p>
<pre>Why are people disappearing if the nest was supposedly destroyed?</pre>"
  },
  {
    "name": "Signal Bleed - Missing Person Reports GM",
    "source_file": "handouts/22_Missing_Person_Reports_GM.md",
    "notes": "<h1>Missing Person Reports and Biomass Trail</h1>
<h2>Purpose</h2>
<p>The missing-person trail is how the PCs discover that the corporation’s cleanup failed. The second hidden nest has produced a few juvenile Model 3s. They hunt isolated biomass, kill or disable it, and drag it back to the nest.</p>
<p>The victims are mostly people who move through quiet service routes or are easy to dismiss: maintenance workers, night cleaners, food delivery volunteers, undocumented shelter residents, Redline lookouts, and clinic support staff.</p>
<p>Corporate Recovery initially dismisses the disappearances as gang violence, vagrancy, panic, or people fleeing the district. Redline Choir suspects something is wrong but does not know it is Antithesis.</p>
<h2>Missing: Oskar Venn</h2>
<p><strong>Role:</strong> maintenance worker <strong>Last seen:</strong> C6 HVAC / Air Handling <strong>Likely status:</strong> dead, partly incorporated into the hidden nest</p>
<p>Hooks:</p>
<ul>
<li>Went to check a rattling vent.</li>
<li>Radio cut out after he said: “Something is breathing in here.”</li>
<li>His tool cart is still near C6.</li>
<li>His access badge was used once after he vanished, but only to open a maintenance subdoor.</li>
<li>Drag marks lead toward a hidden maintenance cavity.</li>
<li>A boot with no foot inside is found near a warm vent junction.</li>
</ul>
<h2>Missing: Laleh “Lala” Mir</h2>
<p><strong>Role:</strong> food distribution volunteer <strong>Last seen:</strong> B10 Back Service Corridor <strong>Likely status:</strong> dead or cocooned near the hidden nest</p>
<p>Hooks:</p>
<ul>
<li>Carrying meal crates from a Redline supply route.</li>
<li>Her crate spilled near a service hatch.</li>
<li>Food packets are torn open, but not eaten normally.</li>
<li>A child says she heard “dog feet in the wall.”</li>
<li>Redline Choir thinks she may have been grabbed by corp or rival gang actors.</li>
</ul>
<h2>Missing: Bex Aranda</h2>
<p><strong>Role:</strong> Redline lookout <strong>Last seen:</strong> A13 Service Corridor / C1 Service Street <strong>Likely status:</strong> dead</p>
<p>Hooks:</p>
<ul>
<li>Supposedly deserted their post.</li>
<li>Redline underlings are angry because desertion makes them look weak.</li>
<li>Switch has footage showing a fast, low shape and Bex being dragged upward into a service gap.</li>
<li>Mara wants proof before admitting fear in front of outsiders.</li>
</ul>
<h2>Missing: Narin Pell</h2>
<p><strong>Role:</strong> undocumented shelter resident <strong>Last seen:</strong> B8 Shelter Dorm / B12 Emergency Stair <strong>Likely status:</strong> possibly alive early, dead later if PCs delay</p>
<p>Hooks:</p>
<ul>
<li>Nobody reported it officially because Narin feared authorities.</li>
<li>Sister Luma knows Narin would not leave without their bag.</li>
<li>Their bag is still under a bunk.</li>
<li>A faint organic smear is found near a stair landing.</li>
<li>Someone heard a muffled scream but assumed it was a fight.</li>
</ul>
<h2>Missing: Technician Halden Rook</h2>
<p><strong>Role:</strong> corporate cleanup technician / researcher <strong>Last seen:</strong> old nest sterilization site <strong>Likely status:</strong> dead, evidence trail remains</p>
<p>Hooks:</p>
<ul>
<li>Corporate records list him as reassigned.</li>
<li>Relay logs show he flagged “unexpected Model 1 displacement.”</li>
<li>His final note: “They’re not fleeing. They’re relocating.”</li>
<li>His warning was overruled as panic, trauma, or contamination stress.</li>
</ul>
<h2>Rumor table</h2>
<ol>
<li>“Oskar went into the vents and never came back.”</li>
<li>“Lala would not leave without saying goodbye to the kids.”</li>
<li>“Bex deserted. Or got grabbed. Depends who you ask.”</li>
<li>“The cameras skipped again. Same two seconds, over and over.”</li>
<li>“There’s a sweet-rot smell near the service corridor.”</li>
<li>“Something scratched the inside of a vent cover.”</li>
<li>“Bluewire keeps saying the walls have teeth.”</li>
<li>“Corporate says missing labor is not their jurisdiction.”</li>
<li>“A kid saw little wings, but kids see things.”</li>
<li>“Someone found a shoe behind the duct grating.”</li>
</ol>
<h2>Physical clue ladder</h2>
<h3>Far from nest</h3>
<ul>
<li>missing people</li>
<li>nervous workers</li>
<li>camera gaps</li>
<li>unexplained no-shows</li>
<li>vent rattles</li>
<li>sweet, warm, organic smell</li>
</ul>
<h3>Near routes to nest</h3>
<ul>
<li>three-part bite wounds</li>
<li>claw marks at knee height</li>
<li>drag marks</li>
<li>torn clothing</li>
<li>acid-scored screws</li>
<li>dead rats, insects, or birds fused into residue</li>
<li>warm wet air from cold vents</li>
</ul>
<h3>Near nest</h3>
<ul>
<li>Model 3 tracks</li>
<li>clumps of dead Model 1s dissolved into growing biomass</li>
<li>partially absorbed victims</li>
<li>humming or wet clicking</li>
<li>juveniles dragging prey</li>
<li>thin nest tissue spreading along ducts and insulation</li>
</ul>
<h2>Failure mode</h2>
<p>If the PCs ignore missing-person clues, escalate instead of stalling:</p>
<ul>
<li>a Model 3 attacks a visible NPC</li>
<li>a Redline lookout vanishes during play</li>
<li>a corp trooper is dragged away mid-argument</li>
<li>the ventilation system coughs organic matter into a public area</li>
<li>the nest reaches a threshold and releases more Model 1s</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Antithesis Hidden Nest GM",
    "source_file": "handouts/23_Antithesis_Hidden_Nest_GM.md",
    "notes": "<h1>Antithesis in Signal Bleed: Model 1s, Model 3s, and the Hidden Nest</h1>
<h2>Module-specific Antithesis structure</h2>
<p>Signal Bleed uses a small local nest, not a full-scale invasion.</p>
<h3>Model 1s</h3>
<p>Use Model 1s mainly as backstory and late-stage pressure.</p>
<p>In this module:</p>
<ul>
<li>the original corporate nest produced Model 1s</li>
<li>corporate sterilization nearly wiped them out</li>
<li>several Model 1s escaped in formation</li>
<li>they suicided in a clump at a hidden site</li>
<li>their bodies seeded the second nest</li>
</ul>
<p>The strange Model 1 behavior is the key clue that the corporate cleanup failed.</p>
<h3>Model 3 juveniles</h3>
<p>Use a few juvenile Model 3s as the active present-tense threat.</p>
<p>They are dog-like Antithesis predators with jaws that split into three parts. Their purpose here is not to conquer openly, but to gather biomass for the hidden nest.</p>
<p>Behavior:</p>
<pre>stalk isolated prey
ambush from low angles
disable or kill quickly
drag biomass back to the nest
avoid unnecessary fights with strong groups
retreat through vents, service shafts, and maintenance gaps
become bolder as the nest grows</pre>
<h2>Tactical behavior</h2>
<p>A Model 3 juvenile should try to:</p>
<ul>
<li>attack isolated targets</li>
<li>knock prey down</li>
<li>drag unconscious or dead victims away</li>
<li>retreat if badly hurt</li>
<li>attack civilians, wounded NPCs, lone guards, and panicked targets first</li>
<li>use vents/service routes that humans find awkward</li>
<li>avoid fighting Samurai-capable PCs to the death unless cornered or defending the nest</li>
</ul>
<h2>Horror tell</h2>
<p>The first visible reveal should be the jaw.</p>
<p>Examples:</p>
<pre>Its head opens in three directions.
For one second it looks like a dog.
Then its face unfolds.
The jaw splits like a wet flower with teeth.</pre>
<h2>Encounter pacing</h2>
<h3>First sign — no combat</h3>
<ul>
<li>vent cover bent outward</li>
<li>three-pronged bite marks</li>
<li>drag marks toward a service hatch</li>
<li>a food crate spilled and smeared with organic residue</li>
<li>a camera shows one impossible low blur</li>
<li>someone’s shoe or badge is found near a duct</li>
</ul>
<h3>First glimpse — brief contact</h3>
<ul>
<li>something low and fast crosses the end of a corridor</li>
<li>a jaw opens wrong in a camera freeze-frame</li>
<li>a child says “it was like a dog, but the mouth was wrong”</li>
<li>Bluewire or another unstable NPC hears clicking in the walls</li>
</ul>
<h3>First fight — rescue pressure</h3>
<p>Best first fight setup:</p>
<pre>A Model 3 juvenile has grabbed an NPC and is trying to drag them into a service route.</pre>
<p>Good victims:</p>
<ul>
<li>Redline Lookout #2</li>
<li>Food Line Volunteer</li>
<li>Orderly Pax Ruun</li>
<li>Corp Recovery #2</li>
<li>Narin Pell</li>
<li>random “Bloke #3” token</li>
</ul>
<p>This teaches the players the Model 3 goal: it wants biomass, not a fair fight.</p>
<h3>Nest reveal</h3>
<p>The hidden nest should be small but horrifying:</p>
<ul>
<li>dead Model 1 clump forming the seed</li>
<li>warm wet tissue along ducts</li>
<li>bones/tools/badges partly absorbed</li>
<li>victims used as scaffolding</li>
<li>one possibly savable victim if the PCs were fast</li>
<li>juvenile Model 3s defending or feeding it</li>
<li>signs that it will produce more Antithesis if not stopped</li>
</ul>
<h2>Human faction reaction</h2>
<h3>Clinic</h3>
<p>Horrified, but immediately focused on triage, evacuation, and exposure risk.</p>
<h3>Redline Choir</h3>
<p>Angry and frightened because their people were taken. This can push them into cooperation if the PCs respect them.</p>
<h3>Corporate Recovery</h3>
<p>Initially dismissive or hostile. Once the second nest is proven, Rusk has to choose between admitting the cleanup failed, helping contain the new nest, doubling down on witness control, or trying to destroy everything and blame the neighborhood.</p>
<h2>Skill prompts</h2>
<ul>
<li><strong>Medicine / Surgery:</strong> identify bite trauma, biomass incorporation, whether a victim can be saved.</li>
<li><strong>Tracking / Bounty Hunter:</strong> follow drag marks, identify prey movement, find ambush routes.</li>
<li><strong>Small Arms:</strong> read where shots were fired at something low and fast.</li>
<li><strong>Big Guns:</strong> identify corp sterilization damage from the old nest.</li>
<li><strong>Blades / Melee:</strong> read close-quarters defensive wounds and jaw-strike patterns.</li>
<li><strong>Grease Monkey:</strong> identify duct access, damaged vents, and maintenance routes.</li>
<li><strong>Mesh Hacker:</strong> retrieve camera frames and access logs; this is human surveillance, not alien electronics.</li>
<li><strong>Streetwise:</strong> know which missing people would not have left voluntarily.</li>
<li><strong>Psychology / Empathy:</strong> calm witnesses who saw the jaw unfold.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Missing Person Descriptions GM",
    "source_file": "handouts/24_Missing_Person_Descriptions_GM.md",
    "notes": "<h1>Missing Person Descriptions</h1>
<p>Use these as GM-facing descriptions, witness summaries, and search-result snippets. They are written so each missing person can be introduced through rumors, posters, camera lookups, staff conversations, or Redline reports.</p>
<h2>Oskar Venn</h2>
<p><strong>Public description:</strong> Oskar Venn is a square-shouldered maintenance worker in his late forties, with a shaved head, grey stubble, heavy work gloves, and the permanent squint of someone used to broken lighting. His orange maintenance vest is patched with old union stickers and hand-written tool labels.</p>
<p><strong>How people describe him:</strong> “Careful. Stubborn. Complains about everything, but fixes it anyway.”</p>
<p><strong>Last known clothing:</strong> Orange maintenance vest, dark undershirt, grey utility trousers, tool belt, scuffed magnetic boots.</p>
<p><strong>Last seen:</strong> C6 HVAC / Air Handling.</p>
<p><strong>Found clues:</strong></p>
<ul>
<li>tool cart left in the wrong place</li>
<li>radio log: “Something is breathing in here.”</li>
<li>access badge used once after disappearance</li>
<li>vent cover bent outward</li>
<li>drag marks toward maintenance cavity</li>
<li>one boot found near a warm vent junction</li>
</ul>
<p><strong>What really happened:</strong> A juvenile Model 3 ambushed Oskar near the HVAC junction and dragged him toward the hidden nest. He is probably dead unless the GM wants an early rescue possibility.</p>
<h2>Laleh “Lala” Mir</h2>
<p><strong>Public description:</strong> Lala Mir is a food-distribution volunteer in her twenties or early thirties, usually seen with a bright scarf, delivery harness, and a stack of meal crates balanced like she has done this every day of her life. She has quick hands, a quicker smile, and a habit of remembering who needs extra food without asking publicly.</p>
<p><strong>How people describe her:</strong> “She feeds people before they have to beg.”</p>
<p><strong>Last known clothing:</strong> Teal scarf, volunteer jacket, patched cargo trousers, meal-crate harness.</p>
<p><strong>Last seen:</strong> B10 Back Service Corridor, moving between aid distribution and service routes.</p>
<p><strong>Found clues:</strong></p>
<ul>
<li>spilled meal crates</li>
<li>torn food packets, not eaten normally</li>
<li>a child heard “dog feet in the wall”</li>
<li>service hatch with acid-scored screws</li>
<li>Redline supply marks near the route</li>
</ul>
<p><strong>What really happened:</strong> A juvenile Model 3 caught her near the service hatch and dragged her toward Map C. Her disappearance links Mara’s aid network to the hidden nest trail.</p>
<h2>Bex Aranda</h2>
<p><strong>Public description:</strong> Bex Aranda is a lean Redline Choir lookout with sharp cheekbones, chipped black nail paint, a red scarf tied at one wrist, and a cheap pistol they carry like they are trying to look more dangerous than they feel. They are young enough to be reckless and old enough to know better.</p>
<p><strong>How people describe them:</strong> “Mouthy, scared of nothing, scared of Mara, loyal when it counts.”</p>
<p><strong>Last known clothing:</strong> Dark jacket, red wrist scarf, black work boots, cheap sidearm, Redline token.</p>
<p><strong>Last seen:</strong> A13 Service Corridor / C1 Service Street.</p>
<p><strong>Found clues:</strong></p>
<ul>
<li>dropped Redline token or knife</li>
<li>scrape marks leading upward toward a service gap</li>
<li>corrupted Switch footage showing something low and fast</li>
<li>low-angle blood smear or impact mark</li>
<li>no evidence Bex left voluntarily</li>
</ul>
<p><strong>What really happened:</strong> Bex did not desert. A juvenile Model 3 took them. Proving this gives Mara a direct reason to cooperate.</p>
<h2>Narin Pell</h2>
<p><strong>Public description:</strong> Narin Pell is an undocumented shelter resident in their thirties, thin, watchful, and careful about every doorway. They keep their belongings folded into a single fabric bag and speak softly unless they are helping someone else avoid attention.</p>
<p><strong>How people describe them:</strong> “They survived by not being noticed. That’s why someone should have noticed when they vanished.”</p>
<p><strong>Last known clothing:</strong> Brown coat, soft shoes, threadbare scarf, cloth shoulder bag.</p>
<p><strong>Last seen:</strong> B8 Shelter Dorm / B12 Emergency Stair.</p>
<p><strong>Found clues:</strong></p>
<ul>
<li>bag still under bunk</li>
<li>Sister Luma insists Narin would never leave it</li>
<li>organic smear near stair landing</li>
<li>muffled scream dismissed as a fight</li>
<li>possible trail toward C11 / C12</li>
</ul>
<p><strong>What really happened:</strong> Narin may still be alive if the PCs move quickly. Use them as a rescue timer: the longer the PCs delay, the more likely Narin becomes part of the nest.</p>
<h2>Halden Rook</h2>
<p><strong>Public description:</strong> Halden Rook was a corporate cleanup technician attached to the original nest sterilization operation. He was narrow-faced, precise, and looked more like a lab-safety officer than a soldier. His ID photo shows a man trying very hard not to look frightened.</p>
<p><strong>How people describe him:</strong> “Annoying because he read the procedures. Dangerous because he noticed when the procedures were wrong.”</p>
<p><strong>Last known clothing:</strong> Corporate cleanup suit, sealed helmet, hazard tag, chest-mounted recorder.</p>
<p><strong>Last seen:</strong> Old nest cleanup site / D6 Control Room records.</p>
<p><strong>Found clues:</strong></p>
<ul>
<li>final annotation: “They’re not fleeing. They’re relocating.”</li>
<li>deleted warning: “nest-seeding risk”</li>
<li>overruled report classification: “terminal erratic flight”</li>
<li>relay copy of his helmet feed</li>
<li>personnel file marked reassigned instead of dead</li>
</ul>
<p><strong>What really happened:</strong> Halden understood that the Model 1s were not fleeing randomly. His warning was buried because admitting it would mean the cleanup had failed.</p>
<h2>How to present missing-person evidence</h2>
<p>Start mundane. Do not reveal Antithesis immediately.</p>
<p>Good first descriptions:</p>
<ul>
<li>“No-show patient.”</li>
<li>“Maintenance worker missing after a vent call.”</li>
<li>“Food volunteer did not come back.”</li>
<li>“Gang lookout deserted.”</li>
<li>“Shelter resident left without their bag.”</li>
</ul>
<p>Then sharpen the pattern:</p>
<ul>
<li>all routes touch service infrastructure</li>
<li>all disappearances happen near ducts, stairs, or back corridors</li>
<li>camera footage is missing, edited, or shows low fast movement</li>
<li>there are drag marks and biological residue</li>
<li>people heard clicking, dog feet, or breathing in the walls</li>
</ul>
<h2>Quick token labels</h2>
<p>Use these for clue markers:</p>
<pre>Oskar’s Tool Cart
Lala’s Spilled Crates
Bex’s Redline Token
Narin’s Bag
Halden’s Deleted Warning
Warm Vent Smear
Bent Vent Cover
Model 3 Drag Marks</pre>"
  },
  {
    "name": "Signal Bleed - Supporting NPCs and Spies GM",
    "source_file": "handouts/25_Supporting_NPCs_and_Spies_GM.md",
    "notes": "<h1>Supporting NPCs and Spies</h1>
<p>These NPCs are intended as map tokens, conversation targets, suspects, witnesses, and pressure valves. They are less important than the faction heads, but they make the maps feel populated and give players people to talk to.</p>
<h2>Mercy Twelve Clinic</h2>
<h3>Senior Nurse Imani Cho</h3>
<p><strong>Token name:</strong> Nurse Cho <strong>Location:</strong> A3 Reception or A5 Triage <strong>Role:</strong> clinic floor lead <strong>Use:</strong> practical guide, triage authority, patient-protection voice</p>
<p>Hooks:</p>
<ul>
<li>knows which patients cannot be evacuated quickly</li>
<li>knows Lala Mir by name from food distribution</li>
<li>suspects recent “no-shows” are connected</li>
<li>can authorize access to non-private clinic logs if Dr. Valez agrees</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>terrified that the relay proves the clinic unknowingly treated illegal trial subjects</li>
</ul>
<h3>Orderly Pax Ruun</h3>
<p><strong>Token name:</strong> Pax Ruun <strong>Location:</strong> A6 Emergency Intake <strong>Role:</strong> nervous witness <strong>Use:</strong> emergency-bay clue source</p>
<p>Hooks:</p>
<ul>
<li>saw unusual patient transfers</li>
<li>recognizes a supposedly discharged patient from relay files</li>
<li>knows the courier did not arrive through the official bay</li>
<li>may panic if Corporate Recovery enters the clinic</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>deleted one minor intake note because he feared being blamed</li>
</ul>
<h3>Rafa Mbeki</h3>
<p><strong>Token name:</strong> Rafa Mbeki or Clinic Security <strong>Location:</strong> A10 Records / clinic security alcove <strong>Role:</strong> clinic camera monitor <strong>Use:</strong> control-room cooperation point</p>
<p>Hooks:</p>
<ul>
<li>can pull clinic camera feeds</li>
<li>knows privacy-disabled rooms</li>
<li>noticed missing footage near patient transfers</li>
<li>can compare clinic doors with Redline street cameras if Switch cooperates</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>sat on some camera anomalies because reporting them would invite corporate seizure</li>
</ul>
<h3>Dr. Vela Myung</h3>
<p><strong>Token name:</strong> Dr. Myung <strong>Location:</strong> A7 Trauma / A9 Recovery <strong>Role:</strong> tired trauma doctor <strong>Use:</strong> medical interpretation of exposure-trial victims</p>
<p>Hooks:</p>
<ul>
<li>can identify false treatment protocols in relay files</li>
<li>notices that some “medicine” had trial-batch codes</li>
<li>can identify Model 3 bite trauma once shown a victim</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>once accepted corporate-donated medicine without asking enough questions</li>
</ul>
<h2>Redline Choir</h2>
<h3>Vex Tan</h3>
<p><strong>Token name:</strong> Vex Tan or Redline Runner <strong>Location:</strong> B4 Pantry / B10 Service Corridor <strong>Role:</strong> supply runner <strong>Use:</strong> aid-route witness</p>
<p>Hooks:</p>
<ul>
<li>moved food and medicine through unofficial routes</li>
<li>knows Lala’s normal route</li>
<li>can confirm Mara ordered no shooting near the clinic</li>
<li>can show where Redline cameras stop</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>smuggles some personal side goods; worried PCs will mistake that for the main crime</li>
</ul>
<h3>Juno “Switch” Hale</h3>
<p><strong>Token name:</strong> Switch <strong>Location:</strong> B10 Back Corridor or C9 Monitoring <strong>Role:</strong> Redline camera sitter <strong>Use:</strong> surveillance witness and spy</p>
<p>Hooks:</p>
<ul>
<li>has footage of Bex being dragged toward a service gap</li>
<li>knows Redline blind spots</li>
<li>can compare camera angles with clinic feeds</li>
<li>saw corp biohazard containers moving before the current incident</li>
</ul>
<p>Spy status:</p>
<ul>
<li><strong>Spy for Corporate Recovery, by pressure.</strong></li>
<li>Switch sold selected feed access to a corporate handler to pay medical debt / protect someone in Redline territory.</li>
<li>Switch did not know about the second nest and did not intend to get people killed.</li>
<li>If exposed, Switch can still become useful if offered protection or a way out.</li>
</ul>
<h3>Rook “Mads” Madsen</h3>
<p><strong>Token name:</strong> Mads <strong>Location:</strong> A1 Indoor Street / A13 Service Corridor <strong>Role:</strong> Redline underling <strong>Use:</strong> suspicious muscle with useful local knowledge</p>
<p>Hooks:</p>
<ul>
<li>knows Bex did not seem like a deserter</li>
<li>can point toward service routes</li>
<li>recognizes corp observers by posture</li>
<li>can be talked into evacuation help if Bex’s fate is proven</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>hates Bluewire and may escalate if Bluewire is humiliated</li>
</ul>
<h3>Talla “Auntie’s Eyes” Vey</h3>
<p><strong>Token name:</strong> Talla <strong>Location:</strong> B3 Commons / B4 Pantry <strong>Role:</strong> Mara loyalist and aid coordinator <strong>Use:</strong> protects Mara’s hidden soft power</p>
<p>Hooks:</p>
<ul>
<li>knows who receives food and medicine</li>
<li>knows Lala, Miri, and Sol</li>
<li>can confirm Mara funds school meals if PCs earn trust</li>
<li>will deny everything if asked like an accusation</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>not actually family, despite the surname; uses it because Mara saved her years ago</li>
</ul>
<h2>Corporate Recovery</h2>
<h3>Lt. Varya Senn</h3>
<p><strong>Token name:</strong> Lt. Senn <strong>Location:</strong> A1 Concourse / C1 Service Street <strong>Role:</strong> Rusk’s field second <strong>Use:</strong> tactical pressure and escalation</p>
<p>Hooks:</p>
<ul>
<li>more aggressive than Rusk</li>
<li>wants a clean seizure before crowds form</li>
<li>can recognize Model 3 evidence as impossible if she saw old cleanup files</li>
<li>may accept a temporary ceasefire only after proof of the second nest</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>believes witness control is ugly but necessary</li>
</ul>
<h3>Orlan Pike</h3>
<p><strong>Token name:</strong> Feed Handler or Bloke #3 <strong>Location:</strong> off-map, C9 Monitoring, or D6 Control Room <strong>Role:</strong> corporate surveillance handler <strong>Use:</strong> spy, footage editor, evidence suppressor</p>
<p>Hooks:</p>
<ul>
<li>edits camera footage</li>
<li>injects false timestamps</li>
<li>bought access from Switch</li>
<li>can be identified by mesh/camera forensics</li>
<li>tries to frame Redline Choir for disappearances</li>
</ul>
<p>Spy status:</p>
<ul>
<li><strong>Spy inside local systems for Corporate Recovery, by greed and career ambition.</strong></li>
<li>He is the handler pressuring Switch.</li>
<li>If exposed, Rusk may deny authorizing him, even if Rusk benefits from his work.</li>
</ul>
<h3>Corp Recovery Pair</h3>
<p><strong>Token names:</strong> Corp Recovery #1, Corp Recovery #2 <strong>Location:</strong> A1, C1, or D3 <strong>Role:</strong> disciplined mooks <strong>Use:</strong> tactical and moral pressure</p>
<p>Hooks:</p>
<ul>
<li>one can be dragged by a Model 3 to prove the threat is real</li>
<li>one may break discipline to save a civilian</li>
<li>Small Arms / Tactics can read their formation and intent</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>they were briefed on witness cleanup, not on an active second nest</li>
</ul>
<h3>Mara Silex</h3>
<p><strong>Token name:</strong> Corp Medic <strong>Location:</strong> A1 / C1 / D3 <strong>Role:</strong> corporate field medic <strong>Use:</strong> uneasy corporate conscience</p>
<p>Hooks:</p>
<ul>
<li>recognizes exposure-treatment batch codes</li>
<li>can stabilize victims</li>
<li>knows some corporate medical orders are indefensible</li>
<li>may quietly help if civilians are at risk</li>
</ul>
<p>Spy status:</p>
<ul>
<li><strong>Potential Mercy Twelve informant, by conscience.</strong></li>
<li>She has leaked fragments to Dr. Valez before, but not enough to expose herself.</li>
<li>Can become an ally if PCs protect her from Rusk/Senn.</li>
</ul>
<h2>Community / civilians</h2>
<h3>Miri and Sol</h3>
<p><strong>Token name:</strong> Miri &amp; Sol <strong>Location:</strong> A4 Pediatric Corner or B7 Children’s Corner <strong>Role:</strong> schoolchildren witnesses <strong>Use:</strong> Auntie Red clue and missing-person emotional hook</p>
<p>Hooks:</p>
<ul>
<li>overheard: “Auntie Red paid for breakfast again.”</li>
<li>know Lala used to bring food</li>
<li>heard “dog feet in the wall”</li>
<li>may have seen Keet hide relay fragments or a student slate</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>adults keep telling them not to talk</li>
</ul>
<h3>Keet</h3>
<p><strong>Token name:</strong> Keet <strong>Location:</strong> B6 Classroom / B7 Children’s Corner <strong>Role:</strong> child witness / student tech helper <strong>Use:</strong> route and data-leak clue</p>
<p>Hooks:</p>
<ul>
<li>copied a relay fragment to a school slate</li>
<li>saw strange service-route movement</li>
<li>knows which children heard what</li>
<li>can identify the first place people started avoiding</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>afraid Redline or corp will punish whoever talks</li>
</ul>
<h3>Sister Luma</h3>
<p><strong>Token name:</strong> Sister Luma <strong>Location:</strong> A3 Waiting / B9 Counselor Offices <strong>Role:</strong> counselor and emotional stabilizer <strong>Use:</strong> witness trust, Bluewire/Narin connection</p>
<p>Hooks:</p>
<ul>
<li>knows Narin would not leave voluntarily</li>
<li>can calm witnesses</li>
<li>can interpret Bluewire’s fear as trauma, not just aggression</li>
<li>may get civilians to cooperate with evacuation</li>
</ul>
<p>Secret pressure:</p>
<ul>
<li>keeps unofficial records of undocumented residents</li>
</ul>
<h2>Recommended spy placement</h2>
<p>Use at least two:</p>
<pre>Switch → compromised by Corporate Recovery, pressured by medical debt.
Orlan Pike → corporate surveillance handler, greedy/careerist.
Mara Silex → corporate medic leaking to Mercy Twelve by conscience.</pre>
<p>For a shorter game, use only Switch and Pike.</p>
<p>For a richer game, add Silex as a possible redemption/contact NPC.</p>
<h2>Spy pressure on the Valez/Vey relationship</h2>
<p>Orlan Pike can use the Sera/Mara relationship as blackmail material.</p>
<p>Possible plays:</p>
<ul>
<li>leak that Mercy Twelve is “gang-compromised”</li>
<li>imply Sera knowingly launders Redline aid</li>
<li>suggest Mara is hiding behind her sister’s clinic</li>
<li>pressure Switch to deliver footage proving Mara’s aid routes pass through clinic-adjacent spaces</li>
<li>pressure Mara Silex to stop quietly helping the clinic</li>
</ul>
<p>This should make the spy subplot feel tied to the main social conflict, not like a disconnected side mystery.</p>"
  },
  {
    "name": "Signal Bleed - Roll20 Installation and Asset Linking",
    "source_file": "handouts/26_Roll20_Installation_and_Asset_Linking.md",
    "notes": "<h1>Roll20 Module Installation and Asset Linking Guide</h1>
<p>This guide is for a GM installing Signal Bleed into a Roll20 game.</p>
<p>The GitHub package already contains split portrait files and token files. GMs should <strong>not</strong> run the portrait-splitting script unless they are rebuilding the portrait assets from the original triptych images.</p>
<h2>What the importer can and cannot do</h2>
<p>The Roll20 importer can create:</p>
<pre>GM-only handouts
GM-only NPC character entries
character avatars from selected uploaded portrait graphics
default tokens from selected uploaded token graphics</pre>
<p>The importer cannot do these things automatically:</p>
<pre>upload image files into your Roll20 Art Library
create Journal folders reliably
move Journal entries into folders reliably
place map images for you
draw Dynamic Lighting walls
configure every page setting perfectly</pre>
<p>So the basic installation pattern is:</p>
<pre>1. Create Roll20 pages.
2. Upload/place maps, portraits, and tokens.
3. Install the importer script.
4. Import handouts and NPC character entries.
5. Link staged portraits/tokens to the imported NPC sheets.
6. Manually organize Journal folders.</pre>
<p>The image upload/staging work can be done before or after installing the script, but the actual linking step must happen <strong>after</strong> the NPC character entries exist.</p>
<h2>1. Create Roll20 pages</h2>
<p>Use the existing Roll20 <code>Start</code> page as the landing page. You may rename it, but that is optional.</p>
<p>Create these additional pages manually:</p>
<pre>Floor A - Clinic and Indoor Street
Floor B - Community Support
Floor C - Service Utility
Floor D - Quarantine Incident
Asset Staging - Portraits
Asset Staging - Tokens</pre>
<h3>Page settings</h3>
<p>When you turn Grid off, Roll20 shows page size in pixels. The old 40 × 30 grid-square recommendation is equivalent to 2800 × 2100 pixels because Roll20’s normal square is 70 pixels.</p>
<p>For <code>Start</code> and Floor A–D pages:</p>
<pre>Grid: Off
Width: 2800 px
Height: 2100 px</pre>
<p>For asset staging pages:</p>
<pre>Grid: Off
Width: 1750 px
Height: 1750 px</pre>
<p>If a map feels cramped, use:</p>
<pre>Width: 2800 px
Height: 2800 px</pre>
<p>With Grid off, you do not need a separate snap-to-grid setting.</p>
<h2>2. Upload and place maps</h2>
<p>Upload the map images from the repository’s <code>maps/</code> folder into Roll20.</p>
<p>Suggested placement:</p>
<pre>Start
  Optional splash / landing image

Floor A - Clinic and Indoor Street
  maps/10_Map_Floor_A_Clinic_and_Indoor_Street.png

Floor B - Community Support
  maps/11_Map_Floor_B_Community_Support.png

Floor C - Service Utility
  maps/12_Map_Floor_C_Service_Utility.png

Floor D - Quarantine Incident
  maps/13_Map_Floor_D_Quarantine_Incident.png</pre>
<p>For each map page:</p>
<ol>
<li>Open the page.</li>
<li>Switch to the <strong>Map &amp; Background</strong> layer.</li>
<li>Drag/upload the map image onto the page.</li>
<li>Resize it to fit the page area.</li>
<li>Right-click the image and send it to the back if needed.</li>
<li>Lock it if your Roll20 UI supports locking placed images.</li>
</ol>
<p>The current maps have baked-in visual grids. Recommended setup:</p>
<pre>Roll20 Grid: Off
Use the baked-in visual grid only as a visual guide
Use Dynamic Lighting / Fog of War manually if desired</pre>
<h2>3. Upload portraits and tokens</h2>
<p>The GitHub repository already has ready-to-upload images:</p>
<pre>portraits/
tokens/</pre>
<p>Do <strong>not</strong> run this unless you are regenerating portraits from the original triptych sheets:</p>
<pre>python3 split_signal_bleed_portraits.py</pre>
<p>That step was used during asset creation, not normal GM installation.</p>
<h3>Upload portraits</h3>
<p>Upload all PNG files in:</p>
<pre>portraits/</pre>
<p>to Roll20.</p>
<p>Detailed workflow:</p>
<ol>
<li>Open Roll20.</li>
<li>Open the <strong>Art Library</strong> tab.</li>
<li>Upload or drag the portrait PNG files into the library.</li>
<li>Open the <code>Asset Staging - Portraits</code> page.</li>
<li>Drag each uploaded portrait from the Art Library onto that page.</li>
<li>Arrange them loosely so they are easy to select.</li>
<li>The placed graphic names should match the filenames without <code>.png</code>.</li>
</ol>
<p>Examples:</p>
<pre>Dr. Sera Valez
Mara Mother Red Vey
Nox Bluewire Kade
Juno Switch Hale
Commander Ilan Rusk</pre>
<p>If Roll20 gives a placed graphic a strange name, open the token/graphic settings and rename it.</p>
<h3>Upload tokens</h3>
<p>Upload all PNG files in:</p>
<pre>tokens/</pre>
<p>to Roll20.</p>
<p>Detailed workflow:</p>
<ol>
<li>Open Roll20.</li>
<li>Open the <strong>Art Library</strong> tab.</li>
<li>Upload or drag the token PNG files into the library.</li>
<li>Open the <code>Asset Staging - Tokens</code> page.</li>
<li>Drag each uploaded token from the Art Library onto that page.</li>
<li>Arrange them loosely so they are easy to select.</li>
<li>The placed graphic names should match the filenames without <code>.png</code>.</li>
</ol>
<p>Examples:</p>
<pre>Dr. Sera Valez
Mara Mother Red Vey
Model 1 Juvenile
Model 1 Adolescent
Model 1 Adult
Model 3 Juvenile
Model 3 Adolescent
Model 3 Adult</pre>
<p>The importer is forgiving about punctuation, quotes, and a few known aliases, but exact readable names are best.</p>
<h2>4. Install the importer script</h2>
<p>Open the Roll20 game, then go to:</p>
<pre>Game Settings / Mod Scripts / API Scripts</pre>
<p>Create a new script named:</p>
<pre>HopePunk Signal Bleed Importer</pre>
<p>Paste the contents of:</p>
<pre>roll20/hopepunk_signal_bleed_importer.js</pre>
<p>Save the script.</p>
<h2>5. Import handouts and NPC character entries</h2>
<p>In Roll20 chat, run:</p>
<pre>!hopepunk-signal-bleed --dry-run</pre>
<p>If the dry run looks right, import everything:</p>
<pre>!hopepunk-signal-bleed --import</pre>
<p>To update existing imported content later:</p>
<pre>!hopepunk-signal-bleed --overwrite</pre>
<p>To import only NPCs:</p>
<pre>!hopepunk-signal-bleed --import --npcs</pre>
<p>To import only handouts:</p>
<pre>!hopepunk-signal-bleed --import --handouts</pre>
<p>Imported handouts and characters appear at the root of the Journal. Move them into folders manually after import.</p>
<h2>6. Link portraits to character avatars</h2>
<p>Go to the <code>Asset Staging - Portraits</code> page.</p>
<p>Select all staged portrait graphics.</p>
<p>Run:</p>
<pre>!hopepunk-signal-bleed --link-selected-portraits --dry-run</pre>
<p>Review the output. It should show lines like:</p>
<pre>Dr. Sera Valez -&gt; Dr. Sera Valez: would set avatar
Mara Mother Red Vey -&gt; Mara “Mother Red” Vey: would set avatar</pre>
<p>If the matches look right, run:</p>
<pre>!hopepunk-signal-bleed --link-selected-portraits</pre>
<p>To replace existing avatars:</p>
<pre>!hopepunk-signal-bleed --link-selected-portraits --overwrite</pre>
<h2>7. Link tokens to default tokens</h2>
<p>Go to the <code>Asset Staging - Tokens</code> page.</p>
<p>Select all staged token graphics.</p>
<p>Run:</p>
<pre>!hopepunk-signal-bleed --link-selected-tokens --dry-run</pre>
<p>Review the output. If the matches look right, run:</p>
<pre>!hopepunk-signal-bleed --link-selected-tokens</pre>
<p>To replace existing default tokens:</p>
<pre>!hopepunk-signal-bleed --link-selected-tokens --overwrite</pre>
<h2>8. Combined linking option</h2>
<p>If you only have one staged image per character and want that image to serve as both avatar and default token, select the graphics and run:</p>
<pre>!hopepunk-signal-bleed --link-selected-assets --dry-run
!hopepunk-signal-bleed --link-selected-assets</pre>
<p>For this module, the cleaner workflow is usually:</p>
<pre>portraits/ -&gt; --link-selected-portraits
tokens/    -&gt; --link-selected-tokens</pre>
<h2>9. Suggested Journal organization</h2>
<p>Create folders manually after import:</p>
<pre>NPCs
  Mercy Twelve Clinic
  Redline Choir
  Corporate Recovery
  Community / Civilians

Bestiary
  Model 1 Juvenile
  Model 1 Adolescent
  Model 1 Adult
  Model 3 Juvenile
  Model 3 Adolescent
  Model 3 Adult

Handouts
  Player-facing
  GM-only
  Maps / Keys
  Installation</pre>
<p>Suggested player-facing handouts to share:</p>
<pre>Signal Bleed - Player Start Here
Signal Bleed - Player Hooks</pre>
<p>Keep GM-only handouts hidden unless you intentionally reveal them.</p>
<h2>10. Troubleshooting</h2>
<h3>The linker says no selected graphics</h3>
<p>Select the staged image objects on the tabletop first, then run the command.</p>
<h3>The linker says no matching character</h3>
<p>Check the staged graphic name. It should resemble the imported character name.</p>
<p>Good:</p>
<pre>Mara Mother Red Vey
Nox Bluewire Kade
Model 3 Adolescent</pre>
<p>Bad:</p>
<pre>image.png
download 7
token</pre>
<h3>The linker says ambiguous match</h3>
<p>Rename the staged graphic more specifically, then rerun the dry run.</p>
<h3>The linked token does not look right</h3>
<p>Use <code>--overwrite</code> after adjusting the staged token’s size, name, bars, aura, or settings. The default token copies the staged graphic’s current token settings.</p>
<h3>The map image keeps moving</h3>
<p>Make sure you are on the Map &amp; Background layer when placing maps. If your Roll20 UI supports locking, lock the map after placement.</p>
<h3>The script does not upload images</h3>
<p>Correct. Roll20 Mod/API scripts cannot upload local PNG files into your Art Library. Upload the images manually first.</p>"
  },
  {
    "name": "Signal Bleed - Valez Vey Family Tension GM",
    "source_file": "handouts/27_Valez_Vey_Family_Tension_GM.md",
    "notes": "<h1>Valez / Vey Family Tension</h1>
<h2>Canon update</h2>
<p>Dr. Sera Valez and Mara “Mother Red” Vey are estranged sisters.</p>
<p>They were born Sera Valez and Mara Valez. Sera kept the family name and built a life around medicine, legitimacy, and public trust. Mara cut the family name down to <strong>Vey</strong> after prison, Redline initiation, exile, or simply because she refused to carry a respectable name while doing necessary dirty work.</p>
<p>They look similar enough that observant PCs may notice it quickly.</p>
<p>Do not treat this as a hidden “gotcha.” It is a pressure point, a social clue, and a way to make the neighborhood politics more personal.</p>
<h2>Core dynamic</h2>
<p>Sera and Mara protect the same people through incompatible methods.</p>
<pre>Sera protects people through medicine, legitimacy, records, triage, and public moral authority.
Mara protects people through territory, fear, smuggling, favors, retaliation, and informal power.</pre>
<p>Neither sister is entirely wrong.</p>
<p>Neither sister wants the PCs to weaponize the relationship in public.</p>
<h2>Public truth</h2>
<p>Most locals know there is history between Dr. Valez and Mother Red, but not everyone knows exactly what it is.</p>
<p>Children and old residents may speak more freely:</p>
<pre>“Auntie Red paid for breakfast again.”
“Don’t call her that where grown-ups hear.”
“Why?”
“Because she gets mad when people know she’s nice.”</pre>
<p>“Auntie Red” is partly community slang and partly literal family residue. Mara is not everyone’s aunt, but she has acted like one often enough that children use the name.</p>
<h2>What Sera says</h2>
<p>Sera does not deny the relationship if directly and respectfully confronted, but she refuses gossip.</p>
<p>Possible lines:</p>
<p>&gt; “Mara is my sister. She is also the reason half these children ate last month. She is also the reason three men came in with broken ribs. Both things are true.”</p>
<p>&gt; “Do not use my family to start a war in my clinic.”</p>
<p>&gt; “I heal the people who make it through my doors. Mara keeps some of them alive long enough to reach those doors. That does not make her methods clean.”</p>
<h2>What Mara says</h2>
<p>Mara hates sounding sentimental. She deflects first.</p>
<p>Possible lines:</p>
<p>&gt; “Sera saves people who make it through her doors. I save the ones who never get that far.”</p>
<p>&gt; “She thinks I chose this. I think she chose a room with windows and called it virtue.”</p>
<p>&gt; “Say ‘sister’ like it gives you leverage and I will show you what leverage is.”</p>
<h2>How to reveal it</h2>
<p>Use any of these:</p>
<ul>
<li>A child calls Mara “Auntie Red.”</li>
<li>Sera and Mara argue with the rhythm of people who have done it since childhood.</li>
<li>Sister Luma refers to “the Valez girls” before correcting herself.</li>
<li>Mara knows old clinic maintenance details she should not know.</li>
<li>Sera knows Redline aid routes but pretends she does not.</li>
<li>A family photo in a clinic back room shows two similar young women, one with Sera’s name and one with Mara’s old surname.</li>
<li>Talla “Auntie’s Eyes” Vey uses “Vey” because Mara took her in, not because they are blood relatives.</li>
</ul>
<h2>How it affects negotiations</h2>
<p>The relationship should create routes, not close them.</p>
<h3>If PCs respect both sisters</h3>
<ul>
<li>Sera may ask Mara for evacuation help.</li>
<li>Mara may order Redline to protect clinic corridors.</li>
<li>Both may agree to keep the relay in clinic custody temporarily.</li>
<li>Redline aid routes can become evacuation routes.</li>
<li>The sisters can coordinate without admitting reconciliation.</li>
</ul>
<h3>If PCs expose the relationship mockingly</h3>
<ul>
<li>Mara becomes hostile.</li>
<li>Sera shuts down personal questions.</li>
<li>Redline underlings interpret it as an attack on Mara’s reputation.</li>
<li>Children and civilians become less willing to talk.</li>
</ul>
<h3>If PCs try to blackmail either sister</h3>
<ul>
<li>It should backfire.</li>
<li>The community may resent outsiders exploiting a family wound.</li>
<li>Corporate Recovery may learn the link and use it to pressure both factions.</li>
</ul>
<h2>How Corporate Recovery can use it</h2>
<p>Commander Rusk may not know the relationship at first.</p>
<p>Orlan Pike may discover it through surveillance and try to exploit it:</p>
<pre>Leak the relationship to make Sera look gang-compromised.
Frame Redline aid as clinic corruption.
Suggest Mara is using the clinic as a shield.
Pressure Sera with “your sister’s criminal network.”
Pressure Mara with “your sister’s medical license.”</pre>
<p>This gives the spy subplot teeth.</p>
<h2>How the hidden nest changes the relationship</h2>
<p>Once the second nest is proven, the sisters’ conflict becomes secondary.</p>
<p>The best scene is not a reconciliation speech. It is a tactical compromise:</p>
<pre>Sera: “I need patients out.”
Mara: “I need your back doors open.”
Sera: “No weapons in recovery.”
Mara: “No uniforms near the children.”
Sera: “Done.”
Mara: “Done.”</pre>
<p>They still disagree. They still move.</p>
<h2>GM use</h2>
<p>Use this relationship to make social scenes sharper:</p>
<ul>
<li>Sera can veto violence in the clinic.</li>
<li>Mara can unlock routes, lookouts, and aid networks.</li>
<li>Either sister can force the other to act if civilians are in danger.</li>
<li>Corporate exploitation of the family tie can reveal the spy/handler plot.</li>
<li>The PCs can become trusted only by proving they are not trying to own the sisters’ history.</li>
</ul>"
  },
  {
    "name": "Signal Bleed - Antithesis Escalation and Boss Options GM",
    "source_file": "handouts/28_Antithesis_Escalation_and_Boss_Options_GM.md",
    "notes": "<h1>Antithesis Escalation and Boss Options</h1>
<h2>Purpose</h2>
<p>Signal Bleed is written as a starter job, but the Antithesis threat can scale.</p>
<p>By default, the hidden nest has produced a few juvenile Model 3s. That is enough for a tense starter scenario, especially if civilians, evacuation, bad visibility, and faction conflict are active at the same time.</p>
<p>Some GMs may want a harder climax. The module now supports optional adolescent and adult Model 1 / Model 3 tokens for that purpose.</p>
<h2>Player durability note</h2>
<p>Hope//Punk characters may look fragile if judged only by HP. They are harder to kill in practice because they can be wounded twice and only die on the third wound. Each time they are wounded, they restore to full health.</p>
<p>That means a starter group can sometimes survive more pressure than a first glance at HP suggests.</p>
<p>Use that durability to create desperate heroic scenes, not to grind the party down with unavoidable damage.</p>
<h2>Recommended baseline</h2>
<p>For a starter group, use:</p>
<pre>1–3 Juvenile Model 3s across the scenario
Model 1s as evidence, background, or late pressure
one hidden nest hazard/objective
many civilians to protect</pre>
<p>A single Juvenile Model 3 should not always fight to the death. It should try to grab biomass and escape.</p>
<h2>Optional boss fight: Adolescent Model 3</h2>
<p>For a stronger climax, add one Adolescent Model 3 as the hidden nest’s first major defender.</p>
<p>Use this when:</p>
<pre>there are 4+ PCs
the players are tactically competent
the PCs have already ascended or are about to
the group wants a clear boss fight
NightCrash is available only as emergency extraction, not solution</pre>
<p>Good placement:</p>
<pre>C12 Hidden Maintenance Cavity
C6 HVAC / Air Handling
C5 Water Recycling
D9 Service Bypass if the fight moves vertically</pre>
<p>Boss-fight objective ideas:</p>
<ul>
<li>hold it off while civilians evacuate</li>
<li>stop it from dragging Narin or another victim into the nest</li>
<li>destroy the seed clump while it protects the nest</li>
<li>force it into a sterilization choke point</li>
<li>survive long enough for a newly ascended Samurai to act</li>
</ul>
<h2>Adult Model 3</h2>
<p>Use an Adult Model 3 only if the GM wants a much more dangerous scenario.</p>
<p>Good reasons:</p>
<ul>
<li>larger party</li>
<li>combat-heavy table</li>
<li>late-campaign revisit of Signal Bleed</li>
<li>failed containment after the starter job</li>
<li>“bad ending” escalation if the hidden nest is ignored</li>
</ul>
<p>For a true starter session, an Adult Model 3 should usually be foreshadowing or a timer, not the expected fight.</p>
<p>Example:</p>
<pre>The adult is not fully emerged.
The PCs must prevent it from finishing.</pre>
<h2>Model 1 escalation</h2>
<p>Model 1s are the clue that the second nest exists. They are also a possible timer.</p>
<p>Use:</p>
<pre>juvenile Model 1 evidence in relay footage
dead Model 1 seed clump in the hidden nest
adolescent/adult Model 1 tokens only if the nest matures or the GM wants a swarm scene</pre>
<p>Model 1s work best as:</p>
<ul>
<li>motion in vents</li>
<li>swarm pressure</li>
<li>aerial harassment</li>
<li>evidence that the nest is producing again</li>
<li>a “contain this now” warning</li>
</ul>
<h2>Suggested scaling by group</h2>
<h3>2–3 PCs</h3>
<ul>
<li>one Juvenile Model 3 at a time</li>
<li>no adolescent unless heavily wounded or objective-based</li>
<li>NightCrash available as evacuation safety valve</li>
<li>focus on rescue and containment</li>
</ul>
<h3>4 PCs</h3>
<ul>
<li>one or two Juvenile Model 3s</li>
<li>optional Adolescent Model 3 as boss</li>
<li>civilians and faction complications active</li>
</ul>
<h3>5+ PCs</h3>
<ul>
<li>two Juvenile Model 3s plus one Adolescent Model 3</li>
<li>or one Adolescent Model 3 with Model 1 swarm pressure</li>
<li>multiple simultaneous objectives</li>
</ul>
<h2>Boss-fight design rule</h2>
<p>Do not make the climax only “reduce HP to zero.”</p>
<p>Better objectives:</p>
<pre>destroy the Model 1 seed clump
save a victim before they are absorbed
hold a corridor for three rounds
restore elevator power
seal the vent network
force corp and Redline to stop shooting
broadcast the relay while under attack</pre>
<h2>Token names in repository</h2>
<p>The repository token folder includes optional escalation art using these filenames:</p>
<pre>model 1 juvenile.png
model 1 adolescent.png
model 1 adult.png
model 3 juvenile.png
model 3 adolescent.png
model 3 adult.png</pre>
<p>The importer expects the standardized filenames above.</p>
<h2>Roll20 folder suggestion</h2>
<p>Put these in a Journal folder named:</p>
<pre>Bestiary</pre>
<p>Suggested character names:</p>
<pre>Model 1 Juvenile
Model 1 Adolescent
Model 1 Adult
Model 3 Juvenile
Model 3 Adolescent
Model 3 Adult</pre>
<p>The importer can create basic GM-only entries and link selected tokens. Full mechanical stat import still depends on confirming the exact Hope//Punk sheet attribute names.</p>"
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

  function normalizeName(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\.png$|\.jpg$|\.jpeg$|\.webp$|\.gif$/i, '')
      .replace(/[“”"']/g, '')
      .replace(/[’]/g, '')
      .replace(/\([^)]*\)/g, ' ')
            .replace(/aunties/g, 'auntie s')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\b(dr|doctor|commander|cmdr|lt|lieutenant|the|token|portrait)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function bioForNpc(npc) {
    return [
      '<h2>' + esc(npc.name) + '</h2>',
      '<p><strong>Role:</strong> ' + esc(npc.role) + '</p>',
      '<p><strong>Faction:</strong> ' + esc(npc.faction) + '</p>',
      '<p><strong>Attitude:</strong> ' + esc(npc.attitude) + '</p>',
      '<h3>Wants</h3>',
      list(npc.wants),
      '<h3>Offers / Useful interaction</h3>',
      list(npc.offers)
    ].join('');
  }

  function gmnotesForNpc(npc) {
    return [
      '<h2>GM Notes</h2>',
      '<p><strong>Import type:</strong> ' + esc(npc.import_as || 'gm_only_character') + '</p>',
      '<p><strong>Token note:</strong> ' + esc(npc.token_note || 'Create map token manually.') + '</p>',
      '<h3>Secrets</h3>',
      list(npc.secrets),
      '<h3>Use in Play</h3>',
      '<p>' + esc(npc.gm_notes) + '</p>'
    ].join('');
  }

  function findByName(type, name) {
    var matches = findObjs({ _type: type, name: name });
    return matches && matches.length ? matches[0] : null;
  }

  function allCharacters() {
    return findObjs({ _type: 'character' }) || [];
  }

  function aliasFor(wanted) {
    var aliases = {
      'sera valez': 'sera valez',
      'valez': 'sera valez',
      'mara mother red vey': 'mara mother red vey',
      'mother red': 'mara mother red vey',
      'mara vey': 'mara mother red vey',
      'mara valez': 'mara mother red vey',
      'bluewire': 'nox bluewire kade',
      'switch': 'juno switch hale',
      'nightcrash': 'florence nightcrash vale',
      'siren saint': 'siren saint',
      'nurse cho': 'imani cho',
      'corp medic': 'mara silex',
      'feed handler': 'orlan pike',
      'bloke 3': 'orlan pike',
      'dying courier': 'tamsin quill',
      'model 1 juvenile': 'model 1 juvenile',
      'model one juvenile': 'model 1 juvenile',
      'model 1 adolescent': 'model 1 adolescent',
      'model one adolescent': 'model 1 adolescent',
      'model 1 adult': 'model 1 adult',
      'model one adult': 'model 1 adult',
      'juvenile model 3': 'model 3 juvenile',
      'model 3 juvenile': 'model 3 juvenile',
      'model three juvenile': 'model 3 juvenile',
      'model three adolescent': 'model 3 adolescent',
      'model 3 adult': 'model 3 adult',
      'model three adult': 'model 3 adult'
    };
    return aliases[wanted] || null;
  }

  function findCharacterByLooseName(name) {
    var wanted = normalizeName(name);
    if (!wanted) return { status: 'no-name', matches: [] };

    var alias = aliasFor(wanted);
    if (alias) wanted = normalizeName(alias);

    var chars = allCharacters();
    var exact = chars.filter(function (c) {
      return normalizeName(c.get('name')) === wanted;
    });
    if (exact.length === 1) return { status: 'ok', character: exact[0], matches: exact };
    if (exact.length > 1) return { status: 'ambiguous', matches: exact };

    var contains = chars.filter(function (c) {
      var cn = normalizeName(c.get('name'));
      return cn.indexOf(wanted) !== -1 || wanted.indexOf(cn) !== -1;
    });
    if (contains.length === 1) return { status: 'ok', character: contains[0], matches: contains };
    if (contains.length > 1) return { status: 'ambiguous', matches: contains };

    return { status: 'not-found', matches: [] };
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

  function selectedGraphics(msg) {
    if (!msg.selected || !msg.selected.length) return [];
    return msg.selected.map(function (s) {
      if (s._type !== 'graphic') return null;
      return getObj('graphic', s._id);
    }).filter(function (g) { return !!g; });
  }

  function normalizeImgsrc(src) {
    src = String(src || '');
    return src.replace(/\/max\.(jpg|jpeg|png|gif|webp)(\?[^?]*)?$/i, '/thumb.$1$2')
              .replace(/\/med\.(jpg|jpeg|png|gif|webp)(\?[^?]*)?$/i, '/thumb.$1$2')
              .replace(/\/original\.(jpg|jpeg|png|gif|webp)(\?[^?]*)?$/i, '/thumb.$1$2');
  }

  function setDefaultToken(character, graphic) {
    if (typeof setDefaultTokenForCharacter === 'function') {
      setDefaultTokenForCharacter(character, graphic);
    } else {
      var tokenJSON = graphic.toJSON();
      tokenJSON.represents = character.id;
      character.set('defaulttoken', JSON.stringify(tokenJSON));
    }
  }

  function linkSelected(msg, mode, overwrite, dryRun) {
    var graphics = selectedGraphics(msg);
    if (!graphics.length) {
      sendChat('Signal Bleed', '/w gm No selected graphics found. Select staged portrait/token graphics on the tabletop first.');
      return;
    }

    var results = [];

    graphics.forEach(function (g) {
      var tokenName = g.get('name') || '';
      var match = findCharacterByLooseName(tokenName);
      if (match.status !== 'ok') {
        var detail = '';
        if (match.status === 'ambiguous') {
          detail = ' — matches: ' + match.matches.map(function (c) { return esc(c.get('name')); }).join(', ');
        }
        results.push('<strong>' + esc(tokenName || '(unnamed graphic)') + '</strong>: ' + esc(match.status) + detail);
        return;
      }

      var character = match.character;
      var characterName = character.get('name');
      var imgsrc = normalizeImgsrc(g.get('imgsrc'));

      if (!imgsrc) {
        results.push('<strong>' + esc(tokenName) + '</strong> → ' + esc(characterName) + ': no imgsrc found');
        return;
      }

      var changes = [];
      var needsAvatar = (mode === 'portrait' || mode === 'both');
      var needsToken = (mode === 'token' || mode === 'both');

      if (needsAvatar && !overwrite && character.get('avatar')) {
        changes.push('avatar skipped existing');
      } else if (needsAvatar) {
        if (!dryRun) character.set('avatar', imgsrc);
        changes.push(dryRun ? 'would set avatar' : 'avatar set');
      }

      if (needsToken && !overwrite && character.get('defaulttoken')) {
        changes.push('default token skipped existing');
      } else if (needsToken) {
        if (!dryRun) {
          try {
            g.set('represents', character.id);
            setDefaultToken(character, g);
          } catch (e) {
            results.push('<strong>' + esc(tokenName) + '</strong> → ' + esc(characterName) + ': default token failed: ' + esc(e.message || e));
            return;
          }
        }
        changes.push(dryRun ? 'would set default token' : 'default token set');
      }

      results.push('<strong>' + esc(tokenName) + '</strong> → ' + esc(characterName) + ': ' + changes.join(', '));
    });

    sendChat('Signal Bleed', '/w gm <strong>Asset linking results</strong><br>' + results.join('<br>'));
  }

  function showHelp() {
    sendChat('Signal Bleed', '/w gm <strong>Hope//Punk Signal Bleed Importer</strong><br>' +
      '<code>' + COMMAND + ' --dry-run</code><br>' +
      '<code>' + COMMAND + ' --import</code> imports all NPCs and handouts that do not already exist<br>' +
      '<code>' + COMMAND + ' --overwrite</code> updates/replaces all NPC and handout content<br>' +
      '<code>' + COMMAND + ' --import --npcs</code> imports NPCs only<br>' +
      '<code>' + COMMAND + ' --import --handouts</code> imports handouts only<br><br>' +
      '<strong>Asset linking:</strong><br>' +
      '<code>' + COMMAND + ' --link-selected-portraits --dry-run</code><br>' +
      '<code>' + COMMAND + ' --link-selected-portraits</code> sets avatars from selected graphics<br>' +
      '<code>' + COMMAND + ' --link-selected-tokens --dry-run</code><br>' +
      '<code>' + COMMAND + ' --link-selected-tokens</code> sets default tokens from selected graphics<br>' +
      '<code>' + COMMAND + ' --link-selected-assets</code> sets both avatar and default token from selected graphics<br>' +
      '<code>' + COMMAND + ' --link-selected-tokens --overwrite</code> replaces existing links<br><br>' +
      '<strong>Current embedded content:</strong><br>' +
      NPCS.length + ' NPC character entries<br>' +
      HANDOUTS.length + ' handouts<br><br>' +
      'Roll20 images must be uploaded manually first, then dragged to a staging page and selected.');
  }

  function handle(msg) {
    if (msg.type !== 'api') return;
    if (msg.content.indexOf(COMMAND) !== 0) return;

    var dryRun = msg.content.indexOf('--dry-run') !== -1;
    var overwrite = msg.content.indexOf('--overwrite') !== -1;

    if (msg.content.indexOf('--help') !== -1) {
      showHelp();
      return;
    }

    if (msg.content.indexOf('--link-selected-portraits') !== -1) {
      linkSelected(msg, 'portrait', overwrite, dryRun);
      return;
    }
    if (msg.content.indexOf('--link-selected-tokens') !== -1) {
      linkSelected(msg, 'token', overwrite, dryRun);
      return;
    }
    if (msg.content.indexOf('--link-selected-assets') !== -1) {
      linkSelected(msg, 'both', overwrite, dryRun);
      return;
    }

    var doImport = msg.content.indexOf('--import') !== -1;
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

  return { handle: handle };
}());
