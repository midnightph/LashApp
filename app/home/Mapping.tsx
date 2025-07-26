import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { OpenAI } from 'openai';

export default function EnviarFoto() {
  const [imagem, setImagem] = useState(null);


  const openai = new OpenAI({
    apiKey: "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",
  });

  

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
    const completion = openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
      {"role": "user", "content": "write a haiku about ai"},
    ],
  });

  completion.then((result) => console.log(result.choices[0].message));

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
