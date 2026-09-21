import { useEffect } from 'react'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import Members from './pages/admin/Members'
import Meetings from './pages/admin/Meetings'
import Contributions from './pages/admin/Contributions'

function App() {
  const token = localStorage.getItem('vikoba_token')
  const role = localStorage.getItem('vikoba_role')

  useEffect(() => {
    if (!token) {
      window.history.replaceState(
        null,
        '',
        '/'
      )

      return
    }

    const preventBackAfterLogout = () => {
      const currentToken =
        localStorage.getItem('vikoba_token')

      if (!currentToken) {
        window.history.pushState(
          null,
          '',
          '/'
        )

        window.location.reload()
      }
    }

    window.history.pushState(
      null,
      '',
      window.location.href
    )

    window.addEventListener(
      'popstate',
      preventBackAfterLogout
    )

    return () => {
      window.removeEventListener(
        'popstate',
        preventBackAfterLogout
      )
    }
  }, [token])

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!token) {
    return <Login />
  }

  // =====================================================
  // ONLY ADMIN ALLOWED
  // =====================================================

  if (role !== 'ADMIN') {
    return <Login />
  }

  // =====================================================
  // ROUTING
  // =====================================================

  const path =
    window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/members') {
    return <Members />
  }

  if (path === '/meetings') {
    return <Meetings />
  }

  if (path === '/contributions') {
    return <Contributions />
  }

  return <AdminDashboard />
}

export default App