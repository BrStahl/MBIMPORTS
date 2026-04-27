export type Variation = {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price?: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  colors: string[];
  sizes: string[];
  variations?: Variation[];
  stock?: {
    [key: string]: number;
  };
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
};

export type Banner = {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  status: 'active' | 'inactive';
};

export type Category = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  tipo_produto?: 'Roupas' | 'Acessórios' | 'Calçados';
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  shippingAddress: Address;
  customerName: string;
  customerEmail: string;
};

export type Address = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  phone?: string;
  cpf?: string;
};
