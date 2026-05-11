import fs from 'fs';
import path from 'path';

export default function DebugImages() {
  const dir = path.join(process.cwd(), 'public');
  const files = fs.readdirSync(dir).filter(f => f.startsWith('Screenshot'));
  
  return (
    <div style={{ padding: '40px', backgroundColor: '#fff', color: '#000' }}>
      <h1>Uploaded Images Debug</h1>
      {files.map(f => (
        <div key={f} style={{ marginBottom: '40px', borderBottom: '2px solid #ccc', paddingBottom: '20px' }}>
          <h2>{f}</h2>
          <img src={`/${f}`} style={{ maxWidth: '600px', display: 'block', marginTop: '10px' }} />
        </div>
      ))}
    </div>
  );
}
