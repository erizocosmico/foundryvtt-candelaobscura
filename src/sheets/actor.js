export class CandelaActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['candelaobscura', 'sheet', 'actor'],
            template: 'systems/candelaobscura/templates/actor/actor-sheet.hbs',
            width: 700,
            height: 600,
            tabs: [
                { navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'features' },
            ],
        });
    }

    /** @override */
    get template() {
        return `systems/candelaobscura/templates/actor/actor-${this.actor.data.type}-sheet.hbs`;
    }

    /** @override */
    async _onDropItemCreate(itemData) {
        const type = itemData.type;
        const allowedItems = {
            character: ['gear', 'ability', 'scar', 'relationship'],
            circle: ['ability', 'gear'],
        };

        if (!allowedItems[this.actor.type].includes(type)) {
            return false;
        }

        if (this.actor.type === 'character' && itemData.system.type === 'circle') {
            return false;
        }

        if (this.actor.type === 'circle' && itemData.system.type !== 'circle') {
            return false;
        }

        return super._onDropItemCreate(itemData);
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData();

        context.system = context.actor.system;
        context.flags = context.actor.flags;

        // Prepare character data and items.
        if (this.actor.type == 'character') {
            this._prepareItems(context);
            this._prepareCharacterData(context);
        }

        // Prepare NPC data and items.
        if (this.actor.type == 'npc') {
            this._prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        return context;
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData(context) {}

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareItems(context) {
        context.gear = [];
        context.scars = [];
        context.relationships = [];
        context.abilities = [];

        for (let i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;
            switch (i.type) {
                case 'scar':
                    context.scars.push(i);
                    break;
                case 'gear':
                    context.gear.push(i);
                    break;
                case 'relationship':
                    context.relationships.push(i);
                    break;
                case 'ability':
                    context.abilities.push(i);
                    break;
            }
        }
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    }
}
