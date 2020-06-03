import LRU from 'lru-cache';
import https from 'https';

const cache = new LRU({
  max: 1024 * 1024 * 50,
  length(n, key) { return n.length; },
  maxAge: 1000 * 60 * 60,
});

const agent = new https.Agent({
  keepAlive: true,
});

export function fetch(url) {
  return new Promise((resolve, reject) => {
    const result = cache.get(url);

    if (result !== undefined) {
      resolve(result);
      return;
    }

    const options = {
      hostname: 'ximera.cloud',
      port: 443,
      path: url,
      method: 'GET',
      agent,
    };

    const req = https.request(options, (res) => {
      const data = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });
    
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        cache.set(url, buffer);
        resolve(buffer);
      });
      
      res.on('error', (err) => {
        reject(err);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    
    req.write('');
    req.end();
  });
}
