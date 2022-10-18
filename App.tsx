import React, {useEffect, useRef, useState} from 'react';
import {Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
import styles from './components/Style';
import requestCameraAndAudioPermission from './components/Permission';

const config = {
  appId: AgoraAppID,
  token: '',
  channelName: 'test',
};

const App = () => {
  const _engine = useRef<IRtcEngine | null>(null);
  const [isJoined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState<number[]>([]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }, []);

  /**
   * @name init
   * @description Create, Initialize and setup engine
   */
  const init = async () => {
    const {appId} = config;
    _engine.current = await createAgoraRtcEngine();
    _engine.current.initialize({appId});
    _engine.current.setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting,
    );
    _engine.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    _engine.current.enableVideo();
    _engine.current.startPreview();

    _engine.current.addListener('onUserJoined', (connection, uid) => {
      console.log('UserJoined', connection, uid);
      // If new user
      if (peerIds.indexOf(uid) === -1) {
        // Add peer ID to state array
        setPeerIds(prev => [...prev, uid]);
      }
    });

    _engine.current.addListener('onUserOffline', (connection, uid) => {
      console.log('UserOffline', connection, uid);
      // Remove peer ID from state array
      setPeerIds(prev => prev.filter(id => id !== uid));
    });

    // If Local user joins RTC channel
    _engine.current.addListener('onJoinChannelSuccess', connection => {
      console.log('JoinChannelSuccess', connection);
      // Set state variable to true
      setJoined(true);
    });
  };

  /**
   * @name startCall
   * @description Function to start the call
   */
  const startCall = async () => {
    // Join Channel using null token and channel name
    await init();
    await _engine.current?.joinChannel(config.token, config.channelName, 0, {});
  };

  /**
   * @name endCall
   * @description Function to end the call
   */
  const endCall = async () => {
    _engine.current?.leaveChannel();
    _engine.current?.removeAllListeners();
    try {
      _engine.current?.release();
    } catch (e) {
      console.log('release error:', e);
    }

    setPeerIds([]);
    setJoined(false);
  };

  const _renderVideos = () => {
    return isJoined ? (
      <View style={styles.fullView}>
        <RtcSurfaceView
          style={styles.max}
          canvas={{
            uid: 0,
          }}
        />
        {_renderRemoteVideos()}
      </View>
    ) : null;
  };

  const _renderRemoteVideos = () => {
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={styles.padding}
        horizontal={true}>
        {peerIds.map(id => {
          return (
            <RtcSurfaceView
              style={styles.remote}
              canvas={{
                uid: id,
              }}
              key={id}
            />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.max}>
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          <TouchableOpacity onPress={startCall} style={styles.button}>
            <Text style={styles.buttonText}> Start Call </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endCall} style={styles.button}>
            <Text style={styles.buttonText}> End Call </Text>
          </TouchableOpacity>
        </View>
        {_renderVideos()}
      </View>
    </View>
  );
};

export default App;
