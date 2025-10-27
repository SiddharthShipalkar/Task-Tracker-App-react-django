import React, { useState } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [emp_id, setEmpId] = useState('')
  const [role, setRole] = useState('Associate')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegistration = async (e) => {
    e.preventDefault()
    setLoading(true)

    const userData = { username, email, emp_id, role, password }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/register/', userData)
      console.log('Registration successful:', response.data)
      setErrors({})
      setSuccess(true)
    } catch (error) {
      setErrors(error.response?.data || {})
      console.error('Registration error:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="d-flex align-items-center justify-content-center text-center bg-light"
      style={{ minHeight: '85vh' ,paddingTop: '60px' }}
    >
      <div className="bg-white p-5 shadow-sm rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="fw-bold mb-4">Create an Account</h3>

        <form onSubmit={handleRegistration}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <small className="text-danger">{errors.username}</small>}
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Employee ID"
              value={emp_id}
              onChange={(e) => setEmpId(e.target.value)}
            />
          </div>

          {/* 🔽 Role Dropdown */}
          <div className="mb-3">
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Associate">Associate</option>
              <option value="Lead">Lead</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Set password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <small className="text-danger">{errors.password}</small>}
          </div>

          {success && <div className="alert alert-success py-2 mb-3">Registration Successful 🎉</div>}

          <button
            type="submit"
            className="btn btn-info w-100 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Please wait...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Register
