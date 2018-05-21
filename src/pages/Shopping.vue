<template>
	<div id="shoppingWrapper" class="page">
		<page-header>
	      <header-link :left="true" :edge="true" v-back-link><icon icon="back"></icon></header-link>
	      <header-title>{{tableArea}}{{tableNum}}</header-title>
	    </page-header>
	    <page-footer>
			<ul>
				<li>
					<div class="shoppingCarWrap">
						<span class="shoppingIcon"></span>
						<span class="shoppingNum">{{num}}</span>
					</div>
					<div class="amountWrap">
						<h5>结算金额</h5>
						<p>
							<em class="unit">￥</em>
							<span class="totalPrice">{{amount}}</span>
						</p>
						
					</div>
				</li>
				<li>
					<a href="javascript:void(0)" @click="orderEvt">选好了</a>
				</li>
			</ul>
		</page-footer>
	    <page-content>
	    	<section class="main">
				<div class="left">
					<ul class="typeList">
						<li v-for="(item, index) of typeList" :class="{active:selected==index}" :data-id="item.itemid" @click="change(index,$event)">{{item.itemdesc}}</li>
					</ul>
				</div>
				<div class="right">
					<div class="list" v-for="(dish, index) in dishList">
						<h1>{{dish.name}}</h1>
						<ul>
							<li v-for="(item, index) in dish.list" :data-id=item.dishid :data-selected=item.dishSelect :data-unit=item.unit :data-price=item.price :data-label=item.label @click.prevent="cuisineEvt($event)" :class="{empty: item.label == 1 || item.label == null, selected:item.dishSelect}">
								<div>
									<p class="pName">{{item.title}}</p>
									<p class="pPrice"><span class="salePrice">￥<!-- {{Number(item.price).toFixed(0)}} -->{{item.price}}<em class="unit">/{{item.unit}}</em></span></p>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</section>
	    </page-content>
		<toast :text="msgText" type="error" ref="msg"></toast>
	</div>
</template>

<script>
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle, HeaderLink, SecondHeader} from '../../node_modules/vum/src/components/header'
import { Footer } from '../../node_modules/vum/src/components/footer'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'
import { Tab, TabItem } from '../../node_modules/vum/src/components/tab'
import PopWindow from '../../node_modules/vum/src/components/popwindow'
import Toast from '../../node_modules/vum/src/components/toast'
export default {
	name: 'shopping',
	components: {
	    Page,
	    'page-content': Content,
	    'page-header': Header,
	    HeaderTitle,
	    HeaderLink,
	    SecondHeader,
	   	'page-footer': Footer,
	    Icon,
	    Preloader,
	    'm-button': Button,
	    PopWindow,
	    Toast,
	    Tab,
	    TabItem
	  },
	data () {
		return {
			apiurl: localStorage.getItem('apiurl'),
			selected: 0,
			tableArea: '',
			tableNum: '',
			orderid: '',
			num: 0,
			amount: '0.00',
			wld: [],
			js: [],
			// typeName: '',
			typeList: [],
			dishList: [],
			dishStore: [],
			// dishTypeId: '',
			msgText: '',
			selectDishList: [],
			ajaxArr: [],
			timeout: '',
			// seqNum: '',
			callState: false
		}
	},

	created () {
		this.init()
		this.getList()
	},

	methods: {
		// 选好了事件
		orderEvt () {
			if(this.selectDishList.length) {
				if(!this.callState) {
					this.bookorder()
				}	
			}else{
				this.msgText = '还未选择商品';
            	this.$refs.msg.open();
			}
		},

		// 生成或更新未落单
		bookorder () {
			if(this.wld.length) {
				var self = this;
				let arr = [];
				$.each(this.selectDishList, function(i,o){
					var state = true;
					$.each(self.wld, function(j, p){
						if(o.dishid == p.dishid && !p.ordertype) {
							state = false;
							self.updateDetailEvt(p.orderdetailid, Number(p.dishnum));
						}
					})
					if(state) {
						let obj = {
							"printtype": "0",
							"pricetype": 0,
							"userName": null,
							"orderid": null,
							"dishtype": 0,
							// "orderseq": this.seqNum,
							"dishnum": "1",
							"sperequire": "",
							"primarykey": "9A82543061E67C32BABB6153CA9110D4",
							"dishstatus": "0",
							"ispot": 0,
							"taste": "",
							"freeuser": null,
							"freeauthorize": null,
							"freereason": null,
							"dishes": null,
							'status':0,
							"branchid": localStorage.getItem('branchId')
						}
						obj.orderprice = o.orderprice;
						obj.orignalprice = o.orignalprice;
						obj.dishid = o.dishid;
						obj.dishunit = o.unit;
						arr.push(obj);
					}
				})
				if(arr.length) {
					this.bookorderEvt(arr);
				}
			}else{
				let arr = [];
				$.each(this.selectDishList, function(i, item){
					let obj = {
						"printtype": "0",
						"pricetype": 0,
						"userName": null,
						"orderid": null,
						"dishtype": 0,
						// "orderseq": this.seqNum,
						"dishnum": "1",
						"sperequire": "",
						"primarykey": "9A82543061E67C32BABB6153CA9110D4",
						"dishstatus": "0",
						"ispot": 0,
						"taste": "",
						"freeuser": null,
						"freeauthorize": null,
						"freereason": null,
						"dishes": null,
						'status':0,
						"branchid": localStorage.getItem('branchId')
					}
					obj.orderprice = item.orderprice;
					obj.orignalprice = item.orignalprice;
					obj.dishid = item.dishid;
					obj.dishunit = item.unit;
					arr.push(obj);
				})
				this.bookorderEvt(arr);
			}
			this.promiseEvt();
		},

		// 并发请求ajax
		promiseEvt () {
			var self = this;
			this.callState = true;
			this.$http.all(this.ajaxArr).then(function(res){
				self.callState = false;
				if(res.length) {
					self.msgText = '添加成功，返回订单页';
            		self.$refs.msg.open();
				    self.$router.push({ path: '/order' });	
				}
			}).catch(function(error){
				self.callState = false;
			})
		},

		// 新生成
		bookorderEvt (arr) {
			let type = this.js.length ? 1 : 0;
			let data = {
				"currenttableid": this.tableNum,
				"globalsperequire": "",
				"orderid": this.orderid,//,'H20180113601742000001'
				"operationType": 1,
				"sequence": 94,
				"type": type,
				"rows": arr
			}
			let url = this.$http.post(this.apiurl + '/padinterface/bookorderList', data);
			this.ajaxArr.push(url);
		},

		// 更新
		updateDetailEvt (orderdetailid, dishnum) {
			let data = {
				orderid: this.orderid,
				orderdetailid: orderdetailid,
				discardUserId: localStorage.getItem('userid'),
				dishnum: dishnum+1,
			}
			let url = this.$http.post(this.apiurl + '/padinterface/updateOrderDetail', data);
			this.ajaxArr.push(url);
		},

		// 初始化数据
		init () {
			this.tableArea = localStorage.getItem("tableArea");
			this.tableNum = localStorage.getItem("tableNum");
			this.orderid = localStorage.getItem("orderid");
			// this.seqNum = localStorage.getItem("seqNum");
		},

		// 获取全部商品列表
		getList () {
			var self = this;
			this.$http.get(this.apiurl + '/padinterface/oneOrder?id='+this.orderid+'&type=0&num=1').then(function(res){
				if(res.data.code == 0) {
					let data =res.data.data; 
					self.typeList = data.basicData;
					// self.typeName = data.basicData[0].itemdesc;
					// self.dishTypeId = data.basicData[0].itemid;
					self.dishStore = data.food;
					self.wld = data.wld;
					self.js = data.js;
					$.each(self.dishStore, function(i,item){
						item.dishSelect = 0;
					})
					self.getDishList();
				}
			}).catch(function(error){
				self.msgText = '网络请求超时，请刷新重试';
            	self.$refs.msg.open();
			})
		},

		// 商品分类组装
		getDishList () {
			var data = this.dishStore;
			var t = this.typeList;
			this.dishList = [];
			for(var i in t) {
				var obj = {};
				obj.id = t[i].itemid;
				obj.name = t[i].itemdesc;
				obj.list = [];
				for(var j in data) {
					if(data[j].fcolumnid == t[i].itemid) {
						obj.list.push(data[j]);
					}
				}
				this.dishList.push(obj);
			}
			// for(var i in data) {
			// 	if(data[i].fcolumnid == this.dishTypeId) {
			// 		this.dishList.push(data[i]);
			// 	}
			// }
		},

		cuisineEvt (e) {
			let label = e.currentTarget.dataset.label;
			if(label == 1 || label == null) {
				return false;
			}else{
				// this.permissionUrl = '/padinterface/bookorderList?new';
				// this.permissionUrl = '/padinterface/bookorderList';
				// if(!this.authority(this.permissionUrl)) {
				//       	this.msgText = '对不起，您暂无添加商品权限';
				//       	this.$refs.msg.open();
				//     } else {
						let dishSelect = e.currentTarget.dataset.selected,
							dishid = e.currentTarget.dataset.id,
							unit = e.currentTarget.dataset.unit,
							price = e.currentTarget.dataset.price;
						this.checkDishInventory(dishid, dishSelect, price, unit);
				// }	
			}
		},

		// 移除selectDishList中指定的元素
		delSelList (id) {
			for(var i in this.selectDishList) {
				if(this.selectDishList[i].dishid == id) {
					this.selectDishList.splice(i,1);
				}
			}
		},

		// 检查库存是否充足
		checkDishInventory (dishid, dishSelect, price, unit) {
			// let self = this;
			let type = 1;
			if(dishSelect == 1) {
				type = 0;
			}
			// this.$http.post(this.apiurl + '/api/employee/calcInventory', {
			// 	dishid: dishid,
			// 	dishCount: 1,
			// 	// branchId: localStorage.getItem('branchId'),
			// 	branchid: '43990',
			// 	orderid: this.orderid,
			// 	type: type
			// }).then(function(res){
			// 	if(res.data.code == 1){
					this.cuisineSelEvt(dishid, dishSelect)
					this.calculate(price, dishSelect)
					if(type == 1) {
						var obj = {};
						obj.orderprice = price;
						obj.orignalprice = price;
						obj.dishid = dishid;
						obj.unit = unit;
						this.selectDishList.push(obj);
					}else{
						this.delSelList(dishid);
					}
					
			// 	}else{
			// 		self.msgText = '该商品库存不足';
   			//  self.$refs.msg.open();
			// 	}
			// })
		},

		// 计算价格
		calculate (price, type) {
			if(type == '0') {
				this.num++;
				this.amount = Number(Number(this.amount) + Number(price)).toFixed(2);
			}else if(type == '1') {
				this.num--;
				this.amount = Number(Number(this.amount) - Number(price)).toFixed(2);
			}
		},

		// 商品选中状态改变
		cuisineSelEvt (id, state) { //0选中，1未选
			$.each(this.dishStore, function(i,item){
				if(item.dishid == id) {
					state == '0' ? item.dishSelect = 1 : item.dishSelect = 0;
				}
			})
			// this.getDishList();
		},

		// 左边导航栏切换
		change(index, e) {
			if(this.selected == index) return;
	       	this.selected = index;
	       	// this.typeName = this.typeList[index].itemdesc;
	       	// this.dishTypeId = e.currentTarget.dataset.id;
	        let jump = document.querySelectorAll('.list')
	        let total = jump[index].offsetTop
	        let distance = document.documentElement.scrollTop || document.body.scrollTop
	        // 平滑滚动，时长500ms，每10ms一跳，共50跳
	        let step = total / 50
	        if (total > distance) {
	          	smoothDown()
	        } else {
	          	let newTotal = distance - total
	          	step = newTotal / 50
	          	smoothUp()
	        }
	        function smoothDown () {
	          if (distance < total) {
	            	distance += step
	　　　　　　　	document.querySelector('.right').scrollTop = distance
	            	setTimeout(smoothDown, 10)
	          	} else {
	            	document.querySelector('.right').scrollTop = total
	          	}
	        }
	        function smoothUp () {
	          	if (distance > total) {
	            	distance -= step
	　　　　　　　	document.querySelector('.right').scrollTop = distance
	       
	            	setTimeout(smoothUp, 10)
	          	} else {
	            	document.querySelector('.right').scrollTop = total
	  
	          	}
	       	} 
		  
	      },
	}
}
</script>

<style lang="less" rel="stylesheet/less">
#shoppingWrapper {
	section {
		&.main {
			&:after {
				display:block;
				clear:both;
				content:"";
				visibility:hidden;
				height:0
			}
			zoom:1;
			display: flex;
		    width: 100%;
		    height: 100%;
			.left {
				float: left;
				width: 25%;
				height: 100%;
				overflow: auto; 
				ul.typeList {
					li {
						width: 100%;
						font-size: .8rem;
						color: #666;
						padding: .9rem .2rem;
						text-align: center;
						&.active {
							background-color: #fff;
						}
					}
				}
			}
			.right {
				float: right;
				width: 75%;
				height: 100%;
				background-color: #fff;
				overflow: auto; 
				padding: .9rem;
				.list {
					h1 {
						font-size: .8rem;
						font-weight: 600;
						margin-bottom: .3rem;
					}
					ul {
						clear: both;
						overflow: hidden;
						margin-bottom: .8rem;
						li {
							display: inline-block;
							width: calc(100%/3);
							float: left;
							margin-bottom: 10px;
							div {
								width: 96%;
								height: 0;
								padding-bottom: 96%;
								text-align: center;
								border: 1px solid #ddd;
								// padding: 8px 5px 10px;
								border-radius: 5px;
								margin-right: 5px;
							}
							&.selected {
								div {
									border-color: #ff7e4b;
								}
								
							}
							&.empty {
								div{
									background: #ccc;
								}
							}
							.pName {
								font-size: .6rem;
								color: #666;
								padding-bottom: 2px;
								margin-top: 15%;
							}
							.pPrice {
								line-height: 12px;
								.salePrice {
									font-size: 12px;
									color: #ff7e4b;
									.unit {
										font-size: 0.5rem;
										font-style: normal;
										color: #ff7e4b;
									}
								}
							}
							&:nth-child(3n+1) {
								clear: left;
							}
						}
					}
				}
			}
		}
	}
	footer {
		background-color: #fff !important;
		-moz-box-shadow: 0px 2px 20px #f4f4f4;
    	box-shadow: 0px 2px 20px #f4f4f4;
	    ul {
	    	clear: both;
	    	overflow: hidden;
	    	width: 100%;
	    	border-bottom: 0;
	    	// padding: 10px 0;
	    	margin-bottom: 0;
	    	li {
	    		float: left;
	    		&:first-child {
	    			width: 70%;
	    			padding: 0.54rem .9rem;
	    			.shoppingCarWrap {
	    				position: relative;
	    				.shoppingIcon {
	    					display: block;
	    					background: url('../../static/images/shopping-icon.png') no-repeat center center;
							background-size: 2.2rem;
							width: 2.2rem;
							height: 2.2rem;
	    				}
	    				.shoppingNum {
	    					display: block;
	    					position: absolute;
	    					top: -5px;
	    					right: -10px;
	    					width: 1rem;
	    					height: 1rem;
	    					line-height: 1rem;
	    					text-align: center;
	    					background-color: #ff7e4b;
	    					color: #fff;
	    					font-size: 0.64rem;
	    					border-radius: 50%;
	    				}
	    			}
	    			.shoppingCarWrap, .amountWrap {
	    				display: table-cell;
	    				vertical-align: bottom;
	    			}
	    			.amountWrap {
	    				padding-left: 1.45rem;
	    				h5 {
	    					font-size: .63rem;
	    					color: #666;
	    					margin-bottom: 0;
	    					padding-left: 5px;
	    				}
	    				p {
	    					margin-bottom: 0;
							line-height: 1.3rem;
	    					em {
	    						font-size: 0.63rem;
	    						font-style: normal;
	    						color: #ff7e4b;
	    					}
	    					.totalPrice{
	    						font-size: 1rem;
	    						color: #ff7e4b;
	    					}
	    				}
	    			}
	    		}
	    		&:last-child {
	    			width: 30%; 
	    			text-align: center;
	    			line-height: 3.4rem;
	    			>a {
	    				display: block;
	    				font-size: 1rem;
	    				background-color: #ff7e4b;
	    				color: #fff;
	    			}
	    		}

	    	}
	    }
	}
}
</style>