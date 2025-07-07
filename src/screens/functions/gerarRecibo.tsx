import { Alert, Platform } from "react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { database } from '@/src/firebaseConfig';
import { getAuth } from "firebase/auth";

export const gerarReciboPDF = async (cliente) => {
  if (cliente.atend) {
    Alert.alert('Atenção', 'O cliente está em atendimento, impossível gerar recibo!');
    return;
  }

  try {
    const user = getAuth().currentUser;
    const historicoRef = collection(database, 'user', user.uid, 'Clientes', cliente.id, 'Historico');
    const q = query(historicoRef, orderBy('data', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    const telefone = collection(database, 'user', user.uid, 'Clientes', cliente.id, 'telefone');

    if (querySnapshot.empty) {
      Alert.alert('Erro', 'Nenhum procedimento encontrado para esse cliente.');
      return;
    }

    const ultimo = querySnapshot.docs[0].data();
    const recibo = {
      nome: cliente.name,
      procedimento: ultimo.mapping,
      data: ultimo.data.toDate().toLocaleDateString(),
      valor: `R$ ${ultimo.valor}`,
      id: cliente.id,
    };

    const html = `
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background-color: #f9f9f9;
          }
          .recibo-container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0c0d0;
            padding-bottom: 10px;
          }
          p {
            font-size: 18px;
            margin: 15px 0;
            color: #444;
          }
          .info-label {
            font-weight: bold;
            color: #111;
          }
        </style>
      </head>
      <body>
        <div class="recibo-container">
          <h1>Recibo de Pagamento</h1>
          <p><span class="info-label">Nome:</span> ${recibo.nome}</p>
          <p><span class="info-label">Procedimento:</span> ${recibo.procedimento}</p>
          <p><span class="info-label">Data:</span> ${recibo.data}</p>
          <p><span class="info-label">Valor:</span> ${recibo.valor}</p>
        </div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'ios') {
      Alert.alert('Recibo gerado', `Recibo salvo em:\n${uri}`);
    }
    await Sharing.shareAsync(uri);

  } catch (error) {
    console.error(error);
    Alert.alert('Erro', 'Erro ao gerar ou compartilhar o PDF');
  }
};
