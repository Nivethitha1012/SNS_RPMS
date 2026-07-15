import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import rpmsLogo from '../../assets/logos/app-logo.png';
import ContactBlock from '../../components/ContactBlock';

function TiltLogo({ src, alt, className }) {
  const ref = useRef(null);
  const [tiltTransform, setTiltTransform] = React.useState(
    'perspective(400px) rotateX(0deg) rotateY(0deg) scale(1)'
  );

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateY = ((x / width) - 0.5) * 40;
    const rotateX = -((y / height) - 0.5) * 40;
    setTiltTransform(`perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.12)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTiltTransform('perspective(400px) rotateX(0deg) rotateY(0deg) scale(1)');
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tiltTransform,
        transition: 'transform 0.15s ease-out',
        cursor: 'pointer',
        willChange: 'transform',
        display: 'inline-block',
      }}
    />
  );
}

const Section = ({ number, title, children, isDark }) => (
  <section className="mb-8">
    <div className="flex items-baseline gap-3 mb-3">
      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
        {number}
      </span>
      <h2 className={`text-[15px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
        {title}
      </h2>
    </div>
    <div className={`text-base leading-8 pl-9 space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
      {children}
    </div>
  </section>
);

const Divider = ({ isDark }) => (
  <hr className={`my-8 ${isDark ? 'border-white/8' : 'border-slate-100'}`} />
);

export default function TermsAndConditions() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#050505] text-slate-200' : 'bg-white text-slate-800'}`}>
      <header className={`sticky top-0 z-10 border-b backdrop-blur-md transition-all duration-300 ${isDark ? 'bg-[#050505]/95 border-white/5 shadow-lg shadow-black/20' : 'bg-white/95 border-slate-200 shadow-md shadow-slate-200/60'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3">
              <TiltLogo src={rpmsLogo} alt="Logo" className="h-10 w-auto object-contain" />
              <span className={`font-bold text-lg hidden sm:block tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Publications
              </span>
            </Link>
            <Link to="/" className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <div className={`border-b py-10 px-6 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
        <div className="max-w-3xl mx-auto">
          <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Legal</span>
          <h1 className={`text-2xl font-bold mt-1 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Terms &amp; Conditions</h1>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Effective: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            &nbsp;·&nbsp; SNS Publications
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">

        <Section number="01" title="Terms & Acceptance" isDark={isDark}>
          <p>
            By accessing SNS Publications, you agree to these Terms and Conditions. The platform must be used for lawful academic purposes only. Any attempts to disrupt or gain unauthorised access to our systems will result in immediate termination of access.
          </p>
        </Section>

        <Divider isDark={isDark} />

        <Section number="02" title="Manuscript Submissions & Integrity" isDark={isDark}>
          <p>
            All manuscript submissions must be original, accurate, and complete. They are subject to rigorous peer review and plagiarism checks.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Plagiarised work or manipulated data is strictly prohibited and will result in rejection.</li>
            <li>Publication fees, if applicable, will be communicated upon acceptance.</li>
            <li>Please refer to our Refund & Cancellation Policy regarding fee payments.</li>
          </ul>
        </Section>

        <Divider isDark={isDark} />

        <Section number="03" title="Intellectual Property & Content" isDark={isDark}>
          <p>
            All original platform content (text, graphics, logos) is the property of SNS Publications. You may not reproduce it without prior written permission. We are not responsible for the content or practices of any third-party websites linked on our platform.
          </p>
        </Section>

        <Divider isDark={isDark} />

        <Section number="04" title="Liability & Modifications" isDark={isDark}>
          <p>
            To the maximum extent permitted by law, SNS Publications will not be liable for any indirect or consequential damages arising from the use of this platform or participation in the publication process. 
          </p>
          <p className="mt-3">
            We reserve the right to update these terms at any time. Changes will be posted on this page with an updated effective date.
          </p>
        </Section>

        <Divider isDark={isDark} />

        <Section number="05" title="Contact Us" isDark={isDark}>
          <ContactBlock isDark={isDark} />
        </Section>

      </main>

      <footer className={`relative border-t transition-colors ${isDark ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`h-px w-full bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-50`} />
        <div className="w-full px-4 sm:px-6 lg:px-12 pt-12 pb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-3">
                <TiltLogo src={rpmsLogo} alt="Logo" className="h-9 w-auto object-contain" />
                <div className="flex flex-col justify-center">
                  <span className={`font-bold text-2xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    SNS Publications
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Research Publication Management System
                  </span>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Empowering SNS faculty to manage, track, and showcase research publications with ease.
              </p>
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                <span>support@okrion.ai</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Legal</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link to="/privacy" className={`text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'}`}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className={`text-sm transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 font-semibold'}`}>
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className={`text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'}`}>
                    Refund &amp; Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              &copy; {new Date().getFullYear()} SNS Publications. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
