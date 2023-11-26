import { localize } from '../helpers/i18n';
import { TEMPLATES } from '../helpers/templates';
import { GildedDie, StandardDie } from './dice';

export class RollMoveDialog extends Dialog {
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ['candela-dialog', 'roll-move-dialog'];
    }

    static async create(actor, move, points, gilded) {
        let baseDice = points;
        let choose = 'best';
        if (baseDice === 0) {
            choose = 'worst';
            baseDice = 2;
        }

        let gildedDice = 0;
        if (gilded) {
            baseDice--;
            gildedDice = 1;
        }
        const tpl = await renderTemplate(TEMPLATES.ROLL_MOVE, {
            move,
            points,
            gilded,
            baseDice,
            gildedDice,
        });

        return new Promise((resolve) => {
            new this({
                title: `${localize('roll_move')}: ${localize('move', move, 'label')}`,
                content: tpl,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: localize('roll'),
                        callback: async (html) => {
                            const $base = html.find('#roll-base-dice');
                            const $gilded = html.find('#roll-gilded-dice');

                            const base = Number($base.text());
                            const gilded = Number($gilded.text());

                            await this._roll(actor, move, base, gilded, choose);
                            resolve(true);
                        },
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: localize('cancel'),
                        callback: () => resolve(false),
                    },
                },
                render: (html) => {
                    let base = baseDice;
                    let gilded = gildedDice;
                    const $base = html.find('#roll-base-dice');
                    const $gilded = html.find('#roll-gilded-dice');
                    html.find('.roll-dice-counter-btn').click((e) => {
                        // TODO: when the score is 0 and the pool is modified
                        // choose should be changed to 'best'.
                        const delta = Number(e.currentTarget.dataset.delta);
                        const dice = e.currentTarget.dataset.dice;

                        // Pool cannot go over 6 or under 1.
                        if (base + gilded + delta > 6 || base + gilded + delta < 1) {
                            return;
                        }

                        let $elem;
                        let val;
                        if (dice === 'gilded' && gilded + delta >= 0) {
                            gilded += delta;
                            $elem = $gilded;
                            val = gilded;
                        } else if (dice === 'base' && base + delta >= 0) {
                            base += delta;
                            $elem = $base;
                            val = base;
                        }

                        if ($elem) {
                            $elem.text(val);
                        }
                    });
                },
                default: 'roll',
            }).render(true);
        });
    }

    static async _roll(actor, move, base, gilded, choose = 'best') {
        const roll = await new Roll(`${base}ds + ${gilded}dg`, {}).evaluate();

        const baseResults = results(roll, StandardDie);
        const gildedResults = results(roll, GildedDie);
        let gainDrive = false;
        let criticalSuccess = false;
        let result;

        if (choose === 'worst') {
            const worstBase = worst(baseResults);
            const worstGilded = worst(gildedResults);

            result = worstOf(worstBase, worstGilded);
            if (result === worstGilded) {
                gainDrive = true;
            }
        } else if (choose === 'best') {
            const bestBase = best(baseResults);
            const bestGilded = best(gildedResults);
            result = bestOf(bestBase, bestGilded);
            criticalSuccess = sixes(baseResults, gildedResults) > 1;
            if (bestGilded && result !== bestGilded) {
                result = await ChooseResultDialog.create(bestBase, bestGilded);
            }

            if (result === bestGilded) {
                gainDrive = true;
            }
        }

        const rollData = {
            move,
            moveDrive: actor.system.moves[move]?.drive,
            baseResults,
            gildedResults,
            result,
            gainDrive,
            criticalSuccess,
        };

        const html = await renderTemplate(TEMPLATES.ROLL_MESSAGE, rollData);

        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({
                alias: actor.data.name,
                actor,
            }),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll,
            rollMode: game.settings.get('core', 'rollMode'),
            content: html,
        };

        if (['gmroll', 'blindroll'].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperRecipients('GM');
        } else if (chatData.rollMode === 'selfroll') {
            chatData.whisper = [game.user];
        }

        return await ChatMessage.create(chatData);
    }
}

export class ChooseResultDialog extends Dialog {
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ['candela-dialog', 'choose-result-dialog'];
    }

    static async create(standard, gilded) {
        const tpl = await renderTemplate(TEMPLATES.CHOOSE_RESULT, {
            standard,
            gilded,
        });

        return new Promise((resolve) => {
            new this({
                title: `${localize('choose_result.title')}`,
                content: tpl,
                buttons: {
                    standard: {
                        label: `${localize('choose_result.keep_best')} (${standard})`,
                        callback: () => resolve(standard),
                    },
                    gilded: {
                        label: `${localize('choose_result.take_gilded')} (${gilded})`,
                        callback: () => resolve(gilded),
                    },
                },
                close: () => resolve(standard),
                default: 'standard',
            }).render(true);
        });
    }
}

function worstOf(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a < b ? a : b;
}

function bestOf(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a > b ? a : b;
}

function worst(results) {
    return results.length > 0 ? results[0] : null;
}

function best(results) {
    return results.length > 0 ? results[results.length - 1] : null;
}

function results(roll, typ) {
    const results = [];
    for (let term of roll.terms) {
        if (term instanceof typ) {
            for (let r of term.results) {
                results.push(r.result);
            }
        }
    }
    results.sort();

    return results;
}

function sixes(...results) {
    let result = 0;
    for (let r in results) {
        for (let n in r) {
            if (r === 6) {
                result++;
            }
        }
    }
    return result;
}

export function handleRollMessage(message, html) {
    html.find('.candela-message-roll-dice').click(() => {
        html.find('.candela-message-roll-summary').toggle();
    });
}
