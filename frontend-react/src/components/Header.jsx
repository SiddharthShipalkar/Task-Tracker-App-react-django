import { useContext, useEffect, useState } from 'react'
import Button from './Button'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTasks, faBell } from '@fortawesome/free-solid-svg-icons'
import axiosInstance from '../axiosInstance'

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get('/user-profile/')
        setUser(res.data)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (isLoggedIn) {
      fetchUser()
    } else {
      setUser(null)
    }
  }, [isLoggedIn])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsLoggedIn(false)
    navigate('/login')
  }

  // Safely compute initial using optional chaining
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?'

  const notifications = ['currently no notifications']

  return (
    <nav className="navbar bg-white border-bottom shadow-sm fixed-top py-2">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
          <FontAwesomeIcon icon={faTasks} className="me-2" />
          Tracker App
        </Link>

        <div className="d-flex align-items-center">
          {isLoggedIn ? (
            <>
            {user?.role == "Manager" && (
              <Button text="Bench Track Dashboard" class="btn-outline-primary me-3" url="/dashboard" /> 
              )}

              <Button text="Task Track Dashboard" class="btn-outline-primary me-3" url="/dashboard" />

              <div className="dropdown me-3">
                <button
                  className="btn btn-light rounded-circle position-relative"
                  id="notificationDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesomeIcon icon={faBell} className="text-secondary" />
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ fontSize: '0.6rem' }} />
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="notificationDropdown" style={{ width: '280px' }}>
                  <li className="dropdown-header fw-bold text-center">Notifications</li>
                  <li><hr className="dropdown-divider" /></li>
                  {notifications.map((note, index) => (
                    <li key={index} className="dropdown-item small text-wrap">{note}</li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li className="text-center small text-muted">View all</li>
                </ul>
              </div>

              <div className="dropdown">
                <button
                  className="btn btn-light rounded-circle text-dark fw-bold border-0"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f3f5' }}
                >
                  {/* show loading state if you want */}
                  {loading ? '…' : initial}
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenuButton">
                  <li className="dropdown-item-text text-center">
                    <strong>{user?.name ?? 'Unknown User'}</strong>
                    <br />
                    <div className='text-muted'>{user?.email ?? ''}</div>
                    <div className='text-muted'>Role: {user?.role ?? '-'}</div>
                    <div className='text-muted'>Location: {user?.location ?? '-'}</div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger text-center" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Button text="Login" class="btn-outline-info me-2" url="/login" />
              <Button text="Register" class="btn-info" url="/register" />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Header
