import React from "react"

export const AppContext = React.createContext({
    isLoading: false,
    setIsLoading: () => {},
    logCache: [],
    setLogCache: () => {},
    isStreamPaused: false,
    setIsStreamPaused: () => {}
});

export default AppContext;