# Thing Effects (teff)

Thing effect is a generic way to set different flag on a Thing.
The flag settings are stacked, so if one sets flag "some" twice,
then it has also to be removed twice to make an affect.

Effects are set by firing an event "teff".

The event is transferred to client via "fev" with type=teff

Effects in dispace:

 * explode - (visual effect)
 * inert - a lander cannot be controlled
 * invuln - invulnerability
 * shooting - used for weaponLock param to prevent simultaneous firing
 * spawn - (visual effect)


 ## inert
 
 isControlled() depends on this effect and removed flag.
 Removed things cannot be controlled.

 ## invuln

 Invulnerability. This is set while spawning and on explode.

 isInvuln() method also checks for removed flag.
 Removed things are considered always invulnerable

 ## shooting

 the effect is set for weaponLock period on a thing.
 While having shooting effect, the weapons cannot be fired
