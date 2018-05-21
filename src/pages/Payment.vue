<template>
	<div id="paymentWrapper" class="page">
		<page-header>
	      <header-link :left="true" :edge="true" v-back-link><icon icon="back"></icon></header-link>
	      <header-title>在线收银</header-title>
	    </page-header>
	    <page-content>
			<section class="main">
				
				<p class="tips">出示二维码让顾客扫码支付</p>
				<div class="codeWrapper">
					<div class="codeTips" v-show="textShow">
						<img src="../../static/images/loading/bars.svg" alt="" v-show="loadingState">
						<span>{{loadingText}}</span>
					</div>
					<div id="alipaycode" v-show="isShow && !textShow"></div>
					<div id="wxpaycode" v-show="!isShow && !textShow"></div>
				</div>
				<!-- <img src="../../static/images/code-icon.png" alt="二维码" class="code-logo"/> -->
				<p class="payType">{{payText}}支付</p>
				<p class="payAmount">
					<span class="unit">￥</span>{{payAmount}}
				</p>
				<ul class="payList">
					<a href="javascript:void(0)" @click="changeChoose(1)"><li :class="{active:isShow}"><img src="../../static/images/alipay-icon.png" alt="支付宝" /></li></a>
					<a href="javascript:void(0)" @click="changeChoose(2)"><li :class="{active:!isShow}"><img src="../../static/images/wechat-icon.png" alt="微信" /></li></a>
					<!-- <a href="#"><li><img src="../../static/images/unionPay-icon.png" alt="银联" /></li></a>
					<a href="#"><li><img src="../../static/images/bank-icon.png" alt="其它银行" /></li></a>
					<a href="#"><li><img src="../../static/images/wingPay-icon.png" alt="翼支付" /></li></a> -->
				</ul>
			</section>
		</page-content>
		<preloader ref="preloader"></preloader>
		<toast :text="msgText" type="error" ref="msg"></toast>
	</div>
</template>

<script>
import QRCode from 'qrcodejs2'  
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle, HeaderLink} from '../../node_modules/vum/src/components/header'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'
import Toast from '../../node_modules/vum/src/components/toast'
export default {
	name: 'payment',
	components: {
	    Page,
	    'page-content': Content,
	    'page-header': Header,
	    HeaderTitle,
	    HeaderLink,
	    Icon,
	    Preloader,
	    Toast,
	    'm-button': Button
	},
	data () {
		return {
			apiurl: localStorage.getItem('apiurl'),
			orderid: '',
			branchid: '',
			userid: '',
			payurl: '',
			payAmount: '',
			ordertype: '',
			memberAmount:'',//会员减免金额
			cardNo: '',//会员卡号
			reliefAmount:'',//减免金额
			isShow: true,
			textShow: true,
			loadingState: true,
			payText: '支付宝',
			payType: [1,2], //1支付宝，2微信
			msgText: '',
			interval: '',
			loadingText: '二维码生成中，请稍等...',
		}
	},
	beforeRouteLeave (to, from , next) {
	    clearInterval(this.interval);
	    next();
	},
	mounted() {
		this.init();
		this.getOrderInfo();
		this.interval = setInterval(()=>{
			if(this.payurl) {
				this.checkPay();
			}
			
		},2000)
	},
	methods: {
		// 获取支付账单信息
		getOrderInfo () {
			let self = this;
			var data = {orderid: this.orderid}
			this.$http.post(this.apiurl + '/account/toAccount', data).then(function(res){
				if(res.data.code==1) {
					self.payAmount = Number(res.data.order.dueamount).toFixed(2);
					self.ordertype = res.data.order.ordertype;
					self.getPayUrl(1);
					// for(var i in self.payType) {
					// 	self.getPayUrl(self.payType[i]);
					// }
				}
			})
		},

		init () {
			this.orderid = localStorage.getItem('orderid');
			this.userid = localStorage.getItem('userid');
			this.branchid = localStorage.getItem("branchId");
		},

		//获取支付链接
		getPayUrl (type) {
			var self = this;
			this.textShow = true;
			this.loadingState = true;
			var url = this.apiurl + '/account/getVip';
			var data = {
				orderid: this.orderid,
				orderAmount: this.payAmount,
				branchid: this.branchid,
				type: type,
				ydurl: '/chain-newspicyway/api/pay/ospaymoney'
			}
			this.$http.post(url, data).then(function(res){
				if(res.data.code == 1) {
					self.textShow = false;
					var url = res.data.code_url;
					self.payurl = res.data.payId;
					self.createCode(type, url);
				}else if(res.data.code == -1){
					self.loadingState = false;
					self.loadingText = '网络错误，二维码生成失败';
				}
				
			}).catch(function(error){
				self.loadingState = false;
				self.loadingText = '网络错误，二维码生成失败';
			})
		},

		// 实时监测支付是否成功
		checkPay () {
			var self = this;
			var data = {
				"code_url":this.payurl,
				"branchid":this.branchid,
				"orderAmount":this.payAmount
			};
			this.$http.post(this.apiurl + '/account/queryPay', data).then(function(res){
				if(res.data.code==1) {
					self.pay(res.data.payType, self.payurl);
				}
			})
		},

		 // 打印
	    printEvt () {
	    	let data = {
	    		orderid: this.orderid,
	    		type: 'y',
	    		isBefore: 0,
	    		// orderseq: localStorage.getItem('seqNum')
	    	}
	    	this.$http.post(this.apiurl + '/api/employee/doPrinter', data);
	    },


		// 结算账单
		pay (type, codeUrl) {
			var self = this;
			var data = {
				"payway":1,//支付方式 1:微信支付宝
				"orderid":this.orderid,//订单id
				"ymamount":this.memberAmount,//会员减免
				"wipeamount":this.reliefAmount,//减免金额
				"dueamount":this.payAmount,//账单应付金额
				"cardNo":this.cardNo,//如果结算没有与会员相关的传空
				"userid":this.userid,
				"branchid":this.branchid,
				"payType": type,
				"code_url": codeUrl
			};
			this.$http.post(this.apiurl + '/account/closeAccounts', data).then(function(res){
				if(res.data.code==0) {
					self.$http.get(self.apiurl + '/padinterface/checkout?tid='+localStorage.getItem('tableID')).then(function(re){
						if(re.data.code==0){
							self.$http.get(self.apiurl + '/app/getTables?tableid='+localStorage.getItem('tableID')+'&type=0&ucode=' + localStorage.getItem('userid')).then(function(res){
								if(res.data.code == 0) {
									self.printEvt();
									self.msgText = '支付成功,返回首页';
				            		self.$refs.msg.open();
				            		self.$router.push({ path: '/home' });
								}
							})					
						}
					})
				}
			})
		},

		// 生成跳转二维码
		createCode (type, url) {
			var id = 'wxpaycode';
			if(type == 1) {
				id = 'alipaycode';
			}
			if(!$('#'+id).children().length) {
				this.qrcode = new QRCode(id, {  
			        text: url, // 二维码内容  
			        render: 'canvas', // 设置渲染方式（有两种方式 table和canvas，默认是canvas）  
			        // background: '#f0f',  
			        // foreground: '#ff0'  
			   	})
			}
			
		},

		// 选择支付方式
		changeChoose (t) {
			if(t == 1) {
				this.isShow = true;
				this.payText = '支付宝';
			}else if(t == 2) {
				this.isShow = false;
				this.payText = '微信';
			}
			this.loadingText = '二维码生成中，请稍等...';
			this.getPayUrl(t);
		}
	}
}
</script>

<style lang="less" rel="stylesheet/less">
#paymentWrapper {
	height: 100%;
	section {
		&.main {
			padding: 0 2rem;
			.tips {
				font-size: .64rem;
				color: #666;
				text-align: center;
				padding: 2rem 0 .85rem;
			}

			img {
				&.code-logo {
					display: inline-block;
					width: 100%;
				}
			}
			.codeWrapper {
				display: table;
				width: 100%;
				padding: 1rem;
				background-color: #fff;
				min-height: 12rem;
				img {
					display: inline-block;
					width: 100% !important;
				}
			}
			.codeTips {
				display: table-cell;
				vertical-align: middle;
				font-size: .64rem;
				color: #666;
				text-align: center;
				img {
					display: block;
					margin: auto;
					width: 2.5rem !important; 
				}
				span {
					color: #bbb;
				}
			}
			.payAmount {
				text-align: center;
				padding-bottom: 1rem;
				font-size: 1.2rem;
				color: #666;
				.unit {
					font-size: 0.875rem;
					color: #666;
				}
			}
			.payType {
				padding-top: 1rem;
				text-align: center;
				color: #666;
				font-weight: 600;
			}
			ul.payList {
				// &:after {
				// 	display:block;
				// 	clear:both;
				// 	content:"";
				// 	visibility:hidden;
				// 	height:0
				// }
				// zoom:1;
				text-align: center;
				li {
					display: inline-block;
					width: 20%;
					// padding: 2px;
					>img {
						display: block;
						width: 100%;
					}
					&.active {
						border: 2px solid #ff7e4b;
					}
				}
			}
		}
	}	
}
</style>