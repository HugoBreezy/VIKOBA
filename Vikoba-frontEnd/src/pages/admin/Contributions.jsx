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
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
  getMembers,
  getMeetings,
  getFinancialCycles,
} from '../../services/api'

function Contributions() {
  const username =
    localStorage.getItem('vikoba_username') ||
    'Administrator'

  const profileRef = useRef(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const [contributions, setContributions] = useState([])
  const [members, setMembers] = useState([])
  const [meetings, setMeetings] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [cycleFilter, setCycleFilter] = useState('ALL')
  const [memberFilter, setMemberFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editingContribution, setEditingContribution] = useState(null)

  const [form, setForm] = useState({
    memberId: '',
    cycleId: '',
    meetingId: '',
    amount: '',
    contributionDate: new Date()
      .toISOString()
      .split('T')[0],
  })

  const contributionsPerPage = 10

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true)

      const [
        contributionData,
        memberData,
        meetingData,
        cycleData,
      ] = await Promise.all([
        getContributions(),
        getMembers(),
        getMeetings(),
        getFinancialCycles(),
      ])

      setContributions(
        Array.isArray(contributionData)
          ? contributionData
          : []
      )

      setMembers(
        Array.isArray(memberData)
          ? memberData
          : []
      )

      setMeetings(
        Array.isArray(meetingData)
          ? meetingData
          : []
      )

      setCycles(
        Array.isArray(cycleData)
          ? cycleData
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load contribution data:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Contributions',
        text:
          error.message ||
          'Unable to load contribution data.',
        confirmButtonText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // =====================================================
  // OUTSIDE PROFILE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
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
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem('vikoba_token')
    localStorage.removeItem('vikoba_username')
    localStorage.removeItem('vikoba_role')
    localStorage.removeItem('vikoba_remember_me')

    sessionStorage.clear()

    window.location.replace('/')
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      memberId: '',
      cycleId: '',
      meetingId: '',
      amount: '',
      contributionDate: new Date()
        .toISOString()
        .split('T')[0],
    })
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingContribution(null)
    resetForm()
    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (contribution) => {
    setEditingContribution(contribution)

    setForm({
      memberId:
        contribution.member?.id?.toString() || '',
      cycleId:
        contribution.cycle?.id?.toString() || '',
      meetingId:
        contribution.meeting?.id?.toString() || '',
      amount:
        contribution.amount?.toString() || '',
      contributionDate:
        contribution.contributionDate ||
        new Date()
          .toISOString()
          .split('T')[0],
    })

    setShowModal(true)
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) {
      return
    }

    setShowModal(false)
    setEditingContribution(null)
    resetForm()
  }

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (event) => {
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
  // SAVE CONTRIBUTION
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.memberId) {
      Swal.fire({
        icon: 'warning',
        title: 'Member Required',
        text: 'Please select a member.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.cycleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Financial Cycle Required',
        text:
          'Please select a financial cycle.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.meetingId) {
      Swal.fire({
        icon: 'warning',
        title: 'Meeting Required',
        text: 'Please select a meeting.',
        confirmButtonText: 'OK',
      })

      return
    }

    const amount = Number(form.amount)

    if (
      !form.amount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text:
          'Contribution amount must be greater than zero.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.contributionDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Date Required',
        text:
          'Please select contribution date.',
        confirmButtonText: 'OK',
      })

      return
    }

    const selectedDate = new Date(
      `${form.contributionDate}T00:00:00`
    )

    const today = new Date()

    today.setHours(
      0,
      0,
      0,
      0
    )

    if (selectedDate > today) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date',
        text:
          'Contribution date cannot be in the future.',
        confirmButtonText: 'OK',
      })

      return
    }

    try {
      setSaving(true)

      Swal.fire({
        title: editingContribution
          ? 'Updating Contribution...'
          : 'Adding Contribution...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const contributionData = {
        member: {
          id: Number(form.memberId),
        },

        cycle: {
          id: Number(form.cycleId),
        },

        meeting: {
          id: Number(form.meetingId),
        },

        amount,

        contributionDate:
          form.contributionDate,
      }

      if (editingContribution) {
        await updateContribution(
          editingContribution.id,
          contributionData
        )
      } else {
        await createContribution(
          contributionData
        )
      }

      Swal.close()

      await Swal.fire({
        icon: 'success',
        title: editingContribution
          ? 'Contribution Updated Successfully'
          : 'Contribution Added Successfully',
        text: editingContribution
          ? 'The contribution has been updated successfully.'
          : 'The contribution has been recorded successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })

      setShowModal(false)
      setEditingContribution(null)
      resetForm()

      await loadData()
    } catch (error) {
      console.error(
        'Failed to save contribution:',
        error
      )

      Swal.close()

      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text:
          error.message ||
          'Unable to save contribution.',
        confirmButtonText:
          'Try Again',
        confirmButtonColor:
          '#dc3545',
      })
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // DELETE CONTRIBUTION
  // =====================================================

  const handleDelete = async (contribution) => {
    const memberName =
      contribution.member?.fullName ||
      `Member #${
        contribution.member?.id || ''
      }`

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Contribution?',
      text:
        `Are you sure you want to delete this contribution for ${memberName}?`,
      showCancelButton: true,
      confirmButtonText:
        'Yes, Delete',
      cancelButtonText:
        'Cancel',
      confirmButtonColor:
        '#dc3545',
      cancelButtonColor:
        '#6c757d',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await deleteContribution(
        contribution.id
      )

      await Swal.fire({
        icon: 'success',
        title: 'Contribution Deleted',
        text:
          'The contribution has been deleted successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })

      await loadData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text:
          error.message ||
          'Unable to delete contribution.',
        confirmButtonText: 'OK',
      })
    }
  }

  // =====================================================
  // VIEW CONTRIBUTION
  // =====================================================

  const handleView = (contribution) => {
    const memberName =
      contribution.member?.fullName ||
      '-'

    const memberNumber =
      contribution.member?.memberNumber ||
      '-'

    const cycleName =
      contribution.cycle?.name ||
      contribution.cycle?.cycleName ||
      `Cycle #${
        contribution.cycle?.id || '-'
      }`

    const meetingNumber =
      contribution.meeting?.meetingNumber ||
      '-'

    const meetingDate =
      contribution.meeting?.meetingDate ||
      '-'

    const amount = Number(
      contribution.amount || 0
    ).toLocaleString()

    Swal.fire({
      title:
        'Contribution Details',

      html: `
        <div style="text-align:left; line-height:1.9;">
          <strong>Member:</strong>
          ${memberName}
          <br/>

          <strong>Member Number:</strong>
          ${memberNumber}
          <br/>

          <strong>Financial Cycle:</strong>
          ${cycleName}
          <br/>

          <strong>Meeting Number:</strong>
          ${meetingNumber}
          <br/>

          <strong>Meeting Date:</strong>
          ${meetingDate}
          <br/>

          <strong>Amount:</strong>
          TZS ${amount}
          <br/>

          <strong>Contribution Date:</strong>
          ${
            contribution.contributionDate ||
            '-'
          }
        </div>
      `,

      confirmButtonText:
        'Close',

      confirmButtonColor:
        '#1450c8',
    })
  }

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredContributions =
    contributions
      .filter((contribution) => {
        const query =
          search
            .toLowerCase()
            .trim()

        if (!query) {
          return true
        }

        const memberName =
          contribution.member?.fullName ||
          ''

        const memberNumber =
          contribution.member?.memberNumber ||
          ''

        const amount = String(
          contribution.amount || ''
        )

        const date =
          contribution.contributionDate ||
          ''

        const cycleName =
          contribution.cycle?.name ||
          contribution.cycle?.cycleName ||
          ''

        return (
          memberName
            .toLowerCase()
            .includes(query) ||
          memberNumber
            .toLowerCase()
            .includes(query) ||
          amount
            .toLowerCase()
            .includes(query) ||
          date
            .toLowerCase()
            .includes(query) ||
          cycleName
            .toLowerCase()
            .includes(query)
        )
      })

      .filter((contribution) => {
        if (cycleFilter === 'ALL') {
          return true
        }

        return (
          String(
            contribution.cycle?.id || ''
          ) ===
          String(cycleFilter)
        )
      })

      .filter((contribution) => {
        if (memberFilter === 'ALL') {
          return true
        }

        return (
          String(
            contribution.member?.id || ''
          ) ===
          String(memberFilter)
        )
      })

      .sort((a, b) => {
        if (sortBy === 'AMOUNT_HIGH') {
          return (
            Number(b.amount || 0) -
            Number(a.amount || 0)
          )
        }

        if (sortBy === 'AMOUNT_LOW') {
          return (
            Number(a.amount || 0) -
            Number(b.amount || 0)
          )
        }

        if (sortBy === 'OLDEST') {
          return (
            new Date(
              a.contributionDate || 0
            ) -
            new Date(
              b.contributionDate || 0
            )
          )
        }

        return (
          new Date(
            b.contributionDate || 0
          ) -
          new Date(
            a.contributionDate || 0
          )
        )
      })

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredContributions.length /
      contributionsPerPage
  )

  const startIndex =
    (currentPage - 1) *
    contributionsPerPage

  const paginatedContributions =
    filteredContributions.slice(
      startIndex,
      startIndex +
        contributionsPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    cycleFilter,
    memberFilter,
    sortBy,
  ])

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalAmount =
    contributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amount || 0
        ),
      0
    )

  const filteredAmount =
    filteredContributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amount || 0
        ),
      0
    )

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = () => {
    if (contributions.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Contributions',
        text:
          'There are no contributions to export.',
        confirmButtonText: 'OK',
      })

      return
    }

    const headers = [
      'ID',
      'Member Number',
      'Member Name',
      'Cycle',
      'Meeting Number',
      'Meeting Date',
      'Amount',
      'Contribution Date',
    ]

    const rows =
      contributions.map(
        (contribution) => [
          contribution.id || '',

          contribution.member
            ?.memberNumber || '',

          contribution.member
            ?.fullName || '',

          contribution.cycle?.name ||
            contribution.cycle
              ?.cycleName ||
            contribution.cycle?.id ||
            '',

          contribution.meeting
            ?.meetingNumber || '',

          contribution.meeting
            ?.meetingDate || '',

          contribution.amount || '',

          contribution.contributionDate ||
            '',
        ]
      )

    const csvContent =
      [headers, ...rows]
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
      'vikoba-contributions.csv'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

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
            className="sidebar-link active"
          >
            <FaMoneyBillWave />

            <span>
              Contributions
            </span>
          </a>

          {/* FIXED: LOANS NAVIGATION */}

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
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
          >
            <FaMoneyBillWave />

            <span>
              Expenses
            </span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
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
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
          >
            <FaChartPie />

            <span>
              Reports
            </span>
          </a>

// Settings
<a
  href="/settings"
  className="sidebar-link"
>
  <FaCog />
  <span>
    Settings
  </span>
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
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }
              >

                <div className="profile-avatar">
                  A
                </div>

                <div className="profile-info">

                  <strong>
                    {username}
                  </strong>

                  <span>
                    Administrator
                  </span>

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

                      <strong>
                        {username}
                      </strong>

                      <span>
                        Administrator
                      </span>

                    </div>

                  </div>

                  <div className="profile-dropdown-divider"></div>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                  >
                    <FaUserCircle />

                    <span>
                      My Profile
                    </span>
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                  >
                    <FaCog />

                    <span>
                      Settings
                    </span>
                  </button>

                  <div className="profile-dropdown-divider"></div>

                  <button
                    type="button"
                    className="profile-dropdown-item logout-item"
                    onClick={
                      handleLogout
                    }
                  >
                    <FaSignOutAlt />

                    <span>
                      Logout
                    </span>
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* CONTRIBUTIONS CONTENT */}

        <div className="dashboard-content">

          <div className="members-page">

            <div className="members-header">

              <div>

                <span className="dashboard-welcome">
                  FINANCIAL MANAGEMENT
                </span>

                <h1>
                  Contributions
                </h1>

                <p>
                  Record and manage member contributions for each meeting and financial cycle.
                </p>

              </div>

              <button
                type="button"
                className="members-add-button"
                onClick={
                  openAddModal
                }
              >
                <FaPlus />

                Add Contribution
              </button>

            </div>

            {/* SUMMARY */}

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaMoneyBillWave />
                </div>

                <div>

                  <span>
                    Total Contributions
                  </span>

                  <strong>
                    {
                      contributions.length
                    }
                  </strong>

                </div>

              </div>

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaWallet />
                </div>

                <div>

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    TZS{' '}
                    {totalAmount.toLocaleString()}
                  </strong>

                </div>

              </div>

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaFilter />
                </div>

                <div>

                  <span>
                    Showing Amount
                  </span>

                  <strong>
                    TZS{' '}
                    {filteredAmount.toLocaleString()}
                  </strong>

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
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search contributions..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch('')
                      }
                    >
                      <FaTimes />
                    </button>
                  )}

                </div>

                <div className="members-toolbar-actions">

                  <select
                    value={cycleFilter}
                    onChange={(event) =>
                      setCycleFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="ALL">
                      All Cycles
                    </option>

                    {cycles.map(
                      (cycle) => (
                        <option
                          key={cycle.id}
                          value={cycle.id}
                        >
                          {
                            cycle.name ||
                            cycle.cycleName ||
                            `Cycle #${cycle.id}`
                          }
                        </option>
                      )
                    )}

                  </select>

                  <select
                    value={memberFilter}
                    onChange={(event) =>
                      setMemberFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="ALL">
                      All Members
                    </option>

                    {members.map(
                      (member) => (
                        <option
                          key={member.id}
                          value={member.id}
                        >
                          {
                            member.fullName
                          }
                        </option>
                      )
                    )}

                  </select>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                  >

                    <option value="NEWEST">
                      Newest
                    </option>

                    <option value="OLDEST">
                      Oldest
                    </option>

                    <option value="AMOUNT_HIGH">
                      Amount: High to Low
                    </option>

                    <option value="AMOUNT_LOW">
                      Amount: Low to High
                    </option>

                  </select>

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

                </div>

              </div>

              <div className="members-table-wrapper">

                {loading ? (

                  <div className="members-loading">

                    <div className="spinner-border"></div>

                    <span>
                      Loading contributions...
                    </span>

                  </div>

                ) : paginatedContributions.length === 0 ? (

                  <div className="members-empty">

                    <FaMoneyBillWave />

                    <h3>
                      No Contributions Found
                    </h3>

                    <p>
                      No contributions match your current search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />

                      Add Contribution
                    </button>

                  </div>

                ) : (

                  <table className="members-table">

                    <thead>

                      <tr>

                        <th>
                          MEMBER
                        </th>

                        <th>
                          CYCLE
                        </th>

                        <th>
                          MEETING
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          CONTRIBUTION DATE
                        </th>

                        <th>
                          ACTIONS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedContributions.map(
                        (contribution) => {

                          const member =
                            contribution.member

                          const cycle =
                            contribution.cycle

                          const meeting =
                            contribution.meeting

                          return (
                            <tr
                              key={
                                contribution.id
                              }
                            >

                              <td>

                                <div className="member-table-user">

                                  <div className="member-avatar">

                                    {member?.fullName
                                      ?.charAt(0)
                                      .toUpperCase() ||
                                      'M'}

                                  </div>

                                  <div>

                                    <strong>
                                      {
                                        member?.fullName ||
                                        'Unknown Member'
                                      }
                                    </strong>

                                    <span>
                                      {
                                        member?.memberNumber ||
                                        '-'
                                      }
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>

                                {
                                  cycle?.name ||
                                  cycle?.cycleName ||
                                  `Cycle #${
                                    cycle?.id ||
                                    '-'
                                  }`
                                }

                              </td>

                              <td>

                                <strong>
                                  #
                                  {
                                    meeting?.meetingNumber ||
                                    '-'
                                  }
                                </strong>

                                <br />

                                <small>
                                  {
                                    meeting?.meetingDate ||
                                    '-'
                                  }
                                </small>

                              </td>

                              <td>

                                <strong className="member-number">

                                  TZS{' '}

                                  {Number(
                                    contribution.amount ||
                                      0
                                  ).toLocaleString()}

                                </strong>

                              </td>

                              <td>
                                {
                                  contribution.contributionDate ||
                                  '-'
                                }
                              </td>

                              <td>

                                <div className="member-actions">

                                  <button
                                    type="button"
                                    title="View"
                                    onClick={() =>
                                      handleView(
                                        contribution
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
                                        contribution
                                      )
                                    }
                                  >
                                    <FaEdit />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete"
                                    className="delete-action"
                                    onClick={() =>
                                      handleDelete(
                                        contribution
                                      )
                                    }
                                  >
                                    <FaTrash />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        }
                      )}

                    </tbody>

                  </table>

                )}

              </div>

              {!loading &&
                filteredContributions.length > 0 && (

                <div className="members-pagination">

                  <span>

                    Showing{' '}

                    {
                      startIndex + 1
                    }

                    -

                    {Math.min(
                      startIndex +
                        contributionsPerPage,
                      filteredContributions.length
                    )}{' '}

                    of{' '}

                    {
                      filteredContributions.length
                    }

                  </span>

                  <div>

                    <button
                      type="button"
                      disabled={
                        currentPage === 1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              1
                            )
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
                            currentPage === page
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                        >
                          {
                            page
                          }
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
                            Math.min(
                              page + 1,
                              totalPages
                            )
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
          onMouseDown={
            closeModal
          }
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
                  {
                    editingContribution
                      ? 'Edit Contribution'
                      : 'Add New Contribution'
                  }
                </h3>

                <p>
                  {
                    editingContribution
                      ? 'Update contribution information.'
                      : 'Enter contribution information below.'
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="members-form-grid">

                <div className="members-form-group">

                  <label>
                    Member
                  </label>

                  <select
                    name="memberId"
                    value={
                      form.memberId
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                  >

                    <option value="">
                      Select Member
                    </option>

                    {members.map(
                      (member) => (
                        <option
                          key={member.id}
                          value={member.id}
                        >
                          {
                            member.memberNumber
                              ? `${member.memberNumber} - ${member.fullName}`
                              : member.fullName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="members-form-group">

                  <label>
                    Financial Cycle
                  </label>

                  <select
                    name="cycleId"
                    value={
                      form.cycleId
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                  >

                    <option value="">
                      Select Financial Cycle
                    </option>

                    {cycles.map(
                      (cycle) => (
                        <option
                          key={cycle.id}
                          value={cycle.id}
                        >
                          {
                            cycle.name ||
                            cycle.cycleName ||
                            `Cycle #${cycle.id}`
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="members-form-group">

                  <label>
                    Meeting
                  </label>

                  <select
                    name="meetingId"
                    value={
                      form.meetingId
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                  >

                    <option value="">
                      Select Meeting
                    </option>

                    {meetings.map(
                      (meeting) => (
                        <option
                          key={meeting.id}
                          value={meeting.id}
                        >
                          {`Meeting #${
                            meeting.meetingNumber ||
                            meeting.id
                          } - ${
                            meeting.meetingDate ||
                            ''
                          }`}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="members-form-group">

                  <label>
                    Contribution Amount (TZS)
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={
                      form.amount
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />

                </div>

                <div className="members-form-group">

                  <label>
                    Contribution Date
                  </label>

                  <input
                    type="date"
                    name="contributionDate"
                    value={
                      form.contributionDate
                    }
                    onChange={
                      handleInputChange
                    }
                    max={
                      new Date()
                        .toISOString()
                        .split('T')[0]
                    }
                    required
                  />

                </div>

              </div>

              <div className="members-modal-footer">

                <button
                  type="button"
                  className="members-cancel-button"
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
                  className="members-save-button"
                  disabled={
                    saving
                  }
                >

                  <FaPlus />

                  {
                    editingContribution
                      ? 'Update Contribution'
                      : 'Save Contribution'
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Contributions