import { useEffect, useMemo, useRef, useState } from 'react'

import {
  FaHome,
  FaUsers,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaChartPie,
  FaCog,
  FaSearch,
  FaBell,
  FaWallet,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaChevronDown,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaTimes,
} from 'react-icons/fa'

import Swal from 'sweetalert2'

const API_BASE_URL = 'http://localhost:8080'

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem('vikoba_token') || ''
  }`,
  'Content-Type': 'application/json',
})

const parseApiResponse = async (response, fallbackMessage) => {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        fallbackMessage
    )
  }

  return data
}

// =====================================================
// SETTINGS API
// =====================================================

const getSettings = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/settings`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    'Failed to load settings.'
  )
}

const createSetting = async (setting) => {
  const response = await fetch(
    `${API_BASE_URL}/api/settings`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(setting),
    }
  )

  return parseApiResponse(
    response,
    'Failed to create setting.'
  )
}

const updateSetting = async (id, setting) => {
  const response = await fetch(
    `${API_BASE_URL}/api/settings/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(setting),
    }
  )

  return parseApiResponse(
    response,
    'Failed to update setting.'
  )
}

const deleteSetting = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/settings/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    return parseApiResponse(
      response,
      'Failed to delete setting.'
    )
  }

  return true
}

// =====================================================
// HELPERS
// =====================================================

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }

  try {
    return new Date(value).toLocaleString('en-TZ')
  } catch {
    return String(value)
  }
}

function Settings() {
  const username =
    localStorage.getItem('vikoba_username') ||
    'Administrator'

  const profileRef = useRef(null)

  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('KEY_ASC')
  const [currentPage, setCurrentPage] = useState(1)

  const settingsPerPage = 10

  const [showModal, setShowModal] = useState(false)
  const [editingSetting, setEditingSetting] = useState(null)
  const [saving, setSaving] = useState(false)

  const [profileOpen, setProfileOpen] = useState(false)

  const [form, setForm] = useState({
    settingKey: '',
    settingValue: '',
    description: '',
  })

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  const loadSettings = async () => {
    setLoading(true)

    try {
      const data = await getSettings()

      setSettings(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load settings:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Settings',
        text:
          error.message ||
          'Unable to load system settings.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // =====================================================
  // PROFILE OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
    }
  }, [])

  // =====================================================
  // FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      settingKey: '',
      settingValue: '',
      description: '',
    })
  }

  const openAddModal = () => {
    setEditingSetting(null)

    resetForm()

    setShowModal(true)
  }

  const openEditModal = (setting) => {
    setEditingSetting(setting)

    setForm({
      settingKey:
        setting?.settingKey || '',
      settingValue:
        setting?.settingValue ?? '',
      description:
        setting?.description || '',
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setShowModal(false)
    setEditingSetting(null)
    resetForm()
  }

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // =====================================================
  // SAVE SETTING
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault()

    const settingKey =
      form.settingKey.trim()

    const settingValue =
      form.settingValue.trim()

    const description =
      form.description.trim()

    if (!settingKey) {
      Swal.fire({
        icon: 'warning',
        title: 'Setting Key Required',
        text:
          'Please enter the setting key.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })

      return
    }

    if (!settingValue) {
      Swal.fire({
        icon: 'warning',
        title: 'Setting Value Required',
        text:
          'Please enter the setting value.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })

      return
    }

    setSaving(true)

    try {
      const settingData = {
        settingKey,
        settingValue,
        description:
          description || null,
      }

      if (editingSetting) {
        await updateSetting(
          editingSetting.id,
          settingData
        )
      } else {
        await createSetting(settingData)
      }

      setShowModal(false)
      setEditingSetting(null)
      resetForm()

      await loadSettings()

      await new Promise((resolve) =>
        setTimeout(resolve, 0)
      )

      await Swal.fire({
        icon: 'success',
        title: editingSetting
          ? 'Setting Updated'
          : 'Setting Created',
        text: editingSetting
          ? 'System setting has been updated successfully.'
          : 'System setting has been created successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      console.error(
        'Failed to save setting:',
        error
      )

      setShowModal(false)
      setEditingSetting(null)
      resetForm()

      await new Promise((resolve) =>
        setTimeout(resolve, 0)
      )

      await Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text:
          error.message ||
          'Unable to save system setting.',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // DELETE SETTING
  // =====================================================

  const handleDelete = async (setting) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Setting?',
      text:
        `Are you sure you want to delete "${setting?.settingKey || 'this setting'}"?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      zIndex: 200000,
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await deleteSetting(setting.id)

      await loadSettings()

      Swal.fire({
        icon: 'success',
        title: 'Setting Deleted',
        text:
          'System setting has been deleted successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text:
          error.message ||
          'Unable to delete system setting.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    }
  }

  // =====================================================
  // VIEW SETTING
  // =====================================================

  const handleView = (setting) => {
    Swal.fire({
      title: 'Setting Details',
      html: `
        <div style="text-align:left;line-height:1.9;">
          <strong>Setting ID:</strong>
          ${setting?.id ?? '-'}
          <br />

          <strong>Setting Key:</strong>
          ${setting?.settingKey ?? '-'}
          <br />

          <strong>Setting Value:</strong>
          ${setting?.settingValue ?? '-'}
          <br />

          <strong>Description:</strong>
          ${setting?.description ?? '-'}
          <br />

          <strong>Last Updated:</strong>
          ${formatDateTime(
            setting?.updatedAt
          )}
          <br />
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#1450c8',
      zIndex: 200000,
    })
  }

  // =====================================================
  // FILTER / SORT
  // =====================================================

  const filteredSettings = useMemo(() => {
    return settings
      .filter((setting) => {
        const query =
          search.toLowerCase().trim()

        if (!query) {
          return true
        }

        return (
          String(
            setting?.settingKey || ''
          )
            .toLowerCase()
            .includes(query) ||
          String(
            setting?.settingValue || ''
          )
            .toLowerCase()
            .includes(query) ||
          String(
            setting?.description || ''
          )
            .toLowerCase()
            .includes(query)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'KEY_DESC') {
          return String(
            b?.settingKey || ''
          ).localeCompare(
            String(
              a?.settingKey || ''
            )
          )
        }

        if (sortBy === 'VALUE_HIGH') {
          return String(
            b?.settingValue || ''
          ).localeCompare(
            String(
              a?.settingValue || ''
            ),
            undefined,
            {
              numeric: true,
            }
          )
        }

        if (sortBy === 'VALUE_LOW') {
          return String(
            a?.settingValue || ''
          ).localeCompare(
            String(
              b?.settingValue || ''
            ),
            undefined,
            {
              numeric: true,
            }
          )
        }

        return String(
          a?.settingKey || ''
        ).localeCompare(
          String(
            b?.settingKey || ''
          )
        )
      })
  }, [
    settings,
    search,
    sortBy,
  ])

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      filteredSettings.length /
        settingsPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) *
    settingsPerPage

  const paginatedSettings =
    filteredSettings.slice(
      startIndex,
      startIndex +
        settingsPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    sortBy,
  ])

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalSettings =
    settings.length

  const configuredSettings =
    settings.filter(
      (setting) =>
        String(
          setting?.settingValue || ''
        ).trim() !== ''
    ).length

  const keySettings = [
    'LOAN_MULTIPLIER',
    'MAX_LOAN_WEEKS',
    'MAX_LOAN_INSTALLMENTS',
    'PENALTY_RATE',
  ]

  const businessSettingsCount =
    settings.filter(
      (setting) =>
        keySettings.includes(
          setting?.settingKey
        )
    ).length

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = () => {
    if (settings.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Settings',
        text:
          'There are no settings to export.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })

      return
    }

    const headers = [
      'ID',
      'Setting Key',
      'Setting Value',
      'Description',
      'Last Updated',
    ]

    const rows = settings.map(
      (setting) => [
        setting?.id || '',
        setting?.settingKey || '',
        setting?.settingValue || '',
        setting?.description || '',
        setting?.updatedAt || '',
      ]
    )

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob(
      [csvContent],
      {
        type:
          'text/csv;charset=utf-8;',
      }
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      'vikoba-settings.csv'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      'vikoba_token'
    )

    localStorage.removeItem(
      'vikoba_username'
    )

    localStorage.removeItem(
      'vikoba_role'
    )

    localStorage.removeItem(
      'vikoba_remember_me'
    )

    sessionStorage.clear()

    window.location.replace('/')
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="dashboard-page"
      style={{
        minHeight: '100vh',
      }}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <FaWallet />
          </div>

          <div className="sidebar-brand-text">
            <h2>
              VIKOBA
            </h2>

            <span>
              Management System
            </span>
          </div>

        </div>

        <nav className="sidebar-navigation">

          <div className="sidebar-section-title">
            MAIN MENU
          </div>

          <a
            href="/"
            className="sidebar-link"
          >
            <FaHome />
            <span>
              Dashboard
            </span>
          </a>

          <a
            href="/members"
            className="sidebar-link"
          >
            <FaUsers />
            <span>
              Members
            </span>
          </a>

          <a
            href="/meetings"
            className="sidebar-link"
          >
            <FaCalendarAlt />
            <span>
              Meetings
            </span>
          </a>

          <a
            href="/contributions"
            className="sidebar-link"
          >
            <FaMoneyBillWave />
            <span>
              Contributions
            </span>
          </a>

          <a
            href="/loans"
            className="sidebar-link"
          >
            <FaHandHoldingUsd />
            <span>
              Loans
            </span>
          </a>

          <div className="sidebar-section-title">
            FINANCIAL
          </div>

          <a
            href="/payments"
            className="sidebar-link"
          >
            <FaFileInvoiceDollar />
            <span>
              Payments
            </span>
          </a>

          <a
            href="/penalties"
            className="sidebar-link"
          >
            <FaExclamationTriangle />
            <span>
              Penalties
            </span>
          </a>

          <a
            href="/expenses"
            className="sidebar-link"
          >
            <FaMoneyBillWave />
            <span>
              Expenses
            </span>
          </a>

          <a
            href="/share-outs"
            className="sidebar-link"
          >
            <FaChartPie />
            <span>
              Share-Out
            </span>
          </a>

          <div className="sidebar-section-title">
            SYSTEM
          </div>

          <a
            href="/reports"
            className="sidebar-link"
          >
            <FaChartPie />
            <span>
              Reports
            </span>
          </a>

          <a
            href="/settings"
            className="sidebar-link active"
          >
            <FaCog />
            <span>
              Settings
            </span>
          </a>

        </nav>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="dashboard-topbar">

          <div className="dashboard-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search settings..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="dashboard-topbar-right">

            <button
              type="button"
              className="notification-button"
            >
              <FaBell />
            </button>

            <div
              className="dashboard-profile-wrapper"
              ref={profileRef}
            >

              <button
                type="button"
                className="dashboard-profile"
                onClick={() =>
                  setProfileOpen(
                    (previous) =>
                      !previous
                  )
                }
              >

                <div className="profile-avatar">
                  {username
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="profile-info">

                  <strong>
                    {username}
                  </strong>

                  <span>
                    Administrator
                  </span>

                </div>

                <FaChevronDown />

              </button>

              {profileOpen && (
                <div className="profile-dropdown">

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* =================================================
            SETTINGS CONTENT
        ================================================= */}

        <div className="dashboard-content">

          <div className="members-page">

            <div className="members-header">

              <div>

                <h1>
                  Settings
                </h1>

                <p>
                  Manage VIKOBA system settings and business rules.
                </p>

              </div>

              <div className="members-toolbar-actions">

                <button
                  type="button"
                  className="members-export-button"
                  onClick={
                    handleExport
                  }
                >
                  <FaDownload />
                  Export
                </button>

                <button
                  type="button"
                  className="members-add-button"
                  onClick={
                    openAddModal
                  }
                >
                  <FaPlus />
                  Add Setting
                </button>

              </div>

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div>
                  <span>
                    Total Settings
                  </span>

                  <strong>
                    {totalSettings}
                  </strong>
                </div>

                <FaCog />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Configured Settings
                  </span>

                  <strong>
                    {configuredSettings}
                  </strong>
                </div>

                <FaFileInvoiceDollar />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Business Settings
                  </span>

                  <strong>
                    {businessSettingsCount}
                  </strong>
                </div>

                <FaHandHoldingUsd />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    System Access
                  </span>

                  <strong>
                    ADMIN
                  </strong>
                </div>

                <FaUsers />

              </div>

            </div>

            {/* =================================================
                TABLE PANEL
            ================================================= */}

            <div className="members-panel">

              <div className="members-toolbar">

                <div>

                  <div className="members-search">

                    <FaSearch />

                    <input
                      type="text"
                      placeholder="Search by key, value or description..."
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="members-toolbar-actions">

                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                  >

                    <option value="KEY_ASC">
                      Key A-Z
                    </option>

                    <option value="KEY_DESC">
                      Key Z-A
                    </option>

                    <option value="VALUE_HIGH">
                      Value High-Low
                    </option>

                    <option value="VALUE_LOW">
                      Value Low-High
                    </option>

                  </select>

                </div>

              </div>

              <div className="members-table-wrapper">

                {loading ? (

                  <div className="members-loading">

                    <div className="spinner-border">
                    </div>

                    <span>
                      Loading settings...
                    </span>

                  </div>

                ) : paginatedSettings.length === 0 ? (

                  <div className="members-empty">

                    <FaCog />

                    <h3>
                      No Settings Found
                    </h3>

                    <p>
                      No system settings match your current search.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />
                      Add Setting
                    </button>

                  </div>

                ) : (

                  <table className="members-table">

                    <thead>

                      <tr>

                        <th>
                          SETTING
                        </th>

                        <th>
                          VALUE
                        </th>

                        <th>
                          DESCRIPTION
                        </th>

                        <th>
                          LAST UPDATED
                        </th>

                        <th>
                          ACTIONS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedSettings.map(
                        (setting) => (

                          <tr
                            key={
                              setting.id
                            }
                          >

                            <td>

                              <div className="member-table-user">

                                <div className="member-avatar">
                                  <FaCog />
                                </div>

                                <div>

                                  <strong>
                                    {setting.settingKey ||
                                      '-'}
                                  </strong>

                                  <span>
                                    ID: {setting.id}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <strong>
                                {setting.settingValue ||
                                  '-'}
                              </strong>

                            </td>

                            <td>

                              {setting.description ||
                                '-'}

                            </td>

                            <td>
                              {formatDateTime(
                                setting.updatedAt
                              )}
                            </td>

                            <td>

                              <div className="member-actions">

                                <button
                                  type="button"
                                  title="View"
                                  onClick={() =>
                                    handleView(
                                      setting
                                    )
                                  }
                                >
                                  <FaEye />
                                </button>

                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() =>
                                    openEditModal(
                                      setting
                                    )
                                  }
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={() =>
                                    handleDelete(
                                      setting
                                    )
                                  }
                                >
                                  <FaTrash />
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                )}

              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {!loading &&
                filteredSettings.length >
                  0 && (

                <div className="members-pagination">

                  <span>
                    Showing{' '}
                    {startIndex + 1}
                    {' - '}
                    {Math.min(
                      startIndex +
                        settingsPerPage,
                      filteredSettings.length
                    )}
                    {' of '}
                    {filteredSettings.length}
                  </span>

                  <div>

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            page - 1
                        )
                      }
                    >
                      Previous
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map(
                      (page) => (

                        <button
                          type="button"
                          key={page}
                          className={
                            currentPage ===
                            page
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                        >
                          {page}
                        </button>

                      )
                    )}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            page + 1
                        )
                      }
                    >
                      Next
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

      {/* =====================================================
          ADD / EDIT SETTING MODAL
      ===================================================== */}

      {showModal && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor:
              'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding:
                  '20px 24px',
                borderBottom:
                  '1px solid #dee2e6',
              }}
            >

              <div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  {editingSetting
                    ? 'Edit Setting'
                    : 'Add Setting'}
                </h3>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6c757d',
                  }}
                >
                  {editingSetting
                    ? 'Update the system setting information.'
                    : 'Enter the system setting information.'}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                style={{
                  border: 'none',
                  background:
                    'transparent',
                  fontSize:
                    '20px',
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                  color:
                    '#6c757d',
                }}
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSave
              }
            >

              <div
                style={{
                  padding:
                    '24px',
                }}
              >

                <div className="row g-3">

                  <div className="col-12">

                    <label className="form-label">
                      Setting Key
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="settingKey"
                      value={
                        form.settingKey
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. LOAN_MULTIPLIER"
                      disabled={
                        saving
                      }
                      required
                    />

                    <small className="text-muted">
                      Use a unique key such as LOAN_MULTIPLIER.
                    </small>

                  </div>

                  <div className="col-12">

                    <label className="form-label">
                      Setting Value
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="settingValue"
                      value={
                        form.settingValue
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 3"
                      disabled={
                        saving
                      }
                      required
                    />

                  </div>

                  <div className="col-12">

                    <label className="form-label">
                      Description
                    </label>

                    <textarea
                      className="form-control"
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe what this setting controls..."
                      rows="4"
                      maxLength="500"
                      disabled={
                        saving
                      }
                    />

                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  gap: '10px',
                  padding:
                    '16px 24px',
                  borderTop:
                    '1px solid #dee2e6',
                }}
              >

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Saving...'
                    : editingSetting
                    ? 'Update Setting'
                    : 'Save Setting'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Settings
