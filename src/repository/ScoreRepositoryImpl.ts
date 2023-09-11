import {Score, ScoreRepository, Scores} from "../domain/Score";
import {SpreadSheetDriver} from "../driver/SpreadSheetDriver";

export class ScoreRepositoryImpl implements ScoreRepository {
    constructor(
        readonly driver: SpreadSheetDriver
    ) {
    }
    fetchLatestThree(): Scores {
        const record = this.driver.fetchLatestThree()
        return new Scores(
            record.map(r => new Score(r.nick_name, r.score, r.rank))
        )
    }
}