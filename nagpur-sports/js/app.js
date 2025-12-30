import { SheetService, SHEETS } from './data-service.js';

class App {
    constructor() {
        this.dataService = new SheetService();
        this.init();
    }

    async init() {
        this.startCountdown();
        this.setupEventListeners();
        await this.loadSportsData();
    }

    startCountdown() {
        // Setting strictly to Jan 7 2026
        const eventDate = new Date('2026-01-07T09:00:00').getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = eventDate - now;

            if (distance < 0) {
                document.querySelector('.countdown-container').innerHTML = '<h3>EVENT STARTED</h3>';
                return;
            }

            document.getElementById('days').innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            document.getElementById('hours').innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            document.getElementById('minutes').innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        };

        setInterval(updateTimer, 60000);
        updateTimer();
    }

    async loadSportsData() {
        const container = document.getElementById('sports-grid');
        container.innerHTML = '<div class="loading-state">Fetching Live Data...</div>';

        // Fetch Main Score Board for Overview
        try {
            const scoreBoardData = await this.dataService.fetchSheet(SHEETS.SCORE_BOARD);
            this.renderTable(scoreBoardData, 'main-scoreboard-container');
        } catch (e) {
            console.error("Failed to load main scoreboard", e);
        }

        // Define icons for sports
        const icons = {
            'Cricket': '🏏',
            'Football': '⚽',
            'Volleyball': '🏐',
            'Badminton': '🏸',
            'Chess': '♟️',
            'Athletics': '🏃',
            'Table Tennis': '🏓',
            'Carrom': '🎯',
            'Wrestling': '🤼',
            'Kabaddi': '🤼',
            'Bridge': '🃏'
        };

        // For now, render the static list of sports enabled in the sheets + the main scoreboard
        const sports = [
            { name: 'Cricket', id: 'CRICKET_SCHEDULE', icon: icons.Cricket },
            { name: 'Volleyball', id: 'VOLLEYBALL', icon: icons.Volleyball },
            { name: 'Kabaddi', id: 'KABADDI', icon: icons.Kabaddi },
            { name: 'Badminton', id: 'BADMINTON', icon: icons.Badminton },
            { name: 'Table Tennis', id: 'TABLE_TENNIS', icon: icons['Table Tennis'] },
            { name: 'Carrom', id: 'CARROM', icon: icons.Carrom },
            { name: 'Chess', id: 'CHESS', icon: icons.Chess },
            { name: 'Bridge', id: 'BRIDGE', icon: icons.Bridge },
            { name: 'Athletics (M)', id: 'ATHLETICS_MEN', icon: icons.Athletics },
            { name: 'Kushti', id: 'KUSHTI', icon: icons.Wrestling }
        ];

        this.renderSportsGrid(sports);
        this.populateSportSelect(sports);
    }

    renderSportsGrid(sports) {
        const container = document.getElementById('sports-grid');
        container.innerHTML = sports.map(sport => `
            <div class="sport-card" onclick="window.app.loadSportDetails('${sport.id}')">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${sport.icon}</div>
                <h3>${sport.name}</h3>
                <p class="text-accent" style="font-size: 0.8rem; margin-top: 0.5rem;">VIEW LIVE SCORES</p>
            </div>
        `).join('');
    }

    populateSportSelect(sports) {
        const select = document.getElementById('sport-select');
        select.innerHTML = '<option value="all">Select Sport...</option>' +
            sports.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        select.addEventListener('change', (e) => {
            if (e.target.value !== 'all') this.loadSportDetails(e.target.value);
        });
    }

    async loadSportDetails(sheetKey) {
        const container = document.getElementById('data-container');
        container.innerHTML = '<div class="loading-state">Loading Match Data...</div>';

        // Scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

        const gid = SHEETS[sheetKey];
        if (!gid) return;

        const data = await this.dataService.fetchSheet(gid);
        this.renderTable(data);
    }

    renderTable(data, containerId = 'data-container') {
        const container = document.getElementById(containerId);
        if (!data || data.length < 2) {
            container.innerHTML = '<p style="text-align:center; padding: 2rem;">No data available yet.</p>';
            return;
        }

        const headers = data[0]; // First row as header
        const rows = data.slice(1);

        let html = '<div class="table-wrapper"><table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';

        rows.forEach(row => {
            // Skip empty rows
            if (row.length === 0 || row.every(cell => cell.trim() === '')) return;

            html += '<tr>';
            row.forEach(cell => html += `<td>${cell}</td>`);
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    setupEventListeners() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
}

// Make app global for inline onclick handlers
window.app = null;
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
