const http = require('http');
const request_ = require('request');
const urlencode2 = require('urlencode2');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');

http.createServer(function(req, res) {
    var urlDecode = urlencode2.decode(req.url,'gbk');
    var getUrl = url.parse(urlDecode,true);
    var pathname = getUrl.pathname;   
    /*
    * 用if判断屏蔽掉favicon.ico
    * 这里只是把对应的浏览器请求favicon.ico后的操作给屏蔽了,下面的写文件到本地不能走这个请求了/favicon.ico
    * 但是实际上浏览器还是会请求favicon.ico
    */
    if(pathname != '/favicon.ico'){
    var lastSlash = getUrl.path.lastIndexOf('/');
    var lastQueMark = getUrl.path.lastIndexOf('?');
    var slashToQueMarkCon = getUrl.path.slice(lastSlash+1,lastQueMark);
    var selcted = (getUrl.query).since;
    var req_url = "https://github.com/trending/" + slashToQueMarkCon + "?since=" + selcted;
    let listArry = []
    request_.get(req_url,
        function(error, response_, body) {
            if (!error && response_.statusCode == 200) {
                $ = cheerio.load(body);
                let dataArry = {};
                /*
                * Repositories 相关数据信息
                * aHref=链接   aHrefText＝链接文字  des＝相关文字描述
                */
                let showCon = $('.repo-list li');
                let dataLength = showCon.length;
                showCon.map(function(index, ele) {
                    let arryObj = {};
                    arryObj.aHref = 'https://github.com' + $(ele).find('a').attr('href');
                    arryObj.aHrefText = ($(ele).find('h3 a').text()).trim();
                    arryObj.des = ($(ele).find('p').text()).trim();
                    listArry[index] = arryObj;
                })
                listArry.push({dataLength: dataLength});
                /*
                * All languages
                */
                let selectLanguages = $('span.select-menu-item-text'), languagesArry = [];
                selectLanguages.map(function(index, ele) {
                    languagesArry[index] = $(ele).text();
                })
                /*
                * dataArry = {listArry: listArry, languagesArry: languagesArry}
                * listArry 数据信息数组   languagesArry 语言分类数组
                */
                // 现在改成languagesArry语言数组写到json文件中,前端只需要初始化的时候调用一次语言即可
                // dataArry.listArry = listArry;
                // dataArry.languagesArry = languagesArry;
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=UTF-8",
                    'Access-Control-Allow-Origin': req.headers.origin
                });

                var writeLanguagePath2 = __dirname + '/dataLanguages/';
                var options = { flags: 'w',
                                encoding: 'utf8',
                                mode: 0666 };
                fs.exists(writeLanguagePath2, function(result) { 
                    if(!result) {
                        fs.mkdir(writeLanguagePath2,0777, function (err) {
                          if (err) throw err;
                        });
                    }
                    var writeStream = fs.createWriteStream(writeLanguagePath2 + 'languages.json',options);
                    writeStream.write(JSON.stringify(languagesArry, null, 4));
                    writeStream.end();
                    writeStream.on('finish', () => {
                        console.error('All writes are now complete.');
                    });                      
                });


                res.end(JSON.stringify(listArry) + '\n');
                res.on('error', (e) => {
                    console.log(`Got error: ${e.message}`);
                })
            } else {
                console.log(error)
            }
        }
    ).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
});

}
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');