/**
 * AI Restaurant Phone Operator Dashboard
 * Real-time analytics and control panel
 */

// Configuration
const CONFIG = {
    apiUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:5678/webhook/analytics'
        : '/webhook/analytics',
    refreshInterval: 30000, // 30 seconds
    chartColors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        background: 'rgba(59, 130, 246, 0.1)',
        grid: 'rgba(255, 255, 255, 0.05)'
    }
};

// State
let state = {
    analytics: null,
    dateRange: 'today',
    aiEnabled: true
};

// DOM Elements
const elements = {
    totalCalls: document.getElementById('total-calls'),
    aiCalls: document.getElementById('ai-calls'),
    ordersCount: document.getElementById('orders-count'),
    revenue: document.getElementById('revenue'),
    avgDuration: document.getElementById('avg-duration'),
    aiRate: document.getElementById('ai-rate'),
    handoffRate: document.getElementById('handoff-rate'),
    conversionRate: document.getElementById('conversion-rate'),
    recentCallsList: document.getElementById('recent-calls-list'),
    peakHoursGrid: document.getElementById('peak-hours-grid'),
    aiToggle: document.getElementById('ai-toggle-switch'),
    aiStatus: document.getElementById('ai-status')
};

// Charts
let callsChart = null;
let distributionChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    initializeEventListeners();
    loadAnalytics();
    generatePeakHoursGrid();
    
    // Auto-refresh
    setInterval(loadAnalytics, CONFIG.refreshInterval);
});

/**
 * Initialize Chart.js charts
 */
function initializeCharts() {
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: CONFIG.chartColors.grid
                },
                ticks: {
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    color: CONFIG.chartColors.grid
                },
                ticks: {
                    color: '#64748b'
                }
            }
        }
    };

    // Calls Chart
    const callsCtx = document.getElementById('calls-canvas');
    if (callsCtx) {
        callsChart = new Chart(callsCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'AI Handled',
                        data: [12, 19, 15, 17, 22, 25, 18],
                        backgroundColor: CONFIG.chartColors.primary,
                        borderRadius: 6,
                        borderSkipped: false
                    },
                    {
                        label: 'Staff Handled',
                        data: [3, 2, 4, 3, 5, 4, 3],
                        backgroundColor: CONFIG.chartColors.secondary,
                        borderRadius: 6,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a2234',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        borderColor: '#2d3a4f',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12
                    }
                }
            }
        });
    }

    // Distribution Chart
    const distributionCtx = document.getElementById('distribution-canvas');
    if (distributionCtx) {
        distributionChart = new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['AI Completed', 'AI Transferred', 'Staff Direct'],
                datasets: [{
                    data: [72, 13, 15],
                    backgroundColor: [
                        CONFIG.chartColors.success,
                        CONFIG.chartColors.warning,
                        CONFIG.chartColors.secondary
                    ],
                    borderWidth: 0,
                    spacing: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a2234',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        borderColor: '#2d3a4f',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12
                    }
                }
            }
        });
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Date filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.dateRange = e.target.dataset.range;
            loadAnalytics();
        });
    });

    // AI Toggle
    if (elements.aiToggle) {
        elements.aiToggle.addEventListener('change', async (e) => {
            state.aiEnabled = e.target.checked;
            await toggleAI(state.aiEnabled);
            updateAIStatus();
        });
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // Could implement section switching here
        });
    });
}

/**
 * Load analytics data from API
 */
async function loadAnalytics() {
    try {
        // For demo, use mock data
        // In production, uncomment the fetch:
        // const response = await fetch(`${CONFIG.apiUrl}?range=${state.dateRange}`);
        // const data = await response.json();
        
        // Mock data for demo
        const data = getMockData();
        state.analytics = data;
        updateDashboard(data);
    } catch (error) {
        console.error('Failed to load analytics:', error);
        // Show mock data anyway for demo
        const mockData = getMockData();
        updateDashboard(mockData);
    }
}

/**
 * Update dashboard with analytics data
 */
function updateDashboard(data) {
    // Update stat cards with animation
    animateValue(elements.totalCalls, data.summary.totalCalls);
    animateValue(elements.aiCalls, data.summary.aiHandledCalls);
    animateValue(elements.ordersCount, data.orders.aiOrders);
    
    if (elements.revenue) {
        elements.revenue.textContent = `$${parseFloat(data.orders.aiRevenue).toLocaleString()}`;
    }

    // Update metrics
    if (elements.avgDuration) {
        elements.avgDuration.textContent = `${data.performance.avgCallDuration} sec`;
    }
    if (elements.aiRate) {
        elements.aiRate.textContent = `${data.summary.aiHandleRate}%`;
    }
    if (elements.handoffRate) {
        elements.handoffRate.textContent = `${data.summary.handoffRate}%`;
    }
    if (elements.conversionRate) {
        const conversionRate = data.summary.aiHandledCalls > 0 
            ? ((data.orders.aiOrders / data.summary.aiHandledCalls) * 100).toFixed(1)
            : 0;
        elements.conversionRate.textContent = `${conversionRate}%`;
    }

    // Update charts
    updateCharts(data);
}

/**
 * Animate number value
 */
function animateValue(element, value) {
    if (!element) return;
    
    const duration = 1000;
    const start = parseInt(element.textContent) || 0;
    const end = parseInt(value);
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const current = Math.round(start + range * easeProgress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Update charts with new data
 */
function updateCharts(data) {
    if (callsChart && data.patterns.dailyDistribution) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const aiData = days.map(day => {
            const total = data.patterns.dailyDistribution[day] || 0;
            return Math.round(total * 0.85); // 85% AI
        });
        const staffData = days.map(day => {
            const total = data.patterns.dailyDistribution[day] || 0;
            return Math.round(total * 0.15); // 15% Staff
        });

        callsChart.data.datasets[0].data = aiData;
        callsChart.data.datasets[1].data = staffData;
        callsChart.update('none');
    }

    if (distributionChart) {
        const completed = data.summary.aiHandledCalls - data.summary.transferredCalls;
        const transferred = data.summary.transferredCalls;
        const staff = data.summary.staffHandledCalls;

        distributionChart.data.datasets[0].data = [completed, transferred, staff];
        distributionChart.update('none');
    }
}

/**
 * Generate peak hours grid
 */
function generatePeakHoursGrid() {
    if (!elements.peakHoursGrid) return;
    
    elements.peakHoursGrid.innerHTML = '';
    
    // Hours from 9am to 10pm
    const hours = [];
    for (let i = 9; i <= 22; i++) {
        hours.push(i);
    }

    // Mock intensity data
    const intensityData = {
        9: 'low', 10: 'low', 11: 'medium', 12: 'peak', 13: 'high',
        14: 'medium', 15: 'low', 16: 'low', 17: 'medium', 18: 'high',
        19: 'peak', 20: 'high', 21: 'medium', 22: 'low'
    };

    hours.forEach(hour => {
        const cell = document.createElement('div');
        cell.className = `hour-cell ${intensityData[hour] || 'low'}`;
        cell.textContent = hour > 12 ? `${hour - 12}p` : `${hour}a`;
        cell.title = `${hour}:00 - ${getIntensityLabel(intensityData[hour])} traffic`;
        elements.peakHoursGrid.appendChild(cell);
    });
}

/**
 * Get intensity label
 */
function getIntensityLabel(intensity) {
    const labels = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        peak: 'Peak'
    };
    return labels[intensity] || 'Unknown';
}

/**
 * Toggle AI on/off
 */
async function toggleAI(enabled) {
    try {
        // In production, call the API:
        // await fetch('/webhook/toggle-ai', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: enabled ? 'ON' : 'OFF' })
        // });
        
        console.log(`AI ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
        console.error('Failed to toggle AI:', error);
    }
}

/**
 * Update AI status indicator
 */
function updateAIStatus() {
    if (!elements.aiStatus) return;
    
    const dot = elements.aiStatus.querySelector('.status-dot');
    const text = elements.aiStatus.querySelector('.status-text');
    
    if (state.aiEnabled) {
        elements.aiStatus.style.background = 'rgba(16, 185, 129, 0.1)';
        elements.aiStatus.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        if (dot) dot.style.background = '#10b981';
        if (text) {
            text.textContent = 'AI Active';
            text.style.color = '#10b981';
        }
    } else {
        elements.aiStatus.style.background = 'rgba(239, 68, 68, 0.1)';
        elements.aiStatus.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        if (dot) dot.style.background = '#ef4444';
        if (text) {
            text.textContent = 'AI Paused';
            text.style.color = '#ef4444';
        }
    }
}

/**
 * Get mock data for demo
 */
function getMockData() {
    return {
        summary: {
            totalCalls: 147,
            aiHandledCalls: 125,
            staffHandledCalls: 22,
            transferredCalls: 18,
            handoffRate: '14.4',
            aiHandleRate: '85.0'
        },
        orders: {
            totalOrders: 98,
            aiOrders: 82,
            totalRevenue: '3245.50',
            aiRevenue: '2756.25',
            revenueRecovered: '2756.25'
        },
        performance: {
            avgCallDuration: '142',
            totalCost: '11.76',
            costPerCall: '0.08',
            costPerOrder: '0.14'
        },
        patterns: {
            peakHour: '12:00',
            peakHourCalls: 23,
            busiestDay: 'Friday',
            busiestDayCalls: 34,
            hourlyDistribution: {
                9: 5, 10: 8, 11: 12, 12: 23, 13: 18,
                14: 10, 15: 8, 16: 9, 17: 15, 18: 21,
                19: 25, 20: 18, 21: 12, 22: 5
            },
            dailyDistribution: {
                'Monday': 18,
                'Tuesday': 21,
                'Wednesday': 19,
                'Thursday': 20,
                'Friday': 34,
                'Saturday': 29,
                'Sunday': 22
            }
        },
        handoffs: {
            total: 18,
            reasons: {
                'Allergy inquiry': 5,
                'Complex customization': 4,
                'Customer requested': 6,
                'Multiple clarifications': 3
            }
        },
        today: {
            calls: 23,
            aiCalls: 20,
            orders: 15,
            revenue: '412.50'
        },
        generatedAt: new Date().toISOString()
    };
}

/**
 * Format phone number
 */
function formatPhone(phone) {
    if (!phone) return 'Unknown';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
}

/**
 * Format time ago
 */
function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}
