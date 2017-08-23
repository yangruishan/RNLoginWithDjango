import React, {Component} from 'react';
import Dimensions from 'Dimensions';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    Animated,
    Easing,
    Image,
    View,
    BackAndroid,
    ToastAndroid,
    //AppState,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import CookieManager from 'react-native-cookies';

import spinner from '../images/loading.gif';

const DEVICE_WIDTH = Dimensions.get('window').width;
//const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

export default class ButtonSubmit extends Component {
    constructor() {
        super();

        this.state = {
            isLoading: false,
            csrftoken: null,//Django每次网络请求的csrftoken
            //sessionid: null,//Django授权用户登录后生成的sessionid
            isAuthenticated: false,
        };

        this.buttonAnimated = new Animated.Value(0);
        this.growAnimated = new Animated.Value(0);
        this._onPress = this._onPress.bind(this);
    }

    componentWillMount() {
        console.log('Mount!');
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount() {//仅在使用Android手机的Back键时调用该函数
        //console.log('Unmount!');
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    onBackAndroid = ()=> {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            console.log('Unmount!');
            CookieManager.clearAll();
            //最近2秒内按过back键，可以退出应用。
            return false;
        }
        this.lastBackPressed = Date.now();
        ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
        return true;
    };

    _onPress() {
        if (this.state.isLoading) return;

        this.setState({isLoading: true});
        Animated.timing(
            this.buttonAnimated,
            {
                toValue: 1,
                duration: 200,
                easing: Easing.linear
            }
        ).start();

        setTimeout(() => {
            this._onGrow();
        }, 2000);

        this.loginAuthenticate();

        setTimeout(() => {
            Actions.secondScreen();
            this.setState({isLoading: false});
            this.buttonAnimated.setValue(0);
            this.growAnimated.setValue(0);
        }, 2300);
    }

    _onGrow() {
        Animated.timing(
            this.growAnimated,
            {
                toValue: 1,
                duration: 200,
                easing: Easing.linear
            }
        ).start();
    }

    loginAuthenticate() {
        let serverIP = '192.168.43.139';
        let serverPort = '8000';
        let urlAdmin = 'http://' + serverIP + ':' + serverPort + '/admin/';
        let urlLogin = 'http://' + serverIP + ':' + serverPort + '/admin/login/?next=/admin/';

        fetch(urlAdmin, {
            method: 'GET',
            credentials: 'omit',
            //headers: {},
        }).then((response) => {
            console.log(response);
            //    console.log(response.headers.get('Content-Type'));
            if (response.ok && response.status == 200) {
                this.setState({isAuthenticated: true});
                if (response.headers.has('set-cookie')) {
                    var headerCookie = response.headers.get('set-cookie');
                    console.log(headerCookie);
                    var csrftokenValue = headerCookie.split(";")[0].split("=")[1];
                    console.log(csrftokenValue);
                    if (csrftokenValue) {
                        this.setState({csrftoken: csrftokenValue})
                        console.log(this.state.csrftoken)

                        let formData = 'csrfmiddlewaretoken=' + csrftokenValue;
                        formData = formData + '&username=admin&password=xy382847';
                        formData = formData + '&next=/admin/';
                        console.log(formData);

                        fetch(urlLogin, {
                            method: 'POST',
                            credentials: 'omit',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: formData,
                        }).then((response) => {
                            //console.log(response);
                            if (response.ok && response.status == 200) {
                                var returnHTML = response.text();
                                //console.log(returnHTML);
                                return returnHTML;
                            }
                        }).then((reponseText) => {
                            //console.log(reponseText);
                            if (reponseText.search('<p class="errornote">') == -1) { //如果用户名、密码认证不通过，返回的html中含有<p class='errnote'>字符串，否则，没有。
                                this.setState({isAuthenticated: true});
                                console.log("True");
                            } else {
                                console.log("false");
                            }
                        })
                    }
                } else {
                    var returnHTML = response.text();
                    console.log(returnHTML);
                    return returnHTML;
                }
            }
        }).then((responseText) => {
            console.log(responseText);
        }).catch(err => {
            console.log("fetch error" + err);
        });
        //console.log('Here!');
    }

    render() {
        const changeWidth = this.buttonAnimated.interpolate({
            inputRange: [0, 1],
            outputRange: [DEVICE_WIDTH - MARGIN, MARGIN]
        });
        const changeScale = this.growAnimated.interpolate({
            inputRange: [0, 1],
            outputRange: [1, MARGIN]
        });

        return (
            <View style={styles.container}>
                <Animated.View style={{width: changeWidth}}>
                    <TouchableOpacity style={styles.button}
                                      onPress={this._onPress}
                                      activeOpacity={1}>
                        {this.state.isLoading ?
                            <Image source={spinner} style={styles.image}/>
                            :
                            <Text style={styles.text}>LOGIN</Text>
                        }
                    </TouchableOpacity>
                    <Animated.View style={[styles.circle, {transform: [{scale: changeScale}]}]}/>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        top: -95,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F035E0',
        height: MARGIN,
        borderRadius: 20,
        zIndex: 100,
    },
    circle: {
        height: MARGIN,
        width: MARGIN,
        marginTop: -MARGIN,
        borderWidth: 1,
        borderColor: '#F035E0',
        borderRadius: 100,
        alignSelf: 'center',
        zIndex: 99,
        backgroundColor: '#F035E0',
    },
    text: {
        color: 'white',
        backgroundColor: 'transparent',
    },
    image: {
        width: 24,
        height: 24,
    },
});
/*let formData = new FormData();
formData.append("csrfmiddlewaretoken",csrftokenValue);
formData.append("username", "admin");
formData.append("password", "xy382847");
formData.append("next", "/admin/");*/
