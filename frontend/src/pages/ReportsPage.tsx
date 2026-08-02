import { useEffect, useState } from 'react'
import { getTurnoverByCounterparty, getTurnoverByPeriod } from '../api/reports'
import type { TurnoverByCounterparty, TurnoverByPeriod } from '../types/report'

function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [byPeriod, setByPeriod] = useState<TurnoverByPeriod[]>([])
  const [byCounterparty, setByCounterparty] = useState<TurnoverByCounterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function refresh() {
    setLoading(true)
    setError(null)
    const filters = { date_from: dateFrom || undefined, date_to: dateTo || undefined }
    Promise.all([getTurnoverByPeriod(filters), getTurnoverByCounterparty(filters)])
      .then(([period, counterparty]) => {
        setByPeriod(period)
        setByCounterparty(counterparty)
      })
      .catch(() => setError('Справките не могат да се заредят.'))
      .finally(() => setLoading(false))
  }

  useEffect(refresh, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    refresh()
  }

  return (
    <section>
      <h1>Справки</h1>

      <form className="card inline" onSubmit={handleSubmit}>
        <label>
          От дата
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          До дата
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <button type="submit">Приложи</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p className="muted">Зареждане...</p>
      ) : (
        <>
          <div className="card">
            <h2>Оборот по период</h2>
            {byPeriod.length === 0 ? (
              <p className="muted">Няма данни за избрания период.</p>
            ) : (
              <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Период</th>
                    <th>Брой фактури</th>
                    <th>Оборот</th>
                  </tr>
                </thead>
                <tbody>
                  {byPeriod.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      <td>{row.invoice_count}</td>
                      <td>{row.total} лв.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Оборот по контрагент</h2>
            {byCounterparty.length === 0 ? (
              <p className="muted">Няма данни за избрания период.</p>
            ) : (
              <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Контрагент</th>
                    <th>Брой фактури</th>
                    <th>Оборот</th>
                  </tr>
                </thead>
                <tbody>
                  {byCounterparty.map((row) => (
                    <tr key={row.counterparty_id}>
                      <td>{row.counterparty_name}</td>
                      <td>{row.invoice_count}</td>
                      <td>{row.total} лв.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default ReportsPage
