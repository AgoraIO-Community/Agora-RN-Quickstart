import React, { Component } from 'react';
import {
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import RtcEngine, {
  ChannelMediaOptions,
  ChannelProfile,
  ClientRole,
  RtcChannel,
  RtcLocalView,
  RtcRemoteView,
  VideoEncoderConfiguration,
  VideoRenderMode,
  VideoStreamType,
} from 'react-native-agora';

import requestCameraAndAudioPermission from './components/Permission';
import styles from './components/Style';

interface User {
  channelId: string;
  uid: number;
}

interface State {
  joinSucceed: boolean;
  peerUsers: User[];
  linkUser?: User;
}

export default class App extends Component<{}, State> {
  _engine?: RtcEngine;
  _channels = new Map<string, RtcChannel>();
  /**
   * split 3 channels
   */
  _channelIds = [
    {
      channelId: '0',
      // for demo, all of people publish stream to channel 0, you should modify it in your project.
      publish: true,
    },
    { channelId: '1', publish: false },
    { channelId: '2', publish: false },
  ];
  _viewabilityConfig = { viewAreaCoveragePercentThreshold: 0 };

  constructor(props) {
    super(props);
    this.state = {
      joinSucceed: false,
      peerUsers: [],
      linkUser: undefined,
    };
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this._engine?.destroy();
  }

  /**
   * init RtcEngine and RtcChannels
   */
  init = async () => {
    this._engine = await RtcEngine.create('aab8b8f5a8cd4469a63042fcfafe7063');
    this._engine.addListener('Warning', (warn) => {
      console.log('Warning', warn);
    });

    this._engine.addListener('Error', (err) => {
      console.log('Error', err);
    });
    // init audio engine
    await this._engine.enableAudio();
    // init video engine
    await this._engine.enableVideo();
    // must set LiveBroadcasting profile
    await this._engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
    // for group low quality video and 1v1 high quality video
    await this._engine.enableDualStreamMode(true);
    // set resolution for high quality video
    await this._engine.setVideoEncoderConfiguration(
      new VideoEncoderConfiguration({
        dimensions: {
          width: 1280,
          height: 720,
        },
        frameRate: 15,
        bitrate: 1130,
      })
    );
    // set resolution for low quality video
    await this._engine.setParameters(
      JSON.stringify({
        'che.video.lowBitRateStreamParameter': {
          width: 320,
          height: 180,
          frameRate: 15,
          bitRate: 140,
        },
      })
    );

    this._channelIds.map(async ({ channelId, publish }) => {
      const channel = await RtcChannel.create(channelId);
      this._channels.set(channelId, channel);
      this.addJoinChannelSuccessListener(channel, publish);
      this.addUserJoinedListener(channel);
      this.addUserOfflineListener(channel);
      // only set broadcaster in published channel
      await channel?.setClientRole(
        publish ? ClientRole.Broadcaster : ClientRole.Audience
      );
      // subscribe low quality video stream default
      await channel?.setRemoteDefaultVideoStreamType(VideoStreamType.Low);
      // default mute remote audio stream, unmute when 1v1 chat
      await channel?.setDefaultMuteAllRemoteAudioStreams(true);
      // default mute remote video stream, unmute the users which you want to subscribe
      await channel?.setDefaultMuteAllRemoteVideoStreams(true);
    });
  };

  addJoinChannelSuccessListener = (
    channel: RtcChannel | undefined,
    publish: boolean
  ) => {
    if (channel === undefined) return;
    channel.addListener('JoinChannelSuccess', (uid, elapsed) => {
      console.log('JoinChannelSuccess', channel.channelId, uid, elapsed);
      if (publish) {
        this.setState({ joinSucceed: true }, () => {
          // Only publish to one of channels
          channel?.publish();
        });
      }
    });
    if (publish) {
      channel.addListener(
        'AudioPublishStateChanged',
        (channelName, oldState, newState, _) => {
          console.log(
            'AudioPublishStateChanged',
            channelName,
            oldState,
            newState
          );
        }
      );
      channel.addListener(
        'VideoPublishStateChanged',
        (channelName, oldState, newState, _) => {
          console.log(
            'VideoPublishStateChanged',
            channelName,
            oldState,
            newState
          );
        }
      );
      channel.addListener(
        'AudioSubscribeStateChanged',
        (channelName, oldState, newState, _) => {
          console.log(
            'AudioSubscribeStateChanged',
            channelName,
            oldState,
            newState
          );
        }
      );
      channel.addListener(
        'VideoSubscribeStateChanged',
        (channelName, oldState, newState, _) => {
          console.log(
            'VideoSubscribeStateChanged',
            channelName,
            oldState,
            newState
          );
        }
      );
    }
  };

  addUserJoinedListener = (channel?: RtcChannel) => {
    if (channel === undefined) return;
    const { channelId } = channel;
    channel.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', channelId, uid, elapsed);
      // Get current peer IDs
      const { peerUsers } = this.state;
      // If new user
      const user = { channelId, uid };
      if (peerUsers.indexOf(user) === -1) {
        this.setState({
          // Add peer ID to state array
          peerUsers: [...peerUsers, user],
        });
      }
    });
  };

  addUserOfflineListener = (channel?: RtcChannel) => {
    if (channel === undefined) return;
    const { channelId } = channel;
    channel.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', channelId, uid, reason);
      const { peerUsers } = this.state;
      this.setState({
        // Remove peer user from the state peerUsers array
        peerUsers: peerUsers.filter(
          (user) => user.channelId !== channelId || user.uid !== uid
        ),
      });
    });
  };

  /**
   * join channels and begin chat
   */
  startCall = async () => {
    // must set true both
    const options = new ChannelMediaOptions(true, true);
    // Join Channel using null token and channel name
    console.log('startCall', this._channels.size);
    this._channels.forEach(async (value) => {
      console.log('startCall', value);
      await value.joinChannel(null, null, 0, options);
    });
  };

  /**
   * quit channels and end chat
   */
  endCall = async () => {
    this.setState(
      { joinSucceed: false, peerUsers: [], linkUser: undefined },
      () => {
        this._channels.forEach(async (value) => {
          await value.leaveChannel();
        });
      }
    );
  };

  render() {
    return (
      <View style={styles.max}>
        <View style={styles.max}>
          <View style={styles.buttonHolder}>
            <TouchableOpacity onPress={this.startCall} style={styles.button}>
              <Text style={styles.buttonText}> Start Call </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.endCall} style={styles.button}>
              <Text style={styles.buttonText}> End Call </Text>
            </TouchableOpacity>
          </View>
          {this._renderLinkVideos()}
          {this._renderRemoteVideos()}
        </View>
      </View>
    );
  }

  /**
   * render link videos(remote and local)
   */
  _renderLinkVideos = () => {
    const { linkUser } = this.state;
    return linkUser ? (
      <View style={styles.max}>
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 0, left: 0 }}
          onPress={() => this._cancelLink()}
        >
          {this._renderRemoteVideo(linkUser)}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 0, right: 0 }}
          onPress={() => this._cancelLink()}
        >
          <RtcLocalView.SurfaceView
            style={styles.video}
            channelId={linkUser.channelId}
            renderMode={VideoRenderMode.Hidden}
          />
        </TouchableOpacity>
      </View>
    ) : null;
  };

  /**
   * render one remote video
   * @param user
   */
  _renderRemoteVideo = (user: User) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
      }}
    >
      <RtcRemoteView.SurfaceView
        style={styles.video}
        uid={user.uid}
        channelId={user.channelId}
        renderMode={VideoRenderMode.Hidden}
      />
      <Text style={{ position: 'absolute', color: 'white' }}>{user.uid}</Text>
    </View>
  );

  /**
   * render all of remote videos
   */
  _renderRemoteVideos = () => {
    const { peerUsers, linkUser } = this.state;
    return (
      <FlatList
        style={styles.videoContainer}
        contentContainerStyle={{ paddingHorizontal: 2.5 }}
        horizontal={true}
        data={peerUsers}
        viewabilityConfig={this._viewabilityConfig}
        onViewableItemsChanged={this._handleViewableItemsChanged}
        keyExtractor={(item, _) => item.channelId + item.uid}
        renderItem={({ item }) => {
          // render video if it has been subscribed
          if (item !== linkUser) {
            return (
              <TouchableOpacity onPress={() => this._linkToUser(item)}>
                {this._renderRemoteVideo(item)}
              </TouchableOpacity>
            );
          }
          return null;
        }}
      />
    );
  };

  /**
   * handle onViewableItemsChanged from FlatList
   * @param info
   */
  _handleViewableItemsChanged = (info: {
    viewableItems: Array<ViewToken>;
    changed: Array<ViewToken>;
  }) => {
    console.log('onViewableItemsChanged', 'viewableItems', info.viewableItems);
    console.log('onViewableItemsChanged', 'changed', info.changed);
    info.changed.forEach(({ isViewable, item }) => {
      // subscribe viewable user & unsubscribe not viewable user
      this._channels
        .get(item.channelId)
        ?.muteRemoteVideoStream(item.uid, !isViewable);
    });
  };

  /**
   * start 1v1 chat
   * @param user which one you want to chat
   */
  _linkToUser = (user: User) => {
    const { channelId, uid } = user;
    this.setState({ linkUser: user }, async () => {
      const channel = this._channels.get(channelId);
      // subscribe high quality video stream
      await channel?.setRemoteVideoStreamType(uid, VideoStreamType.High);
      // subscribe audio stream
      await channel?.muteRemoteAudioStream(uid, false);
    });
  };

  /**
   * cancel 1v1 chat
   */
  _cancelLink = () => {
    if (this.state.linkUser) {
      const { channelId, uid } = this.state.linkUser;
      this.setState({ linkUser: undefined }, async () => {
        const channel = this._channels.get(channelId);
        // subscribe low quality video stream
        await channel?.setRemoteVideoStreamType(uid, VideoStreamType.Low);
        // unsubscribe audio stream
        await channel?.muteRemoteAudioStream(uid, true);
      });
    }
  };
}
