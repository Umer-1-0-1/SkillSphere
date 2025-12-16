import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Gem, PenTool } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-28 min-h-[85vh] flex items-center">
        <div className="text-center max-w-5xl mx-auto w-full">
          <h1 className="text-7xl font-bold mb-8 text-white leading-tight" style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
            Learn. Grow. Excel.
            <br />
            <span className="text-[var(--primary)]">Your Journey Starts Here</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-3xl mx-auto leading-relaxed" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
            Transform your skills with expert-led courses, interactive learning, 
            and a community of ambitious learners just like you.
          </p>
          <div className="flex items-center justify-center gap-5">
            <Link to="/register" className="btn-primary flex items-center gap-3 text-lg px-10 py-4 rounded-2xl">
              Get Started <ArrowRight size={22} />
            </Link>
            <Link to="/courses" className="bg-[#202020] text-white text-lg px-10 py-4 rounded-2xl transition-all">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 - AI-Powered Content */}
          <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-12 hover:border-[#94C705] transition-all">
            <div className="flex flex-col items-start">
              <div className="w-28 h-28 bg-[#0F0F0F] border border-[#252525] rounded-full flex items-center justify-center mb-14">
                <Cpu className="text-[var(--primary)]" size={50} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-white" style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
                  AI-Powered Learning
                </h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
                  Experience personalized course recommendations and adaptive learning paths powered by advanced AI technology.
                </p>
              </div>
            </div>
          </div>
          
          {/* Card 2 - Premium Templates */}
          <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-12 hover:border-[#94C705] transition-all">
            <div className="flex flex-col items-start">
              <div className="w-28 h-28 bg-[#0F0F0F] border border-[#252525] rounded-full flex items-center justify-center mb-14">
                <Gem className="text-[var(--primary)]" size={50} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-white" style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
                  Premium Courses
                </h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
                  Access hundreds of professionally designed courses created by industry experts and top instructors.
                </p>
              </div>
            </div>
          </div>
          
          {/* Card 3 - Advanced Editor */}
          <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-12 hover:border-[#94C705] transition-all">
            <div className="flex flex-col items-start">
              <div className="w-28 h-28 bg-[#0F0F0F] border border-[#252525] rounded-full flex items-center justify-center mb-14">
                <PenTool className="text-[var(--primary)]" size={50} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-white" style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
                  Interactive Experience
                </h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
                  Enjoy smooth, intuitive learning with advanced progress tracking and interactive course materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
