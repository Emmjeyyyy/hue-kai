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
        <div className="w-full sm:w-1/2 p-8 md:p-10 flex flex-col justify-center h-full relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: textMain }}>
              SIGN <span style={{ color: c(0) }}>IN</span>
            </h2>
          </div>

          <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              placeholder="Username or Email"
              className="w-full px-4 py-3 rounded text-[12px] font-medium border outline-none transition-colors focus:border-opacity-100 placeholder:opacity-60"
              style={{ backgroundColor: inputBg, borderColor: borderCol, color: textMain }}
            />
            
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded text-[12px] font-medium border outline-none transition-colors focus:border-opacity-100 placeholder:opacity-60"
              style={{ backgroundColor: inputBg, borderColor: borderCol, color: textMain }}
            />

            <div className="flex items-center justify-between text-[11px] font-semibold mt-1">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: textMuted }}>
                <input type="checkbox" className="w-3.5 h-3.5 rounded-sm accent-current" style={{ accentColor: c(0) }} defaultChecked />
                Stay signed in
              </label>
              <a href="#" className="hover:underline" style={{ color: c(0) }}>Forgot Password?</a>
            </div>

            <button
              className="w-full py-3 mt-2 rounded font-bold text-[12px] tracking-wide transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}
            >
              SIGN IN
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: borderCol }} /></div>
            <div className="relative flex justify-center">
              <span className="text-[11px] px-3 font-medium" style={{ backgroundColor: panelBg, color: textMuted }}>Or Sign In with</span>
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-black/5" style={{ borderColor: borderCol, color: textMain }}>
              <Chrome size={14} />
            </button>
            <button className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-black/5" style={{ borderColor: borderCol, color: textMain }}>
              <Github size={14} />
            </button>
            <button className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-black/5" style={{ borderColor: borderCol, color: textMain }}>
              <Palette size={14} />
            </button>
          </div>

          {/* Footer Box */}
          <div className="mt-auto w-full py-3 rounded text-center text-[11px] font-medium border" style={{ backgroundColor: c(0) + '15', borderColor: borderCol, color: textMuted }}>
            Not a member? <a href="#" className="font-bold hover:underline" style={{ color: c(0) }}>Sign Up</a>
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
