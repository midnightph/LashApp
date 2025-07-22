import React, { createContext, useState, useContext, useEffect } from 'react';
import { getDocs, collection, doc } from 'firebase/firestore';
import { database } from '@/src/firebaseConfig';
import { getAuth } from 'firebase/auth';

const ClientesContext = createContext();

export function ClientesProvider({ children }) {

    interface Cliente {
    id: string;
    nome: string;
    foto: string;
    atend: boolean;
    dataRegistro: Date;
    dataUltimoProcedimento: string | null;
    valor: string | null;
    procedimento: string | null;
    observacoes: string | null;
    historico: {
        id: string;
        procedimento: string | null;
        data: string | null;
        valor: string | null;
        observacoes: string | null;
    }[];
    dataNasc?: string;
}


    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteInf, setClienteInf] = useState(null);

    const adicionarCliente = (novoCliente) => {
        const clienteComRegistro = {
            ...novoCliente,
            dataRegistro: new Date(),
            id: Date.now().toString(),
            atendimento: false,
            dataUltimoProcedimento: null,
            valor: null,
            procedimento: null,
            observacoes: null,
            foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
            historico: []
        };
        setClientes(prev => [...prev, clienteComRegistro]);
    };

    const atualizarUltimosClientes = () => {
        return [...clientes]
            .sort((a, b) => b.dataRegistro - a.dataRegistro)
            .slice(0, 3);
    };

    const atualizarFoto = (id, foto) => {
        setClientes(prev =>
            prev.map(cliente =>
                cliente.id === id ? { ...cliente, foto } : cliente
            )
        );
    };

    const atualizarAtendimento = (id, novoStatus, data, valor, procedimento, observacoes) => {
        setClientes(prev =>
            prev.map(cliente =>
                cliente.id === id
                    ? {
                        ...cliente,
                        statusProc: novoStatus,
                        dataUltimoProcedimento: data,
                        valor,
                        procedimento,
                        observacoes,
                        historico: [
                            ...cliente.historico,
                            { id: Date.now().toString(), procedimento, data, valor, observacoes }
                        ]
                    }
                    : cliente
            )
        );
    };

    const getInfo = async () => {
    const user = getAuth().currentUser;
    if (!user) return;

    const userId = user.uid;
    
    setClienteInf(userId);

    const clienteRef = collection(database, 'user', userId, 'Clientes');
    const clientesSnapshot = await getDocs(clienteRef);
    const clientesDoUsuario = [];

    clientesSnapshot.forEach(doc => {
        const data = doc.data();
        const { id: _, ...rest } = data;
        clientesDoUsuario.push({ 
            id: doc.id,
            ...rest,
            dataNasc: data.dataNasc,
            foto: data.foto || 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445'
        });
    });
    setClientes(clientesDoUsuario);
};

    const carregarClientes = async () => {
        await getInfo();
    };
    const limparClientes = () => {
  setClientes([]);
  setClienteInf(null);
};

    return (
        <ClientesContext.Provider value={{
            clienteInf,
            getInfo,
            clientes,
            adicionarCliente,
            carregarClientes,
            atualizarUltimosClientes,
            atualizarAtendimento,
            atualizarFoto,
            limparClientes
        }}>
            {children}
        </ClientesContext.Provider>
    );
}

export function useClientes() {
    const context = useContext(ClientesContext);
    if (!context) {
        throw new Error('useClientes deve ser usado dentro de um ClientesProvider');
    }
    return context;
}


