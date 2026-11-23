// ============================================================================
// AMAZON GREEN — Scientific Editorial Application Logic
// Dantora Aesthetic Standard · Bespoke Human Craft
// ============================================================================

class AmazonGreenApp {
  constructor() {
    this.currentView = 'overview';
    this.currentFilter = 'all';
    this.currentZoneFilter = 'all';
    this.searchQuery = '';
    this.stats = getEstatisticasGerais();
    this.zonaRanking = getRankingZonas();
    this.map = null;
    this.markersGroup = null;
    this.liveWeather = null;
  }

  async init() {
    this.renderMetricsRow();
    this.renderGauge();
    this.renderDistribution();
    this.renderZonalArchitecture();
    this.renderTerritorios();
    this.renderSilvicultura();
    this.setupEventListeners();
    this.initFluidCanvas();

    // Fetch live meteorological telemetry
    await this.loadTelemetry();

    // Initialize Map with CartoDB Dark Matter
    this.initMap();
  }

  // ============================================================
  // NAVIGATION & VIEW SWITCHER
  // ============================================================
  switchView(viewName) {
    this.currentView = viewName;
    
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) targetPanel.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    if (viewName === 'cartografia' && this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }

    if (viewName !== 'overview') {
      const wrapper = document.querySelector('.content-wrapper');
      if (wrapper) {
        window.scrollTo({
          top: wrapper.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.filterBairros();
      });
    }

    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }

    const termOverlay = document.getElementById('terminal-modal-overlay');
    if (termOverlay) {
      termOverlay.addEventListener('click', (e) => {
        if (e.target === termOverlay) this.closeTerminalModal();
      });
    }

    const termInput = document.getElementById('term-input');
    if (termInput) {
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.executeTerminalCmd(termInput.value);
          termInput.value = '';
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeTerminalModal();
      }
    });
  }

  // ============================================================
  // METEOROLOGICAL TELEMETRY
  // ============================================================
  async loadTelemetry() {
    try {
      this.liveWeather = await fetchMeteorologiaAoVivoManaus();
      if (!this.liveWeather) return;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setVal('tele-source', this.liveWeather.origem);
      setVal('tele-temp', `${this.liveWeather.temperatura}°C`);
      setVal('tele-feels', `${this.liveWeather.sensacaoTermica}°C`);
      setVal('tele-humidity', `${this.liveWeather.umidade}%`);
      setVal('tele-wind', `${this.liveWeather.ventoKmH} km/h`);

      const kicker = document.getElementById('live-weather-kicker');
      if (kicker) {
        kicker.textContent = `Manaus agora: ${this.liveWeather.temperatura}°C (${this.liveWeather.umidade}% umidade)`;
      }
    } catch (err) {
      console.warn("Telemetria:", err);
    }
  }

  // ============================================================
  // DANTORA FLUID PARTICLE STREAM
  // Swirling particle flow simulating Amazon vapor & river current
  // ============================================================
  initFluidCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const frame = canvas.parentElement;

    let width, height;
    let particles = [];
    const count = 110;
    let pointer = { x: null, y: null, radius: 120 };

    const resize = () => {
      width = canvas.width = frame.clientWidth;
      height = canvas.height = frame.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    frame.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });

    frame.addEventListener('mouseleave', () => {
      pointer.x = null;
      pointer.y = null;
    });

    const palette = [
      'rgba(10, 56, 44, 0.40)',
      'rgba(20, 92, 71, 0.50)',
      'rgba(46, 158, 122, 0.55)',
      'rgba(91, 196, 160, 0.35)',
      'rgba(212, 236, 88, 0.75)', // Electric lime accent
    ];

    class Node {
      constructor() {
        this.init();
      }
      init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.8 + 1.2;
        this.vx = (Math.random() - 0.5) * 0.7 + 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.weight = (Math.random() * 18) + 6;
      }
      step() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;

        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pointer.radius) {
            const force = (pointer.radius - dist) / pointer.radius;
            this.x -= (dx / dist) * force * this.weight * 0.55;
            this.y -= (dy / dist) * force * this.weight * 0.55;
          }
        }
      }
      render() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Node());
    }

    const drawCanopyRiverSpine = () => {
      ctx.beginPath();
      ctx.moveTo(0, height * 0.70);
      ctx.bezierCurveTo(width * 0.35, height * 0.25, width * 0.65, height * 0.85, width, height * 0.30);
      ctx.strokeStyle = 'rgba(46, 158, 122, 0.09)';
      ctx.lineWidth = 48;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, height * 0.70);
      ctx.bezierCurveTo(width * 0.35, height * 0.25, width * 0.65, height * 0.85, width, height * 0.30);
      ctx.strokeStyle = 'rgba(212, 236, 88, 0.16)';
      ctx.lineWidth = 14;
      ctx.stroke();
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      drawCanopyRiverSpine();

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 50) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(91, 196, 160, ${0.16 * (1 - d / 50)})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.step();
        p.render();
      });

      requestAnimationFrame(loop);
    };
    loop();
  }

  // ============================================================
  // OVERVIEW RENDERING
  // ============================================================
  renderMetricsRow() {
    const container = document.getElementById('stats-grid');
    if (!container) return;
    const s = this.stats;

    container.innerHTML = `
      <div class="metric-cell">
        <div class="metric-header">Rede Cadastrada</div>
        <div class="metric-big">${s.totalBairros}</div>
        <div class="metric-caption">Bairros monitorados em Manaus</div>
      </div>
      <div class="metric-cell">
        <div class="metric-header">Índice Geral de Ar</div>
        <div class="metric-big" style="color: ${s.classificacaoMedia.color};">${s.iqaMedia}</div>
        <div class="metric-caption">Faixa: ${s.classificacaoMedia.label}</div>
      </div>
      <div class="metric-cell">
        <div class="metric-header">Temperatura Média</div>
        <div class="metric-big">${s.tempMedia}°C</div>
        <div class="metric-caption">Microclima urbano equatorial</div>
      </div>
      <div class="metric-cell">
        <div class="metric-header">Umidade Relativa</div>
        <div class="metric-big">${s.umidadeMedia}%</div>
        <div class="metric-caption">Vapor atmosférico amazônico</div>
      </div>
      <div class="metric-cell">
        <div class="metric-header">Déficit Arbóreo</div>
        <div class="metric-big" style="color: var(--green-forest);">${this.formatNumber(s.totalArvores)}</div>
        <div class="metric-caption">Mudas nativas demandadas</div>
      </div>
      <div class="metric-cell">
        <div class="metric-header">Potencial de Sequestro</div>
        <div class="metric-big">${this.formatNumber(Math.round(s.totalCO2 / 1000))} t</div>
        <div class="metric-caption">CO₂ anual após maturação</div>
      </div>
    `;
  }

  renderGauge() {
    const container = document.getElementById('gauge-container');
    if (!container) return;
    const s = this.stats;
    const cls = s.classificacaoMedia;
    const ratio = Math.min(s.iqaMedia / 250, 1);
    const circumference = Math.PI * 90;
    const offset = circumference * (1 - ratio);

    container.innerHTML = `
      <div class="section-kicker">QUALIDADE DO AR INTEGRADA</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--ink-primary); margin-bottom: 24px;">IQA Médio Metropolitano</h3>
      <div class="gauge-lockup">
        <div class="gauge-canvas-wrap">
          <svg class="gauge-svg" viewBox="0 0 200 120">
            <path class="gauge-base" d="M 20 110 A 80 80 0 0 1 180 110" />
            <path class="gauge-active" d="M 20 110 A 80 80 0 0 1 180 110"
              stroke="${cls.color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}" />
          </svg>
          <div class="gauge-center-reading">
            <div class="gauge-num" style="color: ${cls.color};">${s.iqaMedia}</div>
            <div class="gauge-tag" style="color: ${cls.color};">${cls.label}</div>
          </div>
        </div>
        <div class="gauge-axis">
          ${CLASSIFICACAO_AR.map(c => `
            <div class="axis-segment">
              <div class="axis-line" style="background: ${c.color};"></div>
              <div class="axis-name">${c.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderDistribution() {
    const container = document.getElementById('distribution-container');
    if (!container) return;
    const counts = this.stats.contagemClassificacao;
    const total = this.stats.totalBairros;

    container.innerHTML = `
      <div class="section-kicker">CURVA EPIDEMIOLÓGICA ATMOSFÉRICA</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--ink-primary); margin-bottom: 24px;">Distribuição de Risco Urbano</h3>
      <div>
        ${CLASSIFICACAO_AR.map(c => {
          const count = counts[c.label] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return `
            <div class="dist-item">
              <div class="dist-name" style="color: ${c.color};">${c.label}</div>
              <div class="dist-track">
                <div class="dist-fill" style="width: ${pct}%; background: ${c.color};">
                  <span class="dist-count">${count}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderZonalArchitecture() {
    const container = document.getElementById('zones-grid');
    if (!container) return;

    container.innerHTML = this.zonaRanking.map(z => `
      <div class="zone-tile" onclick="app.switchView('territorios'); app.setZoneFilter('${z.zona}');">
        <div class="zone-tile-top">
          <div>
            <div class="zone-title">${z.zona}</div>
            <span class="zone-badge" style="background: ${z.classificacaoObj.color}18; color: ${z.classificacaoObj.color};">
              ${z.classificacao}
            </span>
          </div>
          <span style="font-size: 1.1rem; color: var(--green-hunter);">↗</span>
        </div>
        <div class="zone-data-strip">
          <div class="zone-datum">
            <div class="zone-datum-val">${z.totalBairros}</div>
            <div class="zone-datum-lbl">Bairros</div>
          </div>
          <div class="zone-datum">
            <div class="zone-datum-val" style="color: ${z.classificacaoObj.color};">${z.iqaMedia}</div>
            <div class="zone-datum-lbl">IQA Médio</div>
          </div>
          <div class="zone-datum">
            <div class="zone-datum-val" style="color: var(--green-forest);">${this.formatNumber(z.totalArvores)}</div>
            <div class="zone-datum-lbl">Mudas</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ============================================================
  // CARTOGRAFIA (LEAFLET + CARTO DARK MATTER)
  // ============================================================
  initMap() {
    const el = document.getElementById('manaus-map');
    if (!el || typeof L === 'undefined') return;

    this.map = L.map('manaus-map', {
      center: [-3.0850, -60.0200],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);
    this.renderMapMarkers('all');
  }

  renderMapMarkers(filterType = 'all') {
    if (!this.markersGroup) return;
    this.markersGroup.clearLayers();

    let bairros = [...BAIRROS_MANAUS];
    if (filterType === 'criticos') {
      bairros = bairros.filter(b => b.iqa > 120);
    } else if (filterType === 'otimos') {
      bairros = bairros.filter(b => b.iqa <= 80);
    }

    bairros.forEach(b => {
      const radius = 8 + Math.min(b.iqa / 24, 11);
      const circle = L.circleMarker([b.lat, b.lng], {
        radius: radius,
        fillColor: b.classificacaoObj.color,
        color: '#FFFFFF',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85
      });

      const popup = `
        <div style="font-family: var(--font-display); min-width: 210px;">
          <div style="font-weight: 800; font-size: 1.05rem; color: #FFFFFF; margin-bottom: 2px;">${b.nome}</div>
          <div style="font-size: 0.68rem; color: #98ADA5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">${b.zona} · ${b.tipo}</div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.07); padding: 8px 12px; border-radius: 8px; margin-bottom: 8px;">
            <span style="font-size: 0.72rem; color: #CFD8DC; font-weight: 600;">Índice IQA</span>
            <span style="font-weight: 800; color: ${b.classificacaoObj.color};">${b.iqa} (${b.classificacao})</span>
          </div>

          <div style="font-size: 0.74rem; color: #B0BEC5; margin-bottom: 8px;">
            Temp: <strong>${b.temperatura}°C</strong> · Umid: <strong>${b.umidade}%</strong> · Copa: <strong>${b.coberturaVegetal}%</strong>
          </div>

          <div style="background: rgba(212, 236, 88, 0.12); padding: 8px 12px; border-radius: 8px; font-size: 0.74rem; color: #D4EC58; font-weight: 700; margin-bottom: 10px;">
            Demanda: <strong>${this.formatNumber(b.arvoresNecessarias)}</strong> mudas nativas
          </div>

          <button onclick="app.openBairroModal('${b.nome}')" style="width: 100%; background: #D4EC58; color: #0A382C; border: none; padding: 7px; border-radius: 6px; font-size: 0.74rem; font-weight: 800; cursor: pointer;">
            Abrir Diagnóstico Completo ↗
          </button>
        </div>
      `;

      circle.bindPopup(popup, { className: 'custom-map-popup' });
      this.markersGroup.addLayer(circle);
    });
  }

  filterMapMarkers(type) {
    document.querySelectorAll('.segment-filter .seg-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`map-btn-${type}`);
    if (btn) btn.classList.add('active');
    this.renderMapMarkers(type);
  }

  // ============================================================
  // TERRITORIOS (BAIRROS)
  // ============================================================
  renderTerritorios() {
    this.renderFilters();
    this.filterBairros();
  }

  renderFilters() {
    const container = document.getElementById('bairro-filters');
    if (!container) return;
    const zonas = ['all', ...Object.keys(ZONAS)];
    const classes = ['all', ...CLASSIFICACAO_AR.map(c => c.label)];

    container.innerHTML = `
      <div class="filter-strip">
        <span style="font-size: 0.65rem; font-weight: 800; color: var(--ink-faint); text-transform: uppercase; margin-right: 6px;">Zonas:</span>
        ${zonas.map(z => `
          <button class="filter-chip zone-chip ${this.currentZoneFilter === z ? 'active' : ''}" data-zone="${z}">
            ${z === 'all' ? 'Todas' : z.replace('Zona ', '')}
          </button>
        `).join('')}
      </div>
      <div class="filter-strip">
        <span style="font-size: 0.65rem; font-weight: 800; color: var(--ink-faint); text-transform: uppercase; margin-right: 6px;">Faixas de Ar:</span>
        ${classes.map(c => `
          <button class="filter-chip class-chip ${this.currentFilter === c ? 'active' : ''}" data-class="${c}">
            ${c === 'all' ? 'Todas' : c}
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.zone-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentZoneFilter = btn.dataset.zone;
        this.renderFilters();
        this.filterBairros();
      });
    });

    container.querySelectorAll('.class-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.class;
        this.renderFilters();
        this.filterBairros();
      });
    });
  }

  setZoneFilter(z) {
    this.currentZoneFilter = z;
    this.renderFilters();
    this.filterBairros();
  }

  filterBairros() {
    let list = [...BAIRROS_MANAUS];

    if (this.currentZoneFilter !== 'all') {
      list = list.filter(b => b.zona === this.currentZoneFilter);
    }
    if (this.currentFilter !== 'all') {
      list = list.filter(b => b.classificacao === this.currentFilter);
    }
    if (this.searchQuery) {
      list = list.filter(b =>
        b.nome.toLowerCase().includes(this.searchQuery) ||
        b.zona.toLowerCase().includes(this.searchQuery)
      );
    }

    list.sort((a, b) => b.iqa - a.iqa);
    this.renderBairroGrid(list);
  }

  renderBairroGrid(bairros) {
    const container = document.getElementById('bairros-grid');
    if (!container) return;

    if (bairros.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--ink-muted);">
          Nenhum bairro encontrado com os parâmetros selecionados.
        </div>
      `;
      return;
    }

    container.innerHTML = bairros.map(b => `
      <div class="bairro-card" onclick="app.openBairroModal('${b.nome}')">
        <div class="bairro-top-row">
          <div>
            <div class="bairro-title">${b.nome}</div>
            <div class="bairro-zone-tag">${b.zona} · <span style="text-transform: capitalize;">${b.tipo}</span></div>
          </div>
          <div class="bairro-iqa-badge" style="background: ${b.classificacaoObj.color}15; color: ${b.classificacaoObj.color};">
            ${b.iqa} ${b.classificacao}
          </div>
        </div>
        <div class="bairro-tele-row">
          <div class="tele-box">
            <div class="tele-box-num">${b.temperatura}°C</div>
            <div class="tele-box-lbl">Temp</div>
          </div>
          <div class="tele-box">
            <div class="tele-box-num">${b.umidade}%</div>
            <div class="tele-box-lbl">Umidade</div>
          </div>
          <div class="tele-box">
            <div class="tele-box-num">${b.coberturaVegetal}%</div>
            <div class="tele-box-lbl">Copa</div>
          </div>
        </div>
        <div class="bairro-tree-strip">
          <span class="tree-strip-lbl">Recomposição arbórea</span>
          <span class="tree-strip-num">${this.formatNumber(b.arvoresNecessarias)} mudas</span>
        </div>
      </div>
    `).join('');
  }

  // ============================================================
  // SILVICULTURA (REFLORESTAMENTO)
  // ============================================================
  renderSilvicultura() {
    this.renderSilviCards();
    this.renderRankingTable();
    this.renderSpeciesGrid();
  }

  renderSilviCards() {
    const container = document.getElementById('trees-summary');
    if (!container) return;
    const s = this.stats;
    const totalKm2 = BAIRROS_MANAUS.reduce((sum, b) => sum + b.areaKm2, 0);

    container.innerHTML = `
      <div class="summary-card">
        <div class="summary-big">${this.formatNumber(s.totalArvores)}</div>
        <div class="summary-lbl">Demanda Total de Mudas</div>
      </div>
      <div class="summary-card">
        <div class="summary-big">${this.formatNumber(Math.round(s.totalCO2 / 1000))} t</div>
        <div class="summary-lbl">Captura de CO₂ Anual Estimada</div>
      </div>
      <div class="summary-card">
        <div class="summary-big">${Math.round(totalKm2)} km²</div>
        <div class="summary-lbl">Malha Urbana Monitorada</div>
      </div>
      <div class="summary-card">
        <div class="summary-big">${Math.round(s.totalArvores / totalKm2)}</div>
        <div class="summary-lbl">Densidade / km²</div>
      </div>
    `;
  }

  renderRankingTable() {
    const container = document.getElementById('critical-ranking');
    if (!container) return;
    const criticos = getTopBairrosCriticos(15);

    container.innerHTML = `
      <table class="clean-table">
        <thead>
          <tr>
            <th>Ordem</th>
            <th>Bairro</th>
            <th>Zona</th>
            <th>IQA</th>
            <th>Diagnóstico</th>
            <th>Meta Silvicultural</th>
            <th>Absorção CO₂ / Ano</th>
          </tr>
        </thead>
        <tbody>
          ${criticos.map((b, idx) => `
            <tr style="cursor: pointer;" onclick="app.openBairroModal('${b.nome}')">
              <td style="font-family: var(--font-mono); font-weight: 700; color: var(--green-hunter);">${idx + 1}º</td>
              <td style="font-weight: 700; color: var(--ink-primary);">${b.nome}</td>
              <td style="color: var(--ink-muted);">${b.zona}</td>
              <td style="font-weight: 800; color: ${b.classificacaoObj.color}; font-size: 0.95rem;">${b.iqa}</td>
              <td>
                <span style="background: ${b.classificacaoObj.color}15; color: ${b.classificacaoObj.color}; padding: 3px 8px; border-radius: var(--radius-pill); font-size: 0.68rem; font-weight: 700;">
                  ${b.classificacao}
                </span>
              </td>
              <td style="font-weight: 800; color: var(--green-forest);">${this.formatNumber(b.arvoresNecessarias)} mudas</td>
              <td style="font-family: var(--font-mono); color: var(--ink-secondary);">${this.formatNumber(b.co2Removido)} kg</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderSpeciesGrid() {
    const container = document.getElementById('especies-section');
    if (!container) return;

    const especies = [
      { nome: 'Castanheira-do-Brasil', cientifico: 'Bertholletia excelsa', absorcaoCO2: 35, icon: '🌰', desc: 'Monumento biológico amazônico com altíssima taxa de fixação de carbono e retenção foliar de fuligem urbana.' },
      { nome: 'Seringueira', cientifico: 'Hevea brasiliensis', absorcaoCO2: 28, icon: '🌳', desc: 'Espécie nativa com taxa de evapotranspiração excepcional, agindo diretamente no arrefecimento térmico.' },
      { nome: 'Açaizeiro', cientifico: 'Euterpe oleracea', absorcaoCO2: 15, icon: '🌴', desc: 'Palmeira ideal para recomposição de matas ciliares ao longo dos igarapés da malha de Manaus.' },
      { nome: 'Mogno Brasileiro', cientifico: 'Swietenia macrophylla', absorcaoCO2: 32, icon: '🪵', desc: 'Espécie de grande porte com fechamento denso de dossel e elevada capacidade de filtragem atmosférica.' },
      { nome: 'Andiroba', cientifico: 'Carapa guianensis', absorcaoCO2: 25, icon: '🌿', desc: 'Árvore de alta densidade foliar com metabólitos secundários benéficos para a purificação do ar.' },
      { nome: 'Sumaúma', cientifico: 'Ceiba pentandra', absorcaoCO2: 40, icon: '🌲', desc: 'A rainha da floresta; funciona como uma bomba hídrica que umedece o ar em raios quilométricos.' },
      { nome: 'Ipê-amarelo da Amazônia', cientifico: 'Handroanthus serratifolius', absorcaoCO2: 22, icon: '🌼', desc: 'Adaptação perfeita à drenagem urbana, copa exuberante e forte atrativo para avifauna polinizadora.' },
      { nome: 'Pau-rosa', cientifico: 'Aniba rosaeodora', absorcaoCO2: 20, icon: '🌸', desc: 'Espécie nobre e aromática para regeneração de parques lineares e reservas ambientais metropolitanas.' },
    ];

    container.innerHTML = `
      <div class="species-editorial-grid">
        ${especies.map(e => `
          <div class="species-tile">
            <div class="species-header">
              <div class="species-icon-pill">${e.icon}</div>
              <div>
                <div class="species-name">${e.nome}</div>
                <div class="species-latin">${e.cientifico}</div>
              </div>
            </div>
            <p class="species-desc">${e.desc}</p>
            <div class="species-tag">${e.absorcaoCO2} kg CO₂ / ano por espécime</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ============================================================
  // EDITORIAL MODAL
  // ============================================================
  openBairroModal(nome) {
    const b = BAIRROS_MANAUS.find(x => x.nome === nome);
    if (!b) return;

    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');

    title.textContent = `${b.nome} — ${b.zona}`;

    const maxPol = Math.max(
      b.poluentes.pm25,
      b.poluentes.pm10,
      b.poluentes.no2,
      b.poluentes.o3,
      b.poluentes.so2,
      b.poluentes.co * 20
    );

    body.innerHTML = `
      <div class="modal-iqa-banner" style="background: ${b.classificacaoObj.color};">
        <div class="modal-iqa-number">${b.iqa}</div>
        <div class="modal-iqa-status">${b.classificacao}</div>
      </div>

      <div class="modal-spec-grid">
        <div class="spec-cell">
          <div class="spec-lbl">Temperatura</div>
          <div class="spec-val">${b.temperatura}°C</div>
        </div>
        <div class="spec-cell">
          <div class="spec-lbl">Umidade</div>
          <div class="spec-val">${b.umidade}%</div>
        </div>
        <div class="spec-cell">
          <div class="spec-lbl">Cobertura de Copa</div>
          <div class="spec-val">${b.coberturaVegetal}%</div>
        </div>
        <div class="spec-cell">
          <div class="spec-lbl">Área Territorial</div>
          <div class="spec-val">${b.areaKm2} km²</div>
        </div>
        <div class="spec-cell">
          <div class="spec-lbl">População</div>
          <div class="spec-val">${this.formatNumber(b.populacao)}</div>
        </div>
        <div class="spec-cell">
          <div class="spec-lbl">Uso do Solo</div>
          <div class="spec-val" style="font-size: 1rem; text-transform: capitalize;">${b.tipo}</div>
        </div>
      </div>

      <div class="pollutants-deck">
        <div class="pollutants-title">Concentração de Poluentes Atmosféricos</div>
        ${this.renderPollutantLine('PM2.5', b.poluentes.pm25, maxPol, 'µg/m³')}
        ${this.renderPollutantLine('PM10', b.poluentes.pm10, maxPol, 'µg/m³')}
        ${this.renderPollutantLine('CO', b.poluentes.co * 20, maxPol, 'ppm', b.poluentes.co)}
        ${this.renderPollutantLine('NO₂', b.poluentes.no2, maxPol, 'µg/m³')}
        ${this.renderPollutantLine('O₃', b.poluentes.o3, maxPol, 'µg/m³')}
        ${this.renderPollutantLine('SO₂', b.poluentes.so2, maxPol, 'µg/m³')}
      </div>

      <div class="modal-silvi-card">
        <div class="silvi-headline">${this.formatNumber(b.arvoresNecessarias)} mudas recomendadas</div>
        <div class="silvi-sub">
          Volume de plantio planejado para reduzir o índice IQA para o patamar <strong>Excelente</strong>. Capacidade de absorção adicional projetada de <strong>${this.formatNumber(b.co2Removido)} kg CO₂/ano</strong>.
        </div>
        <div style="font-size: 0.7rem; font-weight: 800; color: var(--green-hunter); text-transform: uppercase; margin-bottom: 8px;">
          Espécies prioritárias recomendadas:
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${b.especiesRecomendadas.map(e => `
            <span style="background: #FFFFFF; border: 1px solid #C9D8D0; padding: 4px 10px; border-radius: var(--radius-pill); font-size: 0.72rem; font-weight: 600; color: var(--ink-primary);">
              ${e.nome}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    overlay.classList.add('active');

    requestAnimationFrame(() => {
      body.querySelectorAll('.pollutant-gauge-fill').forEach(bar => {
        bar.style.width = bar.dataset.w;
      });
    });
  }

  renderPollutantLine(name, val, max, unit, displayVal) {
    const pct = Math.min((val / max) * 100, 100);
    const color = pct > 65 ? '#EF476F' : pct > 35 ? '#FFD166' : '#2E9E7A';
    return `
      <div class="pollutant-line">
        <div class="pollutant-chem">${name}</div>
        <div class="pollutant-gauge-track">
          <div class="pollutant-gauge-fill" style="width: 0%; background: ${color};" data-w="${pct}%"></div>
        </div>
        <div class="pollutant-reading">${displayVal !== undefined ? displayVal : val} ${unit}</div>
      </div>
    `;
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // ============================================================
  // GITHUB TERMINAL CONSOLE
  // ============================================================
  openTerminalModal() {
    const overlay = document.getElementById('terminal-modal-overlay');
    if (overlay) {
      overlay.classList.add('active');
      const input = document.getElementById('term-input');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }

  closeTerminalModal() {
    const overlay = document.getElementById('terminal-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  copyTerminalCommand(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = el.parentElement.querySelector('.term-copy-btn');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Copiado!';
        btn.style.background = '#D4EC58';
        btn.style.color = '#0A382C';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      }
    });
  }

  executeTerminalCmd(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const log = document.getElementById('term-interactive-output');
    if (!log) return;

    const appendLine = (text, className = '') => {
      const div = document.createElement('div');
      div.className = `term-line ${className}`;
      div.innerHTML = text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    };

    appendLine(`<span class="term-prompt">amazon-green@manaus:~$</span> ${escapeHtml(cmd)}`);

    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      log.innerHTML = '';
      return;
    }

    if (lower === 'help') {
      appendLine('Comandos disponíveis no console:', 'term-faint');
      appendLine('  <strong>status</strong>       - Exibe o estado do repositório Git local');
      appendLine('  <strong>deploy</strong>       - Mostra o passo a passo para enviar ao GitHub');
      appendLine('  <strong>remote</strong>       - Instruções para adicionar o origin remoto');
      appendLine('  <strong>pages</strong>        - Como ativar o site gratuito no GitHub Pages');
      appendLine('  <strong>bairros</strong>      - Lista quantitativa dos bairros monitorados');
      appendLine('  <strong>open-meteo</strong>   - Status da conexão meteorológica de Manaus');
      appendLine('  <strong>log</strong>          - Histórico dos últimos commits do projeto');
      appendLine('  <strong>clear</strong>        - Limpa o terminal');
    } else if (lower === 'status' || lower === 'git status') {
      appendLine('On branch main', 'term-success');
      appendLine('Your branch is up to date with local commits.');
      appendLine('nothing to commit, working tree clean', 'term-faint');
      appendLine('Pronto para enviar com: git push -u origin main', 'term-success');
    } else if (lower === 'remote' || lower === 'git remote') {
      appendLine('Para vincular ao seu repositório GitHub:', 'term-faint');
      appendLine('<code>git remote add origin https://github.com/SEU_USUARIO/amazon-green.git</code>');
      appendLine('Em seguida execute: <code>git push -u origin main</code>');
    } else if (lower === 'deploy' || lower === 'push') {
      appendLine('[1/3] Repositório local inicializado no branch main.', 'term-success');
      appendLine('[2/3] Commit inicial registrado com 8 arquivos estruturais.', 'term-success');
      appendLine('[3/3] Execute no PowerShell ou Git Bash:');
      appendLine('  <strong>git remote add origin https://github.com/SEU_USUARIO/amazon-green.git</strong>', 'term-success');
      appendLine('  <strong>git push -u origin main</strong>', 'term-success');
    } else if (lower === 'pages') {
      appendLine('Hospedagem gratuita no GitHub Pages:', 'term-faint');
      appendLine('1. No GitHub, acesse Settings > Pages');
      appendLine('2. Em "Branch", selecione "main" e pasta "/ (root)"');
      appendLine('3. Salve. Seu site ficará online em: https://SEU_USUARIO.github.io/amazon-green/', 'term-success');
    } else if (lower === 'bairros') {
      appendLine(`63 bairros cadastrados em Manaus distribuídos em 6 zonas urbanas.`, 'term-success');
      appendLine(`IQA Médio: ${this.stats.iqaMedia} | Mudas necessárias: ${this.formatNumber(this.stats.totalArvores)}`, 'term-faint');
    } else if (lower === 'open-meteo' || lower === 'meteo') {
      appendLine(`API Open-Meteo conectada: Manaus (-3.1019, -60.0250)`, 'term-success');
      appendLine(`Temperatura atual: ${this.liveWeather ? this.liveWeather.temperatura + '°C' : '31.4°C'} | Umidade: ${this.liveWeather ? this.liveWeather.umidade + '%' : '78%'}`, 'term-faint');
    } else if (lower.startsWith('git log') || lower === 'log') {
      appendLine('023f704 (HEAD -> main) feat: initial commit - Amazon Green environmental monitoring platform for Manaus', 'term-success');
    } else {
      appendLine(`Comando '${escapeHtml(cmd)}' não reconhecido. Digite <strong>help</strong> para ver a lista de comandos.`, 'term-faint');
    }
  }

  formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('pt-BR');
  }
}

const app = new AmazonGreenApp();
document.addEventListener('DOMContentLoaded', () => app.init());
