export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isPopular: boolean;
  options?: {
    sizes?: string[];
    addons?: string[];
  };
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Appetizers",
    icon: "restaurant-outline",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500",
  },
  {
    id: 2,
    name: "Main Course",
    icon: "fast-food-outline",
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=500",
  },
  {
    id: 3,
    name: "Beverages",
    icon: "beer-outline",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500",
  },
  {
    id: 4,
    name: "Desserts",
    icon: "ice-cream-outline",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500",
  },
];

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    description:
      "Juicy beef patty with fresh lettuce, tomatoes, and special sauce",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    category: "Main Course",
    rating: 4.5,
    reviews: 128,
    isPopular: true,
    options: {
      sizes: ["Regular", "Large"],
      addons: ["Extra Cheese", "Bacon", "Avocado"],
    },
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomatoes, and basil on thin crust",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500",
    category: "Main Course",
    rating: 4.8,
    reviews: 256,
    isPopular: true,
    options: {
      sizes: ["Small", "Medium", "Large"],
    },
  },
  {
    id: 3,
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce, croutons, parmesan, and Caesar dressing",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500",
    category: "Appetizers",
    rating: 4.3,
    reviews: 98,
    isPopular: false,
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500",
    category: "Desserts",
    rating: 4.9,
    reviews: 187,
    isPopular: true,
  },
  {
    id: 5,
    name: "Iced Coffee",
    description: "Cold-brewed coffee served over ice",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500",
    category: "Beverages",
    rating: 4.6,
    reviews: 145,
    isPopular: true,
    options: {
      sizes: ["Small", "Medium", "Large"],
    },
  },
  {
    id: 6,
    name: "Chicken Wings",
    description: "Crispy wings with choice of sauce",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500",
    category: "Appetizers",
    rating: 4.7,
    reviews: 212,
    isPopular: true,
    options: {
      sizes: ["6 pcs", "12 pcs"],
      addons: ["Ranch Dip", "Blue Cheese Dip"],
    },
  },
];

// Mock API functions
export const getFoodItems = () => {
  return new Promise<MenuItem[]>((resolve) => {
    setTimeout(() => {
      resolve(menuItems);
    }, 1000);
  });
};

export const getCategories = () => {
  return new Promise<Category[]>((resolve) => {
    setTimeout(() => {
      resolve(categories);
    }, 1000);
  });
};

export const getPopularItems = () => {
  return new Promise<MenuItem[]>((resolve) => {
    setTimeout(() => {
      resolve(menuItems.filter((item) => item.isPopular));
    }, 1000);
  });
};

export const getItemsByCategory = (categoryName: string) => {
  return new Promise<MenuItem[]>((resolve) => {
    setTimeout(() => {
      resolve(menuItems.filter((item) => item.category === categoryName));
    }, 1000);
  });
};
