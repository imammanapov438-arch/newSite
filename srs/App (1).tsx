import { useState, useMemo, useEffect, JSX } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from './stores'

import music from './assets/music.jpg'
import tasks from './assets/tasks.jpg'
import games from './assets/games.jpg'
import photo from './assets/photo.jpg'
import fitness from './assets/fitness.jpg'
import chat from './assets/chat.jpg'

const localImages: Record<number, string> = {
  1: tasks,
  2: chat,
  3: games,
  4: photo,
  5: chat,
  6: music,
  7: photo,
  8: tasks,
}

const ALL = 'Все'

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState<string>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface HighlightProps {
  text: string
  query: string
}

function Highlight({ text, query }: HighlightProps): JSX.Element {
  if (!query.trim()) return <span>{text}</span>
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background: '#e8e4ff', color: '#5b21b6', borderRadius: 3, padding: '0 2px' }}>{part}</mark>
          : part
      )}
    </span>
  )
}

const categoryLabels: Record<string, string> = {
  productivity: 'Продуктивность',
  development: 'Разработка',
  design: 'Дизайн',
  games: 'Игры',
  music: 'Музыка',
  health: 'Здоровье',
}

const App = observer(function App(): JSX.Element {
  const { appsStore } = useStores()

  const [search, setSearch] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>(ALL)
  const [favorites, setFavorites] = useState<number[]>([])

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    appsStore.loadApps()
  }, [])

  const categories: string[] = [ALL, ...new Set(appsStore.apps.map((a) => a.category))]

  const filtered = useMemo(() => {
    return appsStore.apps.filter((app) => {
      const matchCat = activeTab === ALL || app.category === activeTab
      const matchSearch =
        app.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        app.description.toLowerCase().includes(debouncedSearch.toLowerCase())
      return matchCat && matchSearch
    })
  }, [appsStore.apps, activeTab, debouncedSearch])

  const toggleFavorite = (id: number): void => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#0f172a',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '0 32px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15, fontWeight: 700,
              fontFamily: 'sans-serif',
            }}>M</div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', color: '#0f172a' }}>
              MiniStore
            </span>
          </div>

          <span style={{
            fontSize: 13, color: '#94a3b8',
            fontFamily: 'sans-serif',
          }}>
            {filtered.length} {filtered.length === 1 ? 'приложение' : filtered.length < 5 ? 'приложения' : 'приложений'}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Поиск + категории */}
        <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Поиск приложений..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '13px 18px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a', fontSize: 15,
              outline: 'none', transition: 'border 0.15s',
              fontFamily: 'sans-serif',
            }}
            onFocus={e => {
              e.target.style.border = '1px solid #0f172a'
              e.target.style.background = '#fff'
            }}
            onBlur={e => {
              e.target.style.border = '1px solid #cbd5e1'
              e.target.style.background = '#f8fafc'
            }}
          />

          {/* Категории */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: '7px 18px', borderRadius: 6,
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'sans-serif', letterSpacing: '0.1px',
                  ...(activeTab === cat ? {
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #0f172a',
                  } : {
                    background: '#fff',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                  })
                }}
              >
                {cat === ALL ? 'Все' : (categoryLabels[cat] ?? cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Разделитель */}
        <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: 36 }} />

        {/* Загрузка */}
        {appsStore.isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '2px solid #e2e8f0',
              borderTop: '2px solid #0f172a',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'sans-serif' }}>Загрузка...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Ошибка */}
        {appsStore.error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
            <p style={{ color: '#dc2626', fontSize: 15, fontFamily: 'sans-serif' }}>{appsStore.error}</p>
            <button
              onClick={() => appsStore.loadApps()}
              style={{
                padding: '9px 22px', borderRadius: 6,
                border: '1px solid #dc2626',
                background: '#fff', color: '#dc2626',
                cursor: 'pointer', fontSize: 13,
                fontFamily: 'sans-serif', fontWeight: 500,
              }}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Карточки */}
        {!appsStore.isLoading && !appsStore.error && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 1,
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              {filtered.map((app, index) => (
                <div
                  key={app.id}
                  style={{
                    background: '#fff',
                    display: 'flex', flexDirection: 'column',
                    borderRight: '1px solid #e2e8f0',
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background 0.15s',
                    animation: `fadeUp 0.3s ease both`,
                    animationDelay: `${index * 50}ms`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                >
                  {/* Картинка */}
                  <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                    <img
                      src={localImages[app.id] ?? app.image}
                      alt={app.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />

                    {/* Бейдж цены */}
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      {app.free ? (
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: '#fff',
                          color: '#059669',
                          padding: '3px 10px', borderRadius: 4,
                          fontFamily: 'sans-serif',
                          border: '1px solid #d1fae5',
                        }}>Бесплатно</span>
                      ) : (
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: '#fff',
                          color: '#0f172a',
                          padding: '3px 10px', borderRadius: 4,
                          fontFamily: 'sans-serif',
                          border: '1px solid #e2e8f0',
                        }}>{app.price} ₽</span>
                      )}
                    </div>

                    {/* Избранное */}
                    <button
                      onClick={() => toggleFavorite(app.id)}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 32, height: 32, borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.85)',
                        cursor: 'pointer', fontSize: 15,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: favorites.includes(app.id) ? '#dc2626' : '#94a3b8',
                        transition: 'all 0.15s',
                      }}
                    >
                      {favorites.includes(app.id) ? '♥' : '♡'}
                    </button>
                  </div>

                  {/* Контент */}
                  <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
                        textTransform: 'uppercase', color: '#94a3b8',
                        fontFamily: 'sans-serif',
                      }}>
                        {categoryLabels[app.category] ?? app.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'sans-serif' }}>
                        <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                        <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{app.rating}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
                      <Highlight text={app.title} query={debouncedSearch} />
                    </h3>

                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0, flex: 1, fontFamily: 'sans-serif' }}>
                      <Highlight text={app.description} query={debouncedSearch} />
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: '#cbd5e1', fontFamily: 'sans-serif' }}>↓ {app.downloads}</span>
                      <button
                        style={{
                          padding: '8px 20px', borderRadius: 6,
                          border: '1px solid #0f172a',
                          background: '#0f172a', color: '#fff',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.15s', fontFamily: 'sans-serif',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#fff'
                          e.currentTarget.style.color = '#0f172a'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#0f172a'
                          e.currentTarget.style.color = '#fff'
                        }}
                      >
                        Установить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Пусто */}
            {filtered.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 8 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', fontFamily: 'sans-serif' }}>Ничего не нашлось</p>
                <p style={{ fontSize: 13, color: '#cbd5e1', fontFamily: 'sans-serif' }}>Попробуйте другие ключевые слова</p>
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #94a3b8; font-family: sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>
    </div>
  )
})

export default App