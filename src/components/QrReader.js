// src/App.js
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import './QrStyles.css';

const QrReader = () => {
  const scanner = useRef();
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);
  const [qrOn, setQrOn] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [employmentId, setEmploymentId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [employmentIdError, setEmploymentIdError] = useState("");
  const [step, setStep] = useState(1); // Step 1: Employment ID, Step 2: QR Scan, Step 3: Quantity
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // success, error, loading

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
    setQuantityError("");
  };

  const handleEmploymentIdChange = (event) => {
    setEmploymentId(event.target.value);
    setEmploymentIdError("");
  };

  const onScanSuccess = (result) => {
    console.log(result);
    setScannedResult(result?.data);
    setStep(3); // Proceed to step 3 after successful scan
    scanner.current.stop(); // Stop scanner after successful scan
  };

  const onScanFail = (err) => {
    console.log(err);
  };

  const handleEmploymentIdSubmit = (event) => {
    event.preventDefault();
    if (employmentId.trim()) {
      setEmploymentIdError("");
      setStep(2); // Proceed to step 2: QR Scan
      setQrOn(true);
    } else {
      setEmploymentIdError("Employment ID is required");
    }
  };

  const handleQuantitySubmit = async (event) => {
    event.preventDefault();
    let isValid = true;

    if (!scannedResult) {
      isValid = false;
    }

    if (!quantity.trim()) {
      setQuantityError("Quantity is required");
      isValid = false;
    }

    if (isValid) {
      try {
        setAlertMessage("Submitting your data...");
        setAlertType("loading");
        const response = await axios.post("/submit-form", {
          scannedResult,
          employmentId,
          quantity,
        });

        console.log("Server Response:", response.data);

        setEmploymentId("");
        setQuantity("");
        setScannedResult("");
        setStep(1); // Reset to step 1
        setAlertMessage("Your Inventory has been successfully tracked!");
        setAlertType("success");
        setTimeout(() => setAlertMessage(""), 3000); // Clear success message after 3 seconds
      } catch (error) {
        console.error("Error submitting form:", error);
        setAlertMessage("Error submitting form. Please try again.");
        setAlertType("error");
      }
    }
  };

  useEffect(() => {
    if (videoEl?.current && step === 2) {
      scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl.current || undefined,
      });

      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop();
      }
    };
  }, [step]);

  useEffect(() => {
    if (!qrOn && step === 2) {
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
      );
    }
  }, [qrOn, step]);

  return (
    <div className="container mt-5 text-center">
      <h2>QR Code Scanner and Form</h2>

      {step === 1 && (
        <form onSubmit={handleEmploymentIdSubmit} className="mb-3">
          <div className="mb-3">
            <div>
              <label htmlFor="employmentId" className="form-label">
                <b>Employment ID</b>
              </label>
            </div>
            <input
              type="text"
              id="employmentId"
              value={employmentId}
              onChange={handleEmploymentIdChange}
              className={`form-control ${
                employmentIdError ? "is-invalid" : ""
              }`}
              placeholder="Enter Employment ID..."
              required
            />
            {employmentIdError && (
              <div className="invalid-feedback">{employmentIdError}</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="qr-reader mb-3 position-relative">
          <div>
            <label htmlFor="employmentId" className="form-label">
              <b>Employment ID: {employmentId}</b>
            </label>
          </div>
          <video ref={videoEl} className="w-100" playsInline></video>
          <div
            ref={qrBoxEl}
            className="qr-box position-absolute top-50 start-50 translate-middle"
          >
            <img
              src={QrFrame}
              alt="QR Frame"
              width={128}
              height={128}
              className="qr-frame"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleQuantitySubmit} className="mb-3">
          <div className="mb-3">
            <div>
              <label htmlFor="employmentId" className="form-label">
                <b>Employment ID: {employmentId}</b>
              </label>
            </div>
            <div>
              <label htmlFor="qrCodeScanner" className="form-label">
                <b>QR Code: {scannedResult}</b>
              </label>
            </div>
            <input
              type="text"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              className={`form-control ${quantityError ? "is-invalid" : ""}`}
              placeholder="Enter Quantity..."
              required
            />
            {quantityError && (
              <div className="invalid-feedback">{quantityError}</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Submit Quantity
          </button>
        </form>
      )}

      {alertMessage && (
        <div className={`alert mt-3 alert-${alertType === "loading" ? "info" : alertType === "success" ? "success" : "danger"}`}>
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default QrReader;
