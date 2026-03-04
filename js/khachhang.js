let ds = JSON.parse(localStorage.getItem("khachhang")) || [];
let editingIndex = -1;
let filteredData = [];

// Chờ DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    hienThi();
    
    // Event listeners
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        themKhachHang();
    });
    
    document.getElementById('searchInput').addEventListener('input', filterData);
    document.getElementById('sortBy').addEventListener('change', filterData);
    document.getElementById('filterGioiTinh').addEventListener('change', filterData);
});

function hienThi() {
    filteredData = [...ds];
    filterData();
}

function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    const filterGioiTinh = document.getElementById('filterGioiTinh').value;
    
    // Lọc dữ liệu
    filteredData = ds.filter(kh => {
        const matchSearch = !searchTerm || 
            kh.ten.toLowerCase().includes(searchTerm) ||
            (kh.sdt && kh.sdt.includes(searchTerm)) ||
            (kh.email && kh.email.toLowerCase().includes(searchTerm));
        
        const matchGioiTinh = !filterGioiTinh || kh.gioitinh === filterGioiTinh;
        
        return matchSearch && matchGioiTinh;
    });
    
    // Sắp xếp
    filteredData.sort((a, b) => {
        switch(sortBy) {
            case 'ten':
                return a.ten.localeCompare(b.ten);
            case 'ten-desc':
                return b.ten.localeCompare(a.ten);
            case 'ngaytao':
                return new Date(b.ngaytao || 0) - new Date(a.ngaytao || 0);
            case 'ngaytao-desc':
                return new Date(a.ngaytao || 0) - new Date(b.ngaytao || 0);
            default:
                return 0;
        }
    });
    
    renderTable();
}

function renderTable() {
    let html = "";
    
    if (filteredData.length === 0) {
        html = '<tr><td colspan="9" class="text-center py-4 text-muted">Không tìm thấy khách hàng nào</td></tr>';
    } else {
        filteredData.forEach((kh, i) => {
            const ngaySinh = kh.ngaysinh ? new Date(kh.ngaysinh).toLocaleDateString('vi-VN') : '-';
            const ngayTao = kh.ngaytao ? new Date(kh.ngaytao).toLocaleDateString('vi-VN') : '-';
            html += `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${kh.ten}</strong></td>
                <td>${kh.sdt || '-'}</td>
                <td>${kh.email || '-'}</td>
                <td>${kh.diachi || '-'}</td>
                <td>${ngaySinh}</td>
                <td>${kh.gioitinh || '-'}</td>
                <td>${ngayTao}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="suaKhachHang(${ds.indexOf(kh)})">
                        ✏️ Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="xoa(${ds.indexOf(kh)})">
                        🗑️ Xóa
                    </button>
                </td>
            </tr>`;
        });
    }
    
    document.getElementById("danhsach").innerHTML = html;
    document.getElementById("customerCount").textContent = `Tổng: ${filteredData.length}/${ds.length}`;
}

function themKhachHang() {
    let ten = document.getElementById("ten").value.trim();
    let sdt = document.getElementById("sdt").value.trim();
    let email = document.getElementById("email").value.trim();
    let diachi = document.getElementById("diachi").value.trim();
    let ngaysinh = document.getElementById("ngaysinh").value;
    let gioitinh = document.getElementById("gioitinh").value;

    if (ten === "" || sdt === "") {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
    }

    const khachHang = {
        ten,
        sdt,
        email,
        diachi,
        ngaysinh,
        gioitinh,
        ngaytao: new Date().toISOString()
    };

    if (editingIndex >= 0) {
        // Giữ nguyên ngày tạo khi sửa
        khachHang.ngaytao = ds[editingIndex].ngaytao;
        ds[editingIndex] = khachHang;
        editingIndex = -1;
        document.getElementById('formTitle').textContent = '➕ Thêm Khách Hàng Mới';
        document.getElementById('submitBtn').innerHTML = '<span>💾</span> Thêm Khách Hàng';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        ds.push(khachHang);
    }
    
    localStorage.setItem("khachhang", JSON.stringify(ds));
    resetForm();
    hienThi();
    
    // Trigger event để cập nhật thống kê
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'khachhang' } }));
}

function suaKhachHang(index) {
    const kh = ds[index];
    document.getElementById("ten").value = kh.ten || '';
    document.getElementById("sdt").value = kh.sdt || '';
    document.getElementById("email").value = kh.email || '';
    document.getElementById("diachi").value = kh.diachi || '';
    document.getElementById("ngaysinh").value = kh.ngaysinh || '';
    document.getElementById("gioitinh").value = kh.gioitinh || '';
    editingIndex = index;
    
    document.getElementById('formTitle').textContent = '✏️ Sửa Thông Tin Khách Hàng';
    document.getElementById('submitBtn').innerHTML = '<span>💾</span> Cập Nhật';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll đến form
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById("customerForm").reset();
    editingIndex = -1;
    document.getElementById('formTitle').textContent = '➕ Thêm Khách Hàng Mới';
    document.getElementById('submitBtn').innerHTML = '<span>💾</span> Thêm Khách Hàng';
    document.getElementById('cancelBtn').style.display = 'none';
}

function resetFilter() {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortBy').value = 'ten';
    document.getElementById('filterGioiTinh').value = '';
    filterData();
}

function xoa(index) {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
        ds.splice(index, 1);
        localStorage.setItem("khachhang", JSON.stringify(ds));
        
        if (editingIndex === index) {
            resetForm();
        } else if (editingIndex > index) {
            editingIndex--;
        }
        
        hienThi();
        
        // Trigger event để cập nhật thống kê
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'khachhang' } }));
    }
}
