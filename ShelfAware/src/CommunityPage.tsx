import React, { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
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
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
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
  const [photoUrl, setPhotoUrl] = useState("");
  const [editingPost, setEdit] = useState<string | null>(null);
  const [oriPic, setOriPic] = useState("");
  const navigate = useNavigate();

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
        expiryDate: Timestamp.fromDate(new Date(newPost.expiryDate)),
        location: newPost.location,
        foodPic: imageUrl, // ✅ correct final value
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
    setPhotoUrl("");
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
  setPhotoUrl("");
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

  return (
    <div className="communityPage">
      <div className="communityContentWrapper">
      <button className="backBut" onClick={() => navigate(-1)}>Back</button>
        <h1>Community Food Sharing 🍲</h1>
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
                    </select>
                    <select
                        value={sortDate}
                        onChange={(e) => setDate(e.target.value)}
                        className="sort"
                    >
                        <option value="latest">Sort by Latest</option>
                        <option value="oldest">Sort by Oldest</option>
                    </select>
                </div>

                <div className= "postItems">
                    {selectedPost.length === 0 ? (
                        <p className="noPost">No posts yet</p>
                    ) : (
                        selectedPost.map((posts) => (
                            <div key = {posts.postId} className="postCard">
                                {posts.foodPic ? (
                                    <img src={posts.foodPic} alt="food" className="postPhoto" />
                                ) : (
                                    <div className="noImage">No Image</div>
                                )}
                                <div className="cardDescription">  
                                    <div className="cardLeft"> 
                                        <p className="usernamePost">@{posts.userName}</p>
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
                                                <button onClick={() => handleDonate(posts)}> Claim 1</button>
                                            )}
                                                <>
                                                    <button onClick={() => handleEdit(posts)}>Edit</button>
                                                    <button  onClick={() => handleDelete(posts)}>Delete</button>
                                                </>
                                            <button onClick={() => navigate(`/chats`)}>Contact</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        <div className="addPost">
            <form onSubmit={handleAdd} className="postStyle">
                <h3>Add Post</h3>
                <input
                    type = "text"
                    placeholder = "Food Name"
                    value = {newPost.foodName}
                    onChange = {(e) => setNewPost({ ...newPost, foodName: e.target.value })}
                    required
                />
                <textarea placeholder = "Description"
            value = {newPost.description}
                    onChange = {(e) => setNewPost({ ...newPost, description: e.target.value })}
                />
                <input
                    type="date"
                    value={newPost.expiryDate}
                    onChange={(e) => setNewPost({ ...newPost, expiryDate: e.target.value })}
                    required
                />
                <select
                    value={newPost.location}
                    onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                    required>
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
                </select>

                <input
                    type="number"
                    min={1}
                    value={newPost.quantity}
                    onChange={(e) => setNewPost({ ...newPost, quantity: Number(e.target.value) })}
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
                <button type="submit">Post</button>
                {editingPost && (
                    <button
                        type="button"
                        className="cancelEditBtn"
                        onClick={() => {
                            setEdit(null);
                            setNewPost({
                                foodName:"",
                                description: "",
                                expiryDate: "",
                                quantity: 1,
                                location: "",
                            });
                            setPhoto(null);
                            setPhotoUrl("");
                            setOriPic("");
                        }}
                    >Cancel Edit
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
