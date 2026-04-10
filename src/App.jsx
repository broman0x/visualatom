import { useState, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Table2, Globe, Dna, Grid3X3, Shapes,
  Palette, MousePointerClick, Activity, Beaker, Aperture, Video
} from "lucide-react";

import Scene from "./components/Scene";
import GesturKamera from "./components/GesturKamera";
import { keteranganWarna } from "./data/daftarAtom";
import "./App.css";

const daftarTombolLayout = [
  { kunci: "tabel",    label: "Tabel",    Ikon: Table2  },
  { kunci: "bola",     label: "Bola",     Ikon: Globe   },
  { kunci: "heliks",   label: "Heliks",   Ikon: Dna     },
  { kunci: "grid",     label: "Grid",     Ikon: Grid3X3 },
  { kunci: "kelompok", label: "Kelompok", Ikon: Shapes  },
  { kunci: "galaksi",  label: "Galaksi",  Ikon: Aperture },
];

const URUTAN_MODE = ["tabel", "bola", "heliks", "grid", "kelompok", "galaksi"];

export default function App() {
  const [layoutAktif, ubahLayoutAktif] = useState("tabel");
  const [atomDipilih, ubahAtomDipilih] = useState(null);
  const [tampilLegenda, ubahTampilLegenda] = useState(false);
  const [tampilKameraAI, ubahTampilKameraAI] = useState(false);
  const dataGestur = useRef({ zoom: 0, pan: { x: 0, y: 0 } });
  const tanganiKibas = useCallback((arah) => {
    ubahLayoutAktif((saatIni) => {
      const idxLama = URUTAN_MODE.indexOf(saatIni);
      let idxBaru = arah === "kiri" ? idxLama + 1 : idxLama - 1;
      if (idxBaru >= URUTAN_MODE.length) idxBaru = 0;
      if (idxBaru < 0) idxBaru = URUTAN_MODE.length - 1;
      return URUTAN_MODE[idxBaru];
    });
  }, []);

  const tanganiJari = useCallback((jumlah) => {
    if (jumlah >= 1 && jumlah <= URUTAN_MODE.length) {
      ubahLayoutAktif(URUTAN_MODE[jumlah - 1]);
    } 
    else if (jumlah === 0) {
      ubahLayoutAktif(URUTAN_MODE[5]);
    }
  }, []);

  const tanganiZoom = useCallback((delta) => {
    dataGestur.current.zoom = delta;
  }, []);

  const tanganiPan = useCallback((pos) => {
    dataGestur.current.pan = pos;
  }, []);

  const tanganiPilihAtom = useCallback((dataAtom) => {
    ubahAtomDipilih((sebelumnya) =>
      sebelumnya?.nomor === dataAtom?.nomor ? null : dataAtom
    );
  }, []);

  return (
    <div className="wadah-utama">      
      <div className="logo-brand">
        <Beaker size={18} strokeWidth={2} className="logo-ikon" />
        <h1 className="logo-teks">VisualAtom</h1>
      </div>
      {tampilKameraAI && (
        <GesturKamera
          onKibasKiriAtauKanan={tanganiKibas}
          onNomorMode={tanganiJari}
          onZoom={tanganiZoom}
          onPan={tanganiPan}
          onTutup={() => ubahTampilKameraAI(false)}
        />
      )}
      <nav className="dock-navigasi">
        <div className="dock-container">
          {daftarTombolLayout.map(({ kunci, label, Ikon }) => (
            <button
              key={kunci}
              className={`dock-tombol ${layoutAktif === kunci ? "aktif" : ""}`}
              onClick={() => ubahLayoutAktif(kunci)}
              title={label}
              aria-label={`Ganti ke mode ${label}`}
            >
              <Ikon size={16} strokeWidth={1.8} />
              <span className="dock-label">{label}</span>
            </button>
          ))}
          
          <div className="dock-divider" />
          
          <button
            className={`dock-tombol ikon-saja ${tampilKameraAI ? "aktif" : ""}`}
            onClick={() => ubahTampilKameraAI((v) => !v)}
            title="Aktifkan Kontrol Tangan (AI Kamera)"
            aria-label="Aktifkan fitur kontrol gestur tangan"
          >
            <Video size={16} strokeWidth={1.8} />
          </button>
          
          <button
            className={`dock-tombol ikon-saja ${tampilLegenda ? "aktif" : ""}`}
            onClick={() => ubahTampilLegenda((v) => !v)}
            title="Tampilkan Legenda Golongan"
            aria-label="Tampilkan legenda warna elemen"
          >
            <Palette size={16} strokeWidth={1.8} />
          </button>
        </div>
      </nav>
      <aside className="panel-kanan">
        {atomDipilih ? (
          <div className="kartu-inspektor">
            <div className="inspektor-header" style={{ borderBottomColor: keteranganWarna[atomDipilih.golongan]?.warna }}>
              <div className="inspektor-simbol" style={{ color: keteranganWarna[atomDipilih.golongan]?.warna }}>
                {atomDipilih.simbol}
              </div>
              <div className="inspektor-meta">
                <span className="inspektor-nomor">Z = {atomDipilih.nomor}</span>
                <span className="inspektor-kategori" style={{ color: keteranganWarna[atomDipilih.golongan]?.warna }}>
                  {keteranganWarna[atomDipilih.golongan]?.label}
                </span>
              </div>
            </div>
            <div className="inspektor-body">
              <h2 className="inspektor-nama">{atomDipilih.nama}</h2>
              <div className="inspektor-baris">
                <span className="label-baris">Massa Atom</span>
                <span className="nilai-baris">{atomDipilih.massa} u</span>
              </div>
            </div>
            <button className="tombol-tutup-inspektor" onClick={() => ubahAtomDipilih(null)}>
              Tutup Inspektor
            </button>
          </div>
        ) : (
          <div className="kartu-petunjuk">
            <MousePointerClick size={16} className="ikon-redup" />
            <p>Pilih atom di canvas untuk melihat detail.</p>
          </div>
        )}
        {tampilLegenda && (
          <div className="kartu-legenda">
            <h3 className="legenda-judul">
              <Activity size={14} /> Kategori Kimia
            </h3>
            <div className="legenda-list">
              {Object.entries(keteranganWarna).map(([kunci, { warna, label }]) => (
                <div key={kunci} className="legenda-item">
                  <span className="titik-warna" style={{ backgroundColor: warna }} />
                  <span className="nama-warna">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
      <main className="kanvas-area">
        <Canvas
          camera={{ position: [0, 0, 40], fov: 60 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          performance={{ min: 0.5 }}
        >
          <Scene 
            namaLayout={layoutAktif} 
            padaSaatPilihAtom={tanganiPilihAtom} 
            dataGestur={dataGestur}
          />
        </Canvas>
      </main>

    </div>
  );
}
