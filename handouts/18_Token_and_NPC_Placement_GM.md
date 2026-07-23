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
3. Disable visible Roll20 grid for current AI playtest maps.
4. Add Dynamic Lighting walls/doors.
5. Upload or create NPC/token art.
6. Place starting NPCs manually.
7. Put hidden/conditional NPCs on the GM layer.
8. Use this handout and `data/signal_bleed_token_manifest.json` as the placement guide.

## Token visibility convention

```text
Visible:
Players can see the token at scene start.

Delayed:
Do not place until the NPC enters the scene, or keep on GM layer.

Hidden:
Place on GM layer or do not place until discovered.

Conditional:
Only appears if the relevant event happens.
```

## Floor A — Mercy Twelve Clinic

### Starting visible tokens

- **Senior Nurse Imani Cho** — A3 Reception and Waiting Area or A5 Triage Desk.
- **Orderly Pax Ruun** — A6 Emergency Intake Bay.
- **Nox “Bluewire” Kade** — A14 Bluewire’s Pacing Route, near A6/A7/A13.
- **Redline Lookout Pair** — A1 Indoor Street or A13 Service Corridor.
- **Worried Parent** — A3 Waiting Area.
- **Clinic patients / civilians** — A3 Waiting Area and A9 Recovery Wing as needed.

### Delayed or GM-layer tokens

- **Dr. Sera Valez** — A5 Triage Desk or A10 Staff Office / Records.
- **Mara “Mother Red” Vey** — A1 Indoor Street or A13 Service Corridor; enter when negotiation escalates.
- **Commander Ilan Rusk** — start off-map or at A1 concourse edge.
- **Corporate Drone** — A1 public concourse, if corp pressure is visible.
- **Clinic Security Monitor** — A10 Staff Office / Records or security alcove.

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
- **Redline Supply Runner** — B6 Central Support Corridor, B10 Stairwell / Vertical Access, or B11 Lower Exterior / Service Access.

### Delayed or GM-layer tokens

- **Mara “Mother Red” Vey** — B4 Staff Intake / aid coordination room, or B6 Central Support Corridor if the PCs discover her hidden support.
- **Redline Camera Sitter** — B3 Medical Records / Monitoring Equipment, or remote feed access.
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
- the first nest formed here,
- researchers and staff died here,
- corporate powered-armor teams burned the site clean,
- the corporation believed the primary nest was neutralized,
- and several Model 1s escaped before the cleanup was complete.

That points the PCs toward the real question:

> If B8 was burned out, where did the escaped Model 1s go?

## Floor C — Service / Utility

### Starting visible tokens

- **Maintenance worker(s)** — C2 Loading Zone, C7 Workshop, or C9 Monitoring Office.
- **Redline Lookout Pair** — C1 Service Street or C12 Signal Interference Node if the gang controls the route.
- **Corporate Drone** — C1 Service Street or C10 Freight Lift if corp has compromised logistics.

### Delayed or GM-layer tokens

- **Redline Camera Sitter** — C9 Monitoring Office.
- **Corporate Feed Handler** — C9 Monitoring Office, if you want a double-allegiance reveal.
- **Mote Swarm traces** — C12 Signal Interference Node, only as foreshadowing before the breach.

## Floor D — Quarantine / Incident Floor

### Starting visible tokens

Usually none, unless the PCs are already responding to the incident.

Possible visible tokens if they arrive before the breach:

- **Signal-Touched Patient** — D7 Patient Holding Rooms.
- **Clinic technician** — D5 Diagnostics Lab or D6 Control Room.
- **Corporate Recovery Pair** — D3 Central Hall or D6 Control Room if corp got there first.

### Conditional tokens

- **Mote Swarm** — D8 Containment Chamber or D3 Central Incident Hall when breach begins.
- **NightCrash** — D1 Landing Corner if emergency intervention is needed, or post-finale elsewhere.
- **The Siren Saint** — D1 Landing Corner when NightCrash arrives.
- **Gurney Angels** — D12 NightCrash Arrival Route.

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

### Clinic Security Monitor

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

### Redline Camera Sitter

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

The Redline Camera Sitter may also be selling selected feed access to corporate recovery, not out of ideology, but to pay for medicine, debt, or family protection. This should be discoverable and negotiable, not an automatic betrayal fight.

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

## Updated Antithesis token placement

Use these additional tokens for the revised hidden-nest plot.

### Map B / Community Support

- **Miri & Sol** — B7 Children’s Corner. They reveal “Auntie Red” and Lala’s disappearance.
- **Lala Mir clue marker** — B10 Back Service Corridor. Spilled meal crates and service hatch.
- **Narin Pell clue marker** — B8 Shelter Dorm or B12 Emergency Stair. Bag, smear, possible rescue timer.

### Map C / Service Utility

- **Oskar Venn clue marker** — C6 HVAC / Air Handling. Tool cart, radio log, drag marks.
- **Juvenile Model 3** — C6 HVAC, C5 Water Recycling, C11 Stair, or C12 Hidden Maintenance Cavity.
- **Second Hidden Nest** — C12 Hidden Maintenance Cavity by default.
- **Model 1 Seed Clump** — inside the second hidden nest.
- **Bex Aranda clue marker** — C1 Service Street or C9 Monitoring Office footage.

### Map D / Incident Floor

- **Halden Rook evidence marker** — D6 Control Room logs.
- **Old Nest Remains** — D8 Containment Chamber.
- **Model 1 escape-vector marker** — D9 Service Bypass.

Do not place all Antithesis tokens at once. Start with missing-person clue markers, then a glimpse, then one Model 3 dragging a victim, then the hidden nest.
