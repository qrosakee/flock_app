import React, {useEffect, useState, useRef} from 'react';
import {constants} from 'App/constants';
import Collapsible from 'react-native-collapsible';
import {useStore} from 'react-redux';
import {
  Button,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  ScrollView,
  View,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import SmartCheckout from "App/components/SmartCheckout";
import HeaderGradient from 'App/components/HeaderGradient';
import Icon from 'react-native-vector-icons/FontAwesome';
// import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Dialog from 'react-native-dialog';
import {firebase, db, au} from 'App/firebase/config';
import io from 'socket.io-client';
import NavBar from 'App/components/common/NavBar';
import {GiftedChat} from 'react-native-gifted-chat';
import AnimatedModal from 'App/components/AnimatedModal';

import Checkout from 'App/components/Checkout';
import {useFocusEffect} from '@react-navigation/native';
import PriceSlider from 'App/components/PriceSlider';
// import NumericTextInput from 'App/components'
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator,
  useIsDrawerOpen,
} from '@react-navigation/drawer';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Countdown from 'App/components/Countdown';

const barHeight = 25;

var eventify = function (arr, callback) {
  arr.push = function (e) {
    Array.prototype.push.call(arr, e);
    callback(arr);
  };
};

const updateCache = (id, messages) => {
  //data[id].messages = messages;
};

const systemMessages = [];

function ChatInterface({route, navigation}) {

  const [creditModal, setCreditModal] = useState(false);


  const [priceShare, setPriceShare] = useState(route.params.data.maximums[au.currentUser.uid] || 0);
  const [initialDialog, setInitialDialog] = useState(false);
  const [remainingPercent, setRemainingPercent] = useState(0);

  // const [UUID, setUUID] = useState(0);
  console.log('remaning percent', remainingPercent);

  useFocusEffect(()=>{
    // setUUID(Math.random());
    setPriceShare(route.params.data.maximums[au.currentUser.uid]);
    console.log(route.params.data.id, route.params.data.maximums[au.currentUser.uid]);
  }, []);
  useEffect(()=>{
    const unsub = db.collection('chatGroups').doc(route.params.data.id).onSnapshot(docSnapshot => {
      const data = docSnapshot.data();
      const members = data.memberIds;
      const maximums = data.maximums;
      var remaining = route.params.data.product.price;
      for (const m of members) {
        if (m != au.currentUser.uid) {
        remaining -= maximums[m];
        }
      }
      // console.log(remaining/route.params.data.product.price);
      console.log('first set', Math.round(100 * remaining/route.params.data.product.price));
      setRemainingPercent(Math.round(100 * remaining/route.params.data.product.price));
    }, err => {
      console.log(`Encountered error: ${err}`);
    });

    return ()=>{
      unsub();
    }
  },[])

  useFocusEffect(()=>{
    setPartOf(part);
  }, []);
  const completeFunc = (customerId) => {
    // send to socket, which pushes a broadcast
    // test signal, send test, on receive, console log "RECEIVED"
    // condition
      // FLOCK_UPDATE
      console.log(route.params.data.product.price);
      console.log(route.params.data.maximums);
    // const res = splitAlgorithm(route.params.data.members, route.params.data.maximums, route.params.data.product.price)
    const flockTookOff = didFlockTakeOff(route.params.data.members, route.params.data.maximums, route.params.data.product.price);
    if (flockTookOff) {
    socket.current.emit('complete', route.params.data.id);
    db.collection('chatGroups').doc(route.params.data.id).update({
      // members: res,
      completed: true,
      markedDates: {},
      
      // rentPrice: ((route.params.data.product.price * .15 + route.params.data.product.price / route.params.data.members.length) / 2).toFixed(2),
      // FLOCK_UPDATE this should go in the backend so that prices can be adjusted easily
      
    });
    //purchase order addd
    // route.params.data.members = res;

    //purchase order added by backend
    // db.collection('purchaseOrders').doc().set({
    //   product: route.params.data,
    //   user: {name: auth.currentUser.displayName, uid: auth.currentUser.uid},
    //   transaction: "price here",
    // });
    let postData = {
      ...route.params.data,
      customerId: customerId,
      chatId: route.params.data.id,
      userId: au.currentUser.uid,
    }
    fetch(constants.CHARGE_FLOCK_COMPLETE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: { 'Content-Type': 'application/json' }
}).then(res => res.json())
  .then(json => console.log(json));
    
    navigation.navigate('FlockSuccess', {data: route.params.data})
    }
  };
  const store = useStore();
  const select = useSelector((state) => state);

  const [creditEmail, setCreditEmail] = useState(select.userInfo.email || "");
  const socket = useRef(null);
  const [recvMessages, setRecvMessages] = useState(route.params.data.messages);
  useFocusEffect(()=>{
    setRecvMessages(route.params.data.messages);
  }, []);
  //const [recvMessages, setRecvMessages] = useState([testSystemMessage]);
  const [dummyState, setDummyState] = useState(0);
  const dispatch = useDispatch();
  //firebase.firestore().collection("posts").get();
  useEffect(function () {
    //firebase.firestore().collection("posts").get();
    eventify(systemMessages, (message) => {
      console.log('adding');
      setRecvMessages((prevState) => GiftedChat.append(prevState, message));
    });
    //socket.current = io('https://enigmatic-bastion-86695.herokuapp.com/');
    socket.current = io('http://10.0.0.228:5000');
    console.log('WHY IS THIS RUNNING AGAIN');
    socket.current.emit('join', route.params.data.id);
    socket.current.on('message', (message) => {
      console.log(message);
      setRecvMessages((prevState) => GiftedChat.append(prevState, message));
    });
    socket.current.on('complete', () => {
      console.log('completingggg');
      navigation.navigate('FlockSuccess', {data: route.params.data});
    });
    console.log("MESSAGES");
    setRecvMessages(route.params.data.messages);
    dispatch({type: 'emptySystemMessages'});
  }, []);

  // useEffect(() => {
  //   for (const message of select.chat.systemMessages) {
  //     setRecvMessages((prevState) => GiftedChat.append(prevState, message));
  //   }
  // }, [select.chat.systemMessages]);

  // const setRecvMessages = (messages) => {
  //   recvMessages = messages;
  //   setDummyState(!dummyState);
  // };
  const onSend = (messages) => {
    if (route.params.data.id === 'self') {
      setRecvMessages((prevState) => GiftedChat.append(prevState, messages));
      return;
    }
    socket.current.emit('message', {
      text: messages[0].text,
      id: route.params.data.id,
    });
    console.log(route.params.data);
    updateCache(route.params.data.id, recvMessages);
      //data["id"] = docRef.id;
      console.log("DAT", route.params.data);
      db.collection('chatGroups').doc(route.params.data.id).update({
          messages: firebase.firestore.FieldValue.arrayUnion({sender: {name: firebase.auth().currentUser.displayName, uid: firebase.auth().currentUser.uid}, ...messages[0]}),
        });
        //console.log("messages format",recvMessages);
    setRecvMessages((prevState) => GiftedChat.append(prevState, messages));
  };

  console.log(route.params.data);
  const user = firebase.auth().currentUser;
  var part = false;
  for (const member of route.params.data.members) {
    if (user.uid === member.uid) {
      part = true;
      break;
    }
  }
  const [partOf, setPartOf] = useState(part);
  // console.log(route.params.data.maximums, user.uid);

  const convertArrayToDict = (arr) => {
    // format [{"dadsfa": "ADFadsf"},{"asdfadsf":"adsfasdfa"}]
    if (typeof arr === "Object") return arr;
    const dicti = {};
    for (const item of arr) {
      var obj = Object.entries(item);
            dicti[obj[0][0]] = obj[0][1]
    }
    return dicti;
  }
  console.log('changing price');
  const yourPrice = route.params.data.maximums[user.uid];
  console.log('your price', route.params.data.maximums);
  const ChangePayment = ({data, setState}) => {
  const NumericTextInput = ({data=0}) => {
    const [dataValue, setDataValue] = useState(data);
    const [dialVisible, setDialVisible] = useState(false);
    const dial = <Dialog.Container visible={dialVisible}>
    <Dialog.Title>Confirm Change</Dialog.Title>
    <Dialog.Description>
      You will only be charged if the flock completes.
    </Dialog.Description>
    <Dialog.Button label="Cancel" onPress={()=>{
      setDataValue(data);
      setDialVisible(false);
    }}/>
    <Dialog.Button label="Confirm" onPress={()=>{
      route.params.data.maximums[au.currentUser.uid] = dataValue;
      setState(dataValue);
      completeFunc(select.userInfo.customerId);
      // setDataValue()
      setDialVisible(false);
    }}/>
  </Dialog.Container>;
    return <View style={{flexDirection:'row', alignItems: 'center'}}><TextInput
    // contextMenuHidden={numeric}
    style={{width: 75, backgroundColor: 'white', borderRadius: 40, paddingLeft: 20}}
    keyboardType={"numeric"}
    blurOnSubmit placeholder={"0.00"} onBlur = {(e)=> {
        // console.log("BLUR", e.nativeEvent.text);
    }} 
    value={(typeof dataValue)==="string"?dataValue:dataValue.toFixed(2)}
    defaultValue={data}
    onChangeText={(text)=>{
            if (text === "") {
                setDataValue("");
            } else {
                setDataValue(parseInt(text.replace(".",""))/100);
            }
    }}
    
    />
    {dial}
    <Text style={{color: 'white', marginLeft: 10, width: 30}}>{100*(parseInt(dataValue) / route.params.data.product.price)>100?"100%":100*(parseInt(dataValue) / route.params.data.product.price)<1?"<1%":(100*parseInt(dataValue) / route.params.data.product.price).toFixed(0) + "%"}</Text>
    <TouchableOpacity onPress={()=>{
      if (dataValue !== data) {
      setDialVisible(true);
      }
    }}>
      <View style={{marginLeft: 10, borderRadius: 40, backgroundColor: 'green'}}>
      <Icon name="check" size={10} color="white" />
      </View>
      </TouchableOpacity>
    </View>;
}
return <ScrollView  style={{marginLeft: 15, overflow: 'visible', backgroundColor: 'yellow'}} keyboardShouldPersistTaps="never">
  
  <NumericTextInput data={data} />
  </ScrollView>
  }
  
  console.log("PARTOF?", partOf, part);
  console.log("ID", route.params.data.id);
  console.log("priceshare", priceShare);
  console.log(creditModal, "open?");
  console.log(parseFloat(priceShare) / parseFloat(route.params.data.product.price) * 100);
  // console.log("prices", priceShare, route.params.data.product.price, parseFloat(priceShare) / parseFloat(route.params.data.product.price) * 100);
  return (<>
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      
<HeaderGradient navigation={navigation} >
  <View style={{marginBottom:-10}}>
<Text style={{fontSize: 14, textAlign: 'center'}}>%{route.params.data.id}</Text>
  <Countdown dateObj={route.params.data.time} />
  </View>
</HeaderGradient>
      <View style={{ position: 'absolute', zIndex: 200, top: 100, width: '100%', borderRadius: 0, borderBottomRightRadius: 70, borderBottomLeftRadius: 70}}>
      <View style={{
        // shadowColor: "#ff7009", shadowOffset: {height: 0, width: 0}, shadowOpacity: 0.42, elevation: 13, shadowRadius: 28.30,
       borderBottomLeftRadius: 70, borderBottomRightRadius: 70}}>
      <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="never" >
      <LinearGradient
          colors={[constants.PEACHBG, constants.PEACHBG]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{
            borderRadius: 20,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            
            padding: 10,
            shadowColor: "#ff7009", shadowOffset: {height: 10, width: 0}, shadowOpacity: 0.39, elevation: 13, shadowRadius: 8.30,
            //alignItems: 'center',
            flex: 1,
          }}>
            <View style={{width: '90%', alignSelf: 'center'}}>
            {/* <Text style={{color:'white', marginBottom: 10, fontWeight: 'bold'}}>Current flock price: ${route.params.data?.product?.price || ""}</Text> */}
            {/* <Text style={{color:'white', marginBottom: 10, fontWeight: 'bold'}}>Total price: ${route.params.data?.product?.price || ""}</Text> */}
            
            {part?<PriceSlider key={Math.random()} remainingPercent={remainingPercent} priceShare = {priceShare} priceShareInitialPercent={parseFloat(priceShare) / parseFloat(route.params.data.product.price) * 100} completeFunc={completeFunc} productPrice={route.params.data.product.price} maximums={route.params.data.maximums} />:
            <PriceTextPreview remainingPercent={remainingPercent} productPrice={route.params.data.product.price} />
            }
            </View>
            <TouchableOpacity onPress={()=>{
              navigation.navigate("Product", {album: route?.params?.data?.product, data: route.params.data, id: route?.params?.data?.id});
            }}>
            <View style={{flexDirection: 'row', padding: 20, marginBottom: 15, paddingLeft: 30, paddingRight: 30,borderRadius: 50, shadowRadius: 2.62, backgroundColor: 'white', shadowOpacity: 0.23, shadowOffset:{height: 2,width:0}, elevation: 1}}>
            <Image style={{width: 50, height: 50}} source={{uri: route.params.data.product.image}} />
            <View style={{flex:1}}>
            <Text numberOfLines={2}>{route.params.data.product.title}</Text>
            <Text>${route.params.data.product.price}</Text>
            </View>
            </View>
            
            </TouchableOpacity>
          </LinearGradient>
          </ScrollView>
        </View>
      <View style={{marginTop: 20, flexDirection: 'row',
      shadowColor: constants.GREYBLUE, shadowOffset: {height: 5, width: 0}, shadowOpacity: 0.42, elevation: 13, shadowRadius: 8.30,
    }}>
        <Image style = {{width: 40, height: 40, marginRight: 20, marginLeft: 10, borderRadius: 50}} source ={constants.PLACEHOLDER_IMAGE } />
        <View style={{borderRadius: 30, flex: 1, backgroundColor:"#9eacc5", padding: 15, marginRight: 20, 
          // shadowColor: constants.GREYBLUE, shadowOffset: {height: 10, width: 0}, shadowOpacity: 0.82, elevation: 13, shadowRadius: 18.30,
          }}>
          <View>
            <Text>Product specifications of this flock</Text>
            <View style={{backgroundColor: 'rgba(255,255,255,0.2)', padding: 5, borderRadius: 15}}>
              <Text>{route.params.data.specifications}</Text>
            </View>
          {/* <Text>{route.params.data.description}</Text> */}
          </View>
          </View>
      </View>
      </View>
      
      <View style={{backgroundColor: constants.PINK_BACKGROUND, flex: 1}}>
      <GiftedChat
      // key={route.params.data.id}
        // renderSystemMessage={(props) => {
        //   //console.log("SYSTEM MESSAGE PROPS", props);
        //   return (
        //     <TouchableOpacity
        //       onPress={() => {
        //         navigation.navigate('Info', {
        //           openId: props.currentMessage.openId,
        //         });
        //       }}>
        //       <View
        //         style={{
        //           justifyContent: 'center',
        //           alignItems: 'center',
        //           //borderWidth: 1,
        //           shadowOpacity: 0.2,
        //           shadowOffset: {height: 5, width: 2},
        //           backgroundColor: '#22a',
        //           borderRadius: 2,
        //           paddingRight: 15,
        //           paddingLeft: 15,
        //           paddingTop: 10,
        //           paddingBottom: 10,
        //           alignSelf: 'center',
        //           marginBottom: 10,

        //           width: '75%',
        //         }}>
        //         <Text style={{textAlign: 'center', color: 'white'}}>
        //           {props.currentMessage.text}
        //         </Text>
        //       </View>
        //     </TouchableOpacity>
        //   );
        // }}
        messages={recvMessages}
        onSend={onSend}
        user={{_id: 1}}
      /></View>
      <JoinDialog navigation={navigation} data={route.params.data} setCreditModal={setCreditModal} initialDialog={initialDialog} setInitialDialog={setInitialDialog} setPartOf = {setPartOf} completeFunc = {completeFunc} maxPercent = {remainingPercent} productPrice={route.params.data.product.price} />
      {partOf?<></>:<View style={{position: 'absolute', bottom: 0, width: '100%', height: 100, backgroundColor: 'white'}}><View style={{height: '100%', backgroundColor: constants.PINK_BACKGROUND }}>
        <TouchableOpacity style={{width: '90%', height: 50, backgroundColor: constants.ORANGE, alignSelf: 'center', borderRadius: 30, justifyContent: 'center'}} onPress={()=>{
          setInitialDialog(true);
          // setCreditModal(true);
      }}><Text style={{color: 'white', alignSelf: 'center', fontWeight: 'bold'}}>JOIN</Text></TouchableOpacity></View></View>}
    
    </SafeAreaView>
    <AnimatedModal upPercent="70%" colored={true} colors={[constants.ORANGE, constants.GREYORANGE]} nested={false} visible={creditModal} close={()=>setCreditModal(false)} navigation={navigation} 
     >
       <KeyboardAvoidingView behavior="position" style={{flex: 1}} keyboardVerticalOffset={-200}>
<ScrollView>
  
       <SmartCheckout billingOnly={true} allowConfirm={(creditChanged, shippingChanged, allowed, setAllowed)=>{
         const validEmail = (em)=>{
          return em !== "" && em.indexOf("@") != -1;
         }
         console.log("valid email????", validEmail(creditEmail));
         setAllowed(creditChanged && validEmail(creditEmail));
       }} confirmFunc={(customerId)=>{
        //  au.currentUser.updateEmail(creditEmail);
        dispatch({type:'UPDATE_DATA', payload: ["email", null, null, creditEmail]});
        db.collection('users').doc(au.currentUser.uid).update({
          email: creditEmail,
        });
         console.log('conffirrrrrm');
         data.maximums[au.currentUser.uid] = (initialPercent/100 * parseFloat(data.product.price)).toFixed(2);
         // console.log('route  id', route.params.data.id);
         db.collection('chatGroups').doc(data.id).update({
           members: firebase.firestore.FieldValue.arrayUnion(memberInfo),
           memberIds: firebase.firestore.FieldValue.arrayUnion(memberInfo.uid),
           maximums: data.maximums,
         });
setPartOf(true);
  route.params.data.memberIds.push(au.currentUser.uid);
  completeFunc(customerId);
  setTimeout(()=>{
    setCreditModal(false);
    navigation.navigate("ChatInterface", {data:data});
  }, 1000)
  // setCreditModal(false);
       }} 
       cancelFunc={()=>{
         
       }}
       >
         <View style={{marginHorizontal: 30, marginTop: 10}}>
         <Text>Email</Text>
         <TextInput style={{paddingLeft: 20, borderWidth: 1, borderColor: constants.DARKGREY, borderRadius: 40, paddingVertical: 5, marginTop: 15}} keyboardType="email-address" defaultValue={au.currentUser.email} 
         value={creditEmail}
         onChangeText={(text)=>{
          setCreditEmail(text);
         }}
         />
         </View>
       </SmartCheckout>
       <View style={{marginHorizontal: 30, marginTop: 20}}>
              <Text >
              * Your credit card will only be charged if combined ownership reaches 100%. You can change how much you want to pay any time before the flock takes off.
       </Text>
       <Text style={{marginTop: 20}}>
         ** Your email is necessary for receiving receipts and tracking updates.
       </Text>
       </View>
       
       </ScrollView>
       </KeyboardAvoidingView>
       </AnimatedModal>
      {/* <Modal transparent={false} visible={creditModal}>
        <TouchableOpacity  style = {{marginTop: 400}} onPress={()=>setCreditModal(false)}>
          <Text>touch me</Text>
        </TouchableOpacity>
      </Modal> */}
      </>
  );
}

const JoinDialog = ({navigation, data, setCreditModal, initialDialog, setInitialDialog, setPartOf, completeFunc, minPercent=8, maxPercent, productPrice}) =>{
  const store = useStore();
  const dispatch = useDispatch();

  const [initialPercent, setInitialPercent] = useState(8);

  return <Dialog.Container visible={initialDialog}>
  <Dialog.Title>Set Your Price</Dialog.Title>
  <Dialog.Description>
    The more you pay, the more you own. The more you can use.
    <View style={{alignItems: 'center', flexDirection: 'row', height: 45,paddingTop: 10, justifyContent: 'center'}}>
    <View style={{borderRadius: 40, backgroundColor: constants.ORANGE, width: 25, height: 25, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={()=>{
          if (initialPercent > minPercent) {
            setInitialPercent(initialPercent-4);
          }
          
        }}>
          <Icon name="minus" color="white" size={20} />
        </TouchableOpacity>
      </View>
      <View style={{width: 100, alignSelf: 'center'}}>
      <Text style={{width: 100, textAlign: 'center',fontSize:14, fontWeight: 'bold'}}>${(parseFloat(productPrice) * initialPercent/100).toFixed(2)}</Text>
      <Text style={{width: 120,textAlign: 'center',fontSize:14, fontWeight: 'bold', alignSelf: 'center'}}>({initialPercent}% yours)</Text>
      </View>
      <View style={{borderRadius: 40, backgroundColor: constants.ORANGE, width: 25, height: 25, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={()=>{
          if (initialPercent < maxPercent) {
            setInitialPercent(initialPercent+4);
          }
          
        }}>
          <Icon name="plus" color="white" size={20} />
        </TouchableOpacity>
      </View>

    </View>
  </Dialog.Description>
  <Dialog.Button label="Cancel" onPress={()=>{
    // console.log(route.params.data.id,"ID");
    setInitialDialog(false);
  }}/>
  <Dialog.Button label="Confirm" onPress={()=>{
    
    if (store.getState().userInfo.customerId !== "none") {
      const memberInfo = {name: au.currentUser.displayName, uid: au.currentUser.uid};
      db.collection('users').doc(au.currentUser.uid).update({
        chatIds: firebase.firestore.FieldValue.arrayUnion(data.id)
      });
      data.maximums[au.currentUser.uid] = (initialPercent/100 * parseFloat(data.product.price)).toFixed(2);
      // console.log('route  id', route.params.data.id);
      db.collection('chatGroups').doc(data.id).update({
        members: firebase.firestore.FieldValue.arrayUnion(memberInfo),
        memberIds: firebase.firestore.FieldValue.arrayUnion(memberInfo.uid),
        maximums: data.maximums,
      });
      setPartOf(true);
    // dispatch({type: "UPDATE_DATA", payload: ["chatIds", "add", "array", data.id]});
    // dispatch({type: "UPDATE_DATA", payload: ["chatGroups", "add", "array", data]});
      data.members.push(memberInfo);
      completeFunc(store.getState().userInfo.customerId);
      setInitialDialog(false);
      navigation.navigate("ChatInterface", {data: data});
    } else {

      setInitialDialog(false);
      setTimeout(()=>{
        setCreditModal(true);
      }, 500);
      
    }
    // setInitialDialog(false);
  }}/>
</Dialog.Container>
}

const PriceTextPreview = ({productPrice, remainingPercent}) =>{
  console.log('remin', remainingPercent);
const [infoModal, setInfoModal] = useState(false);


  return <>
  <View style={{flexDirection: 'row', justifyContent: 'center', }}>
  <View style={{alignItems: 'center', width: 175}}>
  <Text style={{color:'black'}}>Others are paying</Text>
    <Text style={{fontSize: 18, color: 'black'}}>${(parseFloat(productPrice) * ((100-remainingPercent)/100)).toFixed(2)} ({(100-remainingPercent).toFixed(0)}%)</Text>
  </View>
  </View>
  <View style={{flexDirection: 'row', alignItems: 'center'}}>
  <View style={{flex: 1, marginTop: 10, flexDirection: 'row', paddingLeft: 10, alignItems: 'center', justifyContent: 'center', alignSelf: 'center'}}>
  <View style={{width: barHeight,  height: barHeight, backgroundColor: constants.GREYORANGE, borderBottomLeftRadius: 40, borderTopLeftRadius: 40}}/>
          <View style={{flex: 100-remainingPercent,  height: barHeight, backgroundColor: constants.GREYORANGE, borderBottomLeftRadius: 0, borderTopLeftRadius: 0}}/>
        <View style={{flex:remainingPercent, marginRight: 0, paddingRight: 0, borderTopRightRadius: 40, borderBottomRightRadius: 40,backgroundColor: constants.PINK_BACKGROUND_OPAQUE, borderColor: constants.GREYORANGE, borderWidth: 1,height: barHeight,}}>
</View>
</View>
</View>
<View style={{alignItems: 'center',paddingTop: 10, justifyContent: 'center'}}>
  <Text style={{color:'black', marginBottom: 10, textAlign: 'center', alignSelf: 'center'}}>Increase to own more and use more.</Text>
  <View style={{width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 50, position: 'absolute', right: 25, borderWidth:1, borderColor: constants.LAVENDER}}>
    <TouchableOpacity onPress={()=>{
      setInfoModal(true);
    }}>
  <Icon name="info" size={10} color={constants.LAVENDER} />
  </TouchableOpacity>
  </View>
  </View>
    <AnimatedModal colored={true} colors={[constants.PEACH, constants.GREYORANGE]} nested={true} visible={infoModal} close={()=>{setInfoModal(false)}}></AnimatedModal>
  </>;
}


const HeaderView = ({navigation, route}) => {
  const [collapsed, setCollapsed] = useState(true);
  return <View
  style={{
    position: 'absolute',
    zIndex: 90,

    borderBottomColor: '#efefef',
    borderBottomWidth: 1,
    height: 100,
    width: '100%',
    top: 0,

    //backgroundColor: constants.TRANSLUCENT,
    // borderBottomLeftRadius: 15,
    // borderBottomRightRadius: 15,
  }}>
    <LinearGradient
    colors={[constants.TRANSLUCENT, 'white']}
    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
    style={{
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingLeft: 20,
      paddingBottom: 20,
      // borderBottomRightRadius:20,
      // borderBottomLeftRadius: 20,
      //shadowColor: "#ff7009", shadowOffset: {height: 10, width: 0}, shadowOpacity: 0.39, elevation: 13, shadowRadius: 28.30,
      //alignItems: 'center',
    }}>
    
          <TouchableOpacity onPress={()=>{ navigation.goBack()}}><Image style={{width: 35, height: 35}} source = {require('App/Assets/Images/Back_Icon.png')} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={()=>{ setCollapsed(!collapsed); }}>
  <View>
    
  <Text style={{fontSize: 14, textAlign: 'center'}}>%{route.params.data.id}</Text>
  <Countdown dateObj={route.params.data.time} />
  {/* <Collapsible collapsed={collapsed}>
    <ScrollView horizontal >
  {route.params.data.members.map((item)=>{
    const buyer = item.name;
    const user = firebase.auth().currentUser;
  return <View>
  <Image
    key={Math.random()}
    style={{
      height: buyer === user.displayName ? 50 : 46,
      marginRight: 10,
      marginTop: 10,
      width: buyer === user.displayName ? 50 : 46,
      borderWidth: 3,
      borderColor:
        buyer === user.displayName ? '#3cf' : 'transparent',
      borderRadius: 50,
    }}
    source={{uri: 'https://placeimg.com/140/140/any'}}
  />
  <Text
    numberOfLines={1}
    style={{
      fontWeight:
        buyer === user.displayName ? 'bold' : 'normal',
      color: buyer === user.displayName ? '#3cf' : 'black',
      fontSize: 10,
      width: 48,
      textAlign: 'center',
      overflow: 'hidden',
    }}>
    {buyer === user.displayName ? 'You' : buyer}
  </Text>
</View>;
  })}
      </ScrollView>
      </Collapsible> */}
  </View>
  </TouchableOpacity>
  {/* <Button
    title="
      ⓘ"
    onPress={() => {
      navigation.navigate('Info', {
        friends: [],
        data: route.params.data,
      });
    }}
  /> */}
  </LinearGradient>
</View>
};

const data = {
  0: {
    flock: 'squad up',
    id: '0',
    buys: [
      {
        title: 'Game boy',
        url: null,
        price: '24.99',
        buyers: ['xxxHacker', 'jasonny'],
      },
      {
        title: 'Nintendo Switch',
        url: null,
        price: '300.99',
        buyers: [
          'xxxHacker',
          'jasonny',
          'danielpark',
          'Qrowsaki',
          'Me',
          'Hello',
        ],
      },
    ],
    boughts: [],
    friends: ['xxxHacker', 'stupidbro', 'jasonny', 'danielpark', 'Qrowsaki'],
    messages: [],
  },
  1: {
    flock: 'church friends',
    id: '1',
    buys: [],
    boughts: [],
    friends: ['Qrowsaki'],
    messages: [],
  },
};

var didFlockTakeOff = (members, maximums, totalPrice) => {
  var sumTotal = 0;
  var ar = Object.entries(maximums);
  for (const item of ar) {
    var entry = item[1];
    // entry = entry.replace("$","").replace("-","");
    sumTotal += parseFloat(entry);
  }
  return sumTotal >= totalPrice;
}
var splitAlgorithm = (members, maximums, totalPrice) => {


  var splitFunc = (currIndex, completed) => {
  if (completed.length == 0) return null;
  if (satisfy(completed)) return completed;
  if (currIndex >= members.length) {
  return null;
  }
  var r1, r2;

  r1 = splitFunc(currIndex+1, completed=[...completed, members[currIndex]]);

  r2 = splitFunc(currIndex+1, completed=[...completed])
  return r2 || r1;
  }

  var satisfy = (ar) => {
  var works = true;
  const split = totalPrice / ar.length;
  for (var item of ar) {
  if (maximums[item.uid] < split) works = false;
  }

  return works;
  }

  var res = splitFunc(1, [members[0]]);
  return res;
}
export default ChatInterface;
