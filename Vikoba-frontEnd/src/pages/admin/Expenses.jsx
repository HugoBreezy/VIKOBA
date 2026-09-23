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
  Authorization: `Bearer ${localStorage.getItem('vikoba_token') || ''}`,
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
// EXPENSES API
// =====================================================

const getExpenses = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/expenses`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    'Failed to load expenses.'
  )
}

const createExpense = async (expense) => {
  const response = await fetch(
    `${API_BASE_URL}/api/expenses`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense),
    }
  )

  return parseApiResponse(
    response,
    'Failed to create expense.'
  )
}

const updateExpense = async (id, expense) => {
  const response = await fetch(
    `${API_BASE_URL}/api/expenses/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense),
    }
  )

  return parseApiResponse(
    response,
    'Failed to update expense.'
  )
}

const deleteExpense = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/expenses/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    return parseApiResponse(
      response,
      'Failed to delete expense.'
    )
  }

  return true
}

// =====================================================
// FINANCIAL CYCLES API
// =====================================================

const getFinancialCycles = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/financial-cycles`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    'Failed to load financial cycles.'
  )
}

// =====================================================
// HELPERS
// =====================================================

const getCycleFromExpense = (expense) =>
  expense?.cycle || null

const getCycleIdFromExpense = (expense) =>
  expense?.cycle?.id ??
  expense?.cycleId ??
  null

const getCycleNameFromExpense = (expense) =>
  expense?.cycle?.name ||
  expense?.cycleName ||
  '-'

const getExpenseAmount = (expense) =>
  Number(expense?.amount || 0)

const getRecordedByName = (expense) => {
  const recordedBy = expense?.recordedBy

  if (!recordedBy) {
    return '-'
  }

  if (typeof recordedBy === 'string') {
    return recordedBy
  }

  return (
    recordedBy.username ||
    recordedBy.name ||
    recordedBy.fullName ||
    `User #${recordedBy.id ?? '-'}`
  )
}

function Expenses() {
  const username =
    localStorage.getItem('vikoba_username') ||
    'Administrator'

  const profileRef = useRef(null)

  const [expenses, setExpenses] = useState([])
  const [cycles, setCycles] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadingCycles, setLoadingCycles] = useState(false)

  const [search, setSearch] = useState('')
  const [cycleFilter, setCycleFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [currentPage, setCurrentPage] = useState(1)

  const expensesPerPage = 10

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [saving, setSaving] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const today = new Date()
    .toISOString()
    .split('T')[0]

  const [form, setForm] = useState({
    amount: '',
    description: '',
    expenseDate: today,
    cycleId: '',
  })

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-TZ', {
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0)

  // =====================================================
  // LOAD EXPENSES
  // =====================================================

  const loadExpenses = async () => {
    setLoading(true)

    try {
      const data = await getExpenses()

      setExpenses(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load expenses:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Expenses',
        text:
          error.message ||
          'Unable to load expenses from the server.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOAD FINANCIAL CYCLES
  // =====================================================

  const loadCycles = async () => {
    setLoadingCycles(true)

    try {
      const data = await getFinancialCycles()

      setCycles(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load financial cycles:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Cycles',
        text:
          error.message ||
          'Unable to load financial cycles.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })
    } finally {
      setLoadingCycles(false)
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadExpenses()
    loadCycles()
  }, [])

  // =====================================================
  // PROFILE OUTSIDE CLICK
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
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      amount: '',
      description: '',
      expenseDate: today,
      cycleId: '',
    })
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingExpense(null)

    setForm({
      amount: '',
      description: '',
      expenseDate: today,
      cycleId: '',
    })

    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (expense) => {
    setEditingExpense(expense)

    setForm({
      amount: expense?.amount ?? '',
      description: expense?.description || '',
      expenseDate:
        expense?.expenseDate || today,
      cycleId:
        expense?.cycle?.id?.toString() ||
        expense?.cycleId?.toString() ||
        '',
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
    setEditingExpense(null)
    resetForm()
  }

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

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
  // SAVE EXPENSE
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault()

    const amount = Number(form.amount) || 0

    if (amount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text:
          'Expense amount must be greater than zero.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
      return
    }

    if (!form.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Description Required',
        text:
          'Please enter a description for this expense.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
      return
    }

    if (!form.expenseDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Expense Date Required',
        text:
          'Please select the expense date.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
      return
    }

    if (form.expenseDate > today) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Expense Date',
        text:
          'Expense date cannot be in the future.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
      return
    }

    if (!form.cycleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Financial Cycle Required',
        text:
          'Please select the financial cycle.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
      return
    }

    setSaving(true)

    try {
      const expenseData = {
        amount,
        description:
          form.description.trim(),
        expenseDate:
          form.expenseDate,
        cycle: {
          id: Number(form.cycleId),
        },
        recordedBy:
          username || null,
      }

      if (editingExpense) {
        await updateExpense(
          editingExpense.id,
          expenseData
        )
      } else {
        await createExpense(expenseData)
      }

      setShowModal(false)
      setEditingExpense(null)
      resetForm()

      await loadExpenses()

      await Swal.fire({
        icon: 'success',
        title: editingExpense
          ? 'Expense Updated'
          : 'Expense Recorded',
        text: editingExpense
          ? 'Expense has been updated successfully.'
          : 'Expense has been recorded successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      console.error(
        'Failed to save expense:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text:
          error.message ||
          'Unable to save expense.',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // DELETE EXPENSE
  // =====================================================

  const handleDelete = async (expense) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Expense?',
      text:
        `Are you sure you want to delete "${expense?.description || 'this expense'}"?`,
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
      await deleteExpense(expense.id)

      await loadExpenses()

      Swal.fire({
        icon: 'success',
        title: 'Expense Deleted',
        text:
          'Expense has been deleted successfully.',
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
          'Unable to delete expense.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    }
  }

  // =====================================================
  // VIEW EXPENSE
  // =====================================================

  const handleView = (expense) => {
    const cycle =
      getCycleFromExpense(expense)

    Swal.fire({
      title: 'Expense Details',
      html: `
        <div style="text-align:left;line-height:1.9;">
          <strong>Expense ID:</strong>
          ${expense?.id ?? '-'}
          <br />

          <strong>Description:</strong>
          ${expense?.description ?? '-'}
          <br />

          <strong>Amount:</strong>
          TSh ${formatCurrency(
            expense?.amount
          )}
          <br />

          <strong>Expense Date:</strong>
          ${expense?.expenseDate ?? '-'}
          <br />

          <strong>Financial Cycle:</strong>
          ${cycle?.name ?? '-'}
          <br />

          <strong>Recorded By:</strong>
          ${getRecordedByName(expense)}
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

  const filteredExpenses =
    expenses
      .filter((expense) => {
        const query =
          search.toLowerCase().trim()

        if (!query) {
          return true
        }

        const description =
          expense?.description || ''

        const recordedBy =
          getRecordedByName(expense)

        const expenseId =
          expense?.id || ''

        const cycleName =
          getCycleNameFromExpense(expense)

        return (
          String(description)
            .toLowerCase()
            .includes(query) ||
          String(recordedBy)
            .toLowerCase()
            .includes(query) ||
          String(expenseId)
            .toLowerCase()
            .includes(query) ||
          String(cycleName)
            .toLowerCase()
            .includes(query)
        )
      })
      .filter((expense) => {
        if (cycleFilter === 'ALL') {
          return true
        }

        return (
          String(
            getCycleIdFromExpense(expense)
          ) === String(cycleFilter)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'OLDEST') {
          return (
            new Date(
              a.expenseDate || 0
            ) -
            new Date(
              b.expenseDate || 0
            )
          )
        }

        if (sortBy === 'AMOUNT_HIGH') {
          return (
            getExpenseAmount(b) -
            getExpenseAmount(a)
          )
        }

        if (sortBy === 'AMOUNT_LOW') {
          return (
            getExpenseAmount(a) -
            getExpenseAmount(b)
          )
        }

        return (
          new Date(
            b.expenseDate || 0
          ) -
          new Date(
            a.expenseDate || 0
          )
        )
      })

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      filteredExpenses.length /
        expensesPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) *
    expensesPerPage

  const paginatedExpenses =
    filteredExpenses.slice(
      startIndex,
      startIndex +
        expensesPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    cycleFilter,
    sortBy,
  ])

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalExpenseAmount =
    expenses.reduce(
      (total, expense) =>
        total +
        getExpenseAmount(expense),
      0
    )

  const currentCycle =
    cycles.find(
      (cycle) =>
        String(cycle?.status || '')
          .toUpperCase() === 'OPEN'
    )

  const currentCycleExpenseAmount =
    currentCycle
      ? expenses
          .filter(
            (expense) =>
              String(
                getCycleIdFromExpense(
                  expense
                )
              ) ===
              String(currentCycle.id)
          )
          .reduce(
            (total, expense) =>
              total +
              getExpenseAmount(
                expense
              ),
            0
          )
      : 0

  const averageExpense =
    expenses.length > 0
      ? totalExpenseAmount /
        expenses.length
      : 0

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = () => {
    if (expenses.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Expenses',
        text:
          'There are no expenses to export.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
      return
    }

    const headers = [
      'ID',
      'Description',
      'Amount',
      'Expense Date',
      'Financial Cycle',
      'Recorded By',
    ]

    const rows = expenses.map(
      (expense) => [
        expense?.id || '',
        expense?.description || '',
        expense?.amount || '',
        expense?.expenseDate || '',
        getCycleNameFromExpense(
          expense
        ),
        getRecordedByName(expense),
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
              `"${String(value).replaceAll(
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
      'vikoba-expenses.csv'

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
            <span>Dashboard</span>
          </a>

          <a
            href="/members"
            className="sidebar-link"
          >
            <FaUsers />
            <span>Members</span>
          </a>

          <a
            href="/meetings"
            className="sidebar-link"
          >
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
            href="/loans"
            className="sidebar-link"
          >
            <FaHandHoldingUsd />
            <span>Loans</span>
          </a>

          <div className="sidebar-section-title">
            FINANCIAL
          </div>

          <a
            href="/payments"
            className="sidebar-link"
          >
            <FaFileInvoiceDollar />
            <span>Payments</span>
          </a>

          <a
            href="/penalties"
            className="sidebar-link"
          >
            <FaExclamationTriangle />
            <span>Penalties</span>
          </a>

          <a
            href="/expenses"
            className="sidebar-link active"
          >
            <FaMoneyBillWave />
            <span>Expenses</span>
          </a>

          <a
            href="#"
            className="sidebar-link"
            onClick={(event) =>
              event.preventDefault()
            }
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
            onClick={(event) =>
              event.preventDefault()
            }
          >
            <FaChartPie />
            <span>Reports</span>
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
        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search expenses..."
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
                <h1>Expenses</h1>

                <p>
                  Manage approved group
                  expenses and financial
                  costs.
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
                  Add Expense
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
                    Total Expenses
                  </span>

                  <strong>
                    {expenses.length}
                  </strong>
                </div>

                <FaFileInvoiceDollar />
              </div>

              <div className="members-summary-card">
                <div>
                  <span>
                    Total Amount
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalExpenseAmount
                    )}
                  </strong>
                </div>

                <FaMoneyBillWave />
              </div>

              <div className="members-summary-card">
                <div>
                  <span>
                    Current Cycle
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      currentCycleExpenseAmount
                    )}
                  </strong>
                </div>

                <FaWallet />
              </div>

              <div className="members-summary-card">
                <div>
                  <span>
                    Average Expense
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      averageExpense
                    )}
                  </strong>
                </div>

                <FaHandHoldingUsd />
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
                      placeholder="Search by description, cycle or recorded by..."
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
                    <div className="spinner-border"></div>

                    <span>
                      Loading expenses...
                    </span>
                  </div>
                ) : paginatedExpenses.length === 0 ? (
                  <div className="members-empty">
                    <FaFileInvoiceDollar />

                    <h3>
                      No Expenses Found
                    </h3>

                    <p>
                      No expenses match
                      your current
                      search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />
                      Add Expense
                    </button>
                  </div>
                ) : (
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th>
                          DESCRIPTION
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          EXPENSE DATE
                        </th>

                        <th>
                          FINANCIAL CYCLE
                        </th>

                        <th>
                          RECORDED BY
                        </th>

                        <th>
                          ACTIONS
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedExpenses.map(
                        (expense) => (
                          <tr
                            key={
                              expense.id
                            }
                          >
                            <td>
                              <strong>
                                {expense.description ||
                                  '-'}
                              </strong>
                            </td>

                            <td>
                              <strong>
                                TSh{' '}
                                {formatCurrency(
                                  expense.amount
                                )}
                              </strong>
                            </td>

                            <td>
                              {expense.expenseDate ||
                                '-'}
                            </td>

                            <td>
                              {getCycleNameFromExpense(
                                expense
                              )}
                            </td>

                            <td>
                              {getRecordedByName(expense)}
                            </td>

                            <td>
                              <div className="member-actions">
                                <button
                                  type="button"
                                  title="View"
                                  onClick={() =>
                                    handleView(
                                      expense
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
                                      expense
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
                                      expense
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
                filteredExpenses.length >
                  0 && (
                  <div className="members-pagination">
                    <span>
                      Showing{' '}
                      {startIndex + 1}
                      {' - '}
                      {Math.min(
                        startIndex +
                          expensesPerPage,
                        filteredExpenses.length
                      )}
                      {' of '}
                      {filteredExpenses.length}
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
                      ).map((page) => (
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
                      ))}

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
          ADD / EDIT EXPENSE MODAL
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
              backgroundColor:
                '#ffffff',
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
                justifyContent:
                  'space-between',
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
                  {editingExpense
                    ? 'Edit Expense'
                    : 'Add Expense'}
                </h3>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6c757d',
                  }}
                >
                  {editingExpense
                    ? 'Update expense information.'
                    : 'Enter the expense details below.'}
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
                  {/* AMOUNT */}

                  <div className="col-md-6">
                    <label className="form-label">
                      Expense Amount
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={
                        form.amount
                      }
                      onChange={
                        handleChange
                      }
                      min="0.01"
                      step="0.01"
                      placeholder="Enter amount"
                      required
                      disabled={
                        saving
                      }
                    />
                  </div>

                  {/* DATE */}

                  <div className="col-md-6">
                    <label className="form-label">
                      Expense Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      name="expenseDate"
                      value={
                        form.expenseDate
                      }
                      onChange={
                        handleChange
                      }
                      max={today}
                      required
                      disabled={
                        saving
                      }
                    />
                  </div>

                  {/* CYCLE */}

                  <div className="col-12">
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
                      disabled={
                        loadingCycles ||
                        saving
                      }
                    >
                      <option value="">
                        {loadingCycles
                          ? 'Loading financial cycles...'
                          : 'Select Financial Cycle'}
                      </option>

                      {cycles.map(
                        (cycle) => (
                          <option
                            key={
                              cycle.id
                            }
                            value={
                              cycle.id
                            }
                          >
                            {cycle.name}
                            {cycle.status
                              ? ` (${cycle.status})`
                              : ''}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* DESCRIPTION */}

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
                      rows="4"
                      placeholder="Describe what the expense was for..."
                      required
                      disabled={
                        saving
                      }
                    />
                  </div>

                  {/* RECORDED BY */}

                  <div className="col-12">
                    <label className="form-label">
                      Recorded By
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        username
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}

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
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingExpense
                    ? 'Update Expense'
                    : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
