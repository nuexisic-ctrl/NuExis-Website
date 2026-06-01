import React from 'react';

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Software {
  id: string;
  name: string;
  image_url: string;
  forward_url: string;
  image_fit?: string;
  created_at: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  category_id: string;
  name: string;
  image_url: string;
  created_at: string;
}