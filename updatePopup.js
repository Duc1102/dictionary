import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, startAt,endAt, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { searchFirestore } from "./search.js"

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
let currentUserDocRef;

function removeInput(iconElement) {
    const inputContainer = iconElement.parentElement;
    inputContainer.remove(); // Xóa ô chứa input khỏi DOM
}

function createAddRemoveIcon(inputId, addId, placeHolder, inputClass, valueInput) {
    const addButton = document.getElementById(addId);
    const input = document.getElementById(inputId);

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.placeholder = placeHolder;
    newInput.classList.add(inputClass, 'removable-input');
    newInput.value  = valueInput;
    inputContainer.insertBefore(newInput, inputContainer.nextSibling);

    const spanRemove = document.createElement('span');
    spanRemove.classList.add('remove-icon');
    spanRemove.textContent = 'x';
    inputContainer.insertBefore(spanRemove, inputContainer.nextSibling);

    input.parentElement.insertBefore(inputContainer, input.nextSibling);

    document.querySelectorAll('.remove-icon').forEach(spanRemoveV => {
        spanRemoveV.onclick = () => removeInput(spanRemoveV);
    });

}


function fillDataList(dataList, inputId, addId, placeHolder, inputClass) {
    if(!dataList) return;

    document.getElementById(inputId).value = dataList.shift();

    dataList?.forEach(data => {
        createAddRemoveIcon(inputId, addId, placeHolder, inputClass, data);
    })
}

export async function showUpdatePopup(userId) {
    currentUserDocRef = doc(db, "dictionary", userId);
    const docSnap = await getDoc(currentUserDocRef);

    if (docSnap.exists()) {
        document.getElementById("popup-vnWord").value = docSnap.data().vnWord;
        document.getElementById("popup-engWord").value = docSnap.data().engWord;
        document.getElementById("popup-type").value = docSnap.data().type;
        document.getElementById("popup-pronunciation").value = docSnap.data().pronunciation;

        fillDataList(docSnap.data().examples, 'popup-examples', 'popup-addExample', 'Ví dụ', 'example-input');
        fillDataList(docSnap.data().groups, 'popup-groups', 'popup-addGroup', 'Nhóm từ vựng', 'group-input');
        fillDataList(docSnap.data().notes, 'popup-notes', 'popup-addNote', 'Lưu ý', 'note-input');
        fillDataList(docSnap.data().imageUrls, 'popup-imageUrls', 'popup-addImageUrl', 'Hình ảnh', 'imageUrl-input');

        document.getElementById("update-popup").style.display = "block";
        document.getElementById("overlay").style.display = "block";
    } else {
        console.error("No such document!");
    }
}


// Hàm lưu dữ liệu đã cập nhật
window.saveUpdate = async function() {
    let vnWord = document.getElementById('popup-vnWord')?.value?.trim();
    let engWord = document.getElementById('popup-engWord')?.value?.trim();
    let type = document.getElementById('popup-type')?.value?.trim();
    let pronunciation = document.getElementById('popup-pronunciation')?.value?.trim();
    const examplesInputContainer = document.getElementById('popup-examples');
    const exampleInputs = examplesInputContainer.parentElement.querySelectorAll('.example-input');
    const examples = Array.from(exampleInputs).map(input => input.value?.trim());

    const groupsInputContainer = document.getElementById('popup-groups');
    const groupInputs = groupsInputContainer.parentElement.querySelectorAll('.group-input');
    const groups = Array.from(groupInputs).map(input => input.value?.trim());

    const notesInputContainer = document.getElementById('popup-notes');
    const noteInputs = notesInputContainer.parentElement.querySelectorAll('.note-input');
    const notes = Array.from(noteInputs).map(input => input.value?.trim());

    const imageUrlsInputContainer = document.getElementById('popup-imageUrls');
    const imageUrlsInputs = imageUrlsInputContainer.parentElement.querySelectorAll('.imageUrl-input');
    const imageUrls = Array.from(imageUrlsInputs).map(input => input.value?.trim());

    if (currentUserDocRef) {
        await updateDoc(currentUserDocRef, {
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
            updDtm: serverTimestamp()
        });
        closePopup();
        await searchFirestore();
    }
}

// Hàm đóng popup
window.closePopup = function() {
    document.getElementById("update-popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    currentUserDocRef = null;

    document.querySelectorAll('.remove-icon').forEach(spanRemoveV => {
        removeInput(spanRemoveV);
    });
}
