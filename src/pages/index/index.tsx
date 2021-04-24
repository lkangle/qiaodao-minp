import React from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Checkbox, Text } from '@tarojs/components'
import './index.less'

const Index: React.FC = () => {

  const doQRScan = () => {
    Taro.scanCode({
      onlyFromCamera: true,
    }).then(result => {
      console.log('result', result)
    })
  }

  return (
    <View className='home-box'>
      <Button onClick={doQRScan}>
        <Text>扫码</Text>
      </Button>
      <Checkbox value='10'>点我完成</Checkbox>
    </View>
  );
};

export default Index;
