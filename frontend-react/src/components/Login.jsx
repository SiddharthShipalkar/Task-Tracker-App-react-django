import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setIsLoggedIn } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/token/', {
        username,
        password,
      })

      localStorage.setItem('accessToken', response.data.access)
      localStorage.setItem('refreshToken', response.data.refresh)
      console.log('Login successful')
      setIsLoggedIn(true)
      navigate('/dashboard')
    } catch (error) {
      console.error('Invalid credentials')
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="d-flex align-items-center justify-content-center text-center bg-light"
      style={{ minHeight: '85vh' }}
    >
      <div className="bg-white p-5 shadow-sm rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="fw-bold mb-4">Login to Dashboard</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-danger mb-3">{error}</div>}

          <button
            type="submit"
            className="btn btn-info w-100 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
