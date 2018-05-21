<template>
  <div id="HomeWrapper" class="page">
    <page-header>
      <header-link :left="true" :edge="true"><icon icon="myaccount" @click.native="accountEvt"></icon></header-link>
      <header-title>微喵收银</header-title>
      <header-link><icon icon="search" @click.native="searchEvt"></icon></header-link>
    </page-header>
    <second-header>
      <div class="tab-container">
        <div>
          <ul class="nav nav-tabs">
            <li v-for="(item, index) in tabList" :class="{'dropdown': item['seclist'], 'active': index == mutableActive}" >
                <a href="javascript:void(0)" v-if="!item['seclist']" data-toggle="tab" :data-id=item.areaid @click="changeTab(index,$event)">
                  {{item.name}}
                </a>
                <a href="javascript:void(0)" v-if="item['seclist']" class="dropdown-toggle" id="dropdown-menu" data-toggle="dropdown" :data-id=item.areaid>
                    {{item.name}}
                    <b class="caret"></b>
                </a>
                <ul v-if="item['seclist']" class="dropdown-menu" role="menu" aria-labelledby="dropdown-menu" >
                  <li v-for="(sitem, index) in item['seclist']">
                     <a href="javascript:void(0)" data-toggle="tab" :data-id=sitem.areaid @click="changeTab(index,$event)">
                      {{sitem.name}}
                    </a>
                  </li>
                </ul>
             </li>
          </ul>
        
        </div>
      </div>
    </second-header>
    <page-content>
      <!-- <scroll :on-refresh="onRefresh" :on-infinite="onInfinite"> -->
        <div class="grids grids-small" id="list" v-show="!showLoading">
          <a href="javascript: void(0)" class="grid" v-for="(table,index) in tableList" v-if="tableList.length">
           <div class="free item" v-if="table.status==0" :data-tableId=table.tableid  @click="open(index,$event)">
              <div class="content">
                <p class="area" ref=area>{{table.areaname}}</p><p class="number" ref=num>{{table.tableNo}}</p>
              </div>
              <div class="status">
                空闲
              </div>
            </div>
            <div class="ing item" :data-tableId=table.tableid :data-orderid=table.orderid :data-num=table.personNum :data-status=table.status v-if="table.status==1" @click="tabEvt(index, $event)">
              <div class="content">
                <p class="area" ref=area>{{table.areaname}}</p><p class="number" ref=num>{{table.tableNo}}</p>
              </div>
              <div class="status">
                <span class="money">￥{{Number(table.amount).toFixed(2) || "0.00"}}</span>
                <span class="lock"><img src="../../static/images/ic_timer.png" /></span>
              </div>
            </div>
           
            <div class="end item" v-if="table.status==2" :data-tableId=table.tableid :data-orderid=table.orderid :data-num=table.personNum :data-userid=table.userid :data-status=table.status @click="tabEvt(index, $event)">
              <div class="content">
                <p class="area" ref=area>{{table.areaname}}</p><p class="number" ref=num>{{table.tableNo}}</p>
              </div>
              <div class="status">
                <span class="money">￥{{Number(table.amount).toFixed(2) || "0.00"}}</span>
              </div>
            </div>
          </a>
          <div class="nodata" v-if="!tableList.length">{{nodata}}</div>
        </div>
        <!--  <infinite-loading :on-infinite="onInfinite" ref="infiniteLoading">
          <loading slot="spinner"></loading>
        </infinite-loading> -->
      <!-- </scroll> -->
       <loading v-show="showLoading"></loading>
    </page-content>

    <pop-window ref="p">
      <div class="box">
        <div class="header"><h5>开台</h5></div>
        <section>
          <div class="box-item">
            <label for="">桌号</label>
            <p class="tableNum"><span>{{openTableArea}}</span><span>{{openTableNum}}</span></p>
          </div>
          <div class="box-item">
            <label>人数</label>           
            <input type="number" name="openTableNumber" v-model="openTableNumber" style="width: 90%;font-size:.75rem;"/>
            <span class="unit">人</span>
          </div>
          <div class="box-item">
            <label>备注</label>
            <input type="text" name="mark" v-model="markContent" style="width: 100%;font-size:.75rem;"/>
          </div>
                  
        </section>
        <div class="btnWrap">
          <button class="open btn btn-block" @click="confirmOpen(1)">只开台</button>
          <button class="confirm btn btn-block" @click="confirmOpen(2)">开台点单</button>
          <button @click="closeDialog()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <preloader ref="preloader"></preloader>
    <toast :text="msgText" type="error" ref="msg"></toast>
    <div class="searchWrapper" v-show="searchType">
        <div class="">
          <form id="search-form" action="" :class="{open:searchType}">
            <fieldset>
              <input name="search-terms" type="search" placeholder="请输入桌台号" ref="searchInput" v-on:input ="autoSearchEvt($event)">
            </fieldset>
            <input type="button" value="关闭" @click="searchEvt">
          </form>
        </div>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle, HeaderLink, SecondHeader} from '../../node_modules/vum/src/components/header'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'
import { Tab, TabItem } from '../../node_modules/vum/src/components/tab'
import Scroll from '../../node_modules/vum/src/components/scroll'
import PopWindow from '../../node_modules/vum/src/components/popwindow'
import Toast from '../../node_modules/vum/src/components/toast'
import Loading from '../components/Loading'

export default {
  name: 'Home',
  components: {
    InfiniteLoading,
    Page,
    'page-content': Content,
    Scroll,
    'page-header': Header,
    HeaderTitle,
    HeaderLink,
    SecondHeader,
    Icon,
    Preloader,
    'm-button': Button,
    PopWindow,
    Toast,
    Tab,
    TabItem,
    Loading
  },

  data () {
    return {
        apiurl: localStorage.getItem('apiurl'),
        tabList: [{name: '全部', areaid: '-1'}, {name: '区域', areaid: '-2', seclist: []}, {name: '我的', areaid: '-3'}],
        tableList: [],
        mutableActive: 0,
        myTabList: [],
        localTableList: [], //本地数据
        openTableArea:'',
        openTableNum:'',
        tableID: '',
        typeIndex:0,
        openTableNumber:'', //开台人数
        markContent: '', //开台备注
        waiter: '',
        msgText: '',
        nodata: '暂无桌台列表',
        searchType: false,
        // searchList: [],
        searchVal: '', //搜索内容
        showLoading: true,
        // permissionUrl : '',
        tabCurSelected: '-1',
        interval: '',
        netError: '网络请求超时，请刷新重试'
    }
  },
  beforeRouteLeave (to, from , next) {
    clearInterval(this.interval);
    this.interval=''
    next();
  },
  watch: {
    openTableNumber() {
      if (this.openTableNumber.toString().length > 3) this.openTableNumber = Math.floor(this.openTableNumber / 10)
      if (Number(this.openTableNumber) <= 0) this.openTableNumber = ''
    }
  },
  created () {
    let self = this;
    // localStorage.setItem('branchId', '43990');
    this.getTabList();
    this.interval = setInterval(function(){
      self.getSocketList();
    },2000)
  },

  methods: {
    searchEvt () {
      this.searchVal = '';
      this.$refs['searchInput'].value = '';
      this.searchType = !this.searchType;
      this.tableList = this.localTableList;
      this.tabCurSelected = '-1';
      this.mutableActive = 0;
      $('.nav-tabs li:first').tab('show');
    },

    // 自动匹配搜索
    autoSearchEvt (evt) {
      let val = evt.target.value.toUpperCase();
      let len = this.localTableList.length;
      var arr = [];
      var reg = new RegExp(val);
      for(var i=0;i<len;i++){
          //如果字符串中不包含目标字符会返回-1
          if(this.localTableList[i]['tableNo'].match(reg)){
              arr.push(this.localTableList[i]);
          }
      }
      this.searchVal = val;
      this.tableList = arr;
    },

    // 个人中心链接
    accountEvt () {
      this.$router.push({ path: '/setting' })
    },

    // 开台操作
    open (index, e) {
        let tableID = e.currentTarget.dataset.tableid,
          area = this.$refs.area[index].innerText,
          num = this.$refs.num[index].innerText;
        this.tableID = tableID;
        this.openTableArea = area;
        this.openTableNum = num;
        this.$refs.p.open()
    },

    // 关闭开台窗口
    closeDialog () {
      this.$refs.p.close();
      this.openTableNumber = '';
      this.markContent = '';
    },

    // 桌台操作
    tabEvt (index, e) {
      let self = this;
      let tableID = e.currentTarget.dataset.tableid,
          area = this.$refs.area[index].innerText,
          num = this.$refs.num[index].innerText,
          status = e.currentTarget.dataset.status,
          orderid = e.currentTarget.dataset.orderid,
          f = {};
      if(status == 2) {
        let pNum = e.currentTarget.dataset.num,
          userid = e.currentTarget.dataset.userid;
        f = {
          'tableId':tableID,
          'tableNo':num,
          'peopleNum':pNum,
          'userId':userid,
          'branchId':localStorage.getItem("branchId"),
          'remark': '',
          'createOrSave':'0',
          'openPeople': localStorage.getItem('username'),
          'type': 1
        }
      }
      localStorage.setItem('tableID', tableID);
      localStorage.setItem('tableArea', area);
      localStorage.setItem('tableNum', num);
      localStorage.setItem('orderid', orderid);
      this.$http.get(this.apiurl + '/app/getTables?type=1&ucode='+localStorage.getItem('userid')+'&uname='+localStorage.getItem('name')+'&tableid='+tableID).then(function(res){
        if(res.data.code == 0) {
          var d = res.data.data;
          if(d == '') {
            if(status == 1) {
              self.$router.push({
                path:'/order'
              })
            }else if(status == 2) {
              self.$http.post(self.apiurl + '/api/employee/setorder', f).then(function(res){
                if(res.data.code == 0) {
                  self.$router.push({
                    path:'/order'
                  })
                }
              })
            }  
          }
        }else if(res.data.code == 1) {
          self.msgText = '对不起，当前'+res.data.data.replace('_', '|')+'正在操作该桌台';
          self.$refs.msg.open();
        }
      })
    },

    // nav切换
    changeTab (index, evt) {
      let tabSelected = evt.target.dataset.id,
        tables = this.localTableList;
      this.tableList = [];
      if(tabSelected == '-1') { //全部
        this.tableList = tables;
      }else if(tabSelected == '-3') { //我的
        this.tableList = this.myTabList;
      }else{
        let d = this.tabList[1].seclist;
        for(var i in tables) { //区域选择
          if(tables[i].areaid == tabSelected){
              this.tableList.push(tables[i])
            }
        }
        for(var j in d) {
          if(d[j].areaid == tabSelected) {
              this.tabList[1].name = d[j].name;
          }
        }
      }
      this.tabCurSelected = tabSelected;
      // this.searchList = this.tableList;
    },

    // getList () {
    //   this.$socket.emit(this.apiurl+'/api/employee/getTableAndType', {branchId: '', areaid: ''}, (response) =>{
    //     console.log(response);
    //   })
    // },

    // 获取桌台全部列表(包括我的)
    getTabList () {
      let branchId = localStorage.getItem("branchId");
      var self = this;
      var arr = [];
      arr.push(this.$http.post(this.apiurl+'/api/employee/getTableAndType', {branchId: branchId, areaid: ''}));
      arr.push(this.$http.get(this.apiurl+'/app/myOpenTable?code='+localStorage.getItem('userid')));
      this.$http.all(arr).then(function(res){
        self.showLoading = false;
        var res1 = res[0],
          res2 = res[1];
        if(res1.data.code == 0) {
          self.tabList[1].seclist = [];
          self.tableList = [];
          self.localTableList = [];
          // self.searchList = [];
          let tables = res1.data.data;
          $.each(tables, function(index, table){
            let obj = {};
            obj.name = table.areaname;
            obj.areaid = table.areaid;
            self.tabList[1].seclist.push(obj);
            $.each(table.tables, function(i, t){
                self.tableList.push(t);
                // self.searchList.push(t);
                self.localTableList.push(t);
            })
          });
        }
        if(res2.data.code == 0) {
          self.myTabList = res2.data.data;
        }
      }).catch(function(error){
        self.msgText = self.netError;
        self.$refs.msg.open();
        self.showLoading = false;
      })
    },

    // 轮询实时更新桌台状态信息
    getSocketList () {
      var self = this;
      var arr = [];
      arr.push(this.$http.post(this.apiurl+'/api/employee/getTableAndType', {branchId: localStorage.getItem("branchId"), areaid: ''}));
      arr.push(this.$http.post(this.apiurl+'/app/myOpenTable?code='+localStorage.getItem('userid')));
      this.$http.all(arr).then(function(res){
        var res1 = res[0],
          res2 = res[1];
        self.tableList = [];
        self.localTableList = [];
        // self.searchList = [];
        if(res1.data.code == 0) {
          let tables = res1.data.data;
          $.each(tables, function(index, table){
            $.each(table.tables, function(i, t){
                if(self.tabCurSelected == '-1') {
                  var reg = new RegExp(self.searchVal);
                  if(t.tableNo.match(reg)) {
                    self.tableList.push(t);
                  }
                  // self.searchList.push(t);
                }else if(self.tabCurSelected != '-3') {
                  if(t.areaid == self.tabCurSelected) {
                    self.tableList.push(t);
                    // self.searchList.push(t);
                  }
                }
              self.localTableList.push(t);
            })
          });
        }
        if(res2.data.code == 0) {
          self.myTabList = res2.data.data;
          if(self.tabCurSelected == '-3') {
            self.tableList = self.myTabList;
            // self.searchList = self.myTabList;
          }
        }
      })
    },

    // 确认开台
    confirmOpen (type) { //type: 1只开台，2开台下单
      var self = this;
      if(!this.openTableNumber) {
        this.msgText = '开台人数不能为空';
        this.$refs.msg.open();
        return false;
      }
      let form = {
        'tableId':this.tableID,
        'tableNo':this.openTableNum,
        'peopleNum':this.openTableNumber,
        'userId':localStorage.getItem("userid"),
        'branchId':localStorage.getItem("branchId"),
        'remark': this.markContent,
        'createOrSave':'0',
        // 'orderseq': new Date().getTime(),
        'openPeople': localStorage.getItem('username'),
        'type': 0
      }
      this.$http.post(this.apiurl + '/api/employee/setorder', form).then(function(res){
          if(res.data.code == 0){//返回新开桌台生成账单id并保存
            if(type == 1) {
              self.getTabList();
              self.$refs.p.close();
            }else if(type == 2) {
              localStorage.setItem('orderid',res.data.data.orderid);
              localStorage.setItem('tableID', self.tableID);
              localStorage.setItem('tableArea', self.openTableArea);
              localStorage.setItem('tableNum', self.openTableNum);
              self.$http.get(self.apiurl + '/app/getTables?type=1&ucode='+localStorage.getItem('userid')+'&uname='+localStorage.getItem('name')+'&tableid='+self.tableID).then(function(res){
                if(res.data.code == 0) {
                  self.$router.push({
                    path:'/order'
                  })
                }
              }) 
            }  
          }else{
            // self.$refs.p.close();
            self.msgText = res.data.message;
            self.$refs.msg.open();
          }
      })
    },

    showPreloader () {
      this.$refs.preloader.open()
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.$refs.preloader.close()
        this.$router.push({ path: '/home' })
      }, 3000)
    },

    onRefresh (done) {
      let self = this
      setTimeout(function () {
        self.time = new Date()
        done()  // call done
      }, 2000)
    },

     onInfinite () {
      setTimeout(() => {
        // this.loadMore()
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded')
      }, 1000)
    },
  },

  // socket: {
  //           // Prefix for event names 
  //           // prefix: "/counter/", 
            
  //           // If you set `namespace`, it will create a new socket connection to the namespace instead of `/` 
  //           // namespace: "/counter", 
 
  //           events: {
 
  //               // Similar as this.$socket.on("changed", (msg) => { ... }); 
  //               // If you set `prefix` to `/counter/`, the event name will be `/counter/changed` 
  //               // 
  //               changed(msg) {
  //                   console.log("Something changed: " + msg);
  //               }
                
  //               /* common socket.io events
  //               connect() {
  //                   console.log("Websocket connected to " + this.$socket.nsp);
  //               },
 
  //               disconnect() {
  //                   console.log("Websocket disconnected from " + this.$socket.nsp);
  //               },
 
  //               error(err) {
  //                   console.error("Websocket error!", err);
  //               }
  //               */
 
  //           }
  //       }
}
</script>

<style lang="less" scoped>
#HomeWrapper {
  nav.nav {
    .icon {
      &.icon-myaccount {
        position: absolute;
        left: 0;
        top: 50%;
        margin-top: -0.6rem;
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        border: 1px solid #fff;
        border-radius: 50%;
        background: url('../../static/images/logo_2.png') no-repeat center center;
        background-size: 100%;
        background-color: #fff;
      }
      &.icon-search {
        display: inline-block;
        width: 1.4rem;
        height: 2.8rem;
        background: url('../../static/images/search-icon.png') no-repeat center center;
        background-size: 1.4rem;
        &:before {
          content: '';
        }
      }
    }
  }
 .page-content {
    .grids {
      display:flex;
      flex-wrap: wrap;
      .grid {
        display: inline-block;
        width: calc(100%/4);
        .item {
          position: relative;
          width:100%;
          height: 0;
          padding-bottom: 100%;     
          text-align: center;     
          white-space: normal;
          align-items: center;
          justify-content: center;
          border: 1px solid #fff;
          &.free {
            background-color: #33CC33;
            // background: rgba(102, 204, 51, 1);
           // background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,#86f4a1), color-stop(100%,#56dcdd));
          }
          &.ing {
            background-color: #FF6666;
            // background: rgba(255, 0, 0, 1);
            // background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,#ffb14b), color-stop(100%,#ff864b));
            div.status {
              display:flex; 
              justify-content: space-between;
              .lock {
                >img {
                  display: block;
                  width: 0.7rem;
                  margin-top: 2px;
                }
              }
            }
          }
          &.end {
            background-color: #FFCC66;
            // background: rgba(240, 165, 43, 1);
            // background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,#7adaff), color-stop(100%,#7ab3ff));
          }
            span {
              color: #fff;
            }
            div.content {
              position: absolute;
              left: 0;
              top: 0;
              width:100%;
              text-align: center;     
              white-space: normal;
              align-items: center;
              justify-content: center;
              padding: 14% 0;
              p {
                font-size: 0.7rem;
                margin-bottom: 0;
                color: #fff;
                &.area {
                  font-size: 0.5rem;
                }
              }
            }
            div.status {
              position: absolute;
              left: 12.5%;
              bottom: 0;
              width: 75%;
              text-align: center;
              margin: 0 auto;
              font-size: 0.5rem;
              color: #fff;
              padding: 6% 0;
              border-top: 1px solid rgba(111,111,111,0.1);
            }
        }
      }
      .nodata {
        width: 100%;
        font-size: .7rem;
        padding: 1rem 0;
        text-align: center;
        color: #666;
      }
    }
  }
  .searchWrapper {
    // position: absolute;
    // top: 2.2rem;
    // left: 0;
    // background-color: rgba(0,0,0,0.5);
    // width: 100%;
    // height: calc(100% - 2.2rem - 2px);
    // z-index: 100;
    #search-form {
       position: absolute;
       top:2.8rem;
      left: 0;
      z-index: 11;
      -moz-transition: max-height, 0.5s;
      -o-transition: max-height, 0.5s;
      -webkit-transition: max-height, 0.5s;
      transition: max-height, 0.5s;
      width: 100%;
      max-height: 0;
      overflow: hidden;
      background-color: #FFF;
      // -moz-box-shadow: 0px 2px 20px #f4f4f4;
      // box-shadow: 0px 2px 20px #f4f4f4;
      &.open {
        max-height: 2.5rem;
      }
      fieldset {
        position: relative;
        margin: 0 3rem 0 0;
        padding: 0;
        border: none;
      }
      input[type="search"] {
          width: 100%;
          height: 2.5rem;
          font-size: 0.65rem;
          padding: 0 5px 0 22px;
          background: transparent;
          border: none;
      }
      input[type="button"] {
          display: block;
          position: absolute;
          top: 0;
          right: 0;
          // border-bottom-left-radius: 2rem;
          // border-top-left-radius: 2rem;
          width: 3rem;
          height: 2.5rem;
          margin: 0;
          padding: 0;
          font-size: .65rem;
          text-transform: uppercase;
          color: #fff;
          background: #ff7e4b;
          border: none;
          border-radius: 0;
      }
    }
  }
}
</style>

