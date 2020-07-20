# Agora React Native Demo

*Other language: [English](README.md)*

本教程介绍如何使用 [React Native SDK](https://facebook.github.io/react-native/) 创建 Agora 账户并且实现多人视频通话。

Agora React Native SDK 的源代码可以在 [这里](https://github.com/syanbo/react-native-agora) 找到，接口可以查阅 SDK 的 [接口文档](https://syanbo.github.io/react-native-agora/globals.html) 。

## 准备工作

* react native 0.59.10 及以上
* iOS SDK 8.0 及以上
* Android 5.0 及以上
* 有效的 Agora 账户 [免费注册](https://dashboard.agora.io/cn/)

如果你的网络环境部署了防火墙，请参考 [应用企业防火墙限制](https://docs.agora.io/cn/Agora%20Platform/firewall?platform=All%20Platforms) 打开相应端口。

## 运行示例项目

### 项目结构

```
.
├── android
├── components
│ └── Permission.ts
│ └── Style.ts
├── ios
├── App.tsx
├── index.js
.
```

### 创建项目并获取 App ID

要运行示例应用程序，你需要首先获取 Agora App ID。参考以下步骤在控制台 [创建一个 Agora 项目](https://docs.agora.io/cn/Agora%20Platform/manage_projects?platform=All%20Platforms#%E5%88%9B%E5%BB%BA%E6%96%B0%E9%A1%B9%E7%9B%AE) ，并获取一个 [App ID](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms#a-nameappidaapp-id) 。

1. 前往 [控制台](https://console.agora.io/) ，并点击左侧导航栏的 [项目管理](https://console.agora.io/projects) 按钮。
2. 点击 **创建** ，按照屏幕提示设置项目名，选择一种鉴权机制，然后点击 **提交** 。
3. 在你的 **项目管理** 页面，你可以获取项目的 **App ID** 。

### 运行示例程序

* 下载并解压程序 zip 包。
* 在解压后的路径下，运行 `npm install`，或使用 `yarn` 来安装程序依赖。
* 打开 `./App.tsx` 文件，将获取到的项目 App ID 填入 `appId: YourAppId,`。
* 使用 Terminal 终端运行 `cd ios && pod install`。
* 连接设备，并运行 `npx react-native run-android` 或 `npx react-native run-ios` 命令，运行 app。

其中，该示例程序使用 `channel-x` 作为频道名。

## 附录
* Agora [API 文档](https://docs.agora.io/cn/)
* [问题反馈](https://github.com/AgoraIO-Community/Agora-RN-Quickstart/issues)
* [React Native](https://facebook.github.io/react-native/docs/getting-started.html)

## License
MIT
