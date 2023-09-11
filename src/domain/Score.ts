import {FCC} from "./Fcc";

export class Score {
    constructor(
        readonly nickName: string,
        readonly score: number,
        readonly rank: number
    ) {
    }

    static create(props: { nickName: string, score: number, rank: number }) {
        return new Score(
            props.nickName, props.score, props.rank
        )
    }
}

export class Scores {
    constructor(readonly values: Score[]) {
    }
}

export interface ScoreRepository {
    fetchLatestThree(): Scores
}