export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  brand: string;
  stock?: number;
  createdAt?: string;
}

export const products: Product[] = [

  // ================= LAPTOPS =================
  {
    id: 1,
    name: "ASUS ROG Strix SCAR 18",
    category: "laptops",
    price: 389999,
    brand: "ASUS",
    image: "/img/Laptop/Rog18.jpeg"
  },
  {
    id: 2,
    name: "MacBook Pro 16 M3 Max",
    category: "laptops",
    price: 349900,
    brand: "Apple",
    image: "/img/Laptop/mac.jpeg"
  },
  {
    id: 3,
    name: "Dell XPS 15",
    category: "laptops",
    price: 189999,
    brand: "Dell",
    image: "/img/Laptop/Dell.jpeg"
  },
  {
    id: 4,
    name: "HP Omen 17",
    category: "laptops",
    price: 229999,
    brand: "HP",
    image: "/img/Laptop/omen.jpeg"
  },
  {
    id: 5,
    name: "Lenovo Legion Pro 7i",
    category: "laptops",
    price: 249999,
    brand: "Lenovo",
    image: "/img/Laptop/lenovo.jpeg"
  },

  // ================= PHONES =================
  {
    id: 6,
    name: "Samsung Galaxy S25 Ultra",
    category: "phones",
    price: 139999,
    brand: "Samsung",
    image: "/img/Phone/S25u.jpeg"
  },
  {
    id: 7,
    name: "Samsung Galaxy S25",
    category: "phones",
    price: 99999,
    brand: "Samsung",
    image: "/img/Phone/S25.jpeg"
  },
  {
    id: 8,
    name: "iPhone 16 Pro Max",
    category: "phones",
    price: 149900,
    brand: "Apple",
    image: "/img/Phone/16promax.jpeg"
  },
  {
    id: 9,
    name: "Google Pixel 9 Pro",
    category: "phones",
    price: 109999,
    brand: "Google",
    image: "/img/Phone/google.jpeg"
  },
  {
    id: 10,
    name: "OnePlus 12 Pro",
    category: "phones",
    price: 69999,
    brand: "OnePlus",
    image: "/img/Phone/oneplus.jpeg"
  },

  // ================= AUDIO =================
  {
    id: 11,
    name: "Samsung Galaxy Buds 3 Pro",
    category: "audio",
    price: 19999,
    brand: "Samsung",
    image: "/img/Audio/buds3p.jpeg"
  },
  {
    id: 12,
    name: "Samsung Galaxy Buds 2",
    category: "audio",
    price: 9999,
    brand: "Samsung",
    image: "/img/Audio/buds2.jpeg"
  },
  {
    id: 13,
    name: "Sony WH-1000XM5",
    category: "audio",
    price: 29999,
    brand: "Sony",
    image: "/img/Audio/sony.jpeg"
  },
  {
    id: 14,
    name: "Apple AirPods Pro 2",
    category: "audio",
    price: 24900,
    brand: "Apple",
    image: "/img/Audio/apple.jpeg"
  },
  {
    id: 15,
    name: "JBL Tune 770NC",
    category: "audio",
    price: 7999,
    brand: "JBL",
    image: "/img/Audio/JBL.jpeg"
  },
  {
    id: 16,
    name: "Samsung Galaxy Buds 3 ",
    category: "audio",
    price: 12999,
    brand: "Samsung",
    image: "/img/Audio/buds3.jpeg"
  }
];