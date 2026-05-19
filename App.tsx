import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './App.module.css';
import AppCard from './components/AppCard';
import { appsData, getUniqueCategories } from './data/appsData';
import { IApp, IFilterState } from './types/app.types';

const App: React.FC = () => {
  const [filter, setFilter] = useState<IFilterState>({
    searchTerm: '',
    selectedCategory: 'Все'
  });
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const categories: string[] = getUniqueCategories();

  // Фильтрация приложений
  const filteredApps: IApp[] = appsData.filter((app: IApp): boolean => {
    const matchesCategory = filter.selectedCategory === 'Все' || app.category === filter.selectedCategory;
    
    const searchLower = filter.searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === '' || 
      app.name.toLowerCase().includes(searchLower) ||
      app.category.toLowerCase().includes(searchLower) ||
      app.description.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  // Обработчик поиска с debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout((): void => {
      setFilter(prev => ({ ...prev, searchTerm: value }));
    }, 300);
  }, []);

  // Обработчик фильтра по категории
  const handleCategoryClick = useCallback((category: string): void => {
    setFilter(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>🔍 с поиском и фильтрацией</div>
        <h1>Витрина приложений</h1>
        <div className={styles.subtitle}>TypeScript • поиск • фильтр • подсветка • debounce</div>
      </div>

      {/* Панель поиска и фильтрации */}
      <div className={styles.searchPanel}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            id="searchInput"
            className={styles.searchInput}
            placeholder="Поиск приложений... например: дизайн, финансы, код..."
            autoComplete="off"
            onChange={handleSearchChange}
          />
        </div>
        <div className={styles.filterButtons}>
          {categories.map((category: string) => (
            <button
              key={category}
              className={`${styles.filterBtn} ${filter.selectedCategory === category ? styles.active : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка карточек */}
      <div className={styles.appsGrid}>
        {filteredApps.length > 0 ? (
          filteredApps.map((app: IApp) => (
            <AppCard key={app.id} app={app} searchTerm={filter.searchTerm} />
          ))
        ) : (
          <div className={styles.emptyState}>
            <span>🔍</span>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
          </div>
        )}
      </div>

      <div className={styles.footerNote}>
        <div className={styles.infoHint}>
          ✅ Поиск с debounce | Фильтр по категориям | Подсветка найденного | TypeScript
        </div>
        <a href="https://github.com/your-username/app-showcase-ts" className={styles.githubBadge} target="_blank" rel="noopener noreferrer">
          📁 GitHub репозиторий
        </a>
      </div>
    </div>
  );
};

export default App;