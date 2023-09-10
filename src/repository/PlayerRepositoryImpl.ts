import {Player, PlayerRepository} from "../domain/Player";
import {SpreadSheetDriver} from "../driver/SpreadSheetDriver";

export class PlayerRepositoryImpl implements PlayerRepository {
    constructor(
        readonly driver: SpreadSheetDriver
    ) {
    }

    fetchByNickName(nickName: string): Player {
        return undefined
    }
}