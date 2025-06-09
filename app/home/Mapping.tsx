import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EnviarFoto() {
  const [imagem, setImagem] = useState(null);

  const escolherDaGaleria = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  };

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão negada', 'Você precisa permitir acesso à câmera.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 20, backgroundColor: '#FFF2F5' }}>
      <Button title="Escolher da galeria" onPress={escolherDaGaleria} />
      <Button title="Tirar foto" onPress={tirarFoto} />

      {imagem && (
        <Image
          source={{ uri: imagem }}
          style={{ width: 300, height: 300, marginTop: 20 }}
        />
      )}
    </View>
  );
}
