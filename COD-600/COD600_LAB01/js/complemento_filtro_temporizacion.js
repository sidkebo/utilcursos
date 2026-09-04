
(() => {
  "use strict";
  const $ = id => document.getElementById(id);

  // =========================================================
  // MEMORIA CIRCULAR N = 5
  // =========================================================
  const memInitial = [250,255,260,258,262];
  let mem = [...memInitial];
  let idx = 0;
  let suma = mem.reduce((a,b)=>a+b,0);
  let autoValue = 270;

  function renderMemPreview(nueva = Number($("memNuevaMuestra").value)) {
    const cells = [...document.querySelectorAll(".memoria-cell")];
    cells.forEach((cell,i)=>{
      cell.querySelector("strong").textContent = mem[i];
      cell.classList.toggle("active",i===idx);
    });

    const vieja = mem[idx];
    const trasResta = suma - vieja;
    const sumaNueva = trasResta + nueva;
    const prom = sumaNueva / 5;

    $("memIndice").textContent = idx;
    $("memSale").textContent = vieja;
    $("memSuma").textContent = suma;
    $("memPromedio").textContent = (suma/5).toFixed(1);

    $("memPasoResta").textContent = `${suma} - ${vieja} = ${trasResta}`;
    $("memPasoEscritura").textContent = `muestras[${idx}] = ${nueva}`;
    $("memPasoSuma").textContent = `${trasResta} + ${nueva} = ${sumaNueva}`;
    $("memPasoPromedio").textContent = `${sumaNueva} / 5 = ${prom.toFixed(1)}`;
  }

  function applyMem() {
    let nueva = Number($("memNuevaMuestra").value);
    if (!Number.isFinite(nueva)) nueva = 0;
    nueva = Math.max(0,Math.min(511,Math.round(nueva)));

    const vieja = mem[idx];
    suma -= vieja;
    mem[idx] = nueva;
    suma += nueva;

    const idxAnterior = idx;
    idx++;
    if(idx>=5) idx=0;

    $("memEstado").textContent =
      `Se sustituyó muestras[${idxAnterior}] = ${vieja} por ${nueva}. El indiceFiltro avanza ahora a ${idx}.`;

    renderMemPreview(Number($("memNuevaMuestra").value));
  }

  $("memAplicar").addEventListener("click", applyMem);
  $("memPaso").addEventListener("click", ()=>{
    $("memNuevaMuestra").value = autoValue;
    applyMem();
    autoValue += 7;
    if(autoValue>500) autoValue=120;
  });
  $("memReiniciar").addEventListener("click", ()=>{
    mem=[...memInitial]; idx=0; suma=mem.reduce((a,b)=>a+b,0); autoValue=270;
    $("memNuevaMuestra").value=270;
    $("memEstado").textContent="Estado inicial del buffer circular.";
    renderMemPreview(270);
  });
  $("memNuevaMuestra").addEventListener("input",()=>renderMemPreview());

  // =========================================================
  // RUIDO + PROMEDIO MÓVIL
  // =========================================================
  const rc = $("ruidoCanvas");
  const rctx = rc.getContext("2d");
  let rTimer = null;
  let rK = 0;
  let rHist = [];
  let rBuf = [260,260,260,260,260];
  let rIdx = 0;
  let rSum = 1300;

  function prep(canvas){
    const dpr=Math.max(1,window.devicePixelRatio||1);
    const r=canvas.getBoundingClientRect();
    const w=Math.max(320,r.width),h=Math.max(240,r.height);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    const ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }

  function resetNoise() {
    const media=Number($("ruidoMedia").value);
    rK=0;rHist=[];rBuf=[media,media,media,media,media];rIdx=0;rSum=media*5;
    updateNoiseMetrics();
    drawNoise();
  }

  function noiseStep() {
    const media=Number($("ruidoMedia").value);
    const amp=Number($("ruidoAmp").value);
    const raw=Math.max(0,Math.min(511,Math.round(media + (Math.random()*2-1)*amp)));

    rSum -= rBuf[rIdx];
    rBuf[rIdx]=raw;
    rSum += raw;
    rIdx=(rIdx+1)%5;
    const filt=rSum/5;

    rHist.push({k:rK++,raw,filt});
    if(rHist.length>100)rHist.shift();

    updateNoiseMetrics();
    drawNoise();
  }

  function updateNoiseMetrics(){
    const raw=rHist.map(p=>p.raw),fil=rHist.map(p=>p.filt);
    const pp=a=>a.length?Math.max(...a)-Math.min(...a):NaN;
    const last=rHist[rHist.length-1];

    $("ruidoAdcActual").textContent=last?last.raw:"—";
    $("ruidoAdcfActual").textContent=last?last.filt.toFixed(1):"—";
    $("ruidoAdcPP").textContent=raw.length?`${pp(raw).toFixed(0)} cuentas`:"—";
    $("ruidoAdcfPP").textContent=fil.length?`${pp(fil).toFixed(1)} cuentas`:"—";
    $("ruidoVentana").textContent=`[${rBuf.map(v=>Math.round(v)).join(", ")}]`;
  }

  function drawNoise(){
    const {ctx,w,h}=prep(rc);
    ctx.clearRect(0,0,w,h);
    const L=48,R=14,T=18,B=30,pw=w-L-R,ph=h-T-B;
    ctx.strokeStyle="#172430";ctx.lineWidth=1;
    for(let i=0;i<=10;i++){let x=L+pw*i/10;ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,T+ph);ctx.stroke()}
    for(let i=0;i<=4;i++){let y=T+ph*i/4;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(L+pw,y);ctx.stroke()}

    if(!rHist.length)return;
    const all=rHist.flatMap(p=>[p.raw,p.filt]);
    let min=Math.max(0,Math.min(...all)-20),max=Math.min(511,Math.max(...all)+20);
    if(max-min<80){const m=(max+min)/2;min=Math.max(0,m-40);max=Math.min(511,m+40)}
    const x=i=>L+(i/Math.max(1,rHist.length-1))*pw;
    const y=v=>T+ph-(v-min)/Math.max(1,max-min)*ph;

    ctx.strokeStyle="#45d4ff";ctx.lineWidth=1.7;ctx.beginPath();
    rHist.forEach((p,i)=>{if(i===0)ctx.moveTo(x(i),y(p.raw));else ctx.lineTo(x(i),y(p.raw))});ctx.stroke();

    ctx.strokeStyle="#82f28f";ctx.lineWidth=2;ctx.beginPath();
    rHist.forEach((p,i)=>{if(i===0)ctx.moveTo(x(i),y(p.filt));else ctx.lineTo(x(i),y(p.filt))});ctx.stroke();

    ctx.fillStyle="#71869a";ctx.font="11px Arial";
    ctx.fillText(`${min.toFixed(0)}`,6,T+ph);
    ctx.fillText(`${max.toFixed(0)}`,6,T+10);
  }

  function restartNoiseTimer(){
    if(rTimer)clearInterval(rTimer);
    rTimer=setInterval(noiseStep,Number($("ruidoVel").value));
  }

  $("ruidoRun").addEventListener("click",restartNoiseTimer);
  $("ruidoStop").addEventListener("click",()=>{if(rTimer){clearInterval(rTimer);rTimer=null}});
  $("ruidoEstable").addEventListener("click",()=>{$("ruidoAmp").value=4;$("ruidoAmpOut").textContent="±4"});
  $("ruidoSubir").addEventListener("click",()=>{
    const v=Math.min(460,Number($("ruidoMedia").value)+120);
    $("ruidoMedia").value=v;$("ruidoMediaOut").textContent=v;
  });
  $("ruidoBajar").addEventListener("click",()=>{
    const v=Math.max(50,Number($("ruidoMedia").value)-120);
    $("ruidoMedia").value=v;$("ruidoMediaOut").textContent=v;
  });
  $("ruidoReset").addEventListener("click",resetNoise);
  $("ruidoMedia").addEventListener("input",()=>{$("ruidoMediaOut").textContent=$("ruidoMedia").value});
  $("ruidoAmp").addEventListener("input",()=>{$("ruidoAmpOut").textContent=`±${$("ruidoAmp").value}`});
  $("ruidoVel").addEventListener("input",()=>{
    $("ruidoVelOut").textContent=`${$("ruidoVel").value} ms`;
    if(rTimer)restartNoiseTimer();
  });

  // =========================================================
  // Ts vs Proc
  // =========================================================
  function updateTiming(){
    const ts=Number($("tempTs").value);       // ms
    const procUs=Number($("tempProc").value); // us
    const procMs=procUs/1000;
    const occ=(procMs/ts)*100;
    const margen=ts-procMs;

    $("tempTsOut").textContent=`${ts.toFixed(0)} ms`;
    $("tempProcOut").textContent=`${procMs.toFixed(3)} ms`;
    $("tempMTs").textContent=`${ts.toFixed(3)} ms`;
    $("tempMProc").textContent=`${procMs.toFixed(3)} ms`;
    $("tempOcupacion").textContent=`${occ.toFixed(2)} %`;
    $("tempMargen").textContent=`${margen.toFixed(3)} ms`;
    $("tempAxisEnd").textContent=`${ts.toFixed(0)} ms`;

    const status=$("tempStatus");
    status.className="status";

    let procPct=Math.max(0,Math.min(100,occ));
    $("tempProcBar").style.width=`${procPct}%`;
    $("tempFreeBar").style.width=`${Math.max(0,100-procPct)}%`;
    $("tempProcBar").classList.toggle("over",procMs>ts);

    if(procMs < ts*0.8){
      $("tempCondicion").textContent="CON MARGEN";
      status.classList.add("good");
      status.textContent=`El procesamiento ocupa ${occ.toFixed(2)} % del periodo. Quedan ${margen.toFixed(3)} ms antes de la siguiente muestra.`;
    }else if(procMs <= ts){
      $("tempCondicion").textContent="POCO MARGEN";
      status.classList.add("warn");
      status.textContent=`El procesamiento todavía cabe dentro de Ts, pero queda poco margen temporal.`;
    }else{
      $("tempCondicion").textContent="NO CABE";
      status.classList.add("bad");
      status.textContent=`Proc supera Ts en ${(procMs-ts).toFixed(3)} ms. El cálculo no termina antes del siguiente instante de muestreo.`;
    }
  }

  $("tempTs").addEventListener("input",updateTiming);
  $("tempProc").addEventListener("input",updateTiming);

  window.addEventListener("resize",()=>drawNoise());

  renderMemPreview(270);
  resetNoise();
  updateTiming();
})();
