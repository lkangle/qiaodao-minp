import { Component } from 'react'
import './app.less'

// 拿来扫码签到用
class App extends Component {
  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
