export default {
  pages: [
    'pages/index/index',
    'pages/home/index',
    'pages/table/index',
  ],
  window: {
    backgroundColor: "#f5f5f5",
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    // borderStyle: 'white',
    backgroundColor: '#fff',
    color: '#646a73',
    selectedColor: '#3370ff',
    list: [
      {
        text: '打卡',
        pagePath: 'pages/index/index',
        iconPath: 'assets/icons/mark.png',
        selectedIconPath: 'assets/icons/mark-active.png'
      },
      {
        text: '统计',
        pagePath: 'pages/table/index',
        iconPath: 'assets/icons/table.png',
        selectedIconPath: 'assets/icons/table-active.png'
      },
      {
        text: '主页',
        pagePath: 'pages/home/index',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      }
    ]
  }
}
