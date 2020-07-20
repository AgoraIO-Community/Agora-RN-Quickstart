# Agora React Native Demo

*其他语言版本：[中文](README.zh.md)*

Quickstart for group video calls on [React Native SDK](https://facebook.github.io/react-native/) using Agora.io SDK.
Use this guide to quickly start a multiple user group call.

The source code of Agora React Native SDK can be found [Here](https://github.com/syanbo/react-native-agora), [API doc](https://syanbo.github.io/react-native-agora/globals.html).

## Prerequisites

* >= react native 0.59.10
* iOS SDK 8.0+
* Android 5.0+
* A valid Agora account [Sign up](https://dashboard.agora.io/en/) for free.

Open the specified ports in [Firewall Requirements](https://docs.agora.io/en/Agora%20Platform/firewall?platform=All%20Platforms) if your network has a firewall.

## Running this example project

### Structure

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

### Generate an App ID

In the next step, you need to use the App ID of your project. Follow these steps to [Create an Agora project](https://docs.agora.io/en/Agora%20Platform/manage_projects?platform=All%20Platformshttps://docs.agora.io/en/Agora%20Platform/manage_projects?platform=All%20Platforms#create-a-new-project) in Console and get an [App ID](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#a-nameappidaapp-id).

1. Go to [Console](https://dashboard.agora.io/) and click the [Project Management](https://dashboard.agora.io/projects) icon on the left navigation panel. 
2. Click **Create** and follow the on-screen instructions to set the project name, choose an authentication mechanism (for this project select App ID without a certificate), and Click **Submit**. 
3. On the **Project Management** page, find the **App ID** of your project. 

Check the end of document if you want to use App ID with the certificate.

### Steps to run our example

* Download and extract the zip file.
* Run `npm install` or use `yarn` to install the app dependencies in the unzipped directory.
* Navigate to `./App.tsx` and enter your App ID that we generated as `appId: YourAppId,`
* Open a terminal and execute `cd ios && pod install`.
* Connect your device and run `npx react-native run-android` or `npx react-native run-ios` to start the app.

The app uses `channel-x` as the channel name.

## Sources
* Agora [API doc](https://docs.agora.io/en/)
* [Issues feedback](https://github.com/AgoraIO-Community/Agora-RN-Quickstart/issues)
* [React Native](https://facebook.github.io/react-native/docs/getting-started.html)

## License
MIT
