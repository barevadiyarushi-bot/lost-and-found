// --- 1. FIREBASE CONFIGURATION ---
// REPLACE THIS WITH YOUR OWN KEYS FROM FIREBASE CONSOLE
const firebaseConfig = {
   apiKey: "AIzaSyD79MxDIWeHUEY6zRY36o2aZfmJ7AYkE7E",
    authDomain: "campuslostfound-f53bd.firebaseapp.com",
    projectId: "campuslostfound-f53bd",
    storageBucket: "campuslostfound-f53bd.firebasestorage.app",
    messagingSenderId: "1026302926131",
    appId: "1:1026302926131:web:bc8906005adf9cc9a3f246"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// --- 2. AUTHENTICATION LOGIC (Login Page) ---

function registerUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(!email || !password) return alert("Enter email and password!");

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Account created! Logging in...");
            window.location.href = "index.html";
        })
        .catch((error) => alert(error.message));
}

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(!email || !password) return alert("Enter email and password!");

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => alert("Login Failed: " + error.message));
}

// --- 3. UPLOAD LOGIC (Report Page) ---
async function uploadItem() {
    const title = document.getElementById('title').value;
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;
    const contact = document.getElementById('contact').value;
    const file = document.getElementById('imageBtn').files[0];
    const btn = document.getElementById('submitBtn');

    if (!title || !file || !contact) {
        alert("Please fill in Title, Contact, and Image!");
        return;
    }

    btn.innerText = "Uploading...";
    btn.disabled = true;

    try {
        const storageRef = storage.ref('item_images/' + new Date().getTime() + '-' + file.name);
        await storageRef.put(file);
        const imageUrl = await storageRef.getDownloadURL();

        await db.collection('items').add({
            title: title,
            type: type,
            description: desc,
            contact: contact,
            imageUrl: imageUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Item posted successfully!");
        window.location.href = "index.html"; 

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        btn.innerText = "Submit Post";
        btn.disabled = false;
    }
}

// --- 4. DISPLAY LOGIC (Home Page) ---
function loadItems() {
    const container = document.getElementById('itemsContainer');
    if(!container) return; // Stop if not on index page

    db.collection('items').orderBy('timestamp', 'desc').get().then((querySnapshot) => {
        container.innerHTML = ""; 
        
        if(querySnapshot.empty) {
            container.innerHTML = "<p>No items found.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            const card = `
                <div class="card" data-title="${data.title.toLowerCase()}" data-type="${data.type}">
                    <div class="card-img-container">
                        <img src="${data.imageUrl}" alt="Item">
                        <span class="badge ${data.type.toLowerCase()}">${data.type}</span>
                    </div>
                    <div class="card-body">
                        <h3>${data.title}</h3>
                        <p>${data.description}</p>
                        <a href="https://wa.me/91${data.contact}" target="_blank" class="whatsapp-btn">
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    });
}

// --- 5. SEARCH FILTER LOGIC ---
function filterItems() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('filterType').value;
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title');
        const cardType = card.getAttribute('data-type');
        
        const matchesSearch = title.includes(search);
        const matchesType = (type === 'all') || (cardType === type);

        if (matchesSearch && matchesType) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}