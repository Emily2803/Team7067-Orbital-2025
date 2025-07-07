import React, { useState, useEffect } from "react";
import { auth, db,} from "./firebase";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./CSS/CommunityPage.css";
import Footer from "./Footer";

const UPLOADCARE_PUBLIC_KEY = "1c6044eae7f09b3a5c87";

interface ForumPosts {
    postId: string;
    userId: string;
    userName: string;
    foodName: string;
    description: string;
    quantity: number;
    expiryDate: Date;
    location: string;
    foodPic?: string;
}

export default function CommunityPage() {
  const [post, createPost] = useState<ForumPosts[]>([]);
  const [keyword, createKeyword] = useState("");
  const [filterDorm, setDorm] = useState("");
  const [sortDate, setDate] = useState("latest");
  const [newPost, setNewPost] = useState({ 
    foodName: "",
    description: "",
    quantity: 1,
    expiryDate: "",
    location: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [editingPost, setEdit] = useState<string | null>(null);
  const [oriPic, setOriPic] = useState("");
  const navigate = useNavigate();
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});


  useEffect(() => {
    const collected = query(collection(db, "forumPosts"), orderBy("expiryDate","asc"));
    const uncheck = onSnapshot(collected,(item) => {
        const processingPosts: ForumPosts[] = item.docs.map((doc) => {
            const copy = doc.data();
            return {
                postId: doc.id,
                userId: copy.userId,
                userName: copy.userName,
                foodName: copy.foodName,
                description: copy.description,
                expiryDate: copy.expiryDate.toDate(),
                location: copy.location,
                foodPic: copy.foodPic,
                quantity: copy.quantity,
            };
        });
        createPost(processingPosts);
       
        item.docs.forEach(async (docSnap) => {
        const postId = docSnap.id;
        const commentRef = collection(db, "forumPosts", postId, "comments");
        const q = query(commentRef, orderBy("timestamp", "asc"));

        onSnapshot(q, (commentSnapshot) => {
            const commentList = commentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));
            setComments((prev) => ({ ...prev, [postId]: commentList }));
        });
      });
    });
    return () => uncheck();
  }, []);
  
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
    formData.append("file", file);

    const res = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data && data.file) {
      return `https://ucarecdn.com/${data.file}/`;
    } else {
      alert("Failed to upload image.");
      return "";
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const existUser = auth.currentUser;
    if (!existUser || newPost.foodName.trim() === "") return;

    const selectedDate = new Date(newPost.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (selectedDate < today) {
    alert("Please select an expiry date that is today or later.");
    return;
    }
    
    try {
    let imageUrl = oriPic;
    if (photo) {
        imageUrl = await handleImageUpload(photo); 
    }

    const postDetails = {
        userId: existUser.uid,
        userName: existUser.displayName || "Anonymous",
        foodName: newPost.foodName,
        description: newPost.description,
        quantity: newPost.quantity,
        expiryDate: Timestamp.fromDate(selectedDate),
        location: newPost.location,
        foodPic: imageUrl, 
    };

    if (editingPost) {
        await updateDoc(doc(db, "forumPosts", editingPost), postDetails);
        alert("Edited post!");
    } else {
        await addDoc(collection(db, "forumPosts"), postDetails);
        alert("Post added!");
    }

    setNewPost({
      foodName: "",
      description: "",
      expiryDate: "",
      quantity: 1,
      location: "",
    });
    setPhoto(null);
    setEdit(null);
    setOriPic("");
  } catch (err) {
    console.error("Submit Error", err);
  }
};


  const handleDonate = async (post: ForumPosts) => {
    if (post.quantity > 1) {
        await updateDoc(doc(db, "forumPosts", post.postId), {
            quantity: post.quantity -1,
        });
    } else {
        await deleteDoc(doc(db, "forumPosts", post.postId));
    }
  };

  const handleDelete = async(post: ForumPosts) => {
    try {
        await deleteDoc(doc(db, "forumPosts", post.postId));
    } catch (err) {
        console.error("Error", err);
  }
};

const handleDeleteComment = async (postId: string, commentId: string) => {
  try {
    await deleteDoc(doc(db, "forumPosts", postId, "comments", commentId));
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Failed to delete comment.");
  }
};


const handleEdit = (post: ForumPosts) => {
  setNewPost({
    foodName: post.foodName,
    description: post.description,
    expiryDate: post.expiryDate.toISOString().slice(0, 10),
    quantity: post.quantity,
    location: post.location,
  });
  setOriPic(post.foodPic || "");
  setPhoto(null);
  setEdit(post.postId);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const selectedPost = post.filter((eachPost) => {
    const selectBySearch = eachPost.foodName.toLowerCase().includes(keyword.toLowerCase());
    const selectByDorm = filterDorm ? eachPost.location === filterDorm : true;
    return selectBySearch && selectByDorm;
  })
  .sort((x, y) => {
    if (sortDate === "latest") {
        return y.expiryDate.getTime() - x.expiryDate.getTime();
    } else {
        return x.expiryDate.getTime() - y.expiryDate.getTime();
    }
  });

  const handleCommentSubmit = async (postId: string) => {
  const user = auth.currentUser;
    if (!user || !newComment[postId]) return;

    const commentRef = collection(db, "forumPosts", postId, "comments");
    await addDoc(commentRef, {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        content: newComment[postId],
        timestamp: Timestamp.now(),
    });

    setNewComment((prev) => ({ ...prev, [postId]: "" }));
    };


  return (
    <div className="communityPage">
      <div className="communityContentWrapper">
      <button className="backBut" onClick={() => navigate(-1)}>Back</button>
        <h1>𝜗ৎCommunity Food Sharing⋆₊˚🍲</h1>
         <p className="communityCaption">
            Share surplus food with your campus community and reduce waste together! 🌱
         </p>
        <div className="communityContent">
            <div className="postList">
                <div className = "searchFilterSort">
                    <input
                        type="text"
                        placeholder="Search by food name 🔍"
                        value={keyword}
                        onChange={(e) => createKeyword(e.target.value)}
                        className="searchBar"
                    />
                    <select
                        value={filterDorm}
                        onChange={(e) => setDorm(e.target.value)}
                        className="filter"
                    >
                        <option value="">Filter by Dorm 🏠</option>
                        <option value="PGP">PGP</option>
                        <option value="UTown">UTown</option>
                        <option value="Tembusu">Tembusu</option>
                        <option value="CAPT">CAPT</option>
                        <option value="RC4">RC4</option>
                        <option value="RVRC">RVRC</option>
                        <option value="Kent Ridge Hall">Kent Ridge Hall</option>
                        <option value="Eusoff Hall">Eusoff Hall</option>
                        <option value="King Edward VII Hall">King Edward VII Hall</option>
                        <option value="Temasek Hall">Temasek Hall</option>
                        <option value="Sheares Hall">Sheares Hall</option>
                        <option value="Raffles Hall">Raffles Hall</option>
                        <option value="Valour House">Valour House</option>
                    </select>
                    <select
                        value={sortDate}
                        onChange={(e) => setDate(e.target.value)}
                        className="sort"
                    >
                        <option value="latest">Expiring Last</option>
                        <option value="oldest">Expiring First</option>
                    </select>
                </div>

                <div className= "postItems">
                    {selectedPost.length === 0 ? (
                        <p className="noPost">No posts yet</p>
                    ) : (
                        selectedPost.map((posts) => (
                        <React.Fragment key={posts.postId}>
                            <div className="postCard">
                            {posts.foodPic ? (
                                <img src={posts.foodPic} alt="food" className="postPhoto" />
                            ) : (
                                <div className="noImage">No Image</div>
                            )}
                            <div className="cardDescription">  
                                <div className="cardLeft"> 
                                <p
                                    className="usernamePost"
                                    title="View Profile"
                                    onClick={() => navigate(`/viewprofile/${posts.userId}`)}
                                    style={{ cursor: "pointer", textDecoration: "underline" }}
                                >
                                    @{posts.userName}
                                </p>
                                <h3 className="foodNamePost">{posts.foodName}</h3>
                                <p>Expires: {new Date(posts.expiryDate).toLocaleDateString()}</p>
                                <p>Location: {posts.location}</p>
                                <p>Quantity: {posts.quantity}</p>
                                </div>
                                <div className="cardRight">
                                <div className="descriptionBox">
                                    <p>{posts.description}</p>
                                </div>
                                <div className="postButtons">
                                    {auth.currentUser?.uid === posts.userId && (
                                    <>
                                        <button onClick={() => handleDonate(posts)}>Claim 1</button>
                                        <button onClick={() => handleEdit(posts)}>Edit</button>
                                        <button onClick={() => handleDelete(posts)}>Delete</button>
                                    </>
                                    )}
                                    <button onClick={() => navigate(`/chat`)}>Contact</button>
                                </div>
                                </div>
                            </div>
                            </div>

                            <div className="commentSection">
                            <div className="existingComments">
                                {comments[posts.postId]?.map((c) => (
                               <div key={c.id} className="commentItem">
                               <div className="commentContent">
                                    <div className="commentHeader">
                                    <strong>@{c.userName}</strong> —{" "}
                                    <span className="timestamp">
                                        {new Date(c.timestamp?.toDate?.()).toLocaleString()}
                                    </span>
                                    </div>
                                    <p>{c.content}</p>
                                    </div>

                                {auth.currentUser?.uid === c.userId && (
                                    <button
                                    className="deleteCommentBtn"
                                    onClick={() => handleDeleteComment(posts.postId, c.id)}
                                    title="Delete Comment"
                                    >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        width="18"
                                        fill="#888"
                                    >
                                        <path d="M0 0h24v24H0z" fill="none" />
                                        <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                                    </svg>
                                    </button>
                                )}
                                </div>
                                ))}
                            </div>

                            <div className="addComment">
                                <input
                                type="text"
                                value={newComment[posts.postId] || ""}
                                onChange={(e) =>
                                    setNewComment((prev) => ({ ...prev, [posts.postId]: e.target.value }))
                                }
                                placeholder="Write a comment..."
                                />
                                <button onClick={() => handleCommentSubmit(posts.postId)}
                                        disabled={!newComment[posts.postId]?.trim()}>
                                Post
                                </button>
                            </div>
                            </div>
                        </React.Fragment>
                        ))
                        )
                    }
                </div>
            </div>
        <div className="addPost">
            <form onSubmit={handleAdd} className="postStyle">
            <h3>{editingPost ? "Edit Post" : "Add Post"}</h3>

            <label>Food Name</label>
            <input
                type="text"
                placeholder="e.g. Bread, Milk, Eggs"
                value={newPost.foodName}
                onChange={(e) => setNewPost({ ...newPost, foodName: e.target.value })}
                required
            />

            <label>Description</label>
            <textarea
                placeholder="Optional comments"
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
            />

            <label>Expiry Date</label>
            <input
                type="date"
                value={newPost.expiryDate}
                onChange={(e) => setNewPost({ ...newPost, expiryDate: e.target.value })}
                required
            />

            <label>Dorm Location</label>
            <select
                value={newPost.location}
                onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                required
            >
                <option value="">Select Dorm</option>
                <option value="PGP">PGP</option>
                <option value="UTown">UTown</option>
                <option value="Tembusu">Tembusu</option>
                <option value="CAPT">CAPT</option>
                <option value="RC4">RC4</option>
                <option value="RVRC">RVRC</option>
                <option value="Kent Ridge Hall">Kent Ridge Hall</option>
                <option value="Eusoff Hall">Eusoff Hall</option>
                <option value="King Edward VII Hall">King Edward VII Hall</option>
                <option value="Temasek Hall">Temasek Hall</option>
                <option value="Sheares Hall">Sheares Hall</option>
                <option value="Raffles Hall">Raffles Hall</option>
                <option value="Valour House">Valour House</option>
            </select>

            <label>Quantity</label>
            <input
                type="number"
                min={1}
                value={newPost.quantity}
                onChange={(e) => setNewPost({ ...newPost, quantity: Number(e.target.value) })}
                required
            />

            <label>Photo</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />

            <button type="submit">{editingPost ? "Update" : "Post"}</button>

            {editingPost && (
                <button
                type="button"
                className="cancelEditBtn"
                onClick={() => {
                    setEdit(null);
                    setNewPost({
                    foodName: "",
                    description: "",
                    expiryDate: "",
                    quantity: 1,
                    location: "",
                    });
                    setPhoto(null);
                    setOriPic("");
                }}
                >
                Cancel Edit
                </button>
            )}
            </form>
            </div>
            </div>
            </div>
              <Footer />
            </div>
  );
}
