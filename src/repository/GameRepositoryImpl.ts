import {SpreadSheetDriver} from "../driver/SpreadSheetDriver";
import {Game, GameDate, GameRepository, Games} from "../domain/Game";
import Date = GoogleAppsScript.Base.Date;
import {Score, Scores} from "../domain/Score";

export class GameRepositoryImpl implements GameRepository {
    constructor(
        readonly driver: SpreadSheetDriver
    ) {
    }

    save(game: Game) {
        this.driver.saveGame(game.gameId, game.gameDate, game.gameIndex)
        game.scores.values.forEach(score => {
            this.driver.saveScore(game.gameId, score.nickName, score.score, score.rank)
        })
    }

    fetchByDate(date: Date): Games {
        const record = this.driver.fetchGameByDate(date)
        const scoreRecord = this.driver.fetchScore()
        return new Games(
            record.map(gameRecord => {
                const scores = new Scores(
                    scoreRecord.filter(scoreRecord => scoreRecord.game_id === gameRecord.game_id).map(score => new Score(score.nick_name, score.score, score.rank))
                )
                return new Game(gameRecord.game_id, gameRecord.game_date, Number(gameRecord.game_index), scores)
            })
        )
    }

    fetchByDateExcludeScore(date: GoogleAppsScript.Base.Date): Games {
        const record = this.driver.fetchGameByDate(date)
        return new Games(
            record.map(r => {
                return new Game(r.game_id, r.game_date, Number(r.game_index), new Scores([]))
            })
        )
    }
}