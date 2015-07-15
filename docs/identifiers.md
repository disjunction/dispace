## Dispace Identifiers

### uidGenerator conventins

 * Identifiers contains base64 symbols (including + and /), and additionally "_" and ":"
 * Default prefix contains one char
 * If prefix has 3 letters, then it's preceeded additionally with '.'
 * redundant chars are filled with +
 * non-generated ids should contain underscore, e.g. 'p_shared'
 * in combined ids the first-level objects can be separated using colon, e.g. "sAAA:wz123"

### Global

 * Player: "p"
 * Sibling: "s"

### Starmap

 * Universe: ".uni"
 * Star System: ".ss+"
 * Star: ".st+"
 * Planet: ".pl+"
 * Region: ".re+"

### Field

 * Field things: "f"
 * Local field things: "l"
 * Avatars: "a"
 * Will: "w"
 * Quests: "q"
