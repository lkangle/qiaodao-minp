import { Component } from 'react'
import Taro from '@tarojs/taro'
import "./global.less"

import gio from './utils/gio-cdp'

gio('init', 'pid111', 'dsid222', 'wx1222', {
  debug: true,
  Taro: Taro,
  version: '1.2.0',
  host: 'localhost:10030'
})

class App extends Component {
  render () {
    return this.props.children
  }
}

export default App
