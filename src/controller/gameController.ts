import {SaveGameInput, GameUseCase} from "../usecase/GameUseCase";

export class GameController {
    constructor(
        readonly useCase: GameUseCase
    ) {
    }

    save(messageText: string) {
        return this.useCase.saveGame(messageText).replace(/\s+/g, '') + "\nを登録しました。"
    }
    getTodayTotal() {
        const output = this.useCase.getTodayTotal()
        const sortByScore = output.values.sort((a, b) => b.totalScore - a.totalScore)
        return sortByScore.reduce((acc, curr) => {
            return `${acc}\n${curr.nickName}: ${Math.floor(curr.totalScore * 10) / 10}`
        }, "🀄合計🀄️")
    }

    saveLatestRecord() {
        try {
            const record = this.useCase.saveLatestRecord()
            return record.replace(/\s+/g, '') + "\nを登録しました。"
        } catch (e) {
            return e.message
        }
    }

    saveBonus({userName, bonus}: {userName: string, bonus: number}) {
        try {
            return this.useCase.saveBonus(userName, bonus)
        } catch (e) {
            return e.message
        }
    }
}
