# Agora ReactNative Quickstart

*其他语言版本： [简体中文](README.zh.md)*

This tutorial describes how to create an Agora account and build a sample app with Agora using [React Native](https://facebook.github.io/react-native/).

## Prerequisites
- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- react-native 0.58.x
- nodejs v10.15.x

## Quick Start
This repository shows you how to use Agora React Native SDK to build a simple video call app. It demonstrates you how to:

- Join / leave a channel
- Mute / unmute audio
- Switch camera views
- Layout multiple video views

### Create an Account and Obtain an App ID
To build and run the sample application, first obtain an app ID: 

1. Create a developer account at [agora.io](https://dashboard.agora.io/signin/). Once you finish the sign-up process, you are redirected to the dashboard.
2. Navigate in the dashboard tree on the left to **Projects** > **Project List**.
3. Copy the app ID that you obtain from the dashboard into a text file. You will use this when you launch the app.

### Update and Run the Sample Application

Open the [settings.js](src/settings.js) file and add the app ID.

```javascript
  const APPID = "";
```

#### Step 1. install node dependencies & link native modules
Run the below commands in this project directory:

```bash
  npm install
  react-native link react-native-agora
  react-native link react-navigation
  react-native link react-native-gesture-handler
  react-native link react-native-vector-icons
```

#### Step 2. start react native package server
Once the build is complete, run the `run` command to start the package server.

```bash
  # start app
  npm run start
```

#### Step 3. run in native platform

##### android platform:
```bash
  react-native run-android
```

##### ios platform:
  1. `cd ios; pod install`
  2. `open ios/AgoraRNQuickStart.xcworkspace` open in xcode
  3. Find Libraries -> RCTAgora.xcodeproj -> Build Phases -> Link Binary With Libraries -> AgoraRtcEngineKit.Framework
  and replace by `ios/Pods/AgoraRtcEngine_iOS/AgoraRtcEngineKit.Framework`
  4. xcode build

## Resources
* Complete [API documentation](https://docs.agora.io/en/) at the Developer Center
* [File bugs about this sample](https://github.com/AgoraIO-Community/Agora-RN-Quickstart/issues)
* [React Native Getting Started](https://facebook.github.io/react-native/docs/getting-started.html)

## License
This software is under the MIT License (MIT).
