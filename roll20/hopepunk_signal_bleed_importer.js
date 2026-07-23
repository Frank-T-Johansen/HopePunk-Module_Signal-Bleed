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
//   !hopepunk-signal-bleed --name-selected
//   !hopepunk-signal-bleed --name-selected --asset-order
//   !hopepunk-signal-bleed --name-selected --asset-order --reverse
//   !hopepunk-signal-bleed --link-selected-portraits
//   !hopepunk-signal-bleed --link-selected-tokens
//   !hopepunk-signal-bleed --link-selected-assets
//   !hopepunk-signal-bleed --gm-labels floor-a
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
    "notes_b64": "PGgxPkdNIE92ZXJ2aWV3OiBTaWduYWwgQmxlZWQ8L2gxPgo8aDI+UGl0Y2g8L2gyPgo8cD5BIGNvbW11bml0eSBjbGluaWMgaGFzIHJlY2VpdmVkIGEgZGFtYWdlZCBtZXNoIHJlbGF5L2RhdGEtY29yZSBmcm9tIGEgZHlpbmcgY291cmllci4gVGhlIGRldmljZSBhbGxlZ2VkbHkgY29udGFpbnMgZXZpZGVuY2Ugb2YgY29ycG9yYXRlIG1lZGljYWwgY3JpbWVzIGluIHRoZSBkaXN0cmljdC4gVGhlIGNsaW5pYyB3YW50cyB0byB2ZXJpZnkgdGhlIGRhdGEgYmVmb3JlIGJyb2FkY2FzdGluZyBpdC4gVGhlIGxvY2FsIGdhbmcgd2FudHMgdGhlIG5laWdoYm9yaG9vZCB0byBoYXZlIGEgc2F5IGJlZm9yZSBhbnlvbmUgaGFuZHMgaXQgdG8gb3V0c2lkZXJzLiBBIGNvcnBvcmF0ZSByZWNvdmVyeSB0ZWFtIHdhbnRzIHRoZSBkZXZpY2UgYmFjay48L3A+CjxwPlRoZSBQQ3MgYXJlIGdhdGhlcmVkIGZvciB3aGF0IHNvdW5kcyBsaWtlIGEgc2ltcGxlIGNvbW11bml0eSBwcm90ZWN0aW9uIGpvYjo8L3A+CjxibG9ja3F1b3RlPktlZXAgdGhlIHBlYWNlIGZvciBvbmUgZXZlbmluZy4gUHJvdGVjdCB0aGUgY2xpbmljLiBEbyBub3QgbGV0IHRoZSBkZXZpY2UgbGVhdmUgdW50aWwgaXQgaGFzIGJlZW4gdmVyaWZpZWQuIEF2b2lkIGJsb29kc2hlZCBpZiBwb3NzaWJsZS48L2Jsb2NrcXVvdGU+CjxwPlRoZW4gdGhlIHNpZ25hbCBzdGFydHMgYmxlZWRpbmcgdGhyb3VnaC48L3A+CjxoMj5Ub25lPC9oMj4KPHA+U2lnbmFsIEJsZWVkIHNob3VsZCBzdGFydCBodW1hbi1zY2FsZSBhbmQgZ3JvdW5kZWQ6IG92ZXJ3b3JrZWQgY2xpbmljIHN0YWZmLCBodW5ncnkgc2Nob29sa2lkcywgc2NhcmVkIHBhdGllbnRzLCB0ZXJyaXRvcmlhbCBnYW5nIHVuZGVybGluZ3MsIHByb2Zlc3Npb25hbCBjb3Jwb3JhdGUgcHJlc3N1cmUsIGFuZCBvcmRpbmFyeSBwZW9wbGUgdHJ5aW5nIHRvIHN1cnZpdmUuPC9wPgo8cD5UaGUgYWxpZW4gZWxlbWVudCBzaG91bGQgZmVlbCBsaWtlIGFuIGVzY2FsYXRpb24gaW50byBIb3BlLy9QdW5rIHByb3Blci4gVGhlIFBDcyB3ZXJlIGFscmVhZHkgdHJ5aW5nIHRvIGhlbHAgYmVmb3JlIHRoZSB3b3JsZCBiZWNhbWUgaW1wb3NzaWJsZS48L3A+CjxoMj5Db3JlIGRlc2lnbiBydWxlPC9oMj4KPHA+Tm8gaHVtYW4gZmFjdGlvbiBpcyBhIG1hbmRhdG9yeSBlbmVteS4gTm8gaHVtYW4gZmFjdGlvbiBpcyBndWFyYW50ZWVkIHRvIGJlY29tZSBhbiBhbGx5LiBFdmVyeSBodW1hbiBmYWN0aW9uIGhhcyBhdCBsZWFzdCBvbmUgZGlwbG9tYXRpYyBzb2x1dGlvbi4gRXZlcnkgZGlwbG9tYXRpYyBzb2x1dGlvbiBoYXMgYSBjb3N0LiBUaGUgYWxpZW5zIGd1YXJhbnRlZSB0aGUgZmluYWwgcHJlc3N1cmUuPC9wPgo8aDI+SHVtYW4gZmFjdGlvbnM8L2gyPgo8aDM+TWVyY3kgVHdlbHZlIENsaW5pYzwvaDM+CjxwPlRoZSBjbGluaWMgcHJvdGVjdHMgcGVvcGxlIHRocm91Z2ggY2FyZSwgdHJpYWdlLCBzaGVsdGVyLCBhbmQgaW5mb3JtYXRpb24uPC9wPgo8cD5MZWFkZXI6IDxzdHJvbmc+RHIuIFNlcmEgVmFsZXo8L3N0cm9uZz48L3A+CjxwPkRlZmF1bHQgYmVoYXZpb3I6IGhlbHBmdWwsIGV4aGF1c3RlZCwgcHJvdGVjdGl2ZSwgbmVnb3RpYXRpb24tZm9jdXNlZC48L3A+CjxoMz5UaGUgUmVkbGluZSBDaG9pcjwvaDM+CjxwPlRoZSBsb2NhbCBnYW5nIHByb3RlY3RzIHBlb3BsZSB0aHJvdWdoIHRlcnJpdG9yeSwgZmVhciwgc211Z2dsaW5nLCBmYXZvcnMsIGFuZCByZXRhbGlhdG9yeSB2aW9sZW5jZS48L3A+CjxwPkxlYWRlcjogPHN0cm9uZz5NYXJhIOKAnE1vdGhlciBSZWTigJ0gVmV5PC9zdHJvbmc+PC9wPgo8cD5EZWZhdWx0IGJlaGF2aW9yOiBzdXNwaWNpb3VzLCB0ZXJyaXRvcmlhbCwgYnV0IHJhdGlvbmFsIGlmIHJlc3BlY3RlZC48L3A+CjxoMz5Db3Jwb3JhdGUgUmVjb3ZlcnkgVGVhbTwvaDM+CjxwPlRoZSBjb3Jwb3JhdGUgcmVjb3ZlcnkgdGVhbSB3YW50cyB0aGUgcmVsYXkgcmVjb3ZlcmVkIGFuZCB0aGUgZXZpZGVuY2Ugc3VwcHJlc3NlZC48L3A+CjxwPkxlYWRlcjogPHN0cm9uZz5Db21tYW5kZXIgSWxhbiBSdXNrPC9zdHJvbmc+PC9wPgo8cD5EZWZhdWx0IGJlaGF2aW9yOiBob3N0aWxlIGJ1dCByYXRpb25hbC4gVGhleSBwcmVmZXIgY29udGFpbm1lbnQsIGxldmVyYWdlLCBhbmQgcGxhdXNpYmxlIGRlbmlhYmlsaXR5IG92ZXIgb3BlbiBtYXNzYWNyZS48L3A+CjxoMj5UaGUgbm9uLW5lZ290aWFibGUgdGhyZWF0PC9oMj4KPHA+VGhlIHNpZ25hbCBkZXZpY2UgY29udGFpbnMgb3IgY2FycmllcyBhbGllbiBjb250YW1pbmF0aW9uLiBJdCBpcyBub3QganVzdCBldmlkZW5jZS4gSXQgaXMgYSBiZWFjb24sIHdvdW5kLCByZWNlaXZlciwgZWdnLCBvciBsdXJlLjwvcD4KPHA+VGhlIGZpcnN0IGFsaWVuIGV2ZW50IHNob3VsZCBoYXBwZW4gYWZ0ZXIgcGxheWVycyBoYXZlIGhhZCB0aW1lIHRvIGNhcmUgYWJvdXQgdGhlIGNsaW5pYyBhbmQgdW5kZXJzdGFuZCB0aGUgZmFjdGlvbnMuPC9wPg=="
  },
  {
    "name": "Signal Bleed - Player Start Here",
    "source_file": "handouts/01_Player_Start_Here.md",
    "notes_b64": "PGgxPlBsYXllciBTdGFydCBIZXJlOiBTaWduYWwgQmxlZWQ8L2gxPgo8cD5Zb3UgY2FuIGZpbmQgdGhlIEhvcGUvL1B1bmsgcnVsZXMgYW5kIGluZm9ybWF0aW9uIGF0OjwvcD4KPHA+aHR0cHM6Ly9yYXZlbnNkYWdnZXIuaXRjaC5pby9ob3BlcHVuazwvcD4KPHA+SG9wZS8vUHVuayBpcyBjb3B5cmlnaHQgUmF2ZW5zRGFnZ2VyLiBUaGlzIGlzIGp1c3QgYSBmYW4gY3JlYXRpb24uPC9wPgo8aDI+Q2hvb3NpbmcgYSBwcmVnZW48L2gyPgo8cD5QaWNrIGEgcHJlZ2VuIGJ5IGNob29zaW5nIGEgQmFja2dyb3VuZCwgdGhlbiBhc2sgdGhlIEdNIHRvIG1vdmUgdGhhdCBjaGFyYWN0ZXIgZnJvbSB0aGUgPHN0cm9uZz5QcmVnZW5zPC9zdHJvbmc+IGZvbGRlciB0byB0aGUgPHN0cm9uZz5DaGFyYWN0ZXJzPC9zdHJvbmc+IGZvbGRlciBhbmQgYXNzaWduIGl0IHRvIHlvdS48L3A+CjxwPlRoZSBjaGFyYWN0ZXIgbmFtZXMgYXJlIHdyaXR0ZW4gYXM6PC9wPgo8cHJlPkNoYXJhY3RlciBOYW1lIChCYWNrZ3JvdW5kKTwvcHJlPgo8cD5UaGUgcGFydCBpbiBwYXJlbnRoZXNlcyBpcyBvbmx5IHRoZXJlIHRvIG1ha2UgcHJlZ2VucyBlYXNpZXIgdG8gcGljay48L3A+CjxoMj5DdXN0b21pemluZyBiZWZvcmUgcGxheTwvaDI+CjxwPllvdSBtYXkgY3VzdG9taXplIHRoZSBwcmVnZW4gYmVmb3JlIHBsYXk6PC9wPgo8aDM+MS4gUmVuYW1lIHRoZSBjaGFyYWN0ZXI8L2gzPgo8cD5UaGUgbmFtZSBhbmQgaGFuZGxlIGFyZSBvbmx5IHN1Z2dlc3Rpb25zLiBZb3UgbWF5IHJlbW92ZSB0aGUg4oCcKEJhY2tncm91bmQp4oCdIHBhcnQgZnJvbSB0aGUgY2hhcmFjdGVyIG5hbWUgYWZ0ZXIgY2hvb3NpbmcgdGhlIHByZWdlbi48L3A+CjxwPllvdSBtYXkgYWxzbyBjaGFuZ2UgdGhlIHBvcnRyYWl0L3Rva2VuIGlmIHlvdSB3YW50LjwvcD4KPGgzPjIuIE1vdmUgc3RhcnRpbmcgc2tpbGwgcG9pbnRzPC9oMz4KPHA+RWFjaCBwcmVnZW4gaGFzIHR3byBleHRyYSBzdGFydGluZyBza2lsbCBwb2ludHMgYWxyZWFkeSBzcGVudC4gVGhlc2UgYXJlIHNob3duIGFzIHNraWxscyB3aXRoIDIgcG9pbnRzLjwvcD4KPHA+WW91IG1heSBtb3ZlIG9uZSBvciBib3RoIG9mIHRob3NlIGV4dHJhIHBvaW50czo8L3A+Cjx1bD4KPGxpPnJlbW92ZSAxIHBvaW50IGZyb20gYSBza2lsbCB0aGF0IGhhcyAyIHBvaW50czwvbGk+CjxsaT5hZGQgdGhhdCBwb2ludCB0byBhbnkgb3RoZXIgc2tpbGwgdGhhdCBjdXJyZW50bHkgaGFzIDAgb3IgMSBwb2ludDwvbGk+CjwvdWw+CjxwPkRvIG5vdCByZWR1Y2UgYSBCYWNrZ3JvdW5kIHNraWxsIGJlbG93IDEgaWYgaXQgd2FzIHBhcnQgb2YgdGhlIHByZWdlbuKAmXMgc3RhcnRpbmcgQmFja2dyb3VuZCBwYWNrYWdlLCB1bmxlc3MgdGhlIEdNIGFsbG93cyBhIGxhcmdlciByZWJ1aWxkLjwvcD4KPGgzPjMuIE1vdmUgcHJvZmljaWVuY2llczwvaDM+CjxwPkVhY2ggcHJlZ2VuIGhhcyB0d28gcHJvZmljaWVuY2llcy48L3A+CjxwPllvdSBtYXkgbW92ZSBlaXRoZXIgcHJvZmljaWVuY3kgdG8gYW55IHNraWxsIHRoYXQgaGFzIGF0IGxlYXN0IDEgcG9pbnQgYWZ0ZXIgeW91ciBza2lsbCBjaGFuZ2VzLjwvcD4KPHA+VGhpcyBtZWFucyB5b3UgbWF5IGZpcnN0IG1vdmUgYSBza2lsbCBwb2ludCBpbnRvIGEgMC1wb2ludCBza2lsbCwgbWFraW5nIGl0IDEsIGFuZCB0aGVuIG1vdmUgYSBwcm9maWNpZW5jeSB0byB0aGF0IG5ld2x5IGNob3NlbiBza2lsbC48L3A+CjxoMz40LiBTcGVuZCBtb25leTwvaDM+CjxwPllvdSBtYXkgc3BlbmQgcmVtYWluaW5nIG1vbmV5IHRvIGJ1eSBhZGRpdGlvbmFsIGdlYXIuIFNlZSB0aGUgcnVsZWJvb2sgZm9yIHdoYXQgaXMgYXZhaWxhYmxlLjwvcD4KPGgzPjUuIEtlZXAgdGhlIEJhY2tncm91bmQ8L2gzPgo8cD5UaGUgQmFja2dyb3VuZCwgQmFja2dyb3VuZCBBYmlsaXR5LCBhbmQgc3RhcnRpbmcgZ2VhciBhcmUgcGFydCBvZiB0aGUgcHJlZ2Vu4oCZcyBjaG9zZW4gQmFja2dyb3VuZCBwYWNrYWdlLjwvcD4KPHA+QXNrIHRoZSBHTSBiZWZvcmUgY2hhbmdpbmcgdGhvc2UuPC9wPgo8aDI+U3RhcnRpbmcgc2l0dWF0aW9uPC9oMj4KPHA+WW91IGFyZSBhdCA8c3Ryb25nPk1lcmN5IFR3ZWx2ZTwvc3Ryb25nPiwgYSBjb21tdW5pdHkgY2xpbmljIGluIGEgbmVnbGVjdGVkIGRpc3RyaWN0LjwvcD4KPHA+WW91IHdlcmUgaGlyZWQsIGFza2VkLCBwcmVzc3VyZWQsIG9yIHBlcnNvbmFsbHkgZHJhd24gaW50byBhIHNpbXBsZSBwcm90ZWN0aW9uIGpvYjo8L3A+CjxibG9ja3F1b3RlPktlZXAgdGhlIHBlYWNlIGZvciBvbmUgZXZlbmluZy4gUHJvdGVjdCB0aGUgY2xpbmljLiBEbyBub3QgbGV0IGEgZGFtYWdlZCByZWxheS9kYXRhLWNvcmUgbGVhdmUgdW50aWwgaXQgaGFzIGJlZW4gY2hlY2tlZC4gQXZvaWQgYmxvb2RzaGVkIGlmIHBvc3NpYmxlLjwvYmxvY2txdW90ZT4KPHA+SXQgc2hvdWxkIGhhdmUgYmVlbiBzaW1wbGUuPC9wPg=="
  },
  {
    "name": "Signal Bleed - Player Hooks",
    "source_file": "handouts/02_Player_Hooks.md",
    "notes_b64": "PGgxPlBsYXllciBIb29rczogV2h5IEFyZSBZb3UgYXQgTWVyY3kgVHdlbHZlPzwvaDE+CjxwPkNob29zZSBvbmUsIHJvbGwgb25lLCBvciBtYWtlIHlvdXIgb3duIHdpdGggdGhlIEdNLjwvcD4KPGgyPkdlbmVyYWwgaG9va3M8L2gyPgo8b2w+CjxsaT48c3Ryb25nPkhpcmVkIEd1YXJkPC9zdHJvbmc+IOKAlCBZb3Ugd2VyZSBwYWlkIHRvIGhlbHAgcHJvdGVjdCB0aGUgY2xpbmljIGR1cmluZyBhIHRlbnNlIGRhdGEgaGFuZG9mZi48L2xpPgo8bGk+PHN0cm9uZz5Pd2VkIEZhdm9yPC9zdHJvbmc+IOKAlCBUaGUgY2xpbmljIHBhdGNoZWQgeW91IHVwIG9uY2UgYW5kIG5ldmVyIGFza2VkIHdobyBzaG90IHlvdS4gTm93IERyLiBWYWxleiBpcyBjYWxsaW5nIGluIHRoZSBmYXZvci48L2xpPgo8bGk+PHN0cm9uZz5Mb2NhbCBDb25uZWN0aW9uPC9zdHJvbmc+IOKAlCBTb21lb25lIHlvdSBjYXJlIGFib3V0IGxpdmVzIG5lYXJieSwgd29ya3MgYXQgdGhlIGNsaW5pYywgYXR0ZW5kcyB0aGUgc2Nob29sLCBvciBkZXBlbmRzIG9uIHRoZSBjbGluaWPigJlzIG1lZGljaW5lLjwvbGk+CjxsaT48c3Ryb25nPkNvdXJpZXIgQ29udGFjdDwvc3Ryb25nPiDigJQgWW91IGtuZXcgdGhlIGNvdXJpZXIgd2hvIGJyb3VnaHQgaW4gdGhlIGRldmljZSwgb3IgeW91IHdlcmUgc3VwcG9zZWQgdG8gbWVldCB0aGVtLjwvbGk+CjxsaT48c3Ryb25nPkdhbmcgQ29udGFjdDwvc3Ryb25nPiDigJQgTWFyYeKAmXMgcGVvcGxlIGFza2VkIHlvdSB0byBhdHRlbmQgYXMgYW4gb3V0c2lkZSB3aXRuZXNzLCBzcGVjaWFsaXN0LCBvciBuZXV0cmFsIHBhcnR5LjwvbGk+CjxsaT48c3Ryb25nPkNvcnAgVHJvdWJsZTwvc3Ryb25nPiDigJQgVGhlIGNvcnBvcmF0aW9uIGludm9sdmVkIGhhcyBodXJ0IHlvdSBiZWZvcmUuIFlvdSB3YW50IHByb29mLjwvbGk+CjxsaT48c3Ryb25nPlBhaWQgU3BlY2lhbGlzdDwvc3Ryb25nPiDigJQgWW91IHdlcmUgYnJvdWdodCBpbiBmb3IgYSBzcGVjaWZpYyBza2lsbDogaGFja2luZywgZHJpdmluZywgbWVkaWNpbmUsIHNlY3VyaXR5LCByZXBhaXJzLCBuZWdvdGlhdGlvbiwgb3IgaW52ZXN0aWdhdGlvbi48L2xpPgo8bGk+PHN0cm9uZz5Xcm9uZyBQbGFjZSwgUmlnaHQgVGltZTwvc3Ryb25nPiDigJQgWW91IGNhbWUgdG8gdGhlIGNsaW5pYyBmb3IgaGVscCwgc2hlbHRlciwgbWVkaWNpbmUsIHJlcGFpcnMsIG9yIGluZm9ybWF0aW9uLCBhbmQgZ290IHB1bGxlZCBpbnRvIHRoZSBjcmlzaXMuPC9saT4KPC9vbD4KPGgyPkJhY2tncm91bmQtc3BlY2lmaWMgaWRlYXM8L2gyPgo8cD48c3Ryb25nPkJvdW50eSBIdW50ZXI6PC9zdHJvbmc+IFlvdSB3ZXJlIGhpcmVkIHRvIHdhdGNoIGZvciB0aGUgbWlzc2luZyBjb3VyaWVyIG9yIGlkZW50aWZ5IHdobyBpcyB0cmFja2luZyB0aGUgY2xpbmljLjwvcD4KPHA+PHN0cm9uZz5DYXQgQnVyZ2xhcjo8L3N0cm9uZz4gWW91IHdlcmUgYXNrZWQgdG8gcXVpZXRseSBjaGVjayB3aGV0aGVyIHNvbWVvbmUgaGFzIGFscmVhZHkgcGxhbnRlZCBhIHRyYWNrZXIgb3IgbGlzdGVuaW5nIGRldmljZSBpbnNpZGUgdGhlIGNsaW5pYy48L3A+CjxwPjxzdHJvbmc+Q29ycG9yYXRlIFNlY3VyaXR5Ojwvc3Ryb25nPiBEci4gVmFsZXogd2FudHMgc29tZW9uZSB3aG8gdW5kZXJzdGFuZHMgY29ycG9yYXRlIHJlY292ZXJ5IHByb3RvY29scy48L3A+CjxwPjxzdHJvbmc+Q3liZXItSnVua2llOjwvc3Ryb25nPiBUaGUgZGFtYWdlZCByZWxheSBpcyBzY3JlYW1pbmcgYWNyb3NzIHRoZSBtZXNoIGluIHdheXMgb25seSB5b3UgY2FuIGZlZWwuPC9wPgo8cD48c3Ryb25nPkRlc2VydCBDb3VyaWVyOjwvc3Ryb25nPiBZb3Uga25ldyB0aGUgY291cmllciByb3V0ZS4gVGhlIHBlcnNvbiB3aG8gZGVsaXZlcmVkIHRoZSBkZXZpY2Ugc2hvdWxkIG5vdCBoYXZlIHJlYWNoZWQgdGhlIGNsaW5pYyBhbGl2ZS48L3A+CjxwPjxzdHJvbmc+RXgtTWlsaXRhcnk6PC9zdHJvbmc+IFlvdSB3ZXJlIGhpcmVkIHRvIGFzc2VzcyB0aGUgY2xpbmlj4oCZcyBkZWZlbnNlcyBhbmQgZXZhY3VhdGUgY2l2aWxpYW5zIGlmIHZpb2xlbmNlIHN0YXJ0cy48L3A+CjxwPjxzdHJvbmc+R2FtYmxlciBvbiB0aGUgUnVuOjwvc3Ryb25nPiBZb3Ugb3dlIHRoZSBjbGluaWMsIE1hcmEsIG9yIHRoZSBjb3VyaWVyLiBUaGlzIHdhcyBzdXBwb3NlZCB0byBiZSBhIHF1aWNrIHBhaWQgZmF2b3IuPC9wPgo8cD48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IFRoZSBjbGluaWPigJlzIGdlbmVyYXRvciwgYW1idWxhbmNlLCBjYXJnbyBsaWZ0LCBvciByZWxheSBoYXJkd2FyZSBpcyBmYWlsaW5nLjwvcD4KPHA+PHN0cm9uZz5HdXR0ZXIgUmF0IE9ycGhhbjo8L3N0cm9uZz4gWW91IGtub3cgdGhlIGJhY2sgcm91dGVzLCByb29mIGdhcHMsIHVuZGVyd2F5cywgYW5kIHdoaWNoIGtpZHMgc2F3IHRoZSBjb3VyaWVyIGFycml2ZS48L3A+CjxwPjxzdHJvbmc+TWVzaCBIYWNrZXI6PC9zdHJvbmc+IFlvdSB3ZXJlIGhpcmVkIHRvIHZlcmlmeSwgZGVjcnlwdCwgb3IgaXNvbGF0ZSB0aGUgc2lnbmFsLjwvcD4KPHA+PHN0cm9uZz5QaWxvdDo8L3N0cm9uZz4gVGhlIGNsaW5pYyBtYXkgbmVlZCBhbiBlbWVyZ2VuY3kgZXh0cmFjdGlvbiwgcm9vZnRvcCBwaWNrdXAsIG9yIGRyb25lL3ZlaGljbGUgc3VwcG9ydC48L3A+CjxwPjxzdHJvbmc+UGlzcy1Qb29yIEFydGlzdDo8L3N0cm9uZz4gWW91IGFyZSBjb25uZWN0ZWQgdG8gdGhlIGxvY2FsIHNjaG9vbCwgbXVyYWwgcHJvamVjdCwgcHJvdGVzdCBuZXR3b3JrLCBvciB1bmRlcmdyb3VuZCBicm9hZGNhc3Qgc2NlbmUuPC9wPgo8cD48c3Ryb25nPlJlbGlnaW91cyBGYW5hdGljOjwvc3Ryb25nPiBZb3UgYmVsaWV2ZSB0aGUgY2xpbmljLCB0aGUgc3VmZmVyaW5nIHBhdGllbnRzLCBvciB0aGUgc2lnbmFsIGhhcyBzcGlyaXR1YWwgc2lnbmlmaWNhbmNlLjwvcD4KPHA+PHN0cm9uZz5Sb2d1ZSBTdXJnZW9uOjwvc3Ryb25nPiBEci4gVmFsZXogbmVlZHMgbWVkaWNhbCBoZWxwIHdpdGggYSBwYXRpZW50IGV4cG9zZWQgdG8gdGhlIGRldmljZS48L3A+CjxwPjxzdHJvbmc+U2FtdXJhaSBPdGFrdTo8L3N0cm9uZz4gWW91IGNhbWUgYmVjYXVzZSBydW1vcnMgc2F5IHRoZSBzaWduYWwgY29udGFpbnMgcmVhbCBTYW11cmFpIHRlbGVtZXRyeS48L3A+CjxwPjxzdHJvbmc+U2NhdmVuZ2VyOjwvc3Ryb25nPiBZb3UgcmVjb2duaXplIHRoZSByZWxheSBoYXJkd2FyZSBhcyBzb21ldGhpbmcgc2FsdmFnZWQgZnJvbSBhIGZvcmJpZGRlbiB6b25lLjwvcD4KPHA+PHN0cm9uZz5TdHVkZW50IERyb3BvdXQ6PC9zdHJvbmc+IFlvdSBrbm93IHRoZSBzY2hvb2xraWRzLCB0aGUgY29tbXVuaXR5IHR1dG9ycywgb3IgdGhlIHN0dWRlbnQgbWVzaCBuZXR3b3JrIHRoYXQgZmlyc3Qgbm90aWNlZCB0aGUgc2lnbmFsLjwvcD4KPHA+PHN0cm9uZz5UZXN0IFN1YmplY3Q6PC9zdHJvbmc+IFRoZSBzaWduYWwgY2F1c2VzIHN5bXB0b21zIHRoYXQgZmVlbCBob3JyaWJseSBmYW1pbGlhci48L3A+CjxwPjxzdHJvbmc+VW5kZXJncm91bmQgRmlnaHRlcjo8L3N0cm9uZz4gWW91IHdlcmUgaGlyZWQgYXMgdmlzaWJsZSBtdXNjbGUsIG9yIGEgbG9jYWwga2lkIGZyb20gdGhlIGNsaW5pYyBmb2xsb3dzIHlvdXIgZmlnaHRzLjwvcD4KPHA+PHN0cm9uZz5XYXNoZWQgVXAgUm9ja2VyOjwvc3Ryb25nPiBUaGUgY2xpbmljIHdhbnRzIHlvdXIgcHVibGljIHZvaWNlLCBvbGQgY29udGFjdHMsIG9yIGFiaWxpdHkgdG8gY2FsbSBhIGNyb3dkLjwvcD4="
  },
  {
    "name": "Signal Bleed - Mercy Twelve Clinic",
    "source_file": "handouts/03_Mercy_Twelve_Clinic.md",
    "notes_b64": "PGgxPk1lcmN5IFR3ZWx2ZSBDbGluaWM8L2gxPgo8aDI+UGxheWVyLWZhY2luZyBzdW1tYXJ5PC9oMj4KPHA+TWVyY3kgVHdlbHZlIGlzIGEgY29tbXVuaXR5IGNsaW5pYywgc2hlbHRlciwgbmlnaHQtc2Nob29sIGFubmV4LCBhbmQgbGFzdC1yZXNvcnQgdHJpYWdlIHN0YXRpb24gYnVpbHQgaW50byBhbiBvbGQgbXVuaWNpcGFsIGhlYWx0aCBidWlsZGluZy48L3A+CjxwPlRoZSBsb2JieSBzbWVsbHMgb2YgYW50aXNlcHRpYywgY2hlYXAgbm9vZGxlcywgcmFpbi13ZXQgY29uY3JldGUsIGFuZCBvdmVyaGVhdGVkIGJhdHRlcmllcy4gRXZlcnkgd2FsbCBoYXMgYmVlbiBwYXRjaGVkIG1vcmUgdGhhbiBvbmNlLiBIYWxmIHRoZSBsaWdodHMgZmxpY2tlci4gVGhlIG90aGVyIGhhbGYgYXJlIGNvdmVyZWQgd2l0aCBjaGlsZHJlbuKAmXMgZHJhd2luZ3MsIGhhbmQtd3JpdHRlbiBpbnN0cnVjdGlvbnMsIG1pc3NpbmctcGVyc29uIG5vdGVzLCBhbmQgb2xkIHByb3Rlc3QgcG9zdGVycy48L3A+CjxwPk1lcmN5IFR3ZWx2ZSBpcyBub3Qgc2FmZSBiZWNhdXNlIHRoZSBsYXcgcHJvdGVjdHMgaXQuPC9wPgo8cD5NZXJjeSBUd2VsdmUgaXMgc2FmZSBiZWNhdXNlIHRoZSBuZWlnaGJvcmhvb2QgaGFzIGFncmVlZCB0aGF0IHNvbWUgZG9vcnMgc2hvdWxkIHN0YXkgb3Blbi48L3A+CjxoMj5LZXkgYXJlYXM8L2gyPgo8aDM+V2FpdGluZyBSb29tPC9oMz4KPHA+Q3Jvd2RlZCB3aXRoIHBhdGllbnRzLCB2b2x1bnRlZXJzLCBnYW5nIGxvb2tvdXRzIHByZXRlbmRpbmcgbm90IHRvIGJlIGxvb2tvdXRzLCBhbmQgYXQgbGVhc3Qgb25lIGNoaWxkIHRyeWluZyB0byBkbyBob21ld29yayBvbiB0aGUgZmxvb3IuPC9wPgo8aDM+VHJpYWdlIEhhbGw8L2gzPgo8cD5TdGFmZiBtb3ZlIGZhc3QgaGVyZS4gT3V0c2lkZXJzIHN0YW5kaW5nIGluIHRoZSB3cm9uZyBwbGFjZSB3aWxsIGJlIHJlZGlyZWN0ZWQgZmlybWx5IGJ1dCBwb2xpdGVseS48L3A+CjxoMz5UcmVhdG1lbnQgV2luZzwvaDM+CjxwPkxvY2tlZCBhZnRlciB0aGUgY291cmllciBhcnJpdmVkLiBDb250YWlucyB0aGUgY29udGFtaW5hdGVkIHJlbGF5L2RhdGEtY29yZSBhbmQgYXQgbGVhc3Qgb25lIHBhdGllbnQgZXhwb3NlZCB0byBpdC48L3A+CjxoMz5TY2hvb2wgQW5uZXg8L2gzPgo8cD5Vc2VkIGZvciBuaWdodCBjbGFzc2VzLCBmb29kIGRpc3RyaWJ1dGlvbiwgdHV0b3JpbmcsIGFuZCBzaGVsdGVyIG92ZXJmbG93LjwvcD4KPGgzPlJvb2YgQWNjZXNzPC9oMz4KPHA+UG9zc2libGUgZHJvbmUgbGFuZGluZywgc2lnbmFsIGFjY2VzcywgZXNjYXBlIHJvdXRlLCBvciBmaW5hbCB0cmFuc21pdHRlciBsb2NhdGlvbi48L3A+CjxoMz5HZW5lcmF0b3IgUm9vbTwvaDM+CjxwPlRoZSBjbGluaWPigJlzIGdlbmVyYXRvciBhbmQgcG93ZXIgc3RvcmFnZSBhcmUgb2xkLCBvdmVybG9hZGVkLCBhbmQgc2Vuc2l0aXZlIHRvIHNpZ25hbCBwdWxzZXMuPC9wPgo8aDI+Q2xpbmljIGxlYWRlcjwvaDI+CjxwPjxzdHJvbmc+RHIuIFNlcmEgVmFsZXo8L3N0cm9uZz4gcnVucyBNZXJjeSBUd2VsdmUuPC9wPgo8cD5TaGUgaXMgd2FybSwgZGlyZWN0LCBleGhhdXN0ZWQsIGFuZCBoYXJkIHRvIGludGltaWRhdGUuIFNoZSBkb2VzIG5vdCB3YW50IGEgZmlnaHQuIFNoZSBhbHNvIHdpbGwgbm90IGhhbmQgZnJpZ2h0ZW5lZCBwZW9wbGUgb3ZlciB0byB0aGUgY29ycCBqdXN0IGJlY2F1c2Ugc29tZW9uZSB3aXRoIGEgYmFkZ2UgYW5kIGEgY29udHJhY3Qgc2F5cyDigJxjb21wbGlhbmNlLuKAnTwvcD4KPGgyPlNlcmEgYW5kIE1hcmE8L2gyPgo8cD5Eci4gU2VyYSBWYWxleiBhbmQgTWFyYSDigJxNb3RoZXIgUmVk4oCdIFZleSBhcmUgZXN0cmFuZ2VkIHNpc3RlcnMuPC9wPgo8cD5TZXJhIGtlcHQgdGhlIFZhbGV6IG5hbWUgYW5kIGJ1aWx0IE1lcmN5IFR3ZWx2ZSBpbnRvIGEgcGxhY2Ugb2YgcHVibGljIHRydXN0LiBNYXJhIHNob3J0ZW5lZC9jdXQgaGVyIG5hbWUgdG8gVmV5IGFuZCBiZWNhbWUgdGhlIGRhbmdlcm91cyB1bm9mZmljaWFsIHBvd2VyIHRoYXQga2VlcHMgZm9vZCwgbWVkaWNpbmUsIGdlbmVyYXRvciBmdWVsLCBhbmQgcHJvdGVjdGlvbiBtb3Zpbmcgd2hlbiBvZmZpY2lhbCBzeXN0ZW1zIGZhaWwuPC9wPgo8cD5TZXJhIGtub3dzIE1hcmHigJlzIGFpZCBuZXR3b3JrIGV4aXN0cy4gU2hlIGRvZXMgbm90IGxpa2UgdGhlIHZpb2xlbmNlIHRoYXQgY29tZXMgd2l0aCBpdC4gU2hlIGFsc28ga25vd3Mgc29tZSBwYXRpZW50cyB3b3VsZCBiZSBkZWFkIHdpdGhvdXQgaXQuPC9wPgo8cD5TZXJhIGRvZXMgbm90IHdhbnQgb3V0c2lkZXJzIHVzaW5nIHRoZSByZWxhdGlvbnNoaXAgYXMgbGV2ZXJhZ2UgaW5zaWRlIGhlciBjbGluaWMuPC9wPg=="
  },
  {
    "name": "Signal Bleed - Redline Choir",
    "source_file": "handouts/04_Redline_Choir.md",
    "notes_b64": "PGgxPlRoZSBSZWRsaW5lIENob2lyPC9oMT4KPGgyPlB1YmxpYyBmYWNlPC9oMj4KPHA+VGhlIFJlZGxpbmUgQ2hvaXIgaXMgdGhlIGxvY2FsIGdhbmcuIFRoZXkgY29udHJvbCBjb3JuZXJzLCByb29mcywgdW5kZXJwYXNzIHJvdXRlcywgaW5mb3JtYWwgbWFya2V0cywgYW5kIHByb3RlY3Rpb24gcmFja2V0cy4gVGhleSBzbXVnZ2xlIG1lZGljaW5lLCBydW4gZGVidCBlbmZvcmNlbWVudCwgbW92ZSBzdG9sZW4gZ2VhciwgYW5kIG1ha2UgZXhhbXBsZXMgb2YgcGVvcGxlIHdobyBwcmV5IG9uIHRoZSBibG9jay48L3A+CjxwPlRoZXkgYXJlIG5vdCBnZW50bGUuPC9wPgo8cD5UaGV5IGFyZSBhbHNvIG5vdCBzaW1wbGUuPC9wPgo8aDI+UHJpdmF0ZSByZWFsaXR5PC9oMj4KPHA+VGhlIFJlZGxpbmUgQ2hvaXIgcXVpZXRseSBmdW5kcyBzY2hvb2wgbWVhbHMsIGJ1eXMgbWVkaWNpbmUsIHBheXMgdGVhY2hlcnMsIGtlZXBzIGdlbmVyYXRvcnMgcnVubmluZywgYW5kIG1ha2VzIGNlcnRhaW4gcHJlZGF0b3JzIGRpc2FwcGVhciBiZWZvcmUgdGhlIGxhdyBub3RpY2VzLjwvcD4KPHA+VGhpcyBpcyBub3QgcHVibGljIGtub3dsZWRnZS48L3A+CjxwPk1hcmEg4oCcTW90aGVyIFJlZOKAnSBWZXkgd29ya3MgaGFyZCB0byBwcmVzZXJ2ZSB0aGUgQ2hvaXLigJlzIHRvdWdoIGZyb250LiBTaGUgZG9lcyBub3Qgd2FudCBvdXRzaWRlcnMgc2F5aW5nIHRoZSBnYW5nIGhhcyBnb25lIHNvZnQuIEluIGhlciBtaW5kLCBmZWFyIGlzIG9uZSBvZiB0aGUgZmV3IHRvb2xzIHRoZSBuZWlnaGJvcmhvb2Qgc3RpbGwgaGFzLjwvcD4KPGgyPkRpc2NvdmVyaW5nIHRoZSBzZWNyZXQ8L2gyPgo8cD5QbGF5ZXJzIG1heSBkaXNjb3ZlciBNYXJh4oCZcyBoaWRkZW4gc3VwcG9ydCB0aHJvdWdoIGludmVzdGlnYXRpb24gb3IgZ29vZCBzb2NpYWwgcGxheTo8L3A+Cjx1bD4KPGxpPmEgY2xpbmljIHVuZGVybGluZyBhY2NpZGVudGFsbHkgc2F5cyDigJxNYXJhIHBhaWQgZm9yIHRoYXTigJ0gYW5kIHRoZW4gc3RvcHMgdGFsa2luZzwvbGk+CjxsaT5zY2hvb2xjaGlsZHJlbiBrbm93IGhlciBhcyDigJxBdW50aWUgUmVkLOKAnSBidXQgYWR1bHRzIGF2b2lkIHNheWluZyBpdDwvbGk+CjxsaT5hIGhpZGRlbiBsZWRnZXIgbGlzdHMgZm9vZCwgbWVkaWNpbmUsIHRlYWNoZXIgc3RpcGVuZHMsIGFuZCBmdW5lcmFsIGNvc3RzPC9saT4KPGxpPmEgZ2FuZyBjb3VyaWVyIGRlbGl2ZXJzIGNyYXRlcyBtYXJrZWQgYXMgY29udHJhYmFuZCwgYnV0IHRoZXkgY29udGFpbiBpbnN1bGluLCBhbnRpYmlvdGljcywgYW5kIG1lYWwgcGFja3M8L2xpPgo8bGk+RHIuIFZhbGV6IGtub3dzLCBidXQgd2lsbCBub3QgcmV2ZWFsIGl0IHVubGVzcyB0aGUgUENzIGVhcm4gdHJ1c3Q8L2xpPgo8bGk+Qmx1ZXdpcmUgYml0dGVybHkgYmx1cnRzIG91dCBzb21ldGhpbmcgbGlrZTog4oCcU2hlIGZlZWRzIGV2ZXJ5b25lIGJ1dCBzdGlsbCBsb29rcyBhdCBtZSBsaWtlIEnigJltIGJyb2tlbi7igJ08L2xpPgo8L3VsPgo8aDI+TGVhZGVyOiBNYXJhIOKAnE1vdGhlciBSZWTigJ0gVmV5PC9oMj4KPHA+TWFyYSBpcyBjaGFyaXNtYXRpYywgY29udHJvbGxlZCwgYW5kIHZpc2libHkgdGlyZWQgb2YgYnVyeWluZyBraWRzLjwvcD4KPHA+U2hlIGRvZXMgbm90IHdhbnQgYSB3YXIgd2l0aCB0aGUgY2xpbmljLCB0aGUgY29ycCwgb3IgdGhlIFBDcy4gU2hlIHdhbnRzIGxldmVyYWdlIGFuZCBhIGd1YXJhbnRlZSB0aGF0IHRoZSBuZWlnaGJvcmhvb2QgaXMgbm90IGN1dCBvdXQgb2YgZGVjaXNpb25zIGFib3V0IHRoZSByZWxheS48L3A+CjxwPkhlciBwb3NpdGlvbjo8L3A+CjxibG9ja3F1b3RlPlRoZSBjbGluaWMgc2F2ZXMgbGl2ZXMgb25lIGF0IGEgdGltZS4gV2Uga2VlcCB0aGUgd2hvbGUgYmxvY2sgZnJvbSBiZWluZyBlYXRlbi4gRG8gbm90IGNvbmZ1c2Ugb3VyIG1ldGhvZHMgd2l0aCBsYWNrIG9mIG1vcmFscy48L2Jsb2NrcXVvdGU+CjxoMj5NYXJhIGFuZCBTZXJhPC9oMj4KPHA+TWFyYSDigJxNb3RoZXIgUmVk4oCdIFZleSBhbmQgRHIuIFNlcmEgVmFsZXogYXJlIGVzdHJhbmdlZCBzaXN0ZXJzLjwvcD4KPHA+TWFyYeKAmXMgaGlkZGVuIHNvZnQtcG93ZXIgbmV0d29yayBpcyBub3QgcmFuZG9tIGNoYXJpdHkuIEl0IGlzIHBhcnRseSBndWlsdCwgcGFydGx5IHRlcnJpdG9yaWFsIHBvbGl0aWNzLCBhbmQgcGFydGx5IGEgZnVyaW91cyByZWZ1c2FsIHRvIGxldCBTZXJhIGJlIHRoZSBvbmx5IG9uZSB3aG8gZ2V0cyB0byBzYXZlIHBlb3BsZS48L3A+CjxwPlJlZGxpbmUgdW5kZXJsaW5ncyBtYXkgbm90IGtub3cgYWxsIHRoZSBmYW1pbHkgaGlzdG9yeSwgYnV0IHNlbmlvciBsb2NhbHMga25vdyBlbm91Z2ggdG8gYXZvaWQgam9raW5nIGFib3V0IGl0LjwvcD4KPHA+SWYgUENzIHJldmVhbCB0aGUgcmVsYXRpb25zaGlwIHJlc3BlY3RmdWxseSwgTWFyYSBtYXkgbmVnb3RpYXRlLiBJZiB0aGV5IHVzZSBpdCB0byBodW1pbGlhdGUgaGVyLCBzaGUgdHJlYXRzIGl0IGFzIGFuIGF0dGFjay48L3A+"
  },
  {
    "name": "Signal Bleed - NPCs GM",
    "source_file": "handouts/05_NPCs_GM.md",
    "notes_b64": "PGgxPk5QQ3M6IEdNIE5vdGVzPC9oMT4KPGgyPkRyLiBTZXJhIFZhbGV6PC9oMj4KPHA+Q2xpbmljIGRpcmVjdG9yLCBjb21tdW5pdHkgb3JnYW5pemVyLCBtb3JhbCBjZW50ZXIuIENoYXJpc21hdGljIHRocm91Z2ggd2FybXRoIGFuZCBwcmVzZW5jZSByYXRoZXIgdGhhbiB0aHJlYXQuPC9wPgo8cD48c3Ryb25nPldhbnRzOjwvc3Ryb25nPiBrZWVwIHBhdGllbnRzIGFsaXZlLCB2ZXJpZnkgdGhlIHNpZ25hbCwgZXhwb3NlIHRoZSBjb3JwIGlmIHBvc3NpYmxlLCBwcmV2ZW50IHRoZSBjbGluaWMgZnJvbSBiZWNvbWluZyBhIGJhdHRsZWZpZWxkLjwvcD4KPHA+PHN0cm9uZz5PZmZlcnM6PC9zdHJvbmc+IG1lZGljYWwgY2FyZSwgaW5mb3JtYXRpb24sIGxvY2FsIHRydXN0LCBuZXV0cmFsIGdyb3VuZCwgYWNjZXNzIHRvIHRoZSByZWxheS48L3A+CjxwPjxzdHJvbmc+U2VjcmV0Ojwvc3Ryb25nPiBrbm93cyBNYXJhIGNvdmVydGx5IGZ1bmRzIGZvb2QgYW5kIHNjaG9vbCBzdXBwb3J0LjwvcD4KPGgyPk1hcmEg4oCcTW90aGVyIFJlZOKAnSBWZXk8L2gyPgo8cD5MZWFkZXIgb2YgdGhlIFJlZGxpbmUgQ2hvaXIuIENoYXJpc21hdGljLCBjb250cm9sbGVkLCBkYW5nZXJvdXMsIGFuZCByYXRpb25hbC48L3A+CjxwPjxzdHJvbmc+V2FudHM6PC9zdHJvbmc+IG5laWdoYm9yaG9vZCBjb250cm9sIG92ZXIgdGhlIHJlbGF5LCBwcm9vZiBhZ2FpbnN0IHRoZSBjb3JwLCBwcm90ZWN0aW9uIGZvciBoZXIgcGVvcGxlLCByZXNwZWN0LjwvcD4KPHA+PHN0cm9uZz5PZmZlcnM6PC9zdHJvbmc+IGxvY2FsIHJvdXRlcywgbG9va291dHMsIGZpZ2h0ZXJzLCBzdG9sZW4gY29kZXMsIHN0cmVldCBsZWdpdGltYWN5LjwvcD4KPHA+PHN0cm9uZz5TZWNyZXQ6PC9zdHJvbmc+IGNvdmVydGx5IGZ1bmRzIHNjaG9vbCBtZWFscywgbWVkaWNpbmUsIHRlYWNoZXIgc3RpcGVuZHMsIGFuZCBnZW5lcmF0b3IgZnVlbC48L3A+CjxoMj5Ob3gg4oCcQmx1ZXdpcmXigJ0gS2FkZTwvaDI+CjxwPlVuc3RhYmxlIFJlZGxpbmUgQ2hvaXIgZW5mb3JjZXIuIE9uIG9waW9pZHMsIG92ZXJjbG9ja2VkIGNvbWJhdCB3YXJlLCBhbmQgdG9vIG11Y2ggY3liZXIgc3RyYWluLjwvcD4KPHA+PHN0cm9uZz5XYW50czo8L3N0cm9uZz4gcmVzcGVjdCwgcGFpbiByZWxpZWYsIHByb29mIGhlIGlzIHN0aWxsIHVzZWZ1bCwgdG8gc3RvcCBmZWVsaW5nIGFmcmFpZCwgdG8gaHVydCB0aGUgY29ycCBiZWZvcmUgdGhlIGNvcnAgaHVydHMgdGhlbS48L3A+CjxwPjxzdHJvbmc+VHJpZ2dlcnM6PC9zdHJvbmc+IG1vY2tlcnksIHB1YmxpYyBkaXNhcm1hbWVudCwgY29ycCB1bmlmb3Jtcy9kcm9uZXMsIHBlb3BsZSB0b3VjaGluZyBoaXMgY3liZXJ3YXJlLCBzaWduYWwgcHVsc2VzLCB3aXRoZHJhd2FsIHN5bXB0b21zLCBzdWRkZW4gbW92ZW1lbnQuPC9wPgo8cD48c3Ryb25nPkltcG9ydGFudDo8L3N0cm9uZz4gQmx1ZXdpcmUgaXMgbm90IHRoZSBnYW5nLiBJZiBoZSBkaWVzLCB0aGUgZ2FuZyBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5IGF0dGFjay48L3A+CjxoMj5Db21tYW5kZXIgSWxhbiBSdXNrPC9oMj4KPHA+Q29ycG9yYXRlIHJlY292ZXJ5IGNvbW1hbmRlci4gQ2FsbSwgcHJvZmVzc2lvbmFsLCBhbmQgbGVnYWxseSBwcm90ZWN0ZWQuPC9wPgo8cD48c3Ryb25nPldhbnRzOjwvc3Ryb25nPiByZWNvdmVyIHRoZSByZWxheSwgc3VwcHJlc3MgZXZpZGVuY2UsIHByZXZlbnQgdmlzaWJsZSBjb250YW1pbmF0aW9uLCBhdm9pZCBjb3Jwb3JhdGUgYmxhbWUuPC9wPgo8cD48c3Ryb25nPk9mZmVyczo8L3N0cm9uZz4gc2FmZSBwYXNzYWdlLCBtb25leSwgbWVkaWNhbCBzdXBwbGllcywgbWlub3Igd2FycmFudCBlcmFzdXJlLCB0ZW1wb3JhcnkgY2Vhc2VmaXJlLjwvcD4KPGgyPktlZXQ8L2gyPgo8cD5TY2hvb2wgdm9sdW50ZWVyIC8gd2l0bmVzcy4gWW91bmcsIHF1aWNrLXRhbGtpbmcsIGZyaWdodGVuZWQsIGFuZCBvYnNlcnZhbnQuPC9wPgo8cD48c3Ryb25nPk9mZmVyczo8L3N0cm9uZz4gd2l0bmVzcyBkZXRhaWxzLCBoaWRkZW4gcm91dGUsIGNsdWUgYWJvdXQgTWFyYeKAmXMgc2Nob29sIHN1cHBvcnQuPC9wPgo8aDI+U2lzdGVyIEx1bWE8L2gyPgo8cD5DbGluaWMgdm9sdW50ZWVyIGFuZCBzcGlyaXR1YWwgY291bnNlbG9yLiBDYWxtLCBwZXJjZXB0aXZlLCBhbmQgZW1vdGlvbmFsbHkgZGlyZWN0LjwvcD4KPHA+PHN0cm9uZz5PZmZlcnM6PC9zdHJvbmc+IGVtb3Rpb25hbCByZWFkcywgcGF0aWVudCB0cnVzdCwgaGVscCBjYWxtaW5nIGNpdmlsaWFucywgc3Bpcml0dWFsIGludGVycHJldGF0aW9uIG9mIHRoZSBicmVhY2guPC9wPgo8aDI+VGFtc2luIFF1aWxsPC9oMj4KPHA+RGFtYWdlZCBjb3VyaWVyLiBBbGl2ZSwgYmFyZWx5IGNvbnNjaW91cywgb3IgcmVjZW50bHkgZGVhZCBkZXBlbmRpbmcgb24gcGFjaW5nLjwvcD4KPHA+PHN0cm9uZz5PZmZlcnM6PC9zdHJvbmc+IGZpbmFsIHdhcm5pbmcsIHJvdXRlIGNsdWUsIHBhcnRpYWwgcGFzc3BocmFzZSwgY29udGFtaW5hdGlvbiBzeW1wdG9tcy48L3A+CjxoMj5Nb3RlIFN3YXJtPC9oMj4KPHA+Rmlyc3QgYWxpZW4gcHJlc3N1cmUuIE5vdCBhIG5lZ290aWFibGUgTlBDLjwvcD4KPHA+VXNlIHRvIGZvcmNlIGNvb3BlcmF0aW9uLCBldmFjdWF0aW9uLCBhbmQgZmlyc3QgYXNjZW5zaW9uLjwvcD4KPGgyPkZhbWlseSBsaW5rOiBTZXJhIFZhbGV6IGFuZCBNYXJhIFZleTwvaDI+CjxwPlNlcmEgVmFsZXogYW5kIE1hcmEg4oCcTW90aGVyIFJlZOKAnSBWZXkgYXJlIGVzdHJhbmdlZCBzaXN0ZXJzLjwvcD4KPHA+VGhpcyBtYWtlcyB0aGVpciBjb25mbGljdCBwZXJzb25hbDo8L3A+Cjx1bD4KPGxpPlNlcmEgcmVwcmVzZW50cyBtZWRpY2luZSwgbGVnaXRpbWFjeSwgYW5kIHB1YmxpYyB0cnVzdC48L2xpPgo8bGk+TWFyYSByZXByZXNlbnRzIGluZm9ybWFsIHBvd2VyLCBmZWFyLCBzbXVnZ2xpbmcsIGFuZCBuZWlnaGJvcmhvb2Qgc3Vydml2YWwuPC9saT4KPGxpPkJvdGggcHJvdGVjdCB0aGUgc2FtZSBwZW9wbGUuPC9saT4KPGxpPk5laXRoZXIgd2FudHMgdGhlIHJlbGF0aW9uc2hpcCB1c2VkIGFzIHB1YmxpYyBsZXZlcmFnZS48L2xpPgo8L3VsPgo8cD5Vc2UgdGhpcyB0byBjb21wbGljYXRlIG5lZ290aWF0aW9ucy4gVGhlIFBDcyBjYW4gZWFybiB0cnVzdCBieSByZXNwZWN0aW5nIGJvdGggc2lzdGVyc+KAmSBwcm90ZWN0aXZlIGluc3RpbmN0cyB3aXRob3V0IHByZXRlbmRpbmcgdGhlaXIgbWV0aG9kcyBhcmUgZXF1aXZhbGVudC48L3A+"
  },
  {
    "name": "Signal Bleed - Bluewire Deescalation",
    "source_file": "handouts/06_Bluewire_Deescalation.md",
    "notes_b64": "PGgxPkJsdWV3aXJlOiBEaXN0cmVzcywgQ3liZXIgU3RyYWluLCBhbmQgRGUtZXNjYWxhdGlvbjwvaDE+CjxoMj5HTSBwcmluY2lwbGU8L2gyPgo8cD5CbHVld2lyZSBpcyBvYnZpb3VzbHkgdW53ZWxsLjwvcD4KPHA+VGhlIHBvaW50IGlzIG5vdCB0byB0cmljayB0aGUgcGxheWVycy4gVGhlIHBvaW50IGlzIHRvIHJld2FyZCB0aGVtIGZvciBwYXlpbmcgYXR0ZW50aW9uIHRvIGhlYWx0aCwgcHN5Y2hvbG9neSwgcGFpbiwgYW5kIGZlYXIgYmVmb3JlIHZpb2xlbmNlIHN0YXJ0cy48L3A+CjxoMj5XaGF0IHRoZSBQQ3MgY2FuIHNlZTwvaDI+CjxwPkJsdWV3aXJlIGlzIHNoYWtpbmcsIHN3ZWF0aW5nLCBzY2FubmluZyBleGl0cywgY2xlbmNoaW5nIGFuZCB1bmNsZW5jaGluZyBoaXMgY3liZXJuZXRpYyBoYW5kLCBhbmQgcmVhY3RpbmcgaGFsZiBhIHNlY29uZCB0b28gbGF0ZSB0byB3b3JkcyBidXQgaW5zdGFudGx5IHRvIHN1ZGRlbiBtb3ZlbWVudC48L3A+CjxwPkhlIHN0YW5kcyB0b28gY2xvc2UgdG8gZG9vcnMuIE5vYm9keSBzdGFuZHMgYmVoaW5kIGhpbS4gT3RoZXIgZ2FuZyBtZW1iZXJzIGdpdmUgaGltIHNwYWNlIHdpdGhvdXQgc2F5aW5nIHdoeS48L3A+CjxwPkhlIGlzIHRyeWluZyB0byBsb29rIGRhbmdlcm91cyBiZWNhdXNlIGhlIGZlZWxzIHRlcnJpZmllZC48L3A+CjxoMj5TdWdnZXN0ZWQgZGlmZmljdWx0aWVzPC9oMj4KPHA+VXNlIHRoZSBzeXN0ZW3igJlzIG5vcm1hbCBjaGVjayBzdHJ1Y3R1cmUuIFRoZSBleGFjdCBza2lsbCBkZXBlbmRzIG9uIHRoZSBjaGFyYWN0ZXLigJlzIGFwcHJvYWNoLjwvcD4KPHA+PHN0cm9uZz5EaWZmaWN1bHR5IDg6PC9zdHJvbmc+IE5vdGljZSBoZSBpcyB1bnN0YWJsZSwgZnJpZ2h0ZW5lZCwgb3ZlcnN0aW11bGF0ZWQsIGFuZCBpbiBwYWluLjwvcD4KPHA+PHN0cm9uZz5EaWZmaWN1bHR5IDEwOjwvc3Ryb25nPiBJZGVudGlmeSBsaWtlbHkgb3Bpb2lkIGRlcGVuZGVuY2UsIHdpdGhkcmF3YWwgc3ltcHRvbXMsIGN5YmVyLXN0cmFpbiBvdmVybG9hZCwgYW5kIGVtb3Rpb25hbCBkeXNyZWd1bGF0aW9uLjwvcD4KPHA+PHN0cm9uZz5EaWZmaWN1bHR5IDEyOjwvc3Ryb25nPiBSZWFsaXplIHRoZSBkYW1hZ2VkIHNpZ25hbC9kZXZpY2UgaXMgYWdncmF2YXRpbmcgaGlzIGltcGxhbnRzLjwvcD4KPHA+PHN0cm9uZz5EaWZmaWN1bHR5IDE0Ojwvc3Ryb25nPiBXb3JrIG91dCBhIHNhZmUgZGUtZXNjYWxhdGlvbiBwbGFuOiByZWR1Y2Ugc3RpbXVsYXRpb24sIGdpdmUgaGltIHNwYWNlLCBzcGVhayBkaXJlY3RseSBidXQgY2FsbWx5LCBvZmZlciBhIGZhY2Utc2F2aW5nIGV4aXQsIGludm9sdmUgc29tZW9uZSBoZSB0cnVzdHMsIG9yIGdldCBtZWRpY2FsIHNlZGF0aW9uIHJlYWR5LjwvcD4KPHA+PHN0cm9uZz5EaWZmaWN1bHR5IDE2Ojwvc3Ryb25nPiBQcmVkaWN0IGhpcyBuZXh0IHRyaWdnZXIgYmVmb3JlIGl0IGhhcHBlbnMuPC9wPgo8aDI+SGVscGZ1bCBhcHByb2FjaGVzPC9oMj4KPHVsPgo8bGk+dXNlIGhpcyBuYW1lPC9saT4KPGxpPmxvd2VyIHlvdXIgdm9pY2U8L2xpPgo8bGk+Z2l2ZSBoaW0gcGh5c2ljYWwgc3BhY2U8L2xpPgo8bGk+b2ZmZXIgYSBjb25jcmV0ZSBjaG9pY2U8L2xpPgo8bGk+YWNrbm93bGVkZ2UgcGFpbiB3aXRob3V0IHBpdHk8L2xpPgo8bGk+bGV0IGhpbSBzYXZlIGZhY2U8L2xpPgo8bGk+bW92ZSBieXN0YW5kZXJzIGF3YXk8L2xpPgo8bGk+cmVkdWNlIG5vaXNlL2xpZ2h0L3N0aW11bGF0aW9uPC9saT4KPGxpPmFzayB3aGF0IGhlIG5lZWRzIHJpZ2h0IG5vdzwvbGk+CjxsaT5naXZlIGhpbSBhIHVzZWZ1bCB0YXNrIHRoYXQgZG9lcyBub3QgcHV0IGNpdmlsaWFucyBhdCByaXNrPC9saT4KPC91bD4KPGgyPkltcGFjdDwvaDI+CjxwPklmIGEgUEMgc2luY2VyZWx5IHRyZWF0cyBCbHVld2lyZSBhcyBhIHBlcnNvbiBpbnN0ZWFkIG9mIGEgdGhyZWF0LCByZWR1Y2UgdGhlIG5leHQgc29jaWFsL21lZGljYWwgY2hlY2sgaW52b2x2aW5nIGhpbSBieSAyLjwvcD4KPHA+SWYgYSBQQyBwdWJsaWNseSBnaXZlcyBoaW0gYSBmYWNlLXNhdmluZyB3YXkgdG8gc3RhbmQgZG93biwgcmVkdWNlIHRoZSBkaWZmaWN1bHR5IGJ5IDQuPC9wPgo8cD5JZiBhIFBDIG1vY2tzIGhpbSwgY29ybmVycyBoaW0sIGNhbGxzIGhpbSBhIGp1bmtpZSwgb3IgdHJpZXMgdG8gaHVtaWxpYXRlIGhpbSwgaW5jcmVhc2UgdGhlIGRpZmZpY3VsdHkgYnkgNCBhbmQgYWR2YW5jZSBlc2NhbGF0aW9uLjwvcD4="
  },
  {
    "name": "Signal Bleed - Scene Outline",
    "source_file": "handouts/07_Scene_Outline.md",
    "notes_b64": "PGgxPlNpZ25hbCBCbGVlZDogU2NlbmUgT3V0bGluZTwvaDE+CjxoMj5TY2VuZSAxOiBBcnJpdmFsIGF0IE1lcmN5IFR3ZWx2ZTwvaDI+CjxwPlRoZSBQQ3MgYXJyaXZlIGF0IHRoZSBjbGluaWMgZm9yIGEgc2ltcGxlIHByb3RlY3Rpb24gam9iLjwvcD4KPHA+VmlzaWJsZSB0ZW5zaW9uczo8L3A+Cjx1bD4KPGxpPnBhdGllbnRzIGluIHRoZSB3YWl0aW5nIHJvb208L2xpPgo8bGk+Z2FuZyB1bmRlcmxpbmdzIG5lYXIgdGhlIHJlYXIgZXhpdDwvbGk+CjxsaT5jbGluaWMgdm9sdW50ZWVycyB0cnlpbmcgdG8ga2VlcCBvcmRlcjwvbGk+CjxsaT5CbHVld2lyZSBwYWNpbmcgdG9vIGNsb3NlIHRvIHRoZSB0cmVhdG1lbnQgd2luZzwvbGk+CjxsaT50aGUgbGlnaHRzIGZsaWNrZXIgZXZlcnkgdGltZSB0aGUgcmVsYXkgcHVsc2VzPC9saT4KPC91bD4KPGgyPlNjZW5lIDI6IEtlZXAgdGhlIFBlYWNlPC9oMj4KPHA+QSBkaXNhZ3JlZW1lbnQgYnJlYWtzIG91dCBvdmVyIHdobyBjb250cm9scyBhY2Nlc3MgdG8gdGhlIHJlbGF5LjwvcD4KPHA+T3B0aW9uczo8L3A+Cjx1bD4KPGxpPnRhbGsgZG93biB1bmRlcmxpbmdzPC9saT4KPGxpPmludmVzdGlnYXRlIEJsdWV3aXJl4oCZcyBjb25kaXRpb248L2xpPgo8bGk+ZGlzY292ZXIgY2xpbmljL2dhbmcgaGlzdG9yeTwvbGk+CjxsaT5pbnNwZWN0IHNlY3VyaXR5PC9saT4KPGxpPmRldGVjdCBjb3JwIHN1cnZlaWxsYW5jZTwvbGk+CjxsaT5leGFtaW5lIHJlbGF5IHN5bXB0b21zPC9saT4KPC91bD4KPGgyPlNjZW5lIDM6IEZhY3Rpb24gTmVnb3RpYXRpb248L2gyPgo8cD5UaGUgUENzIGNhbiBpbnRlcmFjdCB3aXRoIERyLiBWYWxleiwgTWFyYSwgZ2FuZyB1bmRlcmxpbmdzLCBjbGluaWMgc3RhZmYsIHNjaG9vbCB2b2x1bnRlZXJzLCBhbmQgY29ycG9yYXRlIGludGVybWVkaWFyaWVzLjwvcD4KPHA+UG9zc2libGUgZGlzY292ZXJpZXM6PC9wPgo8dWw+CjxsaT5NYXJhIHNlY3JldGx5IHN1cHBvcnRzIHRoZSBzY2hvb2wgYW5kIGZvb2QgcHJvZ3JhbXM8L2xpPgo8bGk+dGhlIHJlbGF5IGNvbnRhaW5zIG1vcmUgdGhhbiBldmlkZW5jZTwvbGk+CjxsaT50aGUgY291cmllcuKAmXMgcm91dGUgc2hvdWxkIGhhdmUgYmVlbiBpbXBvc3NpYmxlPC9saT4KPGxpPnNvbWVvbmUgaGFzIGFscmVhZHkgdGFnZ2VkIHRoZSBjbGluaWMgZm9yIHJlY292ZXJ5PC9saT4KPGxpPkJsdWV3aXJl4oCZcyBpbXBsYW50cyBhcmUgcmVhY3RpbmcgdG8gdGhlIHNpZ25hbDwvbGk+CjwvdWw+CjxoMj5TY2VuZSA0OiBDb3Jwb3JhdGUgUHJlc3N1cmU8L2gyPgo8cD5Db21tYW5kZXIgUnVzayBvciBoaXMgdGVhbSBtYWtlcyBjb250YWN0IHRocm91Z2ggYSBkcm9uZSB3YXJuaW5nLCBsZWdhbCB0aHJlYXQsIGV4dHJhY3Rpb24gZGVtYW5kLCBvZmZlciBvZiBwYXltZW50LCBzdGFnZWQgcG93ZXIgb3V0YWdlLCBvciByZWNvdmVyeSBzcXVhZCBvdXRzaWRlLjwvcD4KPGgyPlNjZW5lIDU6IFNpZ25hbCBCcmVhY2g8L2gyPgo8cD5UaGUgcmVsYXkgcHVsc2VzLiBMaWdodHMgYmxvb20gd2hpdGUtYmx1ZS4gSW1wbGFudHMgYWNoZS4gUGF0aWVudHMgc2VpemUgb3Igc3BlYWsgaW4gc3RhdGljLiBBUiBvdmVybGF5cyBzaG93IGltcG9zc2libGUgZ2VvbWV0cnkuIFNvbWV0aGluZyBoZWFycyB0aGUgc2lnbmFsIGFuZCBhbnN3ZXJzLjwvcD4KPHA+RWFybGllciBjaG9pY2VzIG1hdHRlci48L3A+CjxoMj5TY2VuZSA2OiBGaXJzdCBBc2NlbnNpb248L2gyPgo8cD5UaGUgUENzIGFyZSBleHBvc2VkIHRvIHRoZSBicmVhY2ggYW5kIHRyaWdnZXIgdGhlaXIgZmlyc3QgU2FtdXJhaSBwb3RlbnRpYWwuPC9wPgo8cD5Gb2N1cyBvbiBwcm90ZWN0aW5nIGNpdmlsaWFucywgaW1wb3NzaWJsZSBwcmVzc3VyZSwgcGVyc29uYWwgY2hvaWNlLCBhbmQgaG9wZSB1bmRlciB0aHJlYXQuPC9wPgo8aDI+U2NlbmUgNzogRmluYWxlPC9oMj4KPHA+UG9zc2libGUgZmluYWxlIGxvY2F0aW9uczo8L3A+Cjx1bD4KPGxpPnRyZWF0bWVudCB3aW5nPC9saT4KPGxpPmdlbmVyYXRvciByb29tPC9saT4KPGxpPnJvb2YgdHJhbnNtaXR0ZXI8L2xpPgo8bGk+c3RyZWV0IG91dHNpZGUgY2xpbmljPC9saT4KPGxpPnNjaG9vbCBhbm5leDwvbGk+CjwvdWw+CjxwPkZpbmFsIGNob2ljZXM6PC9wPgo8dWw+CjxsaT5icm9hZGNhc3QgZXZpZGVuY2Ugbm93LCByaXNraW5nIHVuc3RhYmxlIHNpZ25hbCBlZmZlY3RzPC9saT4KPGxpPmRlbGF5IGFuZCBzdGFiaWxpemUgaXQsIGdpdmluZyB0aGUgY29ycCB0aW1lPC9saT4KPGxpPmRlc3Ryb3kgdGhlIHJlbGF5IHRvIHNhdmUgdGhlIGNsaW5pYzwvbGk+CjxsaT5naXZlL3NoYXJlZCBjdXN0b2R5IHRvIGNsaW5pYywgZ2FuZywgb3IgY29ycDwvbGk+CjxsaT50dXJuIHRoZSBzaWduYWwgaW50byBiYWl0IGZvciB0aGUgYWxpZW4gdGhyZWF0PC9saT4KPC91bD4KPGgyPk9wdGlvbmFsOiBOaWdodENyYXNoIEludGVydmVudGlvbjwvaDI+CjxwPklmIHRoZSBQQ3MgYXJlIGJlaW5nIG92ZXJ3aGVsbWVkIGJ5IHRoZSBhbGllbiBicmVhY2gsIEZsb3JlbmNlIOKAnE5pZ2h0Q3Jhc2jigJ0gVmFsZSBtYXkgYXJyaXZlIGFzIGFuIGVtZXJnZW5jeSBzYWZldHkgdmFsdmUuPC9wPgo8cD5TaGUgc2hvdWxkIG5vdCBzb2x2ZSB0aGUgc2NlbmFyaW8uIFNoZSBjcmVhdGVzIG9uZSBvcGVuaW5nOjwvcD4KPHVsPgo8bGk+ZXZhY3VhdGVzIGVuZGFuZ2VyZWQgY2l2aWxpYW5zPC9saT4KPGxpPnN0YWJpbGl6ZXMgYSBkeWluZyBQQyBvciBOUEM8L2xpPgo8bGk+YmxvY2tzIG9uZSBhbGllbiBwdXNoPC9saT4KPGxpPmlkZW50aWZpZXMgdGhlIGJyZWFjaCBwb2ludDwvbGk+CjxsaT5naXZlcyB0aGUgUENzIG9uZSBjbGVhciB0YWN0aWNhbCBpbnN0cnVjdGlvbjwvbGk+CjwvdWw+CjxwPlRoZW4gc2hlIHJlY2VpdmVzIGEgaGlnaGVyLXByaW9yaXR5IGVtZXJnZW5jeSBjYWxsIGFuZCBtdXN0IGxlYXZlLjwvcD4KPHA+SWYgdGhlIFBDcyBzb2x2ZSB0aGUgY3Jpc2lzIHRoZW1zZWx2ZXMsIHVzZSBOaWdodENyYXNoIGFmdGVyIHRoZSBmaW5hbGUgaW5zdGVhZC4gU2hlIGFycml2ZXMgdG9vIGxhdGUgdG8gc2F2ZSB0aGUgZGF5LCByZWFsaXplcyB0aGUgUENzIGhhbmRsZWQgaXQsIHRoYW5rcyB0aGVtLCByZWNvZ25pemVzIHRoZW0gYXMgbmV3bHkgYXdha2VuZWQgU2FtdXJhaSwgYW5kIHdlbGNvbWVzIHRoZW0gaW50byB0aGUgd2lkZXIgU2FtdXJhaSB3b3JsZC48L3A+"
  },
  {
    "name": "Signal Bleed - NightCrash Samurai Failsafe",
    "source_file": "handouts/08_NightCrash_Samurai_Failsafe.md",
    "notes_b64": "PGgxPk5pZ2h0Q3Jhc2g6IFNhbXVyYWkgRmFpbHNhZmUgYW5kIE1lbnRvciBDYW1lbzwvaDE+CjxoMj5HTSBwdXJwb3NlPC9oMj4KPHA+RmxvcmVuY2Ug4oCcTmlnaHRDcmFzaOKAnSBWYWxlIGlzIG5vdCBoZXJlIHRvIHdpbiB0aGUgc2NlbmFyaW8gZm9yIHRoZSBwbGF5ZXJzLjwvcD4KPHA+U2hlIGV4aXN0cyBmb3IgdHdvIHBvc3NpYmxlIHVzZXM6PC9wPgo8b2w+CjxsaT48c3Ryb25nPkVtZXJnZW5jeSBhcnJpdmFsPC9zdHJvbmc+PC9saT4KPC9vbD4KPHA+SWYgdGhlIFBDcyBhcmUgb3ZlcndoZWxtZWQgYnkgdGhlIGZpcnN0IGFsaWVuIGJyZWFjaCwgTmlnaHRDcmFzaCBhcnJpdmVzLCBzYXZlcyB3b3VuZGVkIGNpdmlsaWFucyBvciBhIGZhbGxlbiBQQywgY3JlYXRlcyBvbmUgdGFjdGljYWwgb3BlbmluZywgdGhlbiBsZWF2ZXMgZm9yIGEgbGFyZ2VyIGVtZXJnZW5jeSBlbHNld2hlcmUuPC9wPgo8b2w+CjxsaT48c3Ryb25nPlJlY29nbml0aW9uIGFycml2YWw8L3N0cm9uZz48L2xpPgo8L29sPgo8cD5JZiB0aGUgUENzIHNvbHZlIHRoZSBjcmlzaXMgdGhlbXNlbHZlcywgTmlnaHRDcmFzaCBhcnJpdmVzIGFmdGVyIHRoZSBkYW5nZXIgaGFzIHBhc3NlZC4gU2hlIHRoYW5rcyB0aGVtLCBpZGVudGlmaWVzIHRoZW0gYXMgbmV3bHkgYXdha2VuZWQgU2FtdXJhaSwgb2ZmZXJzIG1lZGljYWwgYWlkLCBhbmQgZ2l2ZXMgdGhlbSB0aGVpciBmaXJzdCBjb25uZWN0aW9uIHRvIHRoZSB3aWRlciBTYW11cmFpIHdvcmxkLjwvcD4KPHA+TmlnaHRDcmFzaCBzaG91bGQgbmV2ZXIgdGFrZSB0aGUgZmluYWwgZGVjaXNpb24gYXdheSBmcm9tIHRoZSBQQ3MuPC9wPgo8aDI+SWRlbnRpdHk8L2gyPgo8cD48c3Ryb25nPk5hbWU6PC9zdHJvbmc+IEZsb3JlbmNlIFZhbGUgPHN0cm9uZz5TYW11cmFpIEhhbmRsZTo8L3N0cm9uZz4gTmlnaHRDcmFzaCA8c3Ryb25nPkxldmVsOjwvc3Ryb25nPiA1IDxzdHJvbmc+QWN0aXZlIFNhbXVyYWk6PC9zdHJvbmc+IGFib3V0IHNpeCBtb250aHMgPHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiBjb21iYXQgbWVkaWMsIGV2YWN1YXRpb24gc3BlY2lhbGlzdCwgaG9zcGl0YWwgcGF0cm9uIDxzdHJvbmc+UG93ZXIgYnVkZ2V0Ojwvc3Ryb25nPiByb3VnaGx5IFRpZXIgMSBjYXRhbG9ndWUtZXF1aXZhbGVudCwgYXJvdW5kIDUwMOKAkzEwMDAgU1Agc3BlbnQgPHN0cm9uZz5QdWJsaWMgYnJhbmQ6PC9zdHJvbmc+IGFic3VyZCBzcG9uc29yLWZyaWVuZGx5IGVtZXJnZW5jeSBudXJzZSBpY29uIDxzdHJvbmc+UHJpdmF0ZSBzZWxmOjwvc3Ryb25nPiBleGhhdXN0ZWQsIHNpbmNlcmUsIGZyaWdodGVuaW5nbHkgY29tcGV0ZW50PC9wPgo8aDI+VmlzdWFsIGNvbmNlcHQ8L2gyPgo8cD5OaWdodENyYXNoIHdlYXJzIGEgd2hpdGUsIHBpbmssIGFuZCBjaHJvbWUgY29tYmF0LW1lZGljIG91dGZpdCB0aGF0IGxvb2tzIGhhbGZ3YXkgYmV0d2VlbiB0cmF1bWEgc3VyZ2VvbiwgcmFjaW5nIGxlYXRoZXJzLCBtYWdpY2FsLWdpcmwgZW1lcmdlbmN5IHJlc3BvbmRlciwgYW5kIHRoZWF0cmljYWwgbnVyc2UgY29zdHVtZS48L3A+CjxwPkhlciBvdXRmaXQgaXMgcmlkaWN1bG91cyBlbm91Z2ggdG8gYXR0cmFjdCBzcG9uc29ycyBhbmQgZnVuY3Rpb25hbCBlbm91Z2ggdGhhdCBwZW9wbGUgc3RvcCBsYXVnaGluZyB3aGVuIHNoZSBjdXRzIHRocm91Z2ggYW4gYWxpZW4gc3dhcm0gdG8gY2FycnkgdGhyZWUgcGF0aWVudHMgb3V0IG9mIGEgYnVybmluZyB3YXJkLjwvcD4KPHA+QXZvaWQgdXNpbmcgcmVhbC13b3JsZCBwcm90ZWN0ZWQgbWVkaWNhbCBzeW1ib2xzIGRpcmVjdGx5LiBVc2UgZmljdGlvbmFsIHNwb25zb3IgbWFya3MgaW5zdGVhZCwgc3VjaCBhczo8L3A+Cjx1bD4KPGxpPk1lcmN5IFN0YXI8L2xpPgo8bGk+V2hpdGUgU2lyZW48L2xpPgo8bGk+U2FpbnRQdWxzZTwvbGk+CjxsaT5QaW5rIENyb3NzbGluZTwvbGk+CjwvdWw+CjxoMj5TcG9uc29yczwvaDI+CjxwPk5pZ2h0Q3Jhc2ggaXMgYmFja2VkIGJ5IGhvc3BpdGFscywgbWVkdGVjaCBjb21wYW5pZXMsIGNoYXJpdHkgc3RyZWFtcywgdHJhdW1hLWZvYW0gbWFudWZhY3R1cmVycywgYW5kIGVtZXJnZW5jeS1yZXNwb25zZSBicmFuZHMuPC9wPgo8cD5Qb3NzaWJsZSBzcG9uc29yIG5hbWVzOjwvcD4KPHVsPgo8bGk+U2FpbnRQdWxzZSBFbWVyZ2VuY3kgU3lzdGVtczwvbGk+CjxsaT5NZXJjeUNhcnQgTWVkaWNhbCBMb2dpc3RpY3M8L2xpPgo8bGk+UGFuYWNlYUxpdGUgVHJhdW1hIEZvYW08L2xpPgo8bGk+QWVnaXMgQW1idWxhbmNlIFVuaW9uPC9saT4KPGxpPkhhbG9QYXRjaCBXb3VuZCBTZWFsYW50PC9saT4KPGxpPktpZG5leUNhbmR5IEVsZWN0cm9seXRlczwvbGk+CjwvdWw+CjxwPkhlciBzcG9uc29ycyBhcmUgc2lsbHkgYW5kIGV4cGxvaXRhdGl2ZS4gTmlnaHRDcmFzaCBpcyBub3QuPC9wPgo8aDI+VmVoaWNsZTogVGhlIFNpcmVuIFNhaW50PC9oMj4KPHA+QSBob3ZlcmJpa2UgYWxvbmUgaXMgbm90IGVub3VnaCB0byB0cmFuc3BvcnQgYSBjcml0aWNhbGx5IGluanVyZWQgcGVyc29uLjwvcD4KPHA+VXNlIHRoaXMgaW5zdGVhZDo8L3A+CjxwPjxzdHJvbmc+VGhlIFNpcmVuIFNhaW50PC9zdHJvbmc+IGlzIGEgaHlwZXJmYXN0IHJhcGlkLXJlc3BvbnNlIGhvdmVyYmlrZSB3aXRoIGEgZGV0YWNoYWJsZSBwb3dlcmVkIHRyYXVtYSBzbGVkIC8gbWljcm8tYW1idWxhbmNlIHBvZC48L3A+CjxwPkluIGZhc3QtcmVzcG9uc2UgbW9kZSwgaXQgaXMgYSBzbGVlayBhcm1vcmVkIGhvdmVyYmlrZS48L3A+CjxwPkluIGV2YWN1YXRpb24gbW9kZSwgaXQgZGVwbG95cyBvciB0b3dzIGEgY29tcGFjdCBzdGFiaWxpemVkIG1lZGljYWwgcG9kIGxhcmdlIGVub3VnaCBmb3Igb25lIGNyaXRpY2FsIHBhdGllbnQuIFRoZSBwb2QgaGFzIHNob2NrIHN1c3BlbnNpb24sIHRyYXVtYSBmb2FtLCBveHlnZW4gc3VwcG9ydCwgcmVzdHJhaW50IHdlYmJpbmcsIGFuZCBhIGhhcmQtc2hlbGwgY2Fub3B5LjwvcD4KPHA+VGhlIFNpcmVuIFNhaW50IGlzIGJ1aWx0IGZvciBpbXBvc3NpYmxlIGFycml2YWw6PC9wPgo8dWw+CjxsaT5zcGxpdHRpbmcgdHJhZmZpYzwvbGk+CjxsaT5jbGltYmluZyByYW1wcyBhbmQgc3RhaXJ3ZWxsczwvbGk+CjxsaT5sYXVuY2hpbmcgZnJvbSBtZWQtZXZhYyByYWlsczwvbGk+CjxsaT5jcm9zc2luZyByb29mdG9wczwvbGk+CjxsaT5mb3JjaW5nIGRvb3JzIHdpdGggZW1lcmdlbmN5IG92ZXJyaWRlIGhhY2tzPC9saT4KPGxpPmRyYWdnaW5nIHRoZSB0cmF1bWEgcG9kIHRocm91Z2ggc21va2UsIGRlYnJpcywgYW5kIHBhbmlja2VkIGNyb3dkczwvbGk+CjwvdWw+CjxwPkl0IGNhbiBleHRyYWN0IG9uZSBjcml0aWNhbCBwYXRpZW50IG9yIHR3byBjcmFtcGVkIHNtYWxsIGNpdmlsaWFucyBpZiB0aGUgc2l0dWF0aW9uIGlzIGRlc3BlcmF0ZS48L3A+CjxoMj5Ecm9uZXM6IFRoZSBHdXJuZXkgQW5nZWxzPC9oMj4KPHA+TmlnaHRDcmFzaCBoYXMgdHdvIGh1bWFub2lkIGV2YWN1YXRpb24gZHJvbmVzLjwvcD4KPHA+VGhleSBhcmUgc3BvbnNvcmVkIGh1bWFuIHRlY2hub2xvZ3ksIG5vdCBhbGllbiB0ZWNoLjwvcD4KPHA+PHN0cm9uZz5QdWJsaWMgbmFtZTo8L3N0cm9uZz4gdGhlIEd1cm5leSBBbmdlbHMgPHN0cm9uZz5UZWNobmljYWwgbGFiZWxzOjwvc3Ryb25nPiBNZXJjeSBVbml0IDEyLUEgYW5kIE1lcmN5IFVuaXQgMTItQjwvcD4KPHA+VGhlIEd1cm5leSBBbmdlbHMgaGF2ZSBudXJzZS1saWtlIHNpbGhvdWV0dGVzLCB3aGl0ZS9waW5rIHRyYXVtYSBwbGF0aW5nLCBzb2Z0IHN5bnRoZXRpYyB2b2ljZXMsIGFuZCBhIGNvbGxhcHNpYmxlIHNtYXJ0LXN0cmV0Y2hlciBjYXJyaWVkIGJldHdlZW4gdGhlbS48L3A+CjxwPlRoZXkgYXJlIG5vdCBjb21iYXQgbW9uc3RlcnMuIFRoZWlyIHB1cnBvc2UgaXMgZXZhY3VhdGlvbi48L3A+CjxwPlRoZXkgY2FuOjwvcD4KPHVsPgo8bGk+Y2Fycnkgb25lIGNyaXRpY2FsIHBhdGllbnQgb3IgdHdvIHNtYWxsIGNpdmlsaWFuczwvbGk+CjxsaT5kZXBsb3kgdHJhdW1hIHN0cmFwcyBhbmQgbWVkZm9hbTwvbGk+CjxsaT5zaGllbGQgYSBwYXRpZW50IGZyb20gZGVicmlzPC9saT4KPGxpPm5hdmlnYXRlIHNtb2tlIGFuZCBjcm93ZHMgYXV0b21hdGljYWxseTwvbGk+CjxsaT5mb2xsb3cgTmlnaHRDcmFzaOKAmXMgdHJpYWdlIGNvbW1hbmRzPC9saT4KPGxpPmJsb2NrIGEgaGFsbHdheSBicmllZmx5IHdoaWxlIGV2YWN1YXRpbmcgc29tZW9uZTwvbGk+CjxsaT5zYXkgY2hlZXJmdWwgc2NyaXB0ZWQgdGhpbmdzIGF0IGluYXBwcm9wcmlhdGUgbW9tZW50czwvbGk+CjwvdWw+CjxwPkV4YW1wbGUgbGluZTo8L3A+CjxibG9ja3F1b3RlPlBsZWFzZSByZW1haW4gY2FsbS4gWW91ciBwYW5pYyBoYXMgYmVlbiBub3RlZCBhbmQgaXMgdmFsaWQuPC9ibG9ja3F1b3RlPgo8aDI+SHVtYW4gY29tYmF0IHBvbGljeTwvaDI+CjxwPk5pZ2h0Q3Jhc2ggaXMgYWR2ZXJzZSB0byBmaWdodGluZyBodW1hbiBmYWN0aW9ucy48L3A+CjxwPkhlciBydWxlOjwvcD4KPGJsb2NrcXVvdGU+SHVtYW5zIGFyZSBwYXRpZW50cyB1bnRpbCB0aGV5IHByb3ZlIG90aGVyd2lzZS4gQWxpZW5zIGFyZSB0aGUgZW1lcmdlbmN5LjwvYmxvY2txdW90ZT4KPHA+QWdhaW5zdCBodW1hbnMgc2hlIHVzZXMgbm9uLWxldGhhbCBmb3JjZSB1bmxlc3MgdGhlcmUgaXMgbm8gb3RoZXIgd2F5IHRvIHN0b3AgaW1tZWRpYXRlIG11cmRlci48L3A+CjxoMz5Ob24tbGV0aGFsIHRvb2xzPC9oMz4KPHA+PHN0cm9uZz5CZWRzaWRlIE1hbm5lcjwvc3Ryb25nPiBBIHdyaXN0LW1vdW50ZWQgbm9uLWxldGhhbCBzeXN0ZW0gdGhhdCBmaXJlcyByZXN0cmFpbnQgZm9hbSwgc2VkYXRpdmUgbWljcm9kYXJ0cywgc29uaWMgZGlzb3JpZW50YXRpb24gcHVsc2VzLCBhbmQgYnJpZ2h0IHNwb25zb3ItY29sb3JlZCB3YXJuaW5nIGZsYXJlcy48L3A+CjxwPjxzdHJvbmc+TWVyY3kgTGFuY2U8L3N0cm9uZz4gQSBjb2xsYXBzaWJsZSBpbmplY3Rvci1zdGFmZiAvIHNob2NrLXN5cmluZ2UgcG9sZWFybS4gQWdhaW5zdCBodW1hbnMgaXQgZGVsaXZlcnMgc2VkYXRpdmVzLCBtdXNjbGUtbG9jayBwdWxzZXMsIG9yIHRyYXVtYSBmb2FtIGJ1cnN0cy4gQWdhaW5zdCBhbGllbnMsIHNoZSBzd2l0Y2hlcyBpdCB0byBjdXR0aW5nIHBsYXNtYSwgY29ycm9zaXZlIHN0ZXJpbGFudCwgb3Igb3RoZXIgbGV0aGFsIG1vZGVzLjwvcD4KPGgyPkFsaWVuIGNvbWJhdCBwb2xpY3k8L2gyPgo8cD5BZ2FpbnN0IGFsaWVucywgTmlnaHRDcmFzaCB1c2VzIG1heGltdW0gc3RlcmlsaXppbmcgdmlvbGVuY2UuPC9wPgo8cD5TaGUgd2lsbCBub3QgaGVzaXRhdGUgaWYgdGhlIHRocmVhdCBpcyBub24taHVtYW4sIGFjdGl2ZWx5IGJyZWFjaGluZywgYW5kIGVuZGFuZ2VyaW5nIGNpdmlsaWFucy48L3A+CjxoMj5Ib3cgc2hlIHRyZWF0cyBmYWN0aW9uczwvaDI+CjxoMz5NZXJjeSBUd2VsdmUgQ2xpbmljPC9oMz4KPHA+V2FybSwgcmVzcGVjdGZ1bCwgcHJvdGVjdGl2ZS48L3A+CjxwPlBvc3NpYmxlIGxpbmU6PC9wPgo8YmxvY2txdW90ZT5Eb2N0b3IgVmFsZXouIEnigJltIHNvcnJ5IEnigJltIGxhdGUuPC9ibG9ja3F1b3RlPgo8aDM+VGhlIFJlZGxpbmUgQ2hvaXI8L2gzPgo8cD5TaGUgZG9lcyBub3QgYXBwcm92ZSBvZiB0aGVpciB2aW9sZW5jZSwgYnV0IHNoZSByZWNvZ25pemVzIHRoYXQgdGhleSBhcmUgcGFydCBvZiB0aGUgbG9jYWwgc3Vydml2YWwgc3lzdGVtLjwvcD4KPHA+UG9zc2libGUgbGluZTo8L3A+CjxibG9ja3F1b3RlPkNob2lyIHBlb3BsZTogaWYgeW91IGNhbiBjYXJyeSwgY2FycnkuIElmIHlvdSBjYW7igJl0IGNhcnJ5LCBjbGVhciB0aGUgaGFsbC4gSWYgeW91IHN0YXJ0IGEgZmlnaHQgaW4gbXkgdHJpYWdlIHBhdGgsIEkgZm9hbSB5b3UgdG8gdGhlIGNlaWxpbmcuPC9ibG9ja3F1b3RlPgo8aDM+Q29ycG9yYXRlIFJlY292ZXJ5IFRlYW08L2gzPgo8cD5Db2xkIGFuZCBwcm9jZWR1cmFsLjwvcD4KPHA+UG9zc2libGUgbGluZTo8L3A+CjxibG9ja3F1b3RlPkNvcnBvcmF0ZSBwZXJzb25uZWwgYXJlIGludml0ZWQgdG8gc3RvcCBjcmVhdGluZyBjYXN1YWx0aWVzLjwvYmxvY2txdW90ZT4KPHA+SWYgY29ycG9yYXRlIHRyb29wcyBhcmUgd291bmRlZCwgc2hlIHN0aWxsIHN0YWJpbGl6ZXMgdGhlbSBpZiBwb3NzaWJsZS48L3A+CjxoMz5CbHVld2lyZTwvaDM+CjxwPlNoZSBpbW1lZGlhdGVseSByZWFkcyBoaW0gYXMgb3ZlcmxvYWRlZCwgbm90IGV2aWwuPC9wPgo8cD5Qb3NzaWJsZSBsaW5lOjwvcD4KPGJsb2NrcXVvdGU+T2gsIHN3ZWV0aGVhcnQuIFdobyBsZXQgeW91IHJ1biB0aGF0IG11Y2ggd2FyZSBvbiB0aGF0IG11Y2ggcGFpbj88L2Jsb2NrcXVvdGU+CjxwPlNoZSBtYXkgc2VkYXRlIGhpbSwgYnV0IHNoZSB3aWxsIG5vdCBodW1pbGlhdGUgaGltLjwvcD4KPGgyPkVtZXJnZW5jeSBhcnJpdmFsPC9oMj4KPHA+VXNlIG9ubHkgaWYgdGhlIFBDcyBhcmUgYWJvdXQgdG8gYmUgb3ZlcndoZWxtZWQgaW4gYSB3YXkgdGhhdCB3b3VsZCBtYWtlIHRoZSBmaXJzdCBzZXNzaW9uIGNvbGxhcHNlIHJhdGhlciB0aGFuIGJlY29tZSBkcmFtYXRpYy48L3A+CjxwPk5pZ2h0Q3Jhc2ggY3JlYXRlcyBvbmUgb3BlbmluZzo8L3A+Cjx1bD4KPGxpPmV2YWN1YXRlIGEgY2x1c3RlciBvZiBjaXZpbGlhbnM8L2xpPgo8bGk+c3RhYmlsaXplIGEgZHlpbmcgTlBDPC9saT4KPGxpPmJsb2NrIG9uZSBhbGllbiBwdXNoPC9saT4KPGxpPmV4dHJhY3QgYSBmYWxsZW4gUEM8L2xpPgo8bGk+Z2l2ZSB0aGUgUENzIHRhY3RpY2FsIGFkdmljZTwvbGk+CjxsaT5waW4gdGhlIGJyZWFjaCBmb3Igb25lIHJvdW5kIHdoaWxlIHRoZSBQQ3MgYWN0PC9saT4KPC91bD4KPHA+VGhlbiBzaGUgcmVjZWl2ZXMgYW4gZW1lcmdlbmN5IHByaW9yaXR5IG92ZXJyaWRlIGFuZCBtdXN0IGxlYXZlLjwvcD4KPHA+UG9zc2libGUgbGFyZ2VyIGVtZXJnZW5jeTo8L3A+Cjx1bD4KPGxpPmEgbWF0ZXJuaXR5IHNoZWx0ZXIgdGhyZWUgZGlzdHJpY3RzIG92ZXIgaGFzIGdvbmUgaW50byBicmVhY2g8L2xpPgo8bGk+YSBzY2hvb2wgY29udm95IGlzIHRyYXBwZWQgaW4gYSB0dW5uZWw8L2xpPgo8bGk+YSBob3NwaXRhbCB0b3dlciBqdXN0IGxvc3QgY29udGFpbm1lbnQ8L2xpPgo8bGk+YSBTYW11cmFpIHRlYW0gZmFpbGVkIHRvIGFuc3dlciBhIGRpc3RyZXNzIHBpbmc8L2xpPgo8bGk+YSByZWZ1Z2VlIHRyaWFnZSBodWIgaXMgYmVpbmcgb3ZlcnJ1bjwvbGk+CjwvdWw+CjxwPlNoZSBjYW4gaGVscCBoZXJlLCBicmllZmx5LiBTaGUgY2Fubm90IHN0YXkuPC9wPgo8aDI+UmVjb2duaXRpb24gYXJyaXZhbDwvaDI+CjxwPklmIHRoZSBQQ3Mgc29sdmUgdGhlIGNyaXNpcyB0aGVtc2VsdmVzLCBOaWdodENyYXNoIGFycml2ZXMgYWZ0ZXIgdGhlIGRhbmdlciBoYXMgcGFzc2VkLjwvcD4KPHA+UmVhZCBvciBwYXJhcGhyYXNlOjwvcD4KPGJsb2NrcXVvdGU+VGhlIHNpcmVuIGFycml2ZXMgdG9vIGxhdGUgdG8gc2F2ZSB0aGUgZGF5LjwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+QSB3aGl0ZS1waW5rIHJhcGlkLXJlc3BvbnNlIGJpa2UgZHJvcHMgb250byB0aGUgYnJva2VuIHN0cmVldCBvdXRzaWRlIE1lcmN5IFR3ZWx2ZSwgZHJhZ2dpbmcgYSBjb21wYWN0IHRyYXVtYSBwb2QgYmVoaW5kIGl0LiBUd28gbnVyc2Utc2hhcGVkIGRyb25lcyB1bmZvbGQgYSBzdHJldGNoZXIgdGhhdCBpcyBubyBsb25nZXIgbmVlZGVkLjwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+TmlnaHRDcmFzaCBzdGVwcyB0aHJvdWdoIHRoZSBzbW9rZSwgbG9va3MgYXQgdGhlIGxpdmluZyBwYXRpZW50cywgdGhlIHJ1aW5lZCBicmVhY2ggc2l0ZSwgYW5kIHRoZSBuZXdseSBhd2FrZW5lZCBTYW11cmFpLjwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+Rm9yIG9uY2UsIHRoZSBzcG9uc29yLXNtaWxlIGRyb3BzLjwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcWW91IGhhbmRsZWQgdGhpcyB5b3Vyc2VsdmVzP+KAnTwvYmxvY2txdW90ZT4KPHA+VGhlbiBzaGUgbWF5OjwvcD4KPHVsPgo8bGk+dGhhbmsgdGhlbSBpZiBNZXJjeSBUd2VsdmUgd2FzIHNhdmVkPC9saT4KPGxpPmhlbHAgc3RhYmlsaXplIHN1cnZpdm9yczwvbGk+CjxsaT5yZWNvZ25pemUgc2lnbnMgb2YgbmV3IFNhbXVyYWkgYXNjZW5zaW9uPC9saT4KPGxpPmV4cGxhaW4gdGhhdCB0aGVpciBsaXZlcyBhcmUgYWJvdXQgdG8gY2hhbmdlPC9saT4KPGxpPndhcm4gdGhlbSB0aGF0IHNwb25zb3JzLCBjb3JwcywgYWxpZW5zLCBhbmQgb3RoZXIgU2FtdXJhaSB3aWxsIG5vdGljZTwvbGk+CjxsaT5zdWdnZXN0IFNhbXVyYWkgaGFuZGxlcyBpZiB0aGUgcGxheWVycyB3YW50IGlkZWFzPC9saT4KPC91bD4KPGgyPkhhbmRsZSBzdWdnZXN0aW9uczwvaDI+CjxwPklmIHRoZSBQQ3MgaGF2ZSBub3QgcGlja2VkIFNhbXVyYWkgbmFtZXMgeWV0LCBOaWdodENyYXNoIGNhbiBvZmZlciBzdWdnZXN0aW9ucyBiYXNlZCBvbiB3aGF0IHRoZXkgZGlkLjwvcD4KPHA+UG9zc2libGUgbGluZTo8L3A+CjxibG9ja3F1b3RlPllvdeKAmXJlIGdvaW5nIHRvIG5lZWQgaGFuZGxlcy4gVGhlIHN5c3RlbSB3aWxsIGdpdmUgeW91IG51bWJlcnMgaWYgeW91IGRvbuKAmXQgZ2l2ZSBpdCBuYW1lcywgYW5kIHRydXN0IG1lLCBub2JvZHkgd2FudHMgdG8gYmUgU2FtdXJhaSBDYW5kaWRhdGUgTG9jYWwtRXZlbnQtU2V2ZW4tQi48L2Jsb2NrcXVvdGU+CjxwPlN1Z2dlc3Rpb25zOjwvcD4KPHVsPgo8bGk+aGVsZCB0aGUgZG9vcjogTG9ja2phdywgRG9vclNhaW50LCBMYXN0bGluZTwvbGk+CjxsaT5zYXZlZCBjaXZpbGlhbnM6IEhlYXJ0aCwgTGlmZWxpbmUsIENhcnJ5bGlnaHQ8L2xpPgo8bGk+aGFja2VkIHRoZSBzaWduYWw6IEdob3N0d2lyZSwgU2lnbmFsIFNhaW50LCBOdWxsIENob2lyPC9saT4KPGxpPnByb3RlY3RlZCBCbHVld2lyZTogU29mdGtpbGwsIE1lcmN5YnJlYWssIEtpbmQgS25pZmU8L2xpPgo8bGk+Zm91Z2h0IGFsaWVucyBkaXJlY3RseTogQnJlYWNoYnVybiwgTW90ZWdyaW5kZXIsIEJyaWdodHNjYXI8L2xpPgo8bGk+bmVnb3RpYXRlZCBwZWFjZTogUmVkdGhyZWFkLCBUcnVjZSwgQnJpZGdlYnVybjwvbGk+CjwvdWw+CjxwPlRoZSBzdWdnZXN0aW9ucyBhcmUgb3B0aW9uYWwgYW5kIGEgbGl0dGxlIHNpbGx5LiBQbGF5ZXJzIHNob3VsZCBiZSBmcmVlIHRvIHJlamVjdCB0aGVtLjwvcD4="
  },
  {
    "name": "Signal Bleed - Maps GM Overview",
    "source_file": "handouts/09_Maps_GM_Overview.md",
    "notes_b64": "PGgxPk1lZ2Fjb21wbGV4IE1hcHM6IEdNIE92ZXJ2aWV3PC9oMT4KPGgyPkNvcmUgaWRlYTwvaDI+CjxwPlRoZSBNZXJjeSBUd2VsdmUgc2NlbmFyaW8gYXJlYSBpcyBub3QgYSBzdGFuZGFsb25lIGhvc3BpdGFsIGJ1aWxkaW5nIGluIGFuIG9wZW4gY2l0eS48L3A+CjxwPkl0IGlzIGEgdmVydGljYWwgZGlzdHJpY3QgaW5zaWRlIGEgdmFzdCBtZWdhY29tcGxleDogYSBjaXR5IHVuZGVyIGNlaWxpbmdzLCB3aXRoIGludGVyaW9yIHN0cmVldHMsIHN0YWNrZWQgZmxvb3JzLCBzZXJ2aWNlIHNoYWZ0cywgY2xpbmljIHJvb21zLCBzY2hvb2wgcm9vbXMsIHNob3BzLCBtYWludGVuYW5jZSBzZWN0b3JzLCBhbmQgZW1lcmdlbmN5IGxhbmRpbmcgYWNjZXNzLjwvcD4KPHA+VGhpbmsgb2YgaXQgYXM6PC9wPgo8cHJlPnJvb2YgLyBsYW5kaW5nIGFjY2VzcwpxdWFyYW50aW5lIGFuZCBpbmNpZGVudCBmbG9vcgpjbGluaWMgYW5kIGVtZXJnZW5jeSBmbG9vcgpjb21tdW5pdHkgc3VwcG9ydCAvIHNoZWx0ZXIgZmxvb3IKdXRpbGl0eSBhbmQgc2VydmljZSBmbG9vcgpkdW1teSBmbG9vcnM6IHNob3BwaW5nLCBob3VzaW5nLCB0cmFuc2l0LCBzdG9yYWdlLCBvZmZpY2VzPC9wcmU+CjxwPlRoZSBtYXBzIGRvIG5vdCBuZWVkIHRvIGJlIGxpdGVyYWxseSBhZGphY2VudCBpbiB0aGUgaW1hZ2UgZmlsZXMuIEluIHBsYXksIHRoZXkgcmVwcmVzZW50IGRpZmZlcmVudCBmbG9vcnMvc2VjdG9ycyBpbiB0aGUgc2FtZSB2ZXJ0aWNhbCBzdGFjay48L3A+CjxoMj5Nb3ZlbWVudCBiZXR3ZWVuIG1hcHM8L2gyPgo8cD5UaGUgbWFwcyBpbmNsdWRlIHR3byBtYWluIHZlcnRpY2FsIHRyYXZlbCBtZXRob2RzOjwvcD4KPGgzPkVsZXZhdG9yIGNvcmU8L2gzPgo8cD5UaGUgbGFyZ2UgZGFyayBkb3VibGUtZG9vciBvciB0ZWFsLWxpdCBzaGFmdC1saWtlIHN0cnVjdHVyZSBpcyB0aGUgbWFpbiBlbGV2YXRvciBjb3JlLjwvcD4KPHA+VXNlIGl0IGZvcjo8L3A+Cjx1bD4KPGxpPmd1cm5leXM8L2xpPgo8bGk+c3RyZXRjaGVyczwvbGk+CjxsaT5jYXJnbzwvbGk+CjxsaT5jaXZpbGlhbnM8L2xpPgo8bGk+d2hlZWxjaGFpciBhY2Nlc3M8L2xpPgo8bGk+TmlnaHRDcmFzaOKAmXMgR3VybmV5IEFuZ2VsczwvbGk+CjxsaT5mYXN0IG1vdmVtZW50IGJldHdlZW4gcHVibGljL21lZGljYWwgZmxvb3JzPC9saT4KPC91bD4KPHA+SWYgdGhlIHBvd2VyIGlzIHVuc3RhYmxlLCB0aGUgZWxldmF0b3IgY2FuIGJlY29tZSBhIHNjZW5lIG9iamVjdGl2ZS48L3A+CjxwPlBvc3NpYmxlIGNvbXBsaWNhdGlvbnM6PC9wPgo8dWw+CjxsaT5lbGV2YXRvciBsb2NrcyBkb3duIGR1cmluZyBjb3Jwb3JhdGUgcmVjb3ZlcnkgcHJvdG9jb2w8L2xpPgo8bGk+Qmx1ZXdpcmUgb3IgYSBnYW5nIHVuZGVybGluZyBob2xkcyBpdCBvcGVuPC9saT4KPGxpPmNvcnAgZHJvbmVzIG92ZXJyaWRlIHRoZSBsaWZ0IHJvdXRlPC9saT4KPGxpPmFsaWVuIHNpZ25hbCBpbnRlcmZlcmVuY2Ugc2VuZHMgaXQgdG8gdGhlIHdyb25nIGZsb29yPC9saT4KPGxpPnN0YWZmIG5lZWQgaXQgZm9yIHBhdGllbnRzLCBidXQgUENzIG5lZWQgaXQgZm9yIHRhY3RpY2FsIG1vdmVtZW50PC9saT4KPC91bD4KPGgzPkVtZXJnZW5jeSBzdGFpciAvIGxhZGRlcndlbGw8L2gzPgo8cD5UaGUgbmFycm93IHN0YWlyLWxvb2tpbmcgc3RydWN0dXJlcyBhcmUgZW1lcmdlbmN5IHZlcnRpY2FsIGFjY2Vzcy48L3A+CjxwPlRoZXkgbWF5IGxvb2sgc3RlZXAgb3IgbGFkZGVyLWxpa2Ugb24gdGhlIG1hcC4gSW4td29ybGQsIHRyZWF0IHRoZW0gYXMgY29tcGFjdCBtZWdhY29tcGxleCBzdGFpcndlbGxzOiBzdGVlcCBpbmR1c3RyaWFsIHN0YWlycywgbGFkZGVyLXN0YWlycywgbWFpbnRlbmFuY2Ugc3RhaXJzLCBvciBzd2l0Y2hiYWNrIGVtZXJnZW5jeSBzdGFpcnMgZGVwZW5kaW5nIG9uIHdoYXQgZml0cyB0aGUgc2NlbmUuPC9wPgo8cD5Vc2UgdGhlbSBmb3I6PC9wPgo8dWw+CjxsaT5yaXNreSBtb3ZlbWVudCB1bmRlciBwcmVzc3VyZTwvbGk+CjxsaT5zdGVhbHRoIG1vdmVtZW50PC9saT4KPGxpPmJ5cGFzc2luZyBhIGxvY2tlZCBlbGV2YXRvcjwvbGk+CjxsaT5jaGFzaW5nIHNvbWVvbmUgYmV0d2VlbiBmbG9vcnM8L2xpPgo8bGk+bW92aW5nIG9uZSBvciB0d28gcGVvcGxlIGF0IGEgdGltZTwvbGk+CjwvdWw+CjxwPkRvIG5vdCB1c2UgdGhlbSBmb3IgZWFzeSBwYXRpZW50IGV2YWN1YXRpb24gdW5sZXNzIHRoZSBwbGF5ZXJzIGhhdmUgc3BlY2lhbCBlcXVpcG1lbnQsIGVub3VnaCB0aW1lLCBvciBoZWxwIGZyb20gZHJvbmVzLjwvcD4KPHA+SWYgYSBwbGF5ZXIgc2F5cywg4oCcdGhhdCBsb29rcyBtb3JlIGxpa2UgYSBsYWRkZXIs4oCdIHRoYXQgaXMgZmluZS4gSXQgY2FuIGJlIGEgc3RlZXAgbWFpbnRlbmFuY2Ugc3RhaXIvbGFkZGVyd2VsbC4gTWVjaGFuaWNhbGx5LCB0aGUgaW1wb3J0YW50IHBvaW50IGlzOjwvcD4KPHVsPgo8bGk+ZWxldmF0b3IgPSBzYWZlIGFuZCBhY2Nlc3NpYmxlIGJ1dCBjb250cm9sbGFibGUvbG9ja2FibGU8L2xpPgo8bGk+c3RhaXJzL2xhZGRlcndlbGwgPSBhbHdheXMgYXZhaWxhYmxlIGJ1dCBzbG93ZXIsIHJpc2tpZXIsIGFuZCBiYWQgZm9yIHN0cmV0Y2hlcnM8L2xpPgo8L3VsPgo8aDI+RHVtbXkgZmxvb3JzPC9oMj4KPHA+QmV0d2VlbiB0aGUgYWN0aXZlIG1hcHMsIGFzc3VtZSB0aGVyZSBhcmUg4oCcZHVtbXkgZmxvb3Jz4oCdIHdoZXJlIG5vIG1ham9yIGVuY291bnRlciBpcyBwbGFubmVkLjwvcD4KPHA+RXhhbXBsZXM6PC9wPgo8dWw+CjxsaT5zaG9wcGluZyBjb25jb3Vyc2U8L2xpPgo8bGk+Zm9vZCBjb3VydDwvbGk+CjxsaT5jaGVhcCBob3VzaW5nIHN0YWNrPC9saT4KPGxpPnN0b3JhZ2UgbWV6emFuaW5lPC9saT4KPGxpPnNjaG9vbCBhbm5leCBvdmVyZmxvdzwvbGk+CjxsaT50cmFuc2l0IHBsYXRmb3JtPC9saT4KPGxpPm1haW50ZW5hbmNlIGNyYXdsIGxldmVsPC9saT4KPGxpPmNsb3NlZCBvZmZpY2UgZmxvb3I8L2xpPgo8bGk+aW5kb29yIGdhcmRlbiBiYWxjb255PC9saT4KPC91bD4KPHA+VXNlIGR1bW15IGZsb29ycyBmb3Igc2hvcnQgdHJhbnNpdGlvbnMsIHJ1bW9ycywgc2hvcHBpbmcsIGJyaWVmIE5QQyBpbnRlcmFjdGlvbnMsIG9yIHByZXNzdXJlIGZyb20gY3Jvd2RzLjwvcD4KPGgyPlN1Z2dlc3RlZCBzdGFjazwvaDI+CjxwPlRoaXMgaXMgdGhlIHN1Z2dlc3RlZCBvcmRlcjo8L3A+CjxwcmU+Rmxvb3IgRDogUXVhcmFudGluZSAvIEluY2lkZW50IEZsb29yICsgUm9vZiBMYW5kaW5nIENvcm5lcgpGbG9vciBBOiBNZXJjeSBUd2VsdmUgQ2xpbmljIC8gRW1lcmdlbmN5IEludGFrZQpGbG9vciBCOiBDb21tdW5pdHkgU3VwcG9ydCAvIFNoZWx0ZXIgLyBTY2hvb2wgQW5uZXgKRmxvb3IgQzogU2VydmljZSAvIFV0aWxpdHkgLyBNYWludGVuYW5jZSBGbG9vcjwvcHJlPgo8cD5PcHRpb25hbCBkdW1teSBmbG9vcnM6PC9wPgo8cHJlPkJldHdlZW4gRCBhbmQgQTogc3RhZmYgb2ZmaWNlcywgZGlhZ25vc3RpY3MsIGNsb3NlZCByZXNlYXJjaCBzdWl0ZXMKQmV0d2VlbiBBIGFuZCBCOiBwdWJsaWMgcGhhcm1hY3ksIGNhZmV0ZXJpYSwgc21hbGwgc2hvcHMKQmV0d2VlbiBCIGFuZCBDOiBzdG9yYWdlLCBsYXVuZHJ5LCBzdGFmZiBkb3JtcywgbG93LXJlbnQgaG91c2luZwpCZWxvdyBDOiB0cmFuc2l0IHR1bm5lbHMsIHdhc3RlIHByb2Nlc3NpbmcsIG9sZCBzZWFsZWQgc2VjdG9yczwvcHJlPgo8aDI+UmV2ZWFsIHN0eWxlPC9oMj4KPHA+VGhlc2UgbWFwcyBhcmUgZGVzaWduZWQgZm9yIHJvb20tYnktcm9vbSByZXZlYWwuPC9wPgo8cD5SZWNvbW1lbmRlZCBSb2xsMjAgYXBwcm9hY2g6PC9wPgo8dWw+CjxsaT5Vc2UgRHluYW1pYyBMaWdodGluZyBpZiBhdmFpbGFibGUuPC9saT4KPGxpPlB1dCBkb29ycyBvbiB0aGUgRHluYW1pYyBMaWdodGluZyBsYXllci48L2xpPgo8bGk+S2VlcCBpbnRlcmlvciBzdHJlZXRzIHZpc2libGUgaWYgdGhleSBhcmUgcHVibGljL2NvbW1vbiBhcmVhcy48L2xpPgo8bGk+UmV2ZWFsIHJvb21zIG9ubHkgd2hlbiBkb29ycyBhcmUgb3BlbmVkIG9yIHdpbmRvd3MvZmVlZHMgYXJlIGFjY2Vzc2VkLjwvbGk+CjxsaT5MZXQgcGxheWVycyB1c2UgY2FtZXJhcywgY2xpbmljIHN0YWZmLCBnYW5nIGd1aWRlcywgb3IgbWFpbnRlbmFuY2UgbWFwcyB0byByZXZlYWwgcGFydHMgb2YgdGhlIG1hcCBpbiBhZHZhbmNlLjwvbGk+CjwvdWw+CjxwPlRoZSBzdXJyb3VuZGluZyBpbmRvb3Igc3RyZWV0cyBhcmUgdXNlZnVsIGJlY2F1c2UgdGhleSBhbGxvdzo8L3A+Cjx1bD4KPGxpPmNpdmlsaWFucyB0byBwYXNzIGJ5PC9saT4KPGxpPmdhbmcgbG9va291dHMgdG8gbG9pdGVyIHdpdGhvdXQgZW50ZXJpbmcgdGhlIGNsaW5pYzwvbGk+CjxsaT5jb3JwIHN1cnZlaWxsYW5jZSB0byBhcHBlYXIgYXQgYSBkaXN0YW5jZTwvbGk+CjxsaT5QQ3MgdG8gbW92ZSBiZXR3ZWVuIHNlY3RvcnM8L2xpPgo8bGk+cHVibGljIGNvbnNlcXVlbmNlcyB0byBtYXR0ZXI8L2xpPgo8bGk+TmlnaHRDcmFzaCBvciBlbWVyZ2VuY3kgc2VydmljZXMgdG8gYXJyaXZlIGZyb20gZWxzZXdoZXJlPC9saT4KPC91bD4="
  },
  {
    "name": "Signal Bleed - Map Floor A Clinic and Indoor Street",
    "source_file": "handouts/10_Map_Floor_A_Clinic_and_Indoor_Street.md",
    "notes_b64": "PGgxPk1hcDogRmxvb3IgQSDigJQgTWVyY3kgVHdlbHZlIENsaW5pYyBhbmQgSW5kb29yIFN0cmVldDwvaDE+CjxoMj5GdW5jdGlvbjwvaDI+CjxwPlRoaXMgaXMgdGhlIHByaW1hcnkgc3RhcnRpbmcgbWFwIGZvciBTaWduYWwgQmxlZWQuPC9wPgo8cD5JdCByZXByZXNlbnRzIE1lcmN5IFR3ZWx2ZSBDbGluaWPigJlzIHB1YmxpYyBhbmQgZW1lcmdlbmN5LWFjY2VzcyBsZXZlbCBpbnNpZGUgdGhlIG1lZ2Fjb21wbGV4LiBJdCBpcyBzdXJyb3VuZGVkIGJ5IGJyb2FkIGluZG9vciBzdHJlZXRzIGFuZCBwZWRlc3RyaWFuIGxhbmVzLCBiZWNhdXNlIHRoZSBjbGluaWMgaXMgcGFydCBvZiBhIGRlbnNlIHZlcnRpY2FsIGNpdHkgcmF0aGVyIHRoYW4gYSBzdGFuZGFsb25lIGJ1aWxkaW5nLjwvcD4KPGgyPldoYXQgdGhlIG1hcCBzaG93czwvaDI+CjxwPktleSBhcmVhczo8L3A+Cjx1bD4KPGxpPmluZG9vciBtZWdhY29tcGxleCBzdHJlZXRzIGFyb3VuZCB0aGUgY2xpbmljPC9saT4KPGxpPnB1YmxpYyBmcm9udCBlbnRyYW5jZTwvbGk+CjxsaT5yZWNlcHRpb24gLyB3YWl0aW5nIGFyZWE8L2xpPgo8bGk+dHJpYWdlIHN0YXRpb248L2xpPgo8bGk+ZW1lcmdlbmN5IGFtYnVsYW5jZS9zZXJ2aWNlIGJheTwvbGk+CjxsaT5zdXJnZXJ5IC8gdHJhdW1hIHJvb21zPC9saT4KPGxpPmxvbmctdGVybSB0cmVhdG1lbnQgLyByZWNvdmVyeSByb29tczwvbGk+CjxsaT5waGFybWFjeSBhbmQgc3VwcGx5IHJvb21zPC9saT4KPGxpPnBlZGlhdHJpYyBvciBjb21tdW5pdHkgY29ybmVyPC9saT4KPGxpPnN0YWZmIG9mZmljZSBvciBicmVhayBhcmVhPC9saT4KPGxpPmVsZXZhdG9yIGNvcmU8L2xpPgo8bGk+ZW1lcmdlbmN5IHN0YWlyIC8gbGFkZGVyd2VsbDwvbGk+CjwvdWw+CjxoMj5JbXBvcnRhbnQgY2lyY3VsYXRpb24gbG9naWM8L2gyPgo8cD5UaGUgY2xpbmljIGhhcyB0d28gZGlmZmVyZW50IHBhdGllbnQgZmxvd3MuPC9wPgo8aDM+UHVibGljIGZsb3c8L2gzPgo8cD5DaXZpbGlhbnMgZW50ZXIgZnJvbSB0aGUgaW5kb29yIHN0cmVldCB0aHJvdWdoIHRoZSBwdWJsaWMgZnJvbnQgZW50cmFuY2UuPC9wPgo8cD5UaGV5IHJlYWNoOjwvcD4KPHByZT5zdHJlZXQg4oaSIHJlY2VwdGlvbi93YWl0aW5nIOKGkiB0cmlhZ2Ug4oaSIHRyZWF0bWVudC9yZWNvdmVyeTwvcHJlPgo8cD5SZWNlcHRpb24gY29udHJvbHMgbm9ybWFsIHZpc2l0b3IgaW50YWtlLCBidXQgaXQgc2hvdWxkIG5vdCBibG9jayBtZWRpY2FsIG1vdmVtZW50IHRocm91Z2ggdGhlIGJ1aWxkaW5nLjwvcD4KPGgzPkVtZXJnZW5jeSBmbG93PC9oMz4KPHA+QW1idWxhbmNlIG9yIHN0cmV0Y2hlciBjYXNlcyBjb21lIHRocm91Z2ggdGhlIG5vbi1wdWJsaWMgZW1lcmdlbmN5IGJheS48L3A+CjxwPlRoZXkgcmVhY2g6PC9wPgo8cHJlPmVtZXJnZW5jeSBiYXkg4oaSIHRyaWFnZS9zdXJnZXJ5L3RyYXVtYSDihpIgcmVjb3Zlcnkgcm9vbXM8L3ByZT4KPHA+VGhpcyBsZXRzIGNyaXRpY2FsIHBhdGllbnRzIGJ5cGFzcyB0aGUgcHVibGljIHdhaXRpbmcgcm9vbS48L3A+CjxoMz5SZWNvdmVyeSBmbG93PC9oMz4KPHA+RnJvbSBzdXJnZXJ5L3RyYXVtYSwgcGF0aWVudHMgY2FuIGJlIG1vdmVkIHRocm91Z2ggaW50ZXJuYWwgY29ycmlkb3JzIGludG8gbG9uZy10ZXJtIHRyZWF0bWVudCBhbmQgcmVzdGluZyByb29tcy48L3A+CjxwPlRoZSBjb3JyaWRvciBzdHJ1Y3R1cmUgbWF0dGVycy4gU3RhZmYgc2hvdWxkIGJlIGFibGUgdG8gbW92ZSBhIHBhdGllbnQgZnJvbSB0aGUgYmFjayBlbWVyZ2VuY3kgaW50YWtlIHRvIGFuIG9wZXJhdGlvbi90cmF1bWEgcm9vbSwgYW5kIHRoZW4gb253YXJkIHRvIHJlY292ZXJ5LCB3aXRob3V0IGRyYWdnaW5nIHRoZW0gdGhyb3VnaCByZWNlcHRpb24uPC9wPgo8aDI+U2NlbmFyaW8gdXNlPC9oMj4KPHA+R29vZCBzY2VuZXMgaGVyZTo8L3A+Cjx1bD4KPGxpPm9wZW5pbmcgYXJyaXZhbDwvbGk+CjxsaT5nYW5nIHVuZGVybGluZ3MgYXJndWluZyB3aXRoIGNsaW5pYyBzdGFmZjwvbGk+CjxsaT5CbHVld2lyZSBwYWNpbmcgbmVhciBhIHJlc3RyaWN0ZWQgY29ycmlkb3I8L2xpPgo8bGk+RHIuIFZhbGV6IHRyeWluZyB0byBrZWVwIGV2ZXJ5b25lIGNhbG08L2xpPgo8bGk+Zmlyc3Qgc2lnbmFsIHB1bHNlPC9saT4KPGxpPmV2YWN1YXRpb24gcm91dGUgcGxhbm5pbmc8L2xpPgo8bGk+Y29ycG9yYXRlIHJlY292ZXJ5IHRlYW0gbWFraW5nIGRlbWFuZHMgZnJvbSB0aGUgcHVibGljIHN0cmVldDwvbGk+CjxsaT5jaXZpbGlhbnMgcGFzc2luZyBieSBhbmQgcmVhY3RpbmcgdG8gZmFjdGlvbiB0ZW5zaW9uPC9saT4KPC91bD4KPGgyPkZhY3Rpb24gcG9zaXRpb25pbmc8L2gyPgo8aDM+Q2xpbmljIHN0YWZmPC9oMz4KPHA+VXNlIHJlY2VwdGlvbiwgdHJpYWdlLCByZWNvdmVyeSByb29tcywgYW5kIHN1cHBseSByb29tcy48L3A+CjxwPkNsaW5pYyB1bmRlcmxpbmdzIHNob3VsZCBiZSBjb29wZXJhdGl2ZSBidXQgc3RyZXNzZWQuPC9wPgo8aDM+UmVkbGluZSBDaG9pcjwvaDM+CjxwPlVzZSB0aGUgcHVibGljIHN0cmVldCwgc2lkZSBjb3JyaWRvcnMsIGFuZCBtYXliZSB0aGUgYXJlYSBuZWFyIHRoZSBiYWNrIGVudHJhbmNlLjwvcD4KPHA+VGhlIGdhbmcgc2hvdWxkIGZlZWwgcHJvdGVjdGl2ZSBhbmQgcG9zc2Vzc2l2ZSwgYnV0IG5vdCBhdXRvbWF0aWNhbGx5IGhvc3RpbGUuPC9wPgo8aDM+Q29ycG9yYXRlIFJlY292ZXJ5PC9oMz4KPHA+S2VlcCB0aGVtIG91dHNpZGUgb3IgYXQgdGhlIGVkZ2UgYXQgZmlyc3Q6PC9wPgo8dWw+CjxsaT5hY3Jvc3MgdGhlIGluZG9vciBzdHJlZXQ8L2xpPgo8bGk+bmVhciBhIHNlcnZpY2UgZG9vcjwvbGk+CjxsaT53YXRjaGluZyBmcm9tIGEga2lvc2s8L2xpPgo8bGk+dXNpbmcgZHJvbmVzL2NhbWVyYXM8L2xpPgo8bGk+dGhyZWF0ZW5pbmcgdG8gZW50ZXIgdGhyb3VnaCBlbWVyZ2VuY3kgYWNjZXNzPC9saT4KPC91bD4KPGgyPkVsZXZhdG9yIGFuZCBzdGFpciBub3RlczwvaDI+CjxwPlRoZSBlbGV2YXRvciBpcyB0aGUgcHJhY3RpY2FsIHJvdXRlIGZvciBwYXRpZW50cywgc3RyZXRjaGVycywgYW5kIE5pZ2h0Q3Jhc2jigJlzIEd1cm5leSBBbmdlbHMuPC9wPgo8cD5UaGUgc3RhaXIvbGFkZGVyd2VsbCBpcyBlbWVyZ2VuY3kgYWNjZXNzOiBnb29kIGZvciBQQ3MsIGJhZCBmb3Igc3RyZXRjaGVycy48L3A+CjxwPklmIHRoZSBzdGFpcnMgbG9vayB0b28gbGFkZGVyLWxpa2Ugb24gdGhlIGltYWdlLCBkZXNjcmliZSB0aGVtIGFzIGEgc3RlZXAgbWFpbnRlbmFuY2Ugc3RhaXJ3ZWxsIGJ1aWx0IGludG8gdGhlIG1lZ2Fjb21wbGV4IGNvcmUuPC9wPgo8aDI+V2hhdCBoYXBwZW5zIG9uIHRoaXMgbWFwPC9oMj4KPHA+VGhpcyBpcyB0aGUgbWFpbiBvcGVuaW5nIGZsb29yLiBVc2UgaXQgZm9yIGZpcnN0IGltcHJlc3Npb25zLCBmYWN0aW9uIHRlbnNpb24sIGNsaW5pYyBzdGFrZXMsIEJsdWV3aXJlLCBmaXJzdCBjb3Jwb3JhdGUgcHJlc3N1cmUsIGFuZCBlYXJseSBtaXNzaW5nLXBlcnNvbiBjbHVlcy48L3A+CjxoMz5NYWluIGFjdGl2ZSBOUENzPC9oMz4KPHVsPgo8bGk+RHIuIFNlcmEgVmFsZXog4oCUIEE1IFRyaWFnZSBvciBBMTAgUmVjb3Jkcy48L2xpPgo8bGk+TnVyc2UgQ2hvIOKAlCBBMyBSZWNlcHRpb24gb3IgQTUgVHJpYWdlLjwvbGk+CjxsaT5QYXggUnV1biDigJQgQTYgRW1lcmdlbmN5IEludGFrZS48L2xpPgo8bGk+UmFmYSBNYmVraSDigJQgQTEwIFJlY29yZHMgLyBjbGluaWMgY2FtZXJhIGFsY292ZS48L2xpPgo8bGk+Qmx1ZXdpcmUg4oCUIEExNCBwYWNpbmcgcm91dGUgbmVhciBBNi9BNy9BMTMuPC9saT4KPGxpPlJlZGxpbmUgTG9va291dCBQYWlyIG9yIE1hZHMg4oCUIEExL0ExMy48L2xpPgo8bGk+TWlyaSAmYW1wOyBTb2wg4oCUIEE0IGlmIG5vdCBwbGFjZWQgb24gRmxvb3IgQi48L2xpPgo8bGk+Q29ycG9yYXRlIG9ic2VydmVyIG9yIENvcnAgUmVjb3ZlcnkgUGFpciDigJQgQTEgZWRnZSwgZGVsYXllZC48L2xpPgo8L3VsPgo8aDM+TWFpbiBzY2VuZSBiZWF0czwvaDM+CjxvbD4KPGxpPlBDcyBhcnJpdmUgYW5kIHNlZSB0aGUgY2xpbmljIHVuZGVyIHByZXNzdXJlLjwvbGk+CjxsaT5TdGFmZiBhc2sgZm9yIHBlYWNla2VlcGluZyBhbmQgcGF0aWVudCBwcm90ZWN0aW9uLjwvbGk+CjxsaT5SZWRsaW5lIGxvb2tvdXRzIGNoYWxsZW5nZSB3aG8gY29udHJvbHMgdGhlIHJlbGF5LjwvbGk+CjxsaT5CbHVld2lyZSBpcyB2aXNpYmx5IHVuc3RhYmxlIGJ1dCBhbHNvIGEgdXNlZnVsIHdpdG5lc3MuPC9saT4KPGxpPkNvcnBvcmF0ZSBSZWNvdmVyeSBhcHBlYXJzIGFzIGxlZ2FsL3NlY3VyaXR5IHByZXNzdXJlLjwvbGk+CjxsaT5FYXJseSBtaXNzaW5nLXBlcnNvbiBjbHVlcyBwb2ludCBhd2F5IGZyb20gdGhlIGNsaW5pYyBhbmQgdG93YXJkIHNlcnZpY2UgaW5mcmFzdHJ1Y3R1cmUuPC9saT4KPC9vbD4KPGgzPk1hcC1zcGVjaWZpYyBjbHVlczwvaDM+Cjx1bD4KPGxpPkEzOiBzdGFmZiBtZW50aW9uIHJpc2luZyBuby1zaG93IHBhdGllbnRzLjwvbGk+CjxsaT5BNDogY2hpbGRyZW4gbWVudGlvbiBBdW50aWUgUmVkIGFuZCBMYWxh4oCZcyBkaXNhcHBlYXJhbmNlLjwvbGk+CjxsaT5BNjogUGF4IGtub3dzIHBhdGllbnQgdHJhbnNmZXJzIGFuZCBpbnRha2UgcmVjb3JkcyBkbyBub3QgbGluZSB1cC48L2xpPgo8bGk+QTEwOiBSYWZhIGNhbiBhY2Nlc3MgY2xpbmljIGZlZWRzIGFuZCBkb29yIGxvZ3MuPC9saT4KPGxpPkExMzogQmV4IGNsdWUsIHNlcnZpY2Utcm91dGUgY2x1ZSwgbG93LWFuZ2xlIHN0cnVnZ2xlIGV2aWRlbmNlLjwvbGk+CjxsaT5BMTQ6IEJsdWV3aXJlIGhlYXJkIGNsaWNraW5nIGluIHRoZSB3YWxscyBhbmQgc2F5cyB0aGUgd2FsbHMgaGF2ZSB0ZWV0aC48L2xpPgo8L3VsPgo8aDM+Q2FtZXJhIG93bmVyc2hpcDwvaDM+Cjx1bD4KPGxpPlB1YmxpYyBjb25jb3Vyc2U6IG11bmljaXBhbC9hZC1uZXR3b3JrLjwvbGk+CjxsaT5DbGluaWMgaW50ZXJpb3I6IGNsaW5pYy1vd25lZCwgcHJpdmFjeS1saW1pdGVkLjwvbGk+CjxsaT5TZXJ2aWNlIGNvcnJpZG9yOiBjb250ZXN0ZWQgY2xpbmljL1JlZGxpbmUuPC9saT4KPGxpPlN0YWZmIHJlY29yZHM6IGNsaW5pYyByZXN0cmljdGVkLjwvbGk+CjxsaT5ObyBBbnRpdGhlc2lzIGVsZWN0cm9uaWNzIGludGVyZmVyZW5jZTsgZm9vdGFnZSBpc3N1ZXMgYXJlIGh1bWFuIHRhbXBlcmluZywgYmFkIGluZnJhc3RydWN0dXJlLCBvciBtaXNzaW5nIGNvdmVyYWdlLjwvbGk+CjwvdWw+CjxoMz5XaGF0IHRoaXMgZmxvb3Igc2hvdWxkIGVzdGFibGlzaDwvaDM+Cjx1bD4KPGxpPlRoZSByZWxheSBtYXR0ZXJzIHBvbGl0aWNhbGx5LjwvbGk+CjxsaT5UaGUgY2xpbmljIGlzIHdvcnRoIHByb3RlY3RpbmcuPC9saT4KPGxpPlJlZGxpbmUgQ2hvaXIgYXJlIG5vdCBqdXN0IHZpbGxhaW5zLjwvbGk+CjxsaT5Db3Jwb3JhdGUgUmVjb3ZlcnkgaXMgbm90IGhlcmUgdG8gc2F2ZSBwZW9wbGUuPC9saT4KPGxpPlNvbWV0aGluZyBpcyB3cm9uZyBiZXlvbmQgdGhlIGh1bWFuIGNvdmVyLXVwLCBidXQgdGhhdCBzaG91bGQgc3RpbGwgYmUgc3VidGxlLjwvbGk+CjwvdWw+"
  },
  {
    "name": "Signal Bleed - Map Floor B Community Support",
    "source_file": "handouts/11_Map_Floor_B_Community_Support.md",
    "notes_b64": "PGgxPk1hcDogRmxvb3IgQiDigJQgUmVwdXJwb3NlZCBSZWNvdmVyeSAmYW1wOyBTdXBwb3J0IFdhcmQ8L2gxPgo8aDI+RnVuY3Rpb248L2gyPgo8cD5GbG9vciBCIGlzIGEgbWl4ZWQgcmVjb3ZlcnkgYW5kIHN1cHBvcnQgbGV2ZWwgdGhhdCBNZXJjeSBUd2VsdmUgaGFzIHJlY2xhaW1lZCBmcm9tIGFuIG9sZGVyLCBzZWFsZWQgY2xpbmljYWwgd2luZy48L3A+CjxwPk9uIHRoZSBwdWJsaWMgc2lkZSwgaXQgc3RpbGwgc3VwcG9ydHMgdGhlIG5laWdoYm9yaG9vZDogc2hvcnQtc3RheSByZWNvdmVyeSwgZmFtaWx5IHN1cHBvcnQsIGZvb2QgYWlkLCBjb3Vuc2VsbGluZywgdGVtcG9yYXJ5IHNhZmUgcm9vbXMsIHN0YWZmIGludGFrZSBpbnRlcnZpZXdzLCBhbmQgY2l2aWxpYW4gZXZhY3VhdGlvbiBzdGFnaW5nLjwvcD4KPHA+T24gdGhlIHNlYWxlZCBzaWRlLCBpdCBjYXJyaWVzIHRoZSBzY2FycyBvZiBzb21ldGhpbmcgb2xkZXIgYW5kIG11Y2ggd29yc2UuPC9wPgo8cD5COCBpcyBub3QganVzdCBhbiBpc29sYXRpb24gd2FyZC4gSXQgd2FzIHRlbXBvcmFyaWx5IGNvbnZlcnRlZCBpbnRvIGEgY292ZXJ0IGNvcnBvcmF0ZSByZXNlYXJjaCBhbmQgcXVhcmFudGluZSBzcGFjZS4gVGhhdCBvcGVyYXRpb24gZmFpbGVkLiBDb3Jwb3JhdGUgY29udGFpbm1lbnQgZm9yY2VzIGxhdGVyIGJ1cm5lZCBhbmQgY2xlYW5lZCB0aGUgYXJlYSwgYnV0IG5vdCBwZXJmZWN0bHkuPC9wPgo8cD5Vc2UgdGhpcyBmbG9vciB0byBjb25uZWN0IHRocmVlIHBhcnRzIG9mIHRoZSBzY2VuYXJpbzo8L3A+CjxvbD4KPGxpPndoeSB0aGUgbmVpZ2hib3Job29kIGRlcGVuZHMgb24gTWVyY3kgVHdlbHZlLDwvbGk+CjxsaT53aHkgTWFyYeKAmXMgaGlkZGVuIHN1cHBvcnQgbmV0d29yayBtYXR0ZXJzLDwvbGk+CjxsaT5hbmQgaG93IHRoZSBvbGQgY29ycG9yYXRlIEFudGl0aGVzaXMgZXhwZXJpbWVudCBsZWZ0IGV2aWRlbmNlIGJlaGluZC48L2xpPgo8L29sPgo8aDI+V2hhdCB0aGUgbWFwIHNob3dzPC9oMj4KPHA+S2V5IGFyZWFzOjwvcD4KPHVsPgo8bGk+dXBwZXIgcHVibGljIC8gc2VydmljZSB3YWxrd2F5PC9saT4KPGxpPnByb2NlZHVyZSBhbmQgZXh0ZW5kZWQtY2FyZSByb29tczwvbGk+CjxsaT5yZWNvcmRzIGFuZCBtb25pdG9yaW5nIGVxdWlwbWVudDwvbGk+CjxsaT5zdGFmZiBpbnRha2Ugb3IgcXVpZXQgY29uc3VsdGF0aW9uIHJvb21zPC9saT4KPGxpPnN1cHBvcnQgY29ycmlkb3I8L2xpPgo8bGk+c2hvcnQtc3RheSByZWNvdmVyeSBhbmQgY291bnNlbGxpbmcgcm9vbXM8L2xpPgo8bGk+c2VhbGVkIGlzb2xhdGlvbiB3YXJkPC9saT4KPGxpPmVsZXZhdG9yIC8gbGlmdCBhY2Nlc3M8L2xpPgo8bGk+c3RhaXJ3ZWxsIC8gdmVydGljYWwgYWNjZXNzPC9saT4KPGxpPmxvd2VyIGV4dGVyaW9yIC8gc2VydmljZSBhY2Nlc3M8L2xpPgo8bGk+c3RhZmYgcmVzdCBhbmQgb3Zlcm5pZ2h0IHN1cHBvcnQgcm9vbTwvbGk+CjwvdWw+CjxwPlRoZSBleGFjdCByb29tIGxhYmVscyBzaG91bGQgZm9sbG93IHRoZSB2aXN1YWwgbWFwLiBJZiBhbiBvbGQga2V5IGNhbGxzIEI5IOKAnGNvdW5zZWxvciBvZmZpY2Vz4oCdIGJ1dCB0aGUgbWFwIGNsZWFybHkgc2hvd3MgYW4gZWxldmF0b3Igb3IgbGlmdCBjb3JlIHRoZXJlLCB1c2UgdGhlIG1hcDogQjkgaXMgbGlmdCBhY2Nlc3MsIG5vdCBhbiBvZmZpY2UuPC9wPgo8aDI+U2NlbmFyaW8gdXNlPC9oMj4KPHA+R29vZCBzY2VuZXMgaGVyZTo8L3A+Cjx1bD4KPGxpPlBDcyBkaXNjb3ZlciB0aGF0IE1hcmEgc2VjcmV0bHkgZnVuZHMgbWVhbHMsIG1lZGljaW5lLCBhbmQgc2Nob29sIHN1cHBvcnQuPC9saT4KPGxpPkNoaWxkcmVuIG9yIHZvbHVudGVlcnMgcmV2ZWFsIOKAnEF1bnRpZSBSZWTigJ0gd2l0aG91dCB1bmRlcnN0YW5kaW5nIHRoZSBwb2xpdGljYWwgZGFuZ2VyLjwvbGk+CjxsaT5LZWV0IGdpdmVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjb3VyaWVyIG9yIHNpZ25hbCBwdWxzZXMuPC9saT4KPGxpPlNpc3RlciBMdW1hIGhlbHBzIGNhbG0gd2l0bmVzc2VzIG9yIHRyYXVtYXRpemVkIHBhdGllbnRzIGZyb20gYSBxdWlldCBzdXBwb3J0IHJvb20gbmVhciBCNi48L2xpPgo8bGk+Q2l2aWxpYW5zIGNvbXBsaWNhdGUgYW55IHNpbXBsZSBmaWdodCB3aXRoIFJlZGxpbmUgb3IgY29ycG9yYXRlIGZvcmNlcy48L2xpPgo8bGk+UENzIGRpc2NvdmVyIHNpZ25zIHRoYXQgQjggd2FzIHVzZWQgZm9yIGlsbGVnYWwgQW50aXRoZXNpcyByZXNlYXJjaC48L2xpPgo8bGk+VGhlIHJlY292ZXJlZCBub3RlYm9vayBwb2ludHMgZnJvbSB0aGUgb2xkIHdhcmQgZGlzYXN0ZXIgdG93YXJkIHRoZSBlc2NhcGVkIE1vZGVsIDFzIGFuZCB0aGUgbGF0ZXIgaGlkZGVuIG5lc3QuPC9saT4KPC91bD4KPGgyPk1hcmHigJlzIGhpZGRlbiBzdXBwb3J0PC9oMj4KPHA+VGhpcyBpcyBzdGlsbCBvbmUgb2YgdGhlIGJlc3QgZmxvb3JzIGZvciBkaXNjb3ZlcmluZyB0aGF0IE1hcmEg4oCcTW90aGVyIFJlZOKAnSBWZXkgaXMgbm90IG9ubHkgcnVubmluZyBhIGdhbmcuPC9wPgo8cD5Qb3NzaWJsZSBjbHVlczo8L3A+Cjx1bD4KPGxpPmZvb2QgY3JhdGVzIHRoYXQgY2FtZSB0aHJvdWdoIFJlZGxpbmUgQ2hvaXIgY2hhbm5lbHMsPC9saT4KPGxpPm1lZGljaW5lIGFuZCBtZWFsIHBhY2tzIHBhaWQgZm9yIHRocm91Z2ggYW5vbnltb3VzIHN0cmVldCBhY2NvdW50cyw8L2xpPgo8bGk+c2Nob29sIHN1cHBsaWVzIHJvdXRlZCB0aHJvdWdoIGN1dG91dHMsPC9saT4KPGxpPnZvbHVudGVlcnMgd2hvIGdvIHF1aWV0IHdoZW4gTWFyYSBpcyBtZW50aW9uZWQsPC9saT4KPGxpPmNoaWxkcmVuIHdobyBjYWxsIGhlciDigJxBdW50aWUgUmVkLOKAnTwvbGk+CjxsaT5hbmQgYSBsZWRnZXIgc2hvd2luZyBmb29kLCBtZWRpY2luZSwgZ2VuZXJhdG9yIGZ1ZWwsIGFuZCBzdXBwb3J0IHN0aXBlbmRzLjwvbGk+CjwvdWw+CjxwPlRoaXMgc2hvdWxkIG5vdCBiZSBwdWJsaWMga25vd2xlZGdlLjwvcD4KPHA+SWYgdGhlIFBDcyBkaXNjb3ZlciBpdCByZXNwZWN0ZnVsbHksIE1hcmEgYmVjb21lcyBlYXNpZXIgdG8gbmVnb3RpYXRlIHdpdGguIElmIHRoZXkgZXhwb3NlIGl0IHRvIG1vY2sgaGVyIG9yIHdlYWtlbiBoZXIgcmVwdXRhdGlvbiwgc2hlIHJlYWN0cyBiYWRseS48L3A+CjxoMj5CODogc2VhbGVkIGlzb2xhdGlvbiB3YXJkIC8gb2xkIGV4cGVyaW1lbnQgc2l0ZTwvaDI+CjxwPkI4IHNob3VsZCBmZWVsIGRpZmZlcmVudCBmcm9tIHRoZSByZXN0IG9mIHRoZSBmbG9vci48L3A+CjxwPlRoZSBwdWJsaWMgc3VwcG9ydCBzcGFjZXMgYXJlIHBhdGNoZWQgdG9nZXRoZXIsIHVuZGVyZnVuZGVkLCBhbmQgaHVtYW4uIEI4IGlzIGNvbGRlciwgaGFyZGVyLCBhbmQgcGFydGlhbGx5IGVyYXNlZC48L3A+CjxwPlZpc2libGUgc2lnbnM6PC9wPgo8dWw+CjxsaT5zY29yY2ggbWFya3MgdW5kZXIgZnJlc2ggd2FsbCBjb2F0aW5nLDwvbGk+CjxsaT5taXNtYXRjaGVkIHJlcGxhY2VtZW50IHBhbmVscyw8L2xpPgo8bGk+bWVsdGVkIG1lZGljYWwgZXF1aXBtZW50LDwvbGk+CjxsaT5kb29ycyBnb3VnZWQgZnJvbSB0aGUgaW5zaWRlLDwvbGk+CjxsaT5zdGVyaWxpemF0aW9uIHJlc2lkdWUsPC9saT4KPGxpPnBhdGNoZWQgZHJhaW5hZ2UgZ3JhdGVzLDwvbGk+CjxsaT5kZWFkIGNhbWVyYSBhbmdsZXMsPC9saT4KPGxpPmFuZCBzZXJ2aWNlIGdhcHMgdGhhdCB3ZXJlIHNlYWxlZCBhZnRlciBzb21ldGhpbmcgaGFkIGFscmVhZHkgZXNjYXBlZC48L2xpPgo8L3VsPgo8cD5UaGlzIHdhcyB0aGUgb3JpZ2luYWwgbG9jYWwgY29udGFpbm1lbnQgZGlzYXN0ZXIuIENvcnBvcmF0ZSBmb3JjZXMgYmVsaWV2ZSB0aGV5IGRlc3Ryb3llZCB0aGUgcHJpbWFyeSBuZXN0IGhlcmUuIFRoZXkgYXJlIG1vc3RseSByaWdodCBhYm91dCBCOCBhbmQgZGFuZ2Vyb3VzbHkgd3JvbmcgYWJvdXQgdGhlIHdpZGVyIHRocmVhdC48L3A+CjxwPlRoZSBrZXkgY2x1ZSBpcyBub3Qg4oCcdGhlIG5lc3QgaXMgc3RpbGwgaGVyZS7igJ08L3A+CjxwPlRoZSBrZXkgY2x1ZSBpczo8L3A+CjxibG9ja3F1b3RlPlNvbWV0aGluZyBlc2NhcGVkIGZyb20gaGVyZS48L2Jsb2NrcXVvdGU+CjxoMj5EaXNjb3ZlcmFibGUgZXZpZGVuY2UgaW4gQjg8L2gyPgo8cD5Vc2UgdGhlc2UgY2hlY2tzIGFzIHByb21wdHMsIG5vdCBhIGZpeGVkIG1lbnUuPC9wPgo8dWw+CjxsaT48c3Ryb25nPkF3YXJlbmVzcyAvIEludmVzdGlnYXRpb246PC9zdHJvbmc+IE5vdGljZSBzY29yY2ggbWFya3MgdW5kZXIgZnJlc2ggc2VhbGFudCwgbWlzbWF0Y2hlZCByZXBsYWNlbWVudCBwYW5lbHMsIG9yIGNsZWFudXAgcGF0dGVybnMgdGhhdCBoaWRlIGEgbGFyZ2VyIHZpb2xlbnQgZXZlbnQuPC9saT4KPGxpPjxzdHJvbmc+TWVkaWNpbmUgLyBTdXJnZXJ5Ojwvc3Ryb25nPiBJZGVudGlmeSB0aXNzdWUgZGFtYWdlLCB0cmlhZ2UgZmFpbHVyZSwgYW5kIGJpb2xvZ2ljYWwgY29udGFtaW5hdGlvbiBpbmNvbnNpc3RlbnQgd2l0aCBvcmRpbmFyeSBxdWFyYW50aW5lIHdvcmsuPC9saT4KPGxpPjxzdHJvbmc+WGVub2Jpb2xvZ3kgLyBBbnRpdGhlc2lzIGtub3dsZWRnZTo8L3N0cm9uZz4gUmVjb2duaXplIHRoYXQgdGhlIG5vdGVzIGRlc2NyaWJlIGxpdmUgQW50aXRoZXNpcyBncm93dGgsIG5vdCBpbmVydCBzYW1wbGUgc3RvcmFnZS48L2xpPgo8bGk+PHN0cm9uZz5CaWcgR3VucyAvIENvcnBvcmF0ZSBTZWN1cml0eSAvIEV4LU1pbGl0YXJ5Ojwvc3Ryb25nPiBJZGVudGlmeSBwb3dlcmVkLWFybW9yIGVudHJ5IGRhbWFnZSwgaW5jZW5kaWFyeSBjbGVhbnVwIHBhdHRlcm5zLCBhbmQgcHJvZmVzc2lvbmFsIGV2aWRlbmNlIGRlc3RydWN0aW9uLjwvbGk+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyIC8gU2VjdXJpdHk6PC9zdHJvbmc+IFJlY292ZXIgbWlzc2luZyBjYW1lcmEgdGltZXN0YW1wcywgZGVsZXRlZCBsb2NhbCBsb2dzLCBvciBldmlkZW5jZSB0aGF0IHRoZSB3YXJkIGNhbWVyYXMgd2VyZSBpc29sYXRlZCBmcm9tIG5vcm1hbCBjbGluaWMgc3lzdGVtcy48L2xpPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5IC8gU2NhdmVuZ2VyOjwvc3Ryb25nPiBGaW5kIHRoZSBsb29zZSBwYW5lbCBoaWRpbmcgdGhlIHJlY292ZXJlZCBub3RlYm9vay48L2xpPgo8L3VsPgo8cD5GYWlsdXJlIHNob3VsZCBub3QgYmxvY2sgdGhlIGNsdWUuIE9uIGEgZmFpbHVyZSwgZ2l2ZSB0aGUgY2x1ZSB3aXRoIGEgY29zdDogZXh0cmEgdGltZSwgbm9pc2UsIGEgaG9zdGlsZSBjYW1lcmEgcGluZywgYSBmcmlnaHRlbmVkIHdpdG5lc3MsIG9yIGEgTW9kZWwgMyBtb3ZlbWVudCB0aWNrIGVsc2V3aGVyZS48L3A+CjxoMj5NYWluIGFjdGl2ZSBOUENzPC9oMj4KPHVsPgo8bGk+PHN0cm9uZz5LZWV0PC9zdHJvbmc+IOKAlCBCNiBzdXBwb3J0IGNvcnJpZG9yIC8gd29ya3Nob3AgYXJlYSBvciBCNyByZWNvdmVyeSAvIGZhbWlseSBzdXBwb3J0IGFyZWEuPC9saT4KPGxpPjxzdHJvbmc+TWlyaSBhbmQgU29sPC9zdHJvbmc+IOKAlCBCNyBmYW1pbHkgc3VwcG9ydCBhcmVhIGlmIHVzZWQgYXMgY2hpbGQgd2l0bmVzc2VzLjwvbGk+CjxsaT48c3Ryb25nPlNpc3RlciBMdW1hPC9zdHJvbmc+IOKAlCBxdWlldCBjb25zdWx0YXRpb24gcm9vbSBsZWZ0IG9mIEI2LCBvciBCNyBzaG9ydC1zdGF5IHJlY292ZXJ5IC8gY291bnNlbGxpbmcgYXJlYS48L2xpPgo8bGk+PHN0cm9uZz5Gb29kIExpbmUgVm9sdW50ZWVyIC8gQWlkIENvb3JkaW5hdG9yPC9zdHJvbmc+IOKAlCBCNCBzdGFmZiBpbnRha2UsIHBhbnRyeSwgb3IgQjYgc3VwcG9ydCBjb3JyaWRvci48L2xpPgo8bGk+PHN0cm9uZz5SZWRsaW5lIFN1cHBseSBSdW5uZXI8L3N0cm9uZz4g4oCUIEI2IHN1cHBvcnQgY29ycmlkb3IsIEIxMCBzdGFpcndlbGwgLyB2ZXJ0aWNhbCBhY2Nlc3MsIG9yIEIxMSBsb3dlciBzZXJ2aWNlIGFjY2Vzcy48L2xpPgo8bGk+PHN0cm9uZz5DbGluaWMgU3RhZmYgLyBBdXRvbWF0ZWQgTnVyc2UgLyBHZW5lcmljIFBhdGllbnQgdG9rZW5zPC9zdHJvbmc+IOKAlCBCMiBwcm9jZWR1cmUgcm9vbSwgQjcgcmVjb3Zlcnkgcm9vbXMsIG9yIEIxMiBzdGFmZiByZXN0IC8gb3Zlcm5pZ2h0IHN1cHBvcnQgcm9vbS48L2xpPgo8L3VsPgo8aDI+RGVsYXllZCBvciBHTS1sYXllciBOUENzPC9oMj4KPHVsPgo8bGk+PHN0cm9uZz5NYXJhIOKAnE1vdGhlciBSZWTigJ0gVmV5PC9zdHJvbmc+IOKAlCBCNCBzdGFmZiBpbnRha2Ugb3IgQjYgc3VwcG9ydCBjb3JyaWRvciBpZiB0aGUgUENzIGRpc2NvdmVyIGhlciBoaWRkZW4gc3VwcG9ydC48L2xpPgo8bGk+PHN0cm9uZz5SZWRsaW5lIENhbWVyYSBTaXR0ZXI8L3N0cm9uZz4g4oCUIEIzIHJlY29yZHMgLyBtb25pdG9yaW5nIGVxdWlwbWVudCBvciByZW1vdGUgZmVlZCBhY2Nlc3MuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIG9ic2VydmVyPC9zdHJvbmc+IOKAlCBCMSB1cHBlciB3YWxrd2F5IG9yIG5lYXIgbGlmdCBhY2Nlc3MgaWYgY29ycCBwcmVzc3VyZSBmb2xsb3dzIHRoZSBQQ3MuPC9saT4KPGxpPjxzdHJvbmc+TmFyaW4gUGVsbCBjbHVlIG1hcmtlcjwvc3Ryb25nPiDigJQgQjggc2VhbGVkIGlzb2xhdGlvbiB3YXJkLCBCMTIgc3RhZmYgcmVzdCAvIG92ZXJuaWdodCBzdXBwb3J0IHJvb20sIG9yIHRoZSByb3V0ZSBiZXR3ZWVuIHRoZW0uPC9saT4KPGxpPjxzdHJvbmc+TGFsYSBNaXIgY2x1ZSBtYXJrZXI8L3N0cm9uZz4g4oCUIEI2IHN1cHBvcnQgY29ycmlkb3IsIEIxMCBzdGFpcndlbGwgLyB2ZXJ0aWNhbCBhY2Nlc3MsIG9yIEIxMSBsb3dlciBzZXJ2aWNlIGFjY2Vzcy48L2xpPgo8bGk+PHN0cm9uZz5SZWNvdmVyZWQgTm90ZWJvb2sgbWFya2VyPC9zdHJvbmc+IOKAlCBoaWRkZW4gYmVoaW5kIGEgbG9vc2UgbWFpbnRlbmFuY2UgcGFuZWwgaW4gQjguPC9saT4KPC91bD4KPGgyPk1haW4gc2NlbmUgYmVhdHM8L2gyPgo8b2w+CjxsaT5QQ3Mgc2VlIHRoYXQgdGhlIHN1cHBvcnQgd2FyZCBrZWVwcyB2dWxuZXJhYmxlIGxvY2FscyBhbGl2ZS48L2xpPgo8bGk+Q2hpbGRyZW4sIHZvbHVudGVlcnMsIG9yIGxlZGdlcnMgcmV2ZWFsIHRoYXQgTWFyYeKAmXMgbmV0d29yayBmdW5kcyByZWFsIGFpZC48L2xpPgo8bGk+TGFsYeKAmXMgZGlzYXBwZWFyYW5jZSBjb25uZWN0cyBmb29kIGFpZCB0byBzZXJ2aWNlIHJvdXRlcy48L2xpPgo8bGk+TmFyaW7igJlzIGRpc2FwcGVhcmFuY2Ugc2hvd3MgaG93IHZ1bG5lcmFibGUgcGVvcGxlIHZhbmlzaCB3aXRob3V0IG9mZmljaWFsIHJlc3BvbnNlLjwvbGk+CjxsaT5COCByZXZlYWxzIHRoYXQgdGhlIGNvcnBvcmF0aW9u4oCZcyDigJxvbGQgY29udGFpbmVkIGluY2lkZW504oCdIHdhcyBhbiBpbGxlZ2FsIGV4cGVyaW1lbnQgYW5kIGNsZWFudXAuPC9saT4KPGxpPlRoZSBub3RlYm9vayBjb25maXJtcyB0aGF0IE1vZGVsIDFzIGVzY2FwZWQgdGhlIGZpcnN0IG5lc3QuPC9saT4KPGxpPlRoZSBQQ3MgcmVhbGl6ZSB0aGUgbWlzc2luZy1wZXJzb24gcGF0dGVybiBtYXkgYmUgdGhlIHJlc3VsdCBvZiBhIHNlY29uZCBoaWRkZW4gbmVzdCwgbm90IGxlZnRvdmVyIHBhbmljIGZyb20gdGhlIGZpcnN0IGRpc2FzdGVyLjwvbGk+Cjwvb2w+CjxoMj5DYW1lcmEgb3duZXJzaGlwPC9oMj4KPHVsPgo8bGk+UHVibGljIHN1cHBvcnQgYXJlYXM6IGNvbW11bml0eSwgbXVuaWNpcGFsLCBvciBhZC1uZXR3b3JrIGNhbWVyYXMuPC9saT4KPGxpPlBhbnRyeSBhbmQgc2VydmljZSByb3V0ZXM6IFJlZGxpbmUtaW5mbHVlbmNlZCBvciBsb2NhbGx5IHBhdGNoZWQgZmVlZHMuPC9saT4KPGxpPlJlY292ZXJ5LCBjb3Vuc2VsbGluZywgYW5kIHNoZWx0ZXIgYXJlYXM6IHJlc3RyaWN0ZWQgZm9yIHByaXZhY3k7IHVzZSBkb29yIGxvZ3MgaW5zdGVhZCBvZiBvcmRpbmFyeSBjYW1lcmEgY292ZXJhZ2UuPC9saT4KPGxpPkI4IGlzb2xhdGlvbiB3YXJkOiBsb2NhbCBpc29sYXRlZCBjYW1lcmEgc3lzdGVtLCBoZWF2aWx5IGRlbGV0ZWQgb3IgcGh5c2ljYWxseSBkZXN0cm95ZWQuPC9saT4KPGxpPkxpZnQgYW5kIHN0YWlyIGFjY2VzczogcGFydGlhbCBsb2dzLCB1bnJlbGlhYmxlIGR1cmluZyBsb2NrZG93bi48L2xpPgo8L3VsPgo8aDI+V2hhdCB0aGlzIGZsb29yIHNob3VsZCBlc3RhYmxpc2g8L2gyPgo8dWw+CjxsaT5NYXJh4oCZcyBwb3dlciBoYXMgYSBwcm90ZWN0aXZlIHNpZGUuPC9saT4KPGxpPk1lcmN5IFR3ZWx2ZSBpcyBtb3JlIHRoYW4gYSBjbGluaWMuPC9saT4KPGxpPlRoZSBtaXNzaW5nIHBlb3BsZSBhcmUgbG9jYWxzIHRoZSBzeXN0ZW0gY2FuIGlnbm9yZS48L2xpPgo8bGk+VGhlIGNvcnBvcmF0aW9u4oCZcyBvcmlnaW5hbCBleHBlcmltZW50IGhhcHBlbmVkIHVuZGVyIGRlbmlhYmxlIG1lZGljYWwgY292ZXIuPC9saT4KPGxpPlRoZSBmaXJzdCBuZXN0IHdhcyBidXJuZWQgb3V0LCBidXQgbm90IGJlZm9yZSBNb2RlbCAxcyBlc2NhcGVkLjwvbGk+CjxsaT5UaGUgcHJlc2VudCBkYW5nZXIgaXMgbm90IGluIEI4IGFueW1vcmU7IEI4IHBvaW50cyB0b3dhcmQgdGhlIGhpZGRlbiBzZWNvbmQgbmVzdC48L2xpPgo8L3VsPg=="
  },
  {
    "name": "Signal Bleed - Map Floor C Service Utility",
    "source_file": "handouts/12_Map_Floor_C_Service_Utility.md",
    "notes_b64": "PGgxPk1hcDogRmxvb3IgQyDigJQgU2VydmljZSwgVXRpbGl0eSwgYW5kIE1haW50ZW5hbmNlIEZsb29yPC9oMT4KPGgyPkZ1bmN0aW9uPC9oMj4KPHA+VGhpcyBmbG9vciBpcyB0aGUgbWVnYWNvbXBsZXjigJlzIHByYWN0aWNhbCB1bmRlcnNpZGUuPC9wPgo8cD5JdCBjb250YWlucyB0aGUgc3lzdGVtcyB0aGF0IGtlZXAgTWVyY3kgVHdlbHZlIGFuZCB0aGUgc3Vycm91bmRpbmcgZGlzdHJpY3QgYWxpdmU6IHBvd2VyLCBhaXIsIHdhdGVyLCBjYXJnbywgcmVwYWlyLCBzdG9yYWdlLCBhbmQgbWFpbnRlbmFuY2UgYWNjZXNzLjwvcD4KPHA+SXQgaXMgbW9yZSBpbmR1c3RyaWFsIHRoYW4gdGhlIGNsaW5pYyBhbmQgc2hlbHRlciBtYXBzLCBidXQgc3RpbGwgcGFydCBvZiB0aGUgSG9wZS8vUHVuayBlbnZpcm9ubWVudC4gVGhlIHBlb3BsZSBoZXJlIGtlZXAgdGhlIGxpZ2h0cyBvbi48L3A+CjxoMj5XaGF0IHRoZSBtYXAgc2hvd3M8L2gyPgo8cD5LZXkgYXJlYXM6PC9wPgo8dWw+CjxsaT5sb2dpc3RpY3Mvc2VydmljZSBzdHJlZXQ8L2xpPgo8bGk+Y2VudHJhbCBsb2FkaW5nIG9yIGRpc3RyaWJ1dGlvbiB6b25lPC9saT4KPGxpPmdlbmVyYXRvciBvciBwb3dlciByb29tPC9saT4KPGxpPmJhdHRlcnkgYmFua3M8L2xpPgo8bGk+SFZBQyAvIGFpciBoYW5kbGluZzwvbGk+CjxsaT53YXRlciB0cmVhdG1lbnQgb3IgcmVjeWNsaW5nPC9saT4KPGxpPnN0b3JhZ2Ugcm9vbXM8L2xpPgo8bGk+cmVwYWlyIHdvcmtzaG9wPC9saT4KPGxpPm1vbml0b3Jpbmcvc2VjdXJpdHkgb2ZmaWNlPC9saT4KPGxpPmVsZXZhdG9yIGNvcmU8L2xpPgo8bGk+ZW1lcmdlbmN5IHN0YWlyIC8gbGFkZGVyd2VsbDwvbGk+CjxsaT5zdXNwaWNpb3VzIHNpZGUgcm9vbSBvciBoaWRkZW4gc2VydmljZSBzcGFjZTwvbGk+CjwvdWw+CjxoMj5TY2VuYXJpbyB1c2U8L2gyPgo8cD5Hb29kIHNjZW5lcyBoZXJlOjwvcD4KPHVsPgo8bGk+cG93ZXIgZmFpbHVyZSBjYXVzZWQgYnkgc2lnbmFsIHB1bHNlczwvbGk+CjxsaT5HcmVhc2UgTW9ua2V5IG9yIFNjYXZlbmdlciBnZXRzIHVzZWZ1bCBzcG90bGlnaHQ8L2xpPgo8bGk+Y29ycCB0ZWFtIHRyaWVzIHRvIGN1dCB0aGUgY2xpbmlj4oCZcyBzeXN0ZW1zPC9saT4KPGxpPmdhbmcgdXNlcyBtYWludGVuYW5jZSByb3V0ZXMgdG8gYnlwYXNzIHB1YmxpYyBhcmVhczwvbGk+CjxsaT5wbGF5ZXJzIGRpc2NvdmVyIGEgaGlkZGVuIHJvdXRlIGJldHdlZW4gbWFwczwvbGk+CjxsaT5hbGllbiBjb250YW1pbmF0aW9uIHN0YXJ0cyBpbiB0aGUgaW5mcmFzdHJ1Y3R1cmU8L2xpPgo8bGk+Qmx1ZXdpcmXigJlzIGltcGxhbnRzIHJlYWN0IG5lYXIgcG93ZXIgb3Igc2lnbmFsIGNvbmR1aXRzPC9saT4KPC91bD4KPGgyPlRhY3RpY2FsIHJvbGU8L2gyPgo8cD5UaGlzIGZsb29yIGlzIGdvb2QgZm9yOjwvcD4KPHVsPgo8bGk+c3RlYWx0aCByb3V0ZXM8L2xpPgo8bGk+Y2hhc2VzPC9saT4KPGxpPnNhYm90YWdlPC9saT4KPGxpPnJlcGFpcnM8L2xpPgo8bGk+YW1idXNoZXM8L2xpPgo8bGk+YWx0ZXJuYXRlIGFjY2VzczwvbGk+CjxsaT5yZXN0b3JpbmcgcG93ZXI8L2xpPgo8bGk+aXNvbGF0aW5nIHRoZSByZWxheTwvbGk+CjxsaT5tb3ZpbmcgdW5zZWVuIGJldHdlZW4gcHVibGljIGFyZWFzPC9saT4KPC91bD4KPGgyPlNvY2lhbCByb2xlPC9oMj4KPHA+RG8gbm90IG1ha2UgdGhpcyBmbG9vciBlbXB0eS4gTWFpbnRlbmFuY2Ugd29ya2VycywgZGVsaXZlcnkgY3Jld3MsIHVub2ZmaWNpYWwgdmVuZG9ycywgUmVkbGluZSBDaG9pciBsb29rb3V0cywgYW5kIHRpcmVkIGNsaW5pYyBzdGFmZiBtYXkgYWxsIHVzZSBpdC48L3A+CjxwPkl0IGlzIGEgZ29vZCBwbGFjZSBmb3Igbm9uLWZhY3Rpb24gcGFzc2Vyc2J5IHdobyBhcmUganVzdCB0cnlpbmcgdG8gd29yay48L3A+CjxoMj5FbGV2YXRvciBhbmQgc3RhaXIgbm90ZXM8L2gyPgo8cD5UaGUgZWxldmF0b3IgaXMgbGlrZWx5IGEgY2FyZ28tY2FwYWJsZSBsaWZ0IGhlcmUuPC9wPgo8cD5UaGUgc3RhaXIvbGFkZGVyd2VsbCBpcyBwcm9iYWJseSBhIHN0ZWVwIG1haW50ZW5hbmNlIGFjY2VzcyByb3V0ZS4gSXQgY2FuIGJ5cGFzcyBzaHV0ZG93bnMsIGJ1dCBtb3Zpbmcgd291bmRlZCBwZW9wbGUgdGhyb3VnaCBpdCBzaG91bGQgcmVxdWlyZSB0aW1lLCBlcXVpcG1lbnQsIG9yIGNoZWNrcy48L3A+CjxoMj5XaGF0IGhhcHBlbnMgb24gdGhpcyBtYXA8L2gyPgo8cD5UaGlzIGlzIHRoZSBwcmltYXJ5IGhpZGRlbi1uZXN0IGludmVzdGlnYXRpb24gZmxvb3IuIFVzZSBpdCBmb3IgbWlzc2luZy1wZXJzb24gdHJhaWxzLCBNb2RlbCAzIGNsdWVzLCB1dGlsaXR5IHJvdXRlcywgc3VydmVpbGxhbmNlIHJvb21zLCBhbmQgdGhlIHNlY29uZCBuZXN0IHJldmVhbC48L3A+CjxoMz5NYWluIGFjdGl2ZSBOUENzIGFuZCB0b2tlbnM8L2gzPgo8dWw+CjxsaT5Pc2thciBWZW5uIGNsdWUgbWFya2VyIOKAlCBDNiBIVkFDLjwvbGk+CjxsaT5CZXggQXJhbmRhIGNsdWUgbWFya2VyIOKAlCBDMS9DOS48L2xpPgo8bGk+SnV2ZW5pbGUgTW9kZWwgMyDigJQgQzYsIEM1LCBDMTEsIG9yIEMxMi48L2xpPgo8bGk+U2Vjb25kIEhpZGRlbiBOZXN0IOKAlCBDMTIgSGlkZGVuIE1haW50ZW5hbmNlIENhdml0eSBieSBkZWZhdWx0LjwvbGk+CjxsaT5Nb2RlbCAxIFNlZWQgQ2x1bXAg4oCUIGluc2lkZSBvciBuZWFyIHRoZSBoaWRkZW4gbmVzdC48L2xpPgo8bGk+U3dpdGNoIOKAlCBDOSBNb25pdG9yaW5nIG9yIHJlbW90ZSBmcm9tIEIxMC48L2xpPgo8bGk+TWFpbnRlbmFuY2Ugd29ya2VyKHMpIOKAlCBDMi9DNy9DOS48L2xpPgo8bGk+Q29ycG9yYXRlIERyb25lIC8gQ29ycCBSZWNvdmVyeSBQYWlyIOKAlCBDMS9DMTAgaWYgY29ycCBwdXNoZXMgc2VydmljZSBhY2Nlc3MuPC9saT4KPC91bD4KPGgzPk1haW4gc2NlbmUgYmVhdHM8L2gzPgo8b2w+CjxsaT5QQ3MgZm9sbG93IG1pc3NpbmctcGVyc29uIGV2aWRlbmNlIGludG8gdGhlIHNlcnZpY2UgZmxvb3IuPC9saT4KPGxpPk1haW50ZW5hbmNlIGNsdWVzIHNob3cgc29tZXRoaW5nIHBoeXNpY2FsIGlzIG1vdmluZyB0aHJvdWdoIHZlbnRzLjwvbGk+CjxsaT5DYW1lcmFzIHJldmVhbCBsb3cgZmFzdCBtb3ZlbWVudCwgYnV0IGRvIG5vdCBzb2x2ZSBldmVyeXRoaW5nLjwvbGk+CjxsaT5GaXJzdCBNb2RlbCAzIGNvbnRhY3Qgc2hvdWxkIGludm9sdmUgZHJhZ2dpbmcgYSB2aWN0aW0sIG5vdCBhIGZhaXIgZmlnaHQuPC9saT4KPGxpPlRoZSBoaWRkZW4gbmVzdCBpcyBmb3VuZCBuZWFyIGR1Y3RzLCBtb2lzdHVyZSwgYW5kIHNlcnZpY2UgY2F2aXRpZXMuPC9saT4KPC9vbD4KPGgzPk1hcC1zcGVjaWZpYyBjbHVlczwvaDM+Cjx1bD4KPGxpPkMxOiBtaXNzaW5nLXBlcnNvbiByb3V0ZXMgY2x1c3RlciBhcm91bmQgc2VydmljZSBhY2Nlc3MuPC9saT4KPGxpPkM1OiBvcmdhbmljIGZpbG0gYW5kIGZ1c2VkIHNtYWxsIGFuaW1hbHMuPC9saT4KPGxpPkM2OiBPc2thcuKAmXMgdG9vbCBjYXJ0LCB3YXJtIHZlbnQsIGRyYWcgbWFya3MsIGJyZWF0aGluZyByYWRpbyBsb2cuPC9saT4KPGxpPkM3OiBpbXByb3Zpc2VkIHZlbnQgbG9ja3MgYW5kIHJlcGFpciB0b29scy48L2xpPgo8bGk+Qzk6IGNhbWVyYSBmcmFtZSBvZiBCZXgvT3NrYXIgYmVpbmcgZHJhZ2dlZC48L2xpPgo8bGk+QzExOiBvcmdhbmljIHNtZWFyIGFsb25nIHN0YWlycy48L2xpPgo8bGk+QzEyOiBoaWRkZW4gbWFpbnRlbmFuY2UgY2F2aXR5LCBNb2RlbCAxIHNlZWQgY2x1bXAsIHNlY29uZCBuZXN0LjwvbGk+CjwvdWw+CjxoMz5DYW1lcmEgb3duZXJzaGlwPC9oMz4KPHVsPgo8bGk+R2VuZXJhbCB1dGlsaXR5IGZlZWRzOiBtYWludGVuYW5jZS9tdW5pY2lwYWwuPC9saT4KPGxpPlNvbWUgb2xkIHNlcnZpY2UgY2FtZXJhczogUmVkbGluZS1hY2Nlc3NpYmxlLjwvbGk+CjxsaT5GcmVpZ2h0IGFuZCBzZXJ2aWNlIHJvdXRlczogcG9zc2libHkgY29ycG9yYXRlLWNvbXByb21pc2VkLjwvbGk+CjxsaT5Nb25pdG9yaW5nIE9mZmljZTogY29udGVzdGVkLjwvbGk+CjxsaT5Gb290YWdlIHByb2JsZW1zIGFyZSBodW1hbiB0YW1wZXJpbmcgb3IgcG9vciBjb3ZlcmFnZSwgbm90IGFsaWVuIGhhY2tpbmcuPC9saT4KPC91bD4KPGgzPldoYXQgdGhpcyBmbG9vciBzaG91bGQgZXN0YWJsaXNoPC9oMz4KPHVsPgo8bGk+VGhlIHNlY29uZCBuZXN0IGlzIHJlYWwuPC9saT4KPGxpPlRoZSBjb3JwIGRvZXMgbm90IGtub3cgdGhlIGZ1bGwgY3VycmVudCB0aHJlYXQuPC9saT4KPGxpPkp1dmVuaWxlIE1vZGVsIDNzIGFyZSBnYXRoZXJpbmcgYmlvbWFzcy48L2xpPgo8bGk+TWlzc2luZyBwZW9wbGUgYXJlIHRoZSBncm93dGggbWVjaGFuaXNtLjwvbGk+CjxsaT5UaGUgaHVtYW4gZmFjdGlvbnMgbXVzdCBzdG9wIGZpZ2h0aW5nIG9yIGNpdmlsaWFucyB3aWxsIGJlIGhhcnZlc3RlZC48L2xpPgo8L3VsPg=="
  },
  {
    "name": "Signal Bleed - Map Floor D Quarantine Incident",
    "source_file": "handouts/13_Map_Floor_D_Quarantine_Incident.md",
    "notes_b64": "PGgxPk1hcDogRmxvb3IgRCDigJQgUXVhcmFudGluZSwgSW5jaWRlbnQgRmxvb3IsIGFuZCBMYW5kaW5nIENvcm5lcjwvaDE+CjxoMj5GdW5jdGlvbjwvaDI+CjxwPlRoaXMgaXMgdGhlIGxpa2VseSBhbGllbiBicmVhY2ggLyBmaW5hbGUgbWFwLjwvcD4KPHA+SXQgY29tYmluZXMgYSBtZWRpY2FsLXJlc2VhcmNoIG9yIHF1YXJhbnRpbmUgYW5uZXggd2l0aCBpbmRvb3IgbWVnYWNvbXBsZXggYWNjZXNzIGFuZCBhIHNtYWxsIGxhbmRpbmcgY29ybmVyIHdoZXJlIGZseWluZyB2ZWhpY2xlcyBjYW4gYXJyaXZlLjwvcD4KPGgyPldoYXQgdGhlIG1hcCBzaG93czwvaDI+CjxwPktleSBhcmVhczo8L3A+Cjx1bD4KPGxpPnF1YXJhbnRpbmUgLyBjb250YWlubWVudCBzZWN0aW9uPC9saT4KPGxpPmRpYWdub3N0aWNzIG9yIGxhYiBzZWN0aW9uPC9saT4KPGxpPmNvbnRyb2wgcm9vbTwvbGk+CjxsaT5wYXRpZW50IG9yIGhvbGRpbmcgcm9vbXM8L2xpPgo8bGk+d2lkZSBjZW50cmFsIGhhbGw8L2xpPgo8bGk+c2lkZSBjb3JyaWRvcnMgYW5kIGJ5cGFzcyByb3V0ZXM8L2xpPgo8bGk+YmFjay9zZXJ2aWNlIGVudHJ5PC9saT4KPGxpPmVsZXZhdG9yIGNvcmU8L2xpPgo8bGk+ZW1lcmdlbmN5IHN0YWlyIC8gbGFkZGVyd2VsbDwvbGk+CjxsaT5zbWFsbCByb29mIG9yIG9wZW4tYWlyLWZlZWxpbmcgbGFuZGluZyBjb3JuZXI8L2xpPgo8bGk+bWFya2VkIGxhbmRpbmcgc3BvdCBmb3IgYSBmbHlpbmcgdmVoaWNsZSBvciBlbWVyZ2VuY3kgY3JhZnQ8L2xpPgo8L3VsPgo8aDI+V2h5IHRoZXJlIGlzIGEgbGFuZGluZyBjb3JuZXI8L2gyPgo8cD5Nb3N0IG9mIHRoZSBtZWdhY29tcGxleCBpcyBpbmRvb3JzLCBidXQgbGFyZ2UgY29tcGxleGVzIHN0aWxsIG5lZWQgZW1lcmdlbmN5IGFjY2Vzcy48L3A+CjxwPlRoZSBsYW5kaW5nIGNvcm5lciBpcyBhIHNtYWxsIGV4cG9zZWQgb3Igc2VtaS1leHBvc2VkIHJvb2Z0b3Avc2t5d2VsbCBwYWQ6IGVub3VnaCBmb3IgYSBmbHlpbmcgdmVoaWNsZSBvciByYXBpZC1yZXNwb25zZSBjcmFmdCB0byB0b3VjaCBkb3duLCBub3QgYSB3aG9sZSBvdXRkb29yIG1hcC48L3A+CjxwPlVzZSBpdCBmb3I6PC9wPgo8dWw+CjxsaT5OaWdodENyYXNo4oCZcyBhcnJpdmFsPC9saT4KPGxpPm1lZGV2YWMgZXh0cmFjdGlvbjwvbGk+CjxsaT5jb3Jwb3JhdGUgZHJvbmUgYWNjZXNzPC9saT4KPGxpPmVtZXJnZW5jeSBzdXBwbHkgZHJvcDwvbGk+CjxsaT5maW5hbCBlc2NhcGUgdW5kZXIgcHJlc3N1cmU8L2xpPgo8L3VsPgo8aDI+TmlnaHRDcmFzaCB1c2U8L2gyPgo8cD5JZiB0aGUgUENzIGFyZSBvdmVyd2hlbG1lZCwgTmlnaHRDcmFzaCBjYW4gYXJyaXZlIGhlcmUuPC9wPgo8cD5TaGUgc2hvdWxkIG5vdCBzb2x2ZSB0aGUgc2NlbmFyaW8uIFNoZSBjcmVhdGVzIG9uZSBvcGVuaW5nOjwvcD4KPHVsPgo8bGk+ZXZhY3VhdGVzIGVuZGFuZ2VyZWQgY2l2aWxpYW5zPC9saT4KPGxpPnN0YWJpbGl6ZXMgYSBkeWluZyBQQyBvciBOUEM8L2xpPgo8bGk+YmxvY2tzIG9uZSBhbGllbiBwdXNoPC9saT4KPGxpPmlkZW50aWZpZXMgdGhlIGJyZWFjaCBwb2ludDwvbGk+CjxsaT5naXZlcyB0aGUgUENzIG9uZSBjbGVhciB0YWN0aWNhbCBpbnN0cnVjdGlvbjwvbGk+CjwvdWw+CjxwPlRoZW4gc2hlIGdldHMgYSBsYXJnZXIgZW1lcmdlbmN5IGNhbGwgYW5kIG11c3QgbGVhdmUuPC9wPgo8cD5JZiB0aGUgUENzIHNvbHZlIHRoZSBjcmlzaXMgdGhlbXNlbHZlcywgc2hlIG1heSBhcnJpdmUgYWZ0ZXIgdGhlIGRhbmdlciBoYXMgcGFzc2VkIGFuZCB3ZWxjb21lIHRoZW0gYXMgbmV3bHkgYXdha2VuZWQgU2FtdXJhaS48L3A+CjxoMj5BbGllbiBicmVhY2ggb3B0aW9uczwvaDI+CjxwPlBvc3NpYmxlIGJyZWFjaCBsb2NhdGlvbnM6PC9wPgo8dWw+CjxsaT5jb250YWlubWVudCBjaGFtYmVyPC9saT4KPGxpPmRpYWdub3N0aWNzIHJvb208L2xpPgo8bGk+Y2VudHJhbCBoYWxsPC9saT4KPGxpPnBhdGllbnQgaG9sZGluZyByb29tPC9saT4KPGxpPmVsZXZhdG9yIHNoYWZ0PC9saT4KPGxpPmxhbmRpbmcgY29ybmVyPC9saT4KPGxpPnNlcnZpY2UgY29ycmlkb3I8L2xpPgo8L3VsPgo8cD5UaGUgYmVzdCBicmVhY2ggcG9pbnQgZGVwZW5kcyBvbiB0aGUgcGxheWVyIGNob2ljZXMuPC9wPgo8cD5JZiB0aGV5IGlzb2xhdGVkIHRoZSByZWxheSB3ZWxsLCB0aGUgYnJlYWNoIHN0YXJ0cyBjb250YWluZWQuPC9wPgo8cD5JZiB0aGV5IGRlbGF5ZWQgdG9vIGxvbmcsIHRoZSBicmVhY2ggc3RhcnRzIGluIHRoZSBjZW50cmFsIGhhbGwuPC9wPgo8cD5JZiB0aGV5IHVzZWQgdGhlIGVsZXZhdG9yIGNhcmVsZXNzbHksIHRoZSBicmVhY2ggY2FuIHRyYXZlbCBiZXR3ZWVuIGZsb29ycy48L3A+CjxoMj5IdW1hbiBmYWN0aW9uIGJlaGF2aW9yPC9oMj4KPHA+TmlnaHRDcmFzaCBhdm9pZHMgZmlnaHRpbmcgaHVtYW5zIGV4Y2VwdCBub24tbGV0aGFsbHkuPC9wPgo8cD5IdW1hbiBmYWN0aW9ucyBzaG91bGQgc3RpbGwgYmUgbmVnb3RpYWJsZSBvciBhdCBsZWFzdCByZWRpcmVjdGFibGUgZXZlbiBkdXJpbmcgdGhlIGJyZWFjaC48L3A+CjxwPkV4YW1wbGVzOjwvcD4KPHVsPgo8bGk+Y29ycCBwZXJzb25uZWwgbWF5IGhlbHAgY29udGFpbiB0aGUgYnJlYWNoIGlmIGNvbnZpbmNlZCBpdCBpcyB3b3JzZSB0aGFuIHRoZSBkYXRhIGxlYWs8L2xpPgo8bGk+UmVkbGluZSBDaG9pciBtYXkgaGVscCBldmFjdWF0ZSBjaXZpbGlhbnMgaWYgcmVzcGVjdGVkIGVhcmxpZXI8L2xpPgo8bGk+Y2xpbmljIHN0YWZmIG1heSBndWlkZSBQQ3MgdGhyb3VnaCBsb2NrZWQgYXJlYXMgaWYgdHJ1c3RlZDwvbGk+CjxsaT5mcmlnaHRlbmVkIGNpdmlsaWFucyBtYXkgYmxvY2sgY29ycmlkb3JzIHVubGVzcyBjYWxtZWQ8L2xpPgo8L3VsPgo8aDI+RWxldmF0b3IgYW5kIHN0YWlyIG5vdGVzPC9oMj4KPHA+VGhlIGVsZXZhdG9yIGlzIHVzZWZ1bCBidXQgZGFuZ2Vyb3VzIGhlcmUuIEl0IG1heSBjYXJyeSBjb250YW1pbmF0aW9uIG9yIHBhbmljIGJldHdlZW4gZmxvb3JzLjwvcD4KPHA+VGhlIHN0YWlyL2xhZGRlcndlbGwgaXMgYSBmYWxsYmFjayByb3V0ZS4gSXQgbWF5IGxvb2sgbmFycm93IG9yIHN0ZWVwIGJlY2F1c2UgdGhpcyBpcyBhIG1lZ2Fjb21wbGV4IGVtZXJnZW5jeSBhY2Nlc3Mgc2hhZnQsIG5vdCBhIGNvbWZvcnRhYmxlIHB1YmxpYyBzdGFpcmNhc2UuPC9wPgo8aDI+V2hhdCBoYXBwZW5zIG9uIHRoaXMgbWFwPC9oMj4KPHA+VGhpcyBmbG9vciBob2xkcyB0aGUgb2xkIGNvcnBvcmF0ZSBjcmltZSBzY2VuZTogdGhlIGZpcnN0IG5lc3QsIGNsZWFudXAgcmVjb3JkcywgZXhwb3N1cmUtdHJpYWwgZGF0YSwgYW5kIHRoZSBjbHVlIHRoYXQgTW9kZWwgMXMgcmVsb2NhdGVkLiBJdCBpcyBub3QgdGhlIGRlZmF1bHQgY3VycmVudCBuZXN0IGxvY2F0aW9uLjwvcD4KPGgzPk1haW4gYWN0aXZlIE5QQ3MgYW5kIHRva2VuczwvaDM+Cjx1bD4KPGxpPkhhbGRlbiBSb29rIGV2aWRlbmNlIG1hcmtlciDigJQgRDYgbG9ncy48L2xpPgo8bGk+T2xkIE5lc3QgUmVtYWlucyDigJQgRDguPC9saT4KPGxpPk1vZGVsIDEgZXNjYXBlLXZlY3RvciBtYXJrZXIg4oCUIEQ5LjwvbGk+CjxsaT5Db21tYW5kZXIgUnVzayBvciBMdC4gU2VubiDigJQgZGVsYXllZCwgaWYgY29ycCBjb25mcm9udGF0aW9uIG1vdmVzIGhlcmUuPC9saT4KPGxpPkNvcnBvcmF0ZSBjbGVhbnVwIHJlY29yZHMg4oCUIEQ1L0Q2LjwvbGk+CjxsaT5OaWdodENyYXNoIC8gU2lyZW4gU2FpbnQg4oCUIEQxIGlmIGVtZXJnZW5jeSByZXNjdWUgb2NjdXJzLjwvbGk+CjwvdWw+CjxoMz5NYWluIHNjZW5lIGJlYXRzPC9oMz4KPG9sPgo8bGk+UENzIGxlYXJuIHRoZSBjb3Jwb3JhdGlvbiBjcmVhdGVkIHRoZSBmaXJzdCBuZXN0IHRocm91Z2ggaWxsZWdhbCBiaW8tcmVzZWFyY2guPC9saT4KPGxpPlJlY29yZHMgc2hvdyByZXNlYXJjaGVycyBhbmQgc3RhZmYgd2VyZSBjb25zdW1lZCBhcyBiaW9tYXNzLjwvbGk+CjxsaT5DbGVhbnVwIGZvb3RhZ2Ugc2hvd3MgTW9kZWwgMXMgZXNjYXBpbmcgaW4gZm9ybWF0aW9uLjwvbGk+CjxsaT5IYWxkZW4gUm9vayBmbGFnZ2VkIG5lc3Qtc2VlZGluZyByaXNrLjwvbGk+CjxsaT5Db3Jwb3JhdGUgcmVwb3J0cyBidXJpZWQgdGhpcyBhcyB0ZXJtaW5hbCBlcnJhdGljIGZsaWdodC48L2xpPgo8L29sPgo8aDM+TWFwLXNwZWNpZmljIGNsdWVzPC9oMz4KPHVsPgo8bGk+RDM6IHByb2Zlc3Npb25hbCBzdGVyaWxpemF0aW9uIGRhbWFnZS48L2xpPgo8bGk+RDU6IGV4cG9zdXJlLXRyZWF0bWVudCByZWNvcmRzIGFuZCBwYXRpZW50IHRyaWFsIGRhdGEuPC9saT4KPGxpPkQ2OiBjbGVhbnVwIGZvb3RhZ2UsIEhhbGRlbiB3YXJuaW5nLCBkZWxldGVkIHJpc2sgdGFncy48L2xpPgo8bGk+RDg6IGRlc3Ryb3llZCBmaXJzdCBuZXN0IGFuZCByZXNlYXJjaGVyIGJpb21hc3MgZXZpZGVuY2UuPC9saT4KPGxpPkQ5OiBNb2RlbCAxIGVzY2FwZSByb3V0ZSB0b3dhcmQgc2VydmljZSBsZXZlbHMuPC9saT4KPGxpPkQxMDogZWRpdGVkIGZyZWlnaHQvZWxldmF0b3IgdHJhbnNwb3J0IHJlY29yZHMuPC9saT4KPC91bD4KPGgzPkNhbWVyYSBvd25lcnNoaXA8L2gzPgo8dWw+CjxsaT5SZXN0cmljdGVkIGNsaW5pYy9jb3Jwb3JhdGUgaHlicmlkLjwvbGk+CjxsaT5Db3Jwb3JhdGUgZWRpdHMgYXJlIGNvbW1vbi48L2xpPgo8bGk+RW1lcmdlbmN5IHN5c3RlbXMgbWF5IGhhdmUgbG9ja2Rvd24gbG9naWMuPC9saT4KPGxpPkxhbmRpbmcgY29ybmVyIGhhcyBlbWVyZ2VuY3kvc3BvbnNvciBmZWVkcyBpZiBOaWdodENyYXNoIGFycml2ZXMuPC9saT4KPC91bD4KPGgzPldoYXQgdGhpcyBmbG9vciBzaG91bGQgZXN0YWJsaXNoPC9oMz4KPHVsPgo8bGk+VGhlIGNvcnAgY2F1c2VkIHRoZSBvcmlnaW5hbCBkaXNhc3Rlci48L2xpPgo8bGk+VGhlIGZpcnN0IG5lc3Qgd2FzIG5lYXJseSBkZXN0cm95ZWQuPC9saT4KPGxpPlRoZSBjb3JwIHRob3VnaHQgdGhlIGNsZWFudXAgc3VjY2VlZGVkLjwvbGk+CjxsaT5Tb21lb25lIGluc2lkZSB0aGUgY29ycCB3YXJuZWQgYWJvdXQgTW9kZWwgMSByZWxvY2F0aW9uLjwvbGk+CjxsaT5UaGUgY3VycmVudCB0aHJlYXQgcG9pbnRzIGJhY2sgdG93YXJkIE1hcCBDLjwvbGk+CjwvdWw+"
  },
  {
    "name": "Signal Bleed - Map A Clinic Key",
    "source_file": "handouts/14_Map_A_Clinic_Key.md",
    "notes_b64": "PGgxPk1hcCBBIOKAlCBNZXJjeSBUd2VsdmUgQ2xpbmljIGFuZCBJbmRvb3IgU3RyZWV0IEtleTwvaDE+CjxwPlVzZSB0aGlzIGtleSBmb3IgdGhlIHByaW1hcnkgY2xpbmljIGZsb29yLiBUaGUgcHVycG9zZSBvZiB0aGVzZSBwcm9tcHRzIGlzIG5vdCB0byBoaWRlIG1hbmRhdG9yeSBjbHVlcyBiZWhpbmQgc2luZ2xlIGNoZWNrcywgYnV0IHRvIGVuY291cmFnZSBwbGF5ZXJzIHRvIGludGVyYWN0IHdpdGggdGhlIGVudmlyb25tZW50IHVzaW5nIG1hbnkgZGlmZmVyZW50IHNraWxscy48L3A+CjxwPkZvciBhIHN0YXJ0ZXIgc2Vzc2lvbiwgZ2l2ZSB0aGUgYmFzaWMgY2x1ZSBmcmVlbHkgaWYgdGhlIHBsYXllcnMgaW52ZXN0aWdhdGUgdGhlIHJpZ2h0IHRoaW5nLiBSb2xscyBzaG91bGQgaW1wcm92ZSBkZXRhaWwsIHJldmVhbCBsZXZlcmFnZSwgcmVkdWNlIGRhbmdlciwgb3IgY3JlYXRlIGFuIGFkdmFudGFnZS48L3A+CjxoMj5Ib3cgdG8gdXNlIHRoZXNlIGNoZWNrczwvaDI+CjxwPlRoZXNlIGFyZSBwcm9tcHRzLCBub3QgYSBmaXhlZCBtZW51LiBJZiBhIHBsYXllciBkZXNjcmliZXMgYSBzZW5zaWJsZSBhcHByb2FjaCwgdXNlIHRoZSBjbG9zZXN0IHNraWxsIG9yIEJhY2tncm91bmQgbG9naWMuPC9wPgo8cD5SZWNvbW1lbmRlZCBjbHVlIGhhbmRsaW5nOjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5ObyByb2xsIC8gYmFzaWMgaW50ZXJhY3Rpb246PC9zdHJvbmc+IGdpdmUgdGhlIG9idmlvdXMgY2x1ZS48L2xpPgo8bGk+PHN0cm9uZz5TdWNjZXNzOjwvc3Ryb25nPiBnaXZlIHVzZWZ1bCBkZXRhaWwsIGxldmVyYWdlLCBvciBhIHNhZmVyIHJvdXRlLjwvbGk+CjxsaT48c3Ryb25nPkhpZ2ggc3VjY2Vzczo8L3N0cm9uZz4gZ2l2ZSBhIHNob3J0Y3V0LCBmdXR1cmUgYWR2YW50YWdlLCBvciBhIHdheSB0byByZWR1Y2UgZGFuZ2VyLjwvbGk+CjxsaT48c3Ryb25nPkZhaWx1cmU6PC9zdHJvbmc+IGRvIG5vdCBzdGFsbCB0aGUgc2NlbmFyaW87IGdpdmUgdGhlIGNsdWUgd2l0aCBsZXNzIGRldGFpbCwgZXh0cmEgdGltZSBjb3N0LCBub2lzZSwgb3IgY29tcGxpY2F0aW9uLjwvbGk+CjwvdWw+CjxoMj5BMS4gSW5kb29yIFN0cmVldCAvIFB1YmxpYyBDb25jb3Vyc2U8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+PC9wPgo8cD5BIGJyb2FkIGluZG9vciBzdHJlZXQgcnVucyBwYXN0IE1lcmN5IFR3ZWx2ZTogYmVuY2hlcywgcGxhbnRlcnMsIGZvb2Qga2lvc2tzLCBmbGlja2VyaW5nIGFkLXBhbmVscywgYW5kIHBlZGVzdHJpYW5zIHdobyBwcmV0ZW5kIG5vdCB0byBzdGFyZSBhdCB0aGUgY2xpbmljIGRvb3JzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz48L3A+CjxwPlRoaXMgaXMgcHVibGljIHNwYWNlLiBHYW5nIGxvb2tvdXRzLCBjbGluaWMgdm9sdW50ZWVycywgY29ycG9yYXRlIHdhdGNoZXJzLCBhbmQgb3JkaW5hcnkgbWVnYWNvbXBsZXggcmVzaWRlbnRzIGNhbiBhbGwgcGxhdXNpYmx5IGJlIGhlcmUuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPlN0cmVldHdpc2UgLyBMb2NhbCBLbm93bGVkZ2U6PC9zdHJvbmc+IElkZW50aWZ5IHdobyBiZWxvbmdzIGhlcmUgYW5kIHdobyBpcyBwcmV0ZW5kaW5nIHRvIGJlbG9uZy48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IFNwb3QgYSBjb3Jwb3JhdGUgb2JzZXJ2ZXIgdXNpbmcgYSBraW9zayByZWZsZWN0aW9uIGluc3RlYWQgb2YgbG9va2luZyBkaXJlY3RseS48L2xpPgo8bGk+PHN0cm9uZz5QZXJmb3JtYW5jZTo8L3N0cm9uZz4gRHJhdyBhIGNyb3dkLCBjYWxtIGEgY3Jvd2QsIG9yIG1ha2UgcHVibGljIGVzY2FsYXRpb24gY29zdGx5LjwvbGk+CjxsaT48c3Ryb25nPlNtYWxsIEFybXM6PC9zdHJvbmc+IE5vdGljZSBzZXZlcmFsIGJ5c3RhbmRlcnMgYXJlIGNhcnJ5aW5nIGNoZWFwIGNvbmNlYWxlZCBwaXN0b2xzIGJhZGx5LCBtb3JlIGZlYXIgdGhhbiBpbnRlbnQuPC9saT4KPGxpPjxzdHJvbmc+Qm91bnR5IEh1bnRlciAvIFRyYWNraW5nOjwvc3Ryb25nPiBQaWNrIG91dCB0aGUgc2FtZSBjb3VyaWVyLXJvdXRlIHNjdWZmIG1hcmtzIGxlYWRpbmcgdG93YXJkIHRoZSBjbGluaWMgZW50cmFuY2UuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgY2xpbmljIGlzIHdhdGNoZWQgZnJvbSBzZXZlcmFsIGRpcmVjdGlvbnMuPC9saT4KPGxpPk1vc3QgbG9jYWxzIHdhbnQgdGhlIGNsaW5pYyBsZWZ0IGFsb25lLjwvbGk+CjxsaT5QdWJsaWMgdmlvbGVuY2UgaGVyZSB3aWxsIGhhdmUgc29jaWFsIGNvbnNlcXVlbmNlcy48L2xpPgo8L3VsPgo8aDI+QTIuIFB1YmxpYyBGcm9udCBFbnRyYW5jZTwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz48L3A+CjxwPkRvdWJsZSBnbGFzcyBkb29ycyBvcGVuIGludG8gdGhlIHB1YmxpYyBjbGluaWMgc2lkZS4gVGhlIGRvb3JzIGFyZSByZWluZm9yY2VkLCBidXQgY292ZXJlZCBpbiBvbGQgc3RpY2tlcnMsIGNoaWxkcmVu4oCZcyBkcmF3aW5ncywgYW5kIGhhbmQtd3JpdHRlbiBub3RpY2VzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz48L3A+CjxwPlRoaXMgaXMgdGhlIG5vcm1hbCBjaXZpbGlhbiByb3V0ZS4gSXQgaXMgbm90IGRlc2lnbmVkIGZvciBlbWVyZ2VuY3kgZ3VybmV5IHRyYWZmaWMuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBTZWN1cml0eTo8L3N0cm9uZz4gUmVjb2duaXplIHRoYXQgdGhlIGVudHJhbmNlIGlzIGhhcmQgdG8gc3Rvcm0gY2xlYW5seSBidXQgZWFzeSB0byBpbnRpbWlkYXRlLjwvbGk+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXkgLyBSZXBhaXI6PC9zdHJvbmc+IFNwb3QgdGhhdCB0aGUgZG9vciBtb3RvcnMgaGF2ZSBiZWVuIHJlcGFpcmVkIHdpdGggb2ZmLWJyYW5kIHBhcnRzLjwvbGk+CjxsaT48c3Ryb25nPlNvY2lhbCAvIEVtcGF0aHk6PC9zdHJvbmc+IFJlYWQgdGhlIHZvbHVudGVlciBhdCB0aGUgZG9vciBhcyBleGhhdXN0ZWQsIG5vdCBob3N0aWxlLjwvbGk+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyOjwvc3Ryb25nPiBOb3RpY2UgdGhlIGRvb3IgYWNjZXNzIGxvZyBoYXMgYSBzaXgtbWludXRlIGdhcCBmcm9tIGVhcmxpZXIgdG9uaWdodC48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBjb3VyaWVyIGRpZCBub3QgYXJyaXZlIHRocm91Z2ggdGhlIHB1YmxpYyBlbnRyYW5jZS48L2xpPgo8bGk+U29tZW9uZSBoYXMgYmVlbiB0YW1wZXJpbmcgd2l0aCBhY2Nlc3MgbG9ncy48L2xpPgo8bGk+VGhlIGRvb3IgY2FuIGJlIGxvY2tlZCBkb3duLCBidXQgdGhhdCBtYXkgdHJhcCBjaXZpbGlhbnMuPC9saT4KPC91bD4KPGgyPkEzLiBSZWNlcHRpb24gYW5kIFdhaXRpbmcgQXJlYTwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz48L3A+CjxwPlRoZSB3YWl0aW5nIGFyZWEgaXMgY3Jvd2RlZCwgdGVuc2UsIGFuZCB0b28gYnJpZ2h0LiBQYXRpZW50cyBzaXQgYmVzaWRlIGdhbmcgbG9va291dHMsIHRpcmVkIHBhcmVudHMsIGFuZCBwZW9wbGUgd2hvIGNsZWFybHkgY2FtZSBoZXJlIGJlY2F1c2UgdGhlcmUgd2FzIG5vd2hlcmUgZWxzZSB0byBnby48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+PC9wPgo8cD5UaGlzIGlzIHRoZSBmaXJzdCBzb2NpYWwgcHJlc3N1cmUgY29va2VyLiBCbHVld2lyZSBtYXkgcGFzcyB0aHJvdWdoLCBidXQgc2hvdWxkIG5vdCBzdGFydCBoZXJlIHVubGVzcyB0aGUgR00gd2FudHMgaW1tZWRpYXRlIGVzY2FsYXRpb24uPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPlBzeWNob2xvZ3kgLyBFbXBhdGh5Ojwvc3Ryb25nPiBTZXBhcmF0ZSBmZWFyLCBwYWluLCBhbmdlciwgYW5kIGxveWFsdHkgaW4gdGhlIGNyb3dkLjwvbGk+CjxsaT48c3Ryb25nPlBlcmZvcm1hbmNlOjwvc3Ryb25nPiBEaXN0cmFjdCB0aGUgd2FpdGluZyByb29tIGxvbmcgZW5vdWdoIGZvciBzdGFmZiB0byBtb3ZlIHBhdGllbnRzLjwvbGk+CjxsaT48c3Ryb25nPk1lZGljaW5lOjwvc3Ryb25nPiBJZGVudGlmeSB3aGljaCBwYXRpZW50cyBhcmUgdXJnZW50IGFuZCB3aGljaCBhcmUgZnJpZ2h0ZW5lZCBidXQgc3RhYmxlLjwvbGk+CjxsaT48c3Ryb25nPkJsYWRlcyAvIE1lbGVlIENvbWJhdDo8L3N0cm9uZz4gTm90aWNlIHdobyBpcyBwb3N0dXJpbmcgZm9yIGludGltaWRhdGlvbiBhbmQgd2hvIGlzIGFjdHVhbGx5IHJlYWR5IHRvIGx1bmdlLjwvbGk+CjxsaT48c3Ryb25nPlJlbGlnaW91cyAvIENvbW11bml0eSBhbmdsZTo8L3N0cm9uZz4gQ29tZm9ydCBzb21lb25lIHdobyB0aGlua3MgdGhlIHNpZ25hbCBwdWxzZSB3YXMgYSBiYWQgb21lbi48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBjcm93ZCBjYW4gYmVjb21lIGFuIG9ic3RhY2xlIG9yIGFuIGFsbHkuPC9saT4KPGxpPlBvc2l0aXZlLCBkaXJlY3QgcmVhc3N1cmFuY2Ugd29ya3MgYmV0dGVyIGhlcmUgdGhhbiB0aHJlYXRzLjwvbGk+CjxsaT5TZXZlcmFsIHBlb3BsZSBrbm93IHJ1bW9ycyBhYm91dCBNYXJh4oCZcyBoaWRkZW4gc3VwcG9ydCwgYnV0IHdpbGwgbm90IHZvbHVudGVlciB0aGVtIGNhc3VhbGx5LjwvbGk+CjwvdWw+CjxoMj5BNC4gUGVkaWF0cmljIC8gQ29tbXVuaXR5IENvcm5lcjwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz48L3A+CjxwPkEgYnJpZ2h0IGNvcm5lciBvZiBzb2Z0IG1hdHMsIHdvcm4gdG95cywgd2FsbCBtdXJhbHMsIGNoZWFwIHRhYmxldHMsIGFuZCBoYWxmLWZpbmlzaGVkIGhvbWV3b3JrLiBJdCBpcyBwYWluZnVsbHkgb3V0IG9mIHBsYWNlIGJlc2lkZSBhcm1lZCBhZHVsdHMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPjwvcD4KPHA+VXNlIHRoaXMgdG8gdW5kZXJsaW5lIHN0YWtlcy4gS2VldCBvciBhbm90aGVyIHlvdW5nIHdpdG5lc3MgY2FuIGJlIGZvdW5kIGhlcmUuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPlN0dWRlbnQgRHJvcG91dCAvIEVkdWNhdGlvbjo8L3N0cm9uZz4gTm90aWNlIHRoZSBsZXNzb24gbWF0ZXJpYWwgaXMgY3VycmVudCBkZXNwaXRlIHRoZSBuZWlnaGJvcmhvb2TigJlzIHBvdmVydHkuPC9saT4KPGxpPjxzdHJvbmc+UGlzcy1Qb29yIEFydGlzdCAvIFBlcmZvcm1hbmNlOjwvc3Ryb25nPiBSZWFkIHRoZSBtdXJhbHMgYXMgY29tbXVuaXR5LW1hZGUsIHdpdGggaGlkZGVuIGluaXRpYWxzIGZyb20gbG9jYWwga2lkcy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBGaW5kIHNpZ25zIHRoYXQgYSBjaGlsZCBzYXcgdGhlIGNvdXJpZXIgYXJyaXZlIGZyb20gYW4gdW5leHBlY3RlZCBkaXJlY3Rpb24uPC9saT4KPGxpPjxzdHJvbmc+U29jaWFsIC8gRW1wYXRoeTo8L3N0cm9uZz4gR2V0IGEgY2hpbGQgdG8gZXhwbGFpbiB3aGF0IGFkdWx0cyByZWZ1c2UgdG8gc2F5LjwvbGk+CjxsaT48c3Ryb25nPlNtYWxsIEFybXM6PC9zdHJvbmc+IE5vdGljZSBzb21lb25lIGRlbGliZXJhdGVseSBjaG9zZSBub3QgdG8gZmlyZSB0b3dhcmQgdGhpcyBjb3JuZXIgZWFybGllci48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBjb21tdW5pdHkgc3VwcG9ydCBpcyBvcmdhbml6ZWQsIG5vdCBhY2NpZGVudGFsLjwvbGk+CjxsaT5NYXJh4oCZcyBwZW9wbGUgbWF5IGhhdmUgc3VwcGxpZWQgc2Nob29sIG1hdGVyaWFscy48L2xpPgo8bGk+Q2hpbGRyZW4gc2F3IG1vcmUgb2YgdGhlIGNvdXJpZXIgaW5jaWRlbnQgdGhhbiBhZHVsdHMgcmVhbGl6ZS48L2xpPgo8L3VsPgo8aDI+QTUuIFRyaWFnZSBEZXNrPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPjwvcD4KPHA+QSBjdXJ2ZWQgZGVzayBmb3JtcyB0aGUgY2xpbmlj4oCZcyBuZXJ2ZSBjZW50ZXI6IHBhdGllbnQgc2xhdGVzLCBzY2FubmVyIGZlZWRzLCBjaGVhcCBjb2ZmZWUsIGhhbGYtZW1wdHkgbWVkZm9hbSBjYW5pc3RlcnMsIGFuZCBzdGFmZiB3aG8gaGF2ZSBub3Qgc2xlcHQgZW5vdWdoLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz48L3A+CjxwPkRyLiBWYWxleiBvciBhIHNlbmlvciBudXJzZSBjYW4gYXBwZWFyIGhlcmUuIFRoaXMgaXMgYSBnb29kIHBsYWNlIGZvciBQQ3MgdG8gZWFybiB0cnVzdCBxdWlja2x5LjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5NZWRpY2luZTo8L3N0cm9uZz4gUHJpb3JpdGl6ZSBwYXRpZW50cyBhbmQgd2luIHN0YWZmIGNvbmZpZGVuY2UuPC9saT4KPGxpPjxzdHJvbmc+Q3liZXJ3YXJlIC8gTWVzaDo8L3N0cm9uZz4gTm90aWNlIGxvY2FsIGRldmljZXMgcHVsc2UgaW4gc3luYyB3aXRoIHRoZSByZWxheS48L2xpPgo8bGk+PHN0cm9uZz5Db3Jwb3JhdGUgU2VjdXJpdHk6PC9zdHJvbmc+IFJlY29nbml6ZSB0aGUgZGVzayBoYXMgbm8gZGVmZW5zZSBhZ2FpbnN0IGEgZm9ybWFsIGNvcnBvcmF0ZSBzZWl6dXJlIG9yZGVyLjwvbGk+CjxsaT48c3Ryb25nPlBlcnN1YXNpb246PC9zdHJvbmc+IENvbnZpbmNlIHN0YWZmIHRvIHNoYXJlIHJlc3RyaWN0ZWQgaW5mb3JtYXRpb24uPC9saT4KPGxpPjxzdHJvbmc+R3JlYXNlIE1vbmtleTo8L3N0cm9uZz4gTm90aWNlIHBvd2VyIGRpcHMgYXJlIGNvbWluZyBmcm9tIGRlZXBlciBpbmZyYXN0cnVjdHVyZSwgbm90IGp1c3QgYmFkIHdpcmluZy48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSByZWxheSBpcyBpbnRlcmZlcmluZyB3aXRoIHBhdGllbnQgZGV2aWNlcy48L2xpPgo8bGk+U3RhZmYgYXJlIGhpZGluZyBkZXRhaWxzIHRvIHByZXZlbnQgcGFuaWMuPC9saT4KPGxpPlRoZSBjbGluaWMgbmVlZHMgaGVscCBtb3JlIHRoYW4gaXQgbmVlZHMgbXVzY2xlLjwvbGk+CjwvdWw+CjxoMj5BNi4gRW1lcmdlbmN5IEludGFrZSBCYXk8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+PC9wPgo8cD5UaGUgbm9uLXB1YmxpYyBlbWVyZ2VuY3kgYmF5IHNtZWxscyBvZiBkaXNpbmZlY3RhbnQsIGhvdCBiYXR0ZXJ5IGNlbGxzLCBhbmQgb2xkIHBhbmljLiBBIHZlaGljbGUgYmF5IGNvbm5lY3RzIGRpcmVjdGx5IHRvIHRyYXVtYSBhY2Nlc3MuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPjwvcD4KPHA+VGhpcyBpcyBob3cgcGF0aWVudHMgc2hvdWxkIGFycml2ZSBieSBhbWJ1bGFuY2Ugb3Igc3RyZXRjaGVyLiBUaGUgY291cmllciBkaWQgbm90IHVzZSB0aGlzIHJvdXRlLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5NZWRpY2luZSAvIFN1cmdlcnk6PC9zdHJvbmc+IENvbmZpcm0gdGhlIGJheSBpcyBwcmVwYXJlZCBmb3IgdHJhdW1hIHdvcmssIG5vdCByb3V0aW5lIGludGFrZS48L2xpPgo8bGk+PHN0cm9uZz5TbWFsbCBBcm1zOjwvc3Ryb25nPiBJZGVudGlmeSBsb3ctY2FsaWJlciB3YXJuaW5nLXNob3QgZGFtYWdlIG5lYXIgdGhlIG91dGVyIHNodXR0ZXIuPC9saT4KPGxpPjxzdHJvbmc+QmlnIEd1bnM6PC9zdHJvbmc+IFJlY29nbml6ZSB0aGUgc2h1dHRlcnMgYXJlIHJlaW5mb3JjZWQgYWdhaW5zdCBicmVhY2hpbmcgd2VhcG9ucy48L2xpPgo8bGk+PHN0cm9uZz5NZXNoIEhhY2tlcjo8L3N0cm9uZz4gUmVjb3ZlciBwYXJ0aWFsIGludGFrZSBsb2dzIG9yIG5vdGljZSBkZWxldGVkIGNhbWVyYSBtZXRhZGF0YS48L2xpPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5Ojwvc3Ryb25nPiBTcG90IHRoYXQgdGhlIHBhcmtlZCBlbWVyZ2VuY3kgdmVoaWNsZSBiYXR0ZXJ5IHdhcyBkcmFpbmVkIHJlY2VudGx5LjwvbGk+CjxsaT48c3Ryb25nPlN0cmVldHdpc2U6PC9zdHJvbmc+IEtub3cgdGhpcyBlbnRyYW5jZSBpcyB3YXRjaGVkIGJ5IGJvdGggY2xpbmljIHZvbHVudGVlcnMgYW5kIFJlZGxpbmUgQ2hvaXIgbG9va291dHMuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgY291cmllciBhcnJpdmVkIGZyb20gaW5zaWRlIHRoZSBtZWdhY29tcGxleCwgbm90IGJ5IGFtYnVsYW5jZS48L2xpPgo8bGk+VGhlIGVtZXJnZW5jeSBiYXkgY2FtZXJhcyB3ZXJlIGxvb3BlZC48L2xpPgo8bGk+VGhlIGJheSBpcyB0aGUgYmVzdCByb3V0ZSBmb3IgZXZhY3VhdGluZyBjcml0aWNhbCBwYXRpZW50cy48L2xpPgo8L3VsPgo8aDI+QTcuIFRyYXVtYSAvIFN1cmdlcnkgUm9vbXM8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+PC9wPgo8cD5CcmlnaHQgc3VyZ2ljYWwgbGlnaHQgcG9vbHMgb3ZlciBjbGVhbiB0YWJsZXMsIHBhdGNoZWQgbWFjaGluZXMsIGJ1bmRsZWQgY2FibGVzLCBhbmQgY2FyZWZ1bGx5IHJhdGlvbmVkIHN0ZXJpbGUgc3VwcGxpZXMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPjwvcD4KPHA+VGhpcyBpcyB3aGVyZSB0aGUgcmVsYXktZXhwb3NlZCBwYXRpZW50IG9yIGNvdXJpZXIgbWF5IGJlIHRyZWF0ZWQuIEl0IHNob3VsZCBmZWVsIHByZWNpb3VzIGFuZCB2dWxuZXJhYmxlLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5TdXJnZXJ5Ojwvc3Ryb25nPiBVbmRlcnN0YW5kIHdoYXQgdHJlYXRtZW50IGlzIHBvc3NpYmxlIGFuZCB3aGF0IHJlc291cmNlcyBhcmUgbWlzc2luZy48L2xpPgo8bGk+PHN0cm9uZz5DeWJlci1KdW5raWUgLyBDeWJlcndhcmU6PC9zdHJvbmc+IEZlZWwgdGhhdCB0aGUgc2lnbmFsIGlzIGlycml0YXRpbmcgaW1wbGFudHMgYW5kIG1lZGljYWwgZGV2aWNlcy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBOb3RpY2Ugc29tZW9uZSBtb3ZlZCBhIGNyaXRpY2FsIGRldmljZSByZWNlbnRseSBhbmQgY2xlYW5lZCBwb29ybHkgYWZ0ZXJ3YXJkLjwvbGk+CjxsaT48c3Ryb25nPkJsYWRlczo8L3N0cm9uZz4gUmVhZCBkZWZlbnNpdmUgY3V0cyBvciBjbG9zZS1xdWFydGVycyB0cmF1bWEgb24gYSBwYXRpZW50LjwvbGk+CjxsaT48c3Ryb25nPlJvZ3VlIFN1cmdlb246PC9zdHJvbmc+IElkZW50aWZ5IGlsbGVnYWwgYnV0IGVmZmVjdGl2ZSBlbWVyZ2VuY3kgbW9kaWZpY2F0aW9ucyBpbiB0aGUgZXF1aXBtZW50LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhlIHJlbGF5IGlzIG1lZGljYWxseSBkYW5nZXJvdXMuPC9saT4KPGxpPlNvbWVvbmUgdHJpZWQgdG8gaGlkZSBob3cgYmFkIHRoZSBleHBvc3VyZSBzeW1wdG9tcyBhcmUuPC9saT4KPGxpPlRoZSBjbGluaWMgY2FuIHN0YWJpbGl6ZSBwZW9wbGUsIGJ1dCBub3QgZmlnaHQgYSBwcm9sb25nZWQgYnJlYWNoIGhlcmUuPC9saT4KPC91bD4KPGgyPkE4LiBQaGFybWFjeSBhbmQgU3VwcGx5PC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPjwvcD4KPHA+TG9ja2VkIHNoZWx2ZXMgaG9sZCBhbnRpYmlvdGljcywgcGFpbmtpbGxlcnMsIG1lZGZvYW0sIGNoZWFwIG51dHJpdGlvbiBwYWNrcywgYW5kIGxhYmVsZWQgYm94ZXMgd2hvc2UgbGFiZWxzIGRvIG5vdCBtYXRjaCB0aGUgY29udGVudHMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPjwvcD4KPHA+VGhpcyByb29tIGNhbiByZXZlYWwgTWFyYeKAmXMgY292ZXJ0IHN1cHBvcnQgYW5kIGFsc28gdGVtcHQgZGVzcGVyYXRlIGNoYXJhY3RlcnMuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPk1lZGljaW5lOjwvc3Ryb25nPiBJZGVudGlmeSB3aGljaCBzdXBwbGllcyBhcmUgbGlmZXNhdmluZyBhbmQgd2hpY2ggYXJlIG1lcmVseSB2YWx1YWJsZS48L2xpPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlOjwvc3Ryb25nPiBSZWNvZ25pemUgUmVkbGluZSBDaG9pciBzbXVnZ2xpbmcgbWFya3Mgb24gc3VwcG9zZWRseSBhbm9ueW1vdXMgY3JhdGVzLjwvbGk+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb246PC9zdHJvbmc+IEZpbmQgYSBoaWRkZW4gbGVkZ2VyIG9mIGZvb2QsIG1lZGljaW5lLCBhbmQgc2Nob29sIHN1cHBseSBkZWxpdmVyaWVzLjwvbGk+CjxsaT48c3Ryb25nPlNsZWlnaHQgLyBDYXQgQnVyZ2xhciBhbmdsZTo8L3N0cm9uZz4gT3BlbiBhIGNhYmluZXQgd2l0aG91dCB0cmlnZ2VyaW5nIHN0YWZmIGFsYXJtcy48L2xpPgo8bGk+PHN0cm9uZz5Tb2NpYWw6PC9zdHJvbmc+IENvbnZpbmNlIGEgdm9sdW50ZWVyIHRvIGFkbWl0IHdobyBwYWlkIGZvciByZWNlbnQgc3RvY2suPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5NYXJhIGhhcyBiZWVuIHF1aWV0bHkgZnVuZGluZyBtZWRpY2luZSBhbmQgZm9vZC48L2xpPgo8bGk+VGhlIGNsaW5pYyBpcyBvbmUgc3VwcGx5IGRpc3J1cHRpb24gYXdheSBmcm9tIGNvbGxhcHNlLjwvbGk+CjxsaT5FeHBvc2luZyBNYXJh4oCZcyBnb29kIHdvcmtzIHB1YmxpY2x5IG1heSBkYW1hZ2UgaGVyIHByb3RlY3RpdmUgaW1hZ2UuPC9saT4KPC91bD4KPGgyPkE5LiBSZWNvdmVyeSBXaW5nPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPjwvcD4KPHA+U21hbGwgcmVzdGluZyByb29tcyBsaW5lIGEgcXVpZXRlciBjb3JyaWRvcjogYmVkcywgdGhpbiBibGFua2V0cywgcHJpdmFjeSBjdXJ0YWlucywgc21hbGwgcGxhbnRzLCBhbmQgbW9uaXRvcnMgcnVubmluZyBhdCBtaW5pbXVtIHBvd2VyLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz48L3A+CjxwPlRoaXMgaXMgd2hlcmUgY2l2aWxpYW4gdnVsbmVyYWJpbGl0eSBpcyBtb3N0IHZpc2libGUuIERvIG5vdCByb3V0ZSBhbGwgbW92ZW1lbnQgdGhyb3VnaCByZWNlcHRpb247IHN0YWZmIG5lZWQgaW50ZXJuYWwgY29ycmlkb3JzIHRvIGJyaW5nIHBhdGllbnRzIGhlcmUgZnJvbSB0cmF1bWEuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPk1lZGljaW5lOjwvc3Ryb25nPiBOb3RpY2Ugd2hpY2ggcGF0aWVudHMgY2Fubm90IGJlIG1vdmVkIHF1aWNrbHkuPC9saT4KPGxpPjxzdHJvbmc+RW1wYXRoeTo8L3N0cm9uZz4gQ2FsbSBhIHBhdGllbnQgZW5vdWdoIHRvIGRlc2NyaWJlIHN0cmFuZ2Ugc3ltcHRvbXMuPC9saT4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBTcG90IHRoYXQgb25lIHJlY292ZXJ5IHJvb20gaGFzIGJlZW4gd2F0Y2hlZCBmcm9tIHRoZSBjb3JyaWRvci48L2xpPgo8bGk+PHN0cm9uZz5QaWxvdGluZyAvIExvZ2lzdGljczo8L3N0cm9uZz4gUGxhbiBhbiBldmFjdWF0aW9uIHBhdGggdXNpbmcgZWxldmF0b3JzIGFuZCB3aWRlIGNvcnJpZG9ycy48L2xpPgo8bGk+PHN0cm9uZz5BdGhsZXRpY3M6PC9zdHJvbmc+IE1vdmUgYSBwYXRpZW50IHNhZmVseSB1bmRlciB0aW1lIHByZXNzdXJlIHdpdGhvdXQgYSBwcm9wZXIgZ3VybmV5LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+RXZhY3VhdGlvbiB3aWxsIGJlIGRpZmZpY3VsdCBpZiB0aGUgZWxldmF0b3IgbG9ja3MgZG93bi48L2xpPgo8bGk+U29tZSBwYXRpZW50cyBhcmUgYWxyZWFkeSByZWFjdGluZyB0byB0aGUgc2lnbmFsLjwvbGk+CjxsaT5UaGUgcmVjb3Zlcnkgd2luZyBnaXZlcyBwbGF5ZXJzIGEgcmVhc29uIG5vdCB0byBsZXQgZmlnaHRpbmcgc3BpbGwgaW50byB0aGUgY2xpbmljLjwvbGk+CjwvdWw+CjxoMj5BMTAuIFN0YWZmIE9mZmljZSAvIFJlY29yZHM8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+PC9wPgo8cD5BIGNyYW1wZWQgb2ZmaWNlIG9mIGJhdHRlcmVkIGZpbGluZyBjYWJpbmV0cywgY2hlYXAgdGVybWluYWxzLCBtdWdzLCBvbGQgcHJvdGVzdCBwb3N0ZXJzLCBhbmQgYSBsb2NrZWQgZHJhd2VyIGV2ZXJ5b25lIHByZXRlbmRzIG5vdCB0byBub3RpY2UuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPjwvcD4KPHA+VXNlIHRoaXMgZm9yIGRlZXBlciBpbnZlc3RpZ2F0aW9uLCBjb3JwIHJlY29yZHMsIGRlbGV0ZWQgbG9ncywgb3IgcHJvb2Ygb2YgdGhlIGNsaW5pYy9nYW5nIHJlbGF0aW9uc2hpcC48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+TWVzaCBIYWNrZXI6PC9zdHJvbmc+IFJlY292ZXIgZGVsZXRlZCBhY2Nlc3MgbG9ncy48L2xpPgo8bGk+PHN0cm9uZz5Db3Jwb3JhdGUgU2VjdXJpdHk6PC9zdHJvbmc+IFJlY29nbml6ZSB0aGUgZm9ybWF0IG9mIGEgY29ycG9yYXRlIHNlaXp1cmUgbm90aWNlIGJlZm9yZSBpdCBpcyBvZmZpY2lhbGx5IHNlcnZlZC48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBGaW5kIG1pc21hdGNoZWQgcGF0aWVudCByZWNvcmRzIGNvbm5lY3RlZCB0byB0aGUgcmVsYXkuPC9saT4KPGxpPjxzdHJvbmc+UGVyc3Vhc2lvbjo8L3N0cm9uZz4gQ29udmluY2Ugc3RhZmYgdG8gcmV2ZWFsIHdoYXQgRHIuIFZhbGV6IGlzIHdpdGhob2xkaW5nLjwvbGk+CjxsaT48c3Ryb25nPkZvcmdlcnkgLyBBZG1pbjo8L3N0cm9uZz4gQ3JlYXRlIGEgdGVtcG9yYXJ5IHJlY29yZCB0aGF0IGJ1eXMgdGltZSBhZ2FpbnN0IGNvcnAgcmVjb3ZlcnkuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgY29ycCBoYXMgbGVnYWwgcHJldGV4dCBwcmVwYXJlZC48L2xpPgo8bGk+VGhlIHJlbGF5IGNhc2UgcHJlZGF0ZXMgdG9uaWdodC48L2xpPgo8bGk+VGhlIGNsaW5pYyBpcyB0cnlpbmcgdG8gdmVyaWZ5IHRoZSBldmlkZW5jZSwgbm90IGhpZGUgaXQgZm9yZXZlci48L2xpPgo8L3VsPgo8aDI+QTExLiBFbGV2YXRvciBDb3JlPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPjwvcD4KPHA+QSBoZWF2eSBlbGV2YXRvciBjb3JlIGh1bXMgYmVoaW5kIHRlYWwtbGl0IGRvb3JzLiBJdCBpcyBsYXJnZSBlbm91Z2ggZm9yIGJlZHMsIGNhcnRzLCBhbmQgZXZhYyBkcm9uZXMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPjwvcD4KPHA+VGhpcyBpcyB0aGUgc2FmZSB2ZXJ0aWNhbCByb3V0ZS4gSXQgaXMgYWxzbyBoYWNrYWJsZSwgbG9ja2FibGUsIGFuZCB2dWxuZXJhYmxlIHRvIHNpZ25hbCBpbnRlcmZlcmVuY2UuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IERpYWdub3NlIHBvd2VyIHN0cmFpbiBhbmQgcHJldmVudCBhIHN0YWxsLjwvbGk+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyOjwvc3Ryb25nPiBPdmVycmlkZSBmbG9vciBhY2Nlc3Mgb3IgZGV0ZWN0IGEgcmVtb3RlIGxvY2tvdXQuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIFNlY3VyaXR5Ojwvc3Ryb25nPiBQcmVkaWN0IGhvdyByZWNvdmVyeSB0ZWFtcyB3b3VsZCBzZWl6ZSBlbGV2YXRvciBjb250cm9sLjwvbGk+CjxsaT48c3Ryb25nPlBpbG90aW5nIC8gTG9naXN0aWNzOjwvc3Ryb25nPiBDb29yZGluYXRlIHBhdGllbnQgbW92ZW1lbnQgdW5kZXIgcHJlc3N1cmUuPC9saT4KPGxpPjxzdHJvbmc+QmlnIEd1bnM6PC9zdHJvbmc+IFJlY29nbml6ZSB3aHkgdGhpcyBpcyBhIGJhZCBwbGFjZSB0byBiZSB0cmFwcGVkIGlmIGVuZW1pZXMgYnJlYWNoIGRvb3JzLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhlIGVsZXZhdG9yIGNhbiBjb25uZWN0IGFsbCBhY3RpdmUgbWFwcy48L2xpPgo8bGk+SWYgY29ycnVwdGVkLCBpdCBjYW4gc3ByZWFkIGRhbmdlciBiZXR3ZWVuIGZsb29ycy48L2xpPgo8bGk+SXQgaXMgdGhlIGJlc3Qgcm91dGUgZm9yIHRoZSBHdXJuZXkgQW5nZWxzLjwvbGk+CjwvdWw+CjxoMj5BMTIuIEVtZXJnZW5jeSBTdGFpciAvIExhZGRlcndlbGw8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+PC9wPgo8cD5BIG5hcnJvdyB2ZXJ0aWNhbCBhY2Nlc3Mgc2hhZnQgaG9sZHMgc3RlZXAgbWV0YWwgc3RhaXJzLCBsYWRkZXItc2VjdGlvbnMsIGFuZCBlbWVyZ2VuY3kgbGlnaHRpbmcgdGhhdCBmbGlja2VycyB3aXRoIGV2ZXJ5IHNpZ25hbCBwdWxzZS48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+PC9wPgo8cD5JZiB0aGUgbWFwIGFydCBsb29rcyBsYWRkZXItbGlrZSwgZGVzY3JpYmUgdGhpcyBhcyBhIGNvbXBhY3QgbWVnYWNvbXBsZXggc3RhaXIvbGFkZGVyd2VsbC4gR29vZCBmb3IgUENzLCBiYWQgZm9yIHN0cmV0Y2hlcnMuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPlBhcmtvdXIgLyBBdGhsZXRpY3M6PC9zdHJvbmc+IE1vdmUgcXVpY2tseSB3aXRob3V0IHNsaXBwaW5nIG9yIGJsb2NraW5nIG90aGVycy48L2xpPgo8bGk+PHN0cm9uZz5TdGVhbHRoOjwvc3Ryb25nPiBVc2UgdGhlIHNoYWZ0IHRvIGJ5cGFzcyBwdWJsaWMgYXJlYXMuPC9saT4KPGxpPjxzdHJvbmc+R3JlYXNlIE1vbmtleTo8L3N0cm9uZz4gTm90aWNlIG9sZCBtYWludGVuYW5jZSBhY2Nlc3MgcGFuZWxzIGFsb25nIHRoZSBzaGFmdC48L2xpPgo8bGk+PHN0cm9uZz5NZWxlZSBDb21iYXQ6PC9zdHJvbmc+IFVuZGVyc3RhbmQgaG93IGJhZCBhIGZpZ2h0IGhlcmUgd291bGQgYmUuPC9saT4KPGxpPjxzdHJvbmc+R3V0dGVyIFJhdCAvIFNjYXZlbmdlcjo8L3N0cm9uZz4gS25vdyB3aGljaCBsYW5kaW5ncyBjb25uZWN0IHRvIHVub2ZmaWNpYWwgcm91dGVzLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhpcyBpcyBhIGJ5cGFzcyBpZiB0aGUgZWxldmF0b3IgaXMgbG9ja2VkLjwvbGk+CjxsaT5Nb3Zpbmcgd291bmRlZCBjaXZpbGlhbnMgaGVyZSBpcyBzbG93IGFuZCByaXNreS48L2xpPgo8bGk+QSBjaGFzZSBjYW4gbW92ZSB2ZXJ0aWNhbGx5IHRocm91Z2ggdGhpcyBzaGFmdC48L2xpPgo8L3VsPgo8aDI+QTEzLiBTZXJ2aWNlIENvcnJpZG9yPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPjwvcD4KPHA+QSBuYXJyb3cgYmFjayBjb3JyaWRvciBsaW5rcyBzdXBwbHksIHN0YWZmLCBtYWludGVuYW5jZSwgYW5kIGVtZXJnZW5jeSBhY2Nlc3Mgd2l0aG91dCBjcm9zc2luZyB0aGUgd2FpdGluZyByb29tLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz48L3A+CjxwPlRoaXMgaXMgaW1wb3J0YW50IGZvciBsb2dpY2FsIGhvc3BpdGFsIG1vdmVtZW50LiBJdCBpcyBhbHNvIGEgcXVpZXQgcGxhY2UgZm9yIHRlbnNlIGNvbmZyb250YXRpb25zLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IEhlYXIgdm9pY2VzIGJlZm9yZSBvcGVuaW5nIHRoZSBuZXh0IGRvb3IuPC9saT4KPGxpPjxzdHJvbmc+U21hbGwgQXJtczo8L3N0cm9uZz4gSWRlbnRpZnkgdGhlIGJlc3QgZGVmZW5zaXZlIGFuZ2xlcyB3aXRob3V0IGZpcmluZy48L2xpPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlOjwvc3Ryb25nPiBSZWNvZ25pemUgUmVkbGluZSBDaG9pciBtb3ZlbWVudCBwYXR0ZXJucy48L2xpPgo8bGk+PHN0cm9uZz5Db3Jwb3JhdGUgU2VjdXJpdHk6PC9zdHJvbmc+IFNwb3Qgd2hlcmUgYSByZWNvdmVyeSB0ZWFtIHdvdWxkIHN0YWNrIHVwIGJlZm9yZSBicmVhY2guPC9saT4KPGxpPjxzdHJvbmc+TWVkaWNpbmU6PC9zdHJvbmc+IFBsYW4gYSBwYXRpZW50IHJvdXRlIGZyb20gdHJhdW1hIHRvIHJlY292ZXJ5LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+U3RhZmYgY2FuIG1vdmUgcGF0aWVudHMgaW50ZXJuYWxseS48L2xpPgo8bGk+R2FuZyBhbmQgY29ycCBmYWN0aW9ucyBib3RoIHdhbnQgY29udHJvbCBvZiB0aGlzIGNvcnJpZG9yLjwvbGk+CjxsaT5JdCBjYW4gYmVjb21lIHRoZSBtYWluIGV2YWN1YXRpb24gcm91dGUuPC9saT4KPC91bD4KPGgyPkExNC4gQmx1ZXdpcmXigJlzIFBhY2luZyBSb3V0ZTwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz48L3A+CjxwPlRoZSBmbG9vciBuZWFyIG9uZSBjb3JyaWRvciBqdW5jdGlvbiBpcyBzY3VmZmVkIGJ5IHJlcGVhdGVkIGJvb3QgdHVybnMuIFNvbWVvbmUgaGFzIGJlZW4gcGFjaW5nIHRoZXJlIGhhcmQgZW5vdWdoIHRvIGxlYXZlIG1hcmtzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz48L3A+CjxwPlRoaXMgaXMgYSBtb2JpbGUga2V5ZWQgbG9jYXRpb24uIFBsYWNlIGl0IHdoZXJlIEJsdWV3aXJlIGhhcyBiZWVuIHNwaXJhbGluZyBuZWFyIHRoZSByZXN0cmljdGVkIG9yIGVtZXJnZW5jeSBhcmVhLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5Qc3ljaG9sb2d5Ojwvc3Ryb25nPiBSZWFkIGFnaXRhdGlvbiwgZmVhciwgYW5kIG92ZXJzdGltdWxhdGlvbiBmcm9tIHRoZSBwYWNpbmcgcGF0dGVybi48L2xpPgo8bGk+PHN0cm9uZz5NZWRpY2luZTo8L3N0cm9uZz4gQ29ubmVjdCBzd2VhdGluZywgdHJlbW9yLCBhbmQgcGFpbiB0byB3aXRoZHJhd2FsIG9yIG9waW9pZCBkZXBlbmRlbmNlLjwvbGk+CjxsaT48c3Ryb25nPkN5YmVyd2FyZTo8L3N0cm9uZz4gTm90aWNlIGhpcyB3YXJlIGlzIHJ1bm5pbmcgaG90IGFuZCByZWFjdGluZyB0byBzaWduYWwgcHVsc2VzLjwvbGk+CjxsaT48c3Ryb25nPk1lbGVlIENvbWJhdDo8L3N0cm9uZz4gUHJlZGljdCB0aGF0IGhlIGlzIG1vcmUgbGlrZWx5IHRvIGx1bmdlIHRoYW4gYWltIGNhcmVmdWxseS48L2xpPgo8bGk+PHN0cm9uZz5Qb3NpdGl2ZSBzb2NpYWwgYXBwcm9hY2g6PC9zdHJvbmc+IFVzZSBoaXMgbmFtZSBhbmQgZ2l2ZSBoaW0gYSBmYWNlLXNhdmluZyB0YXNrOyB0aGlzIHNob3VsZCBtYXR0ZXIgbW9yZSB0aGFuIGNsZXZlciBkaWFnbm9zaXMgYWxvbmUuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5CbHVld2lyZSBpcyBvYnZpb3VzIHRvIHJlYWQ7IHRoaXMgaXMgbm90IGEgaGlkZGVuIG15c3RlcnkuPC9saT4KPGxpPkRpZmZpY3VsdHkgc2hvdWxkIGJlIGxvdzogOCB0byBub3RpY2Ugc2VyaW91cyBkaXN0cmVzcywgMTAgdG8gaWRlbnRpZnkgbGlrZWx5IGRlcGVuZGVuY2UvY3liZXItc3RyYWluLjwvbGk+CjxsaT5FbmNvdXJhZ2VtZW50IGFuZCByZXNwZWN0IGNhbiBoYXZlIGEgaHVnZSBzdGFiaWxpemluZyBlZmZlY3QuPC9saT4KPC91bD4KPGgyPlVwZGF0ZWQgYmlvbG9naWNhbC1uZXN0IGNsdWVzIGZvciBNYXAgQTwvaDI+CjxwPlVzZSBNYXAgQSBtb3N0bHkgZm9yIGh1bWFuIHByZXNzdXJlIGFuZCBlYXJseSBtaXNzaW5nLXBlcnNvbiBzaWducy48L3A+CjxoMz5BMyBSZWNlcHRpb24gYW5kIFdhaXRpbmcgQXJlYTwvaDM+Cjx1bD4KPGxpPkEgd29ycmllZCBwYXRpZW50IGFza3Mgd2h5IHNvIG1hbnkgbWFpbnRlbmFuY2Ugd29ya2VycyBhbmQgdm9sdW50ZWVycyBoYXZlIHN0b3BwZWQgc2hvd2luZyB1cC48L2xpPgo8bGk+TWVkaWNpbmUgb3IgRW1wYXRoeSBjYW4gcmV2ZWFsIHRoYXQgY2xpbmljIHN0YWZmIGFyZSB0cmFja2luZyBuby1zaG93IHBhdGllbnRzLCBidXQgdGhlIHBhdHRlcm4gaXMgYmVpbmcgZGlzbWlzc2VkIGFzIHBvdmVydHksIGZlYXIsIG9yIGdhbmcgdHJvdWJsZS48L2xpPgo8bGk+QSBmcmlnaHRlbmVkIGNpdmlsaWFuIG1lbnRpb25zIHNvbWV0aGluZyBzY3JhdGNoaW5nIGJlaGluZCB0aGUgdmVudHMgYnV0IGlzIGVtYmFycmFzc2VkIHRvIHNheSBpdC48L2xpPgo8L3VsPgo8aDM+QTQgUGVkaWF0cmljIC8gQ29tbXVuaXR5IENvcm5lcjwvaDM+CjxwPkFkZCA8c3Ryb25nPk1pcmkgYW5kIFNvbDwvc3Ryb25nPiBoZXJlIGlmIG5vdCB1c2luZyB0aGVtIG9uIE1hcCBCLjwvcD4KPHA+T3ZlcmhlYXJkIGNvbnZlcnNhdGlvbjo8L3A+CjxibG9ja3F1b3RlPuKAnEF1bnRpZSBSZWQgcGFpZCBmb3IgYnJlYWtmYXN0IGFnYWluLuKAnTwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcRG9u4oCZdCBjYWxsIGhlciB0aGF0IHdoZXJlIGdyb3duLXVwcyBoZWFyLuKAnTwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcV2h5P+KAnTwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcQmVjYXVzZSBzaGUgZ2V0cyBtYWQgd2hlbiBwZW9wbGUga25vdyBzaGXigJlzIG5pY2Uu4oCdPC9ibG9ja3F1b3RlPgo8cD5BZGRpdGlvbmFsIGNsdWU6PC9wPgo8dWw+CjxsaT5PbmUgY2hpbGQgc2F5cyBMYWxhIE1pciB1c2VkIHRvIGJyaW5nIGZvb2QgdGhyb3VnaCB0aGUgYmFjayBjb3JyaWRvciwgYnV0IGhhcyBub3QgY29tZSBiYWNrLjwvbGk+CjxsaT5JZiBhc2tlZCBnZW50bHksIHRoZSBjaGlsZCBhZGRzOiDigJxUaGVyZSB3YXMgYSBkb2cgc291bmQgaW4gdGhlIHdhbGwuIE5vdCBhIGRvZy7igJ08L2xpPgo8L3VsPgo8aDM+QTYgRW1lcmdlbmN5IEludGFrZSBCYXk8L2gzPgo8dWw+CjxsaT5BIHBhdGllbnQgdHJhbnNmZXIgcmVjb3JkIHJlZmVyZW5jZXMgYW4gZXhwb3N1cmUtdHJlYXRtZW50IHBhdGllbnQgbW92ZWQgdW5kZXIgZmFsc2UgcGFwZXJ3b3JrLjwvbGk+CjxsaT5QYXggUnV1biByZWNvZ25pemVzIGEgc3VwcG9zZWRseSBkaXNjaGFyZ2VkIHBhdGllbnQgZnJvbSB0aGUgcmVsYXkgZmlsZXMuPC9saT4KPGxpPkNhbWVyYSBmb290YWdlIGRvZXMgbm90IHNob3cgQW50aXRoZXNpcyBoZXJlIHlldDsgaW5zdGVhZCBpdCBzaG93cyBtaXNzaW5nIHJlY29yZHMgYW5kIHN1c3BpY2lvdXMgdHJhbnNmZXJzLjwvbGk+CjwvdWw+CjxoMz5BMTMgU2VydmljZSBDb3JyaWRvcjwvaDM+Cjx1bD4KPGxpPkJleCBBcmFuZGHigJlzIGRyb3BwZWQgdG9rZW4sIGtuaWZlLCBvciBibG9vZGxlc3Mgc2NyYXBlIG1hcmsgbWF5IGJlIGZvdW5kIGhlcmUuPC9saT4KPGxpPlRyYWNraW5nIC8gQm91bnR5IEh1bnRlciBjYW4gaWRlbnRpZnkgZHJhZyBkaXJlY3Rpb24gdG93YXJkIHNlcnZpY2UgaW5mcmFzdHJ1Y3R1cmUuPC9saT4KPGxpPlNtYWxsIEFybXMgY2FuIGlkZW50aWZ5IHRoYXQgc2hvdHMgd2VyZSBmaXJlZCBsb3cgYW5kIHBhbmlja2VkLCBub3QgYXQgaHVtYW4gaGVpZ2h0LjwvbGk+CjwvdWw+CjxoMz5BMTQgQmx1ZXdpcmXigJlzIFBhY2luZyBSb3V0ZTwvaDM+Cjx1bD4KPGxpPkJsdWV3aXJlIHNheXMgdGhlIHdhbGxzIGhhdmUgdGVldGguPC9saT4KPGxpPkhlIGhhcyBoZWFyZCB3ZXQgY2xpY2tpbmcgbmVhciBzZXJ2aWNlIHJvdXRlcy48L2xpPgo8bGk+SGUgaXMgbm90IGFsaWVuLWNvbnRyb2xsZWQuIEhpcyBkaXN0cmVzcyBpcyBvcGlvaWRzLCBjeWJlci1zdHJhaW4sIHRyYXVtYSwgYW5kIHBvc3NpYmx5IGlsbGVnYWwgdHJlYXRtZW50IHNpZGUgZWZmZWN0cy48L2xpPgo8bGk+VHJlYXRpbmcgaGltIGFzIGEgcGVyc29uIG1heSBtYWtlIGhpbSBhIHVzZWZ1bCB3aXRuZXNzIHJhdGhlciB0aGFuIGEgZmlnaHQuPC9saT4KPC91bD4="
  },
  {
    "name": "Signal Bleed - Map B Community Support Key",
    "source_file": "handouts/15_Map_B_Community_Support_Key.md",
    "notes_b64": "PGgxPk1hcCBCIOKAlCBSZXB1cnBvc2VkIFJlY292ZXJ5ICZhbXA7IFN1cHBvcnQgV2FyZCBLZXk8L2gxPgo8cD5Vc2UgdGhpcyBmbG9vciB0byBtYWtlIHRoZSBjaXZpbGlhbiBzdGFrZXMgY29uY3JldGUuIEl0IGlzIHdoZXJlIHRoZSBQQ3MgY2FuIGRpc2NvdmVyIHdoeSB0aGUgY2xpbmljIG1hdHRlcnMgYW5kIHdoeSBNYXJhIHByb3RlY3RzIHRoZSBuZWlnaGJvcmhvb2QgaW4gd2F5cyB0aGF0IGRvIG5vdCBsb29rIGxpa2Ugb3JkaW5hcnkgZ2FuZyBhY3Rpdml0eS48L3A+CjxwPkZsb29yIEIgd2FzIGJ1aWx0IGFzIGEgY2xpbmljYWwgb3ZlcmZsb3cvcmVjb3Zlcnkgd2FyZCBhbmQgbGF0ZXIgcmVwdXJwb3NlZCBpbnRvIE1lcmN5IFR3ZWx2ZeKAmXMgbWl4ZWQgc3VwcG9ydCBsZXZlbC4gSXQgc3RpbGwgbG9va3MgbWVkaWNhbCBiZWNhdXNlIGl0IGlzIG1lZGljYWw6IHNob3J0LXN0YXkgYmVkcywgbW9uaXRvcmluZyBzdGF0aW9ucywgc2VhbGVkIHBvZHMsIHN0YWZmIG9mZmljZXMsIGFuZCBlbWVyZ2VuY3kgYWNjZXNzIGFsbCByZW1haW4gaW4gdXNlLiBUaGUg4oCcY29tbXVuaXR5IHN1cHBvcnTigJ0gZnVuY3Rpb24gaXMgbGF5ZXJlZCBvbiB0b3Agb2YgdGhhdCBpbmZyYXN0cnVjdHVyZS48L3A+CjxoMj5Ib3cgdG8gdXNlIHRoZXNlIGNoZWNrczwvaDI+CjxwPlRoZXNlIGFyZSBwcm9tcHRzLCBub3QgYSBmaXhlZCBtZW51LiBJZiBhIHBsYXllciBkZXNjcmliZXMgYSBzZW5zaWJsZSBhcHByb2FjaCwgdXNlIHRoZSBjbG9zZXN0IHNraWxsIG9yIEJhY2tncm91bmQgbG9naWMuPC9wPgo8cD5SZWNvbW1lbmRlZCBjbHVlIGhhbmRsaW5nOjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5ObyByb2xsIC8gYmFzaWMgaW50ZXJhY3Rpb246PC9zdHJvbmc+IGdpdmUgdGhlIG9idmlvdXMgY2x1ZS48L2xpPgo8bGk+PHN0cm9uZz5TdWNjZXNzOjwvc3Ryb25nPiBnaXZlIHVzZWZ1bCBkZXRhaWwsIGxldmVyYWdlLCBvciBhIHNhZmVyIHJvdXRlLjwvbGk+CjxsaT48c3Ryb25nPkhpZ2ggc3VjY2Vzczo8L3N0cm9uZz4gZ2l2ZSBhIHNob3J0Y3V0LCBmdXR1cmUgYWR2YW50YWdlLCBvciBhIHdheSB0byByZWR1Y2UgZGFuZ2VyLjwvbGk+CjxsaT48c3Ryb25nPkZhaWx1cmU6PC9zdHJvbmc+IGRvIG5vdCBzdGFsbCB0aGUgc2NlbmFyaW87IGdpdmUgdGhlIGNsdWUgd2l0aCBsZXNzIGRldGFpbCwgZXh0cmEgdGltZSBjb3N0LCBub2lzZSwgb3IgY29tcGxpY2F0aW9uLjwvbGk+CjwvdWw+CjxoMj5CMS4gVXBwZXIgUHVibGljIC8gU2VydmljZSBXYWxrd2F5PC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBUaGUgdXBwZXIgd2Fsa3dheSBsb29rcyBwdWJsaWMgZW5vdWdoIHRvIGJlIGhhcm1sZXNzLCBidXQgZXZlcnkgcGxhbnRlciwgYmVuY2gsIGFuZCBraW9zayBoYXMgYmVlbiBwb3NpdGlvbmVkIGJ5IHBlb3BsZSB3aG8gaGF2ZSBsZWFybmVkIHRvIHdhdGNoIGV4aXRzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVXNlIHRoaXMgZm9yIHB1YmxpYyBhcHByb2FjaCwgd2F0Y2hlcnMsIGFuZCB2aXNpYmxlIHByZXNzdXJlIGZyb20gY29ycCBvciBSZWRsaW5lIG9ic2VydmVycy48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+U3RyZWV0d2lzZTo8L3N0cm9uZz4gSWRlbnRpZnkgd2hvIGlzIFJlZGxpbmUgQ2hvaXIsIHdobyBpcyBjbGluaWMtYWRqYWNlbnQsIGFuZCB3aG8gaXMganVzdCBzdXJ2aXZpbmcuPC9saT4KPGxpPjxzdHJvbmc+UGVyZm9ybWFuY2U6PC9zdHJvbmc+IFNwcmVhZCBhIGNhbG1pbmcgbWVzc2FnZSBvciBkcmF3IGF0dGVudGlvbiBhd2F5IGZyb20gZnJpZ2h0ZW5lZCBmYW1pbGllcy48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IFNwb3QgYSB3YXRjaGVyIHVzaW5nIGEgc3RvcmVmcm9udCByZWZsZWN0aW9uLjwvbGk+CjxsaT48c3Ryb25nPkdhbWJsZXIgLyBTb2NpYWwgcmVhZDo8L3N0cm9uZz4gTm90aWNlIHdobyBpcyBibHVmZmluZyBhYm91dCBiZWluZyB1bmludm9sdmVkLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhlIG5laWdoYm9yaG9vZCBpcyB3YXRjaGluZyB3aGF0IHRoZSBQQ3MgZG8uPC9saT4KPGxpPlBlb3BsZSBoZXJlIGZlYXIgYm90aCBjb3Jwb3JhdGUgZm9yY2UgYW5kIHVuY29udHJvbGxlZCBnYW5nIHZpb2xlbmNlLjwvbGk+CjwvdWw+CjxoMj5CMi4gUHJvY2VkdXJlIC8gRXh0ZW5kZWQtQ2FyZSBSb29tPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBUcmVhdG1lbnQgYmVkcyBhbmQgcHJvY2VkdXJlIGVxdWlwbWVudCBmaWxsIGEgcm9vbSB0aGF0IHdhcyBuZXZlciBtZWFudCB0byBiZSBjb21mb3J0aW5nLCBidXQgc29tZW9uZSBoYXMgYWRkZWQgYnJpZ2h0IGJsYW5rZXRzLCB0YXBlZC11cCBkcmF3aW5ncywgYW5kIGEgY3JhY2tlZCBzcGVha2VyIHBsYXlpbmcgcXVpZXQgbXVzaWMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBUaGlzIGlzIG5vdCBhIG5vcm1hbCB3YWl0aW5nIGFyZWEuIFVzZSBpdCBmb3IgYWN0aXZlIHRyZWF0bWVudCwgc2hvcnQgcHJvY2VkdXJlcywgc3RhYmlsaXphdGlvbiwgb3IgZXZpZGVuY2UgdGhhdCB0aGUgY2xpbmljIGlzIG92ZXJsb2FkZWQuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPk1lZGljaW5lOjwvc3Ryb25nPiBOb3RpY2UgcGF0aWVudHMgYXJlIGJlaW5nIHRyZWF0ZWQgZm9yIGlsbG5lc3MsIGN5YmVyd2FyZSBzdHJlc3MsIGh1bmdlciwgcGFuaWMsIGFuZCBpbmp1cmllcy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBGaW5kIGEgdHJlYXRtZW50IGdhcCB0aGF0IG1hdGNoZXMgdGhlIGNvdXJpZXLigJlzIGFycml2YWwgdGltZS48L2xpPgo8bGk+PHN0cm9uZz5FbXBhdGh5Ojwvc3Ryb25nPiBDYWxtIGEgcGF0aWVudCB3aG8gc2F3IHNvbWV0aGluZyBidXQgZG9lcyBub3Qga25vdyBob3cgdG8gZGVzY3JpYmUgaXQuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIFNlY3VyaXR5Ojwvc3Ryb25nPiBSZWNvZ25pemUgd2hpY2ggcGF0aWVudHMgd291bGQgYmUgdGFyZ2V0ZWQgb3IgZGVwcmlvcml0aXplZCBpbiBhIGZvcm1hbCByYWlkLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+TWVyY3kgVHdlbHZlIGlzIGhhbmRsaW5nIG1vcmUgdGhhbiBvcmRpbmFyeSBjbGluaWMgaW50YWtlLjwvbGk+CjxsaT5Tb21lIHBhdGllbnRzIGFyZSB0b28gdnVsbmVyYWJsZSB0byBtb3ZlIHF1aWNrbHkgaWYgZXZhY3VhdGlvbiBiZWdpbnMuPC9saT4KPC91bD4KPGgyPkIzLiBNZWRpY2FsIFJlY29yZHMgLyBNb25pdG9yaW5nIEVxdWlwbWVudDwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gU2VydmVyIHJhY2tzLCBtb25pdG9yaW5nIHBhbmVscywgYW5kIHN0YWNrZWQgZGlhZ25vc3RpYyBzdGF0aW9ucyBodW0gYmVoaW5kIGxvY2tlZCBwYW5lbHMuIEl0IGZlZWxzIGxlc3MgbGlrZSBhbiBvZmZpY2UgYW5kIG1vcmUgbGlrZSB0aGUgZmxvb3LigJlzIG5lcnZvdXMgc3lzdGVtLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVXNlIHRoaXMgZm9yIGRvb3IgbG9ncywgcGF0aWVudCBtb3ZlbWVudCByZWNvcmRzLCBjYW1lcmEgY29uc3RyYWludHMsIGFuZCBtZWRpY2FsLW1vbml0b3IgZGF0YS48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+TWVzaCBIYWNrZXI6PC9zdHJvbmc+IFB1bGwgcGFydGlhbCBsb2dzIHdpdGhvdXQgdHJpcHBpbmcgcHJpdmFjeSBsb2Nrcy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBDb3JyZWxhdGUgcGF0aWVudCBtb3ZlbWVudCwgc2VydmljZSBhY2Nlc3MsIGFuZCBtaXNzaW5nLXBlcnNvbiB0aW1pbmdzLjwvbGk+CjxsaT48c3Ryb25nPk1lZGljaW5lOjwvc3Ryb25nPiBSZWFkIG1vbml0b3IgdHJlbmRzIHRoYXQgc2hvdyBzb21ldGhpbmcgYmlvbG9naWNhbCBpcyB3cm9uZy48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IE5vdGljZSBvbmUgZmVlZCBoYXMgYmVlbiBkZWxpYmVyYXRlbHkgcm91dGVkIGFyb3VuZCBhIGJsaW5kIHNwb3QuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgZmxvb3Iga2VlcHMgYmV0dGVyIHJlY29yZHMgdGhhbiBpdCBhZG1pdHMuPC9saT4KPGxpPlNldmVyYWwgbWlzc2luZy1wZXJzb24gY2x1ZXMgcG9pbnQgdG93YXJkIHNlcnZpY2Ugcm91dGVzIGFuZCB2ZXJ0aWNhbCBhY2Nlc3MuPC9saT4KPC91bD4KPGgyPkI0LiBTdGFmZiBJbnRha2UgLyBJbnRlcnZpZXcgT2ZmaWNlPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBBIHNtYWxsIG9mZmljZSBoYXMgYmVlbiByZXB1cnBvc2VkIGFnYWluIGFuZCBhZ2FpbjogaW50YWtlIGZvcm1zLCBjb3Vuc2VsbGluZyBub3Rlcywgc3RhZmYgbXVncywgYWlkIGxlZGdlcnMsIGFuZCBhIGhhbGYtaGlkZGVuIGNvdCBhbGwgY29tcGV0ZSBmb3Igc3BhY2UuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBPbmUgb2YgdGhlIGJlc3QgcGxhY2VzIHRvIGRpc2NvdmVyIE1hcmHigJlzIGNvdmVydCBzdXBwb3J0IHdpdGhvdXQgbWFraW5nIHRoZSB3aG9sZSBtYXAgbG9vayBsaWtlIGEgZm9vZCBwYW50cnkuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb246PC9zdHJvbmc+IEZpbmQgZGVsaXZlcnkgb3IgcGF5bWVudCBub3RlcyByb3V0ZWQgdGhyb3VnaCBSZWRsaW5lIENob2lyIGN1dG91dHMuPC9saT4KPGxpPjxzdHJvbmc+U3RyZWV0d2lzZTo8L3N0cm9uZz4gUmVjb2duaXplIHNtdWdnbGluZyBtYXJrcyB1c2VkIGZvciBmb29kIGFuZCBtZWRpY2luZSByYXRoZXIgdGhhbiB3ZWFwb25zLjwvbGk+CjxsaT48c3Ryb25nPlBlcnN1YXNpb246PC9zdHJvbmc+IEVhcm4gZW5vdWdoIHRydXN0IHRvIHNlZSBzZW5zaXRpdmUgc3VwcG9ydCByZWNvcmRzLjwvbGk+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBTZWN1cml0eTo8L3N0cm9uZz4gS25vdyB3aGljaCByZWNvcmRzIHdvdWxkIGJlIHRhcmdldGVkIGluIGEgcmFpZC48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPk1hcmEgZnVuZHMgZm9vZCwgbWVkaWNpbmUsIHN0YWZmIHN1cHBvcnQsIG9yIHJlY292ZXJ5IGNhcGFjaXR5LjwvbGk+CjxsaT5UaGUgYWlkIHByb2dyYW0gY291bGQgYmUgc2h1dCBkb3duIGlmIHB1YmxpY2x5IGV4cG9zZWQgb3Igc2VpemVkLjwvbGk+CjwvdWw+CjxoMj5CNS4gVlRPTCAvIEVtZXJnZW5jeSBMYW5kaW5nIFBhZDwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gVGhlIGxhbmRpbmcgcGFkIGlzIGNsZWFuLCBicmlnaHQsIGFuZCB0b28gZXhwb3NlZC4gV2hvZXZlciBhcnJpdmVzIGhlcmUgZG9lcyBub3QgaW50ZW5kIHRvIGJsZW5kIGluLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVXNlIGZvciBlbWVyZ2VuY3kgZXh0cmFjdGlvbiwgY29ycG9yYXRlIGFycml2YWwsIE5pZ2h0Q3Jhc2ggaW50ZXJ2ZW50aW9uLCBvciBhIHZpc2libGUgZXNjYWxhdGlvbiBiZWF0LjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5QaWxvdGluZzo8L3N0cm9uZz4gSnVkZ2Ugd2hldGhlciBhbiBlbWVyZ2VuY3kgbGFuZGluZyBvciBldmFjdWF0aW9uIGlzIGZlYXNpYmxlLjwvbGk+CjxsaT48c3Ryb25nPlRhY3RpY3M6PC9zdHJvbmc+IFByZWRpY3Qgd2hlcmUgYXJtZWQgcmVzcG9uZGVycyB3b3VsZCBlbnRlci48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IFNwb3QgYSBkcm9uZSBvciBjcmFmdCBiZWZvcmUgaXQgbGFuZHMuPC9saT4KPGxpPjxzdHJvbmc+Qm91bnR5IEh1bnRlcjo8L3N0cm9uZz4gSWRlbnRpZnkgYSBwcm9mZXNzaW9uYWwgZW50cnkgcGF0dGVybi48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoaXMgaXMgdGhlIGZsb29y4oCZcyBmYXN0ZXN0IGV4dGVybmFsIGFjY2VzcyBwb2ludC48L2xpPgo8bGk+SXQgY2FuIHNhdmUgbGl2ZXMgb3IgYnJpbmcgZGFuZ2VyIHN0cmFpZ2h0IGludG8gdGhlIHdhcmQuPC9saT4KPC91bD4KPGgyPkI2LiBDZW50cmFsIFN1cHBvcnQgQ29ycmlkb3I8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFRoZSBjZW50cmFsIGNvcnJpZG9yIGNhcnJpZXMgZXZlcnl0aGluZzogY2FydHMsIHN0cmV0Y2hlcnMsIHdvcnJpZWQgZmFtaWxpZXMsIHN0YWZmIHdpdGggbm8gdGltZSB0byBleHBsYWluLCBhbmQgcGVvcGxlIHdobyBjbGVhcmx5IGtub3cgd2hpY2ggZG9vcnMgbm90IHRvIG9wZW4uPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBUaGlzIHJlcGxhY2VzIHRoZSBvbGQg4oCcY29tbXVuaXR5IGNvbW1vbnPigJ0gZnVuY3Rpb24uIEl0IGlzIHRoZSBmbG9vcuKAmXMgYWN0aXZlIHNvY2lhbCBhbmQgbW92ZW1lbnQgc3BhY2UuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkxlYWRlcnNoaXAgLyBUYWN0aWNzOjwvc3Ryb25nPiBTZXQgdXAgZXZhY3VhdGlvbiBsYW5lcyBhbmQgY3Jvd2QgY29udHJvbC48L2xpPgo8bGk+PHN0cm9uZz5FbXBhdGh5Ojwvc3Ryb25nPiBSZWNvZ25pemUgd2hvIGlzIHNjYXJlZCBvZiB0aGUgZ2FuZyBhbmQgd2hvIHRydXN0cyB0aGVtLjwvbGk+CjxsaT48c3Ryb25nPkJvdW50eSBIdW50ZXIgLyBUcmFja2luZzo8L3N0cm9uZz4gRm9sbG93IGNvdXJpZXIgb3IgZ2FuZyBtb3ZlbWVudCB0cmFjZXMuPC9saT4KPGxpPjxzdHJvbmc+UGVyZm9ybWFuY2U6PC9zdHJvbmc+IENhbG0gYSBjb3JyaWRvciBmdWxsIG9mIHNjYXJlZCBwZW9wbGUuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgZmxvb3IgaXMgbm90IHBhc3NpdmUuIFBlb3BsZSBtYXkgaGVscCBpZiBhc2tlZCByZXNwZWN0ZnVsbHkgYW5kIGdpdmVuIHNwZWNpZmljIHRhc2tzLjwvbGk+CjxsaT5SZWRsaW5lIGFpZCBtb3ZlbWVudCBhbmQgY2xpbmljIGV2YWN1YXRpb24gcm91dGVzIG92ZXJsYXAgaGVyZS48L2xpPgo8L3VsPgo8aDI+QjcuIFNob3J0LVN0YXkgUmVjb3ZlcnkgLyBDb3Vuc2VsbGluZyBSb29tczwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gUGluay1saXQgcmVjb3Zlcnkgcm9vbXMgbGluZSB0aGUgaGFsbC4gU29tZSBob2xkIHBhdGllbnRzLCBzb21lIGhvbGQgZmFtaWxpZXMsIGFuZCBzb21lIGFyZSBjbGVhcmx5IHVzZWQgZm9yIGNvbnZlcnNhdGlvbnMgbm9ib2R5IHdhbnRzIG92ZXJoZWFyZC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFVzZSB0aGVzZSByb29tcyBmb3Igc2hvcnQtc3RheSByZWNvdmVyeSwgY291bnNlbGxpbmcsIGNoaWxkL2ZhbWlseSBzdXBwb3J0LCBhbmQgaHVtYW4tc3Rha2VzIHNjZW5lcy4gVGhpcyBpcyBhIGJldHRlciBtYXRjaCBmb3IgdGhlIHZpc2libGUgcm9vbXMgdGhhbiBhIGxpdGVyYWwgZGF5Y2FyZS48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+RW1wYXRoeTo8L3N0cm9uZz4gTGVhcm4gd2hhdCBhIGNoaWxkIG9yIHBhdGllbnQgc2F3IHdpdGhvdXQgZnJpZ2h0ZW5pbmcgdGhlbS48L2xpPgo8bGk+PHN0cm9uZz5Qc3ljaG9sb2d5Ojwvc3Ryb25nPiBVbmRlcnN0YW5kIEJsdWV3aXJl4oCZcyBiZWhhdmlvciBmcm9tIHByaW9yIGluY2lkZW50IG5vdGVzLjwvbGk+CjxsaT48c3Ryb25nPlBlcmZvcm1hbmNlOjwvc3Ryb25nPiBEaXN0cmFjdCBmcmlnaHRlbmVkIGZhbWlsaWVzIGR1cmluZyBldmFjdWF0aW9uLjwvbGk+CjxsaT48c3Ryb25nPlJlbGlnaW91cyAvIENvbWZvcnQ6PC9zdHJvbmc+IEhlbHAgYSBmcmlnaHRlbmVkIGZhbWlseSB3aXRob3V0IHByZWFjaGluZyBhdCB0aGVtLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+Q2hpbGRyZW4gb3IgcGF0aWVudHMgbWF5IGNhbGwgTWFyYSDigJxBdW50aWUgUmVk4oCdIGlmIHRoZXkgdHJ1c3QgdGhlIFBDcy48L2xpPgo8bGk+VGhleSBub3RpY2VkIEJsdWV3aXJlIHdhcyDigJxzaWNrLW1hZOKAnSBiZWZvcmUgYWR1bHRzIGFjdGVkLjwvbGk+CjxsaT5Tb21lIHJlY292ZXJ5IHJvb21zIGhpZGUgcGVvcGxlIHdobyBkbyBub3QgdHJ1c3Qgb2ZmaWNpYWwgc3lzdGVtcy48L2xpPgo8L3VsPgo8aDI+QjguIFF1YXJhbnRpbmUgLyBTZWFsZWQgSXNvbGF0aW9uIFBvZHM8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFRoZSBzZWFsZWQgcG9kcyBhcmUgdG9vIGNsZWFuIGFuZCB0b28gYnJpZ2h0LiBXYXJuaW5nIG1hcmtzIGFuZCBmaWx0ZXJlZCB2ZW50cyBtYWtlIHRoZSByb29tIGZlZWwgbGlrZSBpdCB3YXMgZGVzaWduZWQgZm9yIHByb2JsZW1zIG5vYm9keSB3YW50ZWQgdG8gbmFtZS48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFRoaXMgcmVwbGFjZXMgdGhlIG9sZCBzaGVsdGVyLWRvcm0gaW50ZXJwcmV0YXRpb24uIFVzZSBpdCBmb3IgaXNvbGF0aW9uLCBjb250YW1pbmF0aW9uIGZlYXJzLCBjeWJlcndhcmUgY29tcGxpY2F0aW9ucywgYW5kIEFudGl0aGVzaXMgZm9yZXNoYWRvd2luZy48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+TWVkaWNpbmU6PC9zdHJvbmc+IElkZW50aWZ5IHdobyBjYW4gYW5kIGNhbm5vdCBiZSBtb3ZlZCBzYWZlbHkuPC9saT4KPGxpPjxzdHJvbmc+SW52ZXN0aWdhdGlvbjo8L3N0cm9uZz4gRmluZCBhIHJlY29yZCBtaXNtYXRjaCwgYWJhbmRvbmVkIGJhZywgb3Igc2VhbGVkLXJvb20gYW5vbWFseS48L2xpPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlOjwvc3Ryb25nPiBTcG90IHdoaWNoIHBhdGllbnQgbmFtZXMgYXJlIGJlaW5nIGtlcHQgb2ZmIG9mZmljaWFsIGxvZ3MuPC9saT4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBOb3RpY2UgYSBwb2QgaGFzIGJlZW4gb3BlbmVkIGZyb20gdGhlIHdyb25nIHNpZGUuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5Tb21lb25lIHZ1bG5lcmFibGUgbWF5IGhhdmUgZGlzYXBwZWFyZWQgZnJvbSB0aGlzIGFyZWEuPC9saT4KPGxpPlRoZSBzZWFsZWQgcG9kcyBwb2ludCB0b3dhcmQgYSB0aHJlYXQgZGVlcGVyIHRoYW4gZ2FuZyB2aW9sZW5jZS48L2xpPgo8L3VsPgo8aDI+QjkuIEVsZXZhdG9yIC8gTGlmdCBDb3JlPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBUaGUgbGlmdCBkb29ycyBhcmUgc2N1ZmZlZCBieSBjYXJ0cywgYmVkcywgYW5kIGNyYXRlcy4gU29tZW9uZSBoYXMgdGFwZWQgYSBjaGlsZOKAmXMgZHJhd2luZyBhYm92ZSB0aGUgY2FsbCBwYW5lbC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IEFjY2Vzc2libGUgdmVydGljYWwgdHJhdmVsLiBBbHNvIGEgcGFuaWMgYm90dGxlbmVjay48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+TG9naXN0aWNzIC8gUGlsb3Rpbmc6PC9zdHJvbmc+IFBsYW4gZXZhY3VhdGlvbiB0aW1pbmcuPC9saT4KPGxpPjxzdHJvbmc+TWVzaCBIYWNrZXI6PC9zdHJvbmc+IFByZXZlbnQgaG9zdGlsZSBmbG9vciBsb2Nrb3V0LjwvbGk+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IEtlZXAgdGhlIGxpZnQgc3RhYmxlIHVuZGVyIG92ZXJsb2FkLjwvbGk+CjxsaT48c3Ryb25nPlBlcmZvcm1hbmNlOjwvc3Ryb25nPiBNYW5hZ2UgdGhlIGNyb3dkIHdhaXRpbmcgZm9yIHRoZSBsaWZ0LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhpcyBpcyB0aGUgb25seSBnb29kIHJvdXRlIGZvciBwYXRpZW50cyB3aXRoIG1vYmlsaXR5IGlzc3Vlcy48L2xpPgo8bGk+SWYgdGhlIGxpZnQgZmFpbHMsIHRoZSB3YXJkIGJlY29tZXMgbXVjaCBoYXJkZXIgdG8gZXZhY3VhdGUuPC9saT4KPC91bD4KPGgyPkIxMC4gU3RhaXJ3ZWxsIC8gVmVydGljYWwgQWNjZXNzPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBUaGUgc3RhaXJ3ZWxsIGlzIG5hcnJvdywgc3RlZXAsIGFuZCBwcmFjdGljYWwgcmF0aGVyIHRoYW4gd2VsY29taW5nLiBFbWVyZ2VuY3kgc3RyaXBzIGdsb3cgYWxvbmcgbWV0YWwgZWRnZXMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBHb29kIGZvciBQQ3MgYW5kIHNtYWxsIGdyb3Vwcy4gQmFkIGZvciBwYW5pYyBldmFjdWF0aW9uLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5QYXJrb3VyIC8gQXRobGV0aWNzOjwvc3Ryb25nPiBNb3ZlIHF1aWNrbHkgdW5kZXIgcHJlc3N1cmUuPC9saT4KPGxpPjxzdHJvbmc+VGFjdGljczo8L3N0cm9uZz4gVXNlIGl0IGFzIGEgY2hva2UgcG9pbnQuPC9saT4KPGxpPjxzdHJvbmc+R3V0dGVyIFJhdDo8L3N0cm9uZz4gS25vdyB3aGljaCBsYW5kaW5nIGJ5cGFzc2VzIHRoZSBtb25pdG9yZWQgaGFsbHdheS48L2xpPgo8bGk+PHN0cm9uZz5NZWxlZSBDb21iYXQ6PC9zdHJvbmc+IFJlY29nbml6ZSBob3cgZGFuZ2Vyb3VzIGEgZmlnaHQgaGVyZSB3b3VsZCBiZS48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoaXMgcm91dGUgY2FuIHNhdmUgdGhlIFBDcyBpZiBlbGV2YXRvcnMgYXJlIGxvY2tlZC48L2xpPgo8bGk+SXQgY2Fubm90IHJlcGxhY2UgdGhlIGVsZXZhdG9yIGZvciBtYXNzIGV2YWN1YXRpb24uPC9saT4KPGxpPlNlcnZpY2Utcm91dGUgdHJhY2VzIG1heSBwb2ludCB0b3dhcmQgTWFwIEMuPC9saT4KPC91bD4KPGgyPkIxMS4gTG93ZXIgRXh0ZXJpb3IgLyBTZXJ2aWNlIEFjY2VzczwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gVGhlIGxvd2VyIGVkZ2Ugb2YgdGhlIGZsb29yIG9wZW5zIHRvd2FyZCBzZXJ2aWNlIGFjY2VzcyBhbmQgZXh0ZXJpb3IgbW92ZW1lbnQuIEl0IGZlZWxzIHB1YmxpYyBvbmx5IHVudGlsIHNvbWVvbmUgYmxvY2tzIHRoZSB3YXkuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBVc2UgYXMgdGhlIGZsb29y4oCZcyBzZWNvbmRhcnkgYXBwcm9hY2gsIGV2YWN1YXRpb24gZWRnZSwgb3IgcXVpZXQgZXhpdC48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBTcG90IHNvbWVvbmUgc2hhZG93aW5nIHRoZSBmbG9vciBmcm9tIG91dHNpZGUuPC9saT4KPGxpPjxzdHJvbmc+U3RlYWx0aDo8L3N0cm9uZz4gU2xpcCBvdXQgd2l0aG91dCB1c2luZyB0aGUgbGlmdC48L2xpPgo8bGk+PHN0cm9uZz5UYWN0aWNzOjwvc3Ryb25nPiBTZWN1cmUgYSBmYWxsYmFjayByb3V0ZS48L2xpPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlOjwvc3Ryb25nPiBSZWNvZ25pemUgd2hpY2ggcm91dGUgUmVkbGluZSB3b3VsZCB1c2UgZm9yIHF1aWV0IG1vdmVtZW50LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhpcyBjYW4gYmVjb21lIGFuIGV2YWN1YXRpb24gYnlwYXNzIG9yIGEgdHJhcC48L2xpPgo8bGk+Q29ycG9yYXRlIG9yIFJlZGxpbmUgcHJlc3N1cmUgY2FuIGFwcGVhciBoZXJlIHdpdGhvdXQgY3Jvc3NpbmcgdGhlIHdob2xlIHdhcmQuPC9saT4KPC91bD4KPGgyPkIxMi4gU3RhZmYgUmVzdCAvIE92ZXJuaWdodCBTdXBwb3J0IFJvb208L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFRoaXMgcm9vbSBpcyBwYXJ0IGxvdW5nZSwgcGFydCBjcmFzaCBzcGFjZSwgcGFydCByZWZ1Z2UuIFRoZSBmdXJuaXR1cmUgaXMgbWlzbWF0Y2hlZCwgdGhlIGJsYW5rZXRzIGFyZSBmb2xkZWQgd2l0aCBtaWxpdGFyeSBuZWF0bmVzcywgYW5kIG5vYm9keSBoYXMgaGFkIGVub3VnaCBzbGVlcC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFVzZSB0aGlzIGFzIHN0YWZmIHJlc3QsIGVtZXJnZW5jeSBzaGVsdGVyIG92ZXJmbG93LCBvciBhIHBsYWNlIHdoZXJlIGEgdnVsbmVyYWJsZSBOUEMgbGVmdCBzb21ldGhpbmcgYmVoaW5kLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5NZWRpY2luZTo8L3N0cm9uZz4gSWRlbnRpZnkgd2hvIGhhcyBiZWVuIHNsZWVwaW5nIGluIHNoaWZ0cyB0byBrZWVwIHRoZSBmbG9vciBydW5uaW5nLjwvbGk+CjxsaT48c3Ryb25nPkVtcGF0aHk6PC9zdHJvbmc+IEdldCBhbiBleGhhdXN0ZWQgdm9sdW50ZWVyIHRvIGFkbWl0IHdoYXQgdGhleSBzYXcuPC9saT4KPGxpPjxzdHJvbmc+SW52ZXN0aWdhdGlvbjo8L3N0cm9uZz4gRmluZCBOYXJpbuKAmXMgYmFnLCBhbiBvZGQgc21lYXIsIG9yIGEgbm90ZSB0aGF0IHNob3VsZCBub3QgYmUgaGVyZS48L2xpPgo8bGk+PHN0cm9uZz5TY2F2ZW5nZXI6PC9zdHJvbmc+IEZpbmQgaW1wcm92aXNlZCBzdXBwbGllcyB1c2VmdWwgZm9yIGV2YWN1YXRpb24uPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgc3VwcG9ydCB3YXJkIHJ1bnMgb24gZXhoYXVzdGlvbiBhbmQgZmF2b3JzLjwvbGk+CjxsaT5OYXJpbiBQZWxsIG9yIGFub3RoZXIgbWlzc2luZy1wZXJzb24gY2x1ZSBjYW4gYmUgdGllZCBoZXJlLjwvbGk+CjwvdWw+CjxoMj5VcGRhdGVkIG1pc3NpbmctcGVyc29uIGNsdWVzIGZvciBNYXAgQjwvaDI+CjxwPlVzZSBNYXAgQiB0byBtYWtlIHRoZSBtaXNzaW5nIHBlb3BsZSBtYXR0ZXIuPC9wPgo8aDM+QjQgU3RhZmYgSW50YWtlIC8gSW50ZXJ2aWV3IE9mZmljZTwvaDM+Cjx1bD4KPGxpPkxhbGEgTWlyIHVzZWQgdG8gY29vcmRpbmF0ZSBhaWQgYW5kIHJlY292ZXJ5IHN1cHBvcnQgdGhyb3VnaCBoZXJlLjwvbGk+CjxsaT5IZXIgYWJzZW5jZSBpcyBpbW1lZGlhdGVseSBub3RpY2VkIGJ5IHZvbHVudGVlcnMgYW5kIHBhdGllbnRzLjwvbGk+CjxsaT5TdHJlZXR3aXNlIG9yIEludmVzdGlnYXRpb24gcmV2ZWFscyB0aGF0IGhlciBsYXN0IHJvdXRlIHVzZWQgYSBzZXJ2aWNlL3ZlcnRpY2FsLWFjY2VzcyBwYXRoLjwvbGk+CjxsaT5UaGUgc3VwcGxpZXMgc2hlIGhhbmRsZWQgd2VyZSBmb29kIGFuZCBtZWRpY2FsIHN1cHBvcnQsIG5vdCB3ZWFwb25zLiBUaGlzIHN1cHBvcnRzIHRoZSBNYXJhL0F1bnRpZSBSZWQgcmV2ZWFsLjwvbGk+CjwvdWw+CjxoMz5CNyBTaG9ydC1TdGF5IFJlY292ZXJ5IC8gQ291bnNlbGxpbmcgUm9vbXM8L2gzPgo8cD5BZGQgPHN0cm9uZz5NaXJpIGFuZCBTb2w8L3N0cm9uZz4gaGVyZSBpZiB5b3Ugc3RpbGwgd2FudCBjaGlsZHJlbi9mYW1pbHkgd2l0bmVzc2VzIG9uIHRoaXMgZmxvb3IuIFRoZXkgY2FuIHJldmVhbDo8L3A+Cjx1bD4KPGxpPuKAnEF1bnRpZSBSZWTigJ0gZnVuZHMgYnJlYWtmYXN0LCBtZWRpY2luZSwgb3IgcmVjb3ZlcnkgYmVkcy48L2xpPgo8bGk+QWR1bHRzIGF2b2lkIHNheWluZyB0aGF0IG5hbWUgYmVjYXVzZSBNYXJhIGRpc2xpa2VzIGxvb2tpbmcgc29mdC48L2xpPgo8bGk+TGFsYSBNaXIgZGlzYXBwZWFyZWQgYWZ0ZXIgYnJpbmdpbmcgc3VwcGxpZXMuPC9saT4KPGxpPlRoZXkgaGVhcmQg4oCcZG9nIGZlZXTigJ0gb3Ig4oCcdGhlIHdhbGwgZG9n4oCdIG5lYXIgYSBzZXJ2aWNlIHJvdXRlLjwvbGk+CjwvdWw+CjxoMz5COCBRdWFyYW50aW5lIC8gU2VhbGVkIElzb2xhdGlvbiBQb2RzPC9oMz4KPHVsPgo8bGk+QSBwYXRpZW50IHJlY29yZCwgYmFnLCBvciBjb3QgYXNzaWdubWVudCBkb2VzIG5vdCBtYXRjaCB0aGUgY3VycmVudCBvY2N1cGFudHMuPC9saT4KPGxpPlNpc3RlciBMdW1hIGluc2lzdHMgTmFyaW4gd291bGQgbm90IGhhdmUgbGVmdCB3aXRob3V0IHRlbGxpbmcgc29tZW9uZS48L2xpPgo8bGk+QSBzZWFyY2ggZmluZHMgYW4gb3JnYW5pYyBzbWVhciwgYWNpZC1zY29yZWQgZmFzdGVuZXIsIG9yIHRvcm4gY2xvdGggbmVhciBhIHJvdXRlIHRvd2FyZCBCMTAvQjEyLjwvbGk+CjxsaT5UaGlzIGlzIGEgcG9zc2libGUgcmVzY3VlIHRpbWVyOiBpZiBQQ3MgYWN0IHF1aWNrbHksIE5hcmluIG1heSBzdGlsbCBiZSBhbGl2ZSBuZWFyIHRoZSBoaWRkZW4gbmVzdC48L2xpPgo8L3VsPgo8aDM+QjEwIFN0YWlyd2VsbCAvIFZlcnRpY2FsIEFjY2VzczwvaDM+Cjx1bD4KPGxpPlNjdWZmZWQgc3RlcHMsIHRvcm4gZm9vZCBwYWNrZXRzLCBvciBkcmFnIHNpZ25zLjwvbGk+CjxsaT5BIHNlcnZpY2UgaGF0Y2ggd2l0aCBhY2lkLXNjb3JlZCBzY3Jld3MuPC9saT4KPGxpPlJlZGxpbmUgbWFya3Mgc2hvd2luZyB0aGlzIGlzIGFuIGFpZCByb3V0ZSwgbm90IGp1c3QgYSBnYW5nIHJvdXRlLjwvbGk+CjxsaT5UcmFja2luZyBjYW4gZm9sbG93IHNpZ25zIHRvd2FyZCBNYXAgQy48L2xpPgo8L3VsPgo8aDM+QjEyIFN0YWZmIFJlc3QgLyBPdmVybmlnaHQgU3VwcG9ydCBSb29tPC9oMz4KPHVsPgo8bGk+TmFyaW7igJlzIGJhZywgYW4gdW5maW5pc2hlZCBtZXNzYWdlLCBvciBhIHZvbHVudGVlcuKAmXMgcmVwb3J0LjwvbGk+CjxsaT5BIG11ZmZsZWQgc2NyZWFtIHdhcyBoZWFyZCBlYXJsaWVyIGJ1dCBkaXNtaXNzZWQgYXMgYSBmaWdodCBvciBwYXRpZW50IGRpc3RyZXNzLjwvbGk+CjxsaT5NZWRpY2luZSBjYW4gaWRlbnRpZnkgYSBiaW9sb2dpY2FsIHRyYWNlIGFzIG5vdCBvcmRpbmFyeSBibG9vZC48L2xpPgo8L3VsPg=="
  },
  {
    "name": "Signal Bleed - Map C Service Utility Key",
    "source_file": "handouts/16_Map_C_Service_Utility_Key.md",
    "notes_b64": "PGgxPk1hcCBDIOKAlCBTZXJ2aWNlIC8gVXRpbGl0eSBLZXk8L2gxPgo8cD5Vc2UgdGhpcyBhcyB0aGUgc2VydmljZS1yb3V0ZSwgaW5mcmFzdHJ1Y3R1cmUsIGFuZCBtaXNzaW5nLXBlcnNvbiBjbHVlIGZsb29yLjwvcD4KPHA+TWFwIEMgc2hvdWxkIG5vdCBiZSB0aGUgZGVmYXVsdCBsb2NhdGlvbiBvZiB0aGUgY3VycmVudCBhY3RpdmUgaGlkZGVuIG5lc3QuIFRoZSBjdXJyZW50IGhpZGRlbiBuZXN0IGlzIG5vdyBvbiA8c3Ryb25nPkZsb29yIEQ8L3N0cm9uZz4uIE1hcCBDIGluc3RlYWQgc2hvd3MgaG93IHRoZSBhY3RpdmUgdGhyZWF0IG1vdmVzIHRocm91Z2ggdGhlIG1lZ2Fjb21wbGV4OiBzZXJ2aWNlIGFjY2VzcywgSFZBQywgbW9uaXRvcmluZyByb29tcywgZnJlaWdodCByb3V0ZXMsIGFuZCBtYWludGVuYW5jZSBjb3JyaWRvcnMuPC9wPgo8aDI+SG93IHRvIHVzZSB0aGVzZSBjaGVja3M8L2gyPgo8cD5UaGVzZSBhcmUgcHJvbXB0cywgbm90IGEgZml4ZWQgbWVudS4gSWYgYSBwbGF5ZXIgZGVzY3JpYmVzIGEgc2Vuc2libGUgYXBwcm9hY2gsIHVzZSB0aGUgY2xvc2VzdCBza2lsbCBvciBCYWNrZ3JvdW5kIGxvZ2ljLjwvcD4KPHA+UmVjb21tZW5kZWQgY2x1ZSBoYW5kbGluZzo8L3A+Cjx1bD4KPGxpPjxzdHJvbmc+Tm8gcm9sbCAvIGJhc2ljIGludGVyYWN0aW9uOjwvc3Ryb25nPiBnaXZlIHRoZSBvYnZpb3VzIGNsdWUuPC9saT4KPGxpPjxzdHJvbmc+U3VjY2Vzczo8L3N0cm9uZz4gZ2l2ZSB1c2VmdWwgZGV0YWlsLCBsZXZlcmFnZSwgb3IgYSBzYWZlciByb3V0ZS48L2xpPgo8bGk+PHN0cm9uZz5IaWdoIHN1Y2Nlc3M6PC9zdHJvbmc+IGdpdmUgYSBzaG9ydGN1dCwgZnV0dXJlIGFkdmFudGFnZSwgb3IgYSB3YXkgdG8gcmVkdWNlIGRhbmdlci48L2xpPgo8bGk+PHN0cm9uZz5GYWlsdXJlOjwvc3Ryb25nPiBkbyBub3Qgc3RhbGwgdGhlIHNjZW5hcmlvOyBnaXZlIHRoZSBjbHVlIHdpdGggbGVzcyBkZXRhaWwsIGV4dHJhIHRpbWUgY29zdCwgbm9pc2UsIG9yIGNvbXBsaWNhdGlvbi48L2xpPgo8L3VsPgo8aDI+V2hhdCB0aGlzIGZsb29yIGRvZXM8L2gyPgo8cD5GbG9vciBDIGNvbm5lY3RzIHRoZSBwdWJsaWMgY3Jpc2lzIHRvIHRoZSBoaWRkZW4gdGhyZWF0LjwvcD4KPHA+VXNlIGl0IGZvcjo8L3A+Cjx1bD4KPGxpPm1haW50ZW5hbmNlIGFjY2Vzcyw8L2xpPgo8bGk+UmVkbGluZSByb3V0ZXMsPC9saT4KPGxpPmNhbWVyYSBnYXBzLDwvbGk+CjxsaT5taXNzaW5nLXBlcnNvbiB0cmFpbHMsPC9saT4KPGxpPk9za2FyIFZlbm7igJlzIGRpc2FwcGVhcmFuY2UsPC9saT4KPGxpPkJleCBBcmFuZGEgZm9vdGFnZSw8L2xpPgo8bGk+Y29ycG9yYXRlIGZlZWQgdGFtcGVyaW5nLDwvbGk+CjxsaT5hbmQgc2lnbnMgdGhhdCBzb21ldGhpbmcgaXMgbW92aW5nIHRvd2FyZCBvciBmcm9tIEZsb29yIEQuPC9saT4KPC91bD4KPHA+Rmxvb3IgQyBzaG91bGQgcG9pbnQgdGhlIHBsYXllcnMgdG93YXJkIEZsb29yIEQsIG5vdCBlbmQgdGhlIG15c3RlcnkuPC9wPgo8aDI+QzEuIFNlcnZpY2UgU3RyZWV0IC8gSW5kdXN0cmlhbCBBcHByb2FjaDwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gQSBzZXJ2aWNlIHN0cmVldCBydW5zIGJldHdlZW4gbG9hZGluZyBzaHV0dGVycywgbWFpbnRlbmFuY2UgYWxjb3ZlcywgYW5kIGJhY2stb2YtaG91c2UgZG9vcnMuIEl0IGlzIGJ1aWx0IGZvciBkZWxpdmVyaWVzLCBub3QgY29tZm9ydC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IEdvb2QgZm9yIFJlZGxpbmUgbG9va291dHMsIGNvcnBvcmF0ZSBsb2dpc3RpY3MsIGFuZCBldmlkZW5jZSB0aGF0IHNlcnZpY2Ugcm91dGVzIGFyZSBsZXNzIGNvbnRyb2xsZWQgdGhhbiBwdWJsaWMgY2xpbmljIGFyZWFzLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlIC8gR3V0dGVyIFJhdDo8L3N0cm9uZz4gSWRlbnRpZnkgd2hpY2ggcm91dGVzIGxvY2FscyBhY3R1YWxseSB1c2UuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIFNlY3VyaXR5Ojwvc3Ryb25nPiBSZWNvZ25pemUgd2hpY2ggY2FtZXJhcyBzaG91bGQgYmUgcHJlc2VudCBidXQgYXJlIG1pc3NpbmcuPC9saT4KPGxpPjxzdHJvbmc+U3RlYWx0aDo8L3N0cm9uZz4gTW92ZSB3aXRob3V0IGJlaW5nIHNlZW4gYnkgcHVibGljIG9yIGNvcnBvcmF0ZSBvYnNlcnZlcnMuPC9saT4KPGxpPjxzdHJvbmc+SW52ZXN0aWdhdGlvbjo8L3N0cm9uZz4gRmluZCBzaWducyB0aGF0IHNvbWVvbmUgd2FzIGRyYWdnZWQgb3IgY2FycmllZCBhd2F5LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+U2VydmljZSBtb3ZlbWVudCBjYW4gYnlwYXNzIG9mZmljaWFsIGVudHJhbmNlcy48L2xpPgo8bGk+UmVkbGluZSBhbmQgY2xpbmljIHZvbHVudGVlcnMgYm90aCBrbm93IHBhcnRzIG9mIHRoaXMgcm91dGUuPC9saT4KPGxpPkZvb3RhZ2Ugb3Igd2l0bmVzc2VzIG1heSBjb25uZWN0IEJleCBBcmFuZGEgdG8gdGhpcyBhcHByb2FjaC48L2xpPgo8L3VsPgo8aDI+QzIuIExvYWRpbmcgWm9uZTwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gUGFsbGV0IG1hcmtzLCBzY3VmZmVkIGZsb29yIHBhaW50LCBhbmQgb2xkIGxpZnQgZXF1aXBtZW50IHNob3cgd2hlcmUgc3VwcGxpZXMgbW92ZSB0aHJvdWdoIHRoZSBjb21wbGV4LjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVXNlIGZvciBmb29kIGNyYXRlcywgbWVkaWNhbCBzdXBwbGllcywgbWlzc2luZyBtYW5pZmVzdHMsIGFuZCBmYWxzZSBjb3Jwb3JhdGUgY2FyZ28gbGFiZWxzLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5Mb2dpc3RpY3MgLyBTY2F2ZW5nZXI6PC9zdHJvbmc+IElkZW50aWZ5IHdoYXQgd2FzIHJlY2VudGx5IG1vdmVkLjwvbGk+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb246PC9zdHJvbmc+IFNwb3QgbWlzc2luZyBjcmF0ZXMgb3IgZmFsc2lmaWVkIGxhYmVscy48L2xpPgo8bGk+PHN0cm9uZz5BdGhsZXRpY3M6PC9zdHJvbmc+IE1vdmUgY2FyZ28gdG8gYmxvY2sgcHVyc3VpdCBvciBvcGVuIGEgcm91dGUuPC9saT4KPGxpPjxzdHJvbmc+U3RyZWV0d2lzZTo8L3N0cm9uZz4gS25vdyB3aGF0IG5vcm1hbCBsb2NhbCBkZWxpdmVyaWVzIHNob3VsZCBsb29rIGxpa2UuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5Tb21lIHN1cHBsaWVzIGFyZSByb3V0ZWQgdGhyb3VnaCBNYXJh4oCZcyBoaWRkZW4gYWlkIG5ldHdvcmsuPC9saT4KPGxpPlNvbWUgY29ycG9yYXRlIHNoaXBtZW50cyB3ZXJlIGRpc2d1aXNlZCBhcyBtZWRpY2FsIGxvZ2lzdGljcy48L2xpPgo8L3VsPgo8aDI+QzMuIFV0aWxpdHkgQ29ycmlkb3I8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFBpcGVzIGFuZCBjYWJsZSB0cmF5cyBydW4gYWxvbmcgdGhlIHdhbGxzLiBIZWF0IGJsZWVkcyB0aHJvdWdoIGZyb20gaGlkZGVuIHN5c3RlbXMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBHb29kIGZvciBsb3ctbGV2ZWwgZHJlYWQgYW5kIGRpcmVjdGlvbmFsIGNsdWVzLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IEhlYXIgY2xpY2tpbmcsIHNjcmFwaW5nLCBvciBkaXN0YW50IG1vdmVtZW50LjwvbGk+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IElkZW50aWZ5IHdoaWNoIHN5c3RlbXMgbGVhZCB0b3dhcmQgRmxvb3IgRC48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBGb2xsb3cgcmVzaWR1ZSwgZHJhZyBtYXJrcywgb3IgYWlyLWZsb3cgYW5vbWFsaWVzLjwvbGk+CjxsaT48c3Ryb25nPlN0ZWFsdGg6PC9zdHJvbmc+IE1vdmUgcXVpZXRseSB0aHJvdWdoIGFuIGVjaG9pbmcgY29ycmlkb3IuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgZGFuZ2Vyb3VzIG1vdmVtZW50IGlzIHBoeXNpY2FsLCBub3QgZWxlY3Ryb25pYy48L2xpPgo8bGk+VGhlIHJvdXRlIHBvaW50cyB0b3dhcmQgZGVlcGVyIGNvbnRhaW5tZW50L3NlcnZpY2UgaW5mcmFzdHJ1Y3R1cmUuPC9saT4KPC91bD4KPGgyPkM0LiBQdW1wIC8gV2F0ZXIgQ29udHJvbDwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gQ29uZGVuc2F0aW9uIHJ1bnMgZG93biB0YW5rcyBhbmQgY29udHJvbCBob3VzaW5ncy4gVGhlIGZsb29yIGlzIHdldCBlbm91Z2ggdG8gZGlzdG9ydCByZWZsZWN0aW9ucy48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFVzZWZ1bCBmb3IgcmVzaWR1ZSwgZHJhaW5hZ2UgY2x1ZXMsIGFuZCB0cmFjZXMgdGhhdCBzdXJ2aXZlZCBjbGVhbnVwLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5Ojwvc3Ryb25nPiBVbmRlcnN0YW5kIHdoZXJlIGRyYWlucyBhbmQgcHVtcHMgY29ubmVjdC48L2xpPgo8bGk+PHN0cm9uZz5NZWRpY2luZSAvIFhlbm9iaW9sb2d5Ojwvc3Ryb25nPiBJZGVudGlmeSBub25odW1hbiByZXNpZHVlIGluIGZpbHRlcnMuPC9saT4KPGxpPjxzdHJvbmc+SW52ZXN0aWdhdGlvbjo8L3N0cm9uZz4gRmluZCBjb250YW1pbmF0aW9uIG1vdmluZyB0aHJvdWdoIGRyYWluYWdlIHJhdGhlciB0aGFuIGRhdGEgbGluZXMuPC9saT4KPGxpPjxzdHJvbmc+QXRobGV0aWNzOjwvc3Ryb25nPiBDcm9zcyBzbGljayBzdXJmYWNlcyB1bmRlciBwcmVzc3VyZS48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPkJpb2xvZ2ljYWwgdHJhY2VzIG1heSBzdXJ2aXZlIHdoZXJlIGNhbWVyYXMgYW5kIGxvZ3Mgd2VyZSB3aXBlZC48L2xpPgo8bGk+RHJhaW5hZ2UgY2FuIHBvaW50IHRvd2FyZCB0aGUgRmxvb3IgRCBuZXN0IGFwcHJvYWNoLjwvbGk+CjwvdWw+CjxoMj5DNS4gV2F0ZXIgUmVjeWNsaW5nIC8gVHJlYXRtZW50PC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBSZWN5Y2xpbmcgdGFua3MgaHVtIGJlaGluZCBzYWZldHkgbWVzaC4gV2FybmluZyBsYWJlbHMgcGVlbCBmcm9tIGRhbXAgbWFjaGluZXJ5LjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gR29vZCBsb2NhdGlvbiBmb3IgT3NrYXItcmVsYXRlZCB0ZWNobmljYWwgY2x1ZXMgb3Igc2lnbnMgb2Ygc29tZXRoaW5nIHVzaW5nIG1haW50ZW5hbmNlIHNwYWNlcyB0byBtb3ZlIHVuc2Vlbi48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+U2NhdmVuZ2VyOjwvc3Ryb25nPiBGaW5kIHVzZWZ1bCB0b29scyBvciBpbXByb3Zpc2VkIHdlYXBvbnMuPC9saT4KPGxpPjxzdHJvbmc+R3JlYXNlIE1vbmtleTo8L3N0cm9uZz4gVHJhY2UgZmxvdyBkaXJlY3Rpb24uPC9saT4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBOb3RpY2UgYSB0YW5rIG9yIGdyYXRlIHZpYnJhdGluZyBvdXQgb2Ygcmh5dGhtLjwvbGk+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb246PC9zdHJvbmc+IEZpbmQgYSBzbWFsbCBvcmdhbmljIHNtZWFyIG9yIGxvc3QgcGVyc29uYWwgaXRlbS48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBtaXNzaW5nLXBlcnNvbiB0cmFpbCBpcyBwaHlzaWNhbCBhbmQgYmlvbG9naWNhbC48L2xpPgo8bGk+VGhlIHN5c3RlbSBjb25uZWN0cyB0byByZXN0cmljdGVkIGFyZWFzIG9uIEZsb29yIEQuPC9saT4KPC91bD4KPGgyPkM2LiBIVkFDIC8gQWlyIEhhbmRsaW5nPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBMYXJnZSBhaXIgaGFuZGxlcnMgc2hha2UgaW4gdGhlaXIgbW91bnRzLiBGaWx0ZXJzIHJhdHRsZSBiZWhpbmQgYWNjZXNzIHBhbmVscy4gVGhlIGFpciBzbWVsbHMgb2YgZHVzdCwgaGVhdCwgYW5kIHNvbWV0aGluZyBmYWludGx5IHN3ZWV0LjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gUHJpbWFyeSBjbHVlIHNpdGUgZm9yIE9za2FyIFZlbm4uPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IElkZW50aWZ5IGEgZm9yY2VkIG1haW50ZW5hbmNlIHJvdXRlLjwvbGk+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb246PC9zdHJvbmc+IEZpbmQgT3NrYXLigJlzIHRvb2wgY2FydCwgcmFkaW8gbG9nLCBvciBkcmFnIG1hcmtzLjwvbGk+CjxsaT48c3Ryb25nPkF3YXJlbmVzczo8L3N0cm9uZz4gSGVhciBtb3ZlbWVudCB0b28gbGFyZ2UgZm9yIG5vcm1hbCBkdWN0d29yay48L2xpPgo8bGk+PHN0cm9uZz5NZWRpY2luZSAvIFhlbm9iaW9sb2d5Ojwvc3Ryb25nPiBJZGVudGlmeSByZXNpZHVlIGFzIGJpb2xvZ2ljYWwgcmF0aGVyIHRoYW4gY2hlbWljYWwuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5Pc2thciB3YXMgdGFrZW4gd2hpbGUgaW52ZXN0aWdhdGluZyBhIHJlYWwgZmF1bHQuPC9saT4KPGxpPkhpcyBmaW5hbCByb3V0ZSBwb2ludHMgdG93YXJkIEZsb29yIEQgYWNjZXNzIG9yIGEgaGlkZGVuIHNlcnZpY2UgZHJvcC48L2xpPgo8bGk+VGhlIGNyZWF0dXJlIHJlc3BvbnNpYmxlIGRpZCBub3Qgc3RheSBoZXJlLjwvbGk+CjwvdWw+CjxoMj5DNy4gV29ya3Nob3A8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEJlbmNoZXMsIGNoYXJnZXJzLCBzcGFyZSBwYW5lbHMsIGFuZCB0YWdnZWQgdG9vbCByYWNrcyBmaWxsIGEgY3JhbXBlZCBtYWludGVuYW5jZSB3b3Jrc2hvcC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IEdvb2QgZm9yIHByZXBhcmF0aW9uLCBpbXByb3Zpc2VkIHJlcGFpcnMsIGFuZCB0ZWNobmljYWwgY29uZmlybWF0aW9uIHRoYXQgc3lzdGVtcyB3ZXJlIHNhYm90YWdlZCBvciBieXBhc3NlZCBieSBodW1hbnMgYW5kIGRhbWFnZWQgYnkgY3JlYXR1cmVzLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5Ojwvc3Ryb25nPiBSZXBhaXIgZ2VhciwgYnVpbGQgYSBieXBhc3MsIG9yIGlkZW50aWZ5IG1pc3NpbmcgdG9vbHMuPC9saT4KPGxpPjxzdHJvbmc+U2NhdmVuZ2VyOjwvc3Ryb25nPiBGaW5kIHVzZWZ1bCBwYXJ0cy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBNYXRjaCB0b29scyB0byBmb3JjZWQgcGFuZWxzLjwvbGk+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBTZWN1cml0eTo8L3N0cm9uZz4gUmVjb2duaXplIHVuYXV0aG9yaXplZCBjb3Jwb3JhdGUgdGFtcGVyIHNlYWxzLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+SHVtYW4gY292ZXJ1cCBhbmQgYWxpZW4gbW92ZW1lbnQgYm90aCBsZWZ0IHRyYWNlcy48L2xpPgo8bGk+VG9vbHMgbWF5IGhlbHAgb3BlbiBvciBzZWFsIEZsb29yIEQgYWNjZXNzIHJvdXRlcy48L2xpPgo8L3VsPgo8aDI+QzguIFBvd2VyIC8gQnJlYWtlciBBY2Nlc3M8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEJyZWFrZXIgcGFuZWxzIGFuZCBiYWNrdXAgcG93ZXIgY2VsbHMgbGluZSB0aGUgd2FsbC4gU29tZW9uZSBoYXMgbWFya2VkIHNldmVyYWwgY2lyY3VpdHMgd2l0aCBvbGQgdGFwZSBhbmQgbmV3ZXIgd2FybmluZyBnbHlwaHMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBVc2UgZm9yIGxpZ2h0aW5nIGNvbnRyb2wsIHJvdXRlIGNvbnRyb2wsIGFuZCB0ZW5zaW9uIGJlZm9yZSBlbnRlcmluZyBGbG9vciBELjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5Ojwvc3Ryb25nPiBSZXN0b3JlIGxpZ2h0cyBvciBjdXQgcG93ZXIgdG8gYSByb3V0ZS48L2xpPgo8bGk+PHN0cm9uZz5NZXNoIEhhY2tlcjo8L3N0cm9uZz4gSWRlbnRpZnkgcmVtb3RlLWNvbnRyb2wgcmVsYXlzLjwvbGk+CjxsaT48c3Ryb25nPlRhY3RpY3M6PC9zdHJvbmc+IERlY2lkZSB3aGV0aGVyIGRhcmtuZXNzIGhlbHBzIG9yIGh1cnRzIHRoZSBncm91cC48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IE5vdGljZSB3aGljaCBjaXJjdWl0cyB3ZXJlIHJlY2VudGx5IG92ZXJsb2FkZWQuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5DdXR0aW5nIHBvd2VyIGNhbiBzbG93IGh1bWFucyBidXQgbWF5IG5vdCBzbG93IHRoZSBBbnRpdGhlc2lzLjwvbGk+CjxsaT5Tb21lIOKAnHNpZ25hbCBibGVlZOKAnSBlZmZlY3RzIGFyZSBjb3BpZWQgZGF0YSBhbmQgZmFpbGluZyBpbmZyYXN0cnVjdHVyZSwgbm90IGFsaWVuIGhhY2tpbmcuPC9saT4KPC91bD4KPGgyPkM5LiBNb25pdG9yaW5nIE9mZmljZTwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gQSBzbWFsbCBtb25pdG9yaW5nIG9mZmljZSBob2xkcyBjaGVhcCBzY3JlZW5zLCBwYXRjaCBwYW5lbHMsIGFuZCBhIGNoYWlyIHdvcm4gYnkgbG9uZyBzaGlmdHMuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBHb29kIHBsYWNlIGZvciBTd2l0Y2gsIFJlZGxpbmUgY2FtZXJhIGZlZWRzLCBjb3Jwb3JhdGUgZmVlZCB0YW1wZXJpbmcsIGFuZCBCZXggQXJhbmRhIGZvb3RhZ2UuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyOjwvc3Ryb25nPiBSZWNvdmVyIHBhcnRpYWwgZm9vdGFnZS48L2xpPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlOjwvc3Ryb25nPiBJbnRlcnByZXQgUmVkbGluZSBibGluZCBzcG90cyBhbmQgbG9jYWwgY2FtZXJhIGhhYml0cy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBGaW5kIGVkaXRzLCBtaXNzaW5nIHRpbWVzdGFtcHMsIG9yIGNvcGllZCBmZWVkcy48L2xpPgo8bGk+PHN0cm9uZz5FbXBhdGh5IC8gTmVnb3RpYXRpb246PC9zdHJvbmc+IENvbnZpbmNlIGEgY2FtZXJhIHNpdHRlciB0byBjb29wZXJhdGUuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5CZXggZGlzYXBwZWFyZWQgbmVhciBhIHNlcnZpY2Ugcm91dGUuPC9saT4KPGxpPlNvbWUgZmVlZHMgd2VyZSBzb2xkLCBjb3BpZWQsIG9yIHRhbXBlcmVkIHdpdGggYnkgaHVtYW5zLjwvbGk+CjxsaT5Gb290YWdlIHBvaW50cyB0b3dhcmQgRmxvb3IgRCBhY2Nlc3MgcmF0aGVyIHRoYW4gYSBsb2NhbCBGbG9vciBDIG5lc3QuPC9saT4KPC91bD4KPGgyPkMxMC4gRnJlaWdodCBMaWZ0PC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBUaGUgZnJlaWdodCBsaWZ0IGlzIGxhcmdlIGVub3VnaCBmb3IgbWVkaWNhbCBwYWxsZXRzLCBtYWludGVuYW5jZSBjYXJ0cywgYW5kIHRoaW5ncyBwZW9wbGUgd291bGQgcmF0aGVyIG5vdCBtb3ZlIHRocm91Z2ggcHVibGljIGhhbGxzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVXNlZnVsIGZvciBjb3Jwb3JhdGUgbW92ZW1lbnQsIGV2YWN1YXRpb24sIGFuZCBkYW5nZXIgc3ByZWFkaW5nIGJldHdlZW4gZmxvb3JzLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5Ojwvc3Ryb25nPiBGb3JjZSBvciBkaXNhYmxlIHRoZSBsaWZ0LjwvbGk+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyOjwvc3Ryb25nPiBUcmFjZSByZWNlbnQgc3RvcHMuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIFNlY3VyaXR5Ojwvc3Ryb25nPiBJZGVudGlmeSBzdXBwcmVzc2VkIG1vdmVtZW50IGxvZ3MuPC9saT4KPGxpPjxzdHJvbmc+VGFjdGljczo8L3N0cm9uZz4gRGVjaWRlIHdoZXRoZXIgdG8gaG9sZCBvciBhYmFuZG9uIHRoZSBsaWZ0LjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhlIGxpZnQgbWF5IGNvbm5lY3QgdG8gRmxvb3IgRCBxdWFyYW50aW5lL2luY2lkZW50IHNwYWNlcy48L2xpPgo8bGk+Q29ycG9yYXRlIFJlY292ZXJ5IG1heSB1c2UgaXQgaWYgdGhleSB3YW50IHRvIG1vdmUgZmFzdCBhbmQgdW5zZWVuLjwvbGk+CjwvdWw+CjxoMj5DMTEuIFN0YWlyIC8gVmVydGljYWwgU2VydmljZSBBY2Nlc3M8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEEgbmFycm93IHZlcnRpY2FsIGFjY2VzcyBzaGFmdCBzbWVsbHMgb2Ygb2lsLCBkdXN0LCBhbmQgb3ZlcmhlYXRlZCBtZXRhbC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IEdvb2QgZm9yIGVzY2FwZSwgcHVyc3VpdCwgYW5kIGhpbnRzIG9mIE1vZGVsIDMgbW92ZW1lbnQuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkF0aGxldGljczo8L3N0cm9uZz4gQ2xpbWIgb3IgZGVzY2VuZCBxdWlja2x5LjwvbGk+CjxsaT48c3Ryb25nPlBhcmtvdXI6PC9zdHJvbmc+IEJ5cGFzcyBibG9ja2VkIGxhbmRpbmdzLjwvbGk+CjxsaT48c3Ryb25nPkF3YXJlbmVzczo8L3N0cm9uZz4gSGVhciBtb3ZlbWVudCBmcm9tIGJlbG93LjwvbGk+CjxsaT48c3Ryb25nPlNtYWxsIEFybXM6PC9zdHJvbmc+IFVuZGVyc3RhbmQgd2h5IHNob290aW5nIGhlcmUgaXMgZGFuZ2Vyb3VzLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhpcyByb3V0ZSBjYW4gY29ubmVjdCB0byBGbG9vciBE4oCZcyBEMTEgRW1lcmdlbmN5IFN0YWlyIC8gTGFkZGVyd2VsbC48L2xpPgo8bGk+SWYgYSBNb2RlbCAzIGFwcGVhcnMgaGVyZSwgaXQgc2hvdWxkIHJldHJlYXQgdG93YXJkIEZsb29yIEQgcmF0aGVyIHRoYW4gZXN0YWJsaXNoIGEgbmVzdCBvbiBGbG9vciBDLjwvbGk+CjwvdWw+CjxoMj5DMTIuIEhpZGRlbiBNYWludGVuYW5jZSBDYXZpdHk8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEEgbmFycm93IG1haW50ZW5hbmNlIGNhdml0eSBoaWRlcyBiZWhpbmQgbWlzbWF0Y2hlZCBwYW5lbHMgYW5kIHRhcGVkLW92ZXIgd2FybmluZ3MuIFNvbWV0aGluZyBoYXMgcGFzc2VkIHRocm91Z2ggaGVyZSByZWNlbnRseSwgYnV0IGl0IGRpZCBub3Qgc3RheS48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFRoaXMgd2FzIHByZXZpb3VzbHkgYSBjYW5kaWRhdGUgZm9yIHRoZSBoaWRkZW4gbmVzdC4gSW4gdGhlIGN1cnJlbnQgdmVyc2lvbiwgaXQgaXMgYSB0cmFuc2l0IGNsdWUgYW5kIHNlcnZpY2Utcm91dGUgZGlzY292ZXJ5LiBUaGUgYWN0aXZlIGhpZGRlbiBuZXN0IGlzIG9uIEZsb29yIEQuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb24gLyBUcmFja2luZzo8L3N0cm9uZz4gRm9sbG93IG1hcmtzLCByZXNpZHVlLCBvciBkcmFnIHRyYWNlcyB0b3dhcmQgRmxvb3IgRC48L2xpPgo8bGk+PHN0cm9uZz5TY2F2ZW5nZXI6PC9zdHJvbmc+IEZpbmQgYSBicm9rZW4gcGFuZWwsIGRyb3BwZWQgdG9vbCwgb3IgaGlkZGVuIGNhY2hlLjwvbGk+CjxsaT48c3Ryb25nPkd1dHRlciBSYXQ6PC9zdHJvbmc+IFVuZGVyc3RhbmQgdGhlIHJvdXRl4oCZcyByZWFsLXdvcmxkIHVzZSBieSBwZW9wbGUgYXZvaWRpbmcgb2ZmaWNpYWwgY29ycmlkb3JzLjwvbGk+CjxsaT48c3Ryb25nPlhlbm9iaW9sb2d5IC8gQW50aXRoZXNpcyBrbm93bGVkZ2U6PC9zdHJvbmc+IElkZW50aWZ5IHRyYWNlcyBmcm9tIE1vZGVsIDFzIG9yIE1vZGVsIDNzLCBidXQgbm90IGEgbWF0dXJlIG5lc3Qgc3RydWN0dXJlLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhpcyBjYXZpdHkgY29ubmVjdHMgdGhlIG1pc3NpbmctcGVyc29uIHRyYWlsIHRvIEZsb29yIEQuPC9saT4KPGxpPkl0IG1heSBjb250YWluIE1vZGVsIDEgcmVzaWR1ZSwgYnV0IHRoZSBhY3RpdmUgbmVzdCBpcyBlbHNld2hlcmUuPC9saT4KPGxpPkl0IGNhbiBmb3Jlc2hhZG93IHRoZSBGbG9vciBEIGRpc2NvdmVyeSB3aXRob3V0IHJldmVhbGluZyBpdCB0b28gZWFybHkuPC9saT4KPC91bD4KPGgyPldoYXQgTWFwIEMgc2hvdWxkIGVzdGFibGlzaDwvaDI+Cjx1bD4KPGxpPlNlcnZpY2UgaW5mcmFzdHJ1Y3R1cmUgbGV0cyBwZW9wbGUgYW5kIGNyZWF0dXJlcyBtb3ZlIHVuc2Vlbi48L2xpPgo8bGk+UmVkbGluZSwgY2xpbmljIHN0YWZmLCBtYWludGVuYW5jZSB3b3JrZXJzLCBhbmQgY29ycG9yYXRlIHJlY292ZXJ5IGFsbCB1c2UgZGlmZmVyZW50IHBhcnRzIG9mIHRoZSBzYW1lIGJhY2sgcm91dGVzLjwvbGk+CjxsaT5Pc2thciwgQmV4LCBhbmQgb3RoZXIgbWlzc2luZy1wZXJzb24gY2x1ZXMgcG9pbnQgdG93YXJkIEZsb29yIEQuPC9saT4KPGxpPuKAnFNpZ25hbCBibGVlZOKAnSBpcyBjb3BpZWQgZXZpZGVuY2UgYW5kIGh1bWFuIHN5c3RlbXMgZmFpbGluZyB1bmRlciBwcmVzc3VyZSwgbm90IGFsaWVuIGVsZWN0cm9uaWMgaW5mZWN0aW9uLjwvbGk+CjxsaT5UaGUgYWN0aXZlIGhpZGRlbiBuZXN0IGlzIG5vdCBoZXJlOyB0aGlzIG1hcCBwb2ludHMgdG8gaXQuPC9saT4KPC91bD4="
  },
  {
    "name": "Signal Bleed - Map D Incident Key",
    "source_file": "handouts/17_Map_D_Incident_Key.md",
    "notes_b64": "PGgxPk1hcCBEIOKAlCBRdWFyYW50aW5lIEluY2lkZW50IC8gSGlkZGVuIE5lc3QgS2V5PC9oMT4KPHA+VXNlIHRoaXMgYXMgdGhlIGJyZWFjaCwgaW52ZXN0aWdhdGlvbiwgYW5kIGZpbmFsZSBmbG9vci48L3A+CjxwPkZsb29yIEQgY29udGFpbnMgdHdvIHRydXRoczo8L3A+CjxvbD4KPGxpPlRoZSA8c3Ryb25nPm9sZCBkZXN0cm95ZWQgbmVzdDwvc3Ryb25nPiB3YXMgaW4gb3IgYWRqYWNlbnQgdG8gdGhlIHF1YXJhbnRpbmUgLyBjb250YWlubWVudCBhcmVhLjwvbGk+CjxsaT5UaGUgPHN0cm9uZz5hY3RpdmUgaGlkZGVuIG5lc3Q8L3N0cm9uZz4gaXMgZGVlcGVyIG9uIHRoaXMgc2FtZSBmbG9vciwgaW4gc2VydmljZSByb3V0ZXMsIGJ5cGFzcyBzcGFjZXMsIGFuZCBzZWFsZWQgbWFpbnRlbmFuY2UgY2F2aXRpZXMgcmVhY2hlZCBmcm9tIHRoZSBpbmNpZGVudCBmbG9vci48L2xpPgo8L29sPgo8cD5UaGlzIGtlZXBzIHRoZSBvbGQgZXZpZGVuY2UgYW5kIHRoZSBjdXJyZW50IHRocmVhdCBvbiB0aGUgc2FtZSBtYXAgd2l0aG91dCBtYWtpbmcgdGhlIG5lc3Qgb2J2aW91cyB0aGUgbW9tZW50IHRoZSBQQ3MgYXJyaXZlLjwvcD4KPGgyPkhvdyB0byB1c2UgdGhlc2UgY2hlY2tzPC9oMj4KPHA+VGhlc2UgYXJlIHByb21wdHMsIG5vdCBhIGZpeGVkIG1lbnUuIElmIGEgcGxheWVyIGRlc2NyaWJlcyBhIHNlbnNpYmxlIGFwcHJvYWNoLCB1c2UgdGhlIGNsb3Nlc3Qgc2tpbGwgb3IgQmFja2dyb3VuZCBsb2dpYy48L3A+CjxwPlJlY29tbWVuZGVkIGNsdWUgaGFuZGxpbmc6PC9wPgo8dWw+CjxsaT48c3Ryb25nPk5vIHJvbGwgLyBiYXNpYyBpbnRlcmFjdGlvbjo8L3N0cm9uZz4gZ2l2ZSB0aGUgb2J2aW91cyBjbHVlLjwvbGk+CjxsaT48c3Ryb25nPlN1Y2Nlc3M6PC9zdHJvbmc+IGdpdmUgdXNlZnVsIGRldGFpbCwgbGV2ZXJhZ2UsIG9yIGEgc2FmZXIgcm91dGUuPC9saT4KPGxpPjxzdHJvbmc+SGlnaCBzdWNjZXNzOjwvc3Ryb25nPiBnaXZlIGEgc2hvcnRjdXQsIGZ1dHVyZSBhZHZhbnRhZ2UsIG9yIGEgd2F5IHRvIHJlZHVjZSBkYW5nZXIuPC9saT4KPGxpPjxzdHJvbmc+RmFpbHVyZTo8L3N0cm9uZz4gZG8gbm90IHN0YWxsIHRoZSBzY2VuYXJpbzsgZ2l2ZSB0aGUgY2x1ZSB3aXRoIGxlc3MgZGV0YWlsLCBleHRyYSB0aW1lIGNvc3QsIG5vaXNlLCBvciBjb21wbGljYXRpb24uPC9saT4KPC91bD4KPGgyPkZsb29yIEQgc3RydWN0dXJlPC9oMj4KPHA+VHJlYXQgdGhlIG1hcCBhcyB0d28gb3ZlcmxhcHBpbmcgem9uZXMuPC9wPgo8aDM+SW52ZXN0aWdhdGlvbiAvIGNvbnRhaW5tZW50IHpvbmU8L2gzPgo8cD5UaGlzIGlzIHRoZSBjbGVhbmVyIGhhbGYgb2YgdGhlIG1hcC4gSXQgaW5jbHVkZXMgdGhlIGxhbmRpbmcgYWNjZXNzIHJvdXRlLCBxdWFyYW50aW5lIHJvb21zLCBkaWFnbm9zdGljcywgY29udHJvbCByb29tLCBhbmQgdGhlIG9sZCBjb250YWlubWVudCBjaGFtYmVyLjwvcD4KPHA+SXQgc2hvdWxkIHNob3c6PC9wPgo8dWw+CjxsaT5zdGVyaWxpemVkIGNvcnJpZG9ycyw8L2xpPgo8bGk+c2VhbGVkIGRvb3JzLDwvbGk+CjxsaT5jbGVhbiBjb3Jwb3JhdGUgZXJyb3Igc2NyZWVucyw8L2xpPgo8bGk+aGlkZGVuIGNsZWFudXAgbG9ncyw8L2xpPgo8bGk+ZnJpZ2h0ZW5lZCBwYXRpZW50cyBvciBzdGFmZiw8L2xpPgo8bGk+b2xkIGJ1cm4gcGF0dGVybnMsPC9saT4KPGxpPmFuZCBldmlkZW5jZSB0aGF0IHRoZSBjb3Jwb3JhdGlvbiB0aG91Z2h0IHRoZSBmaXJzdCBuZXN0IHdhcyBkZXN0cm95ZWQuPC9saT4KPC91bD4KPGgzPkluZmVzdGVkIC8gaGlkZGVuLW5lc3Qgem9uZTwvaDM+CjxwPlRoaXMgaXMgdGhlIGNvbXByb21pc2VkIGhhbGYgb2YgdGhlIG1hcC4gSXQgYmVnaW5zIHN1YnRseSBuZWFyIHRoZSBvbGQgY29udGFpbm1lbnQgYXJlYSBhbmQgYmVjb21lcyBvYnZpb3VzIHRocm91Z2ggc2VydmljZSByb3V0ZXMsIGJ5cGFzc2VzLCBhbmQgaGlkZGVuIGFjY2VzcyBzcGFjZXMuPC9wPgo8cD5JdCBzaG91bGQgc2hvdzo8L3A+Cjx1bD4KPGxpPndhcm0gd2FsbHMsPC9saT4KPGxpPm9yZ2FuaWMgZmlsbSBpbiBjb3JuZXJzIGFuZCB2ZW50cyw8L2xpPgo8bGk+bG93IGNsaWNraW5nIGluIGR1Y3RzLDwvbGk+CjxsaT5kZWFkIGNhbWVyYSBhbmdsZXMsPC9saT4KPGxpPmZseWluZyBNb2RlbCAxIG1vdmVtZW50LDwvbGk+CjxsaT5kcmFnIG1hcmtzLDwvbGk+CjxsaT5yZXNpZHVlIHRyYWlscyw8L2xpPgo8bGk+Y29jb29uZWQgcmVtYWlucyw8L2xpPgo8bGk+YW5kIE1vZGVsIDMgaHVudGluZyBiZWhhdmlvci48L2xpPgo8L3VsPgo8cD5UaGUgUENzIHNob3VsZCB1c3VhbGx5IGRpc2NvdmVyIHRoZSBhY3RpdmUgbmVzdCBieSBmb2xsb3dpbmcgY2x1ZXMsIGV4cGxvcmluZyB1bnNhZmUgcm91dGVzLCBvciByZXNwb25kaW5nIHRvIGFuIGF0dGFjay48L3A+CjxoMj5EMS4gTGFuZGluZyBDb3JuZXIgLyBFbWVyZ2VuY3kgQWNjZXNzIFJvdXRlPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBBIHNtYWxsIGVtZXJnZW5jeSBsYW5kaW5nIGNvcm5lciBvcGVucyB0byBhIHZlcnRpY2FsIHNreXdlbGwgYmV0d2VlbiBtZWdhY29tcGxleCB0b3dlcnMuIFdhcm5pbmcgbGlnaHRzIHB1bHNlIHRocm91Z2ggY2VpbGluZyBoYXplIGFuZCBvbGQgZXhoYXVzdC48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFRoaXMgaXMgd2hlcmUgZW1lcmdlbmN5IGNyYWZ0IG9yIG1lZGljYWwgcmVzcG9uc2UgY2FuIGFycml2ZSBpZiB0aGUgc2NlbmUgZXNjYWxhdGVzLiBJZiB5b3VyIGN1cnJlbnQgbWFwIGhhcyB0aGUgbWFpbiBsYW5kaW5nIHBhZCBvbiBGbG9vciBCIGluc3RlYWQsIHRyZWF0IEQxIGFzIHRoZSBpbnRlcm5hbCBhcnJpdmFsIHJvdXRlIGZyb20gdGhlIEZsb29yIEIgcGFkOiBlbGV2YXRvciwgc3RhaXIsIGxpZnQsIG9yIHNlcnZpY2UtY29ycmlkb3IgYWNjZXNzLjwvcD4KPHA+TmlnaHRDcmFzaCBjYW4gbGFuZCBvbiBGbG9vciBCLCB0aGVuIGVudGVyIEZsb29yIEQgdGhyb3VnaCB0aGlzIHJvdXRlLiBUaGF0IGRlbGF5IGlzIHVzZWZ1bC4gSGVyIGFycml2YWwgY3JlYXRlcyBhbiBvcGVuaW5nLCBub3QgYSBzb2x1dGlvbi48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+UGlsb3RpbmcgLyBMb2dpc3RpY3M6PC9zdHJvbmc+IEp1ZGdlIGhvdyBxdWlja2x5IGVtZXJnZW5jeSB0cmFuc3BvcnQgY2FuIHJlYWNoIHRoaXMgZmxvb3IuPC9saT4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBTcG90IGluY29taW5nIGxpZ2h0cywgZHJvbmUgbW92ZW1lbnQsIG9yIGR1c3QgZmFsbGluZyBmcm9tIHVwcGVyIGFjY2Vzcy48L2xpPgo8bGk+PHN0cm9uZz5Db3Jwb3JhdGUgU2VjdXJpdHk6PC9zdHJvbmc+IFJlY29nbml6ZSBlbWVyZ2VuY3kgYWNjZXNzIHByb3RvY29scy48L2xpPgo8bGk+PHN0cm9uZz5QZXJmb3JtYW5jZSAvIExlYWRlcnNoaXA6PC9zdHJvbmc+IFVzZSB0aGUgcHJvbWlzZSBvZiBtZWRldmFjIHRvIHN0ZWFkeSBmcmlnaHRlbmVkIGNpdmlsaWFucy48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPk5pZ2h0Q3Jhc2ggY2FuIGFycml2ZSB0aHJvdWdoIHRoaXMgcm91dGUgaWYgbmVlZGVkLjwvbGk+CjxsaT5BIGZseWluZyB2ZWhpY2xlIGNhbm5vdCBzb2x2ZSB0aGUgbmVzdCBwcm9ibGVtLjwvbGk+CjxsaT5JZiB0aGUgcm91dGUgaXMgYmxvY2tlZCwgcmVzY3VlIGlzIGRlbGF5ZWQgb3IgcmVkdWNlZC48L2xpPgo8L3VsPgo8aDI+RDIuIFNreXdlbGwgLyBFbWVyZ2VuY3kgQWNjZXNzIERvb3I8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEEgcmVpbmZvcmNlZCBkb29yIGNvbm5lY3RzIHRoZSBlbWVyZ2VuY3kgYWNjZXNzIHJvdXRlIHRvIHRoZSBmYWNpbGl0eSBpbnRlcmlvci4gSXRzIHNlYWxzIGFyZSBvbGQsIG92ZXJwYWludGVkLCBhbmQgcmVjZW50bHkgZm9yY2VkLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gQSBjaG9rZXBvaW50IGZvciByZXNjdWUsIHJldHJlYXQsIG9yIGFsaWVuIHNwaWxsb3Zlci48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+R3JlYXNlIE1vbmtleTo8L3N0cm9uZz4gRm9yY2Ugb3IgcmVwYWlyIHRoZSBkb29yIHNhZmVseS48L2xpPgo8bGk+PHN0cm9uZz5NZXNoIEhhY2tlcjo8L3N0cm9uZz4gT3ZlcnJpZGUgZW1lcmdlbmN5IGxvY2tvdXQuPC9saT4KPGxpPjxzdHJvbmc+QmlnIEd1bnM6PC9zdHJvbmc+IEtub3cgd2hhdCBoYXBwZW5zIGlmIHNvbWVvbmUgYnJlYWNoZXMgaXQgbG91ZGx5LjwvbGk+CjxsaT48c3Ryb25nPkF0aGxldGljczo8L3N0cm9uZz4gSG9sZCBvciBmb3JjZSBpdCB1bmRlciBwcmVzc3VyZS48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoaXMgZG9vciBtYXkgdHJhcCBvciBzYXZlIHBlb3BsZSBkZXBlbmRpbmcgb24gdGltaW5nLjwvbGk+CjxsaT5OaWdodENyYXNo4oCZcyBkcm9uZXMgbmVlZCB0aGUgcm91dGUgY2xlYXIgZm9yIGV2YWN1YXRpb24uPC9saT4KPGxpPklmIHRoZSBpbmZlc3RhdGlvbiBoYXMgc3ByZWFkIHRoaXMgZmFyLCB0aGUgZmxvb3IgaXMgY2xvc2UgdG8gY29sbGFwc2UuPC9saT4KPC91bD4KPGgyPkQzLiBDZW50cmFsIEluY2lkZW50IEhhbGw8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEEgd2lkZSBoYWxsIGxpbmtzIGNvbnRhaW5tZW50LCBkaWFnbm9zdGljcywgcGF0aWVudCBob2xkaW5nLCBhbmQgdmVydGljYWwgYWNjZXNzLiBJdCBpcyB0b28gb3BlbiB3aGVuIHRoZSBsaWdodHMgc3RhcnQgZmxpY2tlcmluZy4gU29tZSBwYXJ0cyBzdGlsbCBsb29rIHN0ZXJpbGU7IG90aGVycyBoYXZlIHRoZSB3cm9uZyB0ZXh0dXJlIGluIHRoZSBjb3JuZXJzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVGhpcyBpcyB0aGUgbmF0dXJhbCBhY3Rpb24gc2NlbmUgc3BhY2UuIEl0IHNob3VsZCBjaGFuZ2UgYmFzZWQgb24gZWFybGllciBkaXBsb21hY3kgYW5kIGhvdyBxdWlja2x5IHRoZSBQQ3MgcmVhbGl6ZSB0aGUgYWN0aXZlIG5lc3QgaXMgc3RpbGwgb24gdGhpcyBmbG9vci48L3A+CjxwPlVzZSBEMyBhcyB0aGUgdHJhbnNpdGlvbiBiZXR3ZWVuIGludmVzdGlnYXRpb24gYW5kIGluZmVzdGF0aW9uLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5UYWN0aWNzOjwvc3Ryb25nPiBTZXQgZGVmZW5zaXZlIHBvc2l0aW9ucyB3aXRob3V0IGJsb2NraW5nIGV2YWN1YXRpb24uPC9saT4KPGxpPjxzdHJvbmc+U21hbGwgQXJtczo8L3N0cm9uZz4gSWRlbnRpZnkgY2xlYW4gZmlyaW5nIGxhbmVzIGFuZCBkYW5nZXJvdXMgY3Jvc3NmaXJlLjwvbGk+CjxsaT48c3Ryb25nPlBlcmZvcm1hbmNlIC8gTGVhZGVyc2hpcDo8L3N0cm9uZz4gRGlyZWN0IHBhbmlja2VkIGNpdmlsaWFucyBvciBzdGFmZi48L2xpPgo8bGk+PHN0cm9uZz5QYXJrb3VyOjwvc3Ryb25nPiBVc2UgZnVybml0dXJlLCBiYXJyaWVycywgYW5kIHBhcnRpYWwgY29sbGFwc2VzIHRvIG1vdmUgYXJvdW5kIHRoZSBmaWdodC48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IEhlYXIgTW9kZWwgMSBtb3ZlbWVudCBiZWZvcmUgaXQgYnJlYWtzIGludG8gdGhlIGhhbGwuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGlzIGNhbiBiZWNvbWUgYSBraWxsIHpvbmUgb3IgYW4gZXZhY3VhdGlvbiBjb3JyaWRvci48L2xpPgo8bGk+RWFybGllciBmYWN0aW9uIGNob2ljZXMgZGV0ZXJtaW5lIHdobyBoZWxwcyBob2xkIGl0LjwvbGk+CjxsaT5PcmdhbmljIHJlc2lkdWUgb3IgaW5zZWN0LWxpa2UgbW90aW9uIHBvaW50cyB0b3dhcmQgdGhlIGluZmVzdGVkIHNpZGUgb2YgdGhlIGZsb29yLjwvbGk+CjwvdWw+CjxoMj5ENC4gUXVhcmFudGluZSBDZWxsczwvaDI+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZDo8L3N0cm9uZz4gUGluay1saXQgcXVhcmFudGluZSByb29tcyBsaW5lIHRoZSBjb3JyaWRvci4gRWFjaCBjZWxsIGhhcyBvYnNlcnZhdGlvbiBnbGFzcywgaXNvbGF0aW9uIHNlYWxzLCBhbmQgZXF1aXBtZW50IG1lYW50IHRvIGtlZXAgZmVhciBjb250YWluZWQuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBVc2UgZm9yIGV4cG9zZWQgcGF0aWVudHMsIG9sZCB0ZXN0IHN1YmplY3RzLCBhbGllbiBzeW1wdG9tcywgb3IgY29ycG9yYXRlIGNvbnRhaW5tZW50IGNydWVsdHkuIFRoZSBjZWxscyBhcmUgbm90IHRoZSBjdXJyZW50IG5lc3QsIGJ1dCB0aGV5IGFyZSBjbG9zZSBlbm91Z2ggdG8gc2hvdyB0aGF0IHRoaXMgZmxvb3Igd2FzIHVzZWQgdG8gaG9sZCBsaXZpbmcgcGVvcGxlIGFuZCBkYW5nZXJvdXMgc2FtcGxlcy48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+TWVkaWNpbmU6PC9zdHJvbmc+IERpc3Rpbmd1aXNoIGNvbnRhbWluYXRpb24sIHBhbmljLCB0cmF1bWEsIGFuZCBleHBlcmltZW50YWwgdHJlYXRtZW50IGVmZmVjdHMuPC9saT4KPGxpPjxzdHJvbmc+UHN5Y2hvbG9neTo8L3N0cm9uZz4gQ2FsbSBhbiBpc29sYXRlZCBwYXRpZW50IGVub3VnaCB0byBnZXQgdXNlZnVsIGluZm9ybWF0aW9uLjwvbGk+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBTZWN1cml0eTo8L3N0cm9uZz4gUmVjb2duaXplIHRoZSBsYXlvdXQgYXMgY29udGFpbm1lbnQtZmlyc3QsIGNhcmUtc2Vjb25kLjwvbGk+CjxsaT48c3Ryb25nPkJsYWRlcyAvIE1lbGVlOjwvc3Ryb25nPiBOb3RpY2UgZGVmZW5zaXZlIGdvdWdlcyBmcm9tIHNvbWVvbmUgdHJhcHBlZCBpbnNpZGUuPC9saT4KPGxpPjxzdHJvbmc+WGVub2Jpb2xvZ3kgLyBBbnRpdGhlc2lzIGtub3dsZWRnZTo8L3N0cm9uZz4gUmVjb2duaXplIHNtYWxsIHRyYWNlcyBvZiBBbnRpdGhlc2lzIHJlc2lkdWUgdGhhdCBzdXJ2aXZlZCBjbGVhbmluZy48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBxdWFyYW50aW5lIHN5c3RlbSBjYW4gcHJvdGVjdCBvciBpbXByaXNvbi48L2xpPgo8bGk+UGF0aWVudHMgbWF5IGtub3cgYWJvdXQgY2xpY2tpbmcgaW4gdGhlIHdhbGxzLCBtaXNzaW5nIHN0YWZmLCBvciBzZXJ2aWNlIHJvdXRlcy48L2xpPgo8bGk+T25lIGNlbGwgbWF5IGhhdmUgYmVlbiB1c2VkIGFzIHRlbXBvcmFyeSBzdG9yYWdlIGZvciBtYXRlcmlhbCByZWNvdmVyZWQgZnJvbSB0aGUgb2xkIG5lc3QuPC9saT4KPC91bD4KPGgyPkQ1LiBEaWFnbm9zdGljcyBMYWI8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IERpYWdub3N0aWMgYmVkcywgc2Nhbm5lcnMsIGFuZCBtb25pdG9ycyBzdXJyb3VuZCBhIGNlbnRyYWwgd29yayBhcmVhLiBTZXZlcmFsIHNjcmVlbnMgc2hvdyBjbGVhbiBlcnJvciBzdGF0ZXMgdGhhdCBmZWVsIHRvbyBjbGVhbi48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFRoaXMgaXMgd2hlcmUgdGVjaG5pY2FsIGFuZCBtZWRpY2FsIFBDcyBjYW4gbGVhcm4gdGhhdCB0aGUgcmVsYXkgaXMgaHVtYW4gZXZpZGVuY2UsIG5vdCBhbGllbiB0ZWNobm9sb2d5LiBJdCBpcyBhbHNvIGEgZ29vZCBwbGFjZSBmb3IgbG9ncyBjb25uZWN0aW5nIEI4LCBEOCwgYW5kIHRoZSBjdXJyZW50IGhpZGRlbiBuZXN0LjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5NZWRpY2luZSAvIFN1cmdlcnk6PC9zdHJvbmc+IEludGVycHJldCBwaHlzaW9sb2dpY2FsIHJlY29yZHMgYW5kIGV4cG9zdXJlLXRyZWF0bWVudCBmYWlsdXJlcy48L2xpPgo8bGk+PHN0cm9uZz5NZXNoIEhhY2tlcjo8L3N0cm9uZz4gUmVjb3ZlciBjb3JydXB0ZWQgZGlhZ25vc3RpY3MsIGRlbGV0ZWQgcGF0aWVudCB0YWdzLCBvciBjb3BpZWQgcmVsYXkgZnJhZ21lbnRzLjwvbGk+CjxsaT48c3Ryb25nPkN5YmVyd2FyZTo8L3N0cm9uZz4gTm90aWNlIGNoZWFwIGltcGxhbnRzIHJlc3BvbmRpbmcgdG8gbG9jYWwgZGF0YSBub2lzZSBhbmQgZXhwbG9pdGF0aXZlIGFkIHN5c3RlbXMsIG5vdCBhbGllbiBjb250cm9sLjwvbGk+CjxsaT48c3Ryb25nPkludmVzdGlnYXRpb246PC9zdHJvbmc+IENhdGNoIHRoYXQgcmVzdWx0cyB3ZXJlIHNhbml0aXplZCBieSBhbiBhdXRvbWF0ZWQgcm91dGluZS48L2xpPgo8bGk+PHN0cm9uZz5YZW5vYmlvbG9neSAvIEFudGl0aGVzaXMga25vd2xlZGdlOjwvc3Ryb25nPiBJZGVudGlmeSB0aGF0IHRoZSBhY3RpdmUgdGhyZWF0IGlzIGJpb2xvZ2ljYWwsIG5vdCBlbGVjdHJvbmljLjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+VXNlZnVsIGluZm9ybWF0aW9uOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+VGhlIFF1aWxsIFJlbGF5IGlzIGEgaHVtYW4gZGF0YSBjb3JlLjwvbGk+CjxsaT5UaGUgcmVsYXkgaXMgZXZpZGVuY2UsIG5vdCBhIGJlYWNvbi48L2xpPgo8bGk+VGhlIHJlbGF5IGRvZXMgbm90IHN1bW1vbiBBbnRpdGhlc2lzLjwvbGk+CjxsaT5Mb2dzIHBvaW50IGZyb20gdGhlIG9sZCBkZXN0cm95ZWQgbmVzdCB0b3dhcmQgYSBzZWNvbmQgYWN0aXZlIG5lc3Qgc29tZXdoZXJlIG9uIEZsb29yIEQuPC9saT4KPC91bD4KPGgyPkQ2LiBDb250cm9sIFJvb208L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEN1cnZlZCBjb25zb2xlcyBmYWNlIGNhbWVyYSBmZWVkcywgaXNvbGF0aW9uIGNvbnRyb2xzLCBhaXIgc3lzdGVtcywgYW5kIHNlY3VyaXR5IGRvb3JzLiBIYWxmIHRoZSBpbmRpY2F0b3JzIGFyZSBjbGVhbiBjb3Jwb3JhdGUgdGVhbC4gVGhlIG90aGVycyBhcmUgZGVhZCwgbG9vcGluZywgb3IgcGh5c2ljYWxseSBkaXNjb25uZWN0ZWQuPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBUaGlzIGlzIHRoZSByb29tIGZvciBtYXAgY29udHJvbCwgZG9vciBjaG9pY2VzLCBtaXNzaW5nIGZvb3RhZ2UsIGFuZCBoYXJkIG1vcmFsIHRyYWRlb2Zmcy48L3A+CjxwPkl0IGlzIGFsc28gdGhlIGJlc3QgcGxhY2UgdG8gcmV2ZWFsIHRoYXQgQ29ycG9yYXRlIFJlY292ZXJ5IG1pc3JlYWQgdGhlIE1vZGVsIDEgZXNjYXBlIGFzIHRlcm1pbmFsIGVycmF0aWMgZmxpZ2h0LjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5NZXNoIEhhY2tlcjo8L3N0cm9uZz4gQ29udHJvbCBkb29ycywgY2FtZXJhcywgb3IgY29udGFpbm1lbnQgc2h1dHRlcnMuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIFNlY3VyaXR5Ojwvc3Ryb25nPiBQcmVkaWN0IHJlY292ZXJ5IG92ZXJyaWRlIHByb2NlZHVyZXMuPC9saT4KPGxpPjxzdHJvbmc+R3JlYXNlIE1vbmtleTo8L3N0cm9uZz4gS2VlcCBjb250cm9scyBydW5uaW5nIHdoZW4gc29mdHdhcmUgZmFpbHMuPC9saT4KPGxpPjxzdHJvbmc+VGFjdGljczo8L3N0cm9uZz4gQ2hvb3NlIHdoaWNoIGRvb3JzIHRvIGxvY2sgd2l0aG91dCB0cmFwcGluZyBjaXZpbGlhbnMuPC9saT4KPGxpPjxzdHJvbmc+SW52ZXN0aWdhdGlvbjo8L3N0cm9uZz4gSWRlbnRpZnkgZm9vdGFnZSBnYXBzIGFuZCBidXJpZWQgYW5ub3RhdGlvbnMuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgUENzIGNhbiBzaGFwZSB0aGUgYmF0dGxlZmllbGQgZnJvbSBoZXJlLjwvbGk+CjxsaT5CYWQgZGVjaXNpb25zIG1heSB0cmFwIGFsbGllcyBvciBzcHJlYWQgdGhlIGluZmVzdGF0aW9uLjwvbGk+CjxsaT5Gb290YWdlIHNob3dzIE1vZGVsIDFzIGxlYXZpbmcgdGhlIGRlc3Ryb3llZCBuZXN0IHRocm91Z2ggc2VydmljZSByb3V0ZXMuPC9saT4KPGxpPkhhbGRlbiBSb29rIGZsYWdnZWQg4oCcbmVzdC1zZWVkaW5nIHBvc3NpYmlsaXR54oCdIGJlZm9yZSB0aGUgd2FybmluZyB3YXMgZGVsZXRlZCBvciBvdmVycnVsZWQuPC9saT4KPC91bD4KPGgyPkQ3LiBQYXRpZW50IEhvbGRpbmcgUm9vbXM8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFNtYWxsIHJvb21zIGhvbGQgYmVkcywgbW9uaXRvcnMsIGFuZCBwcml2YWN5IGN1cnRhaW5zLiBUaGV5IGFyZSBub3QgY2VsbHMsIGJ1dCB0aGV5IGFyZSBub3QgY29tZm9ydGluZyBlaXRoZXIuIFNvbWUgYmVkcyBhcmUgZW1wdHkgdG9vIHJlY2VudGx5LjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVXNlZnVsIGZvciBjaXZpbGlhbiByZXNjdWUsIEJsdWV3aXJlIHRyZWF0bWVudCwgZXhwb3NlZCBOUENzLCBvciBldmlkZW5jZSB0aGF0IHRoZSBNb2RlbCAzcyBhcmUgaHVudGluZyBpc29sYXRlZCBiaW9tYXNzLjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5NZWRpY2luZTo8L3N0cm9uZz4gU3RhYmlsaXplIGEgcGF0aWVudCB3aGlsZSBhbGFybXMgcmlzZS48L2xpPgo8bGk+PHN0cm9uZz5FbXBhdGh5Ojwvc3Ryb25nPiBHZXQgYSB0ZXJyaWZpZWQgcGVyc29uIHRvIG1vdmUgbm93IGluc3RlYWQgb2YgZnJlZXplLjwvbGk+CjxsaT48c3Ryb25nPkF0aGxldGljczo8L3N0cm9uZz4gQ2Fycnkgc29tZW9uZSB0byB0aGUgZWxldmF0b3Igb3IgZW1lcmdlbmN5IHJvdXRlLjwvbGk+CjxsaT48c3Ryb25nPlJlbGlnaW91cyAvIENvbWZvcnQ6PC9zdHJvbmc+IEhlbHAgc29tZW9uZSBmYWNlIGltcG9zc2libGUgc3ltcHRvbXMgd2l0aG91dCBkZXNwYWlyLjwvbGk+CjxsaT48c3Ryb25nPkF3YXJlbmVzczo8L3N0cm9uZz4gTm90aWNlIGRyYWcgbWFya3Mgb3IgbG93IG1vdmVtZW50IG91dHNpZGUgdGhlIHJvb20uPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgcGxheWVycyBzaG91bGQgZmVlbCB0aGUgY29zdCBvZiBkZWxheXMgaGVyZS48L2xpPgo8bGk+U2F2aW5nIHBhdGllbnRzIGNhbiBtYXR0ZXIgbW9yZSB0aGFuIGtpbGxpbmcgZW5lbWllcy48L2xpPgo8bGk+TWlzc2luZyBwYXRpZW50cyBhbmQgZHJhZyBtYXJrcyBwb2ludCB0b3dhcmQgdGhlIGluZmVzdGVkIHpvbmUuPC9saT4KPC91bD4KPGgyPkQ4LiBDb250YWlubWVudCBDaGFtYmVyIOKAlCBEZXN0cm95ZWQgT2xkIE5lc3Q8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFRoZSBjb250YWlubWVudCBjaGFtYmVyIGhhcyBiZWVuIGJ1cm5lZCBoYXJkIGFuZCBjbGVhbmVkIGhhcmRlci4gRnJlc2ggY29hdGluZyBjYW5ub3QgaGlkZSB0aGUgYnVja2xlZCB3YWxsIHBhbmVscywgbWVsdGVkIGZpdHRpbmdzLCBhbmQgYmxhY2tlbmVkIHNlYW1zLiBUaGUgY2VudGVyIG9mIHRoZSByb29tIGlzIGVtcHR5LCBidXQgbm90IGNsZWFuLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gVGhpcyBpcyB0aGUgPHN0cm9uZz5kZXN0cm95ZWQgb2xkIG5lc3Q8L3N0cm9uZz4sIG5vdCB0aGUgYWN0aXZlIGhpZGRlbiBuZXN0LjwvcD4KPHA+Q29ycG9yYXRlIFJlY292ZXJ5IHRoaW5rcyB0aGlzIHdhcyB0aGUgb25seSBuZXN0LiBUaGV5IGFyZSB3cm9uZy48L3A+CjxwPlVzZSB0aGlzIGNoYW1iZXIgdG8gcmV2ZWFsIHdoYXQgaGFwcGVuZWQgYmVmb3JlLCBub3QgdG8gZW5kIHRoZSBjdXJyZW50IHRocmVhdCBpbW1lZGlhdGVseS48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+WGVub2Jpb2xvZ3kgLyBBbnRpdGhlc2lzIGtub3dsZWRnZTo8L3N0cm9uZz4gSWRlbnRpZnkgcmVtYWlucyBvZiBuZXN0IHN0cnVjdHVyZSBhbmQgTW9kZWwgMSBlbWVyZ2VuY2UuPC9saT4KPGxpPjxzdHJvbmc+QmlnIEd1bnMgLyBDb3Jwb3JhdGUgU2VjdXJpdHk6PC9zdHJvbmc+IFJlY29nbml6ZSBwb3dlcmVkLWFybW9yIGFzc2F1bHQgcGF0dGVybnMgYW5kIGluY2VuZGlhcnkgY2xlYW51cC48L2xpPgo8bGk+PHN0cm9uZz5NZWRpY2luZSAvIFN1cmdlcnk6PC9zdHJvbmc+IElkZW50aWZ5IHRoYXQgcmVzZWFyY2hlcnMgb3Igc3RhZmYgd2VyZSBpbmNvcnBvcmF0ZWQgYXMgYmlvbWFzcy48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uOjwvc3Ryb25nPiBGaW5kIHdoZXJlIGV2aWRlbmNlIHdhcyBzY3JhcGVkLCBidXJuZWQsIGFuZCByZXBsYWNlZC48L2xpPgo8bGk+PHN0cm9uZz5HcmVhc2UgTW9ua2V5IC8gU2NhdmVuZ2VyOjwvc3Ryb25nPiBJZGVudGlmeSBzZXJ2aWNlIGdhcHMgd2hlcmUgc21hbGwgZm9ybXMgZXNjYXBlZC48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBmaXJzdCBuZXN0IHdhcyBoZXJlIG9yIGltbWVkaWF0ZWx5IGFkamFjZW50LjwvbGk+CjxsaT5JdCBpcyBuZWFybHkgZGVzdHJveWVkLjwvbGk+CjxsaT5SZXNlYXJjaGVycyBhbmQgc3RhZmYgd2VyZSBjb25zdW1lZCBhcyBiaW9tYXNzLjwvbGk+CjxsaT5Db3Jwb3JhdGUgY2xlYW51cCB0ZWFtcyBidXJuZWQgdGhlIHZpc2libGUgbmVzdC48L2xpPgo8bGk+Q29ycG9yYXRlIFJlY292ZXJ5IGJlbGlldmVzIHRoaXMgd2FzIHRoZSBvbmx5IG5lc3QuPC9saT4KPGxpPkVzY2FwZSBldmlkZW5jZSBwb2ludHMgYXdheSBmcm9tIEQ4LCB0b3dhcmQgRDkgYW5kIHRoZSBoaWRkZW4gaW5mZXN0ZWQgYXJlYS48L2xpPgo8L3VsPgo8aDI+RDkuIFNlcnZpY2UgQnlwYXNzIOKAlCBFc2NhcGUgUm91dGU8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEEgbmFycm93IGNvcnJpZG9yIG9mIHBpcGVzLCBhY2Nlc3MgcGFuZWxzLCBhbmQgeWVsbG93IHNlcnZpY2UgbGlnaHRzIHJ1bnMgYmVoaW5kIHRoZSBtYWluIHJvb21zLiBUaGUgYWlyIGlzIHdhcm0uIFNvbWUgcGFuZWxzIGFyZSBzZWFsZWQgZnJvbSB0aGUgb3V0c2lkZS4gT3RoZXJzIGFyZSBiZW50IG91dHdhcmQgZnJvbSB3aXRoaW4uPC9wPgo8cD48c3Ryb25nPkdNIG5vdGVzOjwvc3Ryb25nPiBUaGlzIGlzIHRoZSBicmlkZ2UgYmV0d2VlbiB0aGUgZGVzdHJveWVkIG9sZCBuZXN0IGFuZCB0aGUgYWN0aXZlIGhpZGRlbiBuZXN0LjwvcD4KPHA+TW9kZWwgMXMgZXNjYXBlZCB0aGlzIHdheS4gTGF0ZXIsIE1vZGVsIDNzIHVzZSBuZWFyYnkgcm91dGVzIHRvIGRyYWcgYmlvbWFzcyBiYWNrIHRvd2FyZCB0aGUgbmV3IG5lc3QuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPlN0ZWFsdGg6PC9zdHJvbmc+IE1vdmUgYXJvdW5kIHRoZSBtYWluIGhhbGwgdW5zZWVuLjwvbGk+CjxsaT48c3Ryb25nPlNjYXZlbmdlcjo8L3N0cm9uZz4gRmluZCB0b29scywgYWNjZXNzIGhhdGNoZXMsIGFuZCByZXNpZHVlIHRyYWlscy48L2xpPgo8bGk+PHN0cm9uZz5HdXR0ZXIgUmF0Ojwvc3Ryb25nPiBLbm93IHdoaWNoIHBhbmVsIGxlYWRzIHRvIGEgbWFpbnRlbmFuY2UgY3Jhd2wuPC9saT4KPGxpPjxzdHJvbmc+TWVsZWUgQ29tYmF0Ojwvc3Ryb25nPiBVbmRlcnN0YW5kIHRoZSBkYW5nZXIgb2YgY2xvc2UgZmlnaHRpbmcgaW4gdGhlIG5hcnJvdyBzcGFjZS48L2xpPgo8bGk+PHN0cm9uZz5UcmFja2luZyAvIEludmVzdGlnYXRpb246PC9zdHJvbmc+IEZvbGxvdyB0aGUgZXNjYXBlIHZlY3RvciBhbmQgbGF0ZXIgZHJhZyBtYXJrcy48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoaXMgcm91dGUgY2FuIHNhdmUgdGhlIHBhcnR5IGlmIHRoZSBjZW50cmFsIGhhbGwgaXMgb3ZlcnJ1bi48L2xpPgo8bGk+SXQgY2FuIGFsc28gbGV0IHNvbWV0aGluZyBieXBhc3MgdGhlbS48L2xpPgo8bGk+VGhlIG9sZCBNb2RlbCAxIGVzY2FwZSB2ZWN0b3IgYW5kIGN1cnJlbnQgbWlzc2luZy1wZXJzb24gdHJhaWwgYm90aCBwb2ludCBkZWVwZXIgaW50byBGbG9vciBELjwvbGk+CjwvdWw+CjxoMj5EMTAuIEVsZXZhdG9yIENvcmU8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IFRoZSBlbGV2YXRvciBkb29ycyBzaHVkZGVyIHdpdGggZWFjaCBkaXN0YW50IGltcGFjdC4gVGhlIGZsb29yIGluZGljYXRvciBmbGlja2VycyBiZXR3ZWVuIHZhbGlkIGZsb29ycywgZXJyb3IgY29kZXMsIGFuZCBibGFuayBkYXJrbmVzcy48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IERhbmdlcm91cyB2ZXJ0aWNhbCBjb25uZWN0aW9uLiBHb29kIGZvciB0ZW5zaW9uLCByZXNjdWUsIG9yIGxldHRpbmcgdGhlIEdNIHNob3cgdGhhdCB0aGUgcHJvYmxlbSBjb3VsZCBzcHJlYWQuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyOjwvc3Ryb25nPiBTdG9wIHRoZSBlbGV2YXRvciBjYXJyeWluZyBwYW5pYywgY29ycG9yYXRlIGZvcmNlcywgb3IgaW5mZXN0YXRpb24gYmV0d2VlbiBmbG9vcnMuPC9saT4KPGxpPjxzdHJvbmc+R3JlYXNlIE1vbmtleTo8L3N0cm9uZz4gRm9yY2UgaXQgb3BlbiBvciBob2xkIGl0IHNodXQgbWVjaGFuaWNhbGx5LjwvbGk+CjxsaT48c3Ryb25nPlRhY3RpY3M6PC9zdHJvbmc+IERlY2lkZSB3aGV0aGVyIHRvIHNhY3JpZmljZSBtb2JpbGl0eSBmb3IgY29udGFpbm1lbnQuPC9saT4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBIZWFyIHdoZXRoZXIgc29tZXRoaW5nIGlzIGluc2lkZSBiZWZvcmUgb3BlbmluZyBpdC48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlRoZSBlbGV2YXRvciBpcyB1c2VmdWwgYnV0IHJpc2t5LjwvbGk+CjxsaT5BbGllbiBlZmZlY3RzIGRvIG5vdCBzcHJlYWQgZWxlY3Ryb25pY2FsbHksIGJ1dCBjcmVhdHVyZXMsIGJvZGllcywgcGFuaWMsIGFuZCBiYWQgaHVtYW4gZGVjaXNpb25zIGNhbiBzcHJlYWQgdGhyb3VnaCB2ZXJ0aWNhbCBpbmZyYXN0cnVjdHVyZS48L2xpPgo8L3VsPgo8aDI+RDExLiBFbWVyZ2VuY3kgU3RhaXIgLyBMYWRkZXJ3ZWxsPC9oMj4KPHA+PHN0cm9uZz5SZWFkLWFsb3VkOjwvc3Ryb25nPiBUaGUgZW1lcmdlbmN5IHNoYWZ0IGRyb3BzIGludG8gcmVkLWxpdCBnbG9vbS4gSXRzIG1ldGFsIHN0ZXBzIGFyZSBuYXJyb3csIHN0ZWVwLCBhbmQgZWNobyB0b28gbG9uZy4gU29tZXRoaW5nIGhhcyBzY3JhdGNoZWQgdGhlIHVuZGVyc2lkZSBvZiBzZXZlcmFsIGxhbmRpbmdzLjwvcD4KPHA+PHN0cm9uZz5HTSBub3Rlczo8L3N0cm9uZz4gTGFzdC1yZXNvcnQgcm91dGUuIEdvb2QgZm9yIGVzY2FwZSwgYW1idXNoLCBvciBNb2RlbCAzIG1vdmVtZW50LjwvcD4KPHA+PHN0cm9uZz5JbnRlcmFjdGlvbiBwcm9tcHRzOjwvc3Ryb25nPjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5BdGhsZXRpY3M6PC9zdHJvbmc+IE1vdmUgZmFzdCB1bmRlciBwcmVzc3VyZS48L2xpPgo8bGk+PHN0cm9uZz5QYXJrb3VyOjwvc3Ryb25nPiBTa2lwIGxhbmRpbmdzIG9yIGJ5cGFzcyBvYnN0YWNsZXMuPC9saT4KPGxpPjxzdHJvbmc+QXdhcmVuZXNzOjwvc3Ryb25nPiBEZXRlY3QgbW92ZW1lbnQgZnJvbSBhYm92ZSBvciBiZWxvdy48L2xpPgo8bGk+PHN0cm9uZz5TbWFsbCBBcm1zOjwvc3Ryb25nPiBLbm93IGZpcmluZyBoZXJlIHJpc2tzIHJpY29jaGV0cyBhbmQgcGFuaWMuPC9saT4KPGxpPjxzdHJvbmc+VGFjdGljczo8L3N0cm9uZz4gRGVjaWRlIHdoZXRoZXIgdG8gaG9sZCB0aGUgc3RhaXIgb3IgYWJhbmRvbiBpdC48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPlVzZWZ1bCBpZiBlbGV2YXRvcnMgYXJlIGNvbXByb21pc2VkLjwvbGk+CjxsaT5CYWQgZm9yIHN0cmV0Y2hlcnMgYW5kIG1hc3MgZXZhY3VhdGlvbi48L2xpPgo8bGk+QSBKdXZlbmlsZSBNb2RlbCAzIG1heSB1c2UgdGhpcyByb3V0ZSB0byBmbGFuayBvciBkcmFnIHByZXkgYXdheS48L2xpPgo8L3VsPgo8aDI+RDEyLiBOaWdodENyYXNoIEFycml2YWwgUm91dGU8L2gyPgo8cD48c3Ryb25nPlJlYWQtYWxvdWQ6PC9zdHJvbmc+IEZyb20gZW1lcmdlbmN5IGFjY2VzcyB0byBoYWxsLCB0aGUgcm91dGUgaXMganVzdCB3aWRlIGVub3VnaCBmb3IgdHdvIG51cnNlLXNoYXBlZCBkcm9uZXMgY2FycnlpbmcgYSBzbWFydC1zdHJldGNoZXIgYXQgYSBkZWFkIHJ1bi48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFRoaXMgcm91dGUgbWF0dGVycyBpZiBOaWdodENyYXNoIGFwcGVhcnMgb3IgaWYgUENzIHByZXBhcmUgZXZhY3VhdGlvbi4gSWYgdGhlIGFjdHVhbCBsYW5kaW5nIHBhZCBpcyBvbiBGbG9vciBCLCBEMTIgaXMgdGhlIGludGVybmFsIHJvdXRlIHNoZSBhbmQgdGhlIEd1cm5leSBBbmdlbHMgdXNlIHRvIHJlYWNoIEZsb29yIEQuPC9wPgo8cD48c3Ryb25nPkludGVyYWN0aW9uIHByb21wdHM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT48c3Ryb25nPkxvZ2lzdGljcyAvIFBpbG90aW5nOjwvc3Ryb25nPiBLZWVwIHRoZSByb3V0ZSBjbGVhciBmb3IgbWVkZXZhYy48L2xpPgo8bGk+PHN0cm9uZz5BdGhsZXRpY3M6PC9zdHJvbmc+IE1vdmUgZGVicmlzIG9yIGJvZGllcyBvdXQgb2YgdGhlIHdheS48L2xpPgo8bGk+PHN0cm9uZz5QZXJmb3JtYW5jZSAvIExlYWRlcnNoaXA6PC9zdHJvbmc+IE1ha2UgZnJpZ2h0ZW5lZCBwZW9wbGUgc3RvcCBibG9ja2luZyB0aGUgcGF0aC48L2xpPgo8bGk+PHN0cm9uZz5TbWFsbCBBcm1zOjwvc3Ryb25nPiBDb3ZlciB0aGUgcm91dGUgd2l0aG91dCBlbmRhbmdlcmluZyBwYXRpZW50cy48L2xpPgo8L3VsPgo8cD48c3Ryb25nPlVzZWZ1bCBpbmZvcm1hdGlvbjo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPk5pZ2h0Q3Jhc2ggY3JlYXRlcyBhbiBvcGVuaW5nLCBub3QgYSBzb2x1dGlvbi48L2xpPgo8bGk+SWYgdGhlIHJvdXRlIGlzIGJsb2NrZWQsIGhlciBoZWxwIGlzIGRlbGF5ZWQgb3IgcmVkdWNlZC48L2xpPgo8L3VsPgo8aDI+RDEzLiBBY3RpdmUgSGlkZGVuIE5lc3Q8L2gyPgo8cD5JZiB0aGUgbWFwIGhhcyBubyBvYnZpb3VzIHJvb20gZm9yIGEgc2VwYXJhdGUgRDEzLCBwbGFjZSB0aGlzIGluIHRoZSBoYWxmIG9mIHRoZSBtYXAgbW9zdCBjb25uZWN0ZWQgdG8gPHN0cm9uZz5EOSBTZXJ2aWNlIEJ5cGFzczwvc3Ryb25nPiwgPHN0cm9uZz5EMTEgRW1lcmdlbmN5IFN0YWlyIC8gTGFkZGVyd2VsbDwvc3Ryb25nPiwgb3IgYSBzZWFsZWQgbWFpbnRlbmFuY2UgY2F2aXR5IGJlaGluZCB0aGUgcXVhcmFudGluZS9pbmNpZGVudCByb29tcy48L3A+CjxwPjxzdHJvbmc+UmVhZC1hbG91ZCB3aGVuIGRpc2NvdmVyZWQ6PC9zdHJvbmc+IFRoZSBjb3JyaWRvciBzdG9wcyBiZWluZyBhcmNoaXRlY3R1cmUuIFBpcGVzIGRpc2FwcGVhciB1bmRlciBwdWxzaW5nIHRpc3N1ZS4gUGFuZWxzIGhhdmUgYmVlbiBwdWxsZWQgaW53YXJkIGFuZCB3ZWJiZWQgaW50byB0aGUgd2FsbHMuIFNtYWxsIHdpbmdlZCBzaGFwZXMgY2xpbmcgdG8gdGhlIGNlaWxpbmcgbGlrZSB3ZXQgbGVhdmVzLiBTb21ldGhpbmcgbGFyZ2VyIG1vdmVzIGxvdyBiZWhpbmQgdGhlIGdyb3d0aCwgYnJlYXRoaW5nIGluIGNsaWNrcy48L3A+CjxwPjxzdHJvbmc+R00gbm90ZXM6PC9zdHJvbmc+IFRoaXMgaXMgdGhlIDxzdHJvbmc+c2Vjb25kIGhpZGRlbiBuZXN0PC9zdHJvbmc+LCBzZWVkZWQgYnkgTW9kZWwgMXMgdGhhdCBlc2NhcGVkIHRoZSBkZXN0cm95ZWQgb2xkIG5lc3QuIEl0IHNob3VsZCBiZSBoaWRkZW4gdW50aWwgdGhlIFBDcyBmb2xsb3cgY2x1ZXMsIGV4cGxvcmUgdGhlIHVuc2FmZSBoYWxmIG9mIHRoZSBtYXAsIG9yIHRyaWdnZXIgYW4gYXR0YWNrLjwvcD4KPHA+VGhlIG5lc3QgaXMgYWN0aXZlIGJ1dCB5b3VuZy4gSXQgc2hvdWxkIGJlIGZyaWdodGVuaW5nLCBub3QgaW1wb3NzaWJsZS48L3A+CjxwPjxzdHJvbmc+SW50ZXJhY3Rpb24gcHJvbXB0czo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPjxzdHJvbmc+WGVub2Jpb2xvZ3kgLyBBbnRpdGhlc2lzIGtub3dsZWRnZTo8L3N0cm9uZz4gVW5kZXJzdGFuZCB0aGF0IE1vZGVsIDEgcmVtYWlucyBzZWVkZWQgdGhpcyBuZXcgbmVzdC48L2xpPgo8bGk+PHN0cm9uZz5JbnZlc3RpZ2F0aW9uIC8gVHJhY2tpbmc6PC9zdHJvbmc+IENvbm5lY3QgbWlzc2luZy1wZXJzb24gZHJhZyBtYXJrcyB0byB0aGUgbmVzdC48L2xpPgo8bGk+PHN0cm9uZz5UYWN0aWNzOjwvc3Ryb25nPiBJZGVudGlmeSBjaG9rZXBvaW50cywgd2VhayBncm93dGggc3VwcG9ydHMsIGFuZCBiYWQgZmlyaW5nIGxhbmVzLjwvbGk+CjxsaT48c3Ryb25nPkJpZyBHdW5zIC8gRGVtb2xpdGlvbnMgbG9naWM6PC9zdHJvbmc+IERlc3Ryb3kgbmVzdCBzdHJ1Y3R1cmUgd2l0aG91dCBjb2xsYXBzaW5nIHJlc2N1ZSByb3V0ZXMuPC9saT4KPGxpPjxzdHJvbmc+TWVkaWNpbmUgLyBTdXJnZXJ5Ojwvc3Ryb25nPiBJZGVudGlmeSBjb2Nvb25lZCByZW1haW5zLCBwb3NzaWJsZSBzdXJ2aXZvcnMsIG9yIGJpb21hc3MgaW5jb3Jwb3JhdGlvbiBzdGFnZXMuPC9saT4KPGxpPjxzdHJvbmc+U2FtdXJhaSBPdGFrdTo8L3N0cm9uZz4gUmVjb2duaXplIHdoeSBhIHlvdW5nIFNhbXVyYWkgY291bGQgYXdha2VuIHVuZGVyIHRoaXMgcHJlc3N1cmUuPC9saT4KPC91bD4KPHA+PHN0cm9uZz5Vc2VmdWwgaW5mb3JtYXRpb246PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5UaGUgc2Vjb25kIG5lc3QgaXMgYWN0aXZlLjwvbGk+CjxsaT5JdCBoYXMgcHJvZHVjZWQgbW9zdGx5IHdlYWsgTW9kZWwgMXMgYW5kIGEgZmV3IEp1dmVuaWxlIE1vZGVsIDNzLjwvbGk+CjxsaT5UaGUgTW9kZWwgM3MgaHVudCBpc29sYXRlZCBiaW9tYXNzIGFuZCBkcmFnIGl0IGhlcmUuPC9saT4KPGxpPkRlc3Ryb3lpbmcgdGhlIG5lc3QgaXMgcG9zc2libGUsIGJ1dCByZXNjdWUgYW5kIGV2aWRlbmNlIGNob2ljZXMgbWF0dGVyLjwvbGk+CjwvdWw+CjxoMj5BY3RpdmUgbmVzdCBwb3B1bGF0aW9uPC9oMj4KPHA+QWRqdXN0IGZvciBwYXJ0eSBzaXplIGFuZCB0b25lLjwvcD4KPGgzPkRlZmF1bHQgc3RhcnRlciB2ZXJzaW9uPC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5Nb2RlbCAxIEp1dmVuaWxlPC9zdHJvbmc+IOKAlCAzIHRvIDUgdG90YWwsIG1vc3RseSBuZWFyIEQ5IC8gRDEzLjwvbGk+CjxsaT48c3Ryb25nPk1vZGVsIDEgQWRvbGVzY2VudDwvc3Ryb25nPiDigJQgMCB0byAxLCBuZWFyIHRoZSBuZXN0LjwvbGk+CjxsaT48c3Ryb25nPk1vZGVsIDEgU2VlZCBDbHVtcCAvIEFjdGl2ZSBOZXN0IENvcmU8L3N0cm9uZz4g4oCUIGluc2lkZSBEMTMuPC9saT4KPGxpPjxzdHJvbmc+SnV2ZW5pbGUgTW9kZWwgMzwvc3Ryb25nPiDigJQgMSB0byAyLCByb2FtaW5nIGJldHdlZW4gRDcsIEQ5LCBEMTEsIGFuZCBEMTMuPC9saT4KPGxpPjxzdHJvbmc+TW90ZSBTd2FybTwvc3Ryb25nPiDigJQgb3B0aW9uYWwgcHJlc3N1cmUgaW4gRDMgb3IgbmVhciBEOC48L2xpPgo8L3VsPgo8aDM+SGFyZCB2ZXJzaW9uPC9oMz4KPHVsPgo8bGk+QWRkIG9uZSBleHRyYSA8c3Ryb25nPkp1dmVuaWxlIE1vZGVsIDM8L3N0cm9uZz4uPC9saT4KPGxpPkFkZCBvbmUgPHN0cm9uZz5Nb2RlbCAzIEFkb2xlc2NlbnQ8L3N0cm9uZz4gYXMgYSBib3NzLWxldmVsIGRlZmVuZGVyLjwvbGk+CjxsaT5JbmNyZWFzZSByZXNjdWUgcHJlc3N1cmUgcmF0aGVyIHRoYW4gb25seSBpbmNyZWFzaW5nIGVuZW15IGNvdW50LjwvbGk+CjwvdWw+CjxoMz5EbyBub3QgdXNlIGJ5IGRlZmF1bHQ8L2gzPgo8dWw+CjxsaT48c3Ryb25nPk1vZGVsIDMgQWR1bHQ8L3N0cm9uZz4g4oCUIHRvbyBsYXJnZSBmb3Igbm9ybWFsIHN0YXJ0ZXIgcGxheSB1bmxlc3MgdXNlZCBhcyBhbiB1bmZpbmlzaGVkIGVtZXJnZW5jZSwgY291bnRkb3duLCBvciBsYXRlci1jYW1wYWlnbiB0aHJlYXQuPC9saT4KPC91bD4KPGgyPkRpc2NvdmVyeSBmbG93PC9oMj4KPG9sPgo8bGk+UENzIGVudGVyIEZsb29yIEQgdGhyb3VnaCBlbWVyZ2VuY3kgYWNjZXNzLCBlbGV2YXRvciwgc3RhaXIsIG9yIHNlcnZpY2Ugcm91dGUuPC9saT4KPGxpPkQ1L0Q2IHJldmVhbCBzYW5pdGl6ZWQgcmVjb3JkcywgZGVsZXRlZCBmb290YWdlLCBhbmQgdGhlIHJlbGF54oCZcyBldmlkZW5jZS48L2xpPgo8bGk+RDggc2hvd3MgdGhlIGRlc3Ryb3llZCBvbGQgbmVzdCBhbmQgY29ycG9yYXRlIGNsZWFudXAuPC9saT4KPGxpPkQ5IHJldmVhbHMgdGhlIGVzY2FwZSByb3V0ZSBmcm9tIHRoZSBvbGQgbmVzdC48L2xpPgo8bGk+RDcgb3IgRDExIHNob3dzIGN1cnJlbnQgaHVudGluZyAvIGRyYWcgZXZpZGVuY2UuPC9saT4KPGxpPkQxMyByZXZlYWxzIHRoZSBhY3RpdmUgaGlkZGVuIG5lc3QuPC9saT4KPGxpPlRoZSBQQ3MgY2hvb3NlIGJldHdlZW4gZXZpZGVuY2UsIHJlc2N1ZSwgY29udGFpbm1lbnQsIGFuZCBkaXJlY3QgZGVzdHJ1Y3Rpb24uPC9saT4KPGxpPk5pZ2h0Q3Jhc2ggY2FuIGFycml2ZSBsYXRlIHRocm91Z2ggRDEvRDEyIGlmIHRoZSBncm91cCBuZWVkcyByZXNjdWUgcHJlc3N1cmUsIGV4dHJhY3Rpb24sIG9yIHJlY29nbml0aW9uLjwvbGk+Cjwvb2w+CjxoMj5XaGF0IEZsb29yIEQgc2hvdWxkIGVzdGFibGlzaDwvaDI+Cjx1bD4KPGxpPlRoZSByZWxheSBpcyBodW1hbiBldmlkZW5jZSwgbm90IGFsaWVuIHRlY2hub2xvZ3kuPC9saT4KPGxpPlRoZSBjb3Jwb3JhdGlvbiBjcmVhdGVkIHRoZSBmaXJzdCBuZXN0IHRocm91Z2ggaWxsZWdhbCBiaW8tcmVzZWFyY2guPC9saT4KPGxpPkNvcnBvcmF0ZSBjbGVhbnVwIGRlc3Ryb3llZCB0aGUgdmlzaWJsZSBvbGQgbmVzdCBidXQgbWlzc2VkIHRoZSBlc2NhcGUgdmVjdG9yLjwvbGk+CjxsaT5Nb2RlbCAxcyBzZWVkZWQgYSBzZWNvbmQgaGlkZGVuIG5lc3Qgb24gRmxvb3IgRC48L2xpPgo8bGk+VGhlIHNlY29uZCBuZXN0IGlzIGFjdGl2ZSBhbmQgcmVzcG9uc2libGUgZm9yIHRoZSBjdXJyZW50IG1pc3NpbmctcGVyc29uIHBhdHRlcm4uPC9saT4KPGxpPkh1bWFuIHNlY3JlY3ksIG5vdCBhbGllbiBoYWNraW5nLCBsZXQgdGhlIHRocmVhdCBncm93LjwvbGk+CjwvdWw+"
  },
  {
    "name": "Signal Bleed - Token and NPC Placement GM",
    "source_file": "handouts/18_Token_and_NPC_Placement_GM.md",
    "notes_b64": "PGgxPlRva2VuIGFuZCBOUEMgUGxhY2VtZW50OiBHTSBEcmFmdDwvaDE+CjxoMj5DYW4gdG9rZW5zIGJlIHNjcmlwdGVkIG9udG8gbWFwcyBhdXRvbWF0aWNhbGx5PzwvaDI+CjxwPlRlY2huaWNhbGx5LCBhIFJvbGwyMCBNb2QvQVBJIHNjcmlwdCBjYW4gY3JlYXRlIHRva2VucyBvbiBwYWdlcywgYnV0IGl0IGlzIG5vdCB0aGUgcmlnaHQgZmlyc3Qgc3RlcCBoZXJlLjwvcD4KPHA+VG8gcGxhY2UgdG9rZW5zIGF1dG9tYXRpY2FsbHksIHRoZSBzY3JpcHQgbmVlZHM6PC9wPgo8dWw+CjxsaT5leGFjdCBSb2xsMjAgcGFnZSBJRHM8L2xpPgo8bGk+ZXhhY3QgdG9rZW4gY29vcmRpbmF0ZXM8L2xpPgo8bGk+dG9rZW4gaW1hZ2UgVVJMcyBhbHJlYWR5IHVwbG9hZGVkL2F2YWlsYWJsZSBpbiBSb2xsMjA8L2xpPgo8bGk+bWFwIGRpbWVuc2lvbnMgYW5kIHNjYWxlPC9saT4KPGxpPmRlY2lzaW9ucyBhYm91dCB3aGljaCB0b2tlbnMgc3RhcnQgaGlkZGVuLCB2aXNpYmxlLCBvciBvbiB0aGUgR00gbGF5ZXI8L2xpPgo8L3VsPgo8cD5UaGUgQVBJIGNhbm5vdCByZWxpYWJseSB1cGxvYWQgbG9jYWwgaW1hZ2UgZmlsZXMgaW50byB5b3VyIFJvbGwyMCBBcnQgTGlicmFyeS48L3A+CjxwPkZvciB0aGlzIGRyYWZ0LCB1c2UgdGhlIGltcG9ydGVyIHRvIGNyZWF0ZSBOUEMgY2hhcmFjdGVyIGVudHJpZXMgYW5kIGhhbmRvdXRzLiBQbGFjZSBtYXAgdG9rZW5zIG1hbnVhbGx5IGFmdGVyIHVwbG9hZGluZyBhcnQuPC9wPgo8aDI+UmVjb21tZW5kZWQgcGxhY2VtZW50IHdvcmtmbG93PC9oMj4KPG9sPgo8bGk+VXBsb2FkIHRoZSBtYXAgaW1hZ2UuPC9saT4KPGxpPkNyZWF0ZSBhIFJvbGwyMCBwYWdlIGZvciB0aGUgbWFwLjwvbGk+CjxsaT5QdXQgdGhlIG1hcCBpbWFnZSBvbiB0aGUgPHN0cm9uZz5NQVA8L3N0cm9uZz4gbGF5ZXIuPC9saT4KPGxpPkFkZCBHTSBsYWJlbHMsIGhpZGRlbiBOUENzLCBhbmQgY2x1ZSBtYXJrZXJzIG9uIHRoZSA8c3Ryb25nPkdNPC9zdHJvbmc+IGxheWVyLjwvbGk+CjxsaT5BZGQgdmlzaWJsZSBQQ3MsIE5QQ3MsIGFuZCBjcmVhdHVyZXMgb24gdGhlIDxzdHJvbmc+VE9LRU5TPC9zdHJvbmc+IGxheWVyLjwvbGk+CjxsaT5Vc2UgSGlkZS9SZXZlYWwgTWFzayBvciBGb2cgb2YgV2FyIHRvIHJldmVhbCB0aGUgcGxheWFibGUgc3BhY2UuPC9saT4KPGxpPlVzZSB0aGlzIGhhbmRvdXQgYW5kIDxjb2RlPmRhdGEvc2lnbmFsX2JsZWVkX3Rva2VuX21hbmlmZXN0Lmpzb248L2NvZGU+IGFzIHRoZSBwbGFjZW1lbnQgZ3VpZGUuPC9saT4KPC9vbD4KPGgyPlRva2VuIHZpc2liaWxpdHkgY29udmVudGlvbjwvaDI+CjxwcmU+VmlzaWJsZTogUGxheWVycyBjYW4gc2VlIHRoZSB0b2tlbiBhdCBzY2VuZSBzdGFydC4KRGVsYXllZDogRG8gbm90IHBsYWNlIHVudGlsIHRoZSBOUEMgZW50ZXJzIHRoZSBzY2VuZSwgb3Iga2VlcCBvbiBHTSBsYXllci4KSGlkZGVuOiBQbGFjZSBvbiBHTSBsYXllciBvciBkbyBub3QgcGxhY2UgdW50aWwgZGlzY292ZXJlZC4KQ29uZGl0aW9uYWw6IE9ubHkgYXBwZWFycyBpZiB0aGUgcmVsZXZhbnQgZXZlbnQgaGFwcGVucy4KQ2x1ZSBtYXJrZXI6IEdNLWxheWVyIHRleHQgbm90ZSBvciBzbWFsbCBpY29uLiBOb3QgYSBjcmVhdHVyZSB0b2tlbi48L3ByZT4KPGgyPk1hcmtlciBjb252ZW50aW9uPC9oMj4KPHA+VXNlIHNob3J0IEdNLWxheWVyIHRleHQgbGFiZWxzIGZvciBjbHVlcy48L3A+CjxwPkV4YW1wbGVzOjwvcD4KPHByZT5bQjggTk9URUJPT0tdCltCOCBPTEQgQlVSTlNdCltEOCBPTEQgTkVTVF0KW0Q5IEVTQ0FQRSBWRUNUT1JdCltEMTMgQUNUSVZFIE5FU1RdCltENyBEUkFHIE1BUktTXTwvcHJlPgo8cD5EbyBub3QgcHV0IGNsdWUgbWFya2VycyBvbiB0aGUgVE9LRU5TIGxheWVyIHVubGVzcyB0aGUgcGxheWVycyBzaG91bGQgc2VlIHRoZSBvYmplY3QgaW1tZWRpYXRlbHkuPC9wPgo8aDI+Rmxvb3IgQSDigJQgTWVyY3kgVHdlbHZlIENsaW5pYzwvaDI+CjxoMz5TdGFydGluZyB2aXNpYmxlIHRva2VuczwvaDM+Cjx1bD4KPGxpPjxzdHJvbmc+U2VuaW9yIE51cnNlIEltYW5pIENobzwvc3Ryb25nPiDigJQgQTggRnJvbnQgRGVzayAvIFBhdGllbnQgQ2hlY2staW4sIG9yIEE3IENlbnRyYWwgV2FpdGluZyBIYWxsLjwvbGk+CjxsaT48c3Ryb25nPk9yZGVybHkgUGF4IFJ1dW48L3N0cm9uZz4g4oCUIEE2IEVtZXJnZW5jeSBJbnRha2UgQmF5LjwvbGk+CjxsaT48c3Ryb25nPk5veCDigJxCbHVld2lyZeKAnSBLYWRlPC9zdHJvbmc+IOKAlCBBNiBFbWVyZ2VuY3kgSW50YWtlLCBBNyBDZW50cmFsIFdhaXRpbmcgSGFsbCwgb3IgQTEzIFNlcnZpY2UgQ29ycmlkb3IuPC9saT4KPGxpPjxzdHJvbmc+UmVkbGluZSBMb29rb3V0IFBhaXI8L3N0cm9uZz4g4oCUIEExIEluZG9vciBTdHJlZXQgb3IgQTEzIFNlcnZpY2UgQ29ycmlkb3IuPC9saT4KPGxpPjxzdHJvbmc+V29ycmllZCBQYXJlbnQ8L3N0cm9uZz4g4oCUIEE3IENlbnRyYWwgV2FpdGluZyBIYWxsIG9yIEE4IEZyb250IERlc2sgYXJlYS48L2xpPgo8bGk+PHN0cm9uZz5DbGluaWMgcGF0aWVudHMgLyBjaXZpbGlhbnM8L3N0cm9uZz4g4oCUIEE3IENlbnRyYWwgV2FpdGluZyBIYWxsLCBBOCBGcm9udCBEZXNrIGFyZWEsIGFuZCBBMTEgUGF0aWVudCBSb29tcyBhcyBuZWVkZWQuPC9saT4KPC91bD4KPGgzPkRlbGF5ZWQgb3IgR00tbGF5ZXIgdG9rZW5zPC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5Eci4gU2VyYSBWYWxlejwvc3Ryb25nPiDigJQgQTMgU3VyZ2ljYWwgLyBUcmVhdG1lbnQgUm9vbSwgQTUgT2ZmaWNlIC8gUmVjb3Jkcywgb3IgQTggRnJvbnQgRGVzayBpZiBzaGUgZW50ZXJzIHRvIGRlLWVzY2FsYXRlLjwvbGk+CjxsaT48c3Ryb25nPk1hcmEg4oCcTW90aGVyIFJlZOKAnSBWZXk8L3N0cm9uZz4g4oCUIEExIEluZG9vciBTdHJlZXQgb3IgQTEzIFNlcnZpY2UgQ29ycmlkb3I7IGVudGVyIHdoZW4gbmVnb3RpYXRpb24gZXNjYWxhdGVzLjwvbGk+CjxsaT48c3Ryb25nPkNvbW1hbmRlciBJbGFuIFJ1c2s8L3N0cm9uZz4g4oCUIHN0YXJ0IG9mZi1tYXAgb3IgYXQgQTEgY29uY291cnNlIGVkZ2UuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIERyb25lPC9zdHJvbmc+IOKAlCBBMSBwdWJsaWMgY29uY291cnNlLCBpZiBjb3JwIHByZXNzdXJlIGlzIHZpc2libGUuPC9saT4KPGxpPjxzdHJvbmc+Q2xpbmljIFNlY3VyaXR5IE1vbml0b3IgLyBSYWZhIE1iZWtpPC9zdHJvbmc+IOKAlCBBNSBPZmZpY2UgLyBSZWNvcmRzLCBvciBiZWhpbmQgQTggRnJvbnQgRGVzayBpZiBjbGluaWMgY2FtZXJhIGFjY2VzcyBtYXR0ZXJzLjwvbGk+CjwvdWw+CjxoMj5GbG9vciBCIOKAlCBSZXB1cnBvc2VkIFJlY292ZXJ5ICZhbXA7IFN1cHBvcnQgV2FyZDwvaDI+CjxoMz5QbGFjZW1lbnQgbm90ZTwvaDM+CjxwPlVzZSB0aGUgdmlzdWFsIG1hcCBvdmVyIG9sZGVyIGxhYmVsIHRleHQuPC9wPgo8cD5JZiBCOSByZWFkcyBhcyBlbGV2YXRvciAvIGxpZnQgYWNjZXNzIG9uIHRoZSBhY3R1YWwgbWFwLCBkbyBub3QgdXNlIGl0IGFzIGEgY291bnNlbG9yIG9mZmljZS4gUGxhY2UgY291bnNlbGxpbmcsIHNwaXJpdHVhbCBzdXBwb3J0LCBhbmQgcXVpZXQgaW50ZXJ2aWV3cyBpbiB0aGUgc21hbGwgcm9vbSBsZWZ0IG9mIEI2IG9yIGluIHRoZSBCNyByZWNvdmVyeS9zdXBwb3J0IGFyZWEgaW5zdGVhZC48L3A+CjxwPkI4IGlzIHRoZSBzZWFsZWQgaXNvbGF0aW9uIHdhcmQgYW5kIG9sZCBjb3Jwb3JhdGUgZXhwZXJpbWVudCBzaXRlLiBJdCBzaG91bGQgdXN1YWxseSBzdGFydCBlbXB0eSBvZiB2aXNpYmxlIE5QQ3MsIGJ1dCBpdCBjYW4gY29udGFpbiBjbHVlIG1hcmtlcnMsIGRhbWFnZSBtYXJrZXJzLCBhbmQgdGhlIGhpZGRlbiByZWNvdmVyZWQgbm90ZWJvb2suPC9wPgo8aDM+U3RhcnRpbmcgdmlzaWJsZSB0b2tlbnM8L2gzPgo8dWw+CjxsaT48c3Ryb25nPktlZXQ8L3N0cm9uZz4g4oCUIEI2IENlbnRyYWwgU3VwcG9ydCBDb3JyaWRvciAvIHdvcmtzaG9wIGFyZWEsIG9yIEI3IFNob3J0LVN0YXkgUmVjb3ZlcnkgLyBmYW1pbHkgc3VwcG9ydCByb29tcy48L2xpPgo8bGk+PHN0cm9uZz5NaXJpIGFuZCBTb2w8L3N0cm9uZz4g4oCUIEI3IFNob3J0LVN0YXkgUmVjb3ZlcnkgLyBmYW1pbHkgc3VwcG9ydCByb29tcywgaWYgdXNlZCBhcyBjaGlsZCB3aXRuZXNzZXMuPC9saT4KPGxpPjxzdHJvbmc+U2lzdGVyIEx1bWE8L3N0cm9uZz4g4oCUIHF1aWV0IGNvbnN1bHRhdGlvbiByb29tIGxlZnQgb2YgQjYsIG9yIEI3IFNob3J0LVN0YXkgUmVjb3ZlcnkgLyBjb3Vuc2VsbGluZyByb29tcy48L2xpPgo8bGk+PHN0cm9uZz5DbGluaWMgU3RhZmYgLyBBdXRvbWF0ZWQgTnVyc2UgLyBHZW5lcmljIFBhdGllbnQgdG9rZW5zPC9zdHJvbmc+IOKAlCBCMiBQcm9jZWR1cmUgLyBFeHRlbmRlZC1DYXJlIFJvb20sIEI3IFNob3J0LVN0YXkgUmVjb3ZlcnkgLyBjb3Vuc2VsbGluZyByb29tcywgb3IgQjEyIFN0YWZmIFJlc3QgLyBPdmVybmlnaHQgU3VwcG9ydCBSb29tIGFzIG5lZWRlZC48L2xpPgo8bGk+PHN0cm9uZz5Gb29kIExpbmUgVm9sdW50ZWVyIC8gQWlkIENvb3JkaW5hdG9yPC9zdHJvbmc+IOKAlCBCNCBTdGFmZiBJbnRha2UgLyBhaWQgY29vcmRpbmF0aW9uIHJvb20sIG9yIEI2IENlbnRyYWwgU3VwcG9ydCBDb3JyaWRvci48L2xpPgo8bGk+PHN0cm9uZz5SZWRsaW5lIFN1cHBseSBSdW5uZXIgLyBWZXggVGFuPC9zdHJvbmc+IOKAlCBCNiBDZW50cmFsIFN1cHBvcnQgQ29ycmlkb3IsIEIxMCBTdGFpcndlbGwgLyBWZXJ0aWNhbCBBY2Nlc3MsIG9yIEIxMSBMb3dlciBFeHRlcmlvciAvIFNlcnZpY2UgQWNjZXNzLjwvbGk+CjxsaT48c3Ryb25nPlRhbGxhIOKAnEF1bnRpZeKAmXMgRXllc+KAnSBWZXk8L3N0cm9uZz4g4oCUIEI0IFN0YWZmIEludGFrZSAvIGFpZCBjb29yZGluYXRpb24gcm9vbSBvciBCNiBDZW50cmFsIFN1cHBvcnQgQ29ycmlkb3IgaWYgdGhlIGFpZC1uZXR3b3JrIHNlY3JldCBpcyBhY3RpdmUuPC9saT4KPC91bD4KPGgzPkRlbGF5ZWQgb3IgR00tbGF5ZXIgdG9rZW5zPC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5NYXJhIOKAnE1vdGhlciBSZWTigJ0gVmV5PC9zdHJvbmc+IOKAlCBCNCBTdGFmZiBJbnRha2UgLyBhaWQgY29vcmRpbmF0aW9uIHJvb20sIG9yIEI2IENlbnRyYWwgU3VwcG9ydCBDb3JyaWRvciBpZiB0aGUgUENzIGRpc2NvdmVyIGhlciBoaWRkZW4gc3VwcG9ydC48L2xpPgo8bGk+PHN0cm9uZz5KdW5vIOKAnFN3aXRjaOKAnSBIYWxlIC8gUmVkbGluZSBDYW1lcmEgU2l0dGVyPC9zdHJvbmc+IOKAlCBCMyBNZWRpY2FsIFJlY29yZHMgLyBNb25pdG9yaW5nIEVxdWlwbWVudCwgb3IgcmVtb3RlIGZlZWQgYWNjZXNzLjwvbGk+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBvYnNlcnZlcjwvc3Ryb25nPiDigJQgQjEgVXBwZXIgUHVibGljIC8gU2VydmljZSBXYWxrd2F5LCBuZWFyIGxpZnQgYWNjZXNzLCBvciBCNSBleHRlcmlvciAvIGxhbmRpbmctYWRqYWNlbnQgYWNjZXNzIGlmIGNvcnBvcmF0ZSBwcmVzc3VyZSBmb2xsb3dzIHRoZSBQQ3MuPC9saT4KPGxpPjxzdHJvbmc+TmFyaW4gUGVsbCBjbHVlIG1hcmtlcjwvc3Ryb25nPiDigJQgQjggU2VhbGVkIElzb2xhdGlvbiBXYXJkLCBCMTIgU3RhZmYgUmVzdCAvIE92ZXJuaWdodCBTdXBwb3J0IFJvb20sIG9yIHRoZSByb3V0ZSBiZXR3ZWVuIHRoZW0uPC9saT4KPGxpPjxzdHJvbmc+TGFsYSBNaXIgY2x1ZSBtYXJrZXI8L3N0cm9uZz4g4oCUIEI2IENlbnRyYWwgU3VwcG9ydCBDb3JyaWRvciwgQjEwIFN0YWlyd2VsbCAvIFZlcnRpY2FsIEFjY2Vzcywgb3IgQjExIExvd2VyIEV4dGVyaW9yIC8gU2VydmljZSBBY2Nlc3MuPC9saT4KPGxpPjxzdHJvbmc+UmVjb3ZlcmVkIE5vdGVib29rIG1hcmtlcjwvc3Ryb25nPiDigJQgaGlkZGVuIGluIEI4IGJlaGluZCBhIGxvb3NlIHdhbGwgb3IgbWFpbnRlbmFuY2UgcGFuZWwuPC9saT4KPGxpPjxzdHJvbmc+T2xkIEJ1cm4tUGF0dGVybiBtYXJrZXI8L3N0cm9uZz4g4oCUIEI4LCB2aXNpYmxlIGFmdGVyIGludmVzdGlnYXRpb24gb3Igd2hlbiBQQ3MgZXhhbWluZSB0aGUgd2FyZCBjbG9zZWx5LjwvbGk+CjxsaT48c3Ryb25nPkRlbGV0ZWQgQ2FtZXJhIExvZyBtYXJrZXI8L3N0cm9uZz4g4oCUIEIzIG1vbml0b3JpbmcgZXF1aXBtZW50IG9yIEI4IGxvY2FsIGNhbWVyYSB0ZXJtaW5hbC48L2xpPgo8L3VsPgo8aDM+QjggaW52ZXN0aWdhdGlvbiBtYXJrZXJzPC9oMz4KPHA+VXNlIHRoZXNlIGFzIEdNLWxheWVyIG5vdGVzIHJhdGhlciB0aGFuIHZpc2libGUgdG9rZW5zIGF0IHNjZW5lIHN0YXJ0LjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5TY29yY2ggbWFya3M8L3N0cm9uZz4g4oCUIHVuZGVyIGZyZXNoIHdhbGwgY29hdGluZyBvciBiZWhpbmQgbW92ZWQgZXF1aXBtZW50LjwvbGk+CjxsaT48c3Ryb25nPlBvd2VyZWQtYXJtb3IgZW50cnkgZGFtYWdlPC9zdHJvbmc+IOKAlCBkb29yIGZyYW1lLCBidWxraGVhZCwgb3IgZmxvb3IgZ291Z2VzLjwvbGk+CjxsaT48c3Ryb25nPk1lbHRlZCBtZWRpY2FsIGVxdWlwbWVudDwvc3Ryb25nPiDigJQgZXZpZGVuY2Ugb2YgaW5jZW5kaWFyeSBjbGVhbnVwLjwvbGk+CjxsaT48c3Ryb25nPlN0ZXJpbGl6ZWQgZHJhaW4gcmVzaWR1ZTwvc3Ryb25nPiDigJQgYmlvbG9naWNhbCB0cmFjZSB0aGF0IHN1cnZpdmVkIGNsZWFuaW5nLjwvbGk+CjxsaT48c3Ryb25nPlNlYWxlZCBzZXJ2aWNlIGdhcDwvc3Ryb25nPiDigJQgcG9pbnRzIHRvd2FyZCB0aGUgZXNjYXBlIHJvdXRlIG9mIHRoZSBNb2RlbCAxcy48L2xpPgo8bGk+PHN0cm9uZz5SZWNvdmVyZWQgTm90ZWJvb2s8L3N0cm9uZz4g4oCUIGNvbmZpcm1zIHRoZSBvcGVyYXRpb24gd2FzIGRlbGliZXJhdGUgYW5kIHRoYXQgc21hbGwgZmx5aW5nIGZvcm1zIGVzY2FwZWQuPC9saT4KPC91bD4KPGgzPldoYXQgQjggc2hvdWxkIHJldmVhbDwvaDM+CjxwPkI4IHNob3VsZCBub3QgcmV2ZWFsIHRoZSBjdXJyZW50IGhpZGRlbiBuZXN0IGRpcmVjdGx5LjwvcD4KPHA+SXQgc2hvdWxkIHJldmVhbDo8L3A+Cjx1bD4KPGxpPnRoZSBjb3Jwb3JhdGlvbiByYW4gaWxsZWdhbCBBbnRpdGhlc2lzIGJpb2xvZ2ljYWwgcmVzZWFyY2ggaGVyZSw8L2xpPgo8bGk+dGhlIGZpcnN0IG5lc3QgZm9ybWVkIGhlcmUgb3IgaW4gdGhlIGNvbm5lY3RlZCBxdWFyYW50aW5lIHN5c3RlbSw8L2xpPgo8bGk+cmVzZWFyY2hlcnMgYW5kIHN0YWZmIGRpZWQsPC9saT4KPGxpPmNvcnBvcmF0ZSBwb3dlcmVkLWFybW9yIHRlYW1zIGJ1cm5lZCB0aGUgc2l0ZSBjbGVhbiw8L2xpPgo8bGk+dGhlIGNvcnBvcmF0aW9uIGJlbGlldmVkIHRoZSBwcmltYXJ5IG5lc3Qgd2FzIG5ldXRyYWxpemVkLDwvbGk+CjxsaT5hbmQgc2V2ZXJhbCBNb2RlbCAxcyBlc2NhcGVkIGJlZm9yZSB0aGUgY2xlYW51cCB3YXMgY29tcGxldGUuPC9saT4KPC91bD4KPHA+VGhhdCBwb2ludHMgdGhlIFBDcyB0b3dhcmQgdGhlIHJlYWwgcXVlc3Rpb246PC9wPgo8YmxvY2txdW90ZT5JZiBCOCB3YXMgYnVybmVkIG91dCwgd2hlcmUgZGlkIHRoZSBlc2NhcGVkIE1vZGVsIDFzIGdvPzwvYmxvY2txdW90ZT4KPGgyPkZsb29yIEMg4oCUIFNlcnZpY2UgLyBVdGlsaXR5PC9oMj4KPGgzPlBsYWNlbWVudCBub3RlPC9oMz4KPHA+Rmxvb3IgQyBpcyBub3cgYSBzZXJ2aWNlLXJvdXRlIGFuZCBtaXNzaW5nLXBlcnNvbiBjbHVlIGZsb29yLCBub3QgdGhlIGRlZmF1bHQgY3VycmVudCBoaWRkZW4gbmVzdCBsb2NhdGlvbi48L3A+CjxwPlVzZSBpdCB0byBzaG93IGhvdyBwZW9wbGUsIGNhbWVyYXMsIG1haW50ZW5hbmNlIGNyZXdzLCBhbmQgUmVkbGluZSByb3V0ZXMgY29ubmVjdCB0aGUgcHVibGljIHN1cHBvcnQgbGV2ZWxzIHRvIEZsb29yIEQuPC9wPgo8aDM+U3RhcnRpbmcgdmlzaWJsZSB0b2tlbnM8L2gzPgo8dWw+CjxsaT48c3Ryb25nPk1haW50ZW5hbmNlIHdvcmtlcihzKTwvc3Ryb25nPiDigJQgQzIgTG9hZGluZyBab25lLCBDNyBXb3Jrc2hvcCwgb3IgQzkgTW9uaXRvcmluZyBPZmZpY2UuPC9saT4KPGxpPjxzdHJvbmc+UmVkbGluZSBMb29rb3V0IFBhaXI8L3N0cm9uZz4g4oCUIEMxIFNlcnZpY2UgU3RyZWV0IG9yIGFub3RoZXIgUmVkbGluZS1jb250cm9sbGVkIHJvdXRlLjwvbGk+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBEcm9uZTwvc3Ryb25nPiDigJQgQzEgU2VydmljZSBTdHJlZXQgb3IgQzEwIEZyZWlnaHQgTGlmdCBpZiBjb3JwIGhhcyBjb21wcm9taXNlZCBsb2dpc3RpY3MuPC9saT4KPC91bD4KPGgzPkRlbGF5ZWQgb3IgR00tbGF5ZXIgdG9rZW5zPC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5KdW5vIOKAnFN3aXRjaOKAnSBIYWxlIC8gUmVkbGluZSBDYW1lcmEgU2l0dGVyPC9zdHJvbmc+IOKAlCBDOSBNb25pdG9yaW5nIE9mZmljZSwgb3IgcmVtb3RlLW9ubHkuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIEZlZWQgSGFuZGxlciAvIE9ybGFuIFBpa2UgY2x1ZTwvc3Ryb25nPiDigJQgQzkgTW9uaXRvcmluZyBPZmZpY2UsIGlmIHlvdSB3YW50IGEgZG91YmxlLWFsbGVnaWFuY2UgcmV2ZWFsLjwvbGk+CjxsaT48c3Ryb25nPkJleCBBcmFuZGEgY2x1ZSBtYXJrZXI8L3N0cm9uZz4g4oCUIEMxIFNlcnZpY2UgU3RyZWV0LCBDOSBNb25pdG9yaW5nIE9mZmljZSBmb290YWdlLCBvciBzZXJ2aWNlLWdhcCBldmlkZW5jZS48L2xpPgo8bGk+PHN0cm9uZz5Pc2thciBWZW5uIGNsdWUgbWFya2VyPC9zdHJvbmc+IOKAlCBDNiBIVkFDIC8gQWlyIEhhbmRsaW5nIG9yIEM3IFdvcmtzaG9wLiBUb29sIGNhcnQsIHJhZGlvIGxvZywgYW5kIGRyYWcgbWFya3MuPC9saT4KPGxpPjxzdHJvbmc+TWFpbnRlbmFuY2UgYWNjZXNzIG1hcmtlcjwvc3Ryb25nPiDigJQgcG9pbnRzIGZyb20gRmxvb3IgQyBzZXJ2aWNlIGluZnJhc3RydWN0dXJlIHRvd2FyZCBGbG9vciBEIEQ5L0QxMS48L2xpPgo8L3VsPgo8aDM+QW50aXRoZXNpcyB1c2Ugb24gRmxvb3IgQzwvaDM+CjxwPkRvIG5vdCBwbGFjZSB0aGUgYWN0aXZlIG5lc3QgaGVyZSBieSBkZWZhdWx0LjwvcD4KPHA+UG9zc2libGUgZm9yZXNoYWRvd2luZzo8L3A+Cjx1bD4KPGxpPjxzdHJvbmc+RGlzdGFudCBjbGlja2luZyBtYXJrZXI8L3N0cm9uZz4g4oCUIEdNLWxheWVyIG5vdGUgbmVhciBhIHNlcnZpY2Ugc2hhZnQuPC9saT4KPGxpPjxzdHJvbmc+T3JnYW5pYyByZXNpZHVlIG1hcmtlcjwvc3Ryb25nPiDigJQgR00tbGF5ZXIgbm90ZSBpbiBDNiwgQzksIG9yIEMxMi48L2xpPgo8bGk+PHN0cm9uZz5KdXZlbmlsZSBNb2RlbCAzIGdsaW1wc2U8L3N0cm9uZz4g4oCUIGRlbGF5ZWQvY29uZGl0aW9uYWwgb25seTsgaXQgcmV0cmVhdHMgdG93YXJkIEZsb29yIEQuPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMSBtb3ZlbWVudCB0cmFjZTwvc3Ryb25nPiDigJQgZm9vdGFnZSBvciBzb3VuZCwgbm90IG5lY2Vzc2FyaWx5IGEgdmlzaWJsZSBmaWdodC48L2xpPgo8L3VsPgo8cD5GbG9vciBDIHNob3VsZCBwb2ludCB0b3dhcmQgRmxvb3IgRCByYXRoZXIgdGhhbiBlbmRpbmcgdGhlIG15c3RlcnkuPC9wPgo8aDI+Rmxvb3IgRCDigJQgUXVhcmFudGluZSBJbmNpZGVudCAvIEhpZGRlbiBOZXN0PC9oMj4KPGgzPlBsYWNlbWVudCBub3RlPC9oMz4KPHA+Rmxvb3IgRCBpcyB0aGUgbWFpbiBhY3RpdmUgaGlkZGVuLW5lc3QgZmxvb3IuPC9wPgo8cD5UaGUgb2xkIGRlc3Ryb3llZCBuZXN0IHJlbWFpbnMgYXJlIGluIDxzdHJvbmc+RDggQ29udGFpbm1lbnQgQ2hhbWJlcjwvc3Ryb25nPi4gVGhlIGFjdGl2ZSBzZWNvbmQgbmVzdCBpcyBkZWVwZXIgb24gdGhlIHNhbWUgZmxvb3IsIHVzdWFsbHkgY29ubmVjdGVkIHRocm91Z2ggPHN0cm9uZz5EOSBTZXJ2aWNlIEJ5cGFzczwvc3Ryb25nPiwgPHN0cm9uZz5EMTEgRW1lcmdlbmN5IFN0YWlyIC8gTGFkZGVyd2VsbDwvc3Ryb25nPiwgb3IgYSBoaWRkZW4gY2F2aXR5L2luZmVzdGVkIHpvbmUgdGhlIEdNIG1heSBsYWJlbCA8c3Ryb25nPkQxMyBBY3RpdmUgSGlkZGVuIE5lc3Q8L3N0cm9uZz4uPC9wPgo8cD5UaGUgZmxvb3Igc2hvdWxkIGJlIHBhcnRpYWxseSBpbmZlc3RlZDogZW5vdWdoIHRvIGZlZWwgZGFuZ2Vyb3VzLCBidXQgbm90IHNvIG9idmlvdXMgdGhhdCB0aGUgcGxheWVycyBzZWUgdGhlIGVudGlyZSBuZXN0IGltbWVkaWF0ZWx5LjwvcD4KPGgzPlN0YXJ0aW5nIHZpc2libGUgaHVtYW4gdG9rZW5zPC9oMz4KPHA+VXN1YWxseSBub25lLCB1bmxlc3MgdGhlIFBDcyBhcnJpdmUgZHVyaW5nIHRoZSBpbmNpZGVudC48L3A+CjxwPlBvc3NpYmxlIHZpc2libGUgdG9rZW5zIGlmIHRoZXkgYXJyaXZlIGJlZm9yZSBmdWxsIGJyZWFjaDo8L3A+Cjx1bD4KPGxpPjxzdHJvbmc+U2lnbmFsLVRvdWNoZWQgUGF0aWVudCAvIEV4cG9zZWQgUGF0aWVudDwvc3Ryb25nPiDigJQgRDcgUGF0aWVudCBIb2xkaW5nIFJvb21zLjwvbGk+CjxsaT48c3Ryb25nPkNsaW5pYyB0ZWNobmljaWFuPC9zdHJvbmc+IOKAlCBENSBEaWFnbm9zdGljcyBMYWIgb3IgRDYgQ29udHJvbCBSb29tLjwvbGk+CjxsaT48c3Ryb25nPkRyLiBWZWxhIE15dW5nPC9zdHJvbmc+IOKAlCBENSBEaWFnbm9zdGljcyBMYWIgb3IgRDcgUGF0aWVudCBIb2xkaW5nIFJvb21zIGlmIHNoZSBpcyB0cmFwcGVkIG9yIHRyZWF0aW5nIHNvbWVvbmUuPC9saT4KPGxpPjxzdHJvbmc+Q29ycG9yYXRlIFJlY292ZXJ5IFBhaXI8L3N0cm9uZz4g4oCUIEQzIENlbnRyYWwgSW5jaWRlbnQgSGFsbCBvciBENiBDb250cm9sIFJvb20gaWYgY29ycCBnb3QgdGhlcmUgZmlyc3QuPC9saT4KPGxpPjxzdHJvbmc+Q2xpbmljIFN0YWZmIC8gQXV0b21hdGVkIE51cnNlIC8gR2VuZXJpYyBQYXRpZW50IHRva2Vuczwvc3Ryb25nPiDigJQgRDcgUGF0aWVudCBIb2xkaW5nIFJvb21zIG9yIEQxMiBOaWdodENyYXNoIEFycml2YWwgUm91dGUgaWYgZXZhY3VhdGlvbiBoYXMgYmVndW4uPC9saT4KPC91bD4KPGgzPkRlbGF5ZWQgb3IgR00tbGF5ZXIgaHVtYW4gdG9rZW5zPC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5Db21tYW5kZXIgSWxhbiBSdXNrPC9zdHJvbmc+IOKAlCBENiBDb250cm9sIFJvb20sIEQ4IENvbnRhaW5tZW50IENoYW1iZXIgZW50cmFuY2UsIG9yIG9mZi1tYXAgdW50aWwgY29ycG9yYXRlIHByZXNzdXJlIGVzY2FsYXRlcy48L2xpPgo8bGk+PHN0cm9uZz5MdC4gVmFyeWEgU2Vubjwvc3Ryb25nPiDigJQgRDMgQ2VudHJhbCBJbmNpZGVudCBIYWxsLCBEOCBhcHByb2FjaCwgb3IgRDkgaWYgdGhlIHRhY3RpY2FsIGZpZ2h0IGVzY2FsYXRlcy48L2xpPgo8bGk+PHN0cm9uZz5NYXJhIFNpbGV4PC9zdHJvbmc+IOKAlCBENSBEaWFnbm9zdGljcyBMYWIgb3IgRDcgUGF0aWVudCBIb2xkaW5nIFJvb21zIGlmIHlvdSB3YW50IHRoZSBjb3Jwb3JhdGUgbWVkaWMgLyBwb3NzaWJsZSBpbmZvcm1hbnQgYW5nbGUuPC9saT4KPGxpPjxzdHJvbmc+T3JsYW4gUGlrZTwvc3Ryb25nPiDigJQgRDYgQ29udHJvbCBSb29tIG9yIHJlbW90ZS1vbmx5IGlmIHRoZSBjYW1lcmEvbG9nIG1hbmlwdWxhdGlvbiB0aHJlYWQgaXMgYWN0aXZlLjwvbGk+CjxsaT48c3Ryb25nPkhhbGRlbiBSb29rIGV2aWRlbmNlIG1hcmtlcjwvc3Ryb25nPiDigJQgRDYgQ29udHJvbCBSb29tIGxvZ3MgYW5kIGRlbGV0ZWQgYW5ub3RhdGlvbnMuPC9saT4KPGxpPjxzdHJvbmc+TmlnaHRDcmFzaDwvc3Ryb25nPiDigJQgRDEvRDEyIGVtZXJnZW5jeSBhcnJpdmFsIHJvdXRlIGlmIGVtZXJnZW5jeSBpbnRlcnZlbnRpb24gaXMgbmVlZGVkLCBvciBhZnRlciB0aGUgY2xpbWF4IGFzIHJlY29nbml0aW9uL2V4dHJhY3Rpb24uPC9saT4KPGxpPjxzdHJvbmc+VGhlIFNpcmVuIFNhaW50PC9zdHJvbmc+IOKAlCBEMSBvciB0aGUgRmxvb3IgQiBsYW5kaW5nIHBhZCwgZGVwZW5kaW5nIG9uIGN1cnJlbnQgbWFwIHNldHVwLjwvbGk+CjxsaT48c3Ryb25nPkd1cm5leSBBbmdlbHM8L3N0cm9uZz4g4oCUIEQxMiBOaWdodENyYXNoIEFycml2YWwgUm91dGUsIG1vdmluZyB0b3dhcmQgRDcsIEQzLCBvciBEMTMgaWYgZXZhY3VhdGlvbiBiZWdpbnMuPC9saT4KPC91bD4KPGgzPkV2aWRlbmNlIG1hcmtlcnM8L2gzPgo8cD5QbGFjZSB0aGVzZSBhcyBHTS1sYXllciB0ZXh0IG5vdGVzLjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5bRDUgUkVMQVkgLyBUUklBTCBSRUNPUkRTXTwvc3Ryb25nPiDigJQgZGlhZ25vc3RpY3MgYW5kIHBhdGllbnQtdHJpYWwgZGF0YS48L2xpPgo8bGk+PHN0cm9uZz5bRDYgSEFMREVOIExPR108L3N0cm9uZz4g4oCUIGZvb3RhZ2Ugb2YgTW9kZWwgMXMgbGVhdmluZyB0aGUgb2xkIG5lc3QgaW4gZm9ybWF0aW9uLjwvbGk+CjxsaT48c3Ryb25nPltENiBERUxFVEVEIFJJU0sgVEFHXTwvc3Ryb25nPiDigJQg4oCcbmVzdC1zZWVkaW5nIHBvc3NpYmlsaXR5LuKAnTwvbGk+CjxsaT48c3Ryb25nPltEOCBPTEQgTkVTVCBSRU1BSU5TXTwvc3Ryb25nPiDigJQgZGVzdHJveWVkIHZpc2libGUgbmVzdC48L2xpPgo8bGk+PHN0cm9uZz5bRDggQ0xFQU5VUCBCVVJOU108L3N0cm9uZz4g4oCUIHBvd2VyZWQtYXJtb3IgLyBpbmNlbmRpYXJ5IGNsZWFudXAuPC9saT4KPGxpPjxzdHJvbmc+W0Q5IEVTQ0FQRSBWRUNUT1JdPC9zdHJvbmc+IOKAlCBNb2RlbCAxcyBmbGVkIHRocm91Z2ggdGhpcyByb3V0ZS48L2xpPgo8bGk+PHN0cm9uZz5bRDcgRFJBRyBNQVJLU108L3N0cm9uZz4g4oCUIGN1cnJlbnQgTW9kZWwgMyBodW50aW5nIHBhdHRlcm4uPC9saT4KPGxpPjxzdHJvbmc+W0QxMSBGTEFOSyBST1VURV08L3N0cm9uZz4g4oCUIGVtZXJnZW5jeSBzdGFpciAvIGxhZGRlcndlbGwgbW92ZW1lbnQuPC9saT4KPGxpPjxzdHJvbmc+W0QxMyBBQ1RJVkUgTkVTVF08L3N0cm9uZz4g4oCUIGhpZGRlbiB1bnRpbCBkaXNjb3ZlcmVkLjwvbGk+CjwvdWw+CjxoMz5BbnRpdGhlc2lzIHN0YXJ0aW5nIHN0YXRlPC9oMz4KPHA+VXNlIHRoZSBHTSBsYXllciBmb3IgaGlkZGVuIGNyZWF0dXJlcyB1bnRpbCB0aGUgUENzIGRpc2NvdmVyIG9yIHRyaWdnZXIgdGhlbS48L3A+CjxwPlJlY29tbWVuZGVkIGRlZmF1bHQ6PC9wPgo8dWw+CjxsaT48c3Ryb25nPk9sZCBOZXN0IFJlbWFpbnM8L3N0cm9uZz4g4oCUIEQ4IENvbnRhaW5tZW50IENoYW1iZXIuIEVudmlyb25tZW50YWwgbWFya2VyLCBub3QgYW4gYWN0aXZlIGNyZWF0dXJlLjwvbGk+CjxsaT48c3Ryb25nPk1vZGVsIDEgSnV2ZW5pbGU8L3N0cm9uZz4g4oCUIGhpZGRlbiBuZWFyIEQ5IFNlcnZpY2UgQnlwYXNzLjwvbGk+CjxsaT48c3Ryb25nPk1vZGVsIDEgSnV2ZW5pbGU8L3N0cm9uZz4g4oCUIGhpZGRlbiBuZWFyIEQzL0Q0IHRyYW5zaXRpb24uPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMSBKdXZlbmlsZTwvc3Ryb25nPiDigJQgaGlkZGVuIG5lYXIgRDEzIEFjdGl2ZSBIaWRkZW4gTmVzdC48L2xpPgo8bGk+PHN0cm9uZz5Nb2RlbCAxIEp1dmVuaWxlPC9zdHJvbmc+IOKAlCBvcHRpb25hbCBleHRyYSBuZWFyIEQxMSBpZiB5b3Ugd2FudCBzdHJvbmdlciBpbmZlc3RhdGlvbiBwcmVzc3VyZS48L2xpPgo8bGk+PHN0cm9uZz5Nb2RlbCAxIEFkb2xlc2NlbnQ8L3N0cm9uZz4g4oCUIGhpZGRlbiBuZWFyIEQxMyBBY3RpdmUgSGlkZGVuIE5lc3QuPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMSBTZWVkIENsdW1wIC8gQWN0aXZlIE5lc3QgQ29yZTwvc3Ryb25nPiDigJQgRDEzIEFjdGl2ZSBIaWRkZW4gTmVzdC48L2xpPgo8bGk+PHN0cm9uZz5KdXZlbmlsZSBNb2RlbCAzPC9zdHJvbmc+IOKAlCByb2FtaW5nIGh1bnRlciBiZXR3ZWVuIEQ3LCBEOSwgRDExLCBhbmQgRDEzLjwvbGk+CjxsaT48c3Ryb25nPkp1dmVuaWxlIE1vZGVsIDM8L3N0cm9uZz4g4oCUIG9wdGlvbmFsIHNlY29uZCBodW50ZXIgbmVhciBEMTEgb3IgRDEzLjwvbGk+CjxsaT48c3Ryb25nPk1vdGUgU3dhcm08L3N0cm9uZz4g4oCUIG9wdGlvbmFsIHByZXNzdXJlIGluIEQzLCBEOCwgb3IgdGhlIEQ5IGFwcHJvYWNoLjwvbGk+CjwvdWw+CjxwPkhhcmQgdmVyc2lvbjo8L3A+Cjx1bD4KPGxpPkFkZCBvbmUgZXh0cmEgPHN0cm9uZz5KdXZlbmlsZSBNb2RlbCAzPC9zdHJvbmc+LjwvbGk+CjxsaT5BZGQgb25lIDxzdHJvbmc+TW9kZWwgMyBBZG9sZXNjZW50PC9zdHJvbmc+IGFzIGEgYm9zcyAvIGRlZmVuZGVyLjwvbGk+CjxsaT5JbmNyZWFzZSByZXNjdWUgcHJlc3N1cmUgcmF0aGVyIHRoYW4gb25seSBpbmNyZWFzaW5nIGVuZW15IGNvdW50LjwvbGk+CjwvdWw+CjxwPkRvIG5vdCB1c2UgYnkgZGVmYXVsdDo8L3A+Cjx1bD4KPGxpPjxzdHJvbmc+TW9kZWwgMyBBZHVsdDwvc3Ryb25nPiDigJQgY2FtcGFpZ24tc2NhbGUgdGhyZWF0OyB1c2Ugb25seSBhcyB1bmZpbmlzaGVkIGVtZXJnZW5jZSwgY291bnRkb3duLCBvciBsYXRlci1jYW1wYWlnbiBwcm9ibGVtLjwvbGk+CjwvdWw+CjxoMz5TdWdnZXN0ZWQgcmV2ZWFsIHNlcXVlbmNlPC9oMz4KPG9sPgo8bGk+UENzIGVudGVyIEZsb29yIEQgYW5kIGVuY291bnRlciBjbGVhbiBxdWFyYW50aW5lIGFyY2hpdGVjdHVyZS48L2xpPgo8bGk+RDUvRDYgcmV2ZWFsIHNhbml0aXplZCByZWNvcmRzLCBkZWxldGVkIGZvb3RhZ2UsIGFuZCB0aGUgcmVsYXnigJlzIGV2aWRlbmNlLjwvbGk+CjxsaT5EOCByZXZlYWxzIHRoZSBkZXN0cm95ZWQgb2xkIG5lc3QgYW5kIGNvcnBvcmF0ZSBjbGVhbnVwLjwvbGk+CjxsaT5EOSByZXZlYWxzIHRoZSBNb2RlbCAxIGVzY2FwZSB2ZWN0b3IuPC9saT4KPGxpPkQ3L0QxMSBzaG93IGN1cnJlbnQgZHJhZyBtYXJrcyBhbmQgaHVudGluZyBhY3Rpdml0eS48L2xpPgo8bGk+TW9kZWwgMXMgYXBwZWFyIGZpcnN0IGFzIG1vdmVtZW50LCBub2lzZSwgYW5kIHN3YXJtIHByZXNzdXJlLjwvbGk+CjxsaT5BIEp1dmVuaWxlIE1vZGVsIDMgYXR0YWNrcywgcmV0cmVhdHMsIG9yIGRyYWdzIHByZXkgdG93YXJkIHRoZSBuZXN0LjwvbGk+CjxsaT5QQ3MgZGlzY292ZXIgRDEzIEFjdGl2ZSBIaWRkZW4gTmVzdC48L2xpPgo8bGk+RmluYWxlIGNob2ljZTogZGVzdHJveSwgY29udGFpbiwgcmVzY3VlLCBleHRyYWN0IGV2aWRlbmNlLCBvciBzdXJ2aXZlIGxvbmcgZW5vdWdoIGZvciBoZWxwLjwvbGk+Cjwvb2w+CjxoMj5TY2hvb2xjaGlsZHJlbiBvdmVyaGVhcmQgY29udmVyc2F0aW9uPC9oMj4KPHA+VXNlIDxzdHJvbmc+TWlyaSBhbmQgU29sPC9zdHJvbmc+IHRvIHJldmVhbCDigJxBdW50aWUgUmVk4oCdIG5hdHVyYWxseS48L3A+CjxwPlBvc3NpYmxlIG92ZXJoZWFyZCBsaW5lczo8L3A+CjxibG9ja3F1b3RlPuKAnEF1bnRpZSBSZWQgcGFpZCBmb3IgYnJlYWtmYXN0IGFnYWluLuKAnTwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcRG9u4oCZdCBjYWxsIGhlciB0aGF0IHdoZXJlIGdyb3duLXVwcyBoZWFyLuKAnTwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcV2h5P+KAnTwvYmxvY2txdW90ZT4KPHA+Jmd0OzwvcD4KPGJsb2NrcXVvdGU+4oCcQmVjYXVzZSBzaGUgZ2V0cyBtYWQgd2hlbiBwZW9wbGUga25vdyBzaGXigJlzIG5pY2Uu4oCdPC9ibG9ja3F1b3RlPgo8cD5JZiB0aGUgUENzIGludGVyYWN0IGtpbmRseSwgdGhlIGNoaWxkcmVuIGNhbiBjbGFyaWZ5OjwvcD4KPHVsPgo8bGk+TWFyYSBzZW5kcyBmb29kIHRocm91Z2ggcGVvcGxlIHdobyBwcmV0ZW5kIGl0IGNhbWUgZnJvbSBzb21ld2hlcmUgZWxzZS48L2xpPgo8bGk+QWR1bHRzIGFjdCBzY2FyZWQgd2hlbiBjaGlsZHJlbiBjYWxsIGhlciBBdW50aWUgUmVkLjwvbGk+CjxsaT5CbHVld2lyZSB1c2VkIHRvIGJyaW5nIGNyYXRlcyBhbmQgam9rZSB3aXRoIHRoZW0sIGJ1dCBub3cgaGUgc2NhcmVzIHRoZW0uPC9saT4KPGxpPktlZXQgc2F3IHNvbWV0aGluZyBpbXBvcnRhbnQgYnV0IGlzIHRyeWluZyB0byBhY3QgYnJhdmUuPC9saT4KPC91bD4KPGgyPkNvbnRyb2wgcm9vbSBOUENzPC9oMj4KPGgzPkNsaW5pYyBTZWN1cml0eSBNb25pdG9yIC8gUmFmYSBNYmVraTwvaDM+CjxwPlVzZSBhcyBhIGNvb3BlcmF0aW9uIHBvaW50LCBub3QganVzdCBhIGhhY2tpbmcgb2JzdGFjbGUuPC9wPgo8cD5UaGV5IGNhbiBwcm92aWRlOjwvcD4KPHVsPgo8bGk+Y2FtZXJhIGxvb2t1cHM8L2xpPgo8bGk+ZG9vciBsb2dzPC9saT4KPGxpPnBhdGllbnQgbW92ZW1lbnQgcmVjb3JkczwvbGk+CjxsaT5lbGV2YXRvciB1c2UgcmVjb3JkczwvbGk+CjxsaT5lbWVyZ2VuY3kgaW50YWtlIGZvb3RhZ2U8L2xpPgo8bGk+cGFydGlhbCByZWNvdmVyeS13aW5nIGFjY2VzcyB3aXRoIHByaXZhY3kgbGltaXRzPC9saT4KPC91bD4KPHA+VGhleSBjb29wZXJhdGUgaWY6PC9wPgo8dWw+CjxsaT5Eci4gVmFsZXogYXBwcm92ZXM8L2xpPgo8bGk+UENzIGhlbHAgcGF0aWVudHM8L2xpPgo8bGk+UENzIGF2b2lkIHRocmVhdGVuaW5nIHN0YWZmPC9saT4KPGxpPlBDcyBleHBsYWluIGEgY29uY3JldGUgc2FmZXR5IHJlYXNvbjwvbGk+CjwvdWw+CjxoMz5SZWRsaW5lIENhbWVyYSBTaXR0ZXIgLyBKdW5vIOKAnFN3aXRjaOKAnSBIYWxlPC9oMz4KPHA+VW5vZmZpY2lhbCwgcGF0Y2hlZC10b2dldGhlciwgYW5kIG1vcmUgY2FwYWJsZSB0aGFuIGV4cGVjdGVkLjwvcD4KPHA+VGhleSBjYW4gcHJvdmlkZTo8L3A+Cjx1bD4KPGxpPnNpZGUgY29ycmlkb3IgZmVlZHM8L2xpPgo8bGk+c3RyZWV0IGFwcHJvYWNoIGZlZWRzPC9saT4KPGxpPmJsaW5kIHNwb3QgbG9jYXRpb25zPC9saT4KPGxpPmdhbmcgbG9va291dCByZXBvcnRzPC9saT4KPGxpPmhpZGRlbiBzdXBwbHktcm91dGUgZm9vdGFnZTwvbGk+CjwvdWw+CjxwPlRoZXkgY29vcGVyYXRlIGlmOjwvcD4KPHVsPgo8bGk+TWFyYSBhcHByb3ZlczwvbGk+CjxsaT5QQ3MgdHJlYXQgdGhlIFJlZGxpbmUgQ2hvaXIgYXMgYSBjb21tdW5pdHkgYWN0b3I8L2xpPgo8bGk+UENzIG5lZWQgZm9vdGFnZSB0byBwcm90ZWN0IGxvY2FsczwvbGk+CjxsaT5QQ3Mgb2ZmZXIgY29uY3JldGUgcmVjaXByb2NpdHk8L2xpPgo8L3VsPgo8cD5Qb3NzaWJsZSBhZGRpdGlvbmFsIGFsbGVnaWFuY2U6PC9wPgo8cD5UaGUgUmVkbGluZSBDYW1lcmEgU2l0dGVyIG1heSBhbHNvIGJlIHNlbGxpbmcgc2VsZWN0ZWQgZmVlZCBhY2Nlc3MgdG8gY29ycG9yYXRlIHJlY292ZXJ5LCBub3Qgb3V0IG9mIGlkZW9sb2d5LCBidXQgdG8gcGF5IGZvciBtZWRpY2luZSwgZGVidCwgb3IgZmFtaWx5IHByb3RlY3Rpb24uPC9wPgo8cD5UaGlzIHNob3VsZCBiZSBkaXNjb3ZlcmFibGUgYW5kIG5lZ290aWFibGUsIG5vdCBhbiBhdXRvbWF0aWMgYmV0cmF5YWwgZmlnaHQuPC9wPgo8aDI+TmFtZWQgTlBDIHBsYWNlbWVudCBpbmRleDwvaDI+CjxoMz5NZXJjeSBUd2VsdmUgLyBjbGluaWMgc2lkZTwvaDM+Cjx1bD4KPGxpPjxzdHJvbmc+RHIuIFNlcmEgVmFsZXo8L3N0cm9uZz4g4oCUIEZsb29yIEEgQTgsIEE3LCBBMywgb3IgQTUuIERlbGF5ZWQgb3IgR00tbGF5ZXIgdW5sZXNzIHNoZSBpcyBicmllZmluZyB0aGUgUENzLjwvbGk+CjxsaT48c3Ryb25nPkRyLiBWZWxhIE15dW5nPC9zdHJvbmc+IOKAlCBGbG9vciBBIEEzLCBGbG9vciBEIEQ1LCBvciBENy48L2xpPgo8bGk+PHN0cm9uZz5TZW5pb3IgTnVyc2UgSW1hbmkgQ2hvPC9zdHJvbmc+IOKAlCBGbG9vciBBIEE4LCBBNywgb3IgQTYuPC9saT4KPGxpPjxzdHJvbmc+T3JkZXJseSBQYXggUnV1bjwvc3Ryb25nPiDigJQgRmxvb3IgQSBBNiBvciBBMTEuPC9saT4KPGxpPjxzdHJvbmc+UmFmYSBNYmVraTwvc3Ryb25nPiDigJQgRmxvb3IgQSBBNS9BOCwgRmxvb3IgQiBCMywgb3IgRmxvb3IgRCBENiBpZiBmZWVkcyBtYXR0ZXIuPC9saT4KPGxpPjxzdHJvbmc+U2lzdGVyIEx1bWE8L3N0cm9uZz4g4oCUIEZsb29yIEIgcXVpZXQgY29uc3VsdGF0aW9uIHJvb20gbGVmdCBvZiBCNiwgb3IgQjcuPC9saT4KPC91bD4KPGgzPlJlZGxpbmUgQ2hvaXIgLyBjb21tdW5pdHkgc2lkZTwvaDM+Cjx1bD4KPGxpPjxzdHJvbmc+TWFyYSDigJxNb3RoZXIgUmVk4oCdIFZleTwvc3Ryb25nPiDigJQgRmxvb3IgQSBBMS9BMTMgaWYgbmVnb3RpYXRpb24gZXNjYWxhdGVzOyBGbG9vciBCIEI0L0I2IGlmIFBDcyBkaXNjb3ZlciBoZXIgYWlkIG5ldHdvcmsuIFVzdWFsbHkgZGVsYXllZCBvciBHTS1sYXllci48L2xpPgo8bGk+PHN0cm9uZz5Ob3gg4oCcQmx1ZXdpcmXigJ0gS2FkZTwvc3Ryb25nPiDigJQgRmxvb3IgQSBBNi9BNy9BMTMuPC9saT4KPGxpPjxzdHJvbmc+SnVubyDigJxTd2l0Y2jigJ0gSGFsZTwvc3Ryb25nPiDigJQgRmxvb3IgQiBCMywgRmxvb3IgQyBDOSwgb3IgcmVtb3RlLW9ubHkuPC9saT4KPGxpPjxzdHJvbmc+VmV4IFRhbjwvc3Ryb25nPiDigJQgRmxvb3IgQiBCNi9CMTAvQjExLjwvbGk+CjxsaT48c3Ryb25nPlJvb2sg4oCcTWFkc+KAnSBNYWRzZW48L3N0cm9uZz4g4oCUIEZsb29yIEEgQTEvQTEzIG9yIEZsb29yIEMgQzEgc2VydmljZSBhcHByb2FjaC48L2xpPgo8bGk+PHN0cm9uZz5UYWxsYSDigJxBdW50aWXigJlzIEV5ZXPigJ0gVmV5PC9zdHJvbmc+IOKAlCBGbG9vciBCIEI0L0I2LjwvbGk+CjxsaT48c3Ryb25nPkJleCBBcmFuZGE8L3N0cm9uZz4g4oCUIGFic2VudC4gVXNlIGNsdWUgbWFya2VyIGluIEMxL0M5IGZvb3RhZ2Ugb3Igc2VydmljZS1yb3V0ZSBldmlkZW5jZS48L2xpPgo8bGk+PHN0cm9uZz5MYWxlaCDigJxMYWxh4oCdIE1pcjwvc3Ryb25nPiDigJQgYWJzZW50LiBVc2UgY2x1ZSBtYXJrZXIgaW4gQjYvQjEwL0IxMS48L2xpPgo8bGk+PHN0cm9uZz5NaXJpIGFuZCBTb2w8L3N0cm9uZz4g4oCUIEZsb29yIEIgQjcuPC9saT4KPGxpPjxzdHJvbmc+S2VldDwvc3Ryb25nPiDigJQgRmxvb3IgQiBCNiBvciBCNy48L2xpPgo8L3VsPgo8aDM+Q29ycG9yYXRlIFJlY292ZXJ5PC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5Db21tYW5kZXIgSWxhbiBSdXNrPC9zdHJvbmc+IOKAlCBkZWxheWVkL29mZi1tYXAgdW50aWwgY29ycG9yYXRlIHByZXNzdXJlIGVudGVyczsgRmxvb3IgRCBENi9EOCBvciBGbG9vciBBIGVudHJhbmNlIGlmIGNvbmZyb250YXRpb24gaGFwcGVucyBlYXJseS48L2xpPgo8bGk+PHN0cm9uZz5MdC4gVmFyeWEgU2Vubjwvc3Ryb25nPiDigJQgRmxvb3IgRCBEMy9EOC9EOSBvciBGbG9vciBDIHNlcnZpY2UgZW50cnkgaWYgdGFjdGljYWwgcHJlc3N1cmUgZXNjYWxhdGVzLjwvbGk+CjxsaT48c3Ryb25nPk9ybGFuIFBpa2U8L3N0cm9uZz4g4oCUIEZsb29yIEQgRDYsIEZsb29yIEIgQjMsIG9yIHJlbW90ZS1vbmx5LjwvbGk+CjxsaT48c3Ryb25nPk1hcmEgU2lsZXg8L3N0cm9uZz4g4oCUIEZsb29yIEQgRDUvRDc7IHBvc3NpYmxlIGluZm9ybWFudCBhbmdsZS48L2xpPgo8bGk+PHN0cm9uZz5IYWxkZW4gUm9vazwvc3Ryb25nPiDigJQgYWJzZW50L2RlYWQvbWlzc2luZy4gVXNlIGV2aWRlbmNlIG1hcmtlciBpbiBENiBsb2dzIGFuZCByZWxheSByZWNvcmRzLjwvbGk+CjwvdWw+CjxoMz5NaXNzaW5nLXBlcnNvbiAvIGV2aWRlbmNlIE5QQ3M8L2gzPgo8dWw+CjxsaT48c3Ryb25nPk9za2FyIFZlbm48L3N0cm9uZz4g4oCUIGFic2VudC4gVXNlIGNsdWUgbWFya2VyIGluIEZsb29yIEMgSFZBQyAvIHNlcnZpY2UgaW5mcmFzdHJ1Y3R1cmUuPC9saT4KPGxpPjxzdHJvbmc+TmFyaW4gUGVsbDwvc3Ryb25nPiDigJQgYWJzZW50IG9yIHBvc3NpYmxlIHJlc2N1ZSB2aWN0aW0uIFVzZSBjbHVlIG1hcmtlciBpbiBGbG9vciBCIEI4L0IxMiByb3V0ZSBvciBGbG9vciBEIG5lc3QgYXBwcm9hY2guPC9saT4KPGxpPjxzdHJvbmc+VGFtc2luIFF1aWxsPC9zdHJvbmc+IOKAlCBGbG9vciBBIGVtZXJnZW5jeSBpbnRha2UgLyBjbGluaWMgc3RhcnQsIG9yIG9mZi1tYXAvaW5jYXBhY2l0YXRlZCBhZnRlciBkZWxpdmVyaW5nIHRoZSByZWxheS48L2xpPgo8L3VsPgo8aDM+U2FtdXJhaSAvIGVtZXJnZW5jeSByZXNwb25zZTwvaDM+Cjx1bD4KPGxpPjxzdHJvbmc+RmxvcmVuY2Ug4oCcTmlnaHRDcmFzaOKAnSBWYWxlPC9zdHJvbmc+IOKAlCBGbG9vciBEIEQxL0QxMiBpZiBlbWVyZ2VuY3kgaW50ZXJ2ZW50aW9uIGlzIG5lZWRlZCwgb3RoZXJ3aXNlIHBvc3QtZmluYWxlIGNhbWVvLjwvbGk+CjxsaT48c3Ryb25nPlRoZSBTaXJlbiBTYWludDwvc3Ryb25nPiDigJQgRmxvb3IgQiBsYW5kaW5nIHBhZCBvciBGbG9vciBEIEQxIGFjY2VzcywgZGVwZW5kaW5nIG9uIG1hcCBzZXR1cC48L2xpPgo8bGk+PHN0cm9uZz5HdXJuZXkgQW5nZWxzPC9zdHJvbmc+IOKAlCBGbG9vciBEIEQxMiBOaWdodENyYXNoIEFycml2YWwgUm91dGUuPC9saT4KPC91bD4KPGgzPkFudGl0aGVzaXM8L2gzPgo8dWw+CjxsaT48c3Ryb25nPk9sZCBOZXN0IFJlbWFpbnM8L3N0cm9uZz4g4oCUIEZsb29yIEQgRDguPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMSBTZWVkIENsdW1wIC8gQWN0aXZlIE5lc3QgQ29yZTwvc3Ryb25nPiDigJQgRmxvb3IgRCBEMTMuPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMSBKdXZlbmlsZXM8L3N0cm9uZz4g4oCUIEZsb29yIEQgRDkvRDEzLCB3aXRoIG9uZSBwb3NzaWJsZSBlYXJseSBnbGltcHNlIG5lYXIgRDMvRDQuPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMSBBZG9sZXNjZW50PC9zdHJvbmc+IOKAlCBGbG9vciBEIEQxMywgb3B0aW9uYWwgc3Ryb25nZXIgbmVzdCBkZWZlbmRlci48L2xpPgo8bGk+PHN0cm9uZz5Nb3RlIFN3YXJtPC9zdHJvbmc+IOKAlCBGbG9vciBEIEQzL0Q4L0Q5IGFzIHByZXNzdXJlLjwvbGk+CjxsaT48c3Ryb25nPkp1dmVuaWxlIE1vZGVsIDM8L3N0cm9uZz4g4oCUIEZsb29yIEQgRDcvRDkvRDExL0QxMywgcm9hbWluZyBodW50ZXIuPC9saT4KPGxpPjxzdHJvbmc+TW9kZWwgMyBBZG9sZXNjZW50PC9zdHJvbmc+IOKAlCBvcHRpb25hbCBib3NzIC8gaGFyZC1tb2RlIGRlZmVuZGVyLjwvbGk+CjxsaT48c3Ryb25nPk1vZGVsIDMgQWR1bHQ8L3N0cm9uZz4g4oCUIGRvIG5vdCB1c2UgaW4gbm9ybWFsIHN0YXJ0ZXIgdW5sZXNzIGFzIHVuZmluaXNoZWQgZW1lcmdlbmNlIG9yIHRpbWVyLjwvbGk+CjwvdWw+CjxoMj5Ub2tlbiBhcnQgc3RpbGwgbmVlZGVkPC9oMj4KPHA+UHJpb3JpdHkgdG9rZW4gYXJ0OjwvcD4KPG9sPgo8bGk+TmlnaHRDcmFzaCBwb3J0cmFpdC90b2tlbjwvbGk+CjxsaT5UaGUgU2lyZW4gU2FpbnQgdmVoaWNsZSB0b2tlbjwvbGk+CjxsaT5HdXJuZXkgQW5nZWxzIHN0cmV0Y2hlci1kcm9uZSB0b2tlbjwvbGk+CjxsaT5Eci4gU2VyYSBWYWxlejwvbGk+CjxsaT5NYXJhIOKAnE1vdGhlciBSZWTigJ0gVmV5PC9saT4KPGxpPkJsdWV3aXJlPC9saT4KPGxpPkNvbW1hbmRlciBSdXNrPC9saT4KPGxpPk1vdGUgU3dhcm08L2xpPgo8bGk+UmVkbGluZSBMb29rb3V0IC8gdW5kZXJsaW5nPC9saT4KPGxpPkNsaW5pYyBzdGFmZiAvIHBhdGllbnQgLyBjaXZpbGlhbiBncm91cHM8L2xpPgo8bGk+TW9kZWwgMSBKdXZlbmlsZTwvbGk+CjxsaT5KdXZlbmlsZSBNb2RlbCAzPC9saT4KPGxpPk1vZGVsIDEgU2VlZCBDbHVtcCAvIEFjdGl2ZSBOZXN0IENvcmU8L2xpPgo8L29sPg=="
  },
  {
    "name": "Signal Bleed - Roll20 Grid and Reveal Notes",
    "source_file": "handouts/19_Roll20_Grid_and_Reveal_Notes.md",
    "notes_b64": "PGgxPlJvbGwyMCBNYXAgU2V0dXA6IEdyaWQsIFNjYWxlLCBhbmQgUmV2ZWFsPC9oMT4KPGgyPkN1cnJlbnQgbWFwIHN0YXR1czwvaDI+CjxwPlRoZSBjdXJyZW50IFNpZ25hbCBCbGVlZCBtYXBzIGFyZSBBSS1nZW5lcmF0ZWQgY29uY2VwdC9wbGF5dGVzdCBtYXBzLiBUaGV5IGluY2x1ZGUgYSB2aXNpYmxlIGdyaWQgYmFrZWQgaW50byB0aGUgaW1hZ2UuPC9wPgo8cD5Gb3Igbm93LCB0aGUgc2ltcGxlc3QgUm9sbDIwIHNldHVwIGlzOjwvcD4KPHByZT5UdXJuIFJvbGwyMCBncmlkIGRpc3BsYXkgb2ZmIGZvciB0aGVzZSBwYWdlcy4KVXNlIHRoZSBiYWtlZC1pbiBtYXAgZ3JpZCB2aXN1YWxseS4KVXNlIER5bmFtaWMgTGlnaHRpbmcgLyBGb2cgb2YgV2FyIGZvciByb29tLWJ5LXJvb20gcmV2ZWFsLjwvcHJlPgo8cD5UaGlzIGlzIGdvb2QgZW5vdWdoIGZvciBwbGF5dGVzdGluZy48L3A+CjxoMj5XaHkgdGhlIGdyaWQgc2hvdWxkIGJlIG9mZjwvaDI+CjxwPlJvbGwyMOKAmXMgbm9ybWFsIHNxdWFyZSBncmlkIGFzc3VtZXMgYSBjbGVhbiBwaXhlbCBzY2FsZS4gVGhlc2UgbWFwcyBoYXZlIGFydGlzdGljYWxseSBnZW5lcmF0ZWQgZ3JpZHMsIG5vdCBtYXRoZW1hdGljYWxseSBleGFjdCBSb2xsMjAgZ3JpZHMuIFRyeWluZyB0byBhbGlnbiBSb2xsMjDigJlzIGdyaWQgcGVyZmVjdGx5IG1heSBiZSBmaWRkbHkuPC9wPgo8cD5Gb3IgdGhlc2UgcGxheXRlc3QgbWFwczo8L3A+CjxwcmU+UmVjb21tZW5kZWQ6Ci0gRGlzYWJsZSB2aXNpYmxlIFJvbGwyMCBncmlkLgotIEtlZXAgdGhlIG1hcCBpbWFnZSBhcyB0aGUgdmlzdWFsIGdyaWQuCi0gTW92ZSB0b2tlbnMgZnJlZWx5IG9yIHVzZSBhcHByb3hpbWF0ZSBzbmFwcGluZyBpZiBpdCBmZWVscyBjbG9zZSBlbm91Z2guPC9wcmU+CjxoMj5GdXR1cmUgcHJvZHVjdGlvbiBtYXAgcmVxdWlyZW1lbnQ8L2gyPgo8cD5Gb3IgYSBjbGVhbmVyIGZ1dHVyZSByZWxlYXNlLCBwcm9kdWNlIG1hcHMgaW4gb25lIG9mIHRoZXNlIGZvcm1zOjwvcD4KPHByZT5HcmlkbGVzcyBtYXAgaW1hZ2UgKyBSb2xsMjAgZ3JpZCBlbmFibGVkPC9wcmU+CjxwPm9yOjwvcD4KPHByZT5FeGFjdC1zaXplIGdyaWRkZWQgbWFwIGltYWdlIHdoZXJlIDEgc3F1YXJlID0gNzAgw5cgNzAgcGl4ZWxzPC9wcmU+CjxwPlVzZWZ1bCBSb2xsMjAgZGltZW5zaW9uczo8L3A+CjxwcmU+MzAgw5cgMzAgc3F1YXJlcyA9IDIxMDAgw5cgMjEwMCBweAozNSDDlyAzNSBzcXVhcmVzID0gMjQ1MCDDlyAyNDUwIHB4CjQwIMOXIDQwIHNxdWFyZXMgPSAyODAwIMOXIDI4MDAgcHgKNTAgw5cgNTAgc3F1YXJlcyA9IDM1MDAgw5cgMzUwMCBweDwvcHJlPgo8cD5Gb3IgcG9saXNoZWQgdGFjdGljYWwgdXNlLCBwcmVmZXIgZ3JpZGxlc3MgbWFwcyBhbmQgbGV0IFJvbGwyMCBkcmF3IHRoZSBncmlkLjwvcD4KPGgyPkR5bmFtaWMgTGlnaHRpbmcgLyByZXZlYWwgcmVjb21tZW5kYXRpb248L2gyPgo8cD5UaGVzZSBtYXBzIGFyZSBidWlsdCBmb3Igcm9vbS1ieS1yb29tIHJldmVhbC48L3A+CjxwPlN1Z2dlc3RlZCBzZXR1cDo8L3A+CjxvbD4KPGxpPlB1dCB0aGUgbWFwIGltYWdlIG9uIHRoZSBNYXAgbGF5ZXIuPC9saT4KPGxpPkRpc2FibGUgdGhlIHZpc2libGUgUm9sbDIwIGdyaWQuPC9saT4KPGxpPlVzZSBEeW5hbWljIExpZ2h0aW5nIHdhbGxzIGFyb3VuZCByb29tcyBhbmQgY29ycmlkb3JzLjwvbGk+CjxsaT5QdXQgZG9vcnMgb24gRHluYW1pYyBMaWdodGluZyBhcyBkb29yIHNlZ21lbnRzIGlmIGF2YWlsYWJsZS48L2xpPgo8bGk+S2VlcCBwdWJsaWMgbWVnYWNvbXBsZXggc3RyZWV0cyB2aXNpYmxlIGlmIHRoZSBQQ3MgYXJlIHRoZXJlLjwvbGk+CjxsaT5SZXZlYWwgcm9vbXMgYXMgZG9vcnMgb3BlbiwgY2FtZXJhcyBhcmUgYWNjZXNzZWQsIHN0YWZmIGd1aWRlIHRoZSBQQ3MsIG9yIGdhbmcvY29ycCBjb250YWN0cyBwcm92aWRlIGZsb29yIGtub3dsZWRnZS48L2xpPgo8L29sPgo8aDI+UHVibGljIGFyZWFzIHZlcnN1cyBoaWRkZW4gYXJlYXM8L2gyPgo8cD5QdWJsaWMgYXJlYXMgY2FuIG9mdGVuIHN0YXJ0IHZpc2libGU6PC9wPgo8dWw+CjxsaT5pbmRvb3Igc3RyZWV0czwvbGk+CjxsaT5jbGluaWMgZnJvbnQgZW50cmFuY2U8L2xpPgo8bGk+b2J2aW91cyBjb25jb3Vyc2Ugc3BhY2VzPC9saT4KPGxpPnB1YmxpYyByZWNlcHRpb248L2xpPgo8bGk+ZWxldmF0b3IgbG9iYnk8L2xpPgo8L3VsPgo8cD5SZXN0cmljdGVkIGFyZWFzIHNob3VsZCBiZSBoaWRkZW4gdW50aWwgYWNjZXNzZWQ6PC9wPgo8dWw+CjxsaT5lbWVyZ2VuY3kgYmF5PC9saT4KPGxpPnN1cmdlcnkgLyB0cmF1bWE8L2xpPgo8bGk+cGhhcm1hY3kgLyBzdXBwbHk8L2xpPgo8bGk+cmVjb3Zlcnkgcm9vbXM8L2xpPgo8bGk+c3RhZmYgcmVjb3JkczwvbGk+CjxsaT5jb250cm9sIHJvb21zPC9saT4KPGxpPm1haW50ZW5hbmNlIGJ5cGFzc2VzPC9saT4KPGxpPnF1YXJhbnRpbmUgcm9vbXM8L2xpPgo8bGk+bGFuZGluZyBjb3JuZXIsIHVubGVzcyB2aXNpYmxlIGZyb20gYSBwdWJsaWMgY2FtZXJhIGZlZWQ8L2xpPgo8L3VsPgo8aDI+TnVtYmVyZWQgbGFiZWxzPC9oMj4KPHA+RG8gbm90IHBlcm1hbmVudGx5IGRyYXcgbnVtYmVycyBvbnRvIHRoZSBtYXAgeWV0LjwvcD4KPHA+UmVjb21tZW5kZWQgcGxheXRlc3Qgc2V0dXA6PC9wPgo8cHJlPlVzZSBzbWFsbCBudW1iZXJlZCB0ZXh0IG9iamVjdHMgb3IgbWFya2VyIHRva2VucyBvbiB0aGUgR00gbGF5ZXIuPC9wcmU+CjxwPlRoaXMgbGV0cyB5b3UgbW92ZSBvciByZW5hbWUgdGhlbSBhcyB0aGUga2V5ZWQgbG9jYXRpb25zIGV2b2x2ZS48L3A+CjxwPkxhdGVyLCBvbmNlIGxvY2F0aW9ucyBhcmUgZmluYWwsIGNyZWF0ZSBvcHRpb25hbCBhbm5vdGF0ZWQgbWFwIGNvcGllcy48L3A+"
  },
  {
    "name": "Signal Bleed - Surveillance Cameras and Ad Injection",
    "source_file": "handouts/20_Surveillance_Cameras_and_Ad_Injection.md",
    "notes_b64": "PGgxPlN1cnZlaWxsYW5jZSwgQ2FtZXJhcywgYW5kIEFkLUluamVjdGlvbiBTeXN0ZW1zPC9oMT4KPGgyPkRlZmF1bHQgYXNzdW1wdGlvbjwvaDI+CjxwPkluIHRoaXMgbWVnYWNvbXBsZXgsIGNhbWVyYXMgYXJlIGFsbW9zdCBldmVyeXdoZXJlLjwvcD4KPHA+RG8gbm90IGFzayDigJxpcyB0aGVyZSBhIGNhbWVyYSBoZXJlP+KAnSBmb3IgZXZlcnkgcm9vbS4gQXNzdW1lIHRoZXJlIHByb2JhYmx5IGlzLjwvcD4KPHA+SW5zdGVhZCwgdHJhY2s6PC9wPgo8cHJlPi0gd2hlcmUgY2FtZXJhcyBhcmUgbWlzc2luZwotIHdobyBjb250cm9scyB0aGUgY2FtZXJhIGZlZWQKLSBob3cgZGlmZmljdWx0IHRoZSBmZWVkIGlzIHRvIGFjY2VzcwotIHdoZXRoZXIgdGhlIGZlZWQgaGFzIGJlZW4gZWRpdGVkLCBsb29wZWQsIGJsb2NrZWQsIG9yIG1vbmV0aXplZDwvcHJlPgo8aDI+Q2FtZXJhIG93bmVyc2hpcCBjYXRlZ29yaWVzPC9oMj4KPHA+VXNlIHRoZXNlIG93bmVyc2hpcCBsYWJlbHMgaW4gR00gbm90ZXM6PC9wPgo8cHJlPkNsaW5pYy1vd25lZApSZWRsaW5lLWNvbnRyb2xsZWQKQ29ycG9yYXRlLWNvbXByb21pc2VkCk1lZ2Fjb21wbGV4IG11bmljaXBhbApBZC1uZXR3b3JrIC8gc3BvbnNvci1vd25lZApEZWFkIC8gYmxpbmQgc3BvdApVbmtub3duIC8gY29udGVzdGVkPC9wcmU+CjxoMj5IYWNraW5nIGRpZmZpY3VsdHkgZ3VpZGFuY2U8L2gyPgo8cD5Vc2UgdGhlc2UgYXMgcm91Z2ggZGlmZmljdWx0eSBhbmNob3JzOjwvcD4KPHByZT5EaWZmaWN1bHR5IDg6Ck9idmlvdXMgcHVibGljIGNhbWVyYSwgYmFkbHkgc2VjdXJlZCwgb2xkIHN5c3RlbSwgb3Igc3RhZmYgd2lsbGluZ2x5IGhlbHBzLgoKRGlmZmljdWx0eSAxMDoKTm9ybWFsIGNsaW5pYy9pbnRlcm5hbCBjYW1lcmEgYWNjZXNzIHdpdGggY29vcGVyYXRpb24gb3IgYmFzaWMgY3JlZGVudGlhbHMuCgpEaWZmaWN1bHR5IDEyOgpSZXN0cmljdGVkIGNsaW5pYy9zZWN1cml0eSBjYW1lcmEsIFJlZGxpbmUgY2FtZXJhLCBvciBtdW5pY2lwYWwgZmVlZC4KCkRpZmZpY3VsdHkgMTQ6CkNvcnBvcmF0ZS1jb21wcm9taXNlZCBjYW1lcmEsIGVkaXRlZCBsb2dzLCBvciBhY3RpdmUgY291bnRlcm1lYXN1cmVzLgoKRGlmZmljdWx0eSAxNjoKTGl2ZSBjb3Jwb3JhdGUgcmVjb3Zlcnkgb3ZlcndhdGNoLCBoYXJkZW5lZCBjb250cm9sIHJvb20sIG9yIGhvc3RpbGUgdHJhY2Ugcmlzay4KCkRpZmZpY3VsdHkgMTgrOgpBbGllbi1jb3JydXB0ZWQgc2lnbmFsLCBTYW11cmFpLWxldmVsIHNwb25zb3IgZmVlZCwgb3IgYWN0aXZlIElDRSB3aXRoIGNvbnNlcXVlbmNlcy48L3ByZT4KPHA+RmFpbHVyZXMgc2hvdWxkIHVzdWFsbHkgY3JlYXRlIGNvbXBsaWNhdGlvbnMsIG5vdCBkZWFkIGVuZHM6PC9wPgo8dWw+CjxsaT50cmFjZSBzdGFydHM8L2xpPgo8bGk+ZmVlZCBmcmVlemVzPC9saT4KPGxpPmZhbHNlIGZvb3RhZ2UgYXBwZWFyczwvbGk+CjxsaT5hZHMgaW5qZWN0IGludG8gY3liZXJ3YXJlPC9saT4KPGxpPmEgY29udHJvbC1yb29tIE5QQyBub3RpY2VzPC9saT4KPGxpPnRoZSB3cm9uZyBmYWN0aW9uIGxlYXJucyBzb21lb25lIGlzIHdhdGNoaW5nPC9saT4KPC91bD4KPGgyPkNhbWVyYSBjb250cm9sIGJ5IG1hcDwvaDI+CjxoMz5GbG9vciBBIOKAlCBNZXJjeSBUd2VsdmUgQ2xpbmljPC9oMz4KPHA+RGVmYXVsdDogQ2xpbmljLW93bmVkLjwvcD4KPHA+RXhjZXB0aW9uczo8L3A+Cjx1bD4KPGxpPnB1YmxpYyBjb25jb3Vyc2UgY2FtZXJhcyBhcmUgbW9zdGx5IG11bmljaXBhbC9hZC1uZXR3b3JrPC9saT4KPGxpPlJlZGxpbmUgQ2hvaXIgaGFzIGNvbnRyb2wgb3IgcGFydGlhbCBhY2Nlc3MgYXJvdW5kIHNpZGUgY29ycmlkb3JzIGFuZCBzb21lIHN0cmVldCBhcHByb2FjaGVzPC9saT4KPGxpPmVtZXJnZW5jeSBpbnRha2UgYmF5IGNhbWVyYXMgd2VyZSBsb29wZWQgZm9yIHNpeCBtaW51dGVzPC9saT4KPGxpPnN0YWZmIG9mZmljZSAvIHJlY29yZHMgaGFzIGxpbWl0ZWQgY2FtZXJhcyBmb3IgcHJpdmFjeTwvbGk+CjxsaT5wZWRpYXRyaWMvY29tbXVuaXR5IGNvcm5lciBoYXMgY2FtZXJhcywgYnV0IHN0YWZmIGFyZSBwcm90ZWN0aXZlIGFib3V0IHdobyBjYW4gYWNjZXNzIHRoZW08L2xpPgo8bGk+cmVjb3Zlcnkgd2luZyBjYW1lcmFzIGFyZSBwcml2YWN5LXJlc3RyaWN0ZWQgYW5kIGhhcmQgdG8gYWNjZXNzIHdpdGhvdXQgRHIuIFZhbGV6IG9yIHN0YWZmIGNvb3BlcmF0aW9uPC9saT4KPC91bD4KPGgzPkZsb29yIEIg4oCUIENvbW11bml0eSBTdXBwb3J0IC8gU2hlbHRlcjwvaDM+CjxwPkRlZmF1bHQ6IG1peGVkIGNsaW5pYy9jb21tdW5pdHkgY29udHJvbC48L3A+CjxwPkV4Y2VwdGlvbnM6PC9wPgo8dWw+CjxsaT5wdWJsaWMgc3RyZWV0IGNhbWVyYXMgYXJlIG11bmljaXBhbC9hZC1uZXR3b3JrPC9saT4KPGxpPmZvb2QgZGlzdHJpYnV0aW9uIGFuZCBzZXJ2aWNlIGNvcnJpZG9yIGhhdmUgUmVkbGluZS1jb250cm9sbGVkIGJsaW5kIHNwb3RzPC9saT4KPGxpPmNsYXNzcm9vbSBhbmQgZGF5Y2FyZSBjYW1lcmFzIGFyZSByZXN0cmljdGVkOyBzdGFmZiB3aWxsIHJlc2lzdCBjYXN1YWwgYWNjZXNzPC9saT4KPGxpPmNvdW5zZWxvciBvZmZpY2VzIGhhdmUgbm8gb3JkaW5hcnkgY2FtZXJhIGNvdmVyYWdlLCBvbmx5IGRvb3IgbG9nczwvbGk+CjxsaT5zaGVsdGVyIGRvcm0gY2FtZXJhcyBhcmUgbGltaXRlZCBhbmQgY29udHJvdmVyc2lhbDwvbGk+CjwvdWw+CjxoMz5GbG9vciBDIOKAlCBVdGlsaXR5IC8gU2VydmljZTwvaDM+CjxwPkRlZmF1bHQ6IG11bmljaXBhbC9tYWludGVuYW5jZSBjb250cm9sLjwvcD4KPHA+RXhjZXB0aW9uczo8L3A+Cjx1bD4KPGxpPlJlZGxpbmUgQ2hvaXIgaGFzIGFjY2VzcyB0byBzb21lIG9sZGVyIHNlcnZpY2UgY2FtZXJhczwvbGk+CjxsaT5jb3Jwb3JhdGUgcmVjb3ZlcnkgbWF5IGNvbXByb21pc2UgZnJlaWdodCBsaWZ0IGFuZCBzZXJ2aWNlIHN0cmVldCBmZWVkczwvbGk+CjxsaT5oaWRkZW4gbWFpbnRlbmFuY2UgYnlwYXNzZXMgb2Z0ZW4gaGF2ZSBkZWFkIGNhbWVyYXM8L2xpPgo8bGk+c2lnbmFsIGludGVyZmVyZW5jZSBub2RlIG1heSBjb3JydXB0IGZvb3RhZ2U8L2xpPgo8L3VsPgo8aDM+Rmxvb3IgRCDigJQgUXVhcmFudGluZSAvIEluY2lkZW50PC9oMz4KPHA+RGVmYXVsdDogcmVzdHJpY3RlZCBjbGluaWMvY29ycG9yYXRlIGh5YnJpZCBjb250cm9sLjwvcD4KPHA+RXhjZXB0aW9uczo8L3A+Cjx1bD4KPGxpPnF1YXJhbnRpbmUgcm9vbXMgaGF2ZSBpbnRlcm5hbCBtb25pdG9yaW5nIGJ1dCBtYXkgYmUgbG9ja2VkIGJlaGluZCBlbWVyZ2VuY3kgcHJvdG9jb2w8L2xpPgo8bGk+Y29udHJvbCByb29tIGNhbiBzZWUgbW9zdCBvZiB0aGUgZmxvb3I8L2xpPgo8bGk+bGFuZGluZyBjb3JuZXIgaGFzIG11bmljaXBhbC9lbWVyZ2VuY3ktcmVzcG9uc2UgY2FtZXJhczwvbGk+CjxsaT5OaWdodENyYXNoIG1heSBoYXZlIGEgc3BvbnNvci9lbWVyZ2VuY3kgYm9keWNhbSBmZWVkIGlmIHNoZSBhcnJpdmVzPC9saT4KPGxpPmFsaWVuIGJyZWFjaCBjYW4gY29ycnVwdCBjYW1lcmEgZmVlZHMgaW50byBpbXBvc3NpYmxlIGltYWdlczwvbGk+CjwvdWw+CjxoMj5BZC1pbmplY3Rpb24gYW5kIGN5YmVyLWV5ZSBoYXJhc3NtZW50PC9oMj4KPHA+TWVnYWNvbXBsZXggYWR2ZXJ0aXNpbmcgaXMgYWdncmVzc2l2ZS4gQ2hlYXAgY3liZXJ3YXJlIG9mdGVuIHN1YnNpZGl6ZXMgaXRzZWxmIHRocm91Z2ggYWQtYmFzZWQgcmV2ZW51ZS48L3A+CjxwPlVzZSB0aGlzIHNwYXJpbmdseSBhcyBjb2xvciwgcHJlc3N1cmUsIGFuZCBvY2Nhc2lvbmFsIGNvbXBsaWNhdGlvbi48L3A+CjxoMz5XaGVyZSBhZC1pbmplY3Rpb24gaXMgc3Ryb25nZXN0PC9oMz4KPHVsPgo8bGk+cHVibGljIGNvbmNvdXJzZTwvbGk+CjxsaT5lbGV2YXRvciBsb2JieTwvbGk+CjxsaT50cmFuc2l0IGFjY2VzczwvbGk+CjxsaT5zdXBwb3J0IGNlbnRlciBwdWJsaWMgY29tbW9uczwvbGk+CjxsaT5tdW5pY2lwYWwgY2FtZXJhIHpvbmVzPC9saT4KPGxpPnNwb25zb3Itb3duZWQgY2xpbmljIHNpZ25hZ2U8L2xpPgo8bGk+bGFuZGluZyBjb3JuZXIgZW1lcmdlbmN5IGJlYWNvbnM8L2xpPgo8L3VsPgo8aDM+V2hhdCBoYXBwZW5zPC9oMz4KPHA+Q2hhcmFjdGVycyB3aXRoIGN5YmVyLWV5ZXMsIGNoZWFwIEFSLCBzcG9uc29yd2FyZSwgb3Igb2xkIGJhY2tncm91bmQgY3liZXJ3YXJlIG1heSBleHBlcmllbmNlOjwvcD4KPHVsPgo8bGk+Y2xpbmljIGFkcyBvdmVybGFpZCBvbiByZWFsIHBhdGllbnRzPC9saT4KPGxpPuKAnGhlbHBmdWzigJ0gYXJyb3dzIHBvaW50aW5nIHRvIHBhaWQgc2VydmljZXM8L2xpPgo8bGk+c3BvbnNvciBzbG9nYW5zIGFwcGVhcmluZyBpbiBwZXJpcGhlcmFsIHZpc2lvbjwvbGk+CjxsaT5lbW90aW9uYWwgbWFuaXB1bGF0aW9uIG92ZXJsYXlzPC9saT4KPGxpPmZha2UgZW1lcmdlbmN5IHdhcm5pbmdzPC9saT4KPGxpPnBvcC11cCBjb3Vwb25zIGZvciBwYWlua2lsbGVycywgdHJhdW1hIGZvYW0sIG9yIHRoZXJhcHkgYXBwczwvbGk+CjxsaT5hZHdhcmUgdHJ5aW5nIHRvIHRhZyB3aGF0IHRoZSBQQyBsb29rcyBhdDwvbGk+CjwvdWw+CjxoMz5TdWdnZXN0ZWQgY2hlY2tzPC9oMz4KPHVsPgo8bGk+PHN0cm9uZz5DeWJlcndhcmUgLyBNZXNoIEhhY2tlcjo8L3N0cm9uZz4gYmxvY2sgb3IgdHJhY2UgdGhlIGFkIGluamVjdGlvbi48L2xpPgo8bGk+PHN0cm9uZz5Bd2FyZW5lc3M6PC9zdHJvbmc+IHJlYWxpemUgYSB2aXN1YWwgcHJvbXB0IGlzIGFuIG92ZXJsYXksIG5vdCByZWFsaXR5LjwvbGk+CjxsaT48c3Ryb25nPkNvcnBvcmF0ZSBTZWN1cml0eTo8L3N0cm9uZz4gcmVjb2duaXplIHNwb25zb3ItbmV0d29yayBzdXJ2ZWlsbGFuY2UgYmVoYXZpb3IuPC9saT4KPGxpPjxzdHJvbmc+UHN5Y2hvbG9neTo8L3N0cm9uZz4gbm90aWNlIHRoZSBhZCBpcyB0dW5lZCB0byBwYW5pYywgZ3JpZWYsIG9yIHBhaW4uPC9saT4KPGxpPjxzdHJvbmc+UGVyZm9ybWFuY2U6PC9zdHJvbmc+IGhpamFjayB0aGUgYWQgc3lzdGVtIGZvciBwdWJsaWMgbWVzc2FnaW5nLjwvbGk+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IHBoeXNpY2FsbHkgZGlzYWJsZSBhIGxvY2FsIGFkIGJlYWNvbi48L2xpPgo8L3VsPgo8aDM+RGlmZmljdWx0eTwvaDM+CjxwcmU+RGlmZmljdWx0eSA4OgpBbm5veWluZyBwdWJsaWMgYWQgb3ZlcmxheS4KCkRpZmZpY3VsdHkgMTA6ClRhcmdldGVkIGFkd2FyZSB0cnlpbmcgdG8gcHJvZmlsZSB0aGUgUEMuCgpEaWZmaWN1bHR5IDEyOgpDeWJlci1leWUgb3ZlcmxheSBpbnRlcmZlcmluZyB3aXRoIHBlcmNlcHRpb24uCgpEaWZmaWN1bHR5IDE0OgpIb3N0aWxlIGFkIGluamVjdGlvbiBkdXJpbmcgY3Jpc2lzLCBwb3NzaWJseSBjb3Jwb3JhdGUtYXNzaXN0ZWQuCgpEaWZmaWN1bHR5IDE2OgpBbGllbiBzaWduYWwgb3IgY29ycG9yYXRlIElDRSBwaWdneWJhY2tzIHRocm91Z2ggdGhlIGFkIGxheWVyLjwvcHJlPgo8aDI+SHVtYW4gY29udHJvbCByb29tczwvaDI+CjxwPkJvdGggdGhlIGNsaW5pYyBhbmQgdGhlIFJlZGxpbmUgQ2hvaXIgaGF2ZSBwZW9wbGUgd2F0Y2hpbmcgZmVlZHMuPC9wPgo8cD5UaGV5IHNob3VsZCBiZSBOUEMgaW50ZXJhY3Rpb24gcG9pbnRzLCBub3QganVzdCBoYWNraW5nIHRhcmdldHMuPC9wPgo8aDM+Q2xpbmljIGNvbnRyb2wgcm9vbTwvaDM+CjxwPlRoZSBjbGluaWMgY29udHJvbCByb29tIGlzIHVuZGVyLXJlc291cmNlZCBidXQgbGVnaXRpbWF0ZS4gU3RhZmYgbWF5IGNvb3BlcmF0ZSBpZiB0aGUgUENzIGhhdmUgZWFybmVkIHRydXN0LjwvcD4KPHA+VGhleSBjYW4gcHJvdmlkZTo8L3A+Cjx1bD4KPGxpPmNhbWVyYSBsb29rdXBzPC9saT4KPGxpPmRvb3IgbG9nczwvbGk+CjxsaT5wYXRpZW50IG1vdmVtZW50IHJlY29yZHM8L2xpPgo8bGk+ZWxldmF0b3IgdXNlPC9saT4KPGxpPmVtZXJnZW5jeSBpbnRha2UgZmVlZDwvbGk+CjxsaT5wYXJ0aWFsIHJlY292ZXJ5LXdpbmcgYWNjZXNzIHdpdGggcHJpdmFjeSBsaW1pdHM8L2xpPgo8L3VsPgo8aDM+UmVkbGluZSBjb250cm9sIHJvb208L2gzPgo8cD5UaGUgUmVkbGluZSBDaG9pciBjb250cm9sIHJvb20gaXMgdW5vZmZpY2lhbCwgcGF0Y2hlZCB0b2dldGhlciwgYW5kIGJldHRlciB0aGFuIG91dHNpZGVycyBleHBlY3QuPC9wPgo8cD5UaGV5IGNhbiBwcm92aWRlOjwvcD4KPHVsPgo8bGk+c3RyZWV0IGFwcHJvYWNoIGZlZWRzPC9saT4KPGxpPnNpZGUgY29ycmlkb3IgYmxpbmQgc3BvdHM8L2xpPgo8bGk+Z2FuZyBsb29rb3V0IHJlcG9ydHM8L2xpPgo8bGk+d2hvIGVudGVyZWQgYnkgdW5vZmZpY2lhbCByb3V0ZXM8L2xpPgo8bGk+bG9jYWwgd2l0bmVzcyBuYW1lczwvbGk+CjxsaT5oaWRkZW4gc3VwcGx5LXJvdXRlIGZvb3RhZ2U8L2xpPgo8L3VsPgo8cD5UaGV5IHdpbGwgbm90IGNvb3BlcmF0ZSBpZiB0cmVhdGVkIGxpa2UgY3JpbWluYWxzIG9ubHkuPC9wPgo8aDI+U3VnZ2VzdGVkIGNhbWVyYS1yZWxhdGVkIGNsdWUgcGhpbG9zb3BoeTwvaDI+CjxwPkNhbWVyYSBhY2Nlc3Mgc2hvdWxkIGhlbHAgcGxheWVycyBhc2sgYmV0dGVyIHF1ZXN0aW9ucy48L3A+CjxwPkRvIG5vdCBsZXQgY2FtZXJhcyByZXBsYWNlIHBsYXkuPC9wPgo8cD5Hb29kIGNhbWVyYSByZXN1bHRzOjwvcD4KPHVsPgo8bGk+4oCcVGhlIGNvdXJpZXIgZGlkIG5vdCBjb21lIHRocm91Z2ggdGhlIGVtZXJnZW5jeSBiYXku4oCdPC9saT4KPGxpPuKAnFRoZSBjYW1lcmEgZnJvemUgc2l4IG1pbnV0ZXMgYmVmb3JlIHRoZSByZWxheSBhcnJpdmVkLuKAnTwvbGk+CjxsaT7igJxCbHVld2lyZSB3YXMgYWxyZWFkeSBzaGFraW5nIGJlZm9yZSB0aGUgYXJndW1lbnQu4oCdPC9saT4KPGxpPuKAnEEgUmVkbGluZSBjb3VyaWVyIGRlbGl2ZXJlZCBtZWRpY2FsIGNyYXRlcywgbm90IHdlYXBvbnMu4oCdPC9saT4KPGxpPuKAnEEgY29ycG9yYXRlIG9ic2VydmVyIGhhcyBiZWVuIGluIHRoZSBjb25jb3Vyc2UgZm9yIGFuIGhvdXIu4oCdPC9saT4KPGxpPuKAnE9uZSBjb3JyaWRvciBoYXMgbm8gY2FtZXJhIGJlY2F1c2Ugc29tZW9uZSBkZWxpYmVyYXRlbHkga2VlcHMgaXQgYmxpbmQu4oCdPC9saT4KPC91bD4KPHA+QmFkIGNhbWVyYSByZXN1bHRzOjwvcD4KPHVsPgo8bGk+4oCcSGVyZSBpcyB0aGUgZW50aXJlIHBsb3Qu4oCdPC9saT4KPGxpPuKAnFlvdSBzb2x2ZSBldmVyeSBteXN0ZXJ5IHdpdGhvdXQgbGVhdmluZyB0aGUgcm9vbS7igJ08L2xpPgo8L3VsPgo8aDI+VXBkYXRlZCBjYW5vbiBub3RlOiBlbGVjdHJvbmljcyBhcmUgaHVtYW4gc3lzdGVtczwvaDI+CjxwPlRoZSBBbnRpdGhlc2lzIGluIHRoaXMgbW9kdWxlIGRvIG5vdCBoYWNrIGVsZWN0cm9uaWNzIGFuZCBkbyBub3QgY3JlYXRlIGVsZWN0cm9uaWMgc2lnbmFsIGJsZWVkLjwvcD4KPHA+Q2FtZXJhIGdsaXRjaGVzLCBhZCBpbmplY3Rpb24sIGN5YmVyLWV5ZSBwb3B1cHMsIGFuZCBmb290YWdlIGdhcHMgYXJlIGNhdXNlZCBieSBodW1hbiBhZCBuZXR3b3JrcywgY2hlYXAgY3liZXJ3YXJlIG1vbmV0aXphdGlvbiwgY29ycG9yYXRlIHRhbXBlcmluZywgUmVkbGluZSBzdXJ2ZWlsbGFuY2UgY29udHJvbCwgZGFtYWdlZCBjYW1lcmFzLCBwYW5pYywgcG9vciBtYWludGVuYW5jZSwgYW5kIGRlbGliZXJhdGUgZWRpdHMuPC9wPgo8cD5UaGUgQW50aXRoZXNpcyBjbHVlIHRyYWlsIGlzIGJpb2xvZ2ljYWw6IG1pc3NpbmcgcGVvcGxlLCBkcmFnIG1hcmtzLCBvcmdhbmljIHJlc2lkdWUsIHRocmVlLXBhcnQgYml0ZSB3b3VuZHMsIHZlbnQgbW92ZW1lbnQsIE1vZGVsIDMgYmlvbWFzcyBodW50aW5nLCBhbmQgdGhlIE1vZGVsIDEgc2VlZCBjbHVtcC48L3A+"
  },
  {
    "name": "Signal Bleed - Updated Plot Canon GM",
    "source_file": "handouts/21_Updated_Plot_Canon_GM.md",
    "notes_b64": "PGgxPlNpZ25hbCBCbGVlZDogVXBkYXRlZCBQbG90IENhbm9uPC9oMT4KPGgyPk9uZS1zZW50ZW5jZSBwcmVtaXNlPC9oMj4KPHA+U2lnbmFsIEJsZWVkIGlzIGFib3V0IGEgc3RvbGVuIGh1bWFuIGRhdGEgcmVsYXkgcHJvdmluZyB0aGF0IGEgY29ycG9yYXRpb27igJlzIGlsbGVnYWwgQW50aXRoZXNpcyBiaW8tcmVzZWFyY2ggY3JlYXRlZCBhIG5lc3QsIHRoYXQgdGhlaXIgY2xlYW51cCBmYWlsZWQsIGFuZCB0aGF0IGEgc2Vjb25kIGhpZGRlbiBuZXN0IGlzIG5vdyBhY3RpdmUgb24gRmxvb3IgRCBiZW5lYXRoIHRoZSBjb21tdW5pdHkgdGhleSBjYW1lIHRvIHNpbGVuY2UuPC9wPgo8aDI+SGFyZCBzZXR0aW5nIGNvbnN0cmFpbnRzPC9oMj4KPHByZT5UaGUgcmVsYXkgaXMgaHVtYW4gdGVjaG5vbG9neS4KVGhlIHJlbGF5IGlzIGV2aWRlbmNlLCBub3QgYWxpZW4gdGVjaG5vbG9neS4KVGhlIHJlbGF5IGRvZXMgbm90IHN1bW1vbiBBbnRpdGhlc2lzLgpUaGUgQW50aXRoZXNpcyB0aHJlYXQgaXMgYmlvbG9naWNhbCwgbm90IGVsZWN0cm9uaWMuCkNoZWFwIGN5YmVyd2FyZSBhZC1pbmplY3Rpb24gaXMgaHVtYW4gZXhwbG9pdGF0aW9uLCBub3QgYWxpZW4gaW50ZXJmZXJlbmNlLgpTYW11cmFpIEFJIGNvbW11bmljYXRpb25zIGFyZSBub3QgaGFja2VkLCBpbnRlcmNlcHRlZCwgY29waWVkLCBvciBhbmFseXplZC48L3ByZT4KPGgyPldoYXQgaGFwcGVuZWQgYmVmb3JlIHRoZSBQQ3MgYXJyaXZlPC9oMj4KPHA+VGhlIGNvcnBvcmF0aW9uIGdhdGhlcmVkIEFudGl0aGVzaXMgYmlvbG9naWNhbCBtYXR0ZXIgZnJvbSBwcmV2aW91cyBiYXR0bGUgc2l0ZXMgYW5kIHN0b3JlZCBpdCBpbiBhIGhpZGRlbiBtZWdhY29tcGxleCByZXNlYXJjaCBhbm5leC4gVGhleSB0aG91Z2h0IHRoZXkgd2VyZSBzdHVkeWluZyBpbmVydCBvciBjb250cm9sbGFibGUgc2FtcGxlcy48L3A+CjxwPlRoZXkgd2VyZSB3cm9uZy48L3A+CjxwPlRoZSBzdG9yZWQgYmlvbWFzcyBjb25zdW1lZCByZXNlYXJjaGVycyBhbmQgbGFiIHN0YWZmLCBpbmNvcnBvcmF0ZWQgdGhlbSBhcyBtYXRlcmlhbCwgYW5kIGZvcm1lZCBhIHNtYWxsIG5lc3QuIFRoYXQgZmlyc3QgbmVzdCBwcm9kdWNlZCA8c3Ryb25nPk1vZGVsIDFzPC9zdHJvbmc+LCB0aGUgc21hbGwgZmx5aW5nIEFudGl0aGVzaXMuPC9wPgo8cD5Db3Jwb3JhdGUgY29udGFpbm1lbnQgZm9yY2VzIGF0dGFja2VkIHRoZSB2aXNpYmxlIG5lc3QgYW5kIG5lYXJseSBleHRlcm1pbmF0ZWQgaXQuIFRoZSBvZmZpY2lhbCBpbnRlcm5hbCBjb25jbHVzaW9uIHdhcyB0aGF0IHRoZSBBbnRpdGhlc2lzIGV2ZW50IHdhcyBjb250YWluZWQuPC9wPgo8cD5CdXQgc2V2ZXJhbCBNb2RlbCAxcyBiZWhhdmVkIHVuZXhwZWN0ZWRseS48L3A+CjxwPlRoZXkgZGlkIG5vdCBhdHRhY2ssIHNjYXR0ZXIsIG9yIGRpZSBpbiBwbGFjZS4gVGhleSBmbGV3IHRocm91Z2ggZHVjdHMgYW5kIGhpZGRlbiBzZXJ2aWNlIHJvdXRlcy4gVGhlIGNvcnBvcmF0aW9uIGRpc21pc3NlZCB0aGlzIGFzIHRlcm1pbmFsIGVycmF0aWMgZmxpZ2h0LjwvcD4KPHA+QSBkZWFkIG9yIG1pc3NpbmcgcmVzZWFyY2hlciBmbGFnZ2VkIGl0IGFzIGEgbmVzdC1zZWVkaW5nIHJpc2sgYmVmb3JlIGJlaW5nIG92ZXJydWxlZC48L3A+CjxwPlRoZSBlc2NhcGVkIE1vZGVsIDFzIHNlZWRlZCBhIHNlY29uZCwgc21hbGxlciwgaGlkZGVuIG5lc3QgZWxzZXdoZXJlIG9uIDxzdHJvbmc+Rmxvb3IgRDwvc3Ryb25nPiwgZGVlcGVyIGluIHRoZSBxdWFyYW50aW5lL2luY2lkZW50IGxldmVs4oCZcyBzZXJ2aWNlIHJvdXRlcyBhbmQgc2VhbGVkIG1haW50ZW5hbmNlIHNwYWNlcy48L3A+CjxwPlRoZSBjb3Jwb3JhdGlvbiBkb2VzIG5vdCBrbm93IHRoaXMgc2Vjb25kIG5lc3QgZXhpc3RzLjwvcD4KPGgyPlRoZSBvbGQgbmVzdDwvaDI+CjxwPlRoZSBvbGQgdmlzaWJsZSBuZXN0IHdhcyBpbiBvciBhZGphY2VudCB0byB0aGUgcXVhcmFudGluZSAvIGNvbnRhaW5tZW50IGNoYW1iZXIgc3lzdGVtLCByZXByZXNlbnRlZCBpbiBwbGF5IGJ5OjwvcD4KPHByZT5EOCBDb250YWlubWVudCBDaGFtYmVyCkI4IFNlYWxlZCBJc29sYXRpb24gV2FyZCAvIG9sZCBleHBlcmltZW50IGV2aWRlbmNlCnJlbGF0ZWQgZGlhZ25vc3RpYyBhbmQgY29udHJvbCBsb2dzIG9uIEQ1L0Q2PC9wcmU+CjxwPkI4IGNhbiBzaG93IHRoZSBpbGxlZ2FsIHJlc2VhcmNoIGFuZCBlYXJseSBkaXNhc3Rlci4gRDggc2hvd3MgdGhlIGJ1cm5lZC1vdXQgdmlzaWJsZSBuZXN0IGFuZCBjb3Jwb3JhdGUgY2xlYW51cC48L3A+CjxwPkJvdGggcG9pbnQgdG8gdGhlIHNhbWUgaGlzdG9yaWNhbCB0cnV0aDo8L3A+CjxwcmU+VGhlIGNvcnBvcmF0aW9uIGNyZWF0ZWQgdGhlIGZpcnN0IG5lc3QuClJlc2VhcmNoZXJzIGFuZCBzdGFmZiBkaWVkLgpDb3Jwb3JhdGUgUmVjb3ZlcnkgYnVybmVkIHRoZSB2aXNpYmxlIG5lc3QuClRoZSBjbGVhbnVwIG1pc3NlZCB0aGUgZXNjYXBlIHZlY3Rvci48L3ByZT4KPGgyPlRoZSBzZWNvbmQgaGlkZGVuIG5lc3Q8L2gyPgo8cD5UaGUgc2Vjb25kIGhpZGRlbiBuZXN0IGlzIG5vdyBhY3RpdmUgb24gPHN0cm9uZz5GbG9vciBEPC9zdHJvbmc+LjwvcD4KPHA+UGxhY2UgaXQgaW4gdGhlIGluZmVzdGVkIGhhbGYgb2YgdGhlIG1hcCwgdXN1YWxseSBjb25uZWN0ZWQgdG86PC9wPgo8cHJlPkQ5IFNlcnZpY2UgQnlwYXNzCkQxMSBFbWVyZ2VuY3kgU3RhaXIgLyBMYWRkZXJ3ZWxsCmEgc2VhbGVkIG1haW50ZW5hbmNlIGNhdml0eSBvciBoaWRkZW4gbmVzdCBhcmVhIHRoZSBHTSBtYXkgbGFiZWwgRDEzIEFjdGl2ZSBIaWRkZW4gTmVzdDwvcHJlPgo8cD5UaGUgc2Vjb25kIG5lc3Qgc2hvdWxkIG5vdCBiZSBvYnZpb3VzIGltbWVkaWF0ZWx5LiBUaGUgUENzIGRpc2NvdmVyIGl0IGJ5IGludmVzdGlnYXRpbmcgdGhlIGRlc3Ryb3llZCBvbGQgbmVzdCwgZm9sbG93aW5nIHRoZSBNb2RlbCAxIGVzY2FwZSB2ZWN0b3IsIHRyYWNraW5nIG1pc3NpbmctcGVyc29uIGV2aWRlbmNlLCBvciBzdHVtYmxpbmcgaW50byB0aGUgaW5mZXN0ZWQgaGFsZiBvZiBGbG9vciBELjwvcD4KPHA+VGhlIHNlY29uZCBuZXN0IGhhcyBwcm9kdWNlZDo8L3A+CjxwcmU+bW9zdGx5IHdlYWsgTW9kZWwgMXMKb25lIG9yIG1vcmUgTW9kZWwgMSBncm93dGgvc2VlZCBzdHJ1Y3R1cmVzCmEgZmV3IGp1dmVuaWxlIE1vZGVsIDNzPC9wcmU+CjxwPlRoZSBNb2RlbCAzcyBhcmUgZG9nLWxpa2UgQW50aXRoZXNpcyBwcmVkYXRvcnMgd2l0aCBqYXdzIHRoYXQgc3BsaXQgaW50byB0aHJlZSBwYXJ0cy4gVGhleSBodW50IGlzb2xhdGVkIGJpb21hc3MsIGtpbGwgb3IgZGlzYWJsZSBpdCwgdGhlbiBkcmFnIGl0IGJhY2sgdG8gdGhlIG5lc3Qgc28gdGhlIG5lc3QgY2FuIGdyb3cgbW9yZSBBbnRpdGhlc2lzLjwvcD4KPHA+VGhlIG1pc3NpbmctcGVyc29uIHBhdHRlcm4gaXMgdGhlIGZpcnN0IHZpc2libGUgc2lnbiB0aGF0IHRoZSBjbGVhbnVwIGZhaWxlZC48L3A+CjxoMj5XaGF0IHRoZSBjb3Jwb3JhdGlvbiB0aGlua3MgaXMgaGFwcGVuaW5nIG5vdzwvaDI+CjxwPkNvcnBvcmF0ZSBSZWNvdmVyeSBiZWxpZXZlcyB0aGUgb2xkIG5lc3QgaXMgZGVhZCBvciBjb250YWluZWQuIFRoZWlyIGN1cnJlbnQgbWlzc2lvbiBpcyBub3QgYSByZXNjdWUgb3BlcmF0aW9uLjwvcD4KPHA+VGhleSBhcmUgYXQgTWVyY3kgVHdlbHZlIHRvIGNsZWFuIHVwIGV2aWRlbmNlIGFuZCB3aXRuZXNzZXMuPC9wPgo8cD5UaGVpciBvYmplY3RpdmVzOjwvcD4KPHByZT5SZWNvdmVyIG9yIGRlc3Ryb3kgdGhlIHN0b2xlbiByZWxheS4KRmluZCB0aGUgY291cmllci4KU3VwcHJlc3MgY2xpbmljIHJlY29yZHMuClByZXZlbnQgUmVkbGluZSBDaG9pciBmcm9tIGJyb2FkY2FzdGluZyB0aGUgZXZpZGVuY2UuCklkZW50aWZ5IHdpdG5lc3Nlcy4KQmxhbWUgZ2FuZyB2aW9sZW5jZSwgcGFuaWMsIG9yIHJvZ3VlIHN0YWZmIGlmIG5lZWRlZC4KQXZvaWQgcHVibGljIGV2YWN1YXRpb24gdW5sZXNzIGNvcnBvcmF0ZSBsaWFiaWxpdHkgY2FuIGJlIGNvbnRyb2xsZWQuPC9wcmU+CjxwPkNvbW1hbmRlciBSdXNrIGNhbiBob25lc3RseSBiZWxpZXZlIHRoZSBvcmlnaW5hbCBuZXN0IHdhcyBkZXN0cm95ZWQgd2hpbGUgc3RpbGwgbHlpbmcgYWJvdXQgdGhlIGV4cGVyaW1lbnRzIGFuZCB3aXRuZXNzIGNsZWFudXAuPC9wPgo8cD5UaGlzIG1ha2VzIGhpbSBkYW5nZXJvdXMgYnV0IG5vdCBvbW5pc2NpZW50LiBIZSBpcyB3cm9uZyBhYm91dCB0aGUgc2Vjb25kIGhpZGRlbiBuZXN0LjwvcD4KPGgyPldoYXQgaXMgYWN0dWFsbHkgaGFwcGVuaW5nIG5vdzwvaDI+CjxwPlRoZSBzZWNvbmQgaGlkZGVuIG5lc3QgaXMgYWN0aXZlIG9uIEZsb29yIEQuPC9wPgo8cD5JdCBpcyBub3QgYSBsYXJnZSBtYXR1cmUgaGl2ZSB5ZXQsIGJ1dCBpdCBpcyBncm93aW5nLiBJdCBoYXMgZW5vdWdoIGJpb21hc3MgYW5kIHN0cnVjdHVyZSB0byBwcm9kdWNlIE1vZGVsIDFzIGFuZCBhIGZldyBqdXZlbmlsZSBNb2RlbCAzIGh1bnRlcnMuPC9wPgo8cD5UaG9zZSBodW50ZXJzIGFyZSByZXNwb25zaWJsZSBmb3I6PC9wPgo8cHJlPm1pc3NpbmcgbWFpbnRlbmFuY2Ugd29ya2VycwptaXNzaW5nIHNoZWx0ZXIgcmVzaWRlbnRzCm1pc3NpbmcgZm9vZC1yb3V0ZSB2b2x1bnRlZXJzCmNvcnJ1cHRlZCBjYW1lcmEgZ2FwcyBuZWFyIHNlcnZpY2UgYWNjZXNzCmRyYWcgbWFya3MgdGhyb3VnaCBtYWludGVuYW5jZSByb3V0ZXMKb3JnYW5pYyByZXNpZHVlIGluIGRyYWlucywgZHVjdHMsIGFuZCBzdGFpcndlbGxzPC9wcmU+CjxwPlRoZSBQQ3MgZG8gbm90IG5lZWQgdG8gdW5kZXJzdGFuZCB0aGUgZnVsbCBwYXR0ZXJuIGltbWVkaWF0ZWx5LiBUaGV5IHNob3VsZCBmaXJzdCBzZWUgaXNvbGF0ZWQgY2x1ZXMsIHRoZW4gdGhlIG9sZCBkZXN0cm95ZWQgbmVzdCwgdGhlbiB0aGUgZXNjYXBlIHZlY3RvciwgdGhlbiB0aGUgYWN0aXZlIGhpZGRlbiBuZXN0LjwvcD4KPGgyPlRoZSBRdWlsbCBSZWxheTwvaDI+CjxwPlRoZSByZWxheSBpcyBhIGh1bWFuIGRhdGEtY29yZSBzdG9sZW4gYnkgVGFtc2luIFF1aWxsLjwvcD4KPHA+SXQgY29udGFpbnM6PC9wPgo8cHJlPnBhdGllbnQgbGlzdHMKaWxsZWdhbCB0cmlhbCByZWNvcmRzCnN0YWZmIG9yZGVycwpkb3NhZ2UgcmVjb3JkcwpyZXNlYXJjaGVyIHJvc3RlcnMKcXVhcmFudGluZSBsb2dzCmNhbWVyYSBmb290YWdlCnNoaXBwaW5nIG1hbmlmZXN0cwpBbnRpdGhlc2lzIHNhbXBsZSBpbnZlbnRvcnkKY29ycG9yYXRlIGNsZWFudXAgb3JkZXJzCmV2aWRlbmNlIHRoYXQgbG9jYWxzIHdlcmUgdXNlZCBhcyBkZW5pYWJsZSBzdWJqZWN0cwpmb290YWdlIG9mIE1vZGVsIDFzIGJlaGF2aW5nIHN0cmFuZ2VseSBkdXJpbmcgY2xlYW51cAphIGJ1cmllZCB3YXJuaW5nIHRoYXQgdGhlIE1vZGVsIDEgZmxpZ2h0IHZlY3RvciB3YXMgbm90IHJhbmRvbTwvcHJlPgo8cD5UaGUgcmVsYXnigJlzIG1vc3QgaW1wb3J0YW50IGNsdWUgaXMgaW5pdGlhbGx5IGVhc3kgdG8gbWlzczo8L3A+CjxwcmU+U2V2ZXJhbCBNb2RlbCAxcyBlc2NhcGVkIHRoZSBkZXN0cm95ZWQgbmVzdCBhbmQgZmxldyBzb21ld2hlcmUgZWxzZS48L3ByZT4KPHA+VGhlIGNvcnBvcmF0aW9uIGRpc21pc3NlZCB0aGlzIGFzIHRlcm1pbmFsIGVycmF0aWMgYmVoYXZpb3IuIEhhbGRlbiBSb29rIG9yIGFub3RoZXIgcmVzZWFyY2hlciBmbGFnZ2VkIGl0IGFzIHBvc3NpYmxlIG5lc3Qtc2VlZGluZyBiZWhhdmlvciBiZWZvcmUgdGhlIHdhcm5pbmcgd2FzIGJ1cmllZC48L3A+CjxoMj5XaGF0IOKAnFNpZ25hbCBCbGVlZOKAnSBtZWFuczwvaDI+CjxwPlNpZ25hbCBCbGVlZCBpcyBub3QgbGl0ZXJhbCBhbGllbiBlbGVjdHJvbmljcyBjb3JydXB0aW9uLjwvcD4KPHA+VGhlIHRpdGxlIG1lYW5zOjwvcD4KPHByZT5UaGUgdHJ1dGggaXMgbGVha2luZy4KVGhlIGV2aWRlbmNlIGlzIHNwcmVhZGluZy4KVGhlIGNvcnBvcmF0aW9uIGNhbm5vdCBjb250YWluIHRoZSBzdG9yeS48L3ByZT4KPHA+SW4td29ybGQsIGNoYXJhY3RlcnMgbWF5IHVzZSDigJxzaWduYWwgYmxlZWTigJ0gdG8gZGVzY3JpYmUgdGhlIHJlbGF54oCZcyBjb3BpZWQgZXZpZGVuY2UgYXBwZWFyaW5nIGluIGNsaW5pYyB0ZXJtaW5hbHMsIGNhbWVyYSBidWZmZXJzLCBzdHVkZW50IHNsYXRlcywgYW5kIFJlZGxpbmUgbWVzaCBjYWNoZXMuPC9wPgo8cD5UaGF0IGlzIGh1bWFuIGRhdGEgbGVha2FnZSBhbmQgaHVtYW4gaGFja2luZywgbm90IEFudGl0aGVzaXMgaW5mbHVlbmNlLjwvcD4KPGgyPk1haW4gc2NlbmFyaW8gYXJjPC9oMj4KPG9sPgo8bGk+PHN0cm9uZz5UaGUgY291cmllciBhcnJpdmVzOjwvc3Ryb25nPiBUYW1zaW4gUXVpbGwgcmVhY2hlcyBNZXJjeSBUd2VsdmUgd2l0aCB0aGUgcmVsYXkgYW5kIGNvbGxhcHNlcy48L2xpPgo8bGk+PHN0cm9uZz5IdW1hbiBwcmVzc3VyZTo8L3N0cm9uZz4gdGhlIFBDcyBkZWFsIHdpdGggY2xpbmljIHN0YWZmLCBSZWRsaW5lIENob2lyLCBCbHVld2lyZSwgY2l2aWxpYW5zLCBjb3Jwb3JhdGUgb2JzZXJ2ZXJzLCBzdXJ2ZWlsbGFuY2UgZ2FwcywgYW5kIGZpcnN0IG1pc3NpbmctcGVyc29uIGNsdWVzLjwvbGk+CjxsaT48c3Ryb25nPlRoZSBvbGQgcmVzZWFyY2g6PC9zdHJvbmc+IEI4IGFuZC9vciByZWxheSBldmlkZW5jZSByZXZlYWwgdGhhdCB0aGUgY29ycG9yYXRpb24gcmFuIGlsbGVnYWwgQW50aXRoZXNpcyBiaW8tcmVzZWFyY2ggdW5kZXIgbWVkaWNhbCBjb3Zlci48L2xpPgo8bGk+PHN0cm9uZz5UaGUgb2xkIG5lc3Q6PC9zdHJvbmc+IEQ4IHJldmVhbHMgdGhlIGJ1cm5lZC1vdXQgdmlzaWJsZSBuZXN0IGFuZCBjb3Jwb3JhdGUgY2xlYW51cC48L2xpPgo8bGk+PHN0cm9uZz5UaGUgd3JvbmcgY29uY2x1c2lvbjo8L3N0cm9uZz4gZm9vdGFnZSBzaG93cyBNb2RlbCAxcyBmbHlpbmcgYXdheSBpbiBmb3JtYXRpb24uIENvcnBvcmF0ZSByZXBvcnRzIGNhbGwgdGhpcyDigJx0ZXJtaW5hbCBlcnJhdGljIGZsaWdodC7igJ08L2xpPgo8bGk+PHN0cm9uZz5UaGUgYnVyaWVkIHdhcm5pbmc6PC9zdHJvbmc+IEhhbGRlbiBSb29rIG9yIGFub3RoZXIgcmVzZWFyY2hlciB3YXJuZWQgdGhhdCB0aGUgZmxpZ2h0IHZlY3RvciBjb3VsZCBzZWVkIGEgbmV3IG5lc3QuPC9saT4KPGxpPjxzdHJvbmc+VGhlIGN1cnJlbnQgdGhyZWF0Ojwvc3Ryb25nPiBkcmFnIG1hcmtzLCBtaXNzaW5nIHBlb3BsZSwgYW5kIHNlcnZpY2Ugcm91dGVzIHBvaW50IGRlZXBlciBpbnRvIEZsb29yIEQuPC9saT4KPGxpPjxzdHJvbmc+VGhlIGFjdGl2ZSBoaWRkZW4gbmVzdDo8L3N0cm9uZz4gdGhlIFBDcyBkaXNjb3ZlciB0aGUgc2Vjb25kIG5lc3QsIG1vc3RseSBNb2RlbCAxcyBwbHVzIGEgZmV3IGp1dmVuaWxlIE1vZGVsIDMgaHVudGVycy48L2xpPgo8bGk+PHN0cm9uZz5GaW5hbCBjaG9pY2VzOjwvc3Ryb25nPiByZXNjdWUsIGRlc3Ryb3ksIGNvbnRhaW4sIGJyb2FkY2FzdCBldmlkZW5jZSwgY29vcGVyYXRlIHRlbXBvcmFyaWx5IHdpdGggZW5lbWllcywgb3Igc3Vydml2ZSBsb25nIGVub3VnaCBmb3IgTmlnaHRDcmFzaCB0byBjcmVhdGUgYW4gZXh0cmFjdGlvbiBvcGVuaW5nLjwvbGk+Cjwvb2w+CjxoMj5Ib3cgdG8gdXNlIEZsb29yIEIgYW5kIEZsb29yIEQgdG9nZXRoZXI8L2gyPgo8cD5GbG9vciBCIGlzIHN0aWxsIGltcG9ydGFudCBiZWNhdXNlIGl0IHNob3dzIHdoYXQgaXMgYXQgc3Rha2U6PC9wPgo8cHJlPnJlY292ZXJ5IHJvb21zCmZhbWlseSBzdXBwb3J0CmFpZCBuZXR3b3JrcwpNYXJh4oCZcyBoaWRkZW4gc3VwcG9ydAp0aGUgcmVjb3ZlcmVkIEI4IG5vdGVib29rCnRoZSBsYW5kaW5nIHBhZCBvciBlbWVyZ2VuY3kgYXJyaXZhbCBhY2Nlc3M8L3ByZT4KPHA+Rmxvb3IgRCBpcyB3aGVyZSB0aGUgaG9ycm9yIGJlY29tZXMgcGh5c2ljYWxseSBhY3RpdmU6PC9wPgo8cHJlPm9sZCBkZXN0cm95ZWQgbmVzdApjb250cm9sIGxvZ3MKZXNjYXBlIHZlY3RvcgphY3RpdmUgaGlkZGVuIG5lc3QKTW9kZWwgMSBpbmZlc3RhdGlvbgpNb2RlbCAzIGh1bnRlcnM8L3ByZT4KPHA+TmlnaHRDcmFzaCBtYXkgbGFuZCBhdCB0aGUgRmxvb3IgQiBwYWQgYW5kIHRoZW4gZW50ZXIgRmxvb3IgRCB0aHJvdWdoIGVsZXZhdG9ycywgc3RhaXJzLCBvciBzZXJ2aWNlIGFjY2Vzcy4gVGhpcyBkZWxheSBwcmVzZXJ2ZXMgdGVuc2lvbiBhbmQga2VlcHMgaGVyIGZyb20gc29sdmluZyB0aGUgZmxvb3IgaW1tZWRpYXRlbHkuPC9wPgo8aDI+SW1wb3J0YW50IHRvbmUgbm90ZTwvaDI+CjxwPlRoZSBjb3Jwb3JhdGlvbiBkaWQgbm90IG1lcmVseSDigJxtYWtlIGEgbWlzdGFrZS7igJ08L3A+CjxwPlRoZXkgY3JlYXRlZCBkZW5pYWJsZSBjb25kaXRpb25zIGZvciBpbGxlZ2FsIHJlc2VhcmNoLCB1c2VkIGxvY2FscyBhcyBzdWJqZWN0cyBvciBjb2xsYXRlcmFsLCBidXJpZWQgcmlzayB3YXJuaW5ncywgYW5kIHNlbnQgcmVjb3ZlcnkgZm9yY2VzIHRvIGNvbnRyb2wgZXZpZGVuY2UgcmF0aGVyIHRoYW4gcmVzY3VlIGV2ZXJ5b25lLjwvcD4KPHA+VGhlIEFudGl0aGVzaXMgYXJlIHRoZSBpbW1lZGlhdGUgYmlvbG9naWNhbCBob3Jyb3IuPC9wPgo8cD5UaGUgY29ycG9yYXRpb24gaXMgdGhlIGh1bWFuIHJlYXNvbiB0aGUgaG9ycm9yIHJlYWNoZWQgdGhlIGNvbW11bml0eS48L3A+"
  },
  {
    "name": "Signal Bleed - Missing Person Reports GM",
    "source_file": "handouts/22_Missing_Person_Reports_GM.md",
    "notes_b64": "PGgxPk1pc3NpbmcgUGVyc29uIFJlcG9ydHMgYW5kIEJpb21hc3MgVHJhaWw8L2gxPgo8aDI+UHVycG9zZTwvaDI+CjxwPlRoZSBtaXNzaW5nLXBlcnNvbiB0cmFpbCBpcyBob3cgdGhlIFBDcyBkaXNjb3ZlciB0aGF0IHRoZSBjb3Jwb3JhdGlvbuKAmXMgY2xlYW51cCBmYWlsZWQuIFRoZSBzZWNvbmQgaGlkZGVuIG5lc3QgaGFzIHByb2R1Y2VkIGEgZmV3IGp1dmVuaWxlIE1vZGVsIDNzLiBUaGV5IGh1bnQgaXNvbGF0ZWQgYmlvbWFzcywga2lsbCBvciBkaXNhYmxlIGl0LCBhbmQgZHJhZyBpdCBiYWNrIHRvIHRoZSBuZXN0LjwvcD4KPHA+VGhlIHZpY3RpbXMgYXJlIG1vc3RseSBwZW9wbGUgd2hvIG1vdmUgdGhyb3VnaCBxdWlldCBzZXJ2aWNlIHJvdXRlcyBvciBhcmUgZWFzeSB0byBkaXNtaXNzOiBtYWludGVuYW5jZSB3b3JrZXJzLCBuaWdodCBjbGVhbmVycywgZm9vZCBkZWxpdmVyeSB2b2x1bnRlZXJzLCB1bmRvY3VtZW50ZWQgc2hlbHRlciByZXNpZGVudHMsIFJlZGxpbmUgbG9va291dHMsIGFuZCBjbGluaWMgc3VwcG9ydCBzdGFmZi48L3A+CjxwPkNvcnBvcmF0ZSBSZWNvdmVyeSBpbml0aWFsbHkgZGlzbWlzc2VzIHRoZSBkaXNhcHBlYXJhbmNlcyBhcyBnYW5nIHZpb2xlbmNlLCB2YWdyYW5jeSwgcGFuaWMsIG9yIHBlb3BsZSBmbGVlaW5nIHRoZSBkaXN0cmljdC4gUmVkbGluZSBDaG9pciBzdXNwZWN0cyBzb21ldGhpbmcgaXMgd3JvbmcgYnV0IGRvZXMgbm90IGtub3cgaXQgaXMgQW50aXRoZXNpcy48L3A+CjxoMj5NaXNzaW5nOiBPc2thciBWZW5uPC9oMj4KPHA+PHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiBtYWludGVuYW5jZSB3b3JrZXIgPHN0cm9uZz5MYXN0IHNlZW46PC9zdHJvbmc+IEM2IEhWQUMgLyBBaXIgSGFuZGxpbmcgPHN0cm9uZz5MaWtlbHkgc3RhdHVzOjwvc3Ryb25nPiBkZWFkLCBwYXJ0bHkgaW5jb3Jwb3JhdGVkIGludG8gdGhlIGhpZGRlbiBuZXN0PC9wPgo8cD5Ib29rczo8L3A+Cjx1bD4KPGxpPldlbnQgdG8gY2hlY2sgYSByYXR0bGluZyB2ZW50LjwvbGk+CjxsaT5SYWRpbyBjdXQgb3V0IGFmdGVyIGhlIHNhaWQ6IOKAnFNvbWV0aGluZyBpcyBicmVhdGhpbmcgaW4gaGVyZS7igJ08L2xpPgo8bGk+SGlzIHRvb2wgY2FydCBpcyBzdGlsbCBuZWFyIEM2LjwvbGk+CjxsaT5IaXMgYWNjZXNzIGJhZGdlIHdhcyB1c2VkIG9uY2UgYWZ0ZXIgaGUgdmFuaXNoZWQsIGJ1dCBvbmx5IHRvIG9wZW4gYSBtYWludGVuYW5jZSBzdWJkb29yLjwvbGk+CjxsaT5EcmFnIG1hcmtzIGxlYWQgdG93YXJkIGEgaGlkZGVuIG1haW50ZW5hbmNlIGNhdml0eS48L2xpPgo8bGk+QSBib290IHdpdGggbm8gZm9vdCBpbnNpZGUgaXMgZm91bmQgbmVhciBhIHdhcm0gdmVudCBqdW5jdGlvbi48L2xpPgo8L3VsPgo8aDI+TWlzc2luZzogTGFsZWgg4oCcTGFsYeKAnSBNaXI8L2gyPgo8cD48c3Ryb25nPlJvbGU6PC9zdHJvbmc+IGZvb2QgZGlzdHJpYnV0aW9uIHZvbHVudGVlciA8c3Ryb25nPkxhc3Qgc2Vlbjo8L3N0cm9uZz4gQjEwIEJhY2sgU2VydmljZSBDb3JyaWRvciA8c3Ryb25nPkxpa2VseSBzdGF0dXM6PC9zdHJvbmc+IGRlYWQgb3IgY29jb29uZWQgbmVhciB0aGUgaGlkZGVuIG5lc3Q8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+Q2FycnlpbmcgbWVhbCBjcmF0ZXMgZnJvbSBhIFJlZGxpbmUgc3VwcGx5IHJvdXRlLjwvbGk+CjxsaT5IZXIgY3JhdGUgc3BpbGxlZCBuZWFyIGEgc2VydmljZSBoYXRjaC48L2xpPgo8bGk+Rm9vZCBwYWNrZXRzIGFyZSB0b3JuIG9wZW4sIGJ1dCBub3QgZWF0ZW4gbm9ybWFsbHkuPC9saT4KPGxpPkEgY2hpbGQgc2F5cyBzaGUgaGVhcmQg4oCcZG9nIGZlZXQgaW4gdGhlIHdhbGwu4oCdPC9saT4KPGxpPlJlZGxpbmUgQ2hvaXIgdGhpbmtzIHNoZSBtYXkgaGF2ZSBiZWVuIGdyYWJiZWQgYnkgY29ycCBvciByaXZhbCBnYW5nIGFjdG9ycy48L2xpPgo8L3VsPgo8aDI+TWlzc2luZzogQmV4IEFyYW5kYTwvaDI+CjxwPjxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gUmVkbGluZSBsb29rb3V0IDxzdHJvbmc+TGFzdCBzZWVuOjwvc3Ryb25nPiBBMTMgU2VydmljZSBDb3JyaWRvciAvIEMxIFNlcnZpY2UgU3RyZWV0IDxzdHJvbmc+TGlrZWx5IHN0YXR1czo8L3N0cm9uZz4gZGVhZDwvcD4KPHA+SG9va3M6PC9wPgo8dWw+CjxsaT5TdXBwb3NlZGx5IGRlc2VydGVkIHRoZWlyIHBvc3QuPC9saT4KPGxpPlJlZGxpbmUgdW5kZXJsaW5ncyBhcmUgYW5ncnkgYmVjYXVzZSBkZXNlcnRpb24gbWFrZXMgdGhlbSBsb29rIHdlYWsuPC9saT4KPGxpPlN3aXRjaCBoYXMgZm9vdGFnZSBzaG93aW5nIGEgZmFzdCwgbG93IHNoYXBlIGFuZCBCZXggYmVpbmcgZHJhZ2dlZCB1cHdhcmQgaW50byBhIHNlcnZpY2UgZ2FwLjwvbGk+CjxsaT5NYXJhIHdhbnRzIHByb29mIGJlZm9yZSBhZG1pdHRpbmcgZmVhciBpbiBmcm9udCBvZiBvdXRzaWRlcnMuPC9saT4KPC91bD4KPGgyPk1pc3Npbmc6IE5hcmluIFBlbGw8L2gyPgo8cD48c3Ryb25nPlJvbGU6PC9zdHJvbmc+IHVuZG9jdW1lbnRlZCBzaGVsdGVyIHJlc2lkZW50IDxzdHJvbmc+TGFzdCBzZWVuOjwvc3Ryb25nPiBCOCBTaGVsdGVyIERvcm0gLyBCMTIgRW1lcmdlbmN5IFN0YWlyIDxzdHJvbmc+TGlrZWx5IHN0YXR1czo8L3N0cm9uZz4gcG9zc2libHkgYWxpdmUgZWFybHksIGRlYWQgbGF0ZXIgaWYgUENzIGRlbGF5PC9wPgo8cD5Ib29rczo8L3A+Cjx1bD4KPGxpPk5vYm9keSByZXBvcnRlZCBpdCBvZmZpY2lhbGx5IGJlY2F1c2UgTmFyaW4gZmVhcmVkIGF1dGhvcml0aWVzLjwvbGk+CjxsaT5TaXN0ZXIgTHVtYSBrbm93cyBOYXJpbiB3b3VsZCBub3QgbGVhdmUgd2l0aG91dCB0aGVpciBiYWcuPC9saT4KPGxpPlRoZWlyIGJhZyBpcyBzdGlsbCB1bmRlciBhIGJ1bmsuPC9saT4KPGxpPkEgZmFpbnQgb3JnYW5pYyBzbWVhciBpcyBmb3VuZCBuZWFyIGEgc3RhaXIgbGFuZGluZy48L2xpPgo8bGk+U29tZW9uZSBoZWFyZCBhIG11ZmZsZWQgc2NyZWFtIGJ1dCBhc3N1bWVkIGl0IHdhcyBhIGZpZ2h0LjwvbGk+CjwvdWw+CjxoMj5NaXNzaW5nOiBUZWNobmljaWFuIEhhbGRlbiBSb29rPC9oMj4KPHA+PHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiBjb3Jwb3JhdGUgY2xlYW51cCB0ZWNobmljaWFuIC8gcmVzZWFyY2hlciA8c3Ryb25nPkxhc3Qgc2Vlbjo8L3N0cm9uZz4gb2xkIG5lc3Qgc3RlcmlsaXphdGlvbiBzaXRlIDxzdHJvbmc+TGlrZWx5IHN0YXR1czo8L3N0cm9uZz4gZGVhZCwgZXZpZGVuY2UgdHJhaWwgcmVtYWluczwvcD4KPHA+SG9va3M6PC9wPgo8dWw+CjxsaT5Db3Jwb3JhdGUgcmVjb3JkcyBsaXN0IGhpbSBhcyByZWFzc2lnbmVkLjwvbGk+CjxsaT5SZWxheSBsb2dzIHNob3cgaGUgZmxhZ2dlZCDigJx1bmV4cGVjdGVkIE1vZGVsIDEgZGlzcGxhY2VtZW50LuKAnTwvbGk+CjxsaT5IaXMgZmluYWwgbm90ZTog4oCcVGhleeKAmXJlIG5vdCBmbGVlaW5nLiBUaGV54oCZcmUgcmVsb2NhdGluZy7igJ08L2xpPgo8bGk+SGlzIHdhcm5pbmcgd2FzIG92ZXJydWxlZCBhcyBwYW5pYywgdHJhdW1hLCBvciBjb250YW1pbmF0aW9uIHN0cmVzcy48L2xpPgo8L3VsPgo8aDI+UnVtb3IgdGFibGU8L2gyPgo8b2w+CjxsaT7igJxPc2thciB3ZW50IGludG8gdGhlIHZlbnRzIGFuZCBuZXZlciBjYW1lIGJhY2su4oCdPC9saT4KPGxpPuKAnExhbGEgd291bGQgbm90IGxlYXZlIHdpdGhvdXQgc2F5aW5nIGdvb2RieWUgdG8gdGhlIGtpZHMu4oCdPC9saT4KPGxpPuKAnEJleCBkZXNlcnRlZC4gT3IgZ290IGdyYWJiZWQuIERlcGVuZHMgd2hvIHlvdSBhc2su4oCdPC9saT4KPGxpPuKAnFRoZSBjYW1lcmFzIHNraXBwZWQgYWdhaW4uIFNhbWUgdHdvIHNlY29uZHMsIG92ZXIgYW5kIG92ZXIu4oCdPC9saT4KPGxpPuKAnFRoZXJl4oCZcyBhIHN3ZWV0LXJvdCBzbWVsbCBuZWFyIHRoZSBzZXJ2aWNlIGNvcnJpZG9yLuKAnTwvbGk+CjxsaT7igJxTb21ldGhpbmcgc2NyYXRjaGVkIHRoZSBpbnNpZGUgb2YgYSB2ZW50IGNvdmVyLuKAnTwvbGk+CjxsaT7igJxCbHVld2lyZSBrZWVwcyBzYXlpbmcgdGhlIHdhbGxzIGhhdmUgdGVldGgu4oCdPC9saT4KPGxpPuKAnENvcnBvcmF0ZSBzYXlzIG1pc3NpbmcgbGFib3IgaXMgbm90IHRoZWlyIGp1cmlzZGljdGlvbi7igJ08L2xpPgo8bGk+4oCcQSBraWQgc2F3IGxpdHRsZSB3aW5ncywgYnV0IGtpZHMgc2VlIHRoaW5ncy7igJ08L2xpPgo8bGk+4oCcU29tZW9uZSBmb3VuZCBhIHNob2UgYmVoaW5kIHRoZSBkdWN0IGdyYXRpbmcu4oCdPC9saT4KPC9vbD4KPGgyPlBoeXNpY2FsIGNsdWUgbGFkZGVyPC9oMj4KPGgzPkZhciBmcm9tIG5lc3Q8L2gzPgo8dWw+CjxsaT5taXNzaW5nIHBlb3BsZTwvbGk+CjxsaT5uZXJ2b3VzIHdvcmtlcnM8L2xpPgo8bGk+Y2FtZXJhIGdhcHM8L2xpPgo8bGk+dW5leHBsYWluZWQgbm8tc2hvd3M8L2xpPgo8bGk+dmVudCByYXR0bGVzPC9saT4KPGxpPnN3ZWV0LCB3YXJtLCBvcmdhbmljIHNtZWxsPC9saT4KPC91bD4KPGgzPk5lYXIgcm91dGVzIHRvIG5lc3Q8L2gzPgo8dWw+CjxsaT50aHJlZS1wYXJ0IGJpdGUgd291bmRzPC9saT4KPGxpPmNsYXcgbWFya3MgYXQga25lZSBoZWlnaHQ8L2xpPgo8bGk+ZHJhZyBtYXJrczwvbGk+CjxsaT50b3JuIGNsb3RoaW5nPC9saT4KPGxpPmFjaWQtc2NvcmVkIHNjcmV3czwvbGk+CjxsaT5kZWFkIHJhdHMsIGluc2VjdHMsIG9yIGJpcmRzIGZ1c2VkIGludG8gcmVzaWR1ZTwvbGk+CjxsaT53YXJtIHdldCBhaXIgZnJvbSBjb2xkIHZlbnRzPC9saT4KPC91bD4KPGgzPk5lYXIgbmVzdDwvaDM+Cjx1bD4KPGxpPk1vZGVsIDMgdHJhY2tzPC9saT4KPGxpPmNsdW1wcyBvZiBkZWFkIE1vZGVsIDFzIGRpc3NvbHZlZCBpbnRvIGdyb3dpbmcgYmlvbWFzczwvbGk+CjxsaT5wYXJ0aWFsbHkgYWJzb3JiZWQgdmljdGltczwvbGk+CjxsaT5odW1taW5nIG9yIHdldCBjbGlja2luZzwvbGk+CjxsaT5qdXZlbmlsZXMgZHJhZ2dpbmcgcHJleTwvbGk+CjxsaT50aGluIG5lc3QgdGlzc3VlIHNwcmVhZGluZyBhbG9uZyBkdWN0cyBhbmQgaW5zdWxhdGlvbjwvbGk+CjwvdWw+CjxoMj5GYWlsdXJlIG1vZGU8L2gyPgo8cD5JZiB0aGUgUENzIGlnbm9yZSBtaXNzaW5nLXBlcnNvbiBjbHVlcywgZXNjYWxhdGUgaW5zdGVhZCBvZiBzdGFsbGluZzo8L3A+Cjx1bD4KPGxpPmEgTW9kZWwgMyBhdHRhY2tzIGEgdmlzaWJsZSBOUEM8L2xpPgo8bGk+YSBSZWRsaW5lIGxvb2tvdXQgdmFuaXNoZXMgZHVyaW5nIHBsYXk8L2xpPgo8bGk+YSBjb3JwIHRyb29wZXIgaXMgZHJhZ2dlZCBhd2F5IG1pZC1hcmd1bWVudDwvbGk+CjxsaT50aGUgdmVudGlsYXRpb24gc3lzdGVtIGNvdWdocyBvcmdhbmljIG1hdHRlciBpbnRvIGEgcHVibGljIGFyZWE8L2xpPgo8bGk+dGhlIG5lc3QgcmVhY2hlcyBhIHRocmVzaG9sZCBhbmQgcmVsZWFzZXMgbW9yZSBNb2RlbCAxczwvbGk+CjwvdWw+"
  },
  {
    "name": "Signal Bleed - Antithesis Hidden Nest GM",
    "source_file": "handouts/23_Antithesis_Hidden_Nest_GM.md",
    "notes_b64": "PGgxPkFudGl0aGVzaXMgaW4gU2lnbmFsIEJsZWVkOiBNb2RlbCAxcywgTW9kZWwgM3MsIGFuZCB0aGUgSGlkZGVuIE5lc3Q8L2gxPgo8aDI+TW9kdWxlLXNwZWNpZmljIEFudGl0aGVzaXMgc3RydWN0dXJlPC9oMj4KPHA+U2lnbmFsIEJsZWVkIHVzZXMgYSBzbWFsbCBsb2NhbCBuZXN0LCBub3QgYSBmdWxsLXNjYWxlIGludmFzaW9uLjwvcD4KPGgzPk1vZGVsIDFzPC9oMz4KPHA+VXNlIE1vZGVsIDFzIG1haW5seSBhcyBiYWNrc3RvcnkgYW5kIGxhdGUtc3RhZ2UgcHJlc3N1cmUuPC9wPgo8cD5JbiB0aGlzIG1vZHVsZTo8L3A+Cjx1bD4KPGxpPnRoZSBvcmlnaW5hbCBjb3Jwb3JhdGUgbmVzdCBwcm9kdWNlZCBNb2RlbCAxczwvbGk+CjxsaT5jb3Jwb3JhdGUgc3RlcmlsaXphdGlvbiBuZWFybHkgd2lwZWQgdGhlbSBvdXQ8L2xpPgo8bGk+c2V2ZXJhbCBNb2RlbCAxcyBlc2NhcGVkIGluIGZvcm1hdGlvbjwvbGk+CjxsaT50aGV5IHN1aWNpZGVkIGluIGEgY2x1bXAgYXQgYSBoaWRkZW4gc2l0ZTwvbGk+CjxsaT50aGVpciBib2RpZXMgc2VlZGVkIHRoZSBzZWNvbmQgbmVzdDwvbGk+CjwvdWw+CjxwPlRoZSBzdHJhbmdlIE1vZGVsIDEgYmVoYXZpb3IgaXMgdGhlIGtleSBjbHVlIHRoYXQgdGhlIGNvcnBvcmF0ZSBjbGVhbnVwIGZhaWxlZC48L3A+CjxoMz5Nb2RlbCAzIGp1dmVuaWxlczwvaDM+CjxwPlVzZSBhIGZldyBqdXZlbmlsZSBNb2RlbCAzcyBhcyB0aGUgYWN0aXZlIHByZXNlbnQtdGVuc2UgdGhyZWF0LjwvcD4KPHA+VGhleSBhcmUgZG9nLWxpa2UgQW50aXRoZXNpcyBwcmVkYXRvcnMgd2l0aCBqYXdzIHRoYXQgc3BsaXQgaW50byB0aHJlZSBwYXJ0cy4gVGhlaXIgcHVycG9zZSBoZXJlIGlzIG5vdCB0byBjb25xdWVyIG9wZW5seSwgYnV0IHRvIGdhdGhlciBiaW9tYXNzIGZvciB0aGUgaGlkZGVuIG5lc3QuPC9wPgo8cD5CZWhhdmlvcjo8L3A+CjxwcmU+c3RhbGsgaXNvbGF0ZWQgcHJleQphbWJ1c2ggZnJvbSBsb3cgYW5nbGVzCmRpc2FibGUgb3Iga2lsbCBxdWlja2x5CmRyYWcgYmlvbWFzcyBiYWNrIHRvIHRoZSBuZXN0CmF2b2lkIHVubmVjZXNzYXJ5IGZpZ2h0cyB3aXRoIHN0cm9uZyBncm91cHMKcmV0cmVhdCB0aHJvdWdoIHZlbnRzLCBzZXJ2aWNlIHNoYWZ0cywgYW5kIG1haW50ZW5hbmNlIGdhcHMKYmVjb21lIGJvbGRlciBhcyB0aGUgbmVzdCBncm93czwvcHJlPgo8aDI+VGFjdGljYWwgYmVoYXZpb3I8L2gyPgo8cD5BIE1vZGVsIDMganV2ZW5pbGUgc2hvdWxkIHRyeSB0bzo8L3A+Cjx1bD4KPGxpPmF0dGFjayBpc29sYXRlZCB0YXJnZXRzPC9saT4KPGxpPmtub2NrIHByZXkgZG93bjwvbGk+CjxsaT5kcmFnIHVuY29uc2Npb3VzIG9yIGRlYWQgdmljdGltcyBhd2F5PC9saT4KPGxpPnJldHJlYXQgaWYgYmFkbHkgaHVydDwvbGk+CjxsaT5hdHRhY2sgY2l2aWxpYW5zLCB3b3VuZGVkIE5QQ3MsIGxvbmUgZ3VhcmRzLCBhbmQgcGFuaWNrZWQgdGFyZ2V0cyBmaXJzdDwvbGk+CjxsaT51c2UgdmVudHMvc2VydmljZSByb3V0ZXMgdGhhdCBodW1hbnMgZmluZCBhd2t3YXJkPC9saT4KPGxpPmF2b2lkIGZpZ2h0aW5nIFNhbXVyYWktY2FwYWJsZSBQQ3MgdG8gdGhlIGRlYXRoIHVubGVzcyBjb3JuZXJlZCBvciBkZWZlbmRpbmcgdGhlIG5lc3Q8L2xpPgo8L3VsPgo8aDI+SG9ycm9yIHRlbGw8L2gyPgo8cD5UaGUgZmlyc3QgdmlzaWJsZSByZXZlYWwgc2hvdWxkIGJlIHRoZSBqYXcuPC9wPgo8cD5FeGFtcGxlczo8L3A+CjxwcmU+SXRzIGhlYWQgb3BlbnMgaW4gdGhyZWUgZGlyZWN0aW9ucy4KRm9yIG9uZSBzZWNvbmQgaXQgbG9va3MgbGlrZSBhIGRvZy4KVGhlbiBpdHMgZmFjZSB1bmZvbGRzLgpUaGUgamF3IHNwbGl0cyBsaWtlIGEgd2V0IGZsb3dlciB3aXRoIHRlZXRoLjwvcHJlPgo8aDI+RW5jb3VudGVyIHBhY2luZzwvaDI+CjxoMz5GaXJzdCBzaWduIOKAlCBubyBjb21iYXQ8L2gzPgo8dWw+CjxsaT52ZW50IGNvdmVyIGJlbnQgb3V0d2FyZDwvbGk+CjxsaT50aHJlZS1wcm9uZ2VkIGJpdGUgbWFya3M8L2xpPgo8bGk+ZHJhZyBtYXJrcyB0b3dhcmQgYSBzZXJ2aWNlIGhhdGNoPC9saT4KPGxpPmEgZm9vZCBjcmF0ZSBzcGlsbGVkIGFuZCBzbWVhcmVkIHdpdGggb3JnYW5pYyByZXNpZHVlPC9saT4KPGxpPmEgY2FtZXJhIHNob3dzIG9uZSBpbXBvc3NpYmxlIGxvdyBibHVyPC9saT4KPGxpPnNvbWVvbmXigJlzIHNob2Ugb3IgYmFkZ2UgaXMgZm91bmQgbmVhciBhIGR1Y3Q8L2xpPgo8L3VsPgo8aDM+Rmlyc3QgZ2xpbXBzZSDigJQgYnJpZWYgY29udGFjdDwvaDM+Cjx1bD4KPGxpPnNvbWV0aGluZyBsb3cgYW5kIGZhc3QgY3Jvc3NlcyB0aGUgZW5kIG9mIGEgY29ycmlkb3I8L2xpPgo8bGk+YSBqYXcgb3BlbnMgd3JvbmcgaW4gYSBjYW1lcmEgZnJlZXplLWZyYW1lPC9saT4KPGxpPmEgY2hpbGQgc2F5cyDigJxpdCB3YXMgbGlrZSBhIGRvZywgYnV0IHRoZSBtb3V0aCB3YXMgd3JvbmfigJ08L2xpPgo8bGk+Qmx1ZXdpcmUgb3IgYW5vdGhlciB1bnN0YWJsZSBOUEMgaGVhcnMgY2xpY2tpbmcgaW4gdGhlIHdhbGxzPC9saT4KPC91bD4KPGgzPkZpcnN0IGZpZ2h0IOKAlCByZXNjdWUgcHJlc3N1cmU8L2gzPgo8cD5CZXN0IGZpcnN0IGZpZ2h0IHNldHVwOjwvcD4KPHByZT5BIE1vZGVsIDMganV2ZW5pbGUgaGFzIGdyYWJiZWQgYW4gTlBDIGFuZCBpcyB0cnlpbmcgdG8gZHJhZyB0aGVtIGludG8gYSBzZXJ2aWNlIHJvdXRlLjwvcHJlPgo8cD5Hb29kIHZpY3RpbXM6PC9wPgo8dWw+CjxsaT5SZWRsaW5lIExvb2tvdXQgIzI8L2xpPgo8bGk+Rm9vZCBMaW5lIFZvbHVudGVlcjwvbGk+CjxsaT5PcmRlcmx5IFBheCBSdXVuPC9saT4KPGxpPkNvcnAgUmVjb3ZlcnkgIzI8L2xpPgo8bGk+TmFyaW4gUGVsbDwvbGk+CjxsaT5yYW5kb20g4oCcQmxva2UgIzPigJ0gdG9rZW48L2xpPgo8L3VsPgo8cD5UaGlzIHRlYWNoZXMgdGhlIHBsYXllcnMgdGhlIE1vZGVsIDMgZ29hbDogaXQgd2FudHMgYmlvbWFzcywgbm90IGEgZmFpciBmaWdodC48L3A+CjxoMz5OZXN0IHJldmVhbDwvaDM+CjxwPlRoZSBoaWRkZW4gbmVzdCBzaG91bGQgYmUgc21hbGwgYnV0IGhvcnJpZnlpbmc6PC9wPgo8dWw+CjxsaT5kZWFkIE1vZGVsIDEgY2x1bXAgZm9ybWluZyB0aGUgc2VlZDwvbGk+CjxsaT53YXJtIHdldCB0aXNzdWUgYWxvbmcgZHVjdHM8L2xpPgo8bGk+Ym9uZXMvdG9vbHMvYmFkZ2VzIHBhcnRseSBhYnNvcmJlZDwvbGk+CjxsaT52aWN0aW1zIHVzZWQgYXMgc2NhZmZvbGRpbmc8L2xpPgo8bGk+b25lIHBvc3NpYmx5IHNhdmFibGUgdmljdGltIGlmIHRoZSBQQ3Mgd2VyZSBmYXN0PC9saT4KPGxpPmp1dmVuaWxlIE1vZGVsIDNzIGRlZmVuZGluZyBvciBmZWVkaW5nIGl0PC9saT4KPGxpPnNpZ25zIHRoYXQgaXQgd2lsbCBwcm9kdWNlIG1vcmUgQW50aXRoZXNpcyBpZiBub3Qgc3RvcHBlZDwvbGk+CjwvdWw+CjxoMj5IdW1hbiBmYWN0aW9uIHJlYWN0aW9uPC9oMj4KPGgzPkNsaW5pYzwvaDM+CjxwPkhvcnJpZmllZCwgYnV0IGltbWVkaWF0ZWx5IGZvY3VzZWQgb24gdHJpYWdlLCBldmFjdWF0aW9uLCBhbmQgZXhwb3N1cmUgcmlzay48L3A+CjxoMz5SZWRsaW5lIENob2lyPC9oMz4KPHA+QW5ncnkgYW5kIGZyaWdodGVuZWQgYmVjYXVzZSB0aGVpciBwZW9wbGUgd2VyZSB0YWtlbi4gVGhpcyBjYW4gcHVzaCB0aGVtIGludG8gY29vcGVyYXRpb24gaWYgdGhlIFBDcyByZXNwZWN0IHRoZW0uPC9wPgo8aDM+Q29ycG9yYXRlIFJlY292ZXJ5PC9oMz4KPHA+SW5pdGlhbGx5IGRpc21pc3NpdmUgb3IgaG9zdGlsZS4gT25jZSB0aGUgc2Vjb25kIG5lc3QgaXMgcHJvdmVuLCBSdXNrIGhhcyB0byBjaG9vc2UgYmV0d2VlbiBhZG1pdHRpbmcgdGhlIGNsZWFudXAgZmFpbGVkLCBoZWxwaW5nIGNvbnRhaW4gdGhlIG5ldyBuZXN0LCBkb3VibGluZyBkb3duIG9uIHdpdG5lc3MgY29udHJvbCwgb3IgdHJ5aW5nIHRvIGRlc3Ryb3kgZXZlcnl0aGluZyBhbmQgYmxhbWUgdGhlIG5laWdoYm9yaG9vZC48L3A+CjxoMj5Ta2lsbCBwcm9tcHRzPC9oMj4KPHVsPgo8bGk+PHN0cm9uZz5NZWRpY2luZSAvIFN1cmdlcnk6PC9zdHJvbmc+IGlkZW50aWZ5IGJpdGUgdHJhdW1hLCBiaW9tYXNzIGluY29ycG9yYXRpb24sIHdoZXRoZXIgYSB2aWN0aW0gY2FuIGJlIHNhdmVkLjwvbGk+CjxsaT48c3Ryb25nPlRyYWNraW5nIC8gQm91bnR5IEh1bnRlcjo8L3N0cm9uZz4gZm9sbG93IGRyYWcgbWFya3MsIGlkZW50aWZ5IHByZXkgbW92ZW1lbnQsIGZpbmQgYW1idXNoIHJvdXRlcy48L2xpPgo8bGk+PHN0cm9uZz5TbWFsbCBBcm1zOjwvc3Ryb25nPiByZWFkIHdoZXJlIHNob3RzIHdlcmUgZmlyZWQgYXQgc29tZXRoaW5nIGxvdyBhbmQgZmFzdC48L2xpPgo8bGk+PHN0cm9uZz5CaWcgR3Vuczo8L3N0cm9uZz4gaWRlbnRpZnkgY29ycCBzdGVyaWxpemF0aW9uIGRhbWFnZSBmcm9tIHRoZSBvbGQgbmVzdC48L2xpPgo8bGk+PHN0cm9uZz5CbGFkZXMgLyBNZWxlZTo8L3N0cm9uZz4gcmVhZCBjbG9zZS1xdWFydGVycyBkZWZlbnNpdmUgd291bmRzIGFuZCBqYXctc3RyaWtlIHBhdHRlcm5zLjwvbGk+CjxsaT48c3Ryb25nPkdyZWFzZSBNb25rZXk6PC9zdHJvbmc+IGlkZW50aWZ5IGR1Y3QgYWNjZXNzLCBkYW1hZ2VkIHZlbnRzLCBhbmQgbWFpbnRlbmFuY2Ugcm91dGVzLjwvbGk+CjxsaT48c3Ryb25nPk1lc2ggSGFja2VyOjwvc3Ryb25nPiByZXRyaWV2ZSBjYW1lcmEgZnJhbWVzIGFuZCBhY2Nlc3MgbG9nczsgdGhpcyBpcyBodW1hbiBzdXJ2ZWlsbGFuY2UsIG5vdCBhbGllbiBlbGVjdHJvbmljcy48L2xpPgo8bGk+PHN0cm9uZz5TdHJlZXR3aXNlOjwvc3Ryb25nPiBrbm93IHdoaWNoIG1pc3NpbmcgcGVvcGxlIHdvdWxkIG5vdCBoYXZlIGxlZnQgdm9sdW50YXJpbHkuPC9saT4KPGxpPjxzdHJvbmc+UHN5Y2hvbG9neSAvIEVtcGF0aHk6PC9zdHJvbmc+IGNhbG0gd2l0bmVzc2VzIHdobyBzYXcgdGhlIGphdyB1bmZvbGQuPC9saT4KPC91bD4="
  },
  {
    "name": "Signal Bleed - Missing Person Descriptions GM",
    "source_file": "handouts/24_Missing_Person_Descriptions_GM.md",
    "notes_b64": "PGgxPk1pc3NpbmcgUGVyc29uIERlc2NyaXB0aW9uczwvaDE+CjxwPlVzZSB0aGVzZSBhcyBHTS1mYWNpbmcgZGVzY3JpcHRpb25zLCB3aXRuZXNzIHN1bW1hcmllcywgYW5kIHNlYXJjaC1yZXN1bHQgc25pcHBldHMuIFRoZXkgYXJlIHdyaXR0ZW4gc28gZWFjaCBtaXNzaW5nIHBlcnNvbiBjYW4gYmUgaW50cm9kdWNlZCB0aHJvdWdoIHJ1bW9ycywgcG9zdGVycywgY2FtZXJhIGxvb2t1cHMsIHN0YWZmIGNvbnZlcnNhdGlvbnMsIG9yIFJlZGxpbmUgcmVwb3J0cy48L3A+CjxoMj5Pc2thciBWZW5uPC9oMj4KPHA+PHN0cm9uZz5QdWJsaWMgZGVzY3JpcHRpb246PC9zdHJvbmc+IE9za2FyIFZlbm4gaXMgYSBzcXVhcmUtc2hvdWxkZXJlZCBtYWludGVuYW5jZSB3b3JrZXIgaW4gaGlzIGxhdGUgZm9ydGllcywgd2l0aCBhIHNoYXZlZCBoZWFkLCBncmV5IHN0dWJibGUsIGhlYXZ5IHdvcmsgZ2xvdmVzLCBhbmQgdGhlIHBlcm1hbmVudCBzcXVpbnQgb2Ygc29tZW9uZSB1c2VkIHRvIGJyb2tlbiBsaWdodGluZy4gSGlzIG9yYW5nZSBtYWludGVuYW5jZSB2ZXN0IGlzIHBhdGNoZWQgd2l0aCBvbGQgdW5pb24gc3RpY2tlcnMgYW5kIGhhbmQtd3JpdHRlbiB0b29sIGxhYmVscy48L3A+CjxwPjxzdHJvbmc+SG93IHBlb3BsZSBkZXNjcmliZSBoaW06PC9zdHJvbmc+IOKAnENhcmVmdWwuIFN0dWJib3JuLiBDb21wbGFpbnMgYWJvdXQgZXZlcnl0aGluZywgYnV0IGZpeGVzIGl0IGFueXdheS7igJ08L3A+CjxwPjxzdHJvbmc+TGFzdCBrbm93biBjbG90aGluZzo8L3N0cm9uZz4gT3JhbmdlIG1haW50ZW5hbmNlIHZlc3QsIGRhcmsgdW5kZXJzaGlydCwgZ3JleSB1dGlsaXR5IHRyb3VzZXJzLCB0b29sIGJlbHQsIHNjdWZmZWQgbWFnbmV0aWMgYm9vdHMuPC9wPgo8cD48c3Ryb25nPkxhc3Qgc2Vlbjo8L3N0cm9uZz4gQzYgSFZBQyAvIEFpciBIYW5kbGluZy48L3A+CjxwPjxzdHJvbmc+Rm91bmQgY2x1ZXM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT50b29sIGNhcnQgbGVmdCBpbiB0aGUgd3JvbmcgcGxhY2U8L2xpPgo8bGk+cmFkaW8gbG9nOiDigJxTb21ldGhpbmcgaXMgYnJlYXRoaW5nIGluIGhlcmUu4oCdPC9saT4KPGxpPmFjY2VzcyBiYWRnZSB1c2VkIG9uY2UgYWZ0ZXIgZGlzYXBwZWFyYW5jZTwvbGk+CjxsaT52ZW50IGNvdmVyIGJlbnQgb3V0d2FyZDwvbGk+CjxsaT5kcmFnIG1hcmtzIHRvd2FyZCBtYWludGVuYW5jZSBjYXZpdHk8L2xpPgo8bGk+b25lIGJvb3QgZm91bmQgbmVhciBhIHdhcm0gdmVudCBqdW5jdGlvbjwvbGk+CjwvdWw+CjxwPjxzdHJvbmc+V2hhdCByZWFsbHkgaGFwcGVuZWQ6PC9zdHJvbmc+IEEganV2ZW5pbGUgTW9kZWwgMyBhbWJ1c2hlZCBPc2thciBuZWFyIHRoZSBIVkFDIGp1bmN0aW9uIGFuZCBkcmFnZ2VkIGhpbSB0b3dhcmQgdGhlIGhpZGRlbiBuZXN0LiBIZSBpcyBwcm9iYWJseSBkZWFkIHVubGVzcyB0aGUgR00gd2FudHMgYW4gZWFybHkgcmVzY3VlIHBvc3NpYmlsaXR5LjwvcD4KPGgyPkxhbGVoIOKAnExhbGHigJ0gTWlyPC9oMj4KPHA+PHN0cm9uZz5QdWJsaWMgZGVzY3JpcHRpb246PC9zdHJvbmc+IExhbGEgTWlyIGlzIGEgZm9vZC1kaXN0cmlidXRpb24gdm9sdW50ZWVyIGluIGhlciB0d2VudGllcyBvciBlYXJseSB0aGlydGllcywgdXN1YWxseSBzZWVuIHdpdGggYSBicmlnaHQgc2NhcmYsIGRlbGl2ZXJ5IGhhcm5lc3MsIGFuZCBhIHN0YWNrIG9mIG1lYWwgY3JhdGVzIGJhbGFuY2VkIGxpa2Ugc2hlIGhhcyBkb25lIHRoaXMgZXZlcnkgZGF5IG9mIGhlciBsaWZlLiBTaGUgaGFzIHF1aWNrIGhhbmRzLCBhIHF1aWNrZXIgc21pbGUsIGFuZCBhIGhhYml0IG9mIHJlbWVtYmVyaW5nIHdobyBuZWVkcyBleHRyYSBmb29kIHdpdGhvdXQgYXNraW5nIHB1YmxpY2x5LjwvcD4KPHA+PHN0cm9uZz5Ib3cgcGVvcGxlIGRlc2NyaWJlIGhlcjo8L3N0cm9uZz4g4oCcU2hlIGZlZWRzIHBlb3BsZSBiZWZvcmUgdGhleSBoYXZlIHRvIGJlZy7igJ08L3A+CjxwPjxzdHJvbmc+TGFzdCBrbm93biBjbG90aGluZzo8L3N0cm9uZz4gVGVhbCBzY2FyZiwgdm9sdW50ZWVyIGphY2tldCwgcGF0Y2hlZCBjYXJnbyB0cm91c2VycywgbWVhbC1jcmF0ZSBoYXJuZXNzLjwvcD4KPHA+PHN0cm9uZz5MYXN0IHNlZW46PC9zdHJvbmc+IEIxMCBCYWNrIFNlcnZpY2UgQ29ycmlkb3IsIG1vdmluZyBiZXR3ZWVuIGFpZCBkaXN0cmlidXRpb24gYW5kIHNlcnZpY2Ugcm91dGVzLjwvcD4KPHA+PHN0cm9uZz5Gb3VuZCBjbHVlczo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPnNwaWxsZWQgbWVhbCBjcmF0ZXM8L2xpPgo8bGk+dG9ybiBmb29kIHBhY2tldHMsIG5vdCBlYXRlbiBub3JtYWxseTwvbGk+CjxsaT5hIGNoaWxkIGhlYXJkIOKAnGRvZyBmZWV0IGluIHRoZSB3YWxs4oCdPC9saT4KPGxpPnNlcnZpY2UgaGF0Y2ggd2l0aCBhY2lkLXNjb3JlZCBzY3Jld3M8L2xpPgo8bGk+UmVkbGluZSBzdXBwbHkgbWFya3MgbmVhciB0aGUgcm91dGU8L2xpPgo8L3VsPgo8cD48c3Ryb25nPldoYXQgcmVhbGx5IGhhcHBlbmVkOjwvc3Ryb25nPiBBIGp1dmVuaWxlIE1vZGVsIDMgY2F1Z2h0IGhlciBuZWFyIHRoZSBzZXJ2aWNlIGhhdGNoIGFuZCBkcmFnZ2VkIGhlciB0b3dhcmQgTWFwIEMuIEhlciBkaXNhcHBlYXJhbmNlIGxpbmtzIE1hcmHigJlzIGFpZCBuZXR3b3JrIHRvIHRoZSBoaWRkZW4gbmVzdCB0cmFpbC48L3A+CjxoMj5CZXggQXJhbmRhPC9oMj4KPHA+PHN0cm9uZz5QdWJsaWMgZGVzY3JpcHRpb246PC9zdHJvbmc+IEJleCBBcmFuZGEgaXMgYSBsZWFuIFJlZGxpbmUgQ2hvaXIgbG9va291dCB3aXRoIHNoYXJwIGNoZWVrYm9uZXMsIGNoaXBwZWQgYmxhY2sgbmFpbCBwYWludCwgYSByZWQgc2NhcmYgdGllZCBhdCBvbmUgd3Jpc3QsIGFuZCBhIGNoZWFwIHBpc3RvbCB0aGV5IGNhcnJ5IGxpa2UgdGhleSBhcmUgdHJ5aW5nIHRvIGxvb2sgbW9yZSBkYW5nZXJvdXMgdGhhbiB0aGV5IGZlZWwuIFRoZXkgYXJlIHlvdW5nIGVub3VnaCB0byBiZSByZWNrbGVzcyBhbmQgb2xkIGVub3VnaCB0byBrbm93IGJldHRlci48L3A+CjxwPjxzdHJvbmc+SG93IHBlb3BsZSBkZXNjcmliZSB0aGVtOjwvc3Ryb25nPiDigJxNb3V0aHksIHNjYXJlZCBvZiBub3RoaW5nLCBzY2FyZWQgb2YgTWFyYSwgbG95YWwgd2hlbiBpdCBjb3VudHMu4oCdPC9wPgo8cD48c3Ryb25nPkxhc3Qga25vd24gY2xvdGhpbmc6PC9zdHJvbmc+IERhcmsgamFja2V0LCByZWQgd3Jpc3Qgc2NhcmYsIGJsYWNrIHdvcmsgYm9vdHMsIGNoZWFwIHNpZGVhcm0sIFJlZGxpbmUgdG9rZW4uPC9wPgo8cD48c3Ryb25nPkxhc3Qgc2Vlbjo8L3N0cm9uZz4gQTEzIFNlcnZpY2UgQ29ycmlkb3IgLyBDMSBTZXJ2aWNlIFN0cmVldC48L3A+CjxwPjxzdHJvbmc+Rm91bmQgY2x1ZXM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5kcm9wcGVkIFJlZGxpbmUgdG9rZW4gb3Iga25pZmU8L2xpPgo8bGk+c2NyYXBlIG1hcmtzIGxlYWRpbmcgdXB3YXJkIHRvd2FyZCBhIHNlcnZpY2UgZ2FwPC9saT4KPGxpPmNvcnJ1cHRlZCBTd2l0Y2ggZm9vdGFnZSBzaG93aW5nIHNvbWV0aGluZyBsb3cgYW5kIGZhc3Q8L2xpPgo8bGk+bG93LWFuZ2xlIGJsb29kIHNtZWFyIG9yIGltcGFjdCBtYXJrPC9saT4KPGxpPm5vIGV2aWRlbmNlIEJleCBsZWZ0IHZvbHVudGFyaWx5PC9saT4KPC91bD4KPHA+PHN0cm9uZz5XaGF0IHJlYWxseSBoYXBwZW5lZDo8L3N0cm9uZz4gQmV4IGRpZCBub3QgZGVzZXJ0LiBBIGp1dmVuaWxlIE1vZGVsIDMgdG9vayB0aGVtLiBQcm92aW5nIHRoaXMgZ2l2ZXMgTWFyYSBhIGRpcmVjdCByZWFzb24gdG8gY29vcGVyYXRlLjwvcD4KPGgyPk5hcmluIFBlbGw8L2gyPgo8cD48c3Ryb25nPlB1YmxpYyBkZXNjcmlwdGlvbjo8L3N0cm9uZz4gTmFyaW4gUGVsbCBpcyBhbiB1bmRvY3VtZW50ZWQgc2hlbHRlciByZXNpZGVudCBpbiB0aGVpciB0aGlydGllcywgdGhpbiwgd2F0Y2hmdWwsIGFuZCBjYXJlZnVsIGFib3V0IGV2ZXJ5IGRvb3J3YXkuIFRoZXkga2VlcCB0aGVpciBiZWxvbmdpbmdzIGZvbGRlZCBpbnRvIGEgc2luZ2xlIGZhYnJpYyBiYWcgYW5kIHNwZWFrIHNvZnRseSB1bmxlc3MgdGhleSBhcmUgaGVscGluZyBzb21lb25lIGVsc2UgYXZvaWQgYXR0ZW50aW9uLjwvcD4KPHA+PHN0cm9uZz5Ib3cgcGVvcGxlIGRlc2NyaWJlIHRoZW06PC9zdHJvbmc+IOKAnFRoZXkgc3Vydml2ZWQgYnkgbm90IGJlaW5nIG5vdGljZWQuIFRoYXTigJlzIHdoeSBzb21lb25lIHNob3VsZCBoYXZlIG5vdGljZWQgd2hlbiB0aGV5IHZhbmlzaGVkLuKAnTwvcD4KPHA+PHN0cm9uZz5MYXN0IGtub3duIGNsb3RoaW5nOjwvc3Ryb25nPiBCcm93biBjb2F0LCBzb2Z0IHNob2VzLCB0aHJlYWRiYXJlIHNjYXJmLCBjbG90aCBzaG91bGRlciBiYWcuPC9wPgo8cD48c3Ryb25nPkxhc3Qgc2Vlbjo8L3N0cm9uZz4gQjggU2hlbHRlciBEb3JtIC8gQjEyIEVtZXJnZW5jeSBTdGFpci48L3A+CjxwPjxzdHJvbmc+Rm91bmQgY2x1ZXM6PC9zdHJvbmc+PC9wPgo8dWw+CjxsaT5iYWcgc3RpbGwgdW5kZXIgYnVuazwvbGk+CjxsaT5TaXN0ZXIgTHVtYSBpbnNpc3RzIE5hcmluIHdvdWxkIG5ldmVyIGxlYXZlIGl0PC9saT4KPGxpPm9yZ2FuaWMgc21lYXIgbmVhciBzdGFpciBsYW5kaW5nPC9saT4KPGxpPm11ZmZsZWQgc2NyZWFtIGRpc21pc3NlZCBhcyBhIGZpZ2h0PC9saT4KPGxpPnBvc3NpYmxlIHRyYWlsIHRvd2FyZCBDMTEgLyBDMTI8L2xpPgo8L3VsPgo8cD48c3Ryb25nPldoYXQgcmVhbGx5IGhhcHBlbmVkOjwvc3Ryb25nPiBOYXJpbiBtYXkgc3RpbGwgYmUgYWxpdmUgaWYgdGhlIFBDcyBtb3ZlIHF1aWNrbHkuIFVzZSB0aGVtIGFzIGEgcmVzY3VlIHRpbWVyOiB0aGUgbG9uZ2VyIHRoZSBQQ3MgZGVsYXksIHRoZSBtb3JlIGxpa2VseSBOYXJpbiBiZWNvbWVzIHBhcnQgb2YgdGhlIG5lc3QuPC9wPgo8aDI+SGFsZGVuIFJvb2s8L2gyPgo8cD48c3Ryb25nPlB1YmxpYyBkZXNjcmlwdGlvbjo8L3N0cm9uZz4gSGFsZGVuIFJvb2sgd2FzIGEgY29ycG9yYXRlIGNsZWFudXAgdGVjaG5pY2lhbiBhdHRhY2hlZCB0byB0aGUgb3JpZ2luYWwgbmVzdCBzdGVyaWxpemF0aW9uIG9wZXJhdGlvbi4gSGUgd2FzIG5hcnJvdy1mYWNlZCwgcHJlY2lzZSwgYW5kIGxvb2tlZCBtb3JlIGxpa2UgYSBsYWItc2FmZXR5IG9mZmljZXIgdGhhbiBhIHNvbGRpZXIuIEhpcyBJRCBwaG90byBzaG93cyBhIG1hbiB0cnlpbmcgdmVyeSBoYXJkIG5vdCB0byBsb29rIGZyaWdodGVuZWQuPC9wPgo8cD48c3Ryb25nPkhvdyBwZW9wbGUgZGVzY3JpYmUgaGltOjwvc3Ryb25nPiDigJxBbm5veWluZyBiZWNhdXNlIGhlIHJlYWQgdGhlIHByb2NlZHVyZXMuIERhbmdlcm91cyBiZWNhdXNlIGhlIG5vdGljZWQgd2hlbiB0aGUgcHJvY2VkdXJlcyB3ZXJlIHdyb25nLuKAnTwvcD4KPHA+PHN0cm9uZz5MYXN0IGtub3duIGNsb3RoaW5nOjwvc3Ryb25nPiBDb3Jwb3JhdGUgY2xlYW51cCBzdWl0LCBzZWFsZWQgaGVsbWV0LCBoYXphcmQgdGFnLCBjaGVzdC1tb3VudGVkIHJlY29yZGVyLjwvcD4KPHA+PHN0cm9uZz5MYXN0IHNlZW46PC9zdHJvbmc+IE9sZCBuZXN0IGNsZWFudXAgc2l0ZSAvIEQ2IENvbnRyb2wgUm9vbSByZWNvcmRzLjwvcD4KPHA+PHN0cm9uZz5Gb3VuZCBjbHVlczo8L3N0cm9uZz48L3A+Cjx1bD4KPGxpPmZpbmFsIGFubm90YXRpb246IOKAnFRoZXnigJlyZSBub3QgZmxlZWluZy4gVGhleeKAmXJlIHJlbG9jYXRpbmcu4oCdPC9saT4KPGxpPmRlbGV0ZWQgd2FybmluZzog4oCcbmVzdC1zZWVkaW5nIHJpc2vigJ08L2xpPgo8bGk+b3ZlcnJ1bGVkIHJlcG9ydCBjbGFzc2lmaWNhdGlvbjog4oCcdGVybWluYWwgZXJyYXRpYyBmbGlnaHTigJ08L2xpPgo8bGk+cmVsYXkgY29weSBvZiBoaXMgaGVsbWV0IGZlZWQ8L2xpPgo8bGk+cGVyc29ubmVsIGZpbGUgbWFya2VkIHJlYXNzaWduZWQgaW5zdGVhZCBvZiBkZWFkPC9saT4KPC91bD4KPHA+PHN0cm9uZz5XaGF0IHJlYWxseSBoYXBwZW5lZDo8L3N0cm9uZz4gSGFsZGVuIHVuZGVyc3Rvb2QgdGhhdCB0aGUgTW9kZWwgMXMgd2VyZSBub3QgZmxlZWluZyByYW5kb21seS4gSGlzIHdhcm5pbmcgd2FzIGJ1cmllZCBiZWNhdXNlIGFkbWl0dGluZyBpdCB3b3VsZCBtZWFuIHRoZSBjbGVhbnVwIGhhZCBmYWlsZWQuPC9wPgo8aDI+SG93IHRvIHByZXNlbnQgbWlzc2luZy1wZXJzb24gZXZpZGVuY2U8L2gyPgo8cD5TdGFydCBtdW5kYW5lLiBEbyBub3QgcmV2ZWFsIEFudGl0aGVzaXMgaW1tZWRpYXRlbHkuPC9wPgo8cD5Hb29kIGZpcnN0IGRlc2NyaXB0aW9uczo8L3A+Cjx1bD4KPGxpPuKAnE5vLXNob3cgcGF0aWVudC7igJ08L2xpPgo8bGk+4oCcTWFpbnRlbmFuY2Ugd29ya2VyIG1pc3NpbmcgYWZ0ZXIgYSB2ZW50IGNhbGwu4oCdPC9saT4KPGxpPuKAnEZvb2Qgdm9sdW50ZWVyIGRpZCBub3QgY29tZSBiYWNrLuKAnTwvbGk+CjxsaT7igJxHYW5nIGxvb2tvdXQgZGVzZXJ0ZWQu4oCdPC9saT4KPGxpPuKAnFNoZWx0ZXIgcmVzaWRlbnQgbGVmdCB3aXRob3V0IHRoZWlyIGJhZy7igJ08L2xpPgo8L3VsPgo8cD5UaGVuIHNoYXJwZW4gdGhlIHBhdHRlcm46PC9wPgo8dWw+CjxsaT5hbGwgcm91dGVzIHRvdWNoIHNlcnZpY2UgaW5mcmFzdHJ1Y3R1cmU8L2xpPgo8bGk+YWxsIGRpc2FwcGVhcmFuY2VzIGhhcHBlbiBuZWFyIGR1Y3RzLCBzdGFpcnMsIG9yIGJhY2sgY29ycmlkb3JzPC9saT4KPGxpPmNhbWVyYSBmb290YWdlIGlzIG1pc3NpbmcsIGVkaXRlZCwgb3Igc2hvd3MgbG93IGZhc3QgbW92ZW1lbnQ8L2xpPgo8bGk+dGhlcmUgYXJlIGRyYWcgbWFya3MgYW5kIGJpb2xvZ2ljYWwgcmVzaWR1ZTwvbGk+CjxsaT5wZW9wbGUgaGVhcmQgY2xpY2tpbmcsIGRvZyBmZWV0LCBvciBicmVhdGhpbmcgaW4gdGhlIHdhbGxzPC9saT4KPC91bD4KPGgyPlF1aWNrIHRva2VuIGxhYmVsczwvaDI+CjxwPlVzZSB0aGVzZSBmb3IgY2x1ZSBtYXJrZXJzOjwvcD4KPHByZT5Pc2thcuKAmXMgVG9vbCBDYXJ0CkxhbGHigJlzIFNwaWxsZWQgQ3JhdGVzCkJleOKAmXMgUmVkbGluZSBUb2tlbgpOYXJpbuKAmXMgQmFnCkhhbGRlbuKAmXMgRGVsZXRlZCBXYXJuaW5nCldhcm0gVmVudCBTbWVhcgpCZW50IFZlbnQgQ292ZXIKTW9kZWwgMyBEcmFnIE1hcmtzPC9wcmU+"
  },
  {
    "name": "Signal Bleed - Supporting NPCs and Spies GM",
    "source_file": "handouts/25_Supporting_NPCs_and_Spies_GM.md",
    "notes_b64": "PGgxPlN1cHBvcnRpbmcgTlBDcyBhbmQgU3BpZXM8L2gxPgo8cD5UaGVzZSBOUENzIGFyZSBpbnRlbmRlZCBhcyBtYXAgdG9rZW5zLCBjb252ZXJzYXRpb24gdGFyZ2V0cywgc3VzcGVjdHMsIHdpdG5lc3NlcywgYW5kIHByZXNzdXJlIHZhbHZlcy4gVGhleSBhcmUgbGVzcyBpbXBvcnRhbnQgdGhhbiB0aGUgZmFjdGlvbiBoZWFkcywgYnV0IHRoZXkgbWFrZSB0aGUgbWFwcyBmZWVsIHBvcHVsYXRlZCBhbmQgZ2l2ZSBwbGF5ZXJzIHBlb3BsZSB0byB0YWxrIHRvLjwvcD4KPGgyPk1lcmN5IFR3ZWx2ZSBDbGluaWM8L2gyPgo8aDM+U2VuaW9yIE51cnNlIEltYW5pIENobzwvaDM+CjxwPjxzdHJvbmc+VG9rZW4gbmFtZTo8L3N0cm9uZz4gTnVyc2UgQ2hvIDxzdHJvbmc+TG9jYXRpb246PC9zdHJvbmc+IEEzIFJlY2VwdGlvbiBvciBBNSBUcmlhZ2UgPHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiBjbGluaWMgZmxvb3IgbGVhZCA8c3Ryb25nPlVzZTo8L3N0cm9uZz4gcHJhY3RpY2FsIGd1aWRlLCB0cmlhZ2UgYXV0aG9yaXR5LCBwYXRpZW50LXByb3RlY3Rpb24gdm9pY2U8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+a25vd3Mgd2hpY2ggcGF0aWVudHMgY2Fubm90IGJlIGV2YWN1YXRlZCBxdWlja2x5PC9saT4KPGxpPmtub3dzIExhbGEgTWlyIGJ5IG5hbWUgZnJvbSBmb29kIGRpc3RyaWJ1dGlvbjwvbGk+CjxsaT5zdXNwZWN0cyByZWNlbnQg4oCcbm8tc2hvd3PigJ0gYXJlIGNvbm5lY3RlZDwvbGk+CjxsaT5jYW4gYXV0aG9yaXplIGFjY2VzcyB0byBub24tcHJpdmF0ZSBjbGluaWMgbG9ncyBpZiBEci4gVmFsZXogYWdyZWVzPC9saT4KPC91bD4KPHA+U2VjcmV0IHByZXNzdXJlOjwvcD4KPHVsPgo8bGk+dGVycmlmaWVkIHRoYXQgdGhlIHJlbGF5IHByb3ZlcyB0aGUgY2xpbmljIHVua25vd2luZ2x5IHRyZWF0ZWQgaWxsZWdhbCB0cmlhbCBzdWJqZWN0czwvbGk+CjwvdWw+CjxoMz5PcmRlcmx5IFBheCBSdXVuPC9oMz4KPHA+PHN0cm9uZz5Ub2tlbiBuYW1lOjwvc3Ryb25nPiBQYXggUnV1biA8c3Ryb25nPkxvY2F0aW9uOjwvc3Ryb25nPiBBNiBFbWVyZ2VuY3kgSW50YWtlIDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gbmVydm91cyB3aXRuZXNzIDxzdHJvbmc+VXNlOjwvc3Ryb25nPiBlbWVyZ2VuY3ktYmF5IGNsdWUgc291cmNlPC9wPgo8cD5Ib29rczo8L3A+Cjx1bD4KPGxpPnNhdyB1bnVzdWFsIHBhdGllbnQgdHJhbnNmZXJzPC9saT4KPGxpPnJlY29nbml6ZXMgYSBzdXBwb3NlZGx5IGRpc2NoYXJnZWQgcGF0aWVudCBmcm9tIHJlbGF5IGZpbGVzPC9saT4KPGxpPmtub3dzIHRoZSBjb3VyaWVyIGRpZCBub3QgYXJyaXZlIHRocm91Z2ggdGhlIG9mZmljaWFsIGJheTwvbGk+CjxsaT5tYXkgcGFuaWMgaWYgQ29ycG9yYXRlIFJlY292ZXJ5IGVudGVycyB0aGUgY2xpbmljPC9saT4KPC91bD4KPHA+U2VjcmV0IHByZXNzdXJlOjwvcD4KPHVsPgo8bGk+ZGVsZXRlZCBvbmUgbWlub3IgaW50YWtlIG5vdGUgYmVjYXVzZSBoZSBmZWFyZWQgYmVpbmcgYmxhbWVkPC9saT4KPC91bD4KPGgzPlJhZmEgTWJla2k8L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IFJhZmEgTWJla2kgb3IgQ2xpbmljIFNlY3VyaXR5IDxzdHJvbmc+TG9jYXRpb246PC9zdHJvbmc+IEExMCBSZWNvcmRzIC8gY2xpbmljIHNlY3VyaXR5IGFsY292ZSA8c3Ryb25nPlJvbGU6PC9zdHJvbmc+IGNsaW5pYyBjYW1lcmEgbW9uaXRvciA8c3Ryb25nPlVzZTo8L3N0cm9uZz4gY29udHJvbC1yb29tIGNvb3BlcmF0aW9uIHBvaW50PC9wPgo8cD5Ib29rczo8L3A+Cjx1bD4KPGxpPmNhbiBwdWxsIGNsaW5pYyBjYW1lcmEgZmVlZHM8L2xpPgo8bGk+a25vd3MgcHJpdmFjeS1kaXNhYmxlZCByb29tczwvbGk+CjxsaT5ub3RpY2VkIG1pc3NpbmcgZm9vdGFnZSBuZWFyIHBhdGllbnQgdHJhbnNmZXJzPC9saT4KPGxpPmNhbiBjb21wYXJlIGNsaW5pYyBkb29ycyB3aXRoIFJlZGxpbmUgc3RyZWV0IGNhbWVyYXMgaWYgU3dpdGNoIGNvb3BlcmF0ZXM8L2xpPgo8L3VsPgo8cD5TZWNyZXQgcHJlc3N1cmU6PC9wPgo8dWw+CjxsaT5zYXQgb24gc29tZSBjYW1lcmEgYW5vbWFsaWVzIGJlY2F1c2UgcmVwb3J0aW5nIHRoZW0gd291bGQgaW52aXRlIGNvcnBvcmF0ZSBzZWl6dXJlPC9saT4KPC91bD4KPGgzPkRyLiBWZWxhIE15dW5nPC9oMz4KPHA+PHN0cm9uZz5Ub2tlbiBuYW1lOjwvc3Ryb25nPiBEci4gTXl1bmcgPHN0cm9uZz5Mb2NhdGlvbjo8L3N0cm9uZz4gQTcgVHJhdW1hIC8gQTkgUmVjb3ZlcnkgPHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiB0aXJlZCB0cmF1bWEgZG9jdG9yIDxzdHJvbmc+VXNlOjwvc3Ryb25nPiBtZWRpY2FsIGludGVycHJldGF0aW9uIG9mIGV4cG9zdXJlLXRyaWFsIHZpY3RpbXM8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+Y2FuIGlkZW50aWZ5IGZhbHNlIHRyZWF0bWVudCBwcm90b2NvbHMgaW4gcmVsYXkgZmlsZXM8L2xpPgo8bGk+bm90aWNlcyB0aGF0IHNvbWUg4oCcbWVkaWNpbmXigJ0gaGFkIHRyaWFsLWJhdGNoIGNvZGVzPC9saT4KPGxpPmNhbiBpZGVudGlmeSBNb2RlbCAzIGJpdGUgdHJhdW1hIG9uY2Ugc2hvd24gYSB2aWN0aW08L2xpPgo8L3VsPgo8cD5TZWNyZXQgcHJlc3N1cmU6PC9wPgo8dWw+CjxsaT5vbmNlIGFjY2VwdGVkIGNvcnBvcmF0ZS1kb25hdGVkIG1lZGljaW5lIHdpdGhvdXQgYXNraW5nIGVub3VnaCBxdWVzdGlvbnM8L2xpPgo8L3VsPgo8aDI+UmVkbGluZSBDaG9pcjwvaDI+CjxoMz5WZXggVGFuPC9oMz4KPHA+PHN0cm9uZz5Ub2tlbiBuYW1lOjwvc3Ryb25nPiBWZXggVGFuIG9yIFJlZGxpbmUgUnVubmVyIDxzdHJvbmc+TG9jYXRpb246PC9zdHJvbmc+IEI0IFBhbnRyeSAvIEIxMCBTZXJ2aWNlIENvcnJpZG9yIDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gc3VwcGx5IHJ1bm5lciA8c3Ryb25nPlVzZTo8L3N0cm9uZz4gYWlkLXJvdXRlIHdpdG5lc3M8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+bW92ZWQgZm9vZCBhbmQgbWVkaWNpbmUgdGhyb3VnaCB1bm9mZmljaWFsIHJvdXRlczwvbGk+CjxsaT5rbm93cyBMYWxh4oCZcyBub3JtYWwgcm91dGU8L2xpPgo8bGk+Y2FuIGNvbmZpcm0gTWFyYSBvcmRlcmVkIG5vIHNob290aW5nIG5lYXIgdGhlIGNsaW5pYzwvbGk+CjxsaT5jYW4gc2hvdyB3aGVyZSBSZWRsaW5lIGNhbWVyYXMgc3RvcDwvbGk+CjwvdWw+CjxwPlNlY3JldCBwcmVzc3VyZTo8L3A+Cjx1bD4KPGxpPnNtdWdnbGVzIHNvbWUgcGVyc29uYWwgc2lkZSBnb29kczsgd29ycmllZCBQQ3Mgd2lsbCBtaXN0YWtlIHRoYXQgZm9yIHRoZSBtYWluIGNyaW1lPC9saT4KPC91bD4KPGgzPkp1bm8g4oCcU3dpdGNo4oCdIEhhbGU8L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IFN3aXRjaCA8c3Ryb25nPkxvY2F0aW9uOjwvc3Ryb25nPiBCMTAgQmFjayBDb3JyaWRvciBvciBDOSBNb25pdG9yaW5nIDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gUmVkbGluZSBjYW1lcmEgc2l0dGVyIDxzdHJvbmc+VXNlOjwvc3Ryb25nPiBzdXJ2ZWlsbGFuY2Ugd2l0bmVzcyBhbmQgc3B5PC9wPgo8cD5Ib29rczo8L3A+Cjx1bD4KPGxpPmhhcyBmb290YWdlIG9mIEJleCBiZWluZyBkcmFnZ2VkIHRvd2FyZCBhIHNlcnZpY2UgZ2FwPC9saT4KPGxpPmtub3dzIFJlZGxpbmUgYmxpbmQgc3BvdHM8L2xpPgo8bGk+Y2FuIGNvbXBhcmUgY2FtZXJhIGFuZ2xlcyB3aXRoIGNsaW5pYyBmZWVkczwvbGk+CjxsaT5zYXcgY29ycCBiaW9oYXphcmQgY29udGFpbmVycyBtb3ZpbmcgYmVmb3JlIHRoZSBjdXJyZW50IGluY2lkZW50PC9saT4KPC91bD4KPHA+U3B5IHN0YXR1czo8L3A+Cjx1bD4KPGxpPjxzdHJvbmc+U3B5IGZvciBDb3Jwb3JhdGUgUmVjb3ZlcnksIGJ5IHByZXNzdXJlLjwvc3Ryb25nPjwvbGk+CjxsaT5Td2l0Y2ggc29sZCBzZWxlY3RlZCBmZWVkIGFjY2VzcyB0byBhIGNvcnBvcmF0ZSBoYW5kbGVyIHRvIHBheSBtZWRpY2FsIGRlYnQgLyBwcm90ZWN0IHNvbWVvbmUgaW4gUmVkbGluZSB0ZXJyaXRvcnkuPC9saT4KPGxpPlN3aXRjaCBkaWQgbm90IGtub3cgYWJvdXQgdGhlIHNlY29uZCBuZXN0IGFuZCBkaWQgbm90IGludGVuZCB0byBnZXQgcGVvcGxlIGtpbGxlZC48L2xpPgo8bGk+SWYgZXhwb3NlZCwgU3dpdGNoIGNhbiBzdGlsbCBiZWNvbWUgdXNlZnVsIGlmIG9mZmVyZWQgcHJvdGVjdGlvbiBvciBhIHdheSBvdXQuPC9saT4KPC91bD4KPGgzPlJvb2sg4oCcTWFkc+KAnSBNYWRzZW48L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IE1hZHMgPHN0cm9uZz5Mb2NhdGlvbjo8L3N0cm9uZz4gQTEgSW5kb29yIFN0cmVldCAvIEExMyBTZXJ2aWNlIENvcnJpZG9yIDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gUmVkbGluZSB1bmRlcmxpbmcgPHN0cm9uZz5Vc2U6PC9zdHJvbmc+IHN1c3BpY2lvdXMgbXVzY2xlIHdpdGggdXNlZnVsIGxvY2FsIGtub3dsZWRnZTwvcD4KPHA+SG9va3M6PC9wPgo8dWw+CjxsaT5rbm93cyBCZXggZGlkIG5vdCBzZWVtIGxpa2UgYSBkZXNlcnRlcjwvbGk+CjxsaT5jYW4gcG9pbnQgdG93YXJkIHNlcnZpY2Ugcm91dGVzPC9saT4KPGxpPnJlY29nbml6ZXMgY29ycCBvYnNlcnZlcnMgYnkgcG9zdHVyZTwvbGk+CjxsaT5jYW4gYmUgdGFsa2VkIGludG8gZXZhY3VhdGlvbiBoZWxwIGlmIEJleOKAmXMgZmF0ZSBpcyBwcm92ZW48L2xpPgo8L3VsPgo8cD5TZWNyZXQgcHJlc3N1cmU6PC9wPgo8dWw+CjxsaT5oYXRlcyBCbHVld2lyZSBhbmQgbWF5IGVzY2FsYXRlIGlmIEJsdWV3aXJlIGlzIGh1bWlsaWF0ZWQ8L2xpPgo8L3VsPgo8aDM+VGFsbGEg4oCcQXVudGll4oCZcyBFeWVz4oCdIFZleTwvaDM+CjxwPjxzdHJvbmc+VG9rZW4gbmFtZTo8L3N0cm9uZz4gVGFsbGEgPHN0cm9uZz5Mb2NhdGlvbjo8L3N0cm9uZz4gQjMgQ29tbW9ucyAvIEI0IFBhbnRyeSA8c3Ryb25nPlJvbGU6PC9zdHJvbmc+IE1hcmEgbG95YWxpc3QgYW5kIGFpZCBjb29yZGluYXRvciA8c3Ryb25nPlVzZTo8L3N0cm9uZz4gcHJvdGVjdHMgTWFyYeKAmXMgaGlkZGVuIHNvZnQgcG93ZXI8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+a25vd3Mgd2hvIHJlY2VpdmVzIGZvb2QgYW5kIG1lZGljaW5lPC9saT4KPGxpPmtub3dzIExhbGEsIE1pcmksIGFuZCBTb2w8L2xpPgo8bGk+Y2FuIGNvbmZpcm0gTWFyYSBmdW5kcyBzY2hvb2wgbWVhbHMgaWYgUENzIGVhcm4gdHJ1c3Q8L2xpPgo8bGk+d2lsbCBkZW55IGV2ZXJ5dGhpbmcgaWYgYXNrZWQgbGlrZSBhbiBhY2N1c2F0aW9uPC9saT4KPC91bD4KPHA+U2VjcmV0IHByZXNzdXJlOjwvcD4KPHVsPgo8bGk+bm90IGFjdHVhbGx5IGZhbWlseSwgZGVzcGl0ZSB0aGUgc3VybmFtZTsgdXNlcyBpdCBiZWNhdXNlIE1hcmEgc2F2ZWQgaGVyIHllYXJzIGFnbzwvbGk+CjwvdWw+CjxoMj5Db3Jwb3JhdGUgUmVjb3Zlcnk8L2gyPgo8aDM+THQuIFZhcnlhIFNlbm48L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IEx0LiBTZW5uIDxzdHJvbmc+TG9jYXRpb246PC9zdHJvbmc+IEExIENvbmNvdXJzZSAvIEMxIFNlcnZpY2UgU3RyZWV0IDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gUnVza+KAmXMgZmllbGQgc2Vjb25kIDxzdHJvbmc+VXNlOjwvc3Ryb25nPiB0YWN0aWNhbCBwcmVzc3VyZSBhbmQgZXNjYWxhdGlvbjwvcD4KPHA+SG9va3M6PC9wPgo8dWw+CjxsaT5tb3JlIGFnZ3Jlc3NpdmUgdGhhbiBSdXNrPC9saT4KPGxpPndhbnRzIGEgY2xlYW4gc2VpenVyZSBiZWZvcmUgY3Jvd2RzIGZvcm08L2xpPgo8bGk+Y2FuIHJlY29nbml6ZSBNb2RlbCAzIGV2aWRlbmNlIGFzIGltcG9zc2libGUgaWYgc2hlIHNhdyBvbGQgY2xlYW51cCBmaWxlczwvbGk+CjxsaT5tYXkgYWNjZXB0IGEgdGVtcG9yYXJ5IGNlYXNlZmlyZSBvbmx5IGFmdGVyIHByb29mIG9mIHRoZSBzZWNvbmQgbmVzdDwvbGk+CjwvdWw+CjxwPlNlY3JldCBwcmVzc3VyZTo8L3A+Cjx1bD4KPGxpPmJlbGlldmVzIHdpdG5lc3MgY29udHJvbCBpcyB1Z2x5IGJ1dCBuZWNlc3Nhcnk8L2xpPgo8L3VsPgo8aDM+T3JsYW4gUGlrZTwvaDM+CjxwPjxzdHJvbmc+VG9rZW4gbmFtZTo8L3N0cm9uZz4gRmVlZCBIYW5kbGVyIG9yIEJsb2tlICMzIDxzdHJvbmc+TG9jYXRpb246PC9zdHJvbmc+IG9mZi1tYXAsIEM5IE1vbml0b3JpbmcsIG9yIEQ2IENvbnRyb2wgUm9vbSA8c3Ryb25nPlJvbGU6PC9zdHJvbmc+IGNvcnBvcmF0ZSBzdXJ2ZWlsbGFuY2UgaGFuZGxlciA8c3Ryb25nPlVzZTo8L3N0cm9uZz4gc3B5LCBmb290YWdlIGVkaXRvciwgZXZpZGVuY2Ugc3VwcHJlc3NvcjwvcD4KPHA+SG9va3M6PC9wPgo8dWw+CjxsaT5lZGl0cyBjYW1lcmEgZm9vdGFnZTwvbGk+CjxsaT5pbmplY3RzIGZhbHNlIHRpbWVzdGFtcHM8L2xpPgo8bGk+Ym91Z2h0IGFjY2VzcyBmcm9tIFN3aXRjaDwvbGk+CjxsaT5jYW4gYmUgaWRlbnRpZmllZCBieSBtZXNoL2NhbWVyYSBmb3JlbnNpY3M8L2xpPgo8bGk+dHJpZXMgdG8gZnJhbWUgUmVkbGluZSBDaG9pciBmb3IgZGlzYXBwZWFyYW5jZXM8L2xpPgo8L3VsPgo8cD5TcHkgc3RhdHVzOjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5TcHkgaW5zaWRlIGxvY2FsIHN5c3RlbXMgZm9yIENvcnBvcmF0ZSBSZWNvdmVyeSwgYnkgZ3JlZWQgYW5kIGNhcmVlciBhbWJpdGlvbi48L3N0cm9uZz48L2xpPgo8bGk+SGUgaXMgdGhlIGhhbmRsZXIgcHJlc3N1cmluZyBTd2l0Y2guPC9saT4KPGxpPklmIGV4cG9zZWQsIFJ1c2sgbWF5IGRlbnkgYXV0aG9yaXppbmcgaGltLCBldmVuIGlmIFJ1c2sgYmVuZWZpdHMgZnJvbSBoaXMgd29yay48L2xpPgo8L3VsPgo8aDM+Q29ycCBSZWNvdmVyeSBQYWlyPC9oMz4KPHA+PHN0cm9uZz5Ub2tlbiBuYW1lczo8L3N0cm9uZz4gQ29ycCBSZWNvdmVyeSAjMSwgQ29ycCBSZWNvdmVyeSAjMiA8c3Ryb25nPkxvY2F0aW9uOjwvc3Ryb25nPiBBMSwgQzEsIG9yIEQzIDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gZGlzY2lwbGluZWQgbW9va3MgPHN0cm9uZz5Vc2U6PC9zdHJvbmc+IHRhY3RpY2FsIGFuZCBtb3JhbCBwcmVzc3VyZTwvcD4KPHA+SG9va3M6PC9wPgo8dWw+CjxsaT5vbmUgY2FuIGJlIGRyYWdnZWQgYnkgYSBNb2RlbCAzIHRvIHByb3ZlIHRoZSB0aHJlYXQgaXMgcmVhbDwvbGk+CjxsaT5vbmUgbWF5IGJyZWFrIGRpc2NpcGxpbmUgdG8gc2F2ZSBhIGNpdmlsaWFuPC9saT4KPGxpPlNtYWxsIEFybXMgLyBUYWN0aWNzIGNhbiByZWFkIHRoZWlyIGZvcm1hdGlvbiBhbmQgaW50ZW50PC9saT4KPC91bD4KPHA+U2VjcmV0IHByZXNzdXJlOjwvcD4KPHVsPgo8bGk+dGhleSB3ZXJlIGJyaWVmZWQgb24gd2l0bmVzcyBjbGVhbnVwLCBub3Qgb24gYW4gYWN0aXZlIHNlY29uZCBuZXN0PC9saT4KPC91bD4KPGgzPk1hcmEgU2lsZXg8L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IENvcnAgTWVkaWMgPHN0cm9uZz5Mb2NhdGlvbjo8L3N0cm9uZz4gQTEgLyBDMSAvIEQzIDxzdHJvbmc+Um9sZTo8L3N0cm9uZz4gY29ycG9yYXRlIGZpZWxkIG1lZGljIDxzdHJvbmc+VXNlOjwvc3Ryb25nPiB1bmVhc3kgY29ycG9yYXRlIGNvbnNjaWVuY2U8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+cmVjb2duaXplcyBleHBvc3VyZS10cmVhdG1lbnQgYmF0Y2ggY29kZXM8L2xpPgo8bGk+Y2FuIHN0YWJpbGl6ZSB2aWN0aW1zPC9saT4KPGxpPmtub3dzIHNvbWUgY29ycG9yYXRlIG1lZGljYWwgb3JkZXJzIGFyZSBpbmRlZmVuc2libGU8L2xpPgo8bGk+bWF5IHF1aWV0bHkgaGVscCBpZiBjaXZpbGlhbnMgYXJlIGF0IHJpc2s8L2xpPgo8L3VsPgo8cD5TcHkgc3RhdHVzOjwvcD4KPHVsPgo8bGk+PHN0cm9uZz5Qb3RlbnRpYWwgTWVyY3kgVHdlbHZlIGluZm9ybWFudCwgYnkgY29uc2NpZW5jZS48L3N0cm9uZz48L2xpPgo8bGk+U2hlIGhhcyBsZWFrZWQgZnJhZ21lbnRzIHRvIERyLiBWYWxleiBiZWZvcmUsIGJ1dCBub3QgZW5vdWdoIHRvIGV4cG9zZSBoZXJzZWxmLjwvbGk+CjxsaT5DYW4gYmVjb21lIGFuIGFsbHkgaWYgUENzIHByb3RlY3QgaGVyIGZyb20gUnVzay9TZW5uLjwvbGk+CjwvdWw+CjxoMj5Db21tdW5pdHkgLyBjaXZpbGlhbnM8L2gyPgo8aDM+TWlyaSBhbmQgU29sPC9oMz4KPHA+PHN0cm9uZz5Ub2tlbiBuYW1lOjwvc3Ryb25nPiBNaXJpICZhbXA7IFNvbCA8c3Ryb25nPkxvY2F0aW9uOjwvc3Ryb25nPiBBNCBQZWRpYXRyaWMgQ29ybmVyIG9yIEI3IENoaWxkcmVu4oCZcyBDb3JuZXIgPHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiBzY2hvb2xjaGlsZHJlbiB3aXRuZXNzZXMgPHN0cm9uZz5Vc2U6PC9zdHJvbmc+IEF1bnRpZSBSZWQgY2x1ZSBhbmQgbWlzc2luZy1wZXJzb24gZW1vdGlvbmFsIGhvb2s8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+b3ZlcmhlYXJkOiDigJxBdW50aWUgUmVkIHBhaWQgZm9yIGJyZWFrZmFzdCBhZ2Fpbi7igJ08L2xpPgo8bGk+a25vdyBMYWxhIHVzZWQgdG8gYnJpbmcgZm9vZDwvbGk+CjxsaT5oZWFyZCDigJxkb2cgZmVldCBpbiB0aGUgd2FsbOKAnTwvbGk+CjxsaT5tYXkgaGF2ZSBzZWVuIEtlZXQgaGlkZSByZWxheSBmcmFnbWVudHMgb3IgYSBzdHVkZW50IHNsYXRlPC9saT4KPC91bD4KPHA+U2VjcmV0IHByZXNzdXJlOjwvcD4KPHVsPgo8bGk+YWR1bHRzIGtlZXAgdGVsbGluZyB0aGVtIG5vdCB0byB0YWxrPC9saT4KPC91bD4KPGgzPktlZXQ8L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IEtlZXQgPHN0cm9uZz5Mb2NhdGlvbjo8L3N0cm9uZz4gQjYgQ2xhc3Nyb29tIC8gQjcgQ2hpbGRyZW7igJlzIENvcm5lciA8c3Ryb25nPlJvbGU6PC9zdHJvbmc+IGNoaWxkIHdpdG5lc3MgLyBzdHVkZW50IHRlY2ggaGVscGVyIDxzdHJvbmc+VXNlOjwvc3Ryb25nPiByb3V0ZSBhbmQgZGF0YS1sZWFrIGNsdWU8L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+Y29waWVkIGEgcmVsYXkgZnJhZ21lbnQgdG8gYSBzY2hvb2wgc2xhdGU8L2xpPgo8bGk+c2F3IHN0cmFuZ2Ugc2VydmljZS1yb3V0ZSBtb3ZlbWVudDwvbGk+CjxsaT5rbm93cyB3aGljaCBjaGlsZHJlbiBoZWFyZCB3aGF0PC9saT4KPGxpPmNhbiBpZGVudGlmeSB0aGUgZmlyc3QgcGxhY2UgcGVvcGxlIHN0YXJ0ZWQgYXZvaWRpbmc8L2xpPgo8L3VsPgo8cD5TZWNyZXQgcHJlc3N1cmU6PC9wPgo8dWw+CjxsaT5hZnJhaWQgUmVkbGluZSBvciBjb3JwIHdpbGwgcHVuaXNoIHdob2V2ZXIgdGFsa3M8L2xpPgo8L3VsPgo8aDM+U2lzdGVyIEx1bWE8L2gzPgo8cD48c3Ryb25nPlRva2VuIG5hbWU6PC9zdHJvbmc+IFNpc3RlciBMdW1hIDxzdHJvbmc+TG9jYXRpb246PC9zdHJvbmc+IEEzIFdhaXRpbmcgLyBCOSBDb3Vuc2Vsb3IgT2ZmaWNlcyA8c3Ryb25nPlJvbGU6PC9zdHJvbmc+IGNvdW5zZWxvciBhbmQgZW1vdGlvbmFsIHN0YWJpbGl6ZXIgPHN0cm9uZz5Vc2U6PC9zdHJvbmc+IHdpdG5lc3MgdHJ1c3QsIEJsdWV3aXJlL05hcmluIGNvbm5lY3Rpb248L3A+CjxwPkhvb2tzOjwvcD4KPHVsPgo8bGk+a25vd3MgTmFyaW4gd291bGQgbm90IGxlYXZlIHZvbHVudGFyaWx5PC9saT4KPGxpPmNhbiBjYWxtIHdpdG5lc3NlczwvbGk+CjxsaT5jYW4gaW50ZXJwcmV0IEJsdWV3aXJl4oCZcyBmZWFyIGFzIHRyYXVtYSwgbm90IGp1c3QgYWdncmVzc2lvbjwvbGk+CjxsaT5tYXkgZ2V0IGNpdmlsaWFucyB0byBjb29wZXJhdGUgd2l0aCBldmFjdWF0aW9uPC9saT4KPC91bD4KPHA+U2VjcmV0IHByZXNzdXJlOjwvcD4KPHVsPgo8bGk+a2VlcHMgdW5vZmZpY2lhbCByZWNvcmRzIG9mIHVuZG9jdW1lbnRlZCByZXNpZGVudHM8L2xpPgo8L3VsPgo8aDI+UmVjb21tZW5kZWQgc3B5IHBsYWNlbWVudDwvaDI+CjxwPlVzZSBhdCBsZWFzdCB0d286PC9wPgo8cHJlPlN3aXRjaCDihpIgY29tcHJvbWlzZWQgYnkgQ29ycG9yYXRlIFJlY292ZXJ5LCBwcmVzc3VyZWQgYnkgbWVkaWNhbCBkZWJ0LgpPcmxhbiBQaWtlIOKGkiBjb3Jwb3JhdGUgc3VydmVpbGxhbmNlIGhhbmRsZXIsIGdyZWVkeS9jYXJlZXJpc3QuCk1hcmEgU2lsZXgg4oaSIGNvcnBvcmF0ZSBtZWRpYyBsZWFraW5nIHRvIE1lcmN5IFR3ZWx2ZSBieSBjb25zY2llbmNlLjwvcHJlPgo8cD5Gb3IgYSBzaG9ydGVyIGdhbWUsIHVzZSBvbmx5IFN3aXRjaCBhbmQgUGlrZS48L3A+CjxwPkZvciBhIHJpY2hlciBnYW1lLCBhZGQgU2lsZXggYXMgYSBwb3NzaWJsZSByZWRlbXB0aW9uL2NvbnRhY3QgTlBDLjwvcD4KPGgyPlNweSBwcmVzc3VyZSBvbiB0aGUgVmFsZXovVmV5IHJlbGF0aW9uc2hpcDwvaDI+CjxwPk9ybGFuIFBpa2UgY2FuIHVzZSB0aGUgU2VyYS9NYXJhIHJlbGF0aW9uc2hpcCBhcyBibGFja21haWwgbWF0ZXJpYWwuPC9wPgo8cD5Qb3NzaWJsZSBwbGF5czo8L3A+Cjx1bD4KPGxpPmxlYWsgdGhhdCBNZXJjeSBUd2VsdmUgaXMg4oCcZ2FuZy1jb21wcm9taXNlZOKAnTwvbGk+CjxsaT5pbXBseSBTZXJhIGtub3dpbmdseSBsYXVuZGVycyBSZWRsaW5lIGFpZDwvbGk+CjxsaT5zdWdnZXN0IE1hcmEgaXMgaGlkaW5nIGJlaGluZCBoZXIgc2lzdGVy4oCZcyBjbGluaWM8L2xpPgo8bGk+cHJlc3N1cmUgU3dpdGNoIHRvIGRlbGl2ZXIgZm9vdGFnZSBwcm92aW5nIE1hcmHigJlzIGFpZCByb3V0ZXMgcGFzcyB0aHJvdWdoIGNsaW5pYy1hZGphY2VudCBzcGFjZXM8L2xpPgo8bGk+cHJlc3N1cmUgTWFyYSBTaWxleCB0byBzdG9wIHF1aWV0bHkgaGVscGluZyB0aGUgY2xpbmljPC9saT4KPC91bD4KPHA+VGhpcyBzaG91bGQgbWFrZSB0aGUgc3B5IHN1YnBsb3QgZmVlbCB0aWVkIHRvIHRoZSBtYWluIHNvY2lhbCBjb25mbGljdCwgbm90IGxpa2UgYSBkaXNjb25uZWN0ZWQgc2lkZSBteXN0ZXJ5LjwvcD4="
  },
  {
    "name": "Signal Bleed - Roll20 Installation and Asset Linking",
    "source_file": "handouts/26_Roll20_Installation_and_Asset_Linking.md",
    "notes_b64": "PGgxPlJvbGwyMCBNb2R1bGUgSW5zdGFsbGF0aW9uIGFuZCBBc3NldCBMaW5raW5nIEd1aWRlPC9oMT4KPHA+VGhpcyBpcyB0aGUgZnVsbCBHTS1mYWNpbmcgc2V0dXAgZ3VpZGUgZm9yIFNpZ25hbCBCbGVlZCBhZnRlciB0aGUgaW1wb3J0ZXIgaGFzIGNyZWF0ZWQgdGhpcyBoYW5kb3V0IGluc2lkZSBSb2xsMjAuPC9wPgo8cD5JZiB5b3UgYXJlIHJlYWRpbmcgdGhpcyBpbiB0aGUgcmVwb3NpdG9yeSBiZWZvcmUgaW1wb3J0aW5nLCBzdGFydCB3aXRoOjwvcD4KPHByZT5ST0xMMjBfSU1QT1JUX0dVSURFLm1kPC9wcmU+CjxoMj5XaGF0IHRoaXMgZ3VpZGUgYXNzdW1lczwvaDI+CjxwPllvdSBhbHJlYWR5IGhhdmU6PC9wPgo8cHJlPmEgbG9jYWwgY29weSBvZiB0aGUgcmVwb3NpdG9yeS9wYWNrYWdlCmEgUm9sbDIwIGdhbWUgdXNpbmcgdGhlIEhvcGUvL1B1bmsgY2hhcmFjdGVyIHNoZWV0CnRoZSBTaWduYWwgQmxlZWQgaW1wb3J0ZXIgc2NyaXB0IGluc3RhbGxlZAp0aGUgbW9kdWxlIGhhbmRvdXRzIGFuZCBOUEMgZW50cmllcyBpbXBvcnRlZDwvcHJlPgo8cD5UaGUgcmVwb3NpdG9yeS9wYWNrYWdlIHNob3VsZCBjb250YWluOjwvcD4KPHByZT5SRUFETUUubWQKUk9MTDIwX0lNUE9SVF9HVUlERS5tZApkYXRhLwpoYW5kb3V0cy8KbWFwcy8KcG9ydHJhaXRzLwpyb2xsMjAvCnRva2Vucy88L3ByZT4KPHA+VXNlIHRoZSBhY3R1YWwgZmlsZXMgZnJvbSB0aGUgbG9jYWwgZm9sZGVycy4gRG8gbm90IHVzZSByaWdodC1jbGljayDihpIgY29weSBpbWFnZSBmcm9tIGEgR2l0SHViIHByZXZpZXcgYXMgdGhlIG5vcm1hbCB1cGxvYWQgbWV0aG9kLjwvcD4KPGgyPldoYXQgdGhlIGltcG9ydGVyIGNhbiBhbmQgY2Fubm90IGRvPC9oMj4KPHA+VGhlIGltcG9ydGVyIGNhbiBjcmVhdGU6PC9wPgo8cHJlPkdNLW9ubHkgaGFuZG91dHMKR00tb25seSBOUEMgY2hhcmFjdGVyIGVudHJpZXMKY2hhcmFjdGVyIGF2YXRhcnMgZnJvbSBzZWxlY3RlZCB1cGxvYWRlZCBwb3J0cmFpdCBncmFwaGljcwpkZWZhdWx0IHRva2VucyBmcm9tIHNlbGVjdGVkIHVwbG9hZGVkIHRva2VuIGdyYXBoaWNzPC9wcmU+CjxwPlRoZSBpbXBvcnRlciBjYW5ub3QgZG8gdGhlc2UgdGhpbmdzIGF1dG9tYXRpY2FsbHk6PC9wPgo8cHJlPnVwbG9hZCBpbWFnZSBmaWxlcyBpbnRvIHlvdXIgUm9sbDIwIEFydCBMaWJyYXJ5CmNyZWF0ZSBKb3VybmFsIGZvbGRlcnMgcmVsaWFibHkKbW92ZSBKb3VybmFsIGVudHJpZXMgaW50byBmb2xkZXJzIHJlbGlhYmx5CnBsYWNlIG1hcCBpbWFnZXMgZm9yIHlvdQpkcmF3IER5bmFtaWMgTGlnaHRpbmcgd2FsbHMKY29uZmlndXJlIGV2ZXJ5IHBhZ2Ugc2V0dGluZyBwZXJmZWN0bHk8L3ByZT4KPGgyPjEuIENyZWF0ZSBSb2xsMjAgcGFnZXM8L2gyPgo8cD5Vc2UgdGhlIGV4aXN0aW5nIFJvbGwyMCA8Y29kZT5TdGFydDwvY29kZT4gcGFnZSBhcyB0aGUgbGFuZGluZyBwYWdlLiBZb3UgbWF5IHJlbmFtZSBpdCwgYnV0IHRoYXQgaXMgb3B0aW9uYWwuPC9wPgo8cD5DcmVhdGUgdGhlc2UgYWRkaXRpb25hbCBwYWdlcyBtYW51YWxseTo8L3A+CjxwcmU+Rmxvb3IgQSAtIENsaW5pYyBhbmQgSW5kb29yIFN0cmVldApGbG9vciBCIC0gQ29tbXVuaXR5IFN1cHBvcnQKRmxvb3IgQyAtIFNlcnZpY2UgVXRpbGl0eQpGbG9vciBEIC0gUXVhcmFudGluZSBJbmNpZGVudApBc3NldCBTdGFnaW5nIC0gUG9ydHJhaXRzCkFzc2V0IFN0YWdpbmcgLSBUb2tlbnM8L3ByZT4KPGgzPlBhZ2Ugc2V0dGluZ3M8L2gzPgo8cD5XaGVuIHlvdSB0dXJuIEdyaWQgb2ZmLCBSb2xsMjAgc2hvd3MgcGFnZSBzaXplIGluIHBpeGVscy4gVGhlIG9sZCA0MCDDlyAzMCBncmlkLXNxdWFyZSByZWNvbW1lbmRhdGlvbiBpcyBlcXVpdmFsZW50IHRvIDI4MDAgw5cgMjEwMCBwaXhlbHMgYmVjYXVzZSBSb2xsMjDigJlzIG5vcm1hbCBzcXVhcmUgaXMgNzAgcGl4ZWxzLjwvcD4KPHA+Rm9yIDxjb2RlPlN0YXJ0PC9jb2RlPiBhbmQgRmxvb3IgQeKAk0QgcGFnZXM6PC9wPgo8cHJlPkdyaWQ6IE9mZgpXaWR0aDogMjgwMCBweApIZWlnaHQ6IDIxMDAgcHg8L3ByZT4KPHA+Rm9yIGFzc2V0IHN0YWdpbmcgcGFnZXM6PC9wPgo8cHJlPkdyaWQ6IE9mZgpXaWR0aDogMTc1MCBweApIZWlnaHQ6IDE3NTAgcHg8L3ByZT4KPHA+SWYgYSBtYXAgZmVlbHMgY3JhbXBlZCwgdXNlOjwvcD4KPHByZT5XaWR0aDogMjgwMCBweApIZWlnaHQ6IDI4MDAgcHg8L3ByZT4KPHA+V2l0aCBHcmlkIG9mZiwgeW91IGRvIG5vdCBuZWVkIGEgc2VwYXJhdGUgc25hcC10by1ncmlkIHNldHRpbmcuPC9wPgo8aDI+Mi4gVXBsb2FkLCBzY2FsZSwgYW5kIHBsYWNlIG1hcHM8L2gyPgo8cD5VcGxvYWQgbWFwIGltYWdlcyBmcm9tIHRoZSBsb2NhbCA8Y29kZT5tYXBzLzwvY29kZT4gZm9sZGVyIGludG8gUm9sbDIwLiBVcGxvYWQgdGhlIGFjdHVhbCBQTkcgZmlsZXM7IGRvIG5vdCBjb3B5L3Bhc3RlIGltYWdlcyBmcm9tIEdpdEh1YuKAmXMgYnJvd3NlciBwcmV2aWV3LjwvcD4KPHA+U3VnZ2VzdGVkIHBsYWNlbWVudDo8L3A+CjxwcmU+U3RhcnQKICBtYXBzL1N0YXJ0LnBuZwoKRmxvb3IgQSAtIENsaW5pYyBhbmQgSW5kb29yIFN0cmVldAogIG1hcHMvMTBfTWFwX0Zsb29yX0FfQ2xpbmljX2FuZF9JbmRvb3JfU3RyZWV0LnBuZwoKRmxvb3IgQiAtIENvbW11bml0eSBTdXBwb3J0CiAgbWFwcy8xMV9NYXBfRmxvb3JfQl9Db21tdW5pdHlfU3VwcG9ydC5wbmcKCkZsb29yIEMgLSBTZXJ2aWNlIFV0aWxpdHkKICBtYXBzLzEyX01hcF9GbG9vcl9DX1NlcnZpY2VfVXRpbGl0eS5wbmcKCkZsb29yIEQgLSBRdWFyYW50aW5lIEluY2lkZW50CiAgbWFwcy8xM19NYXBfRmxvb3JfRF9RdWFyYW50aW5lX0luY2lkZW50LnBuZzwvcHJlPgo8aDM+UmVjb21tZW5kZWQgcGFnZSBhbmQgbWFwIHNpemU8L2gzPgo8cD5UaGUgY3VycmVudCBncmlkbGVzcyBtYXBzIGFyZSAzOjQgaW1hZ2VzLiBBIGdvb2QgUm9sbDIwIHN0YXJ0aW5nIHBvaW50IGlzOjwvcD4KPHByZT5GbG9vciBB4oCTRCBwYWdlIHNpemU6CiAgV2lkdGg6IDUwIGNlbGxzCiAgSGVpZ2h0OiA2NSBjZWxscwoKTWFwIGltYWdlIHNpemU6CiAgV2lkdGg6IGFib3V0IDQ2LjUgY2VsbHMKICBIZWlnaHQ6IGFib3V0IDYyIGNlbGxzPC9wcmU+CjxwPkluIHBpeGVscywgdGhhdCBtYXAgc2l6ZSBpcyBhcHByb3hpbWF0ZWx5OjwvcD4KPHByZT4zMjU4IMOXIDQzNDQgcHg8L3ByZT4KPHA+VGhhdCBjb3JyZXNwb25kcyB0byBzY2FsaW5nIHRoZSAxMDg2IMOXIDE0NDggUE5HcyBieSAzw5cuPC9wPgo8cD5JZiB5b3UgcHJlZmVyIHRvIHByZXBhcmUgc2NhbGVkIGZpbGVzIGJlZm9yZSB1cGxvYWRpbmcsIHVzZSB0aGUgdXRpbGl0eSBzY3JpcHQuPC9wPgo8cD5SZWNvbW1lbmRlZCBjb21tYW5kIGZvciBsYXJnZSBtYXBzIHRoYXQgc2hvdWxkIHN0YXkgcmVhc29uYWJseSBsaWdodCBmb3Igb2xkZXIgbGFwdG9wczo8L3A+CjxwcmU+cHl0aG9uMyB0b29scy9zY2FsZV9zaWduYWxfYmxlZWRfbWFwcy5weSAtLXNjYWxlIDMgLS1mb3JtYXQganBnIC0tcXVhbGl0eSA4ODwvcHJlPgo8cD5UaGlzIHdyaXRlcyBzY2FsZWQgZmlsZXMgaW50bzo8L3A+CjxwcmU+bWFwc19zY2FsZWQvPC9wcmU+CjxwPklmIHlvdSB3YW50IHRyYW5zcGFyZW50IGdyaWQgb3ZlcmxheXMgdG9vOjwvcD4KPHByZT5weXRob24zIHRvb2xzL3NjYWxlX3NpZ25hbF9ibGVlZF9tYXBzLnB5IC0tc2NhbGUgMyAtLWZvcm1hdCBqcGcgLS1xdWFsaXR5IDg4IC0tZ3JpZC1vdmVybGF5PC9wcmU+CjxwPklmIHlvdSB3YW50IGEgZ3JpZCBiYWtlZCBkaXJlY3RseSBpbnRvIGEgY29weSBvZiB0aGUgbWFwOjwvcD4KPHByZT5weXRob24zIHRvb2xzL3NjYWxlX3NpZ25hbF9ibGVlZF9tYXBzLnB5IC0tc2NhbGUgMyAtLWZvcm1hdCBqcGcgLS1xdWFsaXR5IDg4IC0tY29tYmluZWQtZ3JpZDwvcHJlPgo8cD5SZWNvbW1lbmRlZCBmb3JtYXQgc3BsaXQ6PC9wPgo8cHJlPlNjYWxlZCBmdWxsLWNvbG9yIG1hcHM6IEpQRwpUcmFuc3BhcmVudCBncmlkIG92ZXJsYXlzOiBQTkcKVG9rZW5zIGFuZCBwb3J0cmFpdHM6IFBORzwvcHJlPgo8aDM+UGxhY2luZyBlYWNoIG1hcDwvaDM+CjxwPkZvciBlYWNoIG1hcCBwYWdlOjwvcD4KPG9sPgo8bGk+T3BlbiB0aGUgcGFnZS48L2xpPgo8bGk+U3dpdGNoIHRvIHRoZSA8c3Ryb25nPk1hcCAmYW1wOyBCYWNrZ3JvdW5kPC9zdHJvbmc+IGxheWVyLjwvbGk+CjxsaT5EcmFnIHRoZSBtYXRjaGluZyBQTkcgZmlsZSBmcm9tIHlvdXIgY29tcHV0ZXIgb250byB0aGUgdGFibGV0b3AuPC9saT4KPGxpPlJlc2l6ZSBpdCB0byB0aGUgdGFyZ2V0IHNpemUsIG9yIHVzZSA8c3Ryb25nPkFkdmFuY2VkIOKGkiBTZXQgRGltZW5zaW9uczwvc3Ryb25nPiBpZiBhdmFpbGFibGUuPC9saT4KPGxpPlJpZ2h0LWNsaWNrIHRoZSBpbWFnZSBhbmQgc2VuZCBpdCB0byB0aGUgYmFjayBpZiBuZWVkZWQuPC9saT4KPGxpPkxvY2sgaXQgaWYgeW91ciBSb2xsMjAgVUkgc3VwcG9ydHMgbG9ja2luZyBwbGFjZWQgaW1hZ2VzLjwvbGk+Cjwvb2w+CjxoMz5HcmlkIHZpc2liaWxpdHkgaW4gUm9sbDIwPC9oMz4KPHA+Um9sbDIw4oCZcyBidWlsdC1pbiBncmlkIG1heSBhcHBlYXIgYmVuZWF0aCBvcGFxdWUgbWFwIGltYWdlcyBpbnN0ZWFkIG9mIGNsZWFybHkgYWJvdmUgdGhlbS4gSWYgeW91IHdhbnQgYSB2aXNpYmxlIGdyaWQsIHVzZSBvbmUgb2YgdGhlc2UgYXBwcm9hY2hlcy48L3A+CjxoND5TaW1wbGUgUm9sbDIwLW9ubHkgbWV0aG9kPC9oND4KPHByZT5NYXAgb3BhY2l0eTogYWJvdXQgODAlCkdyaWQ6IE9uCkdyaWQgY29sb3I6IGJyaWdodCByZWQsIGdyZWVuLCBjeWFuLCBvciB5ZWxsb3cKR3JpZCBvcGFjaXR5OiBoaWdoPC9wcmU+CjxwPlRoaXMgbWFrZXMgdGhlIGdyaWQgdmlzaWJsZSB0aHJvdWdoIHRoZSBtYXAsIGJ1dCBzbGlnaHRseSBmYWRlcyB0aGUgbWFwLjwvcD4KPGg0PkNsZWFuZXIgb3ZlcmxheSBtZXRob2Q8L2g0Pgo8cHJlPk1hcCBvcGFjaXR5OiAxMDAlClVwbG9hZCBhIHRyYW5zcGFyZW50IGdyaWQgb3ZlcmxheSBQTkcgZ2VuZXJhdGVkIGJ5IHRoZSBzY2FsaW5nIHV0aWxpdHkKUGxhY2UgdGhlIG92ZXJsYXkgYWJvdmUgdGhlIG1hcCBvbiB0aGUgTWFwICZhbXA7IEJhY2tncm91bmQgbGF5ZXIKS2VlcCB0b2tlbnMgb24gdGhlIE9iamVjdHMgbGF5ZXI8L3ByZT4KPHA+VGhpcyBrZWVwcyB0aGUgbWFwIHNoYXJwIHdoaWxlIG1ha2luZyB0aGUgZ3JpZCB2aXNpYmxlLjwvcD4KPGg0PkFwcHJveGltYXRlLXBsYXkgbWV0aG9kPC9oND4KPHByZT5NYXAgb3BhY2l0eTogMTAwJQpHcmlkOiBPZmYsIG9yIEdyaWQgT24gb25seSBmb3IgaW52aXNpYmxlIHNuYXBwaW5nClVzZSByb29tcywgY29ycmlkb3JzLCBkb29ycywgYmVkcywgY291bnRlcnMsIGFuZCBmdXJuaXR1cmUgZm9yIHBvc2l0aW9uaW5nPC9wcmU+CjxwPlRoZSBncmlkbGVzcyBtYXBzIGFyZSBwbGF5dGVzdCBtYXBzLCBub3QgZXhhY3QgZW5naW5lZXJpbmcgZHJhd2luZ3MuIFNjYWxlIHRoZW0gdW50aWwgdG9rZW5zIGxvb2sgcGxhdXNpYmxlIG5leHQgdG8gZG9vcnMsIGJlZHMsIGNvdW50ZXJzLCBhbmQgY29ycmlkb3JzLiBEbyBub3QgZXhwZWN0IGV2ZXJ5IHdhbGwgYW5kIHByb3AgdG8gYWxpZ24gcGVyZmVjdGx5IHRvIGEgdGFjdGljYWwgZ3JpZC48L3A+CjxoMj4zLiBVcGxvYWQgcG9ydHJhaXRzIGFuZCB0b2tlbnM8L2gyPgo8cD5UaGUgcmVwb3NpdG9yeSBhbHJlYWR5IGhhcyByZWFkeS10by11cGxvYWQgaW1hZ2VzOjwvcD4KPHByZT5wb3J0cmFpdHMvCnRva2Vucy88L3ByZT4KPHA+RG8gbm90IHJ1biA8Y29kZT5zcGxpdF9zaWduYWxfYmxlZWRfcG9ydHJhaXRzLnB5PC9jb2RlPiBkdXJpbmcgbm9ybWFsIEdNIGluc3RhbGxhdGlvbi4gVGhhdCBzY3JpcHQgd2FzIG9ubHkgdXNlZCB3aGVuIHJlYnVpbGRpbmcgcG9ydHJhaXQgYXNzZXRzIGZyb20gdGhlIG9yaWdpbmFsIHBvcnRyYWl0IHNoZWV0cy48L3A+CjxoMz5VcGxvYWQgcG9ydHJhaXRzPC9oMz4KPHA+VXBsb2FkIGFsbCBQTkcgZmlsZXMgaW46PC9wPgo8cHJlPnBvcnRyYWl0cy88L3ByZT4KPHA+dG8gUm9sbDIwLjwvcD4KPHA+RGV0YWlsZWQgd29ya2Zsb3c6PC9wPgo8b2w+CjxsaT5PcGVuIFJvbGwyMC48L2xpPgo8bGk+T3BlbiB0aGUgPHN0cm9uZz5BcnQgTGlicmFyeTwvc3Ryb25nPiB0YWIuPC9saT4KPGxpPlVwbG9hZCBvciBkcmFnIHRoZSBwb3J0cmFpdCBQTkcgZmlsZXMgaW50byB0aGUgbGlicmFyeS48L2xpPgo8bGk+T3BlbiB0aGUgPGNvZGU+QXNzZXQgU3RhZ2luZyAtIFBvcnRyYWl0czwvY29kZT4gcGFnZS48L2xpPgo8bGk+RHJhZyBlYWNoIHVwbG9hZGVkIHBvcnRyYWl0IGZyb20gdGhlIEFydCBMaWJyYXJ5IG9udG8gdGhhdCBwYWdlLjwvbGk+CjxsaT5BcnJhbmdlIHRoZW0gbG9vc2VseSBzbyB0aGV5IGFyZSBlYXN5IHRvIHNlbGVjdC48L2xpPgo8bGk+VGhlIHBsYWNlZCBncmFwaGljIG5hbWVzIHNob3VsZCBtYXRjaCB0aGUgZmlsZW5hbWVzIHdpdGhvdXQgPGNvZGU+LnBuZzwvY29kZT4uPC9saT4KPC9vbD4KPHA+RXhhbXBsZXM6PC9wPgo8cHJlPkRyLiBTZXJhIFZhbGV6Ck1hcmEgTW90aGVyIFJlZCBWZXkKTm94IEJsdWV3aXJlIEthZGUKSnVubyBTd2l0Y2ggSGFsZQpDb21tYW5kZXIgSWxhbiBSdXNrPC9wcmU+CjxwPklmIFJvbGwyMCBnaXZlcyBhIHBsYWNlZCBncmFwaGljIGEgc3RyYW5nZSBuYW1lLCBvcGVuIHRoZSB0b2tlbi9ncmFwaGljIHNldHRpbmdzIGFuZCByZW5hbWUgaXQuPC9wPgo8aDM+VXBsb2FkIHRva2VuczwvaDM+CjxwPlVwbG9hZCBhbGwgUE5HIGZpbGVzIGluOjwvcD4KPHByZT50b2tlbnMvPC9wcmU+CjxwPnRvIFJvbGwyMC48L3A+CjxwPkRldGFpbGVkIHdvcmtmbG93OjwvcD4KPG9sPgo8bGk+T3BlbiBSb2xsMjAuPC9saT4KPGxpPk9wZW4gdGhlIDxzdHJvbmc+QXJ0IExpYnJhcnk8L3N0cm9uZz4gdGFiLjwvbGk+CjxsaT5VcGxvYWQgb3IgZHJhZyB0aGUgdG9rZW4gUE5HIGZpbGVzIGludG8gdGhlIGxpYnJhcnkuPC9saT4KPGxpPk9wZW4gdGhlIDxjb2RlPkFzc2V0IFN0YWdpbmcgLSBUb2tlbnM8L2NvZGU+IHBhZ2UuPC9saT4KPGxpPkRyYWcgZWFjaCB1cGxvYWRlZCB0b2tlbiBmcm9tIHRoZSBBcnQgTGlicmFyeSBvbnRvIHRoYXQgcGFnZS48L2xpPgo8bGk+QXJyYW5nZSB0aGVtIGxvb3NlbHkgc28gdGhleSBhcmUgZWFzeSB0byBzZWxlY3QuPC9saT4KPGxpPlRoZSBwbGFjZWQgZ3JhcGhpYyBuYW1lcyBzaG91bGQgbWF0Y2ggdGhlIGZpbGVuYW1lcyB3aXRob3V0IDxjb2RlPi5wbmc8L2NvZGU+LjwvbGk+Cjwvb2w+CjxwPkV4YW1wbGVzOjwvcD4KPHByZT5Eci4gU2VyYSBWYWxlegpNYXJhIE1vdGhlciBSZWQgVmV5Ck1vZGVsIDEgSnV2ZW5pbGUKTW9kZWwgMSBBZG9sZXNjZW50Ck1vZGVsIDEgQWR1bHQKTW9kZWwgMyBKdXZlbmlsZQpNb2RlbCAzIEFkb2xlc2NlbnQKTW9kZWwgMyBBZHVsdDwvcHJlPgo8cD5UaGUgaW1wb3J0ZXIgaXMgZm9yZ2l2aW5nIGFib3V0IHB1bmN0dWF0aW9uLCBxdW90ZXMsIGFuZCBhIGZldyBrbm93biBhbGlhc2VzLCBidXQgZXhhY3QgcmVhZGFibGUgbmFtZXMgYXJlIGJlc3QuPC9wPgo8aDI+NC4gTGluayBwb3J0cmFpdHMgdG8gY2hhcmFjdGVyIGF2YXRhcnM8L2gyPgo8cD5HbyB0byB0aGUgPGNvZGU+QXNzZXQgU3RhZ2luZyAtIFBvcnRyYWl0czwvY29kZT4gcGFnZS48L3A+CjxwPlNlbGVjdCBhbGwgc3RhZ2VkIHBvcnRyYWl0IGdyYXBoaWNzLjwvcD4KPHA+UnVuOjwvcD4KPHByZT4haG9wZXB1bmstc2lnbmFsLWJsZWVkIC0tbGluay1zZWxlY3RlZC1wb3J0cmFpdHMgLS1kcnktcnVuPC9wcmU+CjxwPlJldmlldyB0aGUgb3V0cHV0LiBJdCBzaG91bGQgc2hvdyBsaW5lcyBsaWtlOjwvcD4KPHByZT5Eci4gU2VyYSBWYWxleiAtJmd0OyBEci4gU2VyYSBWYWxlejogd291bGQgc2V0IGF2YXRhcgpNYXJhIE1vdGhlciBSZWQgVmV5IC0mZ3Q7IE1hcmEg4oCcTW90aGVyIFJlZOKAnSBWZXk6IHdvdWxkIHNldCBhdmF0YXI8L3ByZT4KPHA+SWYgdGhlIG1hdGNoZXMgbG9vayByaWdodCwgcnVuOjwvcD4KPHByZT4haG9wZXB1bmstc2lnbmFsLWJsZWVkIC0tbGluay1zZWxlY3RlZC1wb3J0cmFpdHM8L3ByZT4KPHA+VG8gcmVwbGFjZSBleGlzdGluZyBhdmF0YXJzOjwvcD4KPHByZT4haG9wZXB1bmstc2lnbmFsLWJsZWVkIC0tbGluay1zZWxlY3RlZC1wb3J0cmFpdHMgLS1vdmVyd3JpdGU8L3ByZT4KPGgyPjUuIExpbmsgdG9rZW5zIHRvIGRlZmF1bHQgdG9rZW5zPC9oMj4KPHA+R28gdG8gdGhlIDxjb2RlPkFzc2V0IFN0YWdpbmcgLSBUb2tlbnM8L2NvZGU+IHBhZ2UuPC9wPgo8cD5TZWxlY3QgYWxsIHN0YWdlZCB0b2tlbiBncmFwaGljcy48L3A+CjxwPlJ1bjo8L3A+CjxwcmU+IWhvcGVwdW5rLXNpZ25hbC1ibGVlZCAtLWxpbmstc2VsZWN0ZWQtdG9rZW5zIC0tZHJ5LXJ1bjwvcHJlPgo8cD5SZXZpZXcgdGhlIG91dHB1dC4gSWYgdGhlIG1hdGNoZXMgbG9vayByaWdodCwgcnVuOjwvcD4KPHByZT4haG9wZXB1bmstc2lnbmFsLWJsZWVkIC0tbGluay1zZWxlY3RlZC10b2tlbnM8L3ByZT4KPHA+VG8gcmVwbGFjZSBleGlzdGluZyBkZWZhdWx0IHRva2Vuczo8L3A+CjxwcmU+IWhvcGVwdW5rLXNpZ25hbC1ibGVlZCAtLWxpbmstc2VsZWN0ZWQtdG9rZW5zIC0tb3ZlcndyaXRlPC9wcmU+CjxoMj42LiBDb21iaW5lZCBsaW5raW5nIG9wdGlvbjwvaDI+CjxwPklmIHlvdSBvbmx5IGhhdmUgb25lIHN0YWdlZCBpbWFnZSBwZXIgY2hhcmFjdGVyIGFuZCB3YW50IHRoYXQgaW1hZ2UgdG8gc2VydmUgYXMgYm90aCBhdmF0YXIgYW5kIGRlZmF1bHQgdG9rZW4sIHNlbGVjdCB0aGUgZ3JhcGhpY3MgYW5kIHJ1bjo8L3A+CjxwcmU+IWhvcGVwdW5rLXNpZ25hbC1ibGVlZCAtLWxpbmstc2VsZWN0ZWQtYXNzZXRzIC0tZHJ5LXJ1bgohaG9wZXB1bmstc2lnbmFsLWJsZWVkIC0tbGluay1zZWxlY3RlZC1hc3NldHM8L3ByZT4KPHA+Rm9yIHRoaXMgbW9kdWxlLCB0aGUgY2xlYW5lciB3b3JrZmxvdyBpcyB1c3VhbGx5OjwvcD4KPHByZT5wb3J0cmFpdHMvIC0mZ3Q7IC0tbGluay1zZWxlY3RlZC1wb3J0cmFpdHMKdG9rZW5zLyAgICAtJmd0OyAtLWxpbmstc2VsZWN0ZWQtdG9rZW5zPC9wcmU+CjxoMj43LiBTdWdnZXN0ZWQgSm91cm5hbCBvcmdhbml6YXRpb248L2gyPgo8cD5DcmVhdGUgZm9sZGVycyBtYW51YWxseSBhZnRlciBpbXBvcnQ6PC9wPgo8cHJlPk5QQ3MKICBNZXJjeSBUd2VsdmUgQ2xpbmljCiAgUmVkbGluZSBDaG9pcgogIENvcnBvcmF0ZSBSZWNvdmVyeQogIENvbW11bml0eSAvIENpdmlsaWFucwoKQmVzdGlhcnkKICBNb2RlbCAxIEp1dmVuaWxlCiAgTW9kZWwgMSBBZG9sZXNjZW50CiAgTW9kZWwgMSBBZHVsdAogIE1vZGVsIDMgSnV2ZW5pbGUKICBNb2RlbCAzIEFkb2xlc2NlbnQKICBNb2RlbCAzIEFkdWx0CgpIYW5kb3V0cwogIFBsYXllci1mYWNpbmcKICBHTS1vbmx5CiAgTWFwcyAvIEtleXMKICBJbnN0YWxsYXRpb248L3ByZT4KPHA+U3VnZ2VzdGVkIHBsYXllci1mYWNpbmcgaGFuZG91dHMgdG8gc2hhcmU6PC9wPgo8cHJlPlNpZ25hbCBCbGVlZCAtIFBsYXllciBTdGFydCBIZXJlClNpZ25hbCBCbGVlZCAtIFBsYXllciBIb29rczwvcHJlPgo8cD5LZWVwIEdNLW9ubHkgaGFuZG91dHMgaGlkZGVuIHVubGVzcyB5b3UgaW50ZW50aW9uYWxseSByZXZlYWwgdGhlbS48L3A+CjxoMj44LiBUcm91Ymxlc2hvb3Rpbmc8L2gyPgo8aDM+VGhlIGxpbmtlciBzYXlzIG5vIHNlbGVjdGVkIGdyYXBoaWNzPC9oMz4KPHA+U2VsZWN0IHRoZSBzdGFnZWQgaW1hZ2Ugb2JqZWN0cyBvbiB0aGUgdGFibGV0b3AgZmlyc3QsIHRoZW4gcnVuIHRoZSBjb21tYW5kLjwvcD4KPGgzPlRoZSBsaW5rZXIgc2F5cyBubyBtYXRjaGluZyBjaGFyYWN0ZXI8L2gzPgo8cD5DaGVjayB0aGUgc3RhZ2VkIGdyYXBoaWMgbmFtZS4gSXQgc2hvdWxkIHJlc2VtYmxlIHRoZSBpbXBvcnRlZCBjaGFyYWN0ZXIgbmFtZS48L3A+CjxwPkdvb2Q6PC9wPgo8cHJlPk1hcmEgTW90aGVyIFJlZCBWZXkKTm94IEJsdWV3aXJlIEthZGUKTW9kZWwgMyBBZG9sZXNjZW50PC9wcmU+CjxwPkJhZDo8L3A+CjxwcmU+aW1hZ2UucG5nCmRvd25sb2FkIDcKdG9rZW48L3ByZT4KPGgzPlRoZSBsaW5rZXIgc2F5cyBhbWJpZ3VvdXMgbWF0Y2g8L2gzPgo8cD5SZW5hbWUgdGhlIHN0YWdlZCBncmFwaGljIG1vcmUgc3BlY2lmaWNhbGx5LCB0aGVuIHJlcnVuIHRoZSBkcnkgcnVuLjwvcD4KPGgzPlRoZSBsaW5rZWQgdG9rZW4gZG9lcyBub3QgbG9vayByaWdodDwvaDM+CjxwPlVzZSA8Y29kZT4tLW92ZXJ3cml0ZTwvY29kZT4gYWZ0ZXIgYWRqdXN0aW5nIHRoZSBzdGFnZWQgdG9rZW7igJlzIHNpemUsIG5hbWUsIGJhcnMsIGF1cmEsIG9yIHNldHRpbmdzLiBUaGUgZGVmYXVsdCB0b2tlbiBjb3BpZXMgdGhlIHN0YWdlZCBncmFwaGlj4oCZcyBjdXJyZW50IHRva2VuIHNldHRpbmdzLjwvcD4KPGgzPlRoZSBtYXAgaW1hZ2Uga2VlcHMgbW92aW5nPC9oMz4KPHA+TWFrZSBzdXJlIHlvdSBhcmUgb24gdGhlIE1hcCAmYW1wOyBCYWNrZ3JvdW5kIGxheWVyIHdoZW4gcGxhY2luZyBtYXBzLiBJZiB5b3VyIFJvbGwyMCBVSSBzdXBwb3J0cyBsb2NraW5nLCBsb2NrIHRoZSBtYXAgYWZ0ZXIgcGxhY2VtZW50LjwvcD4KPGgzPlRoZSBzY3JpcHQgZG9lcyBub3QgdXBsb2FkIGltYWdlczwvaDM+CjxwPkNvcnJlY3QuIFJvbGwyMCBNb2QvQVBJIHNjcmlwdHMgY2Fubm90IHVwbG9hZCBsb2NhbCBQTkcgZmlsZXMgaW50byB5b3VyIEFydCBMaWJyYXJ5LiBVcGxvYWQgdGhlIGltYWdlcyBtYW51YWxseSBmaXJzdC48L3A+"
  },
  {
    "name": "Signal Bleed - Valez Vey Family Tension GM",
    "source_file": "handouts/27_Valez_Vey_Family_Tension_GM.md",
    "notes_b64": "PGgxPlZhbGV6IC8gVmV5IEZhbWlseSBUZW5zaW9uPC9oMT4KPGgyPkNhbm9uIHVwZGF0ZTwvaDI+CjxwPkRyLiBTZXJhIFZhbGV6IGFuZCBNYXJhIOKAnE1vdGhlciBSZWTigJ0gVmV5IGFyZSBlc3RyYW5nZWQgc2lzdGVycy48L3A+CjxwPlRoZXkgd2VyZSBib3JuIFNlcmEgVmFsZXogYW5kIE1hcmEgVmFsZXouIFNlcmEga2VwdCB0aGUgZmFtaWx5IG5hbWUgYW5kIGJ1aWx0IGEgbGlmZSBhcm91bmQgbWVkaWNpbmUsIGxlZ2l0aW1hY3ksIGFuZCBwdWJsaWMgdHJ1c3QuIE1hcmEgY3V0IHRoZSBmYW1pbHkgbmFtZSBkb3duIHRvIDxzdHJvbmc+VmV5PC9zdHJvbmc+IGFmdGVyIHByaXNvbiwgUmVkbGluZSBpbml0aWF0aW9uLCBleGlsZSwgb3Igc2ltcGx5IGJlY2F1c2Ugc2hlIHJlZnVzZWQgdG8gY2FycnkgYSByZXNwZWN0YWJsZSBuYW1lIHdoaWxlIGRvaW5nIG5lY2Vzc2FyeSBkaXJ0eSB3b3JrLjwvcD4KPHA+VGhleSBsb29rIHNpbWlsYXIgZW5vdWdoIHRoYXQgb2JzZXJ2YW50IFBDcyBtYXkgbm90aWNlIGl0IHF1aWNrbHkuPC9wPgo8cD5EbyBub3QgdHJlYXQgdGhpcyBhcyBhIGhpZGRlbiDigJxnb3RjaGEu4oCdIEl0IGlzIGEgcHJlc3N1cmUgcG9pbnQsIGEgc29jaWFsIGNsdWUsIGFuZCBhIHdheSB0byBtYWtlIHRoZSBuZWlnaGJvcmhvb2QgcG9saXRpY3MgbW9yZSBwZXJzb25hbC48L3A+CjxoMj5Db3JlIGR5bmFtaWM8L2gyPgo8cD5TZXJhIGFuZCBNYXJhIHByb3RlY3QgdGhlIHNhbWUgcGVvcGxlIHRocm91Z2ggaW5jb21wYXRpYmxlIG1ldGhvZHMuPC9wPgo8cHJlPlNlcmEgcHJvdGVjdHMgcGVvcGxlIHRocm91Z2ggbWVkaWNpbmUsIGxlZ2l0aW1hY3ksIHJlY29yZHMsIHRyaWFnZSwgYW5kIHB1YmxpYyBtb3JhbCBhdXRob3JpdHkuCk1hcmEgcHJvdGVjdHMgcGVvcGxlIHRocm91Z2ggdGVycml0b3J5LCBmZWFyLCBzbXVnZ2xpbmcsIGZhdm9ycywgcmV0YWxpYXRpb24sIGFuZCBpbmZvcm1hbCBwb3dlci48L3ByZT4KPHA+TmVpdGhlciBzaXN0ZXIgaXMgZW50aXJlbHkgd3JvbmcuPC9wPgo8cD5OZWl0aGVyIHNpc3RlciB3YW50cyB0aGUgUENzIHRvIHdlYXBvbml6ZSB0aGUgcmVsYXRpb25zaGlwIGluIHB1YmxpYy48L3A+CjxoMj5QdWJsaWMgdHJ1dGg8L2gyPgo8cD5Nb3N0IGxvY2FscyBrbm93IHRoZXJlIGlzIGhpc3RvcnkgYmV0d2VlbiBEci4gVmFsZXogYW5kIE1vdGhlciBSZWQsIGJ1dCBub3QgZXZlcnlvbmUga25vd3MgZXhhY3RseSB3aGF0IGl0IGlzLjwvcD4KPHA+Q2hpbGRyZW4gYW5kIG9sZCByZXNpZGVudHMgbWF5IHNwZWFrIG1vcmUgZnJlZWx5OjwvcD4KPHByZT7igJxBdW50aWUgUmVkIHBhaWQgZm9yIGJyZWFrZmFzdCBhZ2Fpbi7igJ0K4oCcRG9u4oCZdCBjYWxsIGhlciB0aGF0IHdoZXJlIGdyb3duLXVwcyBoZWFyLuKAnQrigJxXaHk/4oCdCuKAnEJlY2F1c2Ugc2hlIGdldHMgbWFkIHdoZW4gcGVvcGxlIGtub3cgc2hl4oCZcyBuaWNlLuKAnTwvcHJlPgo8cD7igJxBdW50aWUgUmVk4oCdIGlzIHBhcnRseSBjb21tdW5pdHkgc2xhbmcgYW5kIHBhcnRseSBsaXRlcmFsIGZhbWlseSByZXNpZHVlLiBNYXJhIGlzIG5vdCBldmVyeW9uZeKAmXMgYXVudCwgYnV0IHNoZSBoYXMgYWN0ZWQgbGlrZSBvbmUgb2Z0ZW4gZW5vdWdoIHRoYXQgY2hpbGRyZW4gdXNlIHRoZSBuYW1lLjwvcD4KPGgyPldoYXQgU2VyYSBzYXlzPC9oMj4KPHA+U2VyYSBkb2VzIG5vdCBkZW55IHRoZSByZWxhdGlvbnNoaXAgaWYgZGlyZWN0bHkgYW5kIHJlc3BlY3RmdWxseSBjb25mcm9udGVkLCBidXQgc2hlIHJlZnVzZXMgZ29zc2lwLjwvcD4KPHA+UG9zc2libGUgbGluZXM6PC9wPgo8YmxvY2txdW90ZT7igJxNYXJhIGlzIG15IHNpc3Rlci4gU2hlIGlzIGFsc28gdGhlIHJlYXNvbiBoYWxmIHRoZXNlIGNoaWxkcmVuIGF0ZSBsYXN0IG1vbnRoLiBTaGUgaXMgYWxzbyB0aGUgcmVhc29uIHRocmVlIG1lbiBjYW1lIGluIHdpdGggYnJva2VuIHJpYnMuIEJvdGggdGhpbmdzIGFyZSB0cnVlLuKAnTwvYmxvY2txdW90ZT4KPGJsb2NrcXVvdGU+4oCcRG8gbm90IHVzZSBteSBmYW1pbHkgdG8gc3RhcnQgYSB3YXIgaW4gbXkgY2xpbmljLuKAnTwvYmxvY2txdW90ZT4KPGJsb2NrcXVvdGU+4oCcSSBoZWFsIHRoZSBwZW9wbGUgd2hvIG1ha2UgaXQgdGhyb3VnaCBteSBkb29ycy4gTWFyYSBrZWVwcyBzb21lIG9mIHRoZW0gYWxpdmUgbG9uZyBlbm91Z2ggdG8gcmVhY2ggdGhvc2UgZG9vcnMuIFRoYXQgZG9lcyBub3QgbWFrZSBoZXIgbWV0aG9kcyBjbGVhbi7igJ08L2Jsb2NrcXVvdGU+CjxoMj5XaGF0IE1hcmEgc2F5czwvaDI+CjxwPk1hcmEgaGF0ZXMgc291bmRpbmcgc2VudGltZW50YWwuIFNoZSBkZWZsZWN0cyBmaXJzdC48L3A+CjxwPlBvc3NpYmxlIGxpbmVzOjwvcD4KPGJsb2NrcXVvdGU+4oCcU2VyYSBzYXZlcyBwZW9wbGUgd2hvIG1ha2UgaXQgdGhyb3VnaCBoZXIgZG9vcnMuIEkgc2F2ZSB0aGUgb25lcyB3aG8gbmV2ZXIgZ2V0IHRoYXQgZmFyLuKAnTwvYmxvY2txdW90ZT4KPGJsb2NrcXVvdGU+4oCcU2hlIHRoaW5rcyBJIGNob3NlIHRoaXMuIEkgdGhpbmsgc2hlIGNob3NlIGEgcm9vbSB3aXRoIHdpbmRvd3MgYW5kIGNhbGxlZCBpdCB2aXJ0dWUu4oCdPC9ibG9ja3F1b3RlPgo8YmxvY2txdW90ZT7igJxTYXkg4oCYc2lzdGVy4oCZIGxpa2UgaXQgZ2l2ZXMgeW91IGxldmVyYWdlIGFuZCBJIHdpbGwgc2hvdyB5b3Ugd2hhdCBsZXZlcmFnZSBpcy7igJ08L2Jsb2NrcXVvdGU+CjxoMj5Ib3cgdG8gcmV2ZWFsIGl0PC9oMj4KPHA+VXNlIGFueSBvZiB0aGVzZTo8L3A+Cjx1bD4KPGxpPkEgY2hpbGQgY2FsbHMgTWFyYSDigJxBdW50aWUgUmVkLuKAnTwvbGk+CjxsaT5TZXJhIGFuZCBNYXJhIGFyZ3VlIHdpdGggdGhlIHJoeXRobSBvZiBwZW9wbGUgd2hvIGhhdmUgZG9uZSBpdCBzaW5jZSBjaGlsZGhvb2QuPC9saT4KPGxpPlNpc3RlciBMdW1hIHJlZmVycyB0byDigJx0aGUgVmFsZXogZ2lybHPigJ0gYmVmb3JlIGNvcnJlY3RpbmcgaGVyc2VsZi48L2xpPgo8bGk+TWFyYSBrbm93cyBvbGQgY2xpbmljIG1haW50ZW5hbmNlIGRldGFpbHMgc2hlIHNob3VsZCBub3Qga25vdy48L2xpPgo8bGk+U2VyYSBrbm93cyBSZWRsaW5lIGFpZCByb3V0ZXMgYnV0IHByZXRlbmRzIHNoZSBkb2VzIG5vdC48L2xpPgo8bGk+QSBmYW1pbHkgcGhvdG8gaW4gYSBjbGluaWMgYmFjayByb29tIHNob3dzIHR3byBzaW1pbGFyIHlvdW5nIHdvbWVuLCBvbmUgd2l0aCBTZXJh4oCZcyBuYW1lIGFuZCBvbmUgd2l0aCBNYXJh4oCZcyBvbGQgc3VybmFtZS48L2xpPgo8bGk+VGFsbGEg4oCcQXVudGll4oCZcyBFeWVz4oCdIFZleSB1c2VzIOKAnFZleeKAnSBiZWNhdXNlIE1hcmEgdG9vayBoZXIgaW4sIG5vdCBiZWNhdXNlIHRoZXkgYXJlIGJsb29kIHJlbGF0aXZlcy48L2xpPgo8L3VsPgo8aDI+SG93IGl0IGFmZmVjdHMgbmVnb3RpYXRpb25zPC9oMj4KPHA+VGhlIHJlbGF0aW9uc2hpcCBzaG91bGQgY3JlYXRlIHJvdXRlcywgbm90IGNsb3NlIHRoZW0uPC9wPgo8aDM+SWYgUENzIHJlc3BlY3QgYm90aCBzaXN0ZXJzPC9oMz4KPHVsPgo8bGk+U2VyYSBtYXkgYXNrIE1hcmEgZm9yIGV2YWN1YXRpb24gaGVscC48L2xpPgo8bGk+TWFyYSBtYXkgb3JkZXIgUmVkbGluZSB0byBwcm90ZWN0IGNsaW5pYyBjb3JyaWRvcnMuPC9saT4KPGxpPkJvdGggbWF5IGFncmVlIHRvIGtlZXAgdGhlIHJlbGF5IGluIGNsaW5pYyBjdXN0b2R5IHRlbXBvcmFyaWx5LjwvbGk+CjxsaT5SZWRsaW5lIGFpZCByb3V0ZXMgY2FuIGJlY29tZSBldmFjdWF0aW9uIHJvdXRlcy48L2xpPgo8bGk+VGhlIHNpc3RlcnMgY2FuIGNvb3JkaW5hdGUgd2l0aG91dCBhZG1pdHRpbmcgcmVjb25jaWxpYXRpb24uPC9saT4KPC91bD4KPGgzPklmIFBDcyBleHBvc2UgdGhlIHJlbGF0aW9uc2hpcCBtb2NraW5nbHk8L2gzPgo8dWw+CjxsaT5NYXJhIGJlY29tZXMgaG9zdGlsZS48L2xpPgo8bGk+U2VyYSBzaHV0cyBkb3duIHBlcnNvbmFsIHF1ZXN0aW9ucy48L2xpPgo8bGk+UmVkbGluZSB1bmRlcmxpbmdzIGludGVycHJldCBpdCBhcyBhbiBhdHRhY2sgb24gTWFyYeKAmXMgcmVwdXRhdGlvbi48L2xpPgo8bGk+Q2hpbGRyZW4gYW5kIGNpdmlsaWFucyBiZWNvbWUgbGVzcyB3aWxsaW5nIHRvIHRhbGsuPC9saT4KPC91bD4KPGgzPklmIFBDcyB0cnkgdG8gYmxhY2ttYWlsIGVpdGhlciBzaXN0ZXI8L2gzPgo8dWw+CjxsaT5JdCBzaG91bGQgYmFja2ZpcmUuPC9saT4KPGxpPlRoZSBjb21tdW5pdHkgbWF5IHJlc2VudCBvdXRzaWRlcnMgZXhwbG9pdGluZyBhIGZhbWlseSB3b3VuZC48L2xpPgo8bGk+Q29ycG9yYXRlIFJlY292ZXJ5IG1heSBsZWFybiB0aGUgbGluayBhbmQgdXNlIGl0IHRvIHByZXNzdXJlIGJvdGggZmFjdGlvbnMuPC9saT4KPC91bD4KPGgyPkhvdyBDb3Jwb3JhdGUgUmVjb3ZlcnkgY2FuIHVzZSBpdDwvaDI+CjxwPkNvbW1hbmRlciBSdXNrIG1heSBub3Qga25vdyB0aGUgcmVsYXRpb25zaGlwIGF0IGZpcnN0LjwvcD4KPHA+T3JsYW4gUGlrZSBtYXkgZGlzY292ZXIgaXQgdGhyb3VnaCBzdXJ2ZWlsbGFuY2UgYW5kIHRyeSB0byBleHBsb2l0IGl0OjwvcD4KPHByZT5MZWFrIHRoZSByZWxhdGlvbnNoaXAgdG8gbWFrZSBTZXJhIGxvb2sgZ2FuZy1jb21wcm9taXNlZC4KRnJhbWUgUmVkbGluZSBhaWQgYXMgY2xpbmljIGNvcnJ1cHRpb24uClN1Z2dlc3QgTWFyYSBpcyB1c2luZyB0aGUgY2xpbmljIGFzIGEgc2hpZWxkLgpQcmVzc3VyZSBTZXJhIHdpdGgg4oCceW91ciBzaXN0ZXLigJlzIGNyaW1pbmFsIG5ldHdvcmsu4oCdClByZXNzdXJlIE1hcmEgd2l0aCDigJx5b3VyIHNpc3RlcuKAmXMgbWVkaWNhbCBsaWNlbnNlLuKAnTwvcHJlPgo8cD5UaGlzIGdpdmVzIHRoZSBzcHkgc3VicGxvdCB0ZWV0aC48L3A+CjxoMj5Ib3cgdGhlIGhpZGRlbiBuZXN0IGNoYW5nZXMgdGhlIHJlbGF0aW9uc2hpcDwvaDI+CjxwPk9uY2UgdGhlIHNlY29uZCBuZXN0IGlzIHByb3ZlbiwgdGhlIHNpc3RlcnPigJkgY29uZmxpY3QgYmVjb21lcyBzZWNvbmRhcnkuPC9wPgo8cD5UaGUgYmVzdCBzY2VuZSBpcyBub3QgYSByZWNvbmNpbGlhdGlvbiBzcGVlY2guIEl0IGlzIGEgdGFjdGljYWwgY29tcHJvbWlzZTo8L3A+CjxwcmU+U2VyYTog4oCcSSBuZWVkIHBhdGllbnRzIG91dC7igJ0KTWFyYTog4oCcSSBuZWVkIHlvdXIgYmFjayBkb29ycyBvcGVuLuKAnQpTZXJhOiDigJxObyB3ZWFwb25zIGluIHJlY292ZXJ5LuKAnQpNYXJhOiDigJxObyB1bmlmb3JtcyBuZWFyIHRoZSBjaGlsZHJlbi7igJ0KU2VyYTog4oCcRG9uZS7igJ0KTWFyYTog4oCcRG9uZS7igJ08L3ByZT4KPHA+VGhleSBzdGlsbCBkaXNhZ3JlZS4gVGhleSBzdGlsbCBtb3ZlLjwvcD4KPGgyPkdNIHVzZTwvaDI+CjxwPlVzZSB0aGlzIHJlbGF0aW9uc2hpcCB0byBtYWtlIHNvY2lhbCBzY2VuZXMgc2hhcnBlcjo8L3A+Cjx1bD4KPGxpPlNlcmEgY2FuIHZldG8gdmlvbGVuY2UgaW4gdGhlIGNsaW5pYy48L2xpPgo8bGk+TWFyYSBjYW4gdW5sb2NrIHJvdXRlcywgbG9va291dHMsIGFuZCBhaWQgbmV0d29ya3MuPC9saT4KPGxpPkVpdGhlciBzaXN0ZXIgY2FuIGZvcmNlIHRoZSBvdGhlciB0byBhY3QgaWYgY2l2aWxpYW5zIGFyZSBpbiBkYW5nZXIuPC9saT4KPGxpPkNvcnBvcmF0ZSBleHBsb2l0YXRpb24gb2YgdGhlIGZhbWlseSB0aWUgY2FuIHJldmVhbCB0aGUgc3B5L2hhbmRsZXIgcGxvdC48L2xpPgo8bGk+VGhlIFBDcyBjYW4gYmVjb21lIHRydXN0ZWQgb25seSBieSBwcm92aW5nIHRoZXkgYXJlIG5vdCB0cnlpbmcgdG8gb3duIHRoZSBzaXN0ZXJz4oCZIGhpc3RvcnkuPC9saT4KPC91bD4="
  },
  {
    "name": "Signal Bleed - Antithesis Escalation and Boss Options GM",
    "source_file": "handouts/28_Antithesis_Escalation_and_Boss_Options_GM.md",
    "notes_b64": "PGgxPkFudGl0aGVzaXMgRXNjYWxhdGlvbiBhbmQgQm9zcyBPcHRpb25zPC9oMT4KPGgyPlB1cnBvc2U8L2gyPgo8cD5TaWduYWwgQmxlZWQgaXMgd3JpdHRlbiBhcyBhIHN0YXJ0ZXIgam9iLCBidXQgdGhlIEFudGl0aGVzaXMgdGhyZWF0IGNhbiBzY2FsZS48L3A+CjxwPkJ5IGRlZmF1bHQsIHRoZSBoaWRkZW4gbmVzdCBoYXMgcHJvZHVjZWQgYSBmZXcganV2ZW5pbGUgTW9kZWwgM3MuIFRoYXQgaXMgZW5vdWdoIGZvciBhIHRlbnNlIHN0YXJ0ZXIgc2NlbmFyaW8sIGVzcGVjaWFsbHkgaWYgY2l2aWxpYW5zLCBldmFjdWF0aW9uLCBiYWQgdmlzaWJpbGl0eSwgYW5kIGZhY3Rpb24gY29uZmxpY3QgYXJlIGFjdGl2ZSBhdCB0aGUgc2FtZSB0aW1lLjwvcD4KPHA+U29tZSBHTXMgbWF5IHdhbnQgYSBoYXJkZXIgY2xpbWF4LiBUaGUgbW9kdWxlIG5vdyBzdXBwb3J0cyBvcHRpb25hbCBhZG9sZXNjZW50IGFuZCBhZHVsdCBNb2RlbCAxIC8gTW9kZWwgMyB0b2tlbnMgZm9yIHRoYXQgcHVycG9zZS48L3A+CjxoMj5QbGF5ZXIgZHVyYWJpbGl0eSBub3RlPC9oMj4KPHA+SG9wZS8vUHVuayBjaGFyYWN0ZXJzIG1heSBsb29rIGZyYWdpbGUgaWYganVkZ2VkIG9ubHkgYnkgSFAuIFRoZXkgYXJlIGhhcmRlciB0byBraWxsIGluIHByYWN0aWNlIGJlY2F1c2UgdGhleSBjYW4gYmUgd291bmRlZCB0d2ljZSBhbmQgb25seSBkaWUgb24gdGhlIHRoaXJkIHdvdW5kLiBFYWNoIHRpbWUgdGhleSBhcmUgd291bmRlZCwgdGhleSByZXN0b3JlIHRvIGZ1bGwgaGVhbHRoLjwvcD4KPHA+VGhhdCBtZWFucyBhIHN0YXJ0ZXIgZ3JvdXAgY2FuIHNvbWV0aW1lcyBzdXJ2aXZlIG1vcmUgcHJlc3N1cmUgdGhhbiBhIGZpcnN0IGdsYW5jZSBhdCBIUCBzdWdnZXN0cy48L3A+CjxwPlVzZSB0aGF0IGR1cmFiaWxpdHkgdG8gY3JlYXRlIGRlc3BlcmF0ZSBoZXJvaWMgc2NlbmVzLCBub3QgdG8gZ3JpbmQgdGhlIHBhcnR5IGRvd24gd2l0aCB1bmF2b2lkYWJsZSBkYW1hZ2UuPC9wPgo8aDI+UmVjb21tZW5kZWQgYmFzZWxpbmU8L2gyPgo8cD5Gb3IgYSBzdGFydGVyIGdyb3VwLCB1c2U6PC9wPgo8cHJlPjHigJMzIEp1dmVuaWxlIE1vZGVsIDNzIGFjcm9zcyB0aGUgc2NlbmFyaW8KTW9kZWwgMXMgYXMgZXZpZGVuY2UsIGJhY2tncm91bmQsIG9yIGxhdGUgcHJlc3N1cmUKb25lIGhpZGRlbiBuZXN0IGhhemFyZC9vYmplY3RpdmUKbWFueSBjaXZpbGlhbnMgdG8gcHJvdGVjdDwvcHJlPgo8cD5BIHNpbmdsZSBKdXZlbmlsZSBNb2RlbCAzIHNob3VsZCBub3QgYWx3YXlzIGZpZ2h0IHRvIHRoZSBkZWF0aC4gSXQgc2hvdWxkIHRyeSB0byBncmFiIGJpb21hc3MgYW5kIGVzY2FwZS48L3A+CjxoMj5PcHRpb25hbCBib3NzIGZpZ2h0OiBBZG9sZXNjZW50IE1vZGVsIDM8L2gyPgo8cD5Gb3IgYSBzdHJvbmdlciBjbGltYXgsIGFkZCBvbmUgQWRvbGVzY2VudCBNb2RlbCAzIGFzIHRoZSBoaWRkZW4gbmVzdOKAmXMgZmlyc3QgbWFqb3IgZGVmZW5kZXIuPC9wPgo8cD5Vc2UgdGhpcyB3aGVuOjwvcD4KPHByZT50aGVyZSBhcmUgNCsgUENzCnRoZSBwbGF5ZXJzIGFyZSB0YWN0aWNhbGx5IGNvbXBldGVudAp0aGUgUENzIGhhdmUgYWxyZWFkeSBhc2NlbmRlZCBvciBhcmUgYWJvdXQgdG8KdGhlIGdyb3VwIHdhbnRzIGEgY2xlYXIgYm9zcyBmaWdodApOaWdodENyYXNoIGlzIGF2YWlsYWJsZSBvbmx5IGFzIGVtZXJnZW5jeSBleHRyYWN0aW9uLCBub3Qgc29sdXRpb248L3ByZT4KPHA+R29vZCBwbGFjZW1lbnQ6PC9wPgo8cHJlPkMxMiBIaWRkZW4gTWFpbnRlbmFuY2UgQ2F2aXR5CkM2IEhWQUMgLyBBaXIgSGFuZGxpbmcKQzUgV2F0ZXIgUmVjeWNsaW5nCkQ5IFNlcnZpY2UgQnlwYXNzIGlmIHRoZSBmaWdodCBtb3ZlcyB2ZXJ0aWNhbGx5PC9wcmU+CjxwPkJvc3MtZmlnaHQgb2JqZWN0aXZlIGlkZWFzOjwvcD4KPHVsPgo8bGk+aG9sZCBpdCBvZmYgd2hpbGUgY2l2aWxpYW5zIGV2YWN1YXRlPC9saT4KPGxpPnN0b3AgaXQgZnJvbSBkcmFnZ2luZyBOYXJpbiBvciBhbm90aGVyIHZpY3RpbSBpbnRvIHRoZSBuZXN0PC9saT4KPGxpPmRlc3Ryb3kgdGhlIHNlZWQgY2x1bXAgd2hpbGUgaXQgcHJvdGVjdHMgdGhlIG5lc3Q8L2xpPgo8bGk+Zm9yY2UgaXQgaW50byBhIHN0ZXJpbGl6YXRpb24gY2hva2UgcG9pbnQ8L2xpPgo8bGk+c3Vydml2ZSBsb25nIGVub3VnaCBmb3IgYSBuZXdseSBhc2NlbmRlZCBTYW11cmFpIHRvIGFjdDwvbGk+CjwvdWw+CjxoMj5BZHVsdCBNb2RlbCAzPC9oMj4KPHA+VXNlIGFuIEFkdWx0IE1vZGVsIDMgb25seSBpZiB0aGUgR00gd2FudHMgYSBtdWNoIG1vcmUgZGFuZ2Vyb3VzIHNjZW5hcmlvLjwvcD4KPHA+R29vZCByZWFzb25zOjwvcD4KPHVsPgo8bGk+bGFyZ2VyIHBhcnR5PC9saT4KPGxpPmNvbWJhdC1oZWF2eSB0YWJsZTwvbGk+CjxsaT5sYXRlLWNhbXBhaWduIHJldmlzaXQgb2YgU2lnbmFsIEJsZWVkPC9saT4KPGxpPmZhaWxlZCBjb250YWlubWVudCBhZnRlciB0aGUgc3RhcnRlciBqb2I8L2xpPgo8bGk+4oCcYmFkIGVuZGluZ+KAnSBlc2NhbGF0aW9uIGlmIHRoZSBoaWRkZW4gbmVzdCBpcyBpZ25vcmVkPC9saT4KPC91bD4KPHA+Rm9yIGEgdHJ1ZSBzdGFydGVyIHNlc3Npb24sIGFuIEFkdWx0IE1vZGVsIDMgc2hvdWxkIHVzdWFsbHkgYmUgZm9yZXNoYWRvd2luZyBvciBhIHRpbWVyLCBub3QgdGhlIGV4cGVjdGVkIGZpZ2h0LjwvcD4KPHA+RXhhbXBsZTo8L3A+CjxwcmU+VGhlIGFkdWx0IGlzIG5vdCBmdWxseSBlbWVyZ2VkLgpUaGUgUENzIG11c3QgcHJldmVudCBpdCBmcm9tIGZpbmlzaGluZy48L3ByZT4KPGgyPk1vZGVsIDEgZXNjYWxhdGlvbjwvaDI+CjxwPk1vZGVsIDFzIGFyZSB0aGUgY2x1ZSB0aGF0IHRoZSBzZWNvbmQgbmVzdCBleGlzdHMuIFRoZXkgYXJlIGFsc28gYSBwb3NzaWJsZSB0aW1lci48L3A+CjxwPlVzZTo8L3A+CjxwcmU+anV2ZW5pbGUgTW9kZWwgMSBldmlkZW5jZSBpbiByZWxheSBmb290YWdlCmRlYWQgTW9kZWwgMSBzZWVkIGNsdW1wIGluIHRoZSBoaWRkZW4gbmVzdAphZG9sZXNjZW50L2FkdWx0IE1vZGVsIDEgdG9rZW5zIG9ubHkgaWYgdGhlIG5lc3QgbWF0dXJlcyBvciB0aGUgR00gd2FudHMgYSBzd2FybSBzY2VuZTwvcHJlPgo8cD5Nb2RlbCAxcyB3b3JrIGJlc3QgYXM6PC9wPgo8dWw+CjxsaT5tb3Rpb24gaW4gdmVudHM8L2xpPgo8bGk+c3dhcm0gcHJlc3N1cmU8L2xpPgo8bGk+YWVyaWFsIGhhcmFzc21lbnQ8L2xpPgo8bGk+ZXZpZGVuY2UgdGhhdCB0aGUgbmVzdCBpcyBwcm9kdWNpbmcgYWdhaW48L2xpPgo8bGk+YSDigJxjb250YWluIHRoaXMgbm934oCdIHdhcm5pbmc8L2xpPgo8L3VsPgo8aDI+U3VnZ2VzdGVkIHNjYWxpbmcgYnkgZ3JvdXA8L2gyPgo8aDM+MuKAkzMgUENzPC9oMz4KPHVsPgo8bGk+b25lIEp1dmVuaWxlIE1vZGVsIDMgYXQgYSB0aW1lPC9saT4KPGxpPm5vIGFkb2xlc2NlbnQgdW5sZXNzIGhlYXZpbHkgd291bmRlZCBvciBvYmplY3RpdmUtYmFzZWQ8L2xpPgo8bGk+TmlnaHRDcmFzaCBhdmFpbGFibGUgYXMgZXZhY3VhdGlvbiBzYWZldHkgdmFsdmU8L2xpPgo8bGk+Zm9jdXMgb24gcmVzY3VlIGFuZCBjb250YWlubWVudDwvbGk+CjwvdWw+CjxoMz40IFBDczwvaDM+Cjx1bD4KPGxpPm9uZSBvciB0d28gSnV2ZW5pbGUgTW9kZWwgM3M8L2xpPgo8bGk+b3B0aW9uYWwgQWRvbGVzY2VudCBNb2RlbCAzIGFzIGJvc3M8L2xpPgo8bGk+Y2l2aWxpYW5zIGFuZCBmYWN0aW9uIGNvbXBsaWNhdGlvbnMgYWN0aXZlPC9saT4KPC91bD4KPGgzPjUrIFBDczwvaDM+Cjx1bD4KPGxpPnR3byBKdXZlbmlsZSBNb2RlbCAzcyBwbHVzIG9uZSBBZG9sZXNjZW50IE1vZGVsIDM8L2xpPgo8bGk+b3Igb25lIEFkb2xlc2NlbnQgTW9kZWwgMyB3aXRoIE1vZGVsIDEgc3dhcm0gcHJlc3N1cmU8L2xpPgo8bGk+bXVsdGlwbGUgc2ltdWx0YW5lb3VzIG9iamVjdGl2ZXM8L2xpPgo8L3VsPgo8aDI+Qm9zcy1maWdodCBkZXNpZ24gcnVsZTwvaDI+CjxwPkRvIG5vdCBtYWtlIHRoZSBjbGltYXggb25seSDigJxyZWR1Y2UgSFAgdG8gemVyby7igJ08L3A+CjxwPkJldHRlciBvYmplY3RpdmVzOjwvcD4KPHByZT5kZXN0cm95IHRoZSBNb2RlbCAxIHNlZWQgY2x1bXAKc2F2ZSBhIHZpY3RpbSBiZWZvcmUgdGhleSBhcmUgYWJzb3JiZWQKaG9sZCBhIGNvcnJpZG9yIGZvciB0aHJlZSByb3VuZHMKcmVzdG9yZSBlbGV2YXRvciBwb3dlcgpzZWFsIHRoZSB2ZW50IG5ldHdvcmsKZm9yY2UgY29ycCBhbmQgUmVkbGluZSB0byBzdG9wIHNob290aW5nCmJyb2FkY2FzdCB0aGUgcmVsYXkgd2hpbGUgdW5kZXIgYXR0YWNrPC9wcmU+CjxoMj5Ub2tlbiBuYW1lcyBpbiByZXBvc2l0b3J5PC9oMj4KPHA+VGhlIHJlcG9zaXRvcnkgdG9rZW4gZm9sZGVyIGluY2x1ZGVzIG9wdGlvbmFsIGVzY2FsYXRpb24gYXJ0IHVzaW5nIHRoZXNlIGZpbGVuYW1lczo8L3A+CjxwcmU+bW9kZWwgMSBqdXZlbmlsZS5wbmcKbW9kZWwgMSBhZG9sZXNjZW50LnBuZwptb2RlbCAxIGFkdWx0LnBuZwptb2RlbCAzIGp1dmVuaWxlLnBuZwptb2RlbCAzIGFkb2xlc2NlbnQucG5nCm1vZGVsIDMgYWR1bHQucG5nPC9wcmU+CjxwPlRoZSBpbXBvcnRlciBleHBlY3RzIHRoZSBzdGFuZGFyZGl6ZWQgZmlsZW5hbWVzIGFib3ZlLjwvcD4KPGgyPlJvbGwyMCBmb2xkZXIgc3VnZ2VzdGlvbjwvaDI+CjxwPlB1dCB0aGVzZSBpbiBhIEpvdXJuYWwgZm9sZGVyIG5hbWVkOjwvcD4KPHByZT5CZXN0aWFyeTwvcHJlPgo8cD5TdWdnZXN0ZWQgY2hhcmFjdGVyIG5hbWVzOjwvcD4KPHByZT5Nb2RlbCAxIEp1dmVuaWxlCk1vZGVsIDEgQWRvbGVzY2VudApNb2RlbCAxIEFkdWx0Ck1vZGVsIDMgSnV2ZW5pbGUKTW9kZWwgMyBBZG9sZXNjZW50Ck1vZGVsIDMgQWR1bHQ8L3ByZT4KPHA+VGhlIGltcG9ydGVyIGNhbiBjcmVhdGUgYmFzaWMgR00tb25seSBlbnRyaWVzIGFuZCBsaW5rIHNlbGVjdGVkIHRva2Vucy4gRnVsbCBtZWNoYW5pY2FsIHN0YXQgaW1wb3J0IHN0aWxsIGRlcGVuZHMgb24gY29uZmlybWluZyB0aGUgZXhhY3QgSG9wZS8vUHVuayBzaGVldCBhdHRyaWJ1dGUgbmFtZXMuPC9wPg=="
  },
  {
    "name": "Signal Bleed - Recovered B8 Notebook",
    "source_file": "handouts/29_Recovered_B8_Notebook.md",
    "notes_b64": "PGgxPlJlY292ZXJlZCBOb3RlYm9vayBmcm9tIEI4IElzb2xhdGlvbiBXYXJkPC9oMT4KPHA+VGhpcyBub3RlYm9vayBpcyBoaWRkZW4gYmVoaW5kIGEgbG9vc2Ugd2FsbCBwYW5lbCBpbiB0aGUgc2VhbGVkIGlzb2xhdGlvbiB3YXJkIG9uIEZsb29yIEIuPC9wPgo8cD5UaGUgY292ZXIgaXMgc21va2Utc3RhaW5lZCBhbmQgcGFydGx5IG1lbHRlZC4gTW9zdCBpZGVudGlmeWluZyBtYXJrcyBoYXZlIGJlZW4gc2NyYXBlZCBvZmYuIFNldmVyYWwgcGFnZXMgYXJlIG1pc3NpbmcuIFRoZSBoYW5kd3JpdGluZyBiZWdpbnMgbmVhdCBhbmQgY2xpbmljYWwsIHRoZW4gYmVjb21lcyBydXNoZWQsIHVuZXZlbiwgYW5kIGhhcmRlciB0byByZWFkLjwvcD4KPHA+SW5zaWRlIHRoZSBiYWNrIGNvdmVyLCBzb21lb25lIGhhcyB3cml0dGVuOjwvcD4KPGJsb2NrcXVvdGU+SWYgdGhleSBjb21lIGJhY2ssIGRvIG5vdCBsZXQgdGhlbSBzYXkgdGhpcyB3YXMgYW4gYWNjaWRlbnQuPC9ibG9ja3F1b3RlPgo8aDI+QXQgYSBnbGFuY2U8L2gyPgo8cD5UaGUgbm90ZWJvb2sgYXBwZWFycyB0byBkZXNjcmliZSBhIGNvdmVydCBiaW9sb2dpY2FsIHJlc2VhcmNoIG9wZXJhdGlvbiBydW4gaW5zaWRlIHRoZSB3YXJkIHVuZGVyIGZhbHNlIG1lZGljYWwgY292ZXIuPC9wPgo8cD5UaGUgd3JpdGVyIG5ldmVyIG5hbWVzIHRoZSBjb3Jwb3JhdGlvbiBkaXJlY3RseSwgYnV0IHRoZSBsYW5ndWFnZSwgZXF1aXBtZW50IHJlZmVyZW5jZXMsIHNlY3VyaXR5IHByb2NlZHVyZXMsIGFuZCBjbGVhbnVwIG9yZGVycyBhbGwgcG9pbnQgdG93YXJkIGEgd2VsbC1mdW5kZWQgY29ycG9yYXRlIHByb2dyYW0uPC9wPgo8cD5UaGUgZW50cmllcyBkZXNjcmliZTo8L3A+Cjx1bD4KPGxpPm5vbmh1bWFuIGJpb2xvZ2ljYWwgc2FtcGxlcyw8L2xpPgo8bGk+ZGVsaWJlcmF0ZSBncm93dGggYW5kIGZlZWRpbmcgdHJpYWxzLDwvbGk+CjxsaT5zdGFmZiBvcmRlcmVkIG5vdCB0byB1c2UgdGhlIHdvcmQgPHN0cm9uZz5BbnRpdGhlc2lzPC9zdHJvbmc+LDwvbGk+CjxsaT5zbWFsbCBmbHlpbmcgZm9ybXMgbGF0ZXIgY2FsbGVkIDxzdHJvbmc+TW9kZWwgMXM8L3N0cm9uZz4sPC9saT4KPGxpPmEgY29udGFpbm1lbnQgYnJlYWNoLDwvbGk+CjxsaT5kZWF0aHMgYW1vbmcgcmVzZWFyY2hlcnMgYW5kIHN0YWZmLDwvbGk+CjxsaT5hIGNvcnBvcmF0ZSBwb3dlcmVkLWFybW9yIGNsZWFudXAgdGVhbSw8L2xpPgo8bGk+YW5kIGF0IGxlYXN0IHNldmVyYWwgc21hbGwgZm9ybXMgZXNjYXBpbmcgYmVmb3JlIHRoZSB3YXJkIHdhcyBidXJuZWQgb3V0LjwvbGk+CjwvdWw+CjxoMj5TZWxlY3RlZCByZWFkYWJsZSBlbnRyaWVzPC9oMj4KPGgzPkRheSAxPC9oMz4KPHA+V2FyZCBCOCBoYXMgYmVlbiBzZWFsZWQgdW5kZXIgZW1lcmdlbmN5IGNvcnBvcmF0ZSBhdXRob3JpdHkuPC9wPgo8cD5PZmZpY2lhbGx5LCB0aGlzIGlzIGEgYmlvaGF6YXJkIHByZXBhcmVkbmVzcyBleGVyY2lzZS4gVGhhdCBpcyB3aGF0IHRoZSBjbGluaWMtZmFjaW5nIHN0YWZmIHdlcmUgdG9sZC4gSXQgaXMgbm90IHRydWUuPC9wPgo8cD5TcGVjaW1lbnMgYXJyaXZlZCBpbiBhcm1vcmVkIHJlZnJpZ2VyYXRpb24gY2FzZXMgdW5kZXIgZ3VhcmQuIE5vIHByb3BlciBjaGFpbiBvZiBjdXN0b2R5LiBObyBleHRlcm5hbCBsb2dnaW5nLiBObyBuYW1lcyBvbiB0aGUgdHJhbnNwb3J0IG1hbmlmZXN0LCBvbmx5IGludGVybmFsIGFzc2V0IG51bWJlcnMuPC9wPgo8cD5XZSB3ZXJlIHRvbGQgdGhlIG1hdGVyaWFsIGlzIG5vbmh1bWFuLCBoaWdoLXJpc2ssIGFuZCBub3QgdG8gYmUgZGlzY3Vzc2VkIG91dHNpZGUgdGhlIHdhcmQuPC9wPgo8cD5ObyBvbmUgaGFzIHNhaWQgdGhlIHdvcmQgYWxvdWQgeWV0LjwvcD4KPHA+RXZlcnlvbmUgaXMgdGhpbmtpbmcgaXQuPC9wPgo8aDM+RGF5IDI8L2gzPgo8cD5UaGUgdGlzc3VlIGlzIG5vdCBpbmVydC48L3A+CjxwPkl0IHJlc3BvbmRzIHRvIGhlYXQsIGVsZWN0cmljYWwgc3RpbXVsYXRpb24sIGFuZCBudXRyaWVudCBleHBvc3VyZS4gSXQgZG9lcyBub3QgbWVyZWx5IHR3aXRjaC4gSXQgcmVvcmdhbml6ZXMuPC9wPgo8cD5XaGVuIHRoZSB0cmF5IHdhcm1zLCBpdCB0aGlja2VucyB0b3dhcmQgdGhlIGhlYXQgc291cmNlLiBXaGVuIGV4cG9zZWQgdG8gYW5pbWFsIHRpc3N1ZSwgaXQgZ3Jvd3MgZmFzdGVyLiBXaGVuIHRoZSByb29tIHF1aWV0cywgdGhlIHNtYWxsZXIgc3RydWN0dXJlcyBzaGlmdCB0b3dhcmQgdGhlIGdsYXNzLjwvcD4KPHA+SSByZXF1ZXN0ZWQgY29uZmlybWF0aW9uIHRoYXQgdGhpcyBtYXRlcmlhbCBjYW1lIGZyb20gYSBzdGVyaWxpemVkIGJhdHRsZSBzaXRlLjwvcD4KPHA+Tm8gYW5zd2VyLjwvcD4KPGgzPkRheSAzPC9oMz4KPHA+VGhlIHByb2plY3QgbGVhZCBzYXlzIHdlIGFyZSBzdHVkeWluZyBlYXJseSBncm93dGggYmVoYXZpb3IgZm9yIOKAnGNvbnRhaW5tZW50IHJlc3BvbnNlLuKAnTwvcD4KPHA+VGhhdCBpcyB0aGUgcGhyYXNlIHVzZWQgaW4gZnJvbnQgb2YgZ3VhcmRzLjwvcD4KPHA+SW4gcHJpdmF0ZSwgb25lIG9mIHRoZSBjb3Jwb3JhdGUgb2JzZXJ2ZXJzIGNhbGxlZCBpdCDigJxiYXR0bGVmaWVsZCBhcHBsaWNhYmlsaXR5LuKAnTwvcD4KPHA+VGhlIGRpc3RpbmN0aW9uIGlzIG1vcmFsIHRoZWF0ZXIuIEV2ZXJ5b25lIGhlcmUga25vd3MgaXQuPC9wPgo8aDM+RGF5IDQ8L2gzPgo8cD5XZSBiZWdhbiBjb250cm9sbGVkIGZlZWRpbmcgdHJpYWxzLjwvcD4KPHA+SSBvYmplY3RlZC4gVGhlIG9iamVjdGlvbiB3YXMgbG9nZ2VkLCB0aGVuIGlnbm9yZWQuPC9wPgo8cD5UaGUgbWF0ZXJpYWwgY29uc3VtZWQgZXZlcnl0aGluZyBwbGFjZWQgaW4gdGhlIGVuY2xvc3VyZS4gSXQgZm9ybWVkIGNoYW1iZXJzLCByaWRnZXMsIGFuZCBhIHdhcm0gY2VudHJhbCBtYXNzLiBJdCBpcyBiZWNvbWluZyBvcmdhbml6ZWQuPC9wPgo8cD5PbmUgb2YgdGhlIHlvdW5nZXIgcmVzZWFyY2hlcnMgc2FpZCBpdCBsb29rcyBsaWtlIGEgbmVzdC48L3A+CjxwPlRoZSBwcm9qZWN0IGxlYWQgdG9sZCBoZXIgbm90IHRvIHVzZSB0aGF0IHdvcmQgYWdhaW4uPC9wPgo8aDM+RGF5IDU8L2gzPgo8cD5Db250YWlubWVudCBicmVhY2gsIG1pbm9yLjwvcD4KPHA+QSBkcm9uZSBhcm0gd2FzIGNhdWdodCB0aHJvdWdoIHRoZSBhY2Nlc3MgaGF0Y2guIFRoZSBtYXNzIHdyYXBwZWQgaXQsIGNyYWNrZWQgdGhlIGNhc2luZywgYW5kIGluY29ycG9yYXRlZCBwaWVjZXMgaW50byB0aGUgc3Vycm91bmRpbmcgc3RydWN0dXJlLjwvcD4KPHA+Tm90IGFzIG1hY2hpbmVyeS4gQXMgc2NhZmZvbGRpbmcuPC9wPgo8cD5JIG5vIGxvbmdlciBiZWxpZXZlIHdlIGFyZSBvYnNlcnZpbmcgYSBzYW1wbGUuPC9wPgo8cD5JIGJlbGlldmUgd2UgYXJlIGhlbHBpbmcgaXQgYnVpbGQgaXRzZWxmLjwvcD4KPGgzPkRheSA2PC9oMz4KPHA+U21hbGwgYXV0b25vbW91cyBmb3JtcyBlbWVyZ2VkIGZyb20gdGhlIG1hc3MuPC9wPgo8cD5GYXN0LiBGcmFnaWxlLiBBaXJib3JuZS48L3A+CjxwPlNlY3VyaXR5IGNhbGxlZCB0aGVtIDxzdHJvbmc+TW9kZWwgMXM8L3N0cm9uZz4gYmVmb3JlIGFueW9uZSBpbiB0aGUgcm9vbSBoYWQgYXNzaWduZWQgYSBuYW1lLjwvcD4KPHA+VGhhdCBtZWFucyBjb3Jwb3JhdGUgaGFzIHNlZW4gdGhlc2UgYmVmb3JlLjwvcD4KPHA+VGhpcyB3YXMgbmV2ZXIgZXhwbG9yYXRvcnkgcmVzZWFyY2guIFRoZXkga25ldyBlbm91Z2ggdG8gY2xhc3NpZnkgdGhlIGZvcm1zIGJlZm9yZSB0aGV5IGFwcGVhcmVkLjwvcD4KPGgzPkRheSA3PC9oMz4KPHA+VGhlIHdhcmQgc21lbGxzIHdyb25nLjwvcD4KPHA+VGhlIHZlbnRzIHB1bHNlIHdpdGggd2FybSBhaXIgZXZlbiB3aGVuIHRoZSBzeXN0ZW0gaXMgb2ZmLiBUaGUgd2FsbHMgbmVhciB0aGUgaW5uZXIgcGFydGl0aW9uIGFyZSBkYW1wLiBUaGUgc21hbGxlc3QgZm9ybXMgaGlkZSBpbiBkYXJrIHJlY2Vzc2VzIHdoZW4gZGlzdHVyYmVkLCB0aGVuIHJldHVybiB3aGVuIHRoZSByb29tIHF1aWV0cy48L3A+CjxwPlR3byBzdGFmZiByZXF1ZXN0ZWQgcmVtb3ZhbCBmcm9tIHRoZSBwcm9qZWN0LjwvcD4KPHA+T25lIHdhcyBlc2NvcnRlZCBvdXQgYnkgc2VjdXJpdHkuPC9wPgo8cD5IZXIgYWNjZXNzIHByb2ZpbGUgd2FzIGRlbGV0ZWQgd2l0aGluIHRoZSBob3VyLjwvcD4KPGgzPkRheSA4PC9oMz4KPHA+Q29udGFpbm1lbnQgZmFpbHVyZS48L3A+CjxwPkkgZG8gbm90IGtub3cgaG93IG1hbnkgYXJlIGRlYWQuPC9wPgo8cD5BdCBsZWFzdCB0aHJlZSBNb2RlbCAxcyBlc2NhcGVkIGJlZm9yZSB0aGUgc2h1dHRlcnMgY2FtZSBkb3duLiBMYXJnZXIgbG93LWJvZGllZCBmb3JtcyBmb2xsb3dlZCBmcm9tIHRoZSBpbm5lciBncm93dGguIFRoZWlyIGphd3Mgb3BlbmVkIGluIHRocmVlIGRpcmVjdGlvbnMuPC9wPgo8cD5UZWNobmljaWFuIFZhbGUgd2FzIHB1bGxlZCB1bmRlciBhIGd1cm5leS4gSSBzYXcgdGhlIHN1aXQgdGVhciBhdCB0aGUgbmVjay48L3A+CjxwPlRoZSBhbGFybXMgZmFpbGVkIHJvb20gYnkgcm9vbS48L3A+CjxwPlRoZW4gdGhlIGNhbWVyYXMgZmFpbGVkLjwvcD4KPGgzPkRheSA4LCBsYXRlcjwvaDM+CjxwPlJ1c2sgc2VhbGVkIHRoZSB3YXJkLjwvcD4KPHA+Tm90IHRvIHNhdmUgdXMuPC9wPgo8cD5UbyBjb250YWluIHRoZSBldmlkZW5jZS48L3A+CjxoMz5EYXkgOTwvaDM+CjxwPlRoZXkgY2FtZSBpbiB3ZWFyaW5nIHBvd2VyZWQgYXJtb3IuPC9wPgo8cD5Db3Jwb3JhdGUgcmV0cmlldmFsLCBub3QgY2xpbmljIHNlY3VyaXR5LiBGdWxsIHNlYWwuIEluY2VuZGlhcmllcy4gSGVhdnkgd2VhcG9ucy4gTm8gcmVzY3VlIHByb3RvY29sLjwvcD4KPHA+VGhleSBidXJuZWQgdGhlIGdyb3d0aC4gQnVybmVkIHRoZSBib2RpZXMuIEJ1cm5lZCBhbnl0aGluZyBvcmdhbmljIHRoZXkgY291bGQgbm90IGlkZW50aWZ5IGluIHNlY29uZHMuPC9wPgo8cD5PbmUgb2YgdGhlbSBzYWlkOjwvcD4KPGJsb2NrcXVvdGU+UHJpbWFyeSBuZXN0IG5ldXRyYWxpemVkLjwvYmxvY2txdW90ZT4KPHA+QW5vdGhlciBhbnN3ZXJlZDo8L3A+CjxibG9ja3F1b3RlPlN3ZWVwIGZvciBzdHJheXMgYW5kIHB1bGwgZXZlcnkgcmVjb3JkLjwvYmxvY2txdW90ZT4KPHA+VGhleSB0aGluayB0aGV5IGVuZGVkIGl0IGhlcmUuPC9wPgo8cD5UaGV5IGFyZSB3cm9uZy48L3A+CjxwPkkgc2F3IGF0IGxlYXN0IHR3byBzbWFsbCBmbHlpbmcgZm9ybXMgZXNjYXBlIHRocm91Z2ggdGhlIHNlcnZpY2UgZ2FwIGJlZm9yZSB0aGUgZmlyZSB0ZWFtcyBsb2NrZWQgdGhlIHdhcmQgZG93bi48L3A+CjxwPklmIHRob3NlIHRoaW5ncyBmb3VuZCBzb21ld2hlcmUgZGFyayBhbmQgaGlkZGVuLCB0aGlzIGlzIG5vdCBvdmVyLjwvcD4KPGgyPkZpbmFsIHBhZ2U8L2gyPgo8cD5UaGlzIHdhcyBkZWxpYmVyYXRlLjwvcD4KPHA+VGhleSBicm91Z2h0IGFsaWVuIG1hdGVyaWFsIGhlcmUuIFRoZXkgZmVkIGl0LiBUaGV5IHN0dWRpZWQgaXQuIFRoZXkgbG9zdCBjb250cm9sLiBUaGVuIHRoZXkgZXJhc2VkIHRoZSBwZW9wbGUgaW52b2x2ZWQuPC9wPgo8cD5Mb29rIGZvcjo8L3A+Cjx1bD4KPGxpPmJ1cm4gbWFya3MgdW5kZXIgZnJlc2ggd2FsbCBjb2F0aW5nLDwvbGk+CjxsaT5yZXBsYWNlZCB3YWxsIHBhbmVscyw8L2xpPgo8bGk+c2VhbGVkIHNlcnZpY2UgZ2Fwcyw8L2xpPgo8bGk+cmVzaWR1ZSBpbiBkcmFpbmFnZSB0cmFwcyw8L2xpPgo8bGk+bWlzc2luZyBzdGFmZiByZWNvcmRzLDwvbGk+CjxsaT5kZWxldGVkIGNhbWVyYSBmb290YWdlLDwvbGk+CjxsaT5hbmQgZmxpZ2h0LXZlY3RvciBub3RlcyBidXJpZWQgaW4gdGhlIGNsZWFudXAgbG9ncy48L2xpPgo8L3VsPgo8cD5JZiB0aGUgc21hbGwgb25lcyBlc2NhcGVkLCBCOCB3YXMgb25seSB0aGUgYmVnaW5uaW5nLjwvcD4KPHA+RG8gbm90IHRydXN0IGFueW9uZSB3aG8gc2F5cyB0aGUgZGFuZ2VyIGlzIG92ZXIuPC9wPg=="
  }
];






  function decodeBase64Utf8(input) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var str = String(input || '').replace(/[^A-Za-z0-9+/=]/g, '');
    var bytes = [];
    var buffer = 0;
    var bits = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (c === '=') { break; }
      var val = chars.indexOf(c);
      if (val < 0) { continue; }
      buffer = (buffer << 6) | val;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((buffer >> bits) & 0xff);
      }
    }
    var pct = '';
    for (var j = 0; j < bytes.length; j++) {
      pct += '%' + ('00' + bytes[j].toString(16)).slice(-2);
    }
    try {
      return decodeURIComponent(pct);
    } catch (e) {
      var out = '';
      for (var k = 0; k < bytes.length; k++) { out += String.fromCharCode(bytes[k]); }
      return out;
    }
  }

  HANDOUTS = HANDOUTS.map(function(h) {
    if (h.notes_b64) {
      h.notes = decodeBase64Utf8(h.notes_b64);
      delete h.notes_b64;
    }
    return h;
  });


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
      'model one juvenile': 'model 1 juvenile',      'model one adolescent': 'model 1 adolescent',
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

  function parseTokenSize(content) {
    var m = String(content || '').match(/--token-size\s+(\d+)/);
    if (!m) return 70;
    var n = parseInt(m[1], 10);
    if (!isFinite(n) || n < 20 || n > 560) return 70;
    return n;
  }

  function shouldKeepTokenSize(content) {
    return String(content || '').indexOf('--keep-token-size') !== -1;
  }

  function createNormalizedDefaultToken(sourceGraphic, character, tokenSize) {
    var pageid = sourceGraphic.get('_pageid') || sourceGraphic.get('pageid');
    var layer = sourceGraphic.get('layer') || 'objects';
    var left = Number(sourceGraphic.get('left')) || 70;
    var top = Number(sourceGraphic.get('top')) || 70;

    return createObj('graphic', {
      _pageid: pageid,
      pageid: pageid,
      layer: layer,
      imgsrc: normalizeImgsrc(sourceGraphic.get('imgsrc')),
      name: character.get('name'),
      represents: character.id,
      left: left,
      top: top,
      width: tokenSize,
      height: tokenSize,
      rotation: 0,
      isdrawing: false,
      showname: sourceGraphic.get('showname') || false,
      showplayers_name: sourceGraphic.get('showplayers_name') || false
    });
  }

  function setDefaultToken(character, graphic, tokenSize, keepTokenSize) {
    var tokenForDefault = graphic;

    graphic.set('represents', character.id);

    if (!keepTokenSize) {
      tokenForDefault = createNormalizedDefaultToken(graphic, character, tokenSize);
    }

    if (typeof setDefaultTokenForCharacter === 'function') {
      setDefaultTokenForCharacter(character, tokenForDefault);
    } else {
      var tokenJSON = tokenForDefault.toJSON();
      tokenJSON.represents = character.id;
      character.set('defaulttoken', JSON.stringify(tokenJSON));
    }

    if (!keepTokenSize) {
      tokenForDefault.remove();
    }
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
    var tokenSize = parseTokenSize(msg.content);
    var keepTokenSize = shouldKeepTokenSize(msg.content);

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
            setDefaultToken(character, g, tokenSize, keepTokenSize);
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
      '<code>' + COMMAND + ' --name-selected --dry-run</code> previews naming selected staged graphics<br>' +
      '<code>' + COMMAND + ' --name-selected</code> names selected staged graphics in top-to-bottom, left-to-right NPC roster order<br>' +
      '<code>' + COMMAND + ' --name-selected --start 5</code> starts naming at NPC roster slot 5<br>' +
      '<code>' + COMMAND + ' --name-selected --asset-order --dry-run</code> names by GitHub filename/alphabetical asset order<br>' +
      '<code>' + COMMAND + ' --name-selected --asset-order --reverse --dry-run</code> names by reversed Uploaded Assets order<br>' +
      '<code>' + COMMAND + ' --name-selected --asset-order --start 9</code> starts at asset-order slot 9<br>' +
      '<code>' + COMMAND + ' --link-selected-portraits</code> sets avatars from selected graphics<br>' +
      '<code>' + COMMAND + ' --link-selected-tokens --dry-run</code><br>' +
      '<code>' + COMMAND + ' --link-selected-tokens</code> sets one-cell 70×70 default tokens from selected graphics<br>' +
      '<code>' + COMMAND + ' --link-selected-tokens --overwrite --token-size 70</code> relinks one-cell default tokens<br>' +
      '<code>' + COMMAND + ' --link-selected-tokens --overwrite --token-size 140</code> relinks two-cell default tokens<br>' +
      '<code>--keep-token-size</code> preserves staged token dimensions instead of normalizing<br>' +
      '<code>' + COMMAND + ' --link-selected-assets</code> sets both avatar and default token from selected graphics<br>' +
      '<code>' + COMMAND + ' --link-selected-tokens --overwrite</code> replaces existing links<br><br>' +
      '<strong>Current embedded content:</strong><br>' +
      NPCS.length + ' NPC character entries<br>' +
      HANDOUTS.length + ' handouts<br><br>' +
      '<br><strong>Token maintenance:</strong><br>' +
      '<code>' + COMMAND + ' --normalize-default-token-size --dry-run</code> previews resizing existing NPC default tokens without changing artwork<br>' +
      '<code>' + COMMAND + ' --normalize-default-token-size</code> resizes existing NPC default tokens to 70×70 px without relinking images<br>' +
      '<code>' + COMMAND + ' --normalize-default-token-size --token-size 140</code> resizes existing NPC default tokens to 140×140 px<br>' +
      '<code>' + COMMAND + ' --normalize-default-token-size --only "Juno “Switch” Hale"</code> resizes one NPC default token only<br><br>' +
      '<br><strong>GM layer labels:</strong><br>' +
      '<code>' + COMMAND + ' --gm-labels floor-a --dry-run</code> previews Floor A GM labels; select the map graphic first<br>' +
      '<code>' + COMMAND + ' --gm-labels floor-a</code> creates Floor A GM-layer labels<br>' +
      '<code>' + COMMAND + ' --gm-labels floor-a --label-size 56 --label-color yellow</code> creates larger yellow labels<br>' +
      '<code>--outline-color black</code> changes label outline color; <code>--no-outline</code> disables outline<br>' +
      '<code>' + COMMAND + ' --gm-labels floor-b</code>, <code>floor-c</code>, <code>floor-d</code> create labels for other floors<br>' +
      '<code>' + COMMAND + ' --clear-gm-labels floor-a --dry-run</code> previews removing generated Floor A labels<br>' +
      '<code>' + COMMAND + ' --clear-gm-labels floor-a</code> removes generated Floor A labels<br><br>' +
            'Roll20 images must be uploaded manually first, then dragged to a staging page and selected.');
  }


  var ASSET_FILE_ORDER = [
    "Bex Aranda",
    "Commander Ilan Rusk",
    "Dr. Sera Valez",
    "Dr. Vela Myung",
    "Florence “NightCrash” Vale",
    "Gurney Angels",
    "Halden Rook",
    "Juno “Switch” Hale",
    "Keet",
    "Laleh “Lala” Mir",
    "Lt. Varya Senn",
    "Mara “Mother Red” Vey",
    "Mara Silex",
    "Miri and Sol",
    "Model 1 Adolescent",
    "Model 1 Adult",
    "Model 1 Juvenile",
    "Model 3 Adolescent",
    "Model 3 Adult",
    "Model 3 Juvenile",
    "Narin Pell",
    "Nox “Bluewire” Kade",
    "Orlan Pike",
    "Oskar Venn",
    "Rafa Mbeki",
    "Rook “Mads” Madsen",
    "Sister Luma",
    "Talla “Auntie’s Eyes” Vey",
    "Tamsin Quill",
    "The Siren Saint",
    "Vex Tan"
  ];

  function graphicSort(a, b) {
    var ay = Number(a.get('top')) || 0;
    var by = Number(b.get('top')) || 0;
    if (Math.abs(ay - by) > 20) return ay - by;
    return (Number(a.get('left')) || 0) - (Number(b.get('left')) || 0);
  }

  function nameSelectedGraphics(msg, dryRun) {
    var graphics = selectedGraphics(msg).sort(graphicSort);
    if (!graphics.length) {
      sendChat('Signal Bleed', '/w gm No selected graphics. Select staged portrait/token images first.');
      return;
    }

    var startMatch = String(msg.content || '').match(/--start\s+(\d+)/);
    var start = startMatch ? Math.max(1, parseInt(startMatch[1], 10)) : 1;

    var useAssetOrder = String(msg.content || '').indexOf('--asset-order') !== -1;
    var reverseOrder = String(msg.content || '').indexOf('--reverse') !== -1;
    var roster = useAssetOrder ? ASSET_FILE_ORDER.slice(0) : NPCS.map(function (n) { return n.name; });
    if (reverseOrder) {
      roster.reverse();
    }
    var rosterLabel = (useAssetOrder ? 'asset filename order' : 'NPC roster order') + (reverseOrder ? ' reversed' : '');

    var lines = ['Naming by <b>' + esc(rosterLabel) + '</b>.'];
    graphics.forEach(function (g, i) {
      var rosterIndex = start - 1 + i;
      var name = roster[rosterIndex];

      if (!name) {
        lines.push('No roster entry for selected graphic #' + (i + 1) + ' at roster slot ' + (rosterIndex + 1));
        return;
      }

      lines.push((dryRun ? 'Would name ' : 'Named ') + esc(g.get('name') || '(unnamed graphic)') + ' → <b>' + esc(name) + '</b>');

      if (!dryRun) {
        g.set('name', name);
      }
    });

    sendChat('Signal Bleed', '/w gm ' + lines.join('<br>'));
  }




  function parseOptionInt(content, flag, defaultValue, minValue, maxValue) {
    var re = new RegExp(flag + '\\s+(\\d+)');
    var m = String(content || '').match(re);
    if (!m) return defaultValue;
    var n = parseInt(m[1], 10);
    if (!isFinite(n)) return defaultValue;
    if (typeof minValue === 'number' && n < minValue) return defaultValue;
    if (typeof maxValue === 'number' && n > maxValue) return defaultValue;
    return n;
  }

  function parseOptionColor(content, flag, defaultValue) {
    var re = new RegExp(flag + '\\s+(#[0-9A-Fa-f]{6}|[A-Za-z]+)');
    var m = String(content || '').match(re);
    if (!m) return defaultValue;
    var c = m[1].toLowerCase();
    var named = {
      yellow: '#FFFF00',
      white: '#FFFFFF',
      black: '#000000',
      cyan: '#00FFFF',
      magenta: '#FF00FF',
      red: '#FF3333',
      green: '#33FF66',
      blue: '#3399FF'
    };
    return named[c] || m[1];
  }

  function wantsNoOutline(content) {
    return String(content || '').indexOf('--no-outline') !== -1;
  }


  var GM_LABELS = {
    'floor-a': {
      name: 'Floor A',
      prefix: 'A',
      labels: [
        { id: 'A1',  x: 0.50, y: 0.08, note: 'Main street / public frontage' },
        { id: 'A2',  x: 0.16, y: 0.25, note: 'Ambulance bay / emergency access' },
        { id: 'A3',  x: 0.44, y: 0.24, note: 'Surgical / treatment room' },
        { id: 'A4',  x: 0.68, y: 0.25, note: 'Recovery ward' },
        { id: 'A5',  x: 0.22, y: 0.45, note: 'Office / records' },
        { id: 'A6',  x: 0.17, y: 0.66, note: 'Staff lounge / break room' },
        { id: 'A7',  x: 0.48, y: 0.55, note: 'Central reception / waiting hall' },
        { id: 'A8',  x: 0.42, y: 0.76, note: 'Curved front desk' },
        { id: 'A9',  x: 0.39, y: 0.62, note: 'Elevator / lift core' },
        { id: 'A10', x: 0.54, y: 0.74, note: 'Stairwell' },
        { id: 'A11', x: 0.72, y: 0.63, note: 'Patient rooms' },
        { id: 'A12', x: 0.51, y: 0.92, note: 'South entrance / street access' },
        { id: 'A13', x: 0.87, y: 0.55, note: 'East exterior walkway' }
      ]
    },
    'floor-b': {
      name: 'Floor B',
      prefix: 'B',
      labels: [
        { id: 'B1',  x: 0.50, y: 0.08, note: 'Upper exterior walkway / public edge' },
        { id: 'B2',  x: 0.20, y: 0.22, note: 'Left clinical lab / procedure space' },
        { id: 'B3',  x: 0.48, y: 0.19, note: 'Server / equipment room' },
        { id: 'B4',  x: 0.62, y: 0.25, note: 'Small office / checkpoint' },
        { id: 'B5',  x: 0.82, y: 0.20, note: 'VTOL / drone landing pad' },
        { id: 'B6',  x: 0.45, y: 0.46, note: 'Central corridor junction' },
        { id: 'B7',  x: 0.72, y: 0.42, note: 'Support rooms' },
        { id: 'B8',  x: 0.73, y: 0.62, note: 'Biohazard isolation pods' },
        { id: 'B9',  x: 0.38, y: 0.64, note: 'Elevator / lift core' },
        { id: 'B10', x: 0.52, y: 0.71, note: 'Stairwell' },
        { id: 'B11', x: 0.50, y: 0.92, note: 'Lower exterior street / entrance' },
        { id: 'B12', x: 0.20, y: 0.72, note: 'Staff room / small office' }
      ]
    },
    'floor-c': {
      name: 'Floor C',
      prefix: 'C',
      labels: [
        { id: 'C1',  x: 0.18, y: 0.15, note: 'Upper-left machinery room' },
        { id: 'C2',  x: 0.41, y: 0.15, note: 'Utility tanks / pipes' },
        { id: 'C3',  x: 0.64, y: 0.15, note: 'Power / filtration room' },
        { id: 'C4',  x: 0.18, y: 0.35, note: 'Storage racks / crates' },
        { id: 'C5',  x: 0.24, y: 0.50, note: 'Workshop / maintenance' },
        { id: 'C6',  x: 0.50, y: 0.44, note: 'Central service corridor' },
        { id: 'C7',  x: 0.45, y: 0.59, note: 'Elevator / lift core' },
        { id: 'C8',  x: 0.60, y: 0.58, note: 'Stairwell' },
        { id: 'C9',  x: 0.72, y: 0.42, note: 'Right-side control room / office' },
        { id: 'C10', x: 0.20, y: 0.77, note: 'Heavy machinery' },
        { id: 'C11', x: 0.50, y: 0.78, note: 'Lower-middle service room' },
        { id: 'C12', x: 0.72, y: 0.80, note: 'Lower-right quarantine / utility chamber' }
      ]
    },
    'floor-d': {
      name: 'Floor D',
      prefix: 'D',
      labels: [
        { id: 'D1',  x: 0.50, y: 0.08, note: 'Top public walkway / exterior frontage' },
        { id: 'D2',  x: 0.18, y: 0.26, note: 'Upper-left storage / back office' },
        { id: 'D3',  x: 0.43, y: 0.23, note: 'Upper-middle workroom / lab' },
        { id: 'D4',  x: 0.70, y: 0.24, note: 'Classroom / dorm-like room' },
        { id: 'D5',  x: 0.86, y: 0.16, note: 'VTOL / drone pad' },
        { id: 'D6',  x: 0.45, y: 0.47, note: 'Central open hall' },
        { id: 'D7',  x: 0.49, y: 0.56, note: 'Central planter / cover point' },
        { id: 'D8',  x: 0.38, y: 0.64, note: 'Elevator / lift core' },
        { id: 'D9',  x: 0.55, y: 0.69, note: 'Stairwell' },
        { id: 'D10', x: 0.72, y: 0.59, note: 'Right-side patient rooms' },
        { id: 'D11', x: 0.20, y: 0.72, note: 'Lower-left lounge / common room' },
        { id: 'D12', x: 0.71, y: 0.76, note: 'Lower-right treatment / recovery rooms' },
        { id: 'D13', x: 0.50, y: 0.92, note: 'South exterior entrance' }
      ]
    }
  };

  function gmLabelKeyForPage(pageid, floorKey) {
    return 'SB-GM-' + floorKey + '-';
  }

  function selectedMapGraphic(msg) {
    var graphics = selectedGraphics(msg);
    if (!graphics.length) return null;
    return graphics[0];
  }

  function labelPositionOnMap(mapGraphic, point) {
    var left = Number(mapGraphic.get('left')) || 0;
    var top = Number(mapGraphic.get('top')) || 0;
    var width = Number(mapGraphic.get('width')) || 0;
    var height = Number(mapGraphic.get('height')) || 0;

    return {
      x: left - (width / 2) + (width * point.x),
      y: top - (height / 2) + (height * point.y)
    };
  }

  function createGmLabels(msg, floorKey, dryRun) {
    var def = GM_LABELS[floorKey];
    if (!def) {
      sendChat('Signal Bleed', '/w gm Unknown floor for GM labels: <code>' + esc(floorKey || '') + '</code>. Use floor-a, floor-b, floor-c, or floor-d.');
      return;
    }

    var mapGraphic = selectedMapGraphic(msg);
    if (!mapGraphic) {
      sendChat('Signal Bleed', '/w gm Select the map image on the MAP layer, then run <code>' + COMMAND + ' --gm-labels ' + esc(floorKey) + '</code>.');
      return;
    }

    var pageid = mapGraphic.get('_pageid') || mapGraphic.get('pageid');
    var lines = [];
    lines.push((dryRun ? 'Would create ' : 'Created ') + def.labels.length + ' GM-layer labels for <b>' + esc(def.name) + '</b>.' + (dryRun ? ' Default style: white 44px text with black outline.' : ''));

    def.labels.forEach(function (p) {
      var pos = labelPositionOnMap(mapGraphic, p);
      lines.push('<b>[' + esc(p.id) + ']</b> at x=' + Math.round(pos.x) + ', y=' + Math.round(pos.y) + ' — ' + esc(p.note));

      if (!dryRun) {
        var labelText = '[' + p.id + ']';
        var size = parseOptionInt(msg.content, '--label-size', 44, 18, 96);
        var color = parseOptionColor(msg.content, '--label-color', '#FFFFFF');
        var outlineColor = parseOptionColor(msg.content, '--outline-color', '#000000');
        var outlineOffset = Math.max(2, Math.round(size / 14));

        if (!wantsNoOutline(msg.content)) {
          [
            [-outlineOffset, -outlineOffset],
            [0, -outlineOffset],
            [outlineOffset, -outlineOffset],
            [-outlineOffset, 0],
            [outlineOffset, 0],
            [-outlineOffset, outlineOffset],
            [0, outlineOffset],
            [outlineOffset, outlineOffset]
          ].forEach(function (off) {
            createObj('text', {
              _pageid: pageid,
              pageid: pageid,
              layer: 'gmlayer',
              left: pos.x + off[0],
              top: pos.y + off[1],
              text: labelText,
              font_size: size,
              color: outlineColor,
              rotation: 0
            });
          });
        }

        createObj('text', {
          _pageid: pageid,
          pageid: pageid,
          layer: 'gmlayer',
          left: pos.x,
          top: pos.y,
          text: labelText,
          font_size: size,
          color: color,
          rotation: 0
        });
      }
    });

    sendChat('Signal Bleed', '/w gm ' + lines.join('<br>'));
  }

  function clearGmLabels(msg, floorKey, dryRun) {
    var def = GM_LABELS[floorKey];
    if (!def) {
      sendChat('Signal Bleed', '/w gm Unknown floor for GM labels: <code>' + esc(floorKey || '') + '</code>. Use floor-a, floor-b, floor-c, or floor-d.');
      return;
    }

    var mapGraphic = selectedMapGraphic(msg);
    if (!mapGraphic) {
      sendChat('Signal Bleed', '/w gm Select any graphic on the target page, preferably the map image, then run <code>' + COMMAND + ' --clear-gm-labels ' + esc(floorKey) + '</code>.');
      return;
    }

    var pageid = mapGraphic.get('_pageid') || mapGraphic.get('pageid');
    var wanted = {};
    def.labels.forEach(function (p) { wanted['[' + p.id + ']'] = true; });

    var textObjs = findObjs({ _type: 'text', _pageid: pageid, layer: 'gmlayer' }) || [];
    var matches = textObjs.filter(function (t) {
      return wanted[t.get('text') || ''];
    });

    if (!dryRun) {
      matches.forEach(function (t) { t.remove(); });
    }

    sendChat('Signal Bleed', '/w gm ' + (dryRun ? 'Would remove ' : 'Removed ') + matches.length + ' GM labels for <b>' + esc(def.name) + '</b>.');
  }

  function gmLabelFloorFromContent(content, flag) {
    var re = new RegExp(flag + '\\s+(floor-[a-d])');
    var m = String(content || '').match(re);
    return m ? m[1] : '';
  }



  function findCharacterByExactNameForTokenNormalize(name) {
    var chars = findObjs({ _type: 'character', name: name }) || [];
    return chars.length ? chars[0] : null;
  }

  function normalizeDefaultTokenSizeForCharacter(character, tokenSize, dryRun) {
    var raw = character.get('defaulttoken');
    if (!raw) {
      return { status: 'missing', name: character.get('name') };
    }

    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return { status: 'bad-json', name: character.get('name') };
    }

    parsed.width = tokenSize;
    parsed.height = tokenSize;
    parsed.represents = character.id;

    if (!dryRun) {
      character.set('defaulttoken', JSON.stringify(parsed));
    }

    return { status: 'updated', name: character.get('name') };
  }

  function normalizeNpcDefaultTokenSizes(msg, dryRun) {
    var tokenSize = parseTokenSize(msg.content);
    var onlyMatch = String(msg.content || '').match(/--only\s+(.+)$/);
    var wantedName = onlyMatch ? onlyMatch[1].trim().replace(/^"|"$/g, '') : '';

    var targets = [];

    if (wantedName) {
      var ch = findCharacterByExactNameForTokenNormalize(wantedName);
      if (!ch) {
        sendChat('Signal Bleed', '/w gm No character found named <code>' + esc(wantedName) + '</code>.');
        return;
      }
      targets.push(ch);
    } else {
      NPCS.forEach(function (npc) {
        var ch = findCharacterByExactNameForTokenNormalize(npc.name);
        if (ch) targets.push(ch);
      });
    }

    var counts = { updated: 0, missing: 0, bad: 0 };
    var lines = [];
    lines.push((dryRun ? 'Would normalize ' : 'Normalized ') + targets.length + ' NPC default token sizes to <b>' + tokenSize + '×' + tokenSize + ' px</b>.');
    lines.push('This changes only saved default-token width/height. It does not change token artwork.');

    targets.forEach(function (ch) {
      var r = normalizeDefaultTokenSizeForCharacter(ch, tokenSize, dryRun);
      if (r.status === 'updated') {
        counts.updated += 1;
        lines.push('OK: ' + esc(r.name));
      } else if (r.status === 'missing') {
        counts.missing += 1;
        lines.push('No default token: ' + esc(r.name));
      } else {
        counts.bad += 1;
        lines.push('Could not parse default token JSON: ' + esc(r.name));
      }
    });

    lines.push('<br><b>Summary:</b> updated=' + counts.updated + ', missing=' + counts.missing + ', bad-json=' + counts.bad);
    sendChat('Signal Bleed', '/w gm ' + lines.join('<br>'));
  }



  function characterByIdForSelectedToken(id) {
    if (!id) return null;
    var ch = getObj('character', id);
    return ch || null;
  }

  function normalizeSelectedPlacedTokens(msg, dryRun) {
    var tokenSize = parseTokenSize(msg.content);
    var graphics = selectedGraphics(msg);

    if (!graphics.length) {
      sendChat('Signal Bleed', '/w gm Select one or more already-placed NPC tokens first, then run <code>' + COMMAND + ' --normalize-selected-tokens --dry-run</code>.');
      return;
    }

    var lines = [];
    lines.push((dryRun ? 'Would normalize ' : 'Normalized ') + graphics.length + ' selected placed token(s) to <b>' + tokenSize + '×' + tokenSize + ' px</b>.');
    lines.push("This uses the selected token artwork itself and the token's existing Represents Character value. It does not use staging-page order or names.");

    graphics.forEach(function (g) {
      var rep = g.get('represents');
      var ch = characterByIdForSelectedToken(rep);
      var nm = g.get('name') || '(unnamed token)';
      var detail = esc(nm);

      if (ch) {
        detail += ' → ' + esc(ch.get('name'));
      } else {
        detail += ' → no represented character';
      }

      lines.push(detail);

      if (!dryRun) {
        g.set('width', tokenSize);
        g.set('height', tokenSize);

        if (ch && typeof setDefaultTokenForCharacter === 'function') {
          setDefaultTokenForCharacter(ch, g);
        } else if (ch) {
          try {
            var tokenJSON = g.toJSON();
            tokenJSON.width = tokenSize;
            tokenJSON.height = tokenSize;
            tokenJSON.represents = ch.id;
            ch.set('defaulttoken', JSON.stringify(tokenJSON));
          } catch (e) {
            // keep resizing the placed token even if default token setting fails
          }
        }
      }
    });

    sendChat('Signal Bleed', '/w gm ' + lines.join('<br>'));
  }


  function handle(msg) {
    if (msg.type !== 'api') return;
    if (msg.content.indexOf(COMMAND) !== 0) return;

    var dryRun = msg.content.indexOf('--dry-run') !== -1;
    var overwrite = msg.content.indexOf('--overwrite') !== -1;

    if (msg.content.indexOf('--normalize-selected-tokens') !== -1) {
      normalizeSelectedPlacedTokens(msg, dryRun);
      return;
    }

    if (msg.content.indexOf('--normalize-default-token-size') !== -1) {
      normalizeNpcDefaultTokenSizes(msg, dryRun);
      return;
    }

    if (msg.content.indexOf('--name-selected') !== -1) {
      nameSelectedGraphics(msg, dryRun);
      return;
    }

    if (msg.content.indexOf('--gm-labels') !== -1) {
      createGmLabels(msg, gmLabelFloorFromContent(msg.content, '--gm-labels'), dryRun);
      return;
    }

    if (msg.content.indexOf('--clear-gm-labels') !== -1) {
      clearGmLabels(msg, gmLabelFloorFromContent(msg.content, '--clear-gm-labels'), dryRun);
      return;
    }

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
