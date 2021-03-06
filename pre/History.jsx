var React = require('react');
var Link = require('react-router').Link;
var Helmet = require('react-helmet');
module.exports = React.createClass({
  displayName:'History',
  getInitialState: function(){
    return {
      recordList:[],
      filter:{event:'all',keyword: ''}
    };
  },
  componentDidMount: function(){
    getDB('history_records',function(recordList){
      this.setState({recordList:recordList});
    }.bind(this));
  },
  updateFilter: function(e){
    var id=e.target.id;
    var value=e.target.value;
    this.setState(function(prevState){
      prevState.filter[id]=value;
      return prevState;
    });
  },
  clearHistory: function(){
    swal({
        title: GL('are_you_sure'),
        text: GL('ls_5'),
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: GL('ls_29'),
        cancelButtonText: GL('cancel'),
        closeOnConfirm: true
    },
    function(){
      setDB('history_records',null,function(){
        chrome.runtime.sendMessage({job:'clearHistory'});
        chrome.notifications.create({
          type:'basic',
          iconUrl: '/images/icon_128.png',
          title: GL('history_cleared'),
          message: GL('ls_6'),
        });
        getDB('history_records',function(recordList){
          this.setState({recordList:recordList});
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  render: function(){
    var filter=this.state.filter;
    var pattern=new RegExp(filter.keyword,'i');
    var recordList=(this.state.recordList||[{name:GL('ls_30'),id:'mgehojanhfgnndgffijeglgahakgmgkj'}]).map(function(record,index){
      if((filter.event=='all'||record.event==filter.event)&&(filter.keyword==''||pattern.exec(record.name))){
        return(
          <tr key={index}>
            <td>{timeagoInstance.format(record.date,'locale')}</td>
            <td className={record.event}>{GL(record.event)}</td>
            <td><img src={record.icon} /></td>
            <td><Link title={record.name} to={"/app?id="+record.id}>{record.name}</Link></td>
            <td>{record.version}</td>
          </tr>);
      }
      else{
        return null;
      }
    }).reverse();
    return(
      <div className="section container" id="history">
        <Helmet
          title="History"
        />
        <div className="actionBar">
          <select onChange={this.updateFilter} id="event">
            <option value="all">{capFirst(GL('all'))}</option>
            <option value="installed">{capFirst(GL('installed'))}</option>
            <option value="updated">{capFirst(GL('updated'))}</option>
            <option value="removed">{capFirst(GL('removed'))}</option>
            <option value="enabled">{capFirst(GL('enabled'))}</option>
            <option value="disabled">{capFirst(GL('disabled'))}</option>
          </select>
          <input id="keyword" onChange={this.updateFilter} type="text" placeholder={GL('filter')}/>
          <div className="btn" onClick={CW.bind(null,this.clearHistory,'Options','clearHistory','')}>{GL('clear')}</div>
        </div>
        <table className="history-table">
          <thead>
            <tr>
              <th>{capFirst(GL('when'))}</th>
              <th>{capFirst(GL('event'))}</th>
              <th>{capFirst(GL('icon'))}</th>
              <th>{capFirst(GL('name'))}</th>
              <th>{capFirst(GL('version'))}</th>
            </tr>
          </thead>
          <tbody>
            {recordList}
          </tbody>
        </table>
      </div>
    );
  }
});
