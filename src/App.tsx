import React, { useState, useRef, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import originalPoster from "./image.png";
import BGimg from "./BG.jpeg";

type SharePlatform = "whatsapp" | "instagram" | "facebook";

const WhatsAppIcon = () => (
  <svg
    aria-hidden
    focusable="false"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.5 3.5a10 10 0 0 0-14.2 0 10 10 0 0 0-1.5 12.1L4 22l6.4-1.8a10 10 0 0 0 10.1-16.7zm-1.9 11.2c-.2.6-1.1 1.1-1.9.7-1-.5-2.3-1-3.6-2.3-1.5-1.5-2.1-2.9-2.3-3.5-.3-.8 0-1.6.6-1.8.5-.2.7-.2 1.1 0l.9.4c.3.2.5.4.6.7.1.3.1.6-.1.9l-.3.5c-.1.1-.1.3 0 .5.2.4.7 1.2 1.6 2 .9.9 1.6 1.2 2 .1.2-.3.4-.3.7-.2l1.1.5c.3.1.5.3.6.6.1.3.1.6 0 .9z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    aria-hidden
    focusable="false"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="17.5" cy="6.5" r="1.2" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    aria-hidden
    focusable="false"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13.5 10.5V9.2c0-.5.3-.9.9-.9H17V6h-2.8c-2.2 0-3.6 1.4-3.6 3.7v1.8H8v3h2.6V22h3v-5.5H17l.5-3h-3.9z" />
  </svg>
);

const App = () => {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [enteredName, setEnteredName] = useState("");
  const posterRef = useRef<HTMLImageElement | null>(null);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = originalPoster;
    img.onload = () => {
      posterRef.current = img;
      setPosterLoaded(true);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        if (e.target?.result && typeof e.target.result === "string") {
          img.src = e.target.result;
          img.onload = () => {
            setUploadedImage(img);
            setShowCropper(true);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          1 / 1,
          width,
          height
        ),
        width,
        height
      )
    );
  }

  const handleApplyCrop = () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const pixelRatio = window.devicePixelRatio;
    const dWidth = completedCrop.width * scaleX;
    const dHeight = completedCrop.height * scaleY;
    canvas.width = dWidth * pixelRatio;
    canvas.height = dHeight * pixelRatio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      dWidth,
      dHeight,
      0,
      0,
      dWidth,
      dHeight
    );

    const croppedImageUrl = canvas.toDataURL("image/png");
    const croppedImg = new Image();
    croppedImg.src = croppedImageUrl;
    croppedImg.onload = () => {
      setUploadedImage(croppedImg);
      setShowCropper(false);
      setCompletedCrop(undefined);
    };
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredName(event.target.value);
  };

  const drawPosterToCanvas = () => {
    if (!uploadedImage || !posterLoaded || !posterRef.current) {
      console.log("Please upload and crop an image first.");
      return null;
    }

    const basePoster = posterRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = basePoster.naturalWidth;
    canvas.height = basePoster.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(basePoster, 0, 0);

    const posterWidth = basePoster.naturalWidth;
    const posterHeight = basePoster.naturalHeight;
    const circleSize = posterWidth * (180 / 600);
    const imageX = posterWidth * (120 / 480);
    const imageY = posterHeight * 0.38;

    ctx.save();
    ctx.beginPath();
    ctx.arc(imageX, imageY, circleSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const drawX = imageX - circleSize / 2;
    const drawY = imageY - circleSize / 2;

    ctx.drawImage(uploadedImage, drawX, drawY, circleSize, circleSize);
    ctx.restore();

    const showDebugTextBox = false;
    const marginLeft = posterWidth * 0.01;
    const marginRight = posterWidth * 0.55;
    const marginTop = posterHeight * 0.62;
    const marginBottom = posterHeight * 0.74;
    const marginWidth = marginRight - marginLeft;
    const marginHeight = marginBottom - marginTop;

    if (showDebugTextBox) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(marginLeft, marginTop, marginWidth, marginHeight);
      ctx.restore();
    }

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 255, 64, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    const centerX = marginLeft + marginWidth / 2;

    const wrapLines = (text: string, maxWidth: number, fontPx: number) => {
      ctx.font = `bold ${fontPx}px Arial`;
      const paragraphs = text.split(/\n+/);
      const out: string[] = [];
      for (const para of paragraphs) {
        const words = para.split(/\s+/).filter(Boolean);
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          const w = ctx.measureText(test).width;
          if (w > maxWidth && line) {
            out.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) out.push(line);
      }
      return out;
    };

    const fitsBox = (lines: string[], fontPx: number) => {
      const lineHeight = Math.round(fontPx * 1.1);
      const totalHeight = lines.length * lineHeight;
      if (totalHeight > marginHeight) return false;
      for (const ln of lines) {
        if (ctx.measureText(ln).width > marginWidth) return false;
      }
      return true;
    };

    const maxFont = Math.min(Math.round(marginHeight * 0.8), 100);
    const minFont = 18;
    let chosenFont = maxFont;
    let chosenLines: string[] = wrapLines(enteredName, marginWidth, chosenFont);

    while (chosenFont > minFont && !fitsBox(chosenLines, chosenFont)) {
      chosenFont -= 2;
      chosenLines = wrapLines(enteredName, marginWidth, chosenFont);
    }

    const lineHeightPx = Math.round(chosenFont * 1.1);
    const totalTextHeight = chosenLines.length * lineHeightPx;
    let textDrawY = marginTop + (marginHeight - totalTextHeight) / 2 + chosenFont * 0.8;
    ctx.font = `bold ${chosenFont}px Arial`;
    for (const line of chosenLines) {
      ctx.fillText(line, centerX, textDrawY);
      textDrawY += lineHeightPx;
    }

    return canvas;
  };

  const buildPosterAssets = () => {
    const canvas = drawPosterToCanvas();
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL("image/png");
    return { canvas, dataUrl };
  };

  const handleDownload = () => {
    const assets = buildPosterAssets();
    if (!assets) return;

    const link = document.createElement("a");
    link.download = "Vote.png";
    link.href = assets.dataUrl;
    link.click();
  };

  const handleShare = async (platform: SharePlatform) => {
    const assets = buildPosterAssets();
    if (!assets) return;

    const shareMessage = "വോട്ട് ഫോർ UDF വോട്ട് ഫോർ E.K"
    
    // enteredName
    //   ? `Support ${enteredName} with this poster!`
    //   : "Check out this campaign poster!";

    const navigatorAvailable = typeof navigator !== "undefined";
    if (navigatorAvailable && "share" in navigator) {
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          assets.canvas.toBlob((blobResult) => resolve(blobResult), "image/png")
        );
        if (blob) {
          const file = new File([blob], "Vote.png", { type: "image/png" });
          const canShareFile =
            "canShare" in navigator ? navigator.canShare?.({ files: [file] }) : true;
          if (canShareFile) {
            await navigator.share({
              files: [file],
              text: shareMessage,
              title: "Campaign Poster",
            });
            return;
          }
        }
      } catch (error) {
        console.error("Sharing failed, falling back.", error);
      }
    }

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}&quote=${encodeURIComponent(shareMessage)}`,
          "_blank"
        );
        break;
      case "instagram":
        try {
          if (navigatorAvailable && "clipboard" in navigator) {
            await navigator.clipboard.writeText(shareMessage);
            alert(
              "Poster ready! Use Download Poster to save the image, then upload it to your Instagram story. We've copied the caption for you."
            );
          } else {
            alert(
              "Poster ready! Download it and upload to your Instagram story manually."
            );
          }
        } catch (err) {
          alert("Poster ready! Download it and upload to your Instagram story manually.");
          console.error("Could not copy caption", err);
        }
        break;
    }
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-center p-4 min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 109, 33, 0.41)), url(${BGimg})`,
        }}
      >
        {/* Cropper Modal */}
        {showCropper && uploadedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full">
              <h2 className="text-xl font-bold mb-4">
                Crop Your Image (1:1 Ratio)
              </h2>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1 / 1}
              >
                <img
                  ref={imgRef}
                  src={uploadedImage.src}
                  onLoad={onImageLoad}
                  alt="To be cropped"
                />
              </ReactCrop>
              <button
                onClick={handleApplyCrop}
                className="mt-4 w-full p-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
              >
                Apply Crop
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 p-6 backdrop-blur-xl border border-black border-opacity-30 rounded-[3vh] shadow-lg ring-1 ring-white/50 w-full max-w-sm">
          <label htmlFor="name-input" className="font-bold text-white">
            Enter Name:
          </label>
          <input
            id="name-input"
            type="text"
            value={enteredName}
            onChange={handleNameChange}
            placeholder="Your Name"
            className="p-3 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <label
            htmlFor="image-upload-control"
            className="p-3 text-center bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition duration-300 shadow-md"
          >
            Upload New Image
          </label>
          <input
            id="image-upload-control"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={handleDownload}
            className="p-3 text-center bg-green-500 text-white font-bold rounded-lg cursor-pointer hover:bg-green-600 transition duration-300 shadow-md disabled:bg-gray-400"
            disabled={!uploadedImage}
          >
            Download Poster
          </button>
          <div className="mt-2 flex flex-col gap-2">
            <span className="text-sm font-semibold text-white text-center uppercase tracking-wide">
              Share your poster
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleShare("whatsapp")}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 disabled:bg-gray-400"
                disabled={!uploadedImage}
              >
                <WhatsAppIcon />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare("instagram")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 px-3 py-2 text-sm font-semibold text-white shadow-md transition disabled:bg-gray-400 disabled:from-gray-500 disabled:via-gray-500 disabled:to-gray-500"
                disabled={!uploadedImage}
              >
                <InstagramIcon />
                Instagram
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!uploadedImage}
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center text-white bg-black p-2  ">
        Web by{" "}
        <a
          href="https://linkedin.com/in/shad-c-t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Shad-CT
        </a>
      </footer>
    </>
  );
};

export default App;
