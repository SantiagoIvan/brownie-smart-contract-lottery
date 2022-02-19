import React, { useState, useEffect } from 'react'

import { useAppContext } from '../../context/appContext'

import { Title } from "../../components/Title";
import { MainButton } from "../../components/Button";
import { BigNumber, utils } from 'ethers'
import { Text, Container } from "../../components/Text";
import Loading from '../../components/Loading'


const Home = () => {
    const [lotteryInfo, setLotteryInfo] = useState({ "entranceFee": BigNumber.from("0"), "players": "0", "prize": "0" })
    const { account, provider, contract, loading, setLoading } = useAppContext()

    // useEffect(() => {// TODO contract null
    //     const listener = contract.on("NewPlayer", async (_player, _) => {
    //         console.log("New player detected: ", _player)
    //         const _count = await lotteryInfogetPlayersCount()
    //         setLotteryInfo({ ...lotteryInfo, "players": _count })
    //     })

    //     return () => {
    //         contract.off("NewPlayer", listener)
    //     }
    // }, [])

    const getEntranceFee = async () => {
        setLoading(true)
        try {
            const _entranceFee = await contract.getEntranceFee()
            setLotteryInfo(prevState => ({ ...prevState, "entranceFee": _entranceFee }))
        } catch (error) {
            console.log("F perrroo", { error })
        } finally {
            setLoading(false)
        }
    }

    const enterLottery = async (e) => {
        setLoading(true)
        try {
            e.preventDefault()

            const _entranceFee = await contract.getEntranceFee()
            const signer = await provider.getSigner()
            const transaction = await contract.populateTransaction.enterLottery()
            const execTransaction = await signer.sendTransaction({ ...transaction, "value": _entranceFee })

            await provider.waitForTransaction(execTransaction.hash)
            alert("Ticket successfully bought!")
        } catch (error) {
            console.error('FFFFF', { error })
            alert("Whoops, impossible to buy a ticket right now :(")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? <Loading /> : (
                <>
                    <section>
                        <Title>
                            Welcome to CryptoLottery
                        </Title>
                        <Text>Current players count: {lotteryInfo.players}</Text>
                        <Container>
                            <Text>Accumulated prize: {lotteryInfo.prize}</Text>
                        </Container>
                        <Container>
                            <MainButton onClick={getEntranceFee}>
                                Get Entrance Fee
                            </MainButton>
                            <Text>
                                {lotteryInfo.entranceFee ? utils.formatEther(lotteryInfo.entranceFee) + " Ether" : "__"}
                            </Text>
                        </Container>

                        <MainButton disabled={!account} onClick={enterLottery}>
                            Buy a ticket now!
                        </MainButton>

                        <Text>
                            More tickets = More chances to win!
                        </Text>
                    </section>
                </>
            )
            }
        </>
    )
}

export default Home