## clex

'''clex''' (standing for "clear lexicon") is the set of dispace events dispatched in fe.fd.

Unlike dislex, optimized for transfer,
the '''clex''' gives performance and readability advantages,
by providing full field names and explicit object references

clex can be considered an "application" level protocal,
while dislex is a "transport" level

## Event List

FE loop:

 * loopCall
 * simCall
 * simStepCall
 * simStepEnd
 * simEnd
 * loopEnd

Client Events:
 * ownInterstate - client-side interstate
 * moveCamera - fired by Protagonist
 * sceneReady - once after all cocos-related stuff including camera and viewport is initialized

Master Events (not forwarded to clients):
 * respawn - respawning without being destroyed

Omni-Side Events:

 * controlRover - turret rotation
 * hit
 * inert
 * injectAvatar
 * injectField
 * injectModule - not used
 * injectQuest
 * injectSibling
 * injectThing
 * interstate
 * moveThing
 * updateQuest
 * removeAvatar
 * removeSibling
 * removeThing
 * shot
 * teff
 * teffChange - normally follows teff, if the state actually changed
 * will


## Detailed description

### will

dislex: w - will message

Describes a user wanting to do something.
The target destination would usually be the ModuleWillMaster,
but in remote mode it would be proxied through ModuleDispaceClient.

In other words, it is a client side representation of dislex will message.

It allows to use the same event firing mechanism independently of
type of the client side (local or remote), or even on server side.

Sample:

    {
        type: "will",
        operation: "spawnRover", // this corresponds one-to-one to dislex will operation
        sibling: sibling,
        params: {
            assemblyName: ...
        }
    }

### updateQuest, injectQuest

injectQuest for now has the same params as updateQuest

Sample:

    {
        type: "updateQuest",
        questId: "guildDrones",
        stats: {stats}
    }
