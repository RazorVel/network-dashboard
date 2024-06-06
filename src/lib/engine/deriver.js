import { fields } from "./fields.js";

export function derive(value, field) {
    field = fields[field];
    if (!value || !field) {
        return {};
    }

    let data = {};

    let matches = value.match(field.pattern);
    if (!matches) {
        return {};
    }

    for (let index = 1; index <= matches.length-1; index++) {
        let match = matches[index];
        let subField = field.derivatives[index-1];
        data[subField] = match;
        data = {...data, ...derive(match, subField)};
    }

    return data;
}