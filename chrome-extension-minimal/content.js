// Array of background image URLs
const backgrounds = [
    'https://4kwallpapers.com/images/wallpapers/death-stranding-playstation-4-pc-games-3440x1440-4202.jpg',
    'https://w.wallhaven.cc/full/57/wallhaven-57qzk3.png',
    'https://w.wallhaven.cc/full/3z/wallhaven-3z8356.png',
    'https://w.wallhaven.cc/full/nm/wallhaven-nmogx9.png',
    'https://w.wallhaven.cc/full/z8/wallhaven-z8x18v.jpg',
    'https://w.wallhaven.cc/full/j5/wallhaven-j55r7w.jpg',
    'https://w.wallhaven.cc/full/1k/wallhaven-1kgrxv.jpg',
    'https://w.wallhaven.cc/full/zy/wallhaven-zyjy2o.jpg',
    'https://w.wallhaven.cc/full/l8/wallhaven-l87pjy.jpg',
    'https://w.wallhaven.cc/full/xl/wallhaven-xlj28l.jpg',
    'https://w.wallhaven.cc/full/dp/wallhaven-dpvvgm.jpg',
    'https://w.wallhaven.cc/full/lm/wallhaven-lm6r3y.jpg',
    'https://w.wallhaven.cc/full/j5/wallhaven-j5gr3y.jpg',
    'https://w.wallhaven.cc/full/md/wallhaven-md7r9m.jpg',
    'https://w.wallhaven.cc/full/0p/wallhaven-0p9jk9.jpg',
    'https://w.wallhaven.cc/full/zy/wallhaven-zykx7w.png'
];

// Pick a random background
const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

// Apply it to the body
document.body.style.backgroundImage = `url('${randomBackground}')`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
