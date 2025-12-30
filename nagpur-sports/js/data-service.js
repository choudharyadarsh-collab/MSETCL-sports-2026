export const SHEETS = {
    SCORE_BOARD: '1719191483',
    CRICKET_SCHEDULE: '1565830279',
    CRICKET_POINTS: '624952584',
    VOLLEYBALL: '330259369',
    KABADDI: '180658788',
    BADMINTON: '1018557780',
    TABLE_TENNIS: '450162264',
    CARROM: '1466149527',
    CHESS: '1192893137',
    BRIDGE: '1345638615',
    ATHLETICS_MEN: '894189262',
    ATHLETICS_WOMEN: '1510286110',
    KUSHTI: '1486606867'
};

export class SheetService {
    constructor() {
        this.sheetId = '2PACX-1vQQEZTGjHIBUb16iior25AabwLUIsKr-g8kA7OkFrmNEnBfsASKxZC3o2iMoqX_1Upyp94ftfIgggMH';
        this.baseUrl = `https://docs.google.com/spreadsheets/d/e/${this.sheetId}/pub?output=csv`;
    }

    async fetchSheet(gid) {
        try {
            const url = `${this.baseUrl}&gid=${gid}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.text();
            return this.parseCSV(data);
        } catch (error) {
            console.error(`Error fetching sheet ${gid}:`, error);
            return [];
        }
    }

    /*
     * Generic CSV Parser
     * Handles robust CSV parsing including quoted strings
     */
    parseCSV(csvText) {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuote = false;

        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];

            if (char === '"') {
                if (insideQuote && nextChar === '"') {
                    // Escaped quote
                    currentCell += '"';
                    i++;
                } else {
                    // Toggle quote
                    insideQuote = !insideQuote;
                }
            } else if (char === ',' && !insideQuote) {
                // End of cell
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if ((char === '\r' || char === '\n') && !insideQuote) {
                // End of row
                if (char === '\r' && nextChar === '\n') i++;
                if (currentCell || currentRow.length > 0) {
                    currentRow.push(currentCell.trim());
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        // Push last row if exists
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
        }
        return rows;
    }
}
