import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, ChevronRight, Github } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await register(email, password, name, cpf);
        setSuccess('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta antes de entrar.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message === 'Email not confirmed') {
        setError('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
      } else if (err.message === 'Invalid login credentials') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError(err.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex items-center justify-center p-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <span className="font-sans font-black text-3xl tracking-tighter text-black uppercase">
            MB <span className="text-gold italic">IMPORTS</span>
          </span>
          <h2 className="mt-8 text-2xl font-black text-black uppercase tracking-tight">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
            {isLogin ? 'Acesse sua área exclusiva' : 'Cadastre-se para aproveitar benefícios'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-xl">
              {success}
            </div>
          )}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome Completo"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gold transition-all font-bold text-sm"
                required
              />
            </div>
          )}

          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="CPF"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gold transition-all font-bold text-sm"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gold transition-all font-bold text-sm"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gold transition-all font-bold text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? 'Entrar' : 'Cadastrar'}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gold transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
          </button>
        </div>

        <div className="mt-12 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="bg-white px-4 text-gray-400">Ou entre com</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <button className="flex items-center justify-center gap-3 px-4 py-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale" alt="Google" />
            <span className="text-gray-600">Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
