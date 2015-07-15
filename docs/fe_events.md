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

Other events:

 * controlRover - turret rotation
 * hit
 * inert
 * injectAvatar
 * injectQuest
 * injectThing
 * injectSibling
 * interstate
 * moveThing
 * questUpdate
 * removeThing
 * ownInterstate - client-side interstate
 * shot
 * teff
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
