import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, startAt,endAt, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { showUpdatePopup } from "./updatePopup.js"

const firebaseConfig = {
    apiKey: "AIzaSyDpzV-aiwW2W0rnChv4S3yh6ZBNV-unlVw",
    authDomain: "dictionary-2ed92.firebaseapp.com",
    projectId: "dictionary-2ed92",
    storageBucket: "dictionary-2ed92.firebasestorage.app",
    messagingSenderId: "278887787702",
    appId: "1:278887787702:web:6066199b64ea1fe5aa0a17",
    measurementId: "G-B36QNFBD6N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function searchFirestore(searchTerm) {
    const tableBody = document.getElementById("dataTableBody");
    tableBody.innerHTML = '';

    try {
        let querySnapshot;

        if(searchTerm) {
            const q = query(
                collection(db, 'dictionary'),
                orderBy('vnWordLowerCase'),
                startAt(searchTerm.toLowerCase()),
                endAt(searchTerm.toLowerCase() + "\uf8ff")
            );
            querySnapshot = await getDocs(q);
        } else {
            querySnapshot = await getDocs(collection(db, 'dictionary'));
        }


        if (querySnapshot.empty) {
            tableBody.innerHTML = '<p>Không tìm thấy kết quả.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const row = document.createElement("tr");

            const vnWordCell = document.createElement("td");
            vnWordCell.textContent = data.vnWord;
            row.appendChild(vnWordCell);

            const engWordCell = document.createElement("td");
            engWordCell.textContent = data.engWord;
            row.appendChild(engWordCell);

            const typeCell = document.createElement("td");
            typeCell.textContent = data.type;
            row.appendChild(typeCell);

            const pronunciationCell = document.createElement("td");
            pronunciationCell.textContent = data.pronunciation;
            row.appendChild(pronunciationCell);

            row.appendChild(getCellTableMultiData(data.examples));

            row.appendChild(getCellImageTable(data.imageUrls));

            row.appendChild(getCellTableMultiData(data.groups));

            row.appendChild(getCellTableMultiData(data.notes));

            const actionCell = document.createElement("td");
            const buttonActionCell = document.createElement("button");
            buttonActionCell.textContent = 'Update'

            buttonActionCell.onclick = () => showUpdatePopup(doc.id);

            actionCell.appendChild(buttonActionCell);

            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        tableBody.innerHTML = '<p>Lỗi khi tìm kiếm. Vui lòng thử lại.</p>';
    }
};


export async function searchFirestoreSuggest(searchTerm) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';

    if (searchTerm === '') return;

    try {
        const q = query(
            collection(db, 'dictionary'),
            orderBy('vnWordLowerCase'),
            startAt(searchTerm.toLowerCase()),
            endAt(searchTerm.toLowerCase() + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            suggestionsContainer.innerHTML = '<p>Không tìm thấy kết quả.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = data.vnWord;

            suggestionItem.addEventListener('click', () => {
                document.getElementById('searchInput').value = data.vnWord;
                suggestionsContainer.innerHTML = '';

                searchFirestore(data.vnWord);
            });

            suggestionsContainer.appendChild(suggestionItem);
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        suggestionsContainer.innerHTML = '<p>Lỗi khi tìm kiếm. Vui lòng thử lại.</p>';
    }
};

function getCellTableMultiData(dataArray) {
    const cell = document.createElement("td");
    dataArray.forEach(data => {
        const dataDiv = document.createElement("div");
        dataDiv.textContent = data;
        cell.appendChild(dataDiv);
    });
    return cell;
};


function getCellImageTable(imageUrls) {
    if(!imageUrls) return document.createElement("td");
    const imageUrlCell = document.createElement("td");
    imageUrls.forEach(imageUrl => {
        if (imageUrl) {
            const imageUrlTag = document.createElement("img");
            imageUrlTag.src = imageUrl;
            imageUrlTag.alt = "Image";
            imageUrlTag.classList.add("imageUrl");
            imageUrlCell.appendChild(imageUrlTag);
        }
    })
    return imageUrlCell;
};