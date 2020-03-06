# Agora ReactNative 快速入门

*其他语言版本： [English](README.md)*

本教程介绍如何使用[React Native](https://facebook.github.io/react-native/)创建Agora账户并且使用Agora构建示例应用程序.

Agora ReactNative SDK的源代码可以在[这里](https://github.com/syanbo/react-native-agora)找到，接口可以查阅SDK的[接口文档](https://syanbo.github.io/react-native-agora/globals.html)。

## 准备工作
- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- react-native 0.59.10
- nodejs [lts](https://nodejs.org/zh-cn/)
- iOS & Android sdk
- 手机设备

## 快速开始
这个示例向您展示如何使用Agora ReactNative SDK构建一个简单的视频通话应用程序。它向您展示了如何：

 - 加入/离开频道
 - 静音/取消静音
 - 切换摄像头
 - 布局多个视频视图

### 创建一个帐户并获取一个App ID
要构建和运行示例应用程序，请首先获取Agora App ID：

1. 在[agora.io](https://dashboard.agora.io/signin/)创建开发人员帐户。完成注册过程后，您将被重定向到仪表板页面。
2. 在左侧的仪表板树中导航到**项目** > **项目列表**。
3. 将从仪表板获取的App ID复制到文本文件中。您将在启动应用程序时用到它。

### 更新并运行示例应用程序

打开[settings.js](src/settings.js)文件并添加App ID。

```javascript
  const APPID = "";
```
### 搭建步骤
#### 1. 安装项目依赖，链接RN模块
请在当前项目路径执行以下命令:

```bash
  npm install
  react-native link react-native-agora
  react-native link react-navigation
  react-native link react-native-gesture-handler
  react-native link react-native-vector-icons
```

#### 2. 执行npm run start
安装完成后，开始执行以下命令:

```bash
  # start app
  npm run start
```

#### Step 3. 在原生平台上运行

##### 安卓平台:
```bash
  react-native run-android
```

##### iOS平台:
  1. `cd ios; pod install`
  2. `open ios/AgoraRNQuickStart.xcworkspace` 打开ios工程文件
  3. xcode build

## 附录
* Agora开发者中心[API 文档](https://docs.agora.io/cn/)
* [如果发现了示例代码的bug, 欢迎提交](https://github.com/AgoraIO-Community/Agora-RN-Quickstart/issues)
* [React Native入门教程](https://facebook.github.io/react-native/docs/getting-started.html)

## License
MIT
