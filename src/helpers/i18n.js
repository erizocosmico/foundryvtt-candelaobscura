export function labelFor(...args) {
    return `CANDELA.${args.join('.')}`;
}

export function localize(...args) {
    return game.i18n.localize(labelFor(...args));
}
