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

import {
  getLoans,
  getMembers,
  getFinancialCycles,
} from '../../services/api'

const API_BASE_URL = 'http://localhost:8080'

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('vikoba_token') || ''}`,
  'Content-Type': 'application/json',
})

const parseApiResponse = async (
  response,
  fallbackMessage
) => {
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

const createLoan = async (loan) => {
  const response = await fetch(
    `${API_BASE_URL}/api/loans`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(loan),
    }
  )

  return parseApiResponse(
    response,
    'Failed to create loan.'
  )
}

const updateLoan = async (id, loan) => {
  const response = await fetch(
    `${API_BASE_URL}/api/loans/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(loan),
    }
  )

  return parseApiResponse(
    response,
    'Failed to update loan.'
  )
}

const deleteLoan = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/loans/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    return parseApiResponse(
      response,
      'Failed to delete loan.'
    )
  }

  return true
}

function Loans() {
  const username =
    localStorage.getItem('vikoba_username') ||
    'Administrator'

  const profileRef = useRef(null)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [loans, setLoans] = useState([])
  const [members, setMembers] = useState([])
  const [cycles, setCycles] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const [memberFilter, setMemberFilter] =
    useState('ALL')

  const [cycleFilter, setCycleFilter] =
    useState('ALL')

  const [sortBy, setSortBy] =
    useState('NEWEST')

  const [currentPage, setCurrentPage] =
    useState(1)

  const loansPerPage = 10

  const [showModal, setShowModal] =
    useState(false)

  const [editingLoan, setEditingLoan] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [form, setForm] = useState({
    memberId: '',
    cycleId: '',
    principalAmount: '',
    interestRate: '',
    loanDate: '',
    status: 'ACTIVE',
  })

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const formatCurrency = (amount) =>
    new Intl.NumberFormat(
      'en-TZ',
      {
        maximumFractionDigits: 0,
      }
    ).format(
      Number(amount) || 0
    )

  const loadLoans = async () => {
    setLoading(true)

    try {
      const data = await getLoans()

      setLoans(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load loans:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Loans',
        text:
          error.message ||
          'Unable to load loans from the server.',
        confirmButtonText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSupportingData = async () => {
    try {
      const [
        membersData,
        cyclesData,
      ] = await Promise.all([
        getMembers(),
        getFinancialCycles(),
      ])

      setMembers(
        Array.isArray(membersData)
          ? membersData
          : []
      )

      setCycles(
        Array.isArray(cyclesData)
          ? cyclesData
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load supporting data:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Data',
        text:
          error.message ||
          'Unable to load members or financial cycles.',
        confirmButtonText: 'OK',
      })
    }
  }

  useEffect(() => {
    loadLoans()
    loadSupportingData()
  }, [])

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

  const resetForm = () => {
    setForm({
      memberId: '',
      cycleId: '',
      principalAmount: '',
      interestRate: '',
      loanDate: today,
      status: 'ACTIVE',
    })
  }

  const openAddModal = () => {
    setEditingLoan(null)

    setForm({
      memberId: '',
      cycleId: '',
      principalAmount: '',
      interestRate: '',
      loanDate: today,
      status: 'ACTIVE',
    })

    setShowModal(true)
  }

  const openEditModal = (loan) => {
    setEditingLoan(loan)

    setForm({
      memberId:
        loan.member?.id?.toString() ||
        '',
      cycleId:
        loan.cycle?.id?.toString() ||
        '',
      principalAmount:
        loan.principalAmount ?? '',
      interestRate:
        loan.interestRate ?? '',
      loanDate:
        loan.loanDate || today,
      status:
        loan.status || 'ACTIVE',
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setShowModal(false)
    setEditingLoan(null)
    resetForm()
  }

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    )
  }

  const selectedMember = useMemo(
    () =>
      members.find(
        (member) =>
          String(member.id) ===
          String(form.memberId)
      ),
    [
      members,
      form.memberId,
    ]
  )

  const selectedCycle = useMemo(
    () =>
      cycles.find(
        (cycle) =>
          String(cycle.id) ===
          String(form.cycleId)
      ),
    [
      cycles,
      form.cycleId,
    ]
  )

  const calculateInterestPreview =
    () => {
      const principal =
        Number(
          form.principalAmount
        ) || 0

      const rate =
        Number(
          form.interestRate
        ) || 0

      return (
        principal *
        (rate / 100)
      )
    }

  const calculateTotalPreview =
    () => {
      return (
        (Number(
          form.principalAmount
        ) || 0) +
        calculateInterestPreview()
      )
    }

  const calculateWeeklyPreview =
    () => {
      return (
        calculateTotalPreview() /
        12
      )
    }

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    if (!form.memberId) {
      Swal.fire({
        icon: 'warning',
        title: 'Member Required',
        text:
          'Please select a member.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.cycleId) {
      Swal.fire({
        icon: 'warning',
        title:
          'Financial Cycle Required',
        text:
          'Please select a financial cycle.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (
      !form.principalAmount ||
      Number(
        form.principalAmount
      ) <= 0
    ) {
      Swal.fire({
        icon: 'warning',
        title:
          'Invalid Principal Amount',
        text:
          'Principal amount must be greater than zero.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (
      form.interestRate === '' ||
      Number(
        form.interestRate
      ) < 0
    ) {
      Swal.fire({
        icon: 'warning',
        title:
          'Invalid Interest Rate',
        text:
          'Interest rate cannot be negative.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (!form.loanDate) {
      Swal.fire({
        icon: 'warning',
        title:
          'Loan Date Required',
        text:
          'Please select the loan date.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (
      form.loanDate > today
    ) {
      Swal.fire({
        icon: 'warning',
        title:
          'Invalid Loan Date',
        text:
          'Loan date cannot be in the future.',
        confirmButtonText: 'OK',
      })

      return
    }

    if (
      selectedCycle?.status &&
      selectedCycle.status !== 'OPEN' &&
      !editingLoan
    ) {
      Swal.fire({
        icon: 'warning',
        title:
          'Cycle Is Not Open',
        text:
          'A new loan can only be created in an OPEN financial cycle.',
        confirmButtonText: 'OK',
      })

      return
    }

    setSaving(true)

    try {
      const loanData = {
        member: {
          id: Number(
            form.memberId
          ),
        },

        cycle: {
          id: Number(
            form.cycleId
          ),
        },

        principalAmount:
          Number(
            form.principalAmount
          ),

        interestRate:
          Number(
            form.interestRate
          ),

        loanDate:
          form.loanDate,
      }

      if (editingLoan) {
        await updateLoan(
          editingLoan.id,
          loanData
        )
      } else {
        await createLoan(
          loanData
        )
      }

      setShowModal(false)
      setEditingLoan(null)
      resetForm()

      await loadLoans()

      await Swal.fire({
        icon: 'success',
        title: editingLoan
          ? 'Loan Updated'
          : 'Loan Created',
        text: editingLoan
          ? 'Loan has been updated successfully.'
          : 'Loan has been created successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })
    } catch (error) {
      console.error(
        'Failed to save loan:',
        error
      )

      setShowModal(false)
      setEditingLoan(null)
      resetForm()

      await new Promise((resolve) =>
        setTimeout(resolve, 0)
      )

      Swal.fire({
        icon: 'error',
        title:
          'Operation Failed',
        text:
          error.message ||
          'Unable to save loan.',
        confirmButtonText:
          'Try Again',
        confirmButtonColor:
          '#dc3545',
        zIndex: 200000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete =
    async (loan) => {
      const memberName =
        loan.member?.fullName ||
        'this member'

      const result =
        await Swal.fire({
          icon: 'warning',
          title: 'Delete Loan?',
          text:
            `Are you sure you want to delete the loan for ${memberName}?`,
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
        await deleteLoan(
          loan.id
        )

        await loadLoans()

        Swal.fire({
          icon: 'success',
          title: 'Loan Deleted',
          text:
            'Loan has been deleted successfully.',
          confirmButtonText:
            'OK',
          confirmButtonColor:
            '#1450c8',
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title:
            'Delete Failed',
          text:
            error.message ||
            'Unable to delete loan.',
          confirmButtonText:
            'OK',
        })
      }
    }

  const handleView = (loan) => {
    const memberName =
      loan.member?.fullName ||
      '-'

    const memberNumber =
      loan.member?.memberNumber ||
      '-'

    const cycleName =
      loan.cycle?.name ||
      '-'

    Swal.fire({
      title: 'Loan Details',
      html: `
        <div style="text-align:left;line-height:1.9;">
          <strong>Member:</strong>
          ${memberName}
          <br />

          <strong>Member Number:</strong>
          ${memberNumber}
          <br />

          <strong>Financial Cycle:</strong>
          ${cycleName}
          <br />

          <strong>Principal:</strong>
          TSh ${formatCurrency(
            loan.principalAmount
          )}
          <br />

          <strong>Interest Rate:</strong>
          ${loan.interestRate ?? 0}%
          <br />

          <strong>Interest:</strong>
          TSh ${formatCurrency(
            loan.interestAmount
          )}
          <br />

          <strong>Total:</strong>
          TSh ${formatCurrency(
            loan.totalAmount
          )}
          <br />

          <strong>Loan Date:</strong>
          ${loan.loanDate || '-'}
          <br />

          <strong>Due Date:</strong>
          ${loan.dueDate || '-'}
          <br />

          <strong>Status:</strong>
          ${loan.status || '-'}
        </div>
      `,
      confirmButtonText:
        'Close',
      confirmButtonColor:
        '#1450c8',
    })
  }

  const filteredLoans =
    loans
      .filter((loan) => {
        const query =
          search
            .toLowerCase()
            .trim()

        if (!query) {
          return true
        }

        const memberName =
          loan.member?.fullName ||
          ''

        const memberNumber =
          loan.member?.memberNumber ||
          ''

        const cycleName =
          loan.cycle?.name ||
          ''

        return (
          memberName
            .toLowerCase()
            .includes(query) ||
          memberNumber
            .toLowerCase()
            .includes(query) ||
          cycleName
            .toLowerCase()
            .includes(query) ||
          String(
            loan.id || ''
          ).includes(query)
        )
      })
      .filter((loan) => {
        if (
          statusFilter ===
          'ALL'
        ) {
          return true
        }

        return (
          loan.status ===
          statusFilter
        )
      })
      .filter((loan) => {
        if (
          memberFilter ===
          'ALL'
        ) {
          return true
        }

        return (
          String(
            loan.member?.id
          ) ===
          String(
            memberFilter
          )
        )
      })
      .filter((loan) => {
        if (
          cycleFilter ===
          'ALL'
        ) {
          return true
        }

        return (
          String(
            loan.cycle?.id
          ) ===
          String(
            cycleFilter
          )
        )
      })
      .sort((a, b) => {
        if (
          sortBy ===
          'OLDEST'
        ) {
          return (
            new Date(
              a.loanDate || 0
            ) -
            new Date(
              b.loanDate || 0
            )
          )
        }

        if (
          sortBy ===
          'AMOUNT_HIGH'
        ) {
          return (
            Number(
              b.principalAmount ||
                0
            ) -
            Number(
              a.principalAmount ||
                0
            )
          )
        }

        if (
          sortBy ===
          'AMOUNT_LOW'
        ) {
          return (
            Number(
              a.principalAmount ||
                0
            ) -
            Number(
              b.principalAmount ||
                0
            )
          )
        }

        return (
          new Date(
            b.loanDate || 0
          ) -
          new Date(
            a.loanDate || 0
          )
        )
      })

  const totalPages =
    Math.ceil(
      filteredLoans.length /
        loansPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) *
    loansPerPage

  const paginatedLoans =
    filteredLoans.slice(
      startIndex,
      startIndex +
        loansPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    statusFilter,
    memberFilter,
    cycleFilter,
    sortBy,
  ])

  const activeLoans =
    loans.filter(
      (loan) =>
        loan.status ===
        'ACTIVE'
    ).length

  const pendingLoans =
    loans.filter(
      (loan) =>
        loan.status ===
        'PENDING'
    ).length

  const totalPrincipal =
    loans.reduce(
      (total, loan) =>
        total +
        Number(
          loan.principalAmount ||
            0
        ),
      0
    )

  const handleExport = () => {
    if (loans.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Loans',
        text:
          'There are no loans to export.',
        confirmButtonText:
          'OK',
      })

      return
    }

    const headers = [
      'ID',
      'Member Number',
      'Member Name',
      'Cycle',
      'Principal Amount',
      'Interest Rate',
      'Interest Amount',
      'Total Amount',
      'Loan Date',
      'Due Date',
      'Status',
    ]

    const rows = loans.map(
      (loan) => [
        loan.id || '',
        loan.member
          ?.memberNumber || '',
        loan.member?.fullName ||
          '',
        loan.cycle?.name || '',
        loan.principalAmount ||
          '',
        loan.interestRate || '',
        loan.interestAmount ||
          '',
        loan.totalAmount || '',
        loan.loanDate || '',
        loan.dueDate || '',
        loan.status || '',
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
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        'a'
      )

    link.href = url
    link.download =
      'vikoba-loans.csv'

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

    window.location.replace(
      '/'
    )
  }

  return (
    <div
      className="dashboard-page"
      style={{
        minHeight: '100vh',
      }}
    >

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
            className="sidebar-link active"
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
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
          >
            <FaFileInvoiceDollar />
            <span>
              Payments
            </span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
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

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
          >
            <FaCog />
            <span>
              Settings
            </span>
          </a>

        </nav>

      </aside>

      <main className="dashboard-main">

        <header className="dashboard-topbar">

          <div className="dashboard-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search loans..."
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

        <div className="dashboard-content">

          <div className="members-page">

            <div className="members-header">

              <div>

                <h1>
                  Loans
                </h1>

                <p>
                  Manage member loans and
                  repayment obligations.
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
                  Create Loan
                </button>

              </div>

            </div>

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div>

                  <span>
                    Total Loans
                  </span>

                  <strong>
                    {loans.length}
                  </strong>

                </div>

                <FaHandHoldingUsd />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Active Loans
                  </span>

                  <strong>
                    {activeLoans}
                  </strong>

                </div>

                <FaWallet />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Pending Loans
                  </span>

                  <strong>
                    {pendingLoans}
                  </strong>

                </div>

                <FaExclamationTriangle />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Total Principal
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalPrincipal
                    )}
                  </strong>

                </div>

                <FaMoneyBillWave />

              </div>

            </div>

            <div className="members-panel">

              <div className="members-toolbar">

                <div>

                  <div className="members-search">

                    <FaSearch />

                    <input
                      type="text"
                      placeholder="Search by member, number or cycle..."
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
                          {member.fullName}
                        </option>
                      )
                    )}

                  </select>

                  <select
                    className="form-select"
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
                          {cycle.name}
                        </option>
                      )
                    )}

                  </select>

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(event) =>
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

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="DEFAULT">
                      Default
                    </option>

                  </select>

                  <select
                    className="form-select"
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
                      Highest Amount
                    </option>

                    <option value="AMOUNT_LOW">
                      Lowest Amount
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
                      Loading loans...
                    </span>

                  </div>
                ) : paginatedLoans.length === 0 ? (
                  <div className="members-empty">

                    <FaHandHoldingUsd />

                    <h3>
                      No Loans Found
                    </h3>

                    <p>
                      No loans match your
                      current search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />
                      Create Loan
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
                          PRINCIPAL
                        </th>

                        <th>
                          INTEREST
                        </th>

                        <th>
                          TOTAL
                        </th>

                        <th>
                          LOAN DATE
                        </th>

                        <th>
                          DUE DATE
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

                      {paginatedLoans.map(
                        (loan) => (
                          <tr
                            key={loan.id}
                          >

                            <td>

                              <div className="member-table-user">

                                <div className="member-avatar">

                                  {(
                                    loan.member?.fullName ||
                                    'M'
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {loan.member?.fullName ||
                                      'Unknown Member'}
                                  </strong>

                                  <span>
                                    {loan.member?.memberNumber ||
                                      '-'}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>
                              {loan.cycle?.name ||
                                '-'}
                            </td>

                            <td>
                              TSh{' '}
                              {formatCurrency(
                                loan.principalAmount
                              )}
                            </td>

                            <td>

                              <div>
                                {loan.interestRate ??
                                  0}
                                %
                              </div>

                              <small>
                                TSh{' '}
                                {formatCurrency(
                                  loan.interestAmount
                                )}
                              </small>

                            </td>

                            <td>

                              <strong>
                                TSh{' '}
                                {formatCurrency(
                                  loan.totalAmount
                                )}
                              </strong>

                            </td>

                            <td>
                              {loan.loanDate ||
                                '-'}
                            </td>

                            <td>
                              {loan.dueDate ||
                                '-'}
                            </td>

                            <td>

                              <span
                                className={
                                  `badge ${
                                    loan.status ===
                                    'ACTIVE'
                                      ? 'bg-success'
                                      : loan.status ===
                                        'PENDING'
                                      ? 'bg-warning text-dark'
                                      : loan.status ===
                                        'COMPLETED'
                                      ? 'bg-primary'
                                      : 'bg-secondary'
                                  }`
                                }
                              >
                                {loan.status ||
                                  '-'}
                              </span>

                            </td>

                            <td>

                              <div className="member-actions">

                                <button
                                  type="button"
                                  title="View"
                                  onClick={() =>
                                    handleView(
                                      loan
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
                                      loan
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
                                      loan
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
                filteredLoans.length >
                  0 && (
                  <div className="members-pagination">

                    <span>
                      Showing{' '}
                      {startIndex + 1}
                      {' - '}
                      {Math.min(
                        startIndex +
                          loansPerPage,
                        filteredLoans.length
                      )}
                      {' of '}
                      {filteredLoans.length}
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
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
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
                  {editingLoan
                    ? 'Edit Loan'
                    : 'Create Loan'}
                </h3>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color: '#6c757d',
                  }}
                >
                  {editingLoan
                    ? 'Update loan information.'
                    : 'Enter the loan details below.'}
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
                  fontSize: '20px',
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                  color: '#6c757d',
                }}
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={
                handleSave
              }
            >

              <div
                style={{
                  padding: '24px',
                }}
              >

                <div className="row g-3">

                  <div className="col-md-6">

                    <label className="form-label">
                      Member
                    </label>

                    <select
                      className="form-select"
                      name="memberId"
                      value={
                        form.memberId
                      }
                      onChange={
                        handleChange
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
                            {member.memberNumber ||
                              `Member #${member.id}`}
                            {' - '}
                            {member.fullName}
                          </option>
                        )
                      )}

                    </select>

                    {selectedMember && (
                      <small className="text-muted">
                        Selected member:{' '}
                        {
                          selectedMember.fullName
                        }
                      </small>
                    )}

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      Financial Cycle
                    </label>

                    <select
                      className="form-select"
                      name="cycleId"
                      value={
                        form.cycleId
                      }
                      onChange={
                        handleChange
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
                            {cycle.name}
                            {cycle.status
                              ? ` (${cycle.status})`
                              : ''}
                          </option>
                        )
                      )}

                    </select>

                    {selectedCycle && (
                      <small
                        className={
                          selectedCycle.status ===
                          'OPEN'
                            ? 'text-success'
                            : 'text-danger'
                        }
                      >
                        Status:{' '}
                        {selectedCycle.status ||
                          'N/A'}
                      </small>
                    )}

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      Principal Amount
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="principalAmount"
                      value={
                        form.principalAmount
                      }
                      onChange={
                        handleChange
                      }
                      min="0.01"
                      step="0.01"
                      placeholder="Enter amount"
                      required
                    />

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      Interest Rate (%)
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="interestRate"
                      value={
                        form.interestRate
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="e.g. 10"
                      required
                    />

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      Loan Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      name="loanDate"
                      value={
                        form.loanDate
                      }
                      onChange={
                        handleChange
                      }
                      max={today}
                      required
                    />

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      Status
                    </label>

                    <select
                      className="form-select"
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        !editingLoan
                      }
                    >

                      <option value="ACTIVE">
                        ACTIVE
                      </option>

                      <option value="PENDING">
                        PENDING
                      </option>

                      <option value="COMPLETED">
                        COMPLETED
                      </option>

                      <option value="DEFAULT">
                        DEFAULT
                      </option>

                    </select>

                    {!editingLoan && (
                      <small className="text-muted">
                        New loans are activated
                        by the backend.
                      </small>
                    )}

                  </div>

                  <div className="col-12">

                    <div
                      className="alert alert-light border"
                      style={{
                        marginBottom: 0,
                      }}
                    >

                      <div className="row">

                        <div className="col-md-3">

                          <strong>
                            Principal
                          </strong>

                          <div>
                            TSh{' '}
                            {formatCurrency(
                              form.principalAmount
                            )}
                          </div>

                        </div>

                        <div className="col-md-3">

                          <strong>
                            Interest
                          </strong>

                          <div>
                            TSh{' '}
                            {formatCurrency(
                              calculateInterestPreview()
                            )}
                          </div>

                        </div>

                        <div className="col-md-3">

                          <strong>
                            Total
                          </strong>

                          <div>
                            TSh{' '}
                            {formatCurrency(
                              calculateTotalPreview()
                            )}
                          </div>

                        </div>

                        <div className="col-md-3">

                          <strong>
                            Weekly
                          </strong>

                          <div>
                            TSh{' '}
                            {formatCurrency(
                              calculateWeeklyPreview()
                            )}
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

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
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="members-add-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingLoan
                    ? 'Update Loan'
                    : 'Create Loan'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default Loans