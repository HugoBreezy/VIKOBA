import { useEffect, useRef, useState } from 'react'
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
  FaArrowUp,
  FaWallet,
  FaFileInvoiceDollar,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
} from 'react-icons/fa'

import {
  getMembers,
  getContributionReport,
  getContributions,
  getLoans,
  getCycleFinancialReport,
  getLoanPayments,
} from '../../services/api'

function AdminDashboard() {
  const username =
    localStorage.getItem('vikoba_username') || 'Administrator'

  const [profileOpen, setProfileOpen] = useState(false)

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)

  const [contributionTotal, setContributionTotal] = useState(0)
  const [contributionsLoading, setContributionsLoading] =
    useState(true)

  const [recentContribution, setRecentContribution] =
    useState(null)
  const [contributionActivityLoading, setContributionActivityLoading] =
    useState(true)

  const [activeLoansTotal, setActiveLoansTotal] = useState(0)
  const [activeLoansCount, setActiveLoansCount] = useState(0)
  const [loansLoading, setLoansLoading] = useState(true)

  const [recentLoan, setRecentLoan] = useState(null)
  const [loanActivityLoading, setLoanActivityLoading] =
    useState(true)

  const [overdueLoansCount, setOverdueLoansCount] =
    useState(0)

  const [groupProfit, setGroupProfit] = useState(0)
  const [profitLoading, setProfitLoading] = useState(true)

  const [recentPayment, setRecentPayment] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(true)

  const [paidThisCycle, setPaidThisCycle] = useState(0)

  const profileRef = useRef(null)

  const currentCycleId = 2

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const membersData = await getMembers()

        setMembers(membersData)
      } catch (error) {
        console.error(
          'Failed to load members:',
          error
        )
      } finally {
        setMembersLoading(false)
      }

      try {
        const contributionData =
          await getContributionReport(currentCycleId)

        setContributionTotal(
          contributionData.totalContributions || 0
        )
      } catch (error) {
        console.error(
          'Failed to load contribution report:',
          error
        )
      } finally {
        setContributionsLoading(false)
      }

      try {
        const contributionsData =
          await getContributions()

        const currentCycleContributions =
          contributionsData.filter(
            (contribution) =>
              contribution.cycle &&
              contribution.cycle.id === currentCycleId
          )

        const sortedContributions =
          currentCycleContributions.sort(
            (a, b) => {
              const dateDifference =
                new Date(b.contributionDate) -
                new Date(a.contributionDate)

              if (dateDifference !== 0) {
                return dateDifference
              }

              return (
                Number(b.id || 0) -
                Number(a.id || 0)
              )
            }
          )

        setRecentContribution(
          sortedContributions.length > 0
            ? sortedContributions[0]
            : null
        )
      } catch (error) {
        console.error(
          'Failed to load contributions:',
          error
        )
      } finally {
        setContributionActivityLoading(false)
      }

      try {
        const loansData = await getLoans()

        const currentCycleLoans = loansData.filter(
          (loan) =>
            loan.cycle &&
            loan.cycle.id === currentCycleId
        )

        const activeCurrentCycleLoans =
          currentCycleLoans.filter(
            (loan) => loan.status === 'ACTIVE'
          )

        const totalOutstanding =
          activeCurrentCycleLoans.reduce(
            (total, loan) =>
              total +
              Number(loan.principalAmount || 0),
            0
          )

        setActiveLoansTotal(totalOutstanding)

        setActiveLoansCount(
          activeCurrentCycleLoans.length
        )

        const sortedLoans =
          activeCurrentCycleLoans.sort(
            (a, b) => {
              const dateDifference =
                new Date(b.loanDate) -
                new Date(a.loanDate)

              if (dateDifference !== 0) {
                return dateDifference
              }

              return (
                Number(b.id || 0) -
                Number(a.id || 0)
              )
            }
          )

        setRecentLoan(
          sortedLoans.length > 0
            ? sortedLoans[0]
            : null
        )

        const today = new Date()

        const overdueLoans =
          activeCurrentCycleLoans.filter(
            (loan) => {
              if (!loan.dueDate) {
                return false
              }

              const dueDate = new Date(
                `${loan.dueDate}T23:59:59`
              )

              return dueDate < today
            }
          )

        setOverdueLoansCount(
          overdueLoans.length
        )
      } catch (error) {
        console.error(
          'Failed to load loans:',
          error
        )
      } finally {
        setLoansLoading(false)
        setLoanActivityLoading(false)
      }

      try {
        const financialReport =
          await getCycleFinancialReport(currentCycleId)

        setGroupProfit(
          financialReport.netProfit || 0
        )
      } catch (error) {
        console.error(
          'Failed to load financial report:',
          error
        )
      } finally {
        setProfitLoading(false)
      }

      try {
        const paymentsData = await getLoanPayments()

        const currentCyclePayments =
          paymentsData.filter(
            (payment) =>
              payment.installment &&
              payment.installment.loan &&
              payment.installment.loan.cycle &&
              payment.installment.loan.cycle.id ===
                currentCycleId
          )

        const totalPaid =
          currentCyclePayments.reduce(
            (total, payment) =>
              total +
              Number(payment.amount || 0),
            0
          )

        setPaidThisCycle(totalPaid)

        const sortedPayments =
          currentCyclePayments.sort(
            (a, b) => {
              const dateDifference =
                new Date(b.paymentDate) -
                new Date(a.paymentDate)

              if (dateDifference !== 0) {
                return dateDifference
              }

              return (
                Number(b.id || 0) -
                Number(a.id || 0)
              )
            }
          )

        setRecentPayment(
          sortedPayments.length > 0
            ? sortedPayments[0]
            : null
        )
      } catch (error) {
        console.error(
          'Failed to load loan payments:',
          error
        )
      } finally {
        setPaymentLoading(false)
      }
    }

    loadDashboardData()
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

  const handleLogout = () => {
    localStorage.removeItem('vikoba_token')
    localStorage.removeItem('vikoba_username')
    localStorage.removeItem('vikoba_role')
    localStorage.removeItem('vikoba_remember_me')

    sessionStorage.clear()

    window.location.replace('/')
  }

  const totalMembers = members.length

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const contributionMemberName =
    recentContribution?.member?.fullName ||
    'Unknown member'

  const contributionMemberNumber =
    recentContribution?.member?.memberNumber || ''

  const contributionAmount =
    Number(recentContribution?.amount || 0)

  const loanMemberName =
    recentLoan?.member?.fullName ||
    'Unknown member'

  const loanMemberNumber =
    recentLoan?.member?.memberNumber || ''

  const loanAmount =
    Number(
      recentLoan?.principalAmount ||
      recentLoan?.amount ||
      0
    )

  const paymentMemberName =
    recentPayment?.installment?.loan?.member?.fullName ||
    'Unknown member'

  const paymentMemberNumber =
    recentPayment?.installment?.loan?.member
      ?.memberNumber || ''

  const paymentAmount =
    Number(recentPayment?.amount || 0)

  return (
    <div className="dashboard-page">

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

          <a
            href="/"
            className="sidebar-link active"
          >
            <FaHome />
            <span>Dashboard</span>
          </a>

          {/* MEMBERS */}
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

          {/* CONTRIBUTIONS */}
          <a
            href="/contributions"
            className="sidebar-link"
          >
            <FaMoneyBillWave />
            <span>Contributions</span>
          </a>

          <a href="#" className="sidebar-link">
            <FaHandHoldingUsd />
            <span>Loans</span>
          </a>

          <div className="sidebar-section-title">
            FINANCIAL
          </div>

          <a href="#" className="sidebar-link">
            <FaFileInvoiceDollar />
            <span>Payments</span>
          </a>

          <a href="#" className="sidebar-link">
            <FaExclamationTriangle />
            <span>Penalties</span>
          </a>

          <a href="#" className="sidebar-link">
            <FaMoneyBillWave />
            <span>Expenses</span>
          </a>

          <a href="#" className="sidebar-link">
            <FaChartPie />
            <span>Share-Out</span>
          </a>

          <div className="sidebar-section-title">
            SYSTEM
          </div>

          <a href="#" className="sidebar-link">
            <FaChartPie />
            <span>Reports</span>
          </a>

          <a href="#" className="sidebar-link">
            <FaCog />
            <span>Settings</span>
          </a>

        </nav>

      </aside>

      <main className="dashboard-main">

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
                  setProfileOpen(!profileOpen)
                }
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

        <div className="dashboard-content">

          <div className="dashboard-page-header">

            <div>

              <span className="dashboard-welcome">
                WELCOME BACK
              </span>

              <h1>Admin Dashboard</h1>

              <p>
                Here's what's happening with your VIKOBA group today.
              </p>

            </div>

            <button
              type="button"
              className="dashboard-date-button"
            >
              <FaCalendarAlt />
              <span>Current Cycle</span>
            </button>

          </div>

          <div className="dashboard-cards">

            <div className="dashboard-card">

              <div className="dashboard-card-top">

                <div className="dashboard-card-icon members">
                  <FaUsers />
                </div>

                <span className="card-trend positive">
                  <FaArrowUp />
                  12%
                </span>

              </div>

              <span className="dashboard-card-label">
                Total Members
              </span>

              <h2>
                {membersLoading
                  ? '...'
                  : totalMembers}
              </h2>

              <p>Active members</p>

            </div>

            <div className="dashboard-card">

              <div className="dashboard-card-top">

                <div className="dashboard-card-icon contributions">
                  <FaMoneyBillWave />
                </div>

                <span className="card-trend positive">
                  <FaArrowUp />
                  8.5%
                </span>

              </div>

              <span className="dashboard-card-label">
                Total Contributions
              </span>

              <h2>
                {contributionsLoading
                  ? '...'
                  : `TSh ${formatCurrency(
                      contributionTotal
                    )}`}
              </h2>

              <p>Current cycle</p>

            </div>

            <div className="dashboard-card">

              <div className="dashboard-card-top">

                <div className="dashboard-card-icon loans">
                  <FaHandHoldingUsd />
                </div>

                <span className="card-trend positive">
                  <FaArrowUp />
                  5.2%
                </span>

              </div>

              <span className="dashboard-card-label">
                Active Loans
              </span>

              <h2>
                {loansLoading
                  ? '...'
                  : `TSh ${formatCurrency(
                      activeLoansTotal
                    )}`}
              </h2>

              <p>
                {loansLoading
                  ? 'Loading...'
                  : `${activeLoansCount} active ${
                      activeLoansCount === 1
                        ? 'loan'
                        : 'loans'
                    }`}
              </p>

            </div>

            <div className="dashboard-card">

              <div className="dashboard-card-top">

                <div className="dashboard-card-icon profit">
                  <FaWallet />
                </div>

                <span className="card-trend positive">
                  <FaArrowUp />
                  Current
                </span>

              </div>

              <span className="dashboard-card-label">
                Group Profit
              </span>

              <h2>
                {profitLoading
                  ? '...'
                  : `TSh ${formatCurrency(
                      groupProfit
                    )}`}
              </h2>

              <p>Current cycle</p>

            </div>

          </div>

          <div className="dashboard-grid">

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h3>Recent Activity</h3>
                  <p>Latest group transactions</p>
                </div>

                <a href="#">View All</a>

              </div>

              <div className="activity-list">

                <div className="activity-item">

                  <div className="activity-icon contribution">
                    <FaMoneyBillWave />
                  </div>

                  <div className="activity-details">

                    <strong>
                      Contribution received
                    </strong>

                    <span>
                      {contributionActivityLoading
                        ? 'Loading latest contribution...'
                        : recentContribution
                        ? `${contributionMemberNumber} - ${contributionMemberName} contributed TSh ${formatCurrency(
                            contributionAmount
                          )}`
                        : 'No contribution recorded'}
                    </span>

                  </div>

                  <div className="activity-amount">

                    {contributionActivityLoading
                      ? '...'
                      : recentContribution
                      ? `+ TSh ${formatCurrency(
                          contributionAmount
                        )}`
                      : '—'}

                  </div>

                </div>

                <div className="activity-item">

                  <div className="activity-icon loan">
                    <FaHandHoldingUsd />
                  </div>

                  <div className="activity-details">

                    <strong>
                      Loan issued
                    </strong>

                    <span>
                      {loanActivityLoading
                        ? 'Loading latest loan...'
                        : recentLoan
                        ? `${loanMemberNumber} - ${loanMemberName} received a loan`
                        : 'No loan recorded'}
                    </span>

                  </div>

                  <div className="activity-amount">

                    {loanActivityLoading
                      ? '...'
                      : recentLoan
                      ? `TSh ${formatCurrency(
                          loanAmount
                        )}`
                      : '—'}

                  </div>

                </div>

                <div className="activity-item">

                  <div className="activity-icon payment">
                    <FaWallet />
                  </div>

                  <div className="activity-details">

                    <strong>
                      Loan payment received
                    </strong>

                    <span>
                      {paymentLoading
                        ? 'Loading latest payment...'
                        : recentPayment
                        ? `${paymentMemberNumber} - ${paymentMemberName} paid loan installment`
                        : 'No loan payment recorded'}
                    </span>

                  </div>

                  <div className="activity-amount">

                    {paymentLoading
                      ? '...'
                      : recentPayment
                      ? `+ TSh ${formatCurrency(
                          paymentAmount
                        )}`
                      : '—'}

                  </div>

                </div>

              </div>

            </div>

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h3>Quick Actions</h3>
                  <p>Common management tasks</p>
                </div>

              </div>

              <div className="quick-actions">

                <button className="quick-action">

                  <div>
                    <FaUsers />
                  </div>

                  <span>Add Member</span>

                </button>

                <button className="quick-action">

                  <div>
                    <FaMoneyBillWave />
                  </div>

                  <span>Add Contribution</span>

                </button>

                <button className="quick-action">

                  <div>
                    <FaHandHoldingUsd />
                  </div>

                  <span>Create Loan</span>

                </button>

                <button className="quick-action">

                  <div>
                    <FaCalendarAlt />
                  </div>

                  <span>New Meeting</span>

                </button>

              </div>

            </div>

          </div>

          <div className="dashboard-bottom-grid">

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h3>Loan Summary</h3>
                  <p>Current loan status</p>
                </div>

                <a href="#">View Loans</a>

              </div>

              <div className="loan-summary-content">

                <div className="loan-summary-circle">

                  <div>

                    <strong>
                      {loansLoading
                        ? '...'
                        : activeLoansCount}
                    </strong>

                    <span>Active Loans</span>

                  </div>

                </div>

                <div className="loan-summary-stats">

                  <div>

                    <span>Outstanding</span>

                    <strong>
                      {loansLoading
                        ? '...'
                        : `TSh ${formatCurrency(
                            activeLoansTotal
                          )}`}
                    </strong>

                  </div>

                  <div>

                    <span>Paid This Cycle</span>

                    <strong>
                      {paymentLoading
                        ? '...'
                        : `TSh ${formatCurrency(
                            paidThisCycle
                          )}`}
                    </strong>

                  </div>

                  <div>

                    <span>Overdue</span>

                    <strong className="overdue-value">

                      {loansLoading
                        ? '...'
                        : `${overdueLoansCount} ${
                            overdueLoansCount === 1
                              ? 'Loan'
                              : 'Loans'
                          }`}

                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default AdminDashboard