/* Exhaustive trie search. No score pruning or search-result limit. */
(function(root){
class WordplayEngine {
 constructor(list,values,premiums){this.words=new Set(list);this.values=values;this.premiums=premiums;this.root={next:Object.create(null),word:null};for(const w of list){if(!/^[A-Z]{2,15}$/.test(w))continue;let node=this.root;for(const ch of w)node=node.next[ch]||(node.next[ch]={next:Object.create(null),word:null});node.word=w}}
 search(board,blanks,rack){
 const zero=new Set(blanks),values=this.values,premiums=this.premiums,hasTiles=board.some(Boolean),results=new Map(),initial={};for(const c of rack)initial[c]=(initial[c]||0)+1;
 const at=(r,c)=>r>=0&&r<15&&c>=0&&c<15?board[r*15+c]:'';
 for(const [dr,dc] of [[0,1],[1,0]]){
 const checks=Array(225),anchors=Array(225).fill(false);
 for(let r=0;r<15;r++)for(let c=0;c<15;c++){const i=r*15+c;if(board[i]){anchors[i]=true;continue}let pre='',post='',sum=0;for(let d=1;at(r-d*dc,c-d*dr);d++){const j=(r-d*dc)*15+c-d*dr;pre=board[j]+pre;sum+=zero.has(j)?0:values[board[j]]}for(let d=1;at(r+d*dc,c+d*dr);d++){const j=(r+d*dc)*15+c+d*dr;post+=board[j];sum+=zero.has(j)?0:values[board[j]]}const crossing=!!(pre||post);checks[i]={crossing,sum,allowed:crossing?new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(ch=>this.words.has(pre+ch+post))):null};anchors[i]=hasTiles?crossing:i===112}
 for(let sr=0;sr<15;sr++)for(let sc=0;sc<15;sc++){
 if(at(sr-dr,sc-dc))continue;
 // A connected word must reach an anchor using at most the rack's tiles.
 let canReach=false,used=0;for(let r=sr,c=sc;r<15&&c<15;r+=dr,c+=dc){let i=r*15+c;if(!board[i])used++;if(used>rack.length)break;if(anchors[i]){canReach=true;break}}if(!canReach)continue;
 const counts={...initial},placed=[];
 const walk=(r,c,node,sum,mult,cross,connected,length)=>{
 if(node.word&&placed.length&&connected&&!at(r,c)){
 const score=sum*mult+cross+(placed.length===7?50:0),key=placed.map(p=>p.i+':'+p.c+(p.blank?'?':'')).sort().join(',');let old=results.get(key);if(!old||score>old.score)results.set(key,{w:node.word,r:sr,c:sc,dr,dc,placed:placed.map(p=>({...p})),score,left:Object.entries(counts).map(([ch,n])=>ch.repeat(n)).join('')});
 }
 if(r>14||c>14||length===15)return;const i=r*15+c,old=board[i];if(old){let next=node.next[old];if(next)walk(r+dr,c+dc,next,sum+(zero.has(i)?0:values[old]),mult,cross,true,length+1);return}
 if(placed.length===rack.length)return;const check=checks[i],pr=premiums[i],lm=pr==='tl'?3:pr==='dl'?2:1,wm=pr==='tw'?3:pr==='dw'?2:1;
 for(const ch in node.next){if(check.allowed&&!check.allowed.has(ch))continue;for(const blank of [false,true]){const tile=blank?'?':ch;if(!counts[tile])continue;counts[tile]--;placed.push({i,c:ch,blank});const value=blank?0:values[ch];walk(r+dr,c+dc,node.next[ch],sum+value*lm,mult*wm,cross+(check.crossing?(check.sum+value*lm)*wm:0),connected||anchors[i],length+1);placed.pop();counts[tile]++}}
 };
 walk(sr,sc,this.root,0,1,0,false,0);
 }
 }
 return [...results.values()].sort((a,b)=>b.score-a.score||a.w.localeCompare(b.w)||a.r-b.r||a.c-b.c);
 }
}
if(typeof module!=='undefined')module.exports=WordplayEngine;else root.WordplayEngine=WordplayEngine;
})(typeof self!=='undefined'?self:this);
