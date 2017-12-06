<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <!--使用了slot-->
            <slot>
            </slot>
        </div>
        <div class="dots">
            <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots"></span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    // dom 操作的通用 js代码导入
    import {addClass} from "common/js/dom"
    import BScroll from "better-scroll"

    export default {
        name: "slider",
        props: {
            loop: {
                type: Boolean,
                default:  true
            },
            autoPlay: {
                type: Boolean,
                default: true
            },
            interval: {
                type: Number,
                default: 4000
            }
        },
        data() {
            return {
                dots: [],
                currentPageIndex: 0
            }
        },
        // 在挂载的时候渲染
        mounted() {
            // 延迟20ms，是作者总结的经验，是为了 dom 被 vue 初始化之后才初始化轮播图组件
            setTimeout(() => {
                // 设置轮播图的宽度和导航点
                this._setSliderWidth(); // 不需要标志位
                this._initDots();
                // 初始化轮播图
                this._initSlider();

                // 自动滚动轮播判断
                if (this.autoPlay) {
                    this._play()
                }
            }, 20);

            // 绑定一个 resize 事件
            window.addEventListener("resize", () => {
                if (!this.slider) {
                    return
                }
                // 有标志位判断的初始化轮播图宽度
                this._setSliderWidth(true);
                // 重新加载 bscroll 插件
                this.slider.refresh();
            })
        },
        activated() {
            // 自动滚动轮播判断
            if (this.autoPlay) {
                this._play()
            }
        },
        deactivated() {
            clearTimeout(this.timer)
        },
        beforeDestroy() {
            clearTimeout(this.timer)
        },
        methods: {
            _setSliderWidth(isResize) {
                //  获取所有的子轮播图
                this.children = this.$refs.sliderGroup.children;

                let width = 0;
                // 轮播图父容器的宽度
                let sliderWidth = this.$refs.slider.clientWidth;
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    // 在组件内部自己添加 class
                    addClass(child, "slider-item");

                    // 添加子轮播图的宽度
                    child.style.width = sliderWidth + "px";
                    // 轮播图父容器的总宽度是子轮播图合集
                    width += sliderWidth;
                }
                // 切换全部轮播的时候会复制前后2个轮播图，所以需要加上2个轮播图的大小
                // 加了一个标志位判断是否做 resize 计算，只有第一次才需要加
                if (this.loop && !isResize) {
                    width += 2 * sliderWidth;
                }

                // 设置轮播图父容器的样式
                this.$refs.sliderGroup.style.width = width + "px";
            },
            _initSlider() {
                //  初始化 better-scroll 的轮播配置
                this.slider = new BScroll(this.$refs.slider, {
                    scrollX: true,
                    scrollY: false,
                    momentum: false,
                    snap: true,
                    snapLoop: this.loop,
                    snapThreshold: 0.3,
                    snapSpeed: 400,
                    // click:true //bscroller和 fastclick 的问题，导致无法点击跳转
                });

                // 滚动的时候绑定一个滚动事件
                this.slider.on("scrollEnd", () => {
                    let pageIndex = this.slider.getCurrentPage().pageX;

                    // 在循环模式下，bs会复制前后2个轮播图，所以需要-1
                    if (this.loop) {
                        pageIndex -= 1;
                    }
                    this.currentPageIndex = pageIndex;

                    // 自动滚动轮播判断
                    if (this.autoPlay) {
                        this._play()
                    }
                });

                // 在滚动开始的时候，绑定自定滚动事件
                this.slider.on("beforeScrollStart", () => {
                    if (this.autoPlay) {
                        // 每次清空定时器的计数是为了保证定时器的定时体验
                        clearTimeout(this.timer)
                    }
                })
            },
            _initDots() {
                this.dots = new Array(this.children.length)
            },
            _play() {
                // 要调到下一个轮播图，所以需要对当前索引+1
                let pageIndex = this.currentPageIndex + 1;
                // 如果是循环模式的话，还要再+1，因为也是 bs插件 复制前后轮播图的关系
                if (this.loop) {
                    pageIndex += 1
                }
                // 这是为了跟轮播插件保持一致，去手动执行一次轮播图滚动
                this.timer = setTimeout(() => {
                    this.slider.goToPage(pageIndex, 0, 400)
                }, this.interval)
            }
        }
    };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .slider
        min-height: 1px
        .slider-group
            position: relative
            overflow: hidden
            white-space: nowrap
            .slider-item
                float: left
                box-sizing: border-box
                overflow: hidden
                text-align: center
                a
                    display: block
                    width: 100%
                    overflow: hidden
                    text-decoration: none
                img
                    display: block
                    width: 100%
        .dots
            position: absolute
            right: 0
            left: 0
            bottom: 12px
            text-align: center
            font-size: 0
            .dot
                display: inline-block
                margin: 0 4px
                width: 8px
                height: 8px
                border-radius: 50%
                background: $color-text-l
                &.active
                    width: 20px
                    border-radius: 5px
                    background: $color-text-ll
</style>