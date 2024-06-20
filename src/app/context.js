import React from "react"

export const AppContext = React.createContext({
    isLoading: false,
    setIsLoading: () => {},
    loadingMessage: "",
    setLoadingMessage: () => {}
});