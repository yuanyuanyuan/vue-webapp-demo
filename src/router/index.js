import Vue from 'vue'
import Router from 'vue-router'
// 引入
Vue.use(Router);

// 推荐模块
const Recommend = (resolve) => {
    //
    import('components/recommend/recommend').then((module) => {
        resolve(module)
    })
};
// 歌手模块
const Singer = (resolve) => {
    import('components/singer/singer').then((module) => {
        resolve(module)
    })
};
// 评级模块
const Rank = (resolve) => {
    import('components/rank/rank').then((module) => {
        resolve(module)
    })
};
// 查询模块
const Search = (resolve) => {
    import('components/search/search').then((module) => {
        resolve(module)
    })
};
// 歌手详情模块
const SingerDetail = (resolve) => {
    import('components/singer-detail/singer-detail').then((module) => {
        resolve(module)
    })
};
// 唱片模块
const Disc = (resolve) => {
    import('components/disc/disc').then((module) => {
        resolve(module)
    })
};

// 热门歌单模块
const TopList = (resolve) => {
    import('components/top-list/top-list').then((module) => {
        resolve(module)
    })
};
// 用户中心模块
const UserCenter = (resolve) => {
    import('components/user-center/user-center').then((module) => {
        resolve(module)
    })
};

export default new Router({
    routes: [
        { // 这里是为了强制刚打开页面的时候默认跳转页面
            path: '/',
            redirect: '/recommend'
        },
        {
            path: '/recommend',
            component: Recommend,
            children: [
                {
                    path: ':id',
                    component: Disc
                }
            ]
        },
        {
            path: '/singer',
            component: Singer,
            children: [
                {
                    path: ':id',
                    component: SingerDetail
                }
            ]
        },
        {
            path: '/rank',
            component: Rank,
            children: [
                {
                    path: ':id',
                    component: TopList
                }
            ]
        },
        {
            path: '/search',
            component: Search,
            children: [
                {
                    path: ':id',
                    component: SingerDetail
                }
            ]
        },
        {
            path: '/user',
            component: UserCenter
        }
    ]
})
