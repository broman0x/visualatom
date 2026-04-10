// Fungsi-fungsi buat ngatur posisi atom mau ditaro di mana aja sesuai mode yang dipilih
// Semuanya ngembaliin array [x, y, z] buat tiap atom

export function hitungPosisiTabel(daftarAtom) {
  const hasilPosisi = [];
  const jarakSel = 1.95; 

  daftarAtom.forEach(atom => {
    const n = atom.nomor;
    let kolom = 0;
    let baris = 0;

    if (n === 1) { kolom = 0; baris = 0; }
    else if (n === 2) { kolom = 17; baris = 0; }
    else if (n >= 3 && n <= 10) { baris = 1; kolom = (n <= 4) ? n - 3 : n + 7; } 
    else if (n >= 11 && n <= 18) { baris = 2; kolom = (n <= 12) ? n - 11 : n - 1; }
    else if (n >= 19 && n <= 36) { baris = 3; kolom = n - 19; } 
    else if (n >= 37 && n <= 54) { baris = 4; kolom = n - 37; }
    else if (n >= 55 && n <= 56) { baris = 5; kolom = n - 55; }
    else if (n >= 72 && n <= 86) { baris = 5; kolom = n - 69; } 
    else if (n >= 87 && n <= 88) { baris = 6; kolom = n - 87; }
    else if (n >= 104 && n <= 118) { baris = 6; kolom = n - 101; } 
    else if (n >= 57 && n <= 71) { baris = 8; kolom = n - 55; } 
    else if (n >= 89 && n <= 103) { baris = 9; kolom = n - 87; } 

    hasilPosisi.push([
      (kolom - 8.5) * jarakSel,
      -(baris - 4) * jarakSel,
      0
    ]);
  });

  return hasilPosisi;
}

export function hitungPosisiBola(daftarAtom) {
  const jumlahAtom = daftarAtom.length;
  const jariJari = 14; 
  const hasilPosisi = [];

  for (let i = 0; i < jumlahAtom; i++) {
    const y = 1 - (i / (jumlahAtom - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963228; 

    hasilPosisi.push([
      r * Math.cos(phi) * jariJari,
      y * jariJari,
      r * Math.sin(phi) * jariJari,
    ]);
  }

  return hasilPosisi;
}

export function hitungPosisiHeliks(daftarAtom) {
  const jumlahAtom = daftarAtom.length;
  const hasilPosisi = [];
  const putaran = 3.5;       
  const tinggi = 28;       
  const jariJari = 9;      

  for (let i = 0; i < jumlahAtom; i++) {
    const t = i / jumlahAtom;
    const sudut = t * putaran * Math.PI * 2;

    hasilPosisi.push([
      Math.cos(sudut) * jariJari,
      (t * tinggi) - (tinggi / 2),
      Math.sin(sudut) * jariJari,
    ]);
  }

  return hasilPosisi;
}

export function hitungPosisiGrid(daftarAtom) {
  const jumlahAtom = daftarAtom.length;
  const hasilPosisi = [];
  const kolomGrid = Math.ceil(Math.cbrt(jumlahAtom));
  const jarak = 3.8;

  for (let i = 0; i < jumlahAtom; i++) {
    const x = i % kolomGrid;
    const y = Math.floor(i / kolomGrid) % kolomGrid;
    const z = Math.floor(i / (kolomGrid * kolomGrid));

    const offset = ((kolomGrid - 1) * jarak) / 2;

    hasilPosisi.push([
      x * jarak - offset,
      y * jarak - offset,
      z * jarak - offset,
    ]);
  }

  return hasilPosisi;
}

export function hitungPosisiKelompok(daftarAtom) {
  const hasilPosisi = [];
  
  const kelompokMap = {};
  daftarAtom.forEach((atom) => {
    if (!kelompokMap[atom.golongan]) {
      kelompokMap[atom.golongan] = [];
    }
    kelompokMap[atom.golongan].push(atom);
  });

  const daftarGolongan = Object.keys(kelompokMap);
  const titikPusatKelompok = {};
  
  const radiusPusat = 16; 
  daftarGolongan.forEach((gol, i) => {
    const y = 1 - (i / (daftarGolongan.length - 1)) * 2; 
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963228;

    titikPusatKelompok[gol] = [
      Math.cos(phi) * r * radiusPusat,
      y * radiusPusat,
      Math.sin(phi) * r * radiusPusat
    ];
  });

  daftarAtom.forEach((atom) => {
    const pusat = titikPusatKelompok[atom.golongan];
    const arrayGrup = kelompokMap[atom.golongan];
    const indeksLokal = arrayGrup.findIndex(a => a.nomor === atom.nomor);
    const totalGrup = arrayGrup.length;

    const yL = 1 - (indeksLokal / Math.max(1, totalGrup - 1)) * 2; 
    const rL = Math.sqrt(1 - yL * yL);
    const phiL = indeksLokal * 2.399963228;

    const radiusSebar = Math.cbrt(totalGrup) * 1.4;
    
    if (totalGrup === 1) {
      hasilPosisi.push([...pusat]);
    } else {
      hasilPosisi.push([
        pusat[0] + (rL * Math.cos(phiL) * radiusSebar),
        pusat[1] + (yL * radiusSebar),
        pusat[2] + (rL * Math.sin(phiL) * radiusSebar),
      ]);
    }
  });

  return hasilPosisi;
}


export function hitungPosisiGalaksi(daftarAtom) {
  const jumlahAtom = daftarAtom.length;
  const hasilPosisi = [];
  const skala = 2.6;

  for (let i = 0; i < jumlahAtom; i++) {
    const n = i + 1;
    const a = n * 137.5 * (Math.PI / 180);
    const r = skala * Math.sqrt(n);
    const zAcak = (Math.random() - 0.5) * 6;

    hasilPosisi.push([
      r * Math.cos(a),
      r * Math.sin(a),
      zAcak
    ]);
  }

  return hasilPosisi;
}


export function hitungPosisi(namaLayout, daftarAtom) {
  switch (namaLayout) {
    case "tabel":    return hitungPosisiTabel(daftarAtom);
    case "bola":     return hitungPosisiBola(daftarAtom);
    case "heliks":   return hitungPosisiHeliks(daftarAtom);
    case "grid":     return hitungPosisiGrid(daftarAtom);
    case "kelompok": return hitungPosisiKelompok(daftarAtom);
    case "galaksi":  return hitungPosisiGalaksi(daftarAtom);
    default:         return hitungPosisiTabel(daftarAtom);
  }
}
