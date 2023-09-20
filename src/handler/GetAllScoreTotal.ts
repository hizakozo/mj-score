

export class GetAllScoreTotal {
    constructor(
        readonly activeSheet: GoogleAppsScript.Spreadsheet.Spreadsheet
    ) {
    }

    run() {
        const total = this.activeSheet.getSheets()
            .filter(sheet => /^scores-/.test(sheet.getName()))
            .map(sheet => sheet.getRange("b2:d2").getValues()
                .reduce((acc, currentArray) => {
                return acc.concat(currentArray);
            }, []))
            .reduce<number[]>((acc, curr) => {
                acc[0] += Number(curr[0])
                acc[1] += Number(curr[1])
                acc[2] += Number(curr[2])
                return acc
            }, [0, 0, 0])
            .map(score => score.toFixed(1))
        return `明石: ${total[0]}\n竹内: ${total[1]}\n安居: ${total[2]}`
    }

    truncation(score) {
        return score.toFixed(1)
    }
}