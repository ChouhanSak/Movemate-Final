import { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

function UploadImageCloudinary() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return alert("Select image first");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

    try {
      // 1️⃣ Upload to Cloudinary
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      // 2️⃣ Save image URL in Firestore
      await addDoc(collection(db, "shipments"), {
        imageUrl: data.secure_url,
        publicId: data.public_id,
        createdAt: new Date(),
      });

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}

export default UploadImageCloudinary;