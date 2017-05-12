'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');

import Tabs from 'antd/lib/tabs';
import Collapse from 'antd/lib/collapse';
import Spin from 'antd/lib/spin';
import BackTop from 'antd/lib/back-top';
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
require('antd/dist/antd.css');

const $ = require('jquery');
/*
tab切换,装载List组件,装载相当于运行一次List组件,即每次装载List组件,都会走一次生命周期,只需要每次在渲染后调用componentDidMount函数装载不同的数据即可
*/
class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {listCount: 0};
	}
	func (count) {
		this.setState({
			listCount: count
		});
	}
	render() {
		let tabData = ['daily', 'weekly', 'monthly'];
		let tabList = [];
		let listCount = this.state.listCount;
		if( listCount === 0 ) {
			listCount = '';
		} else {
			listCount = '(' + this.state.listCount + ')';
		}
		tabData.map((v, i) => {
			let listHtml;
			listHtml = <TabPane tab={v + listCount} key={i}>
				/*
				* 子组件List向父组件TabPane传递
				*  List字组件中 得到数据  以props的形式传给 List本身（其中的属性以函数得到）
				* 通过函数可以更改state的值,从而 父组件以state的形式获得数据
				*/
				<List currentTab = {v} countAmount={count => this.func(count)} />
			</TabPane>;
			tabList.push(listHtml);
		});
		return (
			<Tabs defaultActiveKey="0">
				{tabList}
			</Tabs>
		);
	}
}
/*
* 用来解决在 react@0.14.9 react-dom@0.14.9中对 propsType的验证提示
*/
Main.propTypes = {
  defaultActiveKey: PropTypes.string
};

class List extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
		this.state = {loading: true, error: null, data: null};
	}
	/*初始化渲染执行之后立刻调用一次*/
	componentDidMount() {
		/* let initStartTime = Date.now();*/
		let source = $.get('http://localhost:8888/src/components/server.js?since=' + this.props.currentTab);
		source.then(
			value => {
				/* 计算数据从服务器请求回来后的加载时间（进度）*/
				/* let initEndTime = Date.now();
				let timeLen = initEndTime - initStartTime;
				for(let t = 1; t <= timeLen; t++ ) {
					let millisecondPercent = ((t * 100) / timeLen).toFixed(2);
					console.log(millisecondPercent + '%');
				} */
				/* 计算数据从服务器请求回来后的加载时间（进度）*/
				this.setState({
				loading: true,
				data: value
			});
			let data = JSON.parse(this.state.data);
			this.props.countAmount(data.pop().dataLength);
		},
			error => this.setState({
				loading: false,
				error: error
			}));
	}
	render() {
	/*判断数据是否加载*/
	let warnigInfo = [];
	if(this.state.loading) {
		warnigInfo.push('');
	} else {
		warnigInfo.push(<span key='Loading'>Loading</span>);
	}
	if(this.state.error !== null ) {
		warnigInfo.push(<span key='Error'>Error: {this.state.error}</span>);
	} else {
		warnigInfo.push('');
    }

	const customPanelStyle = {
		background: '#fff',
		borderRadius: 0,
		marginBottom: 0,
		border: 0
	};
	const collapeStyle = {
		border: '1px solid #fff',
		fontSize: '14px',
		margin: '20px',
		marginTop: '0px'
	};
	const spinStyle = {
		margin: '20px',
		textAlign: 'center'
	};
	let page = this.state.data || '[]';
	let dataCon = JSON.parse(page);
	let dataArry = [], spinArry = [], collapseActiveKey = [];

	/* 计算数据在组件 所有数据下载时间 － 第一次渲染后加载时间 ,根据时间计算百分比显示进度条
	现在是不知道怎么判断Progress组件的 percent属性动态变化,下面这个例子会显示多个Progress组件,正确的只要求显示一个Progress组件
	*/
	/*if(initStartTime !== 'undefined' && initEndTime !== 'undefined') {
		let timeLen = initEndTime - initStartTime;
		for(let t = 1; t <= timeLen; t++ ) {
			let millisecondPercent = ((t * 100) / timeLen).toFixed(2);
			progressArry.push(<Progress style={progressStyle} key={t} type="dashboard" percent={millisecondPercent} />);
		}
	}*/
		// React.Children.count(dataArry)

		if(dataCon[0]) {
			dataCon.pop();
			dataCon.map(function(v, i) {
				let index = i + 1;
				let listHtml = <Panel header={v.aHrefText} key={index} style={customPanelStyle}>
					<p>{v.des}</p>
					</Panel>;
				dataArry.push(listHtml);
				/* 把所有json对象的下标都加载到扩展数组中collapseActiveKey*/
				collapseActiveKey.push(String(index));
			});

		} else {
			let spinHtml;
			spinHtml = <div key="spin" style={spinStyle}>
						<Spin/>
						</div>;
			spinArry.push(spinHtml);
		}
		// console.log(React.Children.count(dataArry));
		return (
			<div>
				{/*回到顶部*/}
				<BackTop>
					<div className="ant-back-top-content">UP</div>
				</BackTop>
				{/*数据加载状态*/}
				{warnigInfo}
				{/*数据加载完成前,加载中ing...*/}
				{spinArry}
				{/*数据加载完成后的效果显示*/}
				<Collapse key={dataArry} style={collapeStyle} bordered={false} defaultActiveKey={collapseActiveKey}>{dataArry}</Collapse>
			</div>
		);
	}
}

ReactDOM.render(
	<Main />,
    document.getElementById('content')
);
