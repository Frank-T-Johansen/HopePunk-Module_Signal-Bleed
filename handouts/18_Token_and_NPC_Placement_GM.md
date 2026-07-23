# Token and NPC Placement: GM Draft

## Can tokens be scripted onto maps automatically?

Technically, a Roll20 Mod/API script can create tokens on pages, but it is not the right first step here.

To place tokens automatically, the script needs:

- exact Roll20 page IDs
- exact token coordinates
- token image URLs already uploaded/available in Roll20
- map dimensions and scale
- decisions about which tokens start hidden, visible, or on the GM layer

The API cannot reliably upload local image files into your Roll20 Art Library.

For this draft, use the importer to create NPC character entries and handouts. Place map tokens manually after uploading art.

## Recommended placement workflow

1. Upload the map image.
2. Create a Roll20 page for the map.
3. Put the map image on the **MAP** layer.
4. Add GM labels, hidden NPCs, and clue markers on the **GM** layer.
5. Add visible PCs, NPCs, and creatures on the **TOKENS** layer.
6. Use Hide/Reveal Mask or Fog of War to reveal the playable space.
7. Use this handout and `data/signal_bleed_token_manifest.json` as the placement guide.

## Token visibility convention

```text
Visible: Players can see the token at scene start.
Delayed: Do not place until the NPC enters the scene, or keep on GM layer.
Hidden: Place on GM layer or do not place until discovered.
Conditional: Only appears if the relevant event happens.
Clue marker: GM-layer text note or small icon. Not a creature token.
```

## Marker convention

Use short GM-layer text labels for clues.

Examples:

```text
[B8 NOTEBOOK]
[B8 OLD BURNS]
[D8 OLD NEST]
[D9 ESCAPE VECTOR]
[D13 ACTIVE NEST]
[D7 DRAG MARKS]
```

Do not put clue markers on the TOKENS layer unless the players should see the object immediately.

## Floor A — Mercy Twelve Clinic

### Starting visible tokens

- **Senior Nurse Imani Cho** — A8 Front Desk / Patient Check-in, or A7 Central Waiting Hall.
- **Orderly Pax Ruun** — A6 Emergency Intake Bay.
- **Nox “Bluewire” Kade** — A6 Emergency Intake, A7 Central Waiting Hall, or A13 Service Corridor.
- **Redline Lookout Pair** — A1 Indoor Street or A13 Service Corridor.
- **Worried Parent** — A7 Central Waiting Hall or A8 Front Desk area.
- **Clinic patients / civilians** — A7 Central Waiting Hall, A8 Front Desk area, and A11 Patient Rooms as needed.

### Delayed or GM-layer tokens

- **Dr. Sera Valez** — A3 Surgical / Treatment Room, A5 Office / Records, or A8 Front Desk if she enters to de-escalate.
- **Mara “Mother Red” Vey** — A1 Indoor Street or A13 Service Corridor; enter when negotiation escalates.
- **Commander Ilan Rusk** — start off-map or at A1 concourse edge.
- **Corporate Drone** — A1 public concourse, if corp pressure is visible.
- **Clinic Security Monitor / Rafa Mbeki** — A5 Office / Records, or behind A8 Front Desk if clinic camera access matters.

## Floor B — Repurposed Recovery & Support Ward

### Placement note

Use the visual map over older label text.

If B9 reads as elevator / lift access on the actual map, do not use it as a counselor office. Place counselling, spiritual support, and quiet interviews in the small room left of B6 or in the B7 recovery/support area instead.

B8 is the sealed isolation ward and old corporate experiment site. It should usually start empty of visible NPCs, but it can contain clue markers, damage markers, and the hidden recovered notebook.

### Starting visible tokens

- **Keet** — B6 Central Support Corridor / workshop area, or B7 Short-Stay Recovery / family support rooms.
- **Miri and Sol** — B7 Short-Stay Recovery / family support rooms, if used as child witnesses.
- **Sister Luma** — quiet consultation room left of B6, or B7 Short-Stay Recovery / counselling rooms.
- **Clinic Staff / Automated Nurse / Generic Patient tokens** — B2 Procedure / Extended-Care Room, B7 Short-Stay Recovery / counselling rooms, or B12 Staff Rest / Overnight Support Room as needed.
- **Food Line Volunteer / Aid Coordinator** — B4 Staff Intake / aid coordination room, or B6 Central Support Corridor.
- **Redline Supply Runner / Vex Tan** — B6 Central Support Corridor, B10 Stairwell / Vertical Access, or B11 Lower Exterior / Service Access.
- **Talla “Auntie’s Eyes” Vey** — B4 Staff Intake / aid coordination room or B6 Central Support Corridor if the aid-network secret is active.

### Delayed or GM-layer tokens

- **Mara “Mother Red” Vey** — B4 Staff Intake / aid coordination room, or B6 Central Support Corridor if the PCs discover her hidden support.
- **Juno “Switch” Hale / Redline Camera Sitter** — B3 Medical Records / Monitoring Equipment, or remote feed access.
- **Corporate observer** — B1 Upper Public / Service Walkway, near lift access, or B5 exterior / landing-adjacent access if corporate pressure follows the PCs.
- **Narin Pell clue marker** — B8 Sealed Isolation Ward, B12 Staff Rest / Overnight Support Room, or the route between them.
- **Lala Mir clue marker** — B6 Central Support Corridor, B10 Stairwell / Vertical Access, or B11 Lower Exterior / Service Access.
- **Recovered Notebook marker** — hidden in B8 behind a loose wall or maintenance panel.
- **Old Burn-Pattern marker** — B8, visible after investigation or when PCs examine the ward closely.
- **Deleted Camera Log marker** — B3 monitoring equipment or B8 local camera terminal.

### B8 investigation markers

Use these as GM-layer notes rather than visible tokens at scene start.

- **Scorch marks** — under fresh wall coating or behind moved equipment.
- **Powered-armor entry damage** — door frame, bulkhead, or floor gouges.
- **Melted medical equipment** — evidence of incendiary cleanup.
- **Sterilized drain residue** — biological trace that survived cleaning.
- **Sealed service gap** — points toward the escape route of the Model 1s.
- **Recovered Notebook** — confirms the operation was deliberate and that small flying forms escaped.

### What B8 should reveal

B8 should not reveal the current hidden nest directly.

It should reveal:

- the corporation ran illegal Antithesis biological research here,
- the first nest formed here or in the connected quarantine system,
- researchers and staff died,
- corporate powered-armor teams burned the site clean,
- the corporation believed the primary nest was neutralized,
- and several Model 1s escaped before the cleanup was complete.

That points the PCs toward the real question:

> If B8 was burned out, where did the escaped Model 1s go?

## Floor C — Service / Utility

### Placement note

Floor C is now a service-route and missing-person clue floor, not the default current hidden nest location.

Use it to show how people, cameras, maintenance crews, and Redline routes connect the public support levels to Floor D.

### Starting visible tokens

- **Maintenance worker(s)** — C2 Loading Zone, C7 Workshop, or C9 Monitoring Office.
- **Redline Lookout Pair** — C1 Service Street or another Redline-controlled route.
- **Corporate Drone** — C1 Service Street or C10 Freight Lift if corp has compromised logistics.

### Delayed or GM-layer tokens

- **Juno “Switch” Hale / Redline Camera Sitter** — C9 Monitoring Office, or remote-only.
- **Corporate Feed Handler / Orlan Pike clue** — C9 Monitoring Office, if you want a double-allegiance reveal.
- **Bex Aranda clue marker** — C1 Service Street, C9 Monitoring Office footage, or service-gap evidence.
- **Oskar Venn clue marker** — C6 HVAC / Air Handling or C7 Workshop. Tool cart, radio log, and drag marks.
- **Maintenance access marker** — points from Floor C service infrastructure toward Floor D D9/D11.

### Antithesis use on Floor C

Do not place the active nest here by default.

Possible foreshadowing:

- **Distant clicking marker** — GM-layer note near a service shaft.
- **Organic residue marker** — GM-layer note in C6, C9, or C12.
- **Juvenile Model 3 glimpse** — delayed/conditional only; it retreats toward Floor D.
- **Model 1 movement trace** — footage or sound, not necessarily a visible fight.

Floor C should point toward Floor D rather than ending the mystery.

## Floor D — Quarantine Incident / Hidden Nest

### Placement note

Floor D is the main active hidden-nest floor.

The old destroyed nest remains are in **D8 Containment Chamber**. The active second nest is deeper on the same floor, usually connected through **D9 Service Bypass**, **D11 Emergency Stair / Ladderwell**, or a hidden cavity/infested zone the GM may label **D13 Active Hidden Nest**.

The floor should be partially infested: enough to feel dangerous, but not so obvious that the players see the entire nest immediately.

### Starting visible human tokens

Usually none, unless the PCs arrive during the incident.

Possible visible tokens if they arrive before full breach:

- **Signal-Touched Patient / Exposed Patient** — D7 Patient Holding Rooms.
- **Clinic technician** — D5 Diagnostics Lab or D6 Control Room.
- **Dr. Vela Myung** — D5 Diagnostics Lab or D7 Patient Holding Rooms if she is trapped or treating someone.
- **Corporate Recovery Pair** — D3 Central Incident Hall or D6 Control Room if corp got there first.
- **Clinic Staff / Automated Nurse / Generic Patient tokens** — D7 Patient Holding Rooms or D12 NightCrash Arrival Route if evacuation has begun.

### Delayed or GM-layer human tokens

- **Commander Ilan Rusk** — D6 Control Room, D8 Containment Chamber entrance, or off-map until corporate pressure escalates.
- **Lt. Varya Senn** — D3 Central Incident Hall, D8 approach, or D9 if the tactical fight escalates.
- **Mara Silex** — D5 Diagnostics Lab or D7 Patient Holding Rooms if you want the corporate medic / possible informant angle.
- **Orlan Pike** — D6 Control Room or remote-only if the camera/log manipulation thread is active.
- **Halden Rook evidence marker** — D6 Control Room logs and deleted annotations.
- **NightCrash** — D1/D12 emergency arrival route if emergency intervention is needed, or after the climax as recognition/extraction.
- **The Siren Saint** — D1 or the Floor B landing pad, depending on current map setup.
- **Gurney Angels** — D12 NightCrash Arrival Route, moving toward D7, D3, or D13 if evacuation begins.

### Evidence markers

Place these as GM-layer text notes.

- **[D5 RELAY / TRIAL RECORDS]** — diagnostics and patient-trial data.
- **[D6 HALDEN LOG]** — footage of Model 1s leaving the old nest in formation.
- **[D6 DELETED RISK TAG]** — “nest-seeding possibility.”
- **[D8 OLD NEST REMAINS]** — destroyed visible nest.
- **[D8 CLEANUP BURNS]** — powered-armor / incendiary cleanup.
- **[D9 ESCAPE VECTOR]** — Model 1s fled through this route.
- **[D7 DRAG MARKS]** — current Model 3 hunting pattern.
- **[D11 FLANK ROUTE]** — emergency stair / ladderwell movement.
- **[D13 ACTIVE NEST]** — hidden until discovered.

### Antithesis starting state

Use the GM layer for hidden creatures until the PCs discover or trigger them.

Recommended default:

- **Old Nest Remains** — D8 Containment Chamber. Environmental marker, not an active creature.
- **Model 1 Juvenile** — hidden near D9 Service Bypass.
- **Model 1 Juvenile** — hidden near D3/D4 transition.
- **Model 1 Juvenile** — hidden near D13 Active Hidden Nest.
- **Model 1 Juvenile** — optional extra near D11 if you want stronger infestation pressure.
- **Model 1 Adolescent** — hidden near D13 Active Hidden Nest.
- **Model 1 Seed Clump / Active Nest Core** — D13 Active Hidden Nest.
- **Juvenile Model 3** — roaming hunter between D7, D9, D11, and D13.
- **Juvenile Model 3** — optional second hunter near D11 or D13.
- **Mote Swarm** — optional pressure in D3, D8, or the D9 approach.

Hard version:

- Add one extra **Juvenile Model 3**.
- Add one **Model 3 Adolescent** as a boss / defender.
- Increase rescue pressure rather than only increasing enemy count.

Do not use by default:

- **Model 3 Adult** — campaign-scale threat; use only as unfinished emergence, countdown, or later-campaign problem.

### Suggested reveal sequence

1. PCs enter Floor D and encounter clean quarantine architecture.
2. D5/D6 reveal sanitized records, deleted footage, and the relay’s evidence.
3. D8 reveals the destroyed old nest and corporate cleanup.
4. D9 reveals the Model 1 escape vector.
5. D7/D11 show current drag marks and hunting activity.
6. Model 1s appear first as movement, noise, and swarm pressure.
7. A Juvenile Model 3 attacks, retreats, or drags prey toward the nest.
8. PCs discover D13 Active Hidden Nest.
9. Finale choice: destroy, contain, rescue, extract evidence, or survive long enough for help.

## Schoolchildren overheard conversation

Use **Miri and Sol** to reveal “Auntie Red” naturally.

Possible overheard lines:

> “Auntie Red paid for breakfast again.”
>
> “Don’t call her that where grown-ups hear.”
>
> “Why?”
>
> “Because she gets mad when people know she’s nice.”

If the PCs interact kindly, the children can clarify:

- Mara sends food through people who pretend it came from somewhere else.
- Adults act scared when children call her Auntie Red.
- Bluewire used to bring crates and joke with them, but now he scares them.
- Keet saw something important but is trying to act brave.

## Control room NPCs

### Clinic Security Monitor / Rafa Mbeki

Use as a cooperation point, not just a hacking obstacle.

They can provide:

- camera lookups
- door logs
- patient movement records
- elevator use records
- emergency intake footage
- partial recovery-wing access with privacy limits

They cooperate if:

- Dr. Valez approves
- PCs help patients
- PCs avoid threatening staff
- PCs explain a concrete safety reason

### Redline Camera Sitter / Juno “Switch” Hale

Unofficial, patched-together, and more capable than expected.

They can provide:

- side corridor feeds
- street approach feeds
- blind spot locations
- gang lookout reports
- hidden supply-route footage

They cooperate if:

- Mara approves
- PCs treat the Redline Choir as a community actor
- PCs need footage to protect locals
- PCs offer concrete reciprocity

Possible additional allegiance:

The Redline Camera Sitter may also be selling selected feed access to corporate recovery, not out of ideology, but to pay for medicine, debt, or family protection.

This should be discoverable and negotiable, not an automatic betrayal fight.

## Named NPC placement index

### Mercy Twelve / clinic side

- **Dr. Sera Valez** — Floor A A8, A7, A3, or A5. Delayed or GM-layer unless she is briefing the PCs.
- **Dr. Vela Myung** — Floor A A3, Floor D D5, or D7.
- **Senior Nurse Imani Cho** — Floor A A8, A7, or A6.
- **Orderly Pax Ruun** — Floor A A6 or A11.
- **Rafa Mbeki** — Floor A A5/A8, Floor B B3, or Floor D D6 if feeds matter.
- **Sister Luma** — Floor B quiet consultation room left of B6, or B7.

### Redline Choir / community side

- **Mara “Mother Red” Vey** — Floor A A1/A13 if negotiation escalates; Floor B B4/B6 if PCs discover her aid network. Usually delayed or GM-layer.
- **Nox “Bluewire” Kade** — Floor A A6/A7/A13.
- **Juno “Switch” Hale** — Floor B B3, Floor C C9, or remote-only.
- **Vex Tan** — Floor B B6/B10/B11.
- **Rook “Mads” Madsen** — Floor A A1/A13 or Floor C C1 service approach.
- **Talla “Auntie’s Eyes” Vey** — Floor B B4/B6.
- **Bex Aranda** — absent. Use clue marker in C1/C9 footage or service-route evidence.
- **Laleh “Lala” Mir** — absent. Use clue marker in B6/B10/B11.
- **Miri and Sol** — Floor B B7.
- **Keet** — Floor B B6 or B7.

### Corporate Recovery

- **Commander Ilan Rusk** — delayed/off-map until corporate pressure enters; Floor D D6/D8 or Floor A entrance if confrontation happens early.
- **Lt. Varya Senn** — Floor D D3/D8/D9 or Floor C service entry if tactical pressure escalates.
- **Orlan Pike** — Floor D D6, Floor B B3, or remote-only.
- **Mara Silex** — Floor D D5/D7; possible informant angle.
- **Halden Rook** — absent/dead/missing. Use evidence marker in D6 logs and relay records.

### Missing-person / evidence NPCs

- **Oskar Venn** — absent. Use clue marker in Floor C HVAC / service infrastructure.
- **Narin Pell** — absent or possible rescue victim. Use clue marker in Floor B B8/B12 route or Floor D nest approach.
- **Tamsin Quill** — Floor A emergency intake / clinic start, or off-map/incapacitated after delivering the relay.

### Samurai / emergency response

- **Florence “NightCrash” Vale** — Floor D D1/D12 if emergency intervention is needed, otherwise post-finale cameo.
- **The Siren Saint** — Floor B landing pad or Floor D D1 access, depending on map setup.
- **Gurney Angels** — Floor D D12 NightCrash Arrival Route.

### Antithesis

- **Old Nest Remains** — Floor D D8.
- **Model 1 Seed Clump / Active Nest Core** — Floor D D13.
- **Model 1 Juveniles** — Floor D D9/D13, with one possible early glimpse near D3/D4.
- **Model 1 Adolescent** — Floor D D13, optional stronger nest defender.
- **Mote Swarm** — Floor D D3/D8/D9 as pressure.
- **Juvenile Model 3** — Floor D D7/D9/D11/D13, roaming hunter.
- **Model 3 Adolescent** — optional boss / hard-mode defender.
- **Model 3 Adult** — do not use in normal starter unless as unfinished emergence or timer.

## Token art still needed

Priority token art:

1. NightCrash portrait/token
2. The Siren Saint vehicle token
3. Gurney Angels stretcher-drone token
4. Dr. Sera Valez
5. Mara “Mother Red” Vey
6. Bluewire
7. Commander Rusk
8. Mote Swarm
9. Redline Lookout / underling
10. Clinic staff / patient / civilian groups
11. Model 1 Juvenile
12. Juvenile Model 3
13. Model 1 Seed Clump / Active Nest Core
