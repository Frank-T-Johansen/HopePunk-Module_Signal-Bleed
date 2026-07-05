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

## Floor B — Community Support / Shelter

### Starting visible tokens

- **Keet** — B6 Classroom or B7 Children’s Corner.
- **Miri and Sol** — B7 Children’s Corner or public street near B2.
- **Food Line Volunteers** — B4 Pantry / Aid Distribution.
- **Redline Supply Runner** — B4 Pantry or B10 Back Service Corridor.
- **Sister Luma** — B9 Counselor Offices or B3 Community Commons.

### Delayed or GM-layer tokens

- **Mara “Mother Red” Vey** — B4 Pantry or B10 Back Service Corridor if the PCs discover her hidden support.
- **Redline Camera Sitter** — B10 Back Service Corridor or remote feed access.
- **Corporate observer** — B1 Indoor Street if corp pressure follows the PCs.

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
