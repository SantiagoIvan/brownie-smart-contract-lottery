import Navbar from '../components/Navbar'
import { useAppContext } from '../context/appContext';

import Home from './screens/Home'
import Admin from './screens/Admin'
import NotFound from './screens/NotFound'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate
} from "react-router-dom";
import { useEffect } from 'react'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route indexed path="/" element={
              <Home />
            }
            />
            <Route
              path="/admin"
              element={
                <Admin />
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <NotFound />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

const Layout = () => {
  const { account, contract, setLoading } = useAppContext()
  const navigate = useNavigate()

  const checkAdmin = async () => {
    const _owner = await contract.owner()
    if (_owner.toLowerCase() == account.toLowerCase()) {
      navigate("/admin")
    }
  }

  useEffect(() => {
    if (!account) {
      navigate("/")
    } else {
      checkAdmin()
    }
  }, [account])

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default App;
