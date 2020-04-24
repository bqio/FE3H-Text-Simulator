const GLYPH_W=48,GLYPH_H=52,GLYPH_MARGIN=2,SPACE_SIZE=15,NAME_POS_X_START=100,NAME_POS_X_END=495,NAME_POS_Y=222,TEXT_POS_X=305,TEXT_POS_Y=305,MAX_TEXT_ROW=3;new Vue({el:"#app",data:{meta:{},glyph_meta:{},char:"Anna",name:"Anna",text:"Hello, friend!\nHow are you?",emotion:"",emotions:[],error:"",canvas:null,ctx:null,resources:{}},methods:{init(){return new Promise(async a=>{this.canvas=this.$refs.canvas,this.ctx=this.canvas.getContext("2d"),this.resources.text_box=await this.preloadImage("img/textbox.png"),this.resources.font_c=await this.preloadImage("img/fc.png"),this.resources.font=await this.preloadImage("img/f.png"),this.resources.mask=await this.preloadImage("img/mask.png"),this.emotion=this.emotions[0],a()})},async renderNewPortrait(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.drawImage(this.resources.text_box,0,0);try{this.drawName(this.name),this.drawText(this.text),this.error=""}catch(a){this.error="Unknown glyph. See glyph_meta.json"}await this.drawPortrait(this.char,this.emotion)},render(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.drawImage(this.resources.text_box,0,0);try{this.drawName(this.name),this.drawText(this.text),this.error=""}catch(a){this.error="Unknown glyph. See glyph_meta.json"}this.ctx.drawImage(this.resources.portrait,1200,0)},preloadImage(a){return new Promise((b,c)=>{const d=new Image;d.onload=()=>b(d),d.onabort=a=>c(a),d.src=a})},rowLimit(a){if("Enter"==a.code&&this.text.split("\n").length==MAX_TEXT_ROW)return a.preventDefault(),!1},download(a){a.target.download=`${this.name}.png`,a.target.href=this.canvas.toDataURL("image/png").replace("image/png","image/octet-stream")},createTempCanvas(a,b){const c=document.createElement("canvas");return c.width=a,c.height=b,c},drawName(a){if(""==a)return;const b=[];for(let c=0;c<a.length;c++){const d=this.createTempCanvas(GLYPH_W,GLYPH_H),e=d.getContext("2d"),f=this.glyph_meta[a[c]];e.drawImage(this.resources.font,f[0]*GLYPH_W,f[1]*GLYPH_H,GLYPH_W,GLYPH_H,0,0,GLYPH_W,GLYPH_H),b.push(trim(d))}let c=b.map(a=>a.width).reduce((a,b)=>a+=b),d=(NAME_POS_X_END-NAME_POS_X_START-c)/2+NAME_POS_X_START;for(let c=0;c<a.length;c++){const a=b[c];this.ctx.drawImage(a,d,NAME_POS_Y),d+=a.width}},drawText(a){let b=TEXT_POS_X,c=TEXT_POS_Y;for(let d=0;d<a.length;d++){const e=this.createTempCanvas(GLYPH_W,GLYPH_H),f=e.getContext("2d"),g=this.glyph_meta[a[d]];if("\n"==a[d]){b=TEXT_POS_X,c+=GLYPH_H;continue}if(" "==a[d]){b+=SPACE_SIZE;continue}f.drawImage(this.resources.font_c,g[0]*GLYPH_W,g[1]*GLYPH_H,GLYPH_W,GLYPH_H,0,0,GLYPH_W,GLYPH_H);const h=trim(e);this.ctx.drawImage(h,b,c),b+=h.width+GLYPH_MARGIN}},async drawPortrait(a,b){const c=await this.preloadImage(`img\\portraits\\${a}\\${b}.png`),d=this.createTempCanvas(c.width,c.height),e=d.getContext("2d");e.drawImage(this.resources.mask,0,0),e.globalCompositeOperation="source-in",e.drawImage(c,0,0),this.resources.portrait=d,this.ctx.drawImage(d,1200,0)}},watch:{async char(){this.emotions=this.meta[this.char],this.emotion=this.emotions[0],await this.renderNewPortrait()},async emotion(){await this.renderNewPortrait()},async name(){await this.render()},async text(){await this.render()}},async mounted(){let a=await fetch("data\\portrait_meta-m.json"),b=await a.json();this.meta=b,a=await fetch("data\\glyph_meta-m.json"),b=await a.json(),this.glyph_meta=b,this.emotions=this.meta[this.char],await this.init()}});function trim(a){var b,c,d,e=a.getContext("2d"),f=document.createElement("canvas").getContext("2d"),g=e.getImageData(0,0,a.width,a.height),h=g.data.length,j={top:null,left:null,right:null,bottom:null};for(b=0;b<h;b+=4)0!==g.data[b+3]&&(c=b/4%a.width,d=~~(b/4/a.width),null===j.top&&(j.top=d),null===j.left?j.left=c:c<j.left&&(j.left=c),null===j.right?j.right=c:j.right<c&&(j.right=c),null===j.bottom?j.bottom=d:j.bottom<d&&(j.bottom=d));var k=j.right+1-j.left,l=e.getImageData(j.left,0,k,a.height);return f.canvas.width=k,f.canvas.height=a.height,f.putImageData(l,0,0),f.canvas}