import React, { useCallback, useEffect } from 'react'

import { useAppContext } from '../../context/appContext'

import { Title } from "../../components/Title";
import { MainButton } from "../../components/Button";
import { utils } from 'ethers'
import { Text, Container } from "../../components/Text";
import Loading from '../../components/Loading'


const Home = () => {
    const { account, provider, contract, loading, setLoading, setLotteryInfo, lotteryInfo } = useAppContext()

    const updatePlayersCount = useCallback(async () => {
        if (!contract) return;
        const _count = await contract.getPlayersCount()
        const _fee = await contract.getEntranceFee()
        setLotteryInfo({ "entranceFee": _fee, "players": _count.toString(), "prize": utils.formatEther(_count.mul(_fee)) })
    }, [contract, setLotteryInfo])

    const listener = useCallback(async (_player, _) => {
        updatePlayersCount()
    }, [updatePlayersCount])



    useEffect(() => {
        if (contract) {
            contract.on("NewPlayer", listener)
        }
        return () => {
            contract?.off("NewPlayer", listener)
        }
    }, [contract, listener])

    useEffect(() => {
        if (contract) {
            updatePlayersCount()
        }
    }, [contract, updatePlayersCount])



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
                            CryptoLottery
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