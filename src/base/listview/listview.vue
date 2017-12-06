<template>
    <scroll @scroll="scroll"
            :listen-scroll="listenScroll"
            :probe-type="probeType"
            :data="data"
            class="listview"
            ref="listview">
        <!--歌手列表的区域-->
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <!--右侧快速入口区域-->
        <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
             @touchmove.stop.prevent="onShortcutTouchMove"
             @touchend.stop>
            <ul>
                <li v-for="(item, index) in shortcutList" :data-index="index" class="item"
                    :class="{'current':currentIndex===index}">{{item}}
                </li>
            </ul>
        </div>
        <!--fix title顶部标题保持区域-->
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}}</div>
        </div>
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import Scroll from "base/scroll/scroll";
    import Loading from "base/loading/loading";
    import {getData} from "common/js/dom";
    // 标题高度常量
    const TITLE_HEIGHT = 30;
    // 锚点高度常量
    const ANCHOR_HEIGHT = 18;

    export default {
        props: {
            data: {
                type: Array,
                default: []
            }
        },
        computed: {
            // 因为右侧入口是单字母列表，所以要处理一下
            shortcutList() {
                return this.data.map((group) => {
                    return group.title.substr(0, 1)
                })
            },
            fixedTitle() {
                if (this.scrollY > 0) {
                    return ""
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ""
            }
        },
        data() {
            return {
                scrollY: -1, // 需要监测滚动坐标
                currentIndex: 0, // 需要监测当前高亮的滚动区域
                diff: -1
            }
        },
        created() {
            // 为了避免 vue 监测这个数据，所以在这里初始化这个数据
            this.probeType = 3; //better-scroll 的属性，要支持实时返回数据
            this.listenScroll = true; // 给 scroll 使用的是否监听属性
            this.touch = {}; // 触摸数据存放地方
            this.listHeight = []; // 每个listgroup 区域的高度数组
        },
        methods: {
            selectItem(item) {
                // 派发一个事件，父组件可以监听到这个事件
                this.$emit("select", item)
            },
            // 右侧入口的开始触摸事件
            onShortcutTouchStart(e) {
                // 获取右侧列表的 index
                let anchorIndex = getData(e.target, "index");
                // 获得第一个触碰手指位置
                let firstTouch = e.touches[0];
                // 获得触碰点的 y 坐标
                this.touch.y1 = firstTouch.pageY;
                // 将锚点 index 放到 touch 对象存放
                this.touch.anchorIndex = anchorIndex;

                // 跳转到左侧列表的对应的 index 的 dom
                this._scrollTo(anchorIndex);
            },
            // 右侧入口的触摸移动事件
            onShortcutTouchMove(e) {
                let firstTouch = e.touches[0];
                this.touch.y2 = firstTouch.pageY;
                // 将触摸移动的 y 坐标和开始触碰 y 坐标相减然后除以每个锚点的高度，然后取整
                // 即y轴上的偏移除以每个锚点的高度
                let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
                // 跳转到左侧列表的对应的 index 的 dom
                this._scrollTo(anchorIndex)
            },
            refresh() {
                this.$refs.listview.refresh()
            },
            // 通过获取到scroll组件的 pos 坐标
            scroll(pos) {
                this.scrollY = pos.y
            },
            // 计算listgroup里面每个 li 的 高度
            _calculateHeight() {
                this.listHeight = [];
                // 获取了所有的 listgroup 的 dom 信息
                const list = this.$refs.listGroup;
                let height = 0;
                this.listHeight.push(height);
                for (let i = 0; i < list.length; i++) {
                    let item = list[i];
                    // 将每个高度都存入 listHeight 数组
                    height += item.clientHeight;
                    this.listHeight.push(height);
                }
            },
            _scrollTo(index) {
                // 处理index 没有的时候
                if (!index && index !== 0) {
                    return
                }
                // 处理首部和尾部的点击的index 问题
                if (index < 0) {
                    index = 0
                } else if (index > this.listHeight.length - 2) {
                    index = this.listHeight.length - 2
                }
                // 滚动到指定位置的时候更新 scrollY，位置是每个 listhight 的上限位置
                this.scrollY = -this.listHeight[index];
                // 使用 scroll 封装的 api 来移动
                this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
            }
        },
        watch: {
            data() {
                // data 变化就要重新计算高度
                setTimeout(() => {
                    this._calculateHeight()
                }, 20)
            },
            scrollY(newY) {
                // scrollY的值是通过 better-scroll 返回的 pos y 坐标写入的
                const listHeight = this.listHeight;
                // 当滚动到顶部，newY>0(向下滚动 y坐标会变成负数)
                if (newY > 0) {
                    this.currentIndex = 0;
                    return
                }
                // 在中间部分滚动
                // length -1 是为了保证滚动的区域是在中间
                for (let i = 0; i < listHeight.length - 1; i++) {
                    // 下限(上一个 listGroup 的高度和下一个listGroup高度之间就是一个区域)
                    let height1 = listHeight[i];
                    // 上限
                    let height2 = listHeight[i + 1];
                    if (-newY >= height1 && -newY < height2) {
                        this.currentIndex = i;
                        this.diff = height2 + newY;
                        return
                    }
                }
                // 当滚动到底部，且-newY大于最后一个元素的上限
                this.currentIndex = listHeight.length - 2
            },
            diff(newVal) {
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
                if (this.fixedTop === fixedTop) {
                    return
                }
                this.fixedTop = fixedTop;
                this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
            }
        },
        components: {
            Scroll,
            Loading
        }
    }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
        .list-group
            padding-bottom: 30px
            .list-group-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .avatar
                    width: 50px
                    height: 50px
                    border-radius: 50%
                .name
                    margin-left: 20px
                    color: $color-text-l
                    font-size: $font-size-medium
        .list-shortcut
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 20px
            padding: 20px 0
            border-radius: 10px
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 3px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-fixed
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
        .loading-container
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>
