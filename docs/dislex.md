Dislex is the dispace event-based communication protocol.

(stands for DISpace LEXicon)

## Dislex: field

### Handshake

    client: socket.emit('sup')
    server: socket.emit('initialField', serializedField)
    client: ??? m.b. we need a confirmation from client about field validity
    server: socket.emit('runScene', {sibling: serializedSibling})
    client: intilizes scene (expensive operation)
    client: socket.emit('readyForFeed')
    server: server starts sending feed messages, see below

### Dislex bundles

Bundles are messages units, presenting logically connected values.
Because they are standardized and not too numerous, it's OK to keep
them paranoidically small to save some traffic.

#### Phisics bundle

Arrya of 6 floats. Trailing zeros can be omitted.

    "p": [
         10.3434, // location x
         20.4543, // location y
         1.3546,  // a (rotation)
         7.2343, // lin. velocity x
         5.2433, // lin. velocity y
         2.3435, // angular velocity
    ]

#### Intersate bundle

Arrya of 6 floats. Trailing zeros can be omitted.

    "i": ["a", "l"], // in this example "accelerate" and "turn left"

### Serialized objects

#### thing

    "type": "obstacle" // (only in initial)
    "p": [phisicsBundle],
    "planSrc": "thing/obstacle/house4x4" // passed only in the initial serialization
    "i": ["a", "l"], // in this example "accelerate" and "turn left"

#### rover

Rover is a subclass of a thing, so it has all the fields of a thing + additional fields:

    "assemblyPlan": {full assembly plan}


### Feed Messages

Feed mesasge is pushed from server to client, as "f" event in socket.io.

Feed message normally has the following structure

    [type, payload, fe.simSum]

#### pup - phisics update

    ["pup", [
        ["thingId1", phisicsBundle]
        ["thingId2", phisicsBundle]
        ...
        ["thingIdN", phisicsBundle]
    ], fe.simSum]

#### iup - interaction update

    ["iup", [
        ["thingId", interactionBundle]
    ]]

#### rup - rover update

 * rotation direction and angles of the towers
 * guts changes

    ["rup", [
        ["thingId", {
            "t1": [angle, omega],
            "t2": [angle, omega],
        }]
    ]]


#### fev - field events

    ["fev", [
        [fevType, serialziedFev]
    ]]

Possible fevTypes:

 * gup - guts update, e.g. increase of energy
 * shot
 * hit
 * inert - thing getting / recovering from inert state
 * teff - thing effects
 * qup - see below

These different effects are in one "fev" message because they
are often generated simulataneously, e.g. by shooter, thus we could
in theory save traffic and improve consistency when passing them this way

The Server collects them during the simStep and fires onSimStepEnd (not entire loop!).


###### fev, fevType=qup -quest update

Usually full contents of the quest params are passed

    ["fev", [
        ["qup", [questId, {p1: v1, p2: v2, ... }]]
    ]]

###### fev, fevType=gup - guts update

    ["fev", [
        ["gup", [thingId, [gutsBundle]]]
    ]]


##### teff - thing effects

    ["teff", [thingId, ["+explode", "-shock"]]]

Possible effects:

 * spawn
 * explode

#### changes to collections in field

Following collections are supported:

 * things
 * siblings
 * avatars

Oprtations:

 * inject
 * remove

Sample:

    ["things", [
        ["thingId1", "inject", {serialziedThing} ],
        ["thingId2", "remove" ]
    ], fe.simSum]

### Client Messages (Activity)

Just like all feed messages are wrapped in "f" event,
all client-to-server messages are wrapped in "a" event

#### i - interstate

message is sent on change of the interstate. It would be normally then
followed by broadcast "iup" field message

    ["i", [interstateBundle], simSum]

#### w - will message

message reflects the will of a sibling to do something
Each will message gets an id (see identifiers.md)

The will message fields are quite verbose, as a player controls only one rover at a time,
so the client-side is relatively small

Protocol supports sending multiple will messages at once

    ["w", [
        ["willId1", "operation1", {params}],
        ["willId2", "operation2", {params}],
    ], simSum]

All will-messages have similar structures.

SimSum allows to record and reproduce the game

##### will operation: spawnRover

Spawns rover, creates a new Avatar for current Sibling and attaches it the new rover.
The old rover would be destroyed

    ["w", [
        ["wa", "spawnRover", {
            assemblySrc: "..."
        }]
    ], simSum]

##### will operation: controlRover

This is a client reaction on controlRover event, fired by Protagonist or AI.
This is done through the will, as it contains the explicit angle of the turret,
thus this needs to be validated.

Protagonist fires it at the end of it's step

    ["w", [
        ["wa", "controlRover", {
            thingId: "fABC",
            turret1: [1.3421, 0.1], // turret angle (aa), turret omega
            turret2: [0.3421, 0]
        }]
    ], simSum]
