import { CANDELAOBSCURA } from '../helpers/config';

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

        if (this.item.data.type === 'ability') {
            context.roles = Object.keys(CANDELAOBSCURA.ROLES);
            context.specialties = Object.values(CANDELAOBSCURA.ROLES).flat();
        } else if (this.item.data.type === 'scar') {
            context.moves = CANDELAOBSCURA.MOVES;
        } else if (this.item.data.type === 'relationship') {
            context.relationships = CANDELAOBSCURA.RELATIONSHIPS;
        }

        return context;
    }
}
