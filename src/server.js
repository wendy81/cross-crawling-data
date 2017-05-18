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
    var slashToQueMarkCon = getUrl.path.slice(lastSlash+1, lastQueMark);
    var selcted = (getUrl.query).since;
    var req_url = "https://github.com/trending/" + slashToQueMarkCon + "?since=" + selcted;
    let listArry = [];
    request_.get(req_url,
        function(error, response_, body) {
            if (!error && response_.statusCode == 200) {
                $ = cheerio.load(body);
                let dataArry = {};
                /*
                * Repositories 相关数据信息
                * aHref=链接   aHrefText＝链接文字  des＝相关文字描述
                * programmingLanguageArry 取所有语言被收藏次数最多的语言做演示
                */
                let showCon = $('.repo-list li');
                let dataLength = showCon.length;
                let programmingLanguageArry = [];
                showCon.map(function(index, ele) {
                    let arryObj = {};
                    arryObj.aHref = 'https://github.com' + $(ele).find('a').attr('href');
                    arryObj.aHrefText = ($(ele).find('h3 a').text()).trim();
                    arryObj.des = ($(ele).find('p').text()).trim();
                    programmingLanguage = ($(ele).find('[itemprop="programmingLanguage"]').text()).trim();
                    listArry[index] = arryObj;
                    programmingLanguageArry.push(programmingLanguage);
                })
                listArry.push({dataLength: dataLength});
                programmingLanguageArry.unshift('All-Language');
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

                var writeListPath = __dirname + '/dataLanguages/' + slashToQueMarkCon + '_' + selcted + '.json';
                var writeLanguagePath2 = __dirname + '/dataLanguages/languages.json';
                var options = { flags: 'w+',
                                encoding: 'utf8',
                                mode: 0666 };

                fs.exists(writeLanguagePath2, function(result) { 
                    // if(!result) {
                    var writeStream = fs.createWriteStream(writeLanguagePath2,options);
                    writeStream.write(JSON.stringify(programmingLanguageArry, null, 4));
                    // }
                    var writeStream = fs.createWriteStream(writeListPath,options);
                    writeStream.write(JSON.stringify(listArry, null, 4)); 
                    writeStream.end('This is the end\n');
                    writeStream.on('finish', () => {
                        console.error('All writes are now complete.');
                    });                     
                });

                // console.log(Object.prototype.toString.call(listArry))
                // console.log(listArry)
                res.end(JSON.stringify(listArry) + '\n');
            } else {
                console.log(error)
            }
        }
    )
    }
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');