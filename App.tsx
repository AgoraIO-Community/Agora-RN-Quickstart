import React, {Component} from 'react'
import {Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import RtcEngine, {
    ChannelMediaOptions,
    ChannelProfile,
    ClientRole,
    RtcChannel,
    RtcLocalView,
    RtcRemoteView,
    VideoRenderMode,
    VideoStreamType
} from 'react-native-agora'

import requestCameraAndAudioPermission from './components/Permission'
import styles from './components/Style'

interface Props {
}

interface State {
    joinSucceed: boolean,
    peerUsers: { channelId: string, uid: number }[],
    linkUser?: { channelId: string, uid: number }
}

export default class App extends Component<Props, State> {
    _engine?: RtcEngine
    _channels = new Map<string, RtcChannel>()
    /**
     * split 3 channels
     */
    _channelIds = [
        {channelId: '0', publish: true},
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

    /**
     * init RtcEngine and RtcChannels
     */
    init = async () => {
        this._engine = await RtcEngine.create('2b4b76e458cf439aa7cd313b9504f0a4')
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
        // for group low quality video and 1v1 high quality video
        await this._engine.enableDualStreamMode(true)
        // must set LiveBroadcasting profile
        await this._engine.setChannelProfile(ChannelProfile.LiveBroadcasting)

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
    }

    addUserJoinedListener = (channel: RtcChannel) => {
        const {channelId} = channel
        channel.addListener('UserJoined', (uid, elapsed) => {
            console.log('UserJoined', channelId, uid, elapsed)
            // Get current peer IDs
            const {peerUsers} = this.state
            // If new user
            const user = {channelId, uid}
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
                // Remove peer ID from state array
                peerUsers: peerUsers.filter(user => user != {channelId, uid})
            })
        })
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
                    if (value != linkUser) {
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
