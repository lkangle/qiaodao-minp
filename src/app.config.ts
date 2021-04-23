export default {
  pages: [
    'pages/index/index',
    'pages/user/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    backgroundColor: '#fff',
    color: '#000',
    selectedColor: '#206d5e',
    list: [
      {
        text: '首页',
        pagePath: 'pages/index/index'
      },
      {
        text: '我的',
        pagePath: 'pages/user/index'
      }
    ]
  }
}
