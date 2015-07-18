# Cospeak

'''Cospeak''' is a json-based definition language used for "cosmos" resources.

Most of the resources are referrred as "plans"

Implementation is partially in Cospeak.js, and partially adhoc where it is used,
e.g. in flame/view/StateBuilder.js

## Basic plan elements

Point

    {x: 2, y: 3}
    [2, 3]

Size:

    {width: 2, height: 3}
    [2, 3]
    5 = {width: 5, height: 5}

## Things

Thing definition structure:

    {
        type: "...",
        states: {
            state1: {...},
            state2: {...}
            ...
        },
        body: {...},
        extensionModule1: {...},
        extensionModule2: {...},
        ...
    }

### Things: states

#### directive $include

If node is called "$include", then it's treated as a directive,
and the included node(s) will be added to the state

    "$include": {
        "planSrc": "thing/effect/transition/spawn",
        "state": "..." // by default current state will be used
    }

For multiple includes just use am array wrapper:

    "$include": [
        {"planSrc": "..."},
        {"planSrc": "..."},
    ]


#### extension viewhull

##### type=smartTrack

    {
        type: "smartTrack",
        leftTrack: {
            planSrc: "...",
        },
        rightTrack: {
            planSrc: "...",
        }
    }
