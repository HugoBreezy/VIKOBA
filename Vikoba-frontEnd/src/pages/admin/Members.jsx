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
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from '../../services/api'

function Members() {
  const username =
    localStorage.getItem('vikoba_username') ||
    'Administrator'

  const profileRef = useRef(null)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('ALL')
  const [sortBy, setSortBy] =
    useState('NEWEST')

  const [currentPage, setCurrentPage] =
    useState(1)

  const [showModal, setShowModal] =
    useState(false)

  const [editingMember, setEditingMember] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [form, setForm] = useState({
    fullName: '',
    memberNumber: '',
    phone: '',
    email: '',
    gender: '',
    address: '',
    joinDate: new Date()
      .toISOString()
      .split('T')[0],
    status: 'ACTIVE',
  })

  const membersPerPage = 10

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadMembers = async () => {
    try {
      setLoading(true)

      const data = await getMembers()

      setMembers(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load members:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Members',
        text:
          error.message ||
          'Unable to load members.',
        confirmButtonText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // =====================================================
  // GENERATE NEXT MEMBER NUMBER
  // =====================================================

  const generateNextMemberNumber = () => {
    let highestNumber = 0

    members.forEach((member) => {
      const memberNumber =
        member.memberNumber || ''

      const match =
        memberNumber.match(/^VKB-(\d+)$/)

      if (match) {
        const number =
          Number(match[1])

        if (
          number > highestNumber
        ) {
          highestNumber = number
        }
      }
    })

    const nextNumber =
      highestNumber + 1

    return `VKB-${String(
      nextNumber
    ).padStart(3, '0')}`
  }

  // =====================================================
  // OUTSIDE PROFILE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
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
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      fullName: '',
      memberNumber: '',
      phone: '',
      email: '',
      gender: '',
      address: '',
      joinDate: new Date()
        .toISOString()
        .split('T')[0],
      status: 'ACTIVE',
    })
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingMember(null)

    setForm({
      fullName: '',
      memberNumber:
        generateNextMemberNumber(),
      phone: '',
      email: '',
      gender: '',
      address: '',
      joinDate: new Date()
        .toISOString()
        .split('T')[0],
      status: 'ACTIVE',
    })

    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (
    member
  ) => {
    setEditingMember(member)

    setForm({
      fullName:
        member.fullName || '',

      memberNumber:
        member.memberNumber || '',

      phone:
        member.phone || '',

      email:
        member.email || '',

      gender:
        member.gender || '',

      address:
        member.address || '',

      joinDate:
        member.joinDate ||
        new Date()
          .toISOString()
          .split('T')[0],

      status:
        member.status ||
        'ACTIVE',
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

    setEditingMember(null)

    resetForm()
  }

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (
    event
  ) => {
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
  // SAVE MEMBER
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (
      !form.fullName.trim()
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Full Name Required',
        text:
          'Please enter member full name.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.phone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Phone Required',
        text:
          'Please enter member phone number.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!/^0\d{9}$/.test(form.phone.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Phone Number',
        text:
          'Phone number must be exactly 10 digits and start with 0.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text:
          'Please enter member email address.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        form.email.trim()
      )
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text:
          'Please enter a valid email address.',
        confirmButtonText: 'OK',
      })

      return
    }

    try {
      setSaving(true)

      Swal.fire({
        title: editingMember
          ? 'Updating Member...'
          : 'Adding Member...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      if (editingMember) {
        await updateMember(
          editingMember.id,
          form
        )
      } else {
        await createMember(form)
      }

      Swal.close()

      await Swal.fire({
        icon: 'success',

        title: editingMember
          ? 'Member Updated Successfully'
          : 'Member Added Successfully',

        text: editingMember
          ? `${form.fullName} has been updated successfully.`
          : `${form.fullName} has been added as ${form.memberNumber}.`,

        confirmButtonText: 'OK',

        confirmButtonColor:
          '#1450c8',
      })

      setShowModal(false)

      setEditingMember(null)

      resetForm()

      await loadMembers()

    } catch (error) {
      console.error(
        'Failed to save member:',
        error
      )

      Swal.close()

      Swal.fire({
        icon: 'error',

        title: 'Operation Failed',

        text:
          error.message ||
          'Unable to save member.',

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
  // DELETE MEMBER
  // =====================================================

  const handleDelete = async (
    member
  ) => {
    const result =
      await Swal.fire({
        icon: 'warning',

        title: 'Delete Member?',

        text: `Are you sure you want to delete ${member.fullName}?`,

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

    if (
      !result.isConfirmed
    ) {
      return
    }

    try {
      await deleteMember(
        member.id
      )

      await Swal.fire({
        icon: 'success',

        title: 'Member Deleted',

        text: `${member.fullName} has been deleted successfully.`,

        confirmButtonText: 'OK',

        confirmButtonColor:
          '#1450c8',
      })

      await loadMembers()

    } catch (error) {
      Swal.fire({
        icon: 'error',

        title: 'Delete Failed',

        text:
          error.message ||
          'Unable to delete member.',

        confirmButtonText: 'OK',
      })
    }
  }

  // =====================================================
  // VIEW MEMBER
  // =====================================================

  const handleView = (
    member
  ) => {
    Swal.fire({
      title: member.fullName,

      html: `
        <div style="text-align:left; line-height:1.8;">
          <strong>Member Number:</strong>
          ${member.memberNumber || '-'}
          <br/>

          <strong>Phone:</strong>
          ${member.phone || '-'}
          <br/>

          <strong>Email:</strong>
          ${member.email || '-'}
          <br/>

          <strong>Gender:</strong>
          ${member.gender || '-'}
          <br/>

          <strong>Address:</strong>
          ${member.address || '-'}
          <br/>

          <strong>Join Date:</strong>
          ${member.joinDate || '-'}
          <br/>

          <strong>Status:</strong>
          ${member.status || '-'}
        </div>
      `,

      confirmButtonText: 'Close',

      confirmButtonColor:
        '#1450c8',
    })
  }

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredMembers =
    members
      .filter((member) => {
        const query =
          search
            .toLowerCase()
            .trim()

        if (!query) {
          return true
        }

        return (
          member.fullName
            ?.toLowerCase()
            .includes(query) ||

          member.memberNumber
            ?.toLowerCase()
            .includes(query) ||

          member.phone
            ?.toLowerCase()
            .includes(query) ||

          member.email
            ?.toLowerCase()
            .includes(query)
        )
      })

      .filter((member) => {
        if (
          statusFilter ===
          'ALL'
        ) {
          return true
        }

        return (
          member.status ===
          statusFilter
        )
      })

      .sort((a, b) => {
        if (
          sortBy === 'NAME'
        ) {
          return (
            a.fullName || ''
          ).localeCompare(
            b.fullName || ''
          )
        }

        if (
          sortBy === 'OLDEST'
        ) {
          return (
            new Date(
              a.joinDate || 0
            ) -
            new Date(
              b.joinDate || 0
            )
          )
        }

        return (
          new Date(
            b.joinDate || 0
          ) -
          new Date(
            a.joinDate || 0
          )
        )
      })

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      filteredMembers.length /
        membersPerPage
    )

  const startIndex =
    (currentPage - 1) *
    membersPerPage

  const paginatedMembers =
    filteredMembers.slice(
      startIndex,
      startIndex +
        membersPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    statusFilter,
    sortBy,
  ])

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = () => {
    if (
      members.length === 0
    ) {
      Swal.fire({
        icon: 'info',

        title: 'No Members',

        text:
          'There are no members to export.',

        confirmButtonText: 'OK',
      })

      return
    }

    const headers = [
      'ID',
      'Member Number',
      'Full Name',
      'Phone',
      'Email',
      'Gender',
      'Address',
      'Join Date',
      'Status',
    ]

    const rows =
      members.map(
        (member) => [
          member.id || '',
          member.memberNumber || '',
          member.fullName || '',
          member.phone || '',
          member.email || '',
          member.gender || '',
          member.address || '',
          member.joinDate || '',
          member.status || '',
        ]
      )

    const csvContent =
      [
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

    const blob =
      new Blob(
        [csvContent],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        'a'
      )

    link.href = url

    link.download =
      'vikoba-members.csv'

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )

    URL.revokeObjectURL(
      url
    )
  }

  const activeMembers =
    members.filter(
      (member) =>
        member.status ===
        'ACTIVE'
    ).length

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <FaWallet />
          </div>

          <div className="sidebar-brand-text">
            <h2>VIKOBA</h2>

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
            className="sidebar-link active"
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

          {/* =================================================
              LOANS - NAVIGATE TO LOANS PAGE
          ================================================= */}

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

        {/* =================================================
            MEMBERS CONTENT
        ================================================= */}

        <div className="dashboard-content">

          <div className="members-page">

            {/* PAGE HEADER */}

            <div className="members-header">

              <div>

                <span className="dashboard-welcome">
                  MANAGEMENT
                </span>

                <h1>
                  Members
                </h1>

                <p>
                  Manage VIKOBA group members and their information.
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

                Add Member
              </button>

            </div>

            {/* SUMMARY */}

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaUsers />
                </div>

                <div>

                  <span>
                    Total Members
                  </span>

                  <strong>
                    {members.length}
                  </strong>

                </div>

              </div>

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaUsers />
                </div>

                <div>

                  <span>
                    Active Members
                  </span>

                  <strong>
                    {activeMembers}
                  </strong>

                </div>

              </div>

              <div className="members-summary-card">

                <div className="members-summary-icon">
                  <FaFilter />
                </div>

                <div>

                  <span>
                    Showing
                  </span>

                  <strong>
                    {
                      filteredMembers.length
                    }
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
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search members..."
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
                    value={
                      statusFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="ALL">
                      All Status
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>

                  </select>

                  <select
                    value={sortBy}
                    onChange={(
                      event
                    ) =>
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

                    <option value="NAME">
                      Name
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
                      Loading members...
                    </span>

                  </div>

                ) : paginatedMembers.length === 0 ? (

                  <div className="members-empty">

                    <FaUsers />

                    <h3>
                      No Members Found
                    </h3>

                    <p>
                      No members match your current search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />

                      Add Member
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
                          MEMBER NUMBER
                        </th>

                        <th>
                          PHONE
                        </th>

                        <th>
                          EMAIL
                        </th>

                        <th>
                          JOIN DATE
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTIONS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedMembers.map(
                        (member) => (

                          <tr
                            key={
                              member.id
                            }
                          >

                            <td>

                              <div className="member-table-user">

                                <div className="member-avatar">

                                  {member.fullName
                                    ?.charAt(
                                      0
                                    )
                                    .toUpperCase() ||
                                    'M'}

                                </div>

                                <div>

                                  <strong>
                                    {
                                      member.fullName
                                    }
                                  </strong>

                                  <span>
                                    {
                                      member.gender ||
                                      'Member'
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <strong className="member-number">
                                {
                                  member.memberNumber
                                }
                              </strong>

                            </td>

                            <td>
                              {
                                member.phone ||
                                '-'
                              }
                            </td>

                            <td>
                              {
                                member.email ||
                                '-'
                              }
                            </td>

                            <td>
                              {
                                member.joinDate ||
                                '-'
                              }
                            </td>

                            <td>

                              <span
                                className={
                                  member.status ===
                                  'ACTIVE'
                                    ? 'member-status active'
                                    : 'member-status inactive'
                                }
                              >

                                <span></span>

                                {
                                  member.status ||
                                  'UNKNOWN'
                                }

                              </span>

                            </td>

                            <td>

                              <div className="member-actions">

                                <button
                                  type="button"
                                  title="View"
                                  onClick={() =>
                                    handleView(
                                      member
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
                                      member
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
                                      member
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

              {!loading &&
                filteredMembers.length >
                  0 && (

                  <div className="members-pagination">

                    <span>

                      Showing{' '}

                      {startIndex + 1}

                      -

                      {Math.min(
                        startIndex +
                          membersPerPage,
                        filteredMembers.length
                      )}{' '}

                      of{' '}

                      {
                        filteredMembers.length
                      }

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
                        (
                          _,
                          index
                        ) =>
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

      {/* =================================================
          ADD / EDIT MEMBER MODAL
      ================================================= */}

      {showModal && (

        <div
          className="members-modal-backdrop"
          onMouseDown={
            closeModal
          }
        >

          <div
            className="members-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="members-modal-header">

              <div>

                <h3>

                  {editingMember
                    ? 'Edit Member'
                    : 'Add New Member'}

                </h3>

                <p>

                  {editingMember
                    ? 'Update member information.'
                    : 'Enter member information below.'}

                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
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

                {/* FULL NAME */}

                <div className="members-form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      form.fullName
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter full name"
                    required
                  />

                </div>

                {/* MEMBER NUMBER */}

                <div className="members-form-group">

                  <label>
                    Member Number
                  </label>

                  <input
                    type="text"
                    name="memberNumber"
                    value={
                      form.memberNumber
                    }
                    readOnly
                  />

                </div>

                {/* PHONE */}

                <div className="members-form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(/\D/g, '')

                      setForm((previous) => ({
                        ...previous,
                        phone: value,
                      }))
                    }}
                    placeholder="e.g. 0712345678"
                    required
                    maxLength="10"
                    inputMode="numeric"
                  />

                </div>

                {/* EMAIL */}

                <div className="members-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="member@email.com"
                    required
                  />

                </div>

                {/* GENDER */}

                <div className="members-form-group">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={
                      form.gender
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                  </select>

                </div>

                {/* JOIN DATE */}

                <div className="members-form-group">

                  <label>
                    Join Date
                  </label>

                  <input
                    type="date"
                    name="joinDate"
                    value={
                      form.joinDate
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>

                {/* STATUS */}

                <div className="members-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>

                  </select>

                </div>

                {/* ADDRESS */}

                <div className="members-form-group">

                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={
                      form.address
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter address"
                  />

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="members-modal-footer">

                <button
                  type="button"
                  className="members-cancel-button"
                  onClick={
                    closeModal
                  }
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

                  {editingMember
                    ? 'Update Member'
                    : 'Save Member'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Members