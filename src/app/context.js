import React from "react"

export const AppContext = React.createContext({
    isLoading: false,
    setIsLoading: () => {},
    logCache: [],
    setLogCache: () => {},
    documentation: "",
    setDocumentation: () => {},
    isStreamPaused: false,
    setIsStreamPaused: () => {}
});

export default AppContext;