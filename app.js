import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, startAt,endAt } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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

async function searchFirestore(searchTerm) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    try {
        const q = query(
            collection(db, 'dictionary'),
            orderBy('vnWord'),
            startAt(searchTerm)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            resultsContainer.innerHTML = '<p>Không tìm thấy kết quả.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const resultItem = document.createElement('p');
            resultItem.textContent = `Kết quả: ${data.vnWord}`;
            resultsContainer.appendChild(resultItem);
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        resultsContainer.innerHTML = '<p>Lỗi khi tìm kiếm. Vui lòng thử lại.</p>';
    }
};


async function searchFirestoreSuggest(searchTerm) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';

    if (searchTerm === '') return;

    try {
        const q = query(
            collection(db, 'dictionary'),
            orderBy('vnWord'),
            startAt(searchTerm),
            endAt(searchTerm + '\uf8ff')
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
}

function addListenerForAddIcon() {

    const addExampleButton = document.getElementById('addExample');
    const examplesInputContainer = document.getElementById('examples');
    addExampleButton.addEventListener('click', function() {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = 'Ví dụ';
        newInput.classList.add('example-input');
        examplesInputContainer.parentElement.insertBefore(newInput, examplesInputContainer.nextSibling);
    });

    const addGroupButton = document.getElementById('addGroup');
    const groupsInputContainer = document.getElementById('groups');
    addGroupButton.addEventListener('click', function() {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = 'Nhóm từ vựng';
        newInput.classList.add('group-input');
        groupsInputContainer.parentElement.insertBefore(newInput, groupsInputContainer.nextSibling);
    });

    const addNoteButton = document.getElementById('addNote');
    const notesInputContainer = document.getElementById('notes');
    addNoteButton.addEventListener('click', function() {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = 'Lưu ý';
        newInput.classList.add('note-input');
        notesInputContainer.parentElement.insertBefore(newInput, notesInputContainer.nextSibling);
    });
}

async function isDuplicate(vnWord, engWord) {

        const q = query(
            collection(db, 'dictionary'),
            where("vnWord", "==", vnWord),
            where("engWord", "==", engWord)
        );

        const querySnapshot = await getDocs(q);

        return !querySnapshot.empty;
}


document.addEventListener('DOMContentLoaded', () => {
    addListenerForAddIcon();

    document.getElementById('addForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        let vnWord = document.getElementById('vnWord')?.value?.trim();
        let engWord = document.getElementById('engWord')?.value?.trim();
        let type = document.getElementById('type')?.value?.trim();
        let pronunciation = document.getElementById('pronunciation')?.value?.trim();
        let imageUrl = document.getElementById('imageUrl')?.value?.trim();


        const q = query(
            collection(db, 'dictionary'),
            where("vnWord", "==", vnWord),
            where("engWord", "==", engWord)
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

        try {
            await addDoc(collection(db, 'dictionary'), {
                vnWord,
                engWord,
                type,
                pronunciation,
                examples,
                imageUrl,
                groups,
                notes,
                insDtm: serverTimestamp()
            });

            showPopup('Dữ liệu đã được thêm vào Dictionary!', 'success');
            document.getElementById('vnWord').value = '';
            document.getElementById('engWord').value = '';
            document.getElementById('type').value = '';
            document.getElementById('pronunciation').value = '';
            document.getElementById('imageUrl').value = '';

            exampleInputs.forEach(input => {
                input.value = '';
            });
            groupInputs.forEach(input => {
                input.value = '';
            });
            noteInputs.forEach(input => {
                input.value = '';
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
        if (searchTerm) {
            searchFirestore(searchTerm);
        }
    });

    document.getElementById('searchInput').addEventListener('input', (event) => {
        const searchTerm = event.target.value.trim();
        searchFirestoreSuggest(searchTerm);
    });
});


