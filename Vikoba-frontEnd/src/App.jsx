import { useEffect } from 'react'

import Login from './pages/auth/Login'

import AdminDashboard from './pages/admin/AdminDashboard'

import Members from './pages/admin/Members'

import Meetings from './pages/admin/Meetings'

import Contributions from './pages/admin/Contributions'

import Loans from './pages/admin/Loans'

import Payments from './pages/admin/Payments'

import Penalties from './pages/admin/Penalties'

import Expenses from './pages/admin/Expenses'

import ShareOut from './pages/admin/ShareOut'

import Reports from './pages/admin/Reports'

import Settings from './pages/admin/Settings'

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

  if (path === '/loans') {

    return <Loans />

  }

  if (path === '/payments') {

    return <Payments />

  }

  if (path === '/penalties') {

    return <Penalties />

  }

  if (path === '/expenses') {

    return <Expenses />

  }

  if (path === '/share-outs') {

    return <ShareOut />

  }

  if (path === '/reports') {

    return <Reports />

  }

  if (path === '/settings') {

    return <Settings />

  }

  return <AdminDashboard />

}

export default App