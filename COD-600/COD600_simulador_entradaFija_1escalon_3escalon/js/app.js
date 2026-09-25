(() => {
  const $ = (id) => document.getElementById(id);
  const els = {
    inputMode: $('inputMode'), fixedInputField: $('fixedInputField'), inputValue: $('inputValue'),
    oneStepFields: $('oneStepFields'), oneStepInitial: $('oneStepInitial'), oneStepFinal: $('oneStepFinal'), oneStepAt: $('oneStepAt'),
    stepInputFields: $('stepInputFields'), stepInitial: $('stepInitial'), step1Value: $('step1Value'), step1At: $('step1At'), step2Value: $('step2Value'), step2At: $('step2At'), step3Value: $('step3Value'), step3At: $('step3At'),
    correctInit: $('correctInit'), wrongInit: $('wrongInit'), stepBtn: $('stepBtn'), lowerStepBtn: $('lowerStepBtn'), autoBtn: $('autoBtn'), resetBtn: $('resetBtn'),
    sampleIndex: $('sampleIndex'), correctStatus: $('correctStatus'), errorStatus: $('errorStatus'), differenceValue: $('differenceValue'),
    correctInput: $('correctInput'), correctPrev: $('correctPrev'), correctCurrent: $('correctCurrent'), errorInput: $('errorInput'), errorPrev: $('errorPrev'), errorCurrent: $('errorCurrent'),
    correctSubstitution: $('correctSubstitution'), errorSubstitution: $('errorSubstitution'), correctInitDisplay: $('correctInitDisplay'), wrongInitDisplay: $('wrongInitDisplay'),
    explainBody: $('explainBody'), keyIdea: $('keyIdea'), dataBody: $('dataBody'), chart: $('chart')
  };

  const ctx = els.chart.getContext('2d');
  let state = {k:-1, correctPrev:0, errorPrev:75, data:[], timer:null};
  const fmt = (v,d=3) => Number.isFinite(v) ? v.toFixed(d).replace('.',',') : '—';

  function clampNumber(el,min=-200,max=200,fallback=0){
    let v=Number(el.value); if(!Number.isFinite(v)) v=fallback; v=Math.max(min,Math.min(max,v)); el.value=String(v); return v;
  }
  function clampInt(el,min,max,fallback){
    let v=Math.round(Number(el.value)); if(!Number.isFinite(v)) v=fallback; v=Math.max(min,Math.min(max,v)); el.value=String(v); return v;
  }
  function mode(){ return els.inputMode.value; }
  function isOneStep(){ return mode()==='oneStep'; }
  function isThreeSteps(){ return mode()==='threeSteps'; }

  function getOneStepParams(){
    const initial = clampNumber(els.oneStepInitial,-200,200,0);
    const finalV = clampNumber(els.oneStepFinal,-200,200,100);
    const k = clampInt(els.oneStepAt,0,30,4);
    return {initial, finalV, k};
  }

  function getThreeStepParams(){
    const initial=clampNumber(els.stepInitial,-200,200,0);
    const v1=clampNumber(els.step1Value,-200,200,100);
    const v2=clampNumber(els.step2Value,-200,200,40);
    const v3=clampNumber(els.step3Value,-200,200,80);
    let k1=clampInt(els.step1At,0,28,4);
    let k2=clampInt(els.step2At,k1+1,29,Math.max(8,k1+1));
    let k3=clampInt(els.step3At,k2+1,30,Math.max(12,k2+1));
    els.step2At.min=String(k1+1); els.step3At.min=String(k2+1);
    return {initial,v1,k1,v2,k2,v3,k3};
  }

  function updateInputControls(){
    const m = mode();
    els.fixedInputField.classList.toggle('hidden', m!=='fixed');
    els.oneStepFields.classList.toggle('hidden', m!=='oneStep');
    els.stepInputFields.classList.toggle('hidden', m!=='threeSteps');
    updateExplanation();
  }

  function getInputForK(k){
    if(mode()==='fixed') return clampNumber(els.inputValue,-200,200,100);
    if(mode()==='oneStep'){
      const p = getOneStepParams();
      return k < p.k ? p.initial : p.finalV;
    }
    const p=getThreeStepParams();
    if(k<p.k1) return p.initial;
    if(k<p.k2) return p.v1;
    if(k<p.k3) return p.v2;
    return p.v3;
  }

  function updateExplanation(){
    if(mode()==='fixed'){
      const u = clampNumber(els.inputValue,-200,200,100);
      els.explainBody.innerHTML = `<p>La <strong>ecuación es la misma</strong> en ambos casos.</p><p>La entrada <strong>u[k]</strong> permanece constante en <strong>${fmt(u,0)}</strong> durante toda la ejecución.</p><p>La diferencia inicial entre las curvas se debe únicamente al valor de <strong>y[-1]</strong>.</p>`;
      els.keyIdea.textContent = 'Con entrada fija se observa claramente el efecto de la condición inicial.';
      return;
    }
    if(mode()==='oneStep'){
      const p = getOneStepParams();
      els.explainBody.innerHTML = `<p>La entrada inicia en <strong>${fmt(p.initial,0)}</strong> y cambia a <strong>${fmt(p.finalV,0)}</strong> en <strong>k = ${p.k}</strong>.</p><p>Observe que <strong>u[k]</strong> cambia de golpe una sola vez, mientras <strong>y[k]</strong> responde de forma gradual.</p><p>La curva verde parte de la condición inicial correcta y la roja de la condición inicial incorrecta.</p>`;
      els.keyIdea.textContent = 'Un escalón cambia la entrada bruscamente; la salida se aproxima muestra por muestra.';
      return;
    }
    const p=getThreeStepParams();
    els.explainBody.innerHTML = `<p>La entrada inicia en <strong>${fmt(p.initial,0)}</strong>.</p><p>Luego cambia a <strong>${fmt(p.v1,0)}</strong> en k=${p.k1}, a <strong>${fmt(p.v2,0)}</strong> en k=${p.k2} y a <strong>${fmt(p.v3,0)}</strong> en k=${p.k3}.</p><p>Observe que la entrada cambia bruscamente, mientras la salida la sigue de forma gradual.</p>`;
    els.keyIdea.textContent = 'Cada escalón cambia u[k] de golpe; y[k] responde progresivamente muestra por muestra.';
  }

  function reset(){
    stopAuto(); updateInputControls();
    const c=clampNumber(els.correctInit,-200,200,0), e=clampNumber(els.wrongInit,-200,200,75);
    state={k:-1,correctPrev:c,errorPrev:e,data:[],timer:null};
    els.correctInitDisplay.textContent=c; els.wrongInitDisplay.textContent=e; render();
  }

  function step(){
    if(state.k>=30){ stopAuto(); return; }
    state.k+=1; const input=getInputForK(state.k);
    const cp=state.correctPrev, cy=0.8*cp+0.2*input; state.correctPrev=cy;
    const ep=state.errorPrev, ey=0.8*ep+0.2*input; state.errorPrev=ey;
    state.data.push({k:state.k,input,correctPrevUsed:cp,correctY:cy,errorPrevUsed:ep,errorY:ey,difference:ey-cy});
    render();
  }

  function render(){
    updateExplanation();
    const last=state.data[state.data.length-1], input=last?last.input:getInputForK(0);
    els.sampleIndex.textContent=`k = ${state.k<0?'−1':state.k}`;
    els.correctStatus.textContent=fmt(state.correctPrev,1); els.errorStatus.textContent=fmt(state.errorPrev,1); els.differenceValue.textContent=last?fmt(last.difference,3):'0,000';
    els.correctInput.textContent=fmt(input,1); els.errorInput.textContent=fmt(input,1);
    if(last){
      els.correctPrev.textContent=fmt(last.correctPrevUsed,1); els.correctCurrent.textContent=fmt(last.correctY,3); els.errorPrev.textContent=fmt(last.errorPrevUsed,1); els.errorCurrent.textContent=fmt(last.errorY,3);
      els.correctSubstitution.textContent=`y[${last.k}] = 0,8 × ${fmt(last.correctPrevUsed,1)} + 0,2 × ${fmt(last.input,1)} = ${fmt(last.correctY,3)}`;
      els.errorSubstitution.textContent=`y[${last.k}] = 0,8 × ${fmt(last.errorPrevUsed,1)} + 0,2 × ${fmt(last.input,1)} = ${fmt(last.errorY,3)}`;
    } else {
      els.correctPrev.textContent=fmt(state.correctPrev,1); els.correctCurrent.textContent='—'; els.errorPrev.textContent=fmt(state.errorPrev,1); els.errorCurrent.textContent='—';
      els.correctSubstitution.textContent='Aún no se calculó ninguna muestra.'; els.errorSubstitution.textContent='Aún no se calculó ninguna muestra.';
    }
    renderTable(); drawChart();
  }

  function renderTable(){
    if(!state.data.length){ els.dataBody.innerHTML='<tr class="empty-row"><td colspan="5">Pulse “Siguiente muestra” para iniciar.</td></tr>'; return; }
    els.dataBody.innerHTML=state.data.slice(-16).map(r=>`<tr><td>${r.k}</td><td>${fmt(r.input,1)}</td><td>${fmt(r.correctY,3)}</td><td class="error-cell">${fmt(r.errorY,3)}</td><td class="diff-cell">${fmt(r.difference,3)}</td></tr>`).join('');
  }

  function drawChart(){
    const canvas=els.chart,dpr=window.devicePixelRatio||1,cssW=canvas.clientWidth||1200,cssH=canvas.clientHeight||330;
    canvas.width=Math.round(cssW*dpr); canvas.height=Math.round(cssH*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    const w=cssW,h=cssH; ctx.clearRect(0,0,w,h); const pad={l:58,r:22,t:22,b:44},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;

    let values=[];
    if(mode()==='fixed') values.push(clampNumber(els.inputValue,-200,200,100));
    else if(mode()==='oneStep'){ const p=getOneStepParams(); values.push(p.initial,p.finalV); }
    else { const p=getThreeStepParams(); values.push(p.initial,p.v1,p.v2,p.v3); }
    values.push(clampNumber(els.correctInit,-200,200,0),clampNumber(els.wrongInit,-200,200,75));
    state.data.forEach(r=>values.push(r.input,r.correctY,r.errorY));
    const rawMin=Math.min(...values,0),rawMax=Math.max(...values,0),span=Math.max(20,rawMax-rawMin),yMin=Math.floor((rawMin-span*.08)/20)*20,yMax=Math.ceil((rawMax+span*.08)/20)*20;
    const maxK=Math.max(16,state.data.length?state.data[state.data.length-1].k:16);
    const x=k=>pad.l+(k/maxK)*pw,y=v=>pad.t+(yMax-v)/(yMax-yMin)*ph;

    ctx.lineWidth=1; ctx.strokeStyle='#274062'; ctx.fillStyle='#9db0cf'; ctx.font='12px system-ui';
    for(let i=0;i<=5;i++){ const val=yMin+(yMax-yMin)*i/5,yy=y(val); ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(fmt(val,0),pad.l-8,yy); }
    for(let i=0;i<=8;i++){ const kval=Math.round(maxK*i/8),xx=x(kval); ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(String(kval),xx,h-pad.b+8); }
    ctx.strokeStyle='#8fb2dd';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();
    ctx.save();ctx.translate(16,pad.t+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillStyle='#cfe0fb';ctx.font='700 13px system-ui';ctx.fillText('Valor',0,0);ctx.restore();ctx.textAlign='center';ctx.fillText('k (muestras)',pad.l+pw/2,h-8);

    if(mode()==='oneStep'){
      const p = getOneStepParams();
      if(p.k<=maxK){ const xx=x(p.k); ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle='#ffc946';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffd467';ctx.font='700 11px system-ui';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(`escalón · k=${p.k}`,Math.min(xx+4,w-95),pad.t+4);ctx.restore(); }
    }
    if(mode()==='threeSteps'){
      const p=getThreeStepParams();
      [[p.k1,'1'],[p.k2,'2'],[p.k3,'3']].forEach(([kk,label],idx)=>{
        if(kk<=maxK){ const xx=x(kk); ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle='#ffc946';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffd467';ctx.font='700 11px system-ui';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(`escalón ${label} · k=${kk}`,Math.min(xx+4,w-110),pad.t+4+idx*14);ctx.restore(); }
      });
    }

    if(!state.data.length) return;
    drawSeries(state.data.map(r=>[r.k,r.input]),'#78aaff',2.4,false,mode()!=='fixed');
    drawSeries(state.data.map(r=>[r.k,r.correctY]),'#29c274',2.8,true,false);
    drawSeries(state.data.map(r=>[r.k,r.errorY]),'#ff5c67',2.8,true,false);

    function drawSeries(points,color,width,dots,stepped){
      if(!points.length)return;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x(points[0][0]),y(points[0][1]));
      for(let i=1;i<points.length;i++){ const prevV=points[i-1][1],[kx,vy]=points[i]; if(stepped){ctx.lineTo(x(kx),y(prevV));ctx.lineTo(x(kx),y(vy));}else ctx.lineTo(x(kx),y(vy)); }
      ctx.stroke(); if(dots) points.forEach(([kx,vy])=>{ctx.beginPath();ctx.arc(x(kx),y(vy),3.6,0,Math.PI*2);ctx.fill();});
    }
  }

  function toggleAuto(){ if(state.timer)return stopAuto(); els.autoBtn.textContent='Detener'; els.autoBtn.classList.add('active'); state.timer=setInterval(()=>{step();if(state.k>=30)stopAuto();},550); }
  function stopAuto(){ if(state.timer)clearInterval(state.timer); state.timer=null; els.autoBtn.textContent='Ejecutar'; els.autoBtn.classList.remove('active'); }

  els.stepBtn.addEventListener('click',step); els.lowerStepBtn.addEventListener('click',step); els.autoBtn.addEventListener('click',toggleAuto); els.resetBtn.addEventListener('click',reset);
  els.inputMode.addEventListener('change',reset); els.inputValue.addEventListener('change',reset); els.correctInit.addEventListener('change',reset); els.wrongInit.addEventListener('change',reset);
  [els.oneStepInitial, els.oneStepFinal, els.oneStepAt, els.stepInitial, els.step1Value, els.step1At, els.step2Value, els.step2At, els.step3Value, els.step3At].forEach(el=>el.addEventListener('change',reset));
  window.addEventListener('resize',drawChart);
  reset();
})();
