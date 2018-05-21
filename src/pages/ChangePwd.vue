<template>
  <div id="aboutWrapper" class="page">
    <page-header>
      <header-link :left="true" :edge="true" v-back-link><icon icon="back"></icon></header-link>
      <header-title>设置</header-title>
    </page-header>
    <page-content>
      <section class="main">
        <ul>
          <li><label>原密码</label><input type="password" name="oldpass" v-model.trim="oldpass"/></li>
          <li><label>新密码</label><input type="password" name="newpass" v-model.trim="newpass"/></li>
          <li><label>再次确认</label><input type="password" name="confirmpass" v-model.trim="confirmpass" /></li>
        </ul>
        <div class="btnWrap">
          <button type="primary" @click="changePwdEvt" class="btn btn-block">提交</button>
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
  name: 'changePwd',
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
        oldpass: '', //原密码
        newpass: '', //新密码
        confirmpass: '', //确认密码
        msgText: '',
        netError: '网络错误，请刷新重试',
        msgTips: ['两次密码不一致','原密码不正确', '修改密码成功', '密码不能为空'],
    }
  },
  methods: {
    changePwdEvt: function() {
      var self = this;
      if(this.newpass && this.confirmpass && this.oldpass) {
        if(this.newpass !== this.confirmpass) {
          this.msgText = this.msgTips[0];
          this.$refs.msg.open();
          return false;
        }
      }else{
        this.msgText = this.msgTips[3];
        this.$refs.msg.open();
        return false;
      }
      
      $.ajax({
        type: "GET",
        url: this.apiurl + '/padinterface/uppass?oldpass='+this.oldpass+'&&newpass='+this.newpass+'&jobNumber='+localStorage.getItem('username'),
        dataType: "json",
        xhrFields:{
           withCredentials:true
        },
        beforeSend: function(){
          self.$refs.preloader.open()
        },
        success: function(data){
          let state = data.data;
          if(state == '0') {
            self.logout();
            // self.oldpass = '';
            // self.newpass = '';
            // self.confirmpass = '';
          } else if(state == '-1') {
            self.msgText = self.msgTips[1];
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

    logout () {
      let self = this;
      $.ajax({
        type: "GET",
        url: this.apiurl+'/padinterface/logout',
        xhrFields:{
           withCredentials:true
        },
        dataType: "json",
        success: function(data){
          if(data.code == 0) {
            localStorage.removeItem("username");
            localStorage.removeItem("userid");
            localStorage.removeItem("name");
            self.msgText = self.msgTips[2];
            self.$refs.msg.open();
            self.$router.push({ path: '/login'})
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
#aboutWrapper {
  section.logoWrap {
    padding: 3rem 0 2rem;
    text-align: center;
    >img {
      display: inline-block;
      border: 2px solid #fff;
      border-radius: 50%;
    }
  }
  section.main {
    ul {
      box-sizing: border-box;
      background-color: #fff;
      margin: 0.75rem 0 2rem;
      padding: 0 0.65rem;
      li {
        &:not(:last-child) {
          border-bottom: 1px solid #f4f4f4;
        }
        box-sizing: border-box;
        width: 100%;
        font-size: .72rem;
        padding: 0.9rem 0;
        label {
          display: block;
          color: #333;
          font-size: 0.64rem;
          margin-bottom: 0;
        }
        input {
          width: 100%;
        }
      }
    }
    .btnWrap {
      box-sizing: border-box;
      padding: 0 1rem;
      >.btn {
        height: 2.5rem;
        font-size: .85rem;
        background-color: rgb(255,126,75);
        color: #fff;
      }
    }
  }
}
</style>

