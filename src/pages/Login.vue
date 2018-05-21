<template>
  <div id="IPCheckWrapper" class="page">
    <page-header>
      <header-title>登录</header-title>
    </page-header>
    <page-content>
      <div>
        <section class="logoWrap">
          <img src="../../static/images/logo_2.png" alt="logo" class="logo" />
        </section>
        <section class="main">
          <div class="inputb userId">
            <span></span><input type="number" name="username" placeholder="员工编号" class="input" v-model.trim="loginData.username">
          </div>
          <div class="inputb pwd">
            <span></span><input type="password" name="pass" placeholder="登录密码" class="input" v-model.trim="loginData.password">
          </div>
          <div class="inputb ipAddress">
            <span></span><input type="text" name="ip" class="input gray" readonly="" v-model="ipAddress">
            <a href="javascript:void(0)" class="changeIp" @click="changeIp">更换主机</a>
          </div>
          <div class="content-block">
            <m-button size="large" type="warning"  @click.native="login()">登录</m-button>
          </div>
        </section>
      </div>
    </page-content>
    <preloader ref="preloader"></preloader>
    <toast :text="msgText" type="error" ref="msg"></toast>
  </div>
</template>

<script>
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle} from '../../node_modules/vum/src/components/header'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'
import Toast from '../../node_modules/vum/src/components/toast'

export default {
  name: 'Login',
  components: {
    Page,
    'page-content': Content,
    'page-header': Header,
    HeaderTitle,
    Icon,
    Preloader,
    Toast,
    'm-button': Button
  },

  data () {
    return {
      apiurl: localStorage.getItem('apiurl'),
      ipAddress: '',
      msgText: '',
      netError: '网络错误，请刷新重试',
      loginData: {
        loginType: 'assist',
        username: '',
        password: '',
        ip: ''
      }
    }
  },
  mounted() {
    this.setIPVal();
  }, 
  methods: {
    // 默认设置ip地址
    setIPVal () {
      let ip = localStorage.getItem('ipaddress');
      if(ip != undefined) {
        this.ipAddress = ip;
        this.loginData.ip = ip;
      }
    },

    // 跳转回ip检查页面
    changeIp () {
      this.$router.push({ path: '/' })
    },
    
    // 登录
    login () {
      var self = this;
      if(!this.loginData.username) {
        this.msgText = '员工编码不能为空';
        this.$refs.msg.open();
        return false;
      }
      if(!this.loginData.password) {
        this.msgText = '登录密码不能为空';
        this.$refs.msg.open();
        return false;
      }
      this.$http.post(this.apiurl + '/padinterface/login.json', this.loginData).then(function(res){
          let code = res.data.code;
          if(code == 0) {
            // let arr = res.data.authority;
            // let authorityAll = [];
            // if(arr.length){
            //   for(var i in arr){
            //     authorityAll.push(arr[i].url)
            //   }
            // }
            localStorage.setItem("permission",res.data.cashier)
            localStorage.setItem("name", res.data.user.name)
            localStorage.setItem("username",self.loginData.username)
            localStorage.setItem("loginType",self.loginData.loginType)
            localStorage.setItem("branchId", res.data.user.branchid)
            localStorage.setItem("userid", res.data.user.account)
            // localStorage.setItem("permission", JSON.stringify(authorityAll))  //权限信息
            self.$router.push({ path: '/home' })
          }else if(code == -2) {
            self.msgText = '请勿重复登录';
            self.$refs.msg.open();
          }else{
            self.msgText = res.data.msg;
            self.$refs.msg.open();
          }
      })
     //  $.ajax({
     //    type: "POST",
     //    url: this.apiurl + '/padinterface/login.json',
     //    data: this.loginData,
     //    dataType: "json",
     //    contentType: "application/json",
     //    beforeSend: function(){
     //      self.$refs.preloader.open()
     //    },
     //    success: function(data){
     //      let code = data.code;
     //      if(!code) {
     //        localStorage.setItem("username",self.loginData.username)
     //        localStorage.setItem("loginType",self.loginData.loginType)
     //        self.$router.push({ path: '/home' })
     //      }else if(code == 1) {
     //        self.msgText = data.msg;
     //        self.$refs.msg.open();
     //      }
     //    },
     //    error: function(data){
     //      self.msgText = self.netError;
     //      self.$refs.msg.open();
     //    },
     //    complete: function() {
     //      self.$refs.preloader.close()
     //    }
     // })
    },
  }
}
</script>

<style lang="less" scoped>
#IPCheckWrapper {
  section {
    &.logoWrap {
      padding: 3rem 0 2rem;
      text-align: center;
      >img {
        display: inline-block;
         width: 90px;
        height: 90px;
        border: 2px solid #fff;
        border-radius: 50%;
      }
    }
    &.main {
      box-sizing: border-box;
      padding: 0 1rem;
      .inputb {
        display: flex;
        width: 100%;
        height: 2.5rem;
        background-color: #fff;
        text-align: left;
        padding: 0 0.65rem;
        box-sizing: border-box;
        border-radius: 4px;
        margin-bottom: 0.85rem;
        >span {
          display: inline-block;
          width: 1.25rem;
          height: 100%;
        }
        &.userId {
          >span {
            background: url('../../static/images/user-icon.png') no-repeat center center;
            background-size: 1.25rem;
          }
        }
        &.pwd {
          >span {
            background: url('../../static/images/pwd-icon.png') no-repeat center center;
            background-size: 1.25rem;
          }
        }
        &.ipAddress {
          position: relative;
          >.changeIp {
            position: absolute;
            top: 0;
            right: 0.65rem;
            color: #ff7e4b;
            line-height: 2.5rem;
            font-size: 0.65rem;
            &:hover {
              text-decoration: none;
            }
          }
          >span {
            background: url('../../static/images/ip-icon.png') no-repeat center center;
            background-size: 1.25rem;
          }
        }
        >.input {
          display: inline-block;
          width: calc(100% - 1rem);
          height: 100%;
          padding-left: 0.65rem;
          font-size: .7rem;
          // font-size: 0.875rem;
          &.gray {
            color: #ccc;
          }
        }
      }
      .content-block {
          padding: 1.5rem 0;
        }
    }
  }
}
</style>

