const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const startBtn = document.getElementById("startBtn");
const fileList = document.getElementById("fileList");

const queue = [];

selectBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
    [...fileInput.files].forEach(addFile);
};

dropzone.ondragover = e => {
    e.preventDefault();
    dropzone.classList.add("drag");
};

dropzone.ondragleave = () => dropzone.classList.remove("drag");

dropzone.ondrop = e => {
    e.preventDefault();
    dropzone.classList.remove("drag");
    [...e.dataTransfer.files].forEach(addFile);
};

function addFile(file) {
    const item = {
        file,
        status: "pending",
        blob: null
    };

    queue.push(item);
    renderItem(item);
    startBtn.disabled = false;
}

function renderItem(item) {
    const li = document.createElement("li");
    li.innerHTML = `
    <span>${item.file.name}</span>
    <span class="status">Chờ chuyển</span>
  `;
    item.el = li;
    fileList.appendChild(li);
}

startBtn.onclick = async () => {
    startBtn.disabled = true;

    for (const item of queue) {
        if (item.status !== "pending") continue;
        await convert(item);
    }
};

async function convert(item) {
    const status = item.el.querySelector(".status");
    status.textContent = "Đang xử lý...";
    status.className = "status processing";

    const form = new FormData();
    form.append("file", item.file);

    try {
        const res = await fetch("/upload", {
            method: "POST",
            body: form
        });

        if (!res.ok) throw new Error();

        const blob = await res.blob();
        item.blob = blob;
        item.status = "done";

        status.innerHTML = `
      <button class="download">Tải PDF</button>
    `;
        status.className = "status done";

        status.querySelector(".download").onclick = () => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = item.file.name.replace(/\.(docx|doc)$/i, ".pdf");
            a.click();
            URL.revokeObjectURL(url);
        };

    } catch {
        item.status = "error";
        status.textContent = "Lỗi";
        status.className = "status error";
    }
}
