import {GameRepositoryImpl} from "./repository/GameRepositoryImpl";
import {SpreadSheetDriver} from "./driver/SpreadSheetDriver";
import {GameUseCase} from "./usecase/GameUseCase";
import {PlayerRepositoryImpl} from "./repository/PlayerRepositoryImpl";
import {GameController} from "./controller/gameController";
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

type OnEditEvent = GoogleAppsScript.Events.SheetsOnEdit;

function doPost(e) {
    const LINE_TOKEN = PropertiesService.getScriptProperties().getProperty("LINE_TOKEN");
    const LINE_URL = 'https://api.line.me/v2/bot/message/reply';

    const json = JSON.parse(e.postData.contents);

    const reply_token = json.events[0].replyToken;
    const messageId = json.events[0].message.id;
    const messageType = json.events[0].message.type;
    const messageText = json.events[0].message.text;

    const response = route(messageText)

    const option: URLFetchRequestOptions = {
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + LINE_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
            'replyToken': reply_token,
            'messages': [{
                'type': 'text',
                'text': response,
            }],
        }),
    }

    UrlFetchApp.fetch(LINE_URL, option);

    return;
}

const route = (messageText: string): string => {
    // DI
    const activeSheet = SpreadsheetApp.getActiveSpreadsheet()
    const gameRepository = new GameRepositoryImpl(new SpreadSheetDriver(activeSheet))
    const playerRepository = new PlayerRepositoryImpl(new SpreadSheetDriver(activeSheet))
    const saveGameUseCase = new GameUseCase(gameRepository, playerRepository)
    const gameController = new GameController(saveGameUseCase)
    const containsAll = (targetString: string, substrings: string[]): boolean => {
        return substrings.every(sub => targetString.indexOf(sub) !== -1);
    }
    if (containsAll(messageText, ["1位", "2位", "3位", "『", "』"])) {
        gameController.save(messageText)
        return "登録完了"
    }
    if (messageText === "合計") {
        return gameController.getTodayTotal()
    }
    return ""
}

function test() {
    const ms = "合計"
    console.log(route(ms))
}