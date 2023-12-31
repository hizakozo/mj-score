import Date = GoogleAppsScript.Base.Date;

export class ArchiveSheet {
    constructor(
        readonly activeSheet: GoogleAppsScript.Spreadsheet.Spreadsheet
    ) {
    }

    run() {
       const now = new Date()
        console.log(now)
        const nowDateTime = `scores-${now.getFullYear()}/${now.getMonth()}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        const currentScores = this.activeSheet.getSheetByName("scores-current")
        const copiedSheet = currentScores.copyTo(this.activeSheet)
        copiedSheet.setName(nowDateTime)
        copiedSheet.activate()
        this.activeSheet.moveActiveSheet(2)
        currentScores.getRange("a3:d100").clear()
    }
}