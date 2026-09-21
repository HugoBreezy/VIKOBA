import { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
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
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaFilter,
  FaTimes,
} from 'react-icons/fa'

import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../../services/api'

const API_BASE_URL = 'http://localhost:8080'

function Meetings() {
  const username =
    localStorage.getItem('vikoba_username') ||
    'Administrator'

  const profileRef = useRef(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const [meetings, setMeetings] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [cycleFilter, setCycleFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    meetingNumber: '',
    meetingDate: new Date().toISOString().split('T')[0],
    cycleId: '',
    notes: '',
  })

  const membersPerPage = 10

  const loadData = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem('vikoba_token')

      const [meetingData, cycleResponse] = await Promise.all([
        getMeetings(),
        fetch(`${API_BASE_URL}/api/financial-cycles`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ])

      if (!cycleResponse.ok) {
        let message = 'Failed to load financial cycles.'

        try {
          const errorData = await cycleResponse.json()
          message = errorData.message || message
        } catch {
          // No JSON response
        }

        throw new Error(message)
      }

      const cycleData = await cycleResponse.json()

      setMeetings(Array.isArray(meetingData) ? meetingData : [])
      setCycles(Array.isArray(cycleData) ? cycleData : [])
    } catch (error) {
      console.error('Failed to load meetings:', error)

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Meetings',
        text: error.message || 'Unable to load meetings.',
        confirmButtonText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('vikoba_token')
    localStorage.removeItem('vikoba_username')
    localStorage.removeItem('vikoba_role')
    localStorage.removeItem('vikoba_remember_me')
    sessionStorage.clear()
    window.location.replace('/')
  }

  const getCycleId = (meeting) => {
    if (meeting.cycleId !== undefined && meeting.cycleId !== null) {
      return meeting.cycleId
    }

    if (meeting.cycle?.id !== undefined && meeting.cycle?.id !== null) {
      return meeting.cycle.id
    }

    return ''
  }

  const getCycleName = (meeting) => {
    if (meeting.cycle?.name) {
      return meeting.cycle.name
    }

    if (meeting.cycle?.cycleName) {
      return meeting.cycle.cycleName
    }

    const cycleId = getCycleId(meeting)
    const cycle = cycles.find(
      (item) => String(item.id) === String(cycleId)
    )

    return cycle?.name || cycle?.cycleName || `Cycle #${cycleId || '-'}`
  }

  const generateNextMeetingNumber = () => {
    let highestNumber = 0

    meetings.forEach((meeting) => {
      const number = Number(meeting.meetingNumber)

      if (Number.isFinite(number) && number > highestNumber) {
        highestNumber = number
      }
    })

    return highestNumber + 1
  }

  const resetForm = () => {
    setForm({
      meetingNumber: '',
      meetingDate: new Date().toISOString().split('T')[0],
      cycleId: '',
      notes: '',
    })
  }

  const openAddModal = () => {
    setEditingMeeting(null)

    setForm({
      meetingNumber: String(generateNextMeetingNumber()),
      meetingDate: new Date().toISOString().split('T')[0],
      cycleId: '',
      notes: '',
    })

    setShowModal(true)
  }

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting)

    setForm({
      meetingNumber: String(meeting.meetingNumber || ''),
      meetingDate:
        meeting.meetingDate ||
        new Date().toISOString().split('T')[0],
      cycleId: String(getCycleId(meeting) || ''),
      notes: meeting.notes || '',
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setShowModal(false)
    setEditingMeeting(null)
    resetForm()
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.meetingNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Meeting Number Required',
        text: 'Please enter meeting number.',
        confirmButtonText: 'OK',
      })
      return
    }

    if (!/^\d+$/.test(form.meetingNumber.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Meeting Number',
        text: 'Meeting number must contain numbers only.',
        confirmButtonText: 'OK',
      })
      return
    }

    if (!form.meetingDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Meeting Date Required',
        text: 'Please select meeting date.',
        confirmButtonText: 'OK',
      })
      return
    }

    if (!form.cycleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Financial Cycle Required',
        text: 'Please select financial cycle.',
        confirmButtonText: 'OK',
      })
      return
    }

    try {
      setSaving(true)

      Swal.fire({
        title: editingMeeting
          ? 'Updating Meeting...'
          : 'Adding Meeting...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const selectedCycle = cycles.find(
        (cycle) => String(cycle.id) === String(form.cycleId)
      )

      if (!selectedCycle) {
        throw new Error('Selected financial cycle was not found.')
      }

      const meetingData = {
        meetingNumber: Number(form.meetingNumber),
        meetingDate: form.meetingDate,
        cycle: selectedCycle,
        notes: form.notes.trim(),
      }

      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, meetingData)
      } else {
        await createMeeting(meetingData)
      }

      Swal.close()

      await Swal.fire({
        icon: 'success',
        title: editingMeeting
          ? 'Meeting Updated Successfully'
          : 'Meeting Added Successfully',
        text: editingMeeting
          ? 'Meeting has been updated successfully.'
          : `Meeting #${form.meetingNumber} has been added successfully.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })

      setShowModal(false)
      setEditingMeeting(null)
      resetForm()

      await loadData()
    } catch (error) {
      console.error('Failed to save meeting:', error)

      Swal.close()

      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error.message || 'Unable to save meeting.',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#dc3545',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (meeting) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Meeting?',
      text: `Are you sure you want to delete Meeting #${meeting.meetingNumber}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await deleteMeeting(meeting.id)

      await Swal.fire({
        icon: 'success',
        title: 'Meeting Deleted',
        text: 'Meeting has been deleted successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })

      await loadData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.message || 'Unable to delete meeting.',
        confirmButtonText: 'OK',
      })
    }
  }

  const handleView = (meeting) => {
    Swal.fire({
      title: `Meeting #${meeting.meetingNumber || '-'}`,
      html: `
        <div style="text-align:left; line-height:1.8;">
          <strong>Meeting Number:</strong>
          ${meeting.meetingNumber || '-'}
          <br/>

          <strong>Meeting Date:</strong>
          ${meeting.meetingDate || '-'}
          <br/>

          <strong>Financial Cycle:</strong>
          ${getCycleName(meeting)}
          <br/>

          <strong>Notes:</strong>
          ${meeting.notes || '-'}
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#1450c8',
    })
  }

  const filteredMeetings = meetings
    .filter((meeting) => {
      const query = search.toLowerCase().trim()

      if (!query) {
        return true
      }

      return (
        String(meeting.meetingNumber || '')
          .toLowerCase()
          .includes(query) ||
        String(meeting.meetingDate || '')
          .toLowerCase()
          .includes(query) ||
        getCycleName(meeting)
          .toLowerCase()
          .includes(query) ||
        String(meeting.notes || '')
          .toLowerCase()
          .includes(query)
      )
    })
    .filter((meeting) => {
      if (cycleFilter === 'ALL') {
        return true
      }

      return String(getCycleId(meeting)) === String(cycleFilter)
    })
    .sort((a, b) => {
      if (sortBy === 'NUMBER') {
        return (
          Number(a.meetingNumber || 0) -
          Number(b.meetingNumber || 0)
        )
      }

      if (sortBy === 'OLDEST') {
        return (
          new Date(a.meetingDate || 0) -
          new Date(b.meetingDate || 0)
        )
      }

      return (
        new Date(b.meetingDate || 0) -
        new Date(a.meetingDate || 0)
      )
    })

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeetings.length / membersPerPage)
  )

  const startIndex = (currentPage - 1) * membersPerPage

  const paginatedMeetings = filteredMeetings.slice(
    startIndex,
    startIndex + membersPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, cycleFilter, sortBy])

  const handleExport = () => {
    if (filteredMeetings.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Meetings',
        text: 'There are no meetings to export.',
        confirmButtonText: 'OK',
      })
      return
    }

    const headers = [
      'ID',
      'Meeting Number',
      'Meeting Date',
      'Financial Cycle',
      'Notes',
    ]

    const rows = filteredMeetings.map((meeting) => [
      meeting.id || '',
      meeting.meetingNumber || '',
      meeting.meetingDate || '',
      getCycleName(meeting),
      meeting.notes || '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll('"', '""')}"`
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'vikoba-meetings.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <FaWallet />
          </div>

          <div className="sidebar-brand-text">
            <h2>VIKOBA</h2>
            <span>Management System</span>
          </div>

        </div>

        <nav className="sidebar-navigation">

          <div className="sidebar-section-title">
            MAIN MENU
          </div>

          <a href="/" className="sidebar-link">
            <FaHome />
            <span>Dashboard</span>
          </a>

          <a href="/members" className="sidebar-link">
            <FaUsers />
            <span>Members</span>
          </a>

          <a href="/meetings" className="sidebar-link active">
            <FaCalendarAlt />
            <span>Meetings</span>
          </a>

          <a
            href="/contributions"
            className="sidebar-link"
          >
            <FaMoneyBillWave />
            <span>Contributions</span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaHandHoldingUsd />
            <span>Loans</span>
          </a>

          <div className="sidebar-section-title">
            FINANCIAL
          </div>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaFileInvoiceDollar />
            <span>Payments</span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaExclamationTriangle />
            <span>Penalties</span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaMoneyBillWave />
            <span>Expenses</span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaChartPie />
            <span>Share-Out</span>
          </a>

          <div className="sidebar-section-title">
            SYSTEM
          </div>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaChartPie />
            <span>Reports</span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <FaCog />
            <span>Settings</span>
          </a>

        </nav>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div className="dashboard-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search anything..."
            />
          </div>

          <div className="dashboard-topbar-right">

            <button
              type="button"
              className="notification-button"
            >
              <FaBell />
              <span className="notification-dot"></span>
            </button>

            <div
              className="dashboard-profile-wrapper"
              ref={profileRef}
            >

              <button
                type="button"
                className="dashboard-profile"
                onClick={() => setProfileOpen(!profileOpen)}
              >

                <div className="profile-avatar">
                  A
                </div>

                <div className="profile-info">
                  <strong>{username}</strong>
                  <span>Administrator</span>
                </div>

                <FaChevronDown
                  className={
                    profileOpen
                      ? 'profile-chevron profile-chevron-open'
                      : 'profile-chevron'
                  }
                />

              </button>

              {profileOpen && (
                <div className="profile-dropdown">

                  <div className="profile-dropdown-user">

                    <div className="profile-dropdown-avatar">
                      A
                    </div>

                    <div>
                      <strong>{username}</strong>
                      <span>Administrator</span>
                    </div>

                  </div>

                  <div className="profile-dropdown-divider"></div>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                  >
                    <FaUserCircle />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                  >
                    <FaCog />
                    <span>Settings</span>
                  </button>

                  <div className="profile-dropdown-divider"></div>

                  <button
                    type="button"
                    className="profile-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="dashboard-content">

          <div className="members-page">

            {/* HEADER */}

            <div className="members-header">

              <div>

                <span className="dashboard-welcome">
                  MANAGEMENT
                </span>

                <h1>Meetings</h1>

                <p>
                  Manage VIKOBA meetings and meeting records.
                </p>

              </div>

              <button
                type="button"
                className="members-add-button"
                onClick={openAddModal}
              >
                <FaPlus />
                Add Meeting
              </button>

            </div>

            {/* SUMMARY */}

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaCalendarAlt />
                </div>

                <div>
                  <span>Total Meetings</span>
                  <strong>{meetings.length}</strong>
                </div>

              </div>

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaCalendarAlt />
                </div>

                <div>
                  <span>Financial Cycles</span>
                  <strong>{cycles.length}</strong>
                </div>

              </div>

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaFilter />
                </div>

                <div>
                  <span>Showing</span>
                  <strong>{filteredMeetings.length}</strong>
                </div>

              </div>

            </div>

            {/* TABLE PANEL */}

            <div className="members-panel">

              <div className="members-toolbar">

                <div className="members-search">

                  <FaSearch />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search meetings..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                    >
                      <FaTimes />
                    </button>
                  )}

                </div>

                <div className="members-toolbar-actions">

                  <select
                    value={cycleFilter}
                    onChange={(event) =>
                      setCycleFilter(event.target.value)
                    }
                  >
                    <option value="ALL">
                      All Cycles
                    </option>

                    {cycles.map((cycle) => (
                      <option
                        key={cycle.id}
                        value={cycle.id}
                      >
                        {cycle.name ||
                          cycle.cycleName ||
                          `Cycle #${cycle.id}`}
                      </option>
                    ))}

                  </select>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                  >
                    <option value="NEWEST">
                      Newest
                    </option>

                    <option value="OLDEST">
                      Oldest
                    </option>

                    <option value="NUMBER">
                      Meeting Number
                    </option>
                  </select>

                  <button
                    type="button"
                    className="members-export-button"
                    onClick={handleExport}
                  >
                    <FaDownload />
                    Export
                  </button>

                </div>

              </div>

              <div className="members-table-wrapper">

                {loading ? (

                  <div className="members-loading">

                    <div className="spinner-border"></div>

                    <span>
                      Loading meetings...
                    </span>

                  </div>

                ) : paginatedMeetings.length === 0 ? (

                  <div className="members-empty">

                    <FaCalendarAlt />

                    <h3>
                      No Meetings Found
                    </h3>

                    <p>
                      No meetings match your current search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={openAddModal}
                    >
                      <FaPlus />
                      Add Meeting
                    </button>

                  </div>

                ) : (

                  <table className="members-table">

                    <thead>

                      <tr>

                        <th>MEETING</th>
                        <th>MEETING NUMBER</th>
                        <th>MEETING DATE</th>
                        <th>FINANCIAL CYCLE</th>
                        <th>NOTES</th>
                        <th>ACTIONS</th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedMeetings.map((meeting) => (

                        <tr key={meeting.id}>

                          <td>

                            <div className="member-table-user">

                              <div className="member-avatar">
                                <FaCalendarAlt />
                              </div>

                              <div>
                                <strong>
                                  Meeting #{meeting.meetingNumber}
                                </strong>

                                <span>
                                  Meeting Record
                                </span>
                              </div>

                            </div>

                          </td>

                          <td>
                            <strong className="member-number">
                              {meeting.meetingNumber}
                            </strong>
                          </td>

                          <td>
                            {meeting.meetingDate || '-'}
                          </td>

                          <td>
                            {getCycleName(meeting)}
                          </td>

                          <td>
                            {meeting.notes || '-'}
                          </td>

                          <td>

                            <div className="member-actions">

                              <button
                                type="button"
                                title="View"
                                onClick={() => handleView(meeting)}
                              >
                                <FaEye />
                              </button>

                              <button
                                type="button"
                                title="Edit"
                                onClick={() => openEditModal(meeting)}
                              >
                                <FaEdit />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                className="delete-action"
                                onClick={() => handleDelete(meeting)}
                              >
                                <FaTrash />
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

              {!loading &&
                filteredMeetings.length > 0 && (

                  <div className="members-pagination">

                    <span>
                      Showing {startIndex + 1}-
                      {Math.min(
                        startIndex + membersPerPage,
                        filteredMeetings.length
                      )}{' '}
                      of {filteredMeetings.length}
                    </span>

                    <div>

                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(page - 1, 1)
                          )
                        }
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (

                        <button
                          type="button"
                          key={page}
                          className={
                            currentPage === page
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            setCurrentPage(page)
                          }
                        >
                          {page}
                        </button>

                      ))}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(page + 1, totalPages)
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

      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div
          className="members-modal-backdrop"
          onMouseDown={closeModal}
        >

          <div
            className="members-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="members-modal-header">

              <div>

                <h3>
                  {editingMeeting
                    ? 'Edit Meeting'
                    : 'Add New Meeting'}
                </h3>

                <p>
                  {editingMeeting
                    ? 'Update meeting information.'
                    : 'Enter meeting information below.'}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="members-form-grid">

                {/* MEETING NUMBER */}

                <div className="members-form-group">

                  <label>
                    Meeting Number
                  </label>

                  <input
                    type="text"
                    name="meetingNumber"
                    value={form.meetingNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 1"
                    required
                    inputMode="numeric"
                  />

                </div>

                {/* MEETING DATE */}

                <div className="members-form-group">

                  <label>
                    Meeting Date
                  </label>

                  <input
                    type="date"
                    name="meetingDate"
                    value={form.meetingDate}
                    onChange={handleInputChange}
                    required
                  />

                </div>

                {/* FINANCIAL CYCLE */}

                <div className="members-form-group">

                  <label>
                    Financial Cycle
                  </label>

                  <select
                    name="cycleId"
                    value={form.cycleId}
                    onChange={handleInputChange}
                    required
                  >

                    <option value="">
                      Select Financial Cycle
                    </option>

                    {cycles.map((cycle) => (

                      <option
                        key={cycle.id}
                        value={cycle.id}
                      >
                        {cycle.name ||
                          cycle.cycleName ||
                          `Cycle #${cycle.id}`}
                      </option>

                    ))}

                  </select>

                </div>

                {/* NOTES */}

                <div className="members-form-group">

                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    placeholder="Enter meeting notes"
                    rows="4"
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="members-modal-footer">

                <button
                  type="button"
                  className="members-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="members-save-button"
                  disabled={saving}
                >
                  <FaPlus />

                  {editingMeeting
                    ? 'Update Meeting'
                    : 'Save Meeting'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Meetings
