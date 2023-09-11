import {SaveGameInput, GameUseCase} from "../usecase/GameUseCase";

export class GameController {
    constructor(
        readonly useCase: GameUseCase
    ) {
    }

    save(messageText: string) {
        const input: SaveGameInput = parseMessage(messageText)
        this.useCase.saveGame(input)
    }
    getTodayTotal() {
        const output = this.useCase.getTodayTotal()
        const sortByScore = output.values.sort((a, b) => b.totalScore - a.totalScore)
        return sortByScore.reduce((acc, curr) => {
            return `${acc}\n${curr.nickName}: ${Math.floor(curr.totalScore * 10) / 10}`
        }, "🀄合計🀄️")
    }

    saveLatestRecord() {
        const text = this.useCase.getLatestRecord()
        const replace = text.replace(/<\/?span[^>]*>/g, '');
        const input: SaveGameInput = parseMessage(replace)
        try {
            this.useCase.saveGame(input)
        } catch (e) {
            return e.message
        }
        return replace.replace(/\s+/g, '') + "\nを登録しました。"
    }
}

const parseMessage = (message: string): SaveGameInput => {
    const replacedMessage = message.replace(/\s+/g, '')
    const scorePattern = /『(.*?)』\(([-+]?[\d.]+)\)/g;
    const scores: SaveGameInput["scores"] = [];

    let match: RegExpExecArray | null;
    while (match = scorePattern.exec(replacedMessage)) {
        scores.push({
            nickName: match[1],
            score: parseFloat(match[2])
        });
    }

    return { scores };
};