/* 
* Made by Kevin Gao, for Flock Shopping.
* All rights reserved.
* Flock © 2020
*
*
			 _______  ___        ______    ______   __   ___  
			/"     "||"  |      /    " \  /" _  "\ |/"| /  ") 
			(: ______)||  |     // ____  \(: ( \___)(: |/   /  
			\/    |  |:  |    /  /    ) :)\/ \     |    __/   
			// ___)   \  |___(: (____/ // //  \ _  (// _  \   
			(:  (     ( \_|:  \\        / (:   _) \ |: | \  \  
			\__/      \_______)\"_____/   \_______)(__|  \__)
*
*/
/*
 * OptionsModal.js
 *
 * This file contains code for the OptionsModal that is currently used on
 *  the AppNavigator tab navigation bar to show the Add slide up modal.
 *
 * Is general enough to use for general purpose.
 * To use, set a State that allows modal to be on or off. Connect this state
 *  to modalOpen prop.
 *
 *
 */

import {constants} from 'App/constants';
import {View, Modal, Text, Animated, TouchableOpacity, Dimensions} from 'react-native';
import React, {useRef} from 'react';
import MaskedViewIOS from '@react-native-community/masked-view';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedModal = ({
  visible,
  close,
  navigation,
  content,
  upPercent="55%"
}) => {
  const animation = useRef(new Animated.Value(0));
  const startAnimation = () => {
    Animated.timing(animation.current, {
      useNativeDriver: false,
      toValue: 0.8,
      delay: 0,
      duration: 700,
    }).start();
  };

  const resetAnimation = () => {
    Animated.timing(animation.current, {
      useNativeDriver: false,
      toValue: 0,
      delay: 0,
      duration: 1,
    }).start();
  };
  if (visible) {
    startAnimation();
  }
  return (
    <View style={{zIndex: 800}}>
      <Animated.View
        style={{
          height: visible ? Dimensions.get('window').height : 0,
          width: visible ? Dimensions.get('window').width : 0,
          position: 'absolute',
          bottom: 0,
        //   left: -500,
        //   bottom: -1000,
          right: 0,
          //backgroundColor: 'rgb(0,0,0)',
          opacity: animation.current,
          //backgroundColor: modalVisible ? 'rgba(0,0,0,0.7)' : 'transparent',
        }}
      >
    <LinearGradient style={{height: '100%'}} colors={[constants.BRIGHT_BLUE, 'transparent']} />

      </Animated.View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        style={{
          position: 'absolute',
          width: '100%',
          justifyContent: 'flex-end',
          backgroundColor: '#aea',
        }}>
          <TouchableOpacity onPress={()=>{
            close();
            resetAnimation();
              }} style={{position: 'absolute', top:0, height: '100%', width: '100%', zIndex: -30}} />
              <View style={{position: 'absolute', bottom: 15, height: upPercent, width: '84%', backgroundColor: 'white', opacity: .5, alignSelf: 'center', borderRadius: 90,}} />
            <View style={{position: 'absolute', bottom: 8, height: upPercent, width: '90%', backgroundColor: 'white', opacity: .5, alignSelf: 'center', borderRadius: 90,}} />
            <View style={{position: 'absolute', bottom: 0, width: '100%', height: upPercent, borderRadius: 100, borderBottomRightRadius: 0, borderBottomLeftRadius: 0, backgroundColor: 'white', paddingTop: 40, overflow: 'hidden'}}>
              
              {content}
              </View>
      </Modal>
    </View>
  );
};

const styles = {
  innerButton: {
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(245,245,245,1)',
    borderTopWidth: 1,
    borderColor: '#aaa',
    fontFamily: 'Nunito-Light',
  },
  longButton: {
    justifyContent: 'center',
    flex: 1,

    backgroundColor: 'rgba(225,225,225,1)',
    width: '90%',
    marginTop: 10,
    borderRadius: 40,
  },
};

export default AnimatedModal;
