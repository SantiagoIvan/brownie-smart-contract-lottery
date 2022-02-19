import React, { useContext, useState, useEffect } from "react"
import { providers } from 'ethers'

import Lottery from '../contracts/Lottery'

const AppContext = React.createContext()


const AppContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [account, setAccount] = useState('')
    const [provider, setProvider] = useState(null)
    const [contract, setContract] = useState(null)

    useEffect(() => {
        if (window.ethereum) {
            const _provider = new providers.Web3Provider(window.ethereum, 'any')
            const _contract = Lottery({
                provider: _provider,
                address: process.env.REACT_APP_CONTRACT_ADDRESS,
            })
            setProvider(_provider)
            setContract(_contract)
        }
    }, [])

    return (
        <AppContext.Provider
            value={{
                loading,
                setLoading,
                provider,
                setProvider,
                account,
                setAccount,
                contract,
                setContract
            }}
        >
            {children}
        </AppContext.Provider>
    )
}


export const useAppContext = () => {
    return useContext(AppContext)
}
export { AppContext, AppContextProvider }