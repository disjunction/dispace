module.exports = {
    entity: {
        item: {
            Assembly: require('./entity/item/Assembly'),
            Item: require('./entity/item/Item'),
            Pile: require('./entity/item/Pile'),
            Turret: require('./entity/item/Turret')
        },
        thing: {
            Rover: require('./entity/thing/Rover')
        }
    },
    field: {
        LocalDispaceMixin: require('./field/LocalDispaceMixin'),
        EgoInteractorApplierLocal: require('./field/EgoInteractorApplierLocal'),
        EgoProtagonistLocal: require('./field/EgoProtagonistLocal')
    },
    ui: {
        hud: {
            ThingPropHudListener: require('./ui/hud/ThingPropHudListener')
        }
    }
};