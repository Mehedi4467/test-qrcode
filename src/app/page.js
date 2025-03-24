/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Import Next.js router
import QrScanner from "qr-scanner";

export default function Home() {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [flashAvailable, setFlashAvailable] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    QrScanner.hasCamera().then((hasCamera) => {
      setCameraAvailable(hasCamera);
      if (!hasCamera) {
        console.error("No camera found!");
        return;
      }

      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleScanResult(result.data), // Handle QR result
          { returnDetailedScanResult: true }
        );

        qrScannerRef.current
          .start()
          .then(() => checkFlashSupport())
          .catch((err) => console.error("QR Scanner error:", err));
      }
    });

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  // Check if the camera supports flashlight
  const checkFlashSupport = async () => {
    if (qrScannerRef.current) {
      const hasFlash = await qrScannerRef.current.hasFlash();
      setFlashAvailable(hasFlash);
    }
  };

  // Toggle Flashlight
  const toggleFlash = async () => {
    if (!flashAvailable || !qrScannerRef.current) return;
    try {
      if (flashOn) {
        await qrScannerRef.current.turnFlashOff();
        setFlashOn(false);
      } else {
        await qrScannerRef.current.turnFlashOn();
        setFlashOn(true);
      }
    } catch (err) {
      console.error("Flashlight error:", err);
    }
  };

  // Restart the QR scanner
  const restartScanner = async () => {
    if (qrScannerRef.current) {
      await qrScannerRef.current.stop();
      await qrScannerRef.current.start();
    }
  };

  // Handle QR Scan Result
  const handleScanResult = (data) => {
    console.log("Decoded QR code:", data);

    // Redirect to the given route with QR value as query param
    router.push(`/master-invoice?id=${encodeURIComponent(data)}`);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", marginTop: 20 }}>
      {!cameraAvailable ? (
        <p style={{ color: "red", height: 500 }}>
          No camera found. Please check your device or permissions.
        </p>
      ) : (
        <>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              maxWidth: "400px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {/* Flashlight Button */}
            {flashAvailable && (
              <button
                onClick={toggleFlash}
                style={{
                  background: flashOn ? "#ffcc00" : "#555",
                  color: "#fff",
                  padding: "10px 15px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {flashOn ? "🔦 Flash Off" : "💡 Flash On"}
              </button>
            )}

            {/* Retry Button */}
            <button
              onClick={restartScanner}
              style={{
                background: "#28b04c",
                color: "#fff",
                padding: "10px 15px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🔄 Retry
            </button>
          </div>
        </>
      )}
    </div>
  );
}
