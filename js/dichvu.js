let dichvu = JSON.parse(localStorage.getItem("dichvu")) || [];
let editingIndex = -1;
let filteredData = [];

// Chờ DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    hienThi();
    
    // Event listeners
    document.getElementById('serviceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        themDV();
    });
    
    document.getElementById('searchInput').addEventListener('input', filterData);
    document.getElementById('sortBy').addEventListener('change', filterData);
    document.getElementById('filterTrangThai').addEventListener('change', filterData);
});

function hienThi() {
    filteredData = [...dichvu];
    filterData();
}

function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    const filterTrangThai = document.getElementById('filterTrangThai').value;
    
    // Lọc dữ liệu
    filteredData = dichvu.filter(dv => {
        const matchSearch = !searchTerm || 
            dv.ten.toLowerCase().includes(searchTerm) ||
            (dv.mota && dv.mota.toLowerCase().includes(searchTerm));
        
        const matchTrangThai = !filterTrangThai || dv.trangthai === filterTrangThai;
        
        return matchSearch && matchTrangThai;
    });
    
    // Sắp xếp
    filteredData.sort((a, b) => {
        switch(sortBy) {
            case 'ten':
                return a.ten.localeCompare(b.ten);
            case 'ten-desc':
                return b.ten.localeCompare(a.ten);
            case 'gia':
                return (a.gia || 0) - (b.gia || 0);
            case 'gia-desc':
                return (b.gia || 0) - (a.gia || 0);
            case 'ngaytao':
                return new Date(b.ngaytao || 0) - new Date(a.ngaytao || 0);
            default:
                return 0;
        }
    });
    
    renderTable();
}

function renderTable() {
    let html = "";
    
    if (filteredData.length === 0) {
        html = '<tr><td colspan="7" class="text-center py-4 text-muted">Không tìm thấy dịch vụ nào</td></tr>';
    } else {
        filteredData.forEach((dv, i) => {
            const ngayTao = dv.ngaytao ? new Date(dv.ngaytao).toLocaleDateString('vi-VN') : '-';
            const statusBadge = dv.trangthai === 'active' 
                ? '<span class="badge bg-success">✅ Đang hoạt động</span>'
                : '<span class="badge bg-secondary">⏸️ Tạm dừng</span>';
            
            html += `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${dv.ten}</strong></td>
                <td>${formatCurrency(dv.gia)}</td>
                <td>${dv.mota || '-'}</td>
                <td>${statusBadge}</td>
                <td>${ngayTao}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="suaDV(${dichvu.indexOf(dv)})">
                        ✏️ Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="xoa(${dichvu.indexOf(dv)})">
                        🗑️ Xóa
                    </button>
                </td>
            </tr>`;
        });
    }
    
    document.getElementById("list").innerHTML = html;
    document.getElementById("serviceCount").textContent = `Tổng: ${filteredData.length}/${dichvu.length}`;
}

function themDV() {
    let ten = document.getElementById("tendv").value.trim();
    let gia = document.getElementById("gia").value.trim();
    let mota = document.getElementById("mota").value.trim();
    let trangthai = document.getElementById("trangthai").value;

    if (ten === "" || gia === "") {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
    }

    const giaNumber = parseFloat(gia);
    if (isNaN(giaNumber) || giaNumber <= 0) {
        alert("Giá phải là số dương!");
        return;
    }

    const service = {
        ten,
        gia: giaNumber,
        mota,
        trangthai,
        ngaytao: new Date().toISOString()
    };

    if (editingIndex >= 0) {
        // Giữ nguyên ngày tạo khi sửa
        service.ngaytao = dichvu[editingIndex].ngaytao;
        dichvu[editingIndex] = service;
        editingIndex = -1;
        document.getElementById('formTitle').textContent = '➕ Thêm Dịch Vụ Mới';
        document.getElementById('submitBtn').innerHTML = '<span>💾</span> Thêm Dịch Vụ';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        dichvu.push(service);
    }
    
    localStorage.setItem("dichvu", JSON.stringify(dichvu));
    resetForm();
    hienThi();
    
    // Trigger event để cập nhật thống kê
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'dichvu' } }));
}

function suaDV(index) {
    const dv = dichvu[index];
    document.getElementById("tendv").value = dv.ten || '';
    document.getElementById("gia").value = dv.gia || '';
    document.getElementById("mota").value = dv.mota || '';
    document.getElementById("trangthai").value = dv.trangthai || 'active';
    editingIndex = index;
    
    document.getElementById('formTitle').textContent = '✏️ Sửa Thông Tin Dịch Vụ';
    document.getElementById('submitBtn').innerHTML = '<span>💾</span> Cập Nhật';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll đến form
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById("serviceForm").reset();
    document.getElementById("trangthai").value = 'active';
    editingIndex = -1;
    document.getElementById('formTitle').textContent = '➕ Thêm Dịch Vụ Mới';
    document.getElementById('submitBtn').innerHTML = '<span>💾</span> Thêm Dịch Vụ';
    document.getElementById('cancelBtn').style.display = 'none';
}

function resetFilter() {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortBy').value = 'ten';
    document.getElementById('filterTrangThai').value = '';
    filterData();
}

function xoa(i) {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
        dichvu.splice(i, 1);
        localStorage.setItem("dichvu", JSON.stringify(dichvu));
        
        if (editingIndex === i) {
            resetForm();
        } else if (editingIndex > i) {
            editingIndex--;
        }
        
        hienThi();
        
        // Trigger event để cập nhật thống kê
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'dichvu' } }));
    }
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
}
