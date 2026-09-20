(()=>{
const $=id=>document.getElementById(id);
const minInput=$('minInput'),maxInput=$('maxInput'),unitSelect=$('unitSelect'),otherUnitWrap=$('otherUnitWrap'),otherUnitInput=$('otherUnitInput'),applyCustom=$('applyCustom');
const minLabel=$('minLabel'),maxLabel=$('maxLabel'),scaleText=$('scaleText');
const prevSlider=$('prevSlider'),prevNumber=$('prevNumber'),prevDisplay=$('prevDisplay');
const inputSlider=$('inputSlider'),inputNumber=$('inputNumber'),inputDisplay=$('inputDisplay');
const markerPrev=$('markerPrev'),markerInput=$('markerInput'),markerOut=$('markerOut');
const markerPrevText=$('markerPrevText'),markerInputText=$('markerInputText'),markerOutText=$('markerOutText');
const coherence=$('coherence'),calcLine1=$('calcLine1'),calcLine2=$('calcLine2'),calcLine3=$('calcLine3');
const calculateBtn=$('calculateBtn'),resetBtn=$('resetBtn'),historyBody=$('historyBody'),kLabel=$('kLabel');

let min=0,max=100,unit='%',k=1,history=[];
const A=.8,B=.2;

const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'').replace('.',',');
const txt=n=>`${fmt(n)}${unit?` ${unit}`:''}`;
const inside=n=>Number.isFinite(n)&&n>=min&&n<=max;
const clamp=n=>Math.min(max,Math.max(min,n));
const pos=n=>((clamp(n)-min)/((max-min)||1))*100;

function selectedUnit(){
  return unitSelect.value==='__other__' ? otherUnitInput.value.trim() : unitSelect.value;
}

unitSelect.addEventListener('change',()=>{
  const isOther=unitSelect.value==='__other__';
  otherUnitWrap.classList.toggle('hidden',!isOther);
  if(isOther) otherUnitInput.focus();
});

function updatePreview(){
  const yp=Number(prevNumber.value);
  const u=Number(inputNumber.value);
  const p1=A*yp,p2=B*u,out=p1+p2;

  prevDisplay.textContent=txt(yp);
  inputDisplay.textContent=txt(u);

  calcLine1.textContent=`y[k] = 0,8 × ${fmt(yp)} + 0,2 × ${fmt(u)}`;
  calcLine2.textContent=`y[k] = ${fmt(p1)} + ${fmt(p2)}`;
  calcLine3.textContent=`y[k] = ${txt(out)}`;

  markerPrev.style.left=`${pos(yp)}%`;
  markerInput.style.left=`${pos(u)}%`;
  markerOut.style.left=`${pos(out)}%`;

  markerPrevText.textContent=txt(yp);
  markerInputText.textContent=txt(u);
  markerOutText.textContent=txt(out);

  if(inside(yp)&&inside(u)){
    coherence.textContent=`Ambos valores están dentro de la escala ${txt(min)} a ${txt(max)}.`;
  }else{
    coherence.textContent=`Hay un valor fuera de la escala ${txt(min)} a ${txt(max)}.`;
  }
}

function setScale(a,b,newUnit){
  min=a;max=b;unit=newUnit;
  minInput.value=min;maxInput.value=max;

  minLabel.textContent=txt(min);
  maxLabel.textContent=txt(max);
  scaleText.textContent=`${txt(min)} a ${txt(max)}`;

  [prevSlider,inputSlider].forEach(el=>{
    el.min=min;el.max=max;el.step=1;
  });

  prevNumber.min=min;prevNumber.max=max;
  inputNumber.min=min;inputNumber.max=max;

  const initialPrev=min+(max-min)*.2;
  prevSlider.value=initialPrev;
  prevNumber.value=initialPrev;
  inputSlider.value=max;
  inputNumber.value=max;

  k=1;
  history=[];
  kLabel.textContent=k;
  renderHistory();
  updatePreview();
}

function calculateAndAdvance(){
  const yp=Number(prevNumber.value);
  const u=Number(inputNumber.value);

  if(!inside(yp)||!inside(u)){
    coherence.textContent=`Primero coloca ambos valores dentro de la escala ${txt(min)} a ${txt(max)}.`;
    return;
  }

  const out=A*yp+B*u;

  history.push({k,input:u,previous:yp,output:out});
  renderHistory();

  k++;
  kLabel.textContent=k;

  prevSlider.value=out;
  prevNumber.value=out;

  updatePreview();
  coherence.textContent=`Ahora y[k-1] = ${txt(out)} porque fue la salida calculada en la muestra anterior.`;
}

function renderHistory(){
  historyBody.innerHTML='';
  history.slice(-6).forEach(x=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${x.k}</td><td>${txt(x.input)}</td><td>${txt(x.previous)}</td><td>${txt(x.output)}</td>`;
    historyBody.appendChild(tr);
  });
}

applyCustom.addEventListener('click',()=>{
  const a=Number(minInput.value);
  const b=Number(maxInput.value);
  const newUnit=selectedUnit();

  if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a){
    coherence.textContent='La escala es inválida: el máximo debe ser mayor que el mínimo.';
    return;
  }

  setScale(a,b,newUnit);
});

prevSlider.addEventListener('input',e=>{
  prevNumber.value=e.target.value;
  updatePreview();
});
prevNumber.addEventListener('input',e=>{
  prevSlider.value=clamp(Number(e.target.value));
  updatePreview();
});
inputSlider.addEventListener('input',e=>{
  inputNumber.value=e.target.value;
  updatePreview();
});
inputNumber.addEventListener('input',e=>{
  inputSlider.value=clamp(Number(e.target.value));
  updatePreview();
});

calculateBtn.addEventListener('click',calculateAndAdvance);

resetBtn.addEventListener('click',()=>{
  minInput.value=0;
  maxInput.value=100;
  unitSelect.value='%';
  otherUnitWrap.classList.add('hidden');
  otherUnitInput.value='';
  setScale(0,100,'%');
});

setScale(0,100,'%');
})();