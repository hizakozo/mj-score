import {Scores} from "./Score";
import Date = GoogleAppsScript.Base.Date;

export class Game {
    constructor(
        readonly gameId: string,
        readonly gameDate: Date,
        readonly gameIndex: number,
        readonly scores: Scores
    ) {
    }

    static create(props: { gameDate: Date, gameIndex: number, scores: Scores }) {
        const {gameDate, gameIndex, scores} = props
        const gameId = Utilities.getUuid()
        return new Game(
            gameId, gameDate, gameIndex, scores
        )
    }
}

export class GameDate {
    readonly value: string
    constructor(readonly d: Date) {
        this.value = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`.replace(/\n|\r/g, '')
    }
}

export class Games {
    constructor(
        readonly values: Game[]
    ) {
    }
    getCurrentIndex(): number {
        const indexList = this.values.map(v => v.gameIndex)
        return Math.max(...indexList)
    }
}

export interface GameRepository {
    save(game: Game): void

    fetchByDate(date: Date): Games
    fetchByDateExcludeScore(date: Date): Games

}