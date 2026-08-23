
const canvas=document.getElementById("grafico");
const ctx=canvas.getContext("2d");

const fmax=10;
const f=10;

function simular(fs){

ctx.clearRect(0,0,1200,600);

let Ts=1/fs;
let muestras=[];

let offset=Ts*0.25;

for(let t=offset;t<=1;t+=Ts){
    muestras.push({
        t:t,
        y:Math.sin(2*Math.PI*f*t)
    });
}


let estado;

if(fs<20){
    estado="Muestreo insuficiente - posible aliasing";
}
else if(fs===20){
    estado="Límite teórico de Nyquist";
}
else if(fs<60){
    estado="Muestreo suficiente con representación aceptable";
}
else{
    estado="Representación cercana a la señal continua";
}


document.getElementById("info").innerHTML=
"fs = "+fs+" Hz | "+
"Relación = "+(fs/fmax).toFixed(1)+" × fmax | "+
"Ts = "+Ts.toFixed(4)+" s | "+
"Muestras/ciclo = "+(fs/f).toFixed(1)+
" | "+estado;


function X(t){
return 80+t*1050;
}

function Y(v){
return 300-v*200;
}


// Señal original

ctx.strokeStyle="#38bdf8";
ctx.lineWidth=3;
ctx.beginPath();

for(let i=0;i<=2000;i++){

let t=i/2000;
let y=Math.sin(2*Math.PI*f*t);

if(i===0)
ctx.moveTo(X(t),Y(y));
else
ctx.lineTo(X(t),Y(y));

}

ctx.stroke();


// Reconstrucción por muestras

ctx.strokeStyle="#ef4444";
ctx.setLineDash([10,8]);
ctx.lineWidth=2;
ctx.beginPath();

muestras.forEach((p,i)=>{

if(i===0)
ctx.moveTo(X(p.t),Y(p.y));
else
ctx.lineTo(X(p.t),Y(p.y));

});

ctx.stroke();
ctx.setLineDash([]);



// Puntos

ctx.fillStyle="#facc15";

muestras.forEach(p=>{

ctx.beginPath();
ctx.arc(X(p.t),Y(p.y),5,0,Math.PI*2);
ctx.fill();

});

ctx.fillStyle="white";
ctx.font="15px Arial";

ctx.fillText("Azul: señal real 10 Hz",80,40);
ctx.fillText("Amarillo: muestras tomadas por el controlador",80,65);
ctx.fillText("Rojo punteado: señal reconstruida desde muestras",80,90);

}

simular(40);
