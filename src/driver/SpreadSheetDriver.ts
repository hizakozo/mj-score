import Date = GoogleAppsScript.Base.Date;

export class SpreadSheetDriver {
    constructor(
        readonly activeSheet: GoogleAppsScript.Spreadsheet.Spreadsheet
    ) {
    }

    saveGame(gameId: string, gameDate: Date, index: number) {
        const sheet = this.activeSheet.getSheetByName("game")
        const targetRow = sheet.getLastRow() + 1
        const idCell = sheet.getRange(`a${targetRow}`)
        const dateCell = sheet.getRange(`b${targetRow}`)
        const indexCell = sheet.getRange(`c${targetRow}`)
        idCell.setValue(gameId)
        dateCell.setValue(gameDate)
        indexCell.setValue(index)
    }

    saveScore(gameId: string, nickName: string, score: number, rank: number) {
        const sheet = this.activeSheet.getSheetByName("score")
        const targetRow = sheet.getLastRow() + 1
        const gameIdCell = sheet.getRange(`a${targetRow}`)
        const nickNameCell = sheet.getRange(`b${targetRow}`)
        const scoreCell = sheet.getRange(`c${targetRow}`)
        const rankCell = sheet.getRange(`d${targetRow}`)
        gameIdCell.setValue(gameId)
        nickNameCell.setValue(nickName)
        scoreCell.setValue(score)
        rankCell.setValue(rank)
    }

    fetchGameByDate(targetDate: Date): GameRecord[] {
        const sheet = this.activeSheet.getSheetByName("game")
        const values = sheet.getRange(`a2:c${sheet.getLastRow()}`).getValues()
        if (values.length === 0) return []
        return values.map(v => {
            return {
                game_id: v[0], game_date: v[1], game_index: v[2]
            }
        })
            .filter((v: GameRecord) => {
                const date = v.game_date
                if (Object.prototype.toString.call(date) !== "[object Date]") return false
                return date.getFullYear() === targetDate.getFullYear() && date.getMonth() === targetDate.getMonth() && date.getDate() === targetDate.getDate()
            })
    }

    fetchScore(): ScoreRecord[] {
        const sheet = this.activeSheet.getSheetByName("score")
        const values = sheet.getRange(`a2:d${sheet.getLastRow()}`).getValues()
        if (values.length === 0) return []
        return values.map(v => {
            return {
                game_id: v[0],
                nick_name: v[1],
                score: v[2],
                rank: v[3]
            }
        })
    }
}

type GameRecord = {
    game_id: string, game_date: Date, game_index: string
}

type ScoreRecord = {
    game_id: string, nick_name: string, score: number, rank: number
}