'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import StatsBanner from '@/components/home/StatsBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ProviderCtaBanner from '@/components/home/ProviderCtaBanner';

export default function HomePage() {
  const router = useRouter();

  const handleCategorySelect = (category: string) => {
    router.push(`/services?category=${category}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Section con Doctor y badges flotantes */}
      <HeroSection />

      {/* 2. Barra de Estadísticas en fondo verde/teal (#025a4e) */}
      <StatsBanner />

      {/* 3. Sección "Explora por categoría" con las 6 tarjetas */}
      <CategoriesSection onSelectCategory={handleCategorySelect} />

      {/* 4. Sección "¿Cómo funciona?" con los 3 pasos numerados */}
      <HowItWorksSection />

      {/* 5. Sección "Lo que dicen nuestros usuarios" con 3 reseñas */}
      <TestimonialsSection />

      {/* 6. Banner "¿Eres proveedor de servicios?" */}
      <ProviderCtaBanner />
    </div>
  );
}

