import React, {Component, useEffect, useState} from 'react';
import {
  Image,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
} from 'react-native';
import {connect} from 'react-redux';
import InView from 'react-native-component-inview';
//import Masonry from 'react-native-masonry-layout'
import Masonry from './lib';
import {firebase} from 'App/firebase/config';
import AlbumDetail from '../unused/AlbumDetail';
import DynImage from './DynImage';
import HalfProduct from 'App/components/HalfProduct';

class FeedList extends Component {
  state = {album1: [], album2: [], myAr: [], visible: true, inInView: false};

  // testRally() {
  // 	this.setState({ loading: true })
  // 	fetch('http://rallycoding.herokuapp.com/api/music_albums')
  // 		.then((response) => response.json())
  // 		.then((responseData) => {
  // 			this.setState({ albums: responseData, loading: false })
  // 		})
  // };
  constructor(props) {
    super(props);
    // const userId = firebase.auth().currentUser.uid;
    // var eggCountRef = firebase.database().ref('users/' + userId + '/eggs');
    // console.log(userId);
    // eggCountRef.on('value', function (snapshot) {
    // 	//console.log(snapshot);
    // 	props.setEgg(0);
    // });

    props.fetchAlbums();
  }

  checkVisible(isVisible) {
    this.setState({isInView: isVisible});
  }

  // fetchAlbums() {
  // 	const ar = [];
  // 	var counter = 0;
  // 	firebase
  // 		.firestore()
  // 		.collection('posts')
  // 		//.where()
  // 		.limit(7)
  // 		.get()
  // 		.then((querySnapshot) => {
  // 			const n = querySnapshot.size;
  // 			querySnapshot.forEach((doc) => {
  // 				const entity = doc.data();
  // 				//console.log(Image.prefetch(entity.image))
  // 				ar.push(entity);
  // 				counter = counter + 1;
  // 				//console.log(counter);
  // 				if (counter == n) {
  // 					//console.log(ar);
  // this.setState({
  // 	myAr: ar,
  // 	album1: ar.slice(0, ar.length / 2),
  // 	album2: ar.slice(ar.length / 2, ar.length),
  // });
  // 				}
  // 			});
  // 		});
  // }
  componentDidMount() {
    this.setState({
      album1: this.props.array.slice(0, this.props.array.length / 2),
      album2: this.props.array.slice(
        this.props.array.length / 2,
        this.props.array.length,
      ),
    });
  }

  renderClucks(album) {
    //return [];
    return album.map((al) => {
      if (al.price) {
        return <HalfProduct navigation={this.props.navigation} album={al} />;
      } else {
        return (
          <DynImage
            mute={true}
            repeat={true}
            ar={this.state.myAr}
            videoAr={this.props.array}
            index={this.state.myAr.indexOf(al)}
            navigation={this.props.navigation}
            data={al}
            source={{uri: al.image || al.video}}
            title={al.title}
            type={al.type}
            key={al.title}
          />
        );
      }
    });
  }

  mergeArrays(ar1, ar2) {
    let ar3 = [];
    for (var i = 0, j = 0; j < ar1.length + ar2.length; i++) {
      if (i < ar1.length) {
        ar3[j++] = ar1[i];
      }
      if (i < ar2.length) {
        ar3[j++] = ar2[i];
      }
    }

    return ar3;
  }

  renderProducts(albums) {
    //return <Text>Hello</Text>;
    return albums.map((al) => (
      <HalfProduct
        key={al.title}
        navigation={this.props.navigation}
        album={al}
      />
    ));
  }

  render() {
    //console.log(this.props.array.length, this.props.productArray.length);
    console.log('route', this.props.route);
    const videoAr = this.props?.route?.params?.videoData || this.props.array;
    const ar = this.mergeArrays(videoAr, this.props.productArray);
    //console.log('length of merge,', ar.length);
    const album1 = ar.slice(0, ar.length / 2);
    const album2 = ar.slice(ar.length / 2, ar.length);
    //console.log('lengths:', album1.length, album2.length, ar.length);
    console.log('START OF FEEDLIST');
    this.props.array.forEach((item) => {
      console.log(item.title);
    });
    if (!this.props.vidVisible) {
      return (
        <View>
          <ScrollView
            onScrollEndDrag={(event) => {
              if (
                event.nativeEvent.contentOffset.y + 400 >
                0.8 * event.nativeEvent.contentSize.height
              ) {
                console.log('should be fetching albums');
                this.props.fetchAlbums();
              }

              console.log(
                event.nativeEvent.contentOffset.y,
                0.8 * event.nativeEvent.contentSize.height,
              );
            }}>
            <View
              key="0"
              style={{
                flexDirection: 'row',
                flex: 1,
                //backgroundColor: this.state.isInView ? 'yellow' : '#f9c2ff',
              }}>
              <View style={{flex: 1}}>{this.renderClucks(album1)}</View>
              <View key="1" style={{flex: 1}}>
                {this.renderClucks(album2)}
              </View>
            </View>
          </ScrollView>
        </View>
      );
    } else {
      return <View />;
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setEgg: () => dispatch('setEgg'),
  };
}
const styles = StyleSheet.create({});

export default FeedList;
