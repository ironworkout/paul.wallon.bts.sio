/**
 * Ghost-Monitor v3.6 - Frandroid Inspired Tech Style
 * Real-time Cyber-Veille Engine (100% Autonomous Client-Side)
 */

const CONFIG = {
  REFRESH_INTERVAL_MS: 300000, // 5 minutes
  DEFAULT_CYBER_FILTER: ' (cybersecurity OR cybersécurité OR faille OR malware OR hacking)'
};

const STATE = {
  currentQuery: 'cybersécurité',
  articles: []
};

// ── INITIALIZATION ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initNav();
  initModal();
  
  // Launch initial feed load
  loadGoogleNews(STATE.currentQuery);
  
  // Set up periodic update
  setInterval(() => {
    loadGoogleNews(STATE.currentQuery, true);
  }, CONFIG.REFRESH_INTERVAL_MS);
});

// ── SEARCH INTERACTION ─────────────────────────────────────
function initSearch() {
  const queryInput = document.getElementById('news-query');
  const btnSearch = document.getElementById('btn-search');
  
  if (!queryInput || !btnSearch) return;
  
  btnSearch.addEventListener('click', () => {
    const q = queryInput.value.trim();
    if (q) {
      STATE.currentQuery = q;
      loadGoogleNews(q);
    }
  });
  
  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = queryInput.value.trim();
      if (q) {
        STATE.currentQuery = q;
        loadGoogleNews(q);
      }
    }
  });
}

// ── HEADER NAVIGATION ──────────────────────────────────────
function initNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const queryInput = document.getElementById('news-query');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const category = link.dataset.category;
      let targetQuery = 'cybersécurité';
      
      if (category === 'faille') {
        targetQuery = 'faille zero-day OR vulnérabilité';
      } else if (category === 'ransomware') {
        targetQuery = 'ransomware OR rançongiciel';
      } else if (category === 'anssi') {
        targetQuery = 'ANSSI OR CERT-FR';
      }
      
      if (queryInput) {
        queryInput.value = targetQuery;
      }
      STATE.currentQuery = targetQuery;
      loadGoogleNews(targetQuery);
    });
  });
}

// ── QUICK ALERTS MODAL PORTAL ──────────────────────────────
function initModal() {
  const btnQuickAlerts = document.getElementById('btn-quick-alerts');
  const modal = document.getElementById('quick-alerts-modal');
  const btnClose = document.getElementById('btn-close-modal');
  
  if (!btnQuickAlerts || !modal) return;
  
  btnQuickAlerts.addEventListener('click', () => {
    modal.classList.add('show');
  });
  
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }
  
  // Close when clicking overlay background
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

// ── FETCH GOOGLE NEWS FEED VIA FREE RELIABLE CORS PROXY ────
async function loadGoogleNews(query, isSilent = false) {
  const feedContainer = document.getElementById('news-feed');
  const highlightLabel = document.getElementById('current-query');
  
  if (highlightLabel) {
    highlightLabel.textContent = `"${query}"`;
  }
  
  // Show skeleton loader
  if (!isSilent && feedContainer) {
    feedContainer.innerHTML = `
      <div class="loading-placeholder">
        <div class="pulse-bar"></div>
        <div class="pulse-bar" style="width: 75%; margin-top:8px;"></div>
        <div class="pulse-bar" style="width: 90%; margin-top:8px;"></div>
      </div>
    `;
  }
  
  const fullSearchQuery = query + CONFIG.DEFAULT_CYBER_FILTER;
  const encodedQuery = encodeURIComponent(fullSearchQuery);
  const googleNewsRss = `https://news.google.com/rss/search?q=${encodedQuery}&hl=fr&gl=FR&ceid=FR:fr`;
  
  // Using api.allorigins.win which is completely free, open source, has no rate limits and supports XML
  const queryUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(googleNewsRss)}`;
  
  try {
    const res = await fetch(queryUrl, { signal: AbortSignal.timeout(12000) });
    const responseData = await res.json();
    
    if (!responseData || !responseData.contents) {
      throw new Error('AllOrigins response invalid');
    }
    
    // Parse the returned XML string directly in browser using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseData.contents, "text/xml");
    const items = xmlDoc.querySelectorAll("item");
    
    if (!items || items.length === 0) {
      throw new Error('No items found in RSS feed');
    }
    
    STATE.articles = Array.from(items).slice(0, 12).map((item, index) => {
      const titleElem = item.querySelector('title');
      const linkElem = item.querySelector('link');
      const dateElem = item.querySelector('pubDate');
      const descElem = item.querySelector('description');
      
      let title = titleElem ? titleElem.textContent : 'Sans titre';
      let link = linkElem ? linkElem.textContent : '#';
      let pubDate = dateElem ? dateElem.textContent : '';
      let description = descElem ? descElem.textContent : '';
      
      let formattedDate = 'Récemment';
      if (pubDate) {
        const d = new Date(pubDate);
        formattedDate = d.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      let sourceName = 'Google News';
      const parts = title.split(' - ');
      if (parts.length > 1) {
        sourceName = parts.pop();
        title = parts.join(' - ');
      }
      
      return {
        id: `news-${index}`,
        title: title,
        description: cleanText(description || 'Lire la couverture complète.'),
        link: link,
        date: formattedDate,
        source: sourceName
      };
    });
    
    renderArticles();
    
  } catch (err) {
    console.error('Error fetching news:', err);
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div class="loading-placeholder" style="border-color: #fecaca; background: #fff8f8;">
          <p style="color: #ef4444; font-weight:600;">⚠️ Impossible de charger les actualités.</p>
          <button onclick="retrySearch()" class="nav-link active" style="margin-top:10px; border:none; background:none; cursor:pointer;">Réessayer</button>
        </div>
      `;
    }
  }
}

// ── RENDER ARTICLES ────────────────────────────────────────
function renderArticles() {
  const feedContainer = document.getElementById('news-feed');
  if (!feedContainer) return;
  
  if (STATE.articles.length === 0) {
    feedContainer.innerHTML = `
      <div class="loading-placeholder">
        <p>Aucun article disponible.</p>
      </div>
    `;
    return;
  }
  
  feedContainer.innerHTML = STATE.articles.map((article, index) => {
    const titleLower = article.title.toLowerCase();
    let cardEmoji = '🔒';
    if (titleLower.includes('faille') || titleLower.includes('vulnerabilit') || titleLower.includes('cve')) {
      cardEmoji = '⚡';
    } else if (titleLower.includes('ransomware') || titleLower.includes('rançongiciel') || titleLower.includes('hacker')) {
      cardEmoji = '☠️';
    } else if (titleLower.includes('ia') || titleLower.includes('ai') || titleLower.includes('intelligence')) {
      cardEmoji = '🤖';
    } else if (titleLower.includes('anssi') || titleLower.includes('cert')) {
      cardEmoji = '🇫🇷';
    } else if (titleLower.includes('cisa') || titleLower.includes('cybersecurity')) {
      cardEmoji = '🇺🇸';
    }
    
    return `
      <article class="fr-news-card" onclick="window.open('${article.link}', '_blank', 'noopener,noreferrer')" style="animation: card-entry 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) both; animation-delay: ${index * 0.04}s">
        <div class="fr-card-image" aria-hidden="true">${cardEmoji}</div>
        <div class="fr-card-body">
          <div class="fr-card-header">
            <span class="fr-card-source">${article.source}</span>
            <span class="fr-card-date">${article.date}</span>
          </div>
          <h3 class="fr-card-title">${article.title}</h3>
          <p class="fr-card-desc">${article.description}</p>
        </div>
      </article>
    `;
  }).join('');
}

// ── UTILITIES ──────────────────────────────────────────────
function cleanText(htmlText) {
  if (!htmlText) return '';
  let doc = new DOMParser().parseFromString(htmlText, 'text/html');
  let clean = doc.body.textContent || doc.body.innerText || '';
  clean = clean.replace(/\s+/g, ' ').trim();
  
  const targetIndex = clean.indexOf('consulter la couverture complète');
  if (targetIndex !== -1) {
    clean = clean.substring(0, targetIndex).trim();
  }
  
  if (clean.length > 160) {
    clean = clean.substring(0, 157) + '...';
  }
  return clean;
}

function retrySearch() {
  loadGoogleNews(STATE.currentQuery);
}
