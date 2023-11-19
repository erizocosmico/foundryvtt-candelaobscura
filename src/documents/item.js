export class CandelaItem extends Item {
    /** @override */
    _preCreate() {
        this.updateSource({ img: `systems/candelaobscura/assets/items/${this.type}.jpg` });
        return Promise.resolve();
    }

    /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        if (!this.actor) return null;
        const rollData = this.actor.getRollData();
        rollData.item = foundry.utils.deepClone(this.system);

        return rollData;
    }

    async show() {
        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get('core', 'rollMode');

        const content = await renderTemplate(
            'systems/candelaobscura/templates/roll/item.hbs',
            this,
        );

        return await ChatMessage.create({
            speaker: speaker,
            rollMode: rollMode,
            content,
        });
    }

    prepareChatData() {
        return {
            img: this.img,
            name: this.name,
            data: JSON.stringify({
                img: this.img,
                name: this.name,
                system: this.system,
            }),
            system: this.system,
        };
    }
}
