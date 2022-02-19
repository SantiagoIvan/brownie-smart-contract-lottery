import React, { useContext, useState, useEffect } from "react"
import { providers, BigNumber, utils } from 'ethers'

import Lottery from '../contracts/Lottery'

const AppContext = React.createContext()


const AppContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [account, setAccount] = useState('')
    const [provider, setProvider] = useState(null)
    const [contract, setContract] = useState(null)
    const [lotteryInfo, setLotteryInfo] = useState({ "entranceFee": BigNumber.from("0"), "players": "0", "prize": "0" })

    const updatePlayersCount = async (_contract) => {
        //para que nada quede inconsistente aprovecho a actualizar todo el objeto
        const _count = await _contract.getPlayersCount()
        const _fee = await _contract.getEntranceFee()
        setLotteryInfo({ "entranceFee": _fee, "players": _count.toString(), "prize": utils.formatEther(_count.mul(_fee)) })
    }

    //la contra de meter todo en un useEffect es justamente eso, que no tengo las logicas separadas
    //y si tengo que instanciar listener, traer datos, inicializar, etc, voy a tener todo en una bolsa
    //pero si los separo, me tira error

    //Otro tema es que, como dije en Home.js, al usar el estado contrato, me tira error porque en un principio es null
    //eso es porque si mal no recuerdo, setState es asincrono, por lo tanto tiene sentido que en un primer momento
    //sea null, pero entonces, no se como fragmentar el useEffect para poder usar el estado que seteo
    //'contrato' y modificar otros estados, es como que otros estados dependen de que primero se setee
    //el estado 'contrato'. Tal vez haya que usar useReducer?

    //Como me tiraba error entonces meti todo aca y ahora anda bien, pero tuve que usar todo con la 
    //variable local _contract

    useEffect(() => {
        let listener
        if (window.ethereum) {
            const _provider = new providers.Web3Provider(window.ethereum, 'any')
            const _contract = Lottery({
                provider: _provider,
                address: process.env.REACT_APP_CONTRACT_ADDRESS,
            })
            setProvider(_provider)
            setContract(_contract)

            listener = _contract.on("NewPlayer", async (_player, _) => {
                console.log("New player detected: ", _player)
                updatePlayersCount(_contract)
            })
        }
        return () => {
            contract.off("NewPlayer", listener)
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
                setContract,
                lotteryInfo,
                setLotteryInfo
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