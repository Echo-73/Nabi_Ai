import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import Login from './pages/Login'
import { useAppContext } from './context/AppContext'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const { user, loadingUser } = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(true)

  const { pathname } = useLocation()

  if (pathname === '/loading' || loadingUser) return <Loading />

  return (
    <>

      {/* Mobile Menu Open Button */}
      {!isMenuOpen && (
        <img
          onClick={() => setIsMenuOpen(true)}
          src={assets.menu_icon}
          alt=""
          className='md:hidden absolute top-4 left-4 z-50 w-6 cursor-pointer not-dark:invert'
        />
      )}

      {user ? (

        <div className='dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white'>

          <div className='flex h-screen w-screen'>

            <Sidebar
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />

            <Routes>
              <Route path='/' element={<ChatBox />} />
              <Route path='/credits' element={<Credits />} />
              <Route path='/community' element={<Community />} />
            </Routes>

          </div>

        </div>

      ) : (

        <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen'>
          <Login />
        </div>

      )}

    </>
  )
}

export default App;