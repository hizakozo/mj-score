import {Game, GameDate, GameRepository, Games} from "../domain/Game";
import Date = GoogleAppsScript.Base.Date;
import {Score, Scores} from "../domain/Score";
import {PlayerRepository} from "../domain/Player";
import {HttpDriver} from "../driver/HttpDriver";
import {SpreadSheetDriver} from "../driver/SpreadSheetDriver";

export class GameUseCase {
    constructor(
        readonly gameRepository: GameRepository,
        readonly playerRepository: PlayerRepository,
        readonly httpDriver: HttpDriver,
        readonly spreadSheetDriver: SpreadSheetDriver
    ) {
    }
    saveGame(message: string) {
        return this.saveRecord(message)
    }

    getTodayTotal(): GetTodayTotalOutput {
        const games = this.gameRepository.fetchByDate(new Date())
        const flatScores = this.generateFlatScores(games)
        const nickNames = flatScores
            .map(s => s.nickName)
            .reduce((acc, curr) => acc.indexOf(curr) !== -1 ? acc : [...acc, curr], [] as string[])
        const groupByNickName: GetTodayTotalOutput["values"] = nickNames.map(name => {
            return {
                nickName: name,
                totalScore: flatScores.filter(s => s.nickName === name).reduce((acc, curr) => {
                    return acc + curr.score
                }, 0),
            }
        })
        return {
            values: groupByNickName
        }
    }

    private generateFlatScores(games: Games) {
        return games.values.map(g => g.scores.values).reduce((acc, curr) => {
            return acc.concat(curr)
        }, [])
    }

    saveLatestRecord(): string {
        const record = this.httpDriver.getLatestRecord()
        return this.saveRecord(record)
    }

    saveBonus(userName: string, bonus: number): string {
        const userNames = ["明石", "竹内", "安居"]
        if (userNames.filter(u => u === userName).length === 0) {
            throw Error(`not found active user -> [${userName}]`)
        }
        const saveRecordProps = {
            max: userName === userNames[0] ? bonus : -(bonus / 2),
            take: userName === userNames[1] ? bonus : -(bonus / 2),
            littleTooth: userName === userNames[2] ? bonus : -(bonus / 2),
        }
        if (saveRecordProps.max + saveRecordProps.take + saveRecordProps.littleTooth !== 0) {
            throw Error("invalid saving score")
        }
        this.spreadSheetDriver.saveLatestRecord(saveRecordProps)
        return `${userName}に${bonus}点追加その他プレーヤーは${-(bonus / 2)}`
    }

    private saveRecord(message: string) {
        const input = this.parseMessage(message)
        const saveRecordProps: SaveRecordProps = {
            max: input.scores.filter(s => s.nickName === "MAX")[0].score,
            take: input.scores.filter(s => s.nickName === "タケウチ")[0].score,
            littleTooth: input.scores.filter(s => s.nickName === "little.tooth")[0].score
        }
        this.spreadSheetDriver.saveLatestRecord(saveRecordProps)
        return message
    }

    private getRank(numbers: number[], currentNumber: number): number | null  {
        const uniqueSortedNumbers = numbers.sort((a, b) => b - a);
        const rank = uniqueSortedNumbers.indexOf(currentNumber);
        return rank !== -1 ? rank + 1 : null;
    }
    private parseMessage (message: string): SaveGameInput {
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
}

export type SaveGameInput = {
    scores: {
        nickName: string, score: number
    }[]
}

export type GetTodayTotalOutput = {
    values: {nickName: string, totalScore: number}[]
}

type SaveRecordProps = {
    max: number,
    take: number,
    littleTooth: number
}