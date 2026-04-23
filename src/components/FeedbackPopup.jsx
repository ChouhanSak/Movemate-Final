import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FeedbackPopup({ onClose, userType }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

 const submitFeedback = async () => {
  try {
 const uid = auth.currentUser?.uid;

await addDoc(collection(db, "feedback"), {
  userId: uid,
  userType: userType,   
  rating: rating,
  comment: comment.trim(),
  createdAt: serverTimestamp(),
});
    // reset form
    setRating(0);
    setComment("");

    // close popup
onClose("submitted");
    // show success message
    alert("✅ Thanks for your feedback!");

  } catch (error) {
    console.error("Error saving feedback:", error);
     alert("❌ Something went wrong while submitting feedback.");
   }
};
   return (
  <div
    style={overlay}
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
    <div style={popup} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <h2 style={title}>⭐ Rate Our Website</h2>

        {/* Stars */}
        <div style={stars}>
          {[1,2,3,4,5].map((star)=>(
            <span
              key={star}
              style={{
                cursor:"pointer",
                fontSize:"30px",
                color: star <= rating ? "#facc15" : "#d1d5db"
              }}
              onClick={()=>setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment */}
        <textarea
          placeholder="Write your feedback..."
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          style={textarea}
        />

        {/* Buttons */}
        <div style={buttonRow}>
          <button
            style={{...notNowBtn, transition:"0.15s"}}
            onMouseDown={(e)=>e.currentTarget.style.transform="scale(0.95)"}
            onMouseUp={(e)=>e.currentTarget.style.transform="scale(1)"}
           onClick={() => onClose("not_now")}
            >
            Not Now
            </button>       
        <button
            style={{
                ...submitBtn,
                opacity: rating ? 1 : 0.5,
                cursor: rating ? "pointer" : "not-allowed",
                transition:"0.15s"
            }}
            disabled={!rating}
            onMouseDown={(e)=>e.currentTarget.style.transform="scale(0.95)"}
            onMouseUp={(e)=>e.currentTarget.style.transform="scale(1)"}
            onClick={submitFeedback}
            >
            Submit
            </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const overlay = {
  position:"fixed",
  top:0,
  left:0,
  width:"100%",
  height:"100%",
  background:"rgba(0,0,0,0.45)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  zIndex:9999,
  pointerEvents:"auto"
}

const popup = {
  background:"white",
  padding:"25px",
  borderRadius:"10px",
  width:"420px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.2)",
  display:"flex",
  flexDirection:"column",
  gap:"15px",
  position:"relative"
}
const title = {
  textAlign:"center",
  fontSize:"20px",
  fontWeight:"600"
}

const stars = {
  display:"flex",
  justifyContent:"center",
  gap:"8px"
}

const textarea = {
  width:"100%",
  minHeight:"70px",
  padding:"10px",
  border:"1px solid #ddd",
  borderRadius:"6px",
  resize:"none"
}

const buttonRow = {
  display:"flex",
  justifyContent:"space-between"
}

const notNowBtn = {
  border:"2px solid #9ca3af",
  padding:"8px 18px",
  borderRadius:"6px",
  background:"white",
  cursor:"pointer"
}
const submitBtn = {
  border:"2px solid #4f46e5",
  padding:"8px 18px",
  borderRadius:"6px",
  background:"#4f46e5",
  color:"white",
  cursor:"pointer",
  opacity: 1
}