// Import document classes.
import { CandelaActor } from './documents/actor.js';
import { CandelaItem } from './documents/item.js';
// Import sheet classes.
import { CandelaActorSheet } from './sheets/actor.js';
import { CandelaItemSheet } from './sheets/item.js';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates, registerHelpers } from './helpers/templates.js';
import './styles/candelaobscura.scss';
import { StandardDie, GildedDie, registerDice3D } from './rolls/dice.js';
import { CANDELAOBSCURA } from './helpers/config.js';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {
    // Add utility classes to the global game object so that they're more easily
    // accessible in global contexts.
    game.candelaobscura = {
        CandelaActor,
        CandelaItem,
    };

    CONFIG.Dice.terms['s'] = StandardDie;
    CONFIG.Dice.terms['g'] = GildedDie;

    // Define custom Document classes
    CONFIG.Actor.documentClass = CandelaActor;
    CONFIG.Item.documentClass = CandelaItem;
    CONFIG.CANDELAOBSCURA = CANDELAOBSCURA;

    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('candelaobscura', CandelaActorSheet, { makeDefault: true });
    Items.unregisterSheet('core', CandelaItemSheet);
    Items.registerSheet('candelaobscura', CandelaItemSheet, { makeDefault: true });

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();
});

registerHelpers();

Hooks.once('diceSoNiceReady', registerDice3D);
