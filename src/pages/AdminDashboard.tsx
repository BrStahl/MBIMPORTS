import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ListOrdered, Image as ImageIcon, Users, LogOut, ChevronRight, Database, BarChart3, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const AdminReports = () => {
  const [data, setData] = React.useState<any>({
    salesByDay: [],
    salesByCategory: [],
    topProducts: [],
    orderSummary: []
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReportData = async () => {
      try {
        const { data: orders, error } = await supabase
          .from('pedidos')
          .select('*, itens_pedidos(*)');

        if (error) throw error;

        if (orders) {
          // 1. Sales by Day (Last 7 days)
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();

          const salesByDay = last7Days.map(date => {
            const dayOrders = orders.filter(o => o.criado_em.startsWith(date));
            const total = dayOrders.reduce((acc, curr) => acc + (curr.valor_total || curr.total || 0), 0);
            return {
              date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              vendas: total
            };
          });

          // 2. Orders by Status
          const statusCounts: Record<string, number> = {};
          orders.forEach(o => {
            const status = o.status || 'recebido';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          const orderSummary = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

          // 3. Top Products
          const productSales: Record<string, { name: string, quantity: number, total: number }> = {};
          orders.forEach(o => {
            if (o.itens_pedidos) {
              o.itens_pedidos.forEach((item: any) => {
                const name = item.nome_produto || item.name || 'Produto Desconhecido';
                if (!productSales[name]) {
                  productSales[name] = { name, quantity: 0, total: 0 };
                }
                productSales[name].quantity += (item.quantidade || 1);
                productSales[name].total += (item.preco_unitario || item.price || 0) * (item.quantidade || 1);
              });
            }
          });

          const topProducts = Object.values(productSales)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

          setData({
            salesByDay,
            orderSummary,
            topProducts
          });
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const COLORS = ['#D4AF37', '#000000', '#4B5563', '#9CA3AF', '#E5E7EB'];

  if (loading) return <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Gerando relatórios...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">Relatórios de Performance</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Análise detalhada de vendas e pedidos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-black mb-6">Vendas nos Últimos 7 Dias</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Line type="monotone" dataKey="vendas" stroke="#D4AF37" strokeWidth={4} dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-black mb-6">Distribuição de Status</h3>
          <div className="h-64 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.orderSummary}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.orderSummary.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="md:w-48 space-y-2 mt-4 md:mt-0">
              {data.orderSummary.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-6">Top 5 Produtos por Receita</h3>
        <div className="space-y-4">
          {data.topProducts.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-xs text-gray-400 group-hover:bg-gold group-hover:text-white transition-all">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm uppercase">{p.name}</p>
                <div className="w-full bg-gray-50 h-2 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="bg-gold h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(p.total / data.topProducts[0].total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-sm">R$ {p.total.toFixed(2).replace('.', ',')}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.quantity} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminSummary = () => {
  const { products } = useStore();
  const [customerCount, setCustomerCount] = React.useState(0);
  const [stats, setStats] = React.useState({
    vendasTotal: 0,
    pedidosPendentes: 0,
    pedidosEntregues: 0,
    pedidosTotal: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        // Clientes
        const { count: cCount, error: cError } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
        if (cError) console.error('Error fetching customers count:', cError);
        if (cCount !== null) setCustomerCount(cCount);

        // Pedidos stats
        const { data: pedidos, error: pError } = await supabase.from('pedidos').select('*');
        
        if (pError) {
          console.error('Error fetching orders stats:', pError);
          return;
        }

        if (pedidos) {
          console.log('DASHBOARD PEDIDOS DATA:', pedidos);
          
          const totalVendas = pedidos.reduce((acc, curr) => {
            // Tentar várias colunas comuns de valor total
            const val = curr.valor_total || curr.total || curr.amount || curr.valor_produtos || 0;
            return acc + Number(val);
          }, 0);

          const totalPedidos = pedidos.length;
          const entregues = pedidos.filter(p => 
            p.status?.toLowerCase() === 'entregue' || 
            p.status?.toLowerCase() === 'delivered' ||
            p.status?.toLowerCase() === 'concluido'
          ).length;

          const pendentes = pedidos.filter(p => 
            !['enviado', 'shipped', 'entregue', 'delivered', 'cancelado', 'cancelled'].includes(p.status?.toLowerCase())
          ).length;

          setStats({
            vendasTotal: totalVendas,
            pedidosPendentes: pendentes,
            pedidosEntregues: entregues,
            pedidosTotal: totalPedidos
          });
        }
      } catch (err) {
        console.error('Unexpected error in fetchStats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Vendas Totais', value: `R$ ${stats.vendasTotal.toFixed(2).replace('.', ',')}`, trend: 'Receita Bruta', path: '/admin/pedidos' },
          { label: 'Total Pedidos', value: stats.pedidosTotal.toString(), trend: 'Volume total', path: '/admin/pedidos' },
          { label: 'Pendentes', value: stats.pedidosPendentes.toString(), trend: 'Ação Necessária', color: 'text-orange-500', path: '/admin/pedidos' },
          { label: 'Finalizados', value: stats.pedidosEntregues.toString(), trend: 'Entregues', color: 'text-green-500', path: '/admin/pedidos' },
          { label: 'Produtos / Usuários', value: `${products.length} / ${customerCount}`, trend: 'Base Ativa', path: '/admin/produtos' },
        ].map((stat, idx) => (
          <Link key={idx} to={stat.path} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group block">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 group-hover:text-gold">{stat.label}</p>
            <p className={`text-2xl font-black mb-2 ${stat.color || 'text-black'}`}>{stat.value}</p>
            <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{stat.trend}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const { products, fetchProducts } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [productImages, setProductImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [existingImages, setExistingImages] = React.useState<any[]>([]);

  // Form State
  const [formData, setFormData] = React.useState({
    nome: '',
    categoria_id: '',
    descricao: '',
    preco_base: '',
    destaque: false,
    ativo: true
  });

  const [variations, setVariations] = React.useState<any[]>([
    { tamanho: '', cor: '', sku: '', preco: '', estoque: '0' }
  ]);

  const resetForm = () => {
    setFormData({ nome: '', categoria_id: '', descricao: '', preco_base: '', destaque: false, ativo: true });
    setVariations([{ tamanho: '', cor: '', sku: '', preco: '', estoque: '0' }]);
    setProductImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  React.useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categorias').select('*').eq('ativo', true).order('nome');
      if (data) setCategories(data);
    };
    fetchCats();
  }, []);

  const handleEdit = async (product: any) => {
    setLoading(true);
    try {
      // Fetch full product details including variations and images
      const { data: pData, error: pError } = await supabase
        .from('produtos')
        .select('*, variacoes_produtos(*), imagens_produtos(*)')
        .eq('id', product.id)
        .single();

      if (pError) throw pError;

      setFormData({
        nome: pData.nome,
        categoria_id: pData.categoria_id || '',
        descricao: pData.descricao || '',
        preco_base: pData.preco_base.toString(),
        destaque: pData.destaque,
        ativo: pData.ativo
      });

      if (pData.variacoes_produtos && pData.variacoes_produtos.length > 0) {
        setVariations(pData.variacoes_produtos.map((v: any) => ({
          id: v.id,
          tamanho: v.tamanho || '',
          cor: v.cor || '',
          sku: v.sku || '',
          preco: v.preco ? v.preco.toString() : '',
          estoque: v.estoque.toString()
        })));
      } else {
        setVariations([{ tamanho: '', cor: '', sku: '', preco: '', estoque: '0' }]);
      }

      setExistingImages(pData.imagens_produtos || []);
      setEditingId(pData.id);
      setShowForm(true);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProductImages(prev => [...prev, ...files]);
      
      const newPreviews = files.map((file: File) => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (id: string) => {
    // confirm() bloqueado no sandbox
    try {
      const { error } = await supabase.from('imagens_produtos').delete().eq('id', id);
      if (error) throw error;
      setExistingImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover imagem');
    }
  };

  const addVariation = () => {
    setVariations([...variations, { tamanho: '', cor: '', sku: '', preco: '', estoque: '0' }]);
  };

  const removeVariation = async (index: number) => {
    const v = variations[index];
    if (v.id) {
      // confirm() bloqueado no sandbox
      try {
        const { error } = await supabase.from('variacoes_produtos').delete().eq('id', v.id);
        if (error) throw error;
      } catch (err) {
        console.error(err);
        toast.error('Erro ao remover variação');
        return;
      }
    }
    
    if (variations.length > 1) {
      setVariations(variations.filter((_, i) => i !== index));
    } else {
      setVariations([{ tamanho: '', cor: '', sku: '', preco: '', estoque: '0' }]);
    }
  };

  const handleVariationChange = (index: number, field: string, value: any) => {
    const newVariations = [...variations];
    newVariations[index][field] = value;
    setVariations(newVariations);
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao excluir produto: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco_base) {
      toast.error('Nome e Preço Base são obrigatórios');
      return;
    }
    
    setLoading(true);

    try {
      const slug = formData.nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      let productId = editingId;

      if (editingId) {
        // 1. Update product
        const { error: productError } = await supabase
          .from('produtos')
          .update({
            nome: formData.nome,
            slug,
            categoria_id: formData.categoria_id || null,
            descricao: formData.descricao,
            preco_base: parseFloat(formData.preco_base),
            destaque: formData.destaque,
            ativo: formData.ativo
          })
          .eq('id', editingId);

        if (productError) throw productError;
      } else {
        // 1. Insert product
        const { data: productData, error: productError } = await supabase
          .from('produtos')
          .insert([{
            nome: formData.nome,
            slug,
            categoria_id: formData.categoria_id || null,
            descricao: formData.descricao,
            preco_base: parseFloat(formData.preco_base),
            destaque: formData.destaque,
            ativo: formData.ativo
          }])
          .select()
          .single();

        if (productError) throw productError;
        productId = productData.id;
      }

      const id = productId!;

      // 2. Upload new images
      const uploadedImageUrls: string[] = [];
      for (const file of productImages) {
        const fileExt = file.name.split('.').pop();
        const randomString = Math.random().toString(36).substring(2, 10);
        const fileName = `${id}/${Date.now()}-${randomString}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName);
        
        uploadedImageUrls.push(publicUrl);
      }

      // 3. Insert images metadata
      if (uploadedImageUrls.length > 0) {
        const lastOrder = existingImages.length > 0 
          ? Math.max(...existingImages.map(img => img.ordem || 0)) 
          : -1;

        const imagesToInsert = uploadedImageUrls.map((url, idx) => ({
          produto_id: id,
          url,
          ordem: lastOrder + idx + 1,
          principal: lastOrder === -1 && idx === 0
        }));

        const { error: imagesError } = await supabase
          .from('imagens_produtos')
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      // 4. Salvar variações
      const validVariations = variations.filter(v => 
        v.tamanho?.trim() || v.cor?.trim() || v.preco || v.estoque !== '0'
      );

      for (const v of validVariations) {
        const variationData: any = {
          produto_id: id,
          tamanho: v.tamanho?.trim() || null,
          cor: v.cor?.trim() || null,
          preco: v.preco ? parseFloat(v.preco) : parseFloat(formData.preco_base),
          estoque: parseInt(v.estoque) || 0,
          atualizado_em: new Date().toISOString()
        };

        // Gerar SKU automático se não existir
        if (!v.sku || !v.sku.trim()) {
          const skuBase = `${formData.nome}-${v.tamanho || ''}-${v.cor || ''}-${Math.random().toString(36).substring(2, 5)}`;
          variationData.sku = skuBase.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        } else {
          variationData.sku = v.sku;
        }

        if (v.id) {
          const { error: updateError } = await supabase
            .from('variacoes_produtos')
            .update(variationData)
            .eq('id', v.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('variacoes_produtos')
            .insert([variationData]);
          if (insertError) throw insertError;
        }
      }

      toast.success(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao processar produto: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Preencha as informações para cadastrar no estoque</p>
          </div>
          <button 
            onClick={resetForm}
            className="bg-zinc-100 text-gray-500 hover:text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
          {/* Informações Básicas */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Camiseta Polo Masculina"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-sm outline-none focus:border-gold transition-all"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Categoria</label>
                <select 
                  value={formData.categoria_id}
                  onChange={e => setFormData({...formData, categoria_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-sm outline-none focus:border-gold transition-all appearance-none"
                >
                  <option value="">Nenhuma Categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Descrição Detalhada</label>
              <textarea 
                value={formData.descricao}
                onChange={e => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva o produto, materiais, cuidados..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-sm outline-none focus:border-gold transition-all h-40 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Preço Base (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.preco_base}
                  onChange={e => setFormData({...formData, preco_base: e.target.value})}
                  placeholder="0,00"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-sm outline-none focus:border-gold transition-all"
                  required 
                />
              </div>
              <div className="flex items-center gap-6 pt-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.destaque ? 'bg-gold border-gold' : 'bg-gray-50 border-gray-200'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.destaque}
                      onChange={e => setFormData({...formData, destaque: e.target.checked})}
                    />
                    {formData.destaque && <Database size={14} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Destaque</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.ativo ? 'bg-green-500 border-green-500' : 'bg-gray-50 border-gray-200'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.ativo}
                      onChange={e => setFormData({...formData, ativo: e.target.checked})}
                    />
                    {formData.ativo && <Database size={14} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Ativo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Upload de Fotos */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-white rounded-lg">
                <ImageIcon size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Fotos do Produto</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Imagens de alta qualidade vendem mais</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Existing Images */}
              {existingImages.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                  <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  <button 
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black shadow-lg"
                  >
                    <LogOut size={12} />
                  </button>
                  {img.principal && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gold/90 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center backdrop-blur-sm">Principal</div>
                  )}
                </div>
              ))}

              {/* New Previews */}
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                  <img src={preview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black shadow-lg"
                  >
                    <LogOut size={12} />
                  </button>
                  {!editingId && idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gold/90 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center backdrop-blur-sm">Principal</div>
                  )}
                </div>
              ))}

              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                <div className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                  <ImageIcon size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Add Foto</span>
              </label>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold text-white rounded-lg">
                <LayoutDashboard size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Gerador de Grade Inteligente</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Crie várias combinações de tamanho e cor instantaneamente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <div className="md:col-span-5 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block ml-1 flex items-center gap-2">
                  Tamanhos <span className="font-normal lowercase opacity-60">(separe por vírgula)</span>
                </label>
                <input 
                  type="text" 
                  id="bulk-sizes"
                  placeholder="EX: P, M, G, GG"
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-xs outline-none focus:border-gold shadow-sm"
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block ml-1 flex items-center gap-2">
                  Cores <span className="font-normal lowercase opacity-60">(separe por vírgula)</span>
                </label>
                <input 
                  type="text" 
                  id="bulk-colors"
                  placeholder="EX: Preto, Branco, Marinho"
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-xs outline-none focus:border-gold shadow-sm"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button 
                  type="button"
                  onClick={() => {
                    const sizes = (document.getElementById('bulk-sizes') as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean);
                    const colors = (document.getElementById('bulk-colors') as HTMLInputElement).value.split(',').map(c => c.trim()).filter(Boolean);
                    
                    if (sizes.length === 0 && colors.length === 0) return;

                    const newVariations = [...variations];
                    
                    if (sizes.length === 0) {
                      colors.forEach(c => {
                        newVariations.push({ tamanho: '', cor: c, sku: '', preco: '', estoque: '0' });
                      });
                    } else if (colors.length === 0) {
                      sizes.forEach(s => {
                        newVariations.push({ tamanho: s, cor: '', sku: '', preco: '', estoque: '0' });
                      });
                    } else {
                      sizes.forEach(s => {
                        colors.forEach(c => {
                          newVariations.push({ tamanho: s, cor: c, sku: '', preco: '', estoque: '0' });
                        });
                      });
                    }

                    const finalVariations = newVariations.filter(v => v.tamanho || v.cor || v.id);
                    setVariations(finalVariations.length > 0 ? finalVariations : [{ tamanho: '', cor: '', sku: '', preco: '', estoque: '0' }]);
                    
                    (document.getElementById('bulk-sizes') as HTMLInputElement).value = '';
                    (document.getElementById('bulk-colors') as HTMLInputElement).value = '';
                  }}
                  className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gold transition-all shadow-lg active:scale-95"
                >
                  Gerar
                </button>
              </div>
            </div>
          </div>

          {/* Variações */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Variações e Estoque</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gerencie tamanhos, cores e estoque individual</p>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={addVariation}
                  className="bg-black text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gold transition-all shadow-lg active:scale-95"
                >
                  + Individual
                </button>
              </div>
            </div>

            <div className="overflow-hidden border border-gray-50 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Tamanho</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Cor</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">SKU</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Preço (R$)</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Estoque</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-20">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {variations.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={v.tamanho}
                          onChange={e => handleVariationChange(idx, 'tamanho', e.target.value)}
                          placeholder="EX: P, M, G"
                          className="w-full bg-white border border-gray-100 rounded-lg p-3 font-bold text-xs outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={v.cor}
                          onChange={e => handleVariationChange(idx, 'cor', e.target.value)}
                          placeholder="EX: Preto, Azul"
                          className="w-full bg-white border border-gray-100 rounded-lg p-3 font-bold text-xs outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={v.sku}
                          onChange={e => handleVariationChange(idx, 'sku', e.target.value)}
                          placeholder="Auto-gerado"
                          className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 font-mono text-[10px] outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          step="0.01"
                          value={v.preco}
                          onChange={e => handleVariationChange(idx, 'preco', e.target.value)}
                          placeholder={formData.preco_base || "Val. Base"}
                          className="w-full bg-white border border-gray-100 rounded-lg p-3 font-bold text-xs outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={v.estoque}
                          onChange={e => handleVariationChange(idx, 'estoque', e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-lg p-3 font-bold text-xs outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => removeVariation(idx)}
                          disabled={variations.length === 1 && !v.id}
                          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-0 p-2"
                        >
                          <LogOut size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {variations.length === 0 && (
                <div className="p-8 text-center bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Nenhuma variação adicionada
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-6 h-[72px]">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-16 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gold transition-all shadow-2xl hover:shadow-gold/20 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">Produtos</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-gold transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-xl hover:shadow-gold/20 flex-shrink-0"
          >
            + Novo
          </button>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Produto</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Preço Principal</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Categoria</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={p.images?.[0]} className="w-12 h-12 rounded-xl object-cover border border-gray-100" alt="" />
                    <span className="font-bold text-sm text-black">{p.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-sm">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                <td className="px-8 py-6 uppercase text-[10px] font-black text-gray-400 tracking-widest">{p.category}</td>
                <td className="px-8 py-6">
                  <span className={`${p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
                    {p.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="text-gray-400 hover:text-black transition-colors font-black text-[10px] uppercase tracking-widest border border-gray-100 px-4 py-2 rounded-lg"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteProduct(p.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors border border-gray-100 p-2 rounded-lg"
                      title="Excluir Produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const [nome, setNome] = React.useState('');
  const [tipoProduto, setTipoProduto] = React.useState<'Roupas' | 'Acessórios' | 'Calçados'>('Roupas');
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categorias').select('*').order('nome');
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      if (data) setCategories(data);
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);

    const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const { error } = await supabase.from('categorias').insert([{ 
        nome: nome.trim(), 
        slug, 
        tipo_produto: tipoProduto,
        ativo: true
      }]);
      
      if (error) {
        console.error('Supabase error inserting category:', error);
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }
      
      setNome('');
      setTipoProduto('Roupas');
      fetchCategories();
      toast.success('Categoria salva com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro inesperado ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('categorias').update({ ativo: !currentStatus }).eq('id', id);
      if (error) {
        toast.error(`Erro ao atualizar: ${error.message}`);
        return;
      }
      fetchCategories();
      toast.success('Status atualizado!');
    } catch (err) {
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteCategory = async (id: string) => {
    // confirm() é bloqueado no sandbox do AI Studio
    try {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') {
          toast.error('Não é possível excluir: existem produtos vinculados.');
        } else {
          toast.error(`Erro ao excluir: ${error.message}`);
        }
        return;
      }
      fetchCategories();
      toast.success('Categoria excluída!');
    } catch (err: any) {
      toast.error('Erro inesperado ao excluir categoria');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">Categorias</h2>
      </div>

      <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Nome da Categoria</label>
            <input 
              type="text" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Camisetas, Calças..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold"
              required 
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Tipo de Produto</label>
            <select 
              value={tipoProduto}
              onChange={(e) => setTipoProduto(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold"
              required
            >
              <option value="Roupas">Roupas</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Calçados">Calçados</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gold transition-all h-[52px]"
            >
              {loading ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nome</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Slug</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-sm text-black">{c.nome}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded">
                    {c.tipo_produto || 'Roupas'}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{c.slug}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleAtivo(c.id, c.ativo)}
                    className={`${c.ativo ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest`}
                  >
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 gap-4 flex">
                  <button 
                    onClick={() => deleteCategory(c.id)}
                    className="text-red-400 hover:text-red-600 transition-colors font-black text-[10px] uppercase tracking-widest"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedOrder, setExpandedOrder] = React.useState<any | null>(null);
  const [trackingCode, setTrackingCode] = React.useState('');
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase.from('pedidos').select(`
            *,
            clientes (*, enderecos_clientes(*)),
            itens_pedidos (*)
        `).order('criado_em', { ascending: false });
        
        if (error) throw error;
        console.log('ADMIN ORDERS:', data);
        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async () => {
    if (!expandedOrder) return;
    if (!trackingCode.trim()) {
      toast.error('Por favor, insira o código de rastreio.');
      return;
    }

    setUpdating(true);
    console.log('Iniciando atualização do pedido:', expandedOrder.id);
    console.log('Valores:', { status: 'enviado', codigo_rastreio: trackingCode });

    try {
      // Usar o valor exato permitido pelo banco: 'enviado'
      const { data, error } = await supabase
        .from('pedidos')
        .update({ 
          status: 'enviado',
          codigo_rastreio: trackingCode
        })
        .eq('id', expandedOrder.id)
        .select();
      
      if (error) {
        console.error('Erro retornado pelo Supabase:', error);
        throw error;
      }

      console.log('Resposta do banco:', data);

      if (!data || data.length === 0) {
        console.warn('Nenhuma linha foi atualizada. Verifique se o ID existe.');
      }

      const updatedOrder = { ...expandedOrder, status: 'enviado', codigo_rastreio: trackingCode };
      setOrders(orders.map(o => o.id === expandedOrder.id ? updatedOrder : o));
      setExpandedOrder(updatedOrder);
      setTrackingCode('');
      toast.success('Pedido atualizado para "enviado" com sucesso!');
    } catch (err: any) {
      console.error('Erro na função handleUpdateStatus:', err);
      toast.error('Erro ao atualizar: ' + (err.message || 'Erro desconhecido. Verifique o console do navegador.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-black uppercase tracking-tight">Pedidos</h2>
      
      {expandedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Detalhes do Pedido</h3>
                <p className="text-[10px] font-black text-gold uppercase tracking-widest">Nº #{expandedOrder.Num_Ped || expandedOrder.id.split('-')[0]}</p>
              </div>
              <button 
                onClick={() => {
                  setExpandedOrder(null);
                  setTrackingCode('');
                }}
                className="text-gray-400 hover:text-black transition-colors p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cliente</h4>
                <p className="font-bold text-sm">{expandedOrder.clientes?.nome || expandedOrder.nome_cliente || 'N/A'}</p>
                <p className="text-sm text-gray-500">{expandedOrder.clientes?.email || expandedOrder.email_cliente}</p>
                  <div className="mt-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</h4>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      ['enviado', 'entregue'].includes(expandedOrder.status) 
                        ? 'bg-green-100 text-green-700' 
                        : expandedOrder.status === 'em_separacao'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {expandedOrder.status === 'em_separacao' ? 'Em Separação' : (expandedOrder.status || 'recebido')}
                    </span>
                  </div>
              </div>
              
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Endereço de Entrega</h4>
                {expandedOrder.clientes?.enderecos_clientes && expandedOrder.clientes.enderecos_clientes.length > 0 ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{expandedOrder.clientes.enderecos_clientes[0].rua}, {expandedOrder.clientes.enderecos_clientes[0].numero}</p>
                    <p>{expandedOrder.clientes.enderecos_clientes[0].bairro}, {expandedOrder.clientes.enderecos_clientes[0].cidade} - {expandedOrder.clientes.enderecos_clientes[0].estado}</p>
                    <p>CEP: {expandedOrder.clientes.enderecos_clientes[0].cep}</p>
                    {expandedOrder.clientes.enderecos_clientes[0].complemento && (
                      <p className="text-xs text-gray-400 italic">Comp: {expandedOrder.clientes.enderecos_clientes[0].complemento}</p>
                    )}
                  </div>
                ) : expandedOrder.clientes?.addresses && Array.isArray(expandedOrder.clientes.addresses) && expandedOrder.clientes.addresses.length > 0 ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{expandedOrder.clientes.addresses[0].street}, {expandedOrder.clientes.addresses[0].number}</p>
                    <p>{expandedOrder.clientes.addresses[0].neighborhood}, {expandedOrder.clientes.addresses[0].city} - {expandedOrder.clientes.addresses[0].state}</p>
                    <p>CEP: {expandedOrder.clientes.addresses[0].zipCode}</p>
                    {expandedOrder.clientes.addresses[0].complement && (
                      <p className="text-xs text-gray-400 italic">Comp: {expandedOrder.clientes.addresses[0].complement}</p>
                    )}
                  </div>
                ) : expandedOrder.endereco_entrega ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{expandedOrder.endereco_entrega.line1} {expandedOrder.endereco_entrega.line2}</p>
                    <p>{expandedOrder.endereco_entrega.city}, {expandedOrder.endereco_entrega.state} - {expandedOrder.endereco_entrega.postal_code}</p>
                    <p>{expandedOrder.endereco_entrega.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Endereço não disponível</p>
                )}
              </div>
            </div>

            {expandedOrder.status === 'Enviado' && expandedOrder.codigo_rastreio && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Código de Rastreio</h4>
                <p className="font-mono font-bold text-green-800">{expandedOrder.codigo_rastreio}</p>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Itens do Pedido</h4>
              <div className="space-y-4">
                {expandedOrder.itens_pedidos && expandedOrder.itens_pedidos.length > 0 ? (
                  expandedOrder.itens_pedidos.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                      <div className="flex-1">
                        <p className="font-bold text-sm uppercase">{item.nome_produto || item.name}</p>
                        <p className="text-xs text-gray-500">
                           {item.cor ? `Cor: ${item.cor} | ` : ''} 
                           {item.tamanho ? `Tam: ${item.tamanho} | ` : ''} 
                           Qtd: {item.quantidade || item.quantity || 1}
                        </p>
                      </div>
                      <p className="font-black">R$ {((item.preco_unitario || item.price || 0) * (item.quantidade || item.quantity || 1)).toFixed(2).replace('.', ',')}</p>
                    </div>
                  ))
                ) : expandedOrder.itens && Array.isArray(expandedOrder.itens) ? (
                  expandedOrder.itens.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                      <div className="flex-1">
                        <p className="font-bold text-sm uppercase">{item.name}</p>
                        <p className="text-xs text-gray-500">Cor: {item.color} | Tam: {item.size} | Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-black">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum item listado.</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-widest text-gray-400">Total</span>
              <span className="text-xl font-black">R$ {(expandedOrder.valor_total || expandedOrder.total || 0).toFixed(2).replace('.', ',')}</span>
            </div>
            
            {expandedOrder.status !== 'enviado' && expandedOrder.status !== 'entregue' && (
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Código de Rastreio</label>
                  <input 
                    type="text" 
                    value={trackingCode}
                    onChange={e => setTrackingCode(e.target.value)}
                    placeholder="Insira o código da transportadora"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-sm outline-none focus:border-gold transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="bg-black text-white px-10 py-4 rounded-xl uppercase tracking-widest text-[10px] font-black hover:bg-gold transition-colors shadow-lg disabled:opacity-50"
                  >
                    {updating ? 'Enviando...' : 'Marcar como Enviado'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando...</div>
        ) : orders.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nº Pedido</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-black font-mono text-[11px] text-zinc-900 bg-zinc-50">
                    #{order.Num_Ped || order.id.split('-')[0]}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-black">
                    {order.criado_em ? new Date(order.criado_em).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{order.clientes?.nome || order.nome_cliente || 'N/A'}</div>
                    <div className="text-[10px] text-gray-500">{order.clientes?.email || order.email_cliente || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    R$ {(order.valor_total || order.total || 0).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      ['enviado', 'entregue'].includes(order.status) 
                        ? 'bg-green-50 text-green-700' 
                        : order.status === 'em_separacao'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {order.status === 'em_separacao' ? 'Em Separação' : (order.status || 'recebido')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setExpandedOrder(order)}
                      className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors border border-gray-200 px-3 py-1.5 rounded-lg"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            <ListOrdered size={48} className="mx-auto text-gray-100 mb-4" />
            Nenhum pedido registrado no sistema.
          </div>
        )}
      </div>
    </div>
  );
};

const AdminCustomers = () => {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase.from('clientes').select('*').order('nome');
      if (data) setCustomers(data);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-black uppercase tracking-tight">Clientes</h2>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando...</div>
        ) : customers.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nome</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">CPF</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm text-black">{c.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.cpf || '---'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.telefone || c.teleffone || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            <Users size={48} className="mx-auto text-gray-100 mb-4" />
            Nenhum cliente cadastrado.
          </div>
        )}
      </div>
    </div>
  );
};

const AdminBanners = () => {
  const { fetchBanners, banners } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    titulo: '',
    link: '',
    ativo: true,
  });
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image && !preview) return;
    setLoading(true);

    try {
      let imageUrl = '';
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `banners/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, image);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('banners_promo').insert([{
        titulo: formData.titulo,
        link: formData.link,
        imagem_url: imageUrl,
        ativo: formData.ativo
      }]);

      if (error) throw error;
      
      setFormData({ titulo: '', link: '', ativo: true });
      setImage(null);
      setPreview(null);
      fetchBanners();
      toast.success('Banner cadastrado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar banner');
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    // confirm() bloqueado no sandbox
    try {
      const { error } = await supabase.from('banners_promo').delete().eq('id', id);
      if (error) throw error;
      fetchBanners();
      toast.success('Banner excluído com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao excluir banner: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const toggleAtivo = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('banners_promo').update({ ativo: !current }).eq('id', id);
      if (error) throw error;
      fetchBanners();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar status do banner');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-black uppercase tracking-tight">Gerenciar Banners</h2>
      
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Título (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Link de Destino</label>
                <input 
                  type="text" 
                  value={formData.link}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  placeholder="/catalogo ou link externo"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-1">Imagem do Banner</label>
              <label className="relative aspect-[21/9] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all overflow-hidden group">
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <ImageIcon size={32} className="text-gray-300 group-hover:text-gold transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Clique para selecionar</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.ativo ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'}`}>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={formData.ativo}
                  onChange={e => setFormData({...formData, ativo: e.target.checked})}
                />
                {formData.ativo && <Database size={14} className="text-white" />}
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Banner Ativo</span>
            </label>
            <button 
              type="submit" 
              disabled={loading || !preview}
              className="bg-black text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Adicionar Banner'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner: any) => (
          <div key={banner.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group">
            <div className="aspect-[21/9] relative scale-105 group-hover:scale-100 transition-transform duration-700">
              <img src={banner.image} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-black text-black uppercase tracking-tight">{banner.title || 'Sem Título'}</h4>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <button 
                  onClick={() => toggleAtivo(banner.id, banner.status === 'active')}
                  className={`${banner.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-400 bg-red-50'} px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest`}
                >
                  {banner.status === 'active' ? 'Ativo' : 'Inativo'}
                </button>
                <button 
                  onClick={() => deleteBanner(banner.id)}
                  className="text-red-400 hover:text-red-600 font-black text-[9px] uppercase tracking-widest transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (!isAdmin) return <Navigate to="/login" replace />;

  const menuItems = [
    { name: 'Geral', icon: <LayoutDashboard size={20} />, path: '/admin/overview' },
    { name: 'Produtos', icon: <ShoppingBag size={20} />, path: '/admin/produtos' },
    { name: 'Categorias', icon: <ListOrdered size={20} />, path: '/admin/categorias' },
    { name: 'Pedidos', icon: <ListOrdered size={20} />, path: '/admin/pedidos' },
    { name: 'Relatórios', icon: <BarChart3 size={20} />, path: '/admin/relatorios' },
    { name: 'Banners', icon: <ImageIcon size={20} />, path: '/admin/banners' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/admin/clientes' },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <Link to="/" className="font-sans font-black text-2xl tracking-tighter text-black uppercase">
            MB <span className="text-gold italic">ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 p-6 space-y-2">
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
        </nav>
        <div className="p-6 border-t border-gray-100">
           <button onClick={logout} className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all">
            <LogOut size={20} />
            Sair do Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminSummary />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="relatorios" element={<AdminReports />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="clientes" element={<AdminCustomers />} />
          {/* Add more as needed */}
        </Routes>
      </main>
    </div>
  );
};
