import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
}

export async function compressAndConvertImage(imageFile) {
  const ffmpeg = await initFFmpeg();
  
  // Write the input file to FFmpeg's virtual filesystem
  await ffmpeg.writeFile('input', await fetchFile(imageFile));
  
  // Execute FFmpeg command to resize and convert to PNG
  // -vf scale=800:-1 will resize to 800px width while maintaining aspect ratio
  await ffmpeg.exec([
    '-i', 'input',
    '-vf', 'scale=800:-1',
    '-quality', '85',
    'output.png'
  ]);
  
  // Read the processed file
  const data = await ffmpeg.readFile('output.png');
  
    // Convert Uint8Array to Blob with proper MIME type
    const blob = new Blob([data.buffer], { type: 'image/png' });
  
    // Create a new File with a meaningful name
    return new File([blob], `${imageFile.name.split('.')[0]}_compressed.png`, {
      type: 'image/png',
      lastModified: new Date().getTime()
    });
}
