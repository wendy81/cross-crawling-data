/*
* spin 在切换语言时如何加载
* tab 切换后内容List的渲染问题
*/
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

const OptGroup = Select.OptGroup;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
require('antd/dist/antd.css');

const $ = require('jquery');

class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {currentLanguage: 'All-Language', listCount: 0};
	}
	/*
	* 各Tab的总数据条数
	*/
	func (count) {
		this.setState({
			listCount: count
		});
	}
	/*
	* 当前所选语言选项
	*/
	getLanguage (currentLanguage) {
		this.setState({
			currentLanguage: currentLanguage
		});
	}
	render() {
		return (
			<div>
				<Language defaultValue= {this.state.currentLanguage} currentLanguage={language => this.getLanguage(language)}/>
				<TabComponent currentLanguage = {this.state.currentLanguage} countAmount = {count => this.func(count)}/>
			</div>
		);
	}
}
/*
tab切换,装载List组件,装载相当于运行一次List组件,即每次装载List组件,都会走一次生命周期,只需要每次在渲染后调用componentDidMount函数装载不同的数据即可
*/
class TabComponent extends React.Component {
	constructor(props) {
		super(props);
		/*
		* listCount 当前选中的tab的数据条数
		* shoWarnig 当前语言没有对应的数据时显示对应的提醒信息
		* currentLanguage 当前语言
		*/
		this.state = {listCount: 0};
	}
	changeTab (v) {
		/*
		* 这个项目中没有使用
		* allTab 当前选中的tab
		* allTab[0]当前选中的tab的DOM对象
		* $(allTab[0]) 转换成jquery对象
		*/
		console.log(v);
		return false;
		// let allTab = $('[role="tab"]').eq(v);
		// let currentTab = ($(allTab[0]).text());
		// this.setState({
		// 	tabVal: currentTab
		// });
	}

	render() {
		let tabData = ['daily', 'weekly', 'monthly'];
		let tabList = [];
		let listCount = this.props.listCount;
		let listHtml;
		if( listCount === 0 ) {
			listCount = '';
		} else {
			listCount = '(' + listCount + ')';
		}
		tabData.map((v, i) => {
			listHtml = <TabPane tab={v} key={i}>
				{
				/*
				* 子组件List向父组件TabPane传递
				*  List字组件中 得到数据  以props的形式传给 List本身（其中的属性以函数得到）
				* 通过函数可以更改state的值,从而 父组件以state的形式获得数据
				* @params currentTab 当前Tab内容
				* @params countAmount 当前tab的所有数据条数函数
				* @params language 当前语言属性
				*/
				}
				<List key={v} currentTab = {v}
				countAmount = {count => this.props.countAmount(count)}
				currentCount = {this.state.listCount}
				language = {this.props.currentLanguage}
				/>
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

/*
* 用来显示当没有数据时的提醒框
*/
class ShoWarnig extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
	}
	render() {
		return (
			<Card title="Waring" style={{ width: '80%', fontSize: 16, marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}>
					<p>It looks like we don’t have any trending repositories for {this.props.currentLanguage}.</p>
			</Card>
		);
	}
}
/*
* 用来显示spin动画
*/
class ShoWspin extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
	}
	render() {
		const spinStyle = {
			margin: '20px',
			textAlign: 'center'
		};
		return (
			<div style={spinStyle}>
				<Spin/>
			</div>
		);
	}
}
/*
* 用来显示语言列表select
*/
class Language extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
		this.state = {loading: true, error: null, dataLanguages: null};
	}
	/*初始化渲染执行之后立刻调用一次*/
	componentDidMount() {
		let source = $.get('/dist/dataLanguages/languages.json');
		source.then(
			value => {
				this.setState({
				loading: true,
				dataLanguages: value
			});
			},
			error => this.setState({
				loading: false,
				error: error
			})
		);
	}
	handleChange(value) {
		this.props.currentLanguage(value);
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
		/*
		* new Set([])用来过滤数组中重复的数据
		* Array.from() 将set结构转化为数组
		*/
		let data = this.state.dataLanguages || [];
		let selectOptionsVals;
		let upperArry = [];
		selectOptionsVals = new Set(data);
		console.log();
		for(let val of selectOptionsVals) {
			/*
			* 把所有选项变成大写
			* 把“”给过滤掉, 由于 Boolean("")=false
			*/
			if(val !== '') {
				let toUpperCase = val.toUpperCase();
				upperArry.push(toUpperCase);
			}
		}
		/*变成大写才可以按字母顺序分类*/
		upperArry.sort();
		let optionsArry = [], selectHtml;
		let firstLetterArry = [], sameFirstLetterArry = [];

		/* 实现方式以首字母分组的下拉菜单 */
		if(upperArry[0]){
			upperArry.map(function(val) {
				firstLetterArry.push(val.slice(0, 1));
			});
			/*
			* @params firstLetterArry ['A', 'B', ...]
			*/
			firstLetterArry = Array.from(new Set(firstLetterArry));
			/*
			* @params sameFirstLetter 把首字母相同的放到一个数组 [以A开始]...
			* @params sameFirstLetterArry [[以A开始], [以B开始], [以C开始] ,...]
			*/
			firstLetterArry.map(function(v) {
				let sameFirstLetter = upperArry.filter(function(value) {
					return value.slice(0, 1) === v;
				});
				sameFirstLetterArry.push(sameFirstLetter);
			});
			/*
			* @params firstLetterArry 和 sameFirstLetterArry数组长度同
			*/
			sameFirstLetterArry.map(function(v, i){
				let sameFirstLetterOption = [];
				v.map(function(value) {
					let valReg = value.replace(/\s/g, '-').toLowerCase();
					let valFirstUpper = valReg.slice(0, 1).toUpperCase() + valReg.slice(1);
					sameFirstLetterOption.push(<Option key={value} value={valReg}>{valFirstUpper}</Option>);
				});
				let optionHtml = <OptGroup key={firstLetterArry[i]} label={firstLetterArry[i]}>
						{sameFirstLetterOption}
					</OptGroup>;
				optionsArry.push(optionHtml);
			});
			selectHtml = <Select
						showSearch
						defaultValue={this.props.defaultValue}
						style={{ width: '100%' }}
						onChange={(v) => { this.handleChange(v); }}
						optionFilterProp="children"
						filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
						>
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
		this.state = {loading: true, error: null, data: null, shoWarnig: false, showSpin: true};
	}
	/*初始化渲染执行之后立刻调用一次*/
	componentDidMount() {
		/* let initStartTime = Date.now();*/
		let language = (this.props.language).toLowerCase();
		// let source = $.get('http://localhost:8888/' + language + '?since=' + this.props.currentTab);
		let source = $.get('/dist/dataLanguages/' + language + '_' + this.props.currentTab + '.json');
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
			*/
			// let data = JSON.parse(value);
			/*
			* source直接取Json就不需要解析了
			*/
			let data = value;
			let dataListArry = data;
			this.props.countAmount(dataListArry.pop().dataLength);
			/*对应的Tab标签显示的数据条数*/
			if(dataListArry.length === 0) {
				this.setState({shoWarnig: true});
			} else {
				this.setState({shoWarnig: false});
			}
		},
			error => this.setState({
				loading: false,
				error: error
			}));
	}
	/*
	* 说明属性或状态变化时需不需要做渲染
	* 问题当点击当前标签时, 当前list会渲染的次数
	* 第一个标签2次,第二个标签1(前第1标签)+2(当前标签）,第3个标签1(前第1标签)+1(前第2标签)+2(当前标签）
	* ???  渲染次数？？？
	*/
	shouldComponentUpdate(nextProps) {
		/*
		* data为空时不渲染
		*/
		if(this.state.data === null) {
			return false;
		}
		/*
		* currentCount有没有加载数据都不渲染,这个值是针对TabPane的,对于TabPane下面的内容List组件没有任何意思
		*/
		if(this.props.currentCount !== nextProps.currentCount) {
			return true;
		} else {
			return true;
		}
		/*
		* language当前language更新后要渲染
		*/
		if(this.props.language === nextProps.language) {
			return false;
		}
		return true;
	}
	/*接收到新的language属性时调用这个函数*/
	componentWillUpdate(nextProps) {
		if (this.props.language !== nextProps.language) {
		/*
		* select一切换,则 shoWarnig为false
		*/
		this.setState({shoWarnig: false});
		let language = (nextProps.language).toLowerCase();
		// let source = $.get('http://localhost:8888/' + language + '?since=' + this.props.currentTab);
		let source = $.get('/dist/dataLanguages/' + language + '_' + this.props.currentTab + '.json');
		source.then(
			value => {
				this.setState({
				loading: true,
				data: value
			});
			/*
			* source直接取Json就不需要解析了
			*/
			// let data = JSON.parse(value);
			let data = value;
			let dataListArry = data;
			this.props.countAmount(dataListArry.pop().dataLength);
			if(dataListArry.length === 0) {
				this.setState({shoWarnig: true});
			} else {
				this.setState({shoWarnig: false});
			}
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
	/*
	* source直接取Json就不需要解析了
	*/
	// let page = this.state.data || '[]';
	// let dataCon = JSON.parse(page) || [];
	let page = this.state.data || [];
	let dataCon = page;
	let dataArry = [], spinArry = [], collapseActiveKey = [];
	let cardHtml;

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
					<p><a href={v.aHref} target='_blank'>{v.des}</a></p>
					</Panel>;
				dataArry.push(listHtml);
				/* 把所有json对象的下标都加载到扩展数组中collapseActiveKey*/
				collapseActiveKey.push(String(index));
			});
		} else if(!this.state.shoWarnig) {
			/*
			* 这里需要加shoWarnigStatus这个判断条件 为true
			*/
			spinArry.push(<ShoWspin key='spin' />);
		}
		/*
		* 如果shoWarnig为true
		*/
		if( this.state.shoWarnig ) {
			cardHtml = <ShoWarnig currentLanguage = {this.props.language} />;
		}
		// if( this.state.showSpin ) {
		// 	spinArry.push(<ShoWspin key='spin' />);
		// }
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
				{cardHtml}
			</div>
		);
	}
}

ReactDOM.render(
	<Main />,
    document.getElementById('content')
);
