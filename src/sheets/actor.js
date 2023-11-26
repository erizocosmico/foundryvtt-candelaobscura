import { CANDELAOBSCURA } from '../helpers/config';
import { localize } from '../helpers/i18n';
import { RollMoveDialog } from '../rolls/roll';

export class CandelaActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['candelaobscura', 'sheet', 'actor'],
            template: 'systems/candelaobscura/templates/actor/actor-sheet.hbs',
            width: 800,
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

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons = [
            {
                label: localize('edit_mode'),
                class: 'edit-mode',
                icon: `fas fa-edit`,
                onclick: () => {
                    this.object.update({
                        'system.mode': this.object.system.mode === 'edit' ? 'play' : 'edit',
                    });
                },
            },
        ].concat(buttons);
        return buttons;
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

        if (type === 'ability') {
            if (this.actor.type === 'character' && itemData.system.type === 'circle') {
                return false;
            }

            if (this.actor.type === 'circle' && itemData.system.type !== 'circle') {
                return false;
            }
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
        if (this.actor.type === 'character') {
            this._prepareCharacterData(context);
            context.canRoll = this.actor.system.mode !== 'edit';
        }

        this._prepareItems(context);

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();
        context.canEdit = this.isEditable && this.actor.system.mode === 'edit';

        return context;
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData(context) {
        const moves = {};
        for (const k of Object.keys(context.system.moves)) {
            const move = context.system.moves[k];
            if (!moves[move.drive]) {
                moves[move.drive] = [];
            }
            moves[move.drive].push({ name: k, ...move });
        }

        context.drives = [];
        for (const key of Object.keys(context.system.drives)) {
            context.drives.push({
                name: key,
                ...context.system.drives[key],
                moves: moves[key],
            });
        }

        context.roles = Object.keys(CANDELAOBSCURA.ROLES);
        context.specialties = CANDELAOBSCURA.ROLES;
    }

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
        context.abilities = {};

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
                    if (!context.abilities[i.system.type]) {
                        context.abilities[i.system.type] = [];
                    }
                    context.abilities[i.system.type].push(i);
                    break;
            }
        }
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        if (this.actor.type === 'character') {
            this._activateCharacterListeners(html);
        }

        html.find('.item-open').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.items.get(li.data('itemId'));
            item.sheet.render(true);
        });

        if (!this.isEditable) return;

        html.find('.item-create').click(async (e) => await this._createItem(e));
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.items.get(li.data('itemId'));
            item.delete();
            li.slideUp(200, () => this.render(false));
        });
        html.find('.item-edit').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.items.get(li.data('itemId'));
            item.sheet.render(true);
        });
    }

    _activateCharacterListeners(html) {
        if (!this.isEditable) return;

        if (this.actor.system.mode === 'edit') {
            html.find('.drive-edit-minus').click(async (e) => await this._updateMaxDrive(e, -1));
            html.find('.drive-edit-plus').click(async (e) => await this._updateMaxDrive(e, +1));
            html.find('.move-gilded').click(async (e) => await this._gildMove(e));
            html.find('.move-points').click(async (e) => await this._updateMoveScore(e, 1));
            html.find('.move-points').on(
                'contextmenu',
                async (e) => await this._updateMoveScore(e, -1),
            );
        } else {
            html.find('.roll-move').click(async (e) => await this._rollMove(e));
        }

        html.find('.point-track').click(async (e) => await this._handlePointTrack(e, 1));
        html.find('.point-track').on(
            'contextmenu',
            async (e) => await this._handlePointTrack(e, -1),
        );
        html.find('.gear-used').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.items.get(li.data('itemId'));
            console.log(item, item.system.used);
            item.update({ 'system.used': !item.system.used });
        });
    }

    async _rollMove(e) {
        const move = e.currentTarget.dataset.move;
        const { value, gilded } = this.actor.system.moves[move];
        return await RollMoveDialog.create(this.actor, move, value, gilded);
    }

    async _createItem(e) {
        e.preventDefault();
        const type = e.currentTarget.dataset.type;
        const itemData = { name: localize('new', type), type, data: {} };
        return await this.actor
            .createEmbeddedDocuments('Item', [itemData], { render: true })
            .then((items) => items[0].sheet.render(true));
    }

    async _handlePointTrack(e, delta) {
        const type = e.currentTarget.dataset.type;
        const direction = e.currentTarget.dataset.direction === 'reverse' ? -1 : 1;

        switch (type) {
            case 'resistance':
                return await this._updateResistance(e, delta * direction);
            case 'drive':
                return await this._updateDrive(e, delta * direction);
            case 'mark':
                return await this._updateMark(e, delta * direction);
        }
    }

    async _gildMove(e) {
        const move = e.currentTarget.dataset.move;
        return this.actor.update({
            [`system.moves.${move}.gilded`]: !this.actor.system.moves[move]?.gilded,
        });
    }

    async _updateMoveScore(e, delta) {
        const move = e.currentTarget.dataset.move;

        const newValue = (this.actor.system.moves[move]?.value || 0) + delta;
        if (newValue < 0 || newValue > 3) return;

        return this.actor.update({
            [`system.moves.${move}.value`]: newValue,
        });
    }

    async _updateMark(e, delta) {
        const mark = e.currentTarget.dataset.mark;

        const newValue = (this.actor.system.marks[mark] || 0) + delta;
        console.log(mark, newValue);
        if (newValue < 0 || newValue > 3) return;

        return this.actor.update({
            [`system.marks.${mark}`]: newValue,
        });
    }

    async _updateMaxDrive(e, delta) {
        const drive = e.currentTarget.dataset.drive;

        const newMax = (this.actor.system.drives[drive]?.max || 0) + delta;
        if (newMax < 0 || newMax > 9) return;
        const value = this.actor.system.drives[drive]?.value;

        return this.actor.update({
            [`system.drives.${drive}.max`]: newMax,
            [`system.drives.${drive}.value`]: value > newMax ? newMax : value,
        });
    }

    async _updateDrive(e, delta) {
        const drive = e.currentTarget.dataset.drive;

        const max = this.actor.system.drives[drive]?.max || 0;
        const value = this.actor.system.drives[drive]?.value || 0;
        const newValue = value + delta;
        if (newValue < 0 || newValue > max) return;

        return this.actor.update({
            [`system.drives.${drive}.value`]: newValue,
        });
    }

    async _updateResistance(e, delta) {
        const drive = e.currentTarget.dataset.drive;

        const max = (this.actor.system.drives[drive]?.max || 0) / 3;
        const value = this.actor.system.drives[drive]?.resistance || 0;
        const newValue = value + delta;
        if (newValue < 0 || newValue > max) return;

        return this.actor.update({
            [`system.drives.${drive}.resistance`]: newValue,
        });
    }
}
