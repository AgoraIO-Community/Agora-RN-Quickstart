# Agora React Native Demo

Quickstart for group video calls on react-native using Agora.io SDK.
Use this guide to quickly start a multiple user group call.


## Prerequisites
* '>= react native 0.60'
* iOS SDK 8.0+
* Android 5.0+ x86 arm64 armv7a
* A valid Agora account ([Sign up](https://dashboard.agora.io/) for free)

<div class="alert note">Open the specified ports in <a href="https://docs.agora.io/cn/Agora%20Platform/firewall?platform=All%20Platforms">Firewall Requirements</a> if your network has a firewall.</div>

## Running this example project

### Structure

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

### Generate an App ID

In the next step, you need to use the App ID of your project. Follow these steps to [create an Agora project](https://docs.agora.io/en/Agora%20Platform/manage_projects?platform=All%20Platforms) in Console and get an [App ID](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#a-nameappidaapp-id ).

1. Go to [Console](https://dashboard.agora.io/) and click the **[Project Management](https://dashboard.agora.io/projects)** icon on the left navigation panel. 
2. Click **Create** and follow the on-screen instructions to set the project name, choose an authentication mechanism (for this project select App ID without a certificate), and Click **Submit**. 
3. On the **Project Management** page, find the **App ID** of your project. 

Check the end of document if you want to use App ID with certificate.

### Steps to run our example

* Download and extract the zip file from the master branch.
* Run `npm install` or use `yarn` to install the app dependencies in the unzipped directory.
* Navigate to `./components/Video.js` and edit line 19 to enter your App ID that we generated as `appid: 'YourAppID',`
* Open a terminal and execute `cd ios && pod install`.
* Connect your device and run `npx react-native run-android` / `npx react-native run-ios` to start the app.

The app uses `channel-x` as the channel name.

## License
MIT
