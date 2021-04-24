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
    color: '#8a8a8a',
    selectedColor: '#5e5e5e',
    list: [
      {
        text: '首页',
        pagePath: 'pages/index/index',
        iconPath: 'assets/home-0.png',
        selectedIconPath: 'assets/home.png'
      },
      {
        text: '统计',
        pagePath: 'pages/user/index',
        iconPath: 'assets/chart-0.png',
        selectedIconPath: 'assets/chart.png'
      }
    ]
  }
}
