export class CandelaItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['candelaobscura', 'sheet', 'item'],
            height: 438,
            width: 468,
        });
    }

    /** @override */
    get template() {
        const path = 'systems/candelaobscura/templates/item';
        return `${path}/item-${this.item.data.type}-sheet.hbs`;
    }

    /** @override */
    getData() {
        const context = super.getData();

        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        return context;
    }
}
