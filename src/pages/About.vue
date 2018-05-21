<template>
  <div id="aboutWrapper" class="page">
    <page-header>
      <header-link :left="true" :edge="true" v-back-link><icon icon="back"></icon></header-link>
      <header-title>设置</header-title>
    </page-header>
    <page-content>
      <section class="logoWrap">
        <img src="../../static/images/logo_2.png" alt="logo" class="logo" />
      </section>
      <section class="main">
        <ul>
          <li><label>客服电话：</label><a :href="'tel:' + phone" style="color: #333;">{{phone}}</a></li>
          <li><label>官方网站：</label><span>{{website}}</span></li>
        </ul>
      </section>
    </page-content>
    <preloader ref="preloader"></preloader>
  </div>
</template>

<script>
import Page from '../../node_modules/vum/src/components/page'
import {Header, HeaderTitle, HeaderLink} from '../../node_modules/vum/src/components/header'
import Content from '../../node_modules/vum/src/components/content'
import Icon from '../../node_modules/vum/src/components/icons'
import { Button } from '../../node_modules/vum/src/components/buttons'
import Preloader from '../../node_modules/vum/src/components/preloader'

export default {
  name: 'about',
  components: {
    Page,
    'page-content': Content,
    'page-header': Header,
    HeaderTitle,
    HeaderLink,
    Icon,
    Preloader,
    'm-button': Button
  },

  data () {
    return {
      phone: '400-088-9828',
      website: 'http://www.wemew.com'
    }
  },
  methods: {
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
            margin-bottom: 0;
            margin-right: 5px;
          }
      }
    }
  }
}
</style>

