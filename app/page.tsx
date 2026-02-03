import { supabase } from "./lib/supabaseClient";
import { unstable_noStore as noStore } from "next/cache";
import ImageGallery from "@/app/components/ImageGallery";
import FloatingAIWidget from "@/app/components/FloatingAIWidget";
import GLBAvatarWrapper from "@/app/components/GLBAvatarWrapper";
import Link from "next/link";
import { Briefcase, BookOpen, Award, Code, Rocket, ExternalLink } from "lucide-react";

type ProfileData = {
  section_name: string;
  content: string;
};

async function getProfileData() {
  const { data } = await supabase.from("profile").select("*");
  const profileMap: Record<string, string> = {};
  data?.forEach((item: ProfileData) => {
    profileMap[item.section_name] = item.content;
  });
  return profileMap;
}

async function getProfileImage() {
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('image_type', 'profile')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return error || !data ? null : { 
      image_url: data.image_url || data.image_data,
      alt_text: data.title || 'Profile image'
    };
  } catch (error) {
    return null;
  }
}

// Fetch background image from database
async function getBackgroundImage() {
  noStore();
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('image_type', 'background')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.image_url || data.image_data; // Prefer Storage URL over base64
  } catch (error) {
    return null;
  }
}

// Fetch gallery images from database
async function getGalleryImages() {
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('image_type', 'gallery')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      return [];
    }
    
    return data.map(img => ({ 
      ...img, 
      image_data: img.image_url || img.image_data 
    }));
  } catch (error) {
    return [];
  }
}

// Fetch GLB avatar from database
async function getGLBAvatarUrl() {
  noStore();
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('image_type', 'glb_avatar')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return { 
      glb_url: data.image_data,
      title: data.title || 'Avatar'
    };
  } catch (error) {
    return null;
  }
}

// Fetch portfolio sections from a portfolio_sections table
async function getPortfolioSections() {
  try {
    const { data, error } = await supabase
      .from('portfolio_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    return error || !data ? [] : data;
  } catch (error) {
    return [];
  }
}

// Fetch projects
async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    return error || !data ? [] : data;
  } catch (error) {
    return [];
  }
}

// Disable caching for large FBX and image files to prevent cache warnings
export const revalidate = 0;

export default async function Home() {
  const content = await getProfileData();
  const profileImage = await getProfileImage();
  const backgroundImage = await getBackgroundImage();
  const galleryImages = await getGalleryImages();
  const glbAvatar = await getGLBAvatarUrl();
  const sections = await getPortfolioSections();
  const projects = await getProjects();

  return (
    <>
      {/* Main Content */}
    <main 
      className="flex min-h-screen flex-col items-center justify-center bg-amber-100 text-slate-900 relative"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
    >

      {/* Profile & Portfolio Content */}
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl px-6 pb-12">
            {/* Profile Image with Animation */}
            {profileImage?.image_url && (
              <div className="relative group mt-10 -ml-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <img 
                  src={profileImage.image_url} 
                  alt={profileImage.alt_text}
                  loading="eager"
                  className="relative w-80 h-80 rounded-full object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  style={{ animationName: 'fadeIn', animationDuration: '1s', animationFillMode: 'forwards' }}
                />
              </div>
            )}

            {/* Text Content */}
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                {content.full_name || 'Welcome!'}
              </h1>
              
              {(
                content.headline ||
                'AI/ML Engineer | GenAI & LLM Developer | MS CS @ UNCC | AWS Certified'
              ) && (
                <p className="text-2xl text-sky-200 mb-6 font-semibold">
                  {content.headline || 'AI/ML Engineer | GenAI & LLM Developer | MS CS @ UNCC | AWS Certified'}
                </p>
              )}
              
              {content.bio && (
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  {content.bio}
                </p>
              )}

              {content.skills && (
                <div>
                  <h3 className="text-xl font-semibold text-sky-300 mb-3">Skills</h3>
                  <p className="text-slate-300">{content.skills}</p>
                </div>
              )}
            </div>
          </div>

      {/* Role Looking For Section */}
      <div className="w-full px-6 py-12 bg-slate-700/20 border-t border-b border-slate-600/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-emerald-400" size={28} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Roles I'm Looking For
            </h2>
          </div>
          {content.roles_looking_for ? (
            <div className="flex flex-wrap gap-3">
              {content.roles_looking_for.split(',').map((role, idx) => (
                <span key={idx} className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-100 text-sm font-semibold">
                  {role.trim()}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-100 text-sm font-semibold">AI Engineer</span>
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-100 text-sm font-semibold">Machine Learning Engineer</span>
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-100 text-sm font-semibold">Generative AI Developer</span>
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-100 text-sm font-semibold">Cloud Data Engineer</span>
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-100 text-sm font-semibold">Full Stack Developer</span>
            </div>
          )}
        </div>
      </div>

      {/* About Me Section */}
      <div className="w-full px-6 py-12 bg-slate-600/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
            About Me
          </h2>
          <p className="text-slate-100 text-lg leading-relaxed bg-slate-900/20 p-6 rounded-xl border border-slate-700/30">
            {content.about_me || 'I am an AI/ML Engineer and Master\'s student in Computer Science at UNC Charlotte, passionate about bridging the gap between data science and scalable software engineering. With a strong foundation in AWS Cloud Architecture (SageMaker, Lambda), I don\'t just build models in notebooks—I deploy end-to-end intelligent applications that solve real business problems. I focus on building scalable AI solutions—GenAI apps, Grok API integrations, RAG pipelines—that run reliably in production. Currently, I am focused on Generative AI and Serverless Deployment, building tools that automate complex workflows.'}
          </p>
        </div>
      </div>

      {/* Education Section */}
      <div className="w-full px-6 py-12 bg-slate-700/20 border-t border-b border-slate-600/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-amber-400" size={28} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Education
            </h2>
          </div>
          <div className="space-y-4">
            {content.education ? (
              content.education.split('|').map((edu, idx) => (
                <div key={idx} className="p-4 bg-slate-900/30 border-l-4 border-amber-400 rounded-lg hover:bg-slate-900/50 transition">
                  <p className="text-slate-100 font-semibold">{edu.trim()}</p>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 bg-slate-900/30 border-l-4 border-amber-400 rounded-lg hover:bg-slate-900/50 transition">
                  <p className="text-slate-100 font-semibold">Master of Science in Computer Science | UNC Charlotte (Dec 2025)</p>
                  <p className="text-slate-300 text-sm mt-1">Focus: Advanced ML, Cloud Computing</p>
                </div>
                <div className="p-4 bg-slate-900/30 border-l-4 border-amber-400 rounded-lg hover:bg-slate-900/50 transition">
                  <p className="text-slate-100 font-semibold">B.Tech in CSE (AI & Machine Learning) | Sreenivasa Institute of Technology (Mar 2024)</p>
                  <p className="text-slate-300 text-sm mt-1">Focus: AI & Data Science foundations</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="w-full px-6 py-12 bg-slate-600/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Code className="text-indigo-400" size={28} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Experience
            </h2>
          </div>
          <div className="space-y-4">
            {content.experience ? (
              content.experience.split('|').map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-900/20 border-l-4 border-indigo-400 rounded-lg hover:bg-slate-900/40 transition">
                  <p className="text-slate-100 font-semibold">{exp.trim()}</p>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 bg-slate-900/20 border-l-4 border-indigo-400 rounded-lg hover:bg-slate-900/40 transition">
                  <p className="text-slate-100 font-semibold">Data Science Intern @ INNOVATE (Feb 2024 – Apr 2024)</p>
                  <p className="text-slate-300 text-sm mt-1">Designed and deployed ChromaSense, an ML-driven color detection system. Performed EDA to maximize accuracy in varying lighting.</p>
                </div>
                <div className="p-4 bg-slate-900/20 border-l-4 border-indigo-400 rounded-lg hover:bg-slate-900/40 transition">
                  <p className="text-slate-100 font-semibold">Software Developer Intern @ TechCiti (May 2023 – Jun 2023)</p>
                  <p className="text-slate-300 text-sm mt-1">Developed a Secure File Sharing System using Java/SQL with encryption to prevent fraudulent access.</p>
                </div>
                <div className="p-4 bg-slate-900/20 border-l-4 border-indigo-400 rounded-lg hover:bg-slate-900/40 transition">
                  <p className="text-slate-100 font-semibold">AWS Academy Intern (May 2023 – Jul 2023)</p>
                  <p className="text-slate-300 text-sm mt-1">Built an end-to-end ML pipeline using SageMaker & Lambda; automated infrastructure with CloudFormation.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Learning & Skills Section */}
      <div className="w-full px-6 py-12 bg-slate-700/20 border-t border-b border-slate-600/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-rose-400" size={28} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              Learning & Development
            </h2>
          </div>
          {content.learning_skills ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.learning_skills.split(',').map((skill, idx) => (
                <div key={idx} className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                  <p className="text-rose-200 font-semibold text-sm">{skill.trim()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                <p className="text-rose-200 font-semibold text-sm">AWS Academy Graduate (Data Engineering & ML)</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                <p className="text-rose-200 font-semibold text-sm">Google Data Analytics Professional</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                <p className="text-rose-200 font-semibold text-sm">GenAI (RAG/LangChain)</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                <p className="text-rose-200 font-semibold text-sm">Serverless Architecture (AWS Lambda)</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                <p className="text-rose-200 font-semibold text-sm">Next.js/React</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-lg border border-rose-400/30 hover:border-rose-400 transition text-center">
                <p className="text-rose-200 font-semibold text-sm">AWS SageMaker & CloudFormation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="w-full px-6 py-12 bg-slate-600/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="text-violet-400" size={28} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              Featured Projects
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length > 0 ? projects.map((project: any) => (
              <a 
                key={project.id} 
                href={project.demo_url || '#'}
                target={project.demo_url ? "_blank" : undefined}
                rel={project.demo_url ? "noopener noreferrer" : undefined}
                className="p-5 bg-slate-900/30 rounded-xl border border-violet-400/30 hover:border-violet-400 transition group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-violet-200 group-hover:text-violet-100 transition">
                    {project.title}
                  </h3>
                  {project.is_deployed && (
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded text-emerald-200 text-xs font-semibold">
                      Live
                    </span>
                  )}
                  {!project.is_deployed && project.deploy_status === 'in_progress' && (
                    <span className="px-2 py-1 bg-amber-500/20 border border-amber-400/50 rounded text-amber-200 text-xs font-semibold">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack?.split(',').map((tech: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                {project.github_url && (
                  <div className="flex gap-3">
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition"
                    >
                      <ExternalLink size={14} />
                      GitHub
                    </a>
                  </div>
                )}
              </a>
            )) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-slate-400">Projects showcase coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Sections */}
      {sections.length > 0 && sections.map((section: any) => (
        <div key={section.id} className="w-full px-6 py-12 bg-slate-600/10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent">
              {section.section_title}
            </h2>
            <div className="bg-slate-900/20 p-6 rounded-xl border border-slate-700/30">
              <p className="text-slate-100 leading-relaxed">{section.section_content}</p>
            </div>
          </div>
        </div>
      ))}

      {galleryImages.length > 0 && (
        <div className="w-full px-6 pb-24">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
            Gallery
          </h2>
          <ImageGallery images={galleryImages} />
        </div>
      )}

      {/* GLB 3D Avatar with AI Chat */}
      {glbAvatar?.glb_url ? (
        <GLBAvatarWrapper glbData={glbAvatar.glb_url} />
      ) : (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40">
          <FloatingAIWidget />
        </div>
      )}
    </main>
    </>
  );
}
