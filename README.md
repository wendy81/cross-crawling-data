# react-webpack-web
* 实现跨域抓取网站信息
* 利用服务器(nodejs)做为代理,由服务器抓取网站信息,然后返回抓取信息到客户端

## 如何使用
* 需要nodej环境,先安装这个环境
* git clone git@github.com:wendy81/cross-crawling-data.git
* 复制远程库到本地后,执行 npm install ,安装所需的插件

## 先启动服务器
* 服务器端程序  src/components/server.js
* 运行 npm start 启动服务器

## 运行客户端
* 新打开一个命令窗口 
* 运行 grunt serve 本地热更新显示
* 运行 grunt serve:dist 本地显示

## 说明
### 有2个分支,master和gh-pages
* master分支是运行程序,服务器抓取数据,客户端请求服务器,响应,传回数据,客户端读取数据显示
* gh-pages是用来展示效果,为了显示数据,把服务器抓取数据写成了json文件,客户端读取json进行数据显示


### 服务器程序,解决跨域问题

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
                    //说明:允许请求跨域访问
                    'Access-Control-Allow-Origin': req.headers.origin
                });
                res.end(JSON.stringify(listArry) + '\n');
            } else {
                console.log(error)
            }
        }
    )}).listen(8888);
    
### 客户端说明
### 第一:针对antd 提示
You are using a whole package of antd, please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.
#### 解决方案：
	import Tabs from 'antd/lib/tabs';
	import Collapse from 'antd/lib/collapse';
	import Spin from 'antd/lib/spin';
	const TabPane = Tabs.TabPane;
	const Panel = Collapse.Panel;
	require('antd/dist/antd.css');

### 第二:针对程序引入多个插件，最后生成的bundle.js太大
#### 解决方案 webpack.config.js：
* 利用vendor把相关插件单独放到一个文件中引入即可
* 这样做的好处是,vendor.js中的文件首次运行会放到缓存,再次运行会提升访问速度
* 首先在entry中设置vendor
* 其次设置plugin

	  entry: {
      hot: 'webpack/hot/only-dev-server',
      main: './src/components/main.js',
      //说明在vendor中把所需要从bundle.js中分离出来的插件放到这个文件中即可
      vendor: ['react', 'react-dom', 'prop-types', 'antd/lib/tabs', 'antd/lib/collapse', 'jquery', 'antd/dist/antd.css']
      }
      plugins: [
      new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js'
      })]
      
###  第三:解决在 react@0.14.9 react-dom@0.14.9中对 propsType的验证提示
####  解决方案 引入模块 prop-types：

	const PropTypes = require('prop-types');
	//设置组件中的属性类型,就不会再有提示
	Main.propTypes = {
	defaultActiveKey: PropTypes.string
	};
	   
