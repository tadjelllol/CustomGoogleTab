// Array of background image URLs
const backgrounds = [

    'https://preview.redd.it/a-couple-favorite-halo-3-pieces-ive-made-v0-3p705kvhnjje1.jpg?width=2560&format=pjpg&auto=webp&s=7c64ab663da9b5dbb33fef983b6e4165e02f2a94',
    'https://cdnb.artstation.com/p/assets/images/images/082/151/789/large/2204-cortana-final.jpg?1732195463',
    'https://cdna.artstation.com/p/assets/images/images/082/151/512/large/2204-ark-nowatermark.jpg?1739451842',
    'https://cdnb.artstation.com/p/assets/images/images/082/151/367/large/2204-2hunters9.jpg?1739451597',
    'https://cdnb.artstation.com/p/assets/images/images/082/152/817/large/2204-falloutnv.jpg?1739451908',
    'https://cdnb.artstation.com/p/assets/images/images/011/887/423/4k/erasmus-brosdau-encounter-in-the-snow.jpg?1531935201',
    'https://cdnb.artstation.com/p/assets/images/images/012/953/193/4k/erasmus-brosdau-peace-walker.jpg?1537349396',
    'https://cdna.artstation.com/p/assets/images/images/026/150/150/large/quentin-chaillet-artstation-06.jpg?1588013553',
    'https://cdna.artstation.com/p/assets/images/images/011/316/676/large/cedric-cunanan-asylum-ds.jpg?1528953807',
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
    'https://w.wallhaven.cc/full/zy/wallhaven-zykx7w.png',
    'https://i.imgur.com/034VHUj.jpeg',
    'https://i.imgur.com/kpNxlQq.png',
    'https://i.imgur.com/2Gt0DrC.png',
    'https://i.imgur.com/jgSDGLm.png',
    'https://i.imgur.com/MaZXa78.jpeg',
    'https://i.imgur.com/C9Z4FVH.png',
    'https://i.imgur.com/wn36nLX.png',
    'https://i.imgur.com/IYquOKE.png',
    'https://i.imgur.com/x8Zv7Mg.png',
    'https://i.imgur.com/9o8dGCH.png',
    'https://i.imgur.com/4HLNSsO.png',
    'https://i.imgur.com/8TOO7LN.png',
    'https://i.imgur.com/hOCcI8g.png',

]

    


// Pick a random background
const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

// Apply it to the body
document.body.style.backgroundImage = `url('${randomBackground}')`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
