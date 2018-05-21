<template>
  <div id="channelWrapper" class="page">
    <page-header>
      <header-link :left="true" :edge="true" v-back-link><icon icon="back"></icon></header-link>
      <header-title>换台</header-title>
    </page-header>
    <second-header>
       <div class="tab-container">
        <div>
          <ul class="nav nav-tabs">
            <li v-for="(item, index) in tabList" :class="{'dropdown': item['seclist'], 'active': index == mutableActive}">
                <a href="javascript:void(0)" v-if="!item['seclist']" data-toggle="tab" :data-id=item.areaid @click="changeTab(index,$event)">
                  {{item.name}}
                </a>
                <a href="javascript:void(0)" v-if="item['seclist']" class="dropdown-toggle" id="dropdown-menu" data-toggle="dropdown" :data-id=item.areaid>
                    {{item.name}}
                    <b class="caret"></b>
                </a>
                <ul v-if="item['seclist']" class="dropdown-menu" role="menu" aria-labelledby="dropdown-menu">
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
        <div class="grids grids-small" id="list" v-show="!showLoading">
          <a href="javascript: void(0)" class="grid" v-for="(table,index) in tableList" v-if="tableList.length">
            <div class="free item" :data-tableId=table.tableid  @click="open(index,$event)">
              <div class="content">
                <p class="area" ref=area>{{table.areaname}}</p><p class="number" ref=num>{{table.tableNo}}</p>
              </div>
              <div class="status">
                空闲
              </div>
            </div>
          </a>
          <div class="nodata" v-if="!tableList.length">{{noData}}</div>
        </div>
        <loading v-show="showLoading"></loading>
    </page-content>
    <pop-window ref="p">
      <div class="box">
        <div class="header"><h5>换台</h5></div>
        <section>
          <div class="box-item">
            <label for="">现在位置</label>
            <p class="tableNum"><span>{{nowTableArea}}</span><span>{{nowTableNum}}</span></p>
          </div>
          <div class="box-item">        
            <label for="">调换位置</label>
            <p class="tableNum"><span>{{changeTableArea}}</span><span>{{changeTableNum}}</span></p>
          </div>
                  
        </section>
        <div class="btnWrap"><button class="confirm btn btn-block" @click="confirmEvt">确认</button><button @click="$refs.p.close()" class="cancel btn btn-block">取消</button></div>
      </div>
    </pop-window>
    <preloader ref="preloader"></preloader>
    <toast :text="msgText" type="error" ref="msg"></toast>
  </div>
</template>

<script>
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle, HeaderLink, SecondHeader} from '../../node_modules/vum/src/components/header'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'
import PopWindow from '../../node_modules/vum/src/components/popwindow'
import Toast from '../../node_modules/vum/src/components/toast'
import Loading from '../components/Loading'

export default {
  name: 'Home',
  components: {
    Page,
    'page-content': Content,
    'page-header': Header,
    HeaderTitle,
    HeaderLink,
    SecondHeader,
    Icon,
    Preloader,
    'm-button': Button,
    PopWindow,
    Toast,
    Loading,
  },

  data () {
    return {
      apiurl: localStorage.getItem('apiurl'),
      tabList: [{name: '全部', areaid: '-1'}, {name: '区域', areaid: '-2', seclist: []}],
      tableList: [],
      mutableActive: 0,
      localTableList: [], //本地数据
      changeTableArea:'',
      changeTableNum:'',
      changeTableId: '',
      nowTableArea: '',
      nowTableNum: '',
      nowTableId: '',
      orderid: '',
      noData: '暂无空闲桌台',
      msgText: '',
      showLoading: true,
      urlArr: [],
      netError: '网络请求超时，请刷新重试'
    }
  },
  created () {
    this.init();
    this.getTabList();
  },
  methods: {
    // 确认换台
    confirmEvt () {
      let self = this;
      let data = {
        tid: this.nowTableNum,
        ntid: this.changeTableNum,
        oid: this.orderid
      }
      this.$http.post(this.apiurl + '/padinterface/updateTable', data).then(function(res){
        if(res.data.code == 0 && res.data.msg == "请求成功") {
          self.$http.get(self.apiurl + '/app/getTables?tableid='+localStorage.getItem('tableID')+'&type=0&ucode=' + localStorage.getItem('userid')).then(function(res){
            if(res.data.code == 0) {
              self.msgText = '换台成功';
              self.$refs.msg.open();
              self.$refs.p.close();
              self.$router.push({ path: '/home' });
            }
          })
          
          // self.$refs.actions.close();
          // self.getOneOrder();
        }else{
          self.msgText = res.data.msg;
          self.$refs.msg.open();
        }
      });
    },

    // 初始化数据
    init () {
      this.nowTableArea = localStorage.getItem('tableArea');
      this.nowTableNum = localStorage.getItem('tableNum');
      this.orderid = localStorage.getItem('orderid');
      this.nowTableId = localStorage.getItem('tableID');
    },

    // 获取桌台全部列表
    getTabList () {
      var self = this;
      let branchId = localStorage.getItem("branchId");
      this.$http.post(this.apiurl+'/api/employee/getTableAndType', {branchId: branchId, areaid: ''}).then(function(res){
        self.showLoading = false;
        if(!res.code) {
          self.tabList[1].seclist = [];
          self.tableList = [];
          self.localTableList = [];
          let tables = res.data.data;
          $.each(tables, function(index, table){
            let obj = {};
            obj.name = table.areaname;
            obj.areaid = table.areaid;
            self.tabList[1].seclist.push(obj);
            $.each(table.tables, function(i, t){
                if(t.status == '0') {
                  self.tableList.push(t);
                  self.localTableList.push(t);
                } 
            })
          });
        }
      }).catch(function(error){
        self.msgText = self.netError;
        self.$refs.msg.open();
        self.showLoading = false;
      })
    },

    // 换台popup
    open (index, e) {
      this.urlArr.push('/padinterface/updateTable');
      if(!this.authority(this.urlArr)) {
        this.msgText = '对不起，您暂无换台权限';
        this.$refs.msg.open();
      } else {
        let tableID = e.currentTarget.dataset.tableid,
            area = this.$refs.area[index].innerText,
            num = this.$refs.num[index].innerText;
        this.changeTableId = tableID;
        this.changeTableArea = area;
        this.changeTableNum = num;
        this.$refs.p.open()
      }
    },

    // nav切换
    changeTab (index, evt) {
      let tabSelected = evt.target.dataset.id,
        tables = this.localTableList;
      this.tableList = [];
      if(tabSelected == '-1') { //全部
        this.tableList = tables;
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
    },

    showPreloader () {
      this.$refs.preloader.open()
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.$refs.preloader.close()
        this.$router.push({ path: '/home' })
      }, 3000)
    }
  }
}
</script>

<style lang="less">
#channelWrapper {
  ul.nav {
    > li {
      width: 50% !important;
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
          &.free {
            background-color: #33CC33;
            // background: rgba(102, 204, 51, 1);
           // background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,#86f4a1), color-stop(100%,#56dcdd));
          }
          // &.ing {
          //   background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,#ffb14b), color-stop(100%,#ff864b));
          //   div.status {
          //     display:flex; 
          //     justify-content: space-between;
          //     .lock {
          //       >img {
          //         display: block;
          //         width: 0.7rem;
          //         margin-top: 2px;
          //       }
          //     }
          //   }
          // }
          // &.end {
          //   background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,#7adaff), color-stop(100%,#7ab3ff));
          // }
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
        font-size: .75rem;
        color: #999;
        padding: 1rem 0;
        text-align: center;
      }
    }
  }
}
</style>

