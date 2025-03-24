"use client";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export default function Home() {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);

  useEffect(() => {
    QrScanner.hasCamera().then(hasCamera => {
      setCameraAvailable(hasCamera);
      if (!hasCamera) {
        console.error("No camera found!");
        return;
      }

      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          result => console.log("Decoded QR code:", result),
          { returnDetailedScanResult: true }
        );

        qrScannerRef.current
          .start()
          .catch(err => console.error("QR Scanner error:", err));
      }
    });

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      {!cameraAvailable ? (
        <p style={{ color: "red" }}>No camera found. Please check your device or permissions.</p>
      ) : (
        <video
          ref={videoRef}
          style={{ width: "100%", maxWidth: "400px", border: "1px solid #ccc" }}
        />
      )}
    </div>
  );
}
