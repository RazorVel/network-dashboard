export function tokenize(log, delimiters) {
    //The logic for tokenizing log strings

    //paired delimiters
    let filterPair = (collection) => collection?.reduce((collection, delimiter) => {
        delimiter instanceof Array && collection.push(delimiter);
        return collection; 
    }, []);

    let pd = delimiters.reduce((pd, collection) => {
        pd.push(new Map(filterPair(collection)));
        return pd;
    }, []);

    //single delimiters
    let filterSingle = (collection) => collection?.reduce((collection, delimiter) => {
        typeof delimiter === "string" && collection.push(delimiter);
        return collection;
    }, []);

    let sd = delimiters.reduce((sd, collection) => {
        sd.push(filterSingle(collection));
        return sd;
    }, []);    


    let tokens = [];
    let scopeStack = [{reference: tokens}];
    let currentToken = "";

    for (let char of log) {
        let reference = scopeStack[scopeStack.length - 1].reference;

        //char starts a new scope
        if (pd?.[0]?.has(char) || pd?.[scopeStack.length]?.has(char)) {
            let closure = pd?.[0]?.get(char) || pd?.[scopeStack.length]?.get(char);
            let newScope = {reference: [], closure};
            
            currentToken && reference.push(currentToken);
            currentToken = "";
            reference.push(newScope.reference);

            scopeStack.push(newScope);
        }        
        //char is end of existing scope
        else if (scopeStack.length > 1 && scopeStack[scopeStack.length - 1].closure === char) {
            currentToken && reference.push(currentToken);
            currentToken = "";

            scopeStack.pop();
        }
        //char is singular delimiter
        else if (sd?.[0]?.includes(char) || sd?.[scopeStack.length]?.includes(char)){
            currentToken && reference.push(currentToken);
            currentToken = "";
        }
        //continously add character to buffer
        else {
            currentToken += char;
        }
    }

    currentToken && tokens.push(currentToken);
    
    return tokens;
}