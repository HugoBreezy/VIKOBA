import { useState } from 'react'
import Swal from 'sweetalert2'
import {
  FaWallet,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from 'react-icons/fa'
import { loginUser } from '../../services/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)

    try {
      const data = await loginUser(email, password)

      localStorage.setItem('vikoba_token', data.token)
      localStorage.setItem('vikoba_username', data.username)
      localStorage.setItem('vikoba_role', data.role)

      if (rememberMe) {
        localStorage.setItem('vikoba_remember_me', 'true')
      } else {
        localStorage.removeItem('vikoba_remember_me')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${data.username}`,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        allowOutsideClick: false,
      })

      // Dashboard navigation will be handled by App.jsx

      window.location.reload()

    } catch (error) {
      let message = error.message

      if (message === 'Failed to fetch') {
        message =
          'Unable to connect to the server. Please make sure the backend is running.'
      }

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message,
        confirmButtonText: 'Try Again',
      })

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-brand-side">

        <div className="login-brand-content">

          <div className="login-brand-logo">
            <FaWallet />
          </div>

          <h1>VIKOBA</h1>

          <p className="login-brand-title">
            Management System
          </p>

          <p className="login-brand-description">
            Manage members, contributions, loans and
            financial activities in one secure system.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <div className="feature-check">
                ✓
              </div>

              <div>
                <strong>Member Management</strong>

                <span>
                  Keep track of all group members.
                </span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-check">
                ✓
              </div>

              <div>
                <strong>Financial Management</strong>

                <span>
                  Manage contributions, loans and expenses.
                </span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-check">
                ✓
              </div>

              <div>
                <strong>Share-Out Management</strong>

                <span>
                  Calculate and manage member share-outs.
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="login-brand-footer">
          © 2026 VIKOBA Management System
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="login-form-side">

        <div className="login-form-container">

          <div className="login-mobile-logo">

            <div className="login-mobile-logo-icon">
              <FaWallet />
            </div>

            <span>
              VIKOBA
            </span>

          </div>

          <div className="login-heading">

            <span className="login-welcome">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to continue.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="login-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="login-input-wrapper">

                <FaEnvelope />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="login-form-group">

              <div className="login-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <a href="#">
                  Forgot password?
                </a>

              </div>

              <div className="login-input-wrapper">

                <FaLock />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >

                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}

                </button>

              </div>

            </div>

            {/* REMEMBER ME */}
            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              <span>
                {loading
                  ? 'Signing In...'
                  : 'Sign In'}
              </span>

              {!loading && (
                <FaArrowRight />
              )}

            </button>

          </form>

          <div className="login-security">

            <span className="security-icon">
              🔒
            </span>

            <span>
              Your connection is secure
            </span>

          </div>

          <div className="login-footer-text">
            VIKOBA Management System • 2026
          </div>

        </div>

      </div>

    </div>
  )
}

export default Login