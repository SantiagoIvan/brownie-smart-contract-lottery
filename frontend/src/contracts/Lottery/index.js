import { ethers } from 'ethers'
import ABI from './abi.json'

const contract = ({ address, provider }) =>
    new ethers.Contract(address, ABI, provider)

export default contract
