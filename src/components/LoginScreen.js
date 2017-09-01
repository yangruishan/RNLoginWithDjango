import React, { Component, PropTypes } from 'react';
import Logo from './Logo';
import Form from './Form';
import Wallpaper from './Wallpaper';
import ButtonSubmit from './ButtonSubmit';
import SignupSection from './SignupSection';

export default class LoginScreen extends Component {
    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
        };
        //子组件调用父组件的事件或者箭头函数需要执行bind操作。
        this.changeItem = this.changeItem.bind(this);
    }

    getChildContext(){
        return {
            currentUserName: this.state.username,
            currentPassword: this.state.password,
            changeItem: this.changeItem,
        };
    }

    changeItem(key, keyValue){
        //console.log("value: "+keyValue);
        if (key === 'U'){
            this.setState({username: keyValue});
        }
        if (key === 'P'){
            this.setState({password: keyValue});
        }
    }

    render() {
		return (
			<Wallpaper>
				<Logo />
				<Form />
				<SignupSection/>
				<ButtonSubmit/>
			</Wallpaper>
		);
	}
};

//定义子组件可以调用的属性或者事件。
LoginScreen.childContextTypes = {
    //属性，通过Form.js的UserInput组件的事件调用changItem事件来更新
    currentUserName: PropTypes.string,
    currentPassword: PropTypes.string,
    //事件，在Form.js的UserInput组件中调用
    changeItem: PropTypes.any,
};

