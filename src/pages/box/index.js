import React, {Component} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import pt from 'date-fns/locale/pt';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import socket from 'socket.io-client';
import {formatDistanceToNow} from 'date-fns';

import api from '../../services/api';

import styles from './styles';

export default class box extends Component {
  state = {box: {}};

  subscribeToNewFiles = box => {
    const io = socket('https://file-mngr.herokuapp.com');

    io.emit('connectRoom', box);

    io.on('file', data => {
      this.setState({
        box: {...this.state.box, files: [data, ...this.state.box.files]},
      });
    });
  };

  async componentDidMount() {
    const box = await AsyncStorage.getItem('@file-mngr:box');
    this.subscribeToNewFiles(box);
    const response = await api.get(`boxes/${box}`);

    this.setState({box: response.data});
  }

  openFile = async file => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${file.title}`;
      await RNFS.downloadFile({
        fromUrl: file.url,
        toFile: filePath,
      });
      await FileViewer.open(filePath);
    } catch (error) {
      return;
    }
  };

  renderItem = ({item}) => (
    <TouchableOpacity onPress={() => this.openFile(item)} style={styles.file}>
      <View style={styles.fileInfo}>
        <Icon name="insert-drive-file" size={24} color={'#A5cfff'} />
        <Text style={styles.fileTitle}>{item.title}</Text>
      </View>
      <Text style={styles.fileDate}>
        Há{' '}
        {formatDistanceToNow(new Date(item.createdAt), {
          locale: pt,
        })}
      </Text>
    </TouchableOpacity>
  );

  handleUpload = () => {
    ImagePicker.launchImageLibrary({}, async upload => {
      if (upload.error) {
        console.log('Image picker error ');
      } else if (upload.didCancel) {
        console.log('Cancelled by user');
      } else {
        const data = new FormData();

        const [prefix, suffix] = upload.fileName.split('.');
        const ext = suffix.toLocaleLowerCase() === 'heic' ? 'jpg' : suffix;

        data.append('file', {
          uri: upload.uri,
          type: upload.type,
          name: `${prefix}.${ext}`,
        });

        api.post(`boxes/${this.state.box._id}/files`, data);
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.boxTitle}>{this.state.box.title}</Text>
        <FlatList
          style={styles.list}
          data={this.state.box.files}
          keyExtractor={file => file._id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={this.renderItem}
        />

        <TouchableOpacity style={styles.fab} onPress={this.handleUpload}>
          <Icon name="cloud-upload" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
}
