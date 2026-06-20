const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const src = execSync('git show origin/master:src/data/RosarioPrayerBook.js', {
  encoding: 'utf8',
  cwd: root,
});
const wrapped = src.replace('export default RosarioPrayerBook', 'module.exports = RosarioPrayerBook');
const tmp = path.join(root, '_tmp_prayerbook.js');
fs.writeFileSync(tmp, wrapped);
const book = require(tmp);
const ll = book.cierre.find((p) => p.id === 'LL');
const out = `/** Litany Lauretana structured verses (restored from master) */
export const litanyLauretanaMeta = ${JSON.stringify(
  { id: ll.id, title: ll.title, img: ll.img, imgmo: ll.imgmo, text: ll.text },
  null,
  2
)};

export const litanyLauretanaSections = ${JSON.stringify(ll.sections, null, 2)};

export const litanyLauretanaVerses = ${JSON.stringify(ll.verses, null, 2)};
`;
fs.writeFileSync(path.join(root, 'src/data/litanyLauretana.js'), out);
fs.unlinkSync(tmp);
console.log('verses', ll.verses.length, 'sections', ll.sections.length);
