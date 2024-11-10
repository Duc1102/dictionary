import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, startAt,endAt, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import {searchFirestore, searchFirestoreSuggest} from "./search.js"

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

window.showSection = function(section) {
    document.getElementById('addSection').style.display = section === 'add' ? 'block' : 'none';
    document.getElementById('searchSection').style.display = section === 'search' ? 'block' : 'none';
}

const modal = document.getElementById("popupModal");
const closeBtn = document.querySelector(".close");
const messageElement = document.getElementById("popupMessage");

function showPopup(message, type) {
    messageElement.textContent = message;

    messageElement.classList.remove('success', 'error');

    if (type === 'success') {
        messageElement.parentElement.classList.add('success');
    } else if (type === 'error') {
        messageElement.parentElement.classList.add('error');
    }

    modal.style.display = "block";
}

closeBtn.onclick = function() {
    modal.style.display = "none";
    messageElement.parentElement.classList.remove('success', 'error');
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        messageElement.parentElement.classList.remove('success', 'error');
    }
}

function removeInput(iconElement) {
    const inputContainer = iconElement.parentElement;
    inputContainer.remove(); // Xóa ô chứa input khỏi DOM
}

function createAddRemoveIcon(inputId, addId, placeHolder, inputClass, valueInput) {
    const addButton = document.getElementById(addId);
    const input = document.getElementById(inputId);
    addButton.addEventListener('click', function() {
        const inputContainer = document.createElement('div');
        inputContainer.classList.add('input-container');
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = placeHolder;
        newInput.classList.add(inputClass, 'removable-input');
        newInput.textContent = valueInput;
        inputContainer.insertBefore(newInput, inputContainer.nextSibling);

        const spanRemove = document.createElement('span');
        spanRemove.classList.add('remove-icon');
        spanRemove.textContent = 'x';
        inputContainer.insertBefore(spanRemove, inputContainer.nextSibling);

        const secondLastElement = input.parentElement.children[input.parentElement.children.length - 1];

        input.parentElement.insertBefore(inputContainer, secondLastElement);

        document.querySelectorAll('.remove-icon').forEach(spanRemoveV => {
            spanRemoveV.onclick = () => removeInput(spanRemoveV);
        });
    });
}

function addListenerForAddIcon() {
    createAddRemoveIcon('examples', 'addExample', 'Ví dụ', 'example-input');
    createAddRemoveIcon('groups', 'addGroup', 'Nhóm từ vựng', 'group-input');
    createAddRemoveIcon('notes', 'addNote', 'Lưu ý', 'note-input');
    createAddRemoveIcon('imageUrls', 'addImageUrl', 'Hình ảnh', 'imageUrl-input');

    // update
    createAddRemoveIcon('popup-examples', 'popup-addExample', 'Ví dụ', 'example-input');
    createAddRemoveIcon('popup-groups', 'popup-addGroup', 'Nhóm từ vựng', 'group-input');
    createAddRemoveIcon('popup-notes', 'popup-addNote', 'Lưu ý', 'note-input');
    createAddRemoveIcon('popup-imageUrls', 'popup-addImageUrl', 'Hình ảnh', 'imageUrl-input');
}

function getValueFromInput(inputId, inputClass) {
    const inputContainer = document.getElementById(inputId);
    const inputs = inputContainer.parentElement.querySelectorAll('.' + inputClass);
    return Array.from(inputs).map(input => input.value?.trim());
}

document.addEventListener('DOMContentLoaded', () => {
    addListenerForAddIcon();

    document.getElementById('addForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        let vnWord = document.getElementById('vnWord')?.value?.trim();
        let engWord = document.getElementById('engWord')?.value?.trim();
        let type = document.getElementById('type')?.value?.trim();
        let pronunciation = document.getElementById('pronunciation')?.value?.trim();

        const q = query(
            collection(db, 'dictionary'),
            where("vnWordLowerCase", "==", vnWord.toLowerCase()),
            where("engWordLowerCase", "==", engWord.toLowerCase())
        );

        const querySnapshot = await getDocs(q);

        if(!querySnapshot.empty) {
            showPopup('Duplicate. Vui lòng thử lại.', 'error');
            return;
        }

        const examplesInputContainer = document.getElementById('examples');
        const exampleInputs = examplesInputContainer.parentElement.querySelectorAll('.example-input');
        const examples = Array.from(exampleInputs).map(input => input.value?.trim());

        const groupsInputContainer = document.getElementById('groups');
        const groupInputs = groupsInputContainer.parentElement.querySelectorAll('.group-input');
        const groups = Array.from(groupInputs).map(input => input.value?.trim());

        const notesInputContainer = document.getElementById('notes');
        const noteInputs = notesInputContainer.parentElement.querySelectorAll('.note-input');
        const notes = Array.from(noteInputs).map(input => input.value?.trim());

        const imageUrlsInputContainer = document.getElementById('imageUrls');
        const imageUrlsInputs = imageUrlsInputContainer.parentElement.querySelectorAll('.imageUrl-input');
        const imageUrls = Array.from(imageUrlsInputs).map(input => input.value?.trim());

        try {
            await addDoc(collection(db, 'dictionary'), {
                vnWord,
                vnWordLowerCase: vnWord?.toLowerCase(),
                engWord,
                engWordLowerCase: engWord?.toLowerCase(),
                type,
                pronunciation,
                examples,
                imageUrls,
                groups,
                notes,
                insDtm: serverTimestamp()
            });

            showPopup('Dữ liệu đã được thêm vào Dictionary!', 'success');
            document.getElementById('vnWord').value = '';
            document.getElementById('engWord').value = '';
            document.getElementById('type').value = '';
            document.getElementById('pronunciation').value = '';

            exampleInputs.forEach(input => {
                input.value = '';
            });
            groupInputs.forEach(input => {
                input.value = '';
            });
            noteInputs.forEach(input => {
                input.value = '';
            });
            imageUrlsInputs.forEach(input => {
                input.value = '';
            });

            document.querySelectorAll('.remove-icon').forEach(spanRemoveV => {
                removeInput(spanRemoveV);
            });

        } catch (error) {
            console.error('Lỗi khi thêm dữ liệu:', error);
            showPopup('Lỗi khi thêm dữ liệu. Vui lòng liên hệ ntduc3.', 'error');
        }
    });

    document.getElementById('searchForm').addEventListener('submit', (event) => {
        event.preventDefault();

        document.getElementById('suggestions').innerHTML = '';

        const searchTerm = document.getElementById('searchInput').value.trim();
        searchFirestore(searchTerm);
    });

    document.getElementById('searchInput').addEventListener('input', (event) => {
        const searchTerm = event.target.value.trim();
        searchFirestoreSuggest(searchTerm);
    });
});





