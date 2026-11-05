
import { useEffect, useState } from 'react'

const API_URL = '/expenses'

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
]

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function App() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
  })

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  )

  async function fetchExpenses() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Could not fetch expenses.')
      }

      const data = await response.json()
      setExpenses(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        'Unable to connect to the backend. Make sure Spring Boot is running on port 8081.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      setError('Enter a valid expense name and amount.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title.trim(),
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
        }),
      })

      if (!response.ok) {
        throw new Error('Could not add expense.')
      }

      setForm({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().slice(0, 10),
      })

      setSuccess('Expense added successfully!')
      await fetchExpenses()
    } catch (err) {
      setError('Unable to add expense. Please check your backend.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this expense?'
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete expense.')
      }

      setSuccess('Expense deleted successfully!')
      await fetchExpenses()
    } catch (err) {
      setError('Unable to delete expense.')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h1>Expense Tracker</h1>
            <p>Manage your money smartly</p>
          </div>
        </div>

        <button className="refresh-btn" onClick={fetchExpenses}>
          ↻ Refresh
        </button>
      </header>

      <main className="container">
        <section className="welcome">
          <div>
            <p className="eyebrow">PERSONAL FINANCE DASHBOARD</p>
            <h2>Track your expenses.</h2>
            <p className="welcome-text">
              Keep track of where your money goes, all in one place.
            </p>
          </div>
          <div className="welcome-icon">📊</div>
        </section>

        <section className="stats">
          <div className="stat-card total-card">
            <div className="stat-icon">₹</div>
            <p>Total Expenses</p>
            <h3>{formatCurrency(total)}</h3>
            <span>Across all recorded expenses</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Transactions</p>
            <h3>{expenses.length}</h3>
            <span>Recorded transactions</span>
          </div>
        </section>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h3>Add New Expense</h3>
                <p>Enter your expense details below</p>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Expense Name</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Grocery shopping"
                value={form.title}
                onChange={handleChange}
                required
              />

              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                required
              />

              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />

              <button className="submit-btn" type="submit" disabled={saving}>
                {saving ? 'Adding...' : '+ Add Expense'}
              </button>
            </form>
          </div>

          <div className="panel history-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Expenses</h3>
                <p>Your recorded transactions</p>
              </div>
              <span className="count-badge">{expenses.length}</span>
            </div>

            {loading ? (
              <div className="empty-state">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🧾</div>
                <h4>No expenses yet</h4>
                <p>Add your first expense using the form.</p>
              </div>
            ) : (
              <div className="expense-list">
                {[...expenses]
                  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                  .map((expense) => (
                    <div className="expense-item" key={expense.id}>
                      <div className="expense-category-icon">
                        {expense.category === 'Food'
                          ? '🍔'
                          : expense.category === 'Transport'
                            ? '🚗'
                            : expense.category === 'Shopping'
                              ? '🛍️'
                              : expense.category === 'Bills'
                                ? '🧾'
                                : expense.category === 'Entertainment'
                                  ? '🎬'
                                  : expense.category === 'Health'
                                    ? '💊'
                                    : expense.category === 'Education'
                                      ? '📚'
                                      : '📌'}
                      </div>

                      <div className="expense-details">
                        <h4>{expense.title}</h4>
                        <p>
                          {expense.category} · {expense.date}
                        </p>
                      </div>

                      <div className="expense-actions">
                        <strong>{formatCurrency(expense.amount)}</strong>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(expense.id)}
                          title="Delete expense"
                          aria-label={`Delete ${expense.title}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>

        <footer>
          Expense Tracker · Built with React and Spring Boot
        </footer>
      </main>
    </div>
  )
}

export default App
