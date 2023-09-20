import Date = GoogleAppsScript.Base.Date;

export class GetTodayTotal {
    constructor(
        readonly activeSheet: GoogleAppsScript.Spreadsheet.Spreadsheet
    ) {
    }

    run() {
        const currentScores = this.activeSheet.getSheetByName("scores-current")
        const max = currentScores.getRange("b2").getValue()
        const take = currentScores.getRange("c2").getValue()
        const littleTooth = currentScores.getRange("d2").getValue()
        return `明石: ${this.truncation(max)}\n竹内: ${this.truncation(take)}\n安居: ${this.truncation(littleTooth)}`
    }
    truncation(score) {
        return score.toFixed(1)
    }
}