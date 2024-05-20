import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";
import "./QrStyles.css";

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
  };

  const onScanFail = (err) => {
    console.log(err);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;

    if (!scannedResult) {
      setScannedResult("Barcode is required");
      isValid = false;
    }

    if (!employmentId) {
      setEmploymentIdError("Employment ID is required");
      isValid = false;
    }

    if (!quantity) {
      setQuantityError("Quantity is required");
      isValid = false;
    }

    if (isValid) {
      console.log({ scannedResult, employmentId, quantity });
      try {
        const response = await axios.post("https://173.161.60.88:54322/submit-form", {
          scannedResult,
          employmentId,
          quantity,
        });

        console.log("Server Response:", response.data);

        setEmploymentId("");
        setQuantity("");
        setScannedResult("");
        setShowSuccessPopup(true);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  useEffect(() => {
    if (qrOn && videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current = null;
      }
    };
  }, [qrOn]);

  useEffect(() => {
    if (!qrOn && scanner.current) {
      scanner.current.stop();
      scanner.current = null;
    }
  }, [qrOn]);

  return (
    <div className="container">
      <h2>QR Code Scanner and Form</h2>
      {!employmentId && (
        <div className="alert alert-warning">
          Please enter your Employment ID to enable the QR scanner.
        </div>
      )}
      {employmentId && (
        <div className="qr-reader">
          <video ref={videoEl}></video>

          {scannedResult && (
            <p className="scanned-result">
              Scanned Value: {scannedResult}
            </p>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            id="employmentId"
            value={employmentId}
            onChange={handleEmploymentIdChange}
            className={`form-control ${employmentIdError ? "is-invalid" : ""}`}
            placeholder="Enter Employment ID..."
            onBlur={() => setQrOn(!!employmentId)}
          />
          {employmentIdError && (
            <div className="invalid-feedback">{employmentIdError}</div>
          )}
        </div>
        {employmentId && (
          <>
            <div className="mb-3">
              <input
                type="text"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className={`form-control ${quantityError ? "is-invalid" : ""}`}
                placeholder="Enter Quantity..."
              />
              {quantityError && (
                <div className="invalid-feedback">{quantityError}</div>
              )}
            </div>
            <div className="mb-3">
              <button type="submit" className="btn btn-warning">
                Submit
              </button>
            </div>
          </>
        )}
      </form>
      {showSuccessPopup && (
        <div className="success-popup">
          Your Inventory has been successfully tracked!
        </div>
      )}
    </div>
  );
};

export default QrReader;
