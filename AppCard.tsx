import React from 'react';
import styles from '../App.module.css';
import { IAppCardProps } from '../types/app.types';

const AppCard: React.FC<IAppCardProps> = ({ app, searchTerm }) => {
  // Функция для подсветки текста
  const highlightText = (text: string, term: string): string => {
    if (!term || term.trim() === '') return text;
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  };

  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightedName = highlightText(app.name, searchTerm);
  const highlightedDescription = highlightText(app.description, searchTerm);
  const highlightedCategory = highlightText(app.category, searchTerm);

  return (
    <div className={styles.appCard}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.iconName}>
            <div className={`${styles.appIcon} ${styles[app.iconBg]}`}>
              <span>{app.icon}</span>
            </div>
            <div className={styles.titleGroup}>
              <h3 dangerouslySetInnerHTML={{ __html: highlightedName }} />
              <div 
                className={styles.category} 
                dangerouslySetInnerHTML={{ __html: highlightedCategory }}
              />
            </div>
          </div>
          <div className={styles.rating}>
            <span className={styles.star}>★</span>
            <span className={styles.ratingValue}>{app.rating}</span>
          </div>
        </div>
        <div 
          className={styles.description} 
          dangerouslySetInnerHTML={{ __html: highlightedDescription }}
        />
      </div>
    </div>
  );
};

export default AppCard;