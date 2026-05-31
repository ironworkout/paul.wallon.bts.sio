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

// ── NEWS FETCHING ENGINE ───────────────────────────────────
// Strategy 1: rss2json.com (dedicated RSS→JSON API, native CORS support)
// Strategy 2: codetabs CORS proxy + DOMParser XML fallback

async function fetchViaRss2Json(rssUrl) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  console.log('[Ghost-Monitor] Trying rss2json.com...');
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok' || !data.items || data.items.length === 0) {
    throw new Error('rss2json: no items');
  }
  console.log(`[Ghost-Monitor] ✅ rss2json returned ${data.items.length} articles`);
  return data.items.map((item, index) => {
    let title = item.title || 'Sans titre';
    let link = item.link || '#';
    let pubDate = item.pubDate || '';
    let description = item.description || '';

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
      sourceName = parts.pop().trim();
      title = parts.join(' - ');
    }

    return {
      id: `news-${index}`,
      title,
      description: cleanText(description || 'Lire la couverture complète.'),
      link,
      date: formattedDate,
      source: sourceName
    };
  });
}

async function fetchViaXmlProxy(rssUrl) {
  const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`;
  console.log('[Ghost-Monitor] Fallback: trying codetabs proxy...');
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xmlText = await res.text();
  if (!xmlText || xmlText.length < 100) throw new Error('Empty XML');

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) throw new Error('XML parse error');

  const items = xmlDoc.querySelectorAll('item');
  if (!items || items.length === 0) throw new Error('No items in RSS');

  console.log(`[Ghost-Monitor] ✅ codetabs proxy returned ${items.length} articles`);
  return Array.from(items).slice(0, 12).map((item, index) => {
    let title = item.querySelector('title')?.textContent || 'Sans titre';
    let link = item.querySelector('link')?.textContent || '#';
    let pubDate = item.querySelector('pubDate')?.textContent || '';
    let description = item.querySelector('description')?.textContent || '';

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
      sourceName = parts.pop().trim();
      title = parts.join(' - ');
    }

    return {
      id: `news-${index}`,
      title,
      description: cleanText(description || 'Lire la couverture complète.'),
      link,
      date: formattedDate,
      source: sourceName
    };
  });
}

// ── MAIN FETCH FUNCTION ────────────────────────────────────
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

  try {
    // Try rss2json first (most reliable, native CORS)
    let articles;
    try {
      articles = await fetchViaRss2Json(googleNewsRss);
    } catch (e1) {
      console.warn('[Ghost-Monitor] rss2json failed:', e1.message);
      // Fallback to XML proxy
      articles = await fetchViaXmlProxy(googleNewsRss);
    }

    STATE.articles = articles.slice(0, 12);
    renderArticles();

  } catch (err) {
    console.error('Error fetching news:', err);
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div class="loading-placeholder" style="border-color: #fecaca; background: #fff8f8;">
          <p style="color: #ef4444; font-weight:600;">⚠️ Impossible de charger les actualités.</p>
          <p style="color: #888; font-size:13px; margin-top:6px;">${err.message}</p>
          <button onclick="retrySearch()" class="nav-link active" style="margin-top:10px; border:none; background:none; cursor:pointer;">🔄 Réessayer</button>
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
