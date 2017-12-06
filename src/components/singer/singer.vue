<template>
    <div class="singer" ref="singer">
        <!--导入一个 listview 组件来处理歌手列表数据-->
        <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
        <!---->
        <router-view></router-view>
    </div>
</template>

<script>
    import ListView from "base/listview/listview"
    import {getSingerList} from "api/singer"
    import {ERR_OK} from "api/config"
    import Singer from "common/js/singer"
    import {mapMutations} from "vuex"
    import {playlistMixin} from "common/js/mixin"

    // 定义常量
    const HOT_SINGER_LEN = 10; // 热门歌手列表长度
    const HOT_NAME = "热门"; // 热门列的标题

    export default {
        mixins: [playlistMixin],
        data() {
            return {
                singers: []
            }
        },
        created() {
            // 初始化获取歌手列表
            this._getSingerList()
        },
        methods: {
            handlePlaylist(playlist) {
                const bottom = playlist.length > 0 ? "60px" : "";
                this.$refs.singer.style.bottom = bottom;
                this.$refs.list.refresh();
            },
            selectSinger(singer) {
                this.$router.push({
                    path: `/singer/${singer.id}`
                });
                this.setSinger(singer)
            },
            _getSingerList() {
                getSingerList().then((res) => {
                    if (res.code === ERR_OK) {
                        this.singers = this._normalizeSinger(res.data.list)
                    }
                })
            },
            // 整理 singer 的数据
            _normalizeSinger(list) {
                // 用 map 结构，先保存第一个热门数据的对象
                let map = {
                    hot: {
                        title: HOT_NAME,
                        items: []
                    }
                };
                list.forEach((item, index) => {
                    // 前10条数据定义为热门数据，推入热门数据的对象的 items 数组里面
                    if (index < HOT_SINGER_LEN) {
                        // 封装了一个基础的 singer 类，方便处理数据
                        map.hot.items.push(new Singer({
                            name: item.Fsinger_name,
                            id: item.Fsinger_mid
                        }))
                    }
                    // 用对应每一个 item 的 Findex 来做 key，生成按字母排列的数据对象
                    const key = item.Findex;
                    // 如果没有 key 的就创建 key 的数据
                    if (!map[key]) {
                        map[key] = {
                            title: key,
                            items: []
                        }
                    }
                    // 对不同的 key 填入数据
                    map[key].items.push(new Singer({
                        name: item.Fsinger_name,
                        id: item.Fsinger_mid
                    }))
                });
                // 为了得到有序列表，我们需要处理 map
                let ret = [];
                let hot = [];
                for (let key in map) {
                    let val = map[key];
                    if (val.title.match(/[a-zA-Z]/)) {
                        ret.push(val)
                    } else if (val.title === HOT_NAME) {
                        hot.push(val)
                    }
                }
                //重新排序
                ret.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0);
                });
                return hot.concat(ret);
            },
            // 使用 vuex 保存数据
            ...mapMutations({
                setSinger: "SET_SINGER"
            })
        },
        components: {
            ListView
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .singer
        position: fixed
        top: 88px
        bottom: 0
        width: 100%
</style>
