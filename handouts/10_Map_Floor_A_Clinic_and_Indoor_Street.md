# Map: Floor A — Mercy Twelve Clinic and Indoor Street

## Function

This is the primary starting map for Signal Bleed.

It represents Mercy Twelve Clinic’s public and emergency-access level inside the megacomplex. It is surrounded by broad indoor streets and pedestrian lanes, because the clinic is part of a dense vertical city rather than a standalone building.

## What the map shows

Key areas:

- indoor megacomplex streets around the clinic
- public front entrance
- reception / waiting area
- triage station
- emergency ambulance/service bay
- surgery / trauma rooms
- long-term treatment / recovery rooms
- pharmacy and supply rooms
- pediatric or community corner
- staff office or break area
- elevator core
- emergency stair / ladderwell

## Important circulation logic

The clinic has two different patient flows.

### Public flow

Civilians enter from the indoor street through the public front entrance.

They reach:

```text
street → reception/waiting → triage → treatment/recovery
```

Reception controls normal visitor intake, but it should not block medical movement through the building.

### Emergency flow

Ambulance or stretcher cases come through the non-public emergency bay.

They reach:

```text
emergency bay → triage/surgery/trauma → recovery rooms
```

This lets critical patients bypass the public waiting room.

### Recovery flow

From surgery/trauma, patients can be moved through internal corridors into long-term treatment and resting rooms.

The corridor structure matters. Staff should be able to move a patient from the back emergency intake to an operation/trauma room, and then onward to recovery, without dragging them through reception.

## Scenario use

Good scenes here:

- opening arrival
- gang underlings arguing with clinic staff
- Bluewire pacing near a restricted corridor
- Dr. Valez trying to keep everyone calm
- first signal pulse
- evacuation route planning
- corporate recovery team making demands from the public street
- civilians passing by and reacting to faction tension

## Faction positioning

### Clinic staff

Use reception, triage, recovery rooms, and supply rooms.

Clinic underlings should be cooperative but stressed.

### Redline Choir

Use the public street, side corridors, and maybe the area near the back entrance.

The gang should feel protective and possessive, but not automatically hostile.

### Corporate Recovery

Keep them outside or at the edge at first:

- across the indoor street
- near a service door
- watching from a kiosk
- using drones/cameras
- threatening to enter through emergency access

## Elevator and stair notes

The elevator is the practical route for patients, stretchers, and NightCrash’s Gurney Angels.

The stair/ladderwell is emergency access: good for PCs, bad for stretchers.

If the stairs look too ladder-like on the image, describe them as a steep maintenance stairwell built into the megacomplex core.
