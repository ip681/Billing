import { useEffect, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../api/products'
import type { Product, ProductInput } from '../types/product'

const emptyForm: ProductInput = {
  name: '',
  unit: '',
  unit_price: '',
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  function refresh() {
    setLoading(true)
    listProducts()
      .then(setProducts)
      .catch(() => setError('Продуктите не могат да се заредят.'))
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      unit: product.unit,
      unit_price: product.unit_price,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId === null) {
        await createProduct(form)
      } else {
        await updateProduct(editingId, form)
      }
      cancelEdit()
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешен запис.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Изтриване на този продукт?')) return
    try {
      await deleteProduct(id)
      refresh()
    } catch {
      setError('Изтриването не бе успешно.')
    }
  }

  return (
    <section>
      <h1>Продукти/услуги</h1>

      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
          <h2>{editingId === null ? 'Нов продукт/услуга' : 'Редакция'}</h2>
          <label>
            Име
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Мерна единица
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
            />
          </label>

          <label>
            Единична цена
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
              required
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={saving}>
              {editingId === null ? 'Добави' : 'Запази промените'}
            </button>
            {editingId !== null && (
              <button type="button" onClick={cancelEdit}>
                Отказ
              </button>
            )}
          </div>

          {error && <p role="alert">{error}</p>}
        </form>
      </div>

      <div className="card">
        <h2>Списък с продукти/услуги</h2>
        {loading ? (
          <p className="muted">Зареждане...</p>
        ) : products.length === 0 ? (
          <p className="muted">Няма добавени продукти.</p>
        ) : (
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Име</th>
                <th>Мярка</th>
                <th>Цена</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.unit}</td>
                  <td>{p.unit_price}</td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => startEdit(p)}>
                        Редакция
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Изтрий
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductsPage
