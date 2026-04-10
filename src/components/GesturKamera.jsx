import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { X, HandMetal, Loader2 } from "lucide-react";

export default function GesturKamera({ onKibasKiriAtauKanan, onNomorMode, onZoom, onPan, onTutup }) {
  const videoRef = useRef(null);
  const kanvasRef = useRef(null);
  const requestRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const riwayatPosisiX = useRef([]);
  const statusAman = useRef(true);
  const riwayatJari = useRef([]);
  const [status, ubahStatus] = useState("Memuat Kamera...");

  // geser sama ganti ukuran jendela kamera
  const [winPos, setWinPos] = useState({ x: 24, y: typeof window !== 'undefined' ? window.innerHeight - 264 : 0 });
  const [winDim, setWinDim] = useState({ w: 220, h: 165 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const posisiTanganLalu = useRef(null);
  const jarakPinchLalu = useRef(null);

  useEffect(() => {
    let dipasang = true;
    async function siapkanKamera() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!dipasang) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", jalankanPrediksi);
          ubahStatus("Siap dipakai!");
        }
      } catch (err) {
        ubahStatus("Error: " + err.message);
      }
    }
    siapkanKamera();

    const handleGlobalMouseMove = (e) => {
      if (isDragging.current) {
        setWinPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      }
      if (isResizing.current) {
        const newW = Math.max(160, e.clientX - winPos.x);
        setWinDim({ w: newW, h: newW * 0.75 });
      }
    };
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      dipasang = false;
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarkerRef.current) handLandmarkerRef.current.close();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [winPos.x]);

  const hitungJariTegak = (landmarks) => {
    let jumlah = 0;
    if (landmarks[8].y < landmarks[5].y - 0.05) jumlah++;
    if (landmarks[12].y < landmarks[9].y - 0.05) jumlah++;
    if (landmarks[16].y < landmarks[13].y - 0.05) jumlah++;
    if (landmarks[20].y < landmarks[17].y - 0.05) jumlah++;
    const jarakHorizontalJempol = Math.abs(landmarks[4].x - landmarks[17].x);
    const jarakMinimalJempol = Math.abs(landmarks[5].x - landmarks[17].x) * 1.2; 
    if (jarakHorizontalJempol > jarakMinimalJempol) jumlah++;
    return jumlah;
  };

  const jalankanPrediksi = () => {
    if (!videoRef.current || !handLandmarkerRef.current) return;
    
    let WaktuHitungFrame = performance.now();
    const deteksi = handLandmarkerRef.current.detectForVideo(videoRef.current, WaktuHitungFrame);

    if (deteksi.landmarks && deteksi.landmarks.length > 0) {
      const lms = deteksi.landmarks[0];
      const pergelangan = lms[0];      
      const dx = lms[4].x - lms[8].x;
      const dy = lms[4].y - lms[8].y;
      const jarakPinch = Math.sqrt(dx * dx + dy * dy);

      const jumlahJari = hitungJariTegak(lms);
      const sedangPinch = jumlahJari <= 1;
      if (sedangPinch) {
        if (jarakPinchLalu.current !== null) {
          const deltaZoom = (jarakPinch - jarakPinchLalu.current) * 40;
          if (Math.abs(deltaZoom) > 0.1) onZoom?.(deltaZoom);
        }
        jarakPinchLalu.current = jarakPinch;
      } else {
        jarakPinchLalu.current = jarakPinch;
      }

      if (jumlahJari >= 4) {
        if (posisiTanganLalu.current) {
          const deltaX = (pergelangan.x - posisiTanganLalu.current.x) * 50;
          const deltaY = (pergelangan.y - posisiTanganLalu.current.y) * 50;
          onPan?.({ x: deltaX, y: deltaY });
        }
        posisiTanganLalu.current = { x: pergelangan.x, y: pergelangan.y };
      } else {
        posisiTanganLalu.current = null;
      }

      if (statusAman.current && !sedangPinch && jumlahJari < 4) {
        riwayatJari.current.push(jumlahJari);
        if (riwayatJari.current.length > 10) riwayatJari.current.shift();
        const semuaSama = riwayatJari.current.every(j => j === jumlahJari);
        if (semuaSama && riwayatJari.current.length >= 10) {
          onNomorMode?.(jumlahJari);
          pemicuVisual();
        }
      } else if (sedangPinch) {
        riwayatJari.current = [];
      }

      const currentX = pergelangan.x;
      riwayatPosisiX.current.push({ x: currentX, waktu: WaktuHitungFrame });
      while (riwayatPosisiX.current.length > 0 && WaktuHitungFrame - riwayatPosisiX.current[0].waktu > 500) {
        riwayatPosisiX.current.shift();
      }
      if (statusAman.current && riwayatPosisiX.current.length > 5) {
        const dX = riwayatPosisiX.current[riwayatPosisiX.current.length - 1].x - riwayatPosisiX.current[0].x;
        if (dX > 0.3) tandaiGanti("kiri");
        else if (dX < -0.3) tandaiGanti("kanan");
      }

      gambarBantuan(deteksi.landmarks);
    } else {
      jarakPinchLalu.current = null;
      posisiTanganLalu.current = null;
      const ctx = kanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, 320, 240);
    }

    requestRef.current = requestAnimationFrame(jalankanPrediksi);
  };

  const tandaiGanti = (arah) => {
    statusAman.current = false;
    onKibasKiriAtauKanan(arah);
    pemicuVisual();
    setTimeout(() => {
      riwayatPosisiX.current = [];
      riwayatJari.current = [];
      statusAman.current = true;
    }, 1500);
  };

  const pemicuVisual = () => {
    if (!kanvasRef.current) return;
    const ctx = kanvasRef.current.getContext("2d");
    ctx.fillStyle = "rgba(0, 255, 120, 0.4)";
    ctx.fillRect(0, 0, 320, 240);
    if (statusAman.current) {
      statusAman.current = false;
      setTimeout(() => {
        statusAman.current = true;
        riwayatJari.current = [];
      }, 1500);
    }
  };

  const gambarBantuan = (landmarksMatrix) => {
    if (!kanvasRef.current) return;
    const ctx = kanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 320, 240);
    ctx.fillStyle = statusAman.current ? "#00ffcc" : "#ff3366";
    for (const tangan of landmarksMatrix) {
      for (const titik of tangan) {
        ctx.beginPath();
        ctx.arc(titik.x * 320, titik.y * 240, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  return (
    <div 
      className="wadah-kamera" 
      style={{ 
        left: winPos.x, 
        top: winPos.y, 
        width: winDim.w, 
        animation: "none"
      }}
    >
      <div 
        className="kamera-header" 
        style={{ cursor: "move" }}
        onMouseDown={(e) => {
          isDragging.current = true;
          offset.current = { x: e.clientX - winPos.x, y: e.clientY - winPos.y };
        }}
      >
        <span className="kamera-title">
          {status === "Siap dipakai!" ? <HandMetal size={14} color="#00ffcc" /> : <Loader2 size={14} className="spin" />}
          AI Camera
        </span>
        <button className="kamera-tutup" onClick={onTutup}><X size={14} /></button>
      </div>
      <div className="kamera-container" style={{ height: winDim.h }}>
        <video ref={videoRef} autoPlay playsInline className="kamera-video" />
        <canvas ref={kanvasRef} width="320" height="240" className="kamera-kanvas" />
        
        <div 
          className="kamera-resize-handle"
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
          }}
        />
      </div>
    </div>
  );
}
