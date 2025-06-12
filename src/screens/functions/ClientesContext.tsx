import React, { createContext, useState, useContext, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { collection, doc, getDocs } from 'firebase/firestore';
import { database } from '@/src/firebaseConfig';
import { set } from 'date-fns';

const ClientesContext = createContext();

export function ClientesProvider({ children }) {
    const [clientes, setClientes] = useState<any[]>([]);
    
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
        return [...clientes].sort((a,b) => b.dataRegistro - a.dataRegistro).slice(0, 3);
    };

    const atualizarFoto = (ids, foto) => {
        setClientes((prev) => {
            const atualizados = prev.map((cliente) =>
                cliente.id === ids
                    ? { ...cliente, foto: foto }
                    : cliente
            );
            return atualizados;
        })
    }

    const atualizarAtendimento = (id, novoStatus, data, valor, procedimento, observacoes) => {
    setClientes((prev) => {
        const atualizados = prev.map((cliente) =>
            cliente.id === id
                ? { ...cliente, atendimento: novoStatus, dataUltimoProcedimento: data, valor: valor, procedimento: procedimento, observacoes: observacoes, historico: [...cliente.historico, { id: Date.now().toString(), procedimento: procedimento, data: data, valor: valor, observacoes: observacoes }] }
                : cliente
        );  
        return atualizados;
    });
};

    const db = getDatabase()
    const [clienteInf, setClienteInf] = useState([]);
    
    const getInfo = async () => {
        const querySnapshot = await getDocs(collection(database, 'user'));
        const clientesArray: any[] = [];

        querySnapshot.forEach((doc) => {
            clientesArray.push({ id: doc.id, ...doc.data() });
        });

        const userId = clientesArray[0].id
        setClienteInf(userId);

        const clienteRef = collection(doc(database, 'user', userId), 'Clientes');
        const clientesSnapshot = await getDocs(clienteRef);
        const clientesDoUsuario: any[] = [];

        clientesSnapshot.forEach((doc) => {
        clientesDoUsuario.push({ id: doc.id, ...doc.data() });
    });

    // você pode agora setar isso no estado:
    setClientes(clientesDoUsuario);
    }

    const carregarClientes = () => {

        if(!clientes.length || !clientes[0]) {
            console.warn('Clientes ainda não carregados');
            return;
        }

        useEffect(() => {
        getInfo();
    }, [])

        const cliente = clientes[0];
        const data = [
            {
                id: cliente.id,
                nome: cliente.nome,
                dataNasc: '05/05/2025',
                dataRegistro: new Date(2025, 4, 5),
                procedimento: cliente.proc,
                dataUltimoProcedimento: new Date(2025, 4, 6),
                telefone: cliente.telefone,
                statusRetoque: cliente.statusRetoque,
                atendimento: cliente.atend,
                observacoes: '',
                foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
                historico : cliente.historico
            },
        ];
        setClientes(data);
    };

    return (
        <ClientesContext.Provider value={{ clienteInf, getInfo, clientes, adicionarCliente, carregarClientes, atualizarUltimosClientes, atualizarAtendimento, atualizarFoto }}>
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