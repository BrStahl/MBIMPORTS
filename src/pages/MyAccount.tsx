import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Settings } from 'lucide-react';

const Orders = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-black text-black uppercase tracking-tight mb-8">Meus Pedidos</h2>
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
      <Package size={48} className="mx-auto text-gray-200 mb-4" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Você ainda não realizou nenhum pedido.</p>
      <Link to="/catalogo" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gold transition-all">Ir para a Loja</Link>
    </div>
  </div>
);

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
      alert('Erro ao remover endereço');
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
