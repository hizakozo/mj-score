import {Game, GameDate, GameRepository} from "../domain/Game";
import Date = GoogleAppsScript.Base.Date;
import {Score, Scores} from "../domain/Score";
import {PlayerRepository} from "../domain/Player";

export class GameUseCase {
    constructor(
        readonly gameRepository: GameRepository,
        readonly playerRepository: PlayerRepository
    ) {
    }

    saveGame(input: SaveGameInput) {
        const now = new Date()
        const existGames = this.gameRepository.fetchByDateExcludeScore(now)

        const scores = new Scores(
            input.scores.map(s => {
                const nickName = s.nickName
                const rank = this.getRank(input.scores.map(s => s.score), s.score)
                return Score.create({nickName, score: s.score, rank})
            })
        )
        const currentIndex = existGames.getCurrentIndex()
        const gameIndex = currentIndex > 0 ? currentIndex + 1 : 1
        const newGame = Game.create({
            gameDate: now,
            gameIndex,
            scores
        })

        this.gameRepository.save(newGame)
    }

    getTodayTotal(): GetTodayTotalOutput {
        const games = this.gameRepository.fetchByDate(new Date())
        const flatScores = games.values.map(g => g.scores.values).reduce((acc, curr) => {
            return acc.concat(curr)
        }, [])
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

    private getRank(numbers: number[], currentNumber: number): number | null  {
        const uniqueSortedNumbers = numbers.sort((a, b) => b - a);
        const rank = uniqueSortedNumbers.indexOf(currentNumber);
        return rank !== -1 ? rank + 1 : null;
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