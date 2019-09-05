import React, {Component} from 'react';
import {View, Text, Image, TextInput, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services/api';

import styles from './styles';
import logo from '../../assets/logo.png';

export default class main extends Component {
  state = {
    newBox: '',
  };

  async componentDidMount() {}

  handleSignIn = async () => {
    const response = await api.post('boxes', {
      title: this.state.newBox,
    });

    await AsyncStorage.setItem('@file-mngr:box', response.data._id);

    this.props.navigation.navigate('box');
  };

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo}></Image>
        <TextInput
          style={styles.input}
          placeholder="Crie um box"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          value={this.state.newBox}
          onChangeText={text => this.setState({newBox: text})}
        />

        <TouchableOpacity onPress={this.handleSignIn} style={styles.button}>
          <Text style={styles.buttonText}>Criar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
