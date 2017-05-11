# react-webpack-web
* 实现跨域抓取网站信息
* 利用服务器(nodejs)做为代理,由服务器抓取网站信息,然后返回抓取信息到客户端

## 如何使用
* 需要nodej环境,先安装这个环境
* git clone git@github.com:wendy81/react-webpack-web.git
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

### Add the plugins
* html-webpack-plugin
* CommonsChunkPlugin


#### webpack.config.js

	const webpack = require('webpack');
	const HtmlWebpackPlugin = require('html-webpack-plugin');
	
	// only load the resolve method of  the module 'path'
	const { resolve } = require('path');
	
	module.exports = {
	context: resolve(__dirname),
	entry: {
      app: './index.js',
      vendor: ['react', 'react-dom']
    },
    output: {
        filename: 'browser-bundle.js',
        path: 'docs'
    },
    devtool: 'source-map',
    module: {
        loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
              presets: ['es2015', 'react']
          }
        }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'My App',
            template: __dirname + '/index.html'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js'
        })
    ]
    };