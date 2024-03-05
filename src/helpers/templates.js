export const TEMPLATES = {
    ROLL_MOVE: 'systems/candelaobscura/templates/dialogs/roll-move.hbs',
    CHOOSE_RESULT: 'systems/candelaobscura/templates/dialogs/choose-result.hbs',
    ROLL_MESSAGE: 'systems/candelaobscura/templates/chat/roll.hbs',
};

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([TEMPLATES.ROLL_MOVE, TEMPLATES.CHOOSE_RESULT]);
};

export function registerHelpers() {
    Handlebars.registerHelper('range', function (start, end) {
        let range = [];
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    });

    Handlebars.registerHelper('loc', function (...args) {
        args.pop();
        return game.i18n.localize(`CANDELA.${args.join('.')}`);
    });

    Handlebars.registerHelper('ifThen', function (cond, result, other) {
        return cond ? result : other;
    });

    Handlebars.registerHelper('capitalize', function (value) {
        return typeof value === 'string' ? value.capitalize() : value;
    });

    Handlebars.registerHelper('value_at', (obj, k, defaultValue) => obj?.[k] || defaultValue);

    Handlebars.registerHelper({
        eq: (v1, v2) => v1 === v2,
        ne: (v1, v2) => v1 !== v2,
        lt: (v1, v2) => v1 < v2,
        gt: (v1, v2) => v1 > v2,
        lte: (v1, v2) => v1 <= v2,
        gte: (v1, v2) => v1 >= v2,
        and() {
            return Array.prototype.every.call(arguments, Boolean);
        },
        or() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        },
        isSelected: (cond) => (cond ? 'selected' : ''),
        div: (a, b) => a / b,
    });
}
