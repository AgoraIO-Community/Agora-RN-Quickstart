import React, {Component, PureComponent} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Dimensions, Modal, NativeModules, Image
} from 'react-native';

import {Surface, ActivityIndicator} from 'react-native-paper';

import {RtcEngine, AgoraView} from 'react-native-agora';

import {APPID} from '../settings';

const {Agora} = NativeModules;

if (!Agora) {
  throw new Error("Agora load failed in react-native, please check ur compiler environments");
}

const {
  FPS30,
  FixedLandscape,
  Host,
  AudioProfileDefault,
  AudioScenarioDefault,
} = Agora;

const BtnEndCall = () => require('../../assets/images/btn_endcall.png');
const BtnMute = () => require('../../assets/images/btn_mute.png');
// const BtnSpeaker = () => require('../../assets/images/btn_speaker.png');
const BtnSwitchCamera = () => require('../../assets/images/btn_switch_camera.png');
// const BtnVideo = () => require('../../assets/images/btn_video.png');
// const EnableCamera = () => require('../../assets/images/enable_camera.png');
// const DisableCamera = () => require('../../assets/images/disable_camera.png');
// const EnablePhotoflash = () => require('../../assets/images/enable_photoflash.png');
// const DisablePhotoflash = () => require('../../assets/images/disable_photoflash.png');
const IconMuted = () => require('../../assets/images/icon_muted.png');
// const IconSpeaker = () => require('../../assets/images/icon_speaker.png');

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4'
  },
  absView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  videoView: {
    padding: 5,
    flexWrap: 'wrap',
    flexDirection: 'row',
    zIndex: 100
  },
  localView: {
    flex: 1
  },
  remoteView: {
    width: (width - 40) / 3,
    height: (width - 40) / 3,
    margin: 5
  },
  bottomView: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});

class OperateButton extends PureComponent {
  render() {
    const {onPress, source, style, imgStyle = {width: 50, height: 50}} = this.props;
    return (
      <TouchableOpacity
        style={style}
        onPress={onPress}
        activeOpacity={.7}
      >
        <Image
          style={imgStyle}
          source={source}
        />
      </TouchableOpacity>
    )
  }
}

type Props = {
  channelProfile: Number,
  channelName: String,
  videoProfile: Number,
  clientRole: Number,
  onCancel: Function,
  uid: Number,
}

class AgoraRTCView extends Component<Props> {
  state = {
    peerIds: [],
    joinSucceed: false,
    isMute: false,
    hideButton: false,
    visible: false,
    selectedUid: undefined,
    animating: true
  };

  componentWillMount () {
    const config = {
      appid: APPID,
      channelProfile: this.props.channelProfile,
      videoProfile: this.props.videoProfile,
      clientRole: this.props.clientRole,
      videoEncoderConfig: {
        width: 360,
        height: 480,
        bitrate: 1,
        frameRate: FPS30,
        orientationMode: FixedLandscape,
      },
      clientRole: Host,
      audioProfile: AudioProfileDefault,
      audioScenario: AudioScenarioDefault
    }
    console.log("[CONFIG]", JSON.stringify(config));
    console.log("[CONFIG.encoderConfig", config.videoEncoderConfig);
    RtcEngine.init(config);
    RtcEngine.eventEmitter({
      onFirstRemoteVideoDecoded: (data) => {
        console.log('[RtcEngine] onFirstRemoteVideoDecoded', data);
      },
      onUserJoined: (data) => {
        console.log('[RtcEngine] onUserJoined', data);
        const {peerIds} = this.state;
        if (peerIds.indexOf(data.uid) === -1) {
          this.setState({
            peerIds: [...peerIds, data.uid]
          })
        }
      },
      onUserOffline: (data) => {
        console.log('[RtcEngine] onUserOffline', data);
        this.setState({
            peerIds: this.state.peerIds.filter(uid => uid !== data.uid)
        })
      },
      onJoinChannelSuccess: (data) => {
        console.log('[RtcEngine] onJoinChannelSuccess', data);
        RtcEngine.startPreview();
        this.setState({
          joinSucceed: true,
          animating: false
        })
      },
      onAudioVolumeIndication: (data) => {
        console.log('[RtcEngine] onAudioVolumeIndication', data);
      },
      onClientRoleChanged: (data) => {
        console.log("[RtcEngine] onClientRoleChanged", data);
      },
      onError: (data) => {
        console.log('[RtcEngine] onError', data);
        if (data.error === 17) {
          RtcEngine.leaveChannel().then(_ => {
            RtcEngine.destroy();
            RtcEngine.removeEmitter();
            const { state, goBack } = this.props.navigation;
            const params = state.params || {};
            this.props.onCancel(data);
            goBack();
          });
        }
      }
    })
  }

  componentDidMount () {
    RtcEngine.getSdkVersion((version) => {
      console.log('[RtcEngine] getSdkVersion', version);
    })

    console.log('[joinChannel] ' + this.props.channelName);
    RtcEngine.joinChannel(this.props.channelName, this.props.uid);
    RtcEngine.enableAudioVolumeIndication(500, 3);
  }

  shouldComponentUpdate(nextProps) { return nextProps.navigation.isFocused(); }

  componentWillUnmount () {
    if (this.state.joinSucceed) {
      RtcEngine.leaveChannel().then(res => {
        RtcEngine.destroy();
        RtcEngine.removeEmitter();
      }).catch(err => {
        console.log("[agora]: err", err);
      })
    }
  }

  handleCancel = () => {
    const { state, goBack } = this.props.navigation;
    RtcEngine.leaveChannel().then(_ => {
      RtcEngine.destroy();
      goBack();
    }).catch(err => {
      console.log("[agora]: err", err);
    })
  }

  switchCamera = () => {
    RtcEngine.switchCamera();
  }

  toggleAllRemoteAudioStreams = () => {
    this.setState({
      isMute: !this.state.isMute
    }, () => {
      RtcEngine.muteAllRemoteAudioStreams(this.state.isMute);
    })
  }

  toggleHideButtons = () => {
    this.setState({
      hideButton: !this.state.hideButton
    })
  }

  onPressVideo = (uid) => {
    this.setState({
      selectedUid: uid
    }, () => {
      this.setState({
        visible: true
      })
    })
  }

  toolBar = ({hideButton, isMute}) => {
    if (!hideButton) {
    return (
      <View>
        <View style={styles.bottomView}>
          <OperateButton
            onPress={this.toggleAllRemoteAudioStreams}
            source={isMute ? IconMuted() : BtnMute()}
          />
          <OperateButton
            style={{alignSelf: 'center', marginBottom: -10}}
            onPress={this.handleCancel}
            imgStyle={{width: 60, height: 60}}
            source={BtnEndCall()}
          />
          <OperateButton
            onPress={this.switchCamera}
            source={BtnSwitchCamera()}
          />
        </View>
      </View>)
    }
  }

  agoraPeerViews = ({visible, peerIds}) => {
    return (visible ? 
    <View style={styles.videoView} /> :
    <View style={styles.videoView}>{
      peerIds.map((uid, key) => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => this.onPressVideo(uid)}
        key={key}>
      <AgoraView
          style={styles.remoteView}
          zOrderMediaOverlay={true}
          remoteUid={uid}
      />
      </TouchableOpacity>
      ))
      }</View>)
  }

  selectedView = ({visible}) => {
    return (
    <Modal
      visible={visible}
      presentationStyle={'fullScreen'}
      animationType={'slide'}
      onRequestClose={() => {}}
      >
      <TouchableOpacity
        activeOpacity={1}
        style={{flex: 1}}
        onPress={() => this.setState({
          visible: false
      })} >
        <AgoraView
          style={{flex: 1}}
          zOrderMediaOverlay={true}
          remoteUid={this.state.selectedUid}
        />
      </TouchableOpacity>
    </Modal>)
  }

  render () {
    if (!this.state.joinSucceed) {
      return (
      <View style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator animating={this.state.animating} />
      </View>
      )
    }

    return (
      <Surface
        activeOpacity={1}
        onPress={this.toggleHideButtons}
        style={styles.container}
      >
        <AgoraView style={styles.localView} showLocalVideo={true} />
          <View style={styles.absView}>
            <Text>channelName: {this.props.channelName}, peers: {this.state.peerIds.length}</Text>
            {this.agoraPeerViews(this.state)}
            {this.toolBar(this.state)}
          </View>
        {this.selectedView(this.state)}
      </Surface>
    )
  }
}

export default function AgoraRTCViewContainer(props) {
  const { navigation } = props;
  const channelProfile = navigation.getParam('channelProfile', 1);
  const videoProfile = navigation.getParam('videoProfile', 4);
  const clientRole = navigation.getParam('clientRole', 1);
  const channelName = navigation.getParam('channelName', 'agoratest');
  const uid = navigation.getParam('uid', Math.floor(Math.random() * 100));
  const onCancel = navigation.getParam('onCancel');

  return (<AgoraRTCView
    channelProfile={channelProfile}
    channelName={channelName}
    videoProfile={videoProfile}
    clientRole={clientRole}
    uid={uid}
    onCancel={onCancel}
    {...props}
  ></AgoraRTCView>);
}