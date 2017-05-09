'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');

import Tabs from 'antd/lib/tabs';
import Collapse from 'antd/lib/collapse';
// import { Spin } from 'antd';
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
require('antd/dist/antd.css');

const $ = require('jquery');

class Main extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		let tabData = ['daily', 'weekly', 'monthly'];
		let tabList = [];
		tabData.map((v, i) => {
			let listHtml;
			listHtml = <TabPane tab={v} key={i}>
				<List currentTab = {v}/>
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
	//初始化渲染执行之后立刻调用一次
	componentDidMount() {
		let source = $.get('http://localhost:8888/src/components/server.js?since=' + this.props.currentTab);
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
	componentWillUpdate(nextProps){
		//如何判断现在this.props.currentTab和nextProps.currentTab相同,但是仍然加载了新的数据
		if(this.props.currentTab !== nextProps.currentTab) {
		let source = $.get('http://localhost:8888/src/components/server.js?since=' + nextProps.currentTab );
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
	const customPanelStyle = {
		background: '#fff',
		borderRadius: 0,
		marginBottom: 0,
		border: 0
	};
	let page = this.state.data || '[]';
		let dataCon = JSON.parse(page);
		let dataArry = [];

		// if(dataCon[0]) {
			dataCon.map(function(v, i) {
				let index = i + 1;
				let listHtml = <Panel header={v.aHrefText} key={index} style={customPanelStyle}>
					<p>{v.des}</p>
					</Panel>;
				dataArry.push(listHtml); });
		// } else {
		// 	dataArry.push(<Spin />);
		// }
		return (
			<Collapse style={{margin: '20px', marginTop: '-10px', broderTop: '#fff 1px solid'}} bordered={true} defaultActiveKey={['1']}>{dataArry}</Collapse>
		);
	}
}

ReactDOM.render(
	<Main />,
    document.getElementById('content')
);
