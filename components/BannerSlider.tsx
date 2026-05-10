import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { supabase } from '../lib/supabase';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Banner {
  id: number;
  image_url: string;
  title?: string;
  link_url?: string;
}

const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        if (data) setBanners(data);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();

    // Realtime update
    const channel = supabase
      .channel('public:banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        fetchBanners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="w-full aspect-[21/9] md:aspect-[3/1] rounded-3xl bg-burgundy-900/10 animate-pulse border border-burgundy-900/5 dark:border-white/5" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop={banners.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="rounded-3xl shadow-2xl border border-burgundy-900/10 dark:border-white/10 overflow-hidden"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative aspect-[21/9] md:aspect-[3/1] w-full group overflow-hidden">
              <img
                src={banner.image_url}
                alt={banner.title || 'Promo Banner'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {banner.link_url && (
                <a
                  href={banner.link_url}
                  className="absolute inset-0 z-10"
                  aria-label={banner.title || 'View Promo'}
                />
              )}
              {/* Optional Title Overlay */}
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <h3 className="text-white text-xl md:text-2xl font-bold font-serif">{banner.title}</h3>
                </div>
              )}
              
              {/* Premium Glass Effect Overlay on Hover */}
              <div className="absolute inset-0 bg-burgundy-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #d4af37 !important;
          width: 24px;
          border-radius: 4px;
        }
        .dark .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.2) !important;
        }
        .dark .swiper-pagination-bullet-active {
          background: #d4af37 !important;
        }
      `}</style>
    </div>
  );
};

export default BannerSlider;
