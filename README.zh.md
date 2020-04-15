# Agora ReactNative 快速入门

*其他语言版本： [English](README.md)*

本教程介绍如何使用 [React Native SDK](https://facebook.github.io/react-native/) 创建 Agora 账户并且实现多人视频通话。

Agora React Native SDK的源代码可以在[这里](https://github.com/syanbo/react-native-agora)找到，接口可以查阅 SDK 的[接口文档](https://syanbo.github.io/react-native-agora/globals.html)。

## 准备工作

- react native 0.59.10 及以上
- iOS SDK 8.0 及以上
- Android 5.0 及以上
- 手机设备
- 有效的 Agora 账户（[免费注册](https://dashboard.agora.io/signin/)）

如果你的网络环境部署了防火墙，请参考[应用企业防火墙限制](https://docs.agora.io/cn/Agora%20Platform/firewall?platform=All%20Platforms)打开相应端口。

## 运行示例项目

### 项目结构

```
.
├── android
├── components
│ └── permission.js
│ └── Style.js
│ └── Video.js
├── ios
├── index.js
.
```

### 创建项目并获取 App ID

要运行示例应用程序，你需要首先获取 Agora App ID。参考以下步骤在控制台[创建一个 Agora 项目](https://docs.agora.io/cn/Agora%20Platform/manage_projects?platform=All%20Platforms#创建新项目)，并获取一个 [App ID](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms#a-nameappidaapp-id)。

1. 前往[控制台](https://console.agora.io/)，并点击左侧导航栏的[项目管理](https://console.agora.io/projects)按钮。
2. 点击**创建**，按照屏幕提示设置项目名，选择一种鉴权机制，然后点击**提交**。
3. 在你的**项目管理**页面，你可以获取项目的 **App ID**。

### 运行示例程序

* 从主分支下载并解压程序 zip 包。
* 在解压后的路径下，运行 `npm install`，或使用 yarn 来安装程序依赖。
* 打开 `./components/Video.js` 文件，将获取到的项目 App ID 填入第 18 行的 `AppID: 'YourAppIDGoesHere'`。
* 使用 Terminal 终端运行 `react-native link react-native-agora`。
* 连接设备，并运行 `react-native run-android` 或 `react-native run-ios` 命令，运行 app。

其中，该示例程序使用 `channel-x` 作为频道名。

## 代码解析

### 功能模块

![Image of how a call works](flow.png?raw=true)

### Style.js

我们使用 Style.js 文件中的 StyleSheet 定义视频画面的样式。

```javascript
import { StyleSheet, Dimensions } from 'react-native';

let dimensions = {                                //get dimensions of the device to use in view styles
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };

export default StyleSheet.create({
    max: {
        flex: 1,
    },
    buttonHolder: {
        height: 100,
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#0093E9',
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
    },
    fullView: {
        width: dimensions.width,
        height: dimensions.height - 100,
    },
    halfViewRow: {
        flex: 1 / 2,
        flexDirection: 'row',
    },
    full: {
        flex: 1,
    },
    half: {
        flex: 1 / 2,
    },
    localVideoStyle: {
        width: 120,
        height: 150,
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 100,
    },
    noUserText: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: '#0093E9',
    },
});
```
### Video.js

写入 import 语句，并将 Agora 的对象定义为原生模块，然后设置默认值。
同时，我们对 RTC Engine 进行配置，对音、视频流进行设置。

```javascript
import requestCameraAndAudioPermission from './permission';
import React, { Component } from 'react';
import { View, NativeModules, ScrollView, Text, TouchableOpacity, Platform } from 'react-native';
import { RtcEngine, AgoraView } from 'react-native-agora';
import styles from './Style';

const { Agora } = NativeModules;            //Define Agora object as a native module

const {
  FPS30,
  AudioProfileDefault,
  AudioScenarioDefault,
  Adaptative,
} = Agora;                                  //Set defaults for Stream

const config = {                            //Setting config of the app
  appid: 'ENTER APP ID HERE',               //Enter the App ID generated from the Agora Website
  channelProfile: 0,                        //Set channel profile as 0 for RTC
  videoEncoderConfig: {                     //Set Video feed encoder settings
    width: 720,
    height: 1080,
    bitrate: 1,
    frameRate: FPS30,
    orientationMode: Adaptative,
  },
  audioProfile: AudioProfileDefault,
  audioScenario: AudioScenarioDefault,
};
```

下面，我们来定义视频组件。在构造函数中设置如下状态变量：

* `peerIds`：是一个数组，表示频道内其他用户的 ID；
* `uid`：本地用户的 ID；
* `appid`：获取到的 Agora 项目 App ID；
* `channelName`：频道名。使用相同频道名的用户可以加入同一个频道，看到彼此的视频；
* `joinSucceed`：检查是否已成功加入频道，并设置滚动视图。

```javascript
...
class Video extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peerIds: [],                                       //Array for storing connected peers
      uid: Math.floor(Math.random() * 100),              //Generate a UID for local user
      appid: config.appid,                               
      channelName: 'channel-x',                        //Channel Name for the current session
      joinSucceed: false,                                //State variable for storing success
    };
    if (Platform.OS === 'android') {                    //Request required permissions from Android
      requestCameraAndAudioPermission().then(_ => {
        console.log('requested!');
      });
    }
  }
} 
```

在程序运行过程中，RTC Engine 会通过一系列的用户事件来控制逻辑：

* 当有新用户加入通话时，我们将新加入用户的 ID 添加进 `peerId` 数组中，并订阅他们的音视频流；
* 当用户离开通话时，我们则将其 ID 从数组中删除；
* 当本地用户成功加入频道时，我们会启动预览功能；
* 调用 `RtcEngine.init(config)` 方法初始化 RTC Engine。

```javascript
...
componentDidMount() {
  RtcEngine.on('userJoined', (data) => {
    const { peerIds } = this.state;                   //Get currrent peer IDs
    if (peerIds.indexOf(data.uid) === -1) {           //If new user has joined
      this.setState({
        peerIds: [...peerIds, data.uid],              //add peer ID to state array
      });
    }
  });
  RtcEngine.on('userOffline', (data) => {             //If user leaves
    this.setState({
      peerIds: this.state.peerIds.filter(uid => uid !== data.uid), //remove peer ID from state array
    });
  });
  RtcEngine.on('joinChannelSuccess', (data) => {                   //If Local user joins RTC channel
    RtcEngine.startPreview();                                      //Start RTC preview
    this.setState({
      joinSucceed: true,                                           //Set state variable to true
    });
  });
  RtcEngine.init(config);                                         //Initialize the RTC engine
}
```

下面，我们调用加入频道、离开频道的方法来开始或结束通话。

```javascript
...
  /**
  * @name startCall
  * @description Function to start the call
  */
  startCall = () => {
    RtcEngine.joinChannel(this.state.channelName, this.state.uid);  //Join Channel
    RtcEngine.enableAudio();                                        //Enable the audio
  }
  /**
  * @name endCall
  * @description Function to end the call
  */
  endCall = () => {
    RtcEngine.leaveChannel();
    this.setState({
      peerIds: [],
      joinSucceed: false,
    });
  }
```

我们还要为用户创建视频界面。例如频道中有 4 个用户，那就需要将视图分成 4 个部分。在每个小视窗内，我们使用 AgoraView 组件。将远端流视窗设为 `remoteUid={'RemoteUidGoesHere'}` 来接收远端流；设置 `showLocalVideo={true}` 来观看本地用户的流。

```JSX
...
  /**
  * @name videoView
  * @description Function to return the view for the app
  */
  videoView() {
    return (
      <View style={styles.max}>
        {
          <View style={styles.max}>
            <View style={styles.buttonHolder}>
              <TouchableOpacity title="Start Call" onPress={this.startCall} style={styles.button}>
                <Text style={styles.buttonText}> Start Call </Text>
              </TouchableOpacity>
              <TouchableOpacity title="End Call" onPress={this.endCall} style={styles.button}>
                <Text style={styles.buttonText}> End Call </Text>
              </TouchableOpacity>
            </View>
            {
              !this.state.joinSucceed ?
                <View />
                :
                <View style={styles.fullView}>
                  {
                    this.state.peerIds.length > 3                   //view for four videostreams
                      ? <View style={styles.full}>
                        <View style={styles.halfViewRow}>
                          <AgoraView style={styles.half}
                            remoteUid={this.state.peerIds[0]} mode={1} />
                          <AgoraView style={styles.half}
                            remoteUid={this.state.peerIds[1]} mode={1} />
                        </View>
                        <View style={styles.halfViewRow}>
                          <AgoraView style={styles.half}
                            remoteUid={this.state.peerIds[2]} mode={1} />
                          <AgoraView style={styles.half}
                            remoteUid={this.state.peerIds[3]} mode={1} />
                        </View>
                      </View>
                      : this.state.peerIds.length > 2                   //view for three videostreams
                        ? <View style={styles.full}>
                          <View style={styles.half}>
                            <AgoraView style={styles.full}
                              remoteUid={this.state.peerIds[0]} mode={1} />
                          </View>
                          <View style={styles.halfViewRow}>
                            <AgoraView style={styles.half}
                              remoteUid={this.state.peerIds[1]} mode={1} />
                            <AgoraView style={styles.half}
                              remoteUid={this.state.peerIds[2]} mode={1} />
                          </View>
                        </View>
                        : this.state.peerIds.length > 1                   //view for two videostreams
                          ? <View style={styles.full}>
                            <AgoraView style={styles.full}
                              remoteUid={this.state.peerIds[0]} mode={1} />
                            <AgoraView style={styles.full}
                              remoteUid={this.state.peerIds[1]} mode={1} />
                          </View>
                          : this.state.peerIds.length > 0                   //view for videostream
                            ? <AgoraView style={styles.full}
                              remoteUid={this.state.peerIds[0]} mode={1} />
                            : <View>
                              <Text style={styles.noUserText}> No users connected </Text>
                            </View>
                  }
                  <AgoraView style={styles.localVideoStyle}
                    zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                </View>
            }
          </View>
        }
      </View>
    );
  }
  render() {
    return this.videoView();
  }
}
export default Video;
```

### Permisson.js

在 Android 平台上，我们通过 `permission.js` 文件设置对操作系统获取摄像头和麦克风的使用权限。

```javascript
import { PermissionsAndroid } from "react-native";
/**
 * @name requestCameraAndAudioPermission
 * @description Function to request permission for Audio and Camera
 */
export default async function requestCameraAndAudioPermission() {
	try {
		const granted = await PermissionsAndroid.requestMultiple([
			PermissionsAndroid.PERMISSIONS.CAMERA,
			PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
		]);
		if (
			granted["android.permission.RECORD_AUDIO"] ===
			PermissionsAndroid.RESULTS.GRANTED &&
			granted["android.permission.CAMERA"] ===
			PermissionsAndroid.RESULTS.GRANTED
		) {
			console.log("You can use the cameras & mic");
		} else {
			console.log("Permission denied");
		}
	} catch (err) {
		console.warn(err);
	}
}
```

## 附录
* Agora开发者中心[API 文档](https://docs.agora.io/cn/)
* [如果发现了示例代码的bug, 欢迎提交](https://github.com/AgoraIO-Community/Agora-RN-Quickstart/issues)
* [React Native入门教程](https://facebook.github.io/react-native/docs/getting-started.html)

## License
MIT
