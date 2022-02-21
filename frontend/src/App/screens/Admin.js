import React, { useState, useCallback, useEffect } from 'react'
import { BigNumber, utils } from 'ethers'

import { MainButton } from '../../components/Button'
import Loading from '../../components/Loading'
import { Container, Text } from '../../components/Text'
import { Title } from '../../components/Title'

import { useAppContext } from '../../context/appContext'


const Admin = () => {
    const [calculatingWinner, setCalculatingWinner] = useState(null)
    const [winner, setWinner] = useState({ "winner": "", "prize": BigNumber.from("0") })
    const { provider, contract, loading, setLoading } = useAppContext()

    const listener = useCallback(
        (winner, amount, event) => {
            alert("Last winner: ", winner)
            setWinner({ winner, "prize": amount })
            setCalculatingWinner(false)
        }
        ,
        []
    )

    useEffect(() => {
        if (contract) {
            contract.on("LotteryHasEnded", listener)
        }
        return () => {
            contract?.off("LotteryHasEnded", listener)
        }
    }, [contract, listener])


    const startLottery = async (e) => {
        setLoading(true)
        try {
            e.preventDefault()

            const signer = await provider.getSigner()
            const transaction = await contract.populateTransaction.startLottery()
            const execTx = await signer.sendTransaction({ ...transaction })

            await provider.waitForTransaction(execTx.hash)
            alert("Succesfully started!")
        } catch (error) {
            console.log("Error al empezar la loteria", { error })
            alert("Error al empezar la loteria. Codigo ")
        } finally {
            setLoading(false)
        }
    }


    const endLottery = async (e) => {
        setLoading(true)
        try {
            e.preventDefault()
            const signer = await provider.getSigner()
            const transaction = await contract.populateTransaction.endLottery()
            const execTx = await signer.sendTransaction({ ...transaction })

            const receipt = await provider.waitForTransaction(execTx.hash)
            alert("Succesfully finished. Waiting por results...", { receipt })

            setCalculatingWinner(true)
        } catch (error) {
            console.log("Error al finalizar la loteria", { error })
            alert("Error al finalizar la loteria.")
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            {loading ? <Loading /> : (
                <>
                    <section>
                        <Title>Admin panel</Title>

                        <Container>
                            <MainButton onClick={startLottery}>
                                Start Lottery
                            </MainButton>
                            <MainButton onClick={endLottery}>
                                End Lottery
                            </MainButton>
                        </Container>

                        {calculatingWinner && <Text>Calculating winner. This may take a while...</Text>}
                        {winner.winner && <Text>We have a winner! The address {winner.winner} has won {utils.formatEther(winner.prize)} Ether</Text>}
                    </section>
                </>
            )}
        </>
    )
}

export default Admin