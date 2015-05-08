module.exports = {
    entity: {
        item: {
            Item: require('./entity/item/Item'),
            Component: require('./entity/item/Component')
        },
        thing: {
            Rover: require('./entity/thing/Rover')
        },
        Assembly: require('./entity/Assembly'),
        ItemManager: require('./entity/ItemManager'),
        RoverBuilder: require('./entity/RoverBuilder')
    },
    field: {
        ModuleDispaceLocal: require('./field/ModuleDispaceLocal'),
        ModuleShooter: require('./field/ModuleShooter'),
        ModuleInsight: require('./field/ModuleInsight'),
        EgoInteractorApplierLocal: require('./field/EgoInteractorApplierLocal'),
        EgoProtagonistLocal: require('./field/EgoProtagonistLocal')
    },
    ui: {
        hud: {
            ThingPropHudListener: require('./ui/hud/ThingPropHudListener'),
            TurretPointerHudComponent: require('./ui/hud/TurretPointerHudComponent')
        }
    }
};