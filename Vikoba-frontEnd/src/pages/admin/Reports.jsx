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
  FaDownload,
  FaReceipt,
  FaChartLine,
  FaSyncAlt,
  FaFileExcel,
} from 'react-icons/fa'

import Swal from 'sweetalert2'

const API_BASE_URL = 'http://localhost:8080'

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem('vikoba_token') || ''
  }`,
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

const getData = async (endpoint, fallbackMessage) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    fallbackMessage
  )
}

const getId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  if (typeof value === 'object') {
    return value.id ?? null
  }

  return value
}

const getCycleId = (item) =>
  getId(item?.cycle)

const getMemberId = (item) =>
  getId(item?.member)

const getLoanAmount = (loan) =>
  Number(
    loan?.principalAmount ??
      loan?.principal ??
      loan?.amount ??
      0
  )

const getLoanInterest = (loan) =>
  Number(
    loan?.interestAmount ??
      loan?.interest ??
      0
  )

const getContributionAmount = (
  contribution
) =>
  Number(
    contribution?.amount ?? 0
  )

const getExpenseAmount = (
  expense
) =>
  Number(
    expense?.amount ?? 0
  )

const getShareOutAmount = (
  shareOut
) =>
  Number(
    shareOut?.totalShareOut ??
      shareOut?.totalAmount ??
      0
  )

const formatCurrency = (amount) =>
  new Intl.NumberFormat(
    'en-TZ',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(Number(amount) || 0)

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(
    'en-GB'
  )
}

function Reports() {
  const username =
    localStorage.getItem(
      'vikoba_username'
    ) || 'Administrator'

  const profileRef = useRef(null)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [cycles, setCycles] =
    useState([])

  const [members, setMembers] =
    useState([])

  const [contributions, setContributions] =
    useState([])

  const [loans, setLoans] =
    useState([])

  const [expenses, setExpenses] =
    useState([])

  const [shareOuts, setShareOuts] =
    useState([])

  const [selectedCycleId, setSelectedCycleId] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const loadReports = async (
    showError = true
  ) => {
    try {
      setLoading(true)

      const [
        cyclesData,
        membersData,
        contributionsData,
        loansData,
        expensesData,
        shareOutsData,
      ] = await Promise.all([
        getData(
          '/api/financial-cycles',
          'Failed to load financial cycles.'
        ),
        getData(
          '/api/members',
          'Failed to load members.'
        ),
        getData(
          '/api/contributions',
          'Failed to load contributions.'
        ),
        getData(
          '/api/loans',
          'Failed to load loans.'
        ),
        getData(
          '/api/expenses',
          'Failed to load expenses.'
        ),
        getData(
          '/api/share-outs',
          'Failed to load share-outs.'
        ),
      ])

      setCycles(
        Array.isArray(cyclesData)
          ? cyclesData
          : []
      )

      setMembers(
        Array.isArray(membersData)
          ? membersData
          : []
      )

      setContributions(
        Array.isArray(contributionsData)
          ? contributionsData
          : []
      )

      setLoans(
        Array.isArray(loansData)
          ? loansData
          : []
      )

      setExpenses(
        Array.isArray(expensesData)
          ? expensesData
          : []
      )

      setShareOuts(
        Array.isArray(shareOutsData)
          ? shareOutsData
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load reports:',
        error
      )

      if (showError) {
        Swal.fire({
          icon: 'error',
          title: 'Unable to Load Reports',
          text:
            error.message ||
            'Unable to load reports.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1450c8',
          zIndex: 200000,
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadReports()
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

  const selectedCycle = useMemo(() => {
    if (!selectedCycleId) {
      return null
    }

    return (
      cycles.find(
        (cycle) =>
          String(cycle.id) ===
          String(selectedCycleId)
      ) || null
    )
  }, [
    cycles,
    selectedCycleId,
  ])

  const cycleContributions =
    useMemo(() => {
      if (!selectedCycleId) {
        return contributions
      }

      return contributions.filter(
        (item) =>
          String(
            getCycleId(item)
          ) ===
          String(selectedCycleId)
      )
    }, [
      contributions,
      selectedCycleId,
    ])

  const cycleLoans = useMemo(() => {
    if (!selectedCycleId) {
      return loans
    }

    return loans.filter(
      (item) =>
        String(
          getCycleId(item)
        ) ===
        String(selectedCycleId)
    )
  }, [
    loans,
    selectedCycleId,
  ])

  const cycleExpenses =
    useMemo(() => {
      if (!selectedCycleId) {
        return expenses
      }

      return expenses.filter(
        (item) =>
          String(
            getCycleId(item)
          ) ===
          String(selectedCycleId)
      )
    }, [
      expenses,
      selectedCycleId,
    ])

  const cycleShareOuts =
    useMemo(() => {
      if (!selectedCycleId) {
        return shareOuts
      }

      return shareOuts.filter(
        (item) =>
          String(
            getCycleId(item)
          ) ===
          String(selectedCycleId)
      )
    }, [
      shareOuts,
      selectedCycleId,
    ])

  const totalContributions =
    useMemo(
      () =>
        cycleContributions.reduce(
          (sum, item) =>
            sum +
            getContributionAmount(
              item
            ),
          0
        ),
      [cycleContributions]
    )

  const totalLoanPrincipal =
    useMemo(
      () =>
        cycleLoans.reduce(
          (sum, item) =>
            sum +
            getLoanAmount(item),
          0
        ),
      [cycleLoans]
    )

  const totalLoanInterest =
    useMemo(
      () =>
        cycleLoans.reduce(
          (sum, item) =>
            sum +
            getLoanInterest(item),
          0
        ),
      [cycleLoans]
    )

  const totalExpenses =
    useMemo(
      () =>
        cycleExpenses.reduce(
          (sum, item) =>
            sum +
            getExpenseAmount(item),
          0
        ),
      [cycleExpenses]
    )

  const netProfit = Math.max(
    totalLoanInterest -
      totalExpenses,
    0
  )

  const totalShareOut =
    useMemo(
      () =>
        cycleShareOuts.reduce(
          (sum, item) =>
            sum +
            getShareOutAmount(item),
          0
        ),
      [cycleShareOuts]
    )

  const cycleMemberIds =
    useMemo(() => {
      return new Set(
        cycleContributions
          .map(getMemberId)
          .filter(
            (id) => id !== null
          )
          .map((id) => String(id))
      )
    }, [cycleContributions])

  const cycleMembers =
    useMemo(() => {
      if (!selectedCycleId) {
        return members
      }

      return members.filter(
        (member) =>
          cycleMemberIds.has(
            String(member.id)
          )
      )
    }, [
      members,
      selectedCycleId,
      cycleMemberIds,
    ])

  const memberContributionRows =
    useMemo(() => {
      const grouped = new Map()

      cycleContributions.forEach(
        (contribution) => {
          const memberId =
            getMemberId(contribution)

          if (memberId === null) {
            return
          }

          const key = String(
            memberId
          )

          if (!grouped.has(key)) {
            grouped.set(key, 0)
          }

          grouped.set(
            key,
            grouped.get(key) +
              getContributionAmount(
                contribution
              )
          )
        }
      )

      return Array.from(
        grouped.entries()
      )
        .map(
          ([
            memberId,
            amount,
          ]) => {
            const member =
              members.find(
                (item) =>
                  String(item.id) ===
                  memberId
              )

            const percentage =
              totalContributions >
              0
                ? (amount /
                    totalContributions) *
                  100
                : 0

            return {
              memberId,
              memberName:
                member?.fullName ||
                member?.name ||
                `Member #${memberId}`,
              memberNumber:
                member?.memberNumber ||
                '-',
              contribution:
                amount,
              percentage,
            }
          }
        )
        .filter((row) =>
          `${row.memberName} ${row.memberNumber}`
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
        .sort(
          (a, b) =>
            b.contribution -
            a.contribution
        )
    }, [
      cycleContributions,
      members,
      totalContributions,
      search,
    ])

  const loanStatusSummary =
    useMemo(() => {
      const summary = {}

      cycleLoans.forEach(
        (loan) => {
          const status =
            String(
              loan?.status ||
                'UNKNOWN'
            ).toUpperCase()

          summary[status] =
            (summary[status] || 0) +
            1
        }
      )

      return summary
    }, [cycleLoans])

  const expenseRows =
    useMemo(
      () =>
        [...cycleExpenses]
          .sort(
            (a, b) =>
              Number(
                b.amount || 0
              ) -
              Number(
                a.amount || 0
              )
          )
          .slice(0, 10),
      [cycleExpenses]
    )

  const handleRefresh = () => {
    setRefreshing(true)
    loadReports(false)
  }

  const handleExport = () => {
    if (
      cycleContributions.length ===
        0 &&
      cycleLoans.length === 0 &&
      cycleExpenses.length ===
        0 &&
      cycleShareOuts.length ===
        0
    ) {
      Swal.fire({
        icon: 'info',
        title: 'No Report Data',
        text:
          'There is no report data to export.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
        zIndex: 200000,
      })

      return
    }

    const cycleName =
      selectedCycle?.name ||
      'All Cycles'

    const rows = [
      ['VIKOBA FINANCIAL REPORT'],
      ['Generated By', username],
      ['Financial Cycle', cycleName],
      [
        'Period',
        selectedCycle
          ? `${formatDate(
              selectedCycle.startDate
            )} - ${formatDate(
              selectedCycle.endDate
            )}`
          : 'All available cycles',
      ],
      [],
      ['SUMMARY'],
      [
        'Total Members',
        cycleMembers.length,
      ],
      [
        'Total Contributions',
        totalContributions,
      ],
      [
        'Loan Principal',
        totalLoanPrincipal,
      ],
      [
        'Loan Interest',
        totalLoanInterest,
      ],
      [
        'Total Expenses',
        totalExpenses,
      ],
      ['Net Profit', netProfit],
      [
        'Total Share-Out',
        totalShareOut,
      ],
      [],
      ['MEMBER CONTRIBUTION SUMMARY'],
      [
        'Member',
        'Member Number',
        'Contribution',
        'Contribution %',
      ],
      ...memberContributionRows.map(
        (row) => [
          row.memberName,
          row.memberNumber,
          row.contribution,
          `${row.percentage.toFixed(
            2
          )}%`,
        ]
      ),
      [],
      ['EXPENSE SUMMARY'],
      [
        'Description',
        'Amount',
        'Date',
        'Recorded By',
      ],
      ...expenseRows.map(
        (expense) => [
          expense.description ||
            '-',
          getExpenseAmount(
            expense
          ),
          formatDate(
            expense.expenseDate
          ),
          expense.recordedBy
            ?.username ||
            expense.recordedBy ||
            '-',
        ]
      ),
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value =
              cell === null ||
              cell === undefined
                ? ''
                : String(cell)

            return `"${value.replaceAll(
              '"',
              '""'
            )}"`
          })
          .join(',')
      )
      .join('\n')

    const blob = new Blob(
      [csv],
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
      `vikoba-report-${cycleName
        .replaceAll(' ', '-')
        .toLowerCase()}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    Swal.fire({
      icon: 'success',
      title: 'Report Exported',
      text:
        'The report has been exported successfully.',
      confirmButtonText: 'OK',
      confirmButtonColor:
        '#1450c8',
      zIndex: 200000,
    })
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

    window.location.replace('/')
  }

  return (
    <div
      className="dashboard-page"
      style={{
        minHeight: '100vh',
      }}
    >

      {/* =====================================================
          SIDEBAR - SAME STRUCTURE AS PAYMENTS
      ===================================================== */}

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
            className="sidebar-link"
          >
            <FaMoneyBillWave />
            <span>Expenses</span>
          </a>

          <a
            href="/share-outs"
            className="sidebar-link"
          >
            <FaChartPie />
            <span>Share-Out</span>
          </a>

          <div className="sidebar-section-title">
            SYSTEM
          </div>

          <a
            href="/reports"
            className="sidebar-link active"
          >
            <FaChartPie />
            <span>Reports</span>
          </a>

          <a
            href="/settings"
            className="sidebar-link"
          >
            <FaCog />
            <span>Settings</span>
          </a>

        </nav>

      </aside>

      {/* =====================================================
          MAIN - SAME STRUCTURE AS PAYMENTS
      ===================================================== */}

      <main className="dashboard-main">

        <header className="dashboard-topbar">

          <div className="dashboard-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search reports..."
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

            {/* =================================================
                REPORT HEADER
            ================================================= */}

            <div className="members-header">

              <div>

                <h1>
                  Reports
                </h1>

                <p>
                  Review VIKOBA financial
                  performance by financial
                  cycle.
                </p>

              </div>

              <div className="members-toolbar-actions">

                <button
                  type="button"
                  className="members-export-button"
                  onClick={
                    handleRefresh
                  }
                  disabled={refreshing}
                >
                  <FaSyncAlt />
                  {refreshing
                    ? 'Refreshing...'
                    : 'Refresh'}
                </button>

                <button
                  type="button"
                  className="members-add-button"
                  onClick={
                    handleExport
                  }
                >
                  <FaDownload />
                  Export Report
                </button>

              </div>

            </div>

            {/* =================================================
                FILTER PANEL
            ================================================= */}

            <div className="members-panel">

              <div
                className="members-toolbar"
                style={{
                  justifyContent:
                    'space-between',
                  alignItems:
                    'flex-end',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    flex: 1,
                  }}
                >

                  <div
                    style={{
                      minWidth:
                        '280px',
                      flex: 1,
                    }}
                  >

                    <label
                      className="form-label"
                    >
                      Financial Cycle
                    </label>

                    <select
                      className="form-select"
                      value={
                        selectedCycleId
                      }
                      onChange={(
                        event
                      ) =>
                        setSelectedCycleId(
                          event.target
                            .value
                        )
                      }
                    >

                      <option value="">
                        All Cycles
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
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div
                    style={{
                      minWidth:
                        '280px',
                      flex: 1,
                    }}
                  >

                    <label
                      className="form-label"
                    >
                      Search Member
                    </label>

                    <div className="members-search">

                      <FaSearch />

                      <input
                        type="text"
                        placeholder="Search member..."
                        value={search}
                        onChange={(
                          event
                        ) =>
                          setSearch(
                            event.target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div
                  style={{
                    padding:
                      '10px 14px',
                    borderRadius:
                      '8px',
                    background:
                      'rgba(25, 135, 84, 0.08)',
                    fontWeight: 600,
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  {selectedCycle
                    ? selectedCycle.name
                    : 'All Financial Cycles'}
                </div>

              </div>

            </div>

            {/* =================================================
                SUMMARY CARDS - SAME PAYMENT STYLE
            ================================================= */}

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div>
                  <span>
                    Total Members
                  </span>

                  <strong>
                    {cycleMembers.length}
                  </strong>
                </div>

                <FaUsers />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Total Contributions
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalContributions
                    )}
                  </strong>
                </div>

                <FaWallet />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Loan Principal
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalLoanPrincipal
                    )}
                  </strong>
                </div>

                <FaHandHoldingUsd />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Loan Interest
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalLoanInterest
                    )}
                  </strong>
                </div>

                <FaMoneyBillWave />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Total Expenses
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalExpenses
                    )}
                  </strong>
                </div>

                <FaReceipt />

              </div>

              <div className="members-summary-card">

                <div>
                  <span>
                    Net Profit
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      netProfit
                    )}
                  </strong>
                </div>

                <FaChartLine />

              </div>

            </div>

            {/* =================================================
                LOAN + SHARE-OUT SUMMARY
            ================================================= */}

            <div
              className="dashboard-bottom-grid"
              style={{
                marginTop: '20px',
              }}
            >

              <div className="dashboard-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Loan Summary
                    </h3>

                    <p>
                      Loans recorded for the
                      selected cycle.
                    </p>

                  </div>

                </div>

                <div
                  style={{
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(3, 1fr)',
                    gap: '14px',
                  }}
                >

                  <div>
                    <span>
                      Total Loans
                    </span>

                    <strong
                      style={{
                        display:
                          'block',
                        fontSize:
                          '22px',
                        marginTop:
                          '5px',
                      }}
                    >
                      {cycleLoans.length}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Active
                    </span>

                    <strong
                      style={{
                        display:
                          'block',
                        fontSize:
                          '22px',
                        marginTop:
                          '5px',
                      }}
                    >
                      {loanStatusSummary
                        .ACTIVE || 0}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Completed
                    </span>

                    <strong
                      style={{
                        display:
                          'block',
                        fontSize:
                          '22px',
                        marginTop:
                          '5px',
                      }}
                    >
                      {loanStatusSummary
                        .COMPLETED ||
                        0}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="dashboard-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Share-Out Summary
                    </h3>

                    <p>
                      Share-out records for the
                      selected cycle.
                    </p>

                  </div>

                </div>

                <div
                  style={{
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, 1fr)',
                    gap: '14px',
                  }}
                >

                  <div>
                    <span>
                      Share-Out Records
                    </span>

                    <strong
                      style={{
                        display:
                          'block',
                        fontSize:
                          '22px',
                        marginTop:
                          '5px',
                      }}
                    >
                      {cycleShareOuts.length}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Share-Out
                    </span>

                    <strong
                      style={{
                        display:
                          'block',
                        fontSize:
                          '20px',
                        marginTop:
                          '5px',
                      }}
                    >
                      TSh{' '}
                      {formatCurrency(
                        totalShareOut
                      )}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                MEMBER CONTRIBUTION SUMMARY
            ================================================= */}

            <div
              className="members-panel"
              style={{
                marginTop: '20px',
              }}
            >

              <div className="panel-header">

                <div>

                  <h3>
                    Member Contribution
                    Summary
                  </h3>

                  <p>
                    Contribution distribution
                    for the selected cycle.
                  </p>

                </div>

                <strong>
                  {
                    memberContributionRows.length
                  }{' '}
                  members
                </strong>

              </div>

              <div className="members-table-wrapper">

                {loading ? (

                  <div className="members-loading">
                    <div className="spinner-border" />
                    <span>
                      Loading reports...
                    </span>
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
                          CONTRIBUTION
                        </th>

                        <th>
                          CONTRIBUTION %
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {memberContributionRows.length ===
                      0 ? (

                        <tr>

                          <td
                            colSpan="4"
                            style={{
                              textAlign:
                                'center',
                              padding:
                                '35px',
                            }}
                          >
                            No contribution
                            records found
                            for this
                            selection.
                          </td>

                        </tr>

                      ) : (

                        memberContributionRows.map(
                          (row) => (
                            <tr
                              key={
                                row.memberId
                              }
                            >

                              <td>

                                <div className="member-table-user">

                                  <div className="member-avatar">

                                    {(
                                      row.memberName ||
                                      'M'
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>

                                  <div>

                                    <strong>
                                      {
                                        row.memberName
                                      }
                                    </strong>

                                    <span>
                                      Member
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>
                                {
                                  row.memberNumber
                                }
                              </td>

                              <td>
                                <strong>
                                  TSh{' '}
                                  {formatCurrency(
                                    row.contribution
                                  )}
                                </strong>
                              </td>

                              <td>
                                {row.percentage.toFixed(
                                  2
                                )}
                                %
                              </td>

                            </tr>
                          )
                        )

                      )}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

            {/* =================================================
                EXPENSE SUMMARY
            ================================================= */}

            <div
              className="members-panel"
              style={{
                marginTop: '20px',
              }}
            >

              <div className="panel-header">

                <div>

                  <h3>
                    Expense Summary
                  </h3>

                  <p>
                    Expenses recorded for the
                    selected cycle.
                  </p>

                </div>

                <strong>
                  {cycleExpenses.length}{' '}
                  records
                </strong>

              </div>

              <div className="members-table-wrapper">

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
                        DATE
                      </th>

                      <th>
                        RECORDED BY
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {expenseRows.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan="4"
                          style={{
                            textAlign:
                              'center',
                            padding:
                              '35px',
                          }}
                        >
                          No expense
                          records found.
                        </td>

                      </tr>

                    ) : (

                      expenseRows.map(
                        (expense) => (
                          <tr
                            key={
                              expense.id
                            }
                          >

                            <td>
                              {
                                expense.description ||
                                '-'
                              }
                            </td>

                            <td>
                              <strong>
                                TSh{' '}
                                {formatCurrency(
                                  getExpenseAmount(
                                    expense
                                  )
                                )}
                              </strong>
                            </td>

                            <td>
                              {formatDate(
                                expense.expenseDate
                              )}
                            </td>

                            <td>
                              {expense
                                .recordedBy
                                ?.username ||
                                expense.recordedBy ||
                                '-'}
                            </td>

                          </tr>
                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =================================================
                FINAL TOTALS
            ================================================= */}

            <div
              className="members-panel"
              style={{
                marginTop: '20px',
              }}
            >

              <div
                style={{
                  padding: '22px',
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap: '20px',
                }}
              >

                <div>
                  <span>
                    Net Profit
                  </span>

                  <strong
                    style={{
                      display:
                        'block',
                      fontSize:
                        '22px',
                      marginTop:
                        '5px',
                    }}
                  >
                    TSh{' '}
                    {formatCurrency(
                      netProfit
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Total Share-Out
                  </span>

                  <strong
                    style={{
                      display:
                        'block',
                      fontSize:
                        '22px',
                      marginTop:
                        '5px',
                    }}
                  >
                    TSh{' '}
                    {formatCurrency(
                      totalShareOut
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Report Cycle
                  </span>

                  <strong
                    style={{
                      display:
                        'block',
                      fontSize:
                        '18px',
                      marginTop:
                        '5px',
                    }}
                  >
                    {selectedCycle?.name ||
                      'All Cycles'}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default Reports
