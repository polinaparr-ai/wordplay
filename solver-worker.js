importScripts('engine.js');
self.onmessage=({data})=>{try{const started=performance.now();const engine=new WordplayEngine(data.words,data.values,data.premiums);const moves=engine.search(data.board,data.blanks,data.rack);postMessage({moves,elapsed:Math.round(performance.now()-started)})}catch(error){postMessage({error:error.message})}};
