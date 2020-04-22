/* eslint-disable consistent-this */
/* eslint-disable prettier/prettier */
import requestCameraAndAudioPermission from './permission';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import RtcEngine, { RtcLocalView, RtcRemoteView } from 'react-native-agora';
import styles from './Style';

let LocalView = RtcLocalView.SurfaceView;
let RemoteView = RtcRemoteView.SurfaceView;
let engine;

class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {
      peerIds: [],                                       //Array for storing connected peers
      appid: '9383ec2f56364d478cefc38b0a37d8bc',
      channelName: 'channel-x',                        //Channel Name for the current session
      joinSucceed: false,                                //State variable for storing success
    };
    if (Platform.OS === 'android') {                    //Request required permissions from Android
      requestCameraAndAudioPermission().then(_ => {
        console.log('requested!');
      });
    }
  }

  componentDidMount() {
    let self = this;
    /**
    * @name init
    * @description Function to initialize the Rtc Engine, attach event listeners and actions
    */
    async function init() {
      engine = await RtcEngine.create(self.state.appid);
      engine.enableVideo();

      engine.addListener('UserJoined', (data) => {          //If user joins the channel
        const { peerIds } = self.state;                     //Get currrent peer IDs
        if (peerIds.indexOf(data) === -1) {                 //If new user
          self.setState({ peerIds: [...peerIds, data] });   //add peer ID to state array
        }
      });

      engine.addListener('UserOffline', (data) => {                 //If user leaves
        self.setState({
          peerIds: self.state.peerIds.filter(uid => uid !== data), //remove peer ID from state array
        });
      });

      engine.addListener('JoinChannelSuccess', (data) => {          //If Local user joins RTC channel
        self.setState({ joinSucceed: true });                       //Set state variable to true
      });
    }
    init();
  }

  /**
  * @name startCall
  * @description Function to start the call
  */
  startCall = () => {
    this.setState({ joinSucceed: true }); //Set state variable to true
    engine.joinChannel(null, this.state.channelName, null, 0);  //Join Channel using null token and channel name
  }

  /**
  * @name endCall
  * @description Function to end the call
  */
  endCall = () => {
    engine.leaveChannel();
    this.setState({ peerIds: [], joinSucceed: false });
  }

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
                          <RemoteView style={styles.half} channelId={this.state.channelName}
                            uid={this.state.peerIds[0]} renderMode={1} />
                          <RemoteView style={styles.half} channelId={this.state.channelName}
                            uid={this.state.peerIds[1]} renderMode={1} />
                        </View>
                        <View style={styles.halfViewRow}>
                          <RemoteView style={styles.half} channelId={this.state.channelName}
                            uid={this.state.peerIds[2]} renderMode={1} />
                          <RemoteView style={styles.half} channelId={this.state.channelName}
                            uid={this.state.peerIds[3]} renderMode={1} />
                        </View>
                      </View>
                      : this.state.peerIds.length > 2                   //view for three videostreams
                        ? <View style={styles.full}>
                          <View style={styles.half} channelId={this.state.channelName}>
                            <RemoteView style={styles.full}
                              uid={this.state.peerIds[0]} renderMode={1} />
                          </View>
                          <View style={styles.halfViewRow}>
                            <RemoteView style={styles.half} channelId={this.state.channelName}
                              uid={this.state.peerIds[1]} renderMode={1} />
                            <RemoteView style={styles.half} channelId={this.state.channelName}
                              uid={this.state.peerIds[2]} renderMode={1} />
                          </View>
                        </View>
                        : this.state.peerIds.length > 1                   //view for two videostreams
                          ? <View style={styles.full}>
                            <RemoteView style={styles.full}
                              uid={this.state.peerIds[0]} renderMode={1} />
                            <RemoteView style={styles.full}
                              uid={this.state.peerIds[1]} renderMode={1} />
                          </View>
                          : this.state.peerIds.length > 0                   //view for videostream
                            ? <RemoteView style={styles.full}
                              uid={this.state.peerIds[0]} renderMode={1} />
                            : <View>
                              <Text style={styles.noUserText}> No users connected </Text>
                            </View>
                  }
                  <LocalView style={styles.localVideoStyle}               //view for local videofeed
                    channelId={this.state.channelName} renderMode={1} zOrderMediaOverlay={true} />
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
