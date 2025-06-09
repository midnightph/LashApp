import { Linking } from 'react-native';

export const enviarLembretesEmLote = (clientes, numeroLash) => {
    if (!numeroLash) {
        console.error("Número do studio não definido");
        return;
    }

    const aniversarioClientes = clientes.filter(cliente => {
    const hoje = new Date();
    const [dia, mes] = cliente.dataNasc.split('/');

    return (
        hoje.getDate() === parseInt(dia, 10) &&
        hoje.getMonth() + 1 === parseInt(mes, 10)
    );
});


    const clientesParaLembrete = clientes.filter(cliente => {
        const diasPassados = calcularDiasPassados(cliente.dataUltimoProcedimento);
        return diasPassados >= 7 && cliente.statusRetoque === 'pendente';
    });

    if (clientesParaLembrete.length > 0) {
        
        let mensagem = `💎 *Lash App* 💎\nSegue a lista de clientes para reagendar hoje:\n\n`;

        clientesParaLembrete.forEach(cliente => {
            if (aniversarioClientes.some(c => c.id === cliente.id)) {
                const linkAni = `Parabéns ${cliente.nome}! Seu aniversário chegou!`;
                mensagem += `🎂 *${cliente.nome} - Aniversariante*🎂\n📩 Clique para enviar um lembrete especial: `;
            }
            const numeroFormatado = '55' + cliente.telefone.replace(/\D/g, '');
            const linkGoogle = 'Tem algum feedback? Segue nosso link do Google: https://www.google.com/search?client=opera-gx&q=studio+karen+beaity&sourceid=opera&ie=UTF-8&oe=UTF-8&lqi=ChNzdHVkaW8ga2FyZW4gYmVhdXR5SJ7XwvfQtoCACFofEAAQARACGAEYAiITc3R1ZGlvIGthcmVuIGJlYXV0eZIBCmJlYXV0aWNpYW6aASRDaGREU1VoTk1HOW5TMFZKUTBGblNVUndlR05sZW5aM1JSQUKqAVUQASoXIhNzdHVkaW8ga2FyZW4gYmVhdXR5KAwyHxABIhvWf5jtsIPsK9-_QMGJ91LXMd5HzC1yB1tG4qEyFxACIhNzdHVkaW8ga2FyZW4gYmVhdXR5-gEECAAQNQ#rlimm=9950206837800985157'
            const textoCliente = `Olá ${cliente.nome}! Sobre seu procedimento de ${cliente.procedimento}, como está?. \n\nGostaria de reagendar? \n\n ${linkGoogle}`;
            const linkWhats = `https://wa.me/${numeroFormatado}?text=${encodeURIComponent(textoCliente)}`;

            mensagem += `• ${cliente.nome} - ${cliente.procedimento}\n 📩 Clique para enviar: ${linkWhats}\n`;
            cliente.statusRetoque = 'enviado';
        });

        Linking.openURL(
            `https://wa.me/${numeroLash}?text=${encodeURIComponent(mensagem)}`
        );

        console.log("Lembretes enviados com sucesso!");
        
    }
    if (clientesParaLembrete.length === 0) {
        alert("Nenhum cliente para lembrete de agendamento.");
    }
};

const calcularDiasPassados = (data) => {
    return Math.floor((new Date() - new Date(data)) / (1000 * 60 * 60 * 24));
};
