import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Github, Chrome, Palette } from 'lucide-react';

export const AuthFormPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0a0a0c' : '#f0f2f5';
  const panelBg = isDark ? '#141417' : '#ffffff';
  const inputBg = isDark ? '#1c1c21' : '#ffffff';
  const borderCol = isDark ? '#2a2a30' : '#e4e4e7';
  const textMain = isDark ? '#ececef' : '#18181b';
  const textMuted = isDark ? '#71717a' : '#a1a1aa';
  
  // Right panel background
  const rightPanelBg = c(0);
  const rightText = getTextColor(rightPanelBg);

  return (
    <div
      className="w-full h-[600px] rounded-xl flex items-center justify-center relative overflow-hidden font-['Product_Sans',sans-serif]"
      style={{ backgroundColor: bg }}
    >
      {/* Main Split Container */}
      <div className="w-full max-w-[760px] h-[480px] rounded-2xl flex overflow-hidden shadow-2xl relative z-10 mx-6" style={{ backgroundColor: panelBg }}>
        
        {/* Left Panel: Form */}
        <div className="w-full sm:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full relative z-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: textMain }}>
              Sign In
            </h2>
          </div>

          <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50" style={{ color: textMain }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input
                type="text"
                placeholder="Username or email"
                className="w-full pl-11 pr-5 py-3.5 rounded-full text-[13px] font-semibold border-2 outline-none transition-colors focus:border-opacity-100 placeholder:opacity-60"
                style={{ backgroundColor: inputBg, borderColor: borderCol, color: textMain }}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50" style={{ color: textMain }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-11 pr-5 py-3.5 rounded-full text-[13px] font-semibold border-2 outline-none transition-colors focus:border-opacity-100 placeholder:opacity-60"
                style={{ backgroundColor: inputBg, borderColor: borderCol, color: textMain }}
              />
            </div>

            <div className="flex items-center justify-between text-[12px] font-bold mt-1 px-2">
              <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" style={{ color: textMain }}>
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-4 h-4 rounded-sm border-2 transition-colors cursor-pointer" style={{ borderColor: borderCol, backgroundColor: inputBg }} defaultChecked />
                  <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none w-2 h-2 rounded-[2px]" style={{ backgroundColor: c(0) }} />
                </div>
                Remember me
              </label>
              <a href="#" className="hover:underline opacity-80 transition-opacity hover:opacity-100" style={{ color: textMain }}>Forgot password?</a>
            </div>

            <button
              className="w-full py-4 mt-6 rounded-full font-bold text-[14px] tracking-wide transition-all hover:scale-[1.02] active:scale-100 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${c(0)}, ${c(1) || c(0)})`, color: getTextColor(c(0)) }}
            >
              Sign In
            </button>
          </form>

          {/* Passwordless Login */}
          <div className="mt-6 flex justify-center gap-4">
            <button className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ borderColor: borderCol, backgroundColor: inputBg }} title="Sign in with Google">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </button>
            <button className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ borderColor: borderCol, backgroundColor: inputBg }} title="Sign in with Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ borderColor: borderCol, backgroundColor: inputBg }} title="Sign in with X">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isDark ? "#ffffff" : "#000000"}><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
            </button>
          </div>

          {/* Footer Text */}
          <div className="mt-8 text-center text-[12px] font-semibold" style={{ color: textMuted }}>
            New here? <a href="#" className="hover:underline transition-colors" style={{ color: c(0) }}>Create an Account</a>
          </div>
        </div>

        {/* Right Panel: Graphic */}
        <div className="hidden sm:flex w-1/2 relative overflow-hidden items-center justify-center" style={{ backgroundColor: c(0) }}>
          
          <style>{`
            .astro-art-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
            }
            .backg{
              position:relative;
              flex-shrink: 0;
              height:500px;
              width:500px;
              border-radius:50%;
              background-color:rgba(0,0,0,0.1);
              transform:scale(0.7);
            }
            .planet{
              height:200px;
              width:200px;
              border-radius: 50%;
              position: relative;
              background-color: ${c(1) || '#ff9933'};
              top:45px;
              left:220px;
            }
            .r1{
              background-color: ${c(2) || '#ffbf80'};
              height:20px;
              width:110px;
              border-radius:10px;
              position: relative;
              top:60px;
              left:85px;
            }
            .r2{
              background-color: ${c(2) || '#ffbf80'};
              height: 15px;
              width:90px;
              border-radius:6.5px;
              position: relative;
              top:80px;
              left:110px;
            }
            .r3{
              background-color: ${c(2) || '#ffbf80'};
              height:30px;
              width:120px;
              border-radius: 15px;
              position: relative;
              top:78px;
              left:50px;
            }
            .r4{
              background-color: ${c(2) || '#ffbf80'};
              height:22px;
              width:90px;
              border-radius:11px;
              position: relative;
              top:70px;
              left:12px;
            }
            .r5{
              background-color: rgba(0,0,0,0.15);
              height:15px;
              width:40px;
              border-radius:7.5px;
              position: relative;
              bottom:50px;
              left:70px;
            }
            .r6{
              background-color: rgba(0,0,0,0.15);
              height:20px;
              width:60px;
              border-radius:11px;
              position: relative;
              bottom:25px;
              left:10px;
            }
            .r7{
              background-color: rgba(0,0,0,0.15);
              height:15px;
              width:45px;
              border-radius:7.5px;
              position: relative;
              top:40px;
              left:130px;
            }
            .r8{
              background-color: rgba(255,255,255,0.4);
              height:12px;
              width:30px;
              border-radius:7.5px;
              position: relative;
              top:7px;
              left:32px;
            }
            .shad{
              background-color: transparent;
              box-shadow: 15px 15px rgba(0,0,0,0.15);
              position: relative;
              height:200px;
              width:200px;
              border-radius: 50%;
              bottom: 164px;
              right:16px;
            }
            .astro{
              position: relative;
              left:131px;
              bottom: 250px;
              transform: rotate(-30deg);
            }
            .an{
              animation-name: flo;
              animation-duration: 5s;
              animation-iteration-count: infinite;
              position: relative;
              bottom: 80px;
              left:20px;
            }
            @keyframes flo{
              50%{
                transform: translateY(30px);
              }
            }
            .tank{
              background-color: #a6a6a6;
              height:120px;
              width:120px;
              border-radius: 10px;
              position: relative;
              left:95px;
              top:50px;
              transform: rotate(-30deg);
            }
            .helmet{
              background-color: white;
              height:93px;
              width:100px;
              border-radius:45%;
              position: relative;
              left:20px;
              z-index: 5;
            }
            .glass{
              background-color: #666666;
              height:60px;
              width:80px;
              border-top-left-radius:60%;
              border-top-right-radius:60%;
              border-bottom-left-radius:40%;
              border-bottom-right-radius:40%;
              position: relative;
              left:10px;
              top:7px;
            }
            .shine{
              background-color: rgba(166, 166, 166,0.7);
              height:15px;
              width:15px;
              border-radius: 50%;
              position: relative;
              left:10px;
              top:15px;
            }
            .dress{
              background-color:#f2f2f2;
              height:100px;
              width: 100px;
              border-radius: 10%; 
              position: relative;
              bottom:5px;
              left:20px;
            }
            .handr{
              height: 26px;
              width:75px;
              background-color: #f2f2f2;
              border-radius:40px;
              position: relative;
              bottom:138px;
              left:95px;
              transform: rotate(-20deg);
            }
            .handl{
              height: 26px;
              width:75px;
              background-color: #f2f2f2;
              border-radius:40px;
              position: relative;
              bottom:111px;
              right:29px;
              transform: rotate(20deg);
            }
            .handr1{
              height: 26px;
              width:57px;
              background-color: #f2f2f2;
              border-radius:26px;
              position: relative;
              bottom: 18px;
              left:35px;
              transform: rotate(90deg);
            }
            .handl1{
              height: 26px;
              width:57px;
              background-color: #f2f2f2;
              border-radius:26px;
              position: relative;
              bottom: 17px;
              right:17px;
              transform: rotate(-90deg);
            }
            .glover{
              height:28px;
              width:26px;
              background-color: white;
              border-top-left-radius:50%; 
              border-top-right-radius:50%;
              transform: rotate(-90deg);
              position: relative;
              bottom: 1px;
              right:16px;
            }
            .glovel{
              height:28px;
              width:26px;
              background-color: white;
              border-top-left-radius:50%; 
              border-top-right-radius:50%;
              transform: rotate(90deg);
              position: relative;
              bottom: 1px;
              left:42px;
            }
            .thumbr{
              height: 10px;
              width:10px;
              border-radius: 50%;
              background-color: white;
              position: relative;
              right:7px;
              top:19px;
            }
            .thumbl{
              height: 10px;
              width:10px;
              border-radius: 50%;
              background-color: white;
              position: relative;
              left:21px;
              top:19px;
            }
            .b1{
              background-color: ${c(2) || 'tomato'};
              width:28px;
              height:5.5px;
              border-radius:13px;
              position: relative;
              top:18px;
              right: 1px;
            }
            .b2{
              background-color: ${c(2) || 'tomato'};
              width:28px;
              height:5.5px;
              border-radius:13px;
              position: relative;
              top:18px;
              right: 1px;
            }
            .c{
              background-color: white;
              width:55px;
              height:30px;
              border-radius:8px;
              position: relative;
              top:25px;
              left:23px;
            }
            .btn1{
              height:12px;
              width: 12px;
              border-radius: 50%;
              background-color: ${c(3) || '#4775ff'};
              position: relative;
              left:5px;
              top:10px;
            }
            .btn2{
              height:12px;
              width: 12px;
              border-radius: 50%;
              background-color: ${c(4) || '#ffd147'};
              position: relative;
              left:21px;
              bottom:2px;
            }
            .btn3{
              height:12px;
              width: 12px;
              border-radius: 50%;
              background-color: ${c(2) || 'tomato'};
              position: relative;
              bottom:14px;
              left:38px;
            }
            .btn4{
              height:20px;
              width:20px;
              border-radius: 50%;
              background-color: #a6a6a6;
              position: relative;
              left:19px;
              top:4px;
            }
            .legl{
              height:100px;
              width:40px;
              background-color: #f2f2f2;
              position: relative;
              bottom: 68px;
              left:5px;
              transform: rotate(20deg);
            }
            .legr{
              height:100px;
              width:40px;
              background-color: #f2f2f2;
              position: relative;
              bottom: 168px;
              left:96px;
              transform: rotate(-20deg);
            }
            .bootl1{
              background-color: white;
              width: 43px;
              height:35px;
              border-top-left-radius: 50%;
              border-top-right-radius:50%;
              position: relative;
              top:65px;
              right:1.5px;
            }
            .bootr1{
              background-color: white;
              width: 43px;
              height:35px;
              border-top-left-radius: 50%;
              border-top-right-radius:50%;
              position: relative;
              top:65px;
              right:1.5px;
            }
            .bootl2{
              background-color: ${c(2) || 'tomato'};
              width:45px;
              height: 5px;
              border-radius:21px;
              position: relative;
              top:30px;
              right: 1.5px;
            }
            .bootr2{
              background-color: ${c(2) || 'tomato'};
              width:45px;
              height: 5px;
              border-radius:21px;
              position: relative;
              top:30px;
              right: 1.5px;
            }
            .pipe{
              background-color:  transparent;
              height:80px;
              width:80px;
              border:10px solid ${c(3) || '#4775ff'};
              border-radius:40px 0px 0px 70px;
              border-right: none;
              transform: rotate(180deg);
              position: relative;
              bottom: 330px;
              left:130px;
            }
            .pipe2{
              background-color:  transparent;
              height:90px;
              width:42px;
              border:10px solid ${c(3) || '#4775ff'};
              border-radius:40px 0px 0px 0px;
              border-right: none;
              transform: rotate(90deg);
              position: relative;
              border-bottom: none;
              left:67px;
              bottom:34px;
            }
            .pipe3{
              height:10px;
              width: 10px;
              background-color: ${c(3) || '#4775ff'};
              position: relative;
              border-radius: 65%;
              bottom:10px;
              left:37px;
            }
            .s1,.s2,.s3,.s4,.s5,.s6{
              background-color: white;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              position: relative;
            }
            .s1{bottom:150px;left:200px;}
            .s2{top:130px;left:254px;}
            .s3{bottom:98px;left:65px;}
            .s4{top: 216px;left:249px;}
            .s5{top: 139px;left:100px;}
            .s6{top:60px;left:370px;}
          `}</style>
          <div className="astro-art-wrapper">
            <div className="backg">
              <div className="planet">
                <div className="r1"></div>
                <div className="r2"></div>
                <div className="r3"></div>
                <div className="r4"></div>
                <div className="r5"></div>
                <div className="r6"></div>
                <div className="r7"></div>
                <div className="r8"></div>
                <div className="shad"></div>
              </div>
              <div className="stars">
                <div className="s1"></div>
                <div className="s2"></div>
                <div className="s3"></div>
                <div className="s4"></div>
                <div className="s5"></div>
                <div className="s6"></div>
              </div>
              <div className="an">
                <div className="tank"></div>
                <div className="astro">
                    <div className="helmet">
                      <div className="glass">
                        <div className="shine"></div>
                      </div>
                    </div>
                    <div className="dress">
                      <div className="c">
                        <div className="btn1"></div>
                        <div className="btn2"></div>
                        <div className="btn3"></div>
                        <div className="btn4"></div>
                      </div>
                    </div>
                    <div className="handl">
                      <div className="handl1">
                        <div className="glovel">
                          <div className="thumbl"></div>
                          <div className="b2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="handr">
                      <div className="handr1">
                        <div className="glover">
                          <div className="thumbr"></div>
                          <div className="b1"></div>
                        </div>
                      </div>
                    </div>
                    <div className="legl">
                      <div className="bootl1">
                        <div className="bootl2"></div>
                      </div>
                    </div>
                    <div className="legr">
                      <div className="bootr1">
                        <div className="bootr2"></div>
                      </div>
                    </div>
                    <div className="pipe">
                      <div className="pipe2">
                        <div className="pipe3"></div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
