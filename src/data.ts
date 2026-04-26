import { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Camiseta Branca Básica',
    price: 49.90,
    category: 'Camisetas',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Camiseta 100% algodão premium com corte slim fit, ideal para o dia a dia.',
    colors: ['Branco', 'Preto', 'Cinza'],
    sizes: ['P', 'M', 'G', 'GG'],
    stock: { 'P': 10, 'M': 15, 'G': 5, 'GG': 3 },
    isNew: true,
    isFeatured: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'Jaqueta Jeans Premium',
    price: 189.90,
    category: 'Casacos',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551537482-f20300c4dfb4?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Jaqueta jeans com lavagem clássica, costura reforçada e botões personalizados.',
    colors: ['Azul Escuro', 'Azul Claro'],
    sizes: ['M', 'G', 'GG'],
    stock: { 'M': 5, 'G': 8, 'GG': 2 },
    status: 'active'
  },
  {
    id: '3',
    name: 'Calça Chino Slim',
    price: 139.90,
    category: 'Calças',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Calça chino em sarja com elastano, proporcionando máximo conforto e elegância.',
    colors: ['Bege', 'Preto', 'Marrom'],
    sizes: ['38', '40', '42', '44'],
    stock: { '38': 4, '40': 10, '42': 7, '44': 3 },
    status: 'active'
  },
  {
    id: '4',
    name: 'Tênis Urban Classic',
    price: 299.90,
    category: 'shoes',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Tênis casual em couro sintético com solado emborrachado de alta durabilidade.',
    colors: ['Branco', 'Preto'],
    sizes: ['39', '40', '41', '42'],
    stock: { '39': 5, '40': 8, '41': 10, '42': 6 },
    isNew: true,
    status: 'active'
  },
  {
    id: '5',
    name: 'Bolsa Tiracolo de Couro',
    price: 169.90,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Bolsa tiracolo compacta em couro legítimo, perfeita para carregar o essencial.',
    colors: ['Marrom', 'Preto'],
    sizes: ['Único'],
    stock: { 'Único': 12 },
    status: 'active'
  },
  {
    id: '6',
    name: 'Bota Chelsea Nobuck',
    price: 349.90,
    category: 'shoes',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Bota estilo Chelsea em nobuck com elástico lateral e puxador traseiro.',
    colors: ['Areia', 'Cinza Escuro'],
    sizes: ['39', '40', '41', '42'],
    stock: { '39': 3, '40': 5, '41': 4, '42': 2 },
    isFeatured: true,
    status: 'active'
  },
  {
    id: '7',
    name: 'Relógio Minimalista Preto',
    price: 249.90,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Relógio de pulso com design minimalista, pulseira de aço e visor resistente a riscos.',
    colors: ['Preto'],
    sizes: ['Único'],
    stock: { 'Único': 8 },
    isNew: true,
    status: 'active'
  },
  {
    id: '9',
    name: 'Camisa Social Clássica',
    price: 109.90,
    category: 'Camisas',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Camisa social manga longa em tricoline de algodão, corte clássico para ocasiões formais.',
    colors: ['Branco', 'Azul Bebê'],
    sizes: ['P', 'M', 'G', 'GG'],
    stock: { 'P': 5, 'M': 12, 'G': 10, 'GG': 4 },
    status: 'active'
  },
  {
    id: '10',
    name: 'Corrente Prata Italiana',
    price: 89.90,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Corrente masculina em prata 925 com elo grumet, acabamento polido de alto brilho.',
    colors: ['Prata'],
    sizes: ['60cm', '70cm'],
    stock: { '60cm': 15, '70cm': 10 },
    status: 'active'
  },
  {
    id: '11',
    name: 'Bermuda Sarja Confort',
    price: 89.90,
    category: 'Bermudas',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Bermuda em sarja leve com elastano, bolsos faca e cordão de ajuste.',
    colors: ['Bege', 'Azul Marinho', 'Verde Militar'],
    sizes: ['38', '40', '42', '44', '46'],
    stock: { '38': 10, '40': 15, '42': 12, '44': 8, '46': 5 },
    status: 'active'
  }
];
