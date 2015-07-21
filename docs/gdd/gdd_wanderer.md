# GDD Dispace: Wanderer

Please read GDD of Dispace:Prelude before reading on

## Summary

Wanderer is a standard browser game about exploring the world,
collecting resources, crafting and trading in space.

The time factor will be used here like in Farmville -
you'll need a specific time to excavate some resources,
or to accomplish a mission.

The player will be continuously returning to the game in Facebook,
to check what he got, give new tasks on current planet or fly to
a new a new planet.

The game is a preparation of the Dispace: Big Game, compensating
most of the parts missing in the Prelude.

 * you'll not select a mission from a tree, but actually fly to a planet,
   and act accordingly
 * you don't just unlock vehicles, but craft them on your mother-ship
   using the resources you collected
 * for multiplayer, not only lobby is available, but you can actually
   meet people as you travel

The game itself is partially inspired by physical board games.
It may be even possible to make one.


## Screens

 * Title = profile selection
 * Ship in Space
 * Ship Cargo
 * Crafting
 * My Landers (similar to Prelude)
 * Planet Details
 * Mission Progress
 * Report (on returning to game you get a report about all what happened)

## Controls

 * simple clicking and swiping, making game accessible on mobile
 * swiping can add additional feel, e.g. if you're on a ship screen, then:
    * swiping backward sends you to the previous planet
    * swiping to the right sends your ship to the new unexplored planet
    * swiping down gives Planet Details screen
    * swiping down from the planet screen sends your crew on a mission on surface

## Game Flow

 * initially you select one of the ships to become your new home
 * you select a scenario, e.g. "in search of lost treasure", "save us from pirates!"
 * you may create several profiles and thus play several scenarios with different ships in parallel
 * each scenario may take up to one month to complete, since a single mission on planet may take and hour
 * the destiny is predefined on start of the game - the list of the planets is just a linear list,
   but for each game the order is defined semi-randomly (of course boss-planet is always in the end)
 * player has the following options each "turn":
    * fly to the next or previous planet. If there is a mission running, there is an option to abandon it
    * send a mining mission if he has Robo-Miner(s)
    * send an adventure mission
    * craft new landers or devices for your ship
 * after having given the orders the player may just check the Mission Progress
 * as the game progresses, player obtains more landers and robo-miners, filling more of the time to manage it

## Technology

It will be based on the same technical stack as Dispace:Prelude, but there will be no physical simulation,
so the client will make rare requests to the server, no websockets or whatsoever needed.

Unlike Prelude this game will always persist the game state (in mongodb).

It will used (share) same game definition JSON file, extending it with the new objects such as Ship and Planet.


## Graphics

 * same style as in Prelude
 * Landers and devices may be directly borrowed from there
