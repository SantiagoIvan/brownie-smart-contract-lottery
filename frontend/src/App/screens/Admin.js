import React, { useState } from 'react'
import { BigNumber } from 'ethers'

import { MainButton } from '../../components/Button'
import Loading from '../../components/Loading'
import { Container, Text } from '../../components/Text'
import { Title } from '../../components/Title'

import { useAppContext } from '../../context/appContext'


const Admin = () => {
    const [calculatingWinner, setCalculatingWinner] = useState(null)
    const { account, provider, contract, loading, setLoading } = useAppContext()

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
            console.log("Transaction pura", { transaction })
            const execTx = await signer.sendTransaction({ ...transaction })

            const receipt = await provider.waitForTransaction(execTx.hash)
            alert("Succesfully finished. Waiting por results...", { receipt })
            contract.on("LotteryHasEnded", (winner, event) => {
                console.log({ winner, event })
                alert("Last winner: ", winner)
            })
            provider.on("block", (blockNumber) => {
                console.log(blockNumber)
            })
            setCalculatingWinner(true)
        } catch (error) {
            console.log("Error al finalizar la loteria", { error })
            alert("Error al finalizar la loteria.")
        } finally {
            setLoading(false)
        }
    }

    const resetLottery = async (e) => {
        setLoading(true)
        try {
            e.preventDefault()

            const signer = await provider.getSigner()
            const transaction = await contract.populateTransaction.resetLottery()
            const execTx = await signer.sendTransaction({ ...transaction })

            await provider.waitForTransaction(execTx.hash)
            alert("Succesfully reseted!")
        } catch (error) {
            console.log("Error al resetear la loteria", { error })
            alert("Error al resetear la loteria.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? <Loading /> : (//CAMBIAR ESE (account?)
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
                            <MainButton onClick={resetLottery}>
                                Reset Lottery
                            </MainButton>
                        </Container>

                        {calculatingWinner ? <Text>Calculating winner. This may take a while...</Text> : <></>}
                    </section>
                </>
            )}
        </>
    )
}

export default Admin