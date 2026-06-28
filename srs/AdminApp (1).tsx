import { useState, useEffect, useRef, JSX } from 'react'
import type { App } from './types'
import { fetchApps, fetchAppById, createApp, updateApp, deleteApp, uploadImage } from './api'

// ─── Типы ────────────────────────────────────────────────────────────────────

type View = 'list' | 'form'

type FormData = Omit<App, 'id'>

// ─── Константы ───────────────────────────────────────────────────────────────

const CATEGORIES = ['productivity', 'development', 'design', 'games', 'music', 'health']

const CAT_LABELS: Record<string, string> = {
  productivity: 'Продуктивность',
  development: 'Разработка',
  design: 'Дизайн',
  games: 'Игры',
  music: 'Музыка',
  health: 'Здоровье',
}

const emptyForm = (): FormData => ({
  title: '',
  category: 'productivity',
  description: '',
  rating: 0,
  downloads: '0',
  price: 0,
  free: true,
  image: '',
  screenshots: [],
})

// ─── Маленькие компоненты ────────────────────────────────────────────────────

interface BtnProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  small?: boolean
}

function Btn({ onClick, children, variant = 'ghost', disabled, small }: BtnProps): JSX.Element {
  const base: React.CSSProperties = {
    padding: small ? '5px 12px' : '8px 18px',
    borderRadius: 6,
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'sans-serif',
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
    border: '1px solid transparent',
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
    ghost: { background: 'transparent', color: '#e2e8f0', border: '1px solid #334155' },
    danger: { background: 'transparent', color: '#f87171', border: '1px solid #f87171' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  )
}

interface FieldProps {
  label: string
  children: React.ReactNode
}

function Field({ label, children }: FieldProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  borderRadius: 6,
  border: '1px solid #334155',
  background: '#1e293b',
  color: '#f1f5f9',
  fontSize: 14,
  fontFamily: 'sans-serif',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

// ─── Главный компонент ───────────────────────────────────────────────────────

export default function AdminApp(): JSX.Element {
  const [view, setView] = useState<View>('list')
  const [apps, setApps] = useState<App[]>([])
  const [listLoading, setListLoading] = useState(false)

  // Форма
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const coverRef = useRef<HTMLInputElement>(null)
  const shotRef = useRef<HTMLInputElement>(null)

  // ── Список ────────────────────────────────────────────────────────────────

  const loadApps = async () => {
    setListLoading(true)
    try { setApps(await fetchApps()) }
    finally { setListLoading(false) }
  }

  useEffect(() => { loadApps() }, [])

  // ── Открыть «Создать» ─────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setCoverPreview('')
    setScreenshotPreviews([])
    setFormError(null)
    setView('form')
  }

  // ── Открыть «Редактировать» ───────────────────────────────────────────────

  const openEdit = async (id: number) => {
    setEditingId(id)
    setFormError(null)
    setFormLoading(true)
    setView('form')
    const app = await fetchAppById(id)
    setForm({
      title: app.title,
      category: app.category,
      description: app.description,
      rating: app.rating,
      downloads: app.downloads,
      price: app.price,
      free: app.free,
      image: app.image,
      screenshots: app.screenshots ?? [],
    })
    setCoverPreview(app.image || '')
    setScreenshotPreviews(app.screenshots ?? [])
    setFormLoading(false)
  }

  // ── Удалить ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить приложение?')) return
    await deleteApp(id)
    await loadApps()
  }

  // ── Обложка ───────────────────────────────────────────────────────────────

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    const url = await uploadImage(file)
    setForm(f => ({ ...f, image: url }))
  }

  // ── Скриншоты ─────────────────────────────────────────────────────────────

  const handleShotAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      setScreenshotPreviews(p => [...p, URL.createObjectURL(file)])
      const url = await uploadImage(file)
      setForm(f => ({ ...f, screenshots: [...(f.screenshots ?? []), url] }))
    }
  }

  const handleShotRemove = (i: number) => {
    setScreenshotPreviews(p => p.filter((_, idx) => idx !== i))
    setForm(f => ({ ...f, screenshots: (f.screenshots ?? []).filter((_, idx) => idx !== i) }))
  }

  // ── Сохранить ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Введите название'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (editingId !== null) await updateApp(editingId, form)
      else await createApp(form)
      await loadApps()
      setView('list')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Ошибка сервера')
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif' }}>

      {/* ── Header ── */}
      <header style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Логотип */}
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: '#6366f1', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
            MiniStore Admin
          </span>
          {view === 'form' && (
            <span style={{ color: '#475569', fontSize: 13 }}>
              › {editingId ? `Редактирование #${editingId}` : 'Новое приложение'}
            </span>
          )}
        </div>

        {/* Кнопки хедера */}
        <div style={{ display: 'flex', gap: 8 }}>
          {view === 'form' ? (
            <>
              <Btn onClick={() => setView('list')} variant="ghost">Отмена</Btn>
              <Btn onClick={handleSave} variant="primary" disabled={saving}>
                {saving ? 'Сохранение…' : editingId ? 'Сохранить' : 'Создать'}
              </Btn>
            </>
          ) : (
            <Btn onClick={openCreate} variant="primary">+ Добавить</Btn>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* ══════════════════════════════════════════════════════ СПИСОК ══ */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Приложения</h1>
              <span style={{ fontSize: 13, color: '#475569' }}>{apps.length} записей</span>
            </div>

            {listLoading ? (
              <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>Загрузка…</div>
            ) : (
              <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      {['ID', 'Название', 'Категория', 'Рейтинг', 'Цена', 'Загрузки', ''].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 600, color: '#475569',
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app, i) => (
                      <tr
                        key={app.id}
                        style={{ borderBottom: i < apps.length - 1 ? '1px solid #1e293b' : 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#263348')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{app.id}</td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {app.image && (
                              <img src={app.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                            )}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{app.title}</div>
                              <div style={{ fontSize: 12, color: '#475569', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {app.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#0f172a', color: '#94a3b8', fontWeight: 500 }}>
                            {CAT_LABELS[app.category] ?? app.category}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px', fontSize: 13 }}>
                          <span style={{ color: '#f59e0b' }}>★</span> {app.rating}
                        </td>

                        <td style={{ padding: '12px 16px', fontSize: 13 }}>
                          {app.free
                            ? <span style={{ color: '#34d399', fontWeight: 500 }}>Бесплатно</span>
                            : <span>{app.price} $</span>}
                        </td>

                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{app.downloads}</td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn onClick={() => openEdit(app.id)} variant="ghost" small>Изменить</Btn>
                            <Btn onClick={() => handleDelete(app.id)} variant="danger" small>Удалить</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {apps.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Нет приложений</div>
                )}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════ ФОРМА ══ */}
        {view === 'form' && (
          <>
            {formLoading ? (
              <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>Загрузка данных…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>

                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: '#450a0a', border: '1px solid #f87171', color: '#fca5a5', fontSize: 13 }}>
                    {formError}
                  </div>
                )}

                {/* Основные поля */}
                <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Основное
                  </h2>

                  <Field label="Название *">
                    <input
                      style={inputStyle}
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Например: Атлас заметок"
                    />
                  </Field>

                  <Field label="Описание">
                    <textarea
                      style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Короткое описание приложения"
                    />
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Категория">
                      <select
                        style={{ ...inputStyle }}
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{CAT_LABELS[c] ?? c}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Загрузки">
                      <input
                        style={inputStyle}
                        value={form.downloads}
                        onChange={e => setForm(f => ({ ...f, downloads: e.target.value }))}
                        placeholder="1.2M"
                      />
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <Field label="Рейтинг (0–5)">
                      <input
                        style={inputStyle}
                        type="number" min={0} max={5} step={0.1}
                        value={form.rating}
                        onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))}
                      />
                    </Field>

                    <Field label="Цена ($)">
                      <input
                        style={inputStyle}
                        type="number" min={0} step={0.01}
                        value={form.price}
                        disabled={form.free}
                        onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </Field>

                    <Field label="Бесплатно">
                      <div style={{ display: 'flex', alignItems: 'center', height: 38 }}>
                        <input
                          type="checkbox"
                          checked={form.free}
                          onChange={e => setForm(f => ({ ...f, free: e.target.checked, price: e.target.checked ? 0 : f.price }))}
                          style={{ width: 18, height: 18, accentColor: '#6366f1', cursor: 'pointer' }}
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Обложка */}
                <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Обложка
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    {/* Превью */}
                    <div
                      onClick={() => coverRef.current?.click()}
                      style={{
                        width: 120, height: 90, borderRadius: 8,
                        border: '2px dashed #334155',
                        background: '#0f172a',
                        cursor: 'pointer', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {coverPreview
                        ? <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 11, color: '#475569', textAlign: 'center', padding: 8 }}>Нажмите<br />для загрузки</span>
                      }
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Field label="URL обложки">
                        <input
                          style={inputStyle}
                          value={form.image}
                          onChange={e => { setForm(f => ({ ...f, image: e.target.value })); setCoverPreview(e.target.value) }}
                          placeholder="https://... или загрузите файл"
                        />
                      </Field>
                      <button
                        onClick={() => coverRef.current?.click()}
                        style={{ ...inputStyle, width: 'auto', cursor: 'pointer', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}
                      >
                        Загрузить файл
                      </button>
                    </div>
                  </div>

                  <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
                </div>

                {/* Скриншоты */}
                <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Скриншоты ({screenshotPreviews.length})
                    </h2>
                    <button
                      onClick={() => shotRef.current?.click()}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}
                    >
                      + Добавить
                    </button>
                  </div>

                  {screenshotPreviews.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {screenshotPreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={src} alt="" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                          <button
                            onClick={() => handleShotRemove(i)}
                            style={{
                              position: 'absolute', top: -6, right: -6,
                              width: 18, height: 18, borderRadius: '50%',
                              background: '#f87171', border: 'none',
                              color: '#fff', fontSize: 10, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              lineHeight: 1,
                            }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input ref={shotRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleShotAdd} />
                </div>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}