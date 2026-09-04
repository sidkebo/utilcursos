
(() => {
  "use strict";
  const $ = id => document.getElementById(id);

  function prepCanvas(canvas) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(320, r.width);
    const h = Math.max(220, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }

  function aliasFrequency(f, fs) {
    return Math.abs(f - Math.round(f/fs)*fs);
  }

  const sf = $("signalFreq");
  const fs = $("sampleFreq");

  function updateAlias() {
    const f = Number(sf.value);
    const sample = Number(fs.value);
    const twice = 2*f;
    const ts = 1000/sample;
    const fa = aliasFrequency(f, sample);

    $("signalFreqOut").textContent = `${f.toFixed(1)} Hz`;
    $("sampleFreqOut").textContent = `${sample.toFixed(0)} Hz`;
    $("mF").textContent = `${f.toFixed(1)} Hz`;
    $("m2F").textContent = `${twice.toFixed(1)} Hz`;
    $("mFs").textContent = `${sample.toFixed(1)} Hz`;
    $("mTs").textContent = `${ts.toFixed(3)} ms`;

    const status = $("aliasStatus");
    status.className = "status";

    if (sample > twice) {
      $("mAlias").textContent = "—";
      $("mCondition").textContent = "SUFICIENTE";
      status.classList.add("good");
      status.textContent = `Cumple fs > 2 x f. Relación fs/(2f) = ${(sample/twice).toFixed(2)}.`;
    } else if (Math.abs(sample-twice) < 1e-9) {
      $("mAlias").textContent = `${fa.toFixed(2)} Hz`;
      $("mCondition").textContent = "LÍMITE";
      status.classList.add("warn");
      status.textContent = "Se encuentra exactamente en fs = 2 x f. No existe margen práctico y el resultado depende fuertemente de la fase.";
    } else {
      $("mAlias").textContent = `${fa.toFixed(2)} Hz`;
      $("mCondition").textContent = "ALIASING";
      status.classList.add("bad");
      status.textContent = `No cumple fs >= 2 x f. Las muestras pueden aparentar aproximadamente ${fa.toFixed(2)} Hz.`;
    }

    drawAlias(f, sample, sample < twice, fa);
  }

  function drawAlias(f, sample, showApparent, fa) {
    const canvas = $("aliasCanvas");
    const {ctx,w,h} = prepCanvas(canvas);
    ctx.clearRect(0,0,w,h);

    const L=46,R=16,T=18,B=32;
    const pw=w-L-R, ph=h-T-B, mid=T+ph/2, amp=ph*.38;
    const duration=Math.max(1.2,Math.min(3.0,4/Math.max(f,.5)));
    const phase=.37;
    const x=t=>L+(t/duration)*pw;
    const y=v=>mid-v*amp;

    ctx.strokeStyle="#172430"; ctx.lineWidth=1;
    for(let i=0;i<=10;i++){let xx=L+pw*i/10;ctx.beginPath();ctx.moveTo(xx,T);ctx.lineTo(xx,T+ph);ctx.stroke()}
    for(let i=0;i<=4;i++){let yy=T+ph*i/4;ctx.beginPath();ctx.moveTo(L,yy);ctx.lineTo(L+pw,yy);ctx.stroke()}

    // Señal original.
    ctx.strokeStyle="#45d4ff"; ctx.lineWidth=1.8; ctx.beginPath();
    const N=Math.max(700,Math.floor(pw));
    for(let i=0;i<=N;i++){
      const t=duration*i/N, v=Math.sin(2*Math.PI*f*t+phase);
      if(i===0)ctx.moveTo(x(t),y(v)); else ctx.lineTo(x(t),y(v));
    }
    ctx.stroke();

    // Aparente.
    if(showApparent){
      const signed = f - Math.round(f/sample)*sample;
      const aliasPhase = signed >= 0 ? phase : Math.PI-phase;
      ctx.setLineDash([7,5]); ctx.strokeStyle="#ff6cc8"; ctx.lineWidth=1.5; ctx.beginPath();
      for(let i=0;i<=N;i++){
        const t=duration*i/N;
        const v=fa<1e-9 ? Math.sin(phase) : Math.sin(2*Math.PI*fa*t+aliasPhase);
        if(i===0)ctx.moveTo(x(t),y(v)); else ctx.lineTo(x(t),y(v));
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    // Muestras.
    ctx.fillStyle="#ffd166"; ctx.strokeStyle="#ffd166";
    const ns=Math.floor(duration*sample);
    for(let n=0;n<=ns;n++){
      const t=n/sample;if(t>duration)break;
      const v=Math.sin(2*Math.PI*f*t+phase), xx=x(t), yy=y(v);
      ctx.globalAlpha=.22;ctx.beginPath();ctx.moveTo(xx,mid);ctx.lineTo(xx,yy);ctx.stroke();ctx.globalAlpha=1;
      ctx.beginPath();ctx.arc(xx,yy,3.8,0,Math.PI*2);ctx.fill();
    }

    ctx.fillStyle="#71869a";ctx.font="11px Arial";
    ctx.fillText("0 s",L,h-10);ctx.textAlign="right";ctx.fillText(`${duration.toFixed(2)} s`,L+pw,h-10);ctx.textAlign="left";
  }

  sf.addEventListener("input", updateAlias);
  fs.addEventListener("input", updateAlias);
  $("presetGood").addEventListener("click",()=>{sf.value=4;fs.value=12;updateAlias()});
  $("presetLimit").addEventListener("click",()=>{sf.value=5;fs.value=10;updateAlias()});
  $("presetAlias").addEventListener("click",()=>{sf.value=8;fs.value=10;updateAlias()});

  // Cuantificación.
  const vin=$("vin"), vfs=$("vfs"), vinMid=$("vinMid"), vfsMid=$("vfsMid");

  function updateQuant() {
    const V=Number(vin.value), F=Number(vfs.value), max=511;
    $("vinOut").textContent=`${V.toFixed(3)} V`;
    $("vfsOut").textContent=`${F.toFixed(1)} V`;
    if(vinMid){
      vinMid.value = vin.value;
      const vm=$("vinMidOut");
      if(vm) vm.textContent = `${V.toFixed(3)} V`;
    }
    if(vfsMid){
      vfsMid.value = vfs.value;
      const vf=$("vfsMidOut");
      if(vf) vf.textContent = `${F.toFixed(1)} V`;
    }

    const st=$("quantStatus"); st.className="status";
    let code, vq, err;

    if(V>F){
      code=max;vq=F;err=NaN;
      $("qState").textContent="SATURACIÓN";
      st.classList.add("bad");
      st.textContent=`Vin = ${V.toFixed(3)} V supera la escala completa ideal de ${F.toFixed(3)} V. El código queda limitado a 511.`;
    }else{
      code=Math.round((V/F)*max);
      code=Math.max(0,Math.min(max,code));
      vq=(code/max)*F;
      err=V-vq;
      $("qState").textContent="EN RANGO";
      st.classList.add("good");
      st.textContent="La tensión se representa mediante uno de los 512 niveles disponibles. Tensiones próximas pueden producir el mismo código.";
    }

    $("qCode").textContent=String(code);
    $("qVoltage").textContent=`${vq.toFixed(4)} V`;
    $("qError").textContent=Number.isFinite(err)?`${(err*1000).toFixed(3)} mV`:"—";
    $("qPercent").textContent=`${(code/max*100).toFixed(2)} %`;
    drawQuant(V,F,code);
    drawQuantDetail(V,F,code);
  }

  function drawQuant(V,F,code){
    const canvas=$("quantCanvas"), {ctx,w,h}=prepCanvas(canvas);
    ctx.clearRect(0,0,w,h);

    const L=64,R=18,T=24,B=42;
    const pw=w-L-R, ph=h-T-B;
    const max=511;
    const VIN_MAX=3.6;

    // Ejes fijos.
    const x=v=>L+(Math.max(0,Math.min(VIN_MAX,v))/VIN_MAX)*pw;
    const y=c=>T+ph-(Math.max(0,Math.min(max,c))/max)*ph;

    // Rejilla fija.
    ctx.strokeStyle="#172430";
    ctx.lineWidth=1;

    for(let i=0;i<=8;i++){
      const xx=L+pw*i/8;
      ctx.beginPath();
      ctx.moveTo(xx,T);
      ctx.lineTo(xx,T+ph);
      ctx.stroke();
    }

    for(let i=0;i<=4;i++){
      const yy=T+ph*i/4;
      ctx.beginPath();
      ctx.moveTo(L,yy);
      ctx.lineTo(L+pw,yy);
      ctx.stroke();
    }

    // Zona de saturación: desde VFS hasta 3.6 V.
    if(F < VIN_MAX){
      ctx.fillStyle="rgba(255,105,105,.055)";
      ctx.fillRect(x(F),T,x(VIN_MAX)-x(F),ph);

      ctx.strokeStyle="rgba(255,105,105,.75)";
      ctx.setLineDash([6,5]);
      ctx.beginPath();
      ctx.moveTo(x(F),T);
      ctx.lineTo(x(F),T+ph);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle="#ff9c9c";
      ctx.font="11px Arial";
      const labelX=Math.min(x(F)+6,w-90);
      ctx.fillText(`VFS ${F.toFixed(1)} V`,labelX,T+14);
    }

    // Curva ideal cuantizada completa con escala fija.
    ctx.strokeStyle="#82f28f";
    ctx.lineWidth=2;
    ctx.beginPath();

    let first=true;
    for(let c=0;c<=max;c++){
      const va=(c/max)*F;
      const vb=Math.min(F,((c+1)/max)*F);
      const xa=x(va);
      const xb=x(vb);
      const yy=y(c);

      if(first){
        ctx.moveTo(xa,yy);
        first=false;
      }else{
        ctx.lineTo(xa,yy);
      }

      ctx.lineTo(xb,yy);

      if(c<max){
        ctx.lineTo(xb,y(c+1));
      }
    }

    // Saturación horizontal hasta 3.6 V.
    if(F < VIN_MAX){
      ctx.lineTo(x(VIN_MAX),y(max));
    }

    ctx.stroke();

    // Posición actual de Vin.
    const xv=x(V);
    const yv=y(code);

    ctx.strokeStyle="#ffd166";
    ctx.lineWidth=1.5;
    ctx.setLineDash([5,4]);

    // Línea vertical: posición de Vin.
    ctx.beginPath();
    ctx.moveTo(xv,T);
    ctx.lineTo(xv,T+ph);
    ctx.stroke();

    // Línea horizontal: código ADC actual.
    ctx.beginPath();
    ctx.moveTo(L,yv);
    ctx.lineTo(L+pw,yv);
    ctx.stroke();

    ctx.setLineDash([]);

    // Punto actual.
    ctx.fillStyle="#ffd166";
    ctx.beginPath();
    ctx.arc(xv,yv,5,0,Math.PI*2);
    ctx.fill();

    // Etiqueta del punto.
    const label=`Vin ${V.toFixed(3)} V | ADC ${code}`;
    ctx.font="11px Arial";
    let tx=xv+7;
    if(tx>w-145) tx=xv-140;
    tx=Math.max(L+4,tx);
    const ty=Math.max(T+14,yv-10);
    ctx.fillText(label,tx,ty);

    // Etiquetas del eje Y.
    ctx.fillStyle="#71869a";
    ctx.font="11px Arial";
    ctx.textAlign="right";
    ctx.fillText("511",L-8,y(511)+4);
    ctx.fillText("383",L-8,y(383)+4);
    ctx.fillText("256",L-8,y(256)+4);
    ctx.fillText("128",L-8,y(128)+4);
    ctx.fillText("0",L-8,y(0)+4);

    // Etiquetas del eje X, SIEMPRE fijas.
    const xTicks=[0,0.9,1.8,2.7,3.6];
    ctx.textAlign="center";
    for(const tick of xTicks){
      ctx.fillText(`${tick.toFixed(1)} V`,x(tick),h-12);
    }

    ctx.textAlign="left";
  }

  function drawQuantDetail(V,F,code){
    const canvas=$("quantDetailCanvas");
    if(!canvas) return;
    const {ctx,w,h}=prepCanvas(canvas);
    ctx.clearRect(0,0,w,h);

    const L=68,R=18,T=22,B=42;
    const pw=w-L-R, ph=h-T-B;
    const max=511;

    // Ventana FIJA por bloques de 7 códigos.
    // Ej.: 252...258, luego 259...265, etc.
    // Así el marcador se desplaza dentro del bloque y la vista
    // solo cambia cuando se pasa al siguiente grupo de 7 códigos.
    const BLOCK_SIZE=7;
    let c0=Math.floor(code/BLOCK_SIZE)*BLOCK_SIZE;

    // Asegurar que el último bloque termine exactamente en 511.
    if(c0+BLOCK_SIZE-1>max){
      c0=max-(BLOCK_SIZE-1);
    }

    const c1=c0+(BLOCK_SIZE-1);
    const v0=(c0/max)*F;
    const v1=Math.min(F,((c1+1)/max)*F);
    const span=Math.max(v1-v0, 1e-6);

    const x=v=>L+((v-v0)/span)*pw;
    const y=c=>T+ph-((c-c0)/Math.max(c1-c0,1))*ph;

    ctx.strokeStyle="#172430";
    ctx.lineWidth=1;
    for(let i=0;i<=7;i++){
      const xx=L+pw*i/7;
      ctx.beginPath();ctx.moveTo(xx,T);ctx.lineTo(xx,T+ph);ctx.stroke();
    }
    for(let c=c0;c<=c1;c++){
      const yy=y(c);
      ctx.beginPath();ctx.moveTo(L,yy);ctx.lineTo(L+pw,yy);ctx.stroke();
    }

    // Límites del escalón actual.
    const vaCode=(code/max)*F;
    const vbCode=Math.min(F,((code+1)/max)*F);

    ctx.strokeStyle="#82f28f";
    ctx.lineWidth=2;
    ctx.beginPath();
    let first=true;
    for(let c=c0;c<=c1;c++){
      const va=(c/max)*F;
      const vb=Math.min(F,((c+1)/max)*F);
      const xa=x(va), xb=x(vb), yy=y(c);
      if(first){ctx.moveTo(xa,yy); first=false;} else {ctx.lineTo(xa,yy);} 
      ctx.lineTo(xb,yy);
      if(c<c1) ctx.lineTo(xb,y(c+1));
    }
    ctx.stroke();

    const xv=x(Math.max(v0,Math.min(v1,V)));
    const yv=y(code);

    ctx.fillStyle="rgba(255,209,102,0.14)";
    const nextY = code < c1 ? y(code+1) : (yv + 18);
    ctx.fillRect(x(vaCode), Math.min(yv,nextY), Math.max(3,x(vbCode)-x(vaCode)), Math.abs(nextY-yv) || 18);

    ctx.strokeStyle="#ffd166";
    ctx.lineWidth=1.5;
    ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(xv,T);ctx.lineTo(xv,T+ph);ctx.stroke();
    ctx.beginPath();ctx.moveTo(L,yv);ctx.lineTo(L+pw,yv);ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle="#ffd166";
    ctx.beginPath();ctx.arc(xv,yv,5,0,Math.PI*2);ctx.fill();

    ctx.fillStyle="#71869a";
    ctx.font="11px Arial";
    ctx.textAlign="right";
    for(let c=c0;c<=c1;c++){
      const label = c===code ? `${c} (actual)` : String(c);
      ctx.fillText(label, L-8, y(c)+4);
    }

    ctx.textAlign="center";
    for(const tick of [v0,(v0+v1)/2,v1]){
      ctx.fillText(`${tick.toFixed(3)} V`, x(tick), h-12);
    }
    ctx.textAlign="left";

    ctx.fillStyle="#ffd166";
    ctx.font="11px Arial";
    let tx=xv+8;
    if(tx>w-180) tx=xv-170;
    tx=Math.max(L+4,tx);
    const ty=Math.max(T+14,yv-10);
    ctx.fillText(`ADC ${code} | Vin ${V.toFixed(3)} V`, tx, ty);
  }

  vin.addEventListener("input",updateQuant);
  vfs.addEventListener("input",updateQuant);

  // Controles intermedios: control bidireccional.
  // Al moverlos, actualizan los controles superiores y las dos gráficas.
  if(vinMid){
    vinMid.addEventListener("input",()=>{
      vin.value = vinMid.value;
      updateQuant();
    });
  }

  if(vfsMid){
    vfsMid.addEventListener("input",()=>{
      vfs.value = vfsMid.value;
      updateQuant();
    });
  }

  window.addEventListener("resize",()=>{updateAlias();updateQuant()});

  updateAlias();
  updateQuant();
})();
