// ============================================
// CHART HELPERS — Chart.js wrappers
// ============================================

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function getComputedColor(prop) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim() || '#6366F1';
}

export function createBarChart(canvas, labels, data, label = 'Participation') {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#6366F1');
    gradient.addColorStop(1, '#818CF8');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label,
                data,
                backgroundColor: gradient,
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 28,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A1D2E',
                    titleColor: '#fff',
                    bodyColor: '#B0B8C9',
                    cornerRadius: 8,
                    padding: 12,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: getComputedColor('--text-muted'),
                        font: { size: 11, family: 'Inter' }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: getComputedColor('--border-primary'),
                        drawBorder: false,
                    },
                    ticks: {
                        color: getComputedColor('--text-muted'),
                        font: { size: 11, family: 'Inter' }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

export function createLineChart(canvas, labels, data, label = 'Growth') {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label,
                data,
                borderColor: '#6366F1',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366F1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A1D2E',
                    titleColor: '#fff',
                    bodyColor: '#B0B8C9',
                    cornerRadius: 8,
                    padding: 12,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: getComputedColor('--text-muted'),
                        font: { size: 11, family: 'Inter' }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: getComputedColor('--border-primary'),
                        drawBorder: false,
                    },
                    ticks: {
                        color: getComputedColor('--text-muted'),
                        font: { size: 11, family: 'Inter' }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

export function createDoughnutChart(canvas, labels, data, colors) {
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors || ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
                borderWidth: 0,
                cutout: '75%',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A1D2E',
                    titleColor: '#fff',
                    bodyColor: '#B0B8C9',
                    cornerRadius: 8,
                    padding: 12,
                }
            }
        }
    });
}

export function createSmallBarChart(canvas, labels, data) {
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: '#818CF8',
                borderRadius: 4,
                borderSkipped: false,
                barThickness: 18,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { display: false },
                    border: { display: false }
                },
                y: {
                    grid: { display: false },
                    ticks: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}
