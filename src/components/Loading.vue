<template>
  <div class="loading">
    <img src="../../static/images/loading/oval.svg" alt="loading">
    <span>数据加载中，请稍后...</span>
  </div>
</template>

<script>
export default {
  name: 'loading',
  data () {
    return {}
  }
}
</script>

<style lang="less" scoped>
.loading {
  margin: .6rem;
  text-align: center;
  img {
    display: block;
    margin: auto;
    width: 1.2rem;
  }
  span {
    font-size: 12px;
    color: #666;
  }
}
</style>