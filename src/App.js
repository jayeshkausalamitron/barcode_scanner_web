import "./App.css"
import { useState } from "react"
import QrReader from "./components/QrReader"

function App() {
  const [openQr, setOpenQr] = useState(false)

  return (
    <div className="App">
      {/* <div className="button-container">
        <button onClick={() => setOpenQr(!openQr)}>
          {openQr ? "Close" : "Open"} QR Scanner
        </button>
      </div> */}
      {/* {openQr && <QrReader />} */}
      <QrReader />
    </div>
  )
}

export default App