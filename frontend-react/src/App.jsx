import './assets/css/style.css'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import {BrowserRouter, Routes,Route} from "react-router-dom"
import Register from './components/Register'
import Login from './components/login'
import AuthProvider from './AuthProvider'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import "antd/dist/reset.css"; // antd v5 style reset

function App() {

  return (
    <>
    <AuthProvider>
            <div className="d-flex flex-column min-vh-100 bg-light">

    <BrowserRouter>
    <Header/>
    <main className="flex-fill">
    <Routes>
      <Route path='/' element={<Main/>}/>
      <Route path='/register' element={<PublicRoute><Register/></PublicRoute>}/>
        <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
        <Route path='/dashboard' element={<PrivateRoute> <Dashboard/> </PrivateRoute>}/>
    </Routes>
    </main>
    <Footer/>
    </BrowserRouter>
    </div>
    </AuthProvider>
      
    </>
  )
}

export default App
