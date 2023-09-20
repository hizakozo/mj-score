export class HttpDriver {
    getLatestRecord(): string {
        const MJM_ID = PropertiesService.getScriptProperties().getProperty("MJM_ID");
        const PASSWORD = PropertiesService.getScriptProperties().getProperty("PASSWORD");
        const cookie = UrlFetchApp.fetch( "https://pl.sega-mj.com/players/MjmidLogin", {
            method: "post",
            payload: `mjm_id=${MJM_ID}&password=${PASSWORD}&platform=2`,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        }).getHeaders()["Set-Cookie"]
        const historyRes = UrlFetchApp.fetch("https://pl.sega-mj.com/playdata_view/showHistory",
            {
                method: "get",
                headers: {
                    "Cookie": cookie
                }
            })
        const html = historyRes.getContentText();
        const parse = Parser.data(html)
        const text: string = parse.from('<div class="body">').to('</div>').build()
        return text.replace(/<\/?span[^>]*>/g, '')
    }
}

declare class Parser {
    public static data(html: string)
}
