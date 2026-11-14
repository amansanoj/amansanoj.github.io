import sharp, {type OverlayOptions} from 'sharp';
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import tokens from '../../public/assets/vendor/brand-tokens.json';

// Static counterpart to the profile's name-and-projects header. All colors and
// font families come from the same brand tokens as the website.
export async function prepareSiteOg(){
 const palette=tokens.color.hex.dark;
 const {background,text,primary,secondary}=palette.base;
 const muted=palette.text['300'],border=palette.primary['800'],panel=palette.primary['900'];
 const layout=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
 <rect width="1200" height="630" fill="${background}"/>
 <rect x="646" y="76" width="490" height="440" rx="16" fill="${panel}" stroke="${border}" stroke-width="2"/>
 <path d="M646 146H1136 M64 552H1136" stroke="${border}" stroke-width="2"/>
 <path d="M674 99h14l7 7v19h-21z M688 99v8h7" fill="none" stroke="${muted}" stroke-width="2"/>
 </svg>`;
 const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const overlays:OverlayOptions[]=[];
 async function label(text:string,left:number,top:number,size:number,color:string,display=false,bold=false){
  const family=(display?tokens.typography.family.display:tokens.typography.family.body).split(',')[0]!.replace(/'/g,'');
  const image=await sharp({text:{text:`<span foreground="${color}"${bold?' weight="600"':''}>${escape(text)}</span>`,font:`${family} ${size}`,fontfile:path.resolve(`public/assets/fonts/${display?'InstrumentSans':'Geist'}.ttf`),rgba:true,dpi:72}}).png().toBuffer();
  overlays.push({input:image,left,top});
 }
 await label('Aman',64,144,104,text,true,true);
 await label('Sanoj',64,254,104,text,true,true);
 await label('Software & Embedded Systems',67,394,27,primary);
 await label('Swift · TypeScript · Go · C++',67,444,19,muted);
 await label('projects.toml',712,104,18,muted);
 for(const [index,section] of [
  ['Apps','Macro Pad','SwiftUI / CoreBluetooth'],
  ['Web','Tether','TypeScript / Bun'],
  ['Firmware','NeonOS','C++ / ESP32'],
 ].entries()){
  const top=174+index*106;
  await label(`[${section[0]}]`,674,top,18,primary);
  await label(section[1]!,674,top+29,26,secondary,false,true);
  await label(section[2]!,674,top+64,16,muted);
 }
 await label('amansanoj.is-a.dev',64,576,22,primary);
 await label('Projects · About · Blog',884,580,16,muted);
 await mkdir('public/assets/og',{recursive:true});
 await sharp(Buffer.from(layout)).composite(overlays).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile('public/assets/og/site.jpg');
}
