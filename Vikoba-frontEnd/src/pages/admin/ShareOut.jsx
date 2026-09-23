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
  FaChartLine,
  FaReceipt,
  FaCoins,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa'
import Swal from 'sweetalert2'

const API_BASE_URL = 'http://localhost:8080'

function ShareOut() {
  const token = localStorage.getItem('vikoba_token')
  const username =
    localStorage.getItem('vikoba_username') ||
    localStorage.getItem('vikoba_user') ||
    ''

  const [shareOuts, setShareOuts] = useState([])
  const [cycles, setCycles] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [cycleFilter, setCycleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')

  const [currentPage, setCurrentPage] = useState(1)
  const shareOutsPerPage = 8

  const [showModal, setShowModal] = useState(false)
  const [editingShareOut, setEditingShareOut] = useState(null)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedShareOut, setSelectedShareOut] = useState(null)
  const [shareOutDetails, setShareOutDetails] = useState([])
  const [members, setMembers] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [savingDetail, setSavingDetail] = useState(false)

  const profileRef = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const [form, setForm] = useState({
    cycleId: '',
    shareOutDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    notes: '',
  })

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // =====================================================
  // LOAD SHARE-OUTS
  // =====================================================

  const loadShareOuts = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/api/share-outs`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load share-outs. HTTP ${response.status}`
        )
      }

      const data = await response.json()

      setShareOuts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load share-outs:', error)

      Swal.fire({
        icon: 'error',
        title: 'Unable to Load Share-Outs',
        text:
          error.message ||
          'Unable to load share-out records.',
        confirmButtonText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOAD FINANCIAL CYCLES
  // =====================================================

  const loadCycles = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/financial-cycles`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load financial cycles. HTTP ${response.status}`
        )
      }

      const data = await response.json()

      setCycles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(
        'Failed to load financial cycles:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Unable to Load Cycles',
        text:
          error.message ||
          'Unable to load financial cycles.',
        confirmButtonText: 'OK',
      })
    }
  }

  const loadMembers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/members`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(`Unable to load members. HTTP ${response.status}`)
      }

      const data = await response.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load members:', error)
    }
  }

  const loadShareOutDetails = async (shareOutId) => {
    try {
      setLoadingDetails(true)

      const response = await fetch(
        `${API_BASE_URL}/api/share-out-details/share-out/${shareOutId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(`Unable to load share-out details. HTTP ${response.status}`)
      }

      const data = await response.json()
      const details = Array.isArray(data) ? data : []
      setShareOutDetails(details)
      return details
    } catch (error) {
      console.error('Failed to load share-out details:', error)
      setShareOutDetails([])
      Swal.fire({
        icon: 'error',
        title: 'Unable to Load Details',
        text: error.message || 'Unable to load member share-out details.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    loadShareOuts()
    loadCycles()
    loadMembers()
  }, [])

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      cycleId: '',
      shareOutDate:
        new Date().toISOString().split('T')[0],
      status: 'PENDING',
      notes: '',
    })
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingShareOut(null)

    resetForm()

    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (shareOut) => {
    setEditingShareOut(shareOut)

    setForm({
      cycleId: shareOut.cycle?.id
        ? String(shareOut.cycle.id)
        : '',
      shareOutDate:
        shareOut.shareOutDate ||
        new Date().toISOString().split('T')[0],
      status:
        shareOut.status || 'PENDING',
      notes: shareOut.notes || '',
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
    setEditingShareOut(null)
    resetForm()
  }

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // =====================================================
  // SAVE SHARE-OUT
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault()

    if (!form.cycleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Financial Cycle Required',
        text: 'Please select a financial cycle.',
        confirmButtonText: 'OK',
      })

      return
    }

    const payload = {
      cycle: {
        id: Number(form.cycleId),
      },
      shareOutDate:
        form.shareOutDate || null,
      status:
        form.status || 'PENDING',
      notes:
        form.notes.trim() || null,
    }

    try {
      setSaving(true)

      const url = editingShareOut
        ? `${API_BASE_URL}/api/share-outs/${editingShareOut.id}`
        : `${API_BASE_URL}/api/share-outs`

      const response = await fetch(url, {
        method: editingShareOut ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()

      let responseData = null

      try {
        responseData = responseText
          ? JSON.parse(responseText)
          : null
      } catch {
        responseData = null
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
          responseData?.error ||
          responseText ||
          `Operation failed. HTTP ${response.status}`
        )
      }

      // Close the modal BEFORE showing SweetAlert.
      // This prevents SweetAlert from appearing behind the form modal.
      setShowModal(false)
      setEditingShareOut(null)
      resetForm()

      await loadShareOuts()

      await Swal.fire({
        icon: 'success',
        title: editingShareOut
          ? 'Share-Out Updated'
          : 'Share-Out Created',
        text: editingShareOut
          ? 'The share-out has been updated successfully.'
          : 'The share-out has been created successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      console.error(
        'Failed to save share-out:',
        error
      )

      // Close the modal before displaying the error alert.
      setShowModal(false)
      setEditingShareOut(null)
      resetForm()

      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text:
          error.message ||
          'Unable to save share-out.',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // DELETE SHARE-OUT
  // =====================================================

  const handleDelete = async (shareOut) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Share-Out?',
      text:
        `Are you sure you want to delete the share-out ` +
        `for ${shareOut.cycle?.name || 'this financial cycle'}?`,
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
      const response = await fetch(
        `${API_BASE_URL}/api/share-outs/${shareOut.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const text = await response.text()

        let message = text

        try {
          const data = text ? JSON.parse(text) : null
          message =
            data?.message ||
            data?.error ||
            text
        } catch {
          // Keep text response.
        }

        throw new Error(
          message ||
          `Unable to delete share-out. HTTP ${response.status}`
        )
      }

      await Swal.fire({
        icon: 'success',
        title: 'Share-Out Deleted',
        text: 'The share-out has been deleted successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
      })

      await loadShareOuts()
    } catch (error) {
      console.error(
        'Failed to delete share-out:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text:
          error.message ||
          'Unable to delete share-out.',
        confirmButtonText: 'OK',
      })
    }
  }

  // =====================================================
  // VIEW SHARE-OUT DETAILS
  // =====================================================

  const createAutomaticShareOutDetails = async (shareOut, existingDetails = []) => {
    const cycleId = shareOut?.cycle?.id

    if (!shareOut?.id || !cycleId) {
      return existingDetails
    }

    try {
      setSavingDetail(true)

      const contributionsResponse = await fetch(
        `${API_BASE_URL}/api/contributions`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!contributionsResponse.ok) {
        throw new Error(
          `Unable to load contributions. HTTP ${contributionsResponse.status}`
        )
      }

      const contributionsData = await contributionsResponse.json()
      const contributions = Array.isArray(contributionsData)
        ? contributionsData
        : []

      // Get every member's total contribution for this cycle.
      const contributionTotals = new Map()

      contributions
        .filter((item) => Number(item.cycle?.id) === Number(cycleId))
        .forEach((item) => {
          const memberId = item.member?.id
          if (!memberId) return

          const current = contributionTotals.get(Number(memberId)) || 0
          contributionTotals.set(
            Number(memberId),
            current + Number(item.amount || 0)
          )
        })

      const existingMemberIds = new Set(
        existingDetails
          .map((detail) => detail.member?.id)
          .filter(Boolean)
          .map(Number)
      )

      // Create a detail automatically for every member who contributed.
      for (const [memberId, totalContribution] of contributionTotals) {
        if (totalContribution <= 0 || existingMemberIds.has(memberId)) {
          continue
        }

        const response = await fetch(
          `${API_BASE_URL}/api/share-out-details`,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              shareOut: { id: Number(shareOut.id) },
              member: { id: Number(memberId) },
              paymentStatus: 'PENDING',
            }),
          }
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(
            data?.message ||
            data?.error ||
            `Unable to create share-out detail. HTTP ${response.status}`
          )
        }

        existingMemberIds.add(memberId)
      }

      const refreshedResponse = await fetch(
        `${API_BASE_URL}/api/share-out-details/share-out/${shareOut.id}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!refreshedResponse.ok) {
        throw new Error(
          `Unable to reload share-out details. HTTP ${refreshedResponse.status}`
        )
      }

      const refreshedData = await refreshedResponse.json()
      const details = Array.isArray(refreshedData) ? refreshedData : []
      setShareOutDetails(details)
      return details
    } finally {
      setSavingDetail(false)
    }
  }

  const handleView = async (shareOut) => {
    setSelectedShareOut(shareOut)
    setShowDetailsModal(true)
    setShareOutDetails([])

    try {
      const existingDetails = await loadShareOutDetails(shareOut.id)
      await createAutomaticShareOutDetails(shareOut, existingDetails)
    } catch (error) {
      console.error('Failed to prepare automatic share-out details:', error)
    }
  }

  const closeDetailsModal = () => {
    if (savingDetail) return
    setShowDetailsModal(false)
    setSelectedShareOut(null)
    setShareOutDetails([])
  }

  const markDetailAsPaid = async (detail) => {
    const memberName = detail?.member?.fullName || 'this member'

    const result = await Swal.fire({
      icon: 'question',
      title: 'Mark as Paid?',
      text: `Mark ${memberName}'s share-out as paid?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Mark Paid',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      zIndex: 200000,
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/share-out-details/${detail.id}/pay`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.message ||
          data?.error ||
          `Unable to mark payment as paid. HTTP ${response.status}`
        )
      }

      await loadShareOutDetails(selectedShareOut.id)
      await loadShareOuts()

      await Swal.fire({
        icon: 'success',
        title: 'Payment Marked as Paid',
        text: `${memberName} has been marked as paid.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: error.message || 'Unable to mark member as paid.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    }
  }

  const deleteShareOutDetail = async (detail) => {
    const memberName = detail?.member?.fullName || 'this member'

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Share-Out Detail?',
      text: `Delete ${memberName}'s share-out detail?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      zIndex: 200000,
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/share-out-details/${detail.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.message ||
          data?.error ||
          `Unable to delete detail. HTTP ${response.status}`
        )
      }

      await loadShareOutDetails(selectedShareOut.id)
      await loadShareOuts()

      await Swal.fire({
        icon: 'success',
        title: 'Detail Deleted',
        text: 'Share-out detail has been deleted.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1450c8',
        zIndex: 200000,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.message || 'Unable to delete share-out detail.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
        zIndex: 200000,
      })
    }
  }

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCurrency(value) {
    const amount = Number(value || 0)

    return new Intl.NumberFormat(
      'en-TZ',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    ).format(amount)
  }

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredShareOuts = useMemo(() => {
    return shareOuts
      .filter((shareOut) => {
        const query =
          search.toLowerCase().trim()

        if (!query) {
          return true
        }

        const cycleName =
          shareOut.cycle?.name || ''

        const cycleId =
          String(
            shareOut.cycle?.id || ''
          )

        const status =
          shareOut.status || ''

        const notes =
          shareOut.notes || ''

        return (
          cycleName
            .toLowerCase()
            .includes(query) ||
          cycleId.includes(query) ||
          status
            .toLowerCase()
            .includes(query) ||
          notes
            .toLowerCase()
            .includes(query) ||
          String(
            shareOut.id || ''
          ).includes(query)
        )
      })
      .filter((shareOut) => {
        if (cycleFilter === 'ALL') {
          return true
        }

        return (
          String(
            shareOut.cycle?.id
          ) === String(cycleFilter)
        )
      })
      .filter((shareOut) => {
        if (statusFilter === 'ALL') {
          return true
        }

        return (
          String(
            shareOut.status || ''
          ).toUpperCase() ===
          statusFilter
        )
      })
      .sort((a, b) => {
        if (sortBy === 'OLDEST') {
          return (
            new Date(
              a.shareOutDate || 0
            ) -
            new Date(
              b.shareOutDate || 0
            )
          )
        }

        if (sortBy === 'AMOUNT_HIGH') {
          return (
            Number(
              b.totalShareOut || 0
            ) -
            Number(
              a.totalShareOut || 0
            )
          )
        }

        if (sortBy === 'AMOUNT_LOW') {
          return (
            Number(
              a.totalShareOut || 0
            ) -
            Number(
              b.totalShareOut || 0
            )
          )
        }

        return (
          new Date(
            b.shareOutDate || 0
          ) -
          new Date(
            a.shareOutDate || 0
          )
        )
      })
  }, [
    shareOuts,
    search,
    cycleFilter,
    statusFilter,
    sortBy,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    cycleFilter,
    statusFilter,
    sortBy,
  ])

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      filteredShareOuts.length /
        shareOutsPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) *
    shareOutsPerPage

  const paginatedShareOuts =
    filteredShareOuts.slice(
      startIndex,
      startIndex +
        shareOutsPerPage
    )

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalShareOutRecords =
    shareOuts.length

  const totalShareOutAmount =
    shareOuts.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalShareOut || 0
        ),
      0
    )

  const totalProfit =
    shareOuts.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalProfit || 0
        ),
      0
    )

  const pendingCount =
    shareOuts.filter(
      (item) =>
        String(
          item.status || ''
        ).toUpperCase() ===
        'PENDING'
    ).length

  const completedCount =
    shareOuts.filter(
      (item) =>
        String(
          item.status || ''
        ).toUpperCase() ===
        'COMPLETED'
    ).length

  const currentCycle =
    cycles.find(
      (cycle) =>
        String(cycle.status || '')
          .toUpperCase() ===
        'OPEN'
    ) || null

  // =====================================================
  // CSV EXPORT
  // =====================================================

  const exportCSV = () => {
    if (filteredShareOuts.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Nothing to Export',
        text:
          'There are no share-out records to export.',
        confirmButtonText: 'OK',
      })

      return
    }

    const headers = [
      'ID',
      'Financial Cycle',
      'Share-Out Date',
      'Total Contributions',
      'Total Expenses',
      'Net Profit',
      'Total Share-Out',
      'Status',
      'Notes',
    ]

    const rows =
      filteredShareOuts.map(
        (shareOut) => [
          shareOut.id,
          shareOut.cycle?.name || '',
          shareOut.shareOutDate || '',
          shareOut.totalContributions || 0,
          shareOut.totalExpenses || 0,
          shareOut.totalProfit || 0,
          shareOut.totalShareOut || 0,
          shareOut.status || '',
          shareOut.notes || '',
        ]
      )

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value ?? '')

            return `"${text.replace(
              /"/g,
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
      'vikoba-share-outs.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

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

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
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
            className="sidebar-link active"
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
              placeholder="Search share-outs..."
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
                  {(username || 'A')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="profile-info">

                  <strong>
                    {username || 'Administrator'}
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
            BODY / SHARE-OUT CONTENT
        ================================================= */}

        <div className="dashboard-content">

          <div className="members-page">

            <div className="members-header">

              <div>

                <h1>
                  Share-Out
                </h1>

                <p>
                  Manage financial cycle share-out summaries and member distribution records.
                </p>

              </div>

              <div className="members-toolbar-actions">

                <button
                  type="button"
                  className="members-export-button"
                  onClick={
                    exportCSV
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
                  Create Share-Out
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
                    Total Share-Out Records
                  </span>

                  <strong>
                    {totalShareOutRecords}
                  </strong>

                </div>

                <FaReceipt />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Total Share-Out Amount
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalShareOutAmount
                    )}
                  </strong>

                </div>

                <FaWallet />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Total Net Profit
                  </span>

                  <strong>
                    TSh{' '}
                    {formatCurrency(
                      totalProfit
                    )}
                  </strong>

                </div>

                <FaChartLine />

              </div>

              <div className="members-summary-card">

                <div>

                  <span>
                    Pending / Completed
                  </span>

                  <strong>
                    {pendingCount} / {completedCount}
                  </strong>

                </div>

                <FaCheckCircle />

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
                      placeholder="Search by cycle, status or notes..."
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
                      cycleFilter
                    }
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

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="COMPLETED">
                      Completed
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
                      Loading share-outs...
                    </span>

                  </div>

                ) : paginatedShareOuts.length === 0 ? (

                  <div className="members-empty">

                    <FaCoins />

                    <h3>
                      No Share-Out Found
                    </h3>

                    <p>
                      No share-out records match your current search or filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddModal
                      }
                    >
                      <FaPlus />
                      Create Share-Out
                    </button>

                  </div>

                ) : (

                  <table className="members-table">

                    <thead>

                      <tr>

                        <th>
                          FINANCIAL CYCLE
                        </th>

                        <th>
                          CONTRIBUTIONS
                        </th>

                        <th>
                          LOAN INTEREST
                        </th>

                        <th>
                          EXPENSES
                        </th>

                        <th>
                          NET PROFIT
                        </th>

                        <th>
                          TOTAL SHARE-OUT
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

                      {paginatedShareOuts.map(
                        (shareOut) => {

                          const loanInterest =
                            Number(
                              shareOut.totalProfit ||
                              0
                            ) +
                            Number(
                              shareOut.totalExpenses ||
                              0
                            )

                          return (
                            <tr
                              key={
                                shareOut.id
                              }
                            >

                              <td>

                                <div className="member-table-user">

                                  <div className="member-avatar">

                                    <FaCoins />

                                  </div>

                                  <div>

                                    <strong>
                                      {shareOut.cycle?.name ||
                                        'Unknown Cycle'}
                                    </strong>

                                    <span>
                                      Cycle #
                                      {shareOut.cycle?.id ||
                                        '-'}
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>
                                TSh{' '}
                                {formatCurrency(
                                  shareOut.totalContributions
                                )}
                              </td>

                              <td>
                                TSh{' '}
                                {formatCurrency(
                                  loanInterest
                                )}
                              </td>

                              <td>
                                TSh{' '}
                                {formatCurrency(
                                  shareOut.totalExpenses
                                )}
                              </td>

                              <td>

                                <strong>
                                  TSh{' '}
                                  {formatCurrency(
                                    shareOut.totalProfit
                                  )}
                                </strong>

                              </td>

                              <td>

                                <strong>
                                  TSh{' '}
                                  {formatCurrency(
                                    shareOut.totalShareOut
                                  )}
                                </strong>

                              </td>

                              <td>
                                {shareOut.shareOutDate ||
                                  '-'}
                              </td>

                              <td>

                                <span
                                  className={
                                    `badge ${
                                      String(
                                        shareOut.status ||
                                          ''
                                      ).toUpperCase() ===
                                      'COMPLETED'
                                        ? 'bg-success'
                                        : 'bg-warning text-dark'
                                    }`
                                  }
                                >
                                  {shareOut.status ||
                                    'PENDING'}
                                </span>

                              </td>

                              <td>

                                <div className="member-actions">

                                  <button
                                    type="button"
                                    title="View"
                                    onClick={() =>
                                      handleView(
                                        shareOut
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
                                        shareOut
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
                                        shareOut
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
                filteredShareOuts.length >
                  0 && (

                <div className="members-pagination">

                  <span>
                    Showing{' '}
                    {startIndex + 1}
                    {' - '}
                    {Math.min(
                      startIndex +
                        shareOutsPerPage,
                      filteredShareOuts.length
                    )}
                    {' of '}
                    {filteredShareOuts.length}
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

      {/* =================================================
          SHARE-OUT DETAILS MODAL
      ================================================= */}

      {showDetailsModal && selectedShareOut && (
        <div
          className="members-modal-backdrop"
          onMouseDown={closeDetailsModal}
          style={{ zIndex: 10000 }}
        >
          <div
            className="members-modal"
            onMouseDown={(event) => event.stopPropagation()}
            style={{ maxWidth: '1100px', width: '95%' }}
          >
            <div className="members-modal-header">
              <div>
                <span className="dashboard-welcome">SHARE-OUT</span>
                <h3>Share-Out Details</h3>
                <p>
                  {selectedShareOut.cycle?.name || 'Financial Cycle'} — member distribution
                </p>
              </div>
              <button type="button" onClick={closeDetailsModal} disabled={savingDetail}>
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="members-summary-grid" style={{ marginBottom: '20px' }}>
                <div className="members-summary-card">
                  <div className="members-summary-icon"><FaUsers /></div>
                  <div><span>Members</span><strong>{shareOutDetails.length}</strong></div>
                </div>
                <div className="members-summary-card">
                  <div className="members-summary-icon"><FaMoneyBillWave /></div>
                  <div><span>Contributions</span><strong>TSh {formatCurrency(selectedShareOut.totalContributions)}</strong></div>
                </div>
                <div className="members-summary-card">
                  <div className="members-summary-icon"><FaChartLine /></div>
                  <div><span>Net Profit</span><strong>TSh {formatCurrency(selectedShareOut.totalProfit)}</strong></div>
                </div>
                <div className="members-summary-card">
                  <div className="members-summary-icon"><FaCoins /></div>
                  <div><span>Total Share-Out</span><strong>TSh {formatCurrency(selectedShareOut.totalShareOut)}</strong></div>
                </div>
              </div>

              <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '10px', background: '#f8f9fa', color: '#495057' }}>
                Share-Out Details are generated automatically from members who contributed in this financial cycle.
              </div>

              <div className="members-panel">
                <div className="members-table-wrapper">
                  {loadingDetails ? (
                    <div className="members-loading">
                      <div className="spinner-border"></div>
                      <span>Loading share-out details...</span>
                    </div>
                  ) : shareOutDetails.length === 0 ? (
                    <div className="members-empty">
                      <FaUsers />
                      <h3>No Share-Out Details</h3>
                      <p>Share-Out details will be generated automatically from cycle contributions.</p>
                    </div>
                  ) : (
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>MEMBER</th>
                          <th>CONTRIBUTION</th>
                          <th>%</th>
                          <th>PROFIT</th>
                          <th>SHARE-OUT</th>
                          <th>STATUS</th>
                          <th>PAID DATE</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shareOutDetails.map((detail) => {
                          const paid = String(detail.paymentStatus || '').toUpperCase() === 'PAID'
                          return (
                            <tr key={detail.id}>
                              <td>
                                <div className="member-table-user">
                                  <div className="member-avatar">
                                    {(detail.member?.fullName || 'M').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong>{detail.member?.fullName || 'Unknown Member'}</strong>
                                    <span>{detail.member?.memberNumber || '-'}</span>
                                  </div>
                                </div>
                              </td>
                              <td>TSh {formatCurrency(detail.memberContribution)}</td>
                              <td>{(Number(detail.contributionPercentage || 0) * 100).toFixed(2)}%</td>
                              <td>TSh {formatCurrency(detail.memberProfit)}</td>
                              <td><strong>TSh {formatCurrency(detail.shareOutAmount)}</strong></td>
                              <td>
                                <span className={paid ? 'badge bg-success' : 'badge bg-warning text-dark'}>
                                  {detail.paymentStatus || 'PENDING'}
                                </span>
                              </td>
                              <td>{detail.paidDate || '-'}</td>
                              <td>
                                <div className="member-actions">
                                  {!paid && (
                                    <button type="button" title="Mark as Paid" onClick={() => markDetailAsPaid(detail)}>
                                      <FaCheckCircle />
                                    </button>
                                  )}
                                  <button type="button" title="Delete" className="delete-action" onClick={() => deleteShareOutDetail(detail)}>
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

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
                  {editingShareOut
                    ? 'Edit Share-Out'
                    : 'Create Share-Out'}
                </h3>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6c757d',
                  }}
                >
                  {editingShareOut
                    ? 'Update share-out information.'
                    : 'Select a financial cycle. Financial totals will be calculated automatically.'}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={{
                  border: 'none',
                  background:
                    'transparent',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                <FaTimes />
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleSave}
            >

              <div
                style={{
                  padding:
                    '24px',
                }}
              >

                {/* FINANCIAL CYCLE */}

                <div
                  className="mb-3"
                >

                  <label className="form-label">
                    Financial Cycle
                  </label>

                  <select
                    name="cycleId"
                    className="form-select"
                    value={
                      form.cycleId
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingShareOut
                      ) || saving
                    }
                    required
                  >

                    <option value="">
                      Select Financial Cycle
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

                  {editingShareOut && (
                    <small
                      style={{
                        color:
                          '#6c757d',
                      }}
                    >
                      The financial cycle
                      cannot be changed
                      after the share-out
                      has been created.
                    </small>
                  )}

                </div>

                <div
                  className="row"
                >

                  {/* DATE */}

                  <div
                    className="col-md-6 mb-3"
                  >

                    <label className="form-label">
                      Share-Out Date
                    </label>

                    <input
                      type="date"
                      name="shareOutDate"
                      className="form-control"
                      value={
                        form.shareOutDate
                      }
                      onChange={
                        handleChange
                      }
                      disabled={saving}
                    />

                  </div>

                  {/* STATUS */}

                  <div
                    className="col-md-6 mb-3"
                  >

                    <label className="form-label">
                      Status
                    </label>

                    <select
                      name="status"
                      className="form-select"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        saving
                      }
                    >

                      <option value="PENDING">
                        PENDING
                      </option>

                      <option value="COMPLETED">
                        COMPLETED
                      </option>

                    </select>

                  </div>

                </div>

                {/* AUTOMATIC CALCULATION INFO */}

                <div
                  style={{
                    background:
                      '#f8f9fa',
                    border:
                      '1px solid #e9ecef',
                    borderRadius:
                      '10px',
                    padding:
                      '16px',
                    marginBottom:
                      '16px',
                  }}
                >

                  <div
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '10px',
                      marginBottom:
                        '10px',
                      fontWeight: 700,
                    }}
                  >
                    <FaChartLine />
                    Automatic Financial Calculation
                  </div>

                  <div
                    style={{
                      color:
                        '#6c757d',
                      lineHeight:
                        '1.7',
                    }}
                  >
                    <div>
                      <strong>
                        Total Contributions
                      </strong>{' '}
                      = all member
                      contributions in
                      the selected cycle.
                    </div>

                    <div>
                      <strong>
                        Group Income
                      </strong>{' '}
                      = total loan
                      interest.
                    </div>

                    <div>
                      <strong>
                        Net Profit
                      </strong>{' '}
                      = loan interest
                      − expenses.
                    </div>

                    <div>
                      <strong>
                        Total Share-Out
                      </strong>{' '}
                      = contributions
                      + net profit.
                    </div>

                  </div>

                </div>

                {/* NOTES */}

                <div
                  className="mb-3"
                >

                  <label className="form-label">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="4"
                    placeholder="Enter any notes about this share-out..."
                    value={
                      form.notes
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  />

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
                    : editingShareOut
                    ? 'Update Share-Out'
                    : 'Create Share-Out'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default ShareOut
