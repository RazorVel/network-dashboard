export let makeGetter = function (thisValue) {
    return thisValue instanceof Object ? get.bind(thisValue) : undefined;

    function get(descriptor) {
        if (descriptor === undefined || typeof descriptor != "string") {
            return undefined;
        }

        let pointer = this;
        
        for (let token of descriptor.split(".")) {
            pointer = pointer?.[token];
        }

        return pointer;
    }
}

export let makeSetter = function (thisValue) {
    return thisValue instanceof Object ? set.bind(thisValue) : undefined;

    function set(descriptor, value) {
        if (descriptor === undefined || typeof descriptor != "string") {
            return;
        }
    
        let pointer = this;
    
        let tokens = descriptor.split(".");
        let property = tokens.pop();
    
        if (property === undefined) {
            return;
        }
    
        for (let token of tokens) {
            if (!(pointer[token] instanceof Object)) {
                pointer[token] = {};
            }
            pointer = pointer[token];
        }
    
        pointer[property] = value;
    }
}