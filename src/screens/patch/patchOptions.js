import {
  Award,
  Heart,
  Leaf,
  Moon,
  Mountain,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Sun,
  Compass,
  Zap,
} from 'lucide-react';

export const PATCH_SHAPES = [
  { id: 'round', label: 'Round' },
  { id: 'shield', label: 'Shield' },
  { id: 'hex', label: 'Hexagon' },
];

export const PATCH_PALETTES = [
  { id: 'ocean', label: 'Ocean', base: '#123A56', accent: '#55E0F5', ink: '#F5FBFF' },
  { id: 'sunset', label: 'Sunset', base: '#572C50', accent: '#FFB86B', ink: '#FFF8EA' },
  { id: 'forest', label: 'Forest', base: '#214C43', accent: '#A8F078', ink: '#F5FFE9' },
  { id: 'galaxy', label: 'Galaxy', base: '#382C70', accent: '#C9B6FF', ink: '#FBF8FF' },
  { id: 'lunar', label: 'Lunar', base: '#414A61', accent: '#C8E8FF', ink: '#FFFFFF' },
  { id: 'ember', label: 'Ember', base: '#6A3035', accent: '#FFD36E', ink: '#FFF8ED' },
];

export const PATCH_ICONS = [
  { id: 'award', label: 'Award', Icon: Award },
  { id: 'heart', label: 'Heart', Icon: Heart },
  { id: 'leaf', label: 'Leaf', Icon: Leaf },
  { id: 'moon', label: 'Moon', Icon: Moon },
  { id: 'mountain', label: 'Mountain', Icon: Mountain },
  { id: 'rocket', label: 'Rocket', Icon: Rocket },
  { id: 'shield', label: 'Shield', Icon: Shield },
  { id: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'sun', label: 'Sun', Icon: Sun },
  { id: 'compass', label: 'Compass', Icon: Compass },
  { id: 'zap', label: 'Lightning', Icon: Zap },
];

export const PATCH_MOTTOS = [
  'Reach for the stars',
  'Curious Crew',
  'Teamwork Wins',
  'Bright Ideas',
  'Brave Explorers',
  'Keep Learning',
  'Power Up!',
  'Kindness Helps',
];

export const DEFAULT_PATCH = {
  shape: 'round',
  palette: 'ocean',
  icon: 'star',
  motto: PATCH_MOTTOS[0],
  name: 'Cadet Nova',
};
