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

// =====================================================
// API FUNCTIONS
// =====================================================

const getPenalties = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/penalties`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    'Failed to load penalties.'
  )
}

const getInstallments = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/installments`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    'Failed to load installments.'
  )
}

const createPenalty = async (penalty) => {
  const response = await fetch(
    `${API_BASE_URL}/api/penalties`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(penalty),
    }
  )

  return parseApiResponse(
    response,
    'Failed to create penalty.'
  )
}

const updatePenalty = async (
  id,
  penalty
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/penalties/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(penalty),
    }
  )

  return parseApiResponse(
    response,
    'Failed to update penalty.'
  )
}

const deletePenalty = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/penalties/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    return parseApiResponse(
      response,
      'Failed to delete penalty.'
    )
  }

  return true
}

// =====================================================
// HELPERS
// =====================================================

const getInstallmentId = (
  installment
) =>
  installment?.id ??
  installment?.installmentId ??
  ''

const getInstallmentNumber = (
  installment
) =>
  installment?.installmentNumber ??
  installment?.number ??
  '-'

const getInstallmentAmount = (
  installment
) =>
  Number(
    installment?.amount ??
      installment?.installmentAmount ??
      0
  )

const getInstallmentStatus = (
  installment
) =>
  installment?.status ||
  ''

const getInstallmentDueDate = (
  installment
) =>
  installment?.dueDate ||
  ''

const getLoanId = (
  installment
) =>
  installment?.loan?.id ??
  installment?.loanId ??
  ''

const getMemberName = (
  installment
) =>
  installment?.loan?.member?.fullName ||
  installment?.loan?.memberName ||
  installment?.member?.fullName ||
  installment?.memberName ||
  '-'

const getMemberNumber = (
  installment
) =>
  installment?.loan?.member?.memberNumber ||
  installment?.member?.memberNumber ||
  '-'

const getLoanName = (
  installment
) => {
  const loanId =
    getLoanId(installment)

  return loanId
    ? `Loan #${loanId}`
    : '-'
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat(
    'en-TZ',
    {
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount) || 0
  )

const isInstallmentOverdue = (
  installment
) => {
  const dueDate =
    getInstallmentDueDate(
      installment
    )

  const status =
    getInstallmentStatus(
      installment
    )

  if (!dueDate) {
    return false
  }

  if (
    String(status).toUpperCase() ===
    'PAID'
  ) {
    return false
  }

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  return dueDate < today
}

// =====================================================
// COMPONENT
// =====================================================

function Penalties() {
  const username =
    localStorage.getItem(
      'vikoba_username'
    ) ||
    'Administrator'

  const profileRef =
    useRef(null)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [penalties, setPenalties] =
    useState([])

  const [installments, setInstallments] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const [currentPage, setCurrentPage] =
    useState(1)

  const penaltiesPerPage = 10

  const [showModal, setShowModal] =
    useState(false)

  const [editingPenalty, setEditingPenalty] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const [form, setForm] =
    useState({
      installmentId: '',
      penaltyDate: today,
      status: 'PENDING',
      notes: '',
    })

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadPenalties =
    async () => {
      setLoading(true)

      try {
        const data =
          await getPenalties()

        setPenalties(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Failed to load penalties:',
          error
        )

        Swal.fire({
          icon: 'error',
          title:
            'Failed to Load Penalties',
          text:
            error.message ||
            'Unable to load penalties from the server.',
          confirmButtonText:
            'OK',
        })
      } finally {
        setLoading(false)
      }
    }

  const loadInstallments =
    async () => {
      try {
        const data =
          await getInstallments()

        setInstallments(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Failed to load installments:',
          error
        )

        Swal.fire({
          icon: 'error',
          title:
            'Failed to Load Installments',
          text:
            error.message ||
            'Unable to load installments from the server.',
          confirmButtonText:
            'OK',
        })
      }
    }

  useEffect(() => {
    loadPenalties()
    loadInstallments()
  }, [])

  // =====================================================
  // OUTSIDE PROFILE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
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
      installmentId: '',
      penaltyDate: today,
      status: 'PENDING',
      notes: '',
    })
  }

  const openAddModal = () => {
    setEditingPenalty(null)

    resetForm()

    setShowModal(true)
  }

  const openEditModal = (
    penalty
  ) => {
    setEditingPenalty(penalty)

    setForm({
      installmentId:
        penalty?.installment?.id
          ?.toString() ||
        penalty?.installmentId
          ?.toString() ||
        '',

      penaltyDate:
        penalty?.penaltyDate ||
        today,

      status:
        penalty?.status ||
        'PENDING',

      notes:
        penalty?.notes ||
        '',
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setShowModal(false)

    setEditingPenalty(null)

    resetForm()
  }

  const handleChange = (
    event
  ) => {
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

  // =====================================================
  // AVAILABLE INSTALLMENTS
  // =====================================================

  const availableInstallments =
    useMemo(() => {
      const existingPenaltyInstallmentIds =
        new Set(
          penalties
            .filter(
              (penalty) =>
                String(
                  penalty?.status ||
                    ''
                ).toUpperCase() ===
                'PENDING'
            )
            .map(
              (penalty) =>
                String(
                  penalty?.installment
                    ?.id ??
                    penalty?.installmentId ??
                    ''
                )
            )
        )

      return installments
        .filter(
          (installment) =>
            isInstallmentOverdue(
              installment
            )
        )
        .filter(
          (installment) => {
            const installmentId =
              String(
                getInstallmentId(
                  installment
                )
              )

            const editingInstallmentId =
              String(
                editingPenalty
                  ?.installment?.id ??
                  editingPenalty
                    ?.installmentId ??
                  ''
              )

            if (
              installmentId ===
              editingInstallmentId
            ) {
              return true
            }

            return (
              !existingPenaltyInstallmentIds.has(
                installmentId
              )
            )
          }
        )
    }, [
      installments,
      penalties,
      editingPenalty,
    ])

  const selectedInstallment =
    useMemo(
      () =>
        installments.find(
          (installment) =>
            String(
              getInstallmentId(
                installment
              )
            ) ===
            String(
              form.installmentId
            )
        ),
      [
        installments,
        form.installmentId,
      ]
    )

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    if (!form.installmentId) {
      Swal.fire({
        icon: 'warning',
        title:
          'Installment Required',
        text:
          'Please select an overdue installment.',
        confirmButtonText:
          'OK',
      })

      return
    }

    if (!form.penaltyDate) {
      Swal.fire({
        icon: 'warning',
        title:
          'Penalty Date Required',
        text:
          'Please select the penalty date.',
        confirmButtonText:
          'OK',
      })

      return
    }

    if (
      form.penaltyDate >
      today
    ) {
      Swal.fire({
        icon: 'warning',
        title:
          'Invalid Penalty Date',
        text:
          'Penalty date cannot be in the future.',
        confirmButtonText:
          'OK',
      })

      return
    }

    setSaving(true)

    try {
      /*
       * The backend calculates:
       * - penalty rate
       * - penalty amount
       *
       * based on the overdue installment
       * and PENALTY_RATE system setting.
       */

      const penaltyData = {
        installment: {
          id: Number(
            form.installmentId
          ),
        },

        penaltyDate:
          form.penaltyDate,

        status:
          form.status,

        notes:
          form.notes?.trim() ||
          '',
      }

      if (editingPenalty) {
        /*
         * For update, the backend expects
         * the existing penalty information.
         */
        const updateData = {
          installment: {
            id: Number(
              form.installmentId
            ),
          },

          penaltyRate:
            Number(
              editingPenalty.penaltyRate
            ) || 0,

          penaltyAmount:
            Number(
              editingPenalty.penaltyAmount
            ) || 0,

          penaltyDate:
            form.penaltyDate,

          status:
            form.status,

          notes:
            form.notes?.trim() ||
            '',
        }

        await updatePenalty(
          editingPenalty.id,
          updateData
        )
      } else {
        await createPenalty(
          penaltyData
        )
      }

      setShowModal(false)

      setEditingPenalty(null)

      resetForm()

      await loadPenalties()

      await Swal.fire({
        icon: 'success',
        title:
          editingPenalty
            ? 'Penalty Updated'
            : 'Penalty Created',

        text:
          editingPenalty
            ? 'Penalty has been updated successfully.'
            : 'Penalty has been created successfully.',

        confirmButtonText:
          'OK',

        confirmButtonColor:
          '#1450c8',
      })
    } catch (error) {
      console.error(
        'Failed to save penalty:',
        error
      )

      setShowModal(false)

      setEditingPenalty(null)

      resetForm()

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            0
          )
      )

      Swal.fire({
        icon: 'error',
        title:
          'Operation Failed',

        text:
          error.message ||
          'Unable to save penalty.',

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

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async (penalty) => {
      const result =
        await Swal.fire({
          icon: 'warning',

          title:
            'Delete Penalty?',

          text:
            `Are you sure you want to delete penalty #${penalty.id}?`,

          showCancelButton:
            true,

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
        await deletePenalty(
          penalty.id
        )

        await loadPenalties()

        Swal.fire({
          icon: 'success',

          title:
            'Penalty Deleted',

          text:
            'Penalty has been deleted successfully.',

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
            'Unable to delete penalty.',

          confirmButtonText:
            'OK',
        })
      }
    }

  // =====================================================
  // VIEW
  // =====================================================

  const handleView = (
    penalty
  ) => {
    const installment =
      penalty?.installment

    const memberName =
      getMemberName(
        installment
      )

    const memberNumber =
      getMemberNumber(
        installment
      )

    const installmentNumber =
      getInstallmentNumber(
        installment
      )

    const installmentId =
      getInstallmentId(
        installment
      )

    const loanId =
      getLoanId(
        installment
      )

    Swal.fire({
      title:
        'Penalty Details',

      html: `
        <div style="text-align:left;line-height:1.9;">

          <strong>Penalty ID:</strong>
          ${penalty?.id ?? '-'}
          <br />

          <strong>Member:</strong>
          ${memberName}
          <br />

          <strong>Member Number:</strong>
          ${memberNumber}
          <br />

          <strong>Loan:</strong>
          ${
            loanId
              ? `Loan #${loanId}`
              : '-'
          }
          <br />

          <strong>Installment:</strong>
          #${installmentNumber}
          <br />

          <strong>Installment ID:</strong>
          ${installmentId || '-'}
          <br />

          <strong>Penalty Rate:</strong>
          ${penalty?.penaltyRate ?? 0}%
          <br />

          <strong>Penalty Amount:</strong>
          TSh ${formatCurrency(
            penalty?.penaltyAmount
          )}
          <br />

          <strong>Penalty Date:</strong>
          ${
            penalty?.penaltyDate ||
            '-'
          }
          <br />

          <strong>Status:</strong>
          ${
            penalty?.status ||
            '-'
          }
          <br />

          <strong>Notes:</strong>
          ${
            penalty?.notes ||
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
  // FILTER
  // =====================================================

  const filteredPenalties =
    penalties
      .filter(
        (penalty) => {
          const query =
            search
              .toLowerCase()
              .trim()

          if (!query) {
            return true
          }

          const memberName =
            getMemberName(
              penalty?.installment
            )

          const memberNumber =
            getMemberNumber(
              penalty?.installment
            )

          const installmentNumber =
            getInstallmentNumber(
              penalty?.installment
            )

          const penaltyId =
            String(
              penalty?.id || ''
            )

          return (
            memberName
              .toLowerCase()
              .includes(query) ||

            memberNumber
              .toLowerCase()
              .includes(query) ||

            String(
              installmentNumber
            )
              .toLowerCase()
              .includes(query) ||

            penaltyId.includes(
              query
            )
          )
        }
      )
      .filter(
        (penalty) => {
          if (
            statusFilter ===
            'ALL'
          ) {
            return true
          }

          return (
            String(
              penalty?.status ||
                ''
            ).toUpperCase() ===
            statusFilter
          )
        }
      )
      .sort(
        (a, b) =>
          Number(
            b?.id || 0
          ) -
          Number(
            a?.id || 0
          )
      )

  const totalPages =
    Math.ceil(
      filteredPenalties.length /
        penaltiesPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) *
    penaltiesPerPage

  const paginatedPenalties =
    filteredPenalties.slice(
      startIndex,
      startIndex +
        penaltiesPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    statusFilter,
  ])

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalPenalties =
    penalties.length

  const pendingPenalties =
    penalties.filter(
      (penalty) =>
        String(
          penalty?.status ||
            ''
        ).toUpperCase() ===
        'PENDING'
    ).length

  const paidPenalties =
    penalties.filter(
      (penalty) =>
        String(
          penalty?.status ||
            ''
        ).toUpperCase() ===
        'PAID'
    ).length

  const totalPenaltyAmount =
    penalties.reduce(
      (
        total,
        penalty
      ) =>
        total +
        Number(
          penalty?.penaltyAmount ||
            0
        ),
      0
    )

  const pendingPenaltyAmount =
    penalties
      .filter(
        (penalty) =>
          String(
            penalty?.status ||
              ''
          ).toUpperCase() ===
          'PENDING'
      )
      .reduce(
        (
          total,
          penalty
        ) =>
          total +
          Number(
            penalty?.penaltyAmount ||
              0
          ),
        0
      )

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport =
    () => {
      if (
        penalties.length ===
        0
      ) {
        Swal.fire({
          icon: 'info',
          title:
            'No Penalties',
          text:
            'There are no penalties to export.',
          confirmButtonText:
            'OK',
        })

        return
      }

      const headers = [
        'ID',
        'Member Number',
        'Member Name',
        'Loan',
        'Installment',
        'Penalty Rate',
        'Penalty Amount',
        'Penalty Date',
        'Status',
        'Notes',
      ]

      const rows =
        penalties.map(
          (penalty) => {
            const installment =
              penalty?.installment

            return [
              penalty?.id ||
                '',

              getMemberNumber(
                installment
              ),

              getMemberName(
                installment
              ),

              getLoanName(
                installment
              ),

              getInstallmentNumber(
                installment
              ),

              penalty?.penaltyRate ||
                '',

              penalty?.penaltyAmount ||
                '',

              penalty?.penaltyDate ||
                '',

              penalty?.status ||
                '',

              penalty?.notes ||
                '',
            ]
          }
        )

      const csvContent =
        [
          headers,
          ...rows,
        ]
          .map(
            (row) =>
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
        'vikoba-penalties.csv'

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

    window.location.replace(
      '/'
    )
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="dashboard-page"
      style={{
        minHeight:
          '100vh',
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
            className="sidebar-link active"
          >
            <FaExclamationTriangle />

            <span>
              Penalties
            </span>
          </a>

          <a
            href="/expenses"
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
            href="/share-outs"
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
            href="/reports"
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
              placeholder="Search penalties..."
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
            CONTENT
        ================================================= */}

        <div className="dashboard-content">

          <div className="members-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="members-header">

              <div>

                <h1>
                  Penalties
                </h1>

                <p>
                  Manage penalties for overdue loan installments.
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

              </div>

            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="members-summary-grid">

              <div className="members-summary-card">

                <div>

                  <span>
                    Total Penalties
                  </span>

                  <strong>
                    {totalPenalties}
                  </strong>

                </div>

                <FaExclamationTriangle />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Pending
                  </span>

                  <strong>
                    {pendingPenalties}
                  </strong>

                </div>

                <FaWallet />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Paid
                  </span>

                  <strong>
                    {paidPenalties}
                  </strong>

                </div>

                <FaMoneyBillWave />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Pending Amount
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      pendingPenaltyAmount
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
                      placeholder="Search by member, installment or penalty ID..."
                      value={
                        search
                      }
                      onChange={(
                        event
                      ) =>
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

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="PAID">
                      Paid
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
                      Loading penalties...
                    </span>

                  </div>

                ) : paginatedPenalties.length === 0 ? (

                  <div className="members-empty">

                    <FaExclamationTriangle />

                    <h3>
                      No Penalties Found
                    </h3>

                    <p>
                      No penalties match your current search or filter.
                    </p>

                  </div>

                ) : (

                  <table className="members-table">

                    <thead>

                      <tr>

                        <th>
                          MEMBER
                        </th>

                        <th>
                          LOAN
                        </th>

                        <th>
                          INSTALLMENT
                        </th>

                        <th>
                          PENALTY RATE
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          DATE
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

                      {paginatedPenalties.map(
                        (penalty) => {

                          const installment =
                            penalty?.installment

                          const memberName =
                            getMemberName(
                              installment
                            )

                          const memberNumber =
                            getMemberNumber(
                              installment
                            )

                          const installmentNumber =
                            getInstallmentNumber(
                              installment
                            )

                          return (

                            <tr
                              key={
                                penalty.id
                              }
                            >

                              <td>

                                <div className="member-table-user">

                                  <div className="member-avatar">

                                    {(
                                      memberName ||
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
                                        memberName
                                      }
                                    </strong>

                                    <span>
                                      {
                                        memberNumber
                                      }
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>
                                {getLoanName(
                                  installment
                                )}
                              </td>

                              <td>
                                #
                                {
                                  installmentNumber
                                }
                              </td>

                              <td>
                                {
                                  penalty?.penaltyRate ??
                                  0
                                }%
                              </td>

                              <td>

                                <strong>
                                  TSh{' '}
                                  {formatCurrency(
                                    penalty?.penaltyAmount
                                  )}
                                </strong>

                              </td>

                              <td>
                                {
                                  penalty?.penaltyDate ||
                                  '-'
                                }
                              </td>

                              <td>

                                <span
                                  className={
                                    `badge ${
                                      String(
                                        penalty?.status ||
                                          ''
                                      ).toUpperCase() ===
                                      'PENDING'
                                        ? 'bg-warning text-dark'
                                        : String(
                                            penalty?.status ||
                                              ''
                                          ).toUpperCase() ===
                                          'PAID'
                                        ? 'bg-success'
                                        : 'bg-secondary'
                                    }`
                                  }
                                >
                                  {
                                    penalty?.status ||
                                    '-'
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
                                        penalty
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
                                        penalty
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
                                        penalty
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

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {!loading &&
                filteredPenalties.length >
                  0 && (

                <div className="members-pagination">

                  <span>

                    Showing{' '}

                    {startIndex + 1}

                    {' - '}

                    {Math.min(
                      startIndex +
                        penaltiesPerPage,
                      filteredPenalties.length
                    )}

                    {' of '}

                    {
                      filteredPenalties.length
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

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && editingPenalty && (

        <div
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor:
              'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding: '20px',
          }}
        >

          <div
            style={{
              position:
                'relative',
              width: '100%',
              maxWidth:
                '750px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              backgroundColor:
                '#ffffff',
              borderRadius:
                '12px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
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
                    fontSize:
                      '22px',
                    fontWeight:
                      700,
                  }}
                >
                  Edit Penalty
                </h3>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6c757d',
                  }}
                >
                  Update penalty information.
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
                style={{
                  border:
                    'none',
                  background:
                    'transparent',
                  fontSize:
                    '20px',
                  cursor:
                    saving
                      ? 'not-allowed'
                      : 'pointer',
                  color:
                    '#6c757d',
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
                  padding:
                    '24px',
                }}
              >

                <div className="row g-3">

                  {/* INSTALLMENT */}

                  <div className="col-12">

                    <label className="form-label">
                      Overdue Installment
                    </label>

                    <select
                      className="form-select"
                      name="installmentId"
                      value={
                        form.installmentId
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select Overdue Installment
                      </option>

                      {availableInstallments.map(
                        (
                          installment
                        ) => (

                          <option
                            key={
                              getInstallmentId(
                                installment
                              )
                            }
                            value={
                              getInstallmentId(
                                installment
                              )
                            }
                          >
                            {getMemberName(
                              installment
                            )}
                            {' - '}
                            {getLoanName(
                              installment
                            )}
                            {' - '}
                            Installment #
                            {
                              getInstallmentNumber(
                                installment
                              )
                            }
                            {' - TSh '}
                            {formatCurrency(
                              getInstallmentAmount(
                                installment
                              )
                            )}
                            {' - Due '}
                            {
                              getInstallmentDueDate(
                                installment
                              )
                            }
                          </option>

                        )
                      )}

                    </select>

                    {availableInstallments.length ===
                      0 && (
                      <small className="text-danger">
                        No overdue unpaid installments are available for a new penalty.
                      </small>
                    )}

                  </div>

                  {/* SELECTED INSTALLMENT INFO */}

                  {selectedInstallment && (

                    <div className="col-12">

                      <div className="alert alert-info border mb-0">

                        <strong>
                          Selected Installment
                        </strong>

                        <div className="row mt-2">

                          <div className="col-md-4">

                            <small>
                              Member
                            </small>

                            <div>
                              {
                                getMemberName(
                                  selectedInstallment
                                )
                              }
                            </div>

                          </div>

                          <div className="col-md-4">

                            <small>
                              Amount
                            </small>

                            <div>
                              TSh{' '}
                              {formatCurrency(
                                getInstallmentAmount(
                                  selectedInstallment
                                )
                              )}
                            </div>

                          </div>

                          <div className="col-md-4">

                            <small>
                              Due Date
                            </small>

                            <div>
                              {
                                getInstallmentDueDate(
                                  selectedInstallment
                                )
                              }
                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                  {/* DATE */}

                  <div className="col-md-6">

                    <label className="form-label">
                      Penalty Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      name="penaltyDate"
                      value={
                        form.penaltyDate
                      }
                      onChange={
                        handleChange
                      }
                      max={
                        today
                      }
                      required
                    />

                  </div>

                  {/* STATUS */}

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
                    >

                      <option value="PENDING">
                        PENDING
                      </option>

                      <option value="PAID">
                        PAID
                      </option>

                    </select>

                  </div>

                  {/* NOTES */}

                  <div className="col-12">

                    <label className="form-label">
                      Notes
                    </label>

                    <textarea
                      className="form-control"
                      name="notes"
                      rows="4"
                      value={
                        form.notes
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Optional notes..."
                    />

                  </div>

                  {/* INFORMATION */}

                  {!editingPenalty && (

                    <div className="col-12">

                      <div className="alert alert-warning border mb-0">

                        <strong>
                          Important
                        </strong>

                        <p className="mb-0 mt-1">
                          The backend automatically calculates the penalty rate and penalty amount using the configured PENALTY_RATE setting.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              </div>

              {/* FOOTER */}

              <div
                style={{
                  display:
                    'flex',
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
                  className="members-add-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Saving...'
                    : 'Update Penalty'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Penalties