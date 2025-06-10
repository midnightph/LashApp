import React, { createContext, useState, useContext, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { collection, getDocs } from 'firebase/firestore';
import { database } from '@/src/firebaseConfig';
import { set } from 'date-fns';

const ClientesContext = createContext();

export function ClientesProvider({ children }) {
    const [clientes, setClientes] = useState([]);
    
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
    useEffect(() => {
        getInfo();
    }, [])
    const getInfo = async () => {
        const querySnapshot = await getDocs(collection(database, 'Cliente'));
        const clientesArray: any[] = [];

        querySnapshot.forEach((doc) => {
            clientesArray.push({ id: doc.id, ...doc.data() });
        });

        setClienteInf(clientesArray[1]);
        console.log(clienteInf);
    }

    const carregarClientes = () => {
        const data = [
            {
                id: '1',
                nome: 'João Carlos',
                dataNasc: '05/05/2025',
                dataRegistro: new Date(2025, 4, 5),
                procedimento: 'Lash Lift',
                dataUltimoProcedimento: new Date(2025, 4, 6),
                telefone: '4196210421',
                statusRetoque: 'pendente',
                atendimento: false,
                valor: 0,
                observacoes: '',
                foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
                historico : [
                    {
                        id: '1',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '2',
                        procedimento: 'Papinha',
                        data: new Date(2025, 4, 6),
                        valor: 10000,
                        observacoes: ''
                    }
                ]
            },
            {
                id: '2',
                nome: 'Maria',
                dataNasc: '06/05/2025',
                dataRegistro: new Date(2025, 4, 6),
                procedimento: 'Volume Russo',
                dataUltimoProcedimento: new Date(2025, 4, 6),
                telefone: '4187753808',
                statusRetoque: 'pendente',
                atendimento: false,
                valor: 0,
                observacoes: '',
                foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
                historico : [
                    {
                        id: '1',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '2',
                        procedimento: 'Papinha',
                        data: new Date(2025, 4, 6),
                        valor: 10000,
                        observacoes: ''
                    },
                    {
                        id: '3',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '4',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    }
                ]
            },
            {
                id: '3',
                nome: 'Joana',
                dataNasc: '07/05/2025',
                dataRegistro: new Date(2025, 4, 7),
                procedimento: 'Fio a Fio',
                dataUltimoProcedimento: new Date(2025, 4, 5),
                telefone: '41998780288',
                statusRetoque: 'pendente',
                atendimento: false,
                valor: 0,
                observacoes: '',
                foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
                historico : [
                    {
                        id: '1',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '2',
                        procedimento: 'Papinha',
                        data: new Date(2025, 4, 6),
                        valor: 10000,
                        observacoes: ''
                    },
                    {
                        id: '3',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '4',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    }
                ]
            },
            { 
                id: '4',
                nome: 'Pedorahidhas',
                dataNasc: '28/05/2025',
                dataRegistro: new Date(2025, 4, 7),
                procedimento: 'Fio a Fio',
                dataUltimoProcedimento: new Date(2025, 4, 5),
                telefone: '41998780288',
                statusRetoque: 'pendente',
                atendimento: false,
                valor: 0,
                observacoes: '',
                foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
                historico : [
                    {
                        id: '1',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '2',
                        procedimento: 'Papinha',
                        data: new Date(2025, 4, 6),
                        valor: 10000,
                        observacoes: ''
                    },
                    {
                        id: '3',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    },
                    {
                        id: '4',
                        procedimento: 'Lash Lift',
                        data: new Date(2025, 4, 6),
                        valor: 0,
                        observacoes: ''
                    }
                ]
            },
            clienteInf
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