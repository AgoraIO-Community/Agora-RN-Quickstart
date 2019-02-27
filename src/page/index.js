/* @flow */
import * as React from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid
} from 'react-native';
import {
  Header
} from 'react-navigation';
import {
  TextInput,
  Button,
  withTheme,
  Appbar,
  Dialog,
  Paragraph
} from 'react-native-paper';
import {title} from '../settings';


async function requestCameraAndAudioPermission() {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

type Props = {
  theme: Theme,
  navigation: any,
};

type State = {
  text: string,
};

export class Index extends React.Component<Props, State> {

  static navigationOptions = {
    header: (
      <Appbar.Header>
        <Appbar.Content title={title} />
      </Appbar.Header>
    )
  };

  state = {
    text: '',
    visible: false,
    message: null
  };

  _hideDialog = () => {
    this.setState({
      visible: false,
      message: null
    });
  }

  componentWillMount () {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(_ => {
        
      });
    }
  }

  render() {
    const {
      theme: {
        colors: { background },
      },
    } = this.props;

    const { state, navigate } = this.props.navigation;

    return (
      <KeyboardAvoidingView
        style={styles.wrapper}
        keyboardVerticalOffset = {Platform.select({ios: 0, android: Header.HEIGHT + 64})}
        behavior= {(Platform.OS === 'ios')? "padding" : null}
        keyboardVerticalOffset={80}
      >
        <Dialog
          visible={this.state.visible}
          onDismiss={this._hideDialog}>
          <Dialog.Title>Alert</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{this.state.message}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={this._hideDialog}>Done</Button>
          </Dialog.Actions>
        </Dialog>
        <ScrollView
          style={[styles.container, { backgroundColor: background }]}
          keyboardShouldPersistTaps={'always'}
          removeClippedSubviews={false}
        >
          <TextInput
            style={styles.inputContainerStyle}
            label="channel name"
            placeholder="alphabet"
            value={this.state.text}
            onChangeText={text => this.setState({ text })}
          />
          <Button style={styles.buttonContainerStyle} onPress={() => navigate("agora", {
              channelName: this.state.text,
              onCancel: (message) => {
                this.setState({
                  visible: true,
                  message
                });
                console.log('[agora]: onCancel ', message);
              }
            })}>
            join channel
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  colors: {
    backgroundColor: "#6200ee"
  },
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    flexDirection: 'column',
  },
  wrapper: {
    flex: 1,
  },
  inputContainerStyle: {
    margin: 8,
    flex: 2
  },
  buttonContainerStyle: {
    flex: 2
  },
  contenStyle : {
    textAlign: 'center',
  }
});

export default withTheme(Index);