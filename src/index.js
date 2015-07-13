module.exports = {
    Bootstrap: require('./Bootstrap'),
    ai: {
        mayor: {
            RoverHordeRandom: require('./ai/mayor/RoverHordeRandom')
        },
        FriendOrFoe: require('./ai/FriendOrFoe')
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
            DevGenerator: require('./field/generator/DevGenerator'),
            PlanGenerator: require('./field/generator/PlanGenerator')
        },
        ModuleDispaceLocal: require('./field/ModuleDispaceLocal'),
        ModuleDispaceClient: require('./field/ModuleDispaceClient'),
        ModuleDispaceEngine: require('./field/ModuleDispaceEngine'),
        ModuleDispaceServer: require('./field/ModuleDispaceServer'),
        ModuleRof: require('./field/ModuleRof'),
        ModuleShooter: require('./field/ModuleShooter'),
        ModuleWillMaster: require('./field/ModuleWillMaster'),
        ModuleMayor: require('./field/ModuleMayor'),
        ModuleInsight: require('./field/ModuleInsight'),
        EgoInteractorApplierLocal: require('./field/EgoInteractorApplierLocal'),
        ModuleProtagonist: require('./field/ModuleProtagonist'),
        Shadow: require('./field/Shadow'),
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
        UiDevBuilder: require('./ui/UiDevBuilder')

    },
    view: {
        viewpon: {
            ViewponAbstract: require('./view/viewpon/ViewponAbstract')
        },
        viewhull: {
            ViewhullPropeller: require('./view/viewhull/ViewhullPropeller')
        }
    }
};
