import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";

import Atom from "./Atom";
import { daftarAtom } from "../data/daftarAtom";
import { hitungPosisi } from "../utils/hitungPosisi";

function Scene({ namaLayout, padaSaatPilihAtom, dataGestur }) {
  const refGrup = useRef([]);
  const refOrbit = useRef();

  // Simpan koordinat x,y,z tiap atom
  const nilaiPosisi = useRef(
    daftarAtom.map((_, i) => {
      const [x, y, z] = hitungPosisi("tabel", daftarAtom)[i] || [0, 0, 0];
      return { x, y, z };
    })
  );

  useEffect(() => {
    const posisiTujuan = hitungPosisi(namaLayout, daftarAtom);
    
    daftarAtom.forEach((_, i) => {
      const [px, py, pz] = posisiTujuan[i] || [0, 0, 0];
      
      let durasi = 2.0;
      let tipeEase = "expo.inOut";
      let waktuJeda = 0;

      // Atur gaya animasi tiap mode
      switch (namaLayout) {
        case "tabel":
          durasi = 1.8;
          tipeEase = "power3.inOut";
          waktuJeda = i * 0.008; 
          break;
        case "bola":
          durasi = 2.2;
          tipeEase = "back.out(1.4)";
          waktuJeda = Math.random() * 0.25;
          break;
        case "heliks":
          durasi = 2.4;
          tipeEase = "sine.inOut";
          waktuJeda = i * 0.015;
          break;
        case "grid":
          durasi = 1.5;
          tipeEase = "expo.out";
          waktuJeda = (i % 15) * 0.03 + Math.random() * 0.05;
          break;
        case "kelompok":
          durasi = 2.5;
          tipeEase = "expo.inOut";
          waktuJeda = Math.random() * 0.4;
          break;
        case "galaksi":
          durasi = 2.8;
          tipeEase = "circ.inOut";
          waktuJeda = (118 - i) * 0.008 + Math.random() * 0.15;
          break;
        default:
          durasi = 2.0;
          tipeEase = "power2.inOut";
          waktuJeda = Math.random() * 0.2;
      }

      gsap.to(nilaiPosisi.current[i], {
        x: px, y: py, z: pz,
        duration: durasi,
        ease: tipeEase,
        delay: waktuJeda,
      });
    });
  }, [namaLayout]);

  // Update posisi tiap frame
  useFrame((state) => {
    refGrup.current.forEach((grup, i) => {
      if (!grup) return;
      const { x, y, z } = nilaiPosisi.current[i];
      grup.position.set(x, y, z);
    });

    if (dataGestur?.current && refOrbit.current) {
      const { zoom, pan } = dataGestur.current;

      // Narik kamera mendekat atau menjauh
      if (Math.abs(zoom) > 0.01) {
        const factor = zoom * 0.05; 
        const target = refOrbit.current.target;
        
        state.camera.position.lerp(target, factor);
        
        dataGestur.current.zoom *= 0.8;
        refOrbit.current.update();
      }

      // Putar kamera sesuai gerakan tangan
      if (Math.abs(pan.x) > 0.01 || Math.abs(pan.y) > 0.01) {
        refOrbit.current.rotateLeft(pan.x * 0.05);
        refOrbit.current.rotateUp(pan.y * 0.05);        
        dataGestur.current.pan.x *= 0.8;
        dataGestur.current.pan.y *= 0.8;
      }
    }
  });

  return (
    <>
      <OrbitControls
        ref={refOrbit}
        enableDamping
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={70}
        makeDefault
      />

      <ambientLight intensity={1.2} />
      <directionalLight position={[0, 10, 20]} intensity={0.4} />

      <LangitBintang />
      {daftarAtom.map((atom, i) => (
        <group
          key={atom.nomor}
          ref={(el) => (refGrup.current[i] = el)}
        >
          <Atom
            warna={atom.warna}
            dataAtom={atom}
            padaSaatKlik={padaSaatPilihAtom}
          />
        </group>
      ))}
    </>
  );
}

function LangitBintang() {
  const refTitik = useRef();
  const posisiBintang = useRef((() => {
    const arr = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 300;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 300;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    return arr;
  })()).current;

  useFrame((_, delta) => {
    if (refTitik.current) refTitik.current.rotation.y += delta * 0.006;
  });

  return (
    <points ref={refTitik}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posisiBintang, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#4060a0" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default Scene;
