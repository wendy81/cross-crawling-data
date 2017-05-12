'use strict';

const React = require('react');
const { Tabs } = require('antd');
const TabPane = Tabs.TabPane;
const List = require('./list');

require('antd/dist/antd.css');

class Main extends React.Component {
	constructor(props) {
		super(props);
	}
	chagenActive (v, e) {
		e.preventDefault();
		console.log('000000');
		if(this.props.currentTab(v) !== undefined) {
			this.props.currentTab(v);
		}
	}
	render() {
		tabData.map((v, i) => {
			let listHtml;
			listHtml = <TabPane tab={v} key={i}><List currentTab = {this.props.tabActive}/></TabPane>;
			tabList.push(listHtml);
		});
		return (
			<Tabs defaultActiveKey="1">
				{tabList}
			</Tabs>
		);
	}
}

ReactDOM.render(
	<Main />,
    document.getElementById('content')
);

