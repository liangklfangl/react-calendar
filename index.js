"use strict";

import React from "react";
import PropTypes from "prop-types";
import { DatePicker, Col, Row, Radio, Button, Checkbox } from "antd";
import moment from "moment";
import deepCopy from "deepcopy";
import { rowData, ColsCkSts as defaultColsSts } from "./utils";
require("./index.less");
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
class AowsomeCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.time2IndexMap = {};
    this.dataBeforeChange = {};
    this.state = {
      //startDate,endDate是moment类型
      startDate: this.props.startDate
        ? moment(this.props.startDate).format("YYYY-MM-DD")
        : null,
      endDate: this.props.endDate
        ? moment(this.props.endDate).format("YYYY-MM-DD")
        : null,
      options: [],
      defaultHeaderChecked: defaultColsSts,
      //Header是否选中
      dataMode: this.props.timeType || "total",
      rangePicker: [
        this.props.startDate ? moment(this.props.startDate) : null,
        this.props.endDate ? moment(this.props.endDate) : null
      ]
      // 时间范围选择，因为要将startTime,endTime发送过去，编辑的时候也要解析
    };
  }
  /**
 * 每次日期改变的时候触发
 */
  onAwesomeDateChange = data => {
    // debugger
    this.props.onChange({
      timeType: this.state.dataMode,
      ...data
    });
  };
  /**
   * 计算两个时间之间的日期
   */
  getDateDiff = (startDate, endDate) => {
    if (!startDate) {
      return 0;
    }
    const startTime = new Date(
      Date.parse(startDate.replace(/-/g, "/"))
    ).getTime();
    const endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
    const dates = Math.abs(startTime - endTime) / (1000 * 60 * 60 * 24);
    return dates + 1;
  };

  /**
   * 告诉外层Form数据已经发生改变
   */
  notifyUpperForm = () => {
    // console.log('this.sumbitDate()>>>>>',this.sumbitDate());
    const calendarDay = {
      date: this.sumbitDate(),
      startTime: this.state.startDate,
      endTime: this.state.endDate
    };
    this.onAwesomeDateChange(calendarDay);
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data) {
      return;
    }
    const options = this.generateDefaultOptions(deepCopy(nextProps.data));
    // console.log('componentWillReceiveProps....startTime---->',moment(nextProps.startDate).format("YYYY-MM-DD"));
    // console.log('componentWillReceiveProps.....endTime===>',moment(nextProps.endDate).format("YYYY-MM-DD"));
    // console.log('componentWillReceiveProps....startTime---->',(nextProps.startDate));
    // console.log('componentWillReceiveProps.....endTime===>',(nextProps.endDate));
    this.setState(
      {
        startDate: moment(nextProps.startDate).format("YYYY-MM-DD"),
        endDate: moment(nextProps.endDate).format("YYYY-MM-DD"),
        dataMode: nextProps.timeType,
        options: options,
        rangePicker: [
          nextProps.startDate ? moment(nextProps.startDate) : null,
          nextProps.endDate ? moment(nextProps.endDate) : null
        ]
      },
      () => {
        const dayGap = this.getDateDiff(
          this.state.startDate,
          this.state.endDate
        );
        for (let i = 0; i < dayGap; i++) {
          const yearDay = moment(this.state.startDate)
            .add(i, "days")
            .format("YYYY-MM-DD");
          this.time2IndexMap[i] = yearDay;
        }
        const options = this.generateDefaultOptions(deepCopy(nextProps.data));
        this.setState({
          options
        });
        // const onChange = nextProps.onChange;
        const calendarDay = {
          date: nextProps.data,
          startTime: this.state.startDate,
          endTime: this.state.endDate
        };
        this.onAwesomeDateChange(calendarDay);
        // if (onChange) {
        //   onChange(calendarDay);
        // }
      }
    );
  }
  /**
   * 将根据数据重新构建options，添加阶段不做任何处理
   */
  componentDidMount() {
    if (!this.props.data) {
      return;
    }
    // console.log('产生的options为:',this.props.data);
    const options = this.generateDefaultOptions(deepCopy(this.props.data));
    this.setState(
      {
        startDate: moment(this.props.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.props.endDate).format("YYYY-MM-DD"),
        dataMode: this.props.timeType,
        options: options
      },
      () => {
        const dayGap = this.getDateDiff(
          this.state.startDate,
          this.state.endDate
        );
        for (let i = 0; i < dayGap; i++) {
          const yearDay = moment(this.state.startDate)
            .add(i, "days")
            .format("YYYY-MM-DD");
          this.time2IndexMap[i] = yearDay;
        }
        const options = this.generateDefaultOptions(deepCopy(this.props.data));
        this.dataBeforeChange = deepCopy(options);

        this.setState({
          options
        });
        console.log("组件挂载的时候this.dataBeforeChange", this.dataBeforeChange);
        // const onChange = this.props.onChange;
        const calendarDay = {
          date: this.props.data,
          startTime: this.state.startDate,
          endTime: this.state.endDate
        };
        this.onAwesomeDateChange(calendarDay);
      }
    );
  }
  /**
   * 反选
   */
  revertChoose = () => {
    this.clearCols();
    let optionsCopy = this.state.options.concat();
    for (let m = 0, len = optionsCopy.length; m < len; m++) {
      for (let n = 0; n < optionsCopy[m].length; n++) {
        const rowData = optionsCopy[m][n];
        rowData.defaultChecked
          ? (rowData.defaultChecked = false)
          : (rowData.defaultChecked = true);
        rowData.value == 0 ? (rowData.value = 1) : (rowData.value = 0);
        if (n == 0) {
          optionsCopy[m][0].defaultChecked = false;
        }
      }
    }
    this.dataBeforeChange = deepCopy(optionsCopy);
    this.setState({
      options: optionsCopy
    });
    this.notifyUpperForm();
  };

  clearCheckedWithoutNotify = () => {
    const thsChecked = this.state.defaultHeaderChecked.concat();
    for (let i = 0; i < thsChecked.length; i++) {
      thsChecked[i].checked = false;
    }
    let optionsCopy = this.state.options.concat();
    for (let m = 0, len = optionsCopy.length; m < len; m++) {
      for (let n = 0; n < optionsCopy[m].length; n++) {
        const rowData = optionsCopy[m][n];
        rowData.defaultChecked = false;
        rowData.value = 0;
      }
    }
    this.setState({
      options: optionsCopy,
      defaultHeaderChecked: false,
      defaultHeaderChecked: thsChecked
    });
  };
  /**
   *
   * 清空选中状态
   */
  clearChecked = () => {
    const thsChecked = this.state.defaultHeaderChecked.concat();
    for (let i = 0; i < thsChecked.length; i++) {
      thsChecked[i].checked = false;
    }
    let optionsCopy = this.state.options.concat();
    for (let m = 0, len = optionsCopy.length; m < len; m++) {
      for (let n = 0; n < optionsCopy[m].length; n++) {
        const rowData = optionsCopy[m][n];
        rowData.defaultChecked = false;
        rowData.value = 0;
      }
    }
    this.dataBeforeChange = deepCopy(optionsCopy);
    this.setState({
      options: optionsCopy,
      defaultHeaderChecked: false,
      defaultHeaderChecked: thsChecked
    });
    this.notifyUpperForm();
  };

  /**
   * 清除所有列的数据
   */
  clearCols = () => {
    const thsChecked = this.state.defaultHeaderChecked.concat();
    for (let i = 0; i < thsChecked.length; i++) {
      thsChecked[i].checked = false;
    }
  };
  /**
 * 选择周末
 */
  chooseWeekend = () => {
    this.clearCols();
    const { weekend } = this.getWorkdayWeekend();
    let optionsCopy = this.state.options.concat();
    this.clearChecked();
    for (let i = 0; i < weekend.length; i++) {
      this.rowChecked({
        target: {
          checked: true,
          rowNum: weekend[i]
        }
      });
    }
    this.notifyUpperForm();
  };
  /**
   * 将所有的工作日选中
   */
  chooseWorkday = e => {
    this.clearCols();
    const { workday } = this.getWorkdayWeekend();
    let optionsCopy = this.state.options.concat();
    this.clearChecked();
    for (let i = 0; i < workday.length; i++) {
      this.rowChecked({
        target: {
          checked: true,
          rowNum: workday[i]
        }
      });
    }
    // const onChange = this.props.onChange;
    // if (onChange) {
    //   onChange(this.sumbitDate());
    // }
    this.notifyUpperForm();
  };
  /**
   * 得到工作日和周末
   */
  getWorkdayWeekend = () => {
    const { startDate, endDate } = this.state;
    const workday = [];
    const weekend = [];
    const dayGap = this.getDateDiff(this.state.startDate, this.state.endDate);
    // new Date(endDate).getDate() - new Date(startDate).getDate() + 1;
    for (let i = 0; i < dayGap; i++) {
      const yearDay = moment(startDate)
        .add(i, "days")
        .format("YYYY-MM-DD");
      const currentDay = new Date(yearDay).getDay();
      if (currentDay == 6 || currentDay == 0) {
        weekend.push(i);
        continue;
      }
      workday.push(i);
    }
    return {
      weekend,
      workday
    };
  };
  /**
 * 选中某一行
 */
  rowChecked = e => {
    const { rowNum, checked, rowLabelSelect } = e.target;
    let optionsCopy = this.state.options.concat();
    // 特定的行
    const rowData = optionsCopy[rowNum];
    // 第0个表示左边的label
    const firstCol = rowData.shift();
    firstCol.defaultChecked = !firstCol.defaultChecked;
    for (let j = 0, length = rowData.length; j < length; j++) {
      if (checked) {
        // 选中这一行
        rowData[j].defaultChecked = true;
        rowData[j].value = 1;
      } else {
        rowData[j].defaultChecked = false;
        rowData[j].value = 0;
      }
    }
    rowData.unshift(firstCol);
    optionsCopy[rowNum] = rowData;
    this.dataBeforeChange = deepCopy(optionsCopy);
    this.setState({
      options: optionsCopy
    });
    this.notifyUpperForm();
  };
  /**
 * 选中某一列
 */
  checkCols = e => {
    const { cols, checked } = e.target;
    const optionsCopy = this.state.options.concat();
    const thCKSts = this.state.defaultHeaderChecked.concat();
    for (let i = 0; i < thCKSts.length; i++) {
      if (i == cols) {
        thCKSts[cols].checked = true;
      }
    }
    for (let n = 0, len = optionsCopy.length; n < len; n++) {
      for (let m = 0, length = optionsCopy[n].length; m < length; m++) {
        if (m == cols) {
          //表示选中这一列
          if (checked) {
            optionsCopy[n][m + 1].defaultChecked = true;
            optionsCopy[n][m + 1].value = 1;
          } else {
            optionsCopy[n][m + 1].defaultChecked = false;
            optionsCopy[n][m + 1].value = 0;
          }
        }
      }
    }
    this.dataBeforeChange = deepCopy(optionsCopy);
    this.setState({
      options: optionsCopy,
      defaultHeaderChecked: thCKSts
    });
    // const onChange = this.props.onChange;
    // if (onChange) {
    //   onChange(this.sumbitDate());
    // }
    this.notifyUpperForm();
  };
  /**
   *
   * 表格标题
   */
  getThead = () => {
    return (
      <tr>
        <th
          style={{
            width: "50px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          <span>Date</span>
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          <span>00</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[0].checked}
            cols={0}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>01</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[1].checked}
            cols={1}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>02</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[2].checked}
            cols={2}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>03</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[3].checked}
            cols={3}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>04</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[4].checked}
            cols={4}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>05</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[5].checked}
            cols={5}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>06</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[6].checked}
            cols={6}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>07</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[7].checked}
            cols={7}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>08</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[8].checked}
            cols={8}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>09</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[9].checked}
            cols={9}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>10</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[10].checked}
            cols={10}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>11</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[11].checked}
            cols={11}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>12</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[12].checked}
            cols={12}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>13</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[13].checked}
            cols={13}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>14</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[14].checked}
            cols={14}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>15</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[15].checked}
            cols={15}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>16</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[16].checked}
            cols={16}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>17</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[17].checked}
            cols={17}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>18</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[18].checked}
            cols={18}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>19</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[19].checked}
            cols={19}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>20</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[20].checked}
            cols={20}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>21</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[21].checked}
            cols={21}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>22</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[22].checked}
            cols={22}
          />
        </th>
        <th
          style={{
            width: "30px",
            height: "40px",
            border: "1px solid #e9e9e9",
            marginLeft: "5px",
            lineHeight: "20px"
          }}
        >
          {" "}
          <span>23</span>
          <br />
          <Checkbox
            onChange={this.checkCols}
            checked={this.state.defaultHeaderChecked[23].checked}
            cols={23}
          />
        </th>
      </tr>
    );
  };
  /**
 * 全天候投放还是指定时间投放
 *
 */
  onDateModeChange = e => {
    this.clearCheckedWithoutNotify();
    //里面通过setState清除options的状态了，所有的状态都修改为false了
    const dayGap = this.getDateDiff(this.state.startDate, this.state.endDate);
    let options = this.generatePureOptions({
      startDate: this.state.startDate,
      endDate: this.state.endDate
    });
    //指定时间投放
    if (e.target.value == "2") {
      options = deepCopy(this.dataBeforeChange);
      // console.log('切换到指定时间的时候数据为:',this.dataBeforeChange);
    }
    // console.log('改变模式后产生的options为>>>>>>>',this.state.options);
    //每次切换时间要修改time2IndexMap对象
    for (let j = 0; j < dayGap; j++) {
      const yearDay = moment(this.state.startDate)
        .add(j, "days")
        .format("YYYY-MM-DD");
      this.time2IndexMap[j] = yearDay;
    }
    this.setState(
      {
        dataMode: e.target.value,
        options
      },
      () => {
        this.notifyUpperForm();
      }
    );
  };
  /**
   * 得到时间比特
   */
  generateHourBit = hourBitsArray => {
    return this.state.dataMode == "total"
      ? "111111111111111111111111"
      : hourBitsArray.reduce(function(pre, cur) {
          return pre + cur.value;
        }, "");
  };
  /**
   * 用于将二维数组转化为0，1字符串
   */
  sumbitDate = () => {
    // console.log('this.state.dataMode>>>>',this.state.dataMode);
    // console.log('Object.keys(taskTimeEnumsMap)[0]>>>',Object.keys(taskTimeEnumsMap)[0]);
    // console.log('this.state.options>>>',this.state.options);
    if (this.state.dataMode == "total") {
      //用户没有选中任何数据，要根据时间段来选择
      const wholeTime = [];
      const dayGap = this.getDateDiff(this.state.startDate, this.state.endDate);
      for (let j = 0; j < dayGap; j++) {
        const taskDate = this.time2IndexMap[j];
        const hourBit = this.generateHourBit();
        wholeTime.push({
          taskDate,
          hourBit
        });
      }
      return wholeTime;
    }
    const submitData = this.state.options.concat();
    const timeArray = [];
    // console.log("时间对象数据为this.state.options.concat---->:", submitData);
    for (let k = 0, len = submitData.length; k < len; k++) {
      const taskDate = this.time2IndexMap[k];
      const hourBit = this.generateHourBit(submitData[k].slice(1));
      // 得到了我们的每一个日期的时间比特
      timeArray.push({
        taskDate,
        hourBit
      });
    }
    // console.log("提交到服务端的数据为:", timeArray);
    return timeArray;
  };
  /**
   * 某一个checkbox的状态改变了
   */
  onCheckedChanged = e => {
    const { colId, rowId } = e.target;
    const options2Update = this.state.options.concat();
    // !undefined为true
    options2Update[rowId][colId + 1].defaultChecked = !options2Update[rowId][
      colId + 1
    ].defaultChecked;
    options2Update[rowId][colId + 1].value =
      options2Update[rowId][colId + 1].value == 0 ? 1 : 0;
    // console.log('设置checked之后的值为:',options2Update);
    this.dataBeforeChange = deepCopy(options2Update);
    this.setState({
      options: options2Update
    });
    this.notifyUpperForm();
  };
  /**
   * 每次选择时间都要重新更新我们的options
   *
   */
  updateData = () => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(this.sumbitDate());
    }
    const rowContainers = [];
    const dayGap = this.getDateDiff(this.state.startDate, this.state.endDate);
    // new Date(this.state.endDate).getDate() -
    // new Date(this.state.startDate).getDate() +
    // 1;
    // 构建一个时间和this.state.options的对应关系
    for (let j = 0; j < dayGap; j++) {
      const day = moment(this.state.startDate)
        .add(j, "days")
        .format("MM-DD");
      const yearDay = moment(this.state.startDate)
        .add(j, "days")
        .format("YYYY-MM-DD");
      this.time2IndexMap[j] = yearDay;
      //  用于将每一个二维数组的元素对应于某一个日期
      let rowDataCopy = deepCopy(rowData);
      //  (1)这里遇到一个问题，我们不能使用concat而必须使用deepCopy
      rowDataCopy.unshift({
        label: day,
        value: day
      });
      //得到一个数组的副本
      rowContainers.push(rowDataCopy);
    }
    this.setState({
      options: rowContainers
    });
  };

  /**
   * 返回当前服务端返回的数据是具体的那个下标
   */
  findEditRowDate = (defaultOptions, taskDate) => {
    for (let j = 0; j < defaultOptions.length; j++) {
      const item = defaultOptions[j];
      //  console.log('item[0].taskDate------',moment(item[0].taskDate).format('MM-DD'));
      //  console.log('item[0].taskDate1------',moment(taskDate).format('MM-DD'));
      if (
        moment(item[0].taskDate).format("MM-DD") ==
        moment(taskDate).format("MM-DD")
      ) {
        return j;
      }
    }
    return "NO";
  };

  /**
   * 默认编辑的时候componentDidMount产生的options集合
   */
  generateDefaultOptions = data => {
    const startDate = moment(this.props.startDate).format("YYYY-MM-DD");
    const endDate = moment(this.props.endDate).format("YYYY-MM-DD");
    const dayGap = this.getDateDiff(startDate, endDate);
    console.log("默认的时间>>>>>>>>", dayGap);
    const defaultOptions = [];
    for (let i = 0; i < dayGap; i++) {
      // const { taskDate, hourBit } = data[i];
      // const option = [];
      // option.push({
      //   taskDate,
      //   defaultChecked: false
      // });
      // for (let j = 0; j < hourBit.length; j++) {
      //   if (hourBit[j] == 1) {
      //     option.push({
      //       value: 1,
      //       defaultChecked: true
      //     });
      //   } else {
      //     option.push({
      //       value: 0,
      //       defaultChecked: false
      //     });
      //   }
      // }
      // {
      //   "id": 328,
      //   "gmtCreate": 1513064517000,
      //   "gmtModified": 1513064517000,
      //   "taskId": 90,
      //   "projectId": 94,
      //   "positionId": 95,
      //   "taskDate": 1513353600000,
      //   "hourBit": "111111111111111111111111",
      //   "rowStatus": 1,
      //   "creator": "114318",
      //   "modifier": "114318"
      // }
      const option = [];
      option.push({
        taskDate: moment(startDate)
          .add(i, "days")
          .format("MM-DD"),
        defaultChecked: false
      });
      for (let j = 0; j < 24; j++) {
        option.push({
          value: 0,
          defaultChecked: false
        });
      }
      defaultOptions.push(option);
    }

    //上面产生的是纯空数据，下面是根据某一天的值进行更新空数据
    for (let i = 0; i < data.length; i++) {
      const { taskDate, hourBit } = data[i];
      const index = this.findEditRowDate(defaultOptions, taskDate);
      const option = [];
      if (index == "NO") {
        continue;
      }
      for (let j = 0; j < hourBit.length; j++) {
        if (hourBit[j] == 1) {
          option.push({
            value: 1,
            defaultChecked: true
          });
        } else {
          option.push({
            value: 0,
            defaultChecked: false
          });
        }
      }

      defaultOptions[index].splice(1);
      // console.log("得到我的下标为-----------", newOpst);
      defaultOptions[index].push(...option);
    }
    console.log("defaultOptions>>>>>>>>>>", defaultOptions);
    return defaultOptions;
  };

  /**
   * 根据this.state.options来产生我们的行
   */
  generateRows = () => {
    const rows = [];
    for (let i = 0; i < this.state.options.length; i++) {
      const row = (
        <tr key={"row" + i}>{this.generateTds(this.state.options[i], i)}</tr>
      );
      rows.push(row);
    }
    return rows;
  };

  /**
   *  要查看产生多少行数据才行
   */
  generateTds = (rowData, days) => {
    const checkboxGroupData = rowData.slice(1);
    const tdContainers = [];
    for (let i = 0; i < rowData.length; i++) {
      // 只有rowId和colId组合起来才会是唯一的，否则
      let td = null;
      if (i != 0) {
        td = (
          <td
            key={"col" + i}
            style={{
              width: "30px",
              height: "30px",
              border: "1px solid #e9e9e9",
              lineHeight: "30px",
              textAlign: "center"
            }}
          >
            <Checkbox
              rowId={days}
              colId={i - 1}
              key={"checkbox" + i + "day_" + days}
              onChange={this.onCheckedChanged}
              checked={rowData[i].defaultChecked}
            />
          </td>
        );
      } else {
        td = (
          <td
            key={"col" + i}
            style={{
              width: "70px",
              height: "30px",
              border: "1px solid #e9e9e9",
              marginLeft: "5px",
              lineHeight: "30px",
              textAlign: "center"
            }}
          >
            <span key={"col_data_" + i} style={{ marginRight: "5px" }}>
              {moment(this.state.startDate)
                .add(days, "days")
                .format("MM-DD")}
            </span>
            <Checkbox
              key={"checkbox_row" + days}
              rowNum={days}
              checked={rowData[i].defaultChecked}
              onChange={this.rowChecked}
            />
          </td>
        );
      }
      tdContainers.push(td);
    }
    return tdContainers;
  };

  /**
   * 每次日期改变，我们产生新的options
   */
  generatePureOptions = ({ startDate, endDate }) => {
    const rowContainers = [];
    const dayGap = this.getDateDiff(startDate, endDate);
    // new Date(endDate).getDate() - new Date(startDate).getDate() + 1;
    // 构建一个时间和this.state.options的对应关系
    for (let j = 0; j < dayGap; j++) {
      const day = moment(startDate)
        .add(j, "days")
        .format("MM-DD");
      const yearDay = moment(startDate)
        .add(j, "days")
        .format("YYYY-MM-DD");
      this.time2IndexMap[j] = yearDay;
      let rowDataCopy = deepCopy(rowData);
      rowDataCopy.unshift({
        label: day,
        value: day
      });
      rowContainers.push(rowDataCopy);
    }
    return rowContainers;
  };

  /**
  * 今日以前直接不允许选择
  */
  disabledDate = current => {
    return current && current.valueOf() < Date.now();
  };
  /**
 * 日期选择改变,我们默认要产生空的options集合
 */
  onDateChange = (date, dateString) => {
    this.clearCols();
    // 日期改变清空header选中状态
    const [startDate, endDate] = dateString;
    const dayGap = this.getDateDiff(startDate, endDate);
    for (let j = 0; j < dayGap; j++) {
      const yearDay = moment(this.state.startDate)
        .add(j, "days")
        .format("YYYY-MM-DD");
      this.time2IndexMap[j] = yearDay;
    }
    const options = this.generatePureOptions({ startDate, endDate });
    //必须先更新options
    this.dataBeforeChange = deepCopy(options);
    this.setState(
      {
        startDate,
        endDate,
        options,
        rangePicker: [moment(startDate), moment(endDate)]
      },
      () => {
        this.updateData();
        this.notifyUpperForm();
      }
    );
  };

  render() {
    // console.log('taskTimeEnumsMap>>>>>>>',taskTimeEnumsMap);
    return (
      <div className={"owsome"}>
        <Row>
          <Col span={4}>
            <label style={{ marginRight: "20px", fontSize: "14px" }}>
              Date:
            </label>
          </Col>
          <Col span={8}>
            {/* {this.props.getFieldDecorator("rangePicker", {
              initialValue: this.state.rangePicker
            })( */}
            <RangePicker
              disabledDate={this.disabledDate}
              onChange={this.onDateChange}
              value={this.state.rangePicker}
            />
            {/* )} */}
          </Col>
        </Row>
        <Row
          style={{
            marginTop: "20px",
            lineHeight: "50px"
          }}
        >
          <Col span={4}>
            <label style={{ marginRight: "20px", fontSize: "14px" }}>
              Timetype:
            </label>
          </Col>
          <Col span={8}>
            {/* {this.props.getFieldDecorator("timeType", {
              initialValue: this.state.dataMode
            })( */}
            <RadioGroup
              onChange={this.onDateModeChange}
              defaultValue={this.state.dataMode}
            >
              <Radio value={"total"}>All Day</Radio>
              <Radio value={"specify"}>Special Date</Radio>
            </RadioGroup>
            {/* )} */}
          </Col>
        </Row>
        {this.state.dataMode == "total"  ? null : (
          <div>
            <Row
              style={{
                marginTop: "20px",
                lineHeight: "50px"
              }}
            >
              <Col style={{ marginLeft: "110px" }}>
                <Button className={"day"} onClick={this.chooseWorkday}>
                  Workday
                </Button>
                <Button className={"day"} onClick={this.chooseWeekend}>
                  Weekend
                </Button>
                <Button className={"day"} onClick={this.revertChoose}>
                  Revert
                </Button>
                <Button className={"day"} onClick={this.clearChecked}>
                  Clear
                </Button>
              </Col>
            </Row>
            <Row
              style={{
                marginTop: "20px",
                lineHeight: "50px"
              }}
            >
              <Col style={{ marginLeft: "110px" }}>
                <table>
                  <thead>{this.getThead()}</thead>
                  <tbody>{this.props.data ? this.generateRows() : null}</tbody>
                </table>
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

AowsomeCalendar.propTypes = {};

AowsomeCalendar.displayName = "AowsomeCalendar";

export default AowsomeCalendar;
