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
        const input = this.parseMessage(message)
        this.saveRecord(input)
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
        const input = this.parseMessage(record)
        const saveRecordProps: SaveRecordProps = {
            max: input.scores.filter(s => s.nickName === "MAX")[0].score,
            take: input.scores.filter(s => s.nickName === "タケウチ")[0].score,
            littleTooth: input.scores.filter(s => s.nickName === "little.tooth")[0].score
        }
        this.spreadSheetDriver.saveLatestRecord(saveRecordProps)
        return record
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

    private saveRecord(input: SaveGameInput) {
        const now = new Date()
        const existGames = this.gameRepository.fetchByDate(now)
        const newScores = new Scores(
            input.scores.map(s => {
                const nickName = s.nickName
                const rank = this.getRank(input.scores.map(s => s.score), s.score)
                return Score.create({nickName, score: s.score, rank})
            })
        )
        const latest3Scores = this.generateFlatScores(existGames).slice(-3)
        if (JSON.stringify(latest3Scores) === JSON.stringify(newScores.values)) {
            throw Error("すでに登録されている記録です")
        }
        console.log("huga")
        const currentIndex = existGames.getCurrentIndex()
        const gameIndex = currentIndex > 0 ? currentIndex + 1 : 1
        const newGame = Game.create({
            gameDate: now,
            gameIndex,
            scores: newScores,
        })

        this.gameRepository.save(newGame)
    }
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