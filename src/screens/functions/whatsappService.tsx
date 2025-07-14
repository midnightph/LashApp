import { Linking } from 'react-native';
import { Timestamp } from 'firebase/firestore';

export const enviarLembretesEmLote = (clientes, numeroLash) => {
  if (!numeroLash) {
    console.error("Número do studio não definido");
    return;
  }

  const hoje = new Date();

  const aniversarioClientes = clientes.filter(cliente => {
    if (!(cliente.dataNasc instanceof Timestamp)) return false;

    const data = cliente.dataNasc.toDate();
    return (
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth()
    );
  });

  const clientesParaLembrete = clientes.filter(cliente => {
    if (!(cliente.dataUltimoProcedimento instanceof Timestamp)) return false;

    const diasPassados = calcularDiasPassados(cliente.dataUltimoProcedimento);
    return diasPassados >= 7 && cliente.statusRetoque === 'pendente';
  });

  if (clientesParaLembrete.length > 0) {
    let mensagem = `💎 *Lash App* 💎\nSegue a lista de clientes para reagendar hoje:\n\n`;

    clientesParaLembrete.forEach(cliente => {
      const numeroFormatado = '55' + cliente.telefone.replace(/\D/g, '');

      if (aniversarioClientes.some(c => c.id === cliente.id)) {
        mensagem += `🎂 *${cliente.nome} - Aniversariante* 🎂\n`;
      }

      const linkGoogle = 'https://www.google.com/search?client=opera-gx&q=studio+karen+beaity';
      const textoCliente = `Olá ${cliente.nome}! Sobre seu procedimento de ${cliente.procedimento}, como está?. \n\nGostaria de reagendar? \n\n ${linkGoogle}`;
      const linkWhats = `https://wa.me/${numeroFormatado}?text=${encodeURIComponent(textoCliente)}`;

      mensagem += `• ${cliente.nome} - ${cliente.procedimento}\n📩 Clique para enviar: ${linkWhats}\n`;
      cliente.statusRetoque = 'enviado';
    });

    Linking.openURL(`https://wa.me/${numeroLash}?text=${encodeURIComponent(mensagem)}`);
    console.log("Lembretes enviados com sucesso!");
  } else {
    alert("Nenhum cliente para lembrete de agendamento.");
  }
};

const calcularDiasPassados = (timestamp) => {
  if (!(timestamp instanceof Timestamp)) return 0;
  const data = timestamp.toDate();
  const agora = new Date();
  const diff = Math.floor((agora - data) / (1000 * 60 * 60 * 24));
  return diff;
};
