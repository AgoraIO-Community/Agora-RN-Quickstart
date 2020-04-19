# Agora React Native Demo

Quickstart for group video calls on react-native using Agora.io SDK.
Use this guide to quickly start a multiple user group call.


## Prerequisites
* '>= react native 0.55.x'
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
* Run npm install or use yarn to install the app dependencies in the unzipped directory.
* Navigate to `./components/Video.js` and edit line 18 to enter your App ID that we generated as `AppID: 'YourAppIDGoesHere'`
* Open a terminal and execute `react-native link react-native-agora`.
* Connect your device and run `react-native run-android` / `react-native run-ios` to start the app.

The app uses `channel-x` as the channel name.

## Understanding the code

### What we need
![Image of how a call works](flow.png?raw=true)

### Style.js
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
We have the styles for the view defined in a stylesheet inside Style.js

### Video.js

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
We write the used import statements and define the Agora object as a native module and set the defaults from it. We also define the configuration for our RTC engine with settings for the audio and video stream.
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
  ```
  We define the class based video component. In the constructor, we set our state variables: peerIds is an array that stores the unique ID of connected peers used to display their videofeeds, uid is the local user’s unique id that we transmit our videofeed alongside, appid is the agora app id used to authorize access to the sdk, channelName is used to join a channel (users on the same channel can view each other's feeds) and joinSucceed which is used to check if we've successfully joined a channel and setup our scrolling-view.


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
The RTC Engine fires events on user events, we define functions to handle the logic for maintaing user's on the call. We update the peerIds array to store connected users' uids which is used to show their feeds.
When a new user joins the call, we add their uid to the array. When user leaves the call, we remove their uid from the array; if the local users successfully joins the call channel, we start the stream preview.
We use `RtcEngine.init(config)` to initialise the RTC Engine with our defined configuration. 

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
We define functions to start and end the call, which we do by joining and leaving the channel and updating our state variables.
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
Next we define the view for different possible number of users; we start with 4 external users on the channel (diving the screen into four views using flexbox for four users) and move down to no connected users using conditional operator. Inside each view we use an AgoraView component, for viewing remote streams we set `remoteUid={'RemoteUidGoesHere'}`. For viewing the local user's stream we set `showLocalVideo={true}`.

### permission.js
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
We have permission.js containing an async function to request permission from the OS on Android to use the camera and microphone.

### Using App ID with certificate

You can use an App ID with a certificate by making the following changes in the project:

In `Home.js` define your token in the state as `token: *insert your token here*`

In `Video.js` add `token: this.props.token` to your state and edit the `joinChannel` method to use the token like this: `RtcEngine.joinChannel(this.state.channelName, this.state.uid, `**`this.state.token`**`);`