import Navbar from '../components/Navbar'
import { useAppContext } from '../context/appContext';

import {
  Outlet,
  useNavigate
} from "react-router-dom";

import { useCallback, useEffect } from 'react'

function App() {
  const { account, contract } = useAppContext()
  const navigate = useNavigate()

  const checkAdmin = useCallback(async () => {
    const _owner = await contract.owner()
    if (_owner.toLowerCase() === account.toLowerCase()) {
      navigate("/admin")
    }
  }, [contract, account, navigate])

  useEffect(() => {
    if (!account) {
      navigate("/")
    } else {
      checkAdmin()
    }
  }, [account, checkAdmin, navigate])

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
