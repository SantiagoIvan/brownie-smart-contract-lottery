import React from 'react'
import { useNavigate, NavLink } from 'react-router-dom'

import { useAppContext } from '../../context/appContext'

import { Container, LogoContainer, Wrapper } from './NavbarElements'
import { MdOutlineCasino } from 'react-icons/md'
import { IconContext } from 'react-icons'
import { MainButton } from '../Button'

const Navbar = () => {
    const navigate = useNavigate()
    const { account, setAccount } = useAppContext()


    const handleLogoClick = () => {
        navigate("/")
    }

    const handleConnectButtonClick = async () => {
        if (!account) {
            if (window.ethereum) {
                const [_account] = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                setAccount(_account)
            }
        } else {
            setAccount(null)
        }
    }

    return (
        <Container>
            <Wrapper>
                <IconContext.Provider value={{ style: { fontSize: "2.5rem", color: "#b48608" } }}>
                    <LogoContainer onClick={() => handleLogoClick()}>
                        <NavLink to="/">
                            <MdOutlineCasino />
                        </NavLink>
                    </LogoContainer>
                </IconContext.Provider>
                <MainButton onClick={handleConnectButtonClick}>
                    {account ? "Log out: " + account.slice(0, 10) + "..." : "Connect your wallet"}
                </MainButton>
            </Wrapper>
        </Container>
    )
}

export default Navbar