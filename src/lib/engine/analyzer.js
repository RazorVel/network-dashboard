import { fields as knownFields } from "./fields.js";

export function analyze(tokens, fields) {
    //The logic for analyzing tokens against fields
    let originalFields = [...fields];

    let fieldIndex = -1;
    let lastMatchedField = undefined;

    fields = fields.map((field) => {
        let delimiter = undefined;
        
        if (field.includes("/")) {
            delimiter = field.substr(field.indexOf("/") + 1);
            field = field.substr(0, field.indexOf("/"));
        }

        return {name: field, delimiter};
    });

    let data = {};
    let buffer = "";
    let currentValid = undefined; 
    let activeField = fields.shift();
    fieldIndex++;

    while (tokens.length || fields.length && buffer) {
        let freshToken = undefined;

        if (buffer && currentValid != undefined && activeField.delimiter != undefined) {
            buffer += activeField.delimiter + (freshToken = tokens.shift());
        }
        if (!buffer) buffer = tokens.shift();

        let pattern = new RegExp(`^${knownFields[activeField.name]?.pattern.source}$`);
        
        if (pattern.test(buffer)) {
            if (activeField.delimiter == undefined) {
                data[activeField.name] = buffer;
                buffer = "";
                activeField = fields.shift();
                lastMatchedField = fieldIndex;
                fieldIndex++
            }
            else {
                currentValid = buffer;
            }
        }
        else if (currentValid != undefined) {
            data[activeField.name] = currentValid;
            currentValid = undefined;
            buffer = (freshToken != undefined) ? freshToken : "";
            activeField = fields.shift();
            lastMatchedField = fieldIndex;
            fieldIndex++;
        }
        else {
            activeField = fields.shift();
            fieldIndex++;
        }

        if (!activeField) {
            break;
        }
    }

    if (activeField && currentValid) {
        data[activeField.name] = currentValid;
        activeField = fields.shift();
        lastMatchedField = fieldIndex;
        fieldIndex++;
        currentValid = undefined;
        buffer = "";
    }

    if (activeField) {
        fields.unshift(activeField);
    }

    tokens = buffer ? [buffer, ...tokens] : tokens;

    let unmatchedFields = originalFields.slice(lastMatchedField === undefined ? 0 : lastMatchedField + 1);
    
    if (tokens.length && unmatchedFields.length) {
        let other = tokens.shift();

        let recursion = analyze(tokens, unmatchedFields);

        data = {...data, ...recursion, others: [other, ...recursion.others]};
    }
    else {
        data.others = tokens;
    }

    return data;
}