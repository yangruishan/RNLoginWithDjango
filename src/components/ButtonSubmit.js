import React, {Component, PropTypes} from 'react';
import Dimensions from 'Dimensions';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    Animated,
    Easing,
    Image,
    View,
    BackHandler,
    ToastAndroid,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import CookieManager from 'react-native-cookies';

import spinner from '../images/loading.gif';

const DEVICE_WIDTH = Dimensions.get('window').width;
const MARGIN = 40;

export default class ButtonSubmit extends Component {
    constructor() {
        super();

        this.state = {
            isLoading: false,
            csrftoken: null,//Django每次网络请求的csrftoken
            //sessionid: null,//Django授权用户登录后生成的sessionid
            isAuthenticated: false,
            userName: '',
            password: '',
        };

        this.buttonAnimated = new Animated.Value(0);
        this.growAnimated = new Animated.Value(0);
        this._onPress = this._onPress.bind(this);
    }

    componentWillMount() {
        //console.log('Mount!');
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount() {//仅在使用Android手机的Back键时调用该函数
        //console.log('Unmount!');
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    onBackAndroid = () => {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            //console.log('Unmount!');
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

        let loginName = this.context.currentUserName;
        let loginPassword =this.context.currentPassword;

        if (loginName.trim() === ''  ){
            ToastAndroid.show('用户名不能为空', ToastAndroid.SHORT);
            return;
        }else{
            this.setState({userName: loginName});
        }

        if (loginPassword.trim() === '' ){
            ToastAndroid.show('密码不能为空', ToastAndroid.SHORT);
            return;
        }else{
            this.setState({password: loginPassword});
        }

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

        /*setTimeout(() => {
            Actions.secondScreen();
            this.setState({isLoading: false});
            this.buttonAnimated.setValue(0);
            this.growAnimated.setValue(0);
        }, 1);//2300*/
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

    authenticatedSucess() {
        this.setState({isAuthenticated: true});
        this.setState({isLoading: false});
        this.buttonAnimated.setValue(0);
        this.growAnimated.setValue(0);
        Actions.secondScreen();
    }

    authenticatedFail() {
        this.setState({isAuthenticated: false});
        this.setState({isLoading: false});
        this.buttonAnimated.setValue(0);
        this.growAnimated.setValue(0);
        //Actions.loginScreen();
    }

    loginAuthenticate() {
        let serverIP = '192.168.1.122';
        let serverPort = '8000';
        let urlAdmin = 'http://' + serverIP + ':' + serverPort + '/admin/';
        let urlLogin = 'http://' + serverIP + ':' + serverPort + '/admin/login/?next=/admin/';
        //let authenticated = false;
        let adminCookie = null;
        let csrftokenValue = null;

        fetch(urlAdmin, {
            method: 'GET',
            credentials: 'omit',
            //headers: {},
        }).then((response) => {            //    console.log(response.headers.get('Content-Type'));
            //console.log(response);
            if (response.ok && response.status === 200) { //fetch /admin/成功。接下来需要判断是否是否已经通过/admin/login/?next=/admin/验证过？Django后台是二次验证服务。
                if (response.headers.has('set-cookie')) { //fetch /admin/成功。由于是首次登录，返回的headers中有'set-cookie'字段
                    adminCookie = response.headers.get('set-cookie');
                    console.log(adminCookie);
                    csrftokenValue = adminCookie.split(";")[0].split("=")[1];
                    //console.log(csrftokenValue);

                    if (csrftokenValue !== null) {
                        this.setState({csrftoken: csrftokenValue});

                        let formData = 'csrfmiddlewaretoken=' + csrftokenValue;
                        formData = formData + '&username='+ this.state.userName;
                        formData = formData +'&password='+ this.state.password;
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
                            if (response.ok && response.status === 200) {
                                let loginCookie = response.headers.get('set-cookie');
                                if (loginCookie === null) { //认证成功，返回的header中不含有'set-cookie'并重定向到用户管理页面。
                                    ToastAndroid.show('用户名、密码 验证成功！！！', ToastAndroid.SHORT);
                                    this.authenticatedSucess();
                                } else { //如果用户名、密码认证不通过，返回的header中含有'set-cookie'并重定向到用户登录页面。
                                    ToastAndroid.show('用户名或者密码错误，请重试！！！', ToastAndroid.LONG);
                                    this.authenticatedFail();
                                }
                            } else { //fetch /admin/login/?next=/admin/ 失败。由于网络或者后台服务问题导致的。
                                ToastAndroid.show('fetch /admin/login/?next=/admin/ 失败，未知错误！！！', ToastAndroid.LONG);
                                this.authenticatedFail();
                            }
                            //console.log(authenticated);
                        }).catch(err => { //二次验证过程中出现错误。
                            ToastAndroid.show('fetch /admin/login/?next=/admin/ ' + err, ToastAndroid.LONG);
                            this.authenticatedFail();
                        })
                    }
                } else { //fetch /admin/成功。由于曾经登录过，客户端中有认证cookie，此时请求/admin/时返回的headers中不再有'set-cookie'字段。
                    ToastAndroid.show('session验证成功！！！', ToastAndroid.SHORT);
                    this.authenticatedSucess();
                }
            } else { //fetch /admin/失败。由于网络或者后台服务问题导致的。
                ToastAndroid.show('fetch /admin/ 失败，未知错误！！！', ToastAndroid.LONG);
                this.authenticatedFail();
            }
        }).catch(err => { //网络错误，无法访问服务器后台/admin/资源进行用户验证。
            //this.buttonAnimated.resetAnimation();
            ToastAndroid.show('fetch /admin/ 错误  ' + err, ToastAndroid.LONG);
            //this.buttonAnimated.stopAnimation();
            this.authenticatedFail();
        });
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

ButtonSubmit.contextTypes={
    currentUserName: PropTypes.string,
    currentPassword: PropTypes.string,
};

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
