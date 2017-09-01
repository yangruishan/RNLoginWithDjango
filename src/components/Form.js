import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    KeyboardAvoidingView,
    TouchableOpacity,
    Image,
} from 'react-native';

import UserInput from './UserInput';

import usernameImg from '../images/username.png';
import passwordImg from '../images/password.png';
import eyeImg from '../images/eye_black.png';

export default class Form extends Component {
    constructor() {
        super();
        this.state = {
            showPass: true,
            press: false,
            username: '',
            password: '',
        };
        this.showPass = this.showPass.bind(this);
        this.importItem = this.importItem.bind(this);//事件或者箭头函数需要执行bind操作。
    }

    importItem(item, value){
        if (value === "") return;
        console.log(item + '   ' + value);
        this.context.changeItem(item, value);
    }

    showPass() {
        this.state.press === false ? this.setState({showPass: false, press: true}) : this.setState({
            showPass: true,
            press: false
        });
    }

    render() {
        return (
            <KeyboardAvoidingView behavior='padding'
                                  style={styles.container}>
                <UserInput source={usernameImg}
                           placeholder='用户名'
                           autoCapitalize={'none'}
                           onEndEditing={(event)=> this.importItem('U', event.nativeEvent.text)}
                           //onChangeText={(text)=> this.importItem('U', text)}
                            returnKeyType={'next'}/>
                <UserInput source={passwordImg}
                           placeholder='密码'
                           autoCapitalize={'none'}
                           onEndEditing={(event)=> this.importItem('P', event.nativeEvent.text)}
                           //onChangeText={(text)=>this.importItem('P', text)}
                           returnKeyType={'done'}
                           secureTextEntry={this.state.showPass}/>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.btnEye}
                    onPress={this.showPass}
                >
                    <Image source={eyeImg} style={styles.iconEye}/>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    btnEye: {
        position: 'absolute',
        top: 62,
        right: 30,
    },
    iconEye: {
        width: 25,
        height: 25,
        tintColor: 'rgba(0,0,0,0.2)',
    },
});

Form.contextTypes={
    currentUserName: PropTypes.string,
    currentPassword: PropTypes.string,
    changeItem: PropTypes.any,
};
