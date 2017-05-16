const http = require('http');
const request_ = require('request');
const urlencode2 = require('urlencode2');
const cheerio = require('cheerio');
const url = require('url');

http.createServer(function(req, res) {
    var urlDecode = urlencode2.decode(req.url,'gbk');
    var getUrl = url.parse(urlDecode,true);
    console.log(getUrl.path);
    var lastSlash = getUrl.path.lastIndexOf('/');
    var lastQueMark = getUrl.path.lastIndexOf('?');
    var slashToQueMarkCon = getUrl.path.slice(lastSlash+1,lastQueMark);
    console.log(slashToQueMarkCon);
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
                dataArry.listArry = listArry;
                dataArry.languagesArry = languagesArry;

                res.writeHead(200, {
                    "Content-Type": "text/html; charset=UTF-8",
                    'Access-Control-Allow-Origin': req.headers.origin
                });
                res.end(JSON.stringify(dataArry) + '\n');
            } else {
                console.log(error)
            }
        }
    )
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');