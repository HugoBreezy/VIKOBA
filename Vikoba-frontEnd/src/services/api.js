const API_BASE_URL = 'http://localhost:8080'

// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (email, password) => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Login failed. Please check your credentials.'
    )
  }

  return data
}

// =====================================================
// MEMBERS
// =====================================================

export const getMembers = async () => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/members`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load members.'
    )
  }

  return data
}

export const getMemberById = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/members/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.status === 404) {
    throw new Error('Member not found.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load member.'
    )
  }

  return data
}

export const createMember = async (member) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/members`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(member),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create member.'
    )
  }

  return data
}

export const updateMember = async (id, member) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/members/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(member),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update member.'
    )
  }

  return data
}

export const deleteMember = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/members/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    let message = 'Failed to delete member.'

    try {
      const data = await response.json()
      message = data.message || message
    } catch {
      // No JSON response
    }

    throw new Error(message)
  }

  return true
}

// =====================================================
// CONTRIBUTION REPORT
// =====================================================

export const getContributionReport = async (
  cycleId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/reports/contributions/cycle/${cycleId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load contribution report.'
    )
  }

  return data
}

// =====================================================
// CONTRIBUTIONS
// =====================================================

export const getContributions = async () => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load contributions.'
    )
  }

  return data
}

export const createContribution = async (
  contribution
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contribution),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create contribution.'
    )
  }

  return data
}

export const getContributionById = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.status === 404) {
    throw new Error('Contribution not found.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load contribution.'
    )
  }

  return data
}

export const getContributionsByMember = async (
  memberId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/member/${memberId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load member contributions.'
    )
  }

  return data
}

export const getContributionsByCycle = async (
  cycleId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/cycle/${cycleId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load cycle contributions.'
    )
  }

  return data
}

export const getMemberContributionsByCycle = async (
  memberId,
  cycleId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/member/${memberId}/cycle/${cycleId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load member cycle contributions.'
    )
  }

  return data
}

export const getMemberTotalContribution = async (
  memberId,
  cycleId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/member/${memberId}/cycle/${cycleId}/total`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load member contribution total.'
    )
  }

  return data
}

export const updateContribution = async (
  id,
  contribution
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contribution),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update contribution.'
    )
  }

  return data
}

export const deleteContribution = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/contributions/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    let message =
      'Failed to delete contribution.'

    try {
      const data = await response.json()
      message = data.message || message
    } catch {
      // No JSON response
    }

    throw new Error(message)
  }

  return true
}

// =====================================================
// LOANS
// =====================================================

export const getLoans = async () => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/loans`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load loans.'
    )
  }

  return data
}

// =====================================================
// CYCLE FINANCIAL REPORT
// =====================================================

export const getCycleFinancialReport = async (
  cycleId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/reports/cycle/${cycleId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load cycle financial report.'
    )
  }

  return data
}

// =====================================================
// LOAN PAYMENTS
// =====================================================

export const getLoanPayments = async () => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/payments`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load loan payments.'
    )
  }

  return data
}

// =====================================================
// MEETINGS
// =====================================================

export const getMeetings = async () => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/meetings`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load meetings.'
    )
  }

  return data
}

export const getMeetingById = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/meetings/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.status === 404) {
    throw new Error('Meeting not found.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load meeting.'
    )
  }

  return data
}

export const getMeetingsByCycle = async (
  cycleId
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/meetings/cycle/${cycleId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load cycle meetings.'
    )
  }

  return data
}

export const createMeeting = async (meeting) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/meetings`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create meeting.'
    )
  }

  return data
}

export const updateMeeting = async (
  id,
  meeting
) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/meetings/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update meeting.'
    )
  }

  return data
}

export const deleteMeeting = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/meetings/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    let message =
      'Failed to delete meeting.'

    try {
      const data = await response.json()
      message = data.message || message
    } catch {
      // No JSON response
    }

    throw new Error(message)
  }

  return true
}

// =====================================================
// FINANCIAL CYCLES
// =====================================================

export const getFinancialCycles = async () => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/financial-cycles`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to load financial cycles.'
    )
  }

  return data
}

// =====================================================
// LOAN WRITE OPERATIONS
// =====================================================

export const createLoan = async (loan) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/loans`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loan),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create loan.'
    )
  }

  return data
}

export const updateLoan = async (id, loan) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/loans/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loan),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update loan.'
    )
  }

  return data
}

export const deleteLoan = async (id) => {
  const token = localStorage.getItem('vikoba_token')

  const response = await fetch(
    `${API_BASE_URL}/api/loans/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    let message = 'Failed to delete loan.'

    try {
      const data = await response.json()
      message = data.message || message
    } catch {
      // No JSON response
    }

    throw new Error(message)
  }

  return true
}