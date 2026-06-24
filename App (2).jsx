import { useState, useMemo, useEffect } from 'react'

// Те же импорты (замените на свои пути)
import music from './assets/music.jpg'
import tasks from './assets/tasks.jpg'
import games from './assets/games.jpg'
import photo from './assets/photo.jpg'
import fitness from './assets/fitness.jpg'
import chat from './assets/chat.jpg'

const apps = [
  { id: 1, title: 'WaveSound', category: 'Музыка',        desc: 'Стриминговый сервис с миллионами треков и персональными плейлистами.', rating: 4.8, img: music   },
  { id: 2, title: 'TaskFlow',  category: 'Продуктивность', desc: 'Планировщик задач с интеграцией календаря и командной работой.',       rating: 4.6, img: tasks   },
  { id: 3, title: 'PixelRun',  category: 'Игры',           desc: 'Платформер в пиксельном стиле с онлайн-турнирами и достижениями.',      rating: 4.9, img: games   },
  { id: 4, title: 'LensAI',    category: 'Фото',           desc: 'Редактор фото с умными фильтрами и мгновенным удалением фона.',          rating: 4.7, img: photo   },
  { id: 5, title: 'FitTrack',  category: 'Здоровье',       desc: 'Трекер тренировок и питания с персональными программами.',              rating: 4.5, img: fitness },
  { id: 6, title: 'ChatBox',   category: 'Общение',        desc: 'Мессенджер с шифрованием, голосовыми и видеозвонками.',                  rating: 4.4, img: chat    },
]

const categories = ['Все', ...new Set(apps.map(a => a.category))]

// Правильный хук дебаунса
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Функция подсветки с защитой от спецсимволов
function Highlight({ text, query }) {
  if (!query.trim()) return <span>{text}</span>
  
  // Экранируем символы, которые могут сломать RegExp
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'))
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-blue-500/40 text-blue-200 rounded px-0.5">{part}</mark>
          : part
      )}
    </span>
  )
}

export default function App() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Все')
  const [favorites, setFavorites] = useState([]) // Состояние для избранного
  
  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    return apps.filter(app => {
      const matchCat = activeTab === 'Все' || app.category === activeTab
      const matchSearch = app.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          app.desc.toLowerCase().includes(debouncedSearch.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeTab, debouncedSearch])

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-white text-xl font-bold tracking-tight">App<span className="text-blue-500">Store</span></h1>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
            Найдено: {filtered.length}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Search */}
        <div className="relative mb-8 group">
           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"></span>
           <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Фильтр по категории */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(app => (
            <div 
              key={app.id} 
              className="group bg-slate-900/40 rounded-3xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col hover:translate-y-[-4px]"
            >
              <div className="relative overflow-hidden h-48">
                <img 
                  src={app.img} 
                  alt={app.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-60" />
                
                {/* Кнопка Избранное */}
                <button 
                  onClick={() => toggleFavorite(app.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40 transition-colors"
                >
                  <span className={favorites.includes(app.id) ? 'text-red-500' : 'text-white'}>
                    {favorites.includes(app.id) ? '' : ''}
                  </span>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">
                    {app.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                    <span>★</span> {app.rating}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  <Highlight text={app.title} query={debouncedSearch} />
                </h3>
                
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  <Highlight text={app.desc} query={debouncedSearch} />
                </p>

                <button className="w-full mt-4 py-3 bg-white text-black hover:bg-blue-500 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95">
                  Установить
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-600">
            <div className="text-6xl mb-6 opacity-20">empty_box.png</div>
            <p className="text-xl font-semibold text-slate-400">Ничего не нашлось</p>
            <p className="text-sm mt-2">Попробуйте использовать другие ключевые слова</p>
          </div>
        )}
      </main>
    </div>
  )
}