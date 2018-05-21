<template>
  <div id="SettingWrapper" class="page">
    <page-header>
      <header-link :left="true" :edge="true" v-back-link><icon icon="back"></icon></header-link>
      <header-title>设置</header-title>
    </page-header>
    <page-content>
      <section class="main">
      <ul>
        <li><span class="settingPwd"></span><router-link to="/changePwd" >修改密码</router-link></li>
        <li><span class="settingAbout"></span><router-link to="/about" >关于</router-link></li>
        <li><span class="settingVersion"></span><a href="javascript:void(0)">版本号</a><span class="version">{{version}}</span></li>
      </ul>
      <div class="btnWrap">
        <button type="primary" @click="logoutEvt" class="btn btn-block">安全退出</button>
      </div>
    </section>
    </page-content>
    <preloader ref="preloader"></preloader>
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
  name: 'setting',
  components: {
    Page,
    'page-content': Content,
    'page-header': Header,
    HeaderTitle,
    HeaderLink,
    Icon,
    Preloader,
    'm-button': Button,
    Toast,
  },

  data () {
    return {
      show: false,
      version: '1.0.1',
      msgText: '',
      netError: '网络错误，请刷新重试',
    }
  },
  methods: {
    // 退出登录
    logoutEvt () {
      let self = this;
      $.ajax({
        type: "GET",
        url: localStorage.getItem('apiurl')+'/padinterface/logout',
        xhrFields:{
           withCredentials:true
        },
        dataType: "json",
        beforeSend: function(){
          self.$refs.preloader.open()
        },
        success: function(data){
          if(data.code == 0) {
            localStorage.removeItem("username");
            localStorage.removeItem("userid");
            localStorage.removeItem("name");
            self.msgText = '退出成功';
            self.$refs.msg.open();
            self.$router.push({ path: '/login'})
            // setTimeout(function(){
              
            // },1500) 
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
    }
  }
}
</script>

<style lang="less" scoped>
#SettingWrapper {
  section.main {
    ul {
      box-sizing: border-box;
      background-color: #fff;
      margin: 0.75rem 0 2rem;
      padding: 0 0.65rem;
      list-style: none;
      li {
        &:not(:last-child) {
          border-bottom: 1px solid #f4f4f4;
        }
        &:last-child {
          position: relative;
        }
        box-sizing: border-box;
        width: 100%;
        padding: 0.9rem 0;
        >a {
          display: table-cell;
          vertical-align: middle;
          color: #333;
          font-size: .72rem;
          padding: 0 0.65rem;
        }
        >span {
          display: table-cell;
          vertical-align: middle;
          width: 1.35rem;
          height: 1.35rem;
          background-size: 1.35rem !important;
          &.settingPwd {
            background: url('../../static/images/pwd-icon.png') no-repeat center center;
            
          }
          &.settingAbout {
            background: url('../../static/images/about-icon.png') no-repeat center center;
          }
          &.settingVersion {
            background: url('../../static/images/version-icon.png') no-repeat center center;
          }
          &.version {
            position: absolute;
            top: 1.1rem;
            right: 0;
            width: auto;
            font-size: .72rem;
            color: #ccc;
          }
        }
      }
    }
    .btnWrap {
      box-sizing: border-box;
      padding: 0 1rem;
      >.btn {
        height: 2.5rem;
        font-size: .85rem;
        background-color: #fff;
        color: rgb(255,126,75);
      }
    }
  }
}
</style>

