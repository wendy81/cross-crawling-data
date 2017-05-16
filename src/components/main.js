'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');

import Tabs from 'antd/lib/tabs';
import Collapse from 'antd/lib/collapse';
import Spin from 'antd/lib/spin';
import BackTop from 'antd/lib/back-top';
import Select from 'antd/lib/select';
import Card from 'antd/lib/card';

const Option = Select.Option;
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
		this.state = {listCount: 0, dataZero: 1, currentLanguage: 'javascript', selectAllOptions: []};
	}
	changeTab (v) {
		/*
		* allTab 当前选中的tab
		* allTab[0]当前选中的tab的DOM对象
		* $(allTab[0]) 转换成jquery对象
		*/
		let allTab = $('[role="tab"]').eq(v);
		let currentTab = ($(allTab[0]).text());
		this.setState({
			tabVal: currentTab
		});
	}
	/*
	* 各Tab的总数据条数
	*/
	func (count) {
		this.setState({
			listCount: count
		});
	}
	dataZero () {
		console.log(this.state.listCount);
		if(this.state.listCount === 0) {
			this.setState({
				dataZero: 0
			});
		} else {
			this.setState({
				dataZero: 1
			});
		}
		console.log(this.state.dataZero);
	}
	/*
	* 当前所选语言选项
	*/
	getLanguage (currentLanguage) {
		this.setState({
			currentLanguage: currentLanguage
		});
	}
	/*
	* 所有语言选项列表
	*/
	getAllOptions (optionsVal) {
		let getAllOptionsVal = optionsVal.splice(3);
		this.setState({
			selectAllOptions: getAllOptionsVal
		});
	}
	render() {
		let tabData = ['daily', 'weekly', 'monthly'];
		let tabList = [];
		let listCount = this.state.listCount;
		let listHtml, cardHtml;
		if( !this.state.dataZero ) {
			cardHtml = <Card title="Waring" style={{ width: '80%', fontSize: 16, marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}>
					<p>It looks like we don’t have any trending repositories for {this.state.currentLanguage}.</p>
				</Card>;
		}
		if( listCount === 0 ) {
			listCount = '';
		} else {
			listCount = '(' + this.state.listCount + ')';
		}
		tabData.map((v, i) => {
			listHtml = <TabPane tab={v + listCount} key={i}>
				{/*
				* 子组件List向父组件TabPane传递
				*  List字组件中 得到数据  以props的形式传给 List本身（其中的属性以函数得到）
				* 通过函数可以更改state的值,从而 父组件以state的形式获得数据
				* @params currentTab 当前Tab内容
				* @params getAllOptions 得到所有语言函数
				* @params countAmount 当前tab的所有数据条数函数
				* @params language 当前语言属性
				*/
				}
				<List currentTab = {v}
				getAllOptions = {optionsVal => this.getAllOptions(optionsVal)}
				countAmount = {count => this.func(count)}
				language = {this.state.currentLanguage}
				// mainSource={ (language, currentTab) => { $.get('http://localhost:8888/src/components/server.js/' + language + '?since=' + currentTab); } }
				/>
			</TabPane>;
			tabList.push(listHtml);
		});
		return (
			<div>
				{cardHtml}
				<Language getAllOptions={this.state.selectAllOptions} currentLanguage={language => this.getLanguage(language)} dataZero = {() => this.dataZero()}/>
				<Tabs defaultActiveKey="0">
					{tabList}
				</Tabs>
			</div>
		);
	}
}
/*
* 用来解决在 react@0.14.9 react-dom@0.14.9中对 propsType的验证提示
*/
Main.propTypes = {
  defaultActiveKey: PropTypes.string
};

class Language extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
	}
	handleChange(value) {
		this.props.currentLanguage(value);
		this.props.dataZero();
	}
	render() {
		/*
		* new Set([])用来过滤数组中重复的数据
		* Array.from() 将set结构转化为数组
		*/
		let selectOptionsVals = Array.from(new Set(this.props.getAllOptions));
		let optionsArry = [], selectHtml;
		if(selectOptionsVals[0]){
			selectOptionsVals.map(function(val) {
				let valReg = val.replace(/\s/g, '-').toLowerCase();
				let optionHtml = <Option key={valReg} value={valReg}>{val}</Option>;
				optionsArry.push(optionHtml);
			});
			selectHtml = <Select showSearch defaultValue="javascript" style={{ width: '100%' }} onChange={(v) => { this.handleChange(v); }} optionFilterProp="children" filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
				{optionsArry}
			</Select>;
		}
		return (
			<div>{selectHtml}</div>
		);
	}
}

class List extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
		this.state = {loading: true, error: null, data: null};
	}
	/*初始化渲染执行之后立刻调用一次*/
	componentDidMount() {
		/* let initStartTime = Date.now();*/
		let source = $.get('http://localhost:8888/src/components/server.js/' + this.props.language + '?since=' + this.props.currentTab);
		// let source = this.props.mainSource(this.props.language, this.props.currentTab);
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
			/*
			* 这里放到componentDidMount函数中原因:由于要用setState函数修改状态,不能放到reder中,不然会无限循环
			* @param dataListArry 返回所有数据的条数,用来更改setState的状态
			* @param languagesArry 返回的所有语言数组
			* @getAllOptions  函数用来setState所有语言列表
			*/
			let data = JSON.parse(value);
			let dataListArry = data.listArry;
			let languagesArry = data.languagesArry;
			/*对应的Tab标签显示的数据条数*/
			this.props.countAmount(dataListArry.pop().dataLength);

			/*对应的语言选择列表,只需要在初始化的时候加载一次就ok了*/
			this.props.getAllOptions(languagesArry);
		},
			error => this.setState({
				loading: false,
				error: error
			}));
	}
	/*接收到新的language属性时调用这个函数*/
	componentWillUpdate(nextProps) {
		if (this.props.language !== nextProps.language) {
		let source = $.get('http://localhost:8888/src/components/server.js/' + nextProps.language + '?since=' + this.props.currentTab);
		// let source = this.props.mainSource(nextProps.language, this.props.currentTab);
		source.then(
			value => {
				this.setState({
				loading: true,
				data: value
			});
			let data = JSON.parse(value);
			let dataListArry = data.listArry;
			this.props.countAmount(dataListArry.pop().dataLength);
			console.log("0000000");
			console.log(dataListArry);
		},
			error => this.setState({
				loading: false,
				error: error
			}));
		}
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
	let dataCon = (JSON.parse(page)).listArry || [];
	console.log(dataCon);
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
