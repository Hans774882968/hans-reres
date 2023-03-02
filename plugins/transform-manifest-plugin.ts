import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import pkg from '../package.json';

export default function transformManifestPlugin (options: {
  manifestPath?: string, dest?: string
} = {}): Plugin {
  return {
    name: 'vite:transform-manifest-plugin',
    writeBundle () {
      const { dest = 'dist', manifestPath = './manifest.json' } = options;
      fs.readFile(manifestPath, { encoding: 'utf-8', flag: 'r' }, (err, dat) => {
        if (err) {
          console.error('error reading', manifestPath, err);
          return;
        }
        const manifest = JSON.parse(dat);

        manifest.version = pkg.version;
        manifest.name = pkg.name;
        manifest.description = pkg.description;

        const result = JSON.stringify(manifest, null, '  ');
        const resultPath = path.resolve(dest, 'manifest.json');
        fs.writeFile(
          resultPath,
          result,
          'utf-8',
          (err) => {
            if (err) console.log('error writing to', resultPath, err);
          }
        );
      });
    }
  };
}
