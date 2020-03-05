/* eslint-disable prettier/prettier */

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
        paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#0093E9', borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
    },
    fullView: {
        width: dimensions.width, height: dimensions.height - 130,
    },
});
