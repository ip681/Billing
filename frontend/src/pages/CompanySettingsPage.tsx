import { useEffect, useState } from 'react'
import {
  addMember,
  deleteCompanyLogo,
  getCompany,
  leaveCompany,
  listMembers,
  logoUrl,
  removeMember,
  updateCompany,
  uploadCompanyLogo,
} from '../api/company'
import { useAuth } from '../auth/AuthContext'
import type { CompanyInput, CompanyMember } from '../types/company'

const emptyForm: CompanyInput = {
  name: '',
  eik: '',
  address: '',
  is_vat_registered: false,
  vat_exempt_reason: '',
}

function CompanySettingsPage() {
  const { user, logout } = useAuth()
  const isOwner = user?.role === 'owner'

  const [form, setForm] = useState<CompanyInput>(emptyForm)
  const [logoFilename, setLogoFilename] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  const [members, setMembers] = useState<CompanyMember[]>([])
  const [membersError, setMembersError] = useState<string | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [memberSaving, setMemberSaving] = useState(false)

  function refreshMembers() {
    listMembers()
      .then(setMembers)
      .catch(() => setMembersError('Екипът не може да се зареди.'))
  }

  useEffect(() => {
    getCompany()
      .then((company) => {
        setForm({
          name: company.name,
          eik: company.eik,
          address: company.address,
          is_vat_registered: company.is_vat_registered,
          vat_exempt_reason: company.vat_exempt_reason ?? '',
        })
        setLogoFilename(company.logo_filename)
      })
      .catch(() => setError('Настройките не могат да се заредят.'))
      .finally(() => setLoading(false))
    refreshMembers()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSavedAt(null)
    try {
      const saved = await updateCompany({
        ...form,
        vat_exempt_reason: form.vat_exempt_reason || null,
      })
      setSavedAt(saved.updated_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешен запис.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    setLogoError(null)
    try {
      const company = await uploadCompanyLogo(file)
      setLogoFilename(company.logo_filename)
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Качването не бе успешно.')
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  async function handleLogoDelete() {
    setLogoUploading(true)
    setLogoError(null)
    try {
      const company = await deleteCompanyLogo()
      setLogoFilename(company.logo_filename)
    } catch {
      setLogoError('Изтриването не бе успешно.')
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    setMemberSaving(true)
    setMembersError(null)
    try {
      await addMember(newMemberEmail)
      setNewMemberEmail('')
      refreshMembers()
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Неуспешно добавяне.')
    } finally {
      setMemberSaving(false)
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!window.confirm('Премахване на този член от фирмата?')) return
    try {
      await removeMember(userId)
      refreshMembers()
    } catch {
      setMembersError('Премахването не бе успешно.')
    }
  }

  async function handleLeave() {
    if (!window.confirm('Наистина ли искате да напуснете фирмата?')) return
    try {
      await leaveCompany()
      logout()
    } catch {
      setMembersError('Напускането не бе успешно.')
    }
  }

  if (loading) {
    return <p>Зареждане...</p>
  }

  return (
    <section>
      <h1>Настройки на фирмата</h1>

      <div className="card">
        <div>
          <h2>Лого на фактурата</h2>
          {logoFilename && (
            <img
              src={logoUrl(logoFilename)}
              alt="Лого на фирмата"
              style={{ maxWidth: 240, maxHeight: 120, display: 'block', marginBottom: 12 }}
            />
          )}
          <div className="actions">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleLogoChange}
              disabled={logoUploading}
              style={{ display: 'none' }}
              id="logo-upload"
            />
            <button
              type="button"
              disabled={logoUploading}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {logoUploading ? 'Качване...' : logoFilename ? 'Смени лого' : 'Качи лого'}
            </button>
            {logoFilename && (
              <button type="button" className="btn-danger" disabled={logoUploading} onClick={handleLogoDelete}>
                Премахни
              </button>
            )}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>PNG или JPG, до 2MB.</p>
          {logoError && <p role="alert">{logoError}</p>}
        </div>
      </div>

      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
          <label>
            Име на фирмата
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            ЕИК
            <input
              value={form.eik}
              onChange={(e) => setForm({ ...form, eik: e.target.value })}
              required
            />
          </label>

          <label>
            Адрес
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.is_vat_registered}
              onChange={(e) =>
                setForm({ ...form, is_vat_registered: e.target.checked })
              }
            />
            Регистрирано по ДДС
          </label>

          {!form.is_vat_registered && (
            <label>
              Основание за неначисляване на ДДС
              <input
                value={form.vat_exempt_reason ?? ''}
                onChange={(e) =>
                  setForm({ ...form, vat_exempt_reason: e.target.value })
                }
                required
              />
            </label>
          )}

          <button type="submit" disabled={saving}>
            {saving ? 'Запазване...' : 'Запази'}
          </button>

          {error && <p role="alert">{error}</p>}
          {savedAt && <p>Запазено успешно.</p>}
        </form>
      </div>

      <div className="card">
        <h2>Екип</h2>
        {members.length === 0 ? (
          <p className="muted">Зареждане...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Име</th>
                <th>Роля</th>
                {isOwner && <th></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.email}</td>
                  <td>{m.full_name ?? '—'}</td>
                  <td>{m.role === 'owner' ? 'Собственик' : 'Член'}</td>
                  {isOwner && (
                    <td>
                      {m.role !== 'owner' && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleRemoveMember(m.id)}
                        >
                          Премахни
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isOwner ? (
          <form className="wide" onSubmit={handleAddMember} style={{ marginTop: 16 }}>
            <label>
              Добави член по email (трябва вече да има регистриран акаунт)
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={memberSaving}>
              {memberSaving ? 'Добавяне...' : 'Добави'}
            </button>
          </form>
        ) : (
          <div className="actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn-danger" onClick={handleLeave}>
              Напусни фирмата
            </button>
          </div>
        )}

        {membersError && <p role="alert">{membersError}</p>}
      </div>
    </section>
  )
}

export default CompanySettingsPage
