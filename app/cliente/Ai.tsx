import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { updateDoc, doc, increment, getDoc, arrayUnion } from 'firebase/firestore';
import { MotiImage, MotiScrollView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, ImageBackground, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function AI({ route, navigation }) {
  const { clienteId } = route.params;
  const [image, setImage] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mappingArray, setMappingArray] = useState(null);

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
    setMappingArray(null);

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const user = getAuth().currentUser;

    function formatDate(date) {
      // só ano-mês-dia para comparar datas (sem hora)
      return date.toISOString().split('T')[0];
    }


    async function updateAiUses() {
      const user = getAuth().currentUser;
      if (!user) return false;

      const userDocRef = doc(database, 'user', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // documento não existe (raro)
        await updateDoc(userDocRef, {
          IA: [{ date: formatDate(new Date()), uses: 1 }],
        });
        return true;
      }

      const data = docSnap.data();
      const IAArray = data.IA || [];

      const todayStr = formatDate(new Date());
      const todayEntryIndex = IAArray.findIndex(entry => entry.date === todayStr);

      if (todayEntryIndex === -1) {
        // não tem registro para hoje, adiciona novo objeto
        await updateDoc(userDocRef, {
          IA: arrayUnion({ date: todayStr, uses: 1 }),
        });
        return true;
      }

      const todayEntry = IAArray[todayEntryIndex];

      if (todayEntry.uses >= 4) {
        // já usou 4 vezes hoje, bloqueia uso
        return false;
      }

      // Atualizar o uso para hoje (incrementar 1)
      // Como Firestore não permite atualizar item dentro do array diretamente,
      // temos que regravar o array inteiro com o uso atualizado.

      const updatedIAArray = [...IAArray];
      updatedIAArray[todayEntryIndex] = {
        date: todayStr,
        uses: todayEntry.uses + 1,
      };

      await updateDoc(userDocRef, {
        IA: updatedIAArray,
      });

      return true;
    }

    try {
      const canUse = await updateAiUses();
      if (!canUse) {
        return Toast.show({
          type: 'error',
          text1: 'Limite de uso diário atingido!',
          position: 'bottom',
        });
      }
      const res = await fetch('https://lash-mapping-326380062160.us-central1.run.app/detect', {
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

        if (Array.isArray(json.mapping)) {
          setMappingArray(json.mapping);
        } else {
          setMappingArray(null);
        }
      }
    } catch (err) {
      setLandmarks('Erro ao conectar com o servidor.');
    }
    setLoading(false);
  }

  async function takeShot() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a câmera negada!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: false });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      sendImage(result.assets[0].uri);
    }
  }

  return (
    <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, alignItems: 'center', flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={35} color={colors.primary} />
          </TouchableOpacity>
           <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.secondary }}>IA (Somente para cílios)</Text>
        </View>
        <MotiScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 1000 }}
        >
          {image && (
            <>
              <Text style={{ marginTop: 20, fontWeight: 'bold', color: colors.secondary, fontSize: 20 }}>
                Imagem selecionada:
              </Text>
              <MotiImage
                source={{ uri: image }}
                style={{ width: 250, height: 250, marginTop: 10, borderRadius: 200 }}
                from={{ scale: 0, translateX: -100 }}
                animate={{ scale: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 1000 }}
              />
            </>
          )}

          {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

          {mappingArray && (
            <View style={{ marginTop: 20, paddingHorizontal: 10, alignItems: 'center', width: '100%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10, color: colors.secondary }}>
                Resposta IA:
              </Text>
              {mappingArray.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    marginBottom: 15,
                    backgroundColor: '#f0f0f0',
                    padding: 20,
                    borderRadius: 20,
                  }}
                >
                  <Text>Mapping: {item.mapping}</Text>
                  <Text>Tamanho mínimo: {item.tamanho_minimo}</Text>
                  <Text>Tamanho máximo: {item.tamanho_maximo}</Text>
                </View>
              ))}
            </View>
          )}

          {!mappingArray && mapping && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: 'red' }}>Erro ao interpretar o resultado do GPT.</Text>
              <Text>{mapping}</Text>
            </View>
          )}

          <FormButton title="Escolher imagem" onPress={pickImage} maxWidth={300} secondary />
          <FormButton title="Tirar foto" onPress={takeShot} maxWidth={300} />
        </MotiScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
