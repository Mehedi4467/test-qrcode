"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";

export default function MasterInvoiceMain() {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [flashAvailable, setFlashAvailable] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" });

      if (permission.state === "denied") {
        setPermissionDenied(true);
        setCameraAvailable(false);

        // Open Chrome Camera Settings
        if (typeof window !== "undefined") {
          window.open("chrome://settings/content/camera", "_blank");
        }
      } else {
        initializeScanner();
      }
    } catch (error) {
      console.error("Permission check error:", error);
      setCameraAvailable(false);
    }
  };

  const initializeScanner = () => {
    QrScanner.hasCamera().then((hasCamera) => {
      setCameraAvailable(hasCamera);
      if (!hasCamera) {
        console.error("No camera found!");
        return;
      }

      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleScanResult(result.data),
          { returnDetailedScanResult: true }
        );

        qrScannerRef.current
          .start()
          .then(() => checkFlashSupport())
          .catch((err) => console.error("QR Scanner error:", err));
      }
    });
  };

  const requestCameraAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setPermissionDenied(false);
        initializeScanner();
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setPermissionDenied(true);
      });
  };

  const checkFlashSupport = async () => {
    if (qrScannerRef.current) {
      const hasFlash = await qrScannerRef.current.hasFlash();
      setFlashAvailable(hasFlash);
    }
  };

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

  const restartScanner = async () => {
    if (qrScannerRef.current) {
      await qrScannerRef.current.stop();
      await qrScannerRef.current.start();
    }
  };

  const handleScanResult = (data) => {
    console.log("Decoded QR code:", data);

    try {
      const jsonData = JSON.parse(data);
      if (jsonData.master_invoice) {
        router.push(
          ` /master-invoice/list?id=${encodeURIComponent(
            jsonData.master_invoice
          )}`
        );
      } else {
        console.error("Invalid QR Code format");
      }
    } catch (err) {
      console.error("Error parsing QR Code:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", marginTop: 20 }}>
      {permissionDenied ? (
        <div>
          <p style={{ color: "red", height: 500 }}>
            Camera access was denied. Please enable camera permissions in your
            browser settings.
          </p>
          <button
            onClick={requestCameraAccess}
            style={{
              background: "#ff5733",
              color: "#fff",
              padding: "10px 15px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Enable Camera Access
          </button>
        </div>
      ) : !cameraAvailable ? (
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
