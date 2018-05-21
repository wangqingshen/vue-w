<template>
  <div id="orderWrapper" class="page">
    <page-header>
      <header-link :left="true" :edge="true" @click.native="goBack">
        <icon icon="back"></icon>
      </header-link>
      <header-title>{{tableArea}}{{tableNum}}</header-title>
      <header-link>
        <icon icon="info" @click.native="fixTableDialog"></icon>
      </header-link>
    </page-header>
    <second-header>
      <div class="tab-container">
        <div>
          <ul class="nav nav-tabs">
            <li v-for="(item, index) in tabList" :class="{'active': index == mutableActive}">
              <a href="" data-toggle="tab" @click="changeTab(index)">
                  				{{item}}
                			</a>
            </li>
          </ul>
        </div>
      </div>
    </second-header>
    <second-footer v-if="tabIndex == 0 && bills.length">
      <ul class="btnWrap">
        <li class="clearBtn" @click="clearEvt(1)">清空</li>
        <li class="placeBtn" @click="ldCheckEvt">落单</li>
      </ul>
    </second-footer>
    <page-footer>
      <footer-item @click.native="footerNavEvt(index)" v-for="(nav, index) in footerNavList">
        <span class="icon" :class="nav.icon"></span>
        <label>{{nav.name}}</label>
      </footer-item>
    </page-footer>
    <page-content>
      <section class="main" v-show="!showLoading">
        <ul class="orderList" v-if="bills.length">
          <li v-for="(bill,index) in bills" @click="billItemEvt(index)">
            <div class="left">
              <p class="info"><span class="pname">{{bill.title}}</span><span v-if="bill.ordertype==1" class="label">赠送</span>
                <span v-if="bill.ordertype==2" class="label">改价</span><span v-if="bill.ordertype==3" class="label">{{bill.discountrate}}折</span><span v-if="bill.ordertype==5" class="label">退</span></p>
              <p class="price"><span class="salePrice">￥{{bill.orderprice}}<em class="unit">/{{bill.dishunit}}</em></span><span class="oldPrice" v-if="bill.ordertype==3 || bill.ordertype==2">￥{{bill.orignalprice}}/{{bill.dishunit}}</span></p>
            </div>
            <div class="right" v-if="tabIndex == 0">
              <a href="javascript:void(0)" class="reduceBtn" @click.stop="minus(index,Number(bill.dishnum))">-</a>
              <input type="number" min="1" @click.stop="" :value="bill.dishnum" v-on:blur.lazy="inputChangeEvt($event, index)" />
              <a href="javascript:void(0)" class="moreBtn" @click.stop="add(index,Number(bill.dishnum))">+</a>
            </div>
            <div class="right" v-if="tabIndex != 0">
              <span class="orderX">x</span>
              <span class="orderNum">{{bill.dishnum}}</span>
            </div>
          </li>
        </ul>
        <ul class="nodata" v-if="!bills.length">
          {{noData}}
        </ul>
      </section>
      <loading v-show="showLoading"></loading>
    </page-content>
    <actions ref="actions">
      <action-group>
        <action-button @click.native="delDialog" v-show="!tabIndex">删除</action-button>
        <action-button class="gray" v-show="tabIndex">删除</action-button>
        <action-button @click.native="giveDialog" v-show="tabIndex != 2 && ordertype != 1 && ordertype != 5">赠送</action-button>
        <action-button class="gray" v-show="tabIndex == 2 || ordertype == 1 || ordertype == 5">赠送</action-button>
        <action-button @click.native="cancelGiveDialog" v-show="tabIndex != 2 && ordertype == 1">取消赠送</action-button>
        <action-button class="gray" v-show="tabIndex == 2 || ordertype != 1">取消赠送</action-button>
        <action-button @click.native="retreatDialog" v-show="tabIndex == 1 && ordertype != 5">退菜</action-button>
        <action-button class="gray" v-show="tabIndex != 1 || ordertype == 5">退菜</action-button>
        <action-button @click.native="changePriceDialog" v-show="tabIndex != 2 && ordertype != 5">改价</action-button>
        <action-button class="gray" v-show="tabIndex == 2 || ordertype == 5">改价</action-button>
        <action-button @click.native="saleDialog" v-show="tabIndex != 2 && ordertype != 5">打折</action-button>
        <action-button class="gray" v-show="tabIndex == 2 || ordertype == 5">打折</action-button>
      </action-group>
    </actions>
    <preloader ref="preloader"></preloader>
    <pop-window ref="p">
      <div class="box">
        <div class="header">
          <h5>桌台信息</h5></div>
        <section>
          <div class="box-item">
            <label for="">桌号</label>
            <p class="tableNum"><span>{{tableArea}}</span><span>{{tableNum}}</span></p>
          </div>
          <div class="box-item">
            <label>人数</label>
            <input type="number" name="openTableNumber" v-model="openTableNumber" style="width: 90%;font-size:.75rem;" />
            <span class="unit">人</span>
          </div>
          <div class="box-item">
            <label>备注</label>
            <input type="text" name="mark" v-model="openTableContent" style="width: 100%;font-size:.75rem;" />
          </div>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="fixTable">修改</button>
          <button @click="$refs.p.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 确认删除popup -->
    <pop-window ref="del">
      <div class="box">
        <div class="header">
          <h5>提示</h5></div>
        <section>
          <p class="delTips">确定要删除吗?</p>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="calcInventory">确认</button>
          <button @click="$refs.del.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 确认结算popup -->
    <pop-window ref="js">
      <div class="box">
        <div class="header">
          <h5>提示</h5></div>
        <section>
          <p class="delTips">该桌台有未落单商品</p>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="accountEvt(1)">落单并结账</button>
          <button class="confirm open btn btn-block" @click="accountEvt(2)">清除并结账</button>
          <button @click="$refs.js.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 取消账单确认popup -->
    <pop-window ref="cancelBill">
      <div class="box">
        <div class="header">
          <h5>提示</h5></div>
        <section>
          <p class="delTips">{{cancelBillText}}</p>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="cancelBillEvt">确认</button>
          <button @click="$refs.cancelBill.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 赠送popup -->
    <pop-window ref="give">
      <div class="box">
        <div class="header">
          <h5>赠送</h5></div>
        <section>
          <div class="box-item">
            <label for="">赠送数量</label>
            <p class="giveNum">
              <a href="javascript:void(0)" class="moreBtn" @click="addCommon()">+</a>
              <input type="number" v-model="givenum" />
              <a href="javascript:void(0)" class="reduceBtn" @click="minusCommon()">-</a>
            </p>
          </div>
          <div class="box-item">
            <label for="">备注</label>
            <p class="markContent">
              <input type="text" value="" class="markInput" v-model="markContent" />
            </p>
          </div>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="giveEvt">确认</button>
          <button @click="$refs.give.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 取消赠送popup -->
    <pop-window ref="cancelGive">
      <div class="box">
        <div class="header">
          <h5>取消赠送</h5></div>
        <section>
          <div class="box-item">
            <label for="">已赠送数量</label>
            <p style="font-size:.75rem;color:#666;">{{dishCount}}</p>
          </div>
          <div class="box-item">
            <label for="">取消赠送数量</label>
            <p class="giveNum">
              <a href="javascript:void(0)" class="moreBtn" @click="addCommon()">+</a>
              <input type="number" v-model="givenum" />
              <a href="javascript:void(0)" class="reduceBtn" @click="minusCommon()">-</a>
            </p>
          </div>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="cancelGiveEvt">确认</button>
          <button @click="$refs.cancelGive.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 退菜popup -->
    <pop-window ref="retreat">
      <div class="box">
        <div class="header">
          <h5>退菜</h5></div>
        <section>
          <div class="box-item">
            <label for="">退菜数量</label>
            <p class="giveNum">
              <a href="javascript:void(0)" class="moreBtn" @click="addCommon()">+</a>
              <input type="number" v-model="givenum" />
              <a href="javascript:void(0)" class="reduceBtn" @click="minusCommon()">-</a>
            </p>
          </div>
          <div class="box-item">
            <label for="">备注</label>
            <p class="markContent">
              <input type="text" class="markInput" v-model="markContent" />
            </p>
          </div>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="retreatEvt">确认</button>
          <button @click="$refs.retreat.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 打折popup -->
    <pop-window ref="sale">
      <div class="box">
        <div class="header">
          <h5>打折</h5></div>
        <section>
          <div class="box-item">
            <label for="">原价(元)</label>
            <p style="font-size:.75rem;color:#666;">
              {{orignalprice}}
            </p>
          </div>
          <div class="box-item">
            <label for="">商品折扣</label>
            <p class="saleNum">
              <input type="number" min="1" max="100" v-model="salenum" />
              <span class="unit">%</span>
            </p>
          </div>
          <div class="box-item">
            <label for="">备注</label>
            <p class="markContent">
              <input type="text" value="" class="markInput" v-model="markContent" />
            </p>
          </div>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="saleEvt">确认</button>
          <button @click="$refs.sale.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <!-- 改价popup -->
    <pop-window ref="changePrice">
      <div class="box">
        <div class="header">
          <h5>改价</h5></div>
        <section>
          <div class="box-item">
            <label for="">当前价格(元)</label>
            <p style="font-size:.75rem;color:#666;">
              {{orderprice}}
            </p>
          </div>
          <div class="box-item">
            <label for="">修改后价格</label>
            <p class="saleNum">
              <input type="number" v-model="salePrice" />
              <span class="unit">元</span>
            </p>
          </div>
        </section>
        <div class="btnWrap">
          <button class="confirm btn btn-block" @click="changePriceEvt">确认</button>
          <button @click="$refs.changePrice.close()" class="cancel btn btn-block">取消</button>
        </div>
      </div>
    </pop-window>
    <toast :text="msgText" type="error" ref="msg"></toast>
  </div>
</template>
<script>
import Page from '../../node_modules/vum/src/components/page'
import { Header, HeaderTitle, HeaderLink, SecondHeader } from '../../node_modules/vum/src/components/header'
import { Footer, SecondFooter, FooterItem } from '../../node_modules/vum/src/components/footer'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Tab, TabItem } from '../../node_modules/vum/src/components/tab'
import { Button } from '../../node_modules/vum/src/components/buttons'
import { Actions, ActionButton, ActionGroup } from '../../node_modules/vum/src/components/actions'
import Preloader from '../../node_modules/vum/src/components/preloader'
import PopWindow from '../../node_modules/vum/src/components/popwindow'
import Toast from '../../node_modules/vum/src/components/toast'
import Loading from '../components/Loading'
export default {
  name: 'order',
  components: {
    Page,
    'page-content': Content,
    'page-header': Header,
    HeaderTitle,
    HeaderLink,
    SecondHeader,
    'page-footer': Footer,
    SecondFooter,
    FooterItem,
    Icon,
    Preloader,
    Tab,
    TabItem,
    'm-button': Button,
    PopWindow,
    Actions,
    ActionButton,
    ActionGroup,
    Toast,
    Loading
  },
  data() {
    return {
      apiurl: localStorage.getItem('apiurl'),
      mutableActive: 0,
      tabIndex: 0,
      tableArea: '',
      tableNum: '',
      orderid: '',
      branchid: '',
      openTableNumber: '',
      openTableContent: '',
      tabList: ['未落单', '已落单', '已结账'],
      msgText: '',
      ldList: [], //落单商品列表
      wldList: [], //未落单商品列表
      jsList: [], //结算商品列表
      bills: [],
      noData: '暂无未落单商品',
      footerNavList: [
        { name: '点单', icon: 'addIcon' },
        { name: '预结账', icon: 'checkoutIcon' },
        { name: '换台', icon: 'channelIcon' },
        { name: '取消账单', icon: 'delIcon' },
        { name: '收银', icon: 'cashierIcon' }
      ],
      netError: '网络请求超时，请刷新重试',
      dishid: '',
      dishnum: '',
      orderdetailid: '',
      unit: '', //商品单位
      orderprice: '', //商品价格
      orignalprice: '', //原始价格
      dishCount: '', //数量变化值
      dishCountType: 1, //1为加操作，0为减操作
      orderIndex: '',
      ordertype: '',
      givenum: 1, //赠送数量
      markContent: '', //备注
      salenum: '', //打折
      clearArr: [], //清空数据
      salePrice: '',
      discountrate: '', //折扣
      printArr: [],
      cancelText: '取消账单',
      cleanText: '清台',
      cancelBillText: '',
      showLoading: true,
      seqNumber: '', //落单随机数
      permission: '',
      callBtnState: false,
      callPrintState: false
    }
  },
  created() {
    this.init()
    this.getOneOrder()
  },
  watch: {
    openTableNumber() {
      if (this.openTableNumber.toString().length > 3) this.openTableNumber = Math.floor(this.openTableNumber / 10)
      if (Number(this.openTableNumber) <= 0) this.openTableNumber = ''
    }
  },
  methods: {
    // 初始化数据
    init() {
      this.tableArea = localStorage.getItem("tableArea");
      this.tableNum = localStorage.getItem("tableNum");
      this.orderid = localStorage.getItem("orderid");
      this.branchid = localStorage.getItem('branchId');
      this.permission = localStorage.getItem('permission');
      // this.branchid = '43990';
    },

    // 修改桌台确认
    fixTable() {
      var self = this;
      if (!this.openTableNumber) {
        this.msgText = '已开台人数不能为空';
        this.$refs.msg.open();
        return false;
      }
      let form = {
        'tableId': localStorage.getItem('tableID'),
        'orderid': this.orderid,
        'peopleNum': this.openTableNumber,
        'remark': this.openTableContent,
        'userid': localStorage.getItem("userid")
      }
      this.$http.post(this.apiurl + '/app/updateTable', form).then(function(res) {
        if (res.data.data != '') {
          self.msgText = '修改成功';
          self.$refs.msg.open();
          self.$refs.p.close();
        }
      }).catch(function(error){
      	self.msgText = self.netError;
        self.$refs.msg.open();
      })
    },

    // 修改桌台信息弹出层
    fixTableDialog() {
      if (!this.permission) {
        this.msgText = '对不起，您暂无修改桌台信息权限';
        this.$refs.msg.open();
      } else {
        this.$refs.p.open();
      }
    },

    // 检测桌台状态以显示是否清台或者取消账单
    checkTableStatus() {
      if (!this.ldList.length && this.jsList.length) {
        this.footerNavList[3].name = this.cleanText;
      } else {
        this.footerNavList[3].name = this.cancelText;
      }
    },

    // tab切换
    changeTab(index) {
      this.tabIndex = index;
      if (index == 0) {
        this.bills = this.wldList
        this.noData = '暂无未落单商品'
      } else if (index == 1) {
        this.bills = this.ldList
        this.noData = '暂无落单商品'
      } else if (index == 2) {
        this.bills = this.jsList
        this.noData = '暂无结算商品'
      }
    },

    // footer链接跳转
    footerNavEvt(index) {
      switch (index) {
        case 0:
          this.$router.push({ path: '/shopping' });
          break;
        case 1:
          // 打印
          if (this.ldList.length) {
            this.printEvt(1);
          } else {
            this.msgText = '还有未落单订单，请先落单';
            this.$refs.msg.open();
          }
          break;
        case 2:
          this.$router.push({ path: '/channel' });
          break;
        case 3:
          if (!this.ldList.length && this.jsList.length) {
            this.cancelBillText = '确认清台操作？'
            this.$refs.cancelBill.open();
          } else {
            if (!this.permission) {
              this.msgText = '对不起，您暂无取消账单权限';
              this.$refs.msg.open();
            } else {
              this.cancelBillText = '取消账单后，已落单但未结账商品将全部退菜操作(若有)，并清空桌台，是否继续？';
              this.$refs.cancelBill.open();
            }
          }
          break;
        default:
          if (!this.permission) {
            this.msgText = '对不起，您暂无收银权限';
            this.$refs.msg.open();
          } else {
            var arr = [];
            if (this.ldList.length) {
              for (var i in this.ldList) {
                if (this.ldList[i].ordertype != 5) {
                  arr.push(this.ldList[i]);
                }
              }
            }
            if (!this.wldList.length && !this.ldList.length) {
              this.msgText = '暂无落单商品，不能结账';
              this.$refs.msg.open();
              return false;
            }
            if (this.wldList.length) {
              this.$refs.js.open();
            } else {
              this.$router.push({ path: '/payment' })
            }
          }
      }
    },

    accountEvt(t) {
      if (t == 1) {
        this.ldEvt(2);
      } else if (t == 2) {
        this.clearEvt(2);
      }
    },

    // 获取订单列表
    getOneOrder() {
      var self = this;
      this.$http.get(this.apiurl + '/padinterface/oneOrder?id=' + this.orderid + '&type=0&num=1').then(function(res) {
        self.showLoading = false;
        if (res.data.code == 0 && res.data.msg != '请求异常') {
          let data = res.data.data;
          self.wldList = data.wld;
          self.ldList = data.ld;
          self.jsList = data.js;
          self.openTableNumber = data.order.custnum;
          self.openTableContent = data.order.remark;
          if (self.tabIndex == 0) {
            self.bills = data.wld
          } else if (self.tabIndex == 1) {
            self.bills = data.ld
          } else if (self.tabIndex == 2) {
            self.bills = data.js
          }
          // if(data.orderseq=='' && data.order.orderseq && data.order.orderstatus == 0) {
          // 	self.seqNumber = data.order.orderseq;
          // }else if (data.orderseq != '' && data.ld.length) {
          //   self.seqNumber = data.ld[0].orderseq;
          // } else if(data.orderseq != '' && !data.ld.length && data.wld.length){
          // 	self.seqNumber = data.wld[0].orderseq;
          // }else {
          //   self.seqNumber = new Date().getTime();
          // }
          // localStorage.setItem('seqNum', self.seqNumber);
          self.checkTableStatus();
        } else {
          self.msgText = res.data.msg;
          self.$refs.msg.open();
        }
      }).catch(function(error) {
        self.msgText = self.netError;
        self.$refs.msg.open();
        self.showLoading = false;
      })
    },

    // 更新库存检测
    calcInventory() {
      // let self = this;
      // let data = {
      // 	dishid: this.dishid,
      // 	dishCount: this.dishCount,
      // 	branchid: this.branchid,
      // 	orderid: this.orderid,
      // 	type: this.dishCountType,
      // };
      // this.$http.post(this.apiurl + '/api/employee/calcInventory', data).then(function(res){
      // 	if(res.data.code == 1) {
      // 		if(self.dishCount == self.dishnum && self.dishCountType == 0) {//删除此条记录
      // 			self.delOrderDetail();
      // 		} else {
      // 			var dishnum = Number(self.dishnum);
      // 			if(self.dishCountType == 0) {
      // 				self.dishnum = Math.abs(dishnum - self.dishCount)
      // 			}else if(self.dishCountType == 1) {
      // 				self.dishnum = dishnum + self.dishCount
      // 			}
      // 			self.updateDetailEvt()
      // 		}
      // 	}else{
      // 		self.msgText = '该商品库存不足';
      //          		self.$refs.msg.open();
      // 	}
      // });
      if (this.dishCount == this.dishnum && this.dishCountType == 0) { //删除此条记录
        this.delOrderDetail();
      } else {
        var dishnum = Number(this.dishnum);
        if (this.dishCountType == 0) {
          this.dishnum = Math.abs(dishnum - this.dishCount)
        } else if (this.dishCountType == 1) {
          this.dishnum = dishnum + this.dishCount
        }
        this.updateDetailEvt()
      }
    },

    // 更新
    updateDetailEvt() {
      let self = this;
      let data = {
        orderid: this.orderid,
        orderdetailid: this.orderdetailid,
        dishnum: this.dishnum,
        ordertype: this.ordertype,
        discountrate: this.discountrate,
        discardUserId: localStorage.getItem('userid')
      }
      this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data).then(function(res) {
        if (res.data.code == 0) {
          self.bills[self.orderIndex].dishnum = self.dishnum;
        }
      });
    },

    // 删除
    delOrderDetail() {
      let self = this;
      $.ajax({
        type: "GET",
        url: this.apiurl + '/padinterface/deleteOrderDetail?id=' + this.orderdetailid + '&orderid=' + this.orderid,
        dataType: "json",
        xhrFields: {
          withCredentials: true
        },
        beforeSend: function() {
          self.$refs.preloader.open()
        },
        success: function(res) {
          // console.log(data);
          let code = res.code;
          if (code == '0') {
            self.msgText = '删除成功';
            self.$refs.msg.open();
            self.$refs.del.close();
            self.$refs.actions.close();
            self.getOneOrder();
          }
        },
        error: function(data) {
          self.msgText = self.netError;
          self.$refs.msg.open();
        },
        complete: function() {
          self.$refs.preloader.close()
        }
      })
    },

    // 删除popup
    delDialog() {
      this.dishCountType = 0;
      this.$refs.del.open();
    },

    // 打折popup
    saleDialog() {
      if (!this.permission) {
        this.msgText = '对不起，您暂无打折权限';
        this.$refs.msg.open();
      } else {
        this.$refs.sale.open()
      }
    },

    // 改价popup
    changePriceDialog() {
      if (!this.permission) {
        this.msgText = '对不起，您暂无改价权限';
        this.$refs.msg.open();
      } else {
        this.$refs.changePrice.open()
      }
    },

    // 退菜popup
    retreatDialog() {
      if (!this.permission) {
        this.msgText = '对不起，您暂无退菜权限';
        this.$refs.msg.open();
      } else {
        this.givenum = 1;
        this.$refs.retreat.open()
      }
    },

    // 赠送popup
    giveDialog() {
      if (!this.permission) {
        this.msgText = '对不起，您暂无赠送权限';
        this.$refs.msg.open();
      } else {
        this.givenum = 1;
        this.$refs.give.open()
      }
    },

    // 取消赠送popup
    cancelGiveDialog() {
      if (!this.permission) {
        this.msgText = '对不起，您暂无取消赠送权限';
        this.$refs.msg.open();
      } else {
        this.givenum = 1;
        this.$refs.cancelGive.open()
      }
    },

    // 更多操作pannel
    billItemEvt(index) {
      let orderdetailid = this.bills[index].orderdetailid,
        num = this.bills[index].dishnum,
        ordertype = this.bills[index].ordertype,
        orderprice = this.bills[index].orderprice,
        orignalprice = this.bills[index].orignalprice,
        unit = this.bills[index].dishunit,
        dishid = this.bills[index].dishid;
      this.dishnum = num;
      this.orderdetailid = orderdetailid;
      this.dishid = dishid;
      this.dishCount = num;
      this.unit = unit;
      this.orderprice = orderprice;
      this.orignalprice = orignalprice;
      this.ordertype = ordertype;
      this.givenum = 1;
      this.salePrice = '';
      this.markContent = '';
      this.salenum = '';
      this.$refs.actions.open();
    },

    close() {
      this.$refs.actions.close()
    },

    // 赠送操作
    giveEvt() {
      if (!this.callBtnState) {
        this.callBtnState = true;
        if (this.givenum <= 0 || this.givenum == '') {
          this.givenum = 1;
          this.msgText = '赠送数量不能小于零';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        } else if (this.givenum > this.dishCount) {
          this.givenum = this.dishCount;
          this.msgText = '赠送数量不能大于可赠数量';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }

        if (this.markContent == '') {
          this.msgText = '备注不能为空';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }

        let arr = [];
        if (this.givenum == this.dishCount) {
          // 删除原有记录
          arr.push(this.$http.get(this.apiurl + '/padinterface/deleteOrderDetail?id=' + this.orderdetailid + '&orderid=' + this.orderid));
        } else {
          //修改原有记录
          var d = {
            orderid: this.orderid,
            orderdetailid: this.orderdetailid,
            discardUserId: localStorage.getItem('userid'),
            dishnum: Number(this.dishCount) - Number(this.givenum),
            ordertype: this.ordertype,
            status: this.tabIndex
          }
          arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', d));
        }

        if (this.checkGiveIsExist().state) {
          // 修改赠送记录
          var data = {
            orderid: this.orderid,
            orderdetailid: this.checkGiveIsExist().orderdetailid,
            discardUserId: localStorage.getItem('userid'),
            dishnum: Number(this.givenum) + Number(this.checkGiveIsExist().dishnum),
            ordertype: 1,
            status: this.tabIndex
          };
          arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data));
        } else {
          //新增赠送记录
          arr.push(this.bookorder(this.markContent, 0, this.givenum, 1));
        }

        let self = this;
        this.$http.all(arr).then(function(res) {
          self.callBtnState = false;
          if (res.length) {
            self.msgText = '赠送成功';
            self.$refs.msg.open();
            self.$refs.give.close();
            self.$refs.actions.close();
            self.getOneOrder();
          }
        }).catch(function(error) {
          self.callBtnState = false;
        })
      }
    },

    // 取消赠送
    cancelGiveEvt() {
      if (!this.callBtnState) {
        this.callBtnState = true;
        if (this.givenum <= 0 || this.givenum == '') {
          this.givenum = 1;
          this.msgText = '取消赠送数量不能小于零';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        } else if (this.givenum > this.dishCount) {
          this.givenum = this.dishCount;
          this.msgText = '取消赠送数量不能大于已赠数量';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }

        var arr = [];
        if (this.givenum == this.dishCount) {
          // 删除赠送记录
          arr.push(this.$http.get(this.apiurl + '/padinterface/deleteOrderDetail?id=' + this.orderdetailid + '&orderid=' + this.orderid));
        } else {
          //修改赠送记录
          var d = {
            orderid: this.orderid,
            orderdetailid: this.orderdetailid,
            discardUserId: localStorage.getItem('userid'),
            dishnum: Number(this.dishCount) - Number(this.givenum),
            ordertype: this.ordertype,
            status: this.tabIndex
          }
          arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', d));
        }

        if (this.checkIsExist().state) {
          // 修改老记录
          var data = {
            orderid: this.orderid,
            orderdetailid: this.checkIsExist().orderdetailid,
            discardUserId: localStorage.getItem('userid'),
            dishnum: Number(this.givenum) + Number(this.checkIsExist().dishnum),
            ordertype: 0,
            status: this.tabIndex
          };
          arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data));
        } else {
          //新增老记录
          arr.push(this.bookorder('', this.orignalprice, this.givenum, 0));
        }

        let self = this;
        this.$http.all(arr).then(function(res) {
          self.callBtnState = false;
          if (res.length) {
            self.msgText = '取消赠送成功';
            self.$refs.msg.open();
            self.$refs.cancelGive.close();
            self.$refs.actions.close();
            self.getOneOrder();
          }
        }).catch(function(error) {
          self.callBtnState = false;
        })
      }

    },

    // 检测赠送记录是否存在
    checkGiveIsExist() {
      var d = [];
      if (this.tabIndex == 0) {
        d = this.wldList;
      } else if (this.tabIndex == 1) {
        d = this.ldList;
      }
      var state = false;
      var orderdetailid = '';
      var dishnum = '';
      for (var i in d) {
        if (d[i].orderprice == 0 && d[i].dishid == this.dishid) {
          state = true;
          orderdetailid = d[i].orderdetailid;
          dishnum = d[i].dishnum;
        }
      }
      return { state: state, orderdetailid: orderdetailid, dishnum: dishnum };
    },

    // 检测取消记录存在
    checkIsExist() {
      var d = [];
      if (this.tabIndex == 0) {
        d = this.wldList;
      } else if (this.tabIndex == 1) {
        d = this.ldList;
      }
      var state = false;
      var orderdetailid = '';
      var dishnum = '';
      for (var i in d) {
        if (!d[i].ordertype && d[i].dishid == this.dishid && d[i].ordertype != 5) {
          state = true;
          orderdetailid = d[i].orderdetailid;
          dishnum = d[i].dishnum;
        }
      }
      return { state: state, orderdetailid: orderdetailid, dishnum: dishnum };
    },

    // 改价
    changePriceEvt() {
      if (!this.callBtnState) {
        this.callBtnState = true;
        if (this.salePrice <= 0 || this.salePrice == '') {
          this.msgText = '请输入修改后价格';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }
        let self = this;
        var data = {
          orderdetailid: this.orderdetailid,
          orderprice: this.salePrice,
          orignalprice: this.orignalprice,
          ordertype: 2,
          status: this.tabIndex,
          orderid: this.orderid,
          discardUserId: localStorage.getItem('userid')
        };
        this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data).then(function(res) {
          self.callBtnState = false;
          if (res.data.code == 0) {
            self.msgText = '改价成功';
            self.$refs.msg.open();
            self.$refs.changePrice.close();
            self.$refs.actions.close();
            self.getOneOrder();
          }
        }).catch(function(error) {
          self.callBtnState = false;
        })
      }
    },

    // 打折
    saleEvt() {
      if (!this.callBtnState) {
        this.callBtnState = true;
        if (this.salenum <= 0 || this.salenum == '' || this.salenum > 100) {
          this.msgText = '请输入0-100的折扣值';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }
        if (this.markContent == '') {
          this.msgText = '备注不能为空';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }
        var data = {
          orderdetailid: this.orderdetailid,
          orderid: this.orderid,
          orderprice: Number(this.salenum) * Number(this.orignalprice) / 100,
          orignalprice: this.orignalprice,
          ordertype: 3,
          discountrate: Number(this.salenum) / 10,
          status: this.tabIndex,
          discardUserId: localStorage.getItem('userid'),
        };
        let self = this;
        this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data).then(function(res) {
          self.callBtnState = false;
          if (res.data.code == 0) {
            self.msgText = '打折成功';
            self.$refs.msg.open();
            self.$refs.sale.close();
            self.$refs.actions.close();
            self.getOneOrder();
          }
        }).catch(function(error) {
          self.callBtnState = false;
        })
      }

    },

    //退菜
    retreatEvt() {
      if (!this.callBtnState) {
        this.callBtnState = true;
        if (this.givenum <= 0 || this.givenum == '') {
          this.givenum = 1;
          this.msgText = '退菜数量不能小于零';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        } else if (this.givenum > this.dishCount) {
          this.givenum = this.dishCount;
          this.msgText = '退菜数量不能大于可退数量';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }

        if (this.markContent == '') {
          this.msgText = '备注不能为空';
          this.$refs.msg.open();
          this.callBtnState = false;
          return false;
        }

        var arr = [];
        if (this.givenum == this.dishCount) {
          arr.push(this.$http.get(this.apiurl + '/padinterface/deleteOrderDetail?id=' + this.orderdetailid + '&orderid=' + this.orderid));
        } else {
          var d = {
            orignalprice: this.orignalprice,
            orderdetailid: this.orderdetailid,
            orderid: this.orderid,
            dishnum: Number(this.dishCount) - Number(this.givenum),
            ordertype: this.ordertype,
            discardReason: this.markContent,
            status: this.tabIndex,
            discardUserId: localStorage.getItem('userid')
          }
          arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', d));
        }
        if (this.checkretreatIsExist().state) {
          var data = {
            orderid: this.orderid,
            orderdetailid: this.checkretreatIsExist().orderdetailid,
            dishnum: Number(this.givenum) + Number(this.checkretreatIsExist().dishnum),
            ordertype: 5,
            dishid: this.dishid,
            orderprice: this.orignalprice,
            orignalprice: this.orignalprice,
            status: this.tabIndex,
            discardUserId: localStorage.getItem('userid')
          };
          arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data));
        } else {
          //新增老记录
          arr.push(this.bookorder('', this.orignalprice, this.givenum, 5));
        }
        var dd = { //库存回库
          dishid: this.dishid,
          dishCount: this.givenum,
          branchid: this.branchid,
          orderid: this.orderid,
          type: 0
        };
        let self = this;
        this.$http.all(arr).then(function(res) {
          self.callBtnState = false;
          if (res.length) {
            self.msgText = '退菜成功';
            self.$refs.msg.open();
            self.$refs.retreat.close();
            self.$refs.actions.close();
            self.getOneOrder();
          }
        }).catch(function(error) {
          self.callBtnState = false;
        })
      }

      // this.$http.post(this.apiurl + '/api/employee/calcInventory', dd).then(function(re){
      // 	if(re.data.code == 1) {
      // 		self.$http.all(arr).then(function(res){
      //  			if(res.length) {
      //  				self.msgText = '退菜成功';
      // 				self.$refs.msg.open();
      // 				self.$refs.retreat.close();
      // 	          	self.$refs.actions.close();
      // 	            self.getOneOrder();
      //  			}
      //  		})
      // 	}
      // })



    },

    // 检测退菜存在
    checkretreatIsExist() {
      var d = [];
      d = this.ldList;
      var state = false;
      var orderdetailid = '';
      var dishnum = '';
      for (var i in d) {
        if (d[i].ordertype == 5 && d[i].dishid == this.dishid && d[i].orderprice == this.orderprice) {
          state = true;
          orderdetailid = d[i].orderdetailid;
          dishnum = d[i].dishnum;
        }
      }
      return { state: state, orderdetailid: orderdetailid, dishnum: dishnum };
    },

    // 新增记录
    bookorder(content, price, num, type) {
      let self = this;
      let _type = this.jsList.length?1:0;
      let data = {
        "currenttableid": this.tableNum,
        "globalsperequire": "",
        "orderid": this.orderid, //,'H20180113601742000001'
        "operationType": 1,
        "sequence": 94,
        "type": _type,
        "rows": [{
          "printtype": "0",
          "pricetype": 0,
          "orderprice": price,
          "orignalprice": this.orignalprice,
          "dishid": this.dishid,
          "userName": null,
          "dishunit": this.unit,
          "orderid": this.orderid,
          "dishtype": 0,
          // "orderseq": self.seqNumber,
          "dishnum": num,
          "primarykey": "9A82543061E67C32BABB6153CA9110D4",
          "dishstatus": "0",
          "ispot": 0,
          "taste": "",
          "freeuser": null,
          "freeauthorize": null,
          "freereason": null,
          "dishes": null,
          "status": this.tabIndex,
          "ordertype": type,
          "sperequire": content,
          "branchid": this.branchid
        }]
      }
      return this.$http.post(this.apiurl + '/padinterface/bookorderList', data);
    },

    // 加一操作
    add(index, input) {
      var t = this.bills[index].ordertype;
      // var str = '';
      // if(t == 0) {//正常
      // 	str = '/padinterface/bookorderList?new';
      // 	this.msgText = '对不起，您暂无改价权限';
      // }else if(t == 1) { //赠送
      // 	str = '/padinterface/bookorderList?give';
      // }else if(t == 2 || t == 3) { //打折或改价
      // 	str = '/padinterface/bookorderList?discount';
      // }
      // this.permissionUrl = str;
      // if(!this.authority(this.permissionUrl)) {	
      //    	this.$refs.msg.open();
      //    }else{
      this.orderIndex = index;
      this.dishCountType = 1;
      this.dishCount = 1;
      this.orderdetailid = this.bills[index].orderdetailid;
      this.dishid = this.bills[index].dishid;
      this.discountrate = this.bills[index].discountrate;
      this.ordertype = this.bills[index].ordertype;
      this.dishnum = input;
      this.calcInventory();
      // }

      //添加属性 
      //this.$set(this.bills[index],'dishnum',input+1);
    },

    // 减一操作
    minus(index, input) {
      var t = this.bills[index].ordertype;

      this.orderIndex = index;
      // if(input>0){
      // this.bills[index].dishnum = input - 1
      // this.items[index].max = max+1
      // }
      this.dishCountType = 0;
      this.dishCount = 1;
      this.orderdetailid = this.bills[index].orderdetailid;
      this.ordertype = this.bills[index].ordertype;
      this.dishid = this.bills[index].dishid;
      this.discountrate = this.bills[index].discountrate;
      this.dishnum = input;
      if (input - 1 > 0) {
        this.calcInventory();
      } else {
        this.$refs.del.open();
      }
    },

    // 监听input输入框的值
    inputChangeEvt(evt, index) {
      var val = evt.target.value;
      var num = this.bills[index].dishnum;
      this.orderIndex = index;
      this.dishCount = Math.abs(Number(val) - Number(num));
      this.dishnum = num;
      this.orderdetailid = this.bills[index].orderdetailid;
      this.ordertype = this.bills[index].ordertype;
      this.dishid = this.bills[index].dishid;
      this.discountrate = this.bills[index].discountrate;
      if (val == '' || Number(val) < 0) {
        this.msgText = '单品数量不能为空或小于零';
        this.$refs.msg.open();
        this.bills[index].dishnum = num;
      } else if (Number(val) === 0) {
        this.dishCountType = 0;
        this.$refs.del.open();
      } else if (Number(val) - Number(num) > 0) {
        this.dishCountType = 1;
        this.bills[index].dishnum = val;
        this.calcInventory();
      } else if (Number(val) - Number(num) < 0) {
        this.dishCountType = 0;
        this.bills[index].dishnum = val;
        this.calcInventory();
      }
    },


    //公共弹出层加一方法
    addCommon() {
      this.givenum++;
    },

    //公共弹出层减一方法
    minusCommon() {
      if (this.givenum < 2) {
        this.msgText = '数量不能小于1';
        this.$refs.msg.open();
        this.givenum = 1;
      } else {
        this.givenum--;
      }
    },

    //落单
    ldEvt(t) {
      let self = this;
      var ldArr = [];
      this.printArr = [];

      $.each(this.wldList, function(i, item) {
        self.printArr.push(item.orderdetailid);
      })
      this.$http.get(this.apiurl + '/padinterface/ldOrderDetail?orderid=' + this.orderid  + '&status=0').then(function(r){
      	if(r.data.code == 0) {
      		if (t == 1) {
            self.msgText = '落单成功';
            self.$refs.msg.open();
            self.tabIndex = 1;
            self.mutableActive = 1;
            self.getOneOrder();
          } else if (t == 2) {
            self.$router.push({ path: '/payment' })
          }
          self.printEvt(2);
      	}
      })
      // this.$http.all(arr).then(function(r){
      // 	if(r.length) {
      // 		var state = false;
      // 		for(var i in r) {
      // 			if(r[i].data.code == 1) {
      // 				ldArr.push(self.$http.get(self.apiurl + '/padinterface/ldOrderDetail?orderid='+self.orderid+'&orderdetailid='+self.wldList[i].orderdetailid+'&status=0&orderseq='+self.seqNumber));
      // 				self.printArr.push(self.wldList[i].orderdetailid);
      // 			}else{
      // 				state = true;
      // 			}
      // 		}
      // 		if(ldArr.length) {
      // 			self.$http.all(ldArr).then(function(re){
      // 				if(re.length && !state) {
      // 					if(t == 1) {
      // 						self.msgText = '落单成功';
      //           	self.$refs.msg.open();
      //           	self.tabIndex = 1;
      //           	self.mutableActive = 1;
      //           	self.getOneOrder();
      //        	}else if(t == 2) {
      //           	self.$router.push({ path: '/payment' })
      //         }	
      // 				}else{
      // 					if(t == 1) {
      // 						self.msgText = '由于库存不足，部分落单不成功';
      // 					}else if(t == 2) {
      // 						self.msgText = '由于库存不足，部分落单不成功，暂不能去结算';
      // 					}
      //          	self.$refs.msg.open();
      //          	self.getOneOrder();
      // 				}	
      // 				self.printEvt(2);	
      // 			});
      // 		}else{
      // 			if(t == 1) {
      // 				self.msgText = '库存不足，落单失败';
      // 			}else if(t == 2) {
      // 				self.tabIndex = 0;
      //     self.mutableActive = 0;
      // 				self.msgText = '库存不足，落单失败，暂不能去结算';
      // 			}
      //    self.$refs.msg.open();
      // 		}
      // 	}
      // })
      // $.ajax({
      //        type: "GET",
      //        url: this.apiurl + '/padinterface/ldOrderDetail?id='+this.orderid,
      //        dataType: "json",
      //        beforeSend: function(){
      //          self.$refs.preloader.open()
      //        },
      //        success: function(res){
      //          let code = res.code;
      //          if(code == '0') {
      //          	self.msgText = '落单成功';
      //          	self.$refs.msg.open();
      //          	self.tabIndex = 1;
      //          	self.mutableActive = 1;
      //            self.getOneOrder();
      //          } 
      //        },
      //        error: function(data){
      //          self.msgText = self.netError;
      //          self.$refs.msg.open();
      //        },
      //        complete: function() {
      //          self.$refs.preloader.close()
      //        }
      //    })
    },

    // 落单检测
    ldCheckEvt() {
      // this.permissionUrl = '/padinterface/ldOrderDetail';
      // if(!this.authority(this.permissionUrl)) {
      //    	this.msgText = '对不起，您暂无落单权限';
      //    	this.$refs.msg.open();
      // 	} else {
      this.ldEvt(1);
      // }
    },

    // 打印
    printEvt(t) {
    	if(!this.callPrintState) {
    		this.callPrintState = true;
    		let self = this;
	      	let data = {
	        	orderid: this.orderid,
	        	type: 'n',
	        	isBefore: 1,
	      	}
	      	if (t == 2) {
		        data.orderdetailid = this.printArr;
		        data.isBefore = 0;
	      	}
	      	this.$http.post(this.apiurl + '/api/employee/doPrinter', data).then(function(res) {
	      		self.callPrintState = false;
	        	if (t == 1) {
		        	if(res.data.code == 4) {
		        		self.msgText = '预结账打印成功';
		        	}else{
		        		self.msgText = res.data.msg;
		        	}
		          	self.$refs.msg.open();
		        }
	      	}).catch((err)=>{
	      		this.callPrintState = false;
	      	})
    	}
      	
    },

    // 清空
    clearEvt(t) {
      if (this.wldList.length) {
        let self = this;
        // let arr = [];
        $.each(this.wldList, function(i, item) {
          // 			let data = {
          // 	dishid: item.dishid,
          // 	dishCount: item.dishnum,
          // 	branchid: self.branchid,
          // 	orderid: self.orderid,
          // 	type: 0,
          // }
          // let url = self.$http.post(self.apiurl + '/api/employee/calcInventory', data);
          let url = self.$http.get(self.apiurl + '/padinterface/deleteOrderDetail?id=' + item.orderdetailid + '&orderid=' + self.orderid);
          // arr.push(url);
          self.clearArr.push(url);
        })
        //  		this.$http.all(arr).then(function(res){
        // 	if(res.length) {
        // 		self.$http.all(self.clearArr).then(function(r){
        // 			if(r.length) {
        // 				self.msgText = '清空成功';
        // 	          	self.$refs.msg.open();
        // 	            self.getOneOrder();
        // 			}
        // 		})
        // 	}
        // });
        this.$http.all(this.clearArr).then(function(r) {
          if (r.length) {

            if (t == 1) {
              self.msgText = '清空成功';
              self.$refs.msg.open();
              self.getOneOrder();
            } else if (t == 2) {
              self.$refs.js.close();
              if (!self.ldList.length) {
                self.msgText = '清空成功，但无落单商品，不能结账';
                self.$refs.msg.open();
                self.getOneOrder();
              } else {
                self.$router.push({ path: '/payment' })
              }
            }
          }
        })
      }
    },

    // 清台
    clearTable() {
      let self = this;
      this.$http.get(this.apiurl + '/padinterface/cleanTable?tid=' + this.tableNum + "&orderid=" + this.orderid).then(function(res) {
        if (res.data.code == 0 && res.data.msg == '请求成功') {
          self.$http.get(self.apiurl + '/app/getTables?tableid=' + localStorage.getItem('tableID') + '&type=0&ucode=' + localStorage.getItem('userid')).then(function(res) {
          	if(res.data.code == 0) {
          		self.msgText = '清台成功,返回首页';
	            self.$refs.msg.open();
	            self.$router.push({ path: '/home' });
          	} 
          })
        }
      }).catch(function(error){
      	self.msgText = self.netError;
        self.$refs.msg.open();
      })
    },

    // 取消账单
    cancelBillEvt() {
      if (!this.ldList.length && this.jsList.length) { //无落单商品就清台
        this.clearTable();
      } else {
        let self = this;
        this.$http.get(this.apiurl + '/padinterface/canOrder?id=' + this.orderid + '&openPeople=' + localStorage.getItem('username') + '&tableNo='+this.tableNum+'&type=0').then(function(r) { //取消账单 
          if (!r.data.code) {
           	self.msgText = '清账单取消成功,返回首页';
	        self.$refs.msg.open();
	        self.$router.push({ path: '/home' });
          }
        }).catch(function(error){
	      	self.msgText = self.netError;
	        self.$refs.msg.open();
	    })
        // 全部更新状态为退菜
        // 	var arr = [];
        // 	for(var i in this.ldList) {
        // 		var data = {
        // 	orderid: this.orderid,
        // 	orderdetailid: this.ldList[i].orderdetailid,
        // dishnum: this.ldList[i].dishnum,
        // ordertype: 5,
        // dishid: this.ldList[i].dishid,
        // orderprice: this.ldList[i].orderprice,
        // status: this.tabIndex,
        // discardUserId: localStorage.getItem('userid')
        // };
        // arr.push(this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data));
        // 	}
        // 	this.$http.all(arr).then(function(res){
        // 		if(res.length) {

        // 			var d = {orderid: self.orderid};
        // 			self.$http.post(self.apiurl + '/api/employee/reviseInventory', d).then(function(re){ //库存回滚
        // 				if(re.data.code == 1) {
        // 		self.$http.get(self.apiurl + '/padinterface/canOrder?id='+self.orderid+'&num=5').then(function(r){ //
        // 			if(!r.data.code){
        // 				self.clearTable();
        // 			}
        // 		})
        // 	}
        // 			})
        // 		}
        // 	});

      }
    },

    // 返回上一步
    goBack() {
      let self = this;
      this.$http.get(this.apiurl + '/app/getTables?tableid=' + localStorage.getItem('tableID') + '&type=0&ucode=' + localStorage.getItem('userid')).then(function(res) {
        if (res.data.code == 0 && res.data.data == '') {
          self.$router.push({ path: '/home' });
        }

      })
    },
  },
}

</script>
<style lang="less" rel="stylesheet/less">
#orderWrapper {
  section.main {
    ul {
      &.orderList {
        box-sizing: border-box;
        background-color: #fff;
        padding: 0 0.8rem;

        li {
          &:not(:last-child) {
            border-bottom: 1px solid #f4f4f4;
          }
          box-sizing: border-box;
          width: 100%;
          padding: .8rem 0;
          overflow: hidden;
          clear: both;
          .left {
            float: left;
            width: 50%;
            p {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-bottom: 0;
              .pname {
                font-size: .75rem;
                color: #666;
              }
              .label {
              	display: inline-block;
                font-size: 0.54rem;
                color: #ff7e4b;
                border: 1px solid #ff7e4b;
                border-radius: 3px;
                padding: 0 5px;
                margin-left: 0;
              }
              &.price {
                .salePrice {
                  font-size: .75rem;
                  color: #ff7e4b;
                  .unit {
                    font-size: 0.54rem;
                    font-style: normal;
                    color: #ff7e4b;
                  }
                }
                .oldPrice {
                  font-size: 0.54rem;
                  color: #ccc;
                  text-decoration: line-through;
                }
              }
            }
          }
          .right {
            display: flex;
            justify-content: flex-end;
            width: 50%;
            float: right;
            margin-top: 15px;
            a {
              display: block;
              width: 1.8rem;
              height: 1.8rem;
              line-height: 1.6rem;
              vertical-align: middle;
              font-size: .9rem;
              color: #666;
              border-radius: 50%;
              border: 1px solid #f4f4f4;
              text-align: center;
            }
            >input {
              display: block;
              height: 1.8rem;
              width: 3rem;
              color: #666;
              font-size: .75rem;
              border-radius: 1.25rem;
              border: 1px solid #f4f4f4;
              text-align: center;
              padding: 0 5px;
              margin: 0 8px;
            }
            .orderX,
            .orderNum {
              color: #999;
            }
            .orderNum {}
            .orderX {
              font-size: .72rem;
              vertical-align: top;
              margin-right: 0.625rem;
            }
            .orderNum {
              font-size: .82rem;
            }
          }
        }
      }
      &.nodata {
        font-size: .7rem;
        padding: 1rem 0;
        text-align: center;
        color: #666;
      }
    }
  }
  .footer-secondary {
    padding: 0 !important;
    .btnWrap {
      width: 100%;
      height: 100%;
      margin-bottom: 0;
      >li {
        float: left;
        width: 50%;
        height: 100%;
        line-height: 2.8rem;
        font-size: .81rem;
        border-radius: 0;
        vertical-align: middle;
        text-align: center;
        &.clearBtn {
          color: #ff7e4b;
          background-color: #fff;
        }
        &.placeBtn {
          color: #fff;
          background-color: #ff7e4b;
        }
      }
    }
  }
  footer.footer {
    background: #fff;
    -moz-box-shadow: 0px 2px 20px #f4f4f4;
    box-shadow: 0px 2px 20px #f4f4f4;
    .icon {
      width: 1.4rem;
      height: 1.4rem;
      background-size: 1.4rem !important;
      margin-top: 8px;
      &.addIcon {
        background: url('../../static/images/add-icon.png') no-repeat center center;
      }
      &.checkoutIcon {
        background: url('../../static/images/checkout-icon.png') no-repeat center center;
      }
      &.delIcon {
        background: url('../../static/images/del-icon.png') no-repeat center center;
      }
      &.channelIcon {
        background: url('../../static/images/channel-icon.png') no-repeat center center;
      }
      &.cashierIcon {
        background: url('../../static/images/cashier-icon.png') no-repeat center center;
      }
    }
    label {
      color: #666;
    }
  }
  .actions-modal {
    .modal-content {
      background: #f2f2f2;
      border-radius: 0;
      border: 0 !important;
      .action-group {
        margin: 0 !important;
        background: #fff;
        padding: 0 .9rem;
        &:first-child {
          margin-bottom: 0.6rem !important;
        }
        .action-button {
          background: #fff !important;
          border-radius: 0;
          font-size: .72rem;
          color: #333;
          font-weight: 600;
          &:after {
            height: 2px !important;
            background-color: #f4f4f4 !important;
          }
          &.gray {
            color: #999;
          }
        }
      }
    }
  }
}

</style>
