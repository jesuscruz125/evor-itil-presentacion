(function(){
  // ── Intro pixel art ──
  const F={E:['11111','10000','10000','11110','10000','10000','11111'],
           V:['10001','10001','10001','10001','10001','01010','00100'],
           O:['01110','10001','10001','10001','10001','10001','01110'],
           R:['11110','10001','10001','11110','10100','10010','10001']};
  const box=document.getElementById('pixlogo'),intro=document.getElementById('intro');
  'EVOR'.split('').forEach((ch,li)=>{
    const g=document.createElement('div');g.className='pl';
    F[ch].forEach((row,y)=>[...row].forEach((c,x)=>{
      const i=document.createElement('i');
      if(c==='1'){i.className='on';i.style.animationDelay=(li*0.25+Math.random()*0.9)+'s'}
      g.appendChild(i)}));
    box.appendChild(g);
  });
  setTimeout(()=>box.classList.add('ready'),1800);
  let introOn=true,warp=false,warpT=0;
  function closeIntro(){
    if(!introOn)return;introOn=false;warp=true;
    setTimeout(()=>intro.classList.add('hide'),350);
    setTimeout(()=>intro.remove(),1600);
  }
  intro.addEventListener('click',closeIntro);
  document.addEventListener('keydown',e=>{if(introOn){e.preventDefault();e.stopImmediatePropagation();closeIntro()}},true);

  // ── Campo de estrellas ──
  const cv=document.getElementById('stars'),ctx=cv.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W,H,stars=[],sparks=[],shoots=[],mx=0,my=0,tx=0,ty=0,nextShoot=1.2;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function mk(z){return{x:rnd(0,W),y:rnd(0,H),z:z||rnd(.2,1),ph:rnd(0,6.28),sp:rnd(.6,2.8),on:Math.random()}}
  function resize(){
    const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
    cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
    stars=Array.from({length:Math.round(W*H/5000)},()=>mk());
    sparks=Array.from({length:Math.max(8,Math.round(W/110))},()=>({...mk(rnd(.6,1)),r:rnd(3,6)}));
  }
  resize();addEventListener('resize',resize);
  document.addEventListener('mousemove',e=>{tx=e.clientX/W-.5;ty=e.clientY/H-.5});
  let last=performance.now(),t=0;
  function frame(now){
    if(!intro.isConnected)return;
    const dt=Math.min((now-last)/1000,.05);last=now;t+=dt;
    mx+=(tx-mx)*.05;my+=(ty-my)*.05;
    if(warp)warpT=Math.min(1,warpT+dt*1.6);
    ctx.clearRect(0,0,W,H);
    const cx=W/2,cy=H/2;
    // estrellas
    for(const s of stars){
      const v=reduce?0:1;
      if(!warp){s.y-=6*s.z*dt*v;s.x+=2*s.z*dt*v;if(s.y<-4){s.y=H+4;s.x=rnd(0,W)}if(s.x>W+4)s.x=-4}
      const k=.5+.5*Math.sin(t*s.sp+s.ph);
      const a=.08+.92*k*k*k;
      const px=s.x-mx*60*s.z,py=s.y-my*60*s.z;
      const sz=s.z>.8?3:s.z>.5?2:1;
      if(warp){
        const dx=px-cx,dy=py-cy,w=warpT;
        s.x+=dx*dt*(1+5*w*s.z);s.y+=dy*dt*(1+5*w*s.z);
        ctx.strokeStyle='rgba(255,255,255,'+(.3+.7*w)+')';ctx.lineWidth=sz*.8;
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-dx*.22*w,py-dy*.22*w);ctx.stroke();
        if(s.x<-50||s.x>W+50||s.y<-50||s.y>H+50){s.x=cx+rnd(-60,60);s.y=cy+rnd(-60,60)}
      }else{ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.fillRect(px,py,sz,sz)}
    }
    // destellos en cruz (pixel art)
    if(!warp)for(const s of sparks){
      const k=Math.max(0,Math.sin(t*s.sp*.6+s.ph));const a=k*k;if(a<.02)continue;
      const px=Math.round(s.x-mx*90*s.z),py=Math.round(s.y-my*90*s.z),r=Math.round(s.r*(.6+.4*a));
      ctx.fillStyle='rgba(255,255,255,'+a+')';
      ctx.fillRect(px-1,py-1,3,3);
      ctx.fillStyle='rgba(255,255,255,'+a*.6+')';
      for(let i=1;i<=r;i+=2){ctx.fillRect(px-1+i+1,py,2,2);ctx.fillRect(px-i-2,py,2,2);ctx.fillRect(px,py-i-2,2,2);ctx.fillRect(px,py+i+1,2,2)}
    }
    // estrellas fugaces
    if(!warp&&!reduce){
      nextShoot-=dt;
      if(nextShoot<=0){nextShoot=rnd(1.8,4);const l=Math.random()<.5;shoots.push({x:l?rnd(0,W*.5):rnd(W*.5,W),y:rnd(0,H*.4),vx:(l?1:-1)*rnd(500,800),vy:rnd(250,420),life:1})}
      shoots=shoots.filter(o=>o.life>0);
      for(const o of shoots){
        o.x+=o.vx*dt;o.y+=o.vy*dt;o.life-=dt*.9;
        for(let i=0;i<14;i++){
          const a=o.life*(1-i/14);ctx.fillStyle='rgba(255,255,255,'+a+')';
          ctx.fillRect(Math.round(o.x-o.vx*i*.012),Math.round(o.y-o.vy*i*.012),i<2?3:2,i<2?3:2);
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__introActive=()=>introOn;
})();
(function(){
  const slides=[...document.querySelectorAll('.slide')];
  const dotsBox=document.querySelector('.dots');
  const prev=document.getElementById('prev'),next=document.getElementById('next');
  const cur=document.getElementById('cur'),bar=document.querySelector('.progress');
  let i=0;
  slides.forEach((_,k)=>{const d=document.createElement('button');d.className='dot';d.setAttribute('aria-label','Diapositiva '+(k+1));d.onclick=()=>go(k);dotsBox.appendChild(d)});
  const dots=[...dotsBox.children];
  function go(n,fromHash){
    i=Math.max(0,Math.min(slides.length-1,n));
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    dots.forEach((d,k)=>d.classList.toggle('on',k===i));
    cur.textContent=String(i+1).padStart(2,'0');
    bar.style.width=((i+1)/slides.length*100)+'%';
    prev.disabled=i===0;next.disabled=i===slides.length-1;
    slides[i].scrollTop=0;
    if(!fromHash)history.replaceState(null,'','#'+(i+1));
  }
  prev.onclick=()=>go(i-1);next.onclick=()=>go(i+1);
  document.addEventListener('keydown',e=>{
    if(e.target.isContentEditable)return;
    if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();go(i+1)}
    else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();go(i-1)}
    else if(e.key==='Home')go(0);else if(e.key==='End')go(slides.length-1);
    else if(e.key==='f'||e.key==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}
  });
  let sx=null;
  document.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60)go(i+(dx<0?1:-1));sx=null});
  // barras del diagnóstico
  document.querySelectorAll('.fill').forEach(f=>f.dataset.w=f.style.width);
  new MutationObserver(()=>{document.querySelectorAll('.fill').forEach(f=>{f.style.width=f.closest('.slide').classList.contains('active')?f.dataset.w:'0'})})
    .observe(document.querySelector('.deck'),{subtree:true,attributes:true,attributeFilter:['class']});
  // tarjetas: brillo con el cursor
  document.querySelectorAll('.card').forEach(c=>c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')}));
  const h=parseInt(location.hash.slice(1));go(isNaN(h)?0:h-1,true);
})();
