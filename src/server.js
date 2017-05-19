const http = require('http');
const request_ = require('request');
const urlencode2 = require('urlencode2');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');

const options = { flags: 'w+',
                encoding: 'utf8',
                mode: 0666,
                autoClose: false };
/*
* 判断2个数组属性和值是否相等
*/
function isObjectValueEqual(a,b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if(aProps.length !== aProps.length) {
        return false;
    }
    for(val of aProps) {
        if(a[val] !== b[val]) {
            return false;
        }
    }
    return true;
}
/*
* 判断所读数据val与data是否相同,不同则重写
*/
function readerStreamFun(val, data) {
    var readerStream = fs.createReadStream(val);
    readerStream.on('readable', () => {
        /*
         * readerStreamFile为什么会先返回数据,之后返回为null???
         */
        var readerStreamFile = readerStream.read();
        var readerStreamFileUtf8;
        if (readerStreamFile !== null) {
            readerStreamFileUtf8 = JSON.parse(readerStreamFile.toString('utf8'));
            if (!isObjectValueEqual(readerStreamFileUtf8, data)) {
                var writeStream = fs.createWriteStream(val, options);
                writeStream.write(JSON.stringify(data, null, 4));
                writeStream.end();
                writeStream.on('finish', () => {
                    console.error('All writes are now complete.');
                });
            };
        }
    });
    readerStream.on('end', () => {
        console.log('end');
    });
}


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
                programmingLanguageArry.length = 5;
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
                var allWriteJson = [];
                allWriteJson.push(writeListPath);
                allWriteJson.push(writeLanguagePath2);
                /*
                * 遍历数组allWriteJson,第一判断是否有文件,无文件则新建
                * 有文件,则比较文件内容与对应的数据是否相同,不同则重写
                */
               for(let val of allWriteJson) {
                        if(!fs.existsSync(val)) {
                            if(val === writeLanguagePath2) {
                                var writeStream = fs.createWriteStream(val,options);  
                                writeStream.write(JSON.stringify(programmingLanguageArry, null, 4));                               
                            } else {
                                var writeStream = fs.createWriteStream(val,options);  
                                writeStream.write(JSON.stringify(listArry, null, 4));                                 
                            }
                            writeStream.end();
                            writeStream.on('finish', () => {
                                console.error('All writes are now complete.');
                            });                            
                        } else {
                            if(val === writeLanguagePath2) {
                                readerStreamFun(val, programmingLanguageArry)
                            } else {
                                readerStreamFun(val, listArry)
                            }
                        }
               }

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