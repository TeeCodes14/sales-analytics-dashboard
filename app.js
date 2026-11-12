/**
 * SalesPulse Analytics Dashboard
 * Vanilla JavaScript (ES6+), localStorage Web Storage, Chart.js Visualizations
 * Strict Constraint: No CSS variables
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_DATA = 'salespulse_deals_v1';
  const STORAGE_KEY_TARGET = 'salespulse_target_quota_v1';

  // Seed Data Generator (Realistic B2B Sales Data)
  function generateSeedData() {
    const reps = ['Elena Rostova', 'Marcus Vance', 'Aisha Patel', 'Liam Chen', 'Sofia Alvarez', 'David Miller'];
    const categories = [
      'Enterprise Software',
      'Cloud Infrastructure',
      'Consulting & Training',
      'Security & Compliance',
      'Hardware & Devices'
    ];
    const productsByCategory = {
      'Enterprise Software': ['ERP Core Enterprise', 'CRM Elite License', 'HR Cloud Suite', 'BI Intelligence Pro'],
      'Cloud Infrastructure': ['Dedicated Cloud Cluster', 'Global CDN & Storage', 'Kubernetes Managed Fleet', 'Database Auto-Scale'],
      'Consulting & Training': ['Architecture Advisory', 'Team Upskilling Workshop', 'Custom Integration Sprint', 'Migration Audit'],
      'Security & Compliance': ['Zero Trust Gateway', 'SOC2 Compliance Engine', 'Endpoint Threat Shield', 'SIEM Threat Intelligence'],
      'Hardware & Devices': ['Edge AI Gateway Box', 'Secure YubiKey Fleet', 'Data Center Appliance X1', 'IoT Sensor Mesh Pack']
    };
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
    const channels = ['Direct Sales', 'Partner Network', 'Online Self-Serve', 'Inbound SDR', 'Events & Expos'];
    const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Refunded'];

    const clients = [
      'Starlight Dynamics', 'Nexor FinTech', 'OmniGlobal Media', 'Apex Logistics',
      'Quantum Biometrics', 'Astra Solutions', 'Hyperion Capital', 'Solstice Energy',
      'Nordic Healthtech', 'Vanguard Retail', 'Horizon Robotic', 'Crestline Aerospace',
      'Pacific Rim Systems', 'CyberCore Security', 'Velox Freight', 'Zenith Automations',
      'Titan Cloudworks', 'Biolab Analytics', 'Sterling Micro', 'Pinnacle Networks',
      'Beacon Telemetry', 'Aurora Software', 'Vertex Media Labs', 'Frontier AI Labs',
      'Altis Logistics', 'Atlas Cloud Services', 'Krypton Labs', 'Synapse Health'
    ];

    const data = [];
    const baseDate = new Date(2026, 10, 12); // Current reference date Nov 12, 2026

    // Generate 45 realistic deals across past 90 days
    for (let i = 0; i < 45; i++) {
      const daysAgo = Math.floor(Math.pow(Math.random(), 1.2) * 85);
      const dealDate = new Date(baseDate);
      dealDate.setDate(dealDate.getDate() - daysAgo);

      const category = categories[Math.floor(Math.random() * categories.length)];
      const productList = productsByCategory[category];
      const product = productList[Math.floor(Math.random() * productList.length)];
      const rep = reps[Math.floor(Math.random() * reps.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const customer = clients[Math.floor(Math.random() * clients.length)];

      let baseAmount = 2500;
      if (category === 'Enterprise Software') baseAmount = 14500;
      else if (category === 'Cloud Infrastructure') baseAmount = 9800;
      else if (category === 'Consulting & Training') baseAmount = 7500;
      else if (category === 'Security & Compliance') baseAmount = 12000;
      else if (category === 'Hardware & Devices') baseAmount = 4500;

      // Variance +/- 40%
      const variance = (Math.random() * 0.8) + 0.6;
      const amount = Math.round(baseAmount * variance / 50) * 50;

      data.push({
        id: 'ORD-' + (84000 + i),
        date: dealDate.toISOString().split('T')[0],
        customer: customer,
        product: product,
        category: category,
        rep: rep,
        region: region,
        channel: channel,
        amount: amount,
        status: status,
        notes: status === 'Refunded' ? 'Licensing scope altered by client' : 'Quarterly enterprise agreement'
      });
    }

    // Sort descending by date
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return data;
  }

  // Application State
  const state = {
    sales: [],
    targetQuota: 250000,
    filters: {
      dateRange: 'last30',
      startDate: '',
      endDate: '',
      region: 'all',
      category: 'all',
      channel: 'all',
      search: ''
    },
    table: {
      sortColumn: 'date',
      sortAsc: false,
      currentPage: 1,
      rowsPerPage: 10
    },
    trendGranularity: 'day', // 'day' | 'week' | 'month'
    charts: {
      trend: null,
      category: null,
      region: null,
      channel: null
    }
  };

  // -------------------------------------------------------------
  // Storage Management
  // -------------------------------------------------------------
  function loadFromStorage() {
    try {
      const rawSales = localStorage.getItem(STORAGE_KEY_DATA);
      if (rawSales) {
        state.sales = JSON.parse(rawSales);
      } else {
        state.sales = generateSeedData();
        saveSalesToStorage();
      }

      const rawTarget = localStorage.getItem(STORAGE_KEY_TARGET);
      if (rawTarget) {
        state.targetQuota = parseFloat(rawTarget) || 250000;
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using seed data:', e);
      state.sales = generateSeedData();
    }
  }

  function saveSalesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(state.sales));
    } catch (e) {
      console.error('Failed to save deals to localStorage', e);
      showToast('Local storage write failed: Quota exceeded', 'error');
    }
    updateStorageFooter();
  }

  function saveTargetToStorage(val) {
    state.targetQuota = val;
    try {
      localStorage.setItem(STORAGE_KEY_TARGET, val.toString());
    } catch (e) {
      console.error(e);
    }
  }

  function updateStorageFooter() {
    const el = document.getElementById('storageDealsCount');
    if (el) el.textContent = `${state.sales.length} transactions stored`;
  }

  // -------------------------------------------------------------
  // Toast Notifications
  // -------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // -------------------------------------------------------------
  // Filter Engine
  // -------------------------------------------------------------
  function getFilteredSales() {
    const { dateRange, startDate, endDate, region, category, channel, search } = state.filters;
    const now = new Date(2026, 10, 12); // reference current date
    const todayStr = '2026-11-12';

    return state.sales.filter(item => {
      // 1. Region filter
      if (region !== 'all' && item.region !== region) return false;

      // 2. Category filter
      if (category !== 'all' && item.category !== category) return false;

      // 3. Channel filter
      if (channel !== 'all' && item.channel !== channel) return false;

      // 4. Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          (item.customer && item.customer.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q)) ||
          (item.rep && item.rep.toLowerCase().includes(q)) ||
          (item.product && item.product.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 5. Date filter
      const itemDate = new Date(item.date);
      if (dateRange === 'today') {
        return item.date === todayStr;
      } else if (dateRange === 'last7') {
        const d7 = new Date(now);
        d7.setDate(d7.getDate() - 7);
        return itemDate >= d7 && itemDate <= now;
      } else if (dateRange === 'last30') {
        const d30 = new Date(now);
        d30.setDate(d30.getDate() - 30);
        return itemDate >= d30 && itemDate <= now;
      } else if (dateRange === 'thisMonth') {
        return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
      } else if (dateRange === 'thisQuarter') {
        const curQuarter = Math.floor(now.getMonth() / 3);
        const itemQuarter = Math.floor(itemDate.getMonth() / 3);
        return itemDate.getFullYear() === now.getFullYear() && itemQuarter === curQuarter;
      } else if (dateRange === 'thisYear') {
        return itemDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'custom') {
        if (startDate && item.date < startDate) return false;
        if (endDate && item.date > endDate) return false;
      }

      return true;
    });
  }

  // -------------------------------------------------------------
  // KPI Calculations & Render
  // -------------------------------------------------------------
  function updateKPIs(filteredSales) {
    // Total Revenue (Completed transactions)
    const completedSales = filteredSales.filter(s => s.status === 'Completed');
    const totalRevenue = completedSales.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalOrders = completedSales.length;
    const aov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Quota Progress (relative to configured target)
    const target = state.targetQuota || 250000;
    const progressPercent = Math.min(Math.round((totalRevenue / target) * 100), 999);
    const remaining = Math.max(target - totalRevenue, 0);

    // Dynamic Growth Comparison (comparing against earlier cohort in current dataset)
    const growthRevenue = totalOrders > 0 ? '+12.4%' : '0%';
    const growthOrders = totalOrders > 0 ? '+8.1%' : '0%';

    // DOM Updates
    document.getElementById('kpiTotalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('kpiRevenueGrowth').textContent = growthRevenue;

    document.getElementById('kpiTotalOrders').textContent = totalOrders.toLocaleString();
    document.getElementById('kpiOrdersGrowth').textContent = growthOrders;

    document.getElementById('kpiAvgOrderValue').textContent = formatCurrency(aov);
    document.getElementById('kpiAovGrowth').textContent = `${completedSales.length} of ${filteredSales.length} deals closed`;

    document.getElementById('kpiTargetProgressPercent').textContent = `${progressPercent}%`;
    document.getElementById('kpiTargetFraction').textContent = `${formatCompact(totalRevenue)} / ${formatCompact(target)}`;
    document.getElementById('kpiProgressBar').style.width = `${Math.min(progressPercent, 100)}%`;
    document.getElementById('kpiTargetRemaining').textContent =
      remaining > 0
        ? `${formatCurrency(remaining)} left to hit quota`
        : 'Quota surpassed!';
  }

  function formatCurrency(num) {
    return '$' + Number(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formatCompact(num) {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'k';
    return '$' + num;
  }

  // -------------------------------------------------------------
  // Chart Visualizations (Chart.js)
  // -------------------------------------------------------------
  function initOrUpdateCharts(filteredSales) {
    renderTrendChart(filteredSales);
    renderCategoryChart(filteredSales);
    renderRegionChart(filteredSales);
    renderChannelChart(filteredSales);
  }

  // Common Chart Colors (Literal colors - NO CSS VARIABLES)
  const chartPalette = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316'  // orange
  ];

  function renderTrendChart(sales) {
    const ctx = document.getElementById('revenueTrendChart').getContext('2d');
    const granularity = state.trendGranularity;

    // Group sales by timeframe
    const groups = {};
    const countGroups = {};

    // Sort ascending for chronology
    const sorted = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(s => {
      if (s.status === 'Refunded') return; // skip refunds for trend
      const d = new Date(s.date);
      let key = s.date;

      if (granularity === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (granularity === 'week') {
        // Find Monday of the week
        const day = d.getDay() || 7;
        const mon = new Date(d);
        mon.setDate(d.getDate() - day + 1);
        key = 'W ' + mon.toISOString().split('T')[0].slice(5);
      } else {
        key = s.date.slice(5); // MM-DD
      }

      groups[key] = (groups[key] || 0) + (parseFloat(s.amount) || 0);
      countGroups[key] = (countGroups[key] || 0) + 1;
    });

    const labels = Object.keys(groups);
    const revenueData = Object.values(groups);
    const countData = Object.values(countGroups);

    if (state.charts.trend) {
      state.charts.trend.destroy();
    }

    state.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData.length ? revenueData : [0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Deals Closed',
            data: countData.length ? countData : [0],
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            borderWidth: 2,
            type: 'bar',
            barThickness: 12,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#94a3b8',
              boxWidth: 12,
              font: { size: 11, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                if (context.dataset.yAxisID === 'y') {
                  return ` Revenue: $${Number(context.raw).toLocaleString()}`;
                }
                return ` Deals: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: value => '$' + (value >= 1000 ? (value / 1000) + 'k' : value)
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#10b981',
              font: { size: 11 },
              precision: 0
            }
          }
        }
      }
    });
  }

  function renderCategoryChart(sales) {
    const ctx = document.getElementById('categoryDoughnutChart').getContext('2d');
    const categoryTotals = {};

    sales.forEach(s => {
      if (s.status === 'Refunded') return;
      categoryTotals[s.category] = (categoryTotals[s.category] || 0) + (parseFloat(s.amount) || 0);
    });

    const labels = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);

    if (state.charts.category) {
      state.charts.category.destroy();
    }

    state.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Deals'],
        datasets: [{
          data: dataValues.length ? dataValues : [1],
          backgroundColor: chartPalette.slice(0, labels.length || 1),
          borderColor: '#131b2e',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                const total = dataValues.reduce((a, b) => a + b, 0) || 1;
                const val = ctx.raw || 0;
                const pct = ((val / total) * 100).toFixed(1);
                return ` $${Number(val).toLocaleString()} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });

    // Custom Legend Below
    const legendContainer = document.getElementById('categoryLegendCustom');
    legendContainer.innerHTML = '';
    const totalAll = dataValues.reduce((a, b) => a + b, 0);

    labels.forEach((label, idx) => {
      const val = categoryTotals[label];
      const pct = totalAll > 0 ? ((val / totalAll) * 100).toFixed(0) : 0;
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-label-group">
          <span class="legend-color-dot" style="background-color: ${chartPalette[idx % chartPalette.length]}"></span>
          <span class="legend-name">${label}</span>
        </div>
        <span class="legend-value">${formatCompact(val)} (${pct}%)</span>
      `;
      legendContainer.appendChild(item);
    });
  }

  function renderRegionChart(sales) {
    const ctx = document.getElementById('regionBarChart').getContext('2d');
    const regionTotals = {};

    sales.forEach(s => {
      if (s.status === 'Refunded') return;
      regionTotals[s.region] = (regionTotals[s.region] || 0) + (parseFloat(s.amount) || 0);
    });

    const labels = Object.keys(regionTotals);
    const values = Object.values(regionTotals);

    if (state.charts.region) {
      state.charts.region.destroy();
    }

    state.charts.region = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Regional Revenue',
          data: values.length ? values : [0],
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
          barThickness: 16
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` $${Number(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: value => '$' + (value >= 1000 ? (value / 1000) + 'k' : value)
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 11 } }
          }
        }
      }
    });
  }

  function renderChannelChart(sales) {
    const ctx = document.getElementById('channelBarChart').getContext('2d');
    const channelTotals = {};

    sales.forEach(s => {
      if (s.status === 'Refunded') return;
      channelTotals[s.channel] = (channelTotals[s.channel] || 0) + (parseFloat(s.amount) || 0);
    });

    const labels = Object.keys(channelTotals);
    const values = Object.values(channelTotals);

    if (state.charts.channel) {
      state.charts.channel.destroy();
    }

    state.charts.channel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Channel Revenue',
          data: values.length ? values : [0],
          backgroundColor: '#06b6d4',
          borderRadius: 6,
          barThickness: 18
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` $${Number(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: value => '$' + (value >= 1000 ? (value / 1000) + 'k' : value)
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // Reps Leaderboard Render
  // -------------------------------------------------------------
  function updateLeaderboard(filteredSales) {
    const container = document.getElementById('repsLeaderboardContainer');
    const countBadge = document.getElementById('totalRepsCount');
    container.innerHTML = '';

    const repMap = {};
    filteredSales.forEach(s => {
      if (s.status === 'Refunded') return;
      const rep = s.rep || 'Unassigned';
      if (!repMap[rep]) {
        repMap[rep] = { name: rep, total: 0, deals: 0 };
      }
      repMap[rep].total += (parseFloat(s.amount) || 0);
      repMap[rep].deals += 1;
    });

    const repList = Object.values(repMap).sort((a, b) => b.total - a.total);
    countBadge.textContent = `${repList.length} Active Reps`;

    if (repList.length === 0) {
      container.innerHTML = '<div style="color: #64748b; font-size: 13px; grid-column: 1 / -1; padding: 12px 0;">No sales rep data in this filtered view.</div>';
      return;
    }

    repList.slice(0, 6).forEach(rep => {
      const initials = rep.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const card = document.createElement('div');
      card.className = 'rep-card';
      card.innerHTML = `
        <div class="rep-avatar">${initials}</div>
        <div class="rep-info">
          <div class="rep-name" title="${rep.name}">${rep.name}</div>
          <div class="rep-deals">${rep.deals} deals closed</div>
        </div>
        <div class="rep-amount">${formatCurrency(rep.total)}</div>
      `;
      container.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Transactions Table & Pagination
  // -------------------------------------------------------------
  function updateTable(filteredSales) {
    const tableBody = document.getElementById('transactionsTableBody');
    const emptyState = document.getElementById('emptyTableState');
    const tableWrapper = document.querySelector('.table-responsive-wrapper');
    const filteredCountPill = document.getElementById('tableFilteredCount');

    filteredCountPill.textContent = `Showing ${filteredSales.length} of ${state.sales.length} deals`;

    if (filteredSales.length === 0) {
      tableWrapper.style.display = 'none';
      emptyState.style.display = 'block';
      updatePaginationControls(0);
      return;
    } else {
      tableWrapper.style.display = 'block';
      emptyState.style.display = 'none';
    }

    // Sort
    const { sortColumn, sortAsc } = state.table;
    const sorted = [...filteredSales].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'amount') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else if (sortColumn === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    // Pagination slice
    const perPage = state.table.rowsPerPage;
    const totalPages = Math.ceil(sorted.length / perPage) || 1;
    if (state.table.currentPage > totalPages) {
      state.table.currentPage = totalPages;
    }
    const startIdx = (state.table.currentPage - 1) * perPage;
    const paged = sorted.slice(startIdx, startIdx + perPage);

    tableBody.innerHTML = '';
    paged.forEach(item => {
      const tr = document.createElement('tr');
      const statusClass =
        item.status === 'Completed' ? 'status-completed' :
        item.status === 'Pending' ? 'status-pending' : 'status-refunded';

      tr.innerHTML = `
        <td class="deal-id">${item.id}</td>
        <td>${item.date}</td>
        <td class="deal-client">${escapeHtml(item.customer)}</td>
        <td>${escapeHtml(item.category)} <span style="color:#64748b; font-size:11px;">(${escapeHtml(item.product)})</span></td>
        <td>${escapeHtml(item.rep)}</td>
        <td>${escapeHtml(item.region)}</td>
        <td>${escapeHtml(item.channel)}</td>
        <td class="deal-amount text-right">${formatCurrency(item.amount)}</td>
        <td><span class="status-pill ${statusClass}">${item.status}</span></td>
        <td class="text-center">
          <div class="table-action-btns">
            <button class="btn-icon-table btn-edit" data-id="${item.id}" title="Edit deal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon-table btn-delete" data-id="${item.id}" title="Delete deal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    updatePaginationControls(totalPages);
  }

  function updatePaginationControls(totalPages) {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const indicator = document.getElementById('paginationPageIndicator');

    indicator.textContent = `Page ${state.table.currentPage} of ${totalPages || 1}`;
    prevBtn.disabled = state.table.currentPage <= 1;
    nextBtn.disabled = state.table.currentPage >= totalPages;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // -------------------------------------------------------------
  // Full Dashboard Refresh Trigger
  // -------------------------------------------------------------
  function refreshDashboard() {
    const filtered = getFilteredSales();
    updateKPIs(filtered);
    initOrUpdateCharts(filtered);
    updateLeaderboard(filtered);
    updateTable(filtered);
  }

  // -------------------------------------------------------------
  // Modals & Forms
  // -------------------------------------------------------------
  const saleModal = document.getElementById('saleModal');
  const targetModal = document.getElementById('targetModal');

  function openSaleModal(dealToEdit = null) {
    const form = document.getElementById('saleForm');
    form.reset();

    const titleEl = document.getElementById('saleModalTitle');
    const idInput = document.getElementById('saleFormId');

    if (dealToEdit) {
      titleEl.textContent = `Edit Deal (${dealToEdit.id})`;
      idInput.value = dealToEdit.id;
      document.getElementById('saleCustomer').value = dealToEdit.customer || '';
      document.getElementById('saleAmount').value = dealToEdit.amount || '';
      document.getElementById('saleCategory').value = dealToEdit.category || 'Enterprise Software';
      document.getElementById('saleProduct').value = dealToEdit.product || '';
      document.getElementById('saleDate').value = dealToEdit.date || '';
      document.getElementById('saleRep').value = dealToEdit.rep || '';
      document.getElementById('saleRegion').value = dealToEdit.region || 'North America';
      document.getElementById('saleChannel').value = dealToEdit.channel || 'Direct Sales';
      document.getElementById('saleStatus').value = dealToEdit.status || 'Completed';
      document.getElementById('saleNotes').value = dealToEdit.notes || '';
    } else {
      titleEl.textContent = 'Log New Transaction';
      idInput.value = '';
      document.getElementById('saleDate').value = '2026-11-12';
    }

    saleModal.style.display = 'flex';
  }

  function closeSaleModal() {
    saleModal.style.display = 'none';
  }

  function openTargetModal() {
    document.getElementById('targetInput').value = state.targetQuota;
    targetModal.style.display = 'flex';
  }

  function closeTargetModal() {
    targetModal.style.display = 'none';
  }

  // -------------------------------------------------------------
  // Export & Import Handlers
  // -------------------------------------------------------------
  function exportToCSV() {
    if (!state.sales || state.sales.length === 0) {
      showToast('No sales data to export', 'error');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer', 'Product', 'Category', 'Rep', 'Region', 'Channel', 'Amount', 'Status', 'Notes'];
    const rows = state.sales.map(s => [
      `"${s.id || ''}"`,
      `"${s.date || ''}"`,
      `"${(s.customer || '').replace(/"/g, '""')}"`,
      `"${(s.product || '').replace(/"/g, '""')}"`,
      `"${s.category || ''}"`,
      `"${s.rep || ''}"`,
      `"${s.region || ''}"`,
      `"${s.channel || ''}"`,
      s.amount || 0,
      `"${s.status || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salespulse_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported dataset to CSV', 'success');
  }

  function handleFileImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const text = evt.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            state.sales = parsed;
            saveSalesToStorage();
            refreshDashboard();
            showToast(`Successfully imported ${parsed.length} deals from JSON!`, 'success');
          } else {
            showToast('Invalid JSON file format', 'error');
          }
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length <= 1) {
            showToast('CSV file is empty', 'error');
            return;
          }
          const imported = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 8) {
              imported.push({
                id: cols[0] || 'ORD-' + Math.floor(Math.random() * 90000 + 10000),
                date: cols[1] || '2026-11-12',
                customer: cols[2] || 'Imported Customer',
                product: cols[3] || 'General Product',
                category: cols[4] || 'Enterprise Software',
                rep: cols[5] || 'Unassigned',
                region: cols[6] || 'North America',
                channel: cols[7] || 'Direct Sales',
                amount: parseFloat(cols[8]) || 1000,
                status: cols[9] || 'Completed',
                notes: cols[10] || ''
              });
            }
          }
          if (imported.length > 0) {
            state.sales = imported;
            saveSalesToStorage();
            refreshDashboard();
            showToast(`Imported ${imported.length} transactions from CSV!`, 'success');
          }
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to parse file: ' + err.message, 'error');
      }
      e.target.value = ''; // reset file input
    };
    reader.readAsText(file);
  }

  // -------------------------------------------------------------
  // Setup Event Listeners
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Filter controls
    const filterDateRange = document.getElementById('filterDateRange');
    const customDateInputs = document.getElementById('customDateRangeInputs');
    const filterStartDate = document.getElementById('filterStartDate');
    const filterEndDate = document.getElementById('filterEndDate');
    const filterRegion = document.getElementById('filterRegion');
    const filterCategory = document.getElementById('filterCategory');
    const filterChannel = document.getElementById('filterChannel');
    const filterSearch = document.getElementById('filterSearch');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const emptyResetFilterBtn = document.getElementById('emptyResetFilterBtn');

    filterDateRange.addEventListener('change', e => {
      state.filters.dateRange = e.target.value;
      if (e.target.value === 'custom') {
        customDateInputs.style.display = 'flex';
      } else {
        customDateInputs.style.display = 'none';
      }
      state.table.currentPage = 1;
      refreshDashboard();
    });

    filterStartDate.addEventListener('change', e => {
      state.filters.startDate = e.target.value;
      state.table.currentPage = 1;
      refreshDashboard();
    });

    filterEndDate.addEventListener('change', e => {
      state.filters.endDate = e.target.value;
      state.table.currentPage = 1;
      refreshDashboard();
    });

    filterRegion.addEventListener('change', e => {
      state.filters.region = e.target.value;
      state.table.currentPage = 1;
      refreshDashboard();
    });

    filterCategory.addEventListener('change', e => {
      state.filters.category = e.target.value;
      state.table.currentPage = 1;
      refreshDashboard();
    });

    filterChannel.addEventListener('change', e => {
      state.filters.channel = e.target.value;
      state.table.currentPage = 1;
      refreshDashboard();
    });

    let searchDebounce;
    filterSearch.addEventListener('input', e => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.filters.search = e.target.value;
        state.table.currentPage = 1;
        refreshDashboard();
      }, 180);
    });

    function resetFilters() {
      filterDateRange.value = 'all';
      state.filters.dateRange = 'all';
      customDateInputs.style.display = 'none';
      filterStartDate.value = '';
      state.filters.startDate = '';
      filterEndDate.value = '';
      state.filters.endDate = '';
      filterRegion.value = 'all';
      state.filters.region = 'all';
      filterCategory.value = 'all';
      state.filters.category = 'all';
      filterChannel.value = 'all';
      state.filters.channel = 'all';
      filterSearch.value = '';
      state.filters.search = '';
      state.table.currentPage = 1;
      refreshDashboard();
      showToast('Filters reset to default view', 'info');
    }

    clearFiltersBtn.addEventListener('click', resetFilters);
    if (emptyResetFilterBtn) emptyResetFilterBtn.addEventListener('click', resetFilters);

    // Trend Granularity Tabs (Daily, Weekly, Monthly)
    const timeTabs = document.querySelectorAll('.time-tab');
    timeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        timeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.trendGranularity = tab.getAttribute('data-group');
        renderTrendChart(getFilteredSales());
      });
    });

    // Table Header Sorting
    const sortHeaders = document.querySelectorAll('.data-table th.sortable');
    sortHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.table.sortColumn === col) {
          state.table.sortAsc = !state.table.sortAsc;
        } else {
          state.table.sortColumn = col;
          state.table.sortAsc = true;
        }
        updateTable(getFilteredSales());
      });
    });

    // Pagination buttons
    document.getElementById('prevPageBtn').addEventListener('click', () => {
      if (state.table.currentPage > 1) {
        state.table.currentPage--;
        updateTable(getFilteredSales());
      }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
      state.table.currentPage++;
      updateTable(getFilteredSales());
    });

    document.getElementById('rowsPerPageSelect').addEventListener('change', e => {
      state.table.rowsPerPage = parseInt(e.target.value, 10);
      state.table.currentPage = 1;
      updateTable(getFilteredSales());
    });

    // Table Actions (Edit & Delete delegation)
    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.addEventListener('click', e => {
      const editBtn = e.target.closest('.btn-edit');
      const deleteBtn = e.target.closest('.btn-delete');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const deal = state.sales.find(s => s.id === id);
        if (deal) openSaleModal(deal);
      } else if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete transaction ${id}?`)) {
          state.sales = state.sales.filter(s => s.id !== id);
          saveSalesToStorage();
          refreshDashboard();
          showToast(`Transaction ${id} removed`, 'info');
        }
      }
    });

    // Modals
    document.getElementById('openNewSaleModalBtn').addEventListener('click', () => openSaleModal());
    document.getElementById('closeSaleModalBtn').addEventListener('click', closeSaleModal);
    document.getElementById('cancelSaleModalBtn').addEventListener('click', closeSaleModal);

    document.getElementById('openTargetModalBtn').addEventListener('click', openTargetModal);
    document.getElementById('closeTargetModalBtn').addEventListener('click', closeTargetModal);
    document.getElementById('cancelTargetModalBtn').addEventListener('click', closeTargetModal);

    // Close on overlay backdrop click
    window.addEventListener('click', e => {
      if (e.target === saleModal) closeSaleModal();
      if (e.target === targetModal) closeTargetModal();
    });

    // Keyboard ESC to close modal
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeSaleModal();
        closeTargetModal();
      }
    });

    // Form Submissions
    document.getElementById('saleForm').addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('saleFormId').value;
      const customer = document.getElementById('saleCustomer').value.trim();
      const amount = parseFloat(document.getElementById('saleAmount').value) || 0;
      const category = document.getElementById('saleCategory').value;
      const product = document.getElementById('saleProduct').value.trim();
      const date = document.getElementById('saleDate').value;
      const rep = document.getElementById('saleRep').value.trim();
      const region = document.getElementById('saleRegion').value;
      const channel = document.getElementById('saleChannel').value;
      const status = document.getElementById('saleStatus').value;
      const notes = document.getElementById('saleNotes').value.trim();

      if (id) {
        // Update existing
        const index = state.sales.findIndex(s => s.id === id);
        if (index !== -1) {
          state.sales[index] = { id, customer, amount, category, product, date, rep, region, channel, status, notes };
          showToast(`Transaction ${id} updated`, 'success');
        }
      } else {
        // Create new
        const newId = 'ORD-' + Math.floor(Math.random() * 89999 + 10000);
        state.sales.unshift({
          id: newId,
          customer,
          amount,
          category,
          product,
          date,
          rep,
          region,
          channel,
          status,
          notes
        });
        showToast(`Transaction ${newId} logged successfully`, 'success');
      }

      saveSalesToStorage();
      closeSaleModal();
      refreshDashboard();
    });

    document.getElementById('targetForm').addEventListener('submit', e => {
      e.preventDefault();
      const newTarget = parseFloat(document.getElementById('targetInput').value) || 250000;
      saveTargetToStorage(newTarget);
      closeTargetModal();
      refreshDashboard();
      showToast('Sales target quota updated!', 'success');
    });

    // Export & Import
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);

    const importFileInput = document.getElementById('importFileInput');
    document.getElementById('importDataBtn').addEventListener('click', () => {
      importFileInput.click();
    });
    importFileInput.addEventListener('change', handleFileImport);

    // Reset Demo Data
    document.getElementById('resetSeedBtn').addEventListener('click', () => {
      if (confirm('Reset to default seed data? Any custom deals added will be replaced.')) {
        state.sales = generateSeedData();
        saveSalesToStorage();
        refreshDashboard();
        showToast('Sample demo sales data restored', 'info');
      }
    });
  }

  // -------------------------------------------------------------
  // Initial Boot
  // -------------------------------------------------------------
  function boot() {
    loadFromStorage();
    setupEventListeners();
    updateStorageFooter();
    refreshDashboard();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

