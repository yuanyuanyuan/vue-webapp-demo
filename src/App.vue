<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
    // 大写只是一种编写语法格式
    // 这个路径也跟 webpack 的 resolve 有关
    import MHeader from 'components/m-header/m-header'
    import Player from 'components/player/player'
    import Tab from 'components/tab/tab'

    export default {
        components: {
            MHeader, // 引入自定义组件，一共三个组件
            Tab,
            Player
        }
    }
</script>
