export type Product = {
  id: string;
  name: string;
  price: number;
  category: 'men' | 'women' | 'accessories';
  image: string;
  isNew?: boolean;
};

export type CartItem = Product & {
  quantity: number;
};
