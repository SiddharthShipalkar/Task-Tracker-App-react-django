import { useContext } from 'react'
import Button from './Button'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTasks, faBell } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsLoggedIn(false)
    navigate('/login')
  }

  // Simulated user data (replace later with real API or token)
  const user = {
    name: 'Siddharth Shipalkar',
    username: 'sid_tcs'
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?'

  // Dummy notifications
  const notifications = [
    'currently no notifications',
    
  ]

  return (
    <nav className="navbar bg-white border-bottom shadow-sm fixed-top py-2">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Brand */}
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
          <FontAwesomeIcon icon={faTasks} className="me-2" />
          Tracker App
        </Link>

        {/* Right side */}
        <div className="d-flex align-items-center">
          {isLoggedIn ? (
            <>
              {/* Dashboard */}
              <Button text="Dashboard" class="btn-info me-3" url="/dashboard" />

              {/* Notification Icon */}
              <div className="dropdown me-3">
                <button
                  className="btn btn-light rounded-circle position-relative"
                  id="notificationDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FontAwesomeIcon icon={faBell} className="text-secondary" />
                  <span
                    className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                    style={{ fontSize: '0.6rem' }}
                  ></span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="notificationDropdown" style={{ width: '280px' }}>
                  <li className="dropdown-header fw-bold text-center">Notifications</li>
                  <li><hr className="dropdown-divider" /></li>
                  {notifications.map((note, index) => (
                    <li key={index} className="dropdown-item small text-wrap">
                      {note}
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li className="text-center small text-muted">View all</li>
                </ul>
              </div>

              {/* Profile Initial */}
              <div className="dropdown">
                <button
                  className="btn btn-light rounded-circle text-dark fw-bold border-0"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f3f5'
                  }}
                >
                  {initial}
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenuButton">
                  <li className="dropdown-item-text text-center">
                    <strong>{user.name}</strong>
                    <br />
                    <small className="text-muted">@{user.username}</small>
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
