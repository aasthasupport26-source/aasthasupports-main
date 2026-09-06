const fs = require('fs');
let content = fs.readFileSync('src/data/pooja-catalog.ts', 'utf8');
const banners = [
  '"/banners/pooja_banner_1.png"',
  '"/banners/pooja_banner_2.png"',
  '"/banners/pooja_banner_3.png"',
  '"/banners/pooja_banner_4.png"',
  '"/banners/pooja_banner_5.png"',
  '"/banners/pooja_banner_6.png"',
  '"/banners/pooja_banner_7.png"'
];
let i = 0;
content = content.replace(/"https:\/\/images\.unsplash\.com\/[^"]+"/g, (match) => {
  const banner = banners[i % banners.length];
  i++;
  return banner;
});
fs.writeFileSync('src/data/pooja-catalog.ts', content);
console.log('Fixed unsplash images');
