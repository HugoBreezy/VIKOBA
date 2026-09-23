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
// PAYMENTS API
// =====================================================

const getPayments = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/payments`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  return parseApiResponse(
    response,
    'Failed to load payments.'
  )
}

const createPayment = async (payment) => {
  const response = await fetch(
    `${API_BASE_URL}/api/payments`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment),
    }
  )

  return parseApiResponse(
    response,
    'Failed to create payment.'
  )
}

const updatePayment = async (
  id,
  payment
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment),
    }
  )

  return parseApiResponse(
    response,
    'Failed to update payment.'
  )
}

const deletePayment = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    return parseApiResponse(
      response,
      'Failed to delete payment.'
    )
  }

  return true
}

// =====================================================
// INSTALLMENTS API
// =====================================================

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
    'Failed to load loan installments.'
  )
}

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

// =====================================================
// HELPERS
// =====================================================

const getInstallmentId = (installment) => {
  return (
    installment?.id ??
    installment?.installmentId ??
    null
  )
}

const getLoanFromInstallment = (
  installment
) => {
  return installment?.loan || null
}

const getMemberFromInstallment = (
  installment
) => {
  const loan = getLoanFromInstallment(
    installment
  )

  return (
    loan?.member ||
    installment?.member ||
    null
  )
}

const getCycleFromInstallment = (
  installment
) => {
  const loan = getLoanFromInstallment(
    installment
  )

  return (
    loan?.cycle ||
    installment?.cycle ||
    null
  )
}

const getInstallmentNumber = (
  installment
) => {
  return (
    installment?.installmentNumber ??
    installment?.number ??
    installment?.installmentNo ??
    installment?.sequenceNumber ??
    installment?.installmentIndex ??
    '-'
  )
}

const getInstallmentAmount = (
  installment
) => {
  return Number(
    installment?.amount ??
      installment?.installmentAmount ??
      0
  )
}

const getPenaltyInstallmentId = (
  penalty
) => {
  return (
    penalty?.installment?.id ??
    penalty?.installmentId ??
    null
  )
}

const getPenaltyAmount = (
  penalty
) => {
  return Number(
    penalty?.penaltyAmount ??
      penalty?.amount ??
      0
  )
}

const getInstallmentPaid = (
  installment,
  payments
) => {
  const installmentId =
    getInstallmentId(installment)

  return payments
    .filter(
      (payment) =>
        String(
          payment?.installment?.id ??
            payment?.installmentId ??
            ''
        ) === String(installmentId)
    )
    .reduce(
      (total, payment) =>
        total +
        Number(payment?.amount || 0),
      0
    )
}

function Payments() {
  const username =
    localStorage.getItem(
      'vikoba_username'
    ) || 'Administrator'

  const profileRef = useRef(null)

  const [payments, setPayments] =
    useState([])

  const [installments, setInstallments] =
    useState([])

  const [penalties, setPenalties] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [loadingInstallments, setLoadingInstallments] =
    useState(false)

  const [loadingPenalties, setLoadingPenalties] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const [sortBy, setSortBy] =
    useState('NEWEST')

  const [currentPage, setCurrentPage] =
    useState(1)

  const paymentsPerPage = 10

  const [showModal, setShowModal] =
    useState(false)

  const [editingPayment, setEditingPayment] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const [form, setForm] =
    useState({
      installmentId: '',
      amount: '',
      paymentDate: today,
      referenceNumber: '',
      notes: '',
    })

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) =>
    new Intl.NumberFormat(
      'en-TZ',
      {
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount) || 0
    )

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  const loadPayments = async () => {
    setLoading(true)

    try {
      const data =
        await getPayments()

      setPayments(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Failed to load payments:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Payments',
        text:
          error.message ||
          'Unable to load payments from the server.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOAD INSTALLMENTS
  // =====================================================

  const loadInstallments =
    async () => {
      setLoadingInstallments(true)

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
            'Unable to load loan installments.',
          confirmButtonText: 'OK',
          confirmButtonColor:
            '#1450c8',
        })
      } finally {
        setLoadingInstallments(false)
      }
    }

  // =====================================================
  // LOAD PENALTIES
  // =====================================================

  const loadPenalties = async () => {
    setLoadingPenalties(true)

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
        title: 'Failed to Load Penalties',
        text:
          error.message ||
          'Unable to load penalties from the server.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })
    } finally {
      setLoadingPenalties(false)
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadPayments()
    loadInstallments()
    loadPenalties()
  }, [])

  // =====================================================
  // PROFILE OUTSIDE CLICK
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
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      installmentId: '',
      amount: '',
      paymentDate: today,
      referenceNumber: '',
      notes: '',
    })
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingPayment(null)

    setForm({
      installmentId: '',
      amount: '',
      paymentDate: today,
      referenceNumber: '',
      notes: '',
    })

    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (
    payment
  ) => {
    setEditingPayment(payment)

    setForm({
      installmentId:
        payment?.installment?.id
          ?.toString() ||
        payment?.installmentId
          ?.toString() ||
        '',
      amount:
        payment?.amount ?? '',
      paymentDate:
        payment?.paymentDate ||
        today,
      referenceNumber:
        payment?.referenceNumber ||
        '',
      notes:
        payment?.notes ||
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
    setEditingPayment(null)
    resetForm()
  }

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

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
  // SELECTED INSTALLMENT
  // =====================================================

  const selectedInstallment =
    useMemo(() => {
      return installments.find(
        (installment) =>
          String(
            getInstallmentId(
              installment
            )
          ) ===
          String(
            form.installmentId
          )
      )
    }, [
      installments,
      form.installmentId,
    ])

  // =====================================================
  // SELECTED INSTALLMENT DETAILS
  // =====================================================

  const selectedLoan =
    selectedInstallment
      ? getLoanFromInstallment(
          selectedInstallment
        )
      : null

  const selectedMember =
    selectedInstallment
      ? getMemberFromInstallment(
          selectedInstallment
        )
      : null

  const selectedCycle =
    selectedInstallment
      ? getCycleFromInstallment(
          selectedInstallment
        )
      : null

  const selectedInstallmentAmount =
    selectedInstallment
      ? getInstallmentAmount(
          selectedInstallment
        )
      : 0

  const selectedInstallmentPaid =
    selectedInstallment
      ? getInstallmentPaid(
          selectedInstallment,
          payments
        )
      : 0

  const selectedRemainingAmount =
    Math.max(
      selectedInstallmentAmount -
        selectedInstallmentPaid,
      0
    )

  const selectedPendingPenalty =
    useMemo(() => {
      if (!selectedInstallment) {
        return null
      }

      const installmentId =
        getInstallmentId(
          selectedInstallment
        )

      return (
        penalties.find(
          (penalty) =>
            String(
              getPenaltyInstallmentId(
                penalty
              )
            ) ===
              String(installmentId) &&
            String(
              penalty?.status || ''
            ).toUpperCase() ===
              'PENDING'
        ) || null
      )
    }, [
      selectedInstallment,
      penalties,
    ])

  const selectedPenaltyAmount =
    selectedPendingPenalty
      ? getPenaltyAmount(
          selectedPendingPenalty
        )
      : 0

  const selectedTotalDue =
    selectedRemainingAmount +
    selectedPenaltyAmount

  // =====================================================
  // AUTO-FILL PAYMENT AMOUNT
  // =====================================================

  useEffect(() => {
    if (
      !editingPayment &&
      form.installmentId &&
      selectedInstallment
    ) {
      setForm((previous) => ({
        ...previous,
        amount: selectedTotalDue > 0
          ? selectedTotalDue.toFixed(2)
          : '',
      }))
    }
  }, [
    selectedInstallment,
    selectedTotalDue,
    form.installmentId,
    editingPayment,
  ])

  // =====================================================
  // PAYMENT SAVE
  // =====================================================

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    if (!form.installmentId) {
      Swal.fire({
        icon: 'warning',
        title: 'Installment Required',
        text:
          'Please select a loan installment.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })

      return
    }

    const amount =
      Number(form.amount) || 0

    if (amount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text:
          'Payment amount must be greater than zero.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })

      return
    }

    if (!form.paymentDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Payment Date Required',
        text:
          'Please select the payment date.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })

      return
    }

    if (
      form.paymentDate >
      today
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Payment Date',
        text:
          'Payment date cannot be in the future.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
      })

      return
    }

    setSaving(true)

    try {
      const paymentData = {
        installment: {
          id: Number(
            form.installmentId
          ),
        },

        amount: amount,

        paymentDate:
          form.paymentDate,

        referenceNumber:
          form.referenceNumber
            ?.trim() || null,

        notes:
          form.notes?.trim() ||
          null,
      }

      if (editingPayment) {
        await updatePayment(
          editingPayment.id,
          paymentData
        )
      } else {
        await createPayment(
          paymentData
        )
      }

      setShowModal(false)
      setEditingPayment(null)
      resetForm()

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            0
          )
      )

      await loadPayments()
      await loadInstallments()
      await loadPenalties()

      await Swal.fire({
        icon: 'success',
        title: editingPayment
          ? 'Payment Updated'
          : 'Payment Recorded',
        text: editingPayment
          ? 'Payment has been updated successfully.'
          : 'Payment has been recorded successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor:
          '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      console.error(
        'Failed to save payment:',
        error
      )

      setShowModal(false)
      setEditingPayment(null)
      resetForm()

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            0
          )
      )

      await Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text:
          error.message ||
          'Unable to save payment.',
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
  // DELETE PAYMENT
  // =====================================================

  const handleDelete =
    async (payment) => {
      const memberName =
        getMemberFromInstallment(
          payment?.installment
        )?.fullName ||
        'this member'

      const result =
        await Swal.fire({
          icon: 'warning',
          title: 'Delete Payment?',
          text:
            `Are you sure you want to delete the payment for ${memberName}?`,
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
        await deletePayment(
          payment.id
        )

        await loadPayments()

        Swal.fire({
          icon: 'success',
          title: 'Payment Deleted',
          text:
            'Payment has been deleted successfully.',
          confirmButtonText: 'OK',
          confirmButtonColor:
            '#1450c8',
          zIndex: 200000,
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text:
            error.message ||
            'Unable to delete payment.',
          confirmButtonText: 'OK',
          confirmButtonColor:
            '#dc3545',
          zIndex: 200000,
        })
      }
    }

  // =====================================================
  // VIEW PAYMENT
  // =====================================================

  const handleView = (
    payment
  ) => {
    const installment =
      payment?.installment

    const loan =
      getLoanFromInstallment(
        installment
      )

    const member =
      getMemberFromInstallment(
        installment
      )

    const cycle =
      getCycleFromInstallment(
        installment
      )

    Swal.fire({
      title: 'Payment Details',
      html: `
        <div style="text-align:left;line-height:1.9;">

          <strong>Payment ID:</strong>
          ${payment?.id ?? '-'}
          <br />

          <strong>Member:</strong>
          ${member?.fullName ?? '-'}
          <br />

          <strong>Member Number:</strong>
          ${member?.memberNumber ?? '-'}
          <br />

          <strong>Loan:</strong>
          #${loan?.id ?? '-'}
          <br />

          <strong>Financial Cycle:</strong>
          ${cycle?.name ?? '-'}
          <br />

          <strong>Installment:</strong>
          #${getInstallmentNumber(
            installment
          )}
          <br />

          <strong>Amount Paid:</strong>
          TSh ${formatCurrency(
            payment?.amount
          )}
          <br />

          <strong>Payment Date:</strong>
          ${payment?.paymentDate ?? '-'}
          <br />

          <strong>Payment Method:</strong>
          ${payment?.referenceNumber ?? '-'}
          <br />

          <strong>Notes:</strong>
          ${payment?.notes ?? '-'}
          <br />

        </div>
      `,
      confirmButtonText:
        'Close',
      confirmButtonColor:
        '#1450c8',
      zIndex: 200000,
    })
  }

  // =====================================================
  // FILTER PAYMENTS
  // =====================================================

  const filteredPayments =
    payments
      .filter((payment) => {
        const query =
          search
            .toLowerCase()
            .trim()

        if (!query) {
          return true
        }

        const installment =
          payment?.installment

        const loan =
          getLoanFromInstallment(
            installment
          )

        const member =
          getMemberFromInstallment(
            installment
          )

        const memberName =
          member?.fullName || ''

        const memberNumber =
          member?.memberNumber || ''

        const loanId =
          loan?.id || ''

        const reference =
          payment?.referenceNumber ||
          ''

        const paymentId =
          payment?.id || ''

        return (
          String(memberName)
            .toLowerCase()
            .includes(query) ||
          String(memberNumber)
            .toLowerCase()
            .includes(query) ||
          String(loanId)
            .toLowerCase()
            .includes(query) ||
          String(reference)
            .toLowerCase()
            .includes(query) ||
          String(paymentId)
            .toLowerCase()
            .includes(query)
        )
      })
      .filter((payment) => {
        if (
          statusFilter === 'ALL'
        ) {
          return true
        }

        const status =
          payment?.installment
            ?.status || ''

        return (
          status ===
          statusFilter
        )
      })
      .sort((a, b) => {
        if (
          sortBy === 'OLDEST'
        ) {
          return (
            new Date(
              a.paymentDate || 0
            ) -
            new Date(
              b.paymentDate || 0
            )
          )
        }

        if (
          sortBy ===
          'AMOUNT_HIGH'
        ) {
          return (
            Number(
              b.amount || 0
            ) -
            Number(
              a.amount || 0
            )
          )
        }

        if (
          sortBy ===
          'AMOUNT_LOW'
        ) {
          return (
            Number(
              a.amount || 0
            ) -
            Number(
              b.amount || 0
            )
          )
        }

        return (
          new Date(
            b.paymentDate || 0
          ) -
          new Date(
            a.paymentDate || 0
          )
        )
      })

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      filteredPayments.length /
        paymentsPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) *
    paymentsPerPage

  const paginatedPayments =
    filteredPayments.slice(
      startIndex,
      startIndex +
        paymentsPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    statusFilter,
    sortBy,
  ])

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalAmountPaid =
    payments.reduce(
      (total, payment) =>
        total +
        Number(
          payment?.amount || 0
        ),
      0
    )

  const paidInstallments =
    new Set(
      payments
        .filter(
          (payment) =>
            payment?.installment
              ?.status === 'PAID'
        )
        .map(
          (payment) =>
            payment?.installment
              ?.id
        )
    ).size

  const partialInstallments =
    new Set(
      payments
        .filter(
          (payment) =>
            payment?.installment
              ?.status === 'PARTIAL'
        )
        .map(
          (payment) =>
            payment?.installment
              ?.id
        )
    ).size

  const pendingInstallments =
    new Set(
      installments
        .filter(
          (installment) =>
            installment?.status ===
            'PENDING'
        )
        .map(
          (installment) =>
            getInstallmentId(
              installment
            )
        )
    ).size

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = () => {
    if (payments.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Payments',
        text:
          'There are no payments to export.',
        confirmButtonText:
          'OK',
        confirmButtonColor:
          '#1450c8',
      })

      return
    }

    const headers = [
      'ID',
      'Member Number',
      'Member Name',
      'Loan',
      'Installment',
      'Amount',
      'Payment Date',
      'Payment Method',
      'Status',
    ]

    const rows =
      payments.map(
        (payment) => {
          const installment =
            payment?.installment

          const loan =
            getLoanFromInstallment(
              installment
            )

          const member =
            getMemberFromInstallment(
              installment
            )

          return [
            payment?.id || '',
            member?.memberNumber ||
              '',
            member?.fullName ||
              '',
            loan?.id || '',
            getInstallmentNumber(
              installment
            ),
            payment?.amount || '',
            payment?.paymentDate ||
              '',
            payment?.referenceNumber ||
              '',
            installment?.status ||
              '',
          ]
        }
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
      'vikoba-payments.csv'

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
            className="sidebar-link active"
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
              placeholder="Search payments..."
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
            BODY / PAYMENTS CONTENT
        ================================================= */}

        <div className="dashboard-content">

          <div className="members-page">

            <div className="members-header">

              <div>

                <h1>
                  Payments
                </h1>

                <p>
                  Manage loan repayments and payment records.
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
                  Record Payment
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
                    Total Payments
                  </span>

                  <strong>
                    {payments.length}
                  </strong>

                </div>

                <FaFileInvoiceDollar />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Total Amount Paid
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalAmountPaid
                    )}
                  </strong>

                </div>

                <FaMoneyBillWave />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Paid Installments
                  </span>

                  <strong>
                    {paidInstallments}
                  </strong>

                </div>

                <FaWallet />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Partial Installments
                  </span>

                  <strong>
                    {partialInstallments}
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
                      placeholder="Search by member, loan or reference..."
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
                    value={
                      statusFilter
                    }
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="ALL">
                      All Status
                    </option>

                    <option value="PAID">
                      Paid
                    </option>

                    <option value="PARTIAL">
                      Partial
                    </option>

                    <option value="PENDING">
                      Pending
                    </option>

                  </select>

                  <select
                    className="form-select"
                    value={
                      sortBy
                    }
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
                      Loading payments...
                    </span>

                  </div>

                ) : paginatedPayments.length === 0 ? (

                  <div className="members-empty">

                    <FaFileInvoiceDollar />

                    <h3>
                      No Payments Found
                    </h3>

                    <p>
                      No payments match your current search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />
                      Record Payment
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
                          LOAN
                        </th>

                        <th>
                          INSTALLMENT
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          PAYMENT DATE
                        </th>

                        <th>
                          REFERENCE
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

                      {paginatedPayments.map(
                        (payment) => {

                          const installment =
                            payment?.installment

                          const loan =
                            getLoanFromInstallment(
                              installment
                            )

                          const member =
                            getMemberFromInstallment(
                              installment
                            )

                          const status =
                            installment?.status ||
                            'PENDING'

                          return (
                            <tr
                              key={
                                payment.id
                              }
                            >

                              <td>

                                <div className="member-table-user">

                                  <div className="member-avatar">

                                    {(
                                      member?.fullName ||
                                      'M'
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>

                                  <div>

                                    <strong>
                                      {member?.fullName ||
                                        'Unknown Member'}
                                    </strong>

                                    <span>
                                      {member?.memberNumber ||
                                        '-'}
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>
                                #{loan?.id ?? '-'}
                              </td>

                              <td>
                                #
                                {getInstallmentNumber(
                                  installment
                                )}
                              </td>

                              <td>

                                <strong>
                                  TSh{' '}
                                  {formatCurrency(
                                    payment.amount
                                  )}
                                </strong>

                              </td>

                              <td>
                                {payment.paymentDate ||
                                  '-'}
                              </td>

                              <td>
                                {payment.referenceNumber ||
                                  '-'}
                              </td>

                              <td>

                                <span
                                  className={
                                    `badge ${
                                      status ===
                                      'PAID'
                                        ? 'bg-success'
                                        : status ===
                                          'PARTIAL'
                                        ? 'bg-warning text-dark'
                                        : 'bg-secondary'
                                    }`
                                  }
                                >
                                  {status}
                                </span>

                              </td>

                              <td>

                                <div className="member-actions">

                                  <button
                                    type="button"
                                    title="View"
                                    onClick={() =>
                                      handleView(
                                        payment
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
                                        payment
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
                                        payment
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
                filteredPayments.length >
                  0 && (

                <div className="members-pagination">

                  <span>
                    Showing{' '}
                    {startIndex + 1}
                    {' - '}
                    {Math.min(
                      startIndex +
                        paymentsPerPage,
                      filteredPayments.length
                    )}
                    {' of '}
                    {filteredPayments.length}
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
                          key={
                            page
                          }
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
          RECORD / EDIT PAYMENT MODAL
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
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

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
                  {editingPayment
                    ? 'Edit Payment'
                    : 'Record Payment'}
                </h3>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6c757d',
                  }}
                >
                  {editingPayment
                    ? 'Update payment information.'
                    : 'Enter the payment details below.'}
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

            {/* =================================================
                FORM
            ================================================= */}

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
                      Loan Installment
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
                      disabled={
                        loadingInstallments ||
                        saving
                      }
                    >

                      <option value="">
                        {loadingInstallments
                          ? 'Loading installments...'
                          : 'Select Loan Installment'}
                      </option>

                      {installments
                        .filter(
                          (
                            installment
                          ) => {
                            const remaining =
                              Math.max(
                                getInstallmentAmount(
                                  installment
                                ) -
                                  getInstallmentPaid(
                                    installment,
                                    payments
                                  ),
                                0
                              )

                            const installmentId =
                              getInstallmentId(
                                installment
                              )

                            const editingInstallmentId =
                              editingPayment?.installment?.id ??
                              editingPayment?.installmentId

                            return (
                              remaining > 0 ||
                              String(installmentId) ===
                                String(
                                  editingInstallmentId
                                )
                            )
                          }
                        )
                        .map(
                          (
                            installment
                          ) => {

                            const member =
                              getMemberFromInstallment(
                                installment
                              )

                            const loan =
                              getLoanFromInstallment(
                                installment
                              )

                            const cycle =
                              getCycleFromInstallment(
                                installment
                              )

                            const remaining =
                              Math.max(
                                getInstallmentAmount(
                                  installment
                                ) -
                                  getInstallmentPaid(
                                    installment,
                                    payments
                                  ),
                                0
                              )

                            return (
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
                                {member?.memberNumber ||
                                  'Member'}{' '}
                                -{' '}
                                {member?.fullName ||
                                  'Unknown Member'}{' '}
                                | Loan #
                                {loan?.id ||
                                  '-'}{' '}
                                | Installment #
                                {getInstallmentNumber(
                                  installment
                                )}{' '}
                                | Remaining TSh{' '}
                                {formatCurrency(
                                  remaining
                                )}
                              </option>
                            )
                          }
                        )}

                    </select>

                  </div>

                  {/* SELECTED INSTALLMENT INFO */}

                  {selectedInstallment && (

                    <div className="col-12">

                      <div className="alert alert-info border mb-0">

                        <div className="row">

                          <div className="col-md-3">

                            <strong>
                              Member
                            </strong>

                            <div>
                              {selectedMember?.fullName ||
                                '-'}
                            </div>

                            <small>
                              {selectedMember?.memberNumber ||
                                '-'}
                            </small>

                          </div>

                          <div className="col-md-3">

                            <strong>
                              Loan
                            </strong>

                            <div>
                              #
                              {selectedLoan?.id ||
                                '-'}
                            </div>

                            <small>
                              {selectedCycle?.name ||
                                '-'}
                            </small>

                          </div>

                          <div className="col-md-3">

                            <strong>
                              Installment
                            </strong>

                            <div>
                              #
                              {getInstallmentNumber(
                                selectedInstallment
                              )}
                            </div>

                            <small>
                              Due TSh{' '}
                              {formatCurrency(
                                selectedInstallmentAmount
                              )}
                            </small>

                          </div>

                          <div className="col-md-3">

                            <strong>
                              Remaining
                            </strong>

                            <div>
                              TSh{' '}
                              {formatCurrency(
                                selectedRemainingAmount
                              )}
                            </div>

                            <small>
                              Status:{' '}
                              {selectedInstallment?.status ||
                                '-'}
                            </small>

                          </div>

                          <div className="col-md-3">

                            <strong>
                              Penalty
                            </strong>

                            <div>
                              TSh{' '}
                              {formatCurrency(
                                selectedPenaltyAmount
                              )}
                            </div>

                            <small>
                              {selectedPendingPenalty
                                ? 'PENDING'
                                : 'No pending penalty'}
                            </small>

                          </div>

                          <div className="col-md-3">

                            <strong>
                              Total Due
                            </strong>

                            <div>
                              TSh{' '}
                              {formatCurrency(
                                selectedTotalDue
                              )}
                            </div>

                            <small>
                              Installment + penalty
                            </small>

                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                  {/* AMOUNT */}

                  <div className="col-md-6">

                    <label className="form-label">
                      Payment Amount
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={
                        form.amount
                      }
                      readOnly
                      min="0.01"
                      step="0.01"
                      placeholder="Select an installment"
                      required
                    />

                    {selectedInstallment && (
                      <small className="text-muted">
                        Total due including pending penalty:{' '}
                        <strong>
                          TSh {formatCurrency(
                            selectedTotalDue
                          )}
                        </strong>
                      </small>
                    )}

                  </div>

                  {/* PAYMENT DATE */}

                  <div className="col-md-6">

                    <label className="form-label">
                      Payment Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      name="paymentDate"
                      value={
                        form.paymentDate
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

                  {/* PAYMENT METHOD */}

                  <div className="col-md-6">

                    <label className="form-label">
                      Payment Method
                    </label>

                    <select
                      className="form-select"
                      name="referenceNumber"
                      value={
                        form.referenceNumber
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select Payment Method
                      </option>

                      <option value="CASH">
                        Cash
                      </option>

                      <option value="MOBILE MONEY">
                        Mobile Money
                      </option>

                      <option value="BANK">
                        Bank
                      </option>

                    </select>

                    <small className="text-muted">
                      Select how the member paid.
                    </small>

                  </div>

                  {/* NOTES */}

                  <div className="col-md-6">

                    <label className="form-label">
                      Notes
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="notes"
                      value={
                        form.notes
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Optional notes"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

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
                    : editingPayment
                    ? 'Update Payment'
                    : 'Record Payment'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Payments