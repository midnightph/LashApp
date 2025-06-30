import { Alert, Platform } from "react-native";

const gerarRecibo = (cliente, valor) => {
    if (cliente.atend) {
      Alert.alert('Atenção', 'O cliente está em atendimento, impossível gerar recibo!');
      return null;
    }
    return {
      nome: cliente.name,
      procedimento: cliente.proc,
      data: new Date().toLocaleDateString(),
      valor: `R$ ${valor.toFixed(2)}`,
      id: cliente.id,
    };
  };

  const gerarReciboPDF = async (cliente, valor) => {
    const recibo = gerarRecibo(cliente, valor);
    if (!recibo) return;
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
          .assinatura {
            margin-top: 50px;
            text-align: right;
            font-style: italic;
            color: #666;
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

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        Alert.alert('Recibo gerado', `Recibo salvo em:\n${uri}`);
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar ou compartilhar o PDF');
      console.error(error);
    }
  };