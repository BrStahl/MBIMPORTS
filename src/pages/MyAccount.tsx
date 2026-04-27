import React from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Settings } from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, clientes(*, enderecos_clientes(*)), itens_pedidos(*)')
          .eq('cliente_id', user.uid)
          .order('criado_em', { ascending: false });
          
        if (error) {
          console.error(error);
          return;
        }
        
        console.log("CLIENT ORDERS:", data);
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const handleConfirmDelivery = async (orderId: string) => {
    console.log('Iniciando handleConfirmDelivery para ID:', orderId);
    // Removendo confirm para teste de clique direto
    
    setUpdatingId(orderId);
    try {
      console.log('Executando update no Supabase...');
      const { data, error } = await supabase
        .from('pedidos')
        .update({ status: 'entregue' })
        .eq('id', orderId)
        .select();
        
      if (error) {
        console.error('Erro retornado pelo Supabase (confirm delivery):', error);
        throw error;
      }
      
      console.log('Dados retornados do update:', data);
      
      if (data && data.length > 0) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'entregue' } : o));
        toast.success('Entrega confirmada com sucesso!');
      } else {
        console.warn('Update executado mas zero linhas afetadas. Verifique se o ID existe e se o RLS permite update pelo cliente.');
        toast.error('O pedido não pôde ser atualizado. Verifique se você é o dono deste pedido.');
      }
    } catch (err: any) {
      console.error('Erro capturado no catch de confirmação:', err);
      toast.error('Erro ao confirmar entrega: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-black uppercase tracking-tight mb-8">Meus Pedidos</h2>
      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Você ainda não realizou nenhum pedido.</p>
          <Link to="/catalogo" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gold transition-all">Ir para a Loja</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                    Realizado em {order.criado_em ? new Date(order.criado_em).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="font-bold text-sm">Nº do Pedido: <span className="font-black text-xs text-gold">#{order.Num_Ped || order.id.split('-')[0]}</span></span>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      ['enviado', 'entregue'].includes(order.status) 
                        ? 'bg-green-100 text-green-700' 
                        : order.status === 'em_separacao'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status === 'em_separacao' ? 'Em Separação' : (order.status || 'recebido')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.itens_pedidos && order.itens_pedidos.length > 0 ? (
                  order.itens_pedidos.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="font-bold uppercase text-[10px]">
                        {item.quantidade || 1}x {item.nome_produto}
                        {item.cor && ` - ${item.cor}`}
                        {item.tamanho && ` (Tam: ${item.tamanho})`}
                      </span>
                      <span className="font-black">R$ {((item.preco_unitario || 0) * (item.quantidade || 1)).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))
                ) : order.itens && Array.isArray(order.itens) ? (
                   order.itens.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="font-bold uppercase text-[10px]">
                        {item.quantity || 1}x {item.name}
                        {item.color && ` - ${item.color}`}
                        {item.size && ` (Tam: ${item.size})`}
                      </span>
                      <span className="font-black">R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Detalhes não listados.</p>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</span>
                   <span className="font-black text-lg block">R$ {(order.valor_total || order.total || 0).toFixed(2).replace('.', ',')}</span>
                </div>
                {order.codigo_rastreio && (
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold block text-[8px]">Código de Rastreio</span>
                    <span className="font-mono text-[10px] font-bold bg-gold/10 text-gold px-2 py-1 rounded select-all cursor-pointer" title="Clique para copiar">{order.codigo_rastreio}</span>
                  </div>
                )}
              </div>
              
              {order.status === 'enviado' && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('CLIQUE NO BOTAO DETECTADO!', order.id);
                    handleConfirmDelivery(order.id);
                  }}
                  disabled={updatingId === order.id}
                  className={`w-full mt-6 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-[0.98] border-2 border-transparent transition-all flex items-center justify-center gap-2 ${
                    updatingId === order.id 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-green-600 hover:border-green-400'
                  }`}
                >
                  {updatingId === order.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    'Recebi meu Produto'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UserData = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = React.useState(user?.name || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [cpf, setCpf] = React.useState(user?.cpf || '');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ type: '', text: '' });

  const handleUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile({ name, phone, cpf });
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao atualizar dados: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-black text-black uppercase tracking-tight mb-8">Meus Dados</h2>
      
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Nome Completo</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">CPF</label>
          <input 
            type="text" 
            placeholder="000.000.000-00" 
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">E-mail</label>
          <input type="email" defaultValue={user?.email} disabled className="w-full bg-gray-100 border border-transparent rounded-xl p-4 font-bold text-sm text-gray-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Telefone</label>
          <input 
            type="text" 
            placeholder="(00) 00000-0000" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all" 
          />
        </div>
      </div>
      <button 
        onClick={handleUpdate}
        disabled={loading}
        className="bg-black text-white px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Salvar Alterações'}
      </button>
    </div>
  );
};

const Addresses = () => {
  const { user, addAddress, removeAddress } = useAuth();
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Form State
  const [formData, setFormData] = React.useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addAddress(formData);
      setShowForm(false);
      setFormData({ street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' });
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar endereço. Verifique as permissões.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await removeAddress(index);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover endereço');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-black uppercase tracking-tight">Meus Endereços</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setError('');
          }}
          className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-black transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo Endereço'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Rua / Avenida</label>
              <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Número</label>
              <input required type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Complemento</label>
              <input type="text" value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Bairro</label>
              <input required type="text" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Cidade</label>
              <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Estado</label>
              <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} maxLength={2} placeholder="UF" className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">CEP</label>
              <input required type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gold transition-all flex items-center justify-center"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Salvar Endereço'}
          </button>
        </form>
      )}

      {user?.addresses && user.addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {user.addresses.map((addr: any, index) => (
            <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm text-black">
                  {addr.rua}, {addr.numero}
                  {addr.complemento && ` - ${addr.complemento}`}
                </p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {addr.bairro} | {addr.cidade} - {addr.estado} | CEP: {addr.cep}
                </p>
              </div>
              <button 
                onClick={() => handleRemove(index)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Remover Endereço"
              >
                <LogOut size={16} className="rotate-180" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
            Nenhum endereço cadastrado.
          </div>
        )
      )}
    </div>
  );
};

export const MyAccount: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const menuItems = [
    { name: 'Meus Pedidos', icon: <Package size={20} />, path: '/minha-conta/pedidos' },
    { name: 'Meus Dados', icon: <User size={20} />, path: '/minha-conta/dados' },
    { name: 'Meus Endereços', icon: <MapPin size={20} />, path: '/minha-conta/enderecos' },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Painel Admin', icon: <Settings size={20} />, path: '/admin' });
  }

  return (
    <div className="flex-1 bg-white">
      <div className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-2">Olá, {user.name}</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Bem-vindo à sua área exclusiva</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-xl font-bold text-sm transition-all group ${
                location.pathname === item.path ? 'bg-black text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.name}
              </div>
              <ChevronRight size={16} className={location.pathname === item.path ? 'text-gold' : 'text-gray-300'} />
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all mt-8"
          >
            <LogOut size={20} />
            Sair da Conta
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 min-h-[400px]">
          <Routes>
            <Route index element={<Navigate to="pedidos" replace />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="dados" element={<UserData />} />
            <Route path="enderecos" element={<Addresses />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
