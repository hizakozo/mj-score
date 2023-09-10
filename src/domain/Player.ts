export class Player {
    constructor(
        readonly playerId: string,
        readonly playerName: string,
        readonly nickName: string
    ) {
    }
}

export interface PlayerRepository {
    fetchByNickName(nickName: string): Player
}