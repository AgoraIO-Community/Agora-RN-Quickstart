import React, {Component} from 'react'
import {Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import RtcEngine, {
    ChannelMediaOptions,
    ChannelProfile,
    ClientRole,
    RtcChannel,
    RtcLocalView,
    RtcRemoteView,
    VideoEncoderConfiguration,
    VideoRenderMode,
    VideoStreamType
} from 'react-native-agora'

import requestCameraAndAudioPermission from './components/Permission'
import styles from './components/Style'

interface Props {
}

interface State {
    joinSucceed: boolean,
    peerUsers: {
        channelId: string,
        uid: number,
        // to mark which remote user need to subscribe
        subscribe: boolean
    }[],
    linkUser?: {
        channelId: string,
        uid: number
    }
}

export default class App extends Component<Props, State> {
    _engine?: RtcEngine
    _channels = new Map<string, RtcChannel>()
    /**
     * split 3 channels
     */
    _channelIds = [
        {
            channelId: '0',
            // for demo, all of people publish stream to channel 0, you should modify it in your project.
            publish: true
        },
        {channelId: '1', publish: false},
        {channelId: '2', publish: false}
    ]

    constructor(props) {
        super(props)
        this.state = {
            joinSucceed: false,
            peerUsers: [],
            linkUser: undefined
        }
        if (Platform.OS === 'android') {
            // Request required permissions from Android
            requestCameraAndAudioPermission().then(() => {
                console.log('requested!')
            })
        }
    }

    componentDidMount() {
        this.init()
    }

    componentWillUnmount() {
        this._engine?.destroy()
    }

    /**
     * init RtcEngine and RtcChannels
     */
    init = async () => {
        this._engine = await RtcEngine.create(YOUR_APP_ID)
        this._engine.addListener('Warning', (warn) => {
            console.log('Warning', warn)
        })

        this._engine.addListener('Error', (err) => {
            console.log('Error', err)
        })
        // init audio engine
        await this._engine.enableAudio()
        // init video engine
        await this._engine.enableVideo()
        // must set LiveBroadcasting profile
        await this._engine.setChannelProfile(ChannelProfile.LiveBroadcasting)
        // for group low quality video and 1v1 high quality video
        await this._engine.enableDualStreamMode(true)
        // set resolution for high quality video
        await this._engine.setVideoEncoderConfiguration(new VideoEncoderConfiguration({
            dimensions: {
                width: 1280,
                height: 720
            },
            frameRate: 15,
            bitrate: 1130
        }))
        // set resolution for low quality video
        await this._engine.setParameters(JSON.stringify({
            "che.video.lowBitRateStreamParameter": {
                width: 320,
                height: 180,
                frameRate: 15,
                bitRate: 140
            }
        }))

        this._channelIds.map(async ({channelId, publish}) => {
            this._channels[channelId] = await RtcChannel.create(channelId)
            this.addJoinChannelSuccessListener(this._channels[channelId], publish)
            this.addUserJoinedListener(this._channels[channelId])
            this.addUserOfflineListener(this._channels[channelId])
            // only set broadcaster in published channel
            await this._channels[channelId].setClientRole(publish ? ClientRole.Broadcaster : ClientRole.Audience)
            // subscribe low quality video stream default
            await this._channels[channelId].setRemoteDefaultVideoStreamType(VideoStreamType.Low)
            // default mute remote audio stream, unmute when 1v1 chat
            await this._channels[channelId].setDefaultMuteAllRemoteAudioStreams(true)
            // default mute remote video stream, unmute the users which you want to subscribe
            await this._channels[channelId].setDefaultMuteAllRemoteVideoStreams(true)
        })
    }

    addJoinChannelSuccessListener = (channel: RtcChannel, publish: boolean) => {
        channel.addListener('JoinChannelSuccess', (uid, elapsed) => {
            console.log('JoinChannelSuccess', channel.channelId, uid, elapsed)
            if (publish) {
                this.setState({joinSucceed: true}, () => {
                    // Only publish to one of channels
                    channel?.publish()
                })
            }
        })
        if (publish) {
            channel.addListener("AudioPublishStateChanged", (channelName, oldState, newState, elapseSinceLastState) => {
                console.log('AudioPublishStateChanged', channelName, oldState, newState)
            })
            channel.addListener("VideoPublishStateChanged", (channelName, oldState, newState, elapseSinceLastState) => {
                console.log('VideoPublishStateChanged', channelName, oldState, newState)
            })
            channel.addListener("AudioSubscribeStateChanged", (channelName, oldState, newState, elapseSinceLastState) => {
                console.log('AudioSubscribeStateChanged', channelName, oldState, newState)
            })
            channel.addListener("VideoSubscribeStateChanged", ((channelName, oldState, newState, elapseSinceLastState) => {
                console.log('VideoSubscribeStateChanged', channelName, oldState, newState)
            }))
        }
    }

    addUserJoinedListener = (channel: RtcChannel) => {
        const {channelId} = channel
        channel.addListener('UserJoined', (uid, elapsed) => {
            console.log('UserJoined', channelId, uid, elapsed)
            // Get current peer IDs
            const {peerUsers} = this.state
            // If new user
            const user = {channelId, uid, subscribe: this._checkSubscribe(channelId, uid)}
            if (peerUsers.indexOf(user) === -1) {
                this.setState({
                    // Add peer ID to state array
                    peerUsers: [...peerUsers, user]
                })
            }
        })
    }

    addUserOfflineListener = (channel: RtcChannel) => {
        const {channelId} = channel
        channel.addListener('UserOffline', (uid, reason) => {
            console.log('UserOffline', channelId, uid, reason)
            const {peerUsers} = this.state
            this.setState({
                // Remove peer user from the state peerUsers array
                peerUsers: peerUsers.filter(user => user.channelId !== channelId || user.uid !== uid)
            })
        })
    }

    /**
     * check if user need to be subscribed
     */
    _checkSubscribe = (channelId: string, uid: number) => {
        // for demo, subscribe all of video streams, you should modify it in your project
        if (true) {
            // subscribe video stream
            this._channels[channelId].muteRemoteVideoStream(uid, false)
            return true
        }
        return false
    }

    /**
     * join channels and begin chat
     */
    startCall = async () => {
        // must set true both
        const options = new ChannelMediaOptions(true, true)
        // Join Channel using null token and channel name
        console.log('startCall')
        for (const key in this._channels) {
            console.log('startCall', key)
            await this._channels[key].joinChannel(null, null, 0, options)
        }
    }

    /**
     * quit channels and end chat
     */
    endCall = async () => {
        this.setState({joinSucceed: false, peerUsers: [], linkUser: undefined}, () => {
            this._channels.forEach((value) => {
                value.leaveChannel()
            })
            this._channels.clear()
        })
    }

    render() {
        return (
            <View style={styles.max}>
                <View style={styles.max}>
                    <View style={styles.buttonHolder}>
                        <TouchableOpacity
                            onPress={this.startCall}
                            style={styles.button}>
                            <Text style={styles.buttonText}> Start Call </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.endCall}
                            style={styles.button}>
                            <Text style={styles.buttonText}> End Call </Text>
                        </TouchableOpacity>
                    </View>
                    {this._renderLinkVideos()}
                    {this._renderRemoteVideos()}
                </View>
            </View>
        )
    }

    _renderLinkVideos = () => {
        const {linkUser} = this.state
        return linkUser ? (
            <View style={styles.max}>
                <TouchableOpacity
                    style={{position: 'absolute', bottom: 0, left: 0}}
                    onPress={() => this._cancelLink()}>
                    <RtcRemoteView.SurfaceView
                        style={styles.video}
                        uid={linkUser.uid}
                        channelId={linkUser.channelId}
                        renderMode={VideoRenderMode.Hidden}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{position: 'absolute', bottom: 0, right: 0}}
                    onPress={() => this._cancelLink()}>
                    <RtcLocalView.SurfaceView
                        style={styles.video}
                        channelId={linkUser.channelId}
                        renderMode={VideoRenderMode.Hidden}/>
                </TouchableOpacity>
            </View>
        ) : null
    }

    _renderRemoteVideos = () => {
        const {peerUsers, linkUser} = this.state
        return (
            <ScrollView
                style={styles.videoContainer}
                contentContainerStyle={{paddingHorizontal: 2.5}}
                horizontal={true}>
                {peerUsers.map((value) => {
                    // render video if it has been subscribed
                    if (value != linkUser && value.subscribe) {
                        return (
                            <TouchableOpacity onPress={() => this._linkToUser(value)}>
                                <RtcRemoteView.SurfaceView
                                    style={styles.video}
                                    uid={value.uid}
                                    channelId={value.channelId}
                                    renderMode={VideoRenderMode.Hidden}
                                    zOrderMediaOverlay={true}/>
                            </TouchableOpacity>
                        )
                    }
                })}
            </ScrollView>
        )
    }

    /**
     * start 1v1 chat
     * @param user which one you want to chat
     */
    _linkToUser = (user: { channelId: string, uid: number }) => {
        const {channelId, uid} = user
        this.setState({linkUser: user}, async () => {
            const channel = this._channels[channelId]
            // subscribe high quality video stream
            await channel.setRemoteVideoStreamType(uid, VideoStreamType.High)
            // subscribe audio stream
            await channel.muteRemoteAudioStream(uid, false)
        })
    }

    /**
     * cancel 1v1 chat
     */
    _cancelLink = () => {
        if (this.state.linkUser) {
            const {channelId, uid} = this.state.linkUser
            this.setState({linkUser: undefined}, async () => {
                const channel = this._channels[channelId]
                // subscribe low quality video stream
                await channel.setRemoteVideoStreamType(uid, VideoStreamType.Low)
                // unsubscribe audio stream
                await channel.muteRemoteAudioStream(uid, true)
            })
        }
    }
}
