import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, cpf: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  updateProfile: (data: { name: string; phone?: string; cpf?: string }) => Promise<void>;
  addAddress: (address: any) => Promise<void>;
  removeAddress: (index: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with a safety timeout
    const getInitialSession = async () => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000); // 3 segundos de limite para o carregamento inicial

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeout);
        
        if (error) throw error;
        
        if (session) {
          fetchProfile(session.user.id, session.user.email || '');
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro ao obter sessão inicial:", err);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento Auth:", event);
      if (session) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    console.log("Buscando perfil para:", uid, email);
    setLoading(true);
    try {
      // 1. Tenta buscar na tabela de admins
      const { data: adminData, error: adminError } = await supabase
        .from('usuarios_admin')
        .select('*')
        .eq('id', uid)
        .single();

      if (adminData) {
        console.log("Admin detectado com sucesso:", adminData);
        setUser({ 
          uid, 
          email: adminData.email || email, 
          name: adminData.nome || adminData.email.split('@')[0], 
          role: 'admin',
          addresses: adminData.addresses || [],
          phone: adminData.telefone || adminData.phone || '',
          cpf: adminData.cpf || ''
        } as UserProfile);
        setLoading(false);
        return;
      }

      if (adminError && adminError.code !== 'PGRST116') {
        console.warn("Erro ao buscar na tabela usuarios_admin:", adminError.message);
      }

      // 2. Tenta buscar na tabela de clientes
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', uid)
        .single();

      if (clienteData) {
        console.log("Perfil carregado: Cliente detectado.", clienteData);
        
        // Buscar endereços da nova tabela
        const { data: addressesData } = await supabase
          .from('enderecos_clientes')
          .select('*')
          .eq('cliente_id', uid);

        setUser({ 
          uid, 
          ...clienteData, 
          name: clienteData.nome || clienteData.name || email.split('@')[0],
          phone: clienteData.telefone || clienteData.phone || clienteData.teleffone || '',
          cpf: clienteData.cpf || '',
          addresses: addressesData || [],
          role: 'customer' 
        } as UserProfile);
      } else {
        console.log("Perfil carregado: Usuário básico (padrão Cliente).");
        setUser({
          uid,
          email,
          name: email.split('@')[0],
          role: 'customer',
          addresses: []
        });
      }
    } catch (err) {
      console.error("Erro fatal ao carregar perfil:", err);
      // Mesmo com erro, permite o usuário entrar com perfil básico para não travar a UI
      setUser({ uid, email, name: email.split('@')[0], role: 'customer', addresses: [] });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { name: string; phone?: string; cpf?: string }) => {
    if (!user) return;
    const table = user.role === 'admin' ? 'usuarios_admin' : 'clientes';
    const updateData: any = { nome: data.name };
    if (data.phone !== undefined) updateData.telefone = data.phone;
    if (data.cpf !== undefined) updateData.cpf = data.cpf;

    try {
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', user.uid);
      
      if (error) {
        if (error.message.includes("column") && error.message.includes("does not exist")) {
          console.error("ERRO CRÍTICO: Uma das colunas (cpf, telefone ou nome) não existe na tabela " + table);
          throw new Error("Erro de configuração do banco de dados: Colunas faltando.");
        }
        throw error;
      }
      
      setUser(prev => prev ? { ...prev, name: data.name, phone: data.phone || prev.phone, cpf: data.cpf || prev.cpf } : null);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      throw err;
    }
  };

  const addAddress = async (address: any) => {
    if (!user) return;

    const dbAddress = {
      cliente_id: user.uid,
      cep: address.zipCode,
      rua: address.street,
      numero: address.number,
      complemento: address.complement,
      bairro: address.neighborhood,
      cidade: address.city,
      estado: address.state
    };

    try {
      const { data, error } = await supabase
        .from('enderecos_clientes')
        .insert([dbAddress])
        .select();
      
      if (error) throw error;
      
      const newAddress = data[0];
      setUser(prev => prev ? { ...prev, addresses: [...(prev.addresses || []), newAddress] } : null);
    } catch (err) {
      console.error("Erro ao adicionar endereço:", err);
      throw err;
    }
  };

  const removeAddress = async (index: number) => {
    if (!user) return;
    const addressToRemove = user.addresses[index];
    if (!addressToRemove?.id) return;

    try {
      const { error } = await supabase
        .from('enderecos_clientes')
        .delete()
        .eq('id', addressToRemove.id);
      
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, addresses: prev.addresses.filter((_, i) => i !== index) } : null);
    } catch (err) {
      console.error("Erro ao remover endereço:", err);
      throw err;
    }
  };

  const login = async (email: string, pass: string) => {
    console.log("Tentando login para:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        if (error.message === 'Email not confirmed') {
          console.error("ERRO: E-mail não confirmado. Verifique sua caixa de entrada no Supabase.");
        } else {
          console.error("Erro no Supabase Auth:", error.message);
        }
        throw error;
      }
      console.log("Login de autenticação bem-sucedido! ID do usuário:", data.user?.id);
    } catch (err) {
      console.error("Erro na função login:", err);
      throw err;
    }
  };

  const register = async (email: string, pass: string, name: string, cpf: string) => {
    console.log("Iniciando registro para:", email, name, cpf);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: name, cpf: cpf }
        }
      });
      
      if (error) {
        console.error("Erro no signUp do Supabase:", error.message);
        throw error;
      }

      if (data.user) {
        console.log("Usuário criado no Auth, inserindo na tabela clientes:", data.user.id);
        
        // Tentamos inserir na tabela 'clientes'
        const { error: profileError, data: profileData } = await supabase
          .from('clientes')
          .upsert({ 
            id: data.user.id, 
            email: email, 
            nome: name,
            cpf: cpf 
          })
          .select();
        
        if (profileError) {
          console.error("Erro ao inserir na tabela 'clientes':", profileError.message, profileError.details, profileError.hint);
          // Mesmo se falhar a inserção na tabela de clientes, o usuário foi criado no Auth
          // O fetchProfile cuidará do fallback para 'customer'
        } else {
          console.log("Registro na tabela 'clientes' concluído com sucesso:", profileData);
        }
      } else {
        console.warn("Usuário criado mas sem dados de retorno (pode exigir confirmação de email)");
      }
    } catch (err) {
      console.error("Erro fatal na função register:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, updateProfile, addAddress, removeAddress }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Iniciando MB Store...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
