import fs from 'fs';

const assetsDirectories = ['data'];
const buildFolder = 'dist';

if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
}
for (const dir of assetsDirectories) {
    fs.cpSync(dir, `${buildFolder}/${dir}`, { recursive: true });
}
