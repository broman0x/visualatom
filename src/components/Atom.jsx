import { useState, useCallback, memo, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { keteranganWarna } from "../data/daftarAtom";

const Atom = memo(function Atom({ dataAtom, padaSaatKlik }) {
  const refBillboard = useRef();
  const [sedangDiHover, ubahHover] = useState(false);
  const hexWarna = keteranganWarna[dataAtom.golongan]?.warna || "#777777";
  const warnaDasar = useMemo(() => new THREE.Color(hexWarna), [hexWarna]);
  const materialKartu = useMemo(() => {
    const warnaTerang = warnaDasar.clone().lerp(new THREE.Color("#ffffff"), 0.1);
    const warnaGelap = warnaDasar.clone().lerp(new THREE.Color("#000000"), 0.15);

    return new THREE.ShaderMaterial({
      uniforms: {
        colorLight: { value: warnaTerang },
        colorDark: { value: warnaGelap }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorLight;
        uniform vec3 colorDark;
        varying vec2 vUv;
        void main() {
          vec3 warnaFinal = mix(colorDark, colorLight, step(vUv.x, vUv.y));
          gl_FragColor = vec4(warnaFinal, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }, [warnaDasar]);

  const tanganiMasuk = useCallback((e) => {
    e.stopPropagation();
    ubahHover(true);
    document.body.style.cursor = "pointer";
  }, []);

  const tanganiKeluar = useCallback((e) => {
    e.stopPropagation();
    ubahHover(false);
    document.body.style.cursor = "crosshair";
  }, []);

  const tanganiKlik = useCallback(
    (e) => {
      e.stopPropagation();
      padaSaatKlik?.(dataAtom);
    },
    [dataAtom, padaSaatKlik]
  );

  const skalaSaatIni = sedangDiHover ? 1.15 : 1;

  useFrame(({ camera }) => {
    if (refBillboard.current) {
      refBillboard.current.quaternion.copy(camera.quaternion);
    }
  });

  const KontenTeks = () => (
    <>
      <Text position={[0.78, 0.76, 0.02]} fontSize={0.24} color="#ffffff" anchorX="right" anchorY="top" fontWeight={600}>
        {String(dataAtom.nomor)}
      </Text>
      <Text position={[-0.78, 0.76, 0.02]} fontSize={0.16} color="#ffffff" fillOpacity={0.85} anchorX="left" anchorY="top">
        {dataAtom.massa}
      </Text>
      <Text position={[0, 0.1, 0.02]} fontSize={0.88} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={800}>
        {dataAtom.simbol}
      </Text>
      <Text position={[0, -0.65, 0.02]} fontSize={0.18} color="#ffffff" fillOpacity={0.9} anchorX="center" anchorY="middle" maxWidth={1.6} textAlign="center" overflowWrap="break-word" fontWeight={500}>
        {dataAtom.nama}
      </Text>
    </>
  );

  return (
    <group ref={refBillboard} scale={skalaSaatIni}>
      {sedangDiHover && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      )}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={tanganiMasuk}
        onPointerOut={tanganiKeluar}
        onClick={tanganiKlik}
        material={materialKartu}
      >
        <planeGeometry args={[1.8, 1.8]} />
      </mesh>
      <group>
        <KontenTeks />
      </group>
    </group>
  );
});

export default Atom;
