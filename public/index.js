const BASE = "/api";
const tokenKey = "hw_token";

function getToken(){ return localStorage.getItem(tokenKey); }
function setToken(t){ if(t) localStorage.setItem(tokenKey, t); else localStorage.removeItem(tokenKey); }
function authHeader(){ const t=getToken(); return t?{ "Authorization": `Bearer ${t}` } : {}; }

async function postJSON(path, body){ const res=await fetch(BASE+path,{method:"POST",headers:{"Content-Type":"application/json",...authHeader()},body:JSON.stringify(body)}); return res.json(); }
async function postForm(path, formData){ const res=await fetch(BASE+path,{method:"POST",headers:{...authHeader()},body:formData}); return res.json(); }
async function getJSON(path){ const res=await fetch(BASE+path,{headers:{...authHeader()}}); return res.json(); }
async function deleteJSON(path){ const res=await fetch(BASE+path,{method:"DELETE",headers:{...authHeader()}}); return res.json(); }
async function putJSON(path, body){ const res=await fetch(BASE+path,{method:"PUT",headers:{"Content-Type":"application/json",...authHeader()},body:JSON.stringify(body)}); return res.json(); }

// decode jwt payload (no signature verify) to get user_id and is_admin
function parseJwt(token){
  if(!token) return null;
  try{
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  }catch(e){ return null; }
}

function updateAuthUI(){
  const token = getToken();
  const payload = parseJwt(token);

  // hide auth forms when logged in
  document.getElementById("authSection").classList.toggle("hidden", !!token);

  // user info panel
  document.getElementById("userInfo").classList.toggle("hidden", !token);

  // nav login/register visibility
  document.getElementById("navLogin").classList.toggle("hidden", !!token);
  document.getElementById("navRegister").classList.toggle("hidden", !!token);
  document.getElementById("navLogout").classList.toggle("hidden", !token);

  const navUser = document.getElementById("navUser");
  if(payload){
    // For Cognito JWT tokens, use the correct field names
    const userId = payload.sub || payload.user_id || payload.id;
    const username = payload["cognito:username"] || payload.username || userId;
    
    // Check admin status from Cognito groups
    let isAdmin = false;
    if (payload["cognito:groups"] && Array.isArray(payload["cognito:groups"])) {
      isAdmin = payload["cognito:groups"].includes("admin");
    }
    
    console.log("🔍 JWT Payload:", payload);
    console.log(`👤 Parsed user - ID: ${userId}, Username: ${username}, Admin: ${isAdmin}`);
    
    document.getElementById("whoami").textContent = `id: ${userId} | user: ${username} | admin: ${isAdmin ? "yes":"no"}`;
    document.getElementById("deleteAllNotesBtn").classList.toggle("hidden", !isAdmin);
    navUser.classList.remove("hidden");
    navUser.textContent = `User ${username}`;
  } else {
    document.getElementById("whoami").textContent = "";
    document.getElementById("deleteAllNotesBtn").classList.add("hidden");
    navUser.classList.add("hidden");
    navUser.textContent = "";
  }
}

// nav logout click
document.getElementById("navLogout").addEventListener("click", (e) => {
  e.preventDefault();
  setToken(null);
  updateAuthUI();
  // optionally refresh notes to reflect logged-out view
  refreshNotes();
});

// Register
document.getElementById("registerForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const body={ 
    username: fd.get("username"), 
    email: fd.get("email"),
    password: fd.get("password"), 
    is_admin: fd.get("is_admin")?true:false 
  };
  const data = await postJSON("/auth/register", body);
  document.getElementById("registerResult").textContent = JSON.stringify(data, null, 2);
  // Registration just sends confirmation email, no token yet
});

// Confirm Registration
document.getElementById("confirmForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const body={ 
    username: fd.get("username"), 
    confirmationCode: fd.get("confirmationCode"), 
    is_admin: fd.get("is_admin")?true:false 
  };
  const data = await postJSON("/auth/confirm", body);
  document.getElementById("confirmResult").textContent = JSON.stringify(data, null, 2);
  // After confirmation, user still needs to login
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const body={ username: fd.get("username"), password: fd.get("password") };
  const data = await postJSON("/auth/login", body);
  if(data.token){ setToken(data.token); document.getElementById("loginResult").textContent = "Logged in. Token saved."; updateAuthUI(); refreshNotes(); }
  else { setToken(null); document.getElementById("loginResult").textContent = JSON.stringify(data, null, 2); updateAuthUI(); }
});

document.getElementById("logoutBtn").addEventListener("click", ()=>{ setToken(null); updateAuthUI(); });

// Google Sign-In
document.getElementById("googleSignInBtn").addEventListener("click", async ()=>{
  try {
    // Initialize Google Sign-In with your client ID
    const GOOGLE_CLIENT_ID = "420352551426-av61nol3qq9mjmai42atnfus4pin6679.apps.googleusercontent.com"; // Replace with your actual Google Client ID from Google Cloud Console
    
    // Use Google Identity Services
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        console.log("Google Sign-In successful");
        console.log("Google ID Token:", response.credential);
        
        // Store the Google ID token (same as Cognito token)
        setToken(response.credential);
        document.getElementById("loginResult").textContent = "Signed in with Google successfully!";
        updateAuthUI();
        refreshNotes();
      }
    });
    
    // Prompt for sign-in
    google.accounts.id.prompt();
    
  } catch (error) {
    console.error("Google Sign-In error:", error);
    document.getElementById("loginResult").textContent = "Google Sign-In failed: " + error.message;
  }
});

// nav link behavior
document.getElementById("navHome").addEventListener("click", (e)=>{ e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
document.getElementById("navLogin").addEventListener("click", (e)=>{ e.preventDefault(); document.getElementById("authSection").classList.remove("hidden"); document.querySelector("#loginForm input").focus(); });
document.getElementById("navRegister").addEventListener("click", (e)=>{ e.preventDefault(); document.getElementById("authSection").classList.remove("hidden"); document.querySelector("#registerForm input").focus(); });

// Create note(s) (supports multiple files)
document.getElementById("createNoteForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const files = e.target.note_picture.files;
  if(files.length>1){
    const mf = new FormData();
    mf.append("note_title", fd.get("note_title"));
    mf.append("time", fd.get("time"));
    for(const f of files) mf.append("note_picture", f, f.name);
    const data = await postForm("/notes", mf);
    document.getElementById("createNoteResult").textContent = JSON.stringify(data, null, 2);
  } else {
    const data = await postForm("/notes", fd);
    document.getElementById("createNoteResult").textContent = JSON.stringify(data, null, 2);
  }
  await refreshNotes();
});

// comment creation - only for admins per requirement (UI shows only to admin on each card)
async function createComment(noteId, description, ai_prompt_comment, userId){
  const body = { description, commentTo: noteId, commentBy: userId};
  if (ai_prompt_comment) body.ai_prompt_comment = ai_prompt_comment;
  const data = await postJSON("/comments", body);
  return data;
}

// delete all notes (admin only)
document.getElementById("deleteAllNotesBtn").addEventListener("click", async ()=>{
  if(!confirm("Delete ALL notes?")) return;
  const data = await deleteJSON("/notes");
  alert(JSON.stringify(data));
  refreshNotes();
});

// refresh (with optional search)
async function refreshNotes(){
  const q = document.getElementById("searchInput").value.trim();
  const url = q ? `/notes?note_title=${encodeURIComponent(q)}` : "/notes";
  const data = await getJSON(url);
  renderNotes(data);
}
document.getElementById("refreshNotes").addEventListener("click", refreshNotes);
document.getElementById("searchBtn").addEventListener("click", refreshNotes);

// render notes with per-note controls depending on role/ownership
async function renderNotes(data){
  const container = document.getElementById("notesGrid");
  container.innerHTML = "";
  if(!Array.isArray(data)){ container.textContent = JSON.stringify(data, null, 2); return; }
  const token = getToken();
  const payload = parseJwt(token);
  
  // Fixed: Use Cognito JWT structure for user ID and admin status
  const myId = payload ? (payload.sub || payload.user_id || payload.id) : null;
  let isAdmin = false;
  if (payload && payload["cognito:groups"] && Array.isArray(payload["cognito:groups"])) {
    isAdmin = payload["cognito:groups"].includes("admin");
  }

  console.log("🔍 Render Notes - User ID:", myId, "Admin:", isAdmin, "Groups:", payload ? payload["cognito:groups"] : "none");

  data.forEach(note=>{
    const card = document.createElement("div");
    card.className = "note-card";

    const imgWrap = document.createElement("div");
    imgWrap.className = "note-imgwrap";
    const img = document.createElement("img");
    if(note.presignedUrl) {
      img.src = note.presignedUrl;
      console.log("🔍 Using S3 image for note:", note.id);
    } else {
      // No S3 image available - legacy note or missing image
      img.style.display = 'none';
      console.log("🔍 No S3 image for note:", note.id, "note_picture:", note.note_picture);
    }
    imgWrap.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = note.note_title || "Untitled";

    const meta = document.createElement("div");
    meta.className = "muted";
    // meta.textContent = `owner: ${note.owner ?? (note.User?.id ?? "unknown")} • time: ${note.time ?? ""}`;
    meta.textContent = `owner: ${note.Owner?.username ?? "unknown"} • time: ${note.time ?? ""}`;


    const summary = document.createElement("p");
    summary.textContent = note.ai_summary ?? "";

    // controls row
    const ctr = document.createElement("div");
    ctr.style.display = "flex";
    ctr.style.gap = "6px";
    ctr.style.marginTop = "8px";

    // delete per-note: allowed for admin or owner
    // if(isAdmin || (myId && Number(myId) === Number(note.owner))){
     if(isAdmin || (myId && Number(myId) === Number(note.ownerId))){
      const del = document.createElement("button");
      del.className = "small-btn";
      del.textContent = "Delete";
      del.addEventListener("click", async ()=>{
        if(!confirm("Delete this note?")) return;
        const r = await deleteJSON(`/notes/${note.id}`);
        alert(JSON.stringify(r));
        refreshNotes();
      });
      ctr.appendChild(del);
    }

    // update note (owner only)
    // if(myId && Number(myId) === Number(note.owner)){
    if(myId && Number(myId) === Number(note.ownerId)){
      const upd = document.createElement("button");
      upd.className = "small-btn";
      upd.textContent = "Edit Title";
      upd.addEventListener("click", async ()=>{
        const nv = prompt("New title:", note.note_title || "");
        if(nv==null) return;
        const r = await putJSON(`/notes/${note.id}`, { note_title: nv });
        alert(JSON.stringify(r));
        refreshNotes();
      });
      ctr.appendChild(upd);
    }

    // comment button (admin only as requested)
    if(isAdmin){
      const cbtn = document.createElement("button");
      cbtn.className = "small-btn";
      cbtn.textContent = "Comment";
      cbtn.addEventListener("click", ()=>{
        // avoid adding duplicate inline form
        if (card.querySelector(".comment-form-inline")) return;

        const form = document.createElement("form");
        form.className = "comment-form-inline";
        form.style.marginTop = "8px";
        form.innerHTML = `
          <input name="description" placeholder="Comment text" required />
          <input name="ai_prompt_comment" placeholder="Prompt to get reccomendation from Harvard Art Muesuem(optional)" />
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button type="submit" class="small-btn">Send</button>
            <button type="button" class="small-btn cancel-btn">Cancel</button>
          </div>
        `;

        // cancel handler
        form.querySelector(".cancel-btn").addEventListener("click", (ev)=>{
          ev.preventDefault();
          form.remove();
        });

        // submit handler
        form.addEventListener("submit", async (ev)=>{
          ev.preventDefault();
          const fd = new FormData(form);
          const desc = fd.get("description");
          const aiPrompt = fd.get("ai_prompt_comment");
          const res = await createComment(note.id, desc, aiPrompt, myId);
          alert(JSON.stringify(res));
          form.remove();
          refreshNotes();
        });

        card.appendChild(form);
      });
      ctr.appendChild(cbtn);
    }

    // S3 Download URL button (only if image exists and user is logged in)
    if(token && note.presignedUrl){
      const downloadUrlBtn = document.createElement("button");
      downloadUrlBtn.className = "small-btn";
      downloadUrlBtn.textContent = "S3 Download URL";
      downloadUrlBtn.addEventListener("click", async ()=>{
        try {
          const downloadRes = await getJSON(`/notes/presigned/download/${note.id}`);
          
          if(downloadRes.error) {
            alert("Error: " + downloadRes.error);
            return;
          }
          
          // Create popup content with copy button
          const popupContent = `
            Download URL for "${note.note_title}":
            
${downloadRes.presignedUrl}

This URL is valid for 1 hour.

Click OK to copy the URL to clipboard.
          `;
          
          // Show popup and copy URL if user clicks OK
          if(confirm(popupContent)) {
            // Copy URL to clipboard
            try {
              await navigator.clipboard.writeText(downloadRes.presignedUrl);
              alert("URL copied to clipboard!");
            } catch(err) {
              // Fallback for older browsers
              const textArea = document.createElement("textarea");
              textArea.value = downloadRes.presignedUrl;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              alert("URL copied to clipboard!");
            }
          }
          
        } catch(err) {
          alert("Error: " + err.message);
        }
      });
      ctr.appendChild(downloadUrlBtn);
    }

    // comments display (if present)
    const commentsDiv = document.createElement("div");
    if(note.Comments && note.Comments.length){
      const list = document.createElement("ul");
      note.Comments.forEach(c => {
        const li = document.createElement("li");
        li.textContent = `${c.description} — by ${c.User?.username ?? "unknown"} (${new Date(c.createdAt).toLocaleString()})`;
        list.appendChild(li);
        
        // Add AI comment if it exists
        if (c.ai_comment) {
          const aiLi = document.createElement("li");
          aiLi.style.fontStyle = "italic";
          aiLi.style.color = "#666";
          aiLi.style.marginLeft = "20px";
          aiLi.textContent = `🎨 AI Recommendation: ${c.ai_comment}`;
          list.appendChild(aiLi);
        }
      });
      commentsDiv.appendChild(list);
    }

    card.appendChild(imgWrap);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(summary);
    card.appendChild(ctr);
    card.appendChild(commentsDiv);

    container.appendChild(card);
  });
}

// init UI state
updateAuthUI();
if(getToken()) refreshNotes();
