import React, { useState } from "react";
import Navbar from "./Navbar";
import OnboardingFlow from "./OnboardingFlow";
import UploadPage from "./UploadPage";
import PreviewPage from "./PreviewPage";
import BoardViewPage from "./BoardViewPage";

/*
  App.jsx - FutureScape main shell.
  Flow: Onboarding - Upload - Preview - Board View  
*/

export default function App() {
  // onboarding | upload | preview | board
  const [screen, setScreen] = useState("onboarding"); 
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [meta, setMeta] = useState(null);

  // Determine which nav item is active
  const navActive =
    screen === "upload" || screen === "preview"
      ? "upload"
      : screen === "board"
      ? "board"
      : "upload";

  const handleNav = (route) => {
    if (route === "upload") setScreen("upload");
    else if (route === "board") setScreen("board");    
  };

  // Onboarding 
  if (screen === "onboarding") {
    return <OnboardingFlow onDone={() => setScreen("upload")} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar active={navActive} onNav={handleNav} />

      {screen === "upload" && (
        <UploadPage
          onPreview={(file, url) => {
            setImageFile(file);
            setImageUrl(url);
            setScreen("preview");
          }}
        />
      )}

      {screen === "preview" && (
        <PreviewPage
          file={imageFile}
          imageUrl={imageUrl}
          onBack={() => setScreen("upload")}
          onNext={(m) => {
            setMeta(m);
            setScreen("board");
          }}
        />
      )}

      {screen === "board" && (
        <BoardViewPage
          imageUrl={imageUrl}
          meta={meta}
          onBack={() => setScreen("preview")}
        />
      )}
    </div>
  );
}
