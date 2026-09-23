import img1 from '../assets/images/banner1.jpeg'
import img2 from '../assets/images/banner2.jpeg'
import img4 from '../assets/images/banner4.jpeg'
import img5 from '../assets/images/banner5.jpeg'
import vedio1 from '../assets/video/video1.mp4'
export const API_URL = import.meta.env.VITE_API_URL || 'https://dhakaflowertub.onrender.com/api'

export const CORPORATE_IMAGES = [
  {
    src: img1,
    alt: 'Dhaka Flower Tub team in a bright corporate workspace',
  },
  {
    src: img2,
    alt: 'Meeting and collaboration with the business team',
  },
  {
    src: img4,
    alt: 'Corporate professionals in a modern office environment',
  },
  {
    src: img5,
    alt: 'Product display and presentation in a branded workspace',
  },
  {
    src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1100&q=80',
    alt: 'Modern office facade and business property',
  },
  {
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80',
    alt: 'Team meeting and planning session for the business',
  },
  {
    src: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1000&q=80',
    alt: 'Our business environment and product-focused setting',
  },
];

export const BUSINESS_VIDEO = {
  url: vedio1,
};
