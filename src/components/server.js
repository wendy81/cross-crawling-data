const http = require('http');
const request_ = require('request');
const urlencode2 = require('urlencode2');
const cheerio = require('cheerio');
const url = require('url');

http.createServer(function(req, res) {
    var selcted = ((url.parse(req.url,true)).query).since;
    var req_url = "https://github.com/trending?since=" + selcted;
    let listArry = []
    request_.get(req_url,
        function(error, response_, body) {
            if (!error && response_.statusCode == 200) {
                $ = cheerio.load(body);
                let showCon = $('.repo-list li');
                showCon.map(function(index, ele) {
                    let arryObj = {};
                    arryObj.aHref = 'https://github.com' + $(ele).find('a').attr('href');
                    arryObj.aHrefText = ($(ele).find('h3 a').text()).trim();
                    arryObj.des = ($(ele).find('p').text()).trim();
                    listArry[index] = arryObj;
                })
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=UTF-8",
                    'Access-Control-Allow-Origin': req.headers.origin
                });
                res.end(JSON.stringify(listArry) + '\n');
            } else {
                console.log(error)
            }
        }
    )
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');