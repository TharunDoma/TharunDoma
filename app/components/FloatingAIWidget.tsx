'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AIAssistant from './AIAssistant';
import { supabase } from '@/app/lib/supabaseClient';

interface AIAvatar {
  image_url: string;
  title: string;
  spline_url?: string;
  is_3d?: boolean;
}

export default function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiAvatar, setAiAvatar] = useState<AIAvatar | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch AI Avatar from database
  useEffect(() => {
    const fetchAIAvatar = async () => {
      try {
        // First try to get Spline 3D avatar
        const { data: splineData } = await supabase
          .from('portfolio_images')
          .select('*')
          .eq('image_type', 'spline_avatar')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (splineData) {
          setAiAvatar({
            image_url: '',
            title: splineData.title || 'AI Assistant',
            spline_url: splineData.description, // Spline URL stored in description
            is_3d: true
          });
          setLoading(false);
          return;
        }

        // Fallback to 2D image avatar
        const { data, error } = await supabase
          .from('portfolio_images')
          .select('*')
          .eq('image_type', 'ai_avatar')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setAiAvatar({
            image_url: data.image_data,
            title: data.title || 'AI Assistant',
            is_3d: false
          });
        }
      } catch (err) {
        console.log('No custom AI avatar found, using default emoji');
      } finally {
        setLoading(false);
      }
    };

    fetchAIAvatar();
  }, []);

  return (
    <>
      {/* Floating AI Icon */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'relative',
          zIndex: 40,
          cursor: isOpen ? 'default' : 'pointer'
        }}
        className="group"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition"></div>

        {/* Main Icon Button */}
        <button
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl border-2 border-indigo-300 hover:border-indigo-200 overflow-hidden"
          onClick={() => setIsOpen(true)}
        >
          {aiAvatar?.is_3d && aiAvatar?.spline_url ? (
            <iframe 
              src={aiAvatar.spline_url}
              className="w-full h-full pointer-events-none"
              style={{ border: 'none' }}
            />
          ) : aiAvatar?.image_url ? (
            <img 
              src={aiAvatar.image_url} 
              alt={aiAvatar.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>🤖</span>
          )}
        </button>

        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 animate-pulse"></div>

        {/* Notification Dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce"></div>
      </div>

      {/* Modal Chat Box */}
      {isOpen && (
        <div className="absolute bottom-[60%] right-0 z-50 w-[320px] sm:w-[400px] max-w-[95vw] max-h-[65vh] rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-400 bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header with unique cat-box theme */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-700 to-sky-600 px-5 py-4 text-white flex items-center justify-between relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative flex items-center gap-3">
              {aiAvatar?.is_3d && aiAvatar?.spline_url ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                  <iframe 
                    src={aiAvatar.spline_url}
                    className="w-full h-full pointer-events-none"
                    style={{ border: 'none' }}
                  />
                </div>
              ) : aiAvatar?.image_url ? (
                <img 
                  src={aiAvatar.image_url}
                  alt={aiAvatar.title}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>
                  🤖
                </span>
              )}
              <div>
                <h2 className="text-lg font-bold">{aiAvatar?.title || 'AI Assistant'}</h2>
                <p className="text-xs text-sky-100">Always here to help!</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative p-2 hover:bg-white/15 rounded-lg transition-all hover:scale-110 transform"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Content */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-[50vh] overflow-y-auto">
            <AIAssistant />
          </div>
        </div>
      )}
    </>
  );
}
