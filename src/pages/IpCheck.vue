<template>
  <div id="IPCheckWrapper" class="page">
    <page-header>
      <header-title>验证主机</header-title>
      <header-link><span class="switchIp" @click="$refs.switch.open()">切换外网版</span></header-link>
    </page-header>
    <page-content>
      <div>
        <section class="logoWrap">
          <img src="../../static/images/logo_2.png" alt="logo" class="logo" />
        </section>
        <section class="main">
          <div class="inputb ipAddress">
            <span></span><input type="text" name="ip" placeholder="主收银机IP地址" class="input" v-model.trim="ipText"/>
          </div>
          <div class="content-block">
            <m-button size="large" type="warning" @click.native="submitEvt">验证</m-button>
          </div>
        </section>
      </div>
    </page-content>
    <preloader ref="preloader"></preloader>
    <toast :text="switchText" type="error" ref="switch"></toast>
    <toast :text="msgText" type="error" ref="msg"></toast>
  </div>
</template>

<script>
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle, HeaderLink} from '../../node_modules/vum/src/components/header'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'
import Toast from '../../node_modules/vum/src/components/toast'

export default {
  name: 'IpCheck',
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
      // apiurl: this.GLOBAL.baseUrl,
      show: false,
      apiurl: '',
      ipText: '',
      switchText: '努力开发中，敬请期待~',
      msgText: '',
      netError: '无法连接主机，请检查主机程序是否启动',
      port: ':8022',
    }
  },
  mounted() {
    this.checkLocalIp();
  }, 
  methods: {
    // 检查本地是否存在ip信息
    checkLocalIp () {
      let ip = localStorage.getItem('ipaddress');
      if(ip != undefined) {
        this.ipText = ip;
      }
    },

    // 提交
    submitEvt () {
      var self = this;
      var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      if(!this.ipText) {
        this.msgText = '主机IP不能为空';
        this.$refs.msg.open();
        return false;
      }else if(!reg.test(this.ipText)) {
        this.msgText = '主机IP格式错误';
        this.$refs.msg.open();
        return false;
      }
      $.ajax({
        type: "GET",
        url: 'http://' + this.ipText + this.port +'/app/checkHost',
        xhrFields:{
           withCredentials:true
        },
        dataType: "json",
        beforeSend: function(){
          self.$refs.preloader.open()
        },
        success: function(data){
          // console.log(data);
          let state = data.success;
          if(state) {
            self.apiurl = 'http://'+self.ipText+ self.port;
            localStorage.setItem("ipaddress",self.ipText);
            localStorage.setItem("apiurl", self.apiurl);
            self.$router.push({ path: '/login' });
          } else {
            self.msgText = data.msg;
            self.$refs.msg.open();
          }
        },
        error: function(data){
          self.msgText = self.netError;
          self.$refs.msg.open();
        },
        complete: function() {
          self.$refs.preloader.close()
        }
     })
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
        >span {
          display: inline-block;
          width: 1.25rem;
          height: 100%;
        }
        &.ipAddress {
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
        }
      }
      .content-block {
          padding: 1.5rem 0;
        }
    }
  }
}
</style>

