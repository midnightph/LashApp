import colors from '@/src/colors';
import FormButton from '@/src/FormButton';
import * as ImagePicker from 'expo-image-picker';
import { MotiImage, MotiScrollView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, ImageBackground, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AI({ route }) {
  const { clienteId } = route.params;
  const [image, setImage] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a galeria negada!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, base64: false });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      sendImage(result.assets[0].uri);
    }
  }

  async function sendImage(uri) {
    setLoading(true);
    setLandmarks(null);
    setMapping(null);
    setProcessedImageUrl(null);

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const res = await fetch('http://192.168.2.123:3000/detect', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.error) {
        setLandmarks(json.error);
      } else {
        setLandmarks(json.eyeLandmarks);
        setMapping(json.mapping);
        setProcessedImageUrl(json.imageUrl);
      }
    } catch (err) {
      setLandmarks('Erro ao conectar com o servidor.');
    }

    setLoading(false);
  }

  async function takeShot() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a camera negada!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: false });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      sendImage(result.assets[0].uri);
    }
  }

  return (
    <ImageBackground source={require('../images/background.png')} style={{flex: 1}}>
    <SafeAreaView style={{ flex: 1 }}>
      <MotiScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }}>
        
        {image && (
          <>
            <Text style={{ marginTop: 20, fontWeight: 'bold', color: colors.secondary, fontSize: 20 }}>Imagem selecionada:</Text>
            <MotiImage source={{ uri: image }} style={{ width: 250, height: 250, marginTop: 10, borderRadius: 200 }} from={{scale: 0, translateX: -100}} animate={{scale: 1, translateX: 0}} transition={{type: 'timing', duration: 1000}}/>
          </>
        )}

        {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

        {mapping && (
          <View style={{ marginTop: 20, paddingHorizontal: 10, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10, color: colors.secondary }}>Resultado GPT:</Text>
            <Text style={{ fontSize: 16, paddingBottom: 20, color: colors.textDark }}>{mapping}</Text>
          </View>
        )}

        <FormButton title="Escolher imagem" onPress={pickImage} maxWidth={300}/>
        <FormButton title="Tirar foto" onPress={takeShot} maxWidth={300} secondary/>

      </MotiScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}
