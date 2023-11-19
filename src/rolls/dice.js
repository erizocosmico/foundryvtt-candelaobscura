export class StandardDie extends Die {
    constructor(termData) {
        termData.faces = 6;
        super(termData);
    }

    /** @override */
    static DENOMINATION = 's';

    /** @override */
    get total() {
        return this.results.length;
    }

    /** @override */
    getResultLabel(result) {
        return {
            1: '<img src="systems/candelaobscura/assets/dice/standard-1.png" />',
            2: '<img src="systems/candelaobscura/assets/dice/standard-2.png" />',
            3: '<img src="systems/candelaobscura/assets/dice/standard-3.png" />',
            4: '<img src="systems/candelaobscura/assets/dice/standard-4.png" />',
            5: '<img src="systems/candelaobscura/assets/dice/standard-5.png" />',
            6: '<img src="systems/candelaobscura/assets/dice/standard-6.png" />',
        }[result.result];
    }
}

export class GildedDie extends Die {
    constructor(termData) {
        termData.faces = 6;
        super(termData);
    }

    /** @override */
    static DENOMINATION = 'g';

    /** @override */
    get total() {
        return this.results.length;
    }

    /** @override */
    getResultLabel(result) {
        return {
            1: '<img src="systems/candelaobscura/assets/dice/gilded-1.png" />',
            2: '<img src="systems/candelaobscura/assets/dice/gilded-2.png" />',
            3: '<img src="systems/candelaobscura/assets/dice/gilded-3.png" />',
            4: '<img src="systems/candelaobscura/assets/dice/gilded-4.png" />',
            5: '<img src="systems/candelaobscura/assets/dice/gilded-5.png" />',
            6: '<img src="systems/candelaobscura/assets/dice/gilded-6.png" />',
        }[result.result];
    }
}

export function registerDice3D(dice3d) {
    dice3d.addColorset(
        {
            name: 'Standard Dice',
            description: 'Candela Obscura Standard Dice',
            category: 'Colors',
            foreground: ['#ba9b3f'],
            background: ['#20382c'],
            outline: '#20382c',
            texture: 'none',
        },
        'preferred',
    );

    dice3d.addColorset(
        {
            name: 'Gilded Dice',
            description: 'Candela Obscura Gilded Dice',
            category: 'Colors',
            foreground: ['#000000'],
            background: ['#948a1f'],
            outline: '#5a4a25',
            texture: 'none',
        },
        'preferred',
    );

    dice3d.addSystem({ id: 'candelaobscura', name: 'Candela Obscura' }, 'preferred');
    dice3d.addDicePreset({
        type: 'ds',
        labels: [
            'systems/candelaobscura/assets/dice/standard-1.png',
            'systems/candelaobscura/assets/dice/standard-2.png',
            'systems/candelaobscura/assets/dice/standard-3.png',
            'systems/candelaobscura/assets/dice/standard-4.png',
            'systems/candelaobscura/assets/dice/standard-5.png',
            'systems/candelaobscura/assets/dice/standard-6.png',
        ],
        colorset: 'Standard Dice',
        system: 'candelaobscura',
    });
    dice3d.addDicePreset({
        type: 'dg',
        labels: [
            'systems/candelaobscura/assets/dice/gilded-1.png',
            'systems/candelaobscura/assets/dice/gilded-2.png',
            'systems/candelaobscura/assets/dice/gilded-3.png',
            'systems/candelaobscura/assets/dice/gilded-4.png',
            'systems/candelaobscura/assets/dice/gilded-5.png',
            'systems/candelaobscura/assets/dice/gilded-6.png',
        ],
        colorset: 'Gilded Dice',
        system: 'candelaobscura',
    });
}
