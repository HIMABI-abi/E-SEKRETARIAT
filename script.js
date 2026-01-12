const reportForm = document.getElementById("prokerForm");
const tableBody = document.getElementById("reportTableBody");
const editorArea = document.getElementById("contentInput");

window.onload = () => {
  document.getElementById("dateDisplay").innerText =
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  renderTable();
};

function format(cmd) {
  document.execCommand(cmd, false, null);
}

reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const imageFile = document.getElementById("imageInput").files[0];
  let imageData = "";
  if (imageFile) {
    imageData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(imageFile);
    });
  }
  const data = {
    id: Date.now().toString(),
    dept: document.getElementById("deptInput").value,
    proker: document.getElementById("prokerInput").value,
    pj: document.getElementById("pjInput").value,
    tanggal: document.getElementById("tglInput").value, // TAMBAHKAN INI
    status: document.getElementById("statusInput").value,
    content: editorArea.innerHTML,
    link: document.getElementById("linkInput").value,
    image: imageData,
  };

  let db = JSON.parse(localStorage.getItem("DB_SECRETARIAT_FINAL")) || [];
  db.push(data);
  localStorage.setItem("DB_SECRETARIAT_FINAL", JSON.stringify(db));

  reportForm.reset();
  editorArea.innerHTML = "";
  renderTable();
});

function renderTable(filter = "Semua") {
  tableBody.innerHTML = "";
  let db = JSON.parse(localStorage.getItem("DB_SECRETARIAT_FINAL")) || [];

  if (filter !== "Semua") db = db.filter((i) => i.dept === filter);

  db.forEach((item) => {
    // Format tanggal agar rapi (dd/mm/yyyy)
    let tglFormatted = "-";
    if (item.tanggal) {
      const [y, m, d] = item.tanggal.split("-");
      tglFormatted = `${d}/${m}/${y}`;
    }
    function updateStats(data) {
      const total = data.length;
      const terlaksana = data.filter(
        (item) => item.status === "Terlaksana"
      ).length;
      const belum = total - terlaksana;

      document.getElementById("totalProker").innerText = total;
      document.getElementById("totalTerlaksana").innerText = terlaksana;
      document.getElementById("totalBelum").innerText = belum;
    }

    // Modifikasi fungsi renderTable kamu
    function renderTable(filter = "Semua") {
      tableBody.innerHTML = "";
      let db = JSON.parse(localStorage.getItem("DB_SECRETARIAT_FINAL")) || [];

      // Update Statistik berdasarkan database asli
      updateStats(db);

      if (filter !== "Semua") db = db.filter((i) => i.dept === filter);

      db.forEach((item) => {
        // ... (kode tr.innerHTML kamu yang sudah rapi tadi) ...
        // Pastikan kode render tetap sama seperti sebelumnya
        const tglArray = item.tanggal ? item.tanggal.split("-") : [];
        const tglFormatted =
          tglArray.length > 1
            ? `${tglArray[2]}/${tglArray[1]}/${tglArray[0]}`
            : "-";
        const sClass =
          item.status === "Terlaksana" ? "terlaksana" : "tidak-terlaksana";

        const tr = document.createElement("tr");
        tr.innerHTML = `
              <td style="text-align: left;"><strong>${item.dept}</strong></td>
              <td style="text-align: left;">${item.proker}</td>
              <td style="text-align: left;">${item.pj || "-"}</td>
              <td style="text-align: center;">${tglFormatted}</td>
              <td style="text-align: center;"><span class="status-badge ${sClass}">${
          item.status
        }</span></td>
              <td style="text-align: center;">
                  <div style="display: flex; gap: 5px; justify-content: center;">
                      <button onclick="openDetail('${
                        item.id
                      }')" class="btn-detail">Detail</button>
                      <button onclick="deleteReport('${
                        item.id
                      }')" class="btn-hapus">Hapus</button>
                  </div>
              </td>
          `;
        tableBody.appendChild(tr);
      });
    }

    // Fungsi Pencarian
    function searchData() {
      const input = document.getElementById("searchInput").value.toLowerCase();
      const rows = document.querySelectorAll("#reportTableBody tr");

      rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        if (text.includes(input)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    }
    const sClass =
      item.status === "Terlaksana" ? "terlaksana" : "tidak-terlaksana";
    const tr = document.createElement("tr");

    // SUSUNAN KOLOM HARUS SAMA DENGAN THEAD
    tr.innerHTML = `
    <td style="text-align: center;"><strong>${item.dept}</strong></td>
    <td style="text-align: center;">${item.proker}</td>
    <td style="text-align: center;">${item.pj || "-"}</td>
    <td style="text-align: center;">${tglFormatted}</td>
    <td style="text-align: center;"><span class="status-badge ${sClass}">${
      item.status
    }</span></td>
    <td style="text-align: center;">
        <div style="display: flex; gap: 5px; justify-content: center;">
            <button onclick="openDetail('${
              item.id
            }')" class="btn-detail">Detail</button>
            <button onclick="deleteReport('${
              item.id
            }')" class="btn-hapus">Hapus</button>
        </div>
    </td>
`;
    tableBody.appendChild(tr);
  });
}

function filterDept(name) {
  document
    .querySelectorAll(".menu-list a")
    .forEach((a) => a.classList.remove("active"));
  event.currentTarget.classList.add("active");

  // 2. MENGUBAH JUDUL HEADER (Tambahkan bagian ini)
  const headerTitle = document.getElementById("headerTitle");
  if (name === "Semua") {
    headerTitle.innerText = "Laporan Proker Keseluruhan";
  } else {
    headerTitle.innerText = "Laporan Proker " + name;
  }

  // 3. Jalankan filter data pada tabel
  renderTable(name);
}

function deleteReport(id) {
  if (confirm("Hapus laporan?")) {
    let db = JSON.parse(localStorage.getItem("DB_SECRETARIAT_FINAL")) || [];
    localStorage.setItem(
      "DB_SECRETARIAT_FINAL",
      JSON.stringify(db.filter((i) => i.id !== id))
    );
    renderTable();
  }
}

function openDetail(id) {
  const item = JSON.parse(localStorage.getItem("DB_SECRETARIAT_FINAL")).find(
    (i) => i.id === id
  );
  document.getElementById("modalTitle").innerText = item.proker;
  document.getElementById("modalTextBody").innerHTML = item.content;
  document.getElementById("modalImageDisplay").innerHTML = item.image
    ? `<img src="${item.image}">`
    : "";

  const linkArea = document.getElementById("modalLinkArea");
  if (item.link) {
    linkArea.style.display = "block";
    document.getElementById("modalExternalLink").href = item.link;
  } else {
    linkArea.style.display = "none";
  }
  document.getElementById("detailModal").style.display = "block";
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}
function searchData() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#reportTableBody tr");

  rows.forEach((row) => {
    // Ambil teks dari kolom Nama Proker (index 1) dan PJ (index 2)
    const proker = row.cells[1] ? row.cells[1].innerText.toLowerCase() : "";
    const pj = row.cells[2] ? row.cells[2].innerText.toLowerCase() : "";

    if (proker.includes(input) || pj.includes(input)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}
