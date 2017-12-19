'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import AwesomeCalendar from './index';
import moment from "moment";
const startDate = +new Date('2017-11-01');
const endDate = +new Date('2017-11-03');
const dataMode = "specify";
const params = {
  startDate,
  endDate,
  onChange:function(data){
    console.log('上层组件接受到的值为:',data);
  },
  timeType:dataMode,
  data:[
    {
      taskDate: "2017-11-01",
      hourBit: "111111110011111111111111"
    },
    {
      taskDate: "2017-11-02",
      hourBit: "111111111001111111111111"
    },
    {
      taskDate: "2017-11-03",
      hourBit: "111001111111111111111111"
    }
  ]
};
class Test extends React.Component {
  render() {
    return <AwesomeCalendar {...params}/>;
  }
}
ReactDOM.render(<Test />, document.getElementById('app'));
window.AwesomeCalendar = AwesomeCalendar;
