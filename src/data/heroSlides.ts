export interface HeroSlide {
  id: number;
  category: string;
  title: string;
  tagline: string;
  video: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    category: "LAPTOPS",
    title: "Asus ROG Strix SCAR 18",
    tagline: "Engineered for Precision",
    video: "/videos/Laptop1.mp4",
  },
  {
    id: 2,
    category: "SMARTPHONES",
    title: "Samsung Galaxy S25 Ultra",
    tagline: "Power in Your Palm",
    video: "/videos/Phone1.mp4",
  },
];

