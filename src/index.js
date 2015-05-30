module.exports = {
    Bootstrap: require('./Bootstrap'),
    ai: {
        mayor: {
            RoverHordeRandom: require('./ai/mayor/RoverHordeRandom')
        }
    },
    entity: {
        item: {
            Item: require('./entity/item/Item'),
            Component: require('./entity/item/Component')
        },
        thing: {
            Rover: require('./entity/thing/Rover')
        },
        Assembly: require('./entity/Assembly')
    },
    service: {
        serialize: {
            DispaceThingSerializer: require('./service/serialize/DispaceThingSerializer')
        },
        FieldSocketManager: require('./service/FieldSocketManager'),
        GutsManager: require('./service/GutsManager'),
        ItemManager: require('./service/ItemManager'),
        MoverConfigBuilder: require('./service/MoverConfigBuilder'),
        RoverBuilder: require('./service/RoverBuilder')
    },
    field: {
        generator: {
            DevGenerator: require('./field/generator/DevGenerator')
        },
        ModuleDispaceLocal: require('./field/ModuleDispaceLocal'),
        ModuleDispaceClient: require('./field/ModuleDispaceClient'),
        ModuleDispaceServer: require('./field/ModuleDispaceServer'),
        ModuleRof: require('./field/ModuleRof'),
        ModuleShooter: require('./field/ModuleShooter'),
        ModuleMayor: require('./field/ModuleMayor'),
        ModuleInsight: require('./field/ModuleInsight'),
        EgoInteractorApplierLocal: require('./field/EgoInteractorApplierLocal'),
        EgoProtagonistLocal: require('./field/EgoProtagonistLocal')
    },
    ui: {
        hud: {
            TurretPointerHudComponent: require('./ui/hud/TurretPointerHudComponent')
        },
        panel: {
            PropMonitor: require('./ui/panel/PropMonitor'),
            SelectionPanel: require('./ui/panel/SelectionPanel')
        },
        SelfUpdater: require('./ui/SelfUpdater'),
        UiController: require('./ui/UiController'),
    }
};
