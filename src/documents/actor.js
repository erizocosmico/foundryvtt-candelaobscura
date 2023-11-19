export class CandelaActor extends Actor {
    static async create(data, options = {}) {
        data.prototypeToken = data.prototypeToken || {};
        let defaults = {};
        if (data.type === 'character') {
            defaults = {
                actorLink: true,
                disposition: 1,
                vision: true,
            };
        }
        mergeObject(data.prototypeToken, defaults, { overwrite: false });
        return super.create(data, options);
    }

    /** @override */
    _preCreate() {
        this.updateSource({ img: `systems/candelaobscura/assets/actors/${this.type}.jpg` });
        return Promise.resolve();
    }

    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        const actorData = this.data;
        const flags = actorData.flags.candelaobscura || {};
    }

    async createDocuments(data, context) {
        super.createDocuments(data, context);
    }
}
