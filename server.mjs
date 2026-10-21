import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'})[ext]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('FRI ATLAS Local: http://127.0.0.1:4173'));
