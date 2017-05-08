'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const $ = require('jquery');
const Navigation = require('./navigation');
const { Collapse } = require('antd');
const Panel = Collapse.Panel;

require('antd/dist/antd.css');

class Main extends React.Component {
	constructor(props) { //初始化this.state
		super(props);
		this.state = {loading: true, error: null, data: null, defatultTab: 'weekly'};
		this.changeCuurentTab = this.changeCuurentTab.bind(this);
	}
	//初始化渲染执行之后立刻调用一次
	componentDidMount() {
		let source = $.get('http://localhost:8888/src/components/server.js?since=' + this.state.defatultTab );
		source.then(
			value => this.setState({
				loading: false,
				data: value
			}),
			error => this.setState({
				loading: false,
				error: error
			}));
	}
	//在接收到新的 props 或者 state，将要渲染之前调用,从服务器调取新的数据,接收新的数据state变化则会进行再次渲染
	componentWillUpdate(nextProps, nextState){
		if(this.state.defatultTab !== nextState.defatultTab) {
		let source = $.get('http://localhost:8888/src/components/server.js?since=' + nextState.defatultTab );
			source.then(
			value => this.setState({
				loading: false,
				data: value
			}),
			error => this.setState({
				loading: false,
				error: error
			}));
		}
	}
	/* 由组件中<Navigation tab = {tabData} currentTab={this.changeCuurentTab}/>currentTab={this.changeCuurentTab}传递当前changeCuurentTab函数
	 * 在Navigation组件中调用该函数changeCuurentTab改变defatultTab的什,会有一次渲染
	 */
	changeCuurentTab(v) {
		this.setState({
			defatultTab: v
		});
	}
	render() {
		// if(this.state.loading) {
		// 	return '';
		// } else {
		// 	return <span>Loading</span>;
		// }

		// if(this.state.error !== null ) {
		// 	return '';
		// } else {
		// 	return <span>Error: {this.state.error}</span>;
		// }
		console.log(this.state.defatultTab);
		let page = this.state.data || '[]';
		let dataCon = JSON.parse(page);
		console.log(dataCon);
		let dataArry = [];
		dataCon.map(function(v, i){
			let index = i + 1;
			let listHtml = <Panel header={v.aHrefText} key={index}>
				<p>{v.des}</p>
				</Panel>;
			return dataArry.push(listHtml);
		});

		let tabData = ['daily', 'weekly', 'monthly'];
		let ulHtml = <Collapse bordered={true} defaultActiveKey={['1']}>{dataArry}</Collapse>;
		return (
			<Navigation tab = {tabData} currentTab={this.changeCuurentTab} tabActive={this.state.defatultTab} ulHtml = {ulHtml}/>
		);
	}
}

ReactDOM.render(
	<Main />,
    document.getElementById('content')
);

