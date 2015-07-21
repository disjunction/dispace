# GDD Dispace: Prelude

## Summary

'''Prelude''' is a training program for lander operators (pilots).
Player plays the role of such an operator, trying to get his diploma
as a certified interstellar lander operator.

The player controls a lander, looking like a tank, hovercraft or a buggy
in a 2d environment with top-down perspective.

The game provides a tree of scenarios to complete,
each simulating landing on some planet with a particular goal.
Additional multiplayer mode allows to simulate conflict situations,
when different factions compete to achieve their goals on the same planet.

Thus the gameplay is a set of short (unlockable) missions,
which player can select and play quickly (5-10 minutes) in browser, including Facebook,
gaining achievements, unlocking new missions and new vehicles.

Main activity:

 * **driving** - missions can be limited by time
 * **fighting** - a complicated rock-paper-scissors system (range, damage, speed, armor, energy)
 * **exploration** - worlds can be big, and finding "3 flowers" may become an adventure
 * **simple puzzles**, based on 2d physics''' - pushing boxes, using explosion impacts etc.
 * **simple stealths** - some missions can be completed by sneaking around the enemies,
   e.g. using cloak device

## Main Features

 * browser action game - no plugin needed, instantly playable
 * vehicles with multiple turrets controlled with LMB/RMB, and rotating independently
 * possibility to control the same (big) vehicle by 2 people: a driver and an arms operators
 * big variety of vehicles, weapons and special devices,
   making even the same missions a new challenge every time
 * browser multiplayer game - there still not many of the kind

## Technical

### Controls

Controls are quite complicated, making it not suitable for mobile phones.
It is the only reason, why the game will be playable only on desktops.
This is partially compensated by a parallel game "Wanderer" (see a separate GDD).

Already in demo:

 * WASD - for usual movement
 * RMB/LMB - shoot primary/secondary turret
 * O - respawn with the same lander

Still to be implemented:

 * Shift+RMB/LMB - lock turret on a target
 * F,G - use special devices like nitro, invisibility, invulnerability, healing etc.
 * E - interact with the nearest interactive device
 * L - (loot) collect all collectible items

### Game Mechanics

The missions should be interesting because of the flexibility of the mechanics the player can use.

E.g. to get to specific point behind a wall, the player may:

 * blast through the wall if he has a required firepower
 * use teleportation device
 * accomplish some quest to open a door

Weapons also work differently depending on their nature.
The reason is to make each weapon suitable for its purpose,
so that playing with all of them is fun. An example of strike vs. electric
weapons can be seen in the demo (see M29 C1 tank)

Even more important are special devices (not implemented in demo)

The devices give advantage/disadvantage for a short time. The planned devices are:

 * cloak device - invisibility
 * clone - a holo-clone (non-physical) of your vehicle is created
 * control paralyze  - enemy can't control his vehicle
 * control distortion - enemy vehicle moves randomly
 * control capture - you can control enemy's vehicle
 * nitro - speed boost for short time
 * slow-down - enemy vehicle and turret rotation slows down
 * reflector - received damage is reduced, sometime to zero
 * teleporter - teleport vehicle for short distances
 * trap - you can leave a trap behind you

## Game flow

### Screens

 1. Title = profile selection
 2. My Landers - list of unlocked Landers with details about their stats, weapons and devices
 3. Scenario tree = mission selection
 4. Scenario briefing
 5. Game itself
 6. Scenario bounty
 7. Multiplayer Lobby
 8. Multiplayer Round Finished

### Single Player Scenarios

In single player, you always play as a Federation pilot,
exploring new worlds or fighting/defending from the pirates.
You still experience using all vehicles,
because pirates just steal ones from Federation and repaint them.

 * Upon starting a mission you see a briefing screen, explaining what the mission is about
 * On this screen you see a list of vehicles which may be used for this mission (not all)
 * The not-yet-unlocked are shown grayed
 * The ones, which you used and completed the mission are marked somehow
 * Upon selecting the vehicle your vehicle appears in the world
 * On death - goto briefing screen
 * On accomplishing the mission you see Scenario Bounty screen, giving you info, what you have unlocked

### Multiplayer Scenario

Multiplayer is always Federation vs. Pirates

 * You go to Multiplayer Lobby, and select the game to join
 * TBD if faction is random or selectable
 * Upon selection you instantly appear in the game and select a vehicle like in Demo
 * in the end of the round you go to Multiplayer Round Finished screen with stats
 * Multiplayer Round Finished allows to click "Continue" to continue with the same people but another random mission

## Development

### Technology

All parts of are created with JavaScript, which allows to reuse code on client and server side,
and also easily mix the sub-games. It also allows porting the game to mobile devices in future.

 * cocos2d-x
 * Fabric.js (additional graphics, level design)
 * Knockout or AngularJS (in demo - Knockout)
 * box2d
 * node.js for game server
 * express (in demo, a quick PHP hack instead)
 * socket.io (m.b. replaced with sockJs)
 * mongodb

I can give a big presentation about all the concepts used behind,
especially about making a smooth online multiplayer game with physical simulation.

The game has been tested with 8 players on one map, still performing without any flaws.
I just haven't found more testers yet ;)

### Game Definitions

All objects, items, levels are defined as JSON,
using a common definition standard. So to see anything in a game
you just change the JSON and reload the page.

This allows:

 * instant balancing of vehicle and weapon stats (damage, energy etc.)
 * quick creation of variations of the same weapon (Plasma Cannon Mark1, Plasma Cannon Mark2, etc.)
 * quick design of the new components as long as they use existing mechanics
    * make new sprites
    * copy existing JSON
    * change them to point to the new sprites
    * do some stats balancing

For example the whole tank with rotating tracks, turrets, all its stats is just a bunch JSON definition.

### Level design

The levels on a low level are also JSON definitions.
The definition language allows inclusion of other JSON files,
so there will be a set of defined components, such as "house with a garden around", "a pyramid with treasure".
Which will be then planed in the main level JSON.

The level generator also supports procedurally generated environment,
this is used in the current demo.

After the level has been created,
you can start it in a single player mode, drive with some vehicle and change certain parts of it
in a "WYSIWYG" mode, e.g. move this hose a bit to the left, and add one more stone like that.

You can then serialize the level definition back to JSON and decide what you want ot do with that.

### Quests

The tasks, which have to be accomplished are separate from level, thus you can run
different tasks on the same map and vice versa.

Quests have a JS class behind, but all the parameters are exposed as JSON definition,
still easily editable. As an example in the demo the following params were exposed as follows:

    "quests": {
        "guildDrones": {
            "className": "QuestGuildDrones",
            "pointsPerDrone": 3,
            "pointsPerFoe": 1,
            "pointsPerFriend": -2,
            "pointsPerRespawn": -1,
            "time": 600
        }
    }


## Graphics

In general I'd like to keep simplistic design as it is now in demo.

As a example the M29 C1 tank is build on 5 assets:

 * shadow
 * track (same one for left and right)
 * hull
 * turret1
 * turret2

Animated parts:

 * track has 3 sprites animation (same sprites for back and forth)
 * each turret on firing has 4 sprites animation

All of it was drawn in Inkscape without and exported as is without any post-processing.
So creating an asset should be fast. I spent about 45 minutes per vehicle, as I did the current revamp.

### Graphics needed

 * A lot for weapons and vehicles, because the variety is one of the main features
 * The environment may stay rather schematic, because the idea is that it is a simulation

## Sound

 * The music should be ambient sci-fi
 * Effects rather cartoonish than realistic
 * Text-to-Speech may be used, because by th settings all characters are robots

## Schedule

 1. Short playable single player with a few missions
    * item collection and interaction
    * a couple of special devices, e.g. teleporter and reflector
    * all the screens except for multiplayer
    * a few level maps
    * a few mission quests
    * while working on it - test the multiplayer mode internally
 2. Integrate into Facebook, release
    * while integrating into facebook, do thorough testing/bugfix, as it will be a feature freeze
    * make some parts of the game hard to unlock, and make them unlockable for money?
 3. Add multiplayer
 4. Moar content (more of everything)
